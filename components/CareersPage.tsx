import React, { useEffect, useRef, useState } from "react";

const CAREERS_HERO_IMAGE =
  "https://framerusercontent.com/images/DF2gzPqqVW8QGp7Jxwp1y5257xk.jpg?height=4000&width=6000";
const JOIN_US_LINK = "https://application-form-ph.vercel.app";

const TAG_ROWS = [
  ["Flexible", "Supportive", "Collaborative", "Innovative", "Flexible", "Supportive"],
  ["Engaging", "Diverse", "Purpose-driven", "Transparent", "Engaging", "Diverse", "Purpose-driven"],
  ["Professional", "Reliable", "Balanced (work-life balance)", "Trustworthy", "Professional", "Reliable"],
];

// ─── ALL CSS (original marquee + new text animation additions) ─────────────
function CareersAnimations() {
  return (
    <style>{`
      /* ── original marquee ── */
      @keyframes lw-marquee-left {
        0% { transform: translate3d(0, 0, 0); }
        100% { transform: translate3d(-50%, 0, 0); }
      }
      @keyframes lw-marquee-right {
        0% { transform: translate3d(-50%, 0, 0); }
        100% { transform: translate3d(0, 0, 0); }
      }
      @keyframes lw-marquee-drift {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-1px); }
      }
      .lw-marquee-shell {
        position: relative; border-radius: 14px;
        padding: 4px 0; overflow: hidden;
        border: 0; background: transparent; box-shadow: none;
      }
      .dark .lw-marquee-shell { background: transparent; }
      .lw-marquee-shell::before { content: none; }
      .lw-marquee-track {
        display: flex; width: max-content;
        gap: 12px; align-items: center; will-change: transform;
      }
      .lw-marquee-left  { animation: lw-marquee-left  linear infinite; }
      .lw-marquee-right { animation: lw-marquee-right linear infinite; }
      .lw-marquee-lane  { position: relative; overflow: hidden; padding: 3px 0; }
      .lw-marquee-lane:nth-child(2) { animation: lw-marquee-drift 7s ease-in-out infinite; }
      .lw-marquee-chip {
        white-space: nowrap; padding: 9px 16px; border-radius: 2px;
        font-size: 15px; line-height: 1; font-weight: 700; letter-spacing: 0;
        color: #193026; border: 0; background: #eceec8; box-shadow: none;
        transition: opacity 220ms ease;
      }
      .dark .lw-marquee-chip { color: #f7f8f4; background: rgba(255,179,71,0.2); }
      .lw-marquee-chip:hover { opacity: 0.9; }
      .dark .lw-marquee-chip:hover { opacity: 1; }
      .lw-marquee-fade-left, .lw-marquee-fade-right {
        position: absolute; top: 0; bottom: 0; width: 78px;
        pointer-events: none; z-index: 2;
      }
      .lw-marquee-fade-left  { left: 0;  background: linear-gradient(90deg,  rgba(248,249,247,1), rgba(248,249,247,0)); }
      .lw-marquee-fade-right { right: 0; background: linear-gradient(270deg, rgba(248,249,247,1), rgba(248,249,247,0)); }
      .dark .lw-marquee-fade-left  { background: linear-gradient(90deg,  rgba(14,34,24,1), rgba(14,34,24,0)); }
      .dark .lw-marquee-fade-right { background: linear-gradient(270deg, rgba(14,34,24,1), rgba(14,34,24,0)); }

      /* ── text animation additions ── */

      /* Word clip: each word lives in an overflow:hidden wrapper so it rises through the floor */
      .lw-word-clip {
        display: inline-block;
        overflow: hidden;
        vertical-align: bottom;
        margin-right: 0.26em;
      }
      .lw-word-clip:last-child { margin-right: 0; }
      .lw-word-inner {
        display: inline-block;
        transform: translateY(110%);
        opacity: 0;
        transition: transform 0.72s cubic-bezier(0.16,1,0.3,1),
                    opacity   0.72s cubic-bezier(0.16,1,0.3,1);
      }
      .lw-word-inner.in {
        transform: translateY(0);
        opacity: 1;
      }

      /* Line clip: whole line rises through overflow:hidden parent */
      .lw-line-clip { overflow: hidden; display: block; }
      .lw-line-inner {
        display: block;
        transform: translateY(105%);
        opacity: 0;
        transition: transform 0.72s cubic-bezier(0.16,1,0.3,1),
                    opacity   0.72s cubic-bezier(0.16,1,0.3,1);
      }
      .lw-line-inner.in {
        transform: translateY(0);
        opacity: 1;
      }

      /* Slide-in from right for paragraph */
      .lw-slide-right {
        transform: translateX(36px);
        opacity: 0;
        transition: transform 0.8s cubic-bezier(0.16,1,0.3,1),
                    opacity   0.8s cubic-bezier(0.16,1,0.3,1);
      }
      .lw-slide-right.in {
        transform: translateX(0);
        opacity: 1;
      }

      /* Animated grow divider */
      .lw-divider-line {
        transform-origin: left;
        transform: scaleX(0);
        transition: transform 1.1s cubic-bezier(0.16,1,0.3,1);
      }
      .lw-divider-line.in { transform: scaleX(1); }

      @media (prefers-reduced-motion: reduce) {
        .lw-marquee-left, .lw-marquee-right, .lw-marquee-lane { animation: none !important; }
        .lw-word-inner, .lw-line-inner, .lw-slide-right { transition: none !important; }
        .lw-word-inner, .lw-line-inner, .lw-slide-right { transform: none !important; opacity: 1 !important; }
      }
    `}</style>
  );
}

// ─── useReveal — adds "in" class when element enters viewport ─────────────────
function useReveal(ref: React.RefObject<HTMLElement | null>, delay = 0) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (delay) el.style.transitionDelay = `${delay}ms`;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
}

// ─── SplitWords — animates each word rising from overflow:hidden clip ─────────
// Triggers when the wrapper enters viewport; words stagger by `stagger`ms each.
function SplitWords({
  text, className = "", baseDelay = 0, stagger = 55,
}: {
  text: string; className?: string; baseDelay?: number; stagger?: number;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const words = text.split(" ");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        wordRefs.current.forEach((el, i) => {
          if (!el) return;
          el.style.transitionDelay = `${baseDelay + i * stagger}ms`;
          el.classList.add("in");
        });
      },
      { threshold: 0.08 }
    );
    io.observe(container);
    return () => io.disconnect();
  }, [baseDelay, stagger]);

  return (
    <span ref={containerRef} className={className} style={{ display: "inline" }}>
      {words.map((word, i) => (
        <span key={i} className="lw-word-clip">
          <span
            ref={el => { wordRefs.current[i] = el; }}
            className="lw-word-inner"
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}

// ─── SplitLines — each line slides up through overflow clip, staggered ────────
function SplitLines({
  lines, baseDelay = 0,
}: {
  lines: React.ReactNode[];
  baseDelay?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        lineRefs.current.forEach((el, i) => {
          if (!el) return;
          el.style.transitionDelay = `${baseDelay + i * 110}ms`;
          el.classList.add("in");
        });
      },
      { threshold: 0.08 }
    );
    io.observe(container);
    return () => io.disconnect();
  }, [baseDelay]);

  return (
    <div ref={containerRef}>
      {lines.map((line, i) => (
        <div key={i} className="lw-line-clip">
          <div
            ref={el => { lineRefs.current[i] = el; }}
            className="lw-line-inner"
          >
            {line}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SlideRight — paragraph slides in from right ──────────────────────────────
function SlideRight({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref as React.RefObject<HTMLElement>, delay);
  return (
    <div ref={ref} className={`lw-slide-right ${className}`}>
      {children}
    </div>
  );
}

// ─── Original helpers (unchanged) ─────────────────────────────────────────────
function useParallax(
  containerRef: React.RefObject<HTMLDivElement>,
  imageRef: React.RefObject<HTMLDivElement>,
  intensity = 70
) {
  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = 1 - rect.bottom / (rect.height + vh);
      const clamped = Math.max(-0.1, Math.min(1.1, progress));
      const y = (0.5 - clamped) * intensity * 2;
      image.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(1.08)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [containerRef, imageRef, intensity]);
}

function FadeIn({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = `opacity 650ms ease ${delay}ms, transform 650ms ease ${delay}ms`;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return <div ref={ref} className={className}>{children}</div>;
}

function MarqueeRow({ items, reverse = false, duration = 28 }: {
  items: string[]; reverse?: boolean; duration?: number;
}) {
  const repeated = [...items, ...items, ...items, ...items];
  return (
    <div className="lw-marquee-lane">
      <div
        className={`lw-marquee-track ${reverse ? "lw-marquee-right" : "lw-marquee-left"}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {repeated.map((tag, i) => (
          <span key={`${tag}-${i}`} className="lw-marquee-chip">{tag}</span>
        ))}
      </div>
      <div className="lw-marquee-fade-left" />
      <div className="lw-marquee-fade-right" />
    </div>
  );
}

function ParallaxHeroImage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  useParallax(containerRef, imageRef, 70);
  return (
    <div
      ref={containerRef}
      className="max-w-[1400px] mx-auto rounded-3xl overflow-hidden relative h-[320px] md:h-[500px] lg:h-[560px]
                 border border-[#046241]/12 dark:border-white/10
                 shadow-[0_10px_40px_rgba(4,98,65,0.12)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
    >
      <div
        ref={imageRef}
        style={{
          position: "absolute", top: "-16%", left: 0,
          width: "100%", height: "132%",
          willChange: "transform",
          transform: "translate3d(0,0,0) scale(1.08)",
        }}
      >
        <img
          src={CAREERS_HERO_IMAGE}
          alt="Lifewood team collaborating around a table"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-transparent to-black/25 pointer-events-none" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE — only text nodes changed, all layout/sections preserved
// ═══════════════════════════════════════════════════════════════════
export default function CareersPage() {
  // Divider line ref for the closing section
  const dividerRef = useRef<HTMLDivElement>(null);
  useReveal(dividerRef as React.RefObject<HTMLElement>);

  return (
    <main className="bg-brand-paper dark:bg-brand-dark text-[#0f2318] dark:text-white overflow-x-hidden">
      <CareersAnimations />

      {/* ── HERO HEADER ── */}
      <section className="px-6 md:px-16 pt-14 md:pt-20 pb-10">
        <div className="max-w-[1400px] mx-auto">

          {/* Badge — original FadeIn preserved */}
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full
                            bg-white dark:bg-[#1a3326]
                            border border-[#046241]/15 dark:border-[#4ade80]/20 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB347] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#046241] dark:text-[#4ade80]">
                Careers At Lifewood
              </span>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 md:gap-16 items-end">

            {/* Left — headline + CTA: text now uses line-by-line clip reveal */}
            <FadeIn>
              <div>
                {/* "Careers in" / "Lifewood" — each line clips up independently */}
                <SplitLines
                  baseDelay={0}
                  lines={[
                    <h1 className="text-4xl md:text-6xl font-black leading-[0.95] tracking-[-0.03em]
                                   text-[#0f2318] dark:text-white">
                      Careers in
                    </h1>,
                    <h1 className="text-4xl md:text-6xl font-black leading-[0.95] tracking-[-0.03em] mb-6
                                   text-[#046241] dark:text-[#FFB347]">
                      Lifewood
                    </h1>,
                  ]}
                />

                {/* CTA — original markup, wrapped in FadeIn timing */}
                <a
                  href={JOIN_US_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 rounded-full
                             bg-[#046241] dark:bg-[#FFB347]
                             text-white dark:text-[#0f2318]
                             px-6 py-3 text-[11px] font-black uppercase tracking-[0.22em]
                             shadow-[0_8px_28px_rgba(4,98,65,0.3)] dark:shadow-[0_8px_28px_rgba(255,179,71,0.3)]
                             hover:scale-105 active:scale-95 transition-all"
                >
                  Join Us
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </FadeIn>

            {/* Right — paragraph slides in from right */}
            <FadeIn delay={120}>
              <SlideRight delay={120}>
                <p className="max-w-[560px] lg:ml-auto text-[16px] md:text-[20px] leading-[1.45] text-[#1a3326]/70 dark:text-white/70">
                  Innovation, adaptability and the rapid development of new services
                  separates companies that constantly deliver at the highest level
                  from their competitors.
                </p>
              </SlideRight>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── HERO PARALLAX IMAGE — unchanged ── */}
      <section className="px-6 md:px-16 pb-14 md:pb-20">
        <FadeIn>
          <ParallaxHeroImage />
        </FadeIn>
      </section>

      {/* ── MOTIVATING TEAMS ── */}
      <section className="px-6 md:px-16 pb-14 md:pb-20">
        <div className="max-w-[1120px] mx-auto text-center">
          <FadeIn>
            {/* Headline — two lines clip up */}
            <SplitLines
              baseDelay={0}
              lines={[
                <h2 className="text-[40px] md:text-[60px] leading-[0.96] tracking-[-0.03em] font-black
                               text-[#0f2318] dark:text-white">
                  It means motivating
                </h2>,
                <h2 className="text-[40px] md:text-[60px] leading-[0.96] tracking-[-0.03em] font-black mb-4
                               text-[#046241] dark:text-[#FFB347]">
                  and growing teams
                </h2>,
              ]}
            />

            {/* Body — word by word stagger */}
            <div className="mb-8">
              <SplitWords
                text="Teams that can initiate and learn on the run in order to deliver evolving technologies and targets. It's a big challenge, but innovation, especially across borders, has never been the easy path."
                className="max-w-[820px] mx-auto text-[14px] md:text-[16px] leading-[1.65] text-[#1a3326]/65 dark:text-white/65"
                baseDelay={200}
                stagger={40}
              />
            </div>
          </FadeIn>

          {/* Marquee — unchanged */}
          <FadeIn delay={120}>
            <div className="lw-marquee-shell space-y-2">
              <MarqueeRow items={TAG_ROWS[0]} duration={30} />
              <MarqueeRow items={TAG_ROWS[1]} reverse duration={34} />
              <MarqueeRow items={TAG_ROWS[2]} duration={32} />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CLOSING STATEMENT ── */}
      <section className="px-6 md:px-16 pb-20 md:pb-28">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn>
            {/* Divider — line grows from left */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-2 h-2 rounded-full bg-[#046241] dark:bg-[#FFB347] flex-shrink-0" />
              <div className="h-px flex-1 overflow-hidden bg-transparent">
                <div
                  ref={dividerRef}
                  className="lw-divider-line h-full bg-gradient-to-r from-[#046241]/20 dark:from-[#FFB347]/20 to-transparent"
                />
              </div>
            </div>

            {/* Pull-quote — word by word, two waves */}
            <p className="text-center text-[24px] md:text-[40px] leading-[1.14] tracking-[-0.02em] font-medium
                          text-[#0f2318]/90 dark:text-white/90">
              {/* First sentence — words 0..N animate together */}
              <SplitWords
                text="If you're looking to turn the page on a new chapter in your career, make contact with us today."
                baseDelay={100}
                stagger={38}
              />
              {" "}
              {/* Second sentence starts after first finishes */}
              <SplitWords
                text="At Lifewood, the adventure is always before you, it's why we've been described as"
                baseDelay={800}
                stagger={36}
              />
              {" "}
              {/* Final phrase — highlighted, its own clip */}
              <span className="lw-line-clip" style={{ display: "inline-block" }}>
                <span
                  ref={el => {
                    if (!el) return;
                    const io = new IntersectionObserver(([e]) => {
                      if (e.isIntersecting) {
                        el.style.transitionDelay = "1600ms";
                        el.classList.add("in");
                        io.disconnect();
                      }
                    }, { threshold: 0.08 });
                    io.observe(el);
                  }}
                  className="lw-line-inner text-[#046241] dark:text-[#FFB347] font-black"
                >
                  "always on, never off."
                </span>
              </span>
            </p>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}