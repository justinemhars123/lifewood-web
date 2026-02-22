import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const FORM_BG_IMAGE =
  "https://framerusercontent.com/images/RVlLBCqzU3Ny0SMhM5wQf17fN8.png";

const CONTACT_ITEMS = [
  {
    title: "Email",
    value: "info@lifewood.com",
    href: "mailto:info@lifewood.com",
    note: "General inquiries",
  },
  {
    title: "Careers",
    value: "Join our team",
    href: "/careers",
    note: "Open opportunities",
  },
  {
    title: "Response Time",
    value: "Within 24 hours",
    href: "/contact",
    note: "Monday to Friday",
  },
];

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = `opacity 650ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 650ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export default function ContactPage() {
  return (
    <main className="bg-brand-paper dark:bg-brand-dark text-[#0f2318] dark:text-white overflow-x-hidden">
      <section className="px-6 md:px-16 pt-14 md:pt-20 pb-20 md:pb-28">
        <div className="max-w-[1460px] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 md:gap-16 items-start min-h-[66vh]">
          <FadeIn>
            <div className="pt-1 md:pt-2">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full
                           bg-white dark:bg-[#1a3326]
                           border border-[#046241]/15 dark:border-[#4ade80]/20 shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFB347] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#046241] dark:text-[#4ade80]">
                  Contact Lifewood
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black leading-[0.95] tracking-[-0.03em] mb-5 text-[#0f2318] dark:text-white">
                Tell us what you need.
                <br />
                <span className="text-[#046241] dark:text-[#FFB347]">
                  We will help you build it.
                </span>
              </h1>

              <p className="max-w-[620px] text-[15px] md:text-[18px] leading-[1.65] text-[#1a3326]/70 dark:text-white/70 mb-8">
                Share your project goals, data scope, and timelines. Our team will
                reach out with the right approach for your AI initiative.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-[720px]">
                {CONTACT_ITEMS.map((item, idx) => {
                  const isExternal = item.href.startsWith("mailto:");
                  return (
                    <motion.a
                      key={item.title}
                      href={item.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.35, delay: idx * 0.08 }}
                      className="rounded-2xl p-4 md:p-5 bg-white/90 dark:bg-[#11291f]/80
                                 border border-[#046241]/12 dark:border-white/10
                                 hover:border-[#046241]/35 dark:hover:border-[#FFB347]/40
                                 shadow-[0_8px_28px_rgba(4,98,65,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]
                                 transition-all"
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#046241]/65 dark:text-[#FFB347]/65 mb-1.5">
                        {item.title}
                      </p>
                      <p className="text-[16px] font-bold text-[#0f2318] dark:text-white leading-tight">
                        {item.value}
                      </p>
                      <p className="text-[12px] text-[#1a3326]/55 dark:text-white/55 mt-1.5">
                        {item.note}
                      </p>
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={120}>
            <div
              className="relative rounded-[28px] overflow-hidden border border-black/10 dark:border-white/12
                         shadow-[0_24px_70px_rgba(0,0,0,0.2)]"
              style={{
                backgroundImage: `url(${FORM_BG_IMAGE})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-[#071a12]/62" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,179,71,0.2),transparent_44%)]" />

              <motion.div
                aria-hidden="true"
                animate={{ x: [0, 28, 0], y: [0, -16, 0], opacity: [0.45, 0.7, 0.45] }}
                transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
                className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl bg-[#FFB347]/20"
              />

              <div
                className="relative z-10 m-5 md:m-7 rounded-2xl
                           bg-white/10 dark:bg-white/10
                           backdrop-blur-[3px]
                           border border-white/12 p-5 md:p-6"
              >
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-[11px] uppercase tracking-[0.18em] mb-2 text-[#1a3326]/75 dark:text-white/90 font-black"
                    >
                      Name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      className="w-full h-12 rounded-xl px-4 bg-white/90 text-black placeholder:text-black/45
                                 border border-black/12 outline-none
                                 focus:border-[#FFB347] focus:ring-2 focus:ring-[#FFB347]/30 transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-[11px] uppercase tracking-[0.18em] mb-2 text-[#1a3326]/75 dark:text-white/90 font-black"
                    >
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      className="w-full h-12 rounded-xl px-4 bg-white/90 text-black placeholder:text-black/45
                                 border border-black/12 outline-none
                                 focus:border-[#FFB347] focus:ring-2 focus:ring-[#FFB347]/30 transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-[11px] uppercase tracking-[0.18em] mb-2 text-[#1a3326]/75 dark:text-white/90 font-black"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={6}
                      placeholder="Tell us about your project, timeline, and goals."
                      className="w-full rounded-xl px-4 py-3 bg-white/90 text-black placeholder:text-black/55
                                 border border-black/12 outline-none resize-y min-h-[180px]
                                 focus:border-[#FFB347] focus:ring-2 focus:ring-[#FFB347]/30 transition-all"
                    />
                  </div>

                  <div className="pt-1 flex flex-col gap-3">
                    <p className="text-[11px] text-[#1a3326]/65 dark:text-white/55 leading-relaxed">
                      By sending this form, you agree that Lifewood can contact you
                      regarding your inquiry.
                    </p>
                    <button
                      type="submit"
                      className="w-full h-12 rounded-full
                                 bg-[#046241] hover:bg-[#035a3b] dark:bg-[#FFB347] dark:hover:bg-[#f3a736]
                                 text-white dark:text-[#0f2318] text-[12px] font-black uppercase tracking-[0.2em]
                                 transition-all hover:scale-[1.01] active:scale-[0.99]
                                 shadow-[0_8px_24px_rgba(4,98,65,0.35)] dark:shadow-[0_8px_24px_rgba(255,179,71,0.35)]"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
