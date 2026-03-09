import React, { Suspense, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from './ErrorBoundary';

const OfficeMap = React.lazy(() => import('./OfficeMap'));

// ─── Office data ──────────────────────────────────────────────────────────────
const OFFICES = [
  { city: 'Kuala Lumpur', country: 'Malaysia',       flag: '🇲🇾', lat: 3.1390,   lng: 101.6869, address: ['Level 18, Menara 1', 'Jalan Example 123', '50450 Kuala Lumpur'], phone: '+60 3-1234 5678', email: 'kl@lifewood.com' },
  { city: 'Singapore',    country: 'Singapore',      flag: '🇸🇬', lat: 1.3521,   lng: 103.8198, address: ['10 Anson Road', 'International Plaza', '079903 Singapore'],    phone: '+65 6123 4567',  email: 'sg@lifewood.com' },
  { city: 'Shenzhen',     country: 'China',          flag: '🇨🇳', lat: 22.5431,  lng: 114.0579, address: ['Floor 12, Tech Tower', 'Nanshan District', 'Shenzhen 518000'], phone: '+86 755 1234 5678', email: 'cn@lifewood.com' },
  { city: 'Cebu City',    country: 'Philippines',    flag: '🇵🇭', lat: 10.3157,  lng: 123.8854, address: ['Cebu Business Center', 'A.S. Fortuna St', 'Cebu City'],       phone: '+63 32 123 4567', email: 'ph@lifewood.com' },
  { city: 'Bengaluru',    country: 'India',          flag: '🇮🇳', lat: 12.9716,  lng: 77.5946,  address: ['Tech Park Rd', 'Whitefield', 'Bengaluru 560066'],              phone: '+91 80 1234 5678', email: 'in@lifewood.com' },
  { city: 'Sydney',       country: 'Australia',      flag: '🇦🇺', lat: -33.8688, lng: 151.2093, address: ['100 George St', 'Sydney NSW 2000'],                           phone: '+61 2 6123 4567', email: 'au@lifewood.com' },
  { city: 'London',       country: 'United Kingdom', flag: '🇬🇧', lat: 51.5072,  lng: -0.1276,  address: ['10 Downing St', 'London SW1A'],                               phone: '+44 20 7123 4567', email: 'uk@lifewood.com' },
  { city: 'Dallas',       country: 'United States',  flag: '🇺🇸', lat: 32.7767,  lng: -96.797,  address: ['Downtown Plaza', 'Dallas, TX'],                               phone: '+1 214-123-4567', email: 'us@lifewood.com' },
];

// ─── Animated counter hook — replays every time element enters viewport ──────
function useCounter(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

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

// ─── Rotating Text Widget ─────────────────────────────────────────────────────
const BeAmazedCircle: React.FC = () => {
  const TEXT = 'be amazed • be amazed • be amazed •';
  const RADIUS = 68;
  const chars = TEXT.split('');
  const total = chars.length;

  return (
    <>
      <style>{`
        @keyframes lw-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes lw-glow {
          0%, 100% { box-shadow: 0 0 18px 6px rgba(255,179,71,0.55), 0 0 40px 12px rgba(255,179,71,0.2); }
          50%       { box-shadow: 0 0 28px 10px rgba(255,179,71,0.85), 0 0 60px 20px rgba(255,179,71,0.35); }
        }
        .lw-spin-ring { animation: lw-spin 14s linear infinite; }
        .lw-spin-ring:hover { animation-play-state: paused; }
        .lw-glow-dot  { animation: lw-glow 2.4s ease-in-out infinite; }
      `}</style>
      <div className="flex flex-col items-center justify-center select-none">
        <div className="relative lw-spin-ring" style={{ width: RADIUS * 2 + 40, height: RADIUS * 2 + 40 }}>
          {chars.map((char, i) => {
            const angle = (i / total) * 360;
            const rad   = (angle * Math.PI) / 180;
            const cx    = RADIUS + 20;
            const x     = cx + RADIUS * Math.sin(rad);
            const y     = cx - RADIUS * Math.cos(rad);
            return (
              <span key={i} style={{
                position: 'absolute', left: x, top: y,
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                fontSize: '10px', fontWeight: 800,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'currentColor', lineHeight: 1,
              }} className="text-[#046241] dark:text-[#4ade80]">{char}</span>
            );
          })}
          <div className="lw-glow-dot absolute rounded-full bg-[#FFB347]"
            style={{ width: 40, height: 40, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        </div>
        <div className="mt-2 flex flex-col items-center gap-0.5">
          <div className="w-px h-5 bg-[#046241]/40 dark:bg-[#4ade80]/40" />
          <svg className="text-[#046241] dark:text-[#4ade80] opacity-70" width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M1 1l6 7 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const OfficesPage: React.FC = () => {
  const [activeOffice, setActiveOffice] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [mapOffice, setMapOffice] = useState<(typeof OFFICES)[number] | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  const resources = useCounter(56788, 1600);
  const countries = useCounter(30, 900);
  const centers   = useCounter(40, 900);
  const fmt = (v: number) => new Intl.NumberFormat('en-US').format(v);

  const goTo = (i: number) => {
    setDirection(i > activeOffice ? 1 : -1);
    setActiveOffice(i);
  };

  const office = OFFICES[activeOffice];
  const viewOnMap = () => {
    setMapOffice(office);
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const variants = {
    enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir: number) => ({ x: dir * -40, opacity: 0 }),
  };

  return (
    <section className="px-6 md:px-16 py-24 bg-brand-paper dark:bg-brand-dark transition-colors duration-500">
      <div className="max-w-7xl mx-auto">

        {/* ══════════════════ HEADER ══════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-5 rounded-full
                              bg-white dark:bg-[#1a3326]
                              border border-[#046241]/15 dark:border-[#4ade80]/20 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFB347] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#046241] dark:text-[#4ade80]">
                  Our Company
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-[-0.03em] leading-[0.93] mb-4
                             text-[#0f2318] dark:text-white">
                Global{' '}
                <span className="text-[#046241] dark:text-[#FFB347]">offices</span>
              </h1>
              <p className="max-w-md text-[15px] leading-relaxed text-[#1a3326]/60 dark:text-white/65">
                We operate regional hubs across Asia, Oceania, Europe and the Americas to support
                operations, partnerships and data services worldwide.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:flex items-center justify-center"
            >
              <BeAmazedCircle />
            </motion.div>
          </div>
        </motion.div>

        {/* ══════════════════ MAP + STATS ══════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start"
        >
          {/* Map */}
          <div
            ref={mapRef}
            className="relative rounded-3xl overflow-hidden
                       bg-[#e8f2ec] dark:bg-[#0d2018]
                       border border-[#046241]/10 dark:border-white/8
                       shadow-[0_4px_40px_rgba(4,98,65,0.1)] dark:shadow-[0_4px_40px_rgba(0,0,0,0.4)]"
            style={{ minHeight: '500px' }}
          >
            <ErrorBoundary fallback={
              <img src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1400&q=80"
                alt="Map placeholder" className="w-full h-full object-cover" />
            }>
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '500px' }}>
                  <div className="flex items-center gap-3 text-[#046241]/60 dark:text-[#4ade80]/60">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span className="text-[12px] font-bold uppercase tracking-[0.2em]">Loading map…</span>
                  </div>
                </div>
              }>
                <OfficeMap offices={OFFICES as any} activeOffice={mapOffice as any} />
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* ── Stats + Slideshow sidebar ── */}
          <div className="flex flex-col gap-3">

            {/* Online Resources card — EXACT colors from document */}
            <div
              ref={resources.ref}
              className="relative flex-1 rounded-3xl p-7 flex flex-col justify-between
                         bg-[#046241] dark:bg-[#FFB347]
                         shadow-[0_8px_40px_rgba(4,98,65,0.35)] dark:shadow-[0_8px_40px_rgba(255,179,71,0.25)]
                         transition-colors duration-500"
            >
              {/* Subtle top shimmer */}
              <div className="absolute top-0 left-6 right-6 h-px rounded-full
                              bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-white/70" />
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/60 dark:text-[#0f2318]/60">
                    Online Resources
                  </p>
                </div>
                <p className="text-[52px] lg:text-[60px] font-black leading-none tracking-[-0.04em]
                              text-white dark:text-[#0f2318] mb-1">
                  {fmt(resources.val)}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55 dark:text-[#0f2318]/50">
                  Active contributors
                </p>
              </div>
              <div className="mt-6 space-y-4">
                <div className="h-px bg-white/20 dark:bg-[#0f2318]/15" />
                <div ref={countries.ref} className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-white/70 dark:text-[#0f2318]/65">Countries</span>
                  <span className="text-2xl font-black text-white dark:text-[#0f2318]">
                    {countries.val}<span className="text-base text-white/60 dark:text-[#0f2318]/55"> +</span>
                  </span>
                </div>
                <div className="h-px bg-white/20 dark:bg-[#0f2318]/15" />
                <div ref={centers.ref} className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-white/70 dark:text-[#0f2318]/65">Centers</span>
                  <span className="text-2xl font-black text-white dark:text-[#0f2318]">
                    {centers.val}<span className="text-base text-white/60 dark:text-[#0f2318]/55"> +</span>
                  </span>
                </div>
              </div>
            </div>

            {/* ── Office slideshow card — EXACT colors from document ── */}
            <div className="rounded-3xl overflow-hidden
                            bg-white dark:bg-[#0d2018]
                            border border-[#e4ede7] dark:border-white/10
                            shadow-[0_4px_20px_rgba(4,98,65,0.07)]">

              {/* Slide content */}
              <div className="relative p-3.5 overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={activeOffice}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-xl">{office.flag}</span>
                      <div>
                        <p className="text-[13px] font-black text-[#0f2318] dark:text-white leading-tight">
                          {office.city}
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#046241] dark:text-[#4ade80]">
                          {office.country}
                        </p>
                      </div>
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FFB347] shadow-[0_0_6px_#FFB347]" />
                    </div>

                    <div className="h-px bg-[#046241]/8 dark:bg-white/8 mb-1.5" />

                    <div className="space-y-0 mb-1.5">
                      {office.address.slice(0, 2).map((l, i) => (
                        <p key={i} className="text-[10px] text-[#1a3326]/55 dark:text-white/55 leading-[1.45]">{l}</p>
                      ))}
                    </div>

                    <a href={`tel:${office.phone}`}
                      className="flex items-center gap-1.5 mb-0.5 text-[10px] font-medium
                                 text-[#1a3326]/50 dark:text-white/45
                                 hover:text-[#046241] dark:hover:text-[#4ade80] transition-colors">
                      <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 0115 .18a2 2 0 012 1.81v3.04a2 2 0 01-1.45 1.95l-1.27.42a16 16 0 006.29 6.29l.42-1.27A2 2 0 0122 16.92z" />
                      </svg>
                      {office.phone}
                    </a>

                    <a href={`mailto:${office.email}`}
                      className="flex items-center gap-1.5 mb-1 text-[10px] font-black uppercase tracking-[0.16em]
                                 text-[#046241] dark:text-[#4ade80] hover:opacity-80 transition-opacity">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      {office.email}
                    </a>

                    <button
                      type="button"
                      onClick={viewOnMap}
                      className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-[#046241]/20 dark:border-white/10
                                 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em]
                                 text-[#046241] dark:text-[#4ade80]
                                 hover:bg-[#046241]/8 dark:hover:bg-[#FFB347]/10 transition-colors focus:outline-none"
                    >
                      View on map
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </button>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Nav bar — same arrow style as original dots */}
              <div className="flex items-center justify-between px-3.5 py-2
                              border-t border-[#046241]/8 dark:border-white/8">
                <button
                  onClick={() => goTo(Math.max(0, activeOffice - 1))}
                  disabled={activeOffice === 0}
                  className="group flex items-center justify-center w-6 h-6 rounded-full
                             border border-[#046241]/20 dark:border-white/10
                             hover:border-[#046241]/50 dark:hover:border-[#FFB347]/40
                             hover:bg-[#046241]/8 dark:hover:bg-[#FFB347]/10
                             disabled:opacity-25 transition-all duration-200 focus:outline-none"
                >
                  <svg className="w-3 h-3 text-[#046241]/60 dark:text-white/50
                                  group-hover:text-[#046241] dark:group-hover:text-[#FFB347] transition-colors"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex items-center gap-1">
                  {OFFICES.map((_, i) => (
                    <button key={i} onClick={() => goTo(i)} className="focus:outline-none p-0.5">
                      <motion.div
                        animate={{ width: activeOffice === i ? 16 : 5, opacity: activeOffice === i ? 1 : 0.3 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="h-1 rounded-full bg-[#046241] dark:bg-[#FFB347]"
                      />
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => goTo(Math.min(OFFICES.length - 1, activeOffice + 1))}
                  disabled={activeOffice === OFFICES.length - 1}
                  className="group flex items-center justify-center w-6 h-6 rounded-full
                             border border-[#046241]/20 dark:border-white/10
                             hover:border-[#046241]/50 dark:hover:border-[#FFB347]/40
                             hover:bg-[#046241]/8 dark:hover:bg-[#FFB347]/10
                             disabled:opacity-25 transition-all duration-200 focus:outline-none"
                >
                  <svg className="w-3 h-3 text-[#046241]/60 dark:text-white/50
                                  group-hover:text-[#046241] dark:group-hover:text-[#FFB347] transition-colors"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default OfficesPage;
