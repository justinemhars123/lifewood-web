import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <section className="px-4 md:px-8 lg:px-12 pb-16 md:pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-3xl border border-black/8 dark:border-white/10 bg-white/75 dark:bg-brand-dark/45 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] p-8 md:p-12 mb-8 md:mb-10">
          <p className="inline-flex items-center rounded-full border border-brand-dark/10 dark:border-white/10 px-3 py-1 text-xs tracking-wide uppercase text-brand-dark/60 dark:text-brand-seasalt/70 mb-4">
            Last Updated: February 15, 2025
          </p>
          <h1 className="text-3xl md:text-5xl tracking-tight text-brand-dark dark:text-brand-seasalt mb-4">
            Privacy Policy
          </h1>
          <p className="text-brand-dark/70 dark:text-brand-seasalt/70 text-base md:text-lg leading-relaxed">
            Review our official privacy policy below.
            <a
              href="https://lifewood.com/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-brand-primary dark:text-brand-saffron hover:underline"
            >
              Open in new tab
            </a>
          </p>
        </div>

        <div className="rounded-3xl border border-black/8 dark:border-white/10 bg-white dark:bg-brand-dark/35 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
          {/* Extra iframe height + clipped wrapper hides the embedded lower nav bar */}
          <div className="h-[76vh] min-h-[680px] max-h-[1280px] overflow-hidden">
            <iframe
              src="https://lifewood.com/privacy-policy"
              title="Lifewood Privacy Policy"
              className="w-full h-[calc(100%+130px)] border-0"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicyPage;
