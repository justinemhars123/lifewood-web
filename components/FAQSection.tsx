
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQS } from '../constants';

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="px-6 md:px-16 py-32 max-w-7xl mx-auto transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
           <h2 className="text-4xl md:text-5xl font-extrabold text-brand-dark dark:text-brand-seasalt mb-6 leading-tight transition-colors">
             Frequently Asked <br />
             <span className="text-brand-primary dark:text-brand-saffron italic">Questions</span>
           </h2>
           <p className="text-lg font-medium text-brand-dark/60 dark:text-brand-seasalt/60 mb-12 transition-colors">
             Find answers to common questions about our AI data solutions and methodologies.
           </p>
           
           <div className="space-y-4">
             {FAQS.map((faq, idx) => (
               <div key={idx} className="border-b border-brand-dark/10 dark:border-white/10 transition-colors">
                 <button 
                   onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                   className="w-full py-6 flex items-center justify-between text-left group"
                 >
                   <span className="text-lg font-extrabold text-brand-dark dark:text-brand-seasalt group-hover:text-brand-primary dark:group-hover:text-brand-saffron transition-colors">
                     {faq.question}
                   </span>
                   <motion.svg 
                    animate={{ rotate: openIndex === idx ? 180 : 0 }}
                    className={`w-5 h-5 text-brand-dark/40 dark:text-brand-seasalt/40 transition-colors`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                   >
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                   </motion.svg>
                 </button>
                 <AnimatePresence>
                   {openIndex === idx && (
                     <motion.div 
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       transition={{ duration: 0.3 }}
                       className="overflow-hidden"
                     >
                       <p className="pb-6 text-brand-dark/60 dark:text-brand-seasalt/60 leading-relaxed font-medium transition-colors">
                         {faq.answer}
                       </p>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
             ))}
           </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative rounded-custom overflow-hidden hidden lg:block shadow-2xl"
        >
           <img 
             src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
             className="w-full h-full object-cover min-h-[500px] grayscale dark:opacity-80"
             alt="Support team"
           />
           <div className="absolute inset-0 bg-brand-dark/10 dark:bg-brand-dark/30 transition-colors"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
