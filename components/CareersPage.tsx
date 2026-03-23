import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

const HERO_IMAGE =
  "https://framerusercontent.com/images/DF2gzPqqVW8QGp7Jxwp1y5257xk.jpg?height=4000&width=6000";
const CULTURE_IMAGE =
  "https://framerusercontent.com/images/4hASBG5DwObUZ6HSxm1j5gic.jpeg?scale-down-to=1024&width=853&height=1280";

const COMPANY_STATS = [
  { value: "30+", label: "Countries supported", detail: "Global delivery footprint across multilingual markets." },
  { value: "10M+", label: "Datapoints handled", detail: "Structured, reviewed, and prepared for AI systems." },
  { value: "7", label: "Service domains", detail: "From data collection to curation, QA, and operations." },
  { value: "500+", label: "Experts and contributors", detail: "Specialists collaborating across functions and regions." },
];

const DIFFERENTIATORS = [
  {
    title: "Meaningful AI work",
    body: "Teams contribute to data programs that support real AI products, not abstract portfolio exercises.",
  },
  {
    title: "Global and human-centered",
    body: "Lifewood bridges languages, cultures, and communities so technology is built with broader representation.",
  },
  {
    title: "Operational rigor",
    body: "Work is grounded in quality controls, clear workflows, and practical delivery standards that developers can implement.",
  },
];

const ROLE_TRACKS = [
  {
    title: "Data collection and annotation",
    summary: "For contributors who help gather, label, review, or validate datasets used in AI pipelines.",
    roles: ["Image and video collection", "Speech and text capture", "Annotation and quality review"],
  },
  {
    title: "Research and curation",
    summary: "For detail-oriented teams working across genealogy, multilingual data, archives, and structured research.",
    roles: ["Genealogy research", "Data curation workflows", "Domain-specific knowledge support"],
  },
  {
    title: "Operations and delivery",
    summary: "For people who coordinate projects, manage execution, and keep distributed teams aligned and moving.",
    roles: ["Project coordination", "Operations leadership", "Cross-team delivery support"],
  },
];

const CULTURE_PILLARS = [
  {
    title: "Clarity over noise",
    body: "Defined workstreams, accountable ownership, and visible next steps help people do their best work.",
  },
  {
    title: "Learning in motion",
    body: "The pace of AI changes quickly, so teams are expected to adapt, learn, and improve continuously.",
  },
  {
    title: "Respect across borders",
    body: "A distributed company needs communication habits that are inclusive, direct, and considerate.",
  },
];

const HIRING_STEPS = [
  {
    step: "01",
    title: "Explore the company",
    body: "Start here to understand what Lifewood builds, how teams work, and where you might fit.",
  },
  {
    step: "02",
    title: "Submit an application",
    body: "Move into the existing Join Us flow with your background, location, and role interest.",
  },
  {
    step: "03",
    title: "Complete screening",
    body: "Qualified applicants continue through email follow-up and the AI pre-screening process.",
  },
  {
    step: "04",
    title: "Join the team",
    body: "Successful candidates move into role-specific onboarding and operational support.",
  },
];

function navigate(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#046241]/18 bg-white px-4 py-2 shadow-sm dark:border-[#FFB347]/20 dark:bg-[#1a3326]">
      <span className="h-2 w-2 rounded-full bg-[#FFB347]" />
      <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#046241] dark:text-[#FFB347]">
        {children}
      </span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5l4.2 4.2L19 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CareersPage() {
  // Sync html + body background so the floating navbar's backdrop-blur
  // sees white instead of the browser's default white
  React.useEffect(() => {
    const prevBody = document.body.style.backgroundColor;
    const prevHtml = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#ffffff';
    document.documentElement.style.backgroundColor = '#ffffff';
    return () => {
      document.body.style.backgroundColor = prevBody;
      document.documentElement.style.backgroundColor = prevHtml;
    };
  }, []);

  return (
    <main
      className="bg-white text-[#0f2318] dark:bg-[#0a1a10] dark:text-white overflow-x-hidden"
      style={{ fontFamily: "Poppins, Sora, 'Segoe UI', sans-serif" }}
    >
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative isolate px-6 pb-14 pt-14 md:px-16 md:pb-20 md:pt-20">
        <div className="absolute inset-0 -z-10" />

        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          {/* Left card */}
          <Reveal className="flex flex-col justify-between rounded-[34px] border border-[#d4e4db] bg-white p-7 shadow-[0_25px_80px_rgba(4,98,65,0.07)] dark:border-[#2a4535] dark:bg-[#122318] md:p-10">
            <div>
              <SectionEyebrow>Careers at Lifewood</SectionEyebrow>

              <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[0.96] tracking-[-0.05em] text-[#0f2318] dark:text-white md:text-6xl">
                Build AI data work that
                <span className="block text-[#046241] dark:text-[#FFB347]">
                  connects technology with people.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-[15px] leading-8 text-[#2d5040] dark:text-[#a8c4b4] md:text-[17px]">
                This page is designed to help candidates understand Lifewood before they apply. It explains the kind
                of company we are, the work we do, and the environments where people can grow.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/join-us")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#046241] px-7 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-[0_14px_32px_rgba(4,98,65,0.28)] transition-all hover:scale-[1.02] active:scale-[0.98] dark:bg-[#FFB347] dark:text-[#0f2318] dark:shadow-[0_14px_32px_rgba(255,179,71,0.2)]"
                >
                  Apply now
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/contact")}
                  className="inline-flex items-center justify-center rounded-full border border-[#046241]/25 bg-white px-7 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#046241] transition-colors hover:border-[#046241]/50 hover:bg-[#eef5f1] dark:border-[#a8c4b4]/25 dark:bg-[#1a3326] dark:text-[#a8c4b4] dark:hover:border-[#FFB347]/40 dark:hover:text-[#FFB347]"
                >
                  Contact recruitment
                </button>
              </div>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                "Structured career entry point",
                "Practical AI data workflows",
                "Global and cross-cultural teams",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#046241]/10 bg-white px-4 py-4 text-sm font-semibold text-[#1a3326] dark:border-[#2a4535] dark:bg-[#1a3326] dark:text-[#c8ddd3]"
                >
                  {item}
                </div>
              ))}
            </div>
          </Reveal>

          {/* Right image card */}
          <Reveal delay={0.08} className="grid gap-4">
            <div className="relative overflow-hidden rounded-[34px] border border-[#c8ddd3] bg-[#0f2318] shadow-[0_25px_80px_rgba(4,98,65,0.14)] dark:border-[#2a4535]">
              <img
                src={HERO_IMAGE}
                alt="Lifewood team collaborating in a meeting room"
                className="h-[420px] w-full object-cover md:h-[520px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07140e] via-[#07140e]/20 to-transparent" />

              <div className="absolute left-5 top-5 rounded-2xl border border-white/20 bg-[#0f2318]/70 px-4 py-3 backdrop-blur-md md:left-7 md:top-7">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#a8c4b4]">Company snapshot</p>
                <p className="mt-2 max-w-[240px] text-sm leading-6 text-white">
                  Lifewood works at the intersection of AI data operations, quality, and global execution.
                </p>
              </div>

              <div className="absolute bottom-5 left-5 right-5 grid gap-3 md:bottom-7 md:left-7 md:right-7 md:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-[#07140e]/70 p-4 backdrop-blur-md">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFB347]">Who this page is for</p>
                  <p className="mt-2 text-sm leading-6 text-white">
                    Candidates, interns, researchers, operators, and contributors exploring where they fit.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-[#07140e]/70 p-4 backdrop-blur-md">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFB347]">Primary goal</p>
                  <p className="mt-2 text-sm leading-6 text-white">
                    Help people quickly understand Lifewood as a data technology company before they apply.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── WHY THIS COMPANY ─────────────────────────────────────────────── */}
      <section className="px-6 py-14 md:px-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <SectionEyebrow>Why this company</SectionEyebrow>
              <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] text-[#0f2318] dark:text-white md:text-5xl">
                A clearer picture of Lifewood,
                <span className="block text-[#046241] dark:text-[#FFB347]">beyond a basic job listing.</span>
              </h2>
            </div>
            <p className="max-w-xl text-[15px] leading-8 text-[#2d5040] dark:text-[#a8c4b4]">
              The page is organized for fast scanning: company proof first, role pathways next, then hiring steps and
              expectations. That helps users understand whether the opportunity is relevant before they commit time.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {COMPANY_STATS.map((stat, index) => (
              <Reveal key={stat.label} delay={0.06 * index}>
                <article className="h-full rounded-[28px] border border-[#d4e4db] bg-white p-6 shadow-[0_10px_35px_rgba(4,98,65,0.05)] dark:border-[#2a4535] dark:bg-[#122318]">
                  <p className="text-4xl font-black tracking-[-0.04em] text-[#046241] dark:text-[#FFB347]">
                    {stat.value}
                  </p>
                  <h3 className="mt-4 text-[13px] font-black uppercase tracking-[0.18em] text-[#0f2318] dark:text-white">
                    {stat.label}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#2d5040] dark:text-[#a8c4b4]">{stat.detail}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFFERENTIATORS ──────────────────────────────────────────────── */}
      <section className="border-y border-[#046241]/8 bg-white px-6 py-14 dark:border-[#2a4535] dark:bg-[#0d1f15] md:px-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28">
            <SectionEyebrow>What sets Lifewood apart</SectionEyebrow>
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] text-[#0f2318] dark:text-white md:text-5xl">
              Practical work,
              <span className="block text-[#046241] dark:text-[#FFB347]">not vague career marketing.</span>
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-8 text-[#2d5040] dark:text-[#a8c4b4]">
              Instead of decorative statements, this section answers the questions candidates actually have: what kind
              of work exists here, how the company operates, and why the experience can matter.
            </p>
          </Reveal>

          <div className="grid gap-4">
            {DIFFERENTIATORS.map((item, index) => (
              <Reveal key={item.title} delay={0.08 * index}>
                <article className="rounded-[30px] border border-[#d4e4db] bg-white p-7 shadow-[0_14px_45px_rgba(4,98,65,0.06)] dark:border-[#2a4535] dark:bg-[#122318] md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#046241] text-white shadow-[0_10px_18px_rgba(4,98,65,0.24)] dark:bg-[#FFB347] dark:text-[#0f2318]">
                      <CheckIcon />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-[#0f2318] dark:text-white">{item.title}</h3>
                      <p className="mt-3 max-w-2xl text-[15px] leading-8 text-[#2d5040] dark:text-[#a8c4b4]">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAREER PATHS ─────────────────────────────────────────────────── */}
      <section className="px-6 py-14 md:px-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-3xl">
            <SectionEyebrow>Career paths</SectionEyebrow>
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] text-[#0f2318] dark:text-white md:text-5xl">
              Where candidates can contribute
              <span className="block text-[#046241] dark:text-[#FFB347]">across the Lifewood ecosystem.</span>
            </h2>
            <p className="mt-5 text-[15px] leading-8 text-[#2d5040] dark:text-[#a8c4b4]">
              Grouping opportunities into tracks makes the experience easier to understand than showing a long flat
              list of unrelated roles. It helps people self-select faster and reduces confusion.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {ROLE_TRACKS.map((track, index) => (
              <Reveal key={track.title} delay={0.06 * index}>
                <article className="flex h-full flex-col rounded-[30px] border border-[#d4e4db] bg-white p-7 shadow-[0_14px_40px_rgba(4,98,65,0.05)] dark:border-[#2a4535] dark:bg-[#122318]">
                  <div className="inline-flex w-fit rounded-full bg-white border border-[#d4e4db] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#046241] dark:bg-[#1a3326] dark:border-transparent dark:text-[#FFB347]">
                    Track {index + 1}
                  </div>
                  <h3 className="mt-5 text-2xl font-black tracking-tight text-[#0f2318] dark:text-white">{track.title}</h3>
                  <p className="mt-4 text-[15px] leading-8 text-[#2d5040] dark:text-[#a8c4b4]">{track.summary}</p>

                  <div className="mt-6 space-y-3">
                    {track.roles.map((role) => (
                      <div
                        key={role}
                        className="flex items-start gap-3 rounded-2xl border border-[#046241]/10 bg-white px-4 py-4 dark:border-[#2a4535] dark:bg-[#1a3326]"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#046241] text-white dark:bg-[#FFB347] dark:text-[#0f2318]">
                          <CheckIcon />
                        </span>
                        <span className="text-sm font-semibold leading-6 text-[#1a3326] dark:text-[#c8ddd3]">{role}</span>
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CULTURE ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-14 md:px-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <Reveal className="relative overflow-hidden rounded-[34px] border border-[#c8ddd3] bg-[#0f2318] p-5 shadow-[0_24px_70px_rgba(4,98,65,0.14)] dark:border-[#2a4535]">
            <img
              src={CULTURE_IMAGE}
              alt="Lifewood contributors working on AI data tasks"
              className="h-[420px] w-full rounded-[26px] object-cover md:h-[520px]"
            />
            <div className="absolute inset-5 rounded-[26px] bg-gradient-to-t from-[#07140e]/90 via-transparent to-transparent" />
            <div className="absolute bottom-10 left-10 right-10">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#FFB347]">Work environment</p>
              <p className="mt-3 max-w-sm text-sm leading-7 text-white">
                A strong careers page should set expectations clearly, so candidates know the culture is collaborative,
                structured, and adaptive before they enter the funnel.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <SectionEyebrow>Culture and expectations</SectionEyebrow>
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] text-[#0f2318] dark:text-white md:text-5xl">
              What people should expect
              <span className="block text-[#046241] dark:text-[#FFB347]">when working with Lifewood.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[#2d5040] dark:text-[#a8c4b4]">
              This section reduces uncertainty. Candidates want to know how teams communicate, how work is organized,
              and what kind of mindset is rewarded. Clear expectations improve trust and decision-making.
            </p>

            <div className="mt-8 space-y-4">
              {CULTURE_PILLARS.map((pillar, index) => (
                <Reveal key={pillar.title} delay={0.12 + index * 0.08}>
                  <article className="rounded-[26px] border border-[#d4e4db] bg-white p-6 shadow-[0_14px_36px_rgba(4,98,65,0.05)] dark:border-[#2a4535] dark:bg-[#122318]">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#046241] dark:text-[#FFB347]">
                      {pillar.title}
                    </p>
                    <p className="mt-3 text-[15px] leading-8 text-[#2d5040] dark:text-[#a8c4b4]">{pillar.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HIRING STEPS ─────────────────────────────────────────────────── */}
      <section className="border-y border-[#046241]/8 bg-white px-6 py-14 dark:border-[#2a4535] dark:bg-[#0d1f15] md:px-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-3xl">
            <SectionEyebrow>Hiring process</SectionEyebrow>
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] text-[#0f2318] dark:text-white md:text-5xl">
              A simple path from interest
              <span className="block text-[#046241] dark:text-[#FFB347]">to application and screening.</span>
            </h2>
            <p className="mt-5 text-[15px] leading-8 text-[#2d5040] dark:text-[#a8c4b4]">
              Showing the process on the page lowers friction. Users can see what happens next before they commit to
              the form, which makes the careers flow feel more transparent and accessible.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {HIRING_STEPS.map((item, index) => (
              <Reveal key={item.step} delay={0.06 * index}>
                <article className="relative h-full rounded-[28px] border border-[#d4e4db] bg-white p-6 shadow-[0_12px_36px_rgba(4,98,65,0.06)] dark:border-[#2a4535] dark:bg-[#122318]">
                  {/* Step number — solid color, always readable */}
                  <div className="text-4xl font-black tracking-[-0.04em] text-[#046241]/25 dark:text-[#FFB347]/35">
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-xl font-black tracking-tight text-[#0f2318] dark:text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#2d5040] dark:text-[#a8c4b4]">{item.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="overflow-hidden rounded-[36px] border border-[#0f2318]/8 bg-[#0f2318] px-7 py-8 text-white shadow-[0_30px_90px_rgba(4,98,65,0.2)] dark:border-[#2a4535] dark:bg-[#0d1f15] md:px-10 md:py-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFB347]">Ready to move forward</p>
                <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-white md:text-5xl">
                  Explore the company,
                  <span className="block">then start your application with confidence.</span>
                </h2>
                <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[#a8c4b4]">
                  The redesign keeps the message practical: understand Lifewood first, then continue into the existing
                  application form when the role and environment feel right.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <button
                  type="button"
                  onClick={() => navigate("/join-us")}
                  className="inline-flex items-center justify-center rounded-full bg-[#FFB347] px-7 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#0f2318] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Go to Join Us
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/about-us")}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-white transition-colors hover:border-[#FFB347]/50 hover:text-[#FFB347]"
                >
                  Learn about Lifewood
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}