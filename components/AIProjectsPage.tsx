import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView, animate } from 'framer-motion';

// ─── Animated Counter ────────────────────────────────────────────────────────
const AnimatedCounter: React.FC<{ from?: number; to: number; suffix?: string; duration?: number }> = ({ from = 0, to, suffix = '', duration = 1.5 }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { margin: '-50px' });

  useEffect(() => {
    if (inView) {
      const controls = animate(from, to, {
        duration,
        ease: 'easeOut',
        onUpdate(value) {
          if (ref.current) {
            ref.current.textContent = Math.floor(value).toString() + suffix;
          }
        },
      });
      return () => controls.stop();
    } else {
      if (ref.current) {
        ref.current.textContent = from.toString() + suffix;
      }
    }
  }, [inView, from, to, duration, suffix]);

  return <span ref={ref}>{from}{suffix}</span>;
};

// ─── Icons (small) ────────────────────────────────────────────────────────────
const IconDataExtraction = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <path strokeWidth="1.7" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline strokeWidth="1.7" points="14 2 14 8 20 8" />
    <line strokeWidth="1.6" x1="8" y1="13" x2="16" y2="13" />
    <line strokeWidth="1.6" x1="8" y1="17" x2="14" y2="17" />
  </svg>
);
const IconMachineLearning = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" strokeWidth="1.7" />
    <path strokeWidth="1.6" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);
const IconAutonomousDriving = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <path strokeWidth="1.7" d="M5 17H3a1 1 0 01-1-1v-4l2.5-5h13L20 12v4a1 1 0 01-1 1h-2" />
    <circle cx="7.5" cy="17.5" r="1.5" strokeWidth="1.7" />
    <circle cx="16.5" cy="17.5" r="1.5" strokeWidth="1.7" />
    <line strokeWidth="1.5" x1="10" y1="17.5" x2="14" y2="17.5" />
    <line strokeWidth="1.5" x1="9" y1="11" x2="15" y2="11" />
  </svg>
);
const IconCustomerService = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <path strokeWidth="1.7" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    <circle cx="9" cy="11" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="11" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const IconNLP = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="11" rx="3" strokeWidth="1.7" />
    <path strokeWidth="1.7" d="M5 10a7 7 0 0014 0" />
    <line strokeWidth="1.7" x1="12" y1="17" x2="12" y2="21" />
    <line strokeWidth="1.7" x1="9" y1="21" x2="15" y2="21" />
  </svg>
);
const IconComputerVision = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <path strokeWidth="1.7" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" strokeWidth="1.7" />
  </svg>
);
const IconGenealogy = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="4" r="2" strokeWidth="1.7" />
    <circle cx="5" cy="20" r="2" strokeWidth="1.7" />
    <circle cx="19" cy="20" r="2" strokeWidth="1.7" />
    <path strokeWidth="1.7" d="M12 6v4" />
    <path strokeWidth="1.7" d="M12 10H6a1 1 0 00-1 1v7" />
    <path strokeWidth="1.7" d="M12 10h6a1 1 0 011 1v7" />
  </svg>
);

// ─── Large icon variants for hero visual & bento cards ────────────────────────
const LargeIconDataExtraction = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <path strokeWidth="1.5" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline strokeWidth="1.5" points="14 2 14 8 20 8" />
    <line strokeWidth="1.4" x1="8" y1="13" x2="16" y2="13" />
    <line strokeWidth="1.4" x1="8" y1="17" x2="14" y2="17" />
  </svg>
);
const LargeIconMachineLearning = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
    <path strokeWidth="1.4" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);
const LargeIconAutonomousDriving = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <path strokeWidth="1.5" d="M5 17H3a1 1 0 01-1-1v-4l2.5-5h13L20 12v4a1 1 0 01-1 1h-2" />
    <circle cx="7.5" cy="17.5" r="1.5" strokeWidth="1.5" />
    <circle cx="16.5" cy="17.5" r="1.5" strokeWidth="1.5" />
    <line strokeWidth="1.3" x1="10" y1="17.5" x2="14" y2="17.5" />
    <line strokeWidth="1.3" x1="9" y1="11" x2="15" y2="11" />
  </svg>
);
const LargeIconCustomerService = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <path strokeWidth="1.5" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    <circle cx="9" cy="11" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="11" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="11" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);
const LargeIconNLP = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="11" rx="3" strokeWidth="1.5" />
    <path strokeWidth="1.5" d="M5 10a7 7 0 0014 0" />
    <line strokeWidth="1.5" x1="12" y1="17" x2="12" y2="21" />
    <line strokeWidth="1.5" x1="9" y1="21" x2="15" y2="21" />
  </svg>
);
const LargeIconComputerVision = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <path strokeWidth="1.5" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
  </svg>
);
const LargeIconGenealogy = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="4" r="2" strokeWidth="1.5" />
    <circle cx="5" cy="20" r="2" strokeWidth="1.5" />
    <circle cx="19" cy="20" r="2" strokeWidth="1.5" />
    <path strokeWidth="1.5" d="M12 6v4" />
    <path strokeWidth="1.5" d="M12 10H6a1 1 0 00-1 1v7" />
    <path strokeWidth="1.5" d="M12 10h6a1 1 0 011 1v7" />
  </svg>
);

// ─── Project data ─────────────────────────────────────────────────────────────
const PROJECTS = [
  { id: '2.1', title: 'AI Data Extraction', Icon: IconDataExtraction, LargeIcon: LargeIconDataExtraction, label: 'Data', body: 'Using AI, we optimize the acquisition of image and text from multiple sources. Techniques include onsite scanning, drone photography, negotiation with archives and the formation of alliances with corporations, religious organizations and governments.', spanClass: 'md:col-span-2 md:row-span-2', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1000' },
  { id: '2.5', title: 'NLP & Speech Modeling', Icon: IconNLP, LargeIcon: LargeIconNLP, label: 'NLP', body: 'Multilingual speech and text collection, transcription and language modeling datasets with quality control across dialects and accents.', spanClass: 'md:col-span-2 md:row-span-1', image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=1000' },
  { id: '2.3', title: 'Autonomous Driving Technology', Icon: IconAutonomousDriving, LargeIcon: LargeIconAutonomousDriving, label: 'Auto', body: 'Data pipelines and annotation workflows tailored for perception stacks, sensor fusion and scenario generation for autonomous systems.', spanClass: 'md:col-span-1 md:row-span-1', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1000' },
  { id: '2.6', title: 'Computer Vision', Icon: IconComputerVision, LargeIcon: LargeIconComputerVision, label: 'Vision', body: 'Large-scale image and video collection, object detection, segmentation and temporal annotation for vision systems.', spanClass: 'md:col-span-1 md:row-span-1', image: 'https://images.unsplash.com/photo-1527430253228-e93688616381?auto=format&fit=crop&q=80&w=1000' },
  { id: '2.4', title: 'AI-Enabled Customer Service', Icon: IconCustomerService, LargeIcon: LargeIconCustomerService, label: 'CX', body: 'Conversational AI, intent classification, and retrieval-augmented systems to automate and augment customer support at scale.', spanClass: 'md:col-span-2 md:row-span-1 lg:col-span-1', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1000' },
  { id: '2.2', title: 'ML Enablement', Icon: IconMachineLearning, LargeIcon: LargeIconMachineLearning, label: 'ML', body: 'End-to-end ML enablement services: model prototyping, dataset engineering, feature stores and MLOps consultancy to help teams ship models reliably.', spanClass: 'md:col-span-2 md:row-span-1 lg:col-span-2', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000' },
  { id: '2.7', title: 'Genealogy', Icon: IconGenealogy, LargeIcon: LargeIconGenealogy, label: 'Genealogy', body: 'Specialized data curation and entity linkage for genealogical research, archival digitization and structured family-history datasets.', spanClass: 'md:col-span-2 md:row-span-1 lg:col-span-1', image: 'https://images.unsplash.com/photo-1505098660655-24d1a4ee110b?auto=format&fit=crop&q=80&w=1000' },
];

// ─── Project Constellation Logic ───────────────────────────────────────────────
const NODE_POSITIONS = [
  { cx: 170, cy: 150 }, // centre
  { cx: 290, cy: 80 }, // top-right
  { cx: 290, cy: 220 }, // bottom-right
  { cx: 170, cy: 280 }, // bottom
  { cx: 50, cy: 220 }, // bottom-left
  { cx: 50, cy: 80 }, // top-left
  { cx: 170, cy: 22 }, // top
];
const EDGES = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], // hub spokes
  [1, 6], [6, 5], [5, 4], [4, 3], [3, 2], [2, 1], // outer ring
];

const ProjectConstellation: React.FC<{ projects: typeof PROJECTS }> = ({ projects }) => {
  const [activeNode, setActiveNode] = useState<number | null>(null);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none pt-4">
      {/* Radial background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-[#046241]/15 dark:bg-[#4ade80]/15 blur-[80px]" />
      </div>

      <svg
        viewBox="0 0 340 300"
        className="w-full max-w-[340px] overflow-visible"
        style={{ filter: 'drop-shadow(0 0 0px transparent)' }}
      >
        {/* Connection lines */}
        {EDGES.map(([a, b], i) => {
          const pa = NODE_POSITIONS[a];
          const pb = NODE_POSITIONS[b];
          const isActive = activeNode === a || activeNode === b;
          return (
            <motion.line
              key={i}
              x1={pa.cx} y1={pa.cy} x2={pb.cx} y2={pb.cy}
              stroke={isActive ? '#4ade80' : '#046241'}
              strokeOpacity={isActive ? 0.7 : 0.25}
              strokeWidth={isActive ? 1.5 : 1}
              strokeDasharray="4 5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
              style={{ transition: 'stroke 0.3s, stroke-opacity 0.3s, stroke-width 0.3s' }}
            />
          );
        })}

        {/* Animated travelling dot */}
        {[0, 1, 2, 3, 4, 5].map((spokeIdx) => {
          const pa = NODE_POSITIONS[0];
          const pb = NODE_POSITIONS[spokeIdx + 1];
          return (
            <motion.circle
              key={`dot-${spokeIdx}`}
              r="2.5"
              fill="#FFB347"
              opacity={0.85}
              animate={{
                cx: [pa.cx, pb.cx, pa.cx],
                cy: [pa.cy, pb.cy, pa.cy],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3.5,
                delay: 1.5 + spokeIdx * 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          );
        })}

        {/* Icon nodes */}
        {projects.map((p, i) => {
          const pos = NODE_POSITIONS[i];
          const isActive = activeNode === i;
          const isCenter = i === 0;
          const nodeSize = isCenter ? 42 : 36;

          return (
            <motion.g
              key={p.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.1 + i * 0.1,
                type: 'spring',
                stiffness: 200,
                damping: 18,
              }}
            >
              {/* Outer pulse ring */}
              <motion.circle
                cx={pos.cx}
                cy={pos.cy}
                r={nodeSize * 0.9}
                fill="none"
                stroke={isCenter ? '#FFB347' : '#046241'}
                strokeWidth="1"
                strokeOpacity={isActive ? 0.6 : 0.18}
                animate={{
                  r: [nodeSize * 0.85, nodeSize * 1.35, nodeSize * 0.85],
                  strokeOpacity: [0.15, 0, 0.15],
                }}
                transition={{
                  duration: 2.8 + i * 0.4,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />

              <motion.g
                animate={{ y: [0, i % 2 === 0 ? -5 : 5, 0] }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.4,
                }}
              >
                <motion.circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r={nodeSize / 2}
                  className="cursor-pointer"
                  fill={isActive ? '#046241' : isCenter ? '#FFB347' : 'transparent'}
                  stroke={isCenter ? '#FFB347' : '#046241'}
                  strokeWidth={isActive ? 2 : 1.5}
                  strokeOpacity={isActive ? 1 : 0.55}
                  animate={{
                    fill: isActive
                      ? '#046241'
                      : isCenter
                      ? '#FFB347'
                      : 'rgba(4,98,65,0.08)',
                    stroke: isCenter ? '#FFB347' : isActive ? '#4ade80' : '#046241',
                    strokeOpacity: isActive ? 1 : isCenter ? 0.9 : 0.55,
                  }}
                  transition={{ duration: 0.25 }}
                  onMouseEnter={() => setActiveNode(i)}
                  onMouseLeave={() => setActiveNode(null)}
                />

                <foreignObject
                  x={pos.cx - 14}
                  y={pos.cy - 14}
                  width="28"
                  height="28"
                  className="pointer-events-none"
                >
                  <div
                    className={`w-full h-full flex items-center justify-center transition-colors duration-300
                      ${
                        isCenter
                          ? 'text-white'
                          : isActive
                          ? 'text-white'
                          : 'text-[#046241] dark:text-[#4ade80]'
                      }`}
                  >
                    <p.LargeIcon />
                  </div>
                </foreignObject>

                <motion.text
                  x={pos.cx}
                  y={pos.cy + nodeSize / 2 + 15}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="800"
                  letterSpacing="0.08em"
                  fill={isActive ? '#4ade80' : isCenter ? '#FFB347' : '#046241'}
                  fillOpacity={isActive ? 1 : 0.65}
                  className="uppercase pointer-events-none"
                  animate={{ fillOpacity: isActive ? 1 : 0.65 }}
                  transition={{ duration: 0.2 }}
                >
                  {p.label}
                </motion.text>
              </motion.g>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
};

// ─── Stat Card (For "By the Numbers" Section) ─────────────────────────────────
const StatCard: React.FC<{ endValue: number; suffix: string; label: string; delay: number }> = ({ endValue, suffix, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 15 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    viewport={{ margin: '-50px' }}
    transition={{ duration: 0.6, delay }}
    className="flex flex-col items-center justify-center p-6 md:p-8 rounded-[1.5rem]
               bg-white/60 dark:bg-[#132d1f]/40 backdrop-blur-md
               border border-[#dde8e2] dark:border-white/10
               shadow-[0_8px_30px_rgba(4,98,65,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]
               hover:shadow-[0_12px_40px_rgba(4,98,65,0.12)] dark:hover:shadow-[0_12px_40px_rgba(74,222,128,0.1)]
               transition-all duration-300"
  >
    <div className="text-4xl md:text-5xl font-black text-[#046241] dark:text-[#4ade80] tracking-tighter mb-1 select-none">
      <AnimatedCounter to={endValue} suffix={suffix} duration={2} />
    </div>
    <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#1a3326]/60 dark:text-white/60 select-none">
      {label}
    </div>
  </motion.div>
);

// ─── Bento Box Card ───────────────────────────────────────────────────────────
const BentoCard: React.FC<{
  project: typeof PROJECTS[0];
  delay: number;
}> = ({ project, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-end
                  bg-[#061410]
                  border border-[#dde8e2] dark:border-white/10
                  shadow-[0_4px_30px_rgba(19,48,32,0.07)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]
                  min-h-[280px] cursor-default
                  ${project.spanClass} transition-shadow duration-500`}
    >
      {/* Background Image & Gradient */}
      {project.image && (
        <>
          <img 
            src={project.image} 
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-40 group-hover:opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061410] via-[#061410]/70 to-transparent pointer-events-none" />
        </>
      )}

      {/* Decorative Glow */}
      <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full
                      bg-[#046241]/20 dark:bg-[#4ade80]/15 blur-[50px]
                      group-hover:bg-[#046241]/30 dark:group-hover:bg-[#4ade80]/25
                      transition-colors duration-700 pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex justify-between items-start mb-auto">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center
                          bg-white/10 text-white backdrop-blur-md
                          group-hover:-translate-y-1 group-hover:scale-105 transition-all duration-300
                          shadow-lg border border-white/10">
            <project.LargeIcon />
          </div>
          <span className="px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md
                           border border-white/20
                           text-[9px] font-black uppercase tracking-[0.2em]
                           text-white shadow-sm">
            {project.label}
          </span>
        </div>

        <div className="mt-8 transition-transform duration-500 ease-out group-hover:-translate-y-1">
          <h3 className="text-[22px] md:text-2xl font-black text-white mb-2.5
                         leading-tight tracking-tight">
            {project.title}
          </h3>
          <p className="text-[14px] leading-relaxed text-white/70
                        group-hover:text-white/90 transition-colors duration-300">
            {project.body}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Page Component ──────────────────────────────────────────────────────
const AIProjectsPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[#fafcfb] dark:bg-[#061410] transition-colors duration-500 font-sans">
      
      {/* 1. Immersive Hero Section */}
      <section className="relative px-6 md:px-16 pt-12 pb-20 lg:pt-16 lg:pb-32 overflow-hidden">
        <div className="max-w-[1240px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Box: Value Prop */}
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 mb-6 rounded-full
                           bg-white/80 dark:bg-[#132d1f]/80 backdrop-blur-md
                           border border-[#046241]/15 dark:border-[#4ade80]/20 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-[#FFB347] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#046241] dark:text-[#4ade80]">
                  Igniting AI Innovation
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-6xl md:text-7xl lg:text-[80px] font-black tracking-[-0.04em] leading-[0.9] mb-6
                           text-[#0f2318] dark:text-white"
              >
                Data for <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#046241] to-[#12a16d]
                                 dark:from-[#4ade80] dark:to-[#12a16d]">
                  Intelligence
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="max-w-md text-base md:text-lg leading-[1.6] text-[#1a3326]/70 dark:text-white/70 mb-10"
              >
                We deliver end-to-end data engineering solutions — from privacy-safe collection to large-scale annotation pipelines — powering enterprise-grade models globally.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <a href="#core-capabilities" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full
                               bg-[#046241] dark:bg-[#4ade80] 
                               text-white dark:text-[#061410] text-[12px] font-bold uppercase tracking-[0.15em]
                               hover:scale-105 hover:shadow-[0_8px_30px_rgba(4,98,65,0.4)] dark:hover:shadow-[0_8px_30px_rgba(74,222,128,0.3)]
                               transition-all duration-300">
                  Explore Domains
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              </motion.div>
            </div>

            {/* Right Box: Constellation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-[400px] lg:h-[480px] w-full flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-[3rem]
                              bg-white/40 dark:bg-[#0d2018]/60 backdrop-blur-2xl
                              border-2 border-white/50 dark:border-white/5
                              shadow-[0_8px_32px_rgba(4,98,65,0.05)] dark:shadow-none" />
              <ProjectConstellation projects={PROJECTS} />
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. Global Impact / "By The Numbers" */}
      <section className="relative px-6 md:px-16 pb-24 z-20 -mt-8">
        <div className="max-w-[1240px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <StatCard endValue={7} suffix="" label="Core Domains" delay={0.1} />
            <StatCard endValue={30} suffix="+" label="Countries Operated" delay={0.2} />
            <StatCard endValue={10} suffix="M+" label="Datapoints Processed" delay={0.3} />
          </div>
        </div>
      </section>

      {/* 3. Core Capabilities Grid (Bento Box) */}
      <section id="core-capabilities" className="px-6 md:px-16 py-24 bg-white/50 dark:bg-[#061410] border-t border-[#dde8e2] dark:border-white/5 relative">
        <div className="max-w-[1240px] mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-full mb-4
                         bg-[#046241]/5 dark:bg-[#4ade80]/10 border border-[#046241]/10 dark:border-[#4ade80]/20"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#046241] dark:text-[#4ade80]">Capabilities</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black text-[#0f2318] dark:text-white tracking-tight leading-tight"
            >
              Building the foundation for <br className="hidden md:block"/> next-generation models.
            </motion.h2>
          </div>

          {/* The Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-auto md:auto-rows-[minmax(120px,auto)] gap-5 lg:gap-6">
            {PROJECTS.map((project, index) => (
              <BentoCard key={project.id} project={project} delay={0.1 + index * 0.05} />
            ))}
          </div>

        </div>
      </section>

      {/* 4. The Lifewood Advantage / Process */}
      <section className="px-6 md:px-16 py-32 bg-[#fafcfb] dark:bg-[#0d2018] relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#046241 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
             
        <div className="max-w-[1240px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="relative rounded-[2.5rem] overflow-hidden aspect-square md:aspect-[4/3] lg:aspect-[4/5]
                        shadow-[0_20px_60px_rgba(4,98,65,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          >
            <img
              src="https://framerusercontent.com/images/RIqv6T7aFrp5Q9X85Zqy55KQ8x4.png"
              alt="Lifewood Operations"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061410] via-transparent to-transparent opacity-80" />
            
            {/* Overlay Glass Box */}
            <div className="absolute bottom-6 left-6 right-6 p-6 rounded-[1.5rem]
                            bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#4ade80] flex items-center justify-center text-[#061410]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h4 className="text-white font-bold text-lg">Ethical Edge</h4>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">
                Prioritizing strict data compliance and integrity in every step of our annotation pipeline.
              </p>
            </div>
          </motion.div>

          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-[#0f2318] dark:text-white tracking-tight mb-6"
            >
              The Lifewood Advantage
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-[#1a3326]/70 dark:text-white/70 leading-relaxed mb-10"
            >
              Our process represents the highest standard in data engineering, combining cutting-edge technology with rigorous quality assurance protocols.
            </motion.p>

            <div className="space-y-8">
              {[
                { title: 'Global Sourcing', desc: 'Curating diverse datasets from 30+ countries to minimize bias.' },
                { title: 'Precision Annotation', desc: 'Expert teams and robust AI-assistance pipelines ensuring 99%+ accuracy.' },
                { title: 'Secure Infrastructure', desc: 'Enterprise-grade security protecting sensitive intellectual property.' }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex gap-5 group"
                >
                  <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full border-2 border-[#046241]/20 dark:border-[#4ade80]/30 
                                  flex items-center justify-center text-[10px] font-black text-[#046241] dark:text-[#4ade80]
                                  group-hover:bg-[#046241] group-hover:dark:bg-[#4ade80] group-hover:text-white group-hover:dark:text-[#061410]
                                  transition-all duration-300">
                    0{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#0f2318] dark:text-white mb-1.5">{item.title}</h4>
                    <p className="text-[14px] text-[#1a3326]/60 dark:text-white/60 leading-relaxed max-w-md">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Final CTA Banner */}
      <section className="px-6 md:px-16 py-20 pb-32 bg-[#fafcfb] dark:bg-[#061410]">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-[1240px] mx-auto rounded-[3rem] overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#046241] to-[#0a2e1f] dark:from-[#134932] dark:to-[#061410] z-0" />
          
          <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none z-0" 
               style={{ 
                 background: 'radial-gradient(circle at 80% 0%, #4ade80 0%, transparent 50%), radial-gradient(circle at 0% 100%, #FFB347 0%, transparent 40%)'
               }} 
          />

          <div className="relative z-10 px-8 py-20 md:py-28 text-center max-w-3xl mx-auto flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-[1.05]">
              Ready to build <span className="text-[#4ade80]">smarter AI?</span>
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-xl">
              Partner with Lifewood to scale your data pipelines with confidence and precision. Let's discuss your next breakthrough.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full justify-center">
              <a href="/contact"
                 className="px-8 py-4 rounded-full bg-[#4ade80] text-[#061410] font-black uppercase text-xs tracking-[0.15em]
                            hover:bg-white transition-colors duration-300 shadow-[0_4px_20px_rgba(74,222,128,0.4)]
                            w-full sm:w-auto text-center">
                Talk to our Experts
              </a>
              <a href="/about-us"
                 className="px-8 py-4 rounded-full bg-transparent border border-white/30 text-white font-black uppercase text-xs tracking-[0.15em]
                            hover:bg-white/10 transition-colors duration-300 w-full sm:w-auto text-center">
                Learn About Us
              </a>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default AIProjectsPage;