import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';

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
  { radius: 148, speed: 22,  offset: 0          },
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
const CARD_HOVER =
  'group relative overflow-hidden transform-gpu transition-all duration-300 hover:-translate-y-2 hover:scale-[1.015] hover:shadow-2xl hover:shadow-[#046241]/20 dark:hover:shadow-[#4ade80]/15 hover:border-[#046241]/35 dark:hover:border-[#4ade80]/35 hover:ring-1 hover:ring-[#046241]/20 dark:hover:ring-[#4ade80]/25 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-gradient-to-br after:from-[#046241]/0 after:to-[#046241]/0 dark:after:from-[#4ade80]/0 dark:after:to-[#4ade80]/0 hover:after:from-[#046241]/5 hover:after:to-[#046241]/10 dark:hover:after:from-[#4ade80]/8 dark:hover:after:to-transparent after:transition-all after:duration-300';
const ORBIT_CARD_BG = 'bg-white dark:bg-[#0d2b1f]';
const ORBIT_CARD_BORDER = 'border border-[#046241]/18 dark:border-[#2c5d49]/70';
const ORBIT_CARD_SHADOW = 'shadow-[0_4px_20px_rgba(4,98,65,0.10)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.55)]';
const ORBIT_CARD_HOVER =
  'transform-gpu transition-all duration-250 hover:-translate-y-2 hover:scale-[1.08] hover:border-[#046241]/50 dark:hover:border-[#4ade80]/50 hover:shadow-[0_16px_36px_rgba(4,98,65,0.22)] dark:hover:shadow-[0_18px_36px_rgba(74,222,128,0.18)] hover:ring-2 hover:ring-[#046241]/20 dark:hover:ring-[#4ade80]/25';

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

    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) run();
    }, { threshold: 0.3 });

    io.observe(el);
    return () => {
      io.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return { val, ref };
}

const HeroStat: React.FC<{
  target: number;
  label: string;
  suffix: string;
  duration: number;
  format?: (value: number) => string;
}> = ({ target, label, suffix, duration, format }) => {
  const counter = useCounter(target, duration);
  const rendered = format ? format(counter.val) : String(counter.val);

  return (
    <div ref={counter.ref}>
      <div className="text-2xl font-black tracking-tight text-brand-dark dark:text-brand-seasalt">
        {rendered}{suffix}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5 text-brand-dark/40 dark:text-brand-seasalt/45">
        {label}
      </div>
    </div>
  );
};

// Small tag/chip used throughout the page
const Tag: React.FC<{ label: string; variant?: 'saffron' | 'default' }> = ({ label, variant }) => {
  const isSaffron = variant === 'saffron';
  return (
    <div className={`inline-flex items-center mb-4 px-3 py-1.5 rounded-full w-fit border
                     ${isSaffron ? 'bg-[#046241]/10 dark:bg-[#046241]/20 border-[#046241]/20 dark:border-[#046241]/30' : 'bg-[#046241]/10 dark:bg-[#046241]/20 border-[#046241]/20 dark:border-[#046241]/30'}`}>
      <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${isSaffron ? 'text-[#046241] dark:text-[#4ade80]' : 'text-[#046241] dark:text-[#4ade80]'}`}>
        {label}
      </span>
    </div>
  );
};

// ─── Data Acquisition card sub-component (needs local hover state) ────────────
const DataAcquisitionCard: React.FC<{ CARD_BG: string; CARD_BORDER: string }> = ({ CARD_BG, CARD_BORDER }) => {
  const [cardHovered, setCardHovered] = useState(false);
  const [hoveredAvatar, setHoveredAvatar] = useState<number | null>(null);

  // Spring-interpolated 0→1 value drives all hover transitions smoothly
  const hoverProgress = useMotionValue(0);
  const smoothHover   = useSpring(hoverProgress, { stiffness: 120, damping: 20, mass: 0.8 });

  // Derived spring values for card lift / scale
  const cardY     = useTransform(smoothHover, [0, 1], [0, -14]);
  const cardScale = useTransform(smoothHover, [0, 1], [1, 1.02]);

  // Glow opacity
  const glowOpacity   = useTransform(smoothHover, [0, 1], [0.55, 1]);
  const saffronGlow   = useTransform(smoothHover, [0, 1], [0.25, 0.65]);

  // SVG spoke brightness
  const spokeOpacity  = useTransform(smoothHover, [0, 1], [0.25, 0.7]);
  const ringOpacity   = useTransform(smoothHover, [0, 1], [0.06, 0.35]);

  // Bottom bar tint
  const barBg = useTransform(smoothHover, [0, 1], ['rgba(0,0,0,0.22)', 'rgba(4,98,65,0.22)']);
  const barTextOpacity = useTransform(smoothHover, [0, 1], [0.35, 0.85]);

  const avatars = [
    { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80', size: 46, top: '6%',  left: '14%',  dy: -5, delay: 0.0, name: 'Alex'  },
    { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80', size: 38, top: '6%',  left: '73%',  dy:  4, delay: 0.4, name: 'Sam'   },
    { src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80', size: 42, top: '42%', left: '1%',   dy: -4, delay: 0.8, name: 'Chris' },
    { src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80', size: 38, top: '78%', left: '18%',  dy:  5, delay: 0.2, name: 'Dana'  },
    { src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80', size: 46, top: '76%', left: '67%',  dy: -4, delay: 0.6, name: 'Jamie' },
    { src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80', size: 36, top: '40%', left: '86%',  dy:  4, delay: 1.0, name: 'Pat'   },
  ];

  const spokes = [
    { x2: '22%', y2: '12%' }, { x2: '80%', y2: '14%' }, { x2: '7%',  y2: '53%' },
    { x2: '27%', y2: '88%' }, { x2: '76%', y2: '86%' }, { x2: '93%', y2: '50%' },
  ];

  const dots = [
    { top: '8%',  left: '20%' }, { top: '8%',  left: '80%' }, { top: '50%', left: '4%'  },
    { top: '85%', left: '24%' }, { top: '84%', left: '76%' }, { top: '48%', left: '94%' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
      onHoverStart={() => { setCardHovered(true);  hoverProgress.set(1); }}
      onHoverEnd={()   => { setCardHovered(false); hoverProgress.set(0); }}
      style={{ y: cardY, scale: cardScale }}
      className={`rounded-[1.75rem] p-8 flex flex-col ${CARD_BG} ${CARD_BORDER} cursor-pointer
                  will-change-transform
                  ${cardHovered
                    ? 'shadow-2xl shadow-[#046241]/30 ring-1 ring-[#046241]/35'
                    : 'shadow-none ring-0'}`}
    >
      {/* Tag — brightens via CSS transition */}
      <div className={`inline-flex items-center mb-4 px-3 py-1.5 rounded-full w-fit border
                       transition-all duration-500 ease-out
                       ${cardHovered
                         ? 'bg-[#046241]/30 border-[#4ade80]/50'
                         : 'bg-[#046241]/10 dark:bg-[#046241]/20 border-[#046241]/20 dark:border-[#046241]/30'}`}>
        <span className={`text-[9px] font-black uppercase tracking-[0.25em] transition-colors duration-500
                          ${cardHovered ? 'text-[#4ade80]' : 'text-[#046241] dark:text-[#4ade80]'}`}>
          End-to-end
        </span>
      </div>

      {/* Heading — subtle lift */}
      <motion.h3
        animate={{ y: cardHovered ? -2 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="text-xl font-black tracking-tight mb-3 text-brand-dark dark:text-[#e9efea]"
      >
        Data Acquisition
      </motion.h3>

      <p className="text-sm leading-relaxed mb-5 text-brand-dark/85 dark:text-[#d3ddd6]">
        End-to-end data acquisition solutions — curation, processing, and managed large-scale diverse datasets built for enterprise AI systems.
      </p>

      {/* ── Constellation panel ── */}
      <div className="mt-auto rounded-2xl overflow-hidden relative bg-[#071911] border border-white/8"
           style={{ minHeight: 248 }}>

        {/* Layered glows — spring-driven */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div style={{ opacity: glowOpacity, scale: useTransform(smoothHover, [0,1], [1, 1.35]) }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-[#046241]/22 blur-[55px]" />
          <motion.div style={{ opacity: saffronGlow }}
            className="absolute top-[18%] left-[12%] w-28 h-28 rounded-full bg-[#FFB347]/8 blur-[40px]" />
          <motion.div style={{ opacity: useTransform(smoothHover, [0,1], [0.18, 0.45]) }}
            className="absolute bottom-[12%] right-[12%] w-24 h-24 rounded-full bg-[#046241]/18 blur-[32px]" />
        </div>

        {/* SVG: spring-animated rings + spokes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {/* Outer ring */}
          <motion.circle cx="50%" cy="50%" r="88" fill="none"
            style={{ opacity: ringOpacity }} stroke="#046241" strokeWidth="1" strokeDasharray="4 6" />
          {/* Inner ring */}
          <motion.circle cx="50%" cy="50%" r="50" fill="none"
            style={{ opacity: useTransform(smoothHover, [0,1], [0.08, 0.42]) }}
            stroke="#4ade80" strokeWidth="1" strokeDasharray="3 5" />
          {/* Spokes */}
          {spokes.map((l, i) => (
            <motion.line key={i} x1="50%" y1="50%" x2={l.x2} y2={l.y2}
              style={{ opacity: useTransform(smoothHover, [0,1], [0.22, 0.65 - i * 0.02]) }}
              stroke="url(#spokeGrad)" strokeWidth="1" strokeDasharray="3 4" />
          ))}
          <defs>
            <linearGradient id="spokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFB347" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Centre Lifewood hub */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          {/* Pulse rings — speed up on card hover */}
          <motion.div
            animate={{ scale: [1, 1.7, 1], opacity: [0.18, 0, 0.18] }}
            transition={{ duration: cardHovered ? 1.2 : 3.2, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-[#046241]"
          />
          <motion.div
            animate={{ scale: [1, 1.45, 1], opacity: [0.22, 0, 0.22] }}
            transition={{ duration: cardHovered ? 1.2 : 3.2, delay: 0.6, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-[#046241]"
          />
          {/* Logo — saffron halo ring on card hover */}
          <motion.div
            animate={cardHovered
              ? { boxShadow: ['0 0 0 0px rgba(255,179,71,0)', '0 0 0 7px rgba(255,179,71,0.45)', '0 0 0 0px rgba(255,179,71,0)'] }
              : { boxShadow: '0 0 0 0px rgba(255,179,71,0)' }
            }
            transition={{ duration: 1.4, repeat: cardHovered ? Infinity : 0, ease: 'easeInOut' }}
            whileHover={{ scale: 1.1, transition: { type: 'spring', stiffness: 350, damping: 18 } }}
            className="relative w-14 h-14 rounded-full bg-white shadow-2xl border border-white/20 flex items-center justify-center p-2.5 z-10"
          >
            <img src="https://framerusercontent.com/images/mmBfl11ZRTsDKI8lhNBYvZHIEMo.png" alt="Lifewood" className="w-full h-full object-contain" />
          </motion.div>
          {/* Wordmark */}
          <motion.div
            animate={{ opacity: cardHovered ? 1 : 0.5, y: cardHovered ? 0 : 2 }}
            transition={{ duration: 0.35 }}
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <span className="text-[7px] font-black uppercase tracking-[0.22em] text-[#FFB347]">lifewood</span>
          </motion.div>
        </div>

        {/* Avatars — float independently, saffron ring on card hover, big pop on self-hover */}
        {avatars.map((av, i) => {
          const isThisHovered = hoveredAvatar === i;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full overflow-hidden z-10 cursor-pointer"
              style={{
                width: av.size, height: av.size,
                top: av.top, left: av.left,
                // Border painted via boxShadow so it doesn't affect layout
              }}
              initial={{ opacity: 0, scale: 0.4 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              
              animate={{
                y: [0, av.dy, 0],
                scale: isThisHovered ? 1.38 : cardHovered ? 1.1 : 1,
                boxShadow: isThisHovered
                  ? `0 0 0 3px #FFB347, 0 0 24px rgba(255,179,71,0.55), 0 14px 36px rgba(0,0,0,0.65)`
                  : cardHovered
                    ? `0 0 0 2px rgba(255,179,71,0.4), 0 8px 22px rgba(0,0,0,0.5)`
                    : `0 0 0 2px rgba(255,255,255,0.15), 0 4px 14px rgba(0,0,0,0.4)`,
                zIndex: isThisHovered ? 30 : 10,
              }}
              transition={{
                opacity: { duration: 0.55, delay: 0.4 + av.delay, ease: [0.16, 1, 0.3, 1] },
                y: { duration: 2.8 + i * 0.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' },
                scale: { type: 'spring', stiffness: 350, damping: 22 },
                boxShadow: { duration: 0.3 },
              }}
              onHoverStart={() => setHoveredAvatar(i)}
              onHoverEnd={()   => setHoveredAvatar(null)}
            >
              <img src={av.src} alt={av.name} className="w-full h-full object-cover" />
              {/* Name tooltip on avatar hover */}
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.85 }}
                animate={isThisHovered ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 4, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap
                           bg-[#071911]/90 backdrop-blur-sm border border-[#FFB347]/40
                           px-2 py-0.5 rounded-full pointer-events-none z-40"
              >
                <span className="text-[8px] font-black uppercase tracking-[0.15em] text-[#FFB347]">{av.name}</span>
              </motion.div>
            </motion.div>
          );
        })}

        {/* Endpoint dots — accelerate + pulse stronger on hover */}
        {dots.map((dot, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#FFB347] z-[2]"
            style={{ top: dot.top, left: dot.left }}
            animate={{
              width:   cardHovered ? 7 : 5,
              height:  cardHovered ? 7 : 5,
              scale:   [1, cardHovered ? 2.6 : 1.9, 1],
              opacity: [cardHovered ? 0.55 : 0.28, 1, cardHovered ? 0.55 : 0.28],
            }}
            transition={{
              width: { duration: 0.3 }, height: { duration: 0.3 },
              scale:   { duration: cardHovered ? 0.9 : 2.0 + i * 0.28, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 },
              opacity: { duration: cardHovered ? 0.9 : 2.0 + i * 0.28, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 },
            }}
          />
        ))}

        {/* Bottom bar — spring-tinted background */}
        <motion.div
          style={{ backgroundColor: barBg }}
          className="absolute bottom-0 inset-x-0 px-4 py-2.5 flex items-center gap-2 border-t border-white/5 backdrop-blur-sm z-10"
        >
          <motion.span
            animate={{ scale: cardHovered ? 1.4 : 1, opacity: cardHovered ? 1 : 0.5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-1.5 h-1.5 rounded-full bg-[#FFB347] flex-shrink-0 animate-pulse"
          />
          <motion.span
            style={{ opacity: barTextOpacity }}
            className="text-[9px] font-bold uppercase tracking-[0.2em] text-white"
          >
            Global data sourcing · 30+ regions
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
};


// ─── Self-contained orbit card — hover state fully isolated from parent rotation ─
const OrbitCard: React.FC<{ svc: { label: string; sub: string; icon: React.ReactNode } }> = ({ svc }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{
        scale: hovered ? 1.15 : 1,
        y: hovered ? -10 : 0,
        boxShadow: hovered
          ? '0 20px 40px rgba(4,98,65,0.28), 0 0 0 2px rgba(4,98,65,0.35)'
          : '0 4px 18px rgba(4,98,65,0.10)',
      }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={`w-[116px] min-h-[132px] rounded-2xl p-3.5 cursor-pointer
                 flex flex-col items-center text-center gap-1.5
                 relative overflow-hidden
                 ${ORBIT_CARD_BG} ${ORBIT_CARD_BORDER}
                 transition-[border-color,background-color] duration-300
                 ${hovered ? 'border-[#046241]/55 dark:border-[#4ade80]/55 bg-white dark:bg-[#0f3324]' : ''}`}
    >
      {/* Top shimmer line */}
      <motion.span
        animate={{ opacity: hovered ? 1 : 0, scaleX: hovered ? 1 : 0.3 }}
        transition={{ duration: 0.25 }}
        className="pointer-events-none absolute top-0 left-3 right-3 h-px
                   bg-gradient-to-r from-transparent via-[#046241]/70 dark:via-[#4ade80]/70 to-transparent"
      />

      {/* Green glow wash on hover */}
      <motion.span
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="pointer-events-none absolute inset-0 rounded-2xl
                   bg-gradient-to-b from-[#046241]/8 dark:from-[#4ade80]/10 to-transparent"
      />

      {/* Icon */}
      <motion.span
        animate={{
          scale: hovered ? 1.14 : 1,
          y: hovered ? -2 : 0,
          backgroundColor: hovered ? 'rgba(4,98,65,0.18)' : undefined,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        className="relative z-10 w-9 h-9 rounded-xl flex items-center justify-center
                   bg-[#046241]/10 dark:bg-[#046241]/30
                   text-[#046241] dark:text-[#4ade80]
                   transition-colors duration-200"
      >
        {svc.icon}
      </motion.span>

      {/* Label */}
      <motion.span
        animate={{ color: hovered ? '#046241' : undefined }}
        className="relative z-10 text-[11px] font-black uppercase tracking-[0.1em] leading-tight
                   text-[#133020] dark:text-[#e8f5ee]
                   dark:[color:inherit]"
        style={{ color: hovered ? '#046241' : undefined }}
      >
        {svc.label}
      </motion.span>

      {/* Sub-label */}
      <motion.span
        animate={{ opacity: hovered ? 0.9 : 0.6 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 text-[9px] font-semibold leading-[1.4]
                   text-[#133020]/60 dark:text-[#a8c4b2]"
      >
        {svc.sub}
      </motion.span>
    </motion.div>
  );
};




const AIDataServicesPage: React.FC = () => {
  return (
    <section className="px-6 md:px-16 py-24 bg-brand-paper dark:bg-brand-dark transition-colors duration-500 overflow-hidden">
      <div className="max-w-[1300px] mx-auto">

        {/* Hero Split */}
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">

          {/* LEFT: TEXT */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2 mb-6
                         bg-[#046241]/8 dark:bg-white/10
                         border border-[#046241]/15 dark:border-white/20
                         px-4 py-2 rounded-full"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB347] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#046241] dark:text-[#FFB347]">
                Our Services
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[0.92] mb-6 text-brand-dark dark:text-brand-seasalt"
            >
              AI data<br />
              <span className="text-[#046241] dark:text-[#FFB347]">services</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base max-w-lg leading-relaxed font-medium mb-10 text-brand-dark/65 dark:text-brand-seasalt/70"
            >
              Lifewood delivers end-to-end AI data solutions - from multi-language collection
              and annotation to model training and generative AI content. Leveraging our global
              workforce, industrialized methodology, and proprietary LIFT platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <a
                href="/login"
                className="bg-[#046241] dark:bg-brand-saffron text-white dark:text-brand-dark px-8 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 dark:shadow-brand-saffron/20 flex items-center gap-2 group"
              >
                Get started
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
              <a
                href="/about-us"
                className="px-8 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all bg-[#133020] text-white border border-white/10 dark:bg-white/10 dark:text-white dark:border-white/15"
              >
                Learn more
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex gap-8 mt-12 pt-8 border-t border-[#133020]/10 dark:border-white/10"
            >
              {HERO_STATS.map((stat) => (
                <HeroStat
                  key={stat.label}
                  target={stat.target}
                  label={stat.label}
                  suffix={stat.suffix}
                  duration={stat.duration}
                  format={stat.format}
                />
              ))}
            </motion.div>
          </div>

          {/* RIGHT: ORBIT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex-shrink-0 w-[540px] h-[540px] flex items-center justify-center"
          >
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.6, 1], opacity: [0.15, 0, 0.15] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-[#046241]"
                />
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ duration: 3, delay: 0.6, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-[#046241]"
                />
                <div className="relative w-24 h-24 rounded-full shadow-2xl z-10 p-3 bg-white dark:bg-[#0B2518] flex items-center justify-center">
                  <img src="https://framerusercontent.com/images/mmBfl11ZRTsDKI8lhNBYvZHIEMo.png" alt="Lifewood" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>

            {RINGS.map((ring, ri) => {
              const itemsPerRing = Math.ceil(SERVICES.length / RINGS.length);
              const items = SERVICES.slice(ri * itemsPerRing, ri * itemsPerRing + itemsPerRing);
              return (
                <React.Fragment key={ri}>
                  <div
                    className="absolute rounded-full border border-dashed border-[#046241]/20 dark:border-[#2e5f4b]/45"
                    style={{ width: ring.radius * 2, height: ring.radius * 2, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                  />
                  <motion.div
                    className="absolute"
                    style={{ width: ring.radius * 2, height: ring.radius * 2, top: '50%', left: '50%', translateX: '-50%', translateY: '-50%' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: Math.abs(ring.speed), repeat: Infinity, ease: 'linear', direction: ring.speed > 0 ? 'normal' : 'reverse' }}
                  >
                    {items.map((svc, i) => {
                      const angle = (i / items.length) * 2 * Math.PI + ring.offset;
                      const x = ring.radius + ring.radius * Math.cos(angle) - 58;
                      const y = ring.radius + ring.radius * Math.sin(angle) - 58;
                      return (
                        <motion.div key={svc.label} className="absolute" style={{ left: x, top: y, width: 116 }}
                          animate={{ rotate: -360 }}
                          transition={{ duration: Math.abs(ring.speed), repeat: Infinity, ease: 'linear', direction: ring.speed > 0 ? 'normal' : 'reverse' }}
                        >
                          <OrbitCard svc={svc} />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </React.Fragment>
              );
            })}
          </motion.div>
        </div>

        {/* Video */}
        <div className="mt-14 md:mt-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-10 md:mt-12 max-w-[760px] mx-auto rounded-2xl md:rounded-3xl bg-white/80 dark:bg-[#102a1f] border border-[#133020]/10 dark:border-white/10 p-3 md:p-4 shadow-[0_22px_60px_rgba(19,48,32,0.09)] dark:shadow-[0_24px_68px_rgba(0,0,0,0.45)]"
          >
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
          </motion.div>
        </div>

        {/* Comprehensive Data Solutions */}
        <div className="mt-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="text-brand-dark/70 dark:text-brand-seasalt/70 text-sm">+</span>
              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-brand-dark/55 dark:text-brand-seasalt/55">
                Why brands trust us
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.05em] leading-[0.9] mb-5 text-[#0d1116] dark:text-brand-seasalt">
              Comprehensive<br />Data Solutions
            </h2>
            <motion.a
              href="/login"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 mt-1 text-[11px] font-black uppercase tracking-[0.2em] text-brand-dark dark:text-brand-seasalt"
            >
              Get started
              <span className="w-7 h-7 rounded-full flex items-center justify-center bg-[#0d1116] text-white dark:bg-brand-seasalt dark:text-brand-dark">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" d="M8 12h8m0 0l-3-3m3 3l-3 3" />
                </svg>
              </span>
            </motion.a>
          </motion.div>

          {/* Data Solutions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-max">

            {/* Data Validation — UNCHANGED from document */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -12, scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ default: { duration: 0.8 }, whileHover: { type: "spring", stiffness: 400, damping: 25 } }}
              className={`md:row-span-2 relative rounded-[1.75rem] p-8 flex flex-col justify-between min-h-[520px] overflow-hidden border border-white/10 bg-[#060b13] ${CARD_HOVER}`}
            >
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#0f3a2d] blur-[70px] pointer-events-none" />
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#11385f] blur-[80px] pointer-events-none" />
              <div className="relative z-10">
                <Tag label="Core Service" variant="saffron" />
                <h3 className="text-2xl font-black text-white tracking-tight mb-4">Data Validation</h3>
                <p className="text-sm text-white/85 leading-relaxed mb-4">
                  The goal is to create data that is consistent, accurate and complete, preventing data loss or errors in transfer, code or configuration.
                </p>
                <p className="text-sm text-white/85 leading-relaxed mb-4">
                  We verify that data conforms to predefined standards, rules or constraints, ensuring the information is trustworthy and fit for its intended purpose.
                </p>
              </div>
              <div className="relative z-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mt-6">
                (c) 2025 Lifewood Data Technology
              </div>
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#060b13] via-[#060b13]/78 to-transparent pointer-events-none z-[1]" />
              <img
                src="https://framerusercontent.com/images/ZywE1VmIeWyUjcGlRI6E373zLc.png?width=668&height=791"
                alt="Data validation visualization"
                loading="lazy"
                className="absolute -bottom-3 -right-8 w-[82%] max-w-none object-contain pointer-events-none select-none z-0"
              />
            </motion.div>

            {/* Data Collection — UNCHANGED from document */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -12, scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ default: { duration: 0.8, delay: 0.1 }, whileHover: { type: "spring", stiffness: 400, damping: 25, delay: 0 } }}
              className={`rounded-[1.75rem] p-8 flex flex-col min-h-[240px] ${CARD_BG} ${CARD_BORDER} ${CARD_HOVER}`}
            >
              <Tag label="Multi-modal" />
              <h3 className="text-xl font-black tracking-tight mb-3 text-brand-dark dark:text-[#e9efea]">Data Collection</h3>
              <p className="text-sm leading-relaxed mb-6 text-brand-dark/85 dark:text-[#d3ddd6]">
                Lifewood delivers multi-modal data collection across text, audio, image, and video, supported by advanced workflows for categorization, labeling, tagging, transcription, sentiment analysis, and subtitle generation.
              </p>
              <div className="mt-auto rounded-2xl p-8 border border-[#133020]/25 dark:border-white/10 bg-[#0d1116] dark:bg-black/30 shadow-[0_18px_35px_rgba(13,17,22,0.34)] flex flex-col items-center justify-center min-h-[220px]">
                <motion.div
                  className="w-20 h-20 rounded-2xl bg-[#FFB347] text-white flex items-center justify-center mb-6 shadow-lg transition-all"
                  animate={{ y: [0, -8, 0] }}
                  whileHover={{ scale: 1.15, boxShadow: "0 20px 40px rgba(255, 179, 71, 0.4)" }}
                  transition={{ y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }, default: { type: "spring", stiffness: 400, damping: 25 } }}
                >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  </svg>
                </motion.div>
                <p className="text-[12px] text-white leading-relaxed text-center font-medium">
                  Our scalable processes ensure accuracy and cultural nuance across 30+ languages and regions.
                </p>
              </div>
            </motion.div>

            {/* ── DATA ACQUISITION ── */}
            <DataAcquisitionCard CARD_BG={CARD_BG} CARD_BORDER={CARD_BORDER} />

            {/* ── DATA CURATION — animated bar chart visual ── */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -12, scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ default: { duration: 0.8, delay: 0.3 }, whileHover: { type: "spring", stiffness: 400, damping: 25, delay: 0 } }}
              className={`rounded-[1.75rem] p-8 flex flex-col min-h-[240px] ${CARD_BG} ${CARD_BORDER} ${CARD_HOVER}`}
            >
              <Tag label="Reliability" />
              <h4 className="text-xl font-black tracking-tight mb-3 text-brand-dark dark:text-[#e9efea]">
                Data Curation
              </h4>
              <p className="text-sm leading-relaxed mb-6 text-brand-dark/85 dark:text-[#d3ddd6]">
                We sift, select and index data to ensure reliability, accessibility and ease of classification. Data can be curated to support business decisions, academic research, genealogies, scientific research and more.
              </p>

              {/* Animated bar chart */}
              <div className="mt-auto">
                <div className="flex items-end gap-1.5 h-16 mb-3">
                  {[
                    { h: '40%',  color: '#FFB347' },
                    { h: '65%',  color: '#046241' },
                    { h: '85%',  color: '#FFB347' },
                    { h: '55%',  color: '#046241' },
                    { h: '100%', color: '#133020' },
                    { h: '70%',  color: '#FFB347' },
                    { h: '45%',  color: '#046241' },
                    { h: '90%',  color: '#133020' },
                    { h: '60%',  color: '#FFB347' },
                  ].map((bar, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-t-md"
                      style={{ background: bar.color, opacity: 0.85 }}
                      initial={{ height: 0 }}
                      whileInView={{ height: bar.h }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ opacity: 1, scaleX: 1.1 }}
                    />
                  ))}
                </div>
                {/* X-axis labels */}
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 dark:text-white/25">Reliability</span>
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 dark:text-white/25">Accessibility</span>
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 dark:text-white/25">Classification</span>
                </div>
              </div>
            </motion.div>

            {/* ── DATA ANNOTATION — feature callout with icon grid ── */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -12, scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ default: { duration: 0.8, delay: 0.4 }, whileHover: { type: "spring", stiffness: 400, damping: 25, delay: 0 } }}
              className={`${CARD_BG} rounded-[1.75rem] p-8 flex flex-col min-h-[240px] ${CARD_BORDER} ${CARD_HOVER} relative overflow-hidden`}
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#FFB347]/10 blur-[40px] pointer-events-none" />
              <Tag label="AI Training" variant="saffron" />
              <h4 className="text-xl font-black text-brand-dark dark:text-[#e9efea] tracking-tight mb-3">
                Data Annotation
              </h4>
              <p className="text-sm text-brand-dark/85 dark:text-[#d3ddd6] leading-relaxed mb-5">
                High quality annotation services for vision, speech and language processing to accelerate model development. In the age of AI, data is the fuel for all analytic and machine learning.
              </p>

              {/* Modality icon grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Vision',   icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />, color: '#FFB347' },
                  { label: 'Speech',   icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v3m0-14a3 3 0 00-3 3v4a3 3 0 106 0v-4a3 3 0 00-3-3z" />, color: '#046241' },
                  { label: 'Text',     icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.6a1 1 0 01.7.3l5.4 5.4a1 1 0 01.3.7V19a2 2 0 01-2 2z" />, color: '#133020' },
                  { label: 'Video',    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.55-2.27A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />, color: '#FFB347' },
                ].map(({ label, icon, color }) => (
                  <motion.div
                    key={label}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#046241]/5 dark:bg-white/5 border border-[#046241]/10 dark:border-white/8 cursor-pointer"
                    whileHover={{ scale: 1.08, y: -2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + '20' }}>
                      <svg className="w-4 h-4" fill="none" stroke={color} viewBox="0 0 24 24">{icon}</svg>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-[0.15em] text-brand-dark/50 dark:text-white/40">{label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Quote chip */}
              <div className="bg-[#FFB347]/10 border border-[#FFB347]/20 rounded-2xl p-3.5">
                <p className="text-[10.5px] text-brand-dark/80 dark:text-[#d3ddd6] leading-relaxed italic">
                  "Lifewood provides high quality annotation services for a wide range of mediums including text, image, audio and video for both computer vision and natural language processing."
                </p>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default AIDataServicesPage;
