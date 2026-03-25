import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AUTH_EVENT_NAME,
  AuthUser,
  getAuthUser,
  hasAdminAccess,
  isSuperAdmin,
  logoutAuth,
} from "../auth";
import AdminNavigation from "./AdminNavigation";
import { supabase } from "../supabaseClient";

const EASE = [0.16, 1, 0.3, 1] as const;
const NOTIFICATIONS_SEEN_KEY = "lifewood_admin_notifications_seen_at";

type ManagedRole = "USER" | "ADMIN" | "SUPER ADMIN";
type ManagedStatus = "Active" | "Pending" | "Suspended";

type UserRow = {
  id: string;
  display_id?: string | null;
  email: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  status?: string | null;
  last_seen?: string | null;
  created_at?: string | null;
};

type DashboardUser = {
  id: string;
  displayId: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: ManagedRole;
  status: ManagedStatus;
  lastSeen: string | null;
  createdAt: string | null;
};

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "User Management", path: "/admin/users" },
  { label: "Applicants", path: "/admin/applicants" },
  { label: "Analytics", path: "/admin/analytics" },
  { label: "Contacts", path: "/admin/contacts" },
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function normalizeRole(role?: string | null): ManagedRole {
  const value = (role || "").trim().toLowerCase();
  if (value.includes("super") && value.includes("admin")) return "SUPER ADMIN";
  if (value === "admin") return "ADMIN";
  return "USER";
}

function normalizeStatus(status?: string | null): ManagedStatus {
  const value = (status || "").trim().toLowerCase();
  if (value === "pending") return "Pending";
  if (value === "suspended") return "Suspended";
  return "Active";
}

function formatRelativeTime(isoValue?: string | null) {
  if (!isoValue) return "Unknown";
  const parsed = new Date(isoValue);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  const diffMs = Date.now() - parsed.getTime();
  const seconds = Math.max(0, Math.floor(diffMs / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDate(isoValue?: string | null) {
  if (!isoValue) return "Unknown";
  const parsed = new Date(isoValue);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isMissingUsersTableError(message: string) {
  const text = message.toLowerCase();
  return (
    (text.includes("users") && text.includes("does not exist")) ||
    (text.includes("public.users") && text.includes("not found")) ||
    (text.includes("could not find") && text.includes("users"))
  );
}

function isMissingColumnError(message: string) {
  const text = message.toLowerCase();
  return text.includes("column") && text.includes("does not exist");
}

function toDashboardUser(row: UserRow): DashboardUser | null {
  const email = (row.email || "").trim().toLowerCase();
  if (!email) return null;
  const displayName = row.full_name?.trim() || email.split("@")[0] || "User";
  return {
    id: row.id,
    displayId: row.display_id?.trim() || "",
    name: displayName,
    email,
    avatarUrl: row.avatar_url?.trim() || "",
    role: email === "admin@gmail.com" ? "SUPER ADMIN" : normalizeRole(row.role),
    status: normalizeStatus(row.status),
    lastSeen: row.last_seen || null,
    createdAt: row.created_at || null,
  };
}

function buildSeries<T>(
  data: T[],
  days: number,
  getDate: (item: T) => string | null
) {
  const labels: { key: string; label: string }[] = [];
  const dayIndex = new Map<string, number>();
  const now = new Date();
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - offset);
    d.setHours(0, 0, 0, 0);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    labels.push({
      key,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
    });
    dayIndex.set(key, labels.length - 1);
  }
  const values = new Array(labels.length).fill(0);
  data.forEach((item) => {
    const value = getDate(item);
    if (!value) return;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return;
    const key = `${parsed.getFullYear()}-${parsed.getMonth() + 1}-${parsed.getDate()}`;
    const idx = dayIndex.get(key);
    if (idx === undefined) return;
    values[idx] += 1;
  });
  return labels.map((entry, idx) => ({
    label: entry.label,
    value: values[idx],
  }));
}

function SvgLineChart({
  title,
  subtitle,
  series,
  color,
}: {
  title: string;
  subtitle: string;
  series: { label: string; value: number }[];
  color: string;
}) {
  const reduceMotion = useReducedMotion();
  const maxValue = Math.max(...series.map((d) => d.value), 1);
  const width = 400;
  const height = 100;
  const padX = 16;
  const padY = 12;
  const pathD = series
    .map((pt, i) => {
      const x = padX + (i * (width - 2 * padX)) / Math.max(series.length - 1, 1);
      const y = height - padY - (pt.value / maxValue) * (height - 2 * padY);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  const fillD = `${pathD} L ${width - padX} ${height - padY} L ${padX} ${height - padY} Z`;
  const gradId = `dash-grad-${title.replace(/\s+/g, "")}`;
  const total = series.reduce((s, d) => s + d.value, 0);
  return (
    <div className="group rounded-2xl border border-[#e0e9e4] bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#6a7c73]">{title}</p>
          <p className="text-[11px] text-[#1a3326]/55 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[22px] font-black text-[#10261d]">{total}</span>
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#046241] bg-[#e6f7ef] px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#046241] animate-pulse" />
            Live
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[90px] overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={padX} y1={padY} x2={width - padX} y2={padY} stroke="#f0f4f1" strokeWidth="1" />
        <line x1={padX} y1={height / 2} x2={width - padX} y2={height / 2} stroke="#f0f4f1" strokeWidth="1" />
        <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="#e0e9e4" strokeWidth="1" />
        <motion.path d={fillD} fill={`url(#${gradId})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: EASE }} />
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
        />
        {series.map((pt, i) => {
          const x = padX + (i * (width - 2 * padX)) / Math.max(series.length - 1, 1);
          const y = height - padY - (pt.value / maxValue) * (height - 2 * padY);
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r="3.5"
              fill="#fff"
              stroke={color}
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, delay: i * 0.08, ease: "backOut" }}
            >
              <title>{pt.label}: {pt.value}</title>
            </motion.circle>
          );
        })}
      </svg>
      <div className="flex justify-between mt-1 px-0.5">
        {series.map((pt, i) => (
          <span key={i} className="text-[9px] font-semibold text-[#1a3326]/40">{pt.label}</span>
        ))}
      </div>
    </div>
  );
}

function PremiumStatCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  iconBg,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  iconBg?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e0e9e4] bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col relative overflow-hidden group">
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-gradient-to-br from-[#046241]/[0.04] to-transparent pointer-events-none group-hover:scale-110 transition-transform duration-500" />
      <div className="flex justify-between items-start mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: iconBg || "#e6f7ef" }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
              trend === "up"
                ? "bg-[#e6f7ef] text-[#046241]"
                : trend === "down"
                ? "bg-[#ffe9e9] text-[#9f2424]"
                : "bg-[#f0f4f1] text-[#6a7c73]"
            }`}
          >
            {trend === "up" ? "▲" : trend === "down" ? "▼" : "●"} {trendValue}
          </span>
        )}
      </div>
      <p className="text-[11px] font-bold tracking-wide uppercase text-[#6a7c73] mb-1">{title}</p>
      <p className="text-[36px] leading-none font-black text-[#12261d] tracking-tight">
        {value}
      </p>
      {subtitle && (
        <p className="mt-auto pt-3 text-[11px] font-semibold text-[#1a3326]/50 border-t border-[#f0f4f1]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function CountUpNumber({
  value,
  duration = 800,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);
  const displayRef = useRef(0);

  useEffect(() => {
    displayRef.current = displayValue;
  }, [displayValue]);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value);
      return;
    }
    const from = displayRef.current;
    const delta = value - from;
    if (delta === 0) return;
    let rafId = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(from + delta * eased));
      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [value, duration, reduceMotion]);

  return <span className={className}>{displayValue.toLocaleString()}</span>;
}

function navigate(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(() => getAuthUser());
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname.replace(/\/+$/, ""));
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const [notificationsSeenAt, setNotificationsSeenAt] = useState<Date | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(NOTIFICATIONS_SEEN_KEY);
    if (!raw) return null;
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  });

  useEffect(() => {
    const sync = () => setUser(getAuthUser());
    const onPop = () => setCurrentPath(window.location.pathname.replace(/\/+$/, ""));
    window.addEventListener(AUTH_EVENT_NAME, sync as EventListener);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, sync as EventListener);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  useEffect(() => {
    if (!isNotificationsOpen) return;
    const handleOutside = (event: MouseEvent) => {
      if (!notificationsRef.current) return;
      if (!notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isNotificationsOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!notificationsSeenAt) return;
    window.localStorage.setItem(NOTIFICATIONS_SEEN_KEY, notificationsSeenAt.toISOString());
  }, [notificationsSeenAt]);

  const canManage = hasAdminAccess(user);
  const rootAdmin = isSuperAdmin(user);
  const activePath = currentPath === "/admin" ? "/admin/dashboard" : currentPath;
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
    []
  );

  const fetchUsers = async (silent = false) => {
    if (!canManage) return;
    if (silent) {
      setIsRefreshing(true);
    } else {
      setLoadingUsers(true);
    }
    setLoadError("");

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) {
        setUsers([]);
        setLoadError("No active Supabase session. Please log in again.");
        return;
      }

      const { error: syncError } = await supabase.rpc("sync_all_auth_users_to_public_users");
      if (syncError) {
        console.warn("User sync RPC warning:", syncError.message);
      }

      let { data, error } = await supabase
        .from("users")
        .select(
          "id, display_id, email, full_name, first_name, last_name, avatar_url, role, status, last_seen, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(120);
      let resolvedData = data as UserRow[] | null;

      if (error && isMissingColumnError(error.message || "")) {
        const legacyResult = await supabase
          .from("users")
          .select("id, email, full_name, role, status, last_seen, created_at")
          .order("created_at", { ascending: false })
          .limit(120);
        resolvedData = legacyResult.data as UserRow[] | null;
        error = legacyResult.error;
      }

      if (error) throw error;

      const mapped = ((resolvedData || []) as UserRow[])
        .map(toDashboardUser)
        .filter((entry): entry is DashboardUser => Boolean(entry));

      setUsers(mapped);
      const { data: applicantsData, error: applicantsError } = await supabase
        .from("applicants")
        .select("id, first_name, last_name, position, status, created_at")
        .order("created_at", { ascending: false });

      if (applicantsError) {
        console.warn("Could not load applicants for dashboard stats", applicantsError);
      } else {
        setApplicants(applicantsData || []);
      }

      const { data: contactsData, error: contactsError } = await supabase
        .from("contacts")
        .select("id, name, email, message, status, created_at")
        .order("created_at", { ascending: false });

      if (contactsError) {
        console.warn("Could not load contacts for dashboard stats", contactsError);
      } else {
        setContacts(contactsData || []);
      }

      setLastSyncAt(new Date());
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: unknown }).message || "")
          : "Failed to load dashboard data.";
      setLoadError(
        isMissingUsersTableError(message)
          ? "Could not read the `users` table. Create it first, then reload."
          : isMissingColumnError(message)
            ? "Your `users` table is missing newer columns. Run `supabase/users_setup.sql`, then reload."
            : message
      );
      setUsers([]);
      setApplicants([]);
      setContacts([]);
    } finally {
      setLoadingUsers(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!canManage) return;
    void fetchUsers();
    const interval = window.setInterval(() => {
      void fetchUsers(true);
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [canManage]);

  const totalUsers = users.length;
  const adminUsers = users.filter((entry) => entry.role === "ADMIN" || entry.role === "SUPER ADMIN").length;
  const pendingUsers = users.filter((entry) => entry.status === "Pending").length;
  const activeToday = users.filter((entry) => {
    const seenAt = entry.lastSeen ? new Date(entry.lastSeen) : null;
    if (!seenAt || Number.isNaN(seenAt.getTime())) return false;
    return Date.now() - seenAt.getTime() < 24 * 60 * 60 * 1000;
  }).length;
  const newUsers7d = users.filter((entry) => {
    const createdAt = entry.createdAt ? new Date(entry.createdAt) : null;
    if (!createdAt || Number.isNaN(createdAt.getTime())) return false;
    return Date.now() - createdAt.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const totalApplicants = applicants.length;
  const newApplicants7d = applicants.filter((entry) => {
    const createdAt = entry.created_at ? new Date(entry.created_at) : null;
    if (!createdAt || Number.isNaN(createdAt.getTime())) return false;
    return Date.now() - createdAt.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;
  const acceptedApplicants = applicants.filter((entry) => entry.status === "Accepted").length;

  const sortedApplicants = useMemo(() => {
    return [...applicants].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  }, [applicants]);
  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  }, [contacts]);
  const notificationItems = useMemo(() => {
    const items = [
      ...sortedApplicants.map((entry: any) => {
        const name = [entry.first_name, entry.last_name].filter(Boolean).join(" ").trim();
        const title = name ? `New applicant: ${name}` : "New applicant";
        const createdAt = entry.created_at ? new Date(entry.created_at).getTime() : 0;
        const isUnread = !notificationsSeenAt || createdAt > notificationsSeenAt.getTime();
        return {
          id: `applicant-${entry.id}`,
          title,
          body: entry.position ? entry.position : "Join Us submission",
          meta: entry.created_at ? formatRelativeTime(entry.created_at) : "Unknown",
          action: "Review applicant",
          path: `/admin/applicants?applicantId=${entry.id}`,
          unread: isUnread,
          createdAt,
        };
      }),
      ...sortedContacts.map((entry: any) => {
        const title = entry.name ? `New contact: ${entry.name}` : "New contact";
        const createdAt = entry.created_at ? new Date(entry.created_at).getTime() : 0;
        const isUnread = !notificationsSeenAt || createdAt > notificationsSeenAt.getTime();
        return {
          id: `contact-${entry.id}`,
          title,
          body: entry.message ? entry.message : "Contact Us submission",
          meta: entry.created_at ? formatRelativeTime(entry.created_at) : "Unknown",
          action: "View contact",
          path: `/admin/contacts`,
          unread: isUnread,
          createdAt,
        };
      }),
    ];
    return items
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 8);
  }, [sortedApplicants, sortedContacts, notificationsSeenAt]);
  const notificationCount = useMemo(() => {
    if (!notificationsSeenAt) return notificationItems.length;
    const seenAt = notificationsSeenAt.getTime();
    return notificationItems.filter((entry) => entry.createdAt > seenAt).length;
  }, [notificationsSeenAt, notificationItems]);

  const newApplicantsSeries = useMemo(
    () => buildSeries(applicants, 7, (entry) => entry.created_at),
    [applicants]
  );
  const processedApplicantsSeries = useMemo(
    () => buildSeries(applicants.filter(a => a.status && a.status !== "New"), 7, (entry) => entry.created_at),
    [applicants]
  );

  const roleBreakdown = useMemo(() => {
    const counts: Record<ManagedRole, number> = {
      USER: 0,
      ADMIN: 0,
      "SUPER ADMIN": 0,
    };
    users.forEach((entry) => {
      counts[entry.role] = (counts[entry.role] || 0) + 1;
    });
    return counts;
  }, [users]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<ManagedStatus, number> = {
      Active: 0,
      Pending: 0,
      Suspended: 0,
    };
    users.forEach((entry) => {
      counts[entry.status] = (counts[entry.status] || 0) + 1;
    });
    return counts;
  }, [users]);

  const latestUsers = users.slice(0, 6);
  const recentlyActive = [...users]
    .filter((entry) => entry.lastSeen)
    .sort((a, b) => (b.lastSeen || "").localeCompare(a.lastSeen || ""))
    .slice(0, 5);

  if (!canManage) {
    return (
      <main className="min-h-screen bg-brand-paper px-6 py-20 text-[#0f1215]">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-2">
              Access Denied
            </p>
            <h1 className="text-3xl font-black mb-3">Admin access required</h1>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="h-11 px-5 rounded-xl bg-[#046241] text-white text-[11px] font-black uppercase tracking-[0.14em]"
            >
              Back to Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleLogout = async () => {
    await logoutAuth();
    navigate("/login");
  };

  return (
    <main
      className="min-h-screen bg-[#f5f8f6] overflow-x-hidden lg:h-screen lg:overflow-hidden text-[#12261d]"
      style={{ fontFamily: "Poppins, Sora, 'Segoe UI', sans-serif" }}
    >
      <section className="min-h-screen lg:h-screen grid grid-cols-1 lg:grid-cols-[238px_minmax(0,1fr)]">
        <AdminNavigation user={user} activePath={activePath} isRootAdmin={rootAdmin} />

        <motion.section
          key="admin-dashboard-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="relative bg-[#f5f8f6] p-5 pt-24 md:p-8 md:pt-28 lg:h-screen lg:overflow-y-auto lg:pt-8"
        >
          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#046241] mb-1">Admin Dashboard</p>
              <h1 className="text-[32px] md:text-[40px] leading-[1] font-black tracking-[-0.03em] text-[#10261d]">
                Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""} 👋
              </h1>
              <p className="mt-1.5 text-[12px] text-[#1a3326]/55 font-medium">
                {todayLabel}{lastSyncAt ? ` · Last synced ${formatRelativeTime(lastSyncAt.toISOString())}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <motion.button
                  type="button"
                  onClick={() =>
                    setIsNotificationsOpen((prev) => {
                      const next = !prev;
                      if (next) setNotificationsSeenAt(new Date());
                      return next;
                    })
                  }
                  animate={
                    notificationCount > 0 && !reduceMotion
                      ? { rotate: [0, -10, 10, -6, 6, 0] }
                      : { rotate: 0 }
                  }
                  transition={
                    notificationCount > 0 && !reduceMotion
                      ? { duration: 1.2, repeat: Infinity, repeatDelay: 2.2 }
                      : { duration: 0.2 }
                  }
                  className="h-10 w-10 rounded-full border border-[#d7e4dd] bg-white text-[#25473a] flex items-center justify-center relative shadow-sm hover:shadow-md transition-shadow"
                  aria-label="Notifications"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
                  </svg>
                  {notificationCount > 0 && (
                    <>
                      <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FFB347] px-1 text-[9px] font-black text-[#1a2b22]">
                        {notificationCount > 99 ? "99+" : notificationCount}
                      </span>
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#FFB347]/60 animate-ping" />
                    </>
                  )}
                </motion.button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: EASE }}
                      className="absolute right-0 mt-3 w-[320px] rounded-2xl border border-[#e0e9e4] bg-white shadow-[0_18px_50px_rgba(10,40,26,0.14)] overflow-hidden z-20"
                    >
                      <div className="px-4 py-3 border-b border-[#ecf2ee] flex items-center justify-between">
                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#6a7c73]">Notifications</p>
                        <span className="text-[10px] font-semibold text-[#1a3326]/60">
                          {notificationCount > 0 ? `${notificationCount} new` : "All caught up"}
                        </span>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto divide-y divide-[#f0f4f1]">
                        {notificationItems.length === 0 ? (
                          <div className="px-4 py-6 text-[12px] text-[#1a3326]/60">No notifications right now.</div>
                        ) : (
                          notificationItems.map((item) => (
                            <div key={item.id} className="px-4 py-3 hover:bg-[#fafcfb] transition-colors">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-[12px] font-bold text-[#10261d]">{item.title}</p>
                                {item.unread && <span className="mt-0.5 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-[#FFB347]" />}
                              </div>
                              <p className="text-[11px] text-[#1a3326]/60 mt-0.5">{item.body}</p>
                              <p className="text-[10px] text-[#1a3326]/40 mt-0.5">{item.meta}</p>
                              <button
                                type="button"
                                onClick={() => { setIsNotificationsOpen(false); navigate(item.path); }}
                                className="mt-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#046241] hover:underline"
                              >
                                {item.action} →
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Refresh */}
              <button
                type="button"
                onClick={() => void fetchUsers()}
                disabled={loadingUsers || isRefreshing}
                className="h-10 w-10 flex items-center justify-center rounded-full border border-[#d7e4dd] bg-white shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 group"
                title="Refresh Dashboard"
              >
                <svg
                  className={`w-4 h-4 text-[#046241] group-hover:scale-110 transition-transform ${loadingUsers || isRefreshing ? "animate-spin" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {loadError && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#ffb5b5] bg-[#fff0f0] px-4 py-3 text-[12px] font-semibold text-[#8a2626] shadow-sm">
              <svg className="h-4 w-4 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {loadError}
            </div>
          )}

          {/* ── KPI Stat Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <PremiumStatCard
              title="Total Accounts"
              value={loadingUsers ? "—" : totalUsers}
              subtitle={`${newUsers7d} joined this week`}
              trend="up"
              trendValue="Active"
              iconBg="#e6f7ef"
              icon={
                <svg className="w-5 h-5 text-[#046241]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
            <PremiumStatCard
              title="Total Applicants"
              value={loadingUsers ? "—" : totalApplicants}
              subtitle={`${newApplicants7d} new · ${acceptedApplicants} hired`}
              trend="up"
              trendValue="Pipeline"
              iconBg="#fff4e5"
              icon={
                <svg className="w-5 h-5 text-[#915700]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
            <PremiumStatCard
              title="Active Today"
              value={loadingUsers ? "—" : activeToday}
              subtitle="Users active in the last 24 h"
              trend="neutral"
              trendValue="Live"
              iconBg="#eaf4ff"
              icon={
                <svg className="w-5 h-5 text-[#0051a8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            <PremiumStatCard
              title="Pending Setup"
              value={loadingUsers ? "—" : pendingUsers}
              subtitle="Users awaiting verification"
              trend={pendingUsers > 0 ? "down" : "neutral"}
              trendValue={pendingUsers > 0 ? "Action needed" : "Clear"}
              iconBg={pendingUsers > 0 ? "#ffe9e9" : "#f0f4f1"}
              icon={
                <svg
                  className={`w-5 h-5 ${pendingUsers > 0 ? "text-[#9f2424]" : "text-[#6a7c73]"}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* ── Charts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <SvgLineChart
              title="New Applicants"
              subtitle="Applications submitted in the last 7 days"
              series={newApplicantsSeries}
              color="#046241"
            />
            <SvgLineChart
              title="Processed Applicants"
              subtitle="Reviewed or interviewed recently"
              series={processedApplicantsSeries}
              color="#FFB347"
            />
          </div>

          {/* ── Bottom Grid: Users List + Analytics Panel ── */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4">

            {/* New Users */}
            <section className="rounded-2xl border border-[#e0e9e4] bg-white overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-[#ecf2ee] flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-black text-[#10261d]">New Users</h2>
                  <p className="text-[11px] text-[#1a3326]/50 mt-0.5">{latestUsers.length} most recent registrations</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/admin/users")}
                  className="h-8 px-3 rounded-lg border border-[#046241]/20 text-[10px] font-black uppercase tracking-[0.1em] text-[#046241] hover:bg-[#046241]/5 transition-colors"
                >
                  View all
                </button>
              </div>
              <div className="divide-y divide-[#f4f8f6]">
                {loadingUsers ? (
                  <div className="px-5 py-6 text-[13px] text-[#1a3326]/50">Loading users…</div>
                ) : latestUsers.length === 0 ? (
                  <div className="px-5 py-6 text-[13px] text-[#1a3326]/50">No users found.</div>
                ) : (
                  latestUsers.map((entry) => {
                    const rolePillClass =
                      entry.role === "SUPER ADMIN"
                        ? "bg-[#f4eaf9] text-[#712b91]"
                        : entry.role === "ADMIN"
                        ? "bg-[#eaf4ff] text-[#0051a8]"
                        : "bg-[#f0f4f1] text-[#3a5549]";
                    return (
                      <div key={entry.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-[#fafcfb] transition-colors">
                        <div className="w-10 h-10 rounded-full flex-shrink-0 border border-[#d8e5de] bg-[#e6f4ea] overflow-hidden flex items-center justify-center text-[12px] font-black text-[#046241]">
                          {entry.avatarUrl ? (
                            <img src={entry.avatarUrl} alt={entry.name} className="w-full h-full object-cover" />
                          ) : (
                            initials(entry.name) || "U"
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-bold truncate text-[#0f2318]">{entry.name}</p>
                            <span className={`inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] ${rolePillClass}`}>
                              {entry.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#1a3326]/50 truncate">{entry.email}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] font-black text-[#1a3326]/40 uppercase tracking-wide">{entry.displayId || "—"}</p>
                          <p className="text-[11px] text-[#1a3326]/50">{formatDate(entry.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Analytics Sidebar */}
            <section className="rounded-2xl border border-[#e0e9e4] bg-white overflow-hidden shadow-sm flex flex-col">
              <div className="px-5 py-4 border-b border-[#ecf2ee]">
                <h2 className="text-[18px] font-black text-[#10261d]">System Snapshot</h2>
                <p className="text-[11px] text-[#1a3326]/50 mt-0.5">{todayLabel}</p>
              </div>
              <div className="p-4 space-y-4 flex-1">

                {/* Role mix with progress bars */}
                <div className="rounded-xl border border-[#e8efeb] bg-[#fbfdfc] p-3.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#1a3326]/55 mb-3">Role Distribution</p>
                  {(["USER", "ADMIN", "SUPER ADMIN"] as const).map((role, i) => {
                    const count = roleBreakdown[role];
                    const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
                    const colors = ["#046241", "#0051a8", "#712b91"];
                    return (
                      <div key={role} className="mb-2 last:mb-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-[11px] font-semibold text-[#1a3326]">{role === "SUPER ADMIN" ? "Super Admin" : role === "ADMIN" ? "Admin" : "User"}</span>
                          <span className="text-[11px] font-black text-[#10261d]">{count}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#e8efeb] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: colors[i] }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1, ease: EASE }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Account status */}
                <div className="rounded-xl border border-[#e8efeb] bg-[#fbfdfc] p-3.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#1a3326]/55 mb-3">Account Status</p>
                  <div className="space-y-2">
                    {([
                      { label: "Active", key: "Active" as const, color: "#046241", bg: "#e6f7ef", text: "#046241" },
                      { label: "Pending", key: "Pending" as const, color: "#FFB347", bg: "#fff4e5", text: "#915700" },
                      { label: "Suspended", key: "Suspended" as const, color: "#e85c5c", bg: "#ffe9e9", text: "#9f2424" },
                    ]).map(({ label, key, color, bg, text }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                          <span className="text-[12px] font-semibold text-[#1a3326]">{label}</span>
                        </div>
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black"
                          style={{ background: bg, color: text }}
                        >
                          {statusBreakdown[key]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recently active */}
                <div className="rounded-xl border border-[#e8efeb] bg-[#fbfdfc] p-3.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#1a3326]/55 mb-3">Recently Active</p>
                  {recentlyActive.length === 0 ? (
                    <p className="text-[12px] text-[#1a3326]/50">No recent activity.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {recentlyActive.map((entry) => (
                        <div key={entry.id} className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#e6f4ea] border border-[#d8e5de] flex items-center justify-center text-[10px] font-black text-[#046241] flex-shrink-0">
                            {initials(entry.name) || "U"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-semibold text-[#10261d] truncate">{entry.name}</p>
                          </div>
                          <span className="text-[10px] text-[#1a3326]/45 flex-shrink-0">{formatRelativeTime(entry.lastSeen)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </section>

          </div>
        </motion.section>
      </section>
    </main>
  );
}
