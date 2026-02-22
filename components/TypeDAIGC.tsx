import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useVelocity,
  useInView,
  useReducedMotion,
  animate,
  MotionValue,
} from "framer-motion";

// ─── Images ────────────────────────────────────────────────────────────────
const collageImages = [
  "https://framerusercontent.com/images/1Pnyjmjwo7FWEAoCcEszS2Fngns.jpeg?scale-down-to=512&width=1600&height=897",
  "https://framerusercontent.com/images/ptHrgNDD082Sa0EZcDea0FYhulM.jpeg?scale-down-to=512&width=1600&height=897",
  "https://framerusercontent.com/images/2uF9Ksrf98DxfWsjGrIvBbyRWs.jpeg?scale-down-to=512&width=1456&height=816",
];

const workflowImages = {
  timeline:
    "https://framerusercontent.com/images/8USU1OFCcARiIIvcdJBJlzA8EA4.jpg?scale-down-to=512&width=5184&height=3456",
  story:
    "https://framerusercontent.com/images/3CdZeNunHzqH9P7TcEFjG2Imb4.jpg?scale-down-to=1024&width=4000&height=6000",
  edit:
    "https://framerusercontent.com/images/pW4xMuxSlAXuophJZT96Q4LO0.jpeg?scale-down-to=512&width=800&height=386",
  market:
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
  audio:
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80",
};

// ─── Word-mask reveal ───────────────────────────────────────────────────────
function SplitReveal({
  text,
  className,
  delay = 0,
  once = true,
}: {
  text: string;
  className?: string;
  delay?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, amount: 0.5 });

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
            transition={{
              duration: 0.7,
              delay: delay + i * 0.04,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ─── Animated counter ──────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.9 });
  const motionVal = useMotionValue(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionVal, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.floor(v) + suffix;
      },
    });
    return controls.stop;
  }, [inView, value, suffix, motionVal]);

  return <span ref={ref}>0{suffix}</span>;
}

// ─── Magnetic button ───────────────────────────────────────────────────────
function MagneticButton({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 320, damping: 20, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 320, damping: 20, mass: 0.6 });

  const handleMove = (e: React.MouseEvent) => {
    const rect = btnRef.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={btnRef}
      href={href}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      {children}
    </motion.a>
  );
}

// ─── Scroll-parallax wrapper ───────────────────────────────────────────────
function ParallaxLayer({
  children,
  speed = 0.15,
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);

  return (
    <div ref={ref} className={className} style={{ overflow: "hidden" }}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

// ─── Shimmer divider ───────────────────────────────────────────────────────
function ShimmerLine({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="h-px max-w-[1320px] mx-auto my-10 md:my-16 relative overflow-hidden"
      style={{ background: "rgba(4,98,65,0.08)" }}
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="absolute inset-y-0 left-0 w-[30%]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(4,98,65,0.55), transparent)",
        }}
        animate={{ x: ["-100%", "440%"] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
      />
    </motion.div>
  );
}

// ─── Intro variants ────────────────────────────────────────────────────────
const introContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.12 },
  },
};

const introItemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── TiltCard (improved: Lissajous auto-tilt + entry spring) ──────────────
type TiltCardProps = {
  children: React.ReactNode;
  className: string;
  delay?: number;
  scale?: number;
  rotateZ?: number;
  autoTilt?: boolean;
  autoPhase?: number;
  autoAmplitude?: number;
  autoSpeedX?: number;
  autoSpeedY?: number;
};

function TiltCard({
  children,
  className,
  delay = 0,
  scale = 1.02,
  rotateZ = 0,
  autoTilt = false,
  autoPhase = 0,
  autoAmplitude = 3.8,
  autoSpeedX = 1.25,
  autoSpeedY,
}: TiltCardProps) {
  // Use different X/Y speeds for Lissajous figure (non-repetitive organic path)
  const speedY = autoSpeedY ?? autoSpeedX * 1.31803; // golden ratio offset
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const autoX = useMotionValue(0);
  const autoY = useMotionValue(0);
  const combinedX = useTransform(() => autoX.get() + pointerX.get());
  const combinedY = useTransform(() => autoY.get() + pointerY.get());
  const springX = useSpring(combinedX, { stiffness: 220, damping: 26, mass: 0.8 });
  const springY = useSpring(combinedY, { stiffness: 220, damping: 26, mass: 0.8 });

  // Breath scale for auto-tilting cards
  const breathScale = useMotionValue(1);
  const springBreath = useSpring(breathScale, { stiffness: 80, damping: 18 });

  useAnimationFrame((t) => {
    if (!autoTilt) return;
    const s = t / 1000;
    autoX.set(Math.sin(s * autoSpeedX + autoPhase) * autoAmplitude);
    autoY.set(Math.cos(s * speedY + autoPhase) * autoAmplitude);
    // Subtle breath: scale pulses between 1 and 1.012
    breathScale.set(1 + Math.sin(s * 0.6 + autoPhase) * 0.006);
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    pointerY.set((px - 0.5) * 12);
    pointerX.set((0.5 - py) * 12);
  };

  const handleMouseLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, rotate: rotateZ - 4, scale: 0.93 }}
      whileInView={{ opacity: 1, y: 0, rotate: rotateZ, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
        // scale and rotate spring separately for snappy feel
        scale: { type: "spring", stiffness: 280, damping: 22, delay },
        rotate: { type: "spring", stiffness: 200, damping: 24, delay },
      }}
      whileHover={{ y: -8, scale: scale }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateZ,
        rotateX: springX,
        rotateY: springY,
        scale: autoTilt ? springBreath : undefined,
        transformPerspective: 1100,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Hero video with scroll-scale ─────────────────────────────────────────
function HeroVideo() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // As you scroll down, the video scales up slightly (Ken-Burns on scroll)
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [0.18, 0.5]);

  return (
    <motion.div
      ref={ref}
      variants={introItemVariants}
      className="rounded-[42px] overflow-hidden h-[260px] md:h-[420px] lg:h-[500px] relative max-w-[1800px] mx-auto border border-[#046241]/15 dark:border-white/10 shadow-[0_12px_48px_rgba(4,98,65,0.14)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.45)]"
    >
      <motion.video
        className="absolute inset-0 w-full h-full object-cover"
        style={{ scale }}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-label="AIGC cinematic production scene"
      >
        <source
          src="https://framerusercontent.com/assets/OYykWaWrUmfZYDy3CJnT4GUNL8.mp4"
          type="video/mp4"
        />
      </motion.video>
      <motion.div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />
      <div className="absolute left-0 right-0 top-[58%] -translate-y-1/2 h-[24%] bg-[#046241]/22 dark:bg-black/34 backdrop-blur-[1px]" />
    </motion.div>
  );
}

// ─── Floating accent orb ─────────────────────────────────────────────────
function FloatingOrb({ style }: { style?: React.CSSProperties }) {
  return (
    <motion.div
      aria-hidden
      className="absolute rounded-full pointer-events-none"
      style={{
        width: 320,
        height: 320,
        background:
          "radial-gradient(circle, rgba(4,98,65,0.12) 0%, transparent 70%)",
        filter: "blur(40px)",
        ...style,
      }}
      animate={{
        x: [0, 24, -12, 0],
        y: [0, -18, 16, 0],
        scale: [1, 1.08, 0.96, 1],
      }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

type SwapCardItem = {
  src: string;
  alt: string;
  objectPosition?: string;
};

function ApproachCardSwap({
  cards,
  delay = 5200,
  cardDistance = 74,
  verticalDistance = 80,
  skewAmount = 0,
}: {
  cards: SwapCardItem[];
  delay?: number;
  cardDistance?: number;
  verticalDistance?: number;
  skewAmount?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const total = cards.length;
  const [order, setOrder] = useState<number[]>(
    () => Array.from({ length: total }, (_, i) => total - 1 - i)
  );
  const orderRef = useRef<number[]>(order);
  const [phase, setPhase] = useState<"idle" | "drop" | "promote">("idle");
  const [droppingId, setDroppingId] = useState<number | null>(null);
  const isPausedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.45, once: false });
  const isAnimatingRef = useRef(false);
  const dropTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);

  const makeSlot = (i: number) => ({
    x: i * cardDistance,
    y: -i * verticalDistance,
    z: -i * cardDistance * 1.4,
    zIndex: total - i,
  });

  const clearSwapTimers = () => {
    if (dropTimerRef.current !== null) {
      window.clearTimeout(dropTimerRef.current);
      dropTimerRef.current = null;
    }
    if (finishTimerRef.current !== null) {
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
    isAnimatingRef.current = false;
  };

  const runSwap = () => {
    if (isPausedRef.current || isAnimatingRef.current || orderRef.current.length < 2) return;
    isAnimatingRef.current = true;

    const [front, ...rest] = orderRef.current;
    setPhase("drop");
    setDroppingId(front);

    dropTimerRef.current = window.setTimeout(() => {
      const nextOrder = [...rest, front];
      orderRef.current = nextOrder;
      setOrder(nextOrder);
      setPhase("promote");

      finishTimerRef.current = window.setTimeout(() => {
        setDroppingId(null);
        setPhase("idle");
        isAnimatingRef.current = false;
      }, 260);
    }, 900);
  };

  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  useEffect(() => {
    if (!inView || total < 2) {
      clearSwapTimers();
      setDroppingId(null);
      setPhase("idle");
      return;
    }

    runSwap();
    const interval = window.setInterval(runSwap, delay);

    return () => {
      window.clearInterval(interval);
      clearSwapTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, delay, total]);

  useEffect(() => {
    return () => clearSwapTimers();
  }, []);

  const cardAngles = [8, -8, -14];
  const driftPatterns = [
    { rx: [0, 2.4, 0, -1.8, 0], ry: [0, -2.8, 0, 2.2, 0], y: [0, -6, 0, 5, 0], scale: [1, 1.01, 1, 1.008, 1], duration: 6.2 },
    { rx: [0, -2.1, 0, 2.6, 0], ry: [0, 2.4, 0, -2.2, 0], y: [0, 5, 0, -6, 0], scale: [1, 1.008, 1, 1.012, 1], duration: 6.8 },
    { rx: [0, 2.8, 0, -2.3, 0], ry: [0, -2.2, 0, 2.6, 0], y: [0, -5, 0, 6, 0], scale: [1, 1.011, 1, 1.009, 1], duration: 7.1 },
  ];

  return (
    <div
      ref={containerRef}
      className="relative h-[430px] md:h-[590px] lg:h-[650px] [perspective:1400px]"
      onMouseEnter={() => {
        isPausedRef.current = true;
      }}
      onMouseLeave={() => {
        isPausedRef.current = false;
      }}
    >
      {cards.map((card, idx) => {
        const slotIndex = order.indexOf(idx);
        if (slotIndex < 0) return null;

        const slot = makeSlot(slotIndex);
        const isDropping = droppingId === idx;
        const zIndex = isDropping && phase === "drop" ? total + 3 : slot.zIndex;
        const drift = driftPatterns[idx % driftPatterns.length];

        return (
          <motion.figure
            key={card.src}
            className="absolute left-[2%] top-[34%] md:top-[35%] w-[74%] md:w-[72%] aspect-video overflow-hidden rounded-sm border border-white/10 bg-black/10 shadow-[0_18px_44px_rgba(4,98,65,0.24)]"
            style={{
              zIndex,
              transformStyle: "preserve-3d",
            }}
            animate={{
              x: slot.x,
              y: isDropping ? slot.y + 420 : slot.y,
              z: slot.z,
              rotate: cardAngles[idx % cardAngles.length],
              skewY: skewAmount,
            }}
            transition={
              isDropping && phase === "drop"
                ? { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
                : {
                    duration: 0.95,
                    delay: phase === "promote" ? slotIndex * 0.08 : 0,
                    ease: [0.22, 1, 0.36, 1],
                  }
            }
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="h-full w-full [transform-style:preserve-3d]"
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      rotateX: drift.rx,
                      rotateY: drift.ry,
                      y: drift.y,
                      scale: drift.scale,
                    }
              }
              transition={
                shouldReduceMotion
                  ? undefined
                  : {
                      duration: drift.duration,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: idx * 0.32,
                    }
              }
            >
              <img
                src={card.src}
                alt={card.alt}
                className="h-full w-full object-cover"
                style={card.objectPosition ? { objectPosition: card.objectPosition } : undefined}
              />
            </motion.div>
          </motion.figure>
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function TypeDAIGC() {
  const approachCards: SwapCardItem[] = [
    {
      src: collageImages[0],
      alt: "AIGC visual frame 1",
      objectPosition: "center 28%",
    },
    {
      src: collageImages[1],
      alt: "AIGC visual frame 2",
    },
    {
      src: collageImages[2],
      alt: "AIGC visual frame 3",
      objectPosition: "center 42%",
    },
  ];

  return (
    <motion.section
      className="bg-brand-paper dark:bg-brand-dark transition-colors duration-500 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Decorative ambient orbs */}
      <FloatingOrb style={{ top: "5%", left: "-5%" }} />
      <FloatingOrb style={{ top: "40%", right: "-6%", animationDelay: "3s" }} />

      {/* Top shimmer line */}
      <motion.div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#046241]/45 dark:via-[#FFB347]/45 to-transparent origin-left"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.div
        className="max-w-[1600px] mx-auto px-6 md:px-16 pt-20 pb-12"
        variants={introContainerVariants}
        initial="hidden"
        animate="show"
      >
        {/* ── Header ── */}
        <motion.header
          variants={introItemVariants}
          className="max-w-[1320px] mx-auto mb-8 md:mb-12 lg:mb-14"
        >
          <motion.h1
            variants={introItemVariants}
            className="text-[39px] md:text-[66px] lg:text-[76px] font-black leading-[0.95] tracking-tight text-[#0f2318] dark:text-white"
          >
            <SplitReveal
              text="AI Generated Content (AIGC)"
              delay={0.15}
            />
          </motion.h1>

          <motion.p
            variants={introItemVariants}
            className="mt-4 text-[12px] md:text-[13px] lg:text-[14px] leading-relaxed text-[#1a3326]/70 dark:text-white/70 max-w-[980px]"
          >
            Lifewood&apos;s early adoption of AI tools has seen the company rapidly evolve the use
            of AI-generated content integrated into communication and video production.
            These text, voice, image and video capabilities now support modern production
            workflows and fast-turn creative storytelling.
          </motion.p>

          <motion.div variants={introItemVariants} className="mt-5">
            <MagneticButton
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#046241] dark:bg-[#FFB347] text-white dark:text-[#0f2318] px-5 py-2 text-[11px] font-black uppercase tracking-widest cursor-pointer"
            >
              Contact Us
              <motion.span
                className="inline-flex w-4 h-4 rounded-full bg-white/20 dark:bg-[#0f2318]/20 items-center justify-center text-[9px]"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                &gt;
              </motion.span>
            </MagneticButton>
          </motion.div>
        </motion.header>

        {/* ── Hero Video ── */}
        <HeroVideo />

        <ShimmerLine delay={0.1} />

        {/* ── Our Approach ── */}
        <motion.section
          variants={introItemVariants}
          className="mt-16 md:mt-24 lg:mt-28 grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-8 md:gap-14 items-start"
        >
          <div className="pt-8 md:pt-14">
            <h2 className="text-[46px] md:text-[68px] leading-[0.95] tracking-tight font-black text-[#0f2318] dark:text-white">
              <SplitReveal text="Our Approach" delay={0.05} />
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.65, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 text-[12px] md:text-[14px] leading-relaxed text-[#1a3326]/70 dark:text-white/70 max-w-[590px]"
            >
              Our motivation is to express the personality of your brand in a compelling and
              distinctive way. We specialize in story-driven content for companies looking to
              join the communication revolution.
            </motion.p>
          </div>

          <ApproachCardSwap cards={approachCards} />
        </motion.section>

        <ShimmerLine delay={0.05} />

        {/* ── Cinematic paragraph + workflow grid ── */}
        <motion.section
          variants={introItemVariants}
          className="mt-4 md:mt-8 grid grid-cols-1 lg:grid-cols-[1.02fr_1.2fr] gap-7 lg:gap-10 items-start relative"
        >
          <div className="pt-8 lg:pt-10 relative">
            <span
              aria-hidden
              className="hidden lg:block absolute -left-1 top-0 text-[#046241]/25 dark:text-[#FFB347]/35 text-[44px] leading-none font-light select-none"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              S
            </span>
            <p className="mt-2 text-[18px] md:text-[28px] lg:text-[34px] leading-[1.2] tracking-tight font-medium text-[#1a3326]/85 dark:text-white/90 max-w-[700px]">
              <SplitReveal
                text="We use advanced film, video and editing techniques, combined with generative AI, to create cinematic worlds for your videos, advertisements and corporate communications."
                delay={0.04}
              />
            </p>
          </div>

          <div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <MediaCard src={workflowImages.timeline} alt="Editing timeline" delay={0.06} />
              <MediaCard src={workflowImages.story} alt="Creative storyboard" delay={0.14} />
              <MediaCard src={workflowImages.edit} alt="Video post production" delay={0.22} />
            </div>

            <div className="grid grid-cols-[1.34fr_0.8fr_0.28fr] gap-3 items-stretch">
              <TiltCard
                delay={0.1}
                scale={1.015}
                className="relative rounded-lg overflow-hidden h-[220px] md:h-[320px] lg:h-[420px] border border-[#046241]/10 dark:border-white/10"
              >
                <img src={workflowImages.market} alt="Global audience collaboration" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute left-4 right-4 bottom-4 grid grid-cols-[0.9fr_1.6fr] gap-4 items-end">
                  <p className="text-white text-[11px] md:text-[13px] leading-tight font-medium">
                    We can quickly adjust
                  </p>
                  <p className="text-white text-[15px] md:text-[22px] leading-[1.12] font-medium">
                    the culture and language of your video to suit different world markets.
                  </p>
                </div>
              </TiltCard>

              <TiltCard
                delay={0.18}
                scale={1.015}
                className="relative rounded-lg overflow-hidden h-[220px] md:h-[320px] lg:h-[420px] border border-[#046241]/10 dark:border-white/10"
              >
                <img src={workflowImages.audio} alt="Audio recording for multilingual voiceover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/35" />
                <p className="absolute left-4 bottom-4 text-white text-[11px] md:text-[13px] leading-tight font-semibold">
                  Multiple
                  <br />
                  Languages
                </p>
              </TiltCard>

              {/* Counter card */}
              <TiltCard
                delay={0.26}
                scale={1.02}
                className="flex items-center justify-center h-[220px] md:h-[320px] lg:h-[420px]"
              >
                <motion.div
                  className="rounded-lg bg-white dark:bg-[#0d2018] border border-[#046241]/12 dark:border-white/10 w-full h-[96px] md:h-[140px] flex items-center justify-center shadow-[0_8px_24px_rgba(4,98,65,0.12)]"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.9 }}
                >
                  <div className="text-center text-[#046241] dark:text-[#FFB347]">
                    <p className="text-[30px] md:text-[40px] font-black leading-none">
                      <AnimatedCounter value={100} suffix="+" />
                    </p>
                    <p className="text-[10px] md:text-[11px] opacity-75">Countries</p>
                  </div>
                </motion.div>
              </TiltCard>
            </div>
          </div>
        </motion.section>

        <ShimmerLine delay={0.05} />

        {/* ── Pull quote ── */}
        <motion.section
          variants={introItemVariants}
          className="max-w-[1060px] mx-auto mt-10 md:mt-14 text-center pb-6"
        >
          {/* Animated quote marks */}
          <motion.span
            aria-hidden
            className="block text-[72px] leading-none text-[#046241]/18 dark:text-[#FFB347]/22 font-serif select-none mb-2"
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            &ldquo;
          </motion.span>
          <p className="text-[20px] md:text-[32px] lg:text-[38px] font-medium leading-[1.22] tracking-tight text-[#0f2318] dark:text-white">
            <SplitReveal
              text="We understand that your customers spend hours looking at screens, so finding the one, most important thing to build your message around is integral to our approach, as we seek to deliver surprise and originality."
              delay={0.06}
            />
          </p>
          <motion.p
            className="mt-4 text-[11px] tracking-[0.18em] uppercase text-[#046241]/55 dark:text-[#FFB347]/55"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.5 }}
          >
            - Lifewood -
          </motion.p>
        </motion.section>
      </motion.div>
    </motion.section>
  );
}

// ─── MediaCard ────────────────────────────────────────────────────────────
function MediaCard({ src, alt, delay = 0 }: { src: string; alt: string; delay?: number }) {
  return (
    <TiltCard
      delay={delay}
      scale={1.03}
      className="rounded-lg overflow-hidden h-[110px] md:h-[165px] lg:h-[250px] border border-[#046241]/10 dark:border-white/10 shadow-[0_6px_22px_rgba(4,98,65,0.1)] dark:shadow-none"
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
    </TiltCard>
  );
}
