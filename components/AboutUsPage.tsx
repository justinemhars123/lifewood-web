import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ════════════════════════════════════════════════════════
//  DATA
// ════════════════════════════════════════════════════════

const STATS = [
  { target: 30,  suffix: '+',  label: 'Countries'  },
  { target: 10,  suffix: 'M+', label: 'Datapoints' },
  { target: 7,   suffix: '',   label: 'Domains'    },
  { target: 500, suffix: '+',  label: 'Experts'    },
];

// Reuses the OfficesPage count-up behavior and replays when re-entering viewport.
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

const CORE_VALUES = [
  {
    letter: 'D', name: 'Diversity',
    desc: 'We celebrate differences in belief, philosophy and ways of life, because they bring unique perspectives and ideas that encourage everyone to move forward.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3" /><path d="M6 20v-1a6 6 0 0112 0v1" /><circle cx="4" cy="10" r="2" /><path d="M2 20v-1a4 4 0 014-4" /><circle cx="20" cy="10" r="2" /><path d="M22 20v-1a4 4 0 00-4-4" />
      </svg>
    ),
  },
  {
    letter: 'C', name: 'Caring',
    desc: 'We care for every person deeply and equally, because without care work becomes meaningless.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    letter: 'I', name: 'Innovation',
    desc: 'Innovation is at the heart of all we do, enriching our lives and challenging us to continually improve ourselves and our service.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    letter: 'I', name: 'Integrity',
    desc: 'We are dedicated to act ethically and sustainably in everything we do. More than just the bare minimum, it is the basis of our existence as a company.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

const TABS = ['mission', 'vision'] as const;
type Tab = typeof TABS[number];

const MV_DATA: Record<Tab, {
  label: string; heading: string; body: string;
  img: string; imgAlt: string; eyebrow: string;
  pillars: { icon: React.ReactNode; title: string; desc: string }[];
}> = {
  mission: {
    label: 'Mission', heading: 'Our Mission', eyebrow: 'What drives us',
    img: 'https://framerusercontent.com/images/pqtsyQSdo9BC1b4HN1mpIHnwAA.png?scale-down-to=2048&width=2780&height=1552',
    imgAlt: 'Mission',
    body: 'To develop and deploy cutting-edge AI technologies that solve real-world problems, empower communities, and advance sustainable practices. We are committed to fostering a culture of innovation, collaborating with stakeholders across sectors, and making a meaningful impact on society and the environment.',
    pillars: [
      { title: 'Ethical Practice', desc: 'Privacy-safe, consent-driven data acquisition on every project.', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
      { title: 'Global Reach',     desc: 'Active operations spanning 30+ countries with local expertise.',  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg> },
      { title: 'Measurable Impact',desc: 'Rigorous quality controls and transparent outcome reporting.',   icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
    ],
  },
  vision: {
    label: 'Vision', heading: 'Our Vision', eyebrow: 'Where we are headed',
    img: 'https://framerusercontent.com/images/bkXSwutgFfDhSf6t2tQyzrIppzM.jpg?width=1200&height=1200',
    imgAlt: 'Vision',
    body: 'To be the global champion in AI data solutions, igniting a culture of innovation that enriches lives and transforms communities — creating sustainable impact at scale across every language, culture, and region.',
    pillars: [
      { title: 'Inclusive AI',       desc: "Every language and culture represented in tomorrow's AI systems.", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg> },
      { title: 'Shared Prosperity',  desc: 'Economic opportunity for data contributors in every region.',    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg> },
      { title: 'Open Systems',       desc: 'Transparent AI pipelines built on trust and accountability.',    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M1 6l11 6 11-6" /><path d="M1 12l11 6 11-6" /></svg> },
    ],
  },
};

const LIFE_AT_LIFEWOOD_CARDS = [
  {
    src: 'https://framerusercontent.com/images/4hASBG5DwObUZ6HSxm1j5gic.jpeg?scale-down-to=1024&width=853&height=1280',
    alt: 'AI mobility annotation',
    size: 'portrait',
  },
  {
    src: 'https://framerusercontent.com/images/VDjJLyomenB1LFHPI6jBfB068.png?scale-down-to=1024&width=2268&height=3402',
    alt: 'Research and data curation',
    size: 'portrait',
  },
  {
    src: 'https://framerusercontent.com/images/cMKEugcBZTYApEhuh47taqgdc8Q.jpg?scale-down-to=512&width=612&height=422',
    alt: 'Audio signal analysis',
    size: 'landscape',
  },
  {
    src: 'https://framerusercontent.com/images/KNYITojpSxAW0RVdzBr8gV0gxg.jpg?scale-down-to=512&width=3000&height=3000',
    alt: 'Family archive research',
    size: 'portrait',
  },
] as const;

const lifeCardVariants = {
  offscreen: (i: number) => ({
    y: 220,
    rotate: i % 2 === 0 ? -8 : 8,
    opacity: 0,
    scale: 0.94,
  }),
  onscreen: (i: number) => ({
    y: 0,
    rotate: i === 2 ? 0 : i % 2 === 0 ? -2 : 2,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      bounce: 0.4,
      duration: 0.9,
      delay: i * 0.08,
    },
  }),
};

const LifeAtLifewoodCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[0.75fr_0.92fr_1.7fr_0.92fr] gap-5 md:gap-6 items-end">
      {LIFE_AT_LIFEWOOD_CARDS.map((card, i) => (
        <motion.div
          key={`${card.alt}-${i}`}
          custom={i}
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ amount: 0.6, once: false }}
          className="relative overflow-hidden flex items-center justify-center pt-4"
        >
          <div
            className="absolute inset-0 rounded-[30px] opacity-60"
            style={{
              background: i % 2 === 0
                ? 'linear-gradient(210deg, rgba(74,222,128,0.25), rgba(4,98,65,0.08))'
                : 'linear-gradient(210deg, rgba(255,179,71,0.22), rgba(4,98,65,0.08))',
              clipPath: 'path("M 0 240 C 0 228 10 220 22 218 L 460 164 C 472 162 484 173 484 186 L 500 362 C 500 374 490 384 478 384 L 22 384 C 10 384 0 374 0 362 Z")',
            }}
          />

          <motion.div
            variants={lifeCardVariants}
            custom={i}
            whileHover={{ y: -10, rotate: i === 2 ? 0 : i % 2 === 0 ? -4 : 4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className={[
              'group relative rounded-[28px] overflow-hidden border border-[#046241]/14 bg-white dark:border-white/10 dark:bg-[#0a1f14]',
              'shadow-[0_14px_34px_rgba(4,98,65,0.16)] dark:shadow-[0_18px_44px_rgba(0,0,0,0.5)]',
              card.size === 'landscape' ? 'h-[250px] md:h-[420px]' : 'h-[300px] md:h-[500px]',
            ].join(' ')}
            style={{
              width: '100%',
              transformOrigin: '10% 60%',
            }}
          >
            <img
              src={card.src}
              alt={card.alt}
              draggable={false}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 dark:from-[#001b11]/86 dark:via-transparent dark:to-[#001b11]/28" />
            <div className="absolute top-4 left-4">
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-black/35 dark:bg-black/35 border border-white/20 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFB347]" />
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-white/90">Lifewood</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};
const SLIDE = {
  enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
};

const MissionVisionBlock: React.FC = () => {
  const [active, setActive] = useState<Tab>('mission');
  const [dir,    setDir]    = useState(1);
  const refs = useRef<Record<Tab, HTMLButtonElement | null>>({ mission: null, vision: null });

  const switchTo = (tab: Tab) => {
    if (tab === active) return;
    setDir(tab === 'vision' ? 1 : -1);
    setActive(tab);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); switchTo('vision');  refs.current.vision?.focus(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); switchTo('mission'); refs.current.mission?.focus(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [active]);

  const d = MV_DATA[active];
  const activeIdx = TABS.indexOf(active);

  return (
    <section aria-label="Mission and Vision" className="w-full">
      {/* Toggle */}
      <div className="flex justify-center mb-10">
        <div role="tablist" aria-label="Mission and Vision"
          className="relative flex items-center p-1 rounded-full
                     bg-white/95 dark:bg-[#0d2018]
                     border border-[#046241]/15 dark:border-[#FFB347]/20
                     shadow-[0_2px_12px_rgba(4,98,65,0.08)] dark:shadow-[0_2px_12px_rgba(255,179,71,0.15)]">
          <motion.div
            aria-hidden
            className="absolute top-1 bottom-1 rounded-full bg-brand-primary dark:bg-brand-saffron shadow-lg shadow-brand-primary/25 dark:shadow-brand-saffron/25"
            animate={{ left: activeIdx === 0 ? '4px' : '50%', right: activeIdx === 0 ? '50%' : '4px' }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
          {TABS.map((tab) => (
            <button
              key={tab}
              ref={el => { refs.current[tab] = el; }}
              role="tab" id={`${tab}-tab`}
              aria-selected={active === tab} aria-controls={`${tab}-panel`}
              tabIndex={active === tab ? 0 : -1}
              onClick={() => switchTo(tab)}
              className="relative z-10 px-10 py-2.5 rounded-full text-[12px] font-black uppercase tracking-[0.2em] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary dark:focus-visible:ring-brand-saffron transition-colors duration-200"
            >
              <span className={active === tab ? 'text-white dark:text-brand-dark' : 'text-[#1a3326]/55 dark:text-white/50'}>
                {MV_DATA[tab].label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="relative overflow-hidden rounded-3xl
                      border border-[#dde8e2] dark:border-white/10
                      bg-white dark:bg-[#0d2018]
                      shadow-[0_8px_40px_rgba(4,98,65,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.45)]">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={active} role="tabpanel" id={`${active}-panel`} aria-labelledby={`${active}-tab`}
            custom={dir} variants={SLIDE} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 items-stretch"
          >
            {/* Image */}
            <div className="relative overflow-hidden order-2 md:order-1 min-h-[260px] md:min-h-[420px]">
              <motion.img key={`img-${active}`} src={d.img} alt={d.imgAlt}
                className="w-full h-full object-cover absolute inset-0"
                initial={{ scale: 1.06, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.04, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061410]/70 via-transparent to-transparent
                              md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#0d2018]/25" />
              <div className="absolute top-5 left-5">
                <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-lg border border-white/20 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFB347] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/90">{d.eyebrow}</span>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="order-1 md:order-2 flex flex-col justify-center p-8 md:p-12 lg:p-14">
              <motion.h3 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.45 }}
                className="text-3xl md:text-4xl font-black tracking-[-0.03em] mb-4 text-[#0f2318] dark:text-white">
                {d.heading}
              </motion.h3>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.45 }}
                className="text-[14.5px] leading-[1.8] mb-8 text-[#1a3326]/65 dark:text-white/75">
                {d.body}
              </motion.p>
              <div className="space-y-3">
                {d.pillars.map((p, i) => (
                  <motion.div key={p.title} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                    className="group flex items-start gap-3.5 p-3.5 rounded-xl
                               bg-[#f0f7f3] dark:bg-[#1a3d28]/70
                               border border-[#046241]/10 dark:border-[#4ade80]/12
                               hover:border-[#046241]/30 dark:hover:border-[#4ade80]/30
                               hover:shadow-[0_4px_16px_rgba(4,98,65,0.1)]
                               transition-all duration-200 cursor-default">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#046241] text-white flex items-center justify-center
                                    shadow-[0_2px_8px_rgba(4,98,65,0.35)] group-hover:shadow-[0_4px_14px_rgba(4,98,65,0.5)]
                                    group-hover:scale-110 transition-all duration-200">
                      {p.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-black uppercase tracking-[0.14em] mb-0.5 text-[#046241] dark:text-[#4ade80]">{p.title}</p>
                      <p className="text-[12.5px] leading-relaxed text-[#1a3326]/60 dark:text-white/65">{p.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              {/* Dot indicators */}
              <div className="flex items-center gap-2 mt-8">
                {TABS.map(tab => (
                  <button key={tab} onClick={() => switchTo(tab)} aria-label={`Switch to ${MV_DATA[tab].label}`} className="focus:outline-none">
                    <motion.div
                      animate={{ width: active === tab ? 24 : 6, opacity: active === tab ? 1 : 0.25 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="h-1.5 rounded-full bg-[#046241] dark:bg-[#4ade80]"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════
const AboutUsPage: React.FC = () => {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const countries = useCounter(STATS[0].target);
  const datapoints = useCounter(STATS[1].target);
  const domains = useCounter(STATS[2].target);
  const experts = useCounter(STATS[3].target);
  const statCounters = [countries, datapoints, domains, experts];

  return (
    <>
      

      <section className="bg-brand-paper dark:bg-brand-dark transition-colors duration-500 overflow-hidden">

        {/* ══════════════════ 1. HEADER ══════════════════ */}
        <div className="px-6 md:px-16 pt-20 pb-0">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-12">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white dark:bg-[#1a3326] border border-[#046241]/15 dark:border-[#4ade80]/20 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFB347] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#046241] dark:text-[#4ade80]">About</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-end">
                <div>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[0.92] mb-5 text-[#0f2318] dark:text-white">
                    About our<br />
                    <span className="text-[#046241] dark:text-[#FFB347]">company</span>
                  </h1>
                  <p className="text-[15px] leading-relaxed text-[#1a3326]/60 dark:text-white/70 max-w-md">
                    While we are motivated by business and economic objectives, we remain committed
                    to our core beliefs that shape our corporate and individual behaviour around the world.
                  </p>
                </div>

                {/* Stats 2x2 */}
                <div className="grid grid-cols-2 gap-3 lg:w-64">
                  {STATS.map((s, i) => (
                    <motion.div
                      key={s.label}
                      ref={statCounters[i].ref}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.12 + i * 0.08, duration: 0.45 }}
                      className="rounded-2xl p-4 bg-white dark:bg-[#0d2018]
                                 border border-[#e4ede7] dark:border-white/10
                                 shadow-[0_8px_24px_rgba(4,98,65,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
                    >
                      <p className="text-2xl md:text-3xl font-black leading-none tracking-[-0.03em] text-[#0f2318] dark:text-white">
                        {statCounters[i].val}
                        {s.suffix}
                      </p>
                      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#1a3326]/55 dark:text-white/55">
                        {s.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <a href="/contact"
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full
                             bg-brand-primary dark:bg-brand-saffron text-white dark:text-brand-dark
                             text-[12px] font-black uppercase tracking-[0.18em]
                             shadow-lg shadow-brand-primary/20 dark:shadow-brand-saffron/20
                             hover:scale-105 active:scale-95 transition-all duration-200">
                  Contact us
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 dark:bg-brand-dark/12 group-hover:bg-white/30 dark:group-hover:bg-brand-dark/20 transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </a>
              </div>
            </motion.div>

            {/* ── Hero image grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-[1.65fr_1fr] gap-4 items-stretch">
              {/* Large left */}
              <motion.div initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="group relative rounded-3xl overflow-hidden aspect-[4/3] shadow-[0_12px_50px_rgba(4,98,65,0.15)] cursor-pointer">
                <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80"
                  alt="Team collaborating"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#046241]/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-5 left-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                  <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-4 py-2 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFB347] animate-pulse" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Our team at work</span>
                  </div>
                </div>
              </motion.div>

              {/* Right column */}
              <div className="flex flex-col gap-4">
                <motion.div initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative rounded-3xl overflow-hidden flex-1 shadow-[0_12px_50px_rgba(4,98,65,0.12)] cursor-pointer" style={{ minHeight: '200px' }}>
                  <img src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80"
                    alt="Team meeting"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#046241]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>

                {/* Let's collaborate card */}
                <motion.a href="/contact" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="group relative rounded-3xl overflow-hidden p-6
                             bg-[#046241] hover:-translate-y-1
                             shadow-[0_8px_30px_rgba(4,98,65,0.35)] hover:shadow-[0_14px_44px_rgba(4,98,65,0.55)]
                             transition-all duration-300 cursor-pointer block">
                  <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/8 group-hover:bg-white/14 transition-colors duration-300" />
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-[#FFB347]/20 group-hover:bg-[#FFB347]/32 transition-colors duration-300" />
                  <div className="relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.28em] text-white/55 mb-2 block">Join us</span>
                    <p className="text-xl font-black tracking-tight text-white leading-tight">Let's<br />collaborate</p>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/65 group-hover:text-white transition-colors duration-200">
                      Get in touch
                      <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.a>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════ 2. CORE VALUE ══════════════════ */}
        <div className="px-6 md:px-16 py-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16 lg:gap-20 items-start">

              {/* Left sticky */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.7 }} className="lg:sticky lg:top-24">
                <span className="block text-xs font-black uppercase tracking-[0.28em] text-[#046241]/50 dark:text-[#4ade80]/50 mb-3">
                  What we stand for
                </span>
                <div className="flex items-baseline gap-3 flex-wrap mb-6">
                  <span className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-[#0f2318] dark:text-white">CORE</span>
                  <span className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-[#FFB347] relative">
                    VALUE
                    <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-[#FFB347]/40" />
                  </span>
                </div>
                <p className="text-[14.5px] leading-[1.85] text-[#1a3326]/60 dark:text-white/60 mb-8 max-w-xs">
                  At Lifewood we empower our company and our clients to realise the transformative power of AI.
                  Bringing big data to life, launching new ways of thinking, innovating, learning, and doing.
                </p>
                {/* Hovered value preview */}
                <AnimatePresence mode="wait">
                  {hoveredValue !== null && (
                    <motion.div key={hoveredValue} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                      className="p-4 rounded-2xl bg-[#046241]/8 dark:bg-[#046241]/20 border border-[#046241]/15 dark:border-[#4ade80]/20">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#046241] dark:text-[#4ade80] mb-1">{CORE_VALUES[hoveredValue].name}</p>
                      <p className="text-[12.5px] leading-relaxed text-[#1a3326]/65 dark:text-white/65">{CORE_VALUES[hoveredValue].desc}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Right 2×2 cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CORE_VALUES.map((v, i) => (
                  <motion.div key={v.name}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    whileHover={{ y: -6, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
                    onHoverStart={() => setHoveredValue(i)} onHoverEnd={() => setHoveredValue(null)}
                    className="group relative rounded-2xl overflow-hidden cursor-default p-6
                               bg-white dark:bg-[#0d2018]
                               border border-[#e4ede7] dark:border-white/10
                               shadow-[0_2px_12px_rgba(4,98,65,0.06)]
                               hover:shadow-[0_12px_40px_rgba(4,98,65,0.18)] dark:hover:shadow-[0_12px_40px_rgba(74,222,128,0.1)]
                               hover:border-[#046241]/35 dark:hover:border-[#4ade80]/30
                               transition-all duration-300">
                    {/* Top shimmer */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#046241] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#046241] text-white text-2xl font-black
                                      shadow-[0_4px_14px_rgba(4,98,65,0.35)] group-hover:shadow-[0_6px_20px_rgba(4,98,65,0.5)]
                                      group-hover:scale-110 transition-all duration-300">{v.letter}</div>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center
                                      bg-[#046241]/8 dark:bg-[#4ade80]/10 text-[#046241] dark:text-[#4ade80]
                                      group-hover:bg-[#046241]/15 dark:group-hover:bg-[#4ade80]/18 transition-colors duration-200">{v.icon}</div>
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] mb-2 text-[#046241] dark:text-[#4ade80]">{v.name}</p>
                    <p className="text-[13px] leading-[1.75] text-[#1a3326]/60 dark:text-white/65">{v.desc}</p>
                    {/* Green wash */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#046241]/0 to-[#046241]/4 dark:from-[#4ade80]/0 dark:to-[#4ade80]/4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════ 3. MISSION / VISION ══════════════════ */}
        <div className="px-6 md:px-16 py-20 bg-[#eef5f1] dark:bg-[#061310] border-t border-b border-[#046241]/8 dark:border-white/6">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#046241]/60 dark:text-[#4ade80]/60 block mb-4">Purpose</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-[-0.03em] text-[#0f2318] dark:text-white leading-tight">
                What drives us today,{' '}
                <br className="hidden md:block" />
                <span className="text-[#046241] dark:text-[#FFB347]">and what inspires us for tomorrow</span>
              </h2>
            </motion.div>
            <div className="max-w-6xl mx-auto">
              <MissionVisionBlock />
            </div>
          </div>
        </div>

        {/* ══════════════════ 4. BE AMAZED ══════════════════ */}
        <div className="px-6 md:px-16 py-20 md:py-24 transition-colors duration-500 bg-gradient-to-r from-[#eef6f1] via-[#e6f1eb] to-[#eef6f1] dark:bg-gradient-to-r dark:from-[#032715] dark:via-[#053620] dark:to-[#032715]">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.45 }} transition={{ duration: 0.7 }} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#FFB347]" />
                <span className="text-2xl font-black tracking-tight text-[#0f2318] dark:text-white">lifewood</span>
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.32em] text-[#046241]/75 dark:text-[#4ade80]/85 mb-2">Be amazed</p>
              <h2 className="text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#0f2318] dark:text-white">Life at Lifewood</h2>
            </motion.div>


            {/* Row 2 — right */}
            <div className="overflow-hidden">
              <LifeAtLifewoodCards />
            </div>

            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.45 }} transition={{ delay: 0.3 }} className="flex justify-center mt-10">
              <a href="/careers"
                className="bg-brand-primary dark:bg-brand-saffron text-white dark:text-brand-dark px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 dark:shadow-brand-saffron/20 whitespace-nowrap">
                Join our team
              </a>
            </motion.div>
          </div>
        </div>

      </section>
    </>
  );
};

export default AboutUsPage;



