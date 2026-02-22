import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, Variants } from 'framer-motion';

const InnovationSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Smooth spring-dampened parallax
  const rawY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const smoothY = useSpring(rawY, { stiffness: 60, damping: 20 });

  // Scale the whole panel in as it enters viewport
  const panelScale = useTransform(scrollYProgress, [0, 0.15], [0.94, 1]);
  const panelOpacity = useTransform(scrollYProgress, [0, 0.12], [0, 1]);
  const smoothScale = useSpring(panelScale, { stiffness: 80, damping: 25 });
  const smoothOpacity = useSpring(panelOpacity, { stiffness: 80, damping: 25 });

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 22, filter: 'blur(8px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const stagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };

  return (
    <section
      ref={sectionRef}
      className="px-4 md:px-10 py-14 bg-brand-paper dark:bg-brand-dark transition-colors duration-500"
    >
      <motion.div
        style={{ scale: smoothScale, opacity: smoothOpacity }}
        className="max-w-[1400px] mx-auto"
      >
        {/* ── OUTER PANEL ──────────────────────────────────────────── */}
        <div className="bg-[#071911] rounded-[2rem] p-6 md:p-10 relative overflow-hidden shadow-2xl">

          {/* Atmospheric glows */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.18, 1], opacity: [0.12, 0.22, 0.12] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-[20%] -left-[10%] w-[50%] h-[60%] bg-[#046241] blur-[100px] rounded-full"
            />
            <motion.div
              animate={{ x: [0, 30, 0], y: [0, -20, 0], opacity: [0.06, 0.14, 0.06] }}
              transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-[20%] -right-[10%] w-[45%] h-[55%] bg-[#046241] blur-[90px] rounded-full"
            />
            {/* Subtle dot grid */}
            <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[size:28px_28px]" />
          </div>

          <div className="relative z-10">

            {/* ── HEADER ROW ──────────────────────────────────────────── */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
            >
              <div>
                {/* Eyebrow */}
                <motion.div variants={fadeUp} className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFB347] animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
                    Our approach
                  </span>
                </motion.div>

                {/* Headline — two words, staggered */}
                <div className="flex items-baseline gap-3 flex-wrap overflow-hidden">
                  <motion.span
                    variants={fadeUp}
                    className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white/75 leading-none"
                  >
                    Constant
                  </motion.span>
                  <motion.span
                    variants={fadeUp}
                    className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-none"
                  >
                    Innovation:
                  </motion.span>
                </div>

                {/* Subline */}
                <motion.p
                  variants={fadeUp}
                  className="text-[#FFB347]/80 font-light italic text-lg md:text-xl lg:text-2xl tracking-wide mt-1.5"
                >
                  Unlimited possibilities
                </motion.p>
              </div>

              {/* Right micro-stat */}
              <motion.div
                variants={fadeUp}
                className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-5 py-3 self-start sm:self-auto"
              >
                <div>
                  <div className="text-2xl font-black text-white tracking-tight leading-none">
                    Global<span className="text-[#FFB347]">+</span>
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35 mt-0.5">
                    AI projects at scale
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* ── CARDS ROW ────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-4">

              {/* LEFT — compact accent card */}
              <motion.div
                initial={{ opacity: 0, x: -24, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="relative group rounded-[1.5rem] overflow-hidden bg-[#046241] sm:w-[38%] h-[220px] sm:h-[260px] cursor-pointer flex-shrink-0 shadow-xl"
              >
                {/* Parallax image */}
                <motion.div style={{ y: smoothY }} className="absolute inset-[-10%] w-[120%] h-[120%]">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                    alt=""
                    className="w-full h-full object-cover opacity-20 grayscale group-hover:opacity-35 group-hover:grayscale-0 transition-all duration-1000"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#046241]/60 to-transparent" />

                {/* Saffron diamond watermark */}
                <div
                  className="absolute bottom-5 right-5 w-6 h-8 opacity-15 group-hover:opacity-40 transition-all duration-700 group-hover:scale-110"
                  style={{
                    background: '#FFB347',
                    clipPath: 'polygon(50% 0%,100% 35%,100% 65%,50% 100%,0% 65%,0% 35%)',
                  }}
                />

                <div className="relative h-full flex flex-col justify-between p-7">
                  <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/35">Scale</div>
                  <div>
                    <div className="text-4xl md:text-5xl font-black text-white tracking-[-0.04em] leading-none mb-2">
                      56k<span className="text-[#FFB347]">+</span>
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/45 leading-relaxed">
                      Data points<br />processed daily
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* RIGHT — editorial photo card */}
              <motion.div
                initial={{ opacity: 0, x: 24, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="relative group rounded-[1.5rem] overflow-hidden flex-1 h-[220px] sm:h-[260px] cursor-pointer shadow-xl"
              >
                <motion.div style={{ y: smoothY }} className="absolute inset-[-10%] w-[120%] h-[120%]">
                  <img
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80"
                    alt=""
                    className="w-full h-full object-cover grayscale brightness-60 group-hover:grayscale-0 group-hover:brightness-80 transition-all duration-1000"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#071911]/80 via-[#071911]/20 to-transparent" />

                {/* Top pill */}
                <div className="absolute top-5 left-5 z-10">
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                    className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#FFB347] animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-[0.25em] text-white/55">
                      Live projects
                    </span>
                  </motion.div>
                </div>

                {/* Bottom label */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="absolute bottom-5 left-5 z-10 flex items-center gap-2.5"
                >
                  <div className="w-6 h-px bg-[#FFB347]/50" />
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40">
                    Collaborative · Innovative · Global
                  </span>
                </motion.div>
              </motion.div>

            </div>

            {/* ── FOOTER ───────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, duration: 1 }}
              className="flex items-center justify-between mt-6 pt-5 border-t border-white/[0.06]"
            >
              <p className="text-[11px] text-white/30 font-medium leading-relaxed max-w-md">
                No matter the industry, size, or type of data — our solutions satisfy any AI data processing requirement.
              </p>
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1, duration: 0.7 }}
                className="hidden sm:flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-white/25"
              >
                <div className="w-5 h-px bg-[#FFB347]/30" />
                Always On. Never Off.
              </motion.div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default InnovationSection;