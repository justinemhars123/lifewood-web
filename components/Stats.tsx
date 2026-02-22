
import React, { useRef, useEffect, useState } from 'react';
import { motion, Variants, useMotionValue, useTransform } from 'framer-motion';
import { STATS } from '../constants';

interface CounterProps {
  endValue: number;
  suffix: string;
  duration?: number;
  isVisible: boolean;
}

const Counter: React.FC<CounterProps> = ({ endValue, suffix, duration = 2, isVisible }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const displayValue = useTransform(rounded, (latest) => `${latest}${suffix}`);

  useEffect(() => {
    if (!isVisible) return;

    let animationId: NodeJS.Timeout;
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Ease out animation
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * eased;
      
      count.set(currentValue);

      if (progress < 1) {
        animationId = setTimeout(animate, 16); // ~60fps
      } else {
        count.set(endValue);
      }
    };

    animate();
    return () => clearTimeout(animationId);
  }, [isVisible, count, endValue, duration]);

  return <motion.span>{displayValue}</motion.span>;
};

const Stats: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        });
      },
      { threshold: 0.3, rootMargin: "0px 0px -100px 0px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    },
  };

  return (
    <section className="px-4 md:px-12 py-8">
      <motion.div 
        ref={containerRef}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="bg-[#05110B] rounded-[2.5rem] py-16 px-8 md:px-20 flex flex-wrap justify-between items-start gap-y-12 shadow-2xl relative overflow-hidden"
      >
        {STATS.map((stat, idx) => {
          // Extract numeric value and suffix from stat.value (e.g., "56k+" -> { num: 56, suffix: "k+" })
          const match = stat.value.match(/^(\d+)(.+)$/);
          const numericValue = match ? parseInt(match[1], 10) : 0;
          const suffix = match ? match[2] : '';

          return (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              className="flex flex-col items-start min-w-[200px] group"
            >
              {/* Big Value with Counter Animation */}
              <span className="text-white text-6xl md:text-7xl font-extrabold tracking-tighter leading-none mb-4 group-hover:text-brand-saffron transition-colors duration-500">
                <Counter 
                  endValue={numericValue} 
                  suffix={suffix}
                  duration={2}
                  isVisible={isVisible}
                />
              </span>
              
            {/* Label in Saffron */}
            <span className="text-brand-saffron text-xs md:text-[13px] font-black uppercase tracking-[0.1em] mb-3">
              {stat.label}
            </span>
            
            {/* Subtext */}
            <p className="text-white/40 text-[11px] font-medium leading-[1.5] max-w-[160px]">
              {stat.subtext}
            </p>

            {/* Accent Line */}
            <div className="w-8 h-[2px] bg-brand-saffron/40 mt-5 group-hover:w-12 group-hover:bg-brand-saffron transition-all duration-500"></div>
          </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default Stats;
