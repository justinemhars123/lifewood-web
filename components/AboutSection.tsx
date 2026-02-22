
import React from 'react';
import { motion } from 'framer-motion';

const AboutSection: React.FC = () => {
  return (
    <section id="vision" className="px-6 md:px-16 py-32 bg-brand-paper dark:bg-brand-dark transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-brand-primary dark:text-brand-saffron font-black uppercase tracking-[0.4em] text-xs mb-4">About Us</h2>
          <h3 className="text-4xl md:text-6xl font-extrabold text-brand-dark dark:text-brand-seasalt tracking-tighter leading-none">
            Transforming Global <br/>
            <span className="text-brand-primary dark:text-brand-saffron italic">Data Intelligence</span>
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-16"
          >
             <div>
               <h2 className="text-brand-primary dark:text-brand-saffron font-black uppercase tracking-[0.3em] text-xs mb-6">Our Vision</h2>
               <p className="text-2xl md:text-3xl font-extrabold text-brand-dark dark:text-brand-seasalt leading-[1.2] tracking-tight transition-colors">
                 To be the global champion in AI data solutions, igniting a culture of innovation that <span className="text-brand-primary dark:text-brand-saffron">enriches lives and transforms communities.</span>
               </p>
             </div>
             
             <div>
               <h2 className="text-brand-primary dark:text-brand-saffron font-black uppercase tracking-[0.3em] text-xs mb-6">Our Mission</h2>
               <p className="text-lg text-brand-dark/70 dark:text-brand-seasalt/70 leading-relaxed font-medium transition-colors">
                 To develop and deploy cutting edge AI technologies that solve real-world problems, empower communities, and advance sustainable practices. We are committed to fostering a culture of innovation and making a meaningful impact on society.
               </p>
             </div>

             <div className="grid grid-cols-2 gap-8 pt-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="p-6 bg-white dark:bg-brand-dark/40 rounded-3xl border border-brand-dark/5 dark:border-white/5 transition-all shadow-sm"
                >
                   <h4 className="font-extrabold text-brand-primary dark:text-brand-saffron text-xl mb-1">Bridge</h4>
                   <p className="text-xs font-medium text-brand-dark/40 dark:text-brand-seasalt/40 uppercase tracking-wider">East Meets West</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="p-6 bg-white dark:bg-brand-dark/40 rounded-3xl border border-brand-dark/5 dark:border-white/5 transition-all shadow-sm"
                >
                   <h4 className="font-extrabold text-brand-primary dark:text-brand-saffron text-xl mb-1">ESG</h4>
                   <p className="text-xs font-medium text-brand-dark/40 dark:text-brand-seasalt/40 uppercase tracking-wider">Sustainable AI</p>
                </motion.div>
             </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative group"
          >
             <div className="absolute -inset-4 bg-brand-primary/5 dark:bg-brand-saffron/10 rounded-custom scale-95 group-hover:scale-100 transition-transform duration-700"></div>
             <div className="overflow-hidden rounded-custom shadow-2xl border border-brand-dark/5 dark:border-white/5">
                <motion.img 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                  className="relative w-full grayscale group-hover:grayscale-0 transition-all duration-700"
                  alt="The Lifewood Team"
                />
             </div>
             <motion.div 
               initial={{ y: 30, opacity: 0 }}
               whileInView={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.4, duration: 0.6 }}
               className="absolute -bottom-12 -right-12 bg-brand-dark dark:bg-brand-primary text-white p-10 rounded-custom shadow-2xl max-w-xs transition-colors border border-white/10"
             >
                <p className="text-[10px] font-black text-brand-saffron mb-2 tracking-[0.3em] uppercase">The Bridge</p>
                <h3 className="text-2xl font-black mb-4 tracking-tighter">Strategic Hubs</h3>
                <ul className="space-y-3 text-white/70 font-bold text-xs uppercase tracking-tight">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-saffron rounded-full"></span> Malaysia (HQ)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-saffron rounded-full"></span> Singapore
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-saffron rounded-full"></span> Mainland China
                  </li>
                </ul>
             </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
