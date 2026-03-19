import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import emailjs from '@emailjs/browser';
import {
  AUTH_EVENT_NAME,
  AuthUser,
  getAuthUser,
  hasAdminAccess,
  isSuperAdmin,
  logoutAuth,
} from "../auth";
import { supabase } from "../supabaseClient";

const EASE = [0.16, 1, 0.3, 1] as const;
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_cpyba2r";
const EMAILJS_SCREENING_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_SCREENING_TEMPLATE_ID || "template_qbegp0m";
const EMAILJS_DECISION_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_DECISION_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "bbHE7xH3WprnKw8i8";

type Applicant = {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  age: string;
  phone: string;
  email: string;
  position: string;
  country: string;
  address: string;
  cv_name: string;
  cv_url: string;
  status: string;
  created_at: string;
};

type InterviewTranscriptEntry = {
  role: string;
  text: string;
};

type InterviewResultMeta = {
  interviewScore: number | null;
  evaluationSummary: string;
};

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "User Management", path: "/admin/users" },
  { label: "Applicants", path: "/admin/applicants" },
  { label: "Analytics", path: "/admin/analytics" },
  { label: "Contacts", path: "/admin/contacts" },
];

function navigate(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function statusPillClass(status: string) {
  if (status === "Reviewed") return "bg-[#e6f7ef] text-[#046241]";
  if (status === "New") return "bg-[#fff4e5] text-[#915700]";
  if (status === "Rejected") return "bg-[#ffe9e9] text-[#9f2424]";
  if (status === "Pending Interview") return "bg-[#fff8e1] text-[#b38a00] border border-[#ffecb3]";
  if (status === "Interview Completed") return "bg-[#f4eaf9] text-[#712b91] border border-[#f0dfff]";
  if (status === "Accepted") return "bg-[#eaf4ff] text-[#0051a8] border border-[#d6eaff]";
  return "bg-[#eaf1ed] text-[#2b5242]";
}

function formatDate(isoValue?: string | null) {
  if (!isoValue) return "Unknown";
  const parsed = new Date(isoValue);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const SCORE_METADATA_ROLE = "system_score_meta";

function parseInterviewResult(data: any): {
  transcript: InterviewTranscriptEntry[];
  meta: InterviewResultMeta;
} {
  const rawTranscript = Array.isArray(data?.qa_transcript) ? data.qa_transcript : [];
  const metadataEntry = rawTranscript.find((entry: any) => entry?.role === SCORE_METADATA_ROLE);

  let metadataFromTranscript: InterviewResultMeta = {
    interviewScore: null,
    evaluationSummary: "",
  };

  if (metadataEntry?.text) {
    try {
      const parsed = JSON.parse(metadataEntry.text);
      metadataFromTranscript = {
        interviewScore: typeof parsed?.interviewScore === "number" ? parsed.interviewScore : null,
        evaluationSummary: typeof parsed?.evaluationSummary === "string" ? parsed.evaluationSummary : "",
      };
    } catch {
      metadataFromTranscript = {
        interviewScore: null,
        evaluationSummary: "",
      };
    }
  }

  return {
    transcript: rawTranscript.filter(
      (entry: any) => entry?.role !== SCORE_METADATA_ROLE && typeof entry?.text === "string"
    ),
    meta: {
      interviewScore: typeof data?.interview_score === "number" ? data.interview_score : metadataFromTranscript.interviewScore,
      evaluationSummary: typeof data?.evaluation_summary === "string" && data.evaluation_summary.trim()
        ? data.evaluation_summary
        : metadataFromTranscript.evaluationSummary,
    },
  };
}

export default function AdminApplicantsPage() {
  const [user, setUser] = useState<AuthUser | null>(() => getAuthUser());
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname.replace(/\/+$/, ""));
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewApplicant, setViewApplicant] = useState<Applicant | null>(null);
  const [viewApplicantResults, setViewApplicantResults] = useState<InterviewTranscriptEntry[] | null>(null);
  const [viewApplicantScore, setViewApplicantScore] = useState<number | null>(null);
  const [viewApplicantEvaluationSummary, setViewApplicantEvaluationSummary] = useState("");
  const [isLoadingInterviewResults, setIsLoadingInterviewResults] = useState(false);
  const [viewPdfUrl, setViewPdfUrl] = useState<string | null>(null);
  const [acceptEmailModal, setAcceptEmailModal] = useState<Applicant | null>(null);
  const [rejectEmailModal, setRejectEmailModal] = useState<Applicant | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successModalStatus, setSuccessModalStatus] = useState<"Accepted" | "Rejected" | "Pending Interview" | null>(null);
  const [emailMessage, setEmailMessage] = useState("");
  const [rejectMessage, setRejectMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pendingReviewId, setPendingReviewId] = useState<string | null>(null);
  const interviewRequestIdRef = useRef(0);
  const [autoOpenApplicantId, setAutoOpenApplicantId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("applicantId");
  });

  useEffect(() => {
    const sync = () => setUser(getAuthUser());
    const onPop = () => setCurrentPath(window.location.pathname.replace(/\/+$/, ""));
    window.addEventListener(AUTH_EVENT_NAME, sync as EventListener);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, sync as EventListener);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  const canManage = hasAdminAccess(user);
  const isRootAdmin = isSuperAdmin(user);
  const activePath = currentPath === "/admin" ? "/admin/dashboard" : currentPath;
  const hasInterviewTranscript = Boolean(viewApplicantResults && viewApplicantResults.length > 0);
  const hasInterviewResultData =
    hasInterviewTranscript ||
    viewApplicantScore !== null ||
    viewApplicantEvaluationSummary.trim().length > 0;
  const isInitialInterviewResultLoad = isLoadingInterviewResults && !hasInterviewResultData;
  const isRefreshingInterviewResults = isLoadingInterviewResults && hasInterviewResultData;

  const getPrimaryApplicantActionLabel = (status: string) => {
    if (status === "Interview Completed") return "Accept Applicant";
    if (status === "Pending Interview") return "AI Screening Sent";
    if (status === "Accepted") return "Accepted";
    if (status === "Rejected") return "Rejected";
    return "Send Email for AI Screening";
  };

  const canSendAiScreeningEmail = (status: string) => ["New", "Reviewed"].includes(status);
  const canAcceptCompletedApplicant = (status: string) => status === "Interview Completed";
  const isPrimaryApplicantActionEnabled = (status: string) =>
    canSendAiScreeningEmail(status) || canAcceptCompletedApplicant(status);
  const canRejectAfterInterview = (status: string) => status === "Interview Completed";

  const markApplicantCompletedLocally = (applicantId: string) => {
    setApplicants((prev) =>
      prev.map((entry) =>
        entry.id === applicantId && entry.status === "Pending Interview"
          ? { ...entry, status: "Interview Completed" }
          : entry
      )
    );

    setViewApplicant((prev) =>
      prev && prev.id === applicantId && prev.status === "Pending Interview"
        ? { ...prev, status: "Interview Completed" }
        : prev
    );
  };

  const syncApplicantInterviewCompleted = async (applicantId: string) => {
    markApplicantCompletedLocally(applicantId);

    const { error } = await supabase
      .from("applicants")
      .update({ status: "Interview Completed" })
      .eq("id", applicantId)
      .eq("status", "Pending Interview");

    if (error) {
      console.error("Failed to sync applicant interview completion status:", error);
    }
  };

  const fetchApplicants = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }
    setError("");

    try {
      const { data: applicantsData, error: applicantsError } = await supabase
        .from("applicants")
        .select("*")
        .order("created_at", { ascending: false });

      if (applicantsError) throw applicantsError;

      const { data: interviewResultsData, error: interviewResultsError } = await supabase
        .from("interview_results")
        .select("applicant_id, created_at");
      if (interviewResultsError) {
        console.warn("Unable to load interview_results during applicants refresh:", interviewResultsError);
      }

      const applicantIdsWithResults = new Set(
        ((interviewResultsError ? [] : interviewResultsData) || [])
          .map((entry: any) => entry.applicant_id)
          .filter((value: string | null | undefined) => Boolean(value))
      );

      const idsToSync = (applicantsData || [])
        .filter((entry: any) =>
          applicantIdsWithResults.has(entry.id) &&
          entry.status === "Pending Interview"
        )
        .map((entry: any) => entry.id);

      const normalizedApplicants = (applicantsData || []).map((applicant: any) => {
        const hasInterviewResults = applicantIdsWithResults.has(applicant.id);
        return {
          ...applicant,
          status:
            hasInterviewResults && applicant.status === "Pending Interview"
              ? "Interview Completed"
              : applicant.status,
        };
      });

      setApplicants(normalizedApplicants || []);

      if (idsToSync.length > 0) {
        void supabase
          .from("applicants")
          .update({ status: "Interview Completed" })
          .in("id", idsToSync)
          .then(({ error: syncError }) => {
            if (syncError) {
              console.error("Failed to persist interview-completed statuses:", syncError);
            }
          });
      }
    } catch (err: any) {
      const rawMessage = err?.message || "Failed to load applicants.";

      if (rawMessage.includes("applicants")) {
        setError("The `applicants` table is missing in the connected Supabase project. Run the SQL setup script in the same project used by this deployment.");
      } else if (rawMessage.includes("does not exist")) {
        setError(rawMessage);
      } else {
        setError(rawMessage);
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const loadApplicantInterviewData = async (
    applicantId: string,
    options?: { preserveExisting?: boolean }
  ) => {
    const preserveExisting = options?.preserveExisting ?? false;
    const requestId = interviewRequestIdRef.current + 1;
    interviewRequestIdRef.current = requestId;
    setIsLoadingInterviewResults(true);

    if (!preserveExisting) {
      setViewApplicantResults(null);
      setViewApplicantScore(null);
      setViewApplicantEvaluationSummary("");
    }

    try {
      const { data, error } = await supabase
        .from("interview_results")
        .select("*")
        .eq("applicant_id", applicantId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      if (interviewRequestIdRef.current !== requestId) return;

      if (data && data.length > 0) {
        const parsedResult = parseInterviewResult(data[0]);
        setViewApplicantResults(parsedResult.transcript);
        setViewApplicantScore(parsedResult.meta.interviewScore);
        setViewApplicantEvaluationSummary(parsedResult.meta.evaluationSummary);

        const currentApplicant = applicants.find((entry) => entry.id === applicantId);
        if (currentApplicant?.status === "Pending Interview") {
          void syncApplicantInterviewCompleted(applicantId);
        }
      } else if (!preserveExisting) {
        setViewApplicantResults(null);
        setViewApplicantScore(null);
        setViewApplicantEvaluationSummary("");
      }
    } catch (err) {
      if (interviewRequestIdRef.current !== requestId) return;
      console.log("No interview results found or error fetching.", err);
    } finally {
      if (interviewRequestIdRef.current === requestId) {
        setIsLoadingInterviewResults(false);
      }
    }
  };

  useEffect(() => {
    if (!canManage) return;
    void fetchApplicants();
  }, [canManage]);

  useEffect(() => {
    if (!canManage) return;

    const pollInterval = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;

      void fetchApplicants(false);

      if (viewApplicant?.id) {
        void loadApplicantInterviewData(viewApplicant.id, { preserveExisting: true });
      }
    }, 5000);

    return () => {
      window.clearInterval(pollInterval);
    };
  }, [canManage, viewApplicant?.id]);

  useEffect(() => {
    if (!canManage) return;

    const applicantsChannel = supabase
      .channel("admin-applicants-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applicants" },
        () => {
          void fetchApplicants(false);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(applicantsChannel);
    };
  }, [canManage]);

  useEffect(() => {
    if (loading) return;
    if (!autoOpenApplicantId) return;
    const target = applicants.find((entry) => entry.id === autoOpenApplicantId);
    if (!target) return;
    openApplicantDetails(target);
    setAutoOpenApplicantId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("applicantId");
    window.history.replaceState({}, "", url.pathname + url.search);
  }, [loading, autoOpenApplicantId, applicants]);

  useEffect(() => {
    if (!viewApplicant) return;

    const latestApplicant = applicants.find((entry) => entry.id === viewApplicant.id);

    if (!latestApplicant) return;

    if (
      latestApplicant.status !== viewApplicant.status ||
      latestApplicant.first_name !== viewApplicant.first_name ||
      latestApplicant.last_name !== viewApplicant.last_name ||
      latestApplicant.email !== viewApplicant.email ||
      latestApplicant.position !== viewApplicant.position ||
      latestApplicant.cv_url !== viewApplicant.cv_url ||
      latestApplicant.cv_name !== viewApplicant.cv_name
    ) {
      setViewApplicant(latestApplicant);
    }
  }, [applicants, viewApplicant]);

  useEffect(() => {
    if (!canManage || !viewApplicant?.id) return;

    const interviewResultsChannel = supabase
      .channel(`admin-interview-results-${viewApplicant.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "interview_results",
          filter: `applicant_id=eq.${viewApplicant.id}`,
        },
        () => {
          void loadApplicantInterviewData(viewApplicant.id, { preserveExisting: true });
          void fetchApplicants(false);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(interviewResultsChannel);
    };
  }, [canManage, viewApplicant?.id]);

  const roleOptions = useMemo(() => {
    const uniqueRoles = new Set<string>();
    applicants.forEach((applicant) => {
      if (applicant.position) uniqueRoles.add(applicant.position);
    });
    return Array.from(uniqueRoles).sort((a, b) => a.localeCompare(b));
  }, [applicants]);

  const filteredApplicants = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return applicants.filter((a) => {
      const matchesQuery =
        !query ||
        a.first_name.toLowerCase().includes(query) ||
        a.last_name.toLowerCase().includes(query) ||
        a.email.toLowerCase().includes(query) ||
        a.position.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || a.position === roleFilter;
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [searchTerm, applicants, roleFilter, statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("applicants")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;

      setApplicants((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      if (viewApplicant?.id === id) {
        setViewApplicant((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const openApplicantDetails = async (applicant: Applicant) => {
    setViewApplicant(applicant);
    setPendingReviewId(applicant.status === "New" ? applicant.id : null);
    await loadApplicantInterviewData(applicant.id, { preserveExisting: false });
  };

  const closeApplicantDetails = () => {
    interviewRequestIdRef.current += 1;
    if (pendingReviewId && viewApplicant?.id === pendingReviewId && viewApplicant.status === "New") {
      void handleUpdateStatus(pendingReviewId, "Reviewed");
    }
    setViewApplicant(null);
    setPendingReviewId(null);
    setViewApplicantResults(null);
    setViewApplicantScore(null);
    setViewApplicantEvaluationSummary("");
    setIsLoadingInterviewResults(false);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const { error } = await supabase.from("applicants").delete().eq("id", deleteConfirmId);
      if (error) throw error;
      setApplicants((prev) => prev.filter((a) => a.id !== deleteConfirmId));
      if (viewApplicant?.id === deleteConfirmId) {
        setViewApplicant(null);
        setPendingReviewId(null);
      }
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert("Failed to delete applicant: " + err.message);
    }
  };

  const openAcceptModal = (applicant: Applicant) => {
    const template = applicant.status === "Interview Completed"
      ? `Dear ${applicant.first_name},\n\nCongratulations! We are pleased to move forward with your application for the ${applicant.position} role at Lifewood.\n\nYour AI screening has been reviewed successfully, and we are happy to inform you that you have passed this stage.\n\nOur team will contact you soon with the next steps.\n\nBest regards,\nThe Lifewood Team`
      : `Dear ${applicant.first_name},\n\nThank you for applying for the ${applicant.position} role at Lifewood.\n\nWe would like to invite you to complete the AI screening interview as the next step in our hiring process.\n\nPlease click the interview link below and complete the screening at your earliest convenience.\n\nBest regards,\nThe Lifewood Team`;
    setEmailMessage(template);
    setAcceptEmailModal(applicant);
  };

  const openRejectModal = (applicant: Applicant) => {
    const template = `Dear ${applicant.first_name},\n\nThank you for completing the AI screening for the ${applicant.position} role at Lifewood.\n\nAfter careful review, we will not be moving forward with your application for this position at this time.\n\nWe appreciate the time and effort you invested in the process, and we encourage you to apply again for future opportunities that match your skills and experience.\n\nBest regards,\nThe Lifewood Team`;
    setRejectMessage(template);
    setRejectEmailModal(applicant);
  };

  const buildEmailTemplateParams = (options: {
    applicant: Applicant;
    message: string;
    subject: string;
    includeInterviewLink: boolean;
  }) => {
    const interviewLink = options.includeInterviewLink
      ? `${window.location.origin}/interview/${options.applicant.id}`
      : "";

    return {
      to_email: options.applicant.email,
      to_name: options.applicant.first_name,
      from_name: "Lifewood Admin",
      message: options.message,
      subject: options.subject,
      interview_link: interviewLink,
      cta_url: interviewLink,
      cta_label: options.includeInterviewLink ? "Start AI Interview" : "",
      show_interview_button: options.includeInterviewLink ? "true" : "false",
      show_cta: options.includeInterviewLink ? "true" : "false",
      email_type: options.includeInterviewLink ? "ai_screening" : "decision",
    };
  };

  const handleSendAcceptance = async () => {
    if (!acceptEmailModal) return;
    setIsSending(true);

    try {
      const nextStatus = acceptEmailModal.status === "Interview Completed" ? "Accepted" : "Pending Interview";

      const { error } = await supabase
        .from("applicants")
        .update({ status: nextStatus })
        .eq("id", acceptEmailModal.id);

      if (error) throw error;

      const isScreeningEmail = nextStatus === "Pending Interview";
      const templateId = isScreeningEmail
        ? EMAILJS_SCREENING_TEMPLATE_ID
        : (EMAILJS_DECISION_TEMPLATE_ID || EMAILJS_SCREENING_TEMPLATE_ID);

      const templateParams = buildEmailTemplateParams({
        applicant: acceptEmailModal,
        message: emailMessage,
        subject: `Update on your application at Lifewood`,
        includeInterviewLink: isScreeningEmail,
      });

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        templateId,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setApplicants((prev) =>
        prev.map((a) => (a.id === acceptEmailModal.id ? { ...a, status: nextStatus } : a))
      );
      if (viewApplicant?.id === acceptEmailModal.id) {
        setViewApplicant((prev) => (prev ? { ...prev, status: nextStatus } : prev));
      }

      setAcceptEmailModal(null);
      setSuccessModalStatus(nextStatus === "Accepted" ? "Accepted" : "Pending Interview");
    } catch (err: any) {
      console.error("EmailJS Error:", err);
      const errorMsg = err.text || err.message || "Unknown error";
      alert("Failed to send email: " + errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendRejection = async () => {
    if (!rejectEmailModal) return;
    setIsSending(true);

    try {
      // 1. Update the status to 'Rejected' in DB
      const { error } = await supabase
        .from("applicants")
        .update({ status: "Rejected" })
        .eq("id", rejectEmailModal.id);

      if (error) throw error;

      // 2. Call EmailJS to send the email directly from the browser
      // NOTE: You must replace these placeholders with your actual EmailJS IDs!
      const templateParams = buildEmailTemplateParams({
        applicant: rejectEmailModal,
        message: rejectMessage,
        subject: `Update on your application at Lifewood`,
        includeInterviewLink: false,
      });

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_DECISION_TEMPLATE_ID || EMAILJS_SCREENING_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setApplicants((prev) =>
        prev.map((a) => (a.id === rejectEmailModal.id ? { ...a, status: "Rejected" } : a))
      );
      if (viewApplicant?.id === rejectEmailModal.id) {
        setViewApplicant((prev) => (prev ? { ...prev, status: "Rejected" } : prev));
      }

      setRejectEmailModal(null);
      setSuccessModalStatus("Rejected");
    } catch (err: any) {
      console.error("EmailJS Error:", err);
      const errorMsg = err.text || err.message || "Unknown error";
      alert("Failed to send rejection: " + errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  if (!canManage) {
    return (
      <main className="min-h-screen bg-brand-paper px-6 py-20 text-[#0f1215]">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-2">
              Access Denied
            </p>
            <h1 className="text-3xl font-black mb-3">Admin access required</h1>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="h-11 px-5 rounded-xl bg-[#046241] text-white text-[11px] font-black uppercase tracking-[0.14em]"
            >
              Back to Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-brand-paper dark:bg-brand-dark overflow-x-hidden lg:h-screen lg:overflow-hidden text-[#12261d]"
      style={{ fontFamily: "Poppins, Sora, 'Segoe UI', sans-serif" }}
    >
      <section className="min-h-screen lg:h-screen grid grid-cols-1 lg:grid-cols-[238px_minmax(0,1fr)]">
        <aside className="bg-[linear-gradient(180deg,#07261c_0%,#051d15_100%)] text-white p-5 lg:h-screen overflow-y-auto">
          <div className="mb-7">
            <img
              src="https://framerusercontent.com/images/Ca8ppNsvJIfTsWEuHr50gvkDow.png?scale-down-to=512&width=2624&height=474"
              alt="Lifewood"
              className="h-8 w-auto object-contain"
            />
          </div>

          <div className="space-y-1.5 mb-6">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = activePath === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`w-full text-left h-10 rounded-xl px-3 text-[12px] font-semibold transition-colors ${isActive
                    ? "bg-[#0f3a2b] text-white"
                    : "text-white/72 hover:text-white hover:bg-white/8"
                    }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-7 rounded-2xl border border-white/14 bg-white/8 p-3.5">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50 mb-1.5">
              Signed in
            </p>
            <p className="text-[13px] font-bold truncate">{user?.name || "Admin"}</p>
            <p className="text-[11px] text-white/70 truncate">{user?.email}</p>
            {isRootAdmin && (
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#c1ff00]">
                Super admin
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={async () => {
              await logoutAuth();
              navigate("/login");
            }}
            className="mt-4 w-full h-10 rounded-xl border border-[#FFB347]/40 text-[#FFB347]
                       text-[11px] font-black uppercase tracking-[0.12em]
                       hover:bg-[#FFB347]/10 transition-colors"
          >
            Log out
          </button>
        </aside>

        <motion.section
          key="admin-applicants-content"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="p-5 md:p-7 bg-[#f7faf8] lg:h-screen overflow-y-auto"
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <h1 className="text-[44px] leading-[0.92] font-black tracking-[-0.03em] text-[#10261d]">
              Job Applicants
            </h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void fetchApplicants()}
                disabled={loading}
                className="h-9 px-3 rounded-full bg-[#046241] text-white text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-55"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-[#ffb5b5] bg-[#fff0f0] px-3.5 py-2.5 text-[12px] font-semibold text-[#8a2626]">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-[#e0e9e4] bg-white overflow-hidden">
            <div className="px-4 py-3.5 border-b border-[#ecf2ee] flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[22px] font-black text-[#10261d]">All Applicants</h2>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                  className="h-9 w-full sm:w-[220px] rounded-lg border border-[#d9e6df] bg-[#f9fbfa] px-3 text-[12px] font-semibold text-[#163126] outline-none"
                >
                  <option value="all">All Roles</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-9 w-full sm:w-[190px] rounded-lg border border-[#d9e6df] bg-[#f9fbfa] px-3 text-[12px] font-semibold text-[#163126] outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <div className="h-9 w-full sm:w-[250px] rounded-lg border border-[#d9e6df] bg-[#f9fbfa] px-3 flex items-center">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search name, email, role"
                    className="w-full bg-transparent outline-none text-[13px] placeholder:text-[#1a3326]/45"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead className="bg-[#f6faf8]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#1a3326]/45">Applicant</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#1a3326]/45">Position</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#1a3326]/45">Status</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#1a3326]/45">Applied On</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#1a3326]/45">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr className="border-t border-[#ecf1ee]">
                      <td colSpan={5} className="px-4 py-6 text-[13px] text-[#1a3326]/55">
                        Loading applicants...
                      </td>
                    </tr>
                  ) : filteredApplicants.length === 0 ? (
                    <tr className="border-t border-[#ecf1ee]">
                      <td colSpan={5} className="px-4 py-6 text-[13px] text-[#1a3326]/55">
                        No applicants found.
                      </td>
                    </tr>
                  ) : (
                    filteredApplicants.map((entry) => (
                      <tr key={entry.id} className="border-t border-[#ecf1ee]">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-[13px] font-bold text-[#0f2318]">{entry.first_name} {entry.last_name}</p>
                              <p className="text-[12px] text-[#1a3326]/62">{entry.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-[12px] text-[#1a3326]/80 font-semibold">
                          {entry.position}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${statusPillClass(entry.status)}`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-[12px] text-[#1a3326]/62">
                          {formatDate(entry.created_at)}
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => openApplicantDetails(entry)}
                            className="h-8 px-3 rounded-lg border border-[#046241]/20 text-[10px] font-black uppercase tracking-[0.1em] text-[#046241] hover:bg-[#046241]/5 transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {viewApplicant && (
            <div className="fixed inset-0 z-[90] bg-[#06140f]/55 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="w-full max-w-[720px] rounded-2xl border border-[#dbe7e1] bg-white p-5 md:p-6 overflow-y-auto max-h-[90vh]">
                <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[#e6eee9] bg-white px-5 py-5 md:-mx-6 md:-mt-6 md:px-6 md:py-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6a7c73] mb-1">
                      Applicant Details
                    </p>
                    <h3 className="text-[24px] font-black tracking-[-0.02em] text-[#10261d]">
                      {viewApplicant.first_name} {viewApplicant.last_name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={closeApplicantDetails}
                    className="h-9 px-4 rounded-xl border border-[#d8e5de] text-[11px] font-black uppercase tracking-[0.1em] text-[#1a3326]/70 hover:bg-[#f3f8f5]"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px] text-[#163126]">
                  <div className="rounded-xl border border-[#e6eee9] bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">Email</p>
                    <p className="mt-1 font-semibold">{viewApplicant.email}</p>
                  </div>
                  <div className="rounded-xl border border-[#e6eee9] bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">Phone</p>
                    <p className="mt-1 font-semibold">{viewApplicant.phone}</p>
                  </div>
                  <div className="rounded-xl border border-[#e6eee9] bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">Gender</p>
                    <p className="mt-1 font-semibold">{viewApplicant.gender}</p>
                  </div>
                  <div className="rounded-xl border border-[#e6eee9] bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">Age</p>
                    <p className="mt-1 font-semibold">{viewApplicant.age}</p>
                  </div>
                  <div className="rounded-xl border border-[#e6eee9] bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">Position Applied</p>
                    <p className="mt-1 font-semibold">{viewApplicant.position}</p>
                  </div>
                  <div className="rounded-xl border border-[#e6eee9] bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">Country</p>
                    <p className="mt-1 font-semibold">{viewApplicant.country}</p>
                  </div>
                  <div className="rounded-xl border border-[#e6eee9] bg-white p-3 md:col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">Address</p>
                    <p className="mt-1 font-semibold">{viewApplicant.address}</p>
                  </div>

                  <div className="rounded-xl border border-[#e6eee9] bg-white p-3 md:col-span-2 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">Uploaded CV</p>
                      <p className="mt-1 font-semibold truncate max-w-[300px]">{viewApplicant.cv_name}</p>
                    </div>
                    {viewApplicant.cv_url && (
                      <button
                        type="button"
                        onClick={() => setViewPdfUrl(viewApplicant.cv_url)}
                        className="h-8 px-4 rounded-lg bg-[#046241] text-white text-[10px] font-black uppercase tracking-[0.1em] flex items-center"
                      >
                        View PDF
                      </button>
                    )}
                  </div>

                  <div className="rounded-xl border border-[#e6eee9] bg-white p-3 md:col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">Applicant Status</p>
                    <div className="mt-2 flex items-center gap-2">
                      <select
                        value={viewApplicant.status}
                        onChange={(e) => handleUpdateStatus(viewApplicant.id, e.target.value)}
                        disabled={["Pending Interview", "Interview Completed", "Accepted", "Rejected"].includes(viewApplicant.status)}
                        title={
                          ["Pending Interview", "Interview Completed", "Accepted", "Rejected"].includes(viewApplicant.status)
                            ? "Status is locked after a final decision."
                            : undefined
                        }
                        className={`h-9 rounded-lg border border-[#d8e5de] bg-white px-3 text-[12px] font-semibold text-[#163126] outline-none focus:border-[#046241] ${["Pending Interview", "Interview Completed", "Accepted", "Rejected"].includes(viewApplicant.status)
                            ? "opacity-70 cursor-not-allowed"
                            : ""
                          }`}
                      >
                        <option value="New">New</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Pending Interview">Pending Interview</option>
                        <option value="Interview Completed">Interview Completed</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="mt-6 pt-5 border-t border-[#e6eee9]">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-4 h-4 text-[#046241]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <h4 className="text-[14px] font-black tracking-[-0.02em] text-[#10261d]">
                          AI Interview Result
                        </h4>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="rounded-xl border border-[#d7e8df] bg-[linear-gradient(135deg,#f7fbf9_0%,#edf7f1_100%)] p-4">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#046241]">Interview Score</p>
                              <h4 className="mt-1 text-[28px] leading-none font-black text-[#10261d]">
                                {viewApplicantScore !== null
                                  ? `${viewApplicantScore}/100`
                                  : isInitialInterviewResultLoad
                                    ? "Loading..."
                                    : hasInterviewTranscript
                                      ? "Saved"
                                      : "No score yet"}
                              </h4>
                            </div>
                            <div className="max-w-2xl">
                              {isRefreshingInterviewResults && (
                                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#046241]/75">
                                  Refreshing saved result...
                                </p>
                              )}
                              <p className="text-[13px] leading-[1.7] text-[#1a3326]/78">
                                {viewApplicantEvaluationSummary ||
                                  (isInitialInterviewResultLoad
                                    ? "Loading the applicant's saved interview result."
                                    : hasInterviewTranscript
                                      ? "The interview transcript is saved for this applicant."
                                      : "The applicant's interview transcript and score will appear here after the AI interview is saved.")}
                              </p>
                            </div>
                          </div>
                        </div>

                        {isInitialInterviewResultLoad ? (
                          <div className="rounded-xl border border-[#e6eee9] bg-[#f8faf9] p-4 text-[13px] text-[#1a3326]/65">
                            Loading interview results...
                          </div>
                        ) : hasInterviewTranscript ? (
                          <div className="space-y-4 bg-[#f8faf9] rounded-xl border border-[#e6eee9] p-4">
                            {isRefreshingInterviewResults && (
                              <div className="rounded-lg border border-[#d7e8df] bg-white px-3 py-2 text-[11px] font-medium text-[#1a3326]/60">
                                Checking for the latest interview updates...
                              </div>
                            )}
                            {viewApplicantResults.map((msg, idx) => (
                              <div key={idx} className={`flex flex-col ${msg.role === 'model' || msg.role === 'assistant' ? 'items-start' : 'items-end'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-[1.6] ${msg.role === 'model' || msg.role === 'assistant'
                                    ? 'bg-white border border-[#e0e9e4] text-[#163126] rounded-tl-sm'
                                    : 'bg-[#046241] text-white rounded-bl-sm'
                                  }`}>
                                  <p className="text-[8px] font-black uppercase tracking-wider mb-1 opacity-60">
                                    {msg.role === 'model' || msg.role === 'assistant' ? 'AI Agent' : 'Applicant'}
                                  </p>
                                  <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-[#d7e8df] bg-[#fbfdfc] p-4 text-[13px] text-[#1a3326]/65">
                            No interview result is available for this applicant yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openAcceptModal(viewApplicant)}
                        disabled={!isPrimaryApplicantActionEnabled(viewApplicant.status)}
                        className={`h-10 px-6 rounded-lg text-[11px] font-black uppercase tracking-[0.1em] transition-colors ${!isPrimaryApplicantActionEnabled(viewApplicant.status)
                            ? "bg-[#e0e9e4] text-[#869b90] cursor-not-allowed"
                            : "bg-[#046241] text-white hover:bg-[#034d33]"
                          }`}
                      >
                        {getPrimaryApplicantActionLabel(viewApplicant.status)}
                      </button>
                      <button
                        type="button"
                        onClick={() => openRejectModal(viewApplicant)}
                        disabled={!canRejectAfterInterview(viewApplicant.status)}
                        className={`h-10 px-6 rounded-lg text-[11px] font-black uppercase tracking-[0.1em] transition-colors ${!canRejectAfterInterview(viewApplicant.status)
                            ? "bg-red-600/10 text-red-600/60 cursor-not-allowed"
                            : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                      >
                        {viewApplicant.status === "Rejected" ? "Rejected" : "Reject Applicant"}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(viewApplicant.id)}
                      className="h-9 px-4 rounded-lg bg-red-600/10 text-red-600 text-[11px] font-black uppercase tracking-[0.1em] hover:bg-red-600/20 transition-colors"
                    >
                      Delete Applicant
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {viewPdfUrl && (
            <div className="fixed inset-0 z-[100] bg-[#06140f]/75 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="w-full max-w-[900px] h-[85vh] rounded-2xl border border-[#dbe7e1] bg-white flex flex-col overflow-hidden">
                <div className="px-5 py-4 border-b border-[#e0e9e4] flex items-center justify-between bg-[#fcfdfc]">
                  <div>
                    <h3 className="text-[18px] font-black tracking-[-0.02em] text-[#10261d]">
                      Applicant CV
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewPdfUrl(null)}
                    className="h-9 px-4 rounded-xl border border-[#d8e5de] text-[11px] font-black uppercase tracking-[0.1em] text-[#1a3326]/70 hover:bg-[#f3f8f5]"
                  >
                    Close PDF
                  </button>
                </div>
                <div className="flex-1 w-full bg-[#f4f7f5] p-2">
                  <iframe
                    src={`${viewPdfUrl}#view=FitH`}
                    className="w-full h-full border border-[#d8e5de] rounded-xl bg-white"
                    title="Applicant CV"
                  />
                </div>
              </div>
            </div>
          )}

          {acceptEmailModal && (
            <div className="fixed inset-0 z-[100] bg-[#06140f]/75 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="w-full max-w-[600px] rounded-2xl border border-[#dbe7e1] bg-white overflow-hidden shadow-2xl">
                <div className="px-5 py-4 border-b border-[#e0e9e4] flex items-center justify-between bg-[#fcfdfc]">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#046241] mb-1">
                      {acceptEmailModal.status === "Interview Completed" ? "Send Decision" : "Send AI Screening"}
                    </p>
                    <h3 className="text-[18px] font-black tracking-[-0.02em] text-[#10261d]">
                      {acceptEmailModal.status === "Interview Completed"
                        ? `Accept ${acceptEmailModal.first_name}`
                        : `Send AI Screening to ${acceptEmailModal.first_name}`}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAcceptEmailModal(null)}
                    disabled={isSending}
                    className="h-9 px-4 rounded-xl border border-[#d8e5de] text-[11px] font-black uppercase tracking-[0.1em] text-[#1a3326]/70 hover:bg-[#f3f8f5] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-[12px] text-[#1a3326]/70 mb-3">
                    {acceptEmailModal.status === "Interview Completed"
                      ? "Review the acceptance email below before sending."
                      : "Review the AI screening email below before sending."}
                  </p>

                  <div className="mb-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.1em] text-[#1a3326]/60 mb-1.5">
                      To:
                    </label>
                    <div className="h-10 px-3 flex items-center rounded-lg border border-[#e0e9e4] bg-[#f7faf8] text-[13px] font-medium text-[#10261d]">
                      {acceptEmailModal.email}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.1em] text-[#1a3326]/60 mb-1.5">
                      Message:
                    </label>
                    <textarea
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      className="w-full h-48 rounded-xl border border-[#d8e5de] bg-white p-3 text-[13px] text-[#163126] outline-none focus:border-[#046241] resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-2">
                    <button
                      type="button"
                      onClick={handleSendAcceptance}
                      disabled={isSending || !emailMessage.trim()}
                      className="h-10 px-6 rounded-xl bg-[#046241] text-white text-[11px] font-black uppercase tracking-[0.1em] shadow-[0_4px_14px_rgba(4,98,65,0.25)] hover:bg-[#034d33] transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSending ? (
                        "Sending..."
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          {acceptEmailModal.status === "Interview Completed"
                            ? "Send Email & Accept"
                            : "Send AI Screening Email"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {rejectEmailModal && (
            <div className="fixed inset-0 z-[100] bg-[#06140f]/75 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="w-full max-w-[600px] rounded-2xl border border-[#f2d9d9] bg-white overflow-hidden shadow-2xl">
                <div className="px-5 py-4 border-b border-[#f2d9d9] flex items-center justify-between bg-[#fff6f6]">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600 mb-1">
                      Send Update
                    </p>
                    <h3 className="text-[18px] font-black tracking-[-0.02em] text-[#10261d]">
                      Reject {rejectEmailModal.first_name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRejectEmailModal(null)}
                    disabled={isSending}
                    className="h-9 px-4 rounded-xl border border-[#f2d9d9] text-[11px] font-black uppercase tracking-[0.1em] text-[#1a3326]/70 hover:bg-[#fef2f2] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-[12px] text-[#1a3326]/70 mb-3">
                    Review the rejection email below before sending.
                  </p>

                  <div className="mb-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.1em] text-[#1a3326]/60 mb-1.5">
                      To:
                    </label>
                    <div className="h-10 px-3 flex items-center rounded-lg border border-[#f2d9d9] bg-[#fff6f6] text-[13px] font-medium text-[#10261d]">
                      {rejectEmailModal.email}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.1em] text-[#1a3326]/60 mb-1.5">
                      Message:
                    </label>
                    <textarea
                      value={rejectMessage}
                      onChange={(e) => setRejectMessage(e.target.value)}
                      className="w-full h-48 rounded-xl border border-[#f2d9d9] bg-white p-3 text-[13px] text-[#163126] outline-none focus:border-red-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-2">
                    <button
                      type="button"
                      onClick={handleSendRejection}
                      disabled={isSending || !rejectMessage.trim()}
                      className="h-10 px-6 rounded-xl bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.1em] shadow-[0_4px_14px_rgba(220,38,38,0.25)] hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSending ? (
                        "Sending..."
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send Email & Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {deleteConfirmId && (
            <div className="fixed inset-0 z-[110] bg-[#06140f]/75 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="w-full max-w-[400px] rounded-2xl border border-[#dbe7e1] bg-white p-6 shadow-2xl">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-[18px] font-black tracking-[-0.02em] text-[#10261d] mb-2">
                    Delete Applicant?
                  </h3>
                  <p className="text-[13px] text-[#1a3326]/70 mb-6">
                    Are you sure you want to permanently delete this applicant? This action cannot be undone.
                  </p>
                  <div className="flex items-center justify-center gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="flex-1 h-10 rounded-xl border border-[#d8e5de] text-[11px] font-black uppercase tracking-[0.1em] text-[#1a3326]/70 hover:bg-[#f3f8f5] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmDelete}
                      className="flex-1 h-10 rounded-xl bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.1em] hover:bg-red-700 transition-colors shadow-[0_4px_14px_rgba(220,38,38,0.25)]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {successModalStatus && (
            <div className="fixed inset-0 z-[110] bg-[#06140f]/75 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="w-full max-w-[400px] rounded-2xl border border-[#dbe7e1] bg-white p-6 shadow-2xl">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-full border flex items-center justify-center mb-4 ${successModalStatus === "Accepted" || successModalStatus === "Pending Interview"
                      ? "bg-[#f3f8f5] border-[#d8e5de] text-[#046241]"
                      : "bg-[#fff5f5] border-[#f2d9d9] text-red-600"
                    }`}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-[18px] font-black tracking-[-0.02em] text-[#10261d] mb-2">
                    Email Sent!
                  </h3>
                  <p className="text-[13px] text-[#1a3326]/70 mb-6">
                    {successModalStatus === "Pending Interview"
                      ? "The AI screening email has been sent to the applicant. Their status is now \"Pending Interview\"."
                      : successModalStatus === "Accepted"
                        ? "The acceptance email has been sent to the applicant. Their status is now \"Accepted\"."
                        : "The rejection email has been sent to the applicant. Their status is now \"Rejected\"."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccessModalStatus(null)}
                    className={`w-full h-10 rounded-xl text-white text-[11px] font-black uppercase tracking-[0.1em] transition-colors shadow-[0_4px_14px_rgba(4,98,65,0.25)] ${successModalStatus === "Accepted" || successModalStatus === "Pending Interview"
                        ? "bg-[#046241] hover:bg-[#034d33]"
                        : "bg-red-600 hover:bg-red-700 shadow-[0_4px_14px_rgba(220,38,38,0.25)]"
                      }`}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.section>
      </section>
    </main>
  );
}
