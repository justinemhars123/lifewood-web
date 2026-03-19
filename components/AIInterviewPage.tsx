import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

// Define Message interface
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
}

const EASE = [0.16, 1, 0.3, 1] as const;
const INTERVIEW_BOOTSTRAP_PROMPT = "Please begin the interview by introducing yourself according to your instructions.";
const SCORE_METADATA_ROLE = "system_score_meta";
const GEMINI_PROXY_URL = "/api/gemini";
const INTERVIEW_COMPLETION_URL = "/api/interview-complete";
const INTERVIEW_APPLICANT_URL = "/api/interview-applicant";
const AI_UNAVAILABLE_MESSAGE = "The AI interview is temporarily unavailable. Please try again later.";

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
6. Do not criticize, correct, or reject the applicant's answers.
7. Accept all answers and continue the interview flow naturally.

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

CONVERSATION GUIDELINES
- Keep your responses short.
- Use only a brief acknowledgement before question 2 and question 3.
- Example acknowledgements: "Thank you." or "Thanks for sharing."
- Stay polite, warm, and professional.
- If the applicant gives a short, unclear, or unexpected answer, accept it and continue.
- Do not be strict with the applicant's wording or grammar.
- Do not repeat or rephrase the same question unless the applicant clearly asks for it once.
- If the applicant asks something unrelated, briefly redirect them back to the current interview question.

INTERVIEW COMPLETION
After the applicant answers the third question, end with this exact message:
"Thank you for completing the AI interview.
Your responses have been recorded and will be reviewed by our recruitment team.
If you are selected for the next step, we will contact you soon.
Have a great day! 😊"
Append the exact token "[END_INTERVIEW]" to the very end of your final message.

IMPORTANT BEHAVIOR
- Never exceed 3 questions.
- Do not skip questions.
- Always continue the flow in order.
- Keep the interview simple, short, and easy for the applicant.
- Your primary role is to complete the 3-question interview politely and efficiently.`;

function buildInterviewSystemInstruction(applicantName?: string | null) {
  const normalizedApplicantName = (applicantName || "").trim();
  const openingMessage = normalizedApplicantName
    ? `Hello, ${normalizedApplicantName}. Welcome to the AI interview.\nI will ask you 3 short questions.\nPlease answer as clearly as you can.`
    : `Hello and welcome to the AI interview.\nI will ask you 3 short questions.\nPlease answer as clearly as you can.`;

  return `${SYSTEM_INSTRUCTION}

ADDITIONAL PERSONALIZATION RULES
- The applicant's name is ${normalizedApplicantName || "not available"}.
- If the applicant's name is available, use it naturally in the opening greeting.
- You may mention the applicant's first name one more time later, but do not overuse it.
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

function clampScore(score: number) {
  return Math.max(1, Math.min(100, Math.round(score)));
}

function formatTranscript(history: { role: string; parts: { text: string }[] }[]): TranscriptEntry[] {
  return history.map((item) => ({
    role: item.role,
    text: item.parts[0]?.text || "",
  }));
}

function getApplicantAnswers(transcript: TranscriptEntry[]) {
  return transcript.filter(
    (entry) => entry.role === "user" && entry.text.trim() && entry.text !== INTERVIEW_BOOTSTRAP_PROMPT
  );
}

function buildLocalInterviewEvaluation(transcript: TranscriptEntry[]): InterviewEvaluation {
  const answers = getApplicantAnswers(transcript).map((entry) => entry.text);
  const combinedAnswers = answers.join(" ");
  const words = combinedAnswers.match(/\b[\w'-]+\b/g) || [];
  const totalWords = words.length;
  const averageWords = answers.length ? totalWords / answers.length : 0;

  const fitKeywords = ["experience", "skills", "background", "project", "team", "role", "position", "customer", "data", "operations", "support"];
  const problemSolvingKeywords = ["problem", "challenge", "solve", "solved", "solution", "resolved", "improved", "approach", "result", "outcome"];
  const professionalismKeywords = ["professional", "responsible", "collaborated", "communicated", "managed", "delivered", "organized", "reliable"];

  const lowerContent = combinedAnswers.toLowerCase();
  const fitHits = fitKeywords.filter((keyword) => lowerContent.includes(keyword)).length;
  const problemHits = problemSolvingKeywords.filter((keyword) => lowerContent.includes(keyword)).length;
  const professionalismHits = professionalismKeywords.filter((keyword) => lowerContent.includes(keyword)).length;
  const shortAnswerCount = answers.filter((answer) => (answer.match(/\b[\w'-]+\b/g) || []).length < 8).length;

  let score = 35;
  score += Math.min(20, totalWords * 0.22);
  score += Math.min(15, averageWords * 0.4);
  score += Math.min(12, fitHits * 3);
  score += Math.min(10, problemHits * 2.5);
  score += Math.min(8, professionalismHits * 2);
  score -= shortAnswerCount * 6;

  if (answers.length < 3) score -= 12;

  const finalScore = clampScore(score);

  let summary = "Responses were recorded successfully.";
  if (finalScore >= 90) {
    summary = "Excellent interview performance with strong role fit, well-developed answers, and a highly professional communication style.";
  } else if (finalScore >= 75) {
    summary = "Strong interview performance with relevant answers, appropriate detail, and a professional tone.";
  } else if (finalScore >= 60) {
    summary = "Moderate interview performance with acceptable fit, but some answers could be more specific or polished.";
  } else if (finalScore >= 40) {
    summary = "Below-average interview performance because the answers were limited in relevance, depth, or professionalism.";
  } else {
    summary = "Weak interview performance due to unclear, incomplete, or poorly aligned answers.";
  }

  return {
    score: finalScore,
    summary,
  };
}

function parseInterviewEvaluation(rawText: string): InterviewEvaluation | null {
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (typeof parsed?.score !== "number" || typeof parsed?.summary !== "string") {
      return null;
    }

    return {
      score: clampScore(parsed.score),
      summary: parsed.summary.trim(),
    };
  } catch {
    return null;
  }
}

async function callGeminiApi(payload: unknown) {
  const response = await fetch(GEMINI_PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  let data: any = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMessage =
      data?.error?.message ||
      data?.message ||
      AI_UNAVAILABLE_MESSAGE;

    console.error("Gemini proxy error:", response.status, data || responseText);
    throw new Error(errorMessage);
  }

  if (!data) {
    throw new Error(AI_UNAVAILABLE_MESSAGE);
  }

  return data;
}

async function fetchApplicantName(applicantId: string) {
  const response = await fetch(
    `${INTERVIEW_APPLICANT_URL}?applicantId=${encodeURIComponent(applicantId)}`
  );

  const responseText = await response.text();
  let data: any = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || "Failed to load applicant details.");
  }

  return {
    firstName: String(data?.firstName || "").trim(),
    applicantName: String(data?.applicantName || "").trim(),
    email: String(data?.email || "").trim(),
    status: String(data?.status || "").trim(),
    interviewLocked: Boolean(data?.interviewLocked),
  } satisfies ApplicantInterviewAccess;
}

async function completeInterviewOnServer(
  applicantId: string,
  storedTranscript: TranscriptEntry[],
  evaluation: InterviewEvaluation
) {
  const response = await fetch(INTERVIEW_COMPLETION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      applicantId,
      qaTranscript: storedTranscript,
      interviewScore: evaluation.score,
      evaluationSummary: evaluation.summary,
    }),
  });

  const responseText = await response.text();
  let data: any = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || "Failed to finalize the interview.");
  }

  return {
    savedInterviewResult: data?.savedInterviewResult !== false,
  };
}

async function generateInterviewEvaluation(transcript: TranscriptEntry[]): Promise<InterviewEvaluation> {
  const answers = getApplicantAnswers(transcript);
  const fallbackEvaluation = buildLocalInterviewEvaluation(transcript);

  if (!answers.length) {
    return fallbackEvaluation;
  }

  try {
    const payload = {
      systemInstruction: {
        role: "system",
        parts: [{ text: SCORING_SYSTEM_INSTRUCTION }],
      },
      contents: [
        {
          role: "user",
          parts: [{
            text: `Evaluate this applicant interview transcript and return the JSON score.\n\n${JSON.stringify(answers, null, 2)}`,
          }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
      },
    };

    const data = await callGeminiApi(payload);
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return parseInterviewEvaluation(responseText) || fallbackEvaluation;
  } catch (error) {
    console.error("Failed to generate interview score:", error);
    return fallbackEvaluation;
  }
}

function buildStoredTranscript(transcript: TranscriptEntry[], evaluation: InterviewEvaluation): TranscriptEntry[] {
  return [
    {
      role: SCORE_METADATA_ROLE,
      text: JSON.stringify({
        interviewScore: evaluation.score,
        evaluationSummary: evaluation.summary,
      }),
    },
    ...transcript,
  ];
}

async function saveInterviewResult(
  applicantId: string,
  storedTranscript: TranscriptEntry[],
  evaluation: InterviewEvaluation
) {
  const fullPayload = {
    applicant_id: applicantId,
    qa_transcript: storedTranscript,
    interview_score: evaluation.score,
    evaluation_summary: evaluation.summary,
  };

  const { error: insertError } = await supabase
    .from("interview_results")
    .insert(fullPayload);

  if (!insertError) return;

  console.error("Failed to insert scored interview result, retrying as update:", insertError);

  const { error: updateError } = await supabase
    .from("interview_results")
    .update({
      qa_transcript: storedTranscript,
      interview_score: evaluation.score,
      evaluation_summary: evaluation.summary,
    })
    .eq("applicant_id", applicantId);

  if (!updateError) return;

  console.error("Failed to update scored interview result, retrying with transcript-only payload:", updateError);

  const { error: transcriptOnlyInsertError } = await supabase
    .from("interview_results")
    .insert({
      applicant_id: applicantId,
      qa_transcript: storedTranscript,
    });

  if (!transcriptOnlyInsertError) return;

  const { error: transcriptOnlyUpdateError } = await supabase
    .from("interview_results")
    .update({
      qa_transcript: storedTranscript,
    })
    .eq("applicant_id", applicantId);

  if (transcriptOnlyUpdateError) {
    throw transcriptOnlyUpdateError;
  }
}

async function markApplicantInterviewCompleted(applicantId: string) {
  const { error } = await supabase
    .from("applicants")
    .update({ status: "Interview Completed" })
    .eq("id", applicantId);

  if (error) {
    throw error;
  }
}

export default function AIInterviewPage() {
  const applicantId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : null;
  const [applicantName, setApplicantName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string, parts: { text: string }[] }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Initialize chat session on mount
    const initChat = async () => {
      setIsTyping(true);
      try {
        let loadedApplicantName = '';

        if (applicantId) {
          try {
            const applicantAccess = await fetchApplicantName(applicantId);
            loadedApplicantName = applicantAccess.firstName || applicantAccess.applicantName;
            setApplicantName(loadedApplicantName);

            if (applicantAccess.interviewLocked) {
              const lockedMessage = applicantAccess.firstName
                ? `Hello, ${applicantAccess.firstName}. This interview link has already been used. Your interview is already completed, so you cannot take it again with the same link.`
                : "This interview link has already been used. Your interview is already completed, so you cannot take it again with the same link.";

              setMessages([{
                id: Date.now().toString(),
                role: 'assistant',
                content: lockedMessage,
              }]);
              setInterviewComplete(true);
              setChatHistory([]);
              return;
            }
          } catch (nameError) {
            console.error("Failed to load applicant name for interview:", nameError);
          }
        }

        const payload = {
          systemInstruction: {
            role: "system",
            parts: [{ text: buildInterviewSystemInstruction(loadedApplicantName) }]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: INTERVIEW_BOOTSTRAP_PROMPT }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
          }
        };

        const data = await callGeminiApi(payload);
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hello. Are you ready to begin the interview?";

        setMessages([{
          id: Date.now().toString(),
          role: 'assistant',
          content: responseText,
        }]);

        setChatHistory([
          { role: "user", parts: [{ text: INTERVIEW_BOOTSTRAP_PROMPT }] },
          { role: "model", parts: [{ text: responseText }] }
        ]);

      } catch (err: any) {
        console.error("Failed to start chat session:", err);
        setMessages([{
          id: Date.now().toString(),
          role: 'assistant',
          content: err?.message || AI_UNAVAILABLE_MESSAGE
        }]);
      } finally {
        setIsTyping(false);
      }
    };
    initChat();
  }, [applicantId]);

  const handleSend = async () => {
    if (!inputValue.trim() || interviewComplete) return;

    const userText = inputValue.trim();
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const newHistory = [
        ...chatHistory,
        { role: "user", parts: [{ text: userText }] }
      ];

      const payload = {
        systemInstruction: {
          role: "system",
          parts: [{ text: buildInterviewSystemInstruction(applicantName) }]
        },
        contents: newHistory,
        generationConfig: {
          temperature: 0.2,
        }
      };

      const data = await callGeminiApi(payload);

      let aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that. Could you repeat?";
      let isDone = false;

      if (aiResponseText.includes("[END_INTERVIEW]")) {
        isDone = true;
        aiResponseText = aiResponseText.replace("[END_INTERVIEW]", "").trim();
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: aiResponseText,
        }
      ]);

      const finalHistory = [
        ...newHistory,
        { role: "model", parts: [{ text: aiResponseText }] }
      ];
      setChatHistory(finalHistory);

      if (isDone) {
        setInterviewComplete(true);
        if (applicantId) {
          const formattedQa = formatTranscript(finalHistory);
          const evaluation = await generateInterviewEvaluation(formattedQa);
          const storedTranscript = buildStoredTranscript(formattedQa, evaluation);

          try {
            const completionResult = await completeInterviewOnServer(applicantId, storedTranscript, evaluation);

            if (!completionResult.savedInterviewResult) {
              await saveInterviewResult(applicantId, storedTranscript, evaluation);
            }
          } catch (serverErr) {
            console.error("Failed to complete interview on server, retrying from client:", serverErr);

            try {
              await saveInterviewResult(applicantId, storedTranscript, evaluation);
            } catch (dbErr) {
              console.error("Failed to save interview transcript:", dbErr);
            }

            try {
              await markApplicantInterviewCompleted(applicantId);
            } catch (statusErr) {
              console.error("Failed to update applicant interview status:", statusErr);
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage = err instanceof Error && err.message
        ? err.message
        : AI_UNAVAILABLE_MESSAGE;

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: errorMessage,
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-brand-paper dark:bg-brand-dark flex flex-col font-sans"
    >
      <header className="px-6 py-4 border-b border-[#e0e9e4] dark:border-white/10 bg-white/50 dark:bg-[#0f1f17]/50 backdrop-blur z-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#046241] flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-[16px] font-black text-[#0f2318] dark:text-white leading-tight">Lifewood AI Recruiter</h1>
            <p className="text-[11px] font-semibold text-[#046241] dark:text-[#c1ff00] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#046241] dark:bg-[#c1ff00] animate-pulse" />
              Interview in progress
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
        <div className="max-w-3xl mx-auto w-full space-y-6">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3.5 text-[14px] leading-[1.6] shadow-sm ${msg.role === 'user'
                  ? 'bg-[#046241] text-white rounded-br-sm'
                  : 'bg-white dark:bg-[#1a2e24] border border-[#e0e9e4] dark:border-[#2a4538] text-[#163126] dark:text-white rounded-bl-sm'
                  }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white dark:bg-[#1a2e24] border border-[#e0e9e4] dark:border-[#2a4538] rounded-2xl rounded-bl-sm px-5 py-3.5 flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-[#163126]/40 dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[#163126]/40 dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[#163126]/40 dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-white/80 dark:bg-[#0f1f17]/90 backdrop-blur-md border-t border-[#e0e9e4] dark:border-white/10">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            disabled={isTyping || interviewComplete}
            placeholder={interviewComplete ? "Interview complete" : "Type your response here..."}
            className="flex-1 h-12 rounded-xl border border-[#d2dfdb] dark:border-[#2a4538] bg-white dark:bg-[#15271e] px-4 text-[#0f2318] dark:text-white placeholder:text-[#1a3326]/40 dark:placeholder:text-white/30 outline-none focus:border-[#046241] dark:focus:border-[#c1ff00] transition-colors disabled:opacity-60"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping || interviewComplete}
            className="h-12 px-6 rounded-xl bg-[#046241] dark:bg-[#c1ff00] text-white dark:text-[#061006] text-[12px] font-black uppercase tracking-[0.1em] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-[0_4px_12px_rgba(4,98,65,0.2)] dark:shadow-[0_4px_12px_rgba(193,255,0,0.15)] flex items-center gap-2"
          >
            <span>Send</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-[#1a3326]/40 dark:text-white/30 mt-3 font-semibold tracking-wide uppercase">
          AI interactions are recorded for recruitment purposes
        </p>
      </div>
    </main>
  );
}
