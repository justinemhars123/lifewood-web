import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
  animate,
} from "framer-motion";

// ─── Data ──────────────────────────────────────────────────────────────────
const BLOCKS = [
  {
    num: "01",
    label: "OBJECTIVE",
    title: "Objective",
    tag: "Foundation",
    body: "Scan documents for preservation, extract structured data and organize it into a searchable database — making archives accessible for generations.",
    features: ["Document capture", "Preservation scan", "Database structuring"],
  },
  {
    num: "02",
    label: "KEY FEATURES",
    title: "Key Features",
    tag: "Technology",
    body: "Powered by computer vision and AI — every document is processed with surgical precision before a single byte enters the database.",
    features: [
      "Auto Crop & De-skew",
      "Blur Detection",
      "Foreign Object Detection",
      "AI Data Extraction",
    ],
  },
  {
    num: "03",
    label: "RESULTS",
    title: "Results",
    tag: "Outcomes",
    body: "Validated, production-ready data at scale — multilingual, multi-format, delivered with full quality assurance and AI-ready formatting.",
    features: [
      "Validated accuracy",
      "Multi-language support",
      "AI-structured output",
      "QA certified",
    ],
  },
];

const SLIDE_IMAGES = [
  "https://framerusercontent.com/images/1edPwLJhGXCUhlh38ixQSMOTFA.png?width=1024&height=1024",
  "https://framerusercontent.com/images/m7OC7BU1eSVf04CkU0jmNPRkf8.png?width=1024&height=1024",
  "https://framerusercontent.com/images/iI5MBUQ9ctQdcDHjCLNvD4j4kxc.png?width=1024&height=1024",
];

const PIPELINE_STEPS = [
  {
    label: "Scan for preservation",
    sub: "Document capture · Multi-language",
    accent: true,
    icon: (active: boolean) => (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="2" width="9" height="12" rx="1.5" fill="none"
          stroke={active ? "white" : "#046241"} strokeWidth="1.3" />
        <path d="M6 6h6M6 8.5h6M6 11h4"
          stroke={active ? "white" : "#046241"} strokeWidth="1.1"
          strokeLinecap="round" opacity="0.7" />
        <path d="M10 2v3.5h3.5"
          stroke={active ? "white" : "#046241"} strokeWidth="1.1"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        <path d="M13 8.5l2 2-2 2"
          stroke={active ? "white" : "#046241"} strokeWidth="1.2"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Computer vision QC",
    sub: "Crop · De-skew · Blur detect · Object detect",
    accent: false,
    icon: (_active: boolean) => (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="3" width="12" height="10" rx="1.5" fill="none"
          stroke="#046241" strokeWidth="1.2" />
        <line x1="2" y1="7" x2="14" y2="7"
          stroke="#046241" strokeWidth="0.8" strokeDasharray="1.5 1.5" opacity="0.5" />
        <path d="M5 5l1.4 1.5L9 3.5"
          stroke="#046241" strokeWidth="1.2"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        <circle cx="14.5" cy="12.5" r="2.5" fill="none"
          stroke="#046241" strokeWidth="1.2" />
        <line x1="16.3" y1="14.3" x2="17.5" y2="15.5"
          stroke="#046241" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M13.7 12.1l.6.8.9-1.1"
          stroke="#046241" strokeWidth="1.1"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "AI data extraction",
    sub: "Labeling · Annotation · Formatting",
    accent: false,
    icon: (_active: boolean) => (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="6.5" fill="none"
          stroke="#046241" strokeWidth="1.2" />
        <path d="M6 9c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3"
          stroke="#046241" strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
        <circle cx="9" cy="9" r="1.6" fill="#046241" opacity="0.8" />
        <path d="M4 5.5l1.5 1M14 5.5L12.5 6.5M4 12.5l1.5-1M14 12.5L12.5 11.5"
          stroke="#046241" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
        <path d="M9 2.5V4M9 14v1.5M2.5 9H4M14 9h1.5"
          stroke="#046241" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      </svg>
    ),
  },
  {
    label: "Validation & QA",
    sub: "Accuracy check · Quality assurance",
    accent: false,
    icon: (_active: boolean) => (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M3.5 9.5L7 13l7.5-8"
          stroke="#046241" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="9" r="7" fill="none"
          stroke="#046241" strokeWidth="1.1" opacity="0.35" />
        <path d="M6 4.5C7 3.6 8 3 9 3c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6c0-1.2.35-2.32.96-3.26"
          stroke="#046241" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    label: "Structured database output",
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
          strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      </svg>
    ),
  },
];

const STATS = [
  { value: 98, suffix: "%+", label: "Accuracy" },
  { value: 20, suffix: "+", label: "Languages" },
  { value: 16, suffix: "+", label: "Countries" },
];

// ─── Shared easing ─────────────────────────────────────────────────────────
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// ─── Pipeline loop hook ───────────────────────────────────────────────────
const STEP_DURATION = 900;
const PAUSE_AFTER_LAST = 1400;
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

      // Activate current step
      setActiveStep(stepIdx);
      setStatsLit(false);

      // Light connectors up to current
      setLitConnectors(
        Array.from({ length: stepIdx }, (_, i) => i)
      );

      // Trigger connector dot animation by bumping key when a new connector lights
      if (stepIdx > 0) {
        setConnectorKey((k) => k + 1);
      }

      // Light stats after last step
      if (stepIdx === totalSteps - 1) {
        push(() => setStatsLit(true), 300);
      }

      const delay =
        stepIdx === totalSteps - 1
          ? STEP_DURATION + PAUSE_AFTER_LAST
          : STEP_DURATION;

      push(() => {
        const next = (stepIdx + 1) % totalSteps;
        if (next === 0) {
          // Reset everything briefly
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
    return () => {
      clearTimeout(t);
      clearTimers();
    };
  }, [runStep, clearTimers]);

  return { activeStep, litConnectors, statsLit, connectorKey };
}

// ─── Word-reveal heading ──────────────────────────────────────────────────
function SplitReveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const words = text.split(" ");
  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
        >
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: delay + i * 0.055, ease: EASE_OUT_EXPO }}
          >
            {word}{i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ─── Magnetic link ────────────────────────────────────────────────────────
function MagneticLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
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
    <motion.a
      ref={ref} href={href} className={className}
      style={{ x: sx, y: sy }}
      onMouseMove={move} onMouseLeave={leave}
      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      {children}
    </motion.a>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────
function AnimatedCounter({
  target,
  suffix,
  delay = 0,
}: {
  target: number;
  suffix: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionVal, target, {
      duration: 1.4,
      delay,
      ease: EASE_OUT_EXPO,
    });
    const unsub = motionVal.on("change", (v) => setDisplay(Math.round(v).toString()));
    return () => { controls.stop(); unsub(); };
  }, [inView, target, delay, motionVal]);

  return <span ref={ref}>{display}{suffix}</span>;
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
    <div className="relative flex justify-center" style={{ height: 22 }}>
      {/* Line */}
      <motion.div
        className="absolute top-0 bottom-0"
        style={{ width: 1, originY: 0 }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay, duration: 0.35, ease: EASE_OUT_EXPO }}
      >
        <motion.div
          className="w-full h-full"
          animate={{
            backgroundColor: lit ? "rgba(4,98,65,0.7)" : "rgba(4,98,65,0.22)",
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      {/* Traveling dot — re-mounts on animKey change to restart animation */}
      {lit && (
        <motion.div
          key={animKey}
          className="absolute rounded-full bg-[#046241] dark:bg-[#34d399]"
          style={{
            width: 5,
            height: 5,
            left: "calc(50% - 2.5px)",
            boxShadow: "0 0 6px 2px rgba(4,98,65,0.55)",
          }}
          initial={{ top: -4, opacity: 0 }}
          animate={{ top: 22, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.42, ease: "easeInOut", times: [0, 0.1, 0.85, 1] }}
        />
      )}

      {/* Idle dot when not lit */}
      {!lit && (
        <motion.div
          className="absolute w-[5px] h-[5px] rounded-full bg-[#046241] dark:bg-[#34d399]"
          style={{ left: "calc(50% - 2.5px)" }}
          animate={{ top: ["-4px", "22px"], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 1.0,
            delay: delay + 0.6,
            repeat: Infinity,
            repeatDelay: 2.4,
            ease: "easeInOut",
            times: [0, 0.08, 0.92, 1],
          }}
        />
      )}
    </div>
  );
}

// ─── Dot-grid background for right panel ─────────────────────────────────
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
          <pattern id="dotgrid" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(4,98,65,0.13)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)" />
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

  // Progress: how far through the pipeline we are (0–1)
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
          className="absolute left-0 top-0 h-full rounded-full bg-[#046241] dark:bg-[#34d399]"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
          style={{ boxShadow: "0 0 6px rgba(4,98,65,0.5)" }}
        />
      </div>

      {PIPELINE_STEPS.map((step, i) => {
        const isActive = activeStep === i;
        const isPast = activeStep > i;
        const isLit = isActive || isPast;

        return (
          <React.Fragment key={i}>
            {/* Node */}
            <motion.div
              initial={{ opacity: 0, x: 20, filter: "blur(6px)" }}
              animate={{
                opacity: 1,
                x: isActive ? 4 : 0,
                filter: "blur(0px)",
                scale: isActive ? 1.012 : 1,
              }}
              transition={{
                opacity: { delay: 0.1 + i * 0.11, duration: 0.55, ease: EASE_OUT_EXPO },
                x: { type: "spring", stiffness: 300, damping: 28 },
                scale: { type: "spring", stiffness: 300, damping: 28 },
                filter: { delay: 0.1 + i * 0.11, duration: 0.55, ease: EASE_OUT_EXPO },
              }}
              className={[
                "rounded-xl px-4 py-2.5 flex flex-col select-none cursor-default relative overflow-hidden",
                "transition-[border-color,background-color,box-shadow] duration-300",
                step.accent
                  ? isActive
                    ? "bg-[#046241] border border-white/20 shadow-[0_0_0_3px_rgba(4,98,65,0.25),0_4px_20px_rgba(4,98,65,0.4)]"
                    : "bg-[#046241]"
                  : isLit
                    ? "bg-[#edfbf4] dark:bg-[#0d2e1f] border border-[#046241] dark:border-[#34d399]/60 shadow-[0_0_0_3px_rgba(4,98,65,0.1),0_4px_16px_rgba(4,98,65,0.15)]"
                    : "bg-white dark:bg-white/5 border border-[#dce6e0] dark:border-white/10",
              ].join(" ")}
            >
              {/* Shimmer sweep on activation */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    key={`shimmer-${i}-${activeStep}`}
                    className="absolute inset-y-0 pointer-events-none"
                    style={{
                      width: "55%",
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)",
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
                <span
                  className={[
                    "text-[10px] font-black tabular-nums shrink-0 transition-colors duration-300",
                    step.accent
                      ? "text-white/45"
                      : isLit
                        ? "text-[#046241] dark:text-[#34d399]"
                        : "text-[#046241]/50 dark:text-[#34d399]/50",
                  ].join(" ")}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Icon */}
                <motion.div
                  className={[
                    "flex items-center justify-center rounded-md transition-all duration-300",
                    step.accent
                      ? isActive
                        ? "bg-white/25 scale-110"
                        : "bg-white/15"
                      : isLit
                        ? "bg-[#046241]/12 dark:bg-[#34d399]/10 scale-110"
                        : "bg-[#e8f5ef] dark:bg-white/5",
                  ].join(" ")}
                  style={{ width: 28, height: 28 }}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                >
                  {step.icon(step.accent || isLit)}
                </motion.div>

                {/* Label */}
                <span
                  className={[
                    "text-[12px] font-bold leading-tight transition-colors duration-300",
                    step.accent
                      ? "text-white"
                      : isLit
                        ? "text-[#046241] dark:text-[#34d399]"
                        : "text-[#0f2318] dark:text-white",
                  ].join(" ")}
                >
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
                <span
                  className={[
                    "text-[10px] leading-tight mt-0.5 ml-[22px] transition-colors duration-300",
                    step.accent
                      ? "text-white/50"
                      : isLit
                        ? "text-[#046241]/70 dark:text-[#34d399]/60"
                        : "text-[#1a3326]/45 dark:text-white/35",
                  ].join(" ")}
                >
                  {step.sub}
                </span>
              )}
            </motion.div>

            {/* Connector */}
            {i < PIPELINE_STEPS.length - 1 && (
              <PipelineConnector
                delay={0.14 + i * 0.11}
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
              opacity: 1,
              y: 0,
              ...(statsLit
                ? {
                  borderColor: "rgba(4,98,65,0.6)",
                  backgroundColor: "#edfbf4",
                  boxShadow: "0 0 0 3px rgba(4,98,65,0.1)",
                }
                : {
                  borderColor: "rgba(220,230,224,1)",
                  backgroundColor: "white",
                  boxShadow: "none",
                }),
            }}
            transition={{
              opacity: { delay: 0.72 + i * 0.08, duration: 0.45, ease: EASE_OUT_EXPO },
              y: { delay: 0.72 + i * 0.08, duration: 0.45, ease: EASE_OUT_EXPO },
              borderColor: { delay: i * 0.08, duration: 0.35 },
              backgroundColor: { delay: i * 0.08, duration: 0.35 },
              boxShadow: { delay: i * 0.08, duration: 0.35 },
            }}
            className="border rounded-xl py-2.5 text-center dark:bg-white/5 dark:border-white/10"
          >
            <div className="text-[15px] font-black text-[#046241] dark:text-[#34d399] leading-tight tabular-nums">
              <AnimatedCounter target={s.value} suffix={s.suffix} delay={0.82 + i * 0.09} />
            </div>
            <div className="text-[10px] text-[#1a3326]/40 dark:text-white/35 mt-0.5">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Hero card ────────────────────────────────────────────────────────────
function HeroCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
      className="rounded-3xl overflow-hidden
                 border border-[#dde8e2] dark:border-white/10
                 bg-white dark:bg-[#0d2018]
                 shadow-[0_16px_64px_rgba(4,98,65,0.12)] dark:shadow-[0_16px_64px_rgba(0,0,0,0.55)]
                 grid grid-cols-1 md:grid-cols-2 min-h-[400px] relative"
    >
      {/* Top shimmer line */}
      <motion.div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px z-10"
        style={{ background: "linear-gradient(90deg, transparent, rgba(4,98,65,0.5), transparent)" }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.4, ease: EASE_OUT_EXPO }}
      />

      {/* ── Left panel ── */}
      <div
        className="p-10 flex flex-col justify-between relative z-10
                   border-b md:border-b-0 md:border-r border-[#dde8e2] dark:border-white/10"
      >
        <div>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.2, duration: 0.55, ease: EASE_OUT_EXPO }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5
                       border border-[#046241]/15 dark:border-[#046241]/35"
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-[#046241] dark:bg-[#34d399]"
              animate={{ scale: [1, 1.7, 1], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#046241] dark:text-[#34d399]">
              Type A — Data Servicing
            </span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-4xl md:text-[44px] font-black leading-tight mb-5 text-[#0f2318] dark:text-white">
            <SplitReveal text="Type A —" delay={0.25} />
            <br />
            <span className="text-[#046241] dark:text-[#34d399]">
              <SplitReveal text="Data Servicing" delay={0.34} />
            </span>
          </h1>

          {/* Body */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.55, ease: EASE_OUT_EXPO }}
            className="text-[13.5px] leading-relaxed text-[#1a3326]/65 dark:text-white/55 max-w-sm"
          >
            End-to-end data services specializing in multi-language datasets,
            including document capture, data collection and preparation,
            extraction, cleaning, labeling, annotation, quality assurance, and
            formatting.
          </motion.p>

          {/* Feature tags */}
          <div className="flex flex-wrap gap-2 mt-5">
            {["Document capture", "Multi-language", "AI extraction", "QA certified"].map(
              (tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.62 + i * 0.07, duration: 0.38, ease: EASE_OUT_EXPO }}
                  className="text-[11px] px-3 py-1 rounded-full
                             border border-[#046241]/15 dark:border-white/10
                             text-[#046241]/80 dark:text-white/50"
                >
                  {tag}
                </motion.span>
              )
            )}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.64, duration: 0.5, ease: EASE_OUT_EXPO }}
          className="mt-8"
        >
          <MagneticLink
            href="/contact"
            className="inline-flex items-center gap-3
                       bg-[#046241] text-white
                       px-5 py-3 rounded-full text-[11px] font-black uppercase tracking-widest
                       shadow-lg shadow-[#046241]/25"
          >
            <span>Contact Us</span>
            <motion.svg
              className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" aria-hidden
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </motion.svg>
          </MagneticLink>
        </motion.div>
      </div>

      {/* ── Right panel ── */}
      <div className="relative p-8 bg-[#f2f7f4] dark:bg-[#091911] flex flex-col overflow-hidden">
        <DotGrid />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-[10px] font-black uppercase tracking-[0.22em]
                     text-[#0f2318]/35 dark:text-white/30 mb-4 relative z-10"
        >
          Document processing pipeline
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5, ease: EASE_OUT_EXPO }}
      className="flex items-stretch my-6 border-b border-[#e2d9c8] dark:border-white/8 pb-7"
    >
      <motion.div
        className="w-1.5 rounded-sm flex-shrink-0 mr-4 bg-gradient-to-b from-[#046241] to-transparent"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        style={{ originY: 0 } as React.CSSProperties}
        transition={{ delay: 0.7, duration: 0.55, ease: EASE_OUT_EXPO }}
      />
      <div>
        <p className="text-[13px] text-[#1a3326]/70 dark:text-white/55 leading-relaxed mb-1">
          Multi-language genealogy documents, newspapers, and archives to
          facilitate global ancestry research
        </p>
        <p className="text-[13px] text-[#1a3326]/70 dark:text-white/55 leading-relaxed">
          QQ Music of over millions non-Chinese songs and lyrics
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
      transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
      aria-label="Type A Data Servicing"
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
            <motion.button
              key={block.num}
              onMouseEnter={() => setDesktopActive(i)}
              onFocus={() => setDesktopActive(i)}
              className="focus:outline-none"
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ width: desktopActive === i ? 30 : 8, opacity: desktopActive === i ? 1 : 0.3 }}
                transition={{ type: "spring", stiffness: 340, damping: 28 }}
                className="h-1.5 rounded-full bg-[#046241] dark:bg-[#34d399]"
              />
            </motion.button>
          ))}
        </div>
        <div className="hidden md:flex lg:hidden items-center gap-2">
          {BLOCKS.map((block, i) => (
            <motion.button
              key={block.num}
              onClick={() => setMobileActive(i)}
              className="focus:outline-none"
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ width: mobileActive === i ? 30 : 8, opacity: mobileActive === i ? 1 : 0.3 }}
                transition={{ type: "spring", stiffness: 340, damping: 28 }}
                className="h-1.5 rounded-full bg-[#046241] dark:bg-[#34d399]"
              />
            </motion.button>
          ))}
        </div>
      </div>

      <div className="hidden lg:flex gap-3 h-[560px]" onMouseLeave={() => setDesktopActive(null)}>
        {BLOCKS.map((block, i) => (
          <ExpandPanelCard
            key={block.num} block={block} image={SLIDE_IMAGES[i]} index={i}
            isActive={i === desktopActive} onActivate={() => setDesktopActive(i)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:hidden">
        {BLOCKS.map((block, i) => (
          <MobilePanelCard
            key={block.num} block={block} image={SLIDE_IMAGES[i]} index={i}
            isActive={i === mobileActive} onActivate={() => setMobileActive(i)}
          />
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

const ExpandPanelCard: React.FC<ExpandPanelCardProps> = ({
  block, image, index, isActive, onActivate,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      type="button"
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
      <motion.div
        className="absolute inset-0"
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.28 }}
      >
        <motion.img
          src={image} alt={block.title}
          animate={{ scale: isActive ? 1.05 : hovered ? 1.02 : 1 }}
          transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <motion.div
          animate={{ opacity: isActive ? 1 : hovered ? 0.92 : 0.82 }}
          transition={{ duration: 0.32 }}
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10"
        />
        <AnimatePresence mode="wait" initial={false}>
          {isActive ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
              className="absolute inset-x-0 bottom-0 p-6"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70 mb-1">{block.label}</p>
              <h3 className="text-[34px] leading-none font-black text-white tracking-[-0.03em] mb-2">
                {block.num} {block.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-white/80 max-w-[90%] mb-4">{block.body}</p>
              <div className="flex flex-wrap gap-2">
                {block.features.slice(0, 3).map((feature) => (
                  <span key={feature}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold
                               bg-white/10 border border-white/20 text-white/90 backdrop-blur-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.26 }}
              className="absolute inset-0 p-4 flex flex-col items-center justify-between"
            >
              <span
                className="mt-1 text-[16px] font-extrabold uppercase tracking-[0.14em] text-white
                              drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
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

const MobilePanelCard: React.FC<MobilePanelCardProps> = ({
  block, image, index, isActive, onActivate,
}) => {
  return (
    <motion.button
      type="button" onClick={onActivate}
      className="relative w-full rounded-2xl overflow-hidden text-left
                 border border-[#dce6e0] dark:border-transparent"
      animate={{ height: isActive ? 286 : 132 }}
      transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
      aria-expanded={isActive}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: index * 0.22 }}
      >
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
              <motion.p
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.24 }}
                className="text-[13px] leading-relaxed text-white/85"
              >
                {block.body}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.button>
  );
};

// ─── Page root ────────────────────────────────────────────────────────────
export default function TypeAPage() {
  return (
    <section className="bg-brand-paper dark:bg-brand-dark transition-colors duration-500 relative overflow-hidden">
      {/* Ambient orb — top left */}
      <motion.div
        aria-hidden className="absolute pointer-events-none"
        style={{
          top: "-10%", left: "-8%", width: 500, height: 500, filter: "blur(60px)",
          background: "radial-gradient(circle, rgba(4,98,65,0.07) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.14, 1], x: [0, 24, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Ambient orb — bottom right */}
      <motion.div
        aria-hidden className="absolute pointer-events-none"
        style={{
          bottom: "5%", right: "-6%", width: 400, height: 400, filter: "blur(50px)",
          background: "radial-gradient(circle, rgba(4,98,65,0.05) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.1, 1], y: [0, -20, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
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