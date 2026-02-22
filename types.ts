
// Add React import to resolve the 'Cannot find namespace React' error for React.ReactNode.
import React from 'react';

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface Stat {
  label: string;
  value: string;
  subtext: string;
}

export interface Expert {
  name: string;
  role: string;
  image: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}
