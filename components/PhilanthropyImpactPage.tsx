import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
} from "framer-motion";
import OfficeMap from "./OfficeMap";

// ─── Data ─────────────────────────────────────────────────────────────────
const PARALLAX_IMAGE =
  "https://framerusercontent.com/images/7RZ9ESz7UTTmxn6ifh8I9jHlHA.png?width=1004&height=591";

const IMPACT_OFFICES = [
  { city: "South Africa", lat: -30.5595, lng: 22.9375 },
  { city: "Nigeria", lat: 9.082, lng: 8.6753 },
  { city: "Republic of the Congo", lat: -0.228, lng: 15.8277 },
  { city: "Democratic Republic of the Congo", lat: -4.0383, lng: 21.7587 },
  { city: "Ghana", lat: 7.9465, lng: -1.0232 },
  { city: "Madagascar", lat: -18.7669, lng: 46.8691 },
  { city: "Benin", lat: 9.3077, lng: 2.3158 },
  { city: "Uganda", lat: 1.3733, lng: 32.2903 },
  { city: "Kenya", lat: -0.0236, lng: 37.9062 },
  { city: "Ivory Coast", lat: 7.54, lng: -5.5471 },
  { city: "Egypt", lat: 26.8206, lng: 30.8025 },
  { city: "Ethiopia", lat: 9.145, lng: 40.4897 },
  { city: "Niger", lat: 17.6078, lng: 8.0817 },
  { city: "Tanzania", lat: -6.369, lng: 34.8888 },
  { city: "Namibia", lat: -22.9576, lng: 18.4904 },
  { city: "Zambia", lat: -13.1339, lng: 27.8493 },
  { city: "Zimbabwe", lat: -19.0154, lng: 29.1549 },
  { city: "Liberia", lat: 6.4281, lng: -9.4295 },
  { city: "Sierra Leone", lat: 8.4606, lng: -11.7799 },
  { city: "Bangladesh", lat: 23.685, lng: 90.3563 },
];

const ARTICLES = [
  {
    num: "01",
    label: "Partnership",
    body: "In partnership with our philanthropic partners, Lifewood has expanded operations in South Africa, Nigeria, Republic of the Congo, Democratic Republic of the Congo, Ghana, Madagascar, Benin, Uganda, Kenya, Ivory Coast, Egypt, Ethiopia, Niger, Tanzania, Namibia, Zambia, Zimbabwe, Liberia, Sierra Leone, and Bangladesh.",
    img: "https://framerusercontent.com/images/H6g74f7ON0rYqleh3DuDC7wLLn4.png?width=1004&height=591",
    imgAlt: "Partnership impact",
  },
  {
    num: "02",
    label: "Application",
    body: "This requires the application of our methods and experience for the development of people in under resourced economies.",
    img: "https://framerusercontent.com/images/06PBWoX2dQvZzJ4GCFpMLVH9ZA.jpg?width=3458&height=5187",
    imgAlt: "Application impact",
    flip: true,
  },
  {
    num: "03",
    label: "Expanding",
    body: "We are expanding access to training, establishing equitable wage structures and career and leadership progression to create sustainable change, by equipping individuals to take the lead and grow the business for themselves for the long term benefit of everyone.",
    img: "https://framerusercontent.com/images/YuQdLXDoPq70vyVGWddKObRr4.png?width=599&height=394",
    imgAlt: "Expanding impact",
  },
];



// ─── Global CSS ────────────────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @keyframes _lw-intro-wipe {
        0%   { opacity:1; clip-path:inset(0 0 0 0); }
        100% { opacity:0; clip-path:inset(0 0 100% 0); }
      }
      @keyframes _lw-intro-beam {
        0%   { transform:translateX(-140%); opacity:0; }
        20%  { opacity:.7; }
        100% { transform:translateX(140%); opacity:0; }
      }
      @keyframes _lw-float {
        0%,100% { transform:translateY(0); }
        50%     { transform:translateY(-6px); }
      }
      @keyframes _lw-spin  { to { transform:rotate(360deg); } }
      @keyframes _lw-glow  {
        0%,100% { box-shadow:0 0 14px 4px rgba(255,179,71,.45),0 0 26px 9px rgba(255,179,71,.2); }
        50%     { box-shadow:0 0 22px 7px rgba(255,179,71,.7),0 0 38px 14px rgba(255,179,71,.3); }
      }
      @keyframes _lw-shine {
        0%   { transform:translateX(-130%) skewX(-22deg); opacity:0; }
        15%  { opacity:.18; }
        45%  { transform:translateX(130%) skewX(-22deg); opacity:0; }
        100% { transform:translateX(130%) skewX(-22deg); opacity:0; }
      }
      @keyframes _lw-pulse-ring {
        0%   { transform:scale(1); opacity:.6; }
        100% { transform:scale(2.2); opacity:0; }
      }

      ._lw-intro {
        position:fixed; inset:0; z-index:70; pointer-events:none;
        background:linear-gradient(120deg,#0f2318 0%,#046241 55%,#0f2318 100%);
        animation:_lw-intro-wipe 1050ms cubic-bezier(.16,1,.3,1) forwards;
      }
      ._lw-intro::after {
        content:""; position:absolute; top:0; bottom:0; width:34%;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);
        filter:blur(10px);
        animation:_lw-intro-beam 900ms ease-out forwards;
      }
      ._lw-float   { animation:_lw-float 4.2s ease-in-out infinite; }
      ._lw-spin    { animation:_lw-spin 14s linear infinite; }
      ._lw-glow    { animation:_lw-glow 2.4s ease-in-out infinite; }

      /* card tilt */
      ._lw-card {
        position:relative; overflow:hidden;
        transform-style:preserve-3d;
        transition:transform .38s cubic-bezier(.22,1,.36,1), box-shadow .38s ease;
        will-change:transform;
      }
      ._lw-card:hover { box-shadow:0 22px 56px rgba(4,98,65,.18); }
      .dark ._lw-card:hover { box-shadow:0 22px 56px rgba(0,0,0,.48); }
      ._lw-card-shine {
        position:absolute; inset:-45%; pointer-events:none;
        background:linear-gradient(120deg,transparent 38%,rgba(255,255,255,.22) 50%,transparent 62%);
        transform:translateX(-130%) skewX(-22deg);
        animation:_lw-shine 5s ease-in-out infinite;
      }

      /* article number watermark */
      ._lw-art-num {
        font-size: clamp(60px, 8vw, 100px);
        font-weight: 900;
        line-height: 1;
        letter-spacing: -0.04em;
        color: transparent;
        -webkit-text-stroke: 1px rgba(4,98,65,.08);
        user-select: none; pointer-events: none;
      }
      .dark ._lw-art-num { -webkit-text-stroke: 1px rgba(255,255,255,.05); }

      @media (prefers-reduced-motion:reduce) {
        ._lw-intro,._lw-float,._lw-spin,._lw-glow,._lw-card-shine { animation:none!important; }
        ._lw-card { transition:none!important; transform:none!important; }
        ._lw-intro { display:none!important; }
      }
    `}</style>
  );
}

// ─── Intro overlay ─────────────────────────────────────────────────────────
function IntroOverlay() {
  const [gone, setGone] = useState(false);
  if (gone) return null;
  return <div aria-hidden className="_lw-intro" onAnimationEnd={() => setGone(true)} />;
}

// ─── Word-by-word reveal ───────────────────────────────────────────────────
function SplitReveal({
  text, className = "", delay = 0, tag: Tag = "span",
}: {
  text: string; className?: string; delay?: number; tag?: keyof JSX.IntrinsicElements;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref as React.RefObject<HTMLElement>, { once: true, amount: 0.35 });
  const words = text.split(" ");
  return (
    // @ts-ignore
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "108%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : {}}
            transition={{ duration: 0.68, delay: delay + i * 0.048, ease: [0.16, 1, 0.3, 1] }}
          >
            {w}{i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

// ─── Scroll-triggered fade + blur reveal ──────────────────────────────────
function Reveal({
  children, delay = 0, className = "", y = 28, amount = 0.12,
}: {
  children: React.ReactNode; delay?: number; className?: string; y?: number; amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y, filter: "blur(5px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Magnetic link ─────────────────────────────────────────────────────────
function MagneticLink({ href, children, className }: {
  href: string; children: React.ReactNode; className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 340, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 340, damping: 22, mass: 0.6 });
  const move = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.38);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.38);
  };
  return (
    <motion.a ref={ref} href={href} className={className} style={{ x: sx, y: sy }}
      onMouseMove={move} onMouseLeave={() => { x.set(0); y.set(0); }}
      whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}>
      {children}
    </motion.a>
  );
}


// ─── Shimmer divider ───────────────────────────────────────────────────────
function Divider({ delay = 0 }: { delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <motion.div ref={ref} className="relative h-px overflow-hidden"
      style={{ background: "rgba(4,98,65,.09)" }}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={inView ? { scaleX: 1, opacity: 1 } : {}}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div className="absolute inset-y-0 left-0 w-[30%]"
        style={{ background: "linear-gradient(90deg,transparent,rgba(4,98,65,.45),transparent)" }}
        animate={{ x: ["-100%", "440%"] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
      />
    </motion.div>
  );
}

// ─── Parallax scroll hook ──────────────────────────────────────────────────
function useParallax(
  containerRef: React.RefObject<HTMLDivElement>,
  imageRef: React.RefObject<HTMLDivElement>,
  intensity = 70
) {
  useEffect(() => {
    const c = containerRef.current, img = imageRef.current;
    if (!c || !img) return;
    let raf = 0, curY = 0, tgtY = 0;
    const update = () => {
      raf = 0;
      const r = c.getBoundingClientRect();
      const p = Math.max(-0.1, Math.min(1.1, 1 - r.bottom / (r.height + window.innerHeight)));
      tgtY = (0.5 - p) * intensity * 2;
      curY += (tgtY - curY) * 0.16;
      img.style.transform = `translateY(${curY.toFixed(1)}px)`;
      if (Math.abs(tgtY - curY) > 0.18) raf = requestAnimationFrame(update);
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
  }, []);
}

function useHeroParallax(
  sectionRef: React.RefObject<HTMLElement>,
  imageRef: React.RefObject<HTMLDivElement>,
  topRef: React.RefObject<HTMLDivElement>,
  botRef: React.RefObject<HTMLDivElement>
) {
  useEffect(() => {
    const s = sectionRef.current, img = imageRef.current;
    if (!s || !img) return;
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) {
      img.style.transform = "translate3d(0,0,0) scale(1.1)"; return;
    }
    let raf = 0, active = true;
    let cY = 0, cS = 1.13, cR = 0, cT = 0, cB = 0;
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
    const update = () => {
      raf = 0;
      const r = s.getBoundingClientRect();
      const p = clamp((window.innerHeight - r.top) / (r.height + window.innerHeight), 0, 1);
      const c = p - 0.5;
      const tY = -c * 300, tS = 1.13 + (0.08 - Math.abs(c) * 0.07);
      const tR = c * 1.2, tT = c * 110, tB = -c * 85;
      cY += (tY - cY) * 0.13; cS += (tS - cS) * 0.11;
      cR += (tR - cR) * 0.13; cT += (tT - cT) * 0.15; cB += (tB - cB) * 0.15;
      img.style.transform = `translate3d(0,${cY.toFixed(1)}px,0) scale(${cS.toFixed(3)}) rotate(${cR.toFixed(2)}deg)`;
      if (topRef.current) topRef.current.style.transform = `translate3d(0,${cT.toFixed(1)}px,0)`;
      if (botRef.current) botRef.current.style.transform = `translate3d(0,${cB.toFixed(1)}px,0)`;
      if (Math.abs(tY - cY) > 0.2 || Math.abs(tS - cS) > 0.001) raf = requestAnimationFrame(update);
    };
    const onScroll = () => { if (active && !raf) raf = requestAnimationFrame(update); };
    const io = new IntersectionObserver(([e]) => {
      active = e.isIntersecting;
      if (active && !raf) raf = requestAnimationFrame(update);
    }, { rootMargin: "240px 0px" });
    io.observe(s); update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}

// ─── Parallax image wrapper ────────────────────────────────────────────────
function ParallaxImage({ src, alt, className = "", intensity = 70 }: {
  src: string; alt: string; className?: string; intensity?: number;
}) {
  const c = useRef<HTMLDivElement>(null), img = useRef<HTMLDivElement>(null);
  useParallax(c, img, intensity);
  return (
    <div ref={c} className={`relative overflow-hidden ${className}`}>
      <div ref={img} style={{ position: "absolute", top: "-20%", left: 0, width: "100%", height: "140%", willChange: "transform" }}>
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    </div>
  );
}

// ─── 3D tilt card ──────────────────────────────────────────────────────────
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    let raf = 0;
    const s = { rx: 0, ry: 0, ty: 0 };
    const render = () => {
      raf = 0;
      el.style.transform = `perspective(1200px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg) translateY(${s.ty.toFixed(1)}px)`;
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      s.rx = -((e.clientY - r.top) / r.height - 0.5) * 6;
      s.ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
      s.ty = -4;
      if (!raf) raf = requestAnimationFrame(render);
    };
    const reset = () => { s.rx = 0; s.ry = 0; s.ty = 0; if (!raf) raf = requestAnimationFrame(render); };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={ref} className={`_lw-card ${className}`}>
      {children}
      <span aria-hidden className="_lw-card-shine" />
    </div>
  );
}

// ─── Spinning "be amazed" circle ───────────────────────────────────────────
function BeAmazedCircle() {
  const TEXT = "be amazed • be amazed • be amazed •";
  const R = 46;
  const chars = TEXT.split("");
  return (
    <div className="flex flex-col items-center select-none">
      <div className="_lw-spin" style={{ width: R * 2 + 28, height: R * 2 + 28, position: "relative" }}>
        {chars.map((ch, i) => {
          const angle = (i / chars.length) * 360;
          const rad = (angle * Math.PI) / 180;
          const cx = R + 14;
          return (
            <span key={i} style={{
              position: "absolute",
              left: cx + R * Math.sin(rad), top: cx - R * Math.cos(rad),
              transform: `translate(-50%,-50%) rotate(${angle}deg)`,
              fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
              textTransform: "uppercase", lineHeight: 1,
            }} className="text-[#046241] dark:text-[#FFB347]">{ch}</span>
          );
        })}
        <div className="_lw-glow rounded-full bg-[#FFB347]"
          style={{ position: "absolute", width: 26, height: 26, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
      </div>
      <div className="mt-2 flex flex-col items-center gap-0.5">
        <div className="w-px h-5 bg-[#046241]/35 dark:bg-[#FFB347]/35" />
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className="text-[#046241] dark:text-[#FFB347] opacity-60">
          <path d="M1 1l6 7 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

// ─── Pulsing dot ───────────────────────────────────────────────────────────
function PulseDot({ color = "#046241" }: { color?: string }) {
  return (
    <span className="relative inline-flex" style={{ width: 8, height: 8 }}>
      <span className="absolute inline-flex rounded-full opacity-60"
        style={{ background: color, animation: "_lw-pulse-ring 1.8s ease-out infinite", inset: 0 }} />
      <span className="relative inline-flex rounded-full" style={{ background: color, width: 8, height: 8 }} />
    </span>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────
export default function PhilanthropyImpactPage() {
  const heroSection = useRef<HTMLElement>(null);
  const heroImage = useRef<HTMLDivElement>(null);
  const heroTop = useRef<HTMLDivElement>(null);
  const heroBot = useRef<HTMLDivElement>(null);
  useHeroParallax(heroSection, heroImage, heroTop, heroBot);

  return (
    <main className="bg-brand-paper dark:bg-brand-dark text-[#0f2318] dark:text-white overflow-x-hidden relative">
      <GlobalStyles />
      <IntroOverlay />

      {/* Ambient orbs — fixed, always visible */}
      <motion.div aria-hidden className="fixed pointer-events-none"
        style={{ top: "8%", left: "-12%", width: 700, height: 700, filter: "blur(90px)", zIndex: 0,
          background: "radial-gradient(circle, rgba(4,98,65,0.055) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.1, 1], x: [0, 22, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div aria-hidden className="fixed pointer-events-none"
        style={{ bottom: "10%", right: "-10%", width: 580, height: 580, filter: "blur(80px)", zIndex: 0,
          background: "radial-gradient(circle, rgba(4,98,65,0.04) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.08, 1], y: [0, -24, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* ══════════════════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════════════════ */}
      <section className="px-6 md:px-16 pt-16 pb-6 relative z-10">
        <div className="max-w-[1400px] mx-auto">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5
                       bg-[#046241]/8 dark:bg-[#046241]/15
                       border border-[#046241]/12 dark:border-[#046241]/25"
          >
            <PulseDot color="#046241" />
            <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#046241] dark:text-[#FFB347]">
              Lifewood Foundation
            </span>
          </motion.div>

          {/* Heading */}
          <div className="mb-4">
            <h1 className="font-black leading-tight tracking-[-0.02em] text-[#0f2318] dark:text-white
                           text-4xl md:text-5xl">
              <SplitReveal text="Philanthropy" delay={0.18} />
              <br />
              <SplitReveal text="and Impact" delay={0.28}
                className="inline-block text-[1.1em] text-[#046241] dark:text-[#FFB347]" />
            </h1>
          </div>

          {/* Description + CTA — matches TypeA/B/C left panel */}
          <Reveal delay={0.05} className="max-w-[480px] mb-4">
            <p className="text-base leading-relaxed text-[#1a3326]/65 dark:text-white">
              We direct resources into education and developmental projects that create lasting
              change — building sustainable growth and empowering communities for the future.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <MagneticLink href="/contact"
              className="inline-flex items-center gap-3 rounded-full
                         bg-[#046241] dark:bg-[#FFB347]
                         text-white dark:text-[#0f2318]
                         px-5 py-2.5 text-[12px] font-black uppercase tracking-widest
                         shadow-lg shadow-[#046241]/25 dark:shadow-[#FFB347]/25"
            >
              Contact Us
              <motion.svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </MagneticLink>
          </Reveal>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          HERO PARALLAX IMAGE
      ══════════════════════════════════════════════════ */}
      <section
        ref={heroSection}
        aria-label="Philanthropy impact visual"
        className="relative w-full h-[100vh] md:h-[130vh] overflow-hidden"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div ref={heroImage}
            style={{ position: "absolute", top: "-26%", left: 0, width: "100%", height: "156%",
              willChange: "transform", transform: "translate3d(0,0,0) scale(1.13)" }}
          >
            <img src={PARALLAX_IMAGE} alt="Philanthropy impact" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.04) 40%, rgba(0,0,0,0.42) 100%)" }} />

          {/* Parallax film strips */}
          <div ref={heroTop}
            className="absolute inset-x-0 top-[33%] h-[8vh] pointer-events-none"
            style={{ background: "rgba(0,0,0,0.18)", backdropFilter: "blur(1px)", willChange: "transform" }} />
          <div ref={heroBot}
            className="absolute inset-x-0 top-[63%] h-[8vh] pointer-events-none"
            style={{ background: "rgba(0,0,0,0.16)", backdropFilter: "blur(1px)", willChange: "transform" }} />


          {/* Floating caption bottom-right */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.65 }}
            className="absolute bottom-10 right-6 md:right-16 z-10"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.26em] text-white/78 text-right leading-[1.9]">
              Africa &<br />Indian Sub-continent
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          VISION PULLQUOTE
      ══════════════════════════════════════════════════ */}
      <section className="px-6 md:px-16 -mt-[30vh] pt-0 pb-16 md:pb-24 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <Reveal className="mt-1 md:mt-2">
            {/* Dot + rule */}


            {/* Big quote */}
            <p className="text-base md:text-xl leading-relaxed tracking-[-0.01em] font-medium
                          text-[#0f2318] dark:text-white max-w-[860px] mx-auto text-center">
              <SplitReveal
                text="Our vision is of a world where financial investment plays a central role in solving the social and environmental challenges facing the global community, specifically in Africa and the Indian sub-continent."
                delay={0.032}
              />
            </p>

            <Reveal delay={0.12} className="mt-9 flex justify-center">
              <MagneticLink href="#impact-list"
                className="inline-flex items-center gap-3 rounded-full
                           bg-[#046241] dark:bg-[#FFB347]
                           text-white dark:text-[#0f2318]
                           px-5 py-2.5 text-[12px] font-black uppercase tracking-widest
                           shadow-lg shadow-[#046241]/25 dark:shadow-[#FFB347]/25"
              >
                Know Us Better
                <motion.svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </MagneticLink>
            </Reveal>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          MAP
      ══════════════════════════════════════════════════ */}
      <section className="px-6 md:px-16 pb-16 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <Divider />

          <div className="flex items-start justify-between gap-6 mt-14 mb-8">
            <Reveal>
              <h2 className="font-black leading-tight tracking-[-0.02em]
                             text-3xl md:text-5xl
                             text-[#0f2318] dark:text-white">
                Transforming
              
                <span className="text-[#046241] dark:text-[#FFB347]"> Communities</span>
                <br />
                Worldwide
              </h2>
            </Reveal>
            <div className="hidden md:flex pt-3 flex-shrink-0">
              <BeAmazedCircle />
            </div>
          </div>

          <Reveal delay={0.08}>
            <div className="relative rounded-3xl overflow-hidden h-[300px] md:h-[500px]
                            border border-[#046241]/10 dark:border-white/8
                            shadow-[0_16px_56px_rgba(4,98,65,0.12)] dark:shadow-[0_16px_56px_rgba(0,0,0,0.48)]">
              {/* Top shimmer on map */}
              <div className="absolute top-0 left-8 right-8 h-px z-10 rounded-full pointer-events-none"
                style={{ background: "linear-gradient(90deg,transparent,rgba(4,98,65,.28),transparent)" }} />
              <OfficeMap offices={IMPACT_OFFICES as any} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          IMPACT ARTICLES
      ══════════════════════════════════════════════════ */}
      <section id="impact-list" className="px-6 md:px-16 pb-24 relative z-10">
        <div className="max-w-[1400px] mx-auto">

          {/* Chapter intro */}
          <Divider />
          <Reveal className="py-14">
            <article className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 md:gap-14 items-start">
              <div className="flex items-center gap-3 text-[18px] md:text-[26px] font-black
                              text-[#1b1b1b]/55 dark:text-white leading-none tracking-tight">
                <span className="w-5 h-px bg-[#046241]/35 dark:bg-white/20 flex-shrink-0" />
                Impact
              </div>
              <p className="text-base md:text-xl leading-relaxed
                            tracking-[-0.01em] font-medium text-[#0f2318]/85 dark:text-white">
                Through purposeful partnerships and sustainable investment, we empower communities
                across Africa and the Indian sub-continent to create lasting economic and social
                transformation.
              </p>
            </article>
          </Reveal>

          {/* Articles */}
          {ARTICLES.map((a, idx) => (
            <React.Fragment key={a.num}>
              <Divider delay={0.04} />
              <Reveal delay={0.04} className="py-14">
                <article className="relative">
                  {/* Watermark number */}
                  <div aria-hidden className="_lw-art-num absolute -top-4 left-0 select-none">
                    {a.num}
                  </div>

                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center
                                   ${a.flip ? "md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1" : ""}`}>

                    {/* Text */}
                    <div className="relative z-10">
                      {/* Number + label */}
                      <div className="flex items-center gap-3 mb-5">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]
                                         text-[#046241]/40 dark:text-[#FFB347]/85">
                          {a.num}
                        </span>
                        <span className="h-px w-8 bg-[#046241]/20 dark:bg-[#FFB347]/18" />
                      </div>

                      {/* Title */}
                      <h3 className="font-black tracking-[-0.02em] leading-tight
                                     text-4xl md:text-5xl
                                     text-[#0f2318] dark:text-white mb-5">
                        <SplitReveal text={a.label} delay={0.06} />
                      </h3>

                      {/* Animated underline */}
                      <motion.div className="h-[2px] w-14 rounded-full mb-6 bg-[#046241] dark:bg-[#FFB347] origin-left"
                        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} />

                      <p className="text-[13px] leading-[1.85] text-[#1a3326]/60 dark:text-white max-w-[460px]">
                        {a.body}
                      </p>
                    </div>

                    {/* Image */}
                    <TiltCard className="rounded-2xl">
                      <ParallaxImage src={a.img} alt={a.imgAlt}
                        className="rounded-2xl h-[260px] md:h-[380px]
                                   shadow-[0_18px_52px_rgba(4,98,65,0.16)] dark:shadow-[0_18px_52px_rgba(0,0,0,0.5)]
                                   border border-[#046241]/8 dark:border-white/7"
                        intensity={58}
                      />
                    </TiltCard>
                  </div>
                </article>
              </Reveal>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CLOSING
      ══════════════════════════════════════════════════ */}
      <section className="px-6 md:px-16 pb-28 md:pb-40 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <Divider />
          <Reveal className="pt-16">

            <div className="flex items-center gap-4 mb-10">
              <motion.div className="w-2 h-2 rounded-full bg-[#046241] dark:bg-[#FFB347]"
                animate={{ scale: [1, 1.45, 1] }} transition={{ duration: 2.2, repeat: Infinity }} />
              <motion.div className="h-px flex-1 bg-gradient-to-r from-[#046241]/18 dark:from-[#FFB347]/18 to-transparent origin-left"
                initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} />
            </div>

            <p className="font-medium leading-tight tracking-[-0.02em]
                          text-3xl md:text-5xl
                          text-[#0f2318] dark:text-white max-w-[700px]">
              Working with new intelligence for a{" "}
              <span className="text-[#046241] dark:text-[#FFB347]">
                <SplitReveal text="better world." delay={0.08} />
              </span>
            </p>

            <div className="mt-12 flex items-center gap-6">
              <MagneticLink href="/contact"
                className="inline-flex items-center gap-3 rounded-full
                           bg-[#046241] dark:bg-[#FFB347]
                           text-white dark:text-[#0f2318]
                           px-7 py-3.5 text-[11px] font-black uppercase tracking-[0.22em]
                           shadow-[0_10px_32px_rgba(4,98,65,0.3)]"
              >
                Get Involved
                <motion.svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </MagneticLink>

              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#1a3326]/32 dark:text-white">
                Lifewood Foundation
              </span>
            </div>

          </Reveal>
        </div>
      </section>

    </main>
  );
}
