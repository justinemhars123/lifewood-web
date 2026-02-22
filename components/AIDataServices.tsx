
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const AIDataServices: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const yParallax = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  const cards = [
    {
      id: 'audio',
      title: 'Audio',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
      description: 'Collection, labeling, voice categorization, music categorization, intelligent transcription.',
      gridClass: 'lg:col-span-8 lg:row-span-1',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    },
    {
      id: 'text',
      title: 'Text',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      description: 'Entity extraction, sentiment analysis, translation, and high-fidelity text labeling.',
      gridClass: 'lg:col-span-4 lg:row-span-2',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'image',
      title: 'Image',
      image: 'https://images.unsplash.com/photo-1452723312111-3a7d0db0e024?auto=format&fit=crop&w=800&q=80',
      description: 'Object detection, classification, segmentation, and visual data processing.',
      gridClass: 'lg:col-span-3 lg:row-span-1',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'video',
      title: 'Video',
      image: 'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=1200&q=80',
      description: 'Temporal analysis, motion tracking, and frame-by-frame annotation.',
      gridClass: 'lg:col-span-5 lg:row-span-1',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <section 
      ref={sectionRef}
      id="solutions" 
      className="px-6 md:px-16 py-32 bg-brand-paper dark:bg-brand-dark text-brand-dark dark:text-white transition-colors duration-500 relative"
    >
      <div className="max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-16 text-left">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black tracking-[-0.04em] uppercase mb-6 leading-[0.92]"
          >
            <span className="text-brand-dark dark:text-white">AI data</span><br />
            <span className="text-[#046241] dark:text-brand-saffron">services</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-brand-dark/70 dark:text-white/60 max-w-4xl font-light leading-relaxed"
          >
            Lifewood offers AI and IT services that enhance decision-making, reduce costs, and improve productivity to optimize organizational performance.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 auto-rows-[300px] md:auto-rows-[400px]">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover="hover"
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className={`${card.gridClass} relative group rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-brand-primary/10 dark:hover:shadow-brand-saffron/5 border border-brand-dark/5 dark:border-white/5 cursor-pointer transition-shadow duration-500`}
            >
              {/* Image with hover zoom */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <motion.img
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover grayscale-[45%] brightness-[0.6] group-hover:grayscale-[20%] group-hover:brightness-[0.7] transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/68 via-black/42 to-black/92 opacity-85 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-[#046241]/18 group-hover:bg-[#046241]/46 transition-colors duration-700" />
              </div>

              {/* Glowing Border Overlay on Hover */}
              <div className="absolute inset-0 border-2 border-brand-saffron opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-[2.5rem] z-20 pointer-events-none"></div>

              {/* Icon & Title Group */}
              <div className="absolute top-10 left-10 z-10 flex flex-col gap-6">
                {/* Enhanced Icon Container with Advanced Hover Animations */}
                <motion.div 
                  variants={{
                    hover: { 
                      scale: 1.15,
                      backgroundColor: "#FFB347", // brand-saffron
                      color: "#0B2518", // brand-dark
                      boxShadow: "0 0 25px rgba(255, 179, 71, 0.6)",
                      transition: { duration: 0.4, ease: "easeOut" }
                    }
                  }}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all duration-500 shadow-xl"
                >
                  <motion.div
                    variants={{
                      hover: { 
                        rotate: 360,
                        scale: 1.1,
                        transition: { duration: 0.8, ease: "backOut" } 
                      }
                    }}
                    className="flex items-center justify-center"
                  >
                    {card.icon}
                  </motion.div>
                </motion.div>

                <motion.h4
                  className="text-3xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
                >
                  <span className="group-hover:text-brand-saffron transition-colors duration-500">{card.title}</span>
                </motion.h4>
              </div>

              {/* Description reveal on hover */}
              <div className="absolute bottom-10 left-10 right-10 z-10 transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-out">
                <p className="text-base text-white/95 font-medium leading-relaxed max-w-md drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]">
                  {card.description}
                </p>
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  className="h-[1px] bg-white/20 mt-4 group-hover:bg-brand-saffron/40 transition-colors"
                ></motion.div>
              </div>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10">
                <div className="w-10 h-10 border-t-2 border-r-2 border-brand-saffron/40 rounded-tr-xl"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Background Decorative Blob */}
      <motion.div 
        style={{ y: yParallax }}
        className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"
      />
    </section>
  );
};

export default AIDataServices;
