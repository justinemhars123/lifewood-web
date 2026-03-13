import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { isAuthenticated, signUpWithPassword } from "../auth";

function loadExternalScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.ready === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed: ${src}`)), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.ready = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed: ${src}`));
    document.head.appendChild(script);
  });
}

const EASE = [0.16, 1, 0.3, 1] as const;
const VERIFY_MESSAGE =
  "Account created. Verification email sent. Check inbox/spam and use the link to activate your account.";

const CSS = `
  @keyframes lw-shimmer {
    0%   { transform: translateX(-120%) skewX(-18deg); }
    100% { transform: translateX(220%) skewX(-18deg); }
  }
  .lw-input { caret-color: #046241; }
  .dark .lw-input { caret-color: #FFB347; }
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

function Field({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[9px] font-black uppercase tracking-[0.24em] mb-2 text-[#1a3326]/40 dark:text-white/35"
      >
        {label}
      </label>
      <div className="h-12 rounded-xl border border-transparent bg-[#f0f4f2] dark:bg-[#12271d] px-4 flex items-center transition-colors duration-200 focus-within:bg-white dark:focus-within:bg-[#162f22] focus-within:border-[#046241]/35 dark:focus-within:border-[#FFB347]/45">
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="lw-input w-full bg-transparent outline-none text-[16px] font-bold tracking-[-0.01em] text-[#0f2318] dark:text-white placeholder:text-[#0f2318]/35 dark:placeholder:text-white/30 transition-colors"
        />
      </div>
    </div>
  );
}

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const haloRef = useRef<HTMLDivElement>(null);
  const vantaRef = useRef<any>(null);

  const handleBack = () => {
    const referrer = document.referrer || "";
    const isInternalReferrer = referrer.startsWith(window.location.origin);
    if (isInternalReferrer && window.history.length > 1) {
      window.history.back();
      return;
    }
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleLogoClick = () => {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  useEffect(() => {
    if (isAuthenticated()) {
      window.history.pushState({}, "", "/dashboard");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isDesktop || reduceMotion) return;

    let cancelled = false;

    const initVanta = async () => {
      const target = haloRef.current;
      if (!target) return;

      try {
        const browserWindow = window as any;
        if (!browserWindow.THREE) {
          await loadExternalScript(
            "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js",
            "three-r134"
          );
        }
        if (!browserWindow.VANTA?.HALO) {
          await loadExternalScript(
            "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.halo.min.js",
            "vanta-halo"
          );
        }
        if (cancelled || !haloRef.current || !browserWindow.VANTA?.HALO) return;
        if (vantaRef.current?.destroy) vantaRef.current.destroy();
        vantaRef.current = browserWindow.VANTA.HALO({
          el: haloRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          baseColor: 0xffb347,
          backgroundColor: 0x133020,
          amplitudeFactor: 1.8,
          size: 1.6,
        });
      } catch {
        // Fallback to static gradient background when script loading fails.
      }
    };

    void initVanta();

    return () => {
      cancelled = true;
      if (vantaRef.current?.destroy) {
        vantaRef.current.destroy();
        vantaRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading || submitted) return;
    setError("");
    setInfo("");
    setLoading(true);

    const { success, error: authError, message } = await signUpWithPassword(
      fullName,
      email,
      password
    );
    setLoading(false);

    if (!success) {
      setError(authError || "Unable to create account.");
      return;
    }

    setSubmitted(true);
    const authedNow = isAuthenticated();
    if (authedNow) {
      setTimeout(() => {
        window.history.pushState({}, "", "/dashboard");
        window.dispatchEvent(new PopStateEvent("popstate"));
      }, 280);
      return;
    }

    // Keep user on this page with the verification message visible.
    setInfo(message || VERIFY_MESSAGE);
    setPassword("");
  };

  return (
    <main className="min-h-screen bg-brand-paper dark:bg-brand-dark overflow-x-hidden lg:h-screen lg:overflow-hidden">
      <style>{CSS}</style>

      <section className="min-h-screen lg:h-screen grid grid-cols-1 lg:grid-cols-[1fr_1fr]">
        <div className="flex items-center justify-center px-6 md:px-12 lg:px-16 xl:px-20 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE }}
            className="w-full max-w-[420px]"
          >
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
              className="mb-8 flex items-center gap-3"
            >
              <button
                type="button"
                onClick={handleBack}
                aria-label="Go back"
                className="inline-flex items-center justify-center text-[#046241] dark:text-[#FFB347] transition-opacity hover:opacity-75"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleLogoClick}
                aria-label="Go to home"
                className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#046241]/40 dark:focus-visible:ring-[#FFB347]/45"
              >
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
              </button>
            </motion.div>

            <div className="mt-10 md:mt-12 mb-8 space-y-0.5">
              {["Create your account.", "Get started today."].map((line, index) => (
                <div key={line} style={{ overflow: "hidden" }}>
                  <motion.div
                    initial={{ y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.65, delay: 0.08 + index * 0.1, ease: EASE }}
                  >
                    <p
                      className={`font-black leading-[1.05] tracking-[-0.035em] ${
                        index === 0
                          ? "text-[28px] md:text-[34px] text-[#0f2318] dark:text-white"
                          : "text-[28px] md:text-[34px] text-[#046241] dark:text-[#FFB347]"
                      }`}
                    >
                      {line}
                    </p>
                  </motion.div>
                </div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3, ease: EASE }}
              className="text-[13px] leading-[1.65] text-[#1a3326]/75 dark:text-white/75 mb-8 max-w-[360px]"
            >
              Use your work email to register and access your Lifewood workspace.
            </motion.p>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="verify-message"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="rounded-2xl border border-[#dfe9e3] bg-white/80 backdrop-blur p-6 md:p-7 shadow-[0_12px_30px_rgba(4,98,65,0.08)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#046241] text-white flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[12px] font-black uppercase tracking-[0.22em] text-[#046241]">
                        Check your email
                      </p>
                      <h3 className="text-[22px] md:text-[24px] font-black text-[#0f2318] mt-1">
                        {VERIFY_MESSAGE}
                      </h3>
                      <p className="text-[12px] text-[#1a3326]/70 mt-3">
                        After verifying, you can sign in or refresh this page to continue.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        window.history.pushState({}, "", "/login");
                        window.dispatchEvent(new PopStateEvent("popstate"));
                      }}
                      className="h-10 px-4 rounded-xl bg-[#046241] text-white text-[11px] font-black uppercase tracking-[0.16em]"
                    >
                      Sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="h-10 px-4 rounded-xl border border-[#d8e5de] text-[11px] font-black uppercase tracking-[0.16em] text-[#1a3326]/70 hover:bg-[#f3f8f5]"
                    >
                      Refresh page
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="signup-form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.22, ease: EASE }}
                >
                  <div className="rounded-2xl border border-[#e6ede8] dark:border-white/10 bg-[#fbfcfb] dark:bg-[#0f1f17] shadow-[0_4px_24px_rgba(4,98,65,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] p-5 md:p-6">
                    <div className="space-y-4">
                      <Field
                        id="signup-full-name"
                        label="Full Name"
                        placeholder="Juan Dela Cruz"
                        autoComplete="name"
                        value={fullName}
                        onChange={setFullName}
                      />
                      <Field
                        id="signup-email"
                        label="Email"
                        type="email"
                        placeholder="you@lifewood.com"
                        autoComplete="email"
                        value={email}
                        onChange={setEmail}
                      />
                      <Field
                        id="signup-password"
                        label="Password"
                        type="password"
                        placeholder="Create a password"
                        autoComplete="new-password"
                        value={password}
                        onChange={setPassword}
                      />
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="mt-4 flex items-center justify-between"
                  >
                    <a
                      href="/login"
                      className="text-[12px] text-[#1a3326]/60 dark:text-white/55 hover:text-[#046241] dark:hover:text-[#FFB347] transition-colors"
                    >
                      Already have an account? Sign in
                    </a>
                    <a
                      href="/contact"
                      className="text-[12px] text-[#1a3326]/50 dark:text-white/45 hover:text-[#046241] dark:hover:text-[#FFB347] transition-colors"
                    >
                      Need help?
                    </a>
                  </motion.div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 text-[11px] text-red-500 dark:text-red-400 font-semibold"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={loading || submitted}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="lw-btn-shimmer mt-5 w-full h-[52px] rounded-xl bg-[#046241] dark:bg-[#FFB347] text-white dark:text-[#0f2318] text-[13px] font-black uppercase tracking-[0.2em] shadow-[0_8px_24px_rgba(4,98,65,0.3)] dark:shadow-[0_8px_24px_rgba(255,179,71,0.3)] disabled:opacity-60 transition-opacity"
                  >
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-center gap-2.5"
                        >
                          <motion.span
                            className="block w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
                          />
                          Creating account...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-center gap-2"
                        >
                          Sign Up
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 12h14M12 5l7 7-7 7"
                            />
                          </svg>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-7 text-[11px] text-[#1a3326]/35 dark:text-white/28 text-center"
            >
              Protected workspace | Lifewood Data Technology
            </motion.p>
          </motion.div>
        </div>

        <div className="relative hidden lg:flex flex-col items-center justify-center min-h-screen overflow-hidden">
          <div
            ref={haloRef}
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(193,255,0,0.08), transparent 45%), linear-gradient(160deg, #133020 0%, #0b1f15 55%, #09140f 100%)",
            }}
          />
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.45)_100%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-8 px-10 w-full">
            <div className="text-center">
              {["Mastering", "React Patterns", "& Architecture"].map((line, index) => (
                <div key={line} style={{ overflow: "hidden" }}>
                  <motion.p
                    initial={{ y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 + index * 0.12, ease: EASE }}
                    className={`font-black leading-[0.95] tracking-[-0.035em] ${
                      index === 1
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute bottom-7 left-8 z-10"
          >
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/18">
              (c) {new Date().getFullYear()} Lifewood Data Technology
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
