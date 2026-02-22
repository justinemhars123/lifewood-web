import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Icons (small, used in accordion) ────────────────────────────────────────
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
    <circle cx="9"  cy="11" r="1" fill="currentColor" stroke="none" />
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
    <circle cx="12" cy="4"  r="2" strokeWidth="1.7" />
    <circle cx="5"  cy="20" r="2" strokeWidth="1.7" />
    <circle cx="19" cy="20" r="2" strokeWidth="1.7" />
    <path strokeWidth="1.7" d="M12 6v4" />
    <path strokeWidth="1.7" d="M12 10H6a1 1 0 00-1 1v7" />
    <path strokeWidth="1.7" d="M12 10h6a1 1 0 011 1v7" />
  </svg>
);

// ─── Large icon variants for the hero visual ──────────────────────────────────
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
    <circle cx="9"  cy="11" r="1.1" fill="currentColor" stroke="none" />
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
    <circle cx="12" cy="4"  r="2" strokeWidth="1.5" />
    <circle cx="5"  cy="20" r="2" strokeWidth="1.5" />
    <circle cx="19" cy="20" r="2" strokeWidth="1.5" />
    <path strokeWidth="1.5" d="M12 6v4" />
    <path strokeWidth="1.5" d="M12 10H6a1 1 0 00-1 1v7" />
    <path strokeWidth="1.5" d="M12 10h6a1 1 0 011 1v7" />
  </svg>
);

// ─── Project data ─────────────────────────────────────────────────────────────
const PROJECTS = [
  { id: '2.1', title: 'AI Data Extraction',                   Icon: IconDataExtraction,    LargeIcon: LargeIconDataExtraction,    label: 'Data',     body: 'Using AI, we optimize the acquisition of image and text from multiple sources. Techniques include onsite scanning, drone photography, negotiation with archives and the formation of alliances with corporations, religious organizations and governments.' },
  { id: '2.2', title: 'Machine Learning Enablement',          Icon: IconMachineLearning,   LargeIcon: LargeIconMachineLearning,   label: 'ML',       body: 'End-to-end ML enablement services: model prototyping, dataset engineering, feature stores and MLOps consultancy to help teams ship models reliably.' },
  { id: '2.3', title: 'Autonomous Driving Technology',        Icon: IconAutonomousDriving, LargeIcon: LargeIconAutonomousDriving, label: 'Auto',     body: 'Data pipelines and annotation workflows tailored for perception stacks, sensor fusion and scenario generation for autonomous systems.' },
  { id: '2.4', title: 'AI-Enabled Customer Service',          Icon: IconCustomerService,   LargeIcon: LargeIconCustomerService,   label: 'CX',       body: 'Conversational AI, intent classification, and retrieval-augmented systems to automate and augment customer support at scale.' },
  { id: '2.5', title: 'Natural Language Processing & Speech', Icon: IconNLP,               LargeIcon: LargeIconNLP,               label: 'NLP',      body: 'Multilingual speech and text collection, transcription and language modeling datasets with quality control across dialects and accents.' },
  { id: '2.6', title: 'Computer Vision (CV)',                 Icon: IconComputerVision,    LargeIcon: LargeIconComputerVision,    label: 'Vision',   body: 'Large-scale image and video collection, object detection, segmentation and temporal annotation for vision systems.' },
  { id: '2.7', title: 'Genealogy',                           Icon: IconGenealogy,         LargeIcon: LargeIconGenealogy,         label: 'Genealogy',body: 'Specialized data curation and entity linkage for genealogical research, archival digitization and structured family-history datasets.' },
];

// ─── Icon node positions for the hero constellation ──────────────────────────
// 7 nodes: 1 centre + 6 around (hex pattern), in a 340×300 canvas
const NODE_POSITIONS = [
  { cx: 170, cy: 150 }, // centre — index 0 = Data Extraction
  { cx: 290, cy:  80 }, // top-right
  { cx: 290, cy: 220 }, // bottom-right
  { cx: 170, cy: 280 }, // bottom
  { cx:  50, cy: 220 }, // bottom-left
  { cx:  50, cy:  80 }, // top-left
  { cx: 170, cy:  22 }, // top
];

// Which pairs to connect with lines (hub-and-spoke + ring)
const EDGES = [
  [0,1],[0,2],[0,3],[0,4],[0,5],[0,6], // hub spokes
  [1,6],[6,5],[5,4],[4,3],[3,2],[2,1], // outer ring
];

// ─── Animated hero constellation ─────────────────────────────────────────────
const ProjectConstellation: React.FC = () => {
  const [activeNode, setActiveNode] = useState<number | null>(null);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      {/* Radial background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-[#046241]/15 dark:bg-[#4ade80]/8 blur-[60px]" />
      </div>

      <svg
        viewBox="0 0 340 300"
        className="w-full max-w-[340px] overflow-visible"
        style={{ filter: 'drop-shadow(0 0 0px transparent)' }}
      >
        {/* ── Connection lines ── */}
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

        {/* ── Animated travelling dot along spokes ── */}
        {[0,1,2,3,4,5].map((spokeIdx) => {
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

        {/* ── Icon nodes ── */}
        {PROJECTS.map((p, i) => {
          const pos = NODE_POSITIONS[i];
          const isActive = activeNode === i;
          const isCenter = i === 0;
          const nodeSize = isCenter ? 38 : 32;

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

              {/* Float animation wrapper */}
              <motion.g
                animate={{ y: [0, i % 2 === 0 ? -5 : 5, 0] }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.4,
                }}
              >
                {/* Node circle bg */}
                <motion.circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r={nodeSize / 2}
                  className="cursor-pointer"
                  fill={isActive ? '#046241' : (isCenter ? '#FFB347' : 'transparent')}
                  stroke={isCenter ? '#FFB347' : '#046241'}
                  strokeWidth={isActive ? 2 : 1.5}
                  strokeOpacity={isActive ? 1 : 0.55}
                  animate={{
                    fill: isActive
                      ? '#046241'
                      : isCenter
                        ? '#FFB347'
                        : 'rgba(4,98,65,0.12)',
                    stroke: isCenter ? '#FFB347' : (isActive ? '#4ade80' : '#046241'),
                    strokeOpacity: isActive ? 1 : isCenter ? 0.9 : 0.55,
                  }}
                  transition={{ duration: 0.25 }}
                  onMouseEnter={() => setActiveNode(i)}
                  onMouseLeave={() => setActiveNode(null)}
                />

                {/* Icon — centred in node */}
                <foreignObject
                  x={pos.cx - 14}
                  y={pos.cy - 14}
                  width="28"
                  height="28"
                  className="pointer-events-none"
                >
                  <div
                    className={`w-full h-full flex items-center justify-center
                      ${isCenter ? 'text-white' : isActive ? 'text-white' : 'text-[#046241] dark:text-[#4ade80]'}`}
                  >
                    <p.LargeIcon />
                  </div>
                </foreignObject>

                {/* Label below node */}
                <motion.text
                  x={pos.cx}
                  y={pos.cy + nodeSize / 2 + 13}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="700"
                  letterSpacing="0.08em"
                  fill={isActive ? '#4ade80' : isCenter ? '#FFB347' : '#046241'}
                  fillOpacity={isActive ? 1 : 0.65}
                  className="uppercase pointer-events-none font-black"
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

// ─── Stat pill ────────────────────────────────────────────────────────────────
const StatPill: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center px-5 py-3 rounded-2xl
                  bg-[#046241]/6 dark:bg-[#4ade80]/6
                  border border-[#046241]/12 dark:border-[#4ade80]/15">
    <span className="text-xl font-black leading-none text-[#046241] dark:text-[#4ade80]">{value}</span>
    <span className="mt-0.5 text-[9.5px] font-bold uppercase tracking-[0.18em]
                     text-[#1a3326]/45 dark:text-white/65">{label}</span>
  </div>
);

// ─── Accordion item ───────────────────────────────────────────────────────────
const AccordionItem: React.FC<{
  project: typeof PROJECTS[0];
  isOpen: boolean;
  index: number;
  onToggle: () => void;
}> = ({ project, isOpen, index, onToggle }) => (
  <motion.div
    layout="position"
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
    whileHover={!isOpen ? { y: -2, transition: { type: 'spring', stiffness: 400, damping: 25 } } : {}}
    className={`
      rounded-2xl border overflow-hidden cursor-pointer
      transition-all duration-300
      ${isOpen
        ? 'bg-white dark:bg-[#1a3d28] border-[#046241]/40 dark:border-[#4ade80]/35 shadow-[0_6px_32px_rgba(4,98,65,0.15)] dark:shadow-[0_6px_32px_rgba(74,222,128,0.12)]'
        : 'bg-white dark:bg-[#132d1f] border-[#dde8e2] dark:border-white/15 hover:border-[#046241]/30 dark:hover:border-[#4ade80]/25 hover:shadow-[0_4px_20px_rgba(4,98,65,0.1)] dark:hover:shadow-[0_4px_20px_rgba(74,222,128,0.1)]'
      }
    `}
  >
    <button onClick={onToggle} className="w-full text-left px-5 py-[15px] flex items-center gap-4 group">
      {/* Icon */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-250
        ${isOpen
          ? 'bg-[#046241] text-white shadow-[0_4px_14px_rgba(4,98,65,0.4)]'
          : 'bg-[#eaf4ef] dark:bg-[#1a4a2e] text-[#046241] dark:text-[#6ee7a0] group-hover:bg-[#d5ecdf] dark:group-hover:bg-[#1f5a36]'
        }
      `}>
        <project.Icon />
      </div>

      {/* Title */}
      <span className={`
        flex-1 text-[13.5px] font-bold leading-snug transition-colors duration-200
        ${isOpen
          ? 'text-[#046241] dark:text-[#6ee7a0]'
          : 'text-[#1a3326] dark:text-white group-hover:text-[#046241] dark:group-hover:text-[#6ee7a0]'
        }
      `}>
        {project.title}
      </span>

      {/* Toggle */}
      <motion.div
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200
          ${isOpen
            ? 'bg-[#046241]/15 dark:bg-[#4ade80]/15 text-[#046241] dark:text-[#4ade80]'
            : 'bg-[#e8f0eb] dark:bg-white/12 text-[#1a3326] dark:text-white/80 group-hover:bg-[#d5ecdf] dark:group-hover:bg-white/18 group-hover:text-[#046241] dark:group-hover:text-white'
          }
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 5v14M5 12h14" />
        </svg>
      </motion.div>
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="body"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="px-5 pb-5">
            <div className="ml-14">
              <div className="h-px bg-[#046241]/12 dark:bg-[#4ade80]/15 mb-4" />
              <p className="text-[13px] leading-[1.8] text-[#1a3326]/65 dark:text-white/80">
                {project.body}
              </p>
              <a href="/contact" className="inline-flex items-center gap-1.5 mt-4 text-[10.5px] font-black uppercase tracking-[0.22em] text-[#046241] dark:text-[#4ade80] opacity-75 hover:opacity-100 transition-opacity">
                Learn more
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const AIProjectsPage: React.FC = () => {
  const [open, setOpen] = useState<string | null>('');

  return (
    <section className="px-6 md:px-16 py-24 bg-brand-paper dark:bg-brand-dark transition-colors duration-500">
      <div className="max-w-[1200px] mx-auto">

        {/* ── Header — text LEFT, constellation RIGHT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 items-center mb-16">

          {/* Left: text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-5 rounded-full
                         bg-white dark:bg-[#1a3326]
                         border border-[#046241]/15 dark:border-[#4ade80]/20 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB347] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#046241] dark:text-[#4ade80]">
                Projects
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.07 }}
              className="text-5xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95] mb-5
                         text-[#0f2318] dark:text-white"
            >
              AI&nbsp;
              <span className="text-[#046241] dark:text-[#FFB347]">projects</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.13 }}
              className="max-w-lg text-[15px] leading-relaxed text-[#1a3326]/60 dark:text-white/75 mb-8"
            >
              From building AI datasets in diverse languages and environments to
              developing platforms that open new opportunities in under-resourced
              economies — our projects focus on integrity and people.
            </motion.p>

            {/* Quick domain pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-2"
            >
              {PROJECTS.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + i * 0.06, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                             bg-white dark:bg-[#132d1f]
                             border border-[#046241]/15 dark:border-[#4ade80]/20
                             text-[10px] font-bold uppercase tracking-[0.15em]
                             text-[#046241] dark:text-[#4ade80]
                             hover:bg-[#046241] hover:text-white dark:hover:bg-[#046241]
                             hover:border-[#046241] cursor-default
                             transition-all duration-200 group"
                >
                  <span className="w-1 h-1 rounded-full bg-current opacity-60 group-hover:opacity-100" />
                  {p.label}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: animated icon constellation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[320px] lg:h-[340px]"
          >
            {/* Decorative background panel */}
            <div className="absolute inset-4 rounded-3xl
                            bg-white/60 dark:bg-[#0d2018]/80
                            border border-[#046241]/10 dark:border-[#4ade80]/12
                            backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]
                            dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" />

            {/* Corner accent marks */}
            {['top-6 left-6', 'top-6 right-6', 'bottom-6 left-6', 'bottom-6 right-6'].map((pos, i) => (
              <div key={i} className={`absolute ${pos} w-4 h-4 pointer-events-none`}>
                <div className="absolute top-0 left-0 w-3 h-px bg-[#046241]/30 dark:bg-[#4ade80]/30" />
                <div className="absolute top-0 left-0 h-3 w-px bg-[#046241]/30 dark:bg-[#4ade80]/30" />
              </div>
            ))}

            {/* Constellation SVG */}
            <ProjectConstellation />

            {/* Hover hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.22em]
                               text-[#046241]/40 dark:text-[#4ade80]/35">
                Hover to explore
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Two-column body ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.08fr] gap-8 items-start">

          {/* LEFT — image + info card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-8 rounded-[1.5rem] overflow-hidden
                       bg-white dark:bg-[#132d1f]
                       border border-[#dde8e2] dark:border-white/15
                       shadow-[0_4px_30px_rgba(19,48,32,0.07)]
                       dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="relative" style={{ aspectRatio: '16/11' }}>
              <img
                src="https://framerusercontent.com/images/RIqv6T7aFrp5Q9X85Zqy55KQ8x4.png"
                alt="AI Projects"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061410]/85 via-[#061410]/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-lg border border-white/20 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFB347] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                    {PROJECTS.length} active domains
                  </span>
                </div>
              </div>
            </div>

            <div className="p-7">
              <h3 className="text-lg font-black tracking-tight mb-2 text-[#0f2318] dark:text-white">
                Global Data Engineering
              </h3>
              <p className="text-[13.5px] leading-[1.75] mb-6 text-[#1a3326]/62 dark:text-white/85">
                We deliver end-to-end AI data solutions — from privacy-safe collection
                and large-scale annotation to managed dataset pipelines that power
                enterprise-grade models across every domain we serve.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <StatPill value="7"    label="Domains"    />
                <StatPill value="30+"  label="Countries"  />
                <StatPill value="10M+" label="Datapoints" />
              </div>

              <a
                href="/contact"
                className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full w-full justify-center
                           bg-[#046241] hover:bg-[#03532f] dark:hover:bg-[#04714a]
                           text-white text-[12px] font-black uppercase tracking-[0.18em]
                           shadow-[0_4px_18px_rgba(4,98,65,0.35)]
                           hover:shadow-[0_6px_24px_rgba(4,98,65,0.5)]
                           hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Contact us
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full
                                 bg-white/20 group-hover:bg-white/30 transition-colors duration-200">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </a>
            </div>
          </motion.div>

          {/* RIGHT — accordion */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mb-7"
            >
              <h2 className="text-[1.4rem] font-black tracking-tight mb-1.5 text-[#0f2318] dark:text-white">
                What we currently handle
              </h2>
              <p className="text-[13px] text-[#1a3326]/50 dark:text-white/60">
                A selection of our active projects and capabilities.
              </p>
            </motion.div>

            <div className="space-y-2.5">
              {PROJECTS.map((p, i) => (
                <AccordionItem
                  key={p.id}
                  project={p}
                  index={i}
                  isOpen={open === p.id}
                  onToggle={() => setOpen(open === p.id ? null : p.id)}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AIProjectsPage;