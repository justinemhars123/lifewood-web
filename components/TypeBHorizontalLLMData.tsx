import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  useInView,
  animate,
} from "framer-motion";
import type { MotionValue } from "framer-motion";

// ─── Data ──────────────────────────────────────────────────────────────────
const BLOCKS = [
  {
    num: "01",
    label: "TARGET",
    title: "Target",
    tag: "Collection",
    body: "Capture and transcribe recordings from native speakers from 23 different countries (Netherlands, Spain, Norway, France, Germany, Poland, Russia, Italy, Japan, South Korea, Mexico, UAE, Saudi Arabia, Egypt, etc.). Voice content involves 6 project types and 9 data domains. A total of 25,400 valid hours durations.",
    features: ["23 Countries", "6 Project Types", "9 Data Domains", "25,400 Valid Hours"],
  },
  {
    num: "02",
    label: "SOLUTIONS",
    title: "Solutions",
    tag: "Technology",
    body: "30,000+ native speaking human resources from more than 30 countries were mobilized. Use our flexible industrial processes and continuously optimize them. Use PBI to track the progress of daily collection and transcription in real time, analyze and improve the results in real time.",
    features: ["30,000+ Native Speakers", "30+ Countries", "PBI Real-Time Tracking", "Continuous Optimization"],
  },
  {
    num: "03",
    label: "RESULTS",
    title: "Results",
    tag: "Outcomes",
    body: "5 months to complete the voice collection and annotation of 25,400 valid hours on time and with quality.",
    features: ["25,400 Valid Hours", "5-Month Delivery", "On-Time & Quality", "LLM-Ready Output"],
  },
];

const SLIDE_IMAGES = [
  "https://framerusercontent.com/images/2GAiSbiawE1R7sXuFDwNLfEovRM.jpg?width=711&height=400",
  "https://framerusercontent.com/images/AtSZKyVin3X5lENphObnH6Puw.jpg?lossless=1&width=612&height=408",
  "https://framerusercontent.com/images/prEubFztlVx6VnuokfOrkAs.jpg?width=612&height=353",
];

// ─── Pipeline steps (TypeB content) ───────────────────────────────────────
const PIPELINE_STEPS = [
  {
    label: "Native speaker recruitment",
    sub: "23 countries · 30,000+ speakers",
    accent: true,
    icon: (active: boolean) => (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6" r="3" fill="none"
          stroke={active ? "white" : "#046241"} strokeWidth="1.3" />
        <path d="M3 15c0-3.31 2.69-6 6-6s6 2.69 6 6"
          stroke={active ? "white" : "#046241"} strokeWidth="1.3"
          strokeLinecap="round" fill="none" />
        <circle cx="14.5" cy="5" r="2" fill="none"
          stroke={active ? "white" : "#046241"} strokeWidth="1" opacity="0.6" />
        <path d="M17 10.5c0-1.38-1.12-2.5-2.5-2.5"
          stroke={active ? "white" : "#046241"} strokeWidth="1"
          strokeLinecap="round" fill="none" opacity="0.6" />
      </svg>
    ),
  },
  {
    label: "Voice recording & capture",
    sub: "6 project types · 9 data domains",
    accent: false,
    icon: (_active: boolean) => (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <rect x="6.5" y="2" width="5" height="8" rx="2.5" fill="none"
          stroke="#046241" strokeWidth="1.3" />
        <path d="M3 9.5a6 6 0 0 0 12 0"
          stroke="#046241" strokeWidth="1.3" strokeLinecap="round" fill="none" />
        <line x1="9" y1="15.5" x2="9" y2="17"
          stroke="#046241" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="6.5" y1="17" x2="11.5" y2="17"
          stroke="#046241" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Transcription & annotation",
    sub: "Labeling · Multi-language · Formatting",
    accent: false,
    icon: (_active: boolean) => (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="14" height="14" rx="2" fill="none"
          stroke="#046241" strokeWidth="1.2" />
        <line x1="5" y1="6" x2="13" y2="6"
          stroke="#046241" strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
        <line x1="5" y1="9" x2="13" y2="9"
          stroke="#046241" strokeWidth="1.1" strokeLinecap="round" />
        <line x1="5" y1="12" x2="9" y2="12"
          stroke="#046241" strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
        <circle cx="13" cy="12" r="2" fill="none"
          stroke="#046241" strokeWidth="1" />
        <path d="M12.3 11.8l.5.6.8-.9"
          stroke="#046241" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "PBI real-time tracking",
    sub: "Daily progress · Quality analysis",
    accent: false,
    icon: (_active: boolean) => (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="14" height="14" rx="2" fill="none"
          stroke="#046241" strokeWidth="1.2" />
        <path d="M5 13V10M8 13V8M11 13V6M14 13V4"
          stroke="#046241" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M5 10l3-2 3-2 3-2"
          stroke="#046241" strokeWidth="0.9" strokeLinecap="round"
          strokeLinejoin="round" strokeDasharray="1 1" opacity="0.5" />
      </svg>
    ),
  },
  {
    label: "LLM-ready dataset output",
    sub: null,
    accent: true,
    icon: (active: boolean) => (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <ellipse cx="9" cy="5.5" rx="6" ry="2.2" fill="none"
          stroke={active ? "white" : "#046241"} strokeWidth="1.2" />
        <path d="M3 5.5v4c0 1.22 2.69 2.2 6 2.2s6-.98 6-2.2v-4"
          stroke={active ? "white" : "#046241"} strokeWidth="1.2" />
        <path d="M3 9.5v3c0 1.22 2.69 2.2 6 2.2s6-.98 6-2.2v-3"
          stroke={active ? "white" : "#046241"} strokeWidth="1.2" opacity="0.55" />
        <path d="M6.5 5.2l1.2 1.2L11 4"
          stroke={active ? "white" : "#046241"} strokeWidth="1.1"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      </svg>
    ),
  },
];

const STATS = [
  { value: "25,400", label: "Valid Hours" },
  { value: "30K+", label: "Speakers" },
  { value: "5mo", label: "Delivery" },
];

// ─── Pipeline loop hook ───────────────────────────────────────────────────
const STEP_DURATION = 900;
const PAUSE_LAST = 1400;
const RESET_PAUSE = 450;

function usePipelineLoop(totalSteps: number) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [litConnectors, setLitConnectors] = useState<number[]>([]);
  const [statsLit, setStatsLit] = useState(false);
  const [connectorKey, setConnectorKey] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const push = useCallback((fn: () => void, delay: number) => {
    timersRef.current.push(setTimeout(fn, delay));
  }, []);

  const runStep = useCallback(
    (stepIdx: number) => {
      clearTimers();
      setActiveStep(stepIdx);
      setStatsLit(false);
      setLitConnectors(Array.from({ length: stepIdx }, (_, i) => i));
      if (stepIdx > 0) setConnectorKey((k) => k + 1);
      if (stepIdx === totalSteps - 1) push(() => setStatsLit(true), 300);

      const delay = stepIdx === totalSteps - 1 ? STEP_DURATION + PAUSE_LAST : STEP_DURATION;
      push(() => {
        const next = (stepIdx + 1) % totalSteps;
        if (next === 0) {
          setActiveStep(-1);
          setLitConnectors([]);
          setStatsLit(false);
          push(() => runStep(0), RESET_PAUSE);
        } else {
          runStep(next);
        }
      }, delay);
    },
    [clearTimers, push, totalSteps]
  );

  useEffect(() => {
    const t = setTimeout(() => runStep(0), 600);
    return () => { clearTimeout(t); clearTimers(); };
  }, [runStep, clearTimers]);

  return { activeStep, litConnectors, statsLit, connectorKey };
}

// ─── Animated pipeline connector ─────────────────────────────────────────
function PipelineConnector({
  delay,
  lit,
  animKey,
}: {
  delay: number;
  lit: boolean;
  animKey: number;
}) {
  return (
    <div className="relative flex justify-center" style={{ height: 18 }}>
      <motion.div
        className="absolute top-0 bottom-0"
        style={{ width: 1, originY: 0 }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="w-full h-full"
          animate={{ backgroundColor: lit ? "rgba(4,98,65,0.7)" : "rgba(4,98,65,0.22)" }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      {lit && (
        <motion.div
          key={animKey}
          className="absolute rounded-full bg-[#046241] dark:bg-[#FFB347]"
          style={{
            width: 5, height: 5,
            left: "calc(50% - 2.5px)",
            boxShadow: "0 0 5px 2px rgba(4,98,65,0.5)",
          }}
          initial={{ top: -4, opacity: 0 }}
          animate={{ top: 20, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.4, ease: "easeInOut", times: [0, 0.1, 0.85, 1] }}
        />
      )}
      {!lit && (
        <motion.div
          className="absolute w-[5px] h-[5px] rounded-full bg-[#046241] dark:bg-[#FFB347]"
          style={{ left: "calc(50% - 2.5px)" }}
          animate={{ top: ["-4px", "20px"], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 1.0, delay: delay + 0.5,
            repeat: Infinity, repeatDelay: 2.4,
            ease: "easeInOut", times: [0, 0.08, 0.92, 1],
          }}
        />
      )}
    </div>
  );
}

// ─── Dot-grid background ──────────────────────────────────────────────────
function DotGrid() {
  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, delay: 0.35 }}
    >
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dotgrid-b" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(4,98,65,0.13)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid-b)" />
      </svg>
      <motion.div
        className="absolute inset-y-0 w-20 pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(4,98,65,0.07), transparent)" }}
        animate={{ x: ["-120px", "140%"] }}
        transition={{ duration: 5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

// ─── Pipeline diagram ─────────────────────────────────────────────────────
function PipelineDiagram() {
  const { activeStep, litConnectors, statsLit, connectorKey } =
    usePipelineLoop(PIPELINE_STEPS.length);

  const progressPct =
    activeStep < 0 ? 0 : ((activeStep + 1) / PIPELINE_STEPS.length) * 100;

  return (
    <div className="flex flex-col flex-1">
      {/* Progress bar */}
      <div
        className="relative h-0.5 rounded-full mb-3 overflow-hidden"
        style={{ background: "rgba(4,98,65,0.15)" }}
      >
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-[#046241] dark:bg-[#FFB347]"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ boxShadow: "0 0 6px rgba(4,98,65,0.5)" }}
        />
      </div>

      {PIPELINE_STEPS.map((step, i) => {
        const isActive = activeStep === i;
        const isPast = activeStep > i;
        const isLit = isActive || isPast;

        return (
          <React.Fragment key={i}>
            <motion.div
              initial={{ opacity: 0, x: 20, filter: "blur(6px)" }}
              animate={{
                opacity: 1,
                x: isActive ? 4 : 0,
                filter: "blur(0px)",
                scale: isActive ? 1.012 : 1,
              }}
              transition={{
                opacity: { delay: 0.1 + i * 0.11, duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                x: { type: "spring", stiffness: 300, damping: 28 },
                scale: { type: "spring", stiffness: 300, damping: 28 },
                filter: { delay: 0.1 + i * 0.11, duration: 0.55, ease: [0.16, 1, 0.3, 1] },
              }}
              className={[
                "rounded-xl px-3 py-2 flex flex-col select-none cursor-default relative overflow-hidden",
                "transition-[border-color,background-color,box-shadow] duration-300",
                step.accent
                  ? isActive
                    ? "bg-[#046241] border border-white/20 shadow-[0_0_0_3px_rgba(4,98,65,0.25),0_4px_20px_rgba(4,98,65,0.4)]"
                    : "bg-[#046241]"
                  : isLit
                    ? "bg-[#edfbf4] dark:bg-[#0d2e1f] border border-[#046241] dark:border-[#FFB347]/50 shadow-[0_0_0_3px_rgba(4,98,65,0.1),0_4px_16px_rgba(4,98,65,0.15)]"
                    : "bg-white dark:bg-white/5 border border-[#dce6e0] dark:border-white/10",
              ].join(" ")}
            >
              {/* Shimmer sweep */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    key={`shimmer-${i}-${activeStep}`}
                    className="absolute inset-y-0 pointer-events-none"
                    style={{
                      width: "55%",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)",
                    }}
                    initial={{ left: "-60%" }}
                    animate={{ left: "140%" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                  />
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2">
                {/* Step number */}
                <span className={[
                  "text-[10px] font-black tabular-nums shrink-0 transition-colors duration-300",
                  step.accent
                    ? "text-white/45"
                    : isLit
                      ? "text-[#046241] dark:text-[#FFB347]"
                      : "text-[#046241]/50 dark:text-[#FFB347]/50",
                ].join(" ")}>
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Icon */}
                <motion.div
                  className={[
                    "flex items-center justify-center rounded-md transition-all duration-300",
                    step.accent
                      ? isActive ? "bg-white/25" : "bg-white/15"
                      : isLit
                        ? "bg-[#046241]/12 dark:bg-[#FFB347]/10"
                        : "bg-[#e8f5ef] dark:bg-white/5",
                  ].join(" ")}
                  style={{ width: 26, height: 26 }}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                >
                  {step.icon(step.accent || isLit)}
                </motion.div>

                {/* Label */}
                <span className={[
                  "text-[11.5px] font-bold leading-tight transition-colors duration-300",
                  step.accent
                    ? "text-white"
                    : isLit
                      ? "text-[#046241] dark:text-[#FFB347]"
                      : "text-[#0f2318] dark:text-white",
                ].join(" ")}>
                  {step.label}
                </span>

                {/* Live pulse on last step */}
                {i === PIPELINE_STEPS.length - 1 && (
                  <motion.span
                    className={[
                      "ml-auto w-2 h-2 rounded-full shrink-0 transition-colors duration-300",
                      isActive ? "bg-white shadow-[0_0_6px_3px_rgba(255,255,255,0.4)]" : "bg-white/55",
                    ].join(" ")}
                    animate={{ scale: [1, 1.7, 1], opacity: [0.55, 1, 0.55] }}
                    transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </div>

              {step.sub && (
                <span className={[
                  "text-[10px] leading-tight mt-0.5 ml-[22px] transition-colors duration-300",
                  step.accent
                    ? "text-white/50"
                    : isLit
                      ? "text-[#046241]/70 dark:text-[#FFB347]/60"
                      : "text-[#1a3326]/45 dark:text-white/35",
                ].join(" ")}>
                  {step.sub}
                </span>
              )}
            </motion.div>

            {i < PIPELINE_STEPS.length - 1 && (
              <PipelineConnector
                delay={0.12 + i * 0.1}
                lit={litConnectors.includes(i)}
                animKey={litConnectors.includes(i) ? connectorKey : 0}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1, y: 0,
              ...(statsLit
                ? { borderColor: "rgba(4,98,65,0.6)", backgroundColor: "#edfbf4", boxShadow: "0 0 0 3px rgba(4,98,65,0.1)" }
                : { borderColor: "rgba(220,230,224,1)", backgroundColor: "white", boxShadow: "none" }
              ),
            }}
            transition={{
              opacity: { delay: 0.72 + i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
              y: { delay: 0.72 + i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
              borderColor: { delay: i * 0.08, duration: 0.35 },
              backgroundColor: { delay: i * 0.08, duration: 0.35 },
              boxShadow: { delay: i * 0.08, duration: 0.35 },
            }}
            className="border rounded-xl py-2 text-center dark:bg-white/5 dark:border-white/10"
          >
            <div className="text-[13px] font-black text-[#046241] dark:text-[#FFB347] leading-tight tabular-nums">
              {s.value}
            </div>
            <div className="text-[9px] text-[#1a3326]/40 dark:text-white/35 mt-0.5">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Word-reveal heading ──────────────────────────────────────────────────
function SplitReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const words = text.split(" ");
  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "105%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : {}}
            transition={{ duration: 0.62, delay: delay + i * 0.045, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}{i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ─── Magnetic link ────────────────────────────────────────────────────────
function MagneticLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 340, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 340, damping: 22, mass: 0.6 });
  const move = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.38);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.38);
  };
  const leave = () => { x.set(0); y.set(0); };
  return (
    <motion.a ref={ref} href={href} className={className} style={{ x: sx, y: sy }}
      onMouseMove={move} onMouseLeave={leave}
      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}>
      {children}
    </motion.a>
  );
}

// ─── Hero card ────────────────────────────────────────────────────────────
function HeroCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-3xl overflow-hidden
                 border border-[#dde8e2] dark:border-white/10
                 bg-white dark:bg-[#0d2018]
                 shadow-[0_12px_56px_rgba(4,98,65,0.10)] dark:shadow-[0_12px_56px_rgba(0,0,0,0.5)]
                 grid grid-cols-1 md:grid-cols-2 min-h-[400px] relative"
    >
      {/* Top shimmer */}
      <motion.div aria-hidden className="absolute top-0 left-0 right-0 h-px z-10"
        style={{ background: "linear-gradient(90deg, transparent, rgba(4,98,65,0.4), transparent)" }}
        initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* ── Left panel ── */}
      <div className="p-10 flex flex-col justify-between relative z-10
                      border-b md:border-b-0 md:border-r border-[#dde8e2] dark:border-white/10">
        <div>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5
                       bg-[#046241]/8 dark:bg-[#046241]/15
                       border border-[#046241]/12 dark:border-[#046241]/25"
          >
            <motion.span className="w-1.5 h-1.5 rounded-full bg-[#046241] dark:bg-[#FFB347]"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }} />
            <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#046241] dark:text-[#FFB347]">
              Type B — Horizontal LLM Data
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-[44px] font-black leading-tight mb-5 text-[#0f2318] dark:text-white">
            <SplitReveal text="Type B —" delay={0.22} />
            <br />
            <span className="text-[#046241] dark:text-[#FFB347]">
              <SplitReveal text="Horizontal LLM Data" delay={0.32} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48, duration: 0.55 }}
            className="text-[13.5px] leading-relaxed text-[#1a3326]/65 dark:text-white/55 max-w-sm"
          >
            Comprehensive AI data solutions that cover the entire spectrum from data
            collection and annotation to model testing. Creating multimodal datasets
            for deep learning, large language models.
          </motion.p>

          {/* Feature tags */}
          <div className="flex flex-wrap gap-2 mt-5">
            {["23 Countries", "30K+ Speakers", "LLM-Ready", "QA Certified"].map((tag, i) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.58 + i * 0.07, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="text-[11px] px-3 py-1 rounded-full
                           border border-[#046241]/15 dark:border-white/10
                           text-[#046241]/80 dark:text-white/50"
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62, duration: 0.45 }} className="mt-8">
          <MagneticLink
            href="/contact"
            className="inline-flex items-center gap-3
                       bg-[#046241] dark:bg-[#FFB347]
                       text-white dark:text-[#0f2318]
                       px-5 py-3 rounded-full text-[11px] font-black uppercase tracking-widest
                       shadow-lg shadow-[#046241]/25 dark:shadow-[#FFB347]/25"
          >
            <span>Contact Us</span>
            <motion.svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" aria-hidden
              animate={{ x: [0, 3, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </MagneticLink>
        </motion.div>
      </div>

      {/* ── Right panel — pipeline ── */}
      <div className="relative p-8 bg-[#f2f7f4] dark:bg-[#091911] flex flex-col overflow-hidden">
        <DotGrid />

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-[10px] font-black uppercase tracking-[0.22em]
                     text-[#0f2318]/35 dark:text-white/30 mb-4 relative z-10"
        >
          Voice data pipeline
        </motion.p>

        <div className="relative z-10 flex flex-col flex-1">
          <PipelineDiagram />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Subtitle text ────────────────────────────────────────────────────────
function SubtitleText() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.5 }}
      className="flex items-stretch my-6 border-b border-[#e2d9c8] dark:border-white/8 pb-7"
    >
      <motion.div
        className="w-1.5 rounded-sm flex-shrink-0 mr-4 bg-gradient-to-b from-[#046241] to-transparent"
        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
        transition={{ delay: 0.65, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
      <div>
        <p className="text-[13px] text-[#1a3326]/70 dark:text-white/55 leading-relaxed mb-1">
          Voice content spans 6 project types and 9 data domains across 23 countries
        </p>
        <p className="text-[13px] text-[#1a3326]/70 dark:text-white/55 leading-relaxed">
          25,400 valid hours of annotated multilingual speech data for large language model training
        </p>
      </div>
    </motion.div>
  );
}

// ─── Data servicing section ───────────────────────────────────────────────
function DataServicingSection() {
  const [desktopActive, setDesktopActive] = useState<number | null>(null);
  const [mobileActive, setMobileActive] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Type B Horizontal LLM Data"
    >
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0f2318]/45 dark:text-white/45 mb-1">
            Service Flow
          </p>
          <h2 className="text-[20px] md:text-[24px] font-black text-[#0f2318] dark:text-white">
            Explore Each Stage
          </h2>
        </div>
        <div className="hidden lg:flex items-center gap-2">
          {BLOCKS.map((block, i) => (
            <motion.button key={block.num} onMouseEnter={() => setDesktopActive(i)}
              onFocus={() => setDesktopActive(i)} className="focus:outline-none" whileTap={{ scale: 0.9 }}>
              <motion.div
                animate={{ width: desktopActive === i ? 30 : 8, opacity: desktopActive === i ? 1 : 0.3 }}
                transition={{ type: "spring", stiffness: 340, damping: 28 }}
                className="h-1.5 rounded-full bg-[#046241] dark:bg-[#FFB347]"
              />
            </motion.button>
          ))}
        </div>
        <div className="hidden md:flex lg:hidden items-center gap-2">
          {BLOCKS.map((block, i) => (
            <motion.button key={block.num} onClick={() => setMobileActive(i)}
              className="focus:outline-none" whileTap={{ scale: 0.9 }}>
              <motion.div
                animate={{ width: mobileActive === i ? 30 : 8, opacity: mobileActive === i ? 1 : 0.3 }}
                transition={{ type: "spring", stiffness: 340, damping: 28 }}
                className="h-1.5 rounded-full bg-[#046241] dark:bg-[#FFB347]"
              />
            </motion.button>
          ))}
        </div>
      </div>

      <div className="hidden lg:flex gap-3 h-[560px]" onMouseLeave={() => setDesktopActive(null)}>
        {BLOCKS.map((block, i) => (
          <ExpandPanelCard key={block.num} block={block} image={SLIDE_IMAGES[i]} index={i}
            isActive={i === desktopActive} onActivate={() => setDesktopActive(i)} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:hidden">
        {BLOCKS.map((block, i) => (
          <MobilePanelCard key={block.num} block={block} image={SLIDE_IMAGES[i]} index={i}
            isActive={i === mobileActive} onActivate={() => setMobileActive(i)} />
        ))}
      </div>
    </motion.section>
  );
}

// ─── Expand panel card (desktop) ─────────────────────────────────────────
type ExpandPanelCardProps = {
  block: (typeof BLOCKS)[number];
  image: string;
  index: number;
  isActive: boolean;
  onActivate: () => void;
};

const ExpandPanelCard: React.FC<ExpandPanelCardProps> = ({ block, image, index, isActive, onActivate }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button type="button"
      onMouseEnter={onActivate} onFocus={onActivate} onClick={onActivate}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      animate={{
        flexGrow: isActive ? 4.8 : 1,
        filter: isActive ? "saturate(1)" : hovered ? "saturate(0.9)" : "saturate(0.72)",
        y: hovered || isActive ? -4 : 0,
      }}
      transition={{ type: "spring", stiffness: 180, damping: 28, mass: 0.9 }}
      className="relative h-full min-w-[88px] flex-[1_1_0%] rounded-2xl overflow-hidden text-left
                 border border-[#dce6e0] dark:border-transparent
                 shadow-[0_16px_42px_rgba(4,98,65,0.13)] dark:shadow-[0_20px_55px_rgba(0,0,0,0.55)]"
      aria-expanded={isActive}
      style={{ willChange: "transform, filter, flex-grow" }}
    >
      <motion.div className="absolute inset-0"
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.28 }}>
        <motion.img src={image} alt={block.title}
          animate={{ scale: isActive ? 1.05 : hovered ? 1.02 : 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full object-cover" />
        <motion.div
          animate={{ opacity: isActive ? 1 : hovered ? 0.92 : 0.82 }}
          transition={{ duration: 0.32 }}
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <AnimatePresence mode="wait" initial={false}>
          {isActive ? (
            <motion.div key="expanded"
              initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 bottom-0 p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70 mb-1">{block.label}</p>
              <h3 className="text-[34px] leading-none font-black text-white tracking-[-0.03em] mb-2">
                {block.num} {block.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-white/80 max-w-[90%] mb-4">{block.body}</p>
              <div className="flex flex-wrap gap-2">
                {block.features.slice(0, 3).map((feature) => (
                  <span key={feature}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold
                               bg-white/10 border border-white/20 text-white/90 backdrop-blur-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="collapsed"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.26 }}
              className="absolute inset-0 p-4 flex flex-col items-center justify-between">
              <span className="mt-1 text-[16px] font-extrabold uppercase tracking-[0.14em] text-white
                                drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                {block.title}
              </span>
              <span className="text-[54px] font-black leading-none tracking-[-0.06em] text-white">
                {block.num}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
};

// ─── Mobile panel card ────────────────────────────────────────────────────
type MobilePanelCardProps = {
  block: (typeof BLOCKS)[number];
  image: string;
  index: number;
  isActive: boolean;
  onActivate: () => void;
};

const MobilePanelCard: React.FC<MobilePanelCardProps> = ({ block, image, index, isActive, onActivate }) => (
  <motion.button type="button" onClick={onActivate}
    className="relative w-full rounded-2xl overflow-hidden text-left
               border border-[#dce6e0] dark:border-transparent"
    animate={{ height: isActive ? 286 : 132 }}
    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    aria-expanded={isActive}>
    <motion.div className="absolute inset-0"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: index * 0.22 }}>
      <img src={image} alt={block.title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15" />
      <div className="relative h-full p-4 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-1">{block.label}</p>
            <h3 className="text-[22px] font-black leading-none text-white">{block.num} {block.title}</h3>
          </div>
          <span className="text-[34px] font-black leading-none text-white tracking-[-0.05em]">{block.num}</span>
        </div>
        <AnimatePresence>
          {isActive && (
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.24 }}
              className="text-[13px] leading-relaxed text-white/85">
              {block.body}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  </motion.button>
);

// ─── Page root ────────────────────────────────────────────────────────────
export default function TypeBPage() {
  return (
    <section className="bg-brand-paper dark:bg-brand-dark transition-colors duration-500 relative overflow-hidden">
      <motion.div aria-hidden className="absolute pointer-events-none"
        style={{
          top: "-10%", left: "-8%", width: 500, height: 500, filter: "blur(60px)",
          background: "radial-gradient(circle, rgba(4,98,65,0.07) 0%, transparent 70%)"
        }}
        animate={{ scale: [1, 1.12, 1], x: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div aria-hidden className="absolute pointer-events-none"
        style={{
          bottom: "5%", right: "-6%", width: 400, height: 400, filter: "blur(50px)",
          background: "radial-gradient(circle, rgba(4,98,65,0.05) 0%, transparent 70%)"
        }}
        animate={{ scale: [1, 1.08, 1], y: [0, -16, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <div className="px-6 md:px-16 pt-20 pb-12 relative">
        <div className="max-w-[1600px] mx-auto">
          <HeroCard />
          <SubtitleText />
          <DataServicingSection />
        </div>
      </div>
    </section>
  );
}