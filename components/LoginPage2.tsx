import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loginWithFixedAccount } from "../auth";

// ─── External script loader (unchanged) ──────────────────────────────────────
function loadExternalScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.ready === "true") { resolve(); return; }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed: ${src}`)), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.id = id; s.src = src; s.async = true;
    s.onload = () => { s.dataset.ready = "true"; resolve(); };
    s.onerror = () => reject(new Error(`Failed: ${src}`));
    document.head.appendChild(s);
  });
}

const EASE = [0.16, 1, 0.3, 1] as const;

const CSS = `
  @keyframes lw-shimmer {
    0%   { transform: translateX(-120%) skewX(-18deg); }
    100% { transform: translateX(220%) skewX(-18deg); }
  }
  /* Input caret colour */
  .lw-input { caret-color: #046241; }
  .dark .lw-input { caret-color: #FFB347; }

  /* Shimmer on submit */
  .lw-btn-shimmer { position: relative; overflow: hidden; }
  .lw-btn-shimmer::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%);
    transform: translateX(-120%) skewX(-18deg);
    animation: lw-shimmer 2.6s cubic-bezier(0.16,1,0.3,1) infinite;
    border-radius: inherit;
  }
`;

// ─── Animated field ───────────────────────────────────────────────────────────
function Field({
  id, label, type = "text", placeholder, autoComplete, value, onChange,
}: {
  id: string; label: string; type?: string; placeholder: string;
  autoComplete?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[9px] font-black uppercase tracking-[0.24em] mb-2
                   text-[#1a3326]/40 dark:text-white/35"
      >
        {label}
      </label>
      <div
        className="h-12 rounded-xl border border-transparent
                   bg-[#f0f4f2] dark:bg-[#12271d]
                   px-4 flex items-center transition-colors duration-200
                   focus-within:bg-white dark:focus-within:bg-[#162f22]
                   focus-within:border-[#046241]/35 dark:focus-within:border-[#FFB347]/45"
      >
        <input
          id={id} name={id} type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="lw-input w-full bg-transparent outline-none
                     text-[16px] font-bold tracking-[-0.01em]
                     text-[#0f2318] dark:text-white
                     placeholder:text-[#0f2318]/35 dark:placeholder:text-white/30
                     transition-colors"
        />
      </div>
    </div>
  );
}



// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function LoginPage2() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const haloRef = useRef<HTMLDivElement>(null);
  const vantaRef = useRef<any>(null);

  // Vanta halo — unchanged
  useEffect(() => {
    let cancelled = false;
    const initVanta = async () => {
      const target = haloRef.current;
      if (!target) return;
      try {
        const w = window as any;
        if (!w.THREE) await loadExternalScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js", "three-r134");
        if (!w.VANTA?.HALO) await loadExternalScript("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.halo.min.js", "vanta-halo");
        if (cancelled || !haloRef.current || !w.VANTA?.HALO) return;
        if (vantaRef.current?.destroy) vantaRef.current.destroy();
        vantaRef.current = w.VANTA.HALO({
          el: haloRef.current,
          mouseControls: true, touchControls: true, gyroControls: false,
          minHeight: 200, minWidth: 200,
          baseColor: 0xffb347, backgroundColor: 0x133020,
          amplitudeFactor: 1.8, size: 1.6,
        });
      } catch { /* fallback gradient */ }
    };
    initVanta();
    return () => {
      cancelled = true;
      if (vantaRef.current?.destroy) { vantaRef.current.destroy(); vantaRef.current = null; }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const success = loginWithFixedAccount(email, password);
      setLoading(false);
      if (!success) {
        setError("Invalid email or password.");
        return;
      }
      setSubmitted(true);
      setTimeout(() => {
        window.history.pushState({}, "", "/dashboard");
        window.dispatchEvent(new PopStateEvent("popstate"));
      }, 600);
    }, 800);
  };

  return (
    <main className="min-h-screen bg-brand-paper dark:bg-brand-dark overflow-x-hidden lg:h-screen lg:overflow-hidden">
      <style>{CSS}</style>

      <section className="min-h-screen lg:h-screen grid grid-cols-1 lg:grid-cols-[1fr_1fr]">

        {/* ══ LEFT — Form ═══════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-center px-6 md:px-12 lg:px-16 xl:px-20 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE }}
            className="w-full max-w-[420px]"
          >
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
              className="mb-8 flex items-center gap-3"
            >
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    window.history.pushState({}, "", "/");
                    window.dispatchEvent(new PopStateEvent("popstate"));
                  }
                }}
                aria-label="Go back"
                className="inline-flex items-center justify-center
                           text-[#046241] dark:text-[#FFB347]
                           transition-opacity hover:opacity-75"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <img
                src="https://framerusercontent.com/images/BZSiFYgRc4wDUAuEybhJbZsIBQY.png"
                alt="Lifewood"
                className="h-9 w-auto object-contain block dark:hidden"
              />
              <img
                src="https://framerusercontent.com/images/Ca8ppNsvJIfTsWEuHr50gvkDow.png?scale-down-to=512&width=2624&height=474"
                alt="Lifewood"
                className="h-9 w-auto object-contain hidden dark:block"
              />
            </motion.div>

            {/* Headline — two lines clip up */}
            <div className="mt-10 md:mt-12 mb-8 space-y-0.5">
              {["Welcome back.", "Sign in to continue."].map((line, i) => (
                <div key={line} style={{ overflow: "hidden" }}>
                  <motion.div
                    initial={{ y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.65, delay: 0.08 + i * 0.1, ease: EASE }}
                  >
                    <p className={`font-black leading-[1.05] tracking-[-0.035em]
                                  ${i === 0
                                    ? "text-[28px] md:text-[34px] text-[#0f2318] dark:text-white"
                                    : "text-[28px] md:text-[34px] text-[#046241] dark:text-[#FFB347]"
                                  }`}>
                      {line}
                    </p>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3, ease: EASE }}
              className="text-[13px] leading-[1.65] text-[#1a3326]/75 dark:text-white/75 mb-8 max-w-[360px]"
            >
              Access your Lifewood workspace to manage projects,
              data pipelines, and delivery updates.
            </motion.p>

            {/* Form card */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease: EASE }}
            >
              {/* Fields container */}
              <div className="rounded-2xl border border-[#e6ede8] dark:border-white/10
                              bg-[#fbfcfb] dark:bg-[#0f1f17]
                              shadow-[0_4px_24px_rgba(4,98,65,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]
                              p-5 md:p-6">
                <div className="space-y-4">
                  <Field
                    id="login2-email" label="Email" type="email"
                    placeholder="you@lifewood.com"
                    autoComplete="email"
                    value={email} onChange={setEmail}
                  />
                  <Field
                    id="login2-password" label="Password" type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password} onChange={setPassword}
                  />
                </div>
              </div>

              {/* Options row */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mt-4 flex items-center justify-between"
              >
                <label className="inline-flex items-center gap-2 text-[12px] text-[#1a3326]/55 dark:text-white/50 cursor-pointer select-none">
                  <input
                    type="checkbox" defaultChecked
                    className="h-4 w-4 rounded border-[#046241]/35 accent-[#046241] dark:accent-[#FFB347]"
                  />
                  Remember me
                </label>
                <a href="/contact"
                  className="text-[12px] text-[#1a3326]/50 dark:text-white/45
                             hover:text-[#046241] dark:hover:text-[#FFB347] transition-colors">
                  Need help?
                </a>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-3 text-[11px] text-red-500 dark:text-red-400 font-semibold"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading || submitted}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="lw-btn-shimmer mt-5 w-full h-[52px] rounded-xl
                           bg-[#046241] dark:bg-[#FFB347]
                           text-white dark:text-[#0f2318]
                           text-[13px] font-black uppercase tracking-[0.2em]
                           shadow-[0_8px_24px_rgba(4,98,65,0.3)] dark:shadow-[0_8px_24px_rgba(255,179,71,0.3)]
                           disabled:opacity-60 transition-opacity"
              >
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.span key="done"
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Signed in
                    </motion.span>
                  ) : loading ? (
                    <motion.span key="loading"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2.5">
                      <motion.span
                        className="block w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
                      />
                      Signing in…
                    </motion.span>
                  ) : (
                    <motion.span key="idle"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2">
                      Sign In
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.form>

            {/* Footer note */}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-7 text-[11px] text-[#1a3326]/35 dark:text-white/28 text-center"
            >
              Protected workspace · Lifewood Data Technology
            </motion.p>
          </motion.div>
        </div>

        {/* ══ RIGHT — Atmospheric panel ═════════════════════════════════════════ */}
        <div className="relative hidden lg:flex flex-col items-center justify-center min-h-screen overflow-hidden">
          {/* Vanta background */}
          <div
            ref={haloRef}
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at 20% 20%, rgba(193,255,0,0.08), transparent 45%), linear-gradient(160deg, #133020 0%, #0b1f15 55%, #09140f 100%)",
            }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          {/* Radial vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.45)_100%)] pointer-events-none" />

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center gap-8 px-10 w-full">
            {/* Big headline */}
            <div className="text-center">
              {["Mastering", "React Patterns", "& Architecture"].map((line, i) => (
                <div key={line} style={{ overflow: "hidden" }}>
                  <motion.p
                    initial={{ y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 + i * 0.12, ease: EASE }}
                    className={`font-black leading-[0.95] tracking-[-0.035em]
                                ${i === 1
                                  ? "text-[#c1ff00] text-[36px] xl:text-[44px]"
                                  : "text-white text-[36px] xl:text-[44px]"
                                }`}
                  >
                    {line}
                  </motion.p>
                </div>
              ))}
            </div>

          </div>

          {/* Bottom-left watermark */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute bottom-7 left-8 z-10"
          >
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/18">
              © {new Date().getFullYear()} Lifewood Data Technology
            </p>
          </motion.div>
        </div>

      </section>
    </main>
  );
}
