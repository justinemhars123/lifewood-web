import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AUTH_EVENT_NAME,
  AuthUser,
  SUPER_ADMIN_EMAIL,
  getAuthUser,
  hasAdminAccess,
  isSuperAdmin,
  logoutAuth,
} from "../auth";
import { supabase } from "../supabaseClient";

const EASE = [0.16, 1, 0.3, 1] as const;

type ManagedRole = "USER" | "ADMIN" | "SUPER ADMIN";
type ManagedStatus = "Active" | "Pending" | "Suspended";
const ROLE_OPTIONS: ManagedRole[] = ["USER", "ADMIN"];

type ManagedUser = {
  id: string;
  displayId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  school: string;
  avatarUrl: string;
  role: ManagedRole;
  status: ManagedStatus;
  lastSeen: string;
  createdAt: string | null;
  immutable?: boolean;
};

type UserRow = {
  id: string;
  display_id?: string | null;
  email: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  school?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  status?: string | null;
  last_seen?: string | null;
  created_at?: string | null;
};

const USER_SELECT_PRIMARY =
  "id, display_id, email, full_name, first_name, last_name, phone, school, avatar_url, role, status, last_seen, created_at";
const USER_SELECT_LEGACY = "id, email, full_name, role, status, last_seen, created_at";

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "User Management", path: "/admin/users" },
  { label: "Applicants", path: "/admin/applicants" },
  { label: "Analytics", path: "/admin/analytics" },
  { label: "Contacts", path: "/admin/contacts" },
];

function navigate(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function rolePillClass(role: ManagedRole) {
  if (role === "SUPER ADMIN") return "bg-[#FFB347]/20 text-[#8f4f00]";
  if (role === "ADMIN") return "bg-[#046241]/15 text-[#046241]";
  return "bg-[#eaf1ed] text-[#2b5242]";
}

function statusPillClass(status: ManagedStatus) {
  if (status === "Active") return "bg-[#e6f7ef] text-[#046241]";
  if (status === "Pending") return "bg-[#fff4e5] text-[#915700]";
  return "bg-[#ffe9e9] text-[#9f2424]";
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

function toManagedUser(row: UserRow): ManagedUser | null {
  const email = (row.email || "").trim().toLowerCase();
  if (!email) return null;

  const displayName = row.full_name?.trim() || email.split("@")[0] || "User";
  const role = email === SUPER_ADMIN_EMAIL ? "SUPER ADMIN" : normalizeRole(row.role);

  return {
    id: row.id,
    displayId: row.display_id?.trim() || "",
    name: displayName,
    firstName: row.first_name?.trim() || "",
    lastName: row.last_name?.trim() || "",
    email,
    phone: row.phone?.trim() || "",
    school: row.school?.trim() || "",
    avatarUrl: row.avatar_url?.trim() || "",
    role,
    status: normalizeStatus(row.status),
    lastSeen: formatRelativeTime(row.last_seen || row.created_at),
    createdAt: row.created_at,
    immutable: email === SUPER_ADMIN_EMAIL,
  };
}

function renderAvatar(name: string, avatarUrl?: string) {
  const initial = name.trim().slice(0, 1).toUpperCase() || "U";
  return (
    <div className="w-9 h-9 rounded-full border border-[#d8e5de] bg-[#f4f8f6] overflow-hidden flex items-center justify-center text-[12px] font-black text-[#244235]">
      {avatarUrl ? (
        <img src={avatarUrl} alt={`${name} avatar`} className="w-full h-full object-cover" />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}

function formatDateTime(isoValue?: string | null) {
  if (!isoValue) return "Unknown";
  const parsed = new Date(isoValue);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return "Failed to load users from database.";
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

export default function UserManagementPage() {
  const [user, setUser] = useState<AuthUser | null>(() => getAuthUser());
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname.replace(/\/+$/, ""));
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewUser, setViewUser] = useState<ManagedUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<ManagedUser | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [roleUpdating, setRoleUpdating] = useState(false);
  const [roleUpdateError, setRoleUpdateError] = useState("");

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

  const canManage = hasAdminAccess(user);
  const isRootAdmin = isSuperAdmin(user);
  const activePath = currentPath === "/admin" ? "/admin/dashboard" : currentPath;

  const fetchManagedUsers = useCallback(async () => {
    setLoadingUsers(true);
    setLoadError("");

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) {
        setUsers([]);
        setLoadError("No active Supabase session. Please log in again.");
        return;
      }

      // Best-effort backfill: keep public.users aligned with auth.users for admin view.
      const { error: syncError } = await supabase.rpc("sync_all_auth_users_to_public_users");
      if (syncError) {
        console.warn("User sync RPC warning:", syncError.message);
      }

      let { data, error } = await supabase
        .from("users")
        .select(USER_SELECT_PRIMARY)
        .order("created_at", { ascending: false });
      let resolvedData = data as UserRow[] | null;

      if (error && isMissingColumnError(error.message || "")) {
        const legacyResult = await supabase
          .from("users")
          .select(USER_SELECT_LEGACY)
          .order("created_at", { ascending: false });
        resolvedData = legacyResult.data as UserRow[] | null;
        error = legacyResult.error;
      }

      if (error) throw error;

      const mapped = ((resolvedData || []) as UserRow[])
        .map(toManagedUser)
        .filter((entry): entry is ManagedUser => Boolean(entry));

      const deduped = mapped.filter(
        (entry, index, all) => all.findIndex((item) => item.email === entry.email) === index
      );

      setUsers(deduped);
    } catch (error) {
      const message = getErrorMessage(error);
      const lowered = message.toLowerCase();
      setLoadError(
        isMissingUsersTableError(message)
          ? "Could not read the `users` table. Create it first, then reload."
          : isMissingColumnError(message)
            ? "Your `users` table is missing newer columns. Run `supabase/users_setup.sql`, then reload."
          : lowered.includes("jwt") || lowered.includes("row-level") || lowered.includes("permission")
            ? "Your admin account is not authenticated in Supabase. Sign in with a Supabase admin account to load users."
            : message
      );
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (!canManage) return;
    void fetchManagedUsers();
  }, [canManage, fetchManagedUsers]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (entry) =>
        entry.name.toLowerCase().includes(query) ||
        entry.email.toLowerCase().includes(query) ||
        entry.role.toLowerCase().includes(query)
    );
  }, [searchTerm, users]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((entry) => entry.status === "Active").length;
    const adminUsers = users.filter(
      (entry) => entry.role === "ADMIN" || entry.role === "SUPER ADMIN"
    ).length;
    const pendingUsers = users.filter((entry) => entry.status === "Pending").length;
    return { totalUsers, activeUsers, adminUsers, pendingUsers };
  }, [users]);

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

  const openDeleteDialog = (entry: ManagedUser) => {
    if (entry.immutable) return;
    setDeleteUser(entry);
    setDeleteConfirmText("");
    setActionError("");
  };

  const closeDeleteDialog = () => {
    setDeleteUser(null);
    setDeleteConfirmText("");
    setDeleteLoading(false);
    setActionError("");
  };

  const handleRoleUpdate = async (nextRole: ManagedRole) => {
    if (!viewUser) return;
    if (viewUser.immutable) return;
    if (nextRole === viewUser.role) return;

    setRoleUpdating(true);
    setRoleUpdateError("");
    const { error } = await supabase
      .from("users")
      .update({ role: nextRole })
      .eq("id", viewUser.id);

    setRoleUpdating(false);
    if (error) {
      setRoleUpdateError(error.message || "Failed to update role.");
      return;
    }

    setViewUser((prev) => (prev ? { ...prev, role: nextRole } : prev));
    setUsers((prev) =>
      prev.map((entry) => (entry.id === viewUser.id ? { ...entry, role: nextRole } : entry))
    );
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    if (deleteUser.immutable) {
      setActionError("Super admin cannot be deleted.");
      return;
    }
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      setActionError("Type DELETE to confirm.");
      return;
    }

    setDeleteLoading(true);
    setActionError("");
    const { error } = await supabase.rpc("admin_delete_user_account", {
      target_user_id: deleteUser.id,
    });
    setDeleteLoading(false);

    if (error) {
      setActionError(error.message || "Failed to delete user.");
      return;
    }

    closeDeleteDialog();
    await fetchManagedUsers();
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
            {isRootAdmin && (
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
          key="admin-users-content"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="p-5 md:p-7 bg-[#f7faf8] lg:h-screen overflow-y-auto"
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <h1 className="text-[44px] leading-[0.92] font-black tracking-[-0.03em] text-[#10261d]">
              User Management
            </h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="h-9 px-3 rounded-full border border-[#d7e4dd] bg-white text-[10px] font-black uppercase tracking-[0.12em] text-[#25473a]"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => void fetchManagedUsers()}
                disabled={loadingUsers}
                className="h-9 px-3 rounded-full bg-[#046241] text-white text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-55"
              >
                {loadingUsers ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          {loadError && (
            <div className="mb-4 rounded-xl border border-[#ffb5b5] bg-[#fff0f0] px-3.5 py-2.5 text-[12px] font-semibold text-[#8a2626]">
              {loadError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
            <div className="rounded-2xl border border-[#e0e9e4] bg-white p-4">
              <p className="text-[11px] text-[#1a3326]/62">Total users</p>
              <p className="mt-1 text-[34px] leading-none font-black text-[#12261d]">{stats.totalUsers}</p>
            </div>
            <div className="rounded-2xl border border-[#e0e9e4] bg-white p-4">
              <p className="text-[11px] text-[#1a3326]/62">Active today</p>
              <p className="mt-1 text-[34px] leading-none font-black text-[#12261d]">{stats.activeUsers}</p>
            </div>
            <div className="rounded-2xl border border-[#e0e9e4] bg-white p-4">
              <p className="text-[11px] text-[#1a3326]/62">Admin accounts</p>
              <p className="mt-1 text-[34px] leading-none font-black text-[#12261d]">{stats.adminUsers}</p>
            </div>
            <div className="rounded-2xl border border-[#e0e9e4] bg-white p-4">
              <p className="text-[11px] text-[#1a3326]/62">Pending invites</p>
              <p className="mt-1 text-[34px] leading-none font-black text-[#12261d]">{stats.pendingUsers}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e0e9e4] bg-white overflow-hidden">
            <div className="px-4 py-3.5 border-b border-[#ecf2ee] flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[22px] font-black text-[#10261d]">Organization users</h2>
              <div className="h-9 w-full sm:w-[250px] rounded-lg border border-[#d9e6df] bg-[#f9fbfa] px-3 flex items-center">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search name or email"
                  className="w-full bg-transparent outline-none text-[13px] placeholder:text-[#1a3326]/45"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead className="bg-[#f6faf8]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#1a3326]/45">User</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#1a3326]/45">Role</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#1a3326]/45">Status</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#1a3326]/45">Last seen</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#1a3326]/45">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers ? (
                    <tr className="border-t border-[#ecf1ee]">
                      <td colSpan={5} className="px-4 py-6 text-[13px] text-[#1a3326]/55">
                        Loading users from database...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr className="border-t border-[#ecf1ee]">
                      <td colSpan={5} className="px-4 py-6 text-[13px] text-[#1a3326]/55">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((entry) => (
                      <tr key={entry.id} className="border-t border-[#ecf1ee]">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            {renderAvatar(entry.name, entry.avatarUrl)}
                            <div>
                              <p className="text-[13px] font-bold text-[#0f2318]">{entry.name}</p>
                              <p className="text-[12px] text-[#1a3326]/62">{entry.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${rolePillClass(entry.role)}`}>
                            {entry.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${statusPillClass(entry.status)}`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-[12px] text-[#1a3326]/62">{entry.lastSeen}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setViewUser(entry)}
                              className="h-8 px-3 rounded-lg border border-[#046241]/20 text-[10px] font-black uppercase tracking-[0.1em] text-[#046241] hover:bg-[#046241]/5 transition-colors"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteDialog(entry)}
                              disabled={entry.immutable}
                              className="h-8 px-3 rounded-lg border border-red-500/35 text-[10px] font-black uppercase tracking-[0.1em] text-red-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-500/5 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {viewUser && (
            <div className="fixed inset-0 z-[90] bg-[#06140f]/55 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="w-full max-w-[720px] rounded-2xl border border-[#dbe7e1] bg-white p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6a7c73] mb-1">
                      User Details
                    </p>
                    <h3 className="text-[24px] font-black tracking-[-0.02em] text-[#10261d]">
                      Profile Summary
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewUser(null)}
                    className="h-9 px-4 rounded-xl border border-[#d8e5de] text-[11px] font-black uppercase tracking-[0.1em] text-[#1a3326]/70 hover:bg-[#f3f8f5]"
                  >
                    Close
                  </button>
                </div>

                <div className="rounded-2xl border border-[#e0e9e4] bg-[#f7faf8] p-4 flex flex-wrap items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full border border-[#d8e5de] bg-white overflow-hidden flex items-center justify-center">
                    {viewUser.avatarUrl ? (
                      <img src={viewUser.avatarUrl} alt={`${viewUser.name} avatar`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[16px] font-black text-[#244235]">
                        {viewUser.name.trim().slice(0, 1).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className="min-w-[220px]">
                    <p className="text-[16px] font-black text-[#0f2318]">{viewUser.name}</p>
                    <p className="text-[12px] text-[#1a3326]/65">{viewUser.email}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${rolePillClass(viewUser.role)}`}>
                      {viewUser.role}
                    </span>
                    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${statusPillClass(viewUser.status)}`}>
                      {viewUser.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px] text-[#163126]">
                  <div className="rounded-xl border border-[#e6eee9] bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">First Name</p>
                    <p className="mt-1 font-semibold">{viewUser.firstName || "Not set"}</p>
                  </div>
                  <div className="rounded-xl border border-[#e6eee9] bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">Last Name</p>
                    <p className="mt-1 font-semibold">{viewUser.lastName || "Not set"}</p>
                  </div>
                  <div className="rounded-xl border border-[#e6eee9] bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">Phone</p>
                    <p className="mt-1 font-semibold">{viewUser.phone || "Not set"}</p>
                  </div>
                  <div className="rounded-xl border border-[#e6eee9] bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">School</p>
                    <p className="mt-1 font-semibold">{viewUser.school || "Not set"}</p>
                  </div>
                  <div className="rounded-xl border border-[#e6eee9] bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">Role</p>
                    <div className="mt-2">
                      {viewUser.immutable ? (
                        <p className="font-semibold">{viewUser.role}</p>
                      ) : (
                        <select
                          value={viewUser.role}
                          onChange={(event) => handleRoleUpdate(event.target.value as ManagedRole)}
                          disabled={roleUpdating}
                          className="h-9 w-full rounded-lg border border-[#d8e5de] bg-white px-3 text-[12px] font-semibold text-[#163126] outline-none focus:border-[#046241]"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      )}
                      {roleUpdateError && (
                        <p className="mt-1 text-[11px] font-semibold text-red-600">{roleUpdateError}</p>
                      )}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#e6eee9] bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">User ID</p>
                    <p className="mt-1 font-semibold">
                      {viewUser.displayId || "PH000"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#e6eee9] bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">System ID</p>
                    <p className="mt-1 font-semibold break-all">{viewUser.id}</p>
                  </div>
                  <div className="rounded-xl border border-[#e6eee9] bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">Created</p>
                    <p className="mt-1 font-semibold">{formatDateTime(viewUser.createdAt)}</p>
                  </div>
                  <div className="rounded-xl border border-[#e6eee9] bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">Last Seen</p>
                    <p className="mt-1 font-semibold">{viewUser.lastSeen}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {deleteUser && (
            <div className="fixed inset-0 z-[95] bg-[#06140f]/60 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="w-full max-w-[520px] rounded-2xl border border-red-200 bg-white p-5 md:p-6">
                <h3 className="text-[24px] font-black tracking-[-0.02em] text-[#10261d] mb-2">Delete User</h3>
                <p className="text-[13px] text-[#1a3326]/75 leading-[1.6]">
                  You are about to delete <strong>{deleteUser.name}</strong> ({deleteUser.email}).
                  This removes the account from the database and authentication.
                </p>
                <p className="mt-3 text-[11px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">
                  Type DELETE to confirm
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(event) => setDeleteConfirmText(event.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-[#d8e5de] px-3 text-[13px] outline-none focus:border-red-400"
                  placeholder="DELETE"
                />
                {actionError && (
                  <p className="mt-2 text-[12px] font-semibold text-red-600">{actionError}</p>
                )}

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeDeleteDialog}
                    disabled={deleteLoading}
                    className="h-9 px-4 rounded-lg border border-[#d8e5de] text-[11px] font-black uppercase tracking-[0.1em] text-[#1a3326]/70 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteUser()}
                    disabled={deleteLoading}
                    className="h-9 px-4 rounded-lg bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.1em] disabled:opacity-50"
                  >
                    {deleteLoading ? "Deleting..." : "Delete user"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.section>
      </section>
    </main>
  );
}
