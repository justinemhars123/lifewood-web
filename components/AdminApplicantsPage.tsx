import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import emailjs from '@emailjs/browser';
import { getEmailJsConfig, getEmailJsConfigError } from "../emailjsConfig";
import {
  AUTH_EVENT_NAME,
  AuthUser,
  getAuthUser,
  hasAdminAccess,
  isSuperAdmin,
  logoutAuth,
} from "../auth";
import AdminNavigation from "./AdminNavigation";
import { supabase } from "../supabaseClient";

const EASE = [0.16, 1, 0.3, 1] as const;

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
  if (status === "HR Interview") return "bg-[#e8ebff] text-[#3b5998] border border-[#d1d9ff]";
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

function PremiumStatCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}) {
  const trendSymbol = trend === "up" ? "+" : trend === "down" ? "-" : "=";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e0e9e4] bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="pointer-events-none absolute top-0 right-0 h-32 w-full rounded-bl-full bg-gradient-to-br from-[#046241]/[0.02] to-transparent transition-transform duration-500 group-hover:scale-110" />
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="text-[12px] font-bold uppercase tracking-wide text-[#6a7c73]">{title}</p>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${trend === "up"
                ? "bg-[#e6f7ef] text-[#046241]"
                : trend === "down"
                  ? "bg-[#ffe9e9] text-[#9f2424]"
                  : "bg-[#f0f4f1] text-[#6a7c73]"
              }`}
          >
            {trendSymbol} {trendValue}
          </span>
        )}
      </div>
      <p className="mt-1 text-[40px] leading-none font-black tracking-tight text-[#12261d]">
        {value}
      </p>
      {subtitle && (
        <p className="mt-auto pt-4 text-[11px] font-semibold text-[#1a3326]/55">
          {subtitle}
        </p>
      )}
    </div>
  );
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
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [viewApplicant, setViewApplicant] = useState<Applicant | null>(null);
  const [viewApplicantResults, setViewApplicantResults] = useState<InterviewTranscriptEntry[] | null>(null);
  const [viewApplicantScore, setViewApplicantScore] = useState<number | null>(null);
  const [viewApplicantEvaluationSummary, setViewApplicantEvaluationSummary] = useState("");
  const [isLoadingInterviewResults, setIsLoadingInterviewResults] = useState(false);
  const [viewPdfUrl, setViewPdfUrl] = useState<string | null>(null);
  const [acceptEmailModal, setAcceptEmailModal] = useState<Applicant | null>(null);
  const [rejectEmailModal, setRejectEmailModal] = useState<Applicant | null>(null);
  const [hrEmailModal, setHrEmailModal] = useState<Applicant | null>(null);
  const [hrSchedule, setHrSchedule] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successModalStatus, setSuccessModalStatus] = useState<"Accepted" | "Rejected" | "Pending Interview" | "HR Interview" | null>(null);
  const [emailMessage, setEmailMessage] = useState("");
  const [rejectMessage, setRejectMessage] = useState("");
  const [hrEmailMessage, setHrEmailMessage] = useState("");
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
    if (status === "Interview Completed") return "Proceed to HR Interview";
    if (status === "Pending Interview") return "AI Screening Sent";
    if (status === "Accepted") return "Proceed to HR Interview";
    if (status === "HR Interview") return "HR Interview Scheduled";
    if (status === "Rejected") return "Rejected";
    return "Send Email for AI Screening";
  };

  const canSendAiScreeningEmail = (status: string) => ["New", "Reviewed"].includes(status);
  const canAcceptCompletedApplicant = (status: string) => status === "Interview Completed";
  const isPrimaryApplicantActionEnabled = (status: string) =>
    canSendAiScreeningEmail(status) || canAcceptCompletedApplicant(status);
  const canRejectAfterInterview = (status: string) => status !== "Rejected";

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

  // Reset to page 1 whenever filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredApplicants.length / PAGE_SIZE));
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const applicantStats = useMemo(() => {
    const screeningQueue = applicants.filter((entry) => entry.status === "Pending Interview").length;
    const interviewCompleted = applicants.filter((entry) => entry.status === "Interview Completed").length;
    const accepted = applicants.filter((entry) => entry.status === "Accepted").length;
    const underReview = applicants.filter((entry) => ["New", "Reviewed"].includes(entry.status)).length;

    return {
      total: applicants.length,
      screeningQueue,
      interviewCompleted,
      accepted,
      underReview,
    };
  }, [applicants]);

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
      ? `Congratulations! We are pleased to move forward with your application for the ${applicant.position} role at Lifewood.\n\nYour AI screening has been reviewed successfully, and we are happy to inform you that you have passed this stage.\n\nOur team will contact you soon with the next steps.`
      : `Dear ${applicant.first_name},\n\nThank you for applying for the ${applicant.position} role at Lifewood.\n\nWe would like to invite you to complete the AI screening interview as the next step in our hiring process.\n\nPlease click the interview link below and complete the screening at your earliest convenience.\n\nBest regards,\nThe Lifewood Team`;
    setEmailMessage(template);
    setAcceptEmailModal(applicant);
  };

  const openRejectModal = (applicant: Applicant) => {
    const template = `Thank you for completing the AI screening for the ${applicant.position} role at Lifewood.\n\nAfter careful review, we will not be moving forward with your application for this position at this time.\n\nWe appreciate the time and effort you invested in the process, and we encourage you to apply again for future opportunities that match your skills and experience.`;
    setRejectMessage(template);
    setRejectEmailModal(applicant);
  };

  const openHrInterviewModal = (applicant: Applicant) => {
    setHrSchedule("");
    const template = `Dear ${applicant.first_name},\n\nCongratulations! We are pleased to move forward with your application for the ${applicant.position} role at Lifewood. Your AI screening has been reviewed successfully, and you have passed this stage.\n\nWe would like to invite you to a final HR interview with our team.\n\nOur HR department will contact you shortly to schedule the exact date and time.\n\nBest regards,\nThe Lifewood Team`;
    setHrEmailMessage(template);
    setHrEmailModal(applicant);
  };

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSchedule = e.target.value;
    setHrSchedule(newSchedule);
    
    if (!hrEmailModal) return;

    let formattedDate = newSchedule;
    if (newSchedule) {
      const d = new Date(newSchedule);
      if (!Number.isNaN(d.getTime())) {
        formattedDate = d.toLocaleString("en-US", {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short'
        });
      }
    }

    const scheduleText = newSchedule 
      ? `Your HR interview has been scheduled for ${formattedDate} at our office:\nGround Floor i2 Building, Jose Del Mar Street Cebu IT Park, Asia Town, Salinas Drive Apas Lahug, Cebu City, 6000.` 
      : `Our HR department will contact you shortly to schedule the exact date and time.`;

    const template = `Dear ${hrEmailModal.first_name},\n\nCongratulations! We are pleased to move forward with your application for the ${hrEmailModal.position} role at Lifewood. Your AI screening has been reviewed successfully, and you have passed this stage.\n\nWe would like to invite you to a final HR interview with our team.\n\n${scheduleText}\n\nBest regards,\nThe Lifewood Team`;
    
    setHrEmailMessage(template);
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
      const isScreeningEmail = nextStatus === "Pending Interview";
      const configError = getEmailJsConfigError(
        isScreeningEmail
          ? { requireScreeningTemplate: true }
          : { requireDecisionOrScreeningTemplate: true }
      );
      if (configError) throw new Error(configError);
      const emailConfig = getEmailJsConfig();

      const { error } = await supabase
        .from("applicants")
        .update({ status: nextStatus })
        .eq("id", acceptEmailModal.id);

      if (error) throw error;

      const templateId = isScreeningEmail
        ? emailConfig.screeningTemplateId
        : (emailConfig.decisionTemplateId || emailConfig.screeningTemplateId);

      const templateParams = buildEmailTemplateParams({
        applicant: acceptEmailModal,
        message: emailMessage,
        subject: `Update on your application at Lifewood`,
        includeInterviewLink: isScreeningEmail,
      });

      await emailjs.send(
        emailConfig.serviceId,
        templateId,
        templateParams,
        emailConfig.publicKey
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
      const configError = getEmailJsConfigError({
        requireDecisionOrScreeningTemplate: true,
      });
      if (configError) throw new Error(configError);
      const emailConfig = getEmailJsConfig();

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
        emailConfig.serviceId,
        emailConfig.decisionTemplateId || emailConfig.screeningTemplateId,
        templateParams,
        emailConfig.publicKey
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

  const handleSendHrInterview = async () => {
    if (!hrEmailModal) return;
    setIsSending(true);

    try {
      const configError = getEmailJsConfigError({
        requireDecisionOrScreeningTemplate: true,
      });
      if (configError) throw new Error(configError);
      const emailConfig = getEmailJsConfig();

      const { error } = await supabase
        .from("applicants")
        .update({ status: "HR Interview" })
        .eq("id", hrEmailModal.id);

      if (error) throw error;

      const templateParams = buildEmailTemplateParams({
        applicant: hrEmailModal,
        message: hrEmailMessage,
        subject: `Update on your application at Lifewood - HR Interview`,
        includeInterviewLink: false,
      });

      await emailjs.send(
        emailConfig.serviceId,
        emailConfig.decisionTemplateId || emailConfig.screeningTemplateId,
        templateParams,
        emailConfig.publicKey
      );

      setApplicants((prev) =>
        prev.map((a) => (a.id === hrEmailModal.id ? { ...a, status: "HR Interview" } : a))
      );
      if (viewApplicant?.id === hrEmailModal.id) {
        setViewApplicant((prev) => (prev ? { ...prev, status: "HR Interview" } : prev));
      }

      setHrEmailModal(null);
      setSuccessModalStatus("HR Interview");
    } catch (err: any) {
      console.error("EmailJS Error:", err);
      const errorMsg = err.text || err.message || "Unknown error";
      alert("Failed to send HR interview email: " + errorMsg);
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
        <AdminNavigation user={user} activePath={activePath} isRootAdmin={isRootAdmin} />

        <motion.section
          key="admin-applicants-content"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="relative bg-[#f5f8f6] p-5 pt-24 md:p-8 md:pt-28 lg:h-screen lg:overflow-y-auto lg:pt-8"
        >
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-[36px] leading-[0.92] font-black tracking-[-0.03em] text-[#10261d] md:text-[44px]">
                Job Applicants
              </h1>

            </div>
            <button
              type="button"
              onClick={() => void fetchApplicants()}
              disabled={loading}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e4dd] bg-white text-[#25473a] transition-colors hover:bg-[#f0f4f1] disabled:opacity-50"
              title="Refresh Applicants"
            >
              <svg className={`h-4 w-4 text-[#046241] transition-transform group-hover:scale-110 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#ffb5b5] bg-[#fff0f0] px-4 py-3 text-[13px] font-semibold text-[#8a2626] shadow-sm">
              <svg className="h-5 w-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            <PremiumStatCard
              title="Total Applicants"
              value={loading ? "-" : applicantStats.total}
              subtitle={`${applicantStats.underReview} waiting for first review`}
              trend="up"
              trendValue="Pipeline"
            />
            <PremiumStatCard
              title="AI Screening Queue"
              value={loading ? "-" : applicantStats.screeningQueue}
              subtitle="Invited and waiting to complete screening"
              trend={applicantStats.screeningQueue > 0 ? "up" : "neutral"}
              trendValue={applicantStats.screeningQueue > 0 ? "Active" : "Clear"}
            />
            <PremiumStatCard
              title="Interview Completed"
              value={loading ? "-" : applicantStats.interviewCompleted}
              subtitle="Ready for a final admin decision"
              trend="neutral"
              trendValue="Review"
            />
            <PremiumStatCard
              title="Accepted"
              value={loading ? "-" : applicantStats.accepted}
              subtitle="Candidates moved to the next step"
              trend="neutral"
              trendValue="Hired"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e0e9e4] bg-white shadow-sm">
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
                  <option value="HR Interview">HR Interview</option>
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
                    paginatedApplicants.map((entry) => (
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

            {/* Pagination controls */}
            {!loading && filteredApplicants.length > 0 && (
              <div className="flex items-center justify-between gap-3 border-t border-[#ecf2ee] px-4 py-3">
                <p className="text-[12px] font-semibold text-[#1a3326]/55">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredApplicants.length)} of {filteredApplicants.length} applicants
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#d9e6df] bg-white text-[#046241] text-[12px] font-bold disabled:opacity-40 hover:bg-[#f0f7f3] transition-colors"
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 flex items-center justify-center rounded-lg border text-[12px] font-bold transition-colors ${
                        page === currentPage
                          ? "border-[#046241] bg-[#046241] text-white"
                          : "border-[#d9e6df] bg-white text-[#1a3326]/70 hover:bg-[#f0f7f3]"
                      }`}
                      aria-label={`Page ${page}`}
                      aria-current={page === currentPage ? "page" : undefined}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#d9e6df] bg-white text-[#046241] text-[12px] font-bold disabled:opacity-40 hover:bg-[#f0f7f3] transition-colors"
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>

          {viewApplicant && (
            <div className="fixed inset-0 z-[90] bg-[#06140f]/55 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="w-full max-w-[1100px] rounded-2xl border border-[#dbe7e1] bg-white overflow-hidden flex flex-col max-h-[90vh]">
                <div className="shrink-0 flex items-center justify-between border-b border-[#e6eee9] px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#e6f4ea] text-[#046241] flex items-center justify-center text-[18px] font-bold">
                      {viewApplicant.first_name[0]}{viewApplicant.last_name[0]}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#6a7c73] mb-0.5">
                        Applicant Details
                      </p>
                      <h3 className="text-[22px] font-bold text-[#10261d] leading-none">
                        {viewApplicant.first_name} {viewApplicant.last_name}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-4 py-1.5 rounded-full bg-[#e6f4ea] text-[#046241] text-[11px] font-bold">
                      {viewApplicant.status}
                    </span>
                    <button
                      type="button"
                      onClick={closeApplicantDetails}
                      className="h-9 px-5 rounded-full border border-[#d8e5de] text-[12px] font-semibold text-[#1a3326]/70 hover:bg-[#f3f8f5] transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row overflow-hidden flex-1">
                  {/* Left Column (Applicant Details) */}
                  <div className="flex-1 flex flex-col overflow-y-auto p-6 pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px] text-[#163126]">
                      <div className="rounded-xl bg-white border border-[#e6eee9] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#1a3326]/55 mb-1.5">Email</p>
                        <p className="font-semibold">{viewApplicant.email}</p>
                      </div>
                      <div className="rounded-xl bg-white border border-[#e6eee9] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#1a3326]/55 mb-1.5">Phone</p>
                        <p className="font-semibold">{viewApplicant.phone}</p>
                      </div>
                      <div className="rounded-xl bg-white border border-[#e6eee9] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#1a3326]/55 mb-1.5">Gender</p>
                        <p className="font-semibold">{viewApplicant.gender}</p>
                      </div>
                      <div className="rounded-xl bg-white border border-[#e6eee9] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#1a3326]/55 mb-1.5">Age</p>
                        <p className="font-semibold">{viewApplicant.age}</p>
                      </div>
                      <div className="rounded-xl bg-white border border-[#e6eee9] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#1a3326]/55 mb-1.5">Position Applied</p>
                        <p className="font-semibold">{viewApplicant.position}</p>
                      </div>
                      <div className="rounded-xl bg-white border border-[#e6eee9] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#1a3326]/55 mb-1.5">Country</p>
                        <p className="font-semibold">{viewApplicant.country}</p>
                      </div>
                      <div className="rounded-xl bg-white border border-[#e6eee9] p-4 md:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#1a3326]/55 mb-1.5">Address</p>
                        <p className="font-semibold">{viewApplicant.address}</p>
                      </div>

                      <div className="rounded-xl bg-white border border-[#e6eee9] p-4 md:col-span-2 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1a3326]/55 mb-1.5">Uploaded CV</p>
                            <p className="font-semibold truncate max-w-[300px]">{viewApplicant.cv_name}</p>
                          </div>
                          {viewApplicant.cv_url && (
                            <button
                              type="button"
                              onClick={() => setViewPdfUrl(viewApplicant.cv_url)}
                              className="h-9 px-5 rounded-lg bg-[#046241] text-white text-[12px] font-bold transition-colors hover:bg-[#034d33]"
                            >
                              View CV
                            </button>
                          )}
                        </div>

                        {viewApplicant.cv_url && (
                          <button
                            type="button"
                            onClick={() => setViewPdfUrl(viewApplicant.cv_url)}
                            className="relative w-full h-32 rounded-xl border border-[#e6eee9] bg-gradient-to-b from-[#f8faf9] to-[#edf2f0] overflow-hidden group transition-all hover:border-[#046241]/30 hover:shadow-sm flex flex-col items-center justify-center cursor-pointer"
                          >
                            <div className="absolute inset-0 opacity-[0.45] transition-all duration-300 group-hover:blur-[2.5px] pointer-events-none overflow-hidden bg-white blur-[3.5px]">
                              <iframe
                                src={`${viewApplicant.cv_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                className="w-[150%] h-[150%] origin-top-left scale-[0.67] border-none pointer-events-none bg-transparent"
                                title="CV Preview"
                                tabIndex={-1}
                              />
                            </div>

                            <div className="absolute inset-0 bg-white/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full shadow-[0_4px_14px_rgba(4,98,65,0.08)] border border-[#e6eee9]">
                                <svg className="w-4 h-4 text-[#046241]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span className="text-[11px] font-bold text-[#046241] uppercase tracking-wider mt-0.5">Click to preview CV</span>
                              </div>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 border-t border-[#e6eee9]">
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#1a3326]/55">Status</span>
                        <div className="relative">
                          <select
                            value={viewApplicant.status}
                            onChange={(e) => handleUpdateStatus(viewApplicant.id, e.target.value)}
                            disabled={["Pending Interview", "Interview Completed", "Accepted", "HR Interview", "Rejected"].includes(viewApplicant.status)}
                            className={`h-9 appearance-none rounded-lg border border-[#d8e5de] bg-white pl-3 pr-8 text-[12px] font-semibold text-[#163126] outline-none focus:border-[#046241] ${["Pending Interview", "Interview Completed", "Accepted", "HR Interview", "Rejected"].includes(viewApplicant.status) ? "opacity-70 cursor-not-allowed" : ""}`}
                          >
                            <option value="New">New</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Pending Interview">Pending Interview</option>
                            <option value="Interview Completed">Interview Completed</option>
                            <option value="Accepted">Accepted</option>
                            <option value="HR Interview">HR Interview</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#1a3326]/55">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center sm:justify-end gap-3 flex-1">
                        {(viewApplicant.status === "Interview Completed" || viewApplicant.status === "Accepted") ? (
                          <button
                            type="button"
                            onClick={() => openHrInterviewModal(viewApplicant)}
                            className="h-9 px-5 rounded-lg text-[12px] font-bold transition-colors border bg-[#046241] text-white hover:bg-[#034d33] border-transparent"
                          >
                            Proceed to HR Interview
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openAcceptModal(viewApplicant)}
                            disabled={!isPrimaryApplicantActionEnabled(viewApplicant.status)}
                            className={`h-9 px-5 rounded-lg text-[12px] font-bold transition-colors border ${!isPrimaryApplicantActionEnabled(viewApplicant.status)
                              ? "bg-[#f3f8f5] border-[#d8e5de] text-[#869b90] cursor-not-allowed"
                              : "bg-[#046241] text-white hover:bg-[#034d33] border-transparent"
                              }`}
                          >
                            {getPrimaryApplicantActionLabel(viewApplicant.status)}
                          </button>
                        )}
                        {viewApplicant.status !== "Accepted" && viewApplicant.status !== "HR Interview" && (
                          <button
                            type="button"
                            onClick={() => openRejectModal(viewApplicant)}
                            disabled={!canRejectAfterInterview(viewApplicant.status)}
                            className={`h-9 px-5 rounded-lg text-[12px] font-bold transition-colors border ${!canRejectAfterInterview(viewApplicant.status)
                              ? "bg-red-600/5 text-red-600/40 cursor-not-allowed border-red-600/10"
                              : "bg-red-600 text-white hover:bg-red-700 border-transparent"
                              }`}
                          >
                            {viewApplicant.status === "Rejected" ? "Rejected" : "Reject"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(viewApplicant.id)}
                          className="h-9 px-5 rounded-lg bg-red-600/10 border border-transparent text-red-600 text-[12px] font-bold hover:bg-red-600/20 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (AI Interview Result) */}
                  <div className="w-full lg:w-[450px] flex flex-col border-t lg:border-t-0 lg:border-l border-[#e6eee9] p-6 pr-3 overflow-y-auto">
                    <div className="flex items-center justify-between mb-5 shrink-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1a3326]/55">
                          AI Interview Result
                        </h4>
                        {isRefreshingInterviewResults && (
                          <svg className="animate-spin h-3.5 w-3.5 text-[#046241]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#dcfce7] text-[#046241] text-[10px] font-bold">
                        Scored
                      </span>
                    </div>

                    <div className="flex flex-col flex-1">
                      <div className="mb-6 shrink-0">
                        <div className="flex items-center gap-5 mb-4 col-span-1 border-b border-transparent">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[52px] font-black text-[#10261d] leading-none tracking-tight">
                              {viewApplicantScore !== null ? viewApplicantScore : isInitialInterviewResultLoad ? "..." : "-"}
                            </span>
                            <div className="flex items-baseline gap-1 pt-3 h-full">
                              <span className="text-[20px] font-bold text-[#6a7c73] leading-none">/</span>
                              <span className="text-[16px] font-bold text-[#6a7c73] leading-none">100</span>
                            </div>
                          </div>

                          <div className="flex-1 h-3 bg-[#e6eee9] rounded-full overflow-hidden self-center ml-2 max-w-[200px]">
                            <div
                              className="h-full bg-[#046241] rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, viewApplicantScore || 0))}%` }}
                            ></div>
                          </div>
                        </div>

                        <p className="text-[13px] text-[#1a3326]/78 leading-relaxed">
                          {viewApplicantEvaluationSummary ||
                            (isInitialInterviewResultLoad
                              ? "Loading the applicant's saved interview result."
                              : hasInterviewTranscript
                                ? "The interview transcript is saved for this applicant."
                                : "The applicant's interview transcript and score will appear here after the AI interview is saved.")}
                        </p>
                      </div>

                      {isInitialInterviewResultLoad ? (
                        <div className="rounded-xl border border-[#e6eee9] bg-[#f8faf9] p-4 text-[13px] text-[#1a3326]/65 shrink-0">
                          Loading interview results...
                        </div>
                      ) : hasInterviewTranscript ? (
                        <div className="space-y-5 shrink-0">
                          {viewApplicantResults.map((msg, idx) => {
                            const isAgent = msg.role === 'model' || msg.role === 'assistant';
                            return (
                              <div key={idx} className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
                                <p className={`text-[10px] font-bold uppercase tracking-wider text-[#1a3326]/55 mb-1.5 ${isAgent ? 'ml-1' : 'mr-1'}`}>
                                  {isAgent ? 'AI Agent' : 'Applicant'}
                                </p>
                                <div className={`max-w-[90%] px-5 py-4 text-[13px] leading-relaxed border ${isAgent
                                  ? 'bg-white border-[#e6eee9] text-[#163126] rounded-2xl'
                                  : 'bg-[#046241] border-transparent text-white rounded-2xl'
                                  }`}>
                                  <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-[#d7e8df] bg-[#fbfdfc] p-4 text-[13px] text-[#1a3326]/65 shrink-0">
                          No interview result is available for this applicant yet.
                        </div>
                      )}
                    </div>
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
                    Close
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

          {hrEmailModal && (
            <div className="fixed inset-0 z-[100] bg-[#06140f]/75 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="w-full max-w-[600px] rounded-2xl border border-[#dbe7e1] bg-white overflow-hidden shadow-2xl">
                <div className="px-5 py-4 border-b border-[#e0e9e4] flex items-center justify-between bg-[#fcfdfc]">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#046241] mb-1">
                      Send Update
                    </p>
                    <h3 className="text-[18px] font-black tracking-[-0.02em] text-[#10261d]">
                      Invite {hrEmailModal.first_name} to HR Interview
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHrEmailModal(null)}
                    disabled={isSending}
                    className="h-9 px-4 rounded-xl border border-[#d8e5de] text-[11px] font-black uppercase tracking-[0.1em] text-[#1a3326]/70 hover:bg-[#f3f8f5] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-[12px] text-[#1a3326]/70 mb-3">
                    Review the HR interview invitation email below before sending.
                  </p>

                  <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.1em] text-[#1a3326]/60 mb-1.5">
                        To:
                      </label>
                      <div className="h-10 px-3 flex items-center rounded-lg border border-[#e0e9e4] bg-[#f7faf8] text-[13px] font-medium text-[#10261d]">
                        {hrEmailModal.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.1em] text-[#1a3326]/60 mb-1.5 flex items-center justify-between">
                        <span>Schedule:</span>
                        <span className="text-[9px] text-[#1a3326]/40">(Optional)</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={hrSchedule}
                        onChange={handleScheduleChange}
                        className="h-10 w-full px-3 rounded-lg border border-[#d8e5de] bg-white text-[13px] font-medium text-[#163126] outline-none focus:border-[#046241]"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.1em] text-[#1a3326]/60 mb-1.5">
                      Message:
                    </label>
                    <textarea
                      value={hrEmailMessage}
                      onChange={(e) => setHrEmailMessage(e.target.value)}
                      className="w-full h-48 rounded-xl border border-[#d8e5de] bg-white p-3 text-[13px] text-[#163126] outline-none focus:border-[#046241] resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-2">
                    <button
                      type="button"
                      onClick={handleSendHrInterview}
                      disabled={isSending || !hrEmailMessage.trim()}
                      className="h-10 px-6 rounded-xl bg-[#046241] text-white text-[11px] font-black uppercase tracking-[0.1em] shadow-[0_4px_14px_rgba(4,98,65,0.25)] hover:bg-[#034d33] transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSending ? (
                        "Sending..."
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send Email & Proceed
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
                  <div className={`w-14 h-14 rounded-full border flex items-center justify-center mb-4 ${successModalStatus === "Accepted" || successModalStatus === "Pending Interview" || successModalStatus === "HR Interview"
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
                        : successModalStatus === "HR Interview"
                          ? "The HR interview invitation email has been sent. Their status is now \"HR Interview\"."
                          : "The rejection email has been sent to the applicant. Their status is now \"Rejected\"."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccessModalStatus(null)}
                    className={`w-full h-10 rounded-xl text-white text-[11px] font-black uppercase tracking-[0.1em] transition-colors shadow-[0_4px_14px_rgba(4,98,65,0.25)] ${successModalStatus === "Accepted" || successModalStatus === "Pending Interview" || successModalStatus === "HR Interview"
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
