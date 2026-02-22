import React, { useState, useEffect, useRef } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';

// ─── LEFT SIDE: IMAGE SLIDESHOW ───────────────────────────────────────────────
const SLIDE_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    alt: "Secure Global Data Hub"
  },
  {
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    alt: "Collaborative Tech Environment"
  },
  {
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    alt: "Global AI Infrastructure"
  }
];

// ─── RIGHT SIDE: VIDEO CONFIG ─────────────────────────────────────────────────
const VIDEO_SOURCES = [
  "https://videos.pexels.com/video-files/7794285/7794285-uhd_2560_1440_25fps.mp4",
  "https://videos.pexels.com/video-files/7794285/7794285-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/7794285/7794285-sd_960_540_25fps.mp4",
];
const VIDEO_FALLBACK_IMG = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80";

const Hero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDE_IMAGES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <section className="px-6 md:px-12 pt-16 pb-12 md:pt-20 md:pb-16 bg-brand-paper dark:bg-brand-dark transition-colors duration-500">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative bg-[#F9F7F7] dark:bg-[#0B2518]/40 rounded-[2.5rem] overflow-hidden min-h-[680px] lg:min-h-[720px] flex flex-col lg:flex-row items-stretch border border-brand-dark/5 dark:border-white/5 shadow-2xl transition-all duration-300"
      >

        {/* ── LEFT: LOOPING VIDEO + CONTENT ────────────────────────────────────── */}
        <div className="flex-1 relative flex flex-col justify-center overflow-hidden">

          {/* Video background */}
          <div className="absolute inset-0 z-0">
            {/* Ken Burns fallback sits behind always */}
            <motion.div
              className="absolute inset-[-8%] w-[116%] h-[116%]"
              animate={{
                x: ["0%", "-3%", "0%", "2%", "0%"],
                y: ["0%", "2%", "-2%", "0%", "0%"],
                scale: [1, 1.05, 1.02, 1.06, 1],
              }}
              transition={{ duration: 22, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
            >
              <img src={VIDEO_FALLBACK_IMG} alt="" aria-hidden="true" className="w-full h-full object-cover" />
            </motion.div>

            {/* Looping video on top */}
            {!videoFailed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  onError={() => setVideoFailed(true)}
                >
                  {VIDEO_SOURCES.map((src) => (
                    <source key={src} src={src} type="video/mp4" />
                  ))}
                </video>
              </motion.div>
            )}

            {/* Gradient mask: heavy on left so text pops, fades right */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F9F7F7] via-[#F9F7F7]/90 to-[#F9F7F7]/50 dark:from-[#0B2518] dark:via-[#0B2518]/90 dark:to-[#0B2518]/50" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F9F7F7]/20 dark:to-[#0B2518]/20" />
          </div>

          {/* Text content */}
          <div className="relative z-10 p-8 md:p-16 lg:p-24 flex flex-col h-full justify-center">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-brand-primary/5 dark:bg-brand-saffron/10 text-brand-primary dark:text-brand-saffron px-4 py-2 rounded-full text-[10px] font-black mb-8 uppercase tracking-[0.3em] border border-brand-primary/10 dark:border-brand-saffron/20 w-fit"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary dark:bg-brand-saffron animate-pulse"></span>
              Global AI Data Solutions
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-8xl lg:text-[100px] font-black leading-[0.95] text-[#0B2518] dark:text-brand-seasalt mb-10 tracking-[-0.04em]"
            >
              Always On<br />
              <span className="text-[#046241] dark:text-brand-saffron">Never Off.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-brand-dark/60 dark:text-brand-seasalt/70 max-w-lg mb-12 leading-relaxed font-medium transition-all"
            >
              Lifewood is the super-bridge connecting global AI innovation. We transform raw data into world-class intelligence.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-16">
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#046241] dark:bg-brand-saffron text-white dark:text-brand-dark px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:shadow-2xl transition-all shadow-xl shadow-brand-primary/20 dark:shadow-brand-saffron/20 flex items-center justify-center gap-2 group"
              >
                Contact Us
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.a>
              <motion.a
                href="/about-us"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white dark:bg-brand-dark text-brand-dark dark:text-brand-seasalt border border-brand-dark/10 dark:border-white/10 px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-brand-seasalt dark:hover:bg-white/5 transition-all flex items-center justify-center"
              >
                Learn More
              </motion.a>
            </motion.div>

            {/* Location indicators */}
            <motion.div variants={itemVariants} className="flex items-center gap-6 mt-auto">
              <div className="h-8 w-px bg-brand-dark/10 dark:bg-white/20"></div>
              <div>
                <p className="text-[10px] font-black text-brand-dark/30 dark:text-brand-seasalt/40 uppercase tracking-[0.3em] mb-2">
                  Bridging the Globe
                </p>
                <div className="flex gap-4 text-brand-dark/50 dark:text-brand-seasalt/60 font-bold text-[10px] uppercase tracking-widest">
                  <span>Malaysia</span>
                  <span>Singapore</span>
                  <span>China</span>
                  <span>SE Asia</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── RIGHT: IMAGE SLIDESHOW ────────────────────────────────────────────── */}
        <div className="flex-1 relative w-full overflow-hidden z-10 min-h-[400px] lg:min-h-0">

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 2.5, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-brand-dark/10 z-10" />
              <img
                src={SLIDE_IMAGES[currentSlide].url}
                className="w-full h-full object-cover"
                alt={SLIDE_IMAGES[currentSlide].alt}
              />
            </motion.div>
          </AnimatePresence>

          {/* Slide progress indicators */}
          <div className="absolute bottom-12 right-12 flex items-center gap-4 z-30">
            {SLIDE_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className="group relative h-10 flex items-center"
              >
                <div
                  className={`h-0.5 rounded-full transition-all duration-500 ${
                    idx === currentSlide
                      ? 'w-12 bg-[#046241] dark:bg-brand-saffron'
                      : 'w-6 bg-white/30 group-hover:bg-white/60'
                  }`}
                />
              </button>
            ))}
            <div className="ml-4 flex items-center gap-2 text-[10px] font-black text-white/40 tracking-widest uppercase">
              <span className="text-white">0{currentSlide + 1}</span>
              <span className="w-4 h-px bg-white/20" />
              <span>0{SLIDE_IMAGES.length}</span>
            </div>
          </div>

          {/* Floating UI card */}
         

        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
