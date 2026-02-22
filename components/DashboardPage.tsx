import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AUTH_EVENT_NAME, AuthUser, getAuthUser, updateAuthUser } from "../auth";

/* --- design tokens ------------------------------------------------------- */
const EASE = [0.16, 1, 0.3, 1] as const;
const STAGGER = { animate: { transition: { staggerChildren: 0.06 } } };
const FADE = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.48, ease: EASE } },
};

/* --- helpers ------------------------------------------------------------- */
function Count({ to, suffix = "", delay = 0 }: { to: number; suffix?: string; delay?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const t0 = performance.now();
      const run = (now: number) => {
        const p = Math.min((now - t0) / 1100, 1);
        setV(Math.round((1 - Math.pow(1 - p, 3)) * to));
        if (p < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    }, delay);
    return () => clearTimeout(t);
  }, [to, delay]);
  return <>{v}{suffix}</>;
}

function ProgressBar({ pct, delay = 0.4, color = "#c1ff00" }: { pct: number; delay?: number; color?: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      />
    </div>
  );
}

function ArcRing({ pct, size = 52 }: { pct: number; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [off, setOff] = useState(circ);
  useEffect(() => {
    const t = setTimeout(() => setOff(circ - (pct / 100) * circ), 450);
    return () => clearTimeout(t);
  }, [pct, circ]);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#c1ff00"
        strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={off}
        style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(0.16,1,0.3,1) 0.45s" }}
      />
    </svg>
  );
}

/* --- data ----------------------------------------------------------------- */
const SCHOOL_OPTIONS = [
  "Select your school",
  "University of Cebu (UC)",
  "Cebu Institute of Technology - University (CIT-U)",
  "Cebu Technological University (CTU)",
];

const SCHOOL_LOGOS: Record<string, string> = {
  "University of Cebu (UC)": "https://upload.wikimedia.org/wikipedia/commons/6/68/University_of_Cebu_Logo.png",
  "Cebu Institute of Technology - University (CIT-U)": "https://storage.googleapis.com/bukas-website-v3-prd/website_v3/images/sealnew_copy.original.png",
  "Cebu Technological University (CTU)": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/CTU_new_logo.png/500px-CTU_new_logo.png",
};

function formatPhoneLocal(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

function extractPhoneLocal(value: string) {
  const cleaned = value.replace(/^\+?63\s*/, "");
  return formatPhoneLocal(cleaned);
}

function loadExternalScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.ready === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
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
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

/* --- page ----------------------------------------------------------------- */
export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(() => getAuthUser());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState(SCHOOL_OPTIONS[0]);
  const [avatarDraft, setAvatarDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const learningCardRef = useRef<HTMLDivElement>(null);
  const vantaEffectRef = useRef<any>(null);

  useEffect(() => {
    const sync = () => setUser(getAuthUser());
    window.addEventListener(AUTH_EVENT_NAME, sync as EventListener);
    return () => window.removeEventListener(AUTH_EVENT_NAME, sync as EventListener);
  }, []);

  useEffect(() => {
    if (!isEditOpen) return;
    const fallbackName = user?.name || user?.email?.split("@")[0] || "test1";
    const fallbackSplit = fallbackName.split(" ");
    setFirstName(user?.firstName || fallbackSplit[0] || "");
    setLastName(user?.lastName || fallbackSplit.slice(1).join(" ") || "");
    setEmail(user?.email || "");
    setPhone(extractPhoneLocal(user?.phone || ""));
    setSchool(user?.school || SCHOOL_OPTIONS[0]);
    setAvatarDraft(user?.avatarUrl || "");
  }, [isEditOpen, user]);

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarDraft(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const safeFirst = firstName.trim();
    const safeLast = lastName.trim();
    const safeEmail = email.trim();
    const safePhone = formatPhoneLocal(phone.trim());
    const safeSchool = school.trim() || SCHOOL_OPTIONS[0];
    const displayName = [safeFirst, safeLast].filter(Boolean).join(" ") || (safeEmail.split("@")[0] || "test1");

    const next = updateAuthUser({
      firstName: safeFirst,
      lastName: safeLast,
      email: safeEmail || user?.email || "",
      phone: safePhone ? `+63 ${safePhone}` : "+63 XXX XXX XXXX",
      school: safeSchool,
      name: displayName,
      role: user?.role || "LIFEWOOD PH INTERN",
      avatarUrl: avatarDraft || undefined,
    });
    if (next) setUser(next);
    setIsEditOpen(false);
  };

  const name = user?.name || user?.email?.split("@")[0] || "test1";
  const initial = name.slice(0, 1).toUpperCase();
  const role = user?.role || "LIFEWOOD PH INTERN";
  const roleLabel = role.trim() || "LIFEWOOD PH INTERN";
  const avatarUrl = user?.avatarUrl || "";
  const schoolLogo = user?.school ? SCHOOL_LOGOS[user.school] : "";
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initVanta = async () => {
      const target = learningCardRef.current;
      if (!target) return;
      try {
        const w = window as any;
        if (!w.THREE) {
          await loadExternalScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js", "three-r134");
        }
        if (!w.VANTA?.HALO) {
          await loadExternalScript("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.halo.min.js", "vanta-halo");
        }
        if (cancelled || !learningCardRef.current || !w.VANTA?.HALO) return;

        if (vantaEffectRef.current?.destroy) {
          vantaEffectRef.current.destroy();
        }

        vantaEffectRef.current = w.VANTA.HALO({
          el: learningCardRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          baseColor: 0xffb347,
          backgroundColor: 0x133020,
          amplitudeFactor: 1.8,
          size: 1.6,
        });
      } catch {
        // If scripts fail to load, keep the regular card background.
      }
    };

    initVanta();
    return () => {
      cancelled = true;
      if (vantaEffectRef.current?.destroy) {
        vantaEffectRef.current.destroy();
        vantaEffectRef.current = null;
      }
    };
  }, []);

  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, [now]);

  const todayLabel = useMemo(
    () => now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    [now]
  );

  const calendarLabel = useMemo(
    () => now.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    [now]
  );

  const firstWeekday = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 1).getDay(), [now]);
  const daysInMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(), [now]);
  const todayDay = now.getDate();

  const calendarCells = useMemo(() => {
    return Array.from({ length: 42 }, (_, idx) => {
      const day = idx - firstWeekday + 1;
      return day >= 1 && day <= daysInMonth ? day : null;
    });
  }, [firstWeekday, daysInMonth]);

  const studiedDays = useMemo(() => {
    const activeDays = new Set<number>();
    const start = Math.max(1, todayDay - 16);
    for (let day = start; day <= Math.min(todayDay, daysInMonth); day += 1) {
      const weekday = new Date(now.getFullYear(), now.getMonth(), day).getDay();
      if (weekday === 1 || weekday === 3 || weekday === 5) activeDays.add(day);
    }
    activeDays.delete(todayDay);
    return activeDays;
  }, [now, todayDay, daysInMonth]);

  const activities = [
    { tag: "98%", title: "Quiz Score: React Hooks", sub: "27 Feb, 2026",         hot: true  },
    { tag: "×2",  title: "Productivity Streak",     sub: "Increased task limits", hot: false },
    { tag: "+2%", title: "Optimization Bonus",       sub: "Code quality improved", hot: false },
  ];

  const modules = [
    { label: "React Hooks",      done: true  },
    { label: "Context API",      done: true  },
    { label: "Performance",      done: true  },
    { label: "Custom Hooks",     done: false },
    { label: "Testing Patterns", done: false },
  ];

  return (
    <main className="min-h-screen bg-brand-paper dark:bg-brand-dark text-[#0f1215] dark:text-white">

      {/* -- outer padding -- */}
      <div className="max-w-[1480px] mx-auto px-5 lg:px-8 pt-16 md:pt-20 pb-6">

        {/* ------------------------------------------
            TOP BAR
        ------------------------------------------ */}
        <motion.div
          variants={STAGGER} initial="initial" animate="animate"
          className="flex items-center justify-between mb-5"
        >
          <motion.div variants={FADE}>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#9ca3af] dark:text-white/30 mb-0.5">
              {greeting} - {todayLabel}
            </p>
            <h1 className="text-xl font-black tracking-tight text-[#0f1215] dark:text-white">
              {name}
            </h1>
          </motion.div>

          <motion.div variants={FADE}
            className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5
                       bg-white dark:bg-[#0a3a2d]/70
                       border border-[#046241]/20 dark:border-[#3ea773]/35
                       shadow-[0_6px_18px_rgba(4,98,65,0.12)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_20px_rgba(5,56,41,0.28)]
                       backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-[#FFB347] flex-shrink-0" />
            <span className="text-[12px] font-black uppercase tracking-[0.26em] text-[#046241] dark:text-[#78ecab] leading-none whitespace-nowrap">
              {roleLabel}
            </span>
          </motion.div>
        </motion.div>

        {/* ------------------------------------------
            MAIN GRID  —  3 columns on xl
            [left 236px] [center 1fr] [right 252px]
        ------------------------------------------ */}
        <motion.div
          variants={STAGGER} initial="initial" animate="animate"
          className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-start"
        >

          {/* +------------+
              ¦ LEFT PANEL ¦
              +------------+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3.5 xl:col-span-3">

            {/* Profile card */}
            <motion.div variants={FADE}
              className="group relative rounded-[30px] overflow-hidden bg-[#050607] text-white
                         border border-white/[0.08] shadow-[0_10px_28px_rgba(0,0,0,0.45)]
                         min-h-[460px] sm:min-h-[420px] xl:min-h-[520px]"
            >
              {avatarUrl && (
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  animate={{
                    scale: [1.12, 1.18, 1.12],
                    x: [0, 10, 0],
                    y: [0, -10, 0],
                    rotate: [0, 1.4, 0],
                  }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img
                    src={avatarUrl}
                    alt=""
                    className="w-full h-full object-cover opacity-30"
                    style={{ filter: "blur(18px) saturate(1.05)" }}
                  />
                </motion.div>
              )}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0.52) 100%)",
                }}
              />

              <div className="absolute inset-0 flex items-center justify-center pb-16">
                <div className="w-[118px] h-[118px] rounded-full border border-white/14 bg-[#0f1114] overflow-hidden flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={`${name} profile`} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-14 h-14 text-white/35" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="3.6" strokeWidth="1.8" />
                      <path strokeWidth="1.8" strokeLinecap="round" d="M5.8 18.6c0-3.2 2.8-5.8 6.2-5.8s6.2 2.6 6.2 5.8" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Hover edit profile overlay */}
              <div
                className="absolute inset-0 flex items-center justify-center pb-16
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300
                           bg-black/25 pointer-events-none group-hover:pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-full
                             bg-[#0e1013] border border-white/12 text-white/90
                             px-4 py-2 text-[12px] font-black uppercase tracking-[0.1em]
                             hover:bg-[#14171b] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10-10a2.1 2.1 0 0 0-3-3L5 17v3z" />
                    <path strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M13.5 6.5l4 4" />
                  </svg>
                  Edit Profile
                </button>
              </div>

              <div className="absolute left-4 right-4 bottom-4 rounded-[22px] bg-[#171a1d] border border-white/10 p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#c1ff00] text-[#061006] font-black text-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={`${name} avatar`} className="w-full h-full object-cover" />
                      ) : (
                        initial
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[16px] font-bold leading-tight truncate">{name}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/46 truncate">
                        {role}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    className="w-12 h-12 rounded-full bg-white text-[#0f1215] overflow-hidden flex items-center justify-center
                               hover:scale-105 active:scale-95 transition-transform"
                    aria-label="Edit profile"
                  >
                    {schoolLogo ? (
                      <img
                        src={schoolLogo}
                        alt={`${user?.school || "School"} logo`}
                        className="w-full h-full object-contain p-1.5"
                      />
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10-10a2.1 2.1 0 0 0-3-3L5 17v3z" />
                        <path strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M13.5 6.5l4 4" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* — Modules card — */}
            <motion.div variants={FADE}
              className="rounded-[20px] bg-white dark:bg-[#0e1210]
                         border border-black/[0.07] dark:border-white/[0.07] p-5
                         shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-none"
            >
              {/* header */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#9ca3af] dark:text-white/28">
                  Modules
                </p>
                <span className="text-[10px] font-black text-[#9ca3af] dark:text-white/28">3 / 5</span>
              </div>

              {/* overall progress bar */}
              <div className="h-1 rounded-full bg-black/[0.07] dark:bg-white/[0.07] overflow-hidden mb-4">
                <motion.div className="h-full rounded-full bg-[#c1ff00]"
                  initial={{ width: 0 }} animate={{ width: "60%" }}
                  transition={{ duration: 1, delay: 0.55, ease: EASE }}
                />
              </div>

              {/* list */}
              <div className="flex flex-col gap-1.5">
                {modules.map((m, i) => (
                  <motion.div key={m.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.32 + i * 0.06, duration: 0.4, ease: EASE }}
                    className="flex items-center gap-2.5"
                  >
                    {/* checkbox */}
                    <div className={`w-[18px] h-[18px] rounded-[5px] flex-shrink-0
                      flex items-center justify-center
                      ${m.done
                        ? "bg-[#c1ff00]"
                        : "bg-black/[0.05] dark:bg-white/[0.06] border border-black/[0.1] dark:border-white/[0.1]"
                      }`}
                    >
                      {m.done && (
                        <svg className="w-2.5 h-2.5 text-[#051007]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-[12px] font-medium leading-none truncate
                      ${m.done
                        ? "text-[#111827] dark:text-white/80"
                        : "text-[#9ca3af] dark:text-white/28"
                      }`}
                    >
                      {m.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pt-3.5 border-t border-black/[0.06] dark:border-white/[0.06]">
                <p className="text-[10px] text-[#9ca3af] dark:text-white/25">
                  Module 12 of 24
                </p>
              </div>
            </motion.div>
          </div>

          {/* +---------------+
              ¦ CENTER COLUMN ¦
              +---------------+ */}
          <div className="flex flex-col gap-3.5 xl:col-span-7">

            {/* — Hero learning card — */}
            <motion.div variants={FADE}
              className="relative rounded-[20px] bg-[#07090c] text-white
                         border border-white/[0.07]
                         shadow-[0_4px_20px_rgba(0,0,0,0.28)]
                         overflow-hidden min-h-[420px] md:min-h-[460px] flex flex-col"
            >
              <div ref={learningCardRef} className="absolute inset-0" aria-hidden="true" />
              <div className="absolute inset-0 bg-[#07090c]/35 pointer-events-none" />
              {/* top section */}
              <div className="px-8 py-8 relative z-10 overflow-hidden flex-1 flex items-center">
                {/* background accent */}
                <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(193,255,0,0.09) 0%, transparent 70%)" }}
                />
                <div className="relative w-full">
                  <p className="absolute -top-5 left-0 text-[10px] font-black uppercase tracking-[0.28em] text-white/30">
                    Currently Learning
                  </p>
                  <h2 className="text-[28px] md:text-[36px] font-black leading-[1.04]
                                 tracking-[-0.02em] mb-6 max-w-[700px]">
                    <span>
                      Mastering <span className="text-[#c1ff00]">React Patterns</span>
                    </span>
                    <br />
                    <span>&amp; Architecture</span>
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      className="inline-flex items-center gap-2 rounded-full
                                 bg-[#c1ff00] text-[#071007]
                                 px-6 py-3 text-[12px] font-black uppercase tracking-[0.12em]
                                 shadow-[0_4px_16px_rgba(193,255,0,0.28)]"
                    >
                      Continue Lesson
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                      </svg>
                    </motion.button>
                    <span className="text-[13px] text-white/38 whitespace-nowrap">Module 12 of 24</span>
                  </div>
                </div>
              </div>

              {/* stats strip */}
              <div className="relative z-10 grid grid-cols-3 border-t border-white/[0.07] mt-auto">
                {/* completion */}
                <div className="flex items-center gap-3 px-7 py-6 border-r border-white/[0.07]">
                  <div className="relative flex-shrink-0" style={{ width: 58, height: 58 }}>
                    <ArcRing pct={82} size={58} />
                    <span className="absolute inset-0 flex items-center justify-center
                                     text-[10px] font-black text-white">
                      <Count to={82} suffix="%" delay={520} />
                    </span>
                  </div>
                  <div>
                    <p className="text-[18px] font-black leading-none text-white">82%</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/28 mt-1">
                      Completion
                    </p>
                  </div>
                </div>

                {/* time */}
                <div className="flex flex-col justify-center px-7 py-6 border-r border-white/[0.07]">
                  <p className="text-[32px] font-black leading-none">
                    <Count to={14} suffix="h" delay={440} />
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/28 mt-1.5">
                    Time Spent
                  </p>
                </div>

                {/* grade */}
                <div className="flex flex-col justify-center px-7 py-6">
                  <p className="text-[32px] font-black leading-none text-[#c1ff00]">A+</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/28 mt-1.5">
                    Avg Grade
                  </p>
                </div>
              </div>
            </motion.div>

            {/* — Activity card — */}
            <motion.div variants={FADE}
              className="rounded-[20px] bg-white dark:bg-[#0e1210]
                         border border-black/[0.07] dark:border-white/[0.07] p-5
                         shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-none"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[15px] font-black text-[#0f1215] dark:text-white">Activity</h3>
                  <p className="text-[11px] text-[#9ca3af] dark:text-white/30 mt-0.5">Recent updates</p>
                </div>
                <button className="text-[10px] font-black uppercase tracking-[0.18em]
                                   text-[#c1ff00] hover:opacity-60 transition-opacity">
                  View all
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {activities.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.26 + i * 0.08, duration: 0.42, ease: EASE }}
                    whileHover={{ x: 3, transition: { duration: 0.16 } }}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-[14px] cursor-default
                      ${item.hot
                        ? "bg-[#07090c]"
                        : "bg-[#f4f5f7] dark:bg-white/[0.04]"
                      }`}
                  >
                    {/* tag chip */}
                    <span className={`w-10 h-10 rounded-xl flex-shrink-0
                      flex items-center justify-center font-black text-[12px]
                      ${item.hot
                        ? "bg-[#c1ff00] text-[#061006]"
                        : "bg-white dark:bg-white/8 text-[#0f1215] dark:text-white border border-black/[0.08] dark:border-white/[0.08]"
                      }`}
                    >
                      {item.tag}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-bold truncate
                        ${item.hot ? "text-white" : "text-[#111827] dark:text-white/85"}`}>
                        {item.title}
                      </p>
                      <p className={`text-[11px] mt-0.5
                        ${item.hot ? "text-white/35" : "text-[#9ca3af] dark:text-white/30"}`}>
                        {item.sub}
                      </p>
                    </div>

                    {item.hot && (
                      <span className="flex-shrink-0 text-[9px] font-black uppercase tracking-[0.14em]
                                       text-[#c1ff00] bg-[#c1ff00]/10 border border-[#c1ff00]/20
                                       px-2 py-1 rounded-full">
                        Latest
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* +-------------+
              ¦ RIGHT PANEL ¦
              +-------------+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3.5 xl:col-span-2">

            {/* — Efficiency — */}
            <motion.div variants={FADE}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="rounded-[20px] bg-[#c1ff00] text-[#051007] p-5 cursor-default
                         border border-[#addc00]
                         shadow-[0_4px_18px_rgba(193,255,0,0.20)]"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-black uppercase tracking-[0.24em] opacity-50">Efficiency</p>
                <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                  </svg>
                </div>
              </div>
              <p className="text-[42px] font-black leading-none">
                <Count to={98} suffix="%" delay={360} />
              </p>
              <p className="text-[10px] opacity-45 mt-1.5 font-semibold">Top of cohort</p>
            </motion.div>

            {/* — Level — */}
            <motion.div variants={FADE}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="rounded-[20px] bg-[#07090c] text-white p-5 cursor-default
                         border border-white/[0.07]
                         shadow-[0_4px_18px_rgba(0,0,0,0.24)]"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/30">Level</p>
                <div className="w-6 h-6 rounded-full border border-white/12
                               flex items-center justify-center text-white/35">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2"
                      d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-3.866 0-7 2.239-7 5v1h14v-1c0-2.761-3.134-5-7-5z" />
                  </svg>
                </div>
              </div>
              <p className="text-[42px] font-black leading-none text-[#c1ff00]">
                <Count to={4} delay={300} />
              </p>
              <p className="text-[10px] text-white/25 mt-1.5 font-medium">Senior Intern</p>
            </motion.div>

            {/* — Calendar — */}
            <motion.div variants={FADE}
              className="rounded-[20px] bg-[#07090c] text-white
                         border border-white/[0.07] p-4
                         shadow-[0_4px_18px_rgba(0,0,0,0.22)] sm:col-span-2 xl:col-span-1"
            >
              {/* header */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/38">
                  {calendarLabel}
                </p>
                <button className="w-5 h-5 rounded-full border border-white/12 flex items-center justify-center
                                   text-white/30 hover:text-white/60 hover:border-white/25 transition-colors">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* day labels */}
              <div className="grid grid-cols-7 text-center mb-1">
                {["S","M","T","W","T","F","S"].map((d, i) => (
                  <span key={i} className="text-[#c1ff00] text-[9px] font-black opacity-60">{d}</span>
                ))}
              </div>

              {/* cells */}
              <div className="grid grid-cols-7 gap-y-0.5">
                {calendarCells.map((day, idx) => (
                  <span key={`${day ?? "empty"}-${idx}`}
                    className={`h-7 inline-flex items-center justify-center rounded-lg
                      text-[11px] font-medium select-none transition-colors
                      ${day === todayDay
                        ? "bg-[#c1ff00] text-[#051007] font-black"
                        : day && studiedDays.has(day)
                          ? "bg-white/10 text-white/60"
                          : day
                            ? "text-white/22 hover:bg-white/[0.05] hover:text-white/45 cursor-default"
                            : ""
                      }`}
                  >
                    {day ?? ""}
                  </span>
                ))}
              </div>

              {/* legend */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/[0.07]">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/25">
                  <i className="w-1.5 h-1.5 rounded-full bg-[#c1ff00] inline-block" />Today
                </span>
                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/25">
                  <i className="w-1.5 h-1.5 rounded-full bg-white/30 inline-block" />Studied
                </span>
              </div>
            </motion.div>

            {/* — Weekly Goals — */}
            <motion.div variants={FADE}
              className="rounded-[20px] bg-white dark:bg-[#0e1210]
                         border border-black/[0.07] dark:border-white/[0.07] p-4
                         shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-none sm:col-span-2 xl:col-span-1"
            >
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <h4 className="text-[14px] font-black text-[#0f1215] dark:text-white">Weekly Goals</h4>
                  <p className="text-[11px] text-[#9ca3af] dark:text-white/28 mt-0.5">4 remaining</p>
                </div>
                <motion.button
                  whileHover={{ x: 2, transition: { duration: 0.15 } }}
                  className="w-7 h-7 rounded-full border border-black/[0.09] dark:border-white/[0.09]
                             flex items-center justify-center text-[#9ca3af] dark:text-white/28"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>

              {/* segments */}
              <div className="flex gap-1">
                {Array.from({ length: 7 }, (_, i) => (
                  <motion.div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full
                      ${i < 3 ? "bg-[#c1ff00]" : "bg-black/[0.08] dark:bg-white/[0.08]"}`}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.35 + i * 0.05, duration: 0.36, ease: EASE }}
                  />
                ))}
              </div>
              <p className="text-[10px] text-[#9ca3af] dark:text-white/25 mt-2">3 of 7 completed</p>
            </motion.div>

          </div>{/* /right */}
        </motion.div>

        <AnimatePresence>
          {isEditOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-black/65 backdrop-blur-sm px-4 py-8 md:p-10 flex items-center justify-center"
              onClick={() => setIsEditOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.98 }}
                transition={{ duration: 0.26, ease: EASE }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[980px] rounded-[28px] border border-white/10 bg-[#07090c] text-white p-5 md:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-[34px] md:text-[42px] font-black leading-[0.95]">Edit Profile</h2>
                    <p className="text-[13px] text-white/50 mt-1">Update your personal details</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="w-10 h-10 rounded-full bg-white/8 border border-white/10 text-white/70 hover:text-white hover:bg-white/14 transition-colors"
                    aria-label="Close edit profile"
                  >
                    ?
                  </button>
                </div>

                <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-[190px_minmax(0,1fr)] items-start gap-6 lg:gap-10">
                  <div className="flex lg:flex-col items-center lg:items-start gap-4 lg:gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-[120px] h-[120px] rounded-full bg-white/8 border border-white/20 flex items-center justify-center hover:border-[#c1ff00]/70 transition-colors"
                      aria-label="Change profile photo"
                    >
                      {avatarDraft ? (
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                          <img src={avatarDraft} alt="Profile preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <svg className="w-12 h-12 text-white/52" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="8" r="3.3" strokeWidth="1.8" />
                          <path strokeWidth="1.8" strokeLinecap="round" d="M6.3 18c0-3 2.5-5.4 5.7-5.4s5.7 2.4 5.7 5.4" />
                        </svg>
                      )}
                      <span className="absolute -right-1 -bottom-1 z-10 w-9 h-9 rounded-full bg-[#c1ff00] text-[#071007] flex items-center justify-center border-[3px] border-[#07090c]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l9.8-9.8a2 2 0 1 0-2.8-2.8L5 17v3z" />
                          <path strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M13.2 6.8l4 4" />
                        </svg>
                      </span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarPick}
                    />
                    <p className="text-[12px] text-white/75">Tap to change</p>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/45 mb-2">First Name</label>
                        <input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First name"
                          className="w-full h-12 rounded-xl bg-[#151a1f] border border-white/20 px-4 text-white placeholder:text-white/55 outline-none focus:border-[#c1ff00] focus:ring-2 focus:ring-[#c1ff00]/30 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/45 mb-2">Last Name</label>
                        <input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last name"
                          className="w-full h-12 rounded-xl bg-[#151a1f] border border-white/20 px-4 text-white placeholder:text-white/55 outline-none focus:border-[#c1ff00] focus:ring-2 focus:ring-[#c1ff00]/30 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/45 mb-2">Gmail / Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full h-12 rounded-xl bg-[#151a1f] border border-white/20 px-4 text-white placeholder:text-white/55 outline-none focus:border-[#c1ff00] focus:ring-2 focus:ring-[#c1ff00]/30 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/45 mb-2">Phone Number</label>
                      <div className="flex">
                        <span
                          className="inline-flex items-center h-12 px-4 rounded-l-xl border border-r-0 border-white/20 bg-[#1b2229] text-white/90 font-semibold"
                          aria-hidden="true"
                        >
                          +63
                        </span>
                        <input
                          value={phone}
                          onChange={(e) => setPhone(formatPhoneLocal(e.target.value))}
                          placeholder="XXX XXX XXXX"
                          inputMode="numeric"
                          maxLength={12}
                          className="flex-1 h-12 rounded-r-xl rounded-l-none bg-[#151a1f] border border-white/20 px-4 text-white placeholder:text-white/55 outline-none focus:border-[#c1ff00] focus:ring-2 focus:ring-[#c1ff00]/30 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/45 mb-2">School / University</label>
                      <select
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        className="w-full h-12 rounded-xl bg-[#151a1f] border border-white/20 px-4 pr-11 text-white outline-none focus:border-[#c1ff00] focus:ring-2 focus:ring-[#c1ff00]/30 transition-colors appearance-none"
                        style={{ colorScheme: "dark" }}
                      >
                        {SCHOOL_OPTIONS.map((opt) => (
                          <option
                            key={opt}
                            value={opt}
                            className="bg-[#11161d] text-white"
                            style={{ backgroundColor: "#11161d", color: "#ffffff" }}
                          >
                            {opt}
                          </option>
                        ))}
                      </select>
                      <svg
                        aria-hidden="true"
                        className="pointer-events-none absolute right-4 bottom-[14px] w-4 h-4 text-white/75"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#c1ff00] text-[#071007]
                                   px-6 py-3 text-[15px] font-black hover:scale-[1.02] active:scale-[0.99]
                                   transition-transform shadow-[0_8px_22px_rgba(193,255,0,0.32)]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" d="M5 12l4 4L19 6" />
                        </svg>
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}





