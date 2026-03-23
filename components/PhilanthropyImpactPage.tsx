import React, { Suspense, useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useInView,
} from "framer-motion";

const OfficeMap = React.lazy(() => import('./OfficeMap'));

const EASE = [0.16, 1, 0.3, 1] as const;

const PARALLAX_IMAGE = "https://framerusercontent.com/images/7RZ9ESz7UTTmxn6ifh8I9jHlHA.png?width=1004&height=591";

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
  },
  {
    num: "02",
    label: "Application",
    body: "This requires the application of our methods and experience for the development of people in under resourced economies.",
    img: "https://framerusercontent.com/images/06PBWoX2dQvZzJ4GCFpMLVH9ZA.jpg?width=3458&height=5187",
  },
  {
    num: "03",
    label: "Expanding",
    body: "We are expanding access to training, establishing equitable wage structures and career and leadership progression to create sustainable change, by equipping individuals to take the lead and grow the business for themselves for the long term benefit of everyone.",
    img: "https://framerusercontent.com/images/YuQdLXDoPq70vyVGWddKObRr4.png?width=599&height=394",
  },
];

const STATS = [
  { value: "20+", label: "Countries", detail: "across Africa & Asia" },
  { value: "500+", label: "Communities", detail: "directly supported" },
  { value: "10K+", label: "Livelihoods", detail: "created & sustained" },
];

function useCounter(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number | null>(null);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const run = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setVal(0);
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setVal(Math.round(eased * target));
        if (t < 1) { rafRef.current = requestAnimationFrame(step); }
      };
      rafRef.current = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) run();
    }, { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return { val, ref };
}

function AnimatedStat({ valueString, label, detail }: { valueString: string, label: string, detail: string }) {
  const match = valueString.match(/^([\d,.]+)(.*)$/);
  const target = match ? parseFloat(match[1].replace(/,/g, '')) : 0;
  const suffix = match ? match[2] : '';
  const { val, ref } = useCounter(target, 1400);

  return (
    <article ref={ref} className="h-full rounded-[28px] border border-[#d4e4db] bg-white p-7 shadow-[0_10px_35px_rgba(4,98,65,0.05)] dark:border-[#2a4535] dark:bg-[#122318]">
      <p className="text-4xl font-black tracking-[-0.04em] text-[#046241] dark:text-[#FFB347] md:text-5xl">
        {val}{suffix}
      </p>
      <h3 className="mt-4 text-[13px] font-black uppercase tracking-[0.18em] text-[#0f2318] dark:text-white">
        {label}
      </h3>
      <p className="mt-3 text-sm leading-7 text-[#2d5040] dark:text-[#a8c4b4]">{detail}</p>
    </article>
  );
}

function navigate(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

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
      @keyframes _lw-ticker {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
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

      ._lw-card {
        position:relative; overflow:hidden;
        transform-style:preserve-3d;
        transition:transform .38s cubic-bezier(.22,1,.36,1), box-shadow .38s ease;
        will-change:transform;
      }
      ._lw-card:hover { box-shadow:0 28px 64px rgba(4,98,65,.14); }
      ._lw-card-shine {
        position:absolute; inset:-45%; pointer-events:none;
        background:linear-gradient(120deg,transparent 38%,rgba(255,255,255,.18) 50%,transparent 62%);
        transform:translateX(-130%) skewX(-22deg);
        animation:_lw-shine 5s ease-in-out infinite;
      }

      ._lw-marquee-track {
        display: flex;
        width: max-content;
      }
      ._lw-ticker  { animation:_lw-ticker 28s linear infinite; }

      @media (prefers-reduced-motion:reduce) {
        ._lw-intro,._lw-card-shine,._lw-ticker { animation:none!important; }
        ._lw-card { transition:none!important; transform:none!important; }
        ._lw-intro { display:none!important; }
      }
    `}</style>
  );
}

function IntroOverlay() {
  const [gone, setGone] = useState(false);
  if (gone) return null;
  return <div aria-hidden className="_lw-intro" onAnimationEnd={() => setGone(true)} />;
}

function SplitReveal({ text, className = "", delay = 0, tag: Tag = "span" }: {
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

function MagneticLink({ href, children, className, onClick }: {
  href?: string; children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent) => void;
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
    // @ts-ignore
    <motion.a ref={ref} href={href} className={className} style={{ x: sx, y: sy }}
      onMouseMove={move} onMouseLeave={() => { x.set(0); y.set(0); }}
      onClick={onClick}
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}>
      {children}
    </motion.a>
  );
}

function PulseDot({ color = "#046241" }: { color?: string }) {
  return (
    <span className="relative inline-flex" style={{ width: 8, height: 8 }}>
      <span className="absolute inline-flex rounded-full opacity-60"
        style={{ background: color, animation: "_lw-pulse-ring 1.8s ease-out infinite", inset: 0 }} />
      <span className="relative inline-flex rounded-full" style={{ background: color, width: 8, height: 8 }} />
    </span>
  );
}

function useParallax(containerRef: React.RefObject<HTMLDivElement>, imageRef: React.RefObject<HTMLDivElement>, intensity = 70) {
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
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", update); if (raf) cancelAnimationFrame(raf); };
  }, [intensity]);
}

function useHeroParallax(sectionRef: React.RefObject<HTMLElement>, imageRef: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const s = sectionRef.current, img = imageRef.current;
    if (!s || !img) return;
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) { img.style.transform = "translate3d(0,0,0) scale(1.1)"; return; }
    let raf = 0, active = true;
    let cY = 0, cS = 1.13;
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
    const update = () => {
      raf = 0;
      const r = s.getBoundingClientRect();
      const p = clamp((window.innerHeight - r.top) / (r.height + window.innerHeight), 0, 1);
      const c = p - 0.5;
      const tY = -c * 200, tS = 1.13 + (0.05 - Math.abs(c) * 0.05);
      cY += (tY - cY) * 0.13; cS += (tS - cS) * 0.11;
      img.style.transform = `translate3d(0,${cY.toFixed(1)}px,0) scale(${cS.toFixed(3)})`;
      if (Math.abs(tY - cY) > 0.2 || Math.abs(tS - cS) > 0.001) raf = requestAnimationFrame(update);
    };
    const onScroll = () => { if (active && !raf) raf = requestAnimationFrame(update); };
    const io = new IntersectionObserver(([e]) => { active = e.isIntersecting; if (active && !raf) raf = requestAnimationFrame(update); }, { rootMargin: "240px 0px" });
    io.observe(s); update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", update); if (raf) cancelAnimationFrame(raf); };
  }, []);
}

function ParallaxImage({ src, alt, className = "", intensity = 70 }: { src: string; alt: string; className?: string; intensity?: number; }) {
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

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    let raf = 0; const s = { rx: 0, ry: 0, ty: 0 };
    const render = () => { raf = 0; el.style.transform = `perspective(1200px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg) translateY(${s.ty.toFixed(1)}px)`; };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      s.rx = -((e.clientY - r.top) / r.height - 0.5) * 6;
      s.ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
      s.ty = -4;
      if (!raf) raf = requestAnimationFrame(render);
    };
    const reset = () => { s.rx = 0; s.ry = 0; s.ty = 0; if (!raf) raf = requestAnimationFrame(render); };
    el.addEventListener("pointermove", onMove); el.addEventListener("pointerleave", reset);
    return () => { el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", reset); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={ref} className={`_lw-card ${className}`}>
      {children}
      <span aria-hidden className="_lw-card-shine" />
    </div>
  );
}

function Ticker() {
  const items = ["Partnership", "Impact", "Communities", "Education", "Growth", "Africa", "Bangladesh", "Empowerment", "Sustainable Change"];
  const repeated = [...items, ...items];
  return (
    <div className="overflow-hidden border-t border-[#0f2318]/5 dark:border-white/5 py-5 select-none bg-[#fcfdfd]/60 dark:bg-[#08150d] backdrop-blur-md" aria-hidden>
      <div className="_lw-marquee-track _lw-ticker gap-12">
        {repeated.map((item, i) => (
          <span key={i} className="flex items-center gap-12 whitespace-nowrap">
            <span className="text-[13px] font-bold italic tracking-wide text-[#0f2318]/30 dark:text-white/25 uppercase">
              {item}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB347]/50 flex-shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

function SectionEyebrow({ children, animated = false }: { children: React.ReactNode, animated?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#046241]/18 bg-white px-4 py-2 shadow-sm dark:border-[#FFB347]/20 dark:bg-[#1a3326]">
      {animated ? <PulseDot color="#FFB347" /> : <span className="h-2 w-2 rounded-full bg-[#FFB347]" />}
      <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#046241] dark:text-[#FFB347]">
        {children}
      </span>
    </div>
  );
}

export default function PhilanthropyImpactPage() {
  const heroSection = useRef<HTMLElement>(null);
  const heroImage = useRef<HTMLDivElement>(null);
  useHeroParallax(heroSection, heroImage);

  useEffect(() => {
    const prevBody = document.body.style.backgroundColor;
    const prevHtml = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#ffffff';
    document.documentElement.style.backgroundColor = '#ffffff';
    return () => {
      document.body.style.backgroundColor = prevBody;
      document.documentElement.style.backgroundColor = prevHtml;
    };
  }, []);

  return (
    <main
      className="bg-white text-[#0f2318] dark:bg-[#0a1a10] dark:text-white overflow-x-hidden relative"
      style={{ fontFamily: "Poppins, Sora, 'Segoe UI', sans-serif" }}
    >
      <GlobalStyles />
      <IntroOverlay />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroSection} className="relative isolate px-6 pb-14 pt-14 md:px-16 md:pb-20 md:pt-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <Reveal className="flex flex-col justify-between rounded-[34px] border border-[#d4e4db] bg-white p-7 shadow-[0_25px_80px_rgba(4,98,65,0.07)] dark:border-[#2a4535] dark:bg-[#122318] md:p-10">
            <div>
              <SectionEyebrow animated>Lifewood Foundation</SectionEyebrow>
              <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[0.96] tracking-[-0.05em] text-[#0f2318] dark:text-white md:text-6xl">
                <SplitReveal text="Philanthropy" delay={0.2} />
                <span className="block text-[#046241] dark:text-[#FFB347]">
                  <SplitReveal text="& Impact" delay={0.32} />
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-8 text-[#2d5040] dark:text-[#a8c4b4] md:text-[17px]">
                We direct resources into education and developmental projects that create lasting
                change — building sustainable growth and empowering communities for the future.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <MagneticLink
                  onClick={() => navigate("/contact")}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#046241] px-7 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-[0_14px_32px_rgba(4,98,65,0.28)] transition-all hover:bg-opacity-90 dark:bg-[#FFB347] dark:text-[#0f2318] dark:shadow-[0_14px_32px_rgba(255,179,71,0.2)]"
                >
                  Get Involved
                </MagneticLink>
                <MagneticLink
                  onClick={() => {
                    document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#046241]/25 bg-white px-7 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#046241] transition-colors hover:border-[#046241]/50 hover:bg-[#eef5f1] dark:border-[#a8c4b4]/25 dark:bg-[#1a3326] dark:text-[#a8c4b4] dark:hover:border-[#FFB347]/40 dark:hover:text-[#FFB347]"
                >
                  See our impact
                </MagneticLink>
              </div>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#046241]/10 bg-[#f4f8f6] px-4 py-4 dark:border-[#2a4535] dark:bg-[#152e22]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#046241] dark:text-[#FFB347]">Region of focus</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#1a3326] dark:text-[#c8ddd3]">Africa & Indian Sub-continent</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="grid gap-4">
            <div className="relative overflow-hidden rounded-[34px] border border-[#c8ddd3] bg-[#0f2318] shadow-[0_25px_80px_rgba(4,98,65,0.14)] dark:border-[#2a4535] h-[400px] md:h-auto">
              <div ref={heroImage} style={{ position: "absolute", top: "-26%", left: 0, width: "100%", height: "156%", willChange: "transform", transform: "translate3d(0,0,0) scale(1.13)" }}>
                <img src={PARALLAX_IMAGE} alt="Philanthropy impact" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#07140e]/60 to-transparent pointer-events-none" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section className="px-6 py-14 md:px-16 md:py-16 bg-[#fcfdfd] dark:bg-[#08150d] border-t border-[#046241]/5 dark:border-[#2a4535]">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 lg:grid-cols-3">
            {STATS.map((stat, index) => (
              <Reveal key={stat.label} delay={0.06 * index}>
                <AnimatedStat valueString={stat.value} label={stat.label} detail={stat.detail} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <Ticker />

      {/* ── VISION ──────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-16 dark:bg-[#0a1a10] md:px-16 md:py-24 border-t border-[#046241]/5 dark:border-[#2a4535]">
        <div className="mx-auto max-w-5xl text-center">
          <Reveal>
            <SectionEyebrow animated>Our Vision</SectionEyebrow>
            <h2 className="mt-8 text-3xl font-black leading-snug tracking-[-0.02em] text-[#0f2318] dark:text-white md:text-5xl">
              <SplitReveal text='"A world where financial investment plays a central role in solving the social and environmental challenges facing the global community, specifically in Africa and the Indian sub-continent."' delay={0.1} />
            </h2>
          </Reveal>
        </div>
      </section>

      {/* ── MAP ─────────────────────────────────────────────────── */}
      <section className="px-6 pb-20 pt-10 md:px-16 md:pb-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <SectionEyebrow animated>Global Reach</SectionEyebrow>
              <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] text-[#0f2318] dark:text-white md:text-5xl">
                <SplitReveal text="Transforming communities" delay={0.1} />
                <span className="block text-[#046241] dark:text-[#FFB347]">
                  <SplitReveal text="worldwide." delay={0.3} />
                </span>
              </h2>
            </div>
          </Reveal>
          
          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-[34px] border border-[#c8ddd3] bg-[#0e1f16] p-4 shadow-[0_24px_70px_rgba(4,98,65,0.08)] dark:border-[#2a4535] dark:bg-[#122318]">
              <div className="h-[400px] md:h-[540px] w-full bg-[#f8fbfa] dark:bg-[#0d1f15] rounded-[24px] overflow-hidden relative">
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#046241]/50 dark:text-[#FFB347]/50">Loading map...</span>
                  </div>
                }>
                  <OfficeMap offices={IMPACT_OFFICES as any} />
                </Suspense>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="mt-8 flex flex-wrap gap-2 justify-center lg:justify-start">
            {IMPACT_OFFICES.map((o) => (
              <span key={o.city} className="rounded-full border border-[#046241]/10 bg-white px-3.5 py-2 text-[11px] font-semibold text-[#1a3326] dark:border-[#2a4535] dark:bg-[#1a3326] dark:text-[#c8ddd3]">
                {o.city}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── IMPACT STORIES ──────────────────────────────────────────────────────── */}
      <section id="impact" className="border-t border-[#046241]/8 bg-[#f8fbfa] px-6 py-16 dark:border-[#2a4535] dark:bg-[#0a150e] md:px-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-12">
            <SectionEyebrow animated>Impact Stories</SectionEyebrow>
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] text-[#0f2318] dark:text-white md:text-5xl">
              Through purposeful partnerships,
              <span className="block text-[#046241] dark:text-[#FFB347]">we empower individuals.</span>
            </h2>
          </Reveal>

          <div className="grid gap-6 lg:gap-8">
            {ARTICLES.map((a, index) => (
              <Reveal key={a.num} delay={0.06 * index}>
                <article className="grid overflow-hidden rounded-[30px] border border-[#d4e4db] bg-white shadow-[0_14px_45px_rgba(4,98,65,0.06)] dark:border-[#2a4535] dark:bg-[#122318] md:grid-cols-[1.1fr_0.9fr]">
                  <div className={`flex flex-col justify-center p-8 md:p-14 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                    <div className="flex items-center gap-4 mb-6 text-[#046241] dark:text-[#FFB347]">
                      <span className="text-3xl font-black leading-none">{a.num}</span>
                      <div className="h-px w-12 bg-[#046241]/20 dark:bg-[#FFB347]/30" />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight text-[#0f2318] dark:text-white md:text-4xl">
                      <SplitReveal text={a.label} delay={0.06} />
                    </h3>
                    <p className="mt-5 text-[15px] leading-8 text-[#2d5040] dark:text-[#a8c4b4] max-w-2xl">
                      {a.body}
                    </p>
                  </div>
                  <div className={`${index % 2 === 1 ? 'md:order-1 border-r' : 'md:border-l'} border-[#d4e4db] dark:border-[#2a4535]`}>
                    <TiltCard className="h-[300px] md:h-full w-full rounded-none border-none">
                      <ParallaxImage src={a.img} alt={a.label} className="h-full w-full" intensity={40} />
                    </TiltCard>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ──────────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="overflow-hidden rounded-[36px] border border-[#0f2318]/8 bg-[#0f2318] px-7 py-10 text-white shadow-[0_30px_90px_rgba(4,98,65,0.2)] dark:border-[#2a4535] dark:bg-[#0d1f15] md:px-12 md:py-16">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFB347]">Working together</p>
                <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] text-white md:text-5xl">
                  Working with new intelligence
                  <span className="block">for a better world.</span>
                </h2>
                <p className="mt-6 max-w-2xl text-[15px] leading-8 text-[#a8c4b4]">
                  Join us in creating sustainable change across Africa and the Indian sub-continent through education, training, and equitable economic development.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col mt-4 lg:mt-0">
                <MagneticLink
                  onClick={() => navigate("/contact")}
                  className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#FFB347] px-8 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-[#0f2318] shadow-[0_10px_32px_rgba(255,179,71,0.25)] transition-colors hover:bg-opacity-90"
                >
                  Get Involved
                </MagneticLink>
                <MagneticLink
                  onClick={() => navigate("/about-us")}
                  className="inline-flex cursor-pointer items-center justify-center rounded-full border border-white/20 px-8 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-white transition-colors hover:border-[#FFB347]/50 hover:text-[#FFB347]"
                >
                  About Lifewood
                </MagneticLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}