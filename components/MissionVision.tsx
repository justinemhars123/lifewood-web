import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = ['mission', 'vision'] as const;
type Tab = typeof TABS[number];

const DATA: Record<Tab, {
  label: string;
  heading: string;
  body: string;
  img: string;
  imgAlt: string;
  pillars: { icon: React.ReactNode; title: string; desc: string }[];
}> = {
  mission: {
    label: 'Mission',
    heading: 'Our Mission',
    body: 'To develop and deploy cutting-edge AI technologies that solve real-world problems, empower communities, and advance sustainable practices. We are committed to fostering a culture of innovation, collaborating with stakeholders across sectors, and making a meaningful impact on society and the environment.',
    img: 'https://images.unsplash.com/photo-1529336953123-322f21b5a9f3?auto=format&fit=crop&w=800&q=80',
    imgAlt: 'Mission',
    pillars: [
      {
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        ),
        title: 'Ethical Practice',
        desc: 'Privacy-safe, consent-driven data acquisition on every project.',
      },
      {
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          </svg>
        ),
        title: 'Global Reach',
        desc: 'Active operations spanning 30+ countries with local expertise.',
      },
      {
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ),
        title: 'Measurable Impact',
        desc: 'Rigorous quality controls and transparent outcome reporting.',
      },
    ],
  },
  vision: {
    label: 'Vision',
    heading: 'Our Vision',
    body: 'To be the global champion in AI data solutions, igniting a culture of innovation that enriches lives and transforms communities — creating sustainable impact at scale across every language, culture, and region.',
    img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80',
    imgAlt: 'Vision',
    pillars: [
      {
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        ),
        title: 'Inclusive AI',
        desc: 'Every language and culture represented in tomorrow\'s AI systems.',
      },
      {
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
        ),
        title: 'Shared Prosperity',
        desc: 'Economic opportunity for data contributors in every region.',
      },
      {
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path d="M1 6l11 6 11-6" />
            <path d="M1 12l11 6 11-6" />
          </svg>
        ),
        title: 'Open Systems',
        desc: 'Transparent AI pipelines built on trust and accountability.',
      },
    ],
  },
};

// Direction: mission→vision = slide left, vision→mission = slide right
const SLIDE_VARIANTS = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const MissionVision: React.FC = () => {
  const [active, setActive] = useState<Tab>('mission');
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const btnRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ mission: null, vision: null });

  const switchTo = (tab: Tab) => {
    if (tab === active) return;
    setDirection(tab === 'vision' ? 1 : -1);
    setActive(tab);
  };

  // Arrow key navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); switchTo('vision'); btnRefs.current.vision?.focus(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); switchTo('mission'); btnRefs.current.mission?.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active]);

  const d = DATA[active];
  const missionIdx = TABS.indexOf('mission');
  const activeIdx  = TABS.indexOf(active);

  return (
    <section aria-labelledby="mv-heading" className="w-full">

      {/* ── Toggle switch ── */}
      <div className="flex justify-center mb-10">
        <div
          role="tablist"
          aria-label="Mission and Vision"
          className="relative flex items-center p-1 rounded-full
                     bg-white dark:bg-[#0d2018]
                     border border-[#046241]/15 dark:border-[#4ade80]/20
                     shadow-[0_2px_12px_rgba(4,98,65,0.08)]"
        >
          {/* Sliding pill indicator */}
          <motion.div
            className="absolute top-1 bottom-1 rounded-full
                       bg-[#046241] dark:bg-[#046241]
                       shadow-[0_2px_10px_rgba(4,98,65,0.4)]"
            animate={{ left: activeIdx === 0 ? '4px' : '50%', right: activeIdx === 0 ? '50%' : '4px' }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            aria-hidden
          />

          {TABS.map((tab) => (
            <button
              key={tab}
              ref={(el) => { btnRefs.current[tab] = el; }}
              role="tab"
              id={`${tab}-tab`}
              aria-selected={active === tab}
              aria-controls={`${tab}-panel`}
              tabIndex={active === tab ? 0 : -1}
              onClick={() => switchTo(tab)}
              className="relative z-10 px-10 py-2.5 rounded-full
                         text-[12px] font-black uppercase tracking-[0.2em]
                         transition-colors duration-300 focus:outline-none
                         focus-visible:ring-2 focus-visible:ring-[#046241]"
              style={{ color: active === tab ? '#fff' : undefined }}
              aria-label={DATA[tab].label}
            >
              <span className={active === tab ? 'text-white' : 'text-[#1a3326]/60 dark:text-white/50'}>
                {DATA[tab].label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content card ── */}
      <div className="relative overflow-hidden rounded-3xl
                      border border-[#dde8e2] dark:border-white/10
                      bg-white dark:bg-[#0d2018]
                      shadow-[0_8px_40px_rgba(4,98,65,0.08)]
                      dark:shadow-[0_8px_40px_rgba(0,0,0,0.45)]">

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={active}
            role="tabpanel"
            id={`${active}-panel`}
            aria-labelledby={`${active}-tab`}
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 items-stretch"
          >
            {/* ── Image panel ── */}
            <div className="relative overflow-hidden order-2 md:order-1 min-h-[260px] md:min-h-[420px]">
              <motion.img
                key={`img-${active}`}
                src={d.img}
                alt={d.imgAlt}
                className="w-full h-full object-cover absolute inset-0"
                initial={{ scale: 1.06, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.04, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              {/* Bottom gradient scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#061410]/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#0d2018]/30" />

              {/* Floating eyebrow on image */}
              <div className="absolute top-5 left-5">
                <div className="inline-flex items-center gap-2
                                bg-black/30 backdrop-blur-lg border border-white/20
                                px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFB347] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/90">
                    {active === 'mission' ? 'What drives us' : 'Where we are headed'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Text panel ── */}
            <div className="order-1 md:order-2 flex flex-col justify-center p-8 md:p-12 lg:p-14">

              {/* Heading */}
              <motion.h3
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.45 }}
                className="text-3xl md:text-4xl font-black tracking-[-0.03em] mb-4
                           text-[#0f2318] dark:text-white"
              >
                {d.heading}
              </motion.h3>

              {/* Body */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.45 }}
                className="text-[14.5px] leading-[1.8] mb-8
                           text-[#1a3326]/65 dark:text-white/75"
              >
                {d.body}
              </motion.p>

              {/* Pillars */}
              <div className="space-y-3">
                {d.pillars.map((pillar, i) => (
                  <motion.div
                    key={pillar.title}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                    className="flex items-start gap-3.5 p-3.5 rounded-xl
                               bg-[#f0f7f3] dark:bg-[#1a3d28]/70
                               border border-[#046241]/10 dark:border-[#4ade80]/12"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg
                                    bg-[#046241] text-white
                                    flex items-center justify-center
                                    shadow-[0_2px_8px_rgba(4,98,65,0.35)]">
                      {pillar.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-black uppercase tracking-[0.14em] mb-0.5
                                    text-[#046241] dark:text-[#4ade80]">
                        {pillar.title}
                      </p>
                      <p className="text-[12.5px] leading-relaxed
                                    text-[#1a3326]/60 dark:text-white/60">
                        {pillar.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bottom indicator dots */}
              <div className="flex items-center gap-2 mt-8">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => switchTo(tab)}
                    aria-label={`Switch to ${DATA[tab].label}`}
                    className="focus:outline-none"
                  >
                    <motion.div
                      animate={{
                        width: active === tab ? 24 : 6,
                        backgroundColor: active === tab ? '#046241' : '#046241',
                        opacity: active === tab ? 1 : 0.25,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="h-1.5 rounded-full"
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

export default MissionVision;