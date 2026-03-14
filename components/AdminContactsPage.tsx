import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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

type ContactEntry = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
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

export default function AdminContactsPage() {
  const [user, setUser] = useState<AuthUser | null>(() => getAuthUser());
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname.replace(/\/+$/, ""));
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewContact, setViewContact] = useState<ContactEntry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [pendingReviewId, setPendingReviewId] = useState<string | null>(null);

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

  const fetchContacts = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setContacts((data || []) as ContactEntry[]);
    } catch (err: any) {
      if (err.message && err.message.includes("does not exist")) {
        setError("Contacts table does not exist. Please run the SQL setup script.");
      } else {
        setError(err.message || "Failed to load contacts.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canManage) return;
    void fetchContacts();
  }, [canManage]);

  const filteredContacts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter(
      (entry) =>
        entry.name.toLowerCase().includes(query) ||
        entry.email.toLowerCase().includes(query) ||
        entry.message.toLowerCase().includes(query)
    );
  }, [searchTerm, contacts]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("contacts")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
      setContacts((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, status: newStatus } : entry))
      );
      if (viewContact?.id === id) {
        setViewContact((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const openContactDetails = (contact: ContactEntry) => {
    setViewContact(contact);
    setPendingReviewId(contact.status === "New" ? contact.id : null);
  };

  const closeContactDetails = () => {
    if (pendingReviewId && viewContact?.id === pendingReviewId && viewContact.status === "New") {
      void handleUpdateStatus(pendingReviewId, "Reviewed");
    }
    setViewContact(null);
    setPendingReviewId(null);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const { error } = await supabase.from("contacts").delete().eq("id", deleteConfirmId);
      if (error) throw error;
      setContacts((prev) => prev.filter((entry) => entry.id !== deleteConfirmId));
      if (viewContact?.id === deleteConfirmId) {
        setViewContact(null);
      }
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert("Failed to delete contact: " + err.message);
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

  const handleLogout = async () => {
    await logoutAuth();
    navigate("/login");
  };

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
                  className={`w-full text-left h-10 rounded-xl px-3 text-[12px] font-semibold transition-colors ${
                    isActive
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
            onClick={handleLogout}
            className="mt-4 w-full h-10 rounded-xl border border-[#FFB347]/40 text-[#FFB347]
                       text-[11px] font-black uppercase tracking-[0.12em]
                       hover:bg-[#FFB347]/10 transition-colors"
          >
            Log out
          </button>
        </aside>

        <motion.section
          key="admin-contacts-content"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="p-5 md:p-7 bg-[#f7faf8] lg:h-screen overflow-y-auto"
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-[40px] leading-[0.98] font-black tracking-[-0.03em] text-[#10261d]">
                Contact Requests
              </h1>
              <p className="text-[12px] text-[#1a3326]/55 mt-1">
                Submissions from the Contact Us form
              </p>
            </div>
            <button
              type="button"
              onClick={() => void fetchContacts()}
              className="h-9 px-4 rounded-full border border-[#d7e4dd] bg-white text-[10px] font-black uppercase tracking-[0.12em] text-[#25473a]"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-[#ffb5b5] bg-[#fff0f0] px-3.5 py-2.5 text-[12px] font-semibold text-[#8a2626]">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-[#e0e9e4] bg-white overflow-hidden">
            <div className="px-4 py-3.5 border-b border-[#ecf2ee] flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[22px] font-black text-[#10261d]">All Contacts</h2>
              <div className="h-9 w-full sm:w-[260px] rounded-lg border border-[#d9e6df] bg-[#f9fbfa] px-3 flex items-center">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search name, email, message"
                  className="w-full bg-transparent outline-none text-[13px] placeholder:text-[#1a3326]/45"
                />
              </div>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="rounded-xl border border-[#ecf1ee] bg-[#f9fbfa] px-4 py-6 text-[13px] text-[#1a3326]/55">
                  Loading contacts...
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="rounded-xl border border-[#ecf1ee] bg-[#f9fbfa] px-4 py-6 text-[13px] text-[#1a3326]/55">
                  No contact requests found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredContacts.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => openContactDetails(entry)}
                      className="text-left rounded-2xl border border-[#e0e9e4] bg-white p-4 hover:border-[#046241]/40 hover:shadow-[0_12px_30px_rgba(4,98,65,0.08)] transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[13px] font-black uppercase tracking-[0.16em] text-[#6a7c73]">
                            Contact
                          </p>
                          <p className="text-[16px] font-bold text-[#0f2318] mt-2">
                            {entry.name}
                          </p>
                          <p className="text-[12px] text-[#1a3326]/60">{entry.email}</p>
                        </div>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${statusPillClass(entry.status)}`}>
                          {entry.status}
                        </span>
                      </div>
                      <p className="mt-3 text-[12px] text-[#1a3326]/70 line-clamp-3">
                        {entry.message}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.12em] text-[#1a3326]/45">
                        <span>{formatDate(entry.created_at)}</span>
                        <span className="text-[#046241]">View details</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {viewContact && (
            <div className="fixed inset-0 z-[90] bg-[#06140f]/55 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="w-full max-w-[680px] rounded-2xl border border-[#dbe7e1] bg-white p-5 md:p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6a7c73] mb-1">
                      Contact Details
                    </p>
                    <h3 className="text-[24px] font-black tracking-[-0.02em] text-[#10261d]">
                      {viewContact.name}
                    </h3>
                    <p className="text-[12px] text-[#1a3326]/60">{viewContact.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeContactDetails}
                    className="h-9 px-4 rounded-xl border border-[#d8e5de] text-[11px] font-black uppercase tracking-[0.1em] text-[#1a3326]/70 hover:bg-[#f3f8f5]"
                  >
                    Close
                  </button>
                </div>

                <div className="rounded-xl border border-[#e6eee9] bg-white p-4 text-[13px] text-[#163126]">
                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55 mb-2">
                    Message
                  </p>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
                    {viewContact.message}
                  </p>
                </div>

                <div className="mt-4 rounded-xl border border-[#e6eee9] bg-white p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#1a3326]/55">
                    Status
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${statusPillClass(viewContact.status)}`}>
                      {viewContact.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleDelete(viewContact.id)}
                    className="h-9 px-4 rounded-lg bg-red-600/10 text-red-600 text-[11px] font-black uppercase tracking-[0.1em] hover:bg-red-600/20 transition-colors"
                  >
                    Delete Contact
                  </button>
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
                    Delete Contact?
                  </h3>
                  <p className="text-[13px] text-[#1a3326]/70 mb-6">
                    Are you sure you want to permanently delete this contact message? This action cannot be undone.
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
        </motion.section>
      </section>
    </main>
  );
}
