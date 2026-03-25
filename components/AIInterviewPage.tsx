import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface TranscriptEntry {
  role: string;
  text: string;
}

interface InterviewEvaluation {
  score: number;
  summary: string;
}

interface ApplicantInterviewAccess {
  firstName: string;
  applicantName: string;
  email: string;
  status: string;
  interviewLocked: boolean;
  createdAt: string;
  appliedPosition: string;
}

type CompletionReason = 'done' | 'timeout' | 'already_done';

// ─── Constants ───────────────────────────────────────────────────────────────

const EASE = [0.16, 1, 0.3, 1] as const;
const INTERVIEW_BOOTSTRAP_PROMPT = "Please begin the interview by introducing yourself according to your instructions.";
const SCORE_METADATA_ROLE = "system_score_meta";
const GEMINI_PROXY_URL = "/api/gemini";
const INTERVIEW_COMPLETION_URL = "/api/interview-complete";
const INTERVIEW_APPLICANT_URL = "/api/interview-applicant";
const AI_UNAVAILABLE_MESSAGE = "The AI interview is temporarily unavailable. Please try again later.";
const INTERVIEW_DURATION_SECONDS = 15 * 60;
const LINK_EXPIRY_HOURS = 24;

// ─── System Instructions ─────────────────────────────────────────────────────

const SYSTEM_INSTRUCTION = `You are an AI Recruitment Interview Agent integrated into a hiring platform.

Your job is to conduct a short and structured interview with a job applicant.
The applicant has already passed the initial screening stage and opened the AI interview link from the acceptance email.

Your responsibilities:
- Conduct a professional interview
- Ask short and clear questions
- Keep the conversation friendly
- Stay focused on the interview flow

INTERVIEW RULES
1. Ask only one question at a time.
2. Wait for the applicant's answer before asking the next question.
3. Conduct exactly 3 interview questions.
4. Keep every greeting, acknowledgement, and question short.
5. Do not ask follow-up questions.
6. Do not criticize or correct the applicant's grammar.
7. ACCEPT MOST ANSWERS: Be very lenient with what you consider a valid answer. As long as the applicant makes a genuine attempt to answer, even if brief, imperfect, or short, accept it and move to the next question. Only reject answers if they are completely nonsensical or wildly off-topic.

INTERVIEW FLOW
Start with this exact opening message:
"Hello and welcome to the AI interview.
I will ask you 3 short questions.
Please answer as clearly as you can."

QUESTION STRUCTURE
Ask these exact questions in this exact order:
Question 1: "1. Please introduce yourself briefly."
Question 2: "2. What experience or skills can help you in this role?"
Question 3: "3. Tell me about a challenge you faced and how you handled it."

FORMATTING RULES
- Always put the acknowledgement on its own line, then leave a blank line, then put the question on a new line.
- Example format for questions 2 and 3:
  "Thank you for sharing.\n\n2. What experience or skills can help you in this role?"
- This blank line separation is important for readability.

CONVERSATION GUIDELINES
- Keep your responses short.
- Use only a brief acknowledgement before question 2 and question 3 if the previous answer was valid.
- Example acknowledgements: "Thank you." or "Thanks for sharing."
- Stay polite, warm, and professional.
- Do not be strict with the applicant's wording, grammar, or depth.
- Only redirect if the answer is completely irrelevant or wildly off-topic.
- Move forward in the QUESTION STRUCTURE as long as the answer is even loosely related.

INTERVIEW COMPLETION
After the applicant answers the third question with a relevant response, end with this exact message:
"Thank you for completing the AI interview.
Your responses have been recorded and will be reviewed by our recruitment team.
If you are selected for the next step, we will contact you soon.
Have a great day! 😊"
Append the exact token "[END_INTERVIEW]" to the very end of your final message.

IMPORTANT BEHAVIOR
- Never exceed 3 valid questions.
- Do not skip questions.
- Always continue the flow in order, but ONLY after receiving a loosely relevant answer.
- Keep the interview simple, short, and easy for the applicant.`;

function buildInterviewSystemInstruction(applicantName?: string | null, appliedPosition?: string | null) {
  const normalizedName = (applicantName || "").trim();
  const normalizedPosition = (appliedPosition || "").trim();
  const openingMessage = normalizedName
    ? `Hello, ${normalizedName}. Welcome to the AI interview.\nI will ask you 3 short questions.\nPlease answer as clearly as you can.`
    : `Hello and welcome to the AI interview.\nI will ask you 3 short questions.\nPlease answer as clearly as you can.`;

  return `${SYSTEM_INSTRUCTION}

ADDITIONAL PERSONALIZATION RULES
- The applicant's name is ${normalizedName || "not available"}.
- The position they applied for is: ${normalizedPosition || "not specified"}.
- If the applicant's name is available, use it naturally in the opening greeting.
- You may reference their applied position when relevant (e.g., when asking about experience/skills).
- Replace the generic opening with this exact opening message:
"${openingMessage}"`;
}

const SCORING_SYSTEM_INSTRUCTION = `You are an AI interview evaluator for a recruitment platform.

Review only the applicant's answers from a completed 3-question interview.
Score the applicant from 1 to 100 based on:
1. Fit for the role based on relevance of the answers
2. Appropriateness and completeness of the answers
3. Professionalism, clarity, and communication quality

Scoring guidance:
- 90-100: Excellent, highly relevant, polished, and professional
- 75-89: Strong and suitable, with clear and professional answers
- 60-74: Acceptable but somewhat generic, incomplete, or uneven
- 40-59: Weak relevance, weak clarity, or unprofessional tone
- 1-39: Very poor, irrelevant, inappropriate, or extremely unclear

Return valid JSON only using this exact shape:
{"score": 84, "summary": "Short summary mentioning fit, appropriateness, and professionalism."}`;

// ─── Utility ─────────────────────────────────────────────────────────────────

function clampScore(score: number) {
  return Math.max(1, Math.min(100, Math.round(score)));
}

function formatTranscript(history: { role: string; parts: { text: string }[] }[]): TranscriptEntry[] {
  return history.map((item) => ({ role: item.role, text: item.parts[0]?.text || "" }));
}

function getApplicantAnswers(transcript: TranscriptEntry[]) {
  return transcript.filter(
    (entry) => entry.role === "user" && entry.text.trim() && entry.text !== INTERVIEW_BOOTSTRAP_PROMPT
  );
}

function buildLocalInterviewEvaluation(transcript: TranscriptEntry[]): InterviewEvaluation {
  const answers = getApplicantAnswers(transcript).map((e) => e.text);
  const combined = answers.join(" ");
  const words = combined.match(/\b[\w'-]+\b/g) || [];
  const total = words.length;
  const avg = answers.length ? total / answers.length : 0;
  const fit = ["experience","skills","background","project","team","role","position","customer","data","operations","support"].filter(k => combined.toLowerCase().includes(k)).length;
  const prob = ["problem","challenge","solve","solved","solution","resolved","improved","approach","result","outcome"].filter(k => combined.toLowerCase().includes(k)).length;
  const prof = ["professional","responsible","collaborated","communicated","managed","delivered","organized","reliable"].filter(k => combined.toLowerCase().includes(k)).length;
  const shorts = answers.filter(a => (a.match(/\b[\w'-]+\b/g)||[]).length < 8).length;
  let score = 35 + Math.min(20, total * 0.22) + Math.min(15, avg * 0.4) + Math.min(12, fit * 3) + Math.min(10, prob * 2.5) + Math.min(8, prof * 2) - shorts * 6;
  if (answers.length < 3) score -= 12;
  const s = clampScore(score);
  const summary = s >= 90 ? "Excellent with strong role fit and professional communication."
    : s >= 75 ? "Strong performance with relevant answers and professional tone."
    : s >= 60 ? "Acceptable but some answers could be more specific."
    : s >= 40 ? "Below-average with limited relevance or depth."
    : "Weak performance due to unclear or incomplete answers.";
  return { score: s, summary };
}

function parseInterviewEvaluation(rawText: string): InterviewEvaluation | null {
  const m = rawText.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const p = JSON.parse(m[0]);
    if (typeof p?.score !== "number" || typeof p?.summary !== "string") return null;
    return { score: clampScore(p.score), summary: p.summary.trim() };
  } catch { return null; }
}

async function callGeminiApi(payload: unknown) {
  const r = await fetch(GEMINI_PROXY_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const text = await r.text();
  let data: any = null;
  if (text) { try { data = JSON.parse(text); } catch { data = null; } }
  if (!r.ok) throw new Error(data?.error?.message || data?.message || AI_UNAVAILABLE_MESSAGE);
  if (!data) throw new Error(AI_UNAVAILABLE_MESSAGE);
  return data;
}

async function fetchApplicantAccess(applicantId: string): Promise<ApplicantInterviewAccess> {
  const r = await fetch(`${INTERVIEW_APPLICANT_URL}?applicantId=${encodeURIComponent(applicantId)}`);
  const text = await r.text();
  let data: any = null;
  if (text) { try { data = JSON.parse(text); } catch { data = null; } }
  if (!r.ok) throw new Error(data?.message || "Failed to load applicant details.");
  return {
    firstName: String(data?.firstName || "").trim(),
    applicantName: String(data?.applicantName || "").trim(),
    email: String(data?.email || "").trim(),
    status: String(data?.status || "").trim(),
    interviewLocked: Boolean(data?.interviewLocked),
    createdAt: String(data?.createdAt || "").trim(),
    appliedPosition: String(data?.appliedPosition || "").trim(),
  };
}

async function completeInterviewOnServer(applicantId: string, storedTranscript: TranscriptEntry[], evaluation: InterviewEvaluation) {
  const r = await fetch(INTERVIEW_COMPLETION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ applicantId, qaTranscript: storedTranscript, interviewScore: evaluation.score, evaluationSummary: evaluation.summary }),
  });
  const text = await r.text();
  let data: any = null;
  if (text) { try { data = JSON.parse(text); } catch { data = null; } }
  if (!r.ok) throw new Error(data?.message || "Failed to finalize the interview.");
  return { savedInterviewResult: data?.savedInterviewResult !== false };
}

async function generateInterviewEvaluation(transcript: TranscriptEntry[]): Promise<InterviewEvaluation> {
  const answers = getApplicantAnswers(transcript);
  const fallback = buildLocalInterviewEvaluation(transcript);
  if (!answers.length) return fallback;
  try {
    const payload = {
      systemInstruction: { role: "system", parts: [{ text: SCORING_SYSTEM_INSTRUCTION }] },
      contents: [{ role: "user", parts: [{ text: `Evaluate this transcript:\n\n${JSON.stringify(answers, null, 2)}` }] }],
      generationConfig: { temperature: 0.1 },
    };
    const data = await callGeminiApi(payload);
    return parseInterviewEvaluation(data.candidates?.[0]?.content?.parts?.[0]?.text || "") || fallback;
  } catch { return fallback; }
}

function buildStoredTranscript(transcript: TranscriptEntry[], evaluation: InterviewEvaluation): TranscriptEntry[] {
  return [
    { role: SCORE_METADATA_ROLE, text: JSON.stringify({ interviewScore: evaluation.score, evaluationSummary: evaluation.summary }) },
    ...transcript.filter(e => !(e.role === "user" && e.text === INTERVIEW_BOOTSTRAP_PROMPT)),
  ];
}

async function saveInterviewResult(applicantId: string, storedTranscript: TranscriptEntry[], evaluation: InterviewEvaluation) {
  const payload = { applicant_id: applicantId, qa_transcript: storedTranscript, interview_score: evaluation.score, evaluation_summary: evaluation.summary };
  const { error: ie } = await supabase.from("interview_results").insert(payload);
  if (!ie) return;
  const { error: ue } = await supabase.from("interview_results").update({ qa_transcript: storedTranscript, interview_score: evaluation.score, evaluation_summary: evaluation.summary }).eq("applicant_id", applicantId);
  if (!ue) return;
  throw ue;
}

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

// ─── Formatted AI message renderer ──────────────────────────────────────────
// Splits on \n so acknowledgements and questions appear on separate lines.

function AiMessageContent({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <span>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < lines.length - 1 && line.trim() === '' ? (
            <span className="block mb-1" />
          ) : i < lines.length - 1 ? (
            <br />
          ) : null}
        </React.Fragment>
      ))}
    </span>
  );
}

// ─── Overlay Modal ────────────────────────────────────────────────────────────

function OverlayModal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 16 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="w-full max-w-lg"
      >
        {children}
      </motion.div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AIInterviewPage() {
  const applicantId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() || null : null;

  const [applicantName, setApplicantName] = useState('');
  const [appliedPosition, setAppliedPosition] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [linkExpired, setLinkExpired] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string; parts: { text: string }[] }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [timeLeft, setTimeLeft] = useState(INTERVIEW_DURATION_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionReason, setCompletionReason] = useState<CompletionReason>('done');

  const timeoutSavedRef = useRef(false);
  const chatHistoryRef = useRef<{ role: string; parts: { text: string }[] }[]>([]);

  useEffect(() => { chatHistoryRef.current = chatHistory; }, [chatHistory]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  // ── Timer countdown ──
  useEffect(() => {
    if (!timerActive) return;
    timerRef.current = setInterval(() => setTimeLeft(p => p <= 1 ? 0 : p - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  // ── Handle timer hitting 0 ──
  useEffect(() => {
    if (timeLeft === 0 && timerActive && !interviewComplete && !timeoutSavedRef.current) {
      timeoutSavedRef.current = true;
      setTimerActive(false);
      setInterviewComplete(true);
      setCompletionReason('timeout');
      setShowCompletionModal(true);
      if (applicantId && chatHistoryRef.current.length > 0) {
        const qa = formatTranscript(chatHistoryRef.current);
        generateInterviewEvaluation(qa).then(ev => {
          const stored = buildStoredTranscript(qa, ev);
          return completeInterviewOnServer(applicantId, stored, ev).catch(() => saveInterviewResult(applicantId, stored, ev));
        }).catch(e => console.error("Timeout save failed:", e));
      }
    }
  }, [timeLeft, timerActive, interviewComplete, applicantId]);

  // ── Load applicant data ──
  useEffect(() => {
    const init = async () => {
      if (!applicantId) { setPageLoading(false); return; }
      try {
        const access = await fetchApplicantAccess(applicantId);
        setApplicantName(access.firstName || access.applicantName);
        setAppliedPosition(access.appliedPosition);

        if (access.createdAt) {
          const elapsed = Date.now() - new Date(access.createdAt).getTime();
          if (elapsed > LINK_EXPIRY_HOURS * 3600 * 1000) { setLinkExpired(true); setPageLoading(false); return; }
        }

        if (access.interviewLocked) {
          setCompletionReason('already_done');
          setShowCompletionModal(true);
          setInterviewComplete(true);
          setPageLoading(false);
          return;
        }

        setShowInstructions(true);
      } catch (err) {
        console.error("Init error:", err);
        setShowInstructions(true);
      } finally {
        setPageLoading(false);
      }
    };
    init();
  }, [applicantId]);

  // ── Start interview ──
  const startInterview = useCallback(async () => {
    setShowInstructions(false);
    setInterviewStarted(true);
    setTimerActive(true);
    setIsTyping(true);
    try {
      const payload = {
        systemInstruction: { role: "system", parts: [{ text: buildInterviewSystemInstruction(applicantName, appliedPosition) }] },
        contents: [{ role: "user", parts: [{ text: INTERVIEW_BOOTSTRAP_PROMPT }] }],
        generationConfig: { temperature: 0.2 },
      };
      const data = await callGeminiApi(payload);
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hello. Are you ready to begin the interview?";
      setMessages([{ id: Date.now().toString(), role: 'assistant', content: text }]);
      setChatHistory([
        { role: "user", parts: [{ text: INTERVIEW_BOOTSTRAP_PROMPT }] },
        { role: "model", parts: [{ text }] },
      ]);
    } catch (err: any) {
      setMessages([{ id: Date.now().toString(), role: 'assistant', content: err?.message || AI_UNAVAILABLE_MESSAGE }]);
    } finally {
      setIsTyping(false);
    }
  }, [applicantName, appliedPosition]);

  // ── Send message ──
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || interviewComplete || isTyping) return;
    const userText = inputValue.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText }]);
    setInputValue('');
    setIsTyping(true);
    try {
      const newHistory = [...chatHistory, { role: "user", parts: [{ text: userText }] }];
      const payload = {
        systemInstruction: { role: "system", parts: [{ text: buildInterviewSystemInstruction(applicantName, appliedPosition) }] },
        contents: newHistory,
        generationConfig: { temperature: 0.2 },
      };
      const data = await callGeminiApi(payload);
      let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that. Could you repeat?";
      let isDone = false;
      if (aiText.includes("[END_INTERVIEW]")) { isDone = true; aiText = aiText.replace("[END_INTERVIEW]", "").trim(); }
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: aiText }]);
      const finalHistory = [...newHistory, { role: "model", parts: [{ text: aiText }] }];
      setChatHistory(finalHistory);
      if (isDone) {
        setTimerActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setInterviewComplete(true);
        setCompletionReason('done');
        setShowCompletionModal(true);
        if (applicantId) {
          const qa = formatTranscript(finalHistory);
          const ev = await generateInterviewEvaluation(qa);
          const stored = buildStoredTranscript(qa, ev);
          try {
            const res = await completeInterviewOnServer(applicantId, stored, ev);
            if (!res.savedInterviewResult) await saveInterviewResult(applicantId, stored, ev);
          } catch { try { await saveInterviewResult(applicantId, stored, ev); } catch (e) { console.error(e); } }
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: err instanceof Error ? err.message : AI_UNAVAILABLE_MESSAGE }]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, interviewComplete, isTyping, chatHistory, applicantName, appliedPosition, applicantId]);

  // ── Timer color ──
  const timerUrgent = timeLeft <= 60;
  const timerWarning = timeLeft <= 120 && !timerUrgent;

  // ── Loading ──
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#f5f8f6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#046241]/25 border-t-[#046241] animate-spin" />
          <p className="text-[#046241] text-sm font-semibold">Loading session…</p>
        </div>
      </div>
    );
  }

  // ── Expired link ──
  if (linkExpired) {
    return (
      <div className="min-h-screen bg-[#f5f8f6] flex items-center justify-center p-6" style={{ fontFamily: "Poppins, 'Segoe UI', sans-serif" }}>
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#e0e9e4] flex items-center px-5 gap-3 z-10 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-[#046241] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm font-black text-[#0f2318]">Lifewood AI Recruiter</span>
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mt-14">
          <div className="rounded-3xl border border-[#e0e9e4] bg-white shadow-[0_8px_32px_rgba(4,98,65,0.10)] p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#fff0f0] border border-red-200 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-[#0f2318] mb-2">Interview Link Expired</h1>
            <p className="text-[13px] text-[#1a3326]/60 leading-relaxed mb-2">
              This link was valid for <strong>24 hours</strong> from the time it was sent. That window has now closed.
            </p>
            <p className="text-[13px] text-[#1a3326]/60 leading-relaxed">
              Please contact us at{' '}
              <a href="mailto:hr@lifewood.com" className="text-[#046241] font-semibold underline">hr@lifewood.com</a>{' '}
              if you need a new link.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Completion modal content ──
  const modals: Record<CompletionReason, { icon: string; iconBg: string; title: string; titleColor: string; body: React.ReactNode }> = {
    done: {
      icon: '🎉',
      iconBg: 'bg-[#e6f7ef]',
      title: 'Interview Complete!',
      titleColor: 'text-[#046241]',
      body: (
        <>
          <p className="text-[#1a3326]/70 text-sm leading-relaxed mb-3">
            Congratulations{applicantName ? `, <strong>${applicantName}</strong>` : ''}! You have successfully completed your AI screening interview with <strong>Lifewood</strong>.
          </p>
          <p className="text-[#1a3326]/70 text-sm leading-relaxed mb-3">
            Your responses have been recorded and will be carefully reviewed by our recruitment team. If you're selected for the next stage, you'll be contacted via the email you registered with.
          </p>
          <p className="text-[#1a3326]/70 text-sm leading-relaxed">
            We truly appreciate your interest in joining us. Best of luck! 🌟
          </p>
        </>
      ),
    },
    timeout: {
      icon: '⏰',
      iconBg: 'bg-[#fff4e5]',
      title: 'Session Time Expired',
      titleColor: 'text-[#915700]',
      body: (
        <>
          <p className="text-[#1a3326]/70 text-sm leading-relaxed mb-3">
            Your 15-minute AI interview session has ended. Don't worry — all responses you shared have been saved and will be reviewed by our team.
          </p>
          <p className="text-[#1a3326]/70 text-sm leading-relaxed mb-3">
            If your answers were sufficient for evaluation, you may still proceed to the next step. Our recruitment team will be in touch.
          </p>
          <p className="text-[#1a3326]/70 text-sm leading-relaxed">Thank you for your time — we wish you all the best! 🌟</p>
        </>
      ),
    },
    already_done: {
      icon: '✅',
      iconBg: 'bg-[#e6f7ef]',
      title: 'Interview Already Completed',
      titleColor: 'text-[#046241]',
      body: (
        <>
          <p className="text-[#1a3326]/70 text-sm leading-relaxed mb-3">
            {applicantName ? `Hi ${applicantName}! ` : ''}You have already completed your AI screening interview. Each link can only be used once to ensure fairness.
          </p>
          <p className="text-[#1a3326]/70 text-sm leading-relaxed mb-3">
            Your responses are under review by our recruitment team. We'll reach out if you're selected for the next stage.
          </p>
          <p className="text-[#1a3326]/70 text-sm leading-relaxed">Thank you for your patience! 🌟</p>
        </>
      ),
    },
  };
  const modal = modals[completionReason];

  const userAnswerCount = messages.filter(m => m.role === 'user').length;

  return (
    <main
      className="min-h-screen bg-[#f5f8f6] flex flex-col"
      style={{ fontFamily: "Poppins, 'Segoe UI', sans-serif" }}
    >

      {/* ── INSTRUCTIONS MODAL ── */}
      <AnimatePresence>
        {showInstructions && (
          <OverlayModal>
            <div className="rounded-3xl border border-[#e0e9e4] bg-white shadow-[0_20px_60px_rgba(4,98,65,0.18)] overflow-hidden">
              {/* Green header strip */}
              <div className="bg-[#046241] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Lifewood AI Recruiter</p>
                    <h2 className="text-white text-lg font-black">Before You Begin</h2>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-4">
                {appliedPosition && (
                  <div className="flex items-center gap-2 bg-[#f0f9f5] rounded-xl px-4 py-2.5 border border-[#d0eddf]">
                    <svg className="w-4 h-4 text-[#046241] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#046241]/70">Position Applied</p>
                      <p className="text-[13px] font-bold text-[#0f2318]">{appliedPosition}</p>
                    </div>
                  </div>
                )}

                {applicantName && (
                  <p className="text-[13px] text-[#1a3326]/70">
                    Hi <span className="font-bold text-[#046241]">{applicantName}</span>! Please review the guidelines below before starting.
                  </p>
                )}

                <div className="space-y-2">
                  {[
                    { icon: '💬', title: '3 Questions', desc: 'You will be asked exactly 3 structured interview questions.' },
                    { icon: '⏱️', title: '15-Minute Session', desc: 'The interview ends automatically when the timer runs out.' },
                    { icon: '🔗', title: 'One-Time Link', desc: 'This link can only be used once. Once started, it cannot be reopened.' },
                    { icon: '✍️', title: 'Answer Naturally', desc: 'Type in your own words. No grammar judgment — just be honest.' },
                    { icon: '📋', title: 'Responses Recorded', desc: 'All answers are saved and reviewed by our recruitment team.' },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-3 bg-[#f5f8f6] rounded-xl p-3 border border-[#e0e9e4]">
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-[12px] font-black text-[#0f2318]">{item.title}</p>
                        <p className="text-[11px] text-[#1a3326]/60 leading-snug mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={startInterview}
                  className="w-full h-12 rounded-xl bg-[#046241] hover:bg-[#03543a] text-white font-black text-sm uppercase tracking-widest transition-all shadow-[0_4px_16px_rgba(4,98,65,0.3)] hover:shadow-[0_6px_20px_rgba(4,98,65,0.45)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                  Start Interview
                </button>
                <p className="text-center text-[10px] text-[#1a3326]/40 uppercase tracking-widest">By starting, you agree that your responses will be recorded</p>
              </div>
            </div>
          </OverlayModal>
        )}
      </AnimatePresence>

      {/* ── COMPLETION MODAL ── */}
      <AnimatePresence>
        {showCompletionModal && (
          <OverlayModal>
            <div className="rounded-3xl border border-[#e0e9e4] bg-white shadow-[0_20px_60px_rgba(4,98,65,0.16)] overflow-hidden">
              <div className="bg-[#046241] px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-white font-black text-[13px] uppercase tracking-widest">Lifewood AI Recruiter</span>
              </div>
              <div className="px-6 py-7 text-center">
                <div className={`w-16 h-16 rounded-full ${modal.iconBg} border border-[#e0e9e4] flex items-center justify-center mx-auto mb-4 text-3xl`}>
                  {modal.icon}
                </div>
                <h2 className={`text-xl font-black mb-4 ${modal.titleColor}`}>{modal.title}</h2>
                <div className="text-left">{modal.body}</div>
                <div className="mt-6 pt-4 border-t border-[#e0e9e4]">
                  <p className="text-[11px] text-[#1a3326]/40 uppercase tracking-widest">
                    Lifewood Recruitment · <a href="mailto:hr@lifewood.com" className="text-[#046241] hover:underline">hr@lifewood.com</a>
                  </p>
                </div>
              </div>
            </div>
          </OverlayModal>
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-[#e0e9e4] shadow-sm px-4 py-3 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#046241] flex items-center justify-center shadow-[0_2px_8px_rgba(4,98,65,0.25)]">
            <svg className="w-4.5 h-4.5 w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-[14px] font-black text-[#0f2318] leading-tight">Lifewood AI Recruiter</h1>
            <p className="text-[10px] font-semibold text-[#046241] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#046241] animate-pulse" />
              {interviewComplete ? 'Session ended' : interviewStarted ? 'Interview in progress' : 'Waiting to begin'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Position badge */}
          {appliedPosition && (
            <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-bold text-[#046241] bg-[#e6f7ef] border border-[#c3eed7] px-2.5 py-1 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              {appliedPosition.length > 30 ? appliedPosition.slice(0, 30) + '…' : appliedPosition}
            </span>
          )}
          {/* Timer */}
          {interviewStarted && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-black tabular-nums border transition-all ${
              timerUrgent
                ? 'bg-[#fff0f0] border-red-200 text-red-500'
                : timerWarning
                ? 'bg-[#fff4e5] border-amber-200 text-amber-600'
                : 'bg-[#e6f7ef] border-[#c3eed7] text-[#046241]'
            }`}>
              <svg className={`w-3.5 h-3.5 ${timerUrgent ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </header>

      {/* ── PROGRESS STEPS ── */}
      {interviewStarted && !interviewComplete && (
        <div className="bg-white border-b border-[#e0e9e4] px-4 py-2 flex items-center justify-center gap-2 md:gap-4">
          {['Introduction', 'Experience', 'Challenge'].map((label, i) => {
            const done = userAnswerCount > i;
            const active = userAnswerCount === i;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  done ? 'bg-[#e6f7ef] text-[#046241] border-[#c3eed7]'
                  : active ? 'bg-[#046241] text-white border-[#046241]'
                  : 'bg-[#f5f8f6] text-[#1a3326]/50 border-[#e0e9e4]'
                }`}>
                  {done
                    ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    : <span className="w-3 h-3 flex items-center justify-center text-[9px] font-black">{i + 1}</span>
                  }
                  {label}
                </div>
                {i < 2 && <div className={`h-px w-4 md:w-6 ${done ? 'bg-[#046241]/30' : 'bg-[#e0e9e4]'}`} />}
              </div>
            );
          })}
        </div>
      )}

      {/* ── CHAT AREA ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {!interviewStarted && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mt-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white border border-[#e0e9e4] flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg className="w-8 h-8 text-[#046241]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                <p className="text-[#1a3326]/50 text-sm font-semibold">Ready when you are…</p>
              </div>
            </motion.div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* AI avatar */}
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#046241] flex items-center justify-center flex-shrink-0 mb-0.5 shadow-[0_2px_8px_rgba(4,98,65,0.25)]">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              <div className={`max-w-[78%] md:max-w-[65%] px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[#046241] text-white rounded-2xl rounded-br-sm'
                  : 'bg-white border border-[#e0e9e4] text-[#0f2318] rounded-2xl rounded-bl-sm'
              }`}>
                {msg.role === 'assistant'
                  ? <AiMessageContent text={msg.content} />
                  : msg.content
                }
              </div>

              {/* User avatar */}
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#e6f7ef] border border-[#c3eed7] flex items-center justify-center flex-shrink-0 mb-0.5 text-[11px] font-black text-[#046241]">
                  {applicantName ? applicantName.charAt(0).toUpperCase() : 'Y'}
                </div>
              )}
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#046241] flex items-center justify-center shadow-[0_2px_8px_rgba(4,98,65,0.25)]">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div className="bg-white border border-[#e0e9e4] rounded-2xl rounded-bl-sm px-4 py-3.5 flex gap-1.5 items-center shadow-sm">
                {[0, 150, 300].map(d => (
                  <span key={d} className="w-2 h-2 bg-[#046241]/40 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── INPUT BAR ── */}
      <div className="bg-white border-t border-[#e0e9e4] p-4 shadow-[0_-2px_12px_rgba(4,98,65,0.06)]">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              disabled={isTyping || interviewComplete || !interviewStarted}
              placeholder={
                !interviewStarted ? 'Please read the instructions first…'
                : interviewComplete ? 'Session ended'
                : 'Type your response here…'
              }
              className="flex-1 h-12 rounded-xl border border-[#d8e5de] bg-[#f5f8f6] px-4 text-[#0f2318] placeholder:text-[#1a3326]/40 outline-none focus:border-[#046241] focus:bg-white focus:ring-2 focus:ring-[#046241]/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping || interviewComplete || !interviewStarted}
              className="h-12 px-5 rounded-xl bg-[#046241] hover:bg-[#03543a] text-white text-[11px] font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_4px_12px_rgba(4,98,65,0.3)] flex items-center gap-2"
            >
              Send
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[9px] text-[#1a3326]/35 mt-2 font-semibold tracking-widest uppercase">
            AI interactions are recorded for recruitment purposes
          </p>
        </div>
      </div>
    </main>
  );
}
