import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AUTH_EVENT_NAME,
  AuthUser,
  getAuthUser,
  hasAdminAccess,
  isSuperAdmin,
  logoutAuth,
} from "../auth";

const EASE = [0.16, 1, 0.3, 1] as const;

type TaskItem = {
  name: string;
  code: string;
  title: string;
  time: string;
  color: string;
};

type ScheduleItem = {
  title: string;
  code: string;
  time: string;
  highlighted?: boolean;
};

const STATS = [
  { label: "Active sessions", value: "3" },
  { label: "Pending tasks", value: "24" },
  { label: "Done tasks", value: "12" },
];

const TASKS: TaskItem[] = [
  {
    name: "Nadia Santos",
    code: "QOA_ADMIN_21",
    title: "Approve new user roles",
    time: "10:25 am",
    color: "#FFE5CF",
  },
  {
    name: "Marco Torres",
    code: "QOA_SECURITY_07",
    title: "Review suspended accounts",
    time: "10:44 am",
    color: "#E4F5EA",
  },
  {
    name: "Aisha Khan",
    code: "QOA_AUDIT_15",
    title: "Validate permission matrix",
    time: "11:03 am",
    color: "#E7EBFF",
  },
  {
    name: "Leila Rahman",
    code: "QOA_ONBOARD_44",
    title: "Finalize onboarding batch",
    time: "11:19 am",
    color: "#F3E7FF",
  },
];

const SCHEDULE: ScheduleItem[] = [
  { title: "Admin standup", code: "OPS_SYNC", time: "10:00 am" },
  { title: "Permission sync", code: "SEC_RULES", time: "11:00 am", highlighted: true },
  { title: "Audit review", code: "AUDIT_WEEKLY", time: "12:00 pm" },
  { title: "Access cleanup", code: "ACCESS_CLEANUP", time: "01:00 pm" },
  { title: "User import QA", code: "IMPORT_QA", time: "03:00 pm" },
];

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "User Management", path: "/admin/users" },
  { label: "Analytics", path: "/admin/analytics" },
  { label: "Courses", path: "/admin/courses" },
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function navigate(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(() => getAuthUser());
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname.replace(/\/+$/, ""));

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
              <h1 className="text-[44px] leading-[0.92] font-black tracking-[-0.03em] text-[#10261d]">
                Dashboard
              </h1>
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-full border border-[#d7e4dd] bg-white text-[#25473a] text-[14px] font-black">
                  !
                </button>
                <button className="w-9 h-9 rounded-full border border-[#d7e4dd] bg-white text-[#25473a] text-[14px] font-black">
                  @
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {STATS.map((card) => (
                <div key={card.label} className="rounded-2xl border border-[#e0e9e4] bg-white p-4">
                  <p className="text-[12px] text-[#1a3326]/62">{card.label}</p>
                  <p className="mt-1 text-[35px] leading-none font-black text-[#12261d]">{card.value}</p>
                  <button className="mt-3 text-[11px] font-black uppercase tracking-[0.1em] text-[#046241]">
                    View all
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_355px] gap-4">
              <section className="rounded-2xl border border-[#e0e9e4] bg-white overflow-hidden">
                <div className="px-4 py-3.5 border-b border-[#ecf2ee]">
                  <h2 className="text-[23px] font-black text-[#10261d]">My tasks</h2>
                </div>
                <div className="divide-y divide-[#ecf2ee]">
                  {TASKS.map((task) => (
                    <div key={`${task.name}-${task.code}`} className="px-4 py-3 flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-full flex-shrink-0 inline-flex items-center justify-center text-[10px] font-black text-[#16362a]"
                        style={{ backgroundColor: task.color }}
                      >
                        {initials(task.name)}
                      </span>
                      <div className="min-w-0 w-[180px]">
                        <p className="text-[13px] font-bold truncate">{task.name}</p>
                        <p className="text-[11px] text-[#1a3326]/55 truncate">{task.code}</p>
                      </div>
                      <p className="flex-1 min-w-0 text-[12px] text-[#1a3326]/74 truncate">{task.title}</p>
                      <p className="text-[12px] text-[#1a3326]/56 whitespace-nowrap">{task.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-[#ecf2ee]">
                  <button className="text-[11px] font-black uppercase tracking-[0.1em] text-[#046241]">
                    View all
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-[#e0e9e4] bg-white overflow-hidden">
                <div className="px-4 py-3.5 border-b border-[#ecf2ee] flex items-center justify-between">
                  <h2 className="text-[19px] font-black text-[#10261d]">Today, {todayLabel}</h2>
                  <div className="flex items-center gap-1.5">
                    <button className="w-7 h-7 rounded-lg border border-[#d8e5de] text-[#1a3326]/55">{"<"}</button>
                    <button className="w-7 h-7 rounded-lg border border-[#d8e5de] text-[#1a3326]/55">{">"}</button>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {SCHEDULE.map((slot) => (
                    <div
                      key={`${slot.title}-${slot.time}`}
                      className={`rounded-xl border px-3 py-3 ${
                        slot.highlighted
                          ? "bg-[#e98055] border-[#e98055] text-white"
                          : "bg-[#fbfdfc] border-[#e8efeb] text-[#12261d]"
                      }`}
                    >
                      <p className={`text-[13px] font-bold ${slot.highlighted ? "text-white" : "text-[#12261d]"}`}>
                        {slot.title}
                        {" "}
                        <span className={slot.highlighted ? "text-white/82" : "text-[#1a3326]/42"}>
                          {slot.code}
                        </span>
                      </p>
                      <p
                        className={`mt-1 text-[11px] ${
                          slot.highlighted ? "text-white/90" : "text-[#1a3326]/63"
                        }`}
                      >
                        {slot.time}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
        </motion.section>
      </section>
    </main>
  );
}
