
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { EXPERTS } from '../constants';

const ExpertsSection: React.FC = () => {
  // Explicitly type containerVariants as Variants
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Explicitly type expertVariants as Variants
  const expertVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section className="px-6 md:px-16 py-32 bg-brand-seasalt dark:bg-brand-dark/30 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-20"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold text-brand-dark dark:text-brand-seasalt mb-6 transition-colors">
          Meet Our <span className="text-brand-primary dark:text-brand-saffron italic">Experts</span>
        </h2>
        <p className="text-brand-dark/60 dark:text-brand-seasalt/60 font-medium transition-colors">
          Our team consists of world-class data scientists, linguists, and project managers dedicated to your success.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {EXPERTS.map((expert, idx) => (
          <motion.div key={idx} variants={expertVariants} className="group">
            <div className="overflow-hidden rounded-custom mb-6 aspect-[4/5] border border-brand-dark/5 dark:border-white/5 shadow-lg">
               <img 
                 src={expert.image} 
                 className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                 alt={expert.name}
               />
            </div>
            <h4 className="text-xl font-extrabold text-brand-dark dark:text-brand-seasalt transition-colors">{expert.name}</h4>
            <p className="text-brand-dark/40 dark:text-brand-seasalt/40 text-sm font-bold uppercase tracking-widest mt-1 transition-colors">{expert.role}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default ExpertsSection;
