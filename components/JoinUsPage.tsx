import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";

const EASE = [0.16, 1, 0.3, 1] as const;

const GENDER_OPTIONS = ["Select gender", "Female", "Male"];
const POSITION_OPTIONS = [
  "Select position to add",
  "Casual Video Models (Video Data Collection)",
  "Data Annotator (Iphone User)",
  "Image Data Collector (Capturing Text - Rich Items)",
  "Data Curation (Genealogy Project)",
  "Voice Recording Participants (Short Sentences Recording)",
  "Text Data Collector (Gemini User)",
  "Voice Recording Participants (FaceTime Audio Recording Session)",
  "Image Data Collector (Capturing Home Dishes and Menu)",
  "Al Video Creator/Editor",
  "Genealogy Project Team Leader",
  "Data Scraper/Crawler (Int'l Text)",
  "Operation Manager",
  "All of the Above",
  "Intern (Applicable to PH Only)",
];
const COUNTRY_OPTIONS = [
  "Select country",
  "Philippines",
  "Singapore",
  "Malaysia",
  "Australia",
  "United States",
  "United Kingdom",
];

type FormState = {
  firstName: string;
  lastName: string;
  gender: string;
  age: string;
  phone: string;
  email: string;
  position: string;
  country: string;
  address: string;
  cvName: string;
  cvFile: File | null;
};

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  gender: GENDER_OPTIONS[0],
  age: "",
  phone: "",
  email: "",
  position: POSITION_OPTIONS[0],
  country: COUNTRY_OPTIONS[0],
  address: "",
  cvName: "",
  cvFile: null,
};

function navigate(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-[#1a3326]/55 dark:text-white/45 mb-2">
      {children}
    </label>
  );
}

export default function JoinUsPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isSubmitDisabled = useMemo(() => {
    return (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      form.gender === GENDER_OPTIONS[0] ||
      !form.age.trim() ||
      !form.phone.trim() ||
      !form.email.trim() ||
      form.position === POSITION_OPTIONS[0] ||
      form.country === COUNTRY_OPTIONS[0] ||
      !form.address.trim() ||
      !form.cvName
    );
  }, [form]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitDisabled || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      // Check if email already exists
      const { data: existingApplicant, error: checkError } = await supabase
        .from("applicants")
        .select("id")
        .ilike("email", form.email)
        .maybeSingle();

      if (checkError) {
        throw new Error("Failed to verify email availability.");
      }

      if (existingApplicant) {
        setSubmitError("this email is already been used");
        setIsSubmitting(false);
        return;
      }
      let cvUrl = "";
      if (form.cvFile) {
        const fileExt = form.cvFile.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `resumes/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("cvs")
          .upload(filePath, form.cvFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw new Error("Failed to upload CV: " + uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from("cvs")
          .getPublicUrl(filePath);

        cvUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("applicants").insert([
        {
          first_name: form.firstName,
          last_name: form.lastName,
          gender: form.gender,
          age: form.age,
          phone: form.phone,
          email: form.email,
          position: form.position,
          country: form.country,
          address: form.address,
          cv_name: form.cvName,
          cv_url: cvUrl,
          status: "New",
        },
      ]);

      if (insertError) throw new Error("Failed to submit application: " + insertError.message);

      setSubmitSuccess(true);
      setForm(initialForm);
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-brand-paper dark:bg-brand-dark text-[#0f2318] dark:text-white overflow-x-hidden"
      style={{ fontFamily: "Poppins, Sora, 'Segoe UI', sans-serif" }}
    >
      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative px-6 md:px-12 lg:px-16 py-16 lg:py-20">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(4,98,65,0.12),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(255,179,71,0.18),transparent_50%)]" />
            <div className="absolute inset-0 bg-brand-paper dark:bg-brand-dark" />
            <div className="absolute inset-0 opacity-80 dark:opacity-60 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.7),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_60%)]" />
          </div>

          <div className="relative z-10 max-w-[560px]">
            <button
              type="button"
              onClick={() => navigate("/careers")}
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#1a3326]/70 dark:text-white/70 hover:text-[#046241] dark:hover:text-white"
            >
              <span className="w-8 h-8 rounded-full border border-[#046241]/20 dark:border-white/15 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Back to careers
            </button>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="mt-10"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#1a3326]/45 dark:text-white/40 mb-4">
                Powered by Lifewood PH
              </p>
              <h1 className="text-[34px] md:text-[46px] font-black leading-[1.05] text-[#0f2318] dark:text-white">
                Join the world’s leading
                <span className="text-[#046241] dark:text-[#c1ff00]"> AI-powered </span>
                data solutions team.
              </h1>
              <p className="mt-4 text-[14px] text-[#1a3326]/70 dark:text-white/65 leading-[1.7]">
                This application is in beta. Please be advised that features and functionality may undergo
                updates during this refinement phase.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="relative flex items-center justify-center px-6 md:px-10 py-12 lg:py-20 bg-[#f7faf8] dark:bg-brand-dark">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="w-full max-w-[560px] rounded-[26px] border border-[#e0e9e4] dark:border-white/10 bg-white/90 dark:bg-[#0f1f17]/85 backdrop-blur p-6 md:p-8 shadow-[0_24px_70px_rgba(4,98,65,0.15)] dark:shadow-[0_26px_70px_rgba(5,56,41,0.4)]"
          >
            <div className="mb-6">
              <h2 className="text-[24px] font-black text-[#0f2318] dark:text-white">Join Our Team</h2>
              <p className="text-[12px] text-[#1a3326]/60 dark:text-white/55 mt-1">
                Please fill out the form below to apply.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              {submitSuccess && (
                <div className="rounded-xl border border-[#c3eed7] bg-[#e6f7ef] p-4 text-[13px] text-[#046241]">
                  Your application has been submitted successfully! We will be in touch.
                </div>
              )}
              {submitError && (
                <div className="rounded-xl border border-[#ffb5b5] bg-[#fff0f0] p-4 text-[13px] text-[#8a2626]">
                  {submitError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>First Name</FieldLabel>
                  <input
                    value={form.firstName}
                    onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                    placeholder="e.g. Michael"
                    className="w-full h-11 rounded-xl bg-white dark:bg-white/5 border border-[#dfe7e2] dark:border-white/10 px-4 text-[14px] text-[#0f2318] dark:text-white placeholder:text-[#1a3326]/45 dark:placeholder:text-white/35 outline-none focus:border-[#046241]/60 dark:focus:border-[#c1ff00]/70"
                  />
                </div>
                <div>
                  <FieldLabel>Last Name</FieldLabel>
                  <input
                    value={form.lastName}
                    onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                    placeholder="e.g. Chen"
                    className="w-full h-11 rounded-xl bg-white dark:bg-white/5 border border-[#dfe7e2] dark:border-white/10 px-4 text-[14px] text-[#0f2318] dark:text-white placeholder:text-[#1a3326]/45 dark:placeholder:text-white/35 outline-none focus:border-[#046241]/60 dark:focus:border-[#c1ff00]/70"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Gender</FieldLabel>
                  <select
                    value={form.gender}
                    onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
                    className="w-full h-11 rounded-xl bg-white dark:bg-white/5 border border-[#dfe7e2] dark:border-white/10 px-4 text-[14px] text-[#0f2318] dark:text-white placeholder:text-[#1a3326]/45 dark:placeholder:text-white/35 outline-none focus:border-[#046241]/60 dark:focus:border-[#c1ff00]/70"
                  >
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option} value={option} className="bg-white dark:bg-[#151a1f] text-[#0f2318] dark:text-white">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Age</FieldLabel>
                  <input
                    value={form.age}
                    onChange={(event) => {
                      const val = event.target.value.replace(/\D/g, "");
                      setForm((prev) => ({ ...prev, age: val }));
                    }}
                    placeholder="e.g. 24"
                    inputMode="numeric"
                    className="w-full h-11 rounded-xl bg-white dark:bg-white/5 border border-[#dfe7e2] dark:border-white/10 px-4 text-[14px] text-[#0f2318] dark:text-white outline-none focus:border-[#046241]/60 dark:focus:border-[#c1ff00]/70"
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Phone Number</FieldLabel>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center h-11 px-3 rounded-xl border border-[#dfe7e2] dark:border-white/10 bg-white dark:bg-white/5 text-[12px] text-[#1a3326]/70 dark:text-white/70">
                    +63 (Philippines)
                  </span>
                  <input
                    value={form.phone}
                    onChange={(event) => {
                      const val = event.target.value.replace(/\D/g, "");
                      setForm((prev) => ({ ...prev, phone: val }));
                    }}
                    placeholder="912345678"
                    inputMode="numeric"
                    className="flex-1 h-11 rounded-xl bg-white dark:bg-white/5 border border-[#dfe7e2] dark:border-white/10 px-4 text-[14px] text-[#0f2318] dark:text-white placeholder:text-[#1a3326]/45 dark:placeholder:text-white/35 outline-none focus:border-[#046241]/60 dark:focus:border-[#c1ff00]/70"
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Email Address</FieldLabel>
                <input
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="michael@example.com"
                  type="email"
                  className="w-full h-11 rounded-xl bg-white dark:bg-white/5 border border-[#dfe7e2] dark:border-white/10 px-4 text-[14px] text-[#0f2318] dark:text-white placeholder:text-[#1a3326]/45 dark:placeholder:text-white/35 outline-none focus:border-[#046241]/60 dark:focus:border-[#c1ff00]/70"
                />
              </div>

              <p className="text-[10px] text-[#1a3326]/55 dark:text-white/45 uppercase tracking-[0.22em]">
                Note: Please check your email and continue with the AI pre-screening.
              </p>

              <div>
                <FieldLabel>Position Applied</FieldLabel>
                <select
                  value={form.position}
                  onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))}
                  className="w-full h-11 rounded-xl bg-white dark:bg-white/5 border border-[#dfe7e2] dark:border-white/10 px-4 text-[14px] text-[#0f2318] dark:text-white placeholder:text-[#1a3326]/45 dark:placeholder:text-white/35 outline-none focus:border-[#046241]/60 dark:focus:border-[#c1ff00]/70"
                >
                  {POSITION_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-white dark:bg-[#151a1f] text-[#0f2318] dark:text-white">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel>Country</FieldLabel>
                <select
                  value={form.country}
                  onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
                  className="w-full h-11 rounded-xl bg-white dark:bg-white/5 border border-[#dfe7e2] dark:border-white/10 px-4 text-[14px] text-[#0f2318] dark:text-white outline-none focus:border-[#046241]/60 dark:focus:border-[#c1ff00]/70"
                >
                  {COUNTRY_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-white dark:bg-[#151a1f] text-[#0f2318] dark:text-white">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel>Current Address</FieldLabel>
                <input
                  value={form.address}
                  onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                  placeholder="e.g. Quezon City, Metro Manila"
                  className="w-full h-11 rounded-xl bg-white dark:bg-white/5 border border-[#dfe7e2] dark:border-white/10 px-4 text-[14px] text-[#0f2318] dark:text-white outline-none focus:border-[#046241]/60 dark:focus:border-[#c1ff00]/70"
                />
              </div>

              <div>
                <FieldLabel>Upload CV (PDF)</FieldLabel>
                <label className="flex flex-col items-center justify-center gap-2 h-28 rounded-2xl border border-dashed border-[#dfe7e2] dark:border-white/20 bg-white dark:bg-white/5 text-[#1a3326]/60 dark:text-white/55 cursor-pointer">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file && file.size > 10 * 1024 * 1024) {
                        alert("File exceeds maximum limit of 10MB");
                        return;
                      }
                      setForm((prev) => ({
                        ...prev,
                        cvName: file ? file.name : "",
                        cvFile: file || null
                      }));
                    }}
                  />
                  <div className="w-9 h-9 rounded-full bg-[#e7efe9] dark:bg-white/10 flex items-center justify-center text-[#1a3326] dark:text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
                    </svg>
                  </div>
                  <div className="text-[12px] text-center">
                    {form.cvName ? form.cvName : "Click to upload or drag and drop"}
                  </div>
                  <div className="text-[10px] text-[#1a3326]/45 dark:text-white/35">PDF only (max. 10MB)</div>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitDisabled || isSubmitting}
                className="mt-2 h-12 rounded-xl bg-[#046241] dark:bg-[#c1ff00] text-white dark:text-[#061006] text-[12px] font-black uppercase tracking-[0.2em]
                           shadow-[0_8px_24px_rgba(4,98,65,0.28)] dark:shadow-[0_8px_24px_rgba(193,255,0,0.28)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
