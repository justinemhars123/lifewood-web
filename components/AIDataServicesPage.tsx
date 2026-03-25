import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

type OrbitService = {
  label: string;
  sub: string;
  icon: React.ReactNode;
};

const SERVICES: OrbitService[] = [
  {
    label: 'Video',
    sub: 'Collection, labelling, audit, subtitle generation',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.55-2.27A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Image',
    sub: 'Collection, classification, audit, object tagging',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.6-4.6a2 2 0 012.8 0L16 16m-2-2l1.6-1.6a2 2 0 012.8 0L20 14m-6-7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Audio',
    sub: 'Collection, voice/music categorization, intelligent cs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v3m0-14a3 3 0 00-3 3v4a3 3 0 106 0v-4a3 3 0 00-3-3z" />
      </svg>
    ),
  },
  {
    label: 'Text',
    sub: 'Collection, labelling, transcription, sentiment analysis',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.6a1 1 0 01.7.3l5.4 5.4a1 1 0 01.3.7V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

const RINGS = [
  { radius: 148, speed: 22, offset: 0 },
  { radius: 248, speed: -34, offset: Math.PI / 2 },
];

const OVERVIEW_VIDEO_EMBED_URL = 'https://www.youtube.com/embed/g_JvAVL0WY4';
const HERO_STATS = [
  { target: 30, label: 'Languages', suffix: '+', duration: 900 },
  { target: 999, label: 'Accuracy', suffix: '%', duration: 1100, format: (v: number) => (v / 10).toFixed(1) },
  { target: 56, label: 'Daily tasks', suffix: 'k+', duration: 1000 },
];

const CARD_BG = 'bg-white/80 dark:bg-gradient-to-r dark:from-[#24473b] dark:to-[#1a3a30]';
const CARD_BORDER = 'border border-[#133020]/10 dark:border-white/15';
const ORBIT_CARD_BG = 'bg-white dark:bg-[#0d2b1f]';
const ORBIT_CARD_BORDER = 'border border-[#046241]/18 dark:border-[#2c5d49]/70';

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
        if (t < 1) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) run(); }, { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return { val, ref };
}

const HeroStat: React.FC<{
  target: number; label: string; suffix: string; duration: number; format?: (v: number) => string;
}> = ({ target, label, suffix, duration, format }) => {
  const counter = useCounter(target, duration);
  const rendered = format ? format(counter.val) : String(counter.val);
  return (
    <div ref={counter.ref}>
      <div className="text-2xl font-black tracking-tight text-brand-dark dark:text-brand-seasalt">{rendered}{suffix}</div>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5 text-brand-dark/40 dark:text-brand-seasalt/45">{label}</div>
    </div>
  );
};

const Tag: React.FC<{ label: string; variant?: 'saffron' | 'default' }> = ({ label }) => (
  <div className="inline-flex items-center mb-4 px-3 py-1.5 rounded-full w-fit border bg-[#046241]/10 dark:bg-[#046241]/20 border-[#046241]/20 dark:border-[#046241]/30">
    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#046241] dark:text-[#4ade80]">{label}</span>
  </div>
);

const darkenColor = (hex: string, percent: number) => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3) color = color.split('').map((c) => c + c).join('');
  const num = Number.parseInt(color, 16);
  let r = Math.max(0, Math.min(255, Math.floor(((num >> 16) & 0xff) * (1 - percent))));
  let g = Math.max(0, Math.min(255, Math.floor(((num >> 8) & 0xff) * (1 - percent))));
  let b = Math.max(0, Math.min(255, Math.floor((num & 0xff) * (1 - percent))));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

// ─── DataAcquisitionCard ──────────────────────────────────────────────────────
const DataAcquisitionCard: React.FC<{ CARD_BG: string; CARD_BORDER: string }> = ({ CARD_BG, CARD_BORDER }) => {
  const [cardHovered, setCardHovered] = useState(false);
  const [hoveredAvatar, setHoveredAvatar] = useState<number | null>(null);
  const hoverProgress = useMotionValue(0);
  const smoothHover = useSpring(hoverProgress, { stiffness: 120, damping: 20, mass: 0.8 });
  const cardY = useTransform(smoothHover, [0, 1], [0, -14]);
  const cardScale = useTransform(smoothHover, [0, 1], [1, 1.02]);
  const glowOpacity = useTransform(smoothHover, [0, 1], [0.55, 1]);
  const saffronGlow = useTransform(smoothHover, [0, 1], [0.25, 0.65]);
  const ringOpacity = useTransform(smoothHover, [0, 1], [0.06, 0.35]);
  const barBg = useTransform(smoothHover, [0, 1], ['rgba(0,0,0,0.22)', 'rgba(4,98,65,0.22)']);
  const barTextOpacity = useTransform(smoothHover, [0, 1], [0.35, 0.85]);

  const avatars = [
    { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80', size: 46, top: '6%', left: '14%', dy: -5, delay: 0.0, name: 'Alex' },
    { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80', size: 38, top: '6%', left: '73%', dy: 4, delay: 0.4, name: 'Sam' },
    { src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80', size: 42, top: '42%', left: '1%', dy: -4, delay: 0.8, name: 'Chris' },
    { src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80', size: 38, top: '78%', left: '18%', dy: 5, delay: 0.2, name: 'Dana' },
    { src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80', size: 46, top: '76%', left: '67%', dy: -4, delay: 0.6, name: 'Jamie' },
    { src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80', size: 36, top: '40%', left: '86%', dy: 4, delay: 1.0, name: 'Pat' },
  ];
  const spokes = [
    { x2: '22%', y2: '12%' }, { x2: '80%', y2: '14%' }, { x2: '7%', y2: '53%' },
    { x2: '27%', y2: '88%' }, { x2: '76%', y2: '86%' }, { x2: '93%', y2: '50%' },
  ];
  const dots = [
    { top: '8%', left: '20%' }, { top: '8%', left: '80%' }, { top: '50%', left: '4%' },
    { top: '85%', left: '24%' }, { top: '84%', left: '76%' }, { top: '48%', left: '94%' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
      onHoverStart={() => { setCardHovered(true); hoverProgress.set(1); }}
      onHoverEnd={() => { setCardHovered(false); hoverProgress.set(0); }}
      style={{ y: cardY, scale: cardScale }}
      className={`rounded-[1.75rem] p-8 flex flex-col ${CARD_BG} ${CARD_BORDER} cursor-pointer will-change-transform
                  ${cardHovered ? 'shadow-2xl shadow-[#046241]/30 ring-1 ring-[#046241]/35' : 'shadow-none ring-0'}`}
    >
      <div className={`inline-flex items-center mb-4 px-3 py-1.5 rounded-full w-fit border transition-all duration-500 ease-out
                       ${cardHovered ? 'bg-[#046241]/30 border-[#4ade80]/50' : 'bg-[#046241]/10 dark:bg-[#046241]/20 border-[#046241]/20 dark:border-[#046241]/30'}`}>
        <span className={`text-[9px] font-black uppercase tracking-[0.25em] transition-colors duration-500 ${cardHovered ? 'text-[#4ade80]' : 'text-[#046241] dark:text-[#4ade80]'}`}>End-to-end</span>
      </div>
      <motion.h3 animate={{ y: cardHovered ? -2 : 0 }} transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="text-xl font-black tracking-tight mb-3 text-brand-dark dark:text-[#e9efea]">Data Acquisition</motion.h3>
      <p className="text-sm leading-relaxed mb-5 text-brand-dark/85 dark:text-[#d3ddd6]">
        End-to-end data acquisition solutions — curation, processing, and managed large-scale diverse datasets built for enterprise AI systems.
      </p>
      <div className="mt-auto rounded-2xl overflow-hidden relative bg-[#071911] border border-white/8" style={{ minHeight: 248 }}>
        <div className="absolute inset-0 pointer-events-none">
          <motion.div style={{ opacity: glowOpacity, scale: useTransform(smoothHover, [0, 1], [1, 1.35]) }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-[#046241]/22 blur-[55px]" />
          <motion.div style={{ opacity: saffronGlow }}
            className="absolute top-[18%] left-[12%] w-28 h-28 rounded-full bg-[#FFB347]/8 blur-[40px]" />
          <motion.div style={{ opacity: useTransform(smoothHover, [0, 1], [0.18, 0.45]) }}
            className="absolute bottom-[12%] right-[12%] w-24 h-24 rounded-full bg-[#046241]/18 blur-[32px]" />
        </div>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <motion.circle cx="50%" cy="50%" r="88" fill="none" style={{ opacity: ringOpacity }} stroke="#046241" strokeWidth="1" strokeDasharray="4 6" />
          <motion.circle cx="50%" cy="50%" r="50" fill="none" style={{ opacity: useTransform(smoothHover, [0, 1], [0.08, 0.42]) }} stroke="#4ade80" strokeWidth="1" strokeDasharray="3 5" />
          {spokes.map((l, i) => (
            <motion.line key={i} x1="50%" y1="50%" x2={l.x2} y2={l.y2}
              style={{ opacity: useTransform(smoothHover, [0, 1], [0.22, 0.65 - i * 0.02]) }}
              stroke="url(#spokeGrad)" strokeWidth="1" strokeDasharray="3 4" />
          ))}
          <defs>
            <linearGradient id="spokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFB347" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <motion.div animate={{ scale: [1, 1.7, 1], opacity: [0.18, 0, 0.18] }}
            transition={{ duration: cardHovered ? 1.2 : 3.2, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-[#046241]" />
          <motion.div animate={{ scale: [1, 1.45, 1], opacity: [0.22, 0, 0.22] }}
            transition={{ duration: cardHovered ? 1.2 : 3.2, delay: 0.6, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-[#046241]" />
          <motion.div
            animate={cardHovered ? { boxShadow: ['0 0 0 0px rgba(255,179,71,0)', '0 0 0 7px rgba(255,179,71,0.45)', '0 0 0 0px rgba(255,179,71,0)'] } : { boxShadow: '0 0 0 0px rgba(255,179,71,0)' }}
            transition={{ duration: 1.4, repeat: cardHovered ? Infinity : 0, ease: 'easeInOut' }}
            whileHover={{ scale: 1.1, transition: { type: 'spring', stiffness: 350, damping: 18 } }}
            className="relative w-14 h-14 rounded-full bg-white shadow-2xl border border-white/20 flex items-center justify-center p-2.5 z-10"
          >
            <img src="https://framerusercontent.com/images/mmBfl11ZRTsDKI8lhNBYvZHIEMo.png" alt="Lifewood" className="w-full h-full object-contain" />
          </motion.div>
          <motion.div animate={{ opacity: cardHovered ? 1 : 0.5, y: cardHovered ? 0 : 2 }} transition={{ duration: 0.35 }}
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[7px] font-black uppercase tracking-[0.22em] text-[#FFB347]">lifewood</span>
          </motion.div>
        </div>
        {avatars.map((av, i) => {
          const isThisHovered = hoveredAvatar === i;
          return (
            <motion.div key={i} className="absolute rounded-full overflow-hidden z-10 cursor-pointer"
              style={{ width: av.size, height: av.size, top: av.top, left: av.left }}
              initial={{ opacity: 0, scale: 0.4 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              animate={{
                y: [0, av.dy, 0],
                scale: isThisHovered ? 1.38 : cardHovered ? 1.1 : 1,
                boxShadow: isThisHovered ? `0 0 0 3px #FFB347, 0 0 24px rgba(255,179,71,0.55), 0 14px 36px rgba(0,0,0,0.65)` : cardHovered ? `0 0 0 2px rgba(255,179,71,0.4), 0 8px 22px rgba(0,0,0,0.5)` : `0 0 0 2px rgba(255,255,255,0.15), 0 4px 14px rgba(0,0,0,0.4)`,
                zIndex: isThisHovered ? 30 : 10,
              }}
              transition={{
                opacity: { duration: 0.55, delay: 0.4 + av.delay, ease: [0.16, 1, 0.3, 1] },
                y: { duration: 2.8 + i * 0.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' },
                scale: { type: 'spring', stiffness: 350, damping: 22 },
                boxShadow: { duration: 0.3 },
              }}
              onHoverStart={() => setHoveredAvatar(i)} onHoverEnd={() => setHoveredAvatar(null)}
            >
              <img src={av.src} alt={av.name} className="w-full h-full object-cover" />
              <motion.div initial={{ opacity: 0, y: 4, scale: 0.85 }}
                animate={isThisHovered ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 4, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#071911]/90 backdrop-blur-sm border border-[#FFB347]/40 px-2 py-0.5 rounded-full pointer-events-none z-40">
                <span className="text-[8px] font-black uppercase tracking-[0.15em] text-[#FFB347]">{av.name}</span>
              </motion.div>
            </motion.div>
          );
        })}
        {dots.map((dot, i) => (
          <motion.div key={i} className="absolute rounded-full bg-[#FFB347] z-[2]" style={{ top: dot.top, left: dot.left }}
            animate={{ width: cardHovered ? 7 : 5, height: cardHovered ? 7 : 5, scale: [1, cardHovered ? 2.6 : 1.9, 1], opacity: [cardHovered ? 0.55 : 0.28, 1, cardHovered ? 0.55 : 0.28] }}
            transition={{ width: { duration: 0.3 }, height: { duration: 0.3 }, scale: { duration: cardHovered ? 0.9 : 2.0 + i * 0.28, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }, opacity: { duration: cardHovered ? 0.9 : 2.0 + i * 0.28, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 } }}
          />
        ))}
        <motion.div style={{ backgroundColor: barBg }} className="absolute bottom-0 inset-x-0 px-4 py-2.5 flex items-center gap-2 border-t border-white/5 backdrop-blur-sm z-10">
          <motion.span animate={{ scale: cardHovered ? 1.4 : 1, opacity: cardHovered ? 1 : 0.5 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-1.5 h-1.5 rounded-full bg-[#FFB347] flex-shrink-0 animate-pulse" />
          <motion.span style={{ opacity: barTextOpacity }} className="text-[9px] font-bold uppercase tracking-[0.2em] text-white">
            Global data sourcing · 30+ regions
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── OrbitCard ────────────────────────────────────────────────────────────────
const OrbitCard: React.FC<{ svc: { label: string; sub: string; icon: React.ReactNode } }> = ({ svc }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      animate={{ scale: hovered ? 1.15 : 1, y: hovered ? -10 : 0, boxShadow: hovered ? '0 20px 40px rgba(4,98,65,0.28), 0 0 0 2px rgba(4,98,65,0.35)' : '0 4px 18px rgba(4,98,65,0.10)' }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={`w-[116px] min-h-[132px] rounded-2xl p-3.5 cursor-pointer flex flex-col items-center text-center gap-1.5 relative overflow-hidden
                 ${ORBIT_CARD_BG} ${ORBIT_CARD_BORDER} transition-[border-color,background-color] duration-300
                 ${hovered ? 'border-[#046241]/55 dark:border-[#4ade80]/55 bg-white dark:bg-[#0f3324]' : ''}`}
    >
      <motion.span animate={{ opacity: hovered ? 1 : 0, scaleX: hovered ? 1 : 0.3 }} transition={{ duration: 0.25 }}
        className="pointer-events-none absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-[#046241]/70 dark:via-[#4ade80]/70 to-transparent" />
      <motion.span animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.3 }}
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-[#046241]/8 dark:from-[#4ade80]/10 to-transparent" />
      <motion.span animate={{ scale: hovered ? 1.14 : 1, y: hovered ? -2 : 0, backgroundColor: hovered ? 'rgba(4,98,65,0.18)' : undefined }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        className="relative z-10 w-9 h-9 rounded-xl flex items-center justify-center bg-[#046241]/10 dark:bg-[#046241]/30 text-[#046241] dark:text-[#4ade80] transition-colors duration-200">
        {svc.icon}
      </motion.span>
      <motion.span animate={{ color: hovered ? '#046241' : undefined }}
        className="relative z-10 text-[11px] font-black uppercase tracking-[0.1em] leading-tight text-[#133020] dark:text-[#e8f5ee] dark:[color:inherit]"
        style={{ color: hovered ? '#046241' : undefined }}>{svc.label}</motion.span>
      <motion.span animate={{ opacity: hovered ? 0.9 : 0.6 }} transition={{ duration: 0.2 }}
        className="relative z-10 text-[9px] font-semibold leading-[1.4] text-[#133020]/60 dark:text-[#a8c4b2]">{svc.sub}</motion.span>
    </motion.div>
  );
};

// ─── OrbitRing ────────────────────────────────────────────────────────────────
const OrbitRing: React.FC<{ ring: typeof RINGS[number]; services: OrbitService[] }> = ({ ring, services }) => {
  const ringId = `orbit-ring-${ring.radius}`;
  const cardId = `orbit-card-${ring.radius}`;
  const dir = ring.speed > 0 ? 1 : -1;
  const absDuration = Math.abs(ring.speed);
  return (
    <>
      <div className="absolute rounded-full border border-dashed border-[#046241]/20 dark:border-[#2e5f4b]/45 pointer-events-none"
        style={{ width: ring.radius * 2, height: ring.radius * 2, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      <style>{`
        @keyframes ${ringId} { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(${dir * 360}deg); } }
        @keyframes ${cardId} { from { transform: rotate(0deg); } to { transform: rotate(${-dir * 360}deg); } }
      `}</style>
      <div className="absolute"
        style={{ width: ring.radius * 2, height: ring.radius * 2, top: '50%', left: '50%', animation: `${ringId} ${absDuration}s linear infinite`, willChange: 'transform' }}>
        {services.map((svc, i) => {
          const angle = (i / services.length) * 2 * Math.PI + ring.offset;
          const x = ring.radius + ring.radius * Math.cos(angle) - 58;
          const y = ring.radius + ring.radius * Math.sin(angle) - 58;
          return (
            <div key={svc.label} className="absolute"
              style={{ left: x, top: y, width: 116, animation: `${cardId} ${absDuration}s linear infinite`, willChange: 'transform' }}>
              <OrbitCard svc={svc} />
            </div>
          );
        })}
      </div>
    </>
  );
};

// ─── Showcase data ────────────────────────────────────────────────────────────
const SHOWCASE_ITEMS = [
  {
    tag: 'Core Service', tagVariant: 'saffron' as const, index: '01', title: 'Data Validation',
    desc: 'The goal is to create data that is consistent, accurate and complete, preventing data loss or errors in transfer, code or configuration. We meticulously verify that data conforms to robust predefined enterprise standards.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=2034',
    stat: { value: '99.8%', label: 'Accuracy rate' }, accent: '#046241',
  },
  {
    tag: 'Multi-modal', tagVariant: 'default' as const, index: '02', title: 'Data Collection',
    desc: 'Delivering multi-modal data collection across text, audio, image, and video, supported by advanced workflows for complex categorization, tagging, transcription, and sentiment analysis.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop',
    stat: { value: '30+', label: 'Languages covered' }, accent: '#046241',
  },
  {
    tag: 'End-to-end', tagVariant: 'saffron' as const, index: '03', title: 'Data Acquisition',
    desc: "Comprehensive end-to-end solutions combining curation, processing, and managed large-scale diverse datasets built explicitly to empower the world's most advanced AI systems.",
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
    stat: { value: '56k+', label: 'Daily tasks processed' }, accent: '#046241',
  },
  {
    tag: 'Reliability', tagVariant: 'default' as const, index: '04', title: 'Data Curation',
    desc: 'We sift, select and index data to ensure absolute reliability, accessibility and ease of classification. Curation designed to support business decisions, genealogies, and deep scientific research.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
    stat: { value: '500M+', label: 'Records curated' }, accent: '#046241',
  },
  {
    tag: 'AI Training', tagVariant: 'saffron' as const, index: '05', title: 'Data Annotation',
    desc: 'High quality annotation services for vision, speech and language processing. In the age of AI, structured, highly-accurate data acts as the ultimate foundational fuel.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1932&auto=format&fit=crop',
    stat: { value: '1B+', label: 'Labels delivered' }, accent: '#046241',
  },
];

// ─── Global scroll direction tracker ────────────────────────────────────────
let _lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
let _scrollDir: 'down' | 'up' = 'down';
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    _scrollDir = y > _lastScrollY ? 'down' : 'up';
    _lastScrollY = y;
  }, { passive: true });
}

// ─── ShowcaseItem — number badge lights up bidirectionally on scroll ──────────
const ShowcaseItem: React.FC<typeof SHOWCASE_ITEMS[number] & { isLast: boolean; itemIndex: number }> = ({
  tag, tagVariant, index, title, desc, image, stat, isLast, itemIndex,
}) => {
  const isEven = parseInt(index) % 2 === 0;
  const [active, setActive] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;
    // Fires when ≥35% of the card is visible.
    // On scroll-down: items activate 1→5 naturally as they enter from below.
    // On scroll-up: items activate 5→1 naturally as they re-enter from above.
    // We simply activate whenever visible, deactivate when not — direction is implicit.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
        } else {
          // Deactivate: if scrolling down, only deactivate items above viewport (low index first);
          // if scrolling up, only deactivate items below viewport.
          const rect = entry.boundingClientRect;
          const leavingFromBottom = rect.top > 0; // element exited below viewport
          const leavingFromTop = rect.bottom < 0; // element exited above viewport
          if (_scrollDir === 'down' && leavingFromTop) setActive(false);
          if (_scrollDir === 'up' && leavingFromBottom) setActive(false);
          // Also deactivate if both checks fail (safety)
          if (!leavingFromBottom && !leavingFromTop) setActive(false);
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: '-80px' }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative grid grid-cols-1 lg:grid-cols-[1fr_80px_1fr] gap-0 items-center"
    >
      {/* ── Timeline spine ── */}
      <div className="hidden lg:flex flex-col items-center self-stretch order-2">

        {/* Badge */}
        <div className="relative flex-shrink-0">
          {/* Expanding glow ring */}
          <motion.div
            animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.75 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -inset-3 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(4,98,65,0.18) 0%, transparent 70%)' }}
          />

          {/* Slow pulse ring — visible only when active */}
          {active && (
            <motion.div
              className="absolute -inset-1 rounded-full border border-[#046241]/45 dark:border-[#4ade80]/35"
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
          )}

          {/* Circle */}
          <motion.div
            animate={
              active
                ? { backgroundColor: '#046241', borderColor: '#046241', boxShadow: '0 0 0 5px rgba(4,98,65,0.14), 0 6px 22px rgba(4,98,65,0.35)' }
                : { backgroundColor: 'rgba(255,255,255,0)', borderColor: 'rgba(4,98,65,0.22)', boxShadow: '0 0 0 5px rgba(4,98,65,0.05)' }
            }
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-14 h-14 rounded-full border-2 dark:border-[#4ade80]/30 flex items-center justify-center"
          >
            <motion.span
              animate={active ? { color: '#ffffff' } : { color: '#046241' }}
              transition={{ duration: 0.3 }}
              className="text-[11px] font-black tracking-[0.14em]"
            >
              {index}
            </motion.span>
          </motion.div>
        </div>

        {/* Connector line — fills top-to-bottom when active */}
        {!isLast && (
          <div className="relative flex-1 w-px mt-3 bg-[#046241]/10 dark:bg-[#4ade80]/8 overflow-hidden">
            <motion.div
              className="absolute inset-x-0 top-0 bg-gradient-to-b from-[#046241] to-[#046241]/20 dark:from-[#4ade80] dark:to-[#4ade80]/15"
              animate={active ? { height: '100%', opacity: 1 } : { height: '0%', opacity: 0 }}
              transition={{ duration: 0.75, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        )}
      </div>

      {/* ── Image side ── */}
      <div
        className={`${isEven ? 'order-1 lg:order-3' : 'order-1'} group relative rounded-[2rem] overflow-hidden bg-[#071911]`}
        style={{ aspectRatio: '16/10' }}
      >
        <img src={image} alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-[1.06] opacity-90 dark:opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040f08]/70 via-[#040f08]/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[#046241]/0 group-hover:bg-[#046241]/15 transition-colors duration-700 pointer-events-none mix-blend-multiply" />

        {/* Mobile badge — lights up too */}
        <motion.div
          animate={active
            ? { backgroundColor: 'rgba(4,98,65,0.92)', boxShadow: '0 0 16px rgba(4,98,65,0.55)' }
            : { backgroundColor: 'rgba(4,98,65,0.55)', boxShadow: '0 0 0px rgba(4,98,65,0)' }}
          transition={{ duration: 0.4 }}
          className="lg:hidden absolute top-4 left-4 z-10 w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center"
        >
          <span className="text-[10px] font-black text-white tracking-widest">{index}</span>
        </motion.div>

        {/* Stat chip */}
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="absolute bottom-5 left-5 z-10 bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl px-4 py-2.5 flex items-baseline gap-2">
          <span className="text-xl font-black text-white tracking-tight leading-none">{stat.value}</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/60">{stat.label}</span>
        </motion.div>

        {/* Tag chip */}
        <div className="absolute top-5 right-5 z-10 bg-[#046241]/80 backdrop-blur-md rounded-full px-3 py-1 border border-white/15">
          <span className="text-[8px] font-black uppercase tracking-[0.22em] text-white">{tag}</span>
        </div>
      </div>

      {/* ── Text side ── */}
      <div className={`${isEven ? 'order-3 lg:order-1 lg:pr-12 lg:text-right' : 'order-3 lg:pl-12'} py-8 lg:py-0 flex flex-col ${isEven ? 'lg:items-end' : 'lg:items-start'}`}>
        <div className="inline-flex items-center mb-5 px-3 py-1.5 rounded-full w-fit border bg-[#046241]/8 dark:bg-[#046241]/18 border-[#046241]/18 dark:border-[#046241]/30">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#046241] dark:text-[#4ade80]">{tag}</span>
        </div>

        <h3 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-[-0.035em] leading-[1.1] text-[#0d1116] dark:text-brand-seasalt mb-5">
          {title}
        </h3>

        {/* Decorative rule — animates in when active */}
        <motion.div
          animate={active ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className={`h-[2px] w-16 mb-5 rounded-full origin-left bg-gradient-to-r from-[#046241]/70 to-transparent dark:from-[#4ade80]/60 ${isEven ? 'lg:origin-right' : ''}`}
        />

        <p className="text-[15px] leading-[1.85] text-[#0d1116]/65 dark:text-brand-seasalt/60 max-w-sm">{desc}</p>

        {/* Stat — brightens when active */}
        <motion.div
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 5 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`mt-7 flex items-baseline gap-2.5 ${isEven ? 'lg:justify-end' : ''}`}
        >
          <span className="text-2xl font-black tracking-tight text-[#046241] dark:text-[#4ade80]">{stat.value}</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0d1116]/40 dark:text-brand-seasalt/40">{stat.label}</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const AIDataServicesPage: React.FC = () => {
  return (
    <section className="px-6 md:px-16 py-24 bg-brand-paper dark:bg-brand-dark transition-colors duration-500 overflow-hidden">
      <div className="max-w-[1300px] mx-auto">

        {/* Hero Split */}
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          <div className="flex-1 min-w-0">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2 mb-6 bg-[#046241]/8 dark:bg-white/10 border border-[#046241]/15 dark:border-white/20 px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB347] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#046241] dark:text-[#FFB347]">Our Services</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[0.92] mb-6 text-brand-dark dark:text-brand-seasalt">
              AI data<br /><span className="text-[#046241] dark:text-[#FFB347]">services</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base max-w-lg leading-relaxed font-medium mb-10 text-brand-dark/65 dark:text-brand-seasalt/70">
              Lifewood delivers end-to-end AI data solutions - from multi-language collection and annotation to model training and generative AI content. Leveraging our global workforce, industrialized methodology, and proprietary LIFT platform.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-3">
              <a href="/login" className="bg-[#046241] dark:bg-brand-saffron text-white dark:text-brand-dark px-8 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 dark:shadow-brand-saffron/20 flex items-center gap-2 group">
                Get started
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
              <a href="/about-us" className="px-8 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all bg-[#133020] text-white border border-white/10 dark:bg-white/10 dark:text-white dark:border-white/15">
                Learn more
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.8 }}
              className="flex gap-8 mt-12 pt-8 border-t border-[#133020]/10 dark:border-white/10">
              {HERO_STATS.map((stat) => (
                <HeroStat key={stat.label} target={stat.target} label={stat.label} suffix={stat.suffix} duration={stat.duration} format={stat.format} />
              ))}
            </motion.div>
          </div>

          {/* Orbit */}
          <div className="relative flex-shrink-0 w-[540px] h-[540px] flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="relative">
                <motion.div
                  initial={{ scale: 1, opacity: 0.15 }}
                  animate={{ scale: [1, 1.6, 1], opacity: [0.15, 0, 0.15] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-[#046241]" />
                <motion.div
                  initial={{ scale: 1, opacity: 0.2 }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ duration: 3, delay: 0.6, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-[#046241]" />
                <div className="relative w-24 h-24 rounded-full shadow-2xl z-10 p-3 bg-white dark:bg-[#0B2518] flex items-center justify-center">
                  <img src="https://framerusercontent.com/images/mmBfl11ZRTsDKI8lhNBYvZHIEMo.png" alt="Lifewood" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
            {RINGS.map((ring, ri) => {
              const itemsPerRing = Math.ceil(SERVICES.length / RINGS.length);
              const items = SERVICES.slice(ri * itemsPerRing, ri * itemsPerRing + itemsPerRing);
              return <OrbitRing key={ring.radius} ring={ring} services={items} />;
            })}
          </div>
        </div>

        {/* Video */}
        <div className="mt-20 md:mt-24">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Section label */}
            <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full bg-[#046241]/8 dark:bg-[#046241]/18 border border-[#046241]/18 dark:border-[#046241]/32">
              <span className="w-1.5 h-1.5 rounded-full bg-[#046241] dark:bg-[#4ade80] animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.28em] text-[#046241] dark:text-[#4ade80]">See us in action</span>
            </div>
            <p className="text-center text-sm text-[#0d1116]/50 dark:text-white/40 font-medium tracking-wide mb-10 max-w-sm">
              Watch how Lifewood powers global AI training pipelines at scale
            </p>

            {/* Player wrapper */}
            <div className="relative w-full max-w-[800px] mx-auto">

              {/* Glow backdrop */}
              <div className="absolute -inset-6 rounded-[3rem] bg-[#046241]/8 dark:bg-[#046241]/12 blur-2xl pointer-events-none" />

              {/* Decorative corner lines */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-[#046241]/40 dark:border-[#4ade80]/40 rounded-tl-xl pointer-events-none" />
              <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-[#046241]/40 dark:border-[#4ade80]/40 rounded-tr-xl pointer-events-none" />
              <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-[#046241]/40 dark:border-[#4ade80]/40 rounded-bl-xl pointer-events-none" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-[#046241]/40 dark:border-[#4ade80]/40 rounded-br-xl pointer-events-none" />

              {/* Card */}
              <div className="relative rounded-2xl md:rounded-3xl bg-white dark:bg-[#0d1f17] border border-[#133020]/10 dark:border-white/8 p-3 md:p-4 shadow-[0_28px_72px_rgba(19,48,32,0.11)] dark:shadow-[0_28px_80px_rgba(0,0,0,0.5)]">
                <div className="overflow-hidden rounded-xl md:rounded-2xl bg-black">
                  <iframe
                    src={OVERVIEW_VIDEO_EMBED_URL}
                    title="Lifewood AI Data Services Video"
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>

            {/* Badge below */}
            <div className="mt-6 flex items-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#046241]/30 dark:to-[#4ade80]/30" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#0d1116]/35 dark:text-white/30">Lifewood Data Technology</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#046241]/30 dark:to-[#4ade80]/30" />
            </div>
          </motion.div>
        </div>

        {/* Comprehensive Data Solutions */}
        <div className="mt-36">
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-20 pb-10 border-b border-[#046241]/12 dark:border-white/8">
            <div>
              <div className="inline-flex items-center gap-3 mb-6 bg-[#046241]/8 dark:bg-[#046241]/15 border border-[#046241]/18 dark:border-[#046241]/30 px-4 py-2 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#046241] dark:bg-[#4ade80] animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.28em] text-[#046241] dark:text-[#4ade80]">Why brands trust us</span>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.045em] leading-[0.88] text-[#0d1116] dark:text-brand-seasalt">
                Comprehensive<br />
                <span className="relative inline-block">
                  Data<span className="text-[#046241] dark:text-[#FFB347]"> Solutions</span>
                  <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute -bottom-1 left-0 right-0 h-[3px] origin-left bg-gradient-to-r from-[#046241]/60 via-[#046241]/30 to-transparent dark:from-[#FFB347]/60 dark:via-[#FFB347]/25 dark:to-transparent rounded-full" />
                </span>
              </h2>
            </div>
            <div className="lg:max-w-xs flex flex-col gap-5">
              <p className="text-sm leading-[1.8] text-[#0d1116]/55 dark:text-brand-seasalt/50">
                Five integrated service pillars — each meticulously designed to move raw data from collection to enterprise-ready AI fuel.
              </p>
              <motion.a href="/login" whileHover={{ scale: 1.04, x: 2 }} whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#046241] dark:text-[#4ade80] group w-fit">
                Get started
                <span className="w-7 h-7 rounded-full flex items-center justify-center bg-[#046241] dark:bg-[#4ade80] text-white dark:text-[#040f08] group-hover:shadow-lg group-hover:shadow-[#046241]/30 transition-shadow duration-300">
                  <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </motion.a>
            </div>
          </motion.div>

          {/* Showcase items */}
          <div className="flex flex-col gap-20 lg:gap-28">
            {SHOWCASE_ITEMS.map((item, i) => (
              <ShowcaseItem key={item.index} {...item} itemIndex={i} isLast={i === SHOWCASE_ITEMS.length - 1} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default AIDataServicesPage;