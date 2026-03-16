import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

// Define Message interface
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

// Using direct REST API fetch to avoid Vite/Node module resolution issues with the @google/genai SDK in browser
const API_KEY = 'AIzaSyBcHFFKmx6J8F2rNc4MYk82IzhGgvG0Upg';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const SYSTEM_INSTRUCTION = `You are an AI Recruitment Interview Agent integrated into a hiring platform.

Your job is to conduct a structured interview with job applicants who have passed the initial screening stage.
The person you are speaking with is an applicant who has clicked the "Start AI Interview" button from their acceptance email.

Your responsibilities:
• Conduct a professional interview
• Ask structured questions
• Evaluate communication clarity
• Maintain a friendly but professional tone
• Guide the applicant through the interview process

INTERVIEW RULES
1. Ask ONLY one question at a time.
2. Wait for the applicant to answer before asking the next question.
3. Conduct exactly 3 interview questions.
4. Questions must evaluate:
   - Background and introduction
   - Relevant experience
   - Problem solving

INTERVIEW FLOW
Start with a greeting. Your exact opening message must be:
"Hello! Welcome to the AI Interview.
Thank you for applying to our company. I will ask you a few short questions to learn more about you.
Please answer as clearly as you can. Let's begin! 😊"

QUESTION STRUCTURE
You must ask these exact questions in this exact order:
Question 1: "1️⃣ Can you briefly introduce yourself and tell us a little about your background?"
Question 2: "2️⃣ What kind of experience or skills do you have that could help you in this position?"
Question 3: "3️⃣ Can you share an example of a problem or challenge you faced and how you solved it?"

CONVERSATION GUIDELINES
• Maintain a friendly and encouraging tone.
• Encourage thoughtful answers.
• Do not ask multiple questions at once.
• Keep questions clear and concise.
• Do not repeat questions.

INTERVIEW COMPLETION
After the applicant answers the third question, end the interview with exactly this message:
"Thank you for completing the AI interview!
Your responses have been recorded and will be reviewed by our recruitment team.
If you are selected for the next step, we will contact you soon.
Have a great day! 😊"
Append the exact token "[END_INTERVIEW]" to the very end of your final message.

IMPORTANT BEHAVIOR
• Never exceed 3 questions.
• Do not skip questions.
• Always wait for the applicant's response before continuing.
• If the applicant asks unrelated questions, politely redirect them back to the interview.
• Your primary role is to conduct the interview until completion.`;

export default function AIInterviewPage() {
  const applicantId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : null;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: string, parts: {text: string}[]}[]>([]);
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
        const initialHistory: {role: string, parts: {text: string}[]}[] = [];
        const payload = {
          systemInstruction: {
            role: "system",
            parts: [{ text: SYSTEM_INSTRUCTION }]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: "Please begin the interview by introducing yourself according to your instructions." }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
          }
        };

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error("Gemini API Error Body:", errorBody);
          throw new Error(`API returned ${response.status}: ${errorBody}`);
        }
        
        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hello. Are you ready to begin the interview?";

        setMessages([{
          id: Date.now().toString(),
          role: 'assistant',
          content: responseText,
        }]);

        setChatHistory([
          { role: "user", parts: [{ text: "Please begin the interview by introducing yourself according to your instructions." }] },
          { role: "model", parts: [{ text: responseText }] }
        ]);

      } catch (err: any) {
        console.error("Failed to start chat session:", err);
        setMessages([{
          id: Date.now().toString(),
          role: 'assistant',
          content: "I apologize, but I am having trouble connecting to the system. Please wait a moment and try again."
        }]);
      } finally {
        setIsTyping(false);
      }
    };
    initChat();
  }, []);

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
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: newHistory,
        generationConfig: {
          temperature: 0.2,
        }
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Gemini API Error Body:", errorBody);
        throw new Error(`API returned ${response.status}: ${errorBody}`);
      }
      
      const data = await response.json();
      
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
          try {
            const formattedQa = finalHistory.map(item => ({
              role: item.role,
              text: item.parts[0].text
            }));
            
            await supabase.from("interview_results").insert({
              applicant_id: applicantId,
              qa_transcript: formattedQa
            });

            await supabase
              .from("applicants")
              .update({ status: "Interview Completed" })
              .eq("id", applicantId);
          } catch (dbErr) {
            console.error("Failed to save interview transcript:", dbErr);
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [
        ...prev, 
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I apologize, but I am having trouble connecting to the system. Please wait a moment and try again.",
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
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3.5 text-[14px] leading-[1.6] shadow-sm ${
                  msg.role === 'user'
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
