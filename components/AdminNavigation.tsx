import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthUser, logoutAuth } from "../auth";

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "User Management", path: "/admin/users" },
  { label: "Applicants", path: "/admin/applicants" },
  { label: "Analytics", path: "/admin/analytics" },
  { label: "Contacts", path: "/admin/contacts" },
];

export function navigateAdmin(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

type AdminNavigationProps = {
  user: AuthUser | null;
  activePath: string;
  isRootAdmin: boolean;
};

export default function AdminNavigation({
  user,
  activePath,
  isRootAdmin,
}: AdminNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const closeMenu = () => setIsMobileMenuOpen(false);
    window.addEventListener("popstate", closeMenu);
    return () => window.removeEventListener("popstate", closeMenu);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logoutAuth();
    setIsMobileMenuOpen(false);
    navigateAdmin("/login");
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      localStorage.theme = "light";
      setIsDark(false);
    } else {
      root.classList.add("dark");
      localStorage.theme = "dark";
      setIsDark(true);
    }
  };

  return (
    <>
      <div className="fixed top-4 left-0 right-0 z-[95] flex justify-center px-4 pointer-events-none lg:hidden">
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto w-fit"
        >
          <motion.div
            animate={{ y: isScrolled ? 0 : [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.01, y: -2 }}
            className={`flex items-center gap-6 transition-all duration-700 rounded-full border ${
              isScrolled
                ? "border-black/[0.04] bg-white/30 py-2.5 px-6 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.05)] dark:border-white/[0.07] dark:bg-brand-dark/40 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                : "border-black/[0.04] bg-white/40 py-3 px-6 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.07),0_4px_16px_rgba(0,0,0,0.04)] dark:border-white/[0.07] dark:bg-brand-dark/45 dark:shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
            }`}
          >
            <button
              type="button"
              onClick={() => navigateAdmin("/admin/dashboard")}
              className="flex items-center"
              aria-label="Go to admin dashboard"
            >
              <div className="flex h-9 w-28 items-center justify-center">
                <img
                  src="https://framerusercontent.com/images/BZSiFYgRc4wDUAuEybhJbZsIBQY.png"
                  alt="Lifewood"
                  className="block h-full w-full object-contain brightness-110 transition-all duration-500 dark:hidden"
                />
                <img
                  src="https://framerusercontent.com/images/Ca8ppNsvJIfTsWEuHr50gvkDow.png?scale-down-to=512&width=2624&height=474"
                  alt="Lifewood"
                  className="hidden h-full w-full object-contain brightness-110 transition-all duration-500 dark:block"
                />
              </div>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 text-brand-dark/40 transition-all hover:scale-110 hover:text-brand-primary active:scale-90 dark:text-brand-seasalt/40 dark:hover:text-brand-saffron"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.757 7.757l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="p-2 text-brand-dark transition-colors dark:text-brand-seasalt"
                aria-label={isMobileMenuOpen ? "Close admin menu" : "Open admin menu"}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        </motion.nav>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="fixed inset-0 z-[100] flex flex-col bg-brand-paper pt-32 px-10 dark:bg-brand-dark lg:hidden"
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto flex max-w-[420px] flex-col gap-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/45 dark:text-brand-seasalt/45">
                  Admin
                </p>

                <div className="flex flex-col gap-6">
                  {ADMIN_NAV_ITEMS.map((item, index) => {
                    const isActive = activePath === item.path;
                    return (
                      <motion.button
                        key={item.path}
                        type="button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigateAdmin(item.path);
                        }}
                        className={`group flex w-full items-center justify-between text-left text-2xl font-bold tracking-tight transition-colors ${
                          isActive
                            ? "text-brand-saffron"
                            : "text-brand-dark hover:text-brand-primary dark:text-brand-seasalt dark:hover:text-brand-saffron"
                        }`}
                      >
                        <span>{item.label}</span>
                        <svg className={`h-5 w-5 transition-colors ${isActive ? "text-brand-saffron" : "text-brand-dark/30 group-hover:text-brand-primary dark:text-brand-seasalt/30 dark:group-hover:text-brand-saffron"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[420px] pt-6 pb-8">
              <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-brand-dark/45 dark:text-brand-seasalt/45">
                  Signed in
                </p>
                <p className="truncate text-[15px] font-bold text-brand-dark dark:text-brand-seasalt">
                  {user?.name || "Admin"}
                </p>
                <p className="truncate text-[12px] text-brand-dark/65 dark:text-brand-seasalt/65">
                  {user?.email}
                </p>
                {isRootAdmin && (
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.1em] text-brand-saffron">
                    Super admin
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 block w-full rounded-full border border-[#FFB347]/40 px-5 py-3 text-center text-[11px] font-black uppercase tracking-[0.12em] text-[#915700] transition-all hover:scale-[1.02] hover:bg-[#FFF6E7] active:scale-95 dark:hover:bg-[#FFB347]/10"
              >
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="hidden bg-[linear-gradient(180deg,#07261c_0%,#051d15_100%)] p-5 text-white lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto">
        <div className="mb-7 shrink-0">
          <img
            src="https://framerusercontent.com/images/Ca8ppNsvJIfTsWEuHr50gvkDow.png?scale-down-to=512&width=2624&height=474"
            alt="Lifewood"
            className="h-8 w-auto object-contain"
          />
        </div>

        <div className="mb-6 shrink-0 space-y-1.5">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = activePath === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigateAdmin(item.path)}
                className={`h-10 w-full rounded-xl px-3 text-left text-[12px] font-semibold transition-colors ${
                  isActive
                    ? "bg-[#0f3a2b] text-white shadow-inner"
                    : "text-white/72 hover:bg-white/8 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-auto shrink-0 space-y-4 pt-6">
          <div className="min-h-[136px] rounded-2xl border border-white/14 bg-white/5 p-4 shadow-inner">
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
              Signed in
            </p>
            <p className="truncate text-[13px] font-bold">{user?.name || "Admin"}</p>
            <p className="truncate text-[11px] text-white/70">{user?.email}</p>
            {isRootAdmin && (
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#c1ff00]">
                Super admin
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="h-10 w-full rounded-xl border border-[#FFB347]/40 text-[11px] font-black uppercase tracking-[0.12em] text-[#FFB347] transition-colors hover:bg-[#FFB347]/10"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
