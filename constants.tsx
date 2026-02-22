
import React from 'react';
import { Service, Stat, Expert, FAQItem } from './types';

export const CLIENT_PARTNER_DESCRIPTION = "We are proud to partner and work with leading organizations worldwide in transforming data into meaningful solutions. Lifewood's commitment to innovation and excellence has earned the trust of global brands across industries. Here are some of the valued clients and partners we've collaborated with:";

export const SERVICES: Service[] = [
  {
    id: '1',
    title: 'Large Language Models (LLM)',
    description: 'Expert RLHF, SFT, and data distillation for frontier models. We provide high-quality prompts and response evaluations across 50+ languages.',
    icon: (
      <svg className="w-8 h-8 text-brand-saffron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    id: '2',
    title: 'Computer Vision',
    description: 'High-precision 2D/3D bounding boxes, semantic segmentation, and keypoint labeling for autonomous driving and medical imaging.',
    icon: (
      <svg className="w-8 h-8 text-brand-saffron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    id: '3',
    title: 'Audio & NLP',
    description: 'Multilingual transcription, sentiment analysis, and phonetic labeling. Specialized in low-resource languages and regional dialects.',
    icon: (
      <svg className="w-8 h-8 text-brand-saffron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    id: '4',
    title: 'Intelligent Virtual Assistants',
    description: 'Training data for conversational AI, including intent classification and entity recognition to ensure cultural nuance and accuracy.',
    icon: (
      <svg className="w-8 h-8 text-brand-saffron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: '5',
    title: 'Content Moderation',
    description: 'Scalable human-in-the-loop services to ensure safety, compliance, and policy adherence for global social platforms.',
    icon: (
      <svg className="w-8 h-8 text-brand-saffron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: '6',
    title: 'Data Collection',
    description: 'Bespoke field data collection including image, video, and audio recordings across diverse geographic and demographic segments.',
    icon: (
      <svg className="w-8 h-8 text-brand-saffron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zM9 12h6M12 9v6" />
      </svg>
    ),
  },
];

export const CLIENTS = [
  { name: 'BYU Pathway Worldwide', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQg46mEq7tyQd4VqaW3pLN76R5GmsLbnEoiYQ&s', isWide: true },
  { name: 'Ancestry', logo: 'https://i.pcmag.com/imagery/reviews/02YLLi86lwlZfi7PhKu6SMK-3..v1569474766.png', isWide: true },
  { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg', isWide: false },
  { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', isWide: false },
  { name: 'Tencent', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Tencent_Logo.svg', isWide: false },
  { name: 'Alibaba', logo: 'https://upload.wikimedia.org/wikipedia/en/8/80/Alibaba-Group-Logo.svg', isWide: false },
];

export const STATS: Stat[] = [
  { value: '56k+', label: 'Online Resources', subtext: 'Global scalable workforce for 24/7 delivery.' },
  { value: '50+', label: 'Languages', subtext: 'Deep linguistic expertise across the globe.' },
  { value: '40+', label: 'Global Centers', subtext: 'Physical hubs for secure, localized data handling.' },
  { value: '20yrs', label: 'Experience', subtext: 'Over two decades of data excellence.' },
];

export const EXPERTS: Expert[] = [
  { name: 'Dr. Sarah Chen', role: 'Head of AI Strategy (Malaysia)', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=500&q=80' },
  { name: 'Marcus Wong', role: 'Director of NLP (Singapore)', image: 'https://images.unsplash.com/photo-1519085184588-479d39916e58?auto=format&fit=crop&w=400&h=500&q=80' },
  { name: 'Elena Petrova', role: 'Global Operations Lead', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=500&q=80' },
  { name: 'Li Wei', role: 'Chief Data Architect (China)', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=500&q=80' },
];

export const FAQS: FAQItem[] = [
  {
    question: 'How does Lifewood ensure data security?',
    answer: 'We maintain strict ISO 27001 certifications and utilize localized secure data centers (BPO style) to ensure all client data remains protected and compliant with regional regulations like GDPR and PIPL.',
  },
  {
    question: 'What makes Lifewood a "super-bridge"?',
    answer: 'Strategically located in Malaysia, Singapore, and China, we act as a conduit for technology and trust between the East and West, providing seamless data services across borders.',
  },
  {
    question: 'How do you handle Large Language Model (LLM) data?',
    answer: 'We specialize in RLHF (Reinforcement Learning from Human Feedback), providing expert annotators who rank, score, and edit model responses to improve safety and factual accuracy.',
  },
];
