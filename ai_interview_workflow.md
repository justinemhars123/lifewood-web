# AI Interview Screening — Workflow & Implementation Guide

## Overview

This document describes the full flow from **admin sends email → applicant completes AI interview → result saved to database**, including all the enhancements implemented in this session.

---

## End-to-End Flow

```
Admin (Admin Applicants Page)
  │
  ├─ Clicks "Send Email for AI Screening"
  │   └─ Status updated to "Pending Interview"
  │   └─ EmailJS sends email with a unique interview link:
  │       https://<your-domain>/interview/<applicantId>
  │
  └─ Link is valid for 24 hours from the applicant's created_at timestamp
```

```
Applicant (opens link from Gmail)
  │
  ├─ Page loads → api/interview-applicant is called
  │   ├─ Returns: firstName, applicantName, email, status, createdAt, interviewLocked
  │   │
  │   ├─ CASE: link older than 24 h      → "Link Expired" full-screen screen
  │   ├─ CASE: interviewLocked = true    → "Already Completed" modal shown
  │   └─ CASE: valid & new              → Instructions modal shown
  │
  ├─ Applicant reads instructions → clicks "Start Interview"
  │   └─ Chat session initialises (calls Gemini API)
  │   └─ 15-minute countdown timer starts
  │
  ├─ AI asks 3 questions (Question 1 → 2 → 3)
  │   └─ Progress bar (Introduction / Experience / Challenge) updates as user answers
  │
  ├─ CASE A: All 3 answered → AI sends [END_INTERVIEW] token
  │   ├─ Timer stops
  │   ├─ Completion modal: "Interview Complete! 🎉" shown
  │   ├─ Full transcript evaluated (Gemini scoring API → local fallback)
  │   └─ Result saved to interview_results table & applicant status → "Interview Completed"
  │
  └─ CASE B: Timer hits 0 before completion
      ├─ Input locked immediately
      ├─ Timeout modal: "Session Time Expired ⏰" shown
      ├─ Partial transcript evaluated and saved (same pipeline as CASE A)
      └─ Applicant status → "Interview Completed"
```

---

## Files Changed

### `api/interview-applicant.ts`
- Added `created_at` to the Supabase query.
- Returns `createdAt` (ISO string) in the JSON response.
- Used by the front-end to compute 24-hour link expiry.

### `components/AIInterviewPage.tsx` (full rewrite)
All original business logic (Gemini API, scoring, transcript saving) is preserved.

**New features added:**

| Feature | Implementation |
|---|---|
| **24-hour link expiry** | After API call, compare `Date.now()` vs `new Date(createdAt).getTime()`. Set `linkExpired = true` if elapsed > 24h. Shows a full-screen expired message. |
| **Instruction modal** | Shown on page load for valid, unused links. Lists rules of the interview. Clicking "Start Interview" dismisses modal and calls `startInterview()`. |
| **15-minute timer** | `timeLeft` state counts down from 900. `timerActive` starts when interview begins. `setInterval` decrements every second. Color: green → amber at 2 min → red at 1 min. |
| **Timer expiry** | When `timeLeft === 0`: lock input, save partial transcript via `completeInterviewOnServer`, show timeout modal. `timeoutSavedRef` prevents double-saves. |
| **Completion modal** | Shown after `[END_INTERVIEW]` token detected. Warm, personalized message with applicant's name. |
| **Already-done modal** | When `interviewLocked = true` (re-opening completed link), the styled "Already Completed ✅" modal appears instead of a plain chat message. |
| **Progress steps** | Header sub-bar showing Introduction / Experience / Challenge with filled checkmarks as user answers. |
| **UI redesign** | Deep forest-green dark theme (`#061a0e`), gradient bubbles, AI/user avatars in chat, glowing timer pill, ambient background blurs. |

---

## Completion Modal Variants

| Trigger | Title | Icon | Message tone |
|---|---|---|---|
| All 3 questions answered | "Interview Complete!" | 🎉 | Congratulatory, next-steps info |
| Timer hits 0 | "Session Time Expired" | ⏰ | Reassuring, partial data still reviewed |
| Re-opening a completed link | "Interview Already Completed" | ✅ | Informative, fairness explained |

---

## Key Constants (easy to adjust)

```ts
// In AIInterviewPage.tsx
const INTERVIEW_DURATION_SECONDS = 15 * 60;  // 15 minutes
const LINK_EXPIRY_HOURS = 24;                 // 24 hours
```

To **test timeout quickly**, temporarily change `INTERVIEW_DURATION_SECONDS` to `10`.

---

## Database Tables Used

| Table | Operation |
|---|---|
| `applicants` | Read: fetch name, status, created_at. Update: status → "Interview Completed" |
| `interview_results` | Insert/Update: qa_transcript, interview_score, evaluation_summary |

---

## Environment Variables Required

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   (server-side API routes)
VITE_EMAILJS_SERVICE_ID
VITE_EMAILJS_SCREENING_TEMPLATE_ID
VITE_EMAILJS_PUBLIC_KEY
```
