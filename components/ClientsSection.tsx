
import React from 'react';
import { motion } from 'framer-motion';
import { CLIENTS, CLIENT_PARTNER_DESCRIPTION } from '../constants';

const ClientsSection: React.FC = () => {
  // Triple the logos to ensure a seamless loop across wide screens
  const marqueeLogos = [...CLIENTS, ...CLIENTS, ...CLIENTS];

  return (
    <section className="py-32 bg-white dark:bg-brand-dark/5 transition-colors overflow-hidden border-t border-brand-dark/5 dark:border-white/5">
      <div className="px-6 md:px-16 max-w-4xl mx-auto text-center mb-24">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-normal text-brand-dark dark:text-brand-seasalt mb-10 tracking-tight"
        >
          Our Clients And Partners
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-brand-dark/80 dark:text-brand-seasalt/70 text-lg md:text-xl leading-[1.6] max-w-4xl mx-auto font-light"
        >
          {CLIENT_PARTNER_DESCRIPTION}
        </motion.p>
      </div>

      <div className="relative flex">
        {/* Left gradient fade for marquee */}
        <div className="absolute top-0 left-0 w-32 h-full z-10 bg-gradient-to-r from-white dark:from-brand-dark to-transparent pointer-events-none"></div>
        
        <motion.div 
          className="flex gap-24 items-center whitespace-nowrap"
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {marqueeLogos.map((client, idx) => (
            <div 
              key={`${client.name}-${idx}`} 
              className="group flex-shrink-0 flex items-center justify-center grayscale hover:grayscale-0 dark:grayscale-0 transition-all duration-700 opacity-40 hover:opacity-100 dark:opacity-80 dark:hover:opacity-100 px-4"
            >
              <img 
                src={client.logo} 
                alt={client.name} 
                className={`object-contain h-16 md:h-20 bg-transparent transition-all duration-700 ${client.isWide ? 'w-auto' : 'max-w-[150px]'} dark:[filter:brightness(0)_invert(1)] dark:group-hover:[filter:none]`}
              />
            </div>
          ))}
        </motion.div>

        {/* Right gradient fade for marquee */}
        <div className="absolute top-0 right-0 w-32 h-full z-10 bg-gradient-to-l from-white dark:from-brand-dark to-transparent pointer-events-none"></div>
      </div>


    </section>
  );
};

export default ClientsSection;
