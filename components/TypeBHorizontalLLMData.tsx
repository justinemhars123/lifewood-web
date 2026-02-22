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

// ─── Cursor-parallax hero shapes ─────────────────────────────────────────
function HeroShapes() {
  const heroRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smX = useSpring(mouseX, { stiffness: 60, damping: 18, mass: 1 });
  const smY = useSpring(mouseY, { stiffness: 60, damping: 18, mass: 1 });

  const onMove = useCallback((e: MouseEvent) => {
    const r = heroRef.current?.getBoundingClientRect();
    if (!r) return;
    mouseX.set((e.clientX - r.left) / r.width);
    mouseY.set((e.clientY - r.top) / r.height);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const el = heroRef.current?.closest("section") ?? window;
    el.addEventListener("mousemove", onMove as EventListenerOrEventListenerObject);
    return () => el.removeEventListener("mousemove", onMove as EventListenerOrEventListenerObject);
  }, [onMove]);

  const px1 = useTransform(smX, [0, 1], [-14, 14]);
  const py1 = useTransform(smY, [0, 1], [-10, 10]);
  const px2 = useTransform(smX, [0, 1], [10, -10]);
  const py2 = useTransform(smY, [0, 1], [8, -8]);
  const px3 = useTransform(smX, [0, 1], [-8, 8]);
  const py3 = useTransform(smY, [0, 1], [-6, 6]);

  return (
    <div ref={heroRef} className="relative overflow-hidden min-h-[320px]" style={{ zIndex: 2 }}>
      {/* Mesh gradient */}
      <motion.div aria-hidden className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(ellipse at 30% 50%, rgba(4,98,65,0.09) 0%, transparent 60%), radial-gradient(ellipse at 75% 25%, rgba(4,98,65,0.05) 0%, transparent 55%)",
            "radial-gradient(ellipse at 55% 35%, rgba(4,98,65,0.07) 0%, transparent 60%), radial-gradient(ellipse at 25% 70%, rgba(4,98,65,0.07) 0%, transparent 55%)",
            "radial-gradient(ellipse at 30% 50%, rgba(4,98,65,0.09) 0%, transparent 60%), radial-gradient(ellipse at 75% 25%, rgba(4,98,65,0.05) 0%, transparent 55%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <Shape
        src="https://framerusercontent.com/images/LFAxsa4CpX7e4qBI72ijOV2sHg.png?scale-down-to=512"
        style={{ position: "absolute", top: 16, left: 44, width: 155, height: 155, zIndex: 3 }}
        floatOffset={{ y: [-11, 0, -11], r: [0, 2.5, 0] }}
        extraX={px1} extraY={py1}
        shadow="drop-shadow(0 18px 40px rgba(0,0,0,0.32))"
      />
      <Shape
        src="https://framerusercontent.com/images/Tq3lgO9Qy66CFuDaYW99KQ5xoLM.png?scale-down-to=512"
        style={{ position: "absolute", top: 8, right: 50, width: 160, height: 160, zIndex: 3 }}
        floatOffset={{ y: [-8, 0, -8], r: [0, -2, 0] }}
        extraX={px2} extraY={py2}
        shadow="drop-shadow(0 20px 44px rgba(0,0,0,0.34))"
      />
      <Shape
        src="https://framerusercontent.com/images/Es0UNVEZFUO6pTmc3NI38eovew.png?scale-down-to=512"
        style={{ position: "absolute", left: "calc(35% - 95px)", bottom: 30, width: 190, height: 190, zIndex: 4 }}
        floatOffset={{ y: [-8, 0, -8], r: [0, -2, 0] }}
        extraX={px3} extraY={py3}
        shadow="drop-shadow(0 28px 64px rgba(0,0,0,0.40))"
      />
    </div>
  );
}

// ─── Draggable shape with fixed snap-back ────────────────────────────────
function Shape({ src, style, floatOffset, extraX, extraY, shadow }: {
  src: string;
  style: React.CSSProperties;
  floatOffset: { y: number[]; r: number[] };
  extraX: MotionValue<number>;
  extraY: MotionValue<number>;
  shadow: string;
}) {
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const springDX = useSpring(dragX, { stiffness: 200, damping: 20, mass: 1.1 });
  const springDY = useSpring(dragY, { stiffness: 200, damping: 20, mass: 1.1 });
  const combinedX = useTransform(() => extraX.get() + springDX.get());
  const combinedY = useTransform(() => extraY.get() + springDY.get());
  const [dragging, setDragging] = useState(false);

  return (
    <motion.div
      style={{ ...style, x: combinedX, y: combinedY, cursor: dragging ? "grabbing" : "grab" }}
      drag dragMomentum={false} dragElastic={0.18}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => {
        setDragging(false);
        animate(dragX, 0, { type: "spring", stiffness: 180, damping: 18 });
        animate(dragY, 0, { type: "spring", stiffness: 180, damping: 18 });
      }}
      onDrag={(_e, info) => { dragX.set(info.offset.x); dragY.set(info.offset.y); }}
      animate={dragging ? { scale: 1.14, rotate: 6 } : { scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <motion.img
        src={src} alt="" draggable={false}
        animate={{ y: floatOffset.y, rotate: floatOffset.r }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: "100%", height: "100%", objectFit: "contain", userSelect: "none", filter: shadow }}
      />
      <motion.div
        animate={{ opacity: dragging ? 0.5 : 0.22, scaleX: dragging ? 1.2 : 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "absolute", bottom: -14, left: "50%", transform: "translateX(-50%)",
          width: "55%", height: 10, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 80%)",
          filter: "blur(5px)", pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}

// ─── Corner bracket ───────────────────────────────────────────────────────
function CornerBracket({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const top = pos.startsWith("t");
  const left = pos.endsWith("l");
  return (
    <motion.div aria-hidden
      initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 0.3, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "absolute",
        [top ? "top" : "bottom"]: 10, [left ? "left" : "right"]: 10,
        width: 16, height: 16,
        borderTop: top ? "2px solid rgba(255,255,255,0.3)" : "none",
        borderBottom: !top ? "2px solid rgba(255,255,255,0.3)" : "none",
        borderLeft: left ? "2px solid rgba(255,255,255,0.3)" : "none",
        borderRight: !left ? "2px solid rgba(255,255,255,0.3)" : "none",
        pointerEvents: "none", zIndex: 30,
      }}
    />
  );
}

// ─── Page root ────────────────────────────────────────────────────────────
export default function TypeBPage() {
  return (
    <section className="bg-brand-paper dark:bg-brand-dark transition-colors duration-500 relative overflow-hidden">
      {/* Ambient orbs */}
      <motion.div aria-hidden className="absolute pointer-events-none"
        style={{ top: "-10%", left: "-8%", width: 500, height: 500, filter: "blur(60px)",
          background: "radial-gradient(circle, rgba(4,98,65,0.07) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.12, 1], x: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div aria-hidden className="absolute pointer-events-none"
        style={{ bottom: "5%", right: "-6%", width: 400, height: 400, filter: "blur(50px)",
          background: "radial-gradient(circle, rgba(4,98,65,0.05) 0%, transparent 70%)" }}
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
                 grid grid-cols-1 md:grid-cols-[1fr_1.15fr] min-h-[300px] relative"
    >
      {/* Top shimmer */}
      <motion.div aria-hidden className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(4,98,65,0.4), transparent)" }}
        initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Left panel */}
      <div className="p-11 md:p-12 pr-8 md:pr-6 pb-16 flex flex-col justify-between relative z-10">
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

          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4 text-[#0f2318] dark:text-white overflow-visible">
            <SplitReveal text="Type B —" delay={0.22} />
            <br />
            <span className="text-[#046241] dark:text-[#FFB347]">
              <SplitReveal text="Horizontal LLM Data" delay={0.32} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48, duration: 0.55 }}
            className="text-base leading-relaxed text-[#1a3326]/70 dark:text-white/70 max-w-md"
          >
            Comprehensive AI data solutions that cover the entire spectrum from data
            collection and annotation to model testing. Creating multimodal datasets
            for deep learning, large language models.
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.58, duration: 0.45 }} className="mt-8">
          <MagneticLink
            href="/contact"
            className="inline-flex items-center w-fit
                       bg-[#046241] dark:bg-[#FFB347]
                       text-white dark:text-[#0f2318]
                       px-5 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest
                       shadow-lg shadow-[#046241]/25 dark:shadow-[#FFB347]/25"
          >
            <span className="truncate">Contact Us</span>
            <motion.svg className="ml-3 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" aria-hidden
              animate={{ x: [0, 3, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </MagneticLink>
        </motion.div>
      </div>

      <HeroShapes />
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
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  const goTo = (i: number) => { setDirection(i > active ? 1 : -1); setActive(i); };
  const slide = BLOCKS[active];

  const cardVariants = {
    enter: (dir: number) => ({ x: dir * 60, opacity: 0, scale: 0.96, rotateY: dir * 5 }),
    center: { x: 0, opacity: 1, scale: 1, rotateY: 0 },
    exit: (dir: number) => ({ x: dir * -60, opacity: 0, scale: 0.96, rotateY: dir * -5 }),
  };

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Type B Horizontal LLM Data"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="flex-1 h-px bg-[#046241]/10 dark:bg-white/8" />
        <div className="flex items-center gap-2">
          {BLOCKS.map((_, i) => (
            <motion.button key={i} onClick={() => goTo(i)} className="focus:outline-none" whileTap={{ scale: 0.88 }}>
              <motion.div
                animate={{ width: active === i ? 28 : 6, opacity: active === i ? 1 : 0.28 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="h-1.5 rounded-full bg-[#046241] dark:bg-[#FFB347]"
              />
            </motion.button>
          ))}
        </div>
        <div className="flex-1 h-px bg-[#046241]/10 dark:bg-white/8" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.65fr] gap-4 lg:gap-8 items-stretch">

        {/* LEFT */}
        <div className="flex flex-col">
          {/* Ghost number */}
          <div style={{ height: 72, overflow: "hidden", marginBottom: 8 }} className="select-none pointer-events-none">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.p key={active} custom={direction}
                initial={{ y: (direction as number) * 28, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: (direction as number) * -28, opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="text-[96px] font-black leading-none tracking-[-0.06em] text-[#046241]/8 dark:text-white/5"
              >
                {slide.num}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex flex-col flex-1">
            {BLOCKS.map((block, i) => (
              <ContentBlock key={block.num} block={block} isActive={i === active} onClick={() => goTo(i)} />
            ))}
          </div>

          {/* Nav */}
          <div className="flex items-center gap-3 mt-6">
            <NavButton dir="prev" disabled={active === 0} onClick={() => goTo(Math.max(0, active - 1))} />
            <NavButton dir="next" disabled={active === BLOCKS.length - 1} onClick={() => goTo(Math.min(BLOCKS.length - 1, active + 1))} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a3326]/35 dark:text-white/28 ml-2">
              {String(active + 1).padStart(2, "0")} / {String(BLOCKS.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ perspective: 1200 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={active} custom={direction}
              variants={cardVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl overflow-hidden relative flex flex-col
                         bg-white dark:bg-[#0d2018]
                         shadow-[0_20px_60px_rgba(4,98,65,0.12)] dark:shadow-[0_24px_72px_rgba(0,0,0,0.6)]
                         border border-[#dde8e2] dark:border-white/8 min-h-[520px]"
              style={{ transformStyle: "preserve-3d" }}
            >
              <CornerBracket pos="tl" /><CornerBracket pos="tr" />
              <CornerBracket pos="bl" /><CornerBracket pos="br" />

              {/* Top shimmer */}
              <div className="absolute top-0 left-8 right-8 h-px rounded-full pointer-events-none z-30
                              bg-gradient-to-r from-transparent via-[#046241]/25 dark:via-white/25 to-transparent" />

              <div className="flex flex-col flex-1 p-8 pt-10">

                {/* Step header */}
                <div className="flex items-center justify-between mb-7 relative z-10">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-[#046241]/8 dark:bg-white/10 border border-[#046241]/15 dark:border-white/20"
                      whileInView={{ scale: [0.7, 1.1, 1] }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <span className="text-[11px] font-black text-[#0f2318] dark:text-white">{slide.num}</span>
                    </motion.div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#0f2318]/45 dark:text-white/45 mb-0.5">{slide.label}</p>
                      <p className="text-[15px] font-black text-[#0f2318] dark:text-white leading-tight">{slide.title}</p>
                    </div>
                  </div>
                  <motion.span layout
                    className="text-[9px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full
                               bg-[#046241]/8 dark:bg-white/10 text-[#0f2318]/65 dark:text-white/60 border border-[#046241]/15 dark:border-white/15"
                  >
                    {slide.tag}
                  </motion.span>
                </div>

                {/* Image panel */}
                <div className="flex-1 relative rounded-2xl overflow-hidden mb-6
                               bg-[#f3f7f5] dark:bg-[#071a10] border border-[#dce6e0] dark:border-white/10"
                  style={{ minHeight: 220 }}
                >
                  {/* Grid texture */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.045]"
                    style={{
                      backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />

                  {/* Ambient glow */}
                  <AnimatePresence>
                    <motion.div key={`glow-${active}`} className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.9 }}
                      style={{ background: "radial-gradient(ellipse at 35% 60%, rgba(4,98,65,0.5) 0%, transparent 55%), radial-gradient(ellipse at 72% 30%, rgba(4,98,65,0.2) 0%, transparent 50%)" }}
                    />
                  </AnimatePresence>

                  {/* Slide image */}
                  <AnimatePresence mode="wait">
                    <motion.img key={`img-${active}`} src={SLIDE_IMAGES[active]} alt={slide.title}
                      initial={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.97, filter: "blur(4px)" }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 10 }}
                    />
                  </AnimatePresence>

                  {/* Watermark */}
                  <div aria-hidden
                    className="absolute bottom-0 right-3 select-none pointer-events-none
                               text-[100px] font-black leading-none text-[#0f2318]/[0.04] dark:text-white/[0.03] tracking-[-0.06em] z-20"
                  >
                    {slide.num}
                  </div>
                </div>

                {/* Body */}
                <AnimatePresence mode="wait">
                  <motion.p key={`body-${active}`}
                    initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.38, delay: 0.08 }}
                    className="text-[13px] text-[#0f2318]/70 dark:text-white/65 leading-relaxed mb-5"
                  >
                    {slide.body}
                  </motion.p>
                </AnimatePresence>

                {/* Feature chips */}
                <AnimatePresence mode="wait">
                  <motion.div key={`chips-${active}`} className="flex flex-wrap gap-2">
                    {slide.features.map((f, i) => (
                      <motion.span key={f}
                        initial={{ opacity: 0, scale: 0.82, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88 }}
                        transition={{ delay: 0.14 + i * 0.07, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold
                                   bg-[#046241]/8 dark:bg-white/10 text-[#0f2318]/80 dark:text-white/80 border border-[#046241]/15 dark:border-white/15"
                      >
                        <motion.span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#046241]/45 dark:bg-white/55"
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                        />
                        {f}
                      </motion.span>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}

// ─── Nav button ───────────────────────────────────────────────────────────
function NavButton({ dir, disabled, onClick }: { dir: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  return (
    <motion.button onClick={onClick} disabled={disabled}
      className="flex items-center justify-center w-9 h-9 rounded-full
                 border border-[#046241]/20 dark:border-white/10
                 hover:border-[#046241]/50 dark:hover:border-white/25
                 hover:bg-[#046241]/8 dark:hover:bg-white/6
                 disabled:opacity-20 focus:outline-none"
      whileHover={disabled ? {} : { scale: 1.1 }} whileTap={disabled ? {} : { scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <svg className="w-4 h-4 text-[#046241]/60 dark:text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {dir === "prev"
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />}
      </svg>
    </motion.button>
  );
}

// ─── Content block ────────────────────────────────────────────────────────
type ContentBlockProps = { block: (typeof BLOCKS)[number]; isActive: boolean; onClick: () => void };

const ContentBlock: React.FC<ContentBlockProps> = ({ block, isActive, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      className="w-full text-left bg-transparent border-0 p-0 relative overflow-hidden focus:outline-none"
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      aria-expanded={isActive}
    >
      {/* Hover wash */}
      <motion.div animate={{ opacity: hovered && !isActive ? 1 : 0 }} transition={{ duration: 0.18 }}
        className="absolute inset-0 pointer-events-none rounded-lg bg-gradient-to-r from-[#046241]/5 to-transparent"
      />

      {/* Active shimmer sweep */}
      {isActive && (
        <motion.div aria-hidden
          className="absolute inset-0 pointer-events-none rounded-lg"
          style={{ background: "linear-gradient(90deg, transparent, rgba(4,98,65,0.04), transparent)" }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
        />
      )}

      {/* Active left bar */}
      <motion.div
        animate={{ scaleY: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-0 top-5 bottom-5 w-[3px] rounded-r-full
                   bg-gradient-to-b from-[#046241] to-[#046241]/30
                   dark:from-[#FFB347] dark:to-[#FFB347]/30"
        style={{ transformOrigin: "top" }}
      />

      <motion.div
        animate={{ x: isActive ? 14 : hovered ? 6 : 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="py-5"
      >
        <div className="flex items-start gap-4">
          {/* Number */}
          <motion.span
            animate={{ opacity: isActive ? 1 : hovered ? 0.45 : 0.15 }}
            transition={{ duration: 0.22 }}
            className="text-[38px] font-black leading-none tracking-[-0.04em] flex-shrink-0 mt-0.5
                       text-[#046241] dark:text-[#FFB347]"
            style={{ minWidth: "2ch" }}
          >
            {block.num}
          </motion.span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[15px] font-black text-[#0f2318] dark:text-white tracking-tight">{block.title}</h3>
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.75, x: -4 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.75, x: -4 }}
                    transition={{ duration: 0.22 }}
                    className="text-[8px] font-black uppercase tracking-[0.16em] px-2 py-0.5 rounded-full
                               bg-[#046241]/10 dark:bg-[#FFB347]/10
                               text-[#046241] dark:text-[#FFB347]
                               border border-[#046241]/15 dark:border-[#FFB347]/20"
                  >
                    {block.tag}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Underline */}
            <motion.div
              animate={{ scaleX: isActive || hovered ? 1 : 0 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="h-[1.5px] w-10 rounded-full mb-2 bg-[#046241] dark:bg-[#FFB347]"
              style={{ transformOrigin: "left" }}
            />


          </div>
        </div>
      </motion.div>
    </motion.button>
  );
};
