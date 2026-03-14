import React, { useEffect, useMemo, useState } from "react";
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

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "User Management", path: "/admin/users" },
  { label: "Applicants", path: "/admin/applicants" },
  { label: "Analytics", path: "/admin/analytics" },
];

function navigate(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function statusPillClass(status: string) {
  if (status === "Reviewed") return "bg-[#e6f7ef] text-[#046241]";
  if (status === "New") return "bg-[#fff4e5] text-[#915700]";
  if (status === "Rejected") return "bg-[#ffe9e9] text-[#9f2424]";
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
  const [viewPdfUrl, setViewPdfUrl] = useState<string | null>(null);
  const [acceptEmailModal, setAcceptEmailModal] = useState<Applicant | null>(null);
  const [rejectEmailModal, setRejectEmailModal] = useState<Applicant | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successModalStatus, setSuccessModalStatus] = useState<"Accepted" | "Rejected" | null>(null);
  const [emailMessage, setEmailMessage] = useState("");
  const [rejectMessage, setRejectMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pendingReviewId, setPendingReviewId] = useState<string | null>(null);
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

  const fetchApplicants = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("applicants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplicants(data || []);
    } catch (err: any) {
      if (err.message && err.message.includes("does not exist")) {
        setError("Applicants table does not exist. Please run the SQL setup script.");
      } else {
        setError(err.message || "Failed to load applicants.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canManage) return;
    void fetchApplicants();
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

  const openApplicantDetails = (applicant: Applicant) => {
    setViewApplicant(applicant);
    setPendingReviewId(applicant.status === "New" ? applicant.id : null);
  };

  const closeApplicantDetails = () => {
    if (pendingReviewId && viewApplicant?.id === pendingReviewId && viewApplicant.status === "New") {
      void handleUpdateStatus(pendingReviewId, "Reviewed");
    }
    setViewApplicant(null);
    setPendingReviewId(null);
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
    const template = `Dear ${applicant.first_name},\n\nCongratulations! We are pleased to accept your application for the ${applicant.position} role at Lifewood.\n\nPlease reply to this email to confirm your acceptance. We look forward to working with you!\n\nBest regards,\nThe Lifewood Team`;
    setEmailMessage(template);
    setAcceptEmailModal(applicant);
  };

  const openRejectModal = (applicant: Applicant) => {
    const template = `Dear ${applicant.first_name},\n\nThank you for your interest in the ${applicant.position} role at Lifewood. After careful consideration, we will not be moving forward with your application at this time.\n\nWe appreciate the time you took to apply and encourage you to apply again in the future.\n\nBest regards,\nThe Lifewood Team`;
    setRejectMessage(template);
    setRejectEmailModal(applicant);
  };

  const handleSendAcceptance = async () => {
    if (!acceptEmailModal) return;
    setIsSending(true);

    try {
      // 1. Update the status to 'Accepted' in DB
      const { error } = await supabase
        .from("applicants")
        .update({ status: "Accepted" })
        .eq("id", acceptEmailModal.id);

      if (error) throw error;

      // 2. Call EmailJS to send the email directly from the browser
      // NOTE: You must replace these placeholders with your actual EmailJS IDs!
      const EMAILJS_SERVICE_ID = "service_cpyba2r";
      const EMAILJS_TEMPLATE_ID = "template_qbegp0m";
      const EMAILJS_PUBLIC_KEY = "bbHE7xH3WprnKw8i8";

      const templateParams = {
        to_email: acceptEmailModal.email,
        to_name: acceptEmailModal.first_name,
        message: emailMessage,
        subject: `Update on your application at Lifewood`
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setApplicants((prev) =>
        prev.map((a) => (a.id === acceptEmailModal.id ? { ...a, status: "Accepted" } : a))
      );
      if (viewApplicant?.id === acceptEmailModal.id) {
        setViewApplicant((prev) => (prev ? { ...prev, status: "Accepted" } : prev));
      }

      setAcceptEmailModal(null);
      setSuccessModalStatus("Accepted");
    } catch (err: any) {
      console.error("EmailJS Error:", err);
      const errorMsg = err.text || err.message || "Unknown error";
      alert("Failed to send acceptance: " + errorMsg);
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
      const EMAILJS_SERVICE_ID = "service_cpyba2r";
      const EMAILJS_REJECTION_TEMPLATE_ID = "template_qbegp0m";
      const EMAILJS_PUBLIC_KEY = "bbHE7xH3WprnKw8i8";

      const templateParams = {
        to_email: rejectEmailModal.email,
        to_name: rejectEmailModal.first_name,
        message: rejectMessage,
        subject: `Update on your application at Lifewood`
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_REJECTION_TEMPLATE_ID,
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
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
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
                        disabled={viewApplicant.status === "Accepted" || viewApplicant.status === "Rejected"}
                        title={
                          viewApplicant.status === "Accepted" || viewApplicant.status === "Rejected"
                            ? "Status is locked after a final decision."
                            : undefined
                        }
                        className={`h-9 rounded-lg border border-[#d8e5de] bg-white px-3 text-[12px] font-semibold text-[#163126] outline-none focus:border-[#046241] ${
                          viewApplicant.status === "Accepted" || viewApplicant.status === "Rejected"
                            ? "opacity-70 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2 mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openAcceptModal(viewApplicant)}
                        disabled={viewApplicant.status === "Accepted"}
                        className={`h-10 px-6 rounded-lg text-[11px] font-black uppercase tracking-[0.1em] transition-colors ${
                          viewApplicant.status === "Accepted"
                            ? "bg-[#e0e9e4] text-[#869b90] cursor-not-allowed"
                            : "bg-[#046241] text-white hover:bg-[#034d33]"
                        }`}
                      >
                        {viewApplicant.status === "Accepted" ? "Accepted" : "Accept Applicant"}
                      </button>
                      <button
                        type="button"
                        onClick={() => openRejectModal(viewApplicant)}
                        disabled={viewApplicant.status === "Rejected" || viewApplicant.status === "Accepted"}
                        className={`h-10 px-6 rounded-lg text-[11px] font-black uppercase tracking-[0.1em] transition-colors ${
                          viewApplicant.status === "Rejected" || viewApplicant.status === "Accepted"
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
                      Send Offer
                    </p>
                    <h3 className="text-[18px] font-black tracking-[-0.02em] text-[#10261d]">
                      Accept {acceptEmailModal.first_name}
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
                    Edit the acceptance email below before sending.
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
                          Send Email & Accept
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
                  <div className={`w-14 h-14 rounded-full border flex items-center justify-center mb-4 ${
                    successModalStatus === "Accepted"
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
                    {successModalStatus === "Accepted"
                      ? "The acceptance email has been instantly delivered to the applicant. Their status is now \"Accepted\"."
                      : "The rejection email has been instantly delivered to the applicant. Their status is now \"Rejected\"."
                    }
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccessModalStatus(null)}
                    className={`w-full h-10 rounded-xl text-white text-[11px] font-black uppercase tracking-[0.1em] transition-colors shadow-[0_4px_14px_rgba(4,98,65,0.25)] ${
                      successModalStatus === "Accepted"
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
