import React from "react";
import { motion } from "framer-motion";

type SocialItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

const socials: SocialItem[] = [
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 10v7M7 7.5v.01M11 17v-4.2c0-1.2.9-2.2 2.1-2.2 1.2 0 2.1 1 2.1 2.2V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "#",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M13.5 8.5h1.8V6.2h-1.8c-2 0-3.3 1.3-3.3 3.3v1.3H8.7v2.3h1.5V18h2.4v-4.9h1.8l.5-2.3h-2.3V9.6c0-.7.5-1.1 1.2-1.1Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
        <circle cx="17" cy="7" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Youtube",
    href: "#",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.5" y="6.5" width="17" height="11" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M10 9.8v4.4l4-2.2-4-2.2Z" fill="currentColor" />
      </svg>
    ),
  },
];

const Footer: React.FC = () => {
  return (
    <footer className="px-3 md:px-6 pb-4 md:pb-7 pt-8 md:pt-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-[1880px] rounded-[30px] md:rounded-[42px]
                   bg-gradient-to-r from-[#053a2a] via-[#06402d] to-[#043521]
                   border border-white/10 text-white overflow-hidden"
      >
        <div className="px-5 md:px-10 py-6 md:py-8">
          <div className="h-9 md:h-11 w-36 md:w-48">
            <img
              src="https://framerusercontent.com/images/Ca8ppNsvJIfTsWEuHr50gvkDow.png?scale-down-to=512&width=2624&height=474"
              alt="Lifewood logo"
              className="h-full w-full object-contain"
            />
          </div>

          <p className="mt-6 text-[18px] md:text-[22px] leading-[1.2] tracking-[-0.01em] max-w-[760px] text-white/95">
            We provide global Data Engineering Services to enable AI Solutions.
          </p>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-10 items-end">
            <div>
              <a
                href="/contact"
                className="text-[40px] md:text-[52px] leading-[0.95] tracking-[-0.02em] font-medium text-white/95 hover:text-white transition-colors"
              >
                Contact Us
              </a>

              <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2.5 text-[14px] md:text-[16px] text-white/65">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms and Conditions</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
              </div>
            </div>

            <div className="lg:justify-self-end lg:text-right">
              <p className="text-[20px] md:text-[24px] font-medium text-white mb-4">Find Us On:</p>
              <div className="flex flex-wrap items-start gap-4 md:gap-6 lg:justify-end">
                {socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="flex flex-col items-center gap-1.5 text-white/90 hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    <span className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center">
                      {social.icon}
                    </span>
                    <span className="text-[12px] md:text-[14px] leading-none">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-7 pt-5 border-t border-white/12 text-[12px] md:text-[14px] text-white/90 text-left md:text-right">
            © 2026 Lifewood - All Rights Reserved
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;

