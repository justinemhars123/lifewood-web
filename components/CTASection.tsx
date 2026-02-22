import React from 'react';
import { motion } from 'framer-motion';

const CTASection: React.FC = () => {
  return (
    <section className="px-6 md:px-16 py-32">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-brand-dark rounded-custom p-16 md:p-32 text-center relative overflow-hidden shadow-2xl border border-white/5"
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-brand-saffron transform -translate-y-1/2" />
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-brand-saffron transform -translate-x-1/2" />
        </div>

        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-brand-saffron font-black uppercase tracking-[0.4em] text-sm mb-8"
          >
            Get In Touch
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-none"
          >
            Always <span className="italic text-brand-saffron/60">On.</span>
            <br />
            Never <span className="italic text-brand-saffron/60">Off.</span>
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/60 text-xl font-medium max-w-2xl mx-auto mb-16 leading-relaxed"
          >
            Launch new ways of thinking, learning and doing; for the good of humankind.
            Start your AI journey with Lifewood today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <a
              href="/offices"
              className="px-12 py-6 rounded-full font-black text-xl transition-all border-2 bg-transparent border-white/10 text-white hover:bg-white/10"
            >
              See Locations
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
