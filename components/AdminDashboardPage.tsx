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

function buildSeries(
  users: DashboardUser[],
  days: number,
  getDate: (user: DashboardUser) => string | null
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
  users.forEach((user) => {
    const value = getDate(user);
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

function BarChart({
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
  const maxValue = Math.max(...series.map((point) => point.value), 1);
  return (
    <div className="rounded-2xl border border-[#e0e9e4] bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#6a7c73]">
            {title}
          </p>
          <p className="text-[11px] text-[#1a3326]/55">{subtitle}</p>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#046241]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#046241] animate-pulse" />
          Live
        </span>
      </div>
      <div className="flex items-end gap-2 h-20">
        {series.map((point, index) => {
          const height = Math.max(6, (point.value / maxValue) * 64);
          return (
          <div key={point.label} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              className="w-full rounded-lg"
              initial={reduceMotion ? { height, opacity: 1 } : { height: 0, opacity: 0.6 }}
              animate={{ height, opacity: 1 }}
              transition={{ duration: 0.6, ease: EASE, delay: reduceMotion ? 0 : index * 0.06 }}
              style={{ height, background: color }}
            />
            <span className="text-[9px] text-[#1a3326]/45">{point.label}</span>
          </div>
        )})}
      </div>
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
  const notificationCount = useMemo(() => {
    if (!notificationsSeenAt) return sortedApplicants.length;
    const seenAt = notificationsSeenAt.getTime();
    return sortedApplicants.filter((entry) => {
      const createdAt = entry.created_at ? new Date(entry.created_at).getTime() : 0;
      return createdAt > seenAt;
    }).length;
  }, [notificationsSeenAt, sortedApplicants]);
  const notificationItems = useMemo(() => {
    return sortedApplicants.slice(0, 6).map((entry: any) => {
      const name = [entry.first_name, entry.last_name].filter(Boolean).join(" ").trim();
      const title = name ? `New applicant: ${name}` : "New applicant";
      const createdAt = entry.created_at ? new Date(entry.created_at).getTime() : 0;
      const isUnread = !notificationsSeenAt || createdAt > notificationsSeenAt.getTime();
      return {
        id: entry.id,
        title,
        body: entry.position ? entry.position : "Join Us submission",
        meta: entry.created_at ? formatRelativeTime(entry.created_at) : "Unknown",
        action: "Review applicant",
        path: `/admin/applicants?applicantId=${entry.id}`,
        unread: isUnread,
      };
    });
  }, [sortedApplicants, notificationsSeenAt]);

  const signupSeries = useMemo(
    () => buildSeries(users, 7, (entry) => entry.createdAt),
    [users]
  );
  const activeSeries = useMemo(
    () => buildSeries(users, 7, (entry) => entry.lastSeen || entry.createdAt),
    [users]
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
      className="min-h-screen bg-brand-paper dark:bg-brand-dark overflow-x-hidden lg:h-screen lg:overflow-hidden text-[#12261d]"
      style={{ fontFamily: "Poppins, Sora, 'Segoe UI', sans-serif" }}
    >
      <section className="min-h-screen lg:h-screen grid grid-cols-1 lg:grid-cols-[238px_minmax(0,1fr)]">
          <aside className="bg-[linear-gradient(180deg,#07261c_0%,#051d15_100%)] text-white p-5 lg:h-screen overflow-y-auto">
            <div className="mb-7">
              <img
                src="https://framerusercontent.com/images/Ca8ppNsvJIfTsWEuHr50gvkDow.png?scale-down-to=512&width=2624&height=474"
                alt="Lifewood"
                className="h-8 w-auto object-contain"
              />
            </div>

            <div className="space-y-1.5 mb-6">
              {ADMIN_NAV_ITEMS.map((item) => {
                const isActive = activePath === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`w-full text-left h-10 rounded-xl px-3 text-[12px] font-semibold transition-colors ${
                      isActive
                        ? "bg-[#0f3a2b] text-white"
                        : "text-white/72 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-7 rounded-2xl border border-white/14 bg-white/8 p-3.5">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50 mb-1.5">
                Signed in
              </p>
              <p className="text-[13px] font-bold truncate">{user?.name || "Admin"}</p>
              <p className="text-[11px] text-white/70 truncate">{user?.email}</p>
              {rootAdmin && (
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#c1ff00]">
                  Super admin
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 w-full h-10 rounded-xl border border-[#FFB347]/40 text-[#FFB347]
                         text-[11px] font-black uppercase tracking-[0.12em]
                         hover:bg-[#FFB347]/10 transition-colors"
            >
              Log out
            </button>
        </aside>

        <motion.section
          key="admin-dashboard-content"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="p-5 md:p-7 bg-[#f7faf8] lg:h-screen overflow-y-auto"
        >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h1 className="text-[44px] leading-[0.92] font-black tracking-[-0.03em] text-[#10261d]">
                  Admin Dashboard
                </h1>
                <p className="text-[12px] text-[#1a3326]/55 mt-1">
                  Live user insights · Auto-refreshing every 30s
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative" ref={notificationsRef}>
                  <motion.button
                    type="button"
                    onClick={() =>
                      setIsNotificationsOpen((prev) => {
                        const next = !prev;
                        if (next) {
                          setNotificationsSeenAt(new Date());
                        }
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
                    className="h-9 w-9 rounded-full border border-[#d7e4dd] bg-white text-[#25473a] flex items-center justify-center relative"
                    aria-label="Notifications"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
                      />
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
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: EASE }}
                        className="absolute right-0 mt-3 w-[320px] rounded-2xl border border-[#e0e9e4] bg-white shadow-[0_18px_50px_rgba(10,40,26,0.12)] overflow-hidden z-20"
                      >
                        <div className="px-4 py-3 border-b border-[#ecf2ee] flex items-center justify-between">
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#6a7c73]">
                            Notifications
                          </p>
                          <span className="text-[10px] font-semibold text-[#1a3326]/60">
                            {notificationCount > 0 ? `${notificationCount} new` : "All caught up"}
                          </span>
                        </div>
                        <div className="max-h-[280px] overflow-y-auto">
                          {notificationItems.length === 0 ? (
                            <div className="px-4 py-6 text-[12px] text-[#1a3326]/60">
                              No new notifications right now.
                            </div>
                          ) : (
                            notificationItems.map((item) => (
                              <div
                                key={item.id}
                                className="px-4 py-3 border-b border-[#f0f4f1] last:border-b-0"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-[12px] font-bold text-[#10261d]">
                                    {item.title}
                                  </p>
                                  {item.unread && (
                                    <span className="mt-0.5 inline-flex h-2 w-2 rounded-full bg-[#FFB347]" />
                                  )}
                                </div>
                                <p className="text-[11px] text-[#1a3326]/60 mt-1">
                                  {item.body}
                                </p>
                                <p className="text-[10px] text-[#1a3326]/45 mt-1">
                                  {item.meta}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsNotificationsOpen(false);
                                    navigate(item.path);
                                  }}
                                  className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#046241]"
                                >
                                  {item.action}
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  type="button"
                  onClick={() => void fetchUsers()}
                  className="h-9 px-4 rounded-full border border-[#d7e4dd] bg-white text-[10px] font-black uppercase tracking-[0.12em] text-[#25473a]"
                >
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </button>
                <div className="h-9 px-4 rounded-full border border-[#d7e4dd] bg-white text-[10px] font-black uppercase tracking-[0.12em] text-[#25473a] flex items-center">
                  {lastSyncAt ? `Last sync ${formatRelativeTime(lastSyncAt.toISOString())}` : "Sync pending"}
                </div>
              </div>
            </div>

            {loadError && (
              <div className="mb-4 rounded-xl border border-[#ffb5b5] bg-[#fff0f0] px-3.5 py-2.5 text-[12px] font-semibold text-[#8a2626]">
                {loadError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-[#e0e9e4] bg-white p-4">
                <p className="text-[12px] text-[#1a3326]/62">Total users</p>
                <p className="mt-1 text-[35px] leading-none font-black text-[#12261d]">
                  {loadingUsers ? "—" : <CountUpNumber value={totalUsers} />}
                </p>
                <p className="mt-2 text-[11px] font-semibold text-[#1a3326]/55">
                  New this week: {loadingUsers ? "—" : <CountUpNumber value={newUsers7d} />}
                </p>
              </div>
              <div className="rounded-2xl border border-[#e0e9e4] bg-white p-4">
                <p className="text-[12px] text-[#1a3326]/62">Active today</p>
                <p className="mt-1 text-[35px] leading-none font-black text-[#12261d]">
                  {loadingUsers ? "—" : <CountUpNumber value={activeToday} />}
                </p>
                <p className="mt-2 text-[11px] font-semibold text-[#1a3326]/55">
                  Pending invites: {loadingUsers ? "—" : <CountUpNumber value={pendingUsers} />}
                </p>
              </div>
              <div className="rounded-2xl border border-[#e0e9e4] bg-white p-4">
                <p className="text-[12px] text-[#1a3326]/62">Admin accounts</p>
                <p className="mt-1 text-[35px] leading-none font-black text-[#12261d]">
                  {loadingUsers ? "—" : <CountUpNumber value={adminUsers} />}
                </p>
                <p className="mt-2 text-[11px] font-semibold text-[#1a3326]/55">
                  Super admins: {loadingUsers ? "—" : <CountUpNumber value={roleBreakdown["SUPER ADMIN"]} />}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-[#e0e9e4] bg-[#f9faf9] p-4">
                <p className="text-[12px] text-[#1a3326]/62">Total applicants</p>
                <p className="mt-1 text-[35px] leading-none font-black text-[#12261d]">
                  {loadingUsers ? "—" : <CountUpNumber value={totalApplicants} />}
                </p>
                <p className="mt-2 text-[11px] font-semibold text-[#1a3326]/55">
                  New this week: {loadingUsers ? "—" : <CountUpNumber value={newApplicants7d} />}
                </p>
              </div>
              <div className="rounded-2xl border border-[#e0e9e4] bg-[#f9faf9] p-4">
                <p className="text-[12px] text-[#0051a8]/70">Accepted applicants</p>
                <p className="mt-1 text-[35px] leading-none font-black text-[#0051a8]">
                  {loadingUsers ? "—" : <CountUpNumber value={acceptedApplicants} />}
                </p>
                <p className="mt-2 text-[11px] font-semibold text-[#1a3326]/55">
                  Conversion tracking
                </p>
              </div>
              <div className="rounded-2xl border border-[#e0e9e4] bg-[#f9faf9] p-4 flex flex-col justify-center items-start">
                  <p className="text-[12px] text-[#1a3326]/62 mb-3">Quick Actions</p>
                  <button
                    type="button"
                    onClick={() => navigate("/admin/applicants")}
                    className="h-10 px-5 rounded-lg border border-[#046241] text-[#046241] text-[11px] font-black uppercase tracking-[0.1em] hover:bg-[#046241] hover:text-white transition-colors w-full text-center"
                  >
                    Review Applicants
                  </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BarChart
                title="New users"
                subtitle="Signups in the last 7 days"
                series={signupSeries}
                color="#0f6b4d"
              />
              <BarChart
                title="Active users"
                subtitle="Last seen in the last 7 days"
                series={activeSeries}
                color="#FFB347"
              />
            </div>

            <div className="mt-4 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4">
              <section className="rounded-2xl border border-[#e0e9e4] bg-white overflow-hidden">
                <div className="px-4 py-3.5 border-b border-[#ecf2ee] flex items-center justify-between">
                  <h2 className="text-[23px] font-black text-[#10261d]">New users</h2>
                  <button
                    type="button"
                    onClick={() => navigate("/admin/users")}
                    className="text-[11px] font-black uppercase tracking-[0.1em] text-[#046241]"
                  >
                    View all
                  </button>
                </div>
                <div className="divide-y divide-[#ecf2ee]">
                  {loadingUsers ? (
                    <div className="px-4 py-6 text-[13px] text-[#1a3326]/55">
                      Loading users from database...
                    </div>
                  ) : latestUsers.length === 0 ? (
                    <div className="px-4 py-6 text-[13px] text-[#1a3326]/55">
                      No users found.
                    </div>
                  ) : (
                    latestUsers.map((entry) => (
                      <div key={entry.id} className="px-4 py-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full border border-[#d8e5de] bg-[#f4f8f6] overflow-hidden flex items-center justify-center text-[11px] font-black text-[#244235]">
                          {entry.avatarUrl ? (
                            <img src={entry.avatarUrl} alt={`${entry.name} avatar`} className="w-full h-full object-cover" />
                          ) : (
                            <span>{initials(entry.name) || "U"}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-bold truncate text-[#0f2318]">{entry.name}</p>
                          <p className="text-[11px] text-[#1a3326]/55 truncate">{entry.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#1a3326]/50">
                            {entry.displayId || "PH000"}
                          </p>
                          <p className="text-[11px] text-[#1a3326]/55">{formatDate(entry.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-[#e0e9e4] bg-white overflow-hidden">
                <div className="px-4 py-3.5 border-b border-[#ecf2ee]">
                  <h2 className="text-[19px] font-black text-[#10261d]">Realtime analytics</h2>
                  <p className="text-[11px] text-[#1a3326]/55">Today, {todayLabel}</p>
                </div>
                <div className="p-4 space-y-4">
                  <div className="rounded-xl border border-[#e8efeb] bg-[#fbfdfc] p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#1a3326]/55">Role mix</p>
                    <div className="mt-2 space-y-2 text-[12px] font-semibold text-[#10261d]">
                      <div className="flex items-center justify-between">
                        <span>Users</span>
                        <span>{roleBreakdown.USER}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Admins</span>
                        <span>{roleBreakdown.ADMIN}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Super admins</span>
                        <span>{roleBreakdown["SUPER ADMIN"]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e8efeb] bg-[#fbfdfc] p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#1a3326]/55">Status</p>
                    <div className="mt-2 space-y-2 text-[12px] font-semibold text-[#10261d]">
                      <div className="flex items-center justify-between">
                        <span>Active</span>
                        <span>{statusBreakdown.Active}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Pending</span>
                        <span>{statusBreakdown.Pending}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Suspended</span>
                        <span>{statusBreakdown.Suspended}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e8efeb] bg-[#fbfdfc] p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#1a3326]/55">Recently active</p>
                    <div className="mt-2 space-y-2">
                      {recentlyActive.length === 0 ? (
                        <p className="text-[12px] text-[#1a3326]/55">No recent activity.</p>
                      ) : (
                        recentlyActive.map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between text-[12px] text-[#10261d]">
                            <span className="truncate">{entry.name}</span>
                            <span className="text-[#1a3326]/55">{formatRelativeTime(entry.lastSeen)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
        </motion.section>
      </section>
    </main>
  );
}
