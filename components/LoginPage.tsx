import React, { useState } from "react";
import { motion } from "framer-motion";
import { FIXED_AUTH_EMAIL, FIXED_AUTH_PASSWORD, loginWithFixedAccount } from "../auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const success = loginWithFixedAccount(email, password);
    if (!success) {
      setError("Invalid email or password. Please use the fixed test account.");
      return;
    }
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <main className="bg-brand-paper dark:bg-brand-dark text-[#0f2318] dark:text-white overflow-x-hidden">
      <section className="px-6 md:px-16 pt-14 md:pt-20 pb-20 md:pb-28">
        <div className="max-w-[1380px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-10 md:gap-16 items-center min-h-[68vh]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full
                         bg-white dark:bg-[#1a3326]
                         border border-[#046241]/15 dark:border-[#4ade80]/20 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB347] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#046241] dark:text-[#4ade80]">
                Account Access
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-[0.95] tracking-[-0.03em] mb-5">
              Welcome back.
              <br />
              <span className="text-[#046241] dark:text-[#FFB347]">Sign in to continue.</span>
            </h1>

            <p className="max-w-[620px] text-[15px] md:text-[18px] leading-[1.65] text-[#1a3326]/70 dark:text-white/70">
              Access your Lifewood workspace to manage projects, data pipelines,
              and delivery updates.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl p-5 md:p-7 bg-white/90 dark:bg-[#11291f]/80
                       border border-[#046241]/12 dark:border-white/10
                       shadow-[0_18px_60px_rgba(4,98,65,0.12)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.4)]"
          >
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-[11px] uppercase tracking-[0.18em] mb-2 text-[#1a3326]/75 dark:text-white/90 font-black"
                >
                  Email
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 rounded-xl px-4 bg-white text-black placeholder:text-black/45
                             border border-black/12 outline-none
                             focus:border-[#FFB347] focus:ring-2 focus:ring-[#FFB347]/30 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-[11px] uppercase tracking-[0.18em] mb-2 text-[#1a3326]/75 dark:text-white/90 font-black"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 rounded-xl px-4 bg-white text-black placeholder:text-black/45
                             border border-black/12 outline-none
                             focus:border-[#FFB347] focus:ring-2 focus:ring-[#FFB347]/30 transition-all"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <label className="inline-flex items-center gap-2 text-[12px] text-[#1a3326]/70 dark:text-white/70">
                  <input type="checkbox" className="rounded border-[#046241]/30" />
                  Remember me
                </label>
                <a
                  href="/contact"
                  className="text-[12px] font-bold text-[#046241] dark:text-[#FFB347] hover:underline"
                >
                  Need help?
                </a>
              </div>

              {/* <div className="rounded-xl border border-[#046241]/12 dark:border-white/12 bg-[#046241]/[0.03] dark:bg-white/[0.03] p-3">
                <p className="text-[11px] text-[#1a3326]/75 dark:text-white/75 leading-relaxed">
                  Test login:
                  <span className="font-semibold"> {FIXED_AUTH_EMAIL}</span> /{" "}
                  <span className="font-semibold">{FIXED_AUTH_PASSWORD}</span>
                </p>
              </div> */}

              {error && (
                <p className="text-[12px] text-red-600 dark:text-red-400 font-semibold">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full h-12 rounded-full mt-2
                           bg-[#046241] hover:bg-[#035a3b] dark:bg-[#FFB347] dark:hover:bg-[#f3a736]
                           text-white dark:text-[#0f2318] text-[12px] font-black uppercase tracking-[0.2em]
                           transition-all hover:scale-[1.01] active:scale-[0.99]
                           shadow-[0_8px_24px_rgba(4,98,65,0.35)] dark:shadow-[0_8px_24px_rgba(255,179,71,0.35)]"
              >
                Login
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
