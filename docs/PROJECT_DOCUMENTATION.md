# Lifewood Web Project Documentation

## 1. Project Summary

Lifewood Web is a React single-page application that serves four major purposes:

1. Public marketing website for Lifewood's services, company pages, offices, and philanthropy content.
2. Lead capture through the contact form.
3. Recruitment funnel through the careers page, application form, and AI interview.
4. Internal/admin operations through dashboards for users, applicants, analytics, and contacts.

The app is built as a frontend-first project with Supabase as the main backend service and a small `api/` layer for Gemini and interview server actions.

## 2. Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- Framer Motion
- GSAP
- Leaflet / React Leaflet
- Tailwind CSS via CDN config in `index.html`

### Backend and integrations

- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase Realtime
- Gemini API through `/api/gemini`
- EmailJS for applicant/contact email workflows
- Optional Supabase Edge Function using Resend in `supabase/functions/send-email`

### Deployment

- Vercel-style `api/` handlers
- SPA rewrites in `vercel.json`

## 3. Architecture Overview

### SPA shell

- [`index.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/index.tsx) mounts the app and re-renders on `popstate`.
- [`App.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/App.tsx) is the routing shell.
- Routing is implemented manually with `window.location.pathname`, `history.pushState`, and `PopStateEvent`.
- There is no `react-router` or server-rendered routing layer.

### Styling model

- Global Tailwind theme configuration lives directly in [`index.html`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/index.html).
- Fonts are loaded from Google Fonts.
- Most styling is inline via Tailwind utility classes inside component files.
- A small number of components use local CSS files such as `BounceCards.css`.

### Local API behavior

- [`vite.config.ts`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/vite.config.ts) mounts three API handlers during local development:
  - `/api/gemini`
  - `/api/interview-applicant`
  - `/api/interview-complete`
- This lets the same frontend code call local API routes in dev and serverless API routes in production.

### Backend model

- Supabase handles authentication, profile persistence, application/contact data, storage uploads, and some admin RPCs.
- Gemini calls are proxied server-side to keep the API key off the client.
- Some public interview writes are permitted through RLS policies so applicants can complete the interview from a public link.

## 4. Main Runtime Entry Points

### Core files

- [`index.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/index.tsx): app bootstrap
- [`App.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/App.tsx): route switching and layout shell
- [`auth.ts`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/auth.ts): auth/session/profile logic
- [`supabaseClient.ts`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/supabaseClient.ts): shared Supabase client
- [`vite.config.ts`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/vite.config.ts): Vite config and dev middleware
- [`vercel.json`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/vercel.json): rewrite rules

### Runtime folders

- [`components/`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/components): UI pages and shared sections
- [`api/`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/api): serverless/dev API handlers
- [`supabase/`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/supabase): SQL setup scripts and edge function

## 5. Route Map

The app uses manual path checks in `App.tsx`.

| Route | Purpose | Component |
| --- | --- | --- |
| `/` | Home page | `Hero`, `AboutSection`, `ClientsSection`, `InnovationSection`, `Stats`, `AIDataServices`, `FAQSection`, `CTASection` |
| `/ai-services` | AI services landing page | `AIDataServicesPage` |
| `/ai-projects` | AI projects showcase | `AIProjectsPage` |
| `/type-a-data-servicing` | Service detail page | `TypeADataServicing` |
| `/type-b-horizontal-llm-data` | Service detail page | `TypeBHorizontalLLMData` |
| `/type-c-vertical-llm-data` | Service detail page | `TypeCVerticalLLMData` |
| `/type-d-aigc` | Service detail page | `TypeDAIGC` |
| `/philanthropy` | Philanthropy/impact page | `PhilanthropyImpactPage` |
| `/careers` | Careers overview | `CareersPage` |
| `/join-us` | Application form | `JoinUsPage` |
| `/contact`, `/contact-us` | Contact form | `ContactPage` |
| `/about-us` | Company page | `AboutUsPage` |
| `/offices` | Offices page | `OfficesPage` |
| `/privacy-policy`, `/privacypolicy` | Privacy content | `PrivacyPolicyPage` |
| `/login`, `/login2` | Login | `LoginPage2` |
| `/signup` | Signup | `SignUpPage` |
| `/dashboard` | User dashboard or admin redirect target | `DashboardPage` or `AdminDashboardPage` |
| `/admin`, `/admin/dashboard` | Admin dashboard | `AdminDashboardPage` |
| `/admin/users` | User management | `UserManagementPage` |
| `/admin/applicants` | Applicants pipeline | `AdminApplicantsPage` |
| `/admin/analytics` | Analytics | `AdminAnalyticsPage` |
| `/admin/contacts` | Contact inbox | `AdminContactsPage` |
| `/interview/:applicantId` | Public AI interview session | `AIInterviewPage` |

## 6. Feature Areas

### Marketing site

The public site is composed of large standalone page components and smaller home-page sections. Most content is static and presentation-focused.

Key files:
- [`components/Navbar.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/components/Navbar.tsx)
- [`components/Footer.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/components/Footer.tsx)
- [`components/Hero.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/components/Hero.tsx)
- [`components/AboutUsPage.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/components/AboutUsPage.tsx)
- [`components/AIDataServicesPage.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/components/AIDataServicesPage.tsx)
- [`components/AIProjectsPage.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/components/AIProjectsPage.tsx)

### Contact flow

- [`components/ContactPage.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/components/ContactPage.tsx) inserts messages into `public.contacts`.
- The form applies a 5-minute cooldown using both local storage and a recent-row Supabase check.
- New rows are created with status `New`.

### Careers and application flow

- [`components/CareersPage.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/components/CareersPage.tsx) presents openings and explains the pipeline.
- [`components/JoinUsPage.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/components/JoinUsPage.tsx) collects applicant details.
- CV files are uploaded to the public Supabase storage bucket `cvs`.
- Applicant records are inserted into `public.applicants` with status `New`.
- The page prevents duplicate applications by checking for an existing applicant row by email before insert.

### Authentication and user dashboard

- [`auth.ts`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/auth.ts) wraps Supabase auth and mirrors profile data into local storage.
- Session state is synchronized via a custom browser event: `lifewood-auth-changed`.
- The dashboard supports:
  - profile editing
  - avatar upload/compression
  - password change for non-super-admin users
  - role-aware navigation
- Main file: [`components/DashboardPage.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/components/DashboardPage.tsx)

### Admin back office

#### Admin dashboard

- [`components/AdminDashboardPage.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/components/AdminDashboardPage.tsx)
- Pulls users, applicants, and contacts.
- Calls `sync_all_auth_users_to_public_users()` before loading admin data.
- Auto-refreshes every 30 seconds.

#### User management

- [`components/UserManagementPage.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/components/UserManagementPage.tsx)
- Lists users from `public.users`
- Updates user roles
- Deletes accounts through the `admin_delete_user_account(uuid)` RPC
- Protects the fixed super admin from deletion in the UI and DB function

#### Applicants

- [`components/AdminApplicantsPage.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/components/AdminApplicantsPage.tsx)
- Loads `applicants` and `interview_results`
- Uses Supabase realtime channels to refresh applicant/interview state
- Sends applicant emails through EmailJS
- Supports statuses such as `New`, `Reviewed`, `Pending Interview`, `Interview Completed`, `Accepted`, `Rejected`, and `HR Interview`
- Builds interview links as `/interview/{applicantId}`

#### Contacts

- [`components/AdminContactsPage.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/components/AdminContactsPage.tsx)
- Reads/reviews/deletes contact rows
- Sends reply emails through EmailJS
- Updates contact statuses such as `Reviewed` and `Replied`

#### Analytics

- [`components/AdminAnalyticsPage.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/components/AdminAnalyticsPage.tsx)
- Aggregates data from `users`, `applicants`, and `contacts`
- Includes chart-based summaries and a downloadable Excel-compatible report
- Falls back to demo-style visual data when applicant data is empty

### AI interview workflow

Main implementation:
- [`components/AIInterviewPage.tsx`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/components/AIInterviewPage.tsx)
- [`api/interview-applicant.ts`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/api/interview-applicant.ts)
- [`api/interview-complete.ts`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/api/interview-complete.ts)
- [`api/gemini.ts`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/api/gemini.ts)
- [`ai_interview_workflow.md`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/ai_interview_workflow.md)

Current behavior:
- Interview link format: `/interview/:applicantId`
- Link validity: 24 hours from `applicants.created_at`
- Interview length: 15 minutes
- AI asks exactly 3 questions
- Completion is detected by `[END_INTERVIEW]`
- Transcript is evaluated by Gemini with a local scoring fallback
- Results are persisted into `interview_results`
- Applicant status is updated to `Interview Completed`
- If server persistence fails, the page falls back to direct Supabase writes

## 7. API Layer

### [`api/gemini.ts`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/api/gemini.ts)

- Proxies requests to `gemini-2.5-flash:generateContent`
- Reads `GEMINI_API_KEY` from server environment
- Returns upstream response body/status directly
- Handles leaked-key 403 responses with a friendlier service message

### [`api/interview-applicant.ts`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/api/interview-applicant.ts)

- Reads applicant metadata for the public interview page
- Uses `SUPABASE_SERVICE_ROLE_KEY` when available
- Returns applicant name, email, status, `createdAt`, applied position, and interview lock state

### [`api/interview-complete.ts`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/api/interview-complete.ts)

- Marks the applicant as `Interview Completed`
- Inserts or updates `interview_results`
- Returns whether interview result persistence succeeded

## 8. Authentication Model

The project uses Supabase Auth, but it also keeps a mirrored local auth profile for fast UI access.

Important auth details:

- Local storage key: `lifewood_auth_user`
- Roles normalized by `auth.ts`: `USER`, `ADMIN`, `SUPER ADMIN`
- The navbar and admin shell listen for `lifewood-auth-changed`
- Profile updates sync both auth metadata and `public.users`
- Offline/network failure handling exists for some profile update paths

### Super admin behavior

[`auth.ts`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/auth.ts) contains a fixed super-admin flow tied to `admin@gmail.com`.

Maintenance note:
- This hardcoded credential approach should be removed or hardened before production use.

## 9. Database Model

### `public.users`

Managed by [`supabase/users_setup.sql`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/supabase/users_setup.sql)

Purpose:
- Mirrors authenticated Supabase users into an app-facing table
- Supports admin reads, role updates, dashboard stats, profile fields, and delete RPCs

Main columns:
- `id`
- `display_id`
- `email`
- `full_name`
- `first_name`
- `last_name`
- `phone`
- `school`
- `avatar_url`
- `role`
- `status`
- `last_seen`
- `created_at`
- `updated_at`

Important functions/RPCs:
- `sync_auth_user_to_public_users()`
- `sync_all_auth_users_to_public_users()`
- `admin_delete_user_account(uuid)`

### `public.applicants`

Managed by [`supabase/applicants_setup.sql`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/supabase/applicants_setup.sql)

Purpose:
- Stores job applications submitted through `JoinUsPage`

Main columns:
- `id`
- `first_name`
- `last_name`
- `gender`
- `age`
- `phone`
- `email`
- `position`
- `country`
- `address`
- `cv_name`
- `cv_url`
- `status`
- `created_at`

### `public.interview_results`

Managed by:
- [`supabase/applicants_setup.sql`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/supabase/applicants_setup.sql)
- [`supabase/create_interview_results_table.sql`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/supabase/create_interview_results_table.sql)

Purpose:
- Stores AI interview transcript, score, and evaluation summary

Main columns:
- `id`
- `applicant_id`
- `qa_transcript`
- `interview_score`
- `evaluation_summary`
- `created_at`

### `public.contacts`

Managed by [`supabase/contacts_setup.sql`](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/supabase/contacts_setup.sql)

Purpose:
- Stores contact inquiries from the public form

Main columns:
- `id`
- `name`
- `email`
- `message`
- `status`
- `created_at`

### Storage bucket

Managed in `applicants_setup.sql`

Bucket:
- `cvs`

Purpose:
- Public storage for applicant CV uploads

## 10. Row Level Security and Access Pattern

The project mixes authenticated admin access with a few intentionally public write flows.

Current pattern:
- Public inserts allowed for `contacts`
- Public inserts allowed for `applicants`
- Public inserts/updates allowed for `interview_results`
- Public update allowed for interview completion on `applicants`
- Authenticated users can read/update many admin-facing tables
- Admin-like capabilities are enforced partly in UI logic and partly through Supabase policies/RPC checks

Maintenance note:
- The public interview update policies are convenient for the current flow, but they are broader than an ideal locked-down production design.

## 11. Environment Variables

### Client-side variables

| Variable | Required | Used for |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Browser Supabase client |
| `VITE_SUPABASE_ANON_KEY` | Yes | Browser Supabase client |
| `VITE_SUPABASE_EMAIL_REDIRECT_TO` | Recommended | Signup email verification redirect |
| `VITE_EMAILJS_SERVICE_ID` | Recommended | Applicant/contact admin emails |
| `VITE_EMAILJS_SCREENING_TEMPLATE_ID` | Recommended | AI screening invitation emails |
| `VITE_EMAILJS_DECISION_TEMPLATE_ID` | Recommended | Acceptance/rejection/reply emails |
| `VITE_EMAILJS_PUBLIC_KEY` | Recommended | EmailJS client auth |

### Server-side variables

| Variable | Required | Used for |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes for AI interview | `/api/gemini` proxy |
| `SUPABASE_SERVICE_ROLE_KEY` | Strongly recommended | interview lookup/completion APIs |
| `SUPABASE_URL` | Optional fallback | server-side Supabase URL alias |
| `SUPABASE_ANON_KEY` | Optional fallback | server-side anon key fallback |
| `RESEND_API_KEY` | Optional | Supabase Edge Function `send-email` |

Important note:
- Some EmailJS defaults are hardcoded in admin components as fallbacks. They should be treated as temporary and replaced with environment-based configuration.

## 12. Setup Checklist

### Local development

1. Install dependencies with `npm install`.
2. Create `.env.local` with the variables listed above.
3. In Supabase SQL Editor, run:
   - `supabase/users_setup.sql`
   - `supabase/contacts_setup.sql`
   - `supabase/applicants_setup.sql`
4. Run `supabase/interview_completion_policy.sql` if you are updating an existing database and need to add the public interview update policies.
5. If the interview table is missing on an older environment, run `supabase/create_interview_results_table.sql`.
6. Ensure a public storage bucket named `cvs` exists if `applicants_setup.sql` has not created it yet.
7. Start the app with `npm run dev`.
8. Run the baseline quality checks:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run test:run`

### Production deployment

1. Deploy the frontend and `api/` handlers together.
2. Set both client and server environment variables in the host platform.
3. Keep SPA rewrites enabled so path-based routing works for deep links like `/admin/users` and `/interview/:id`.
4. Verify that Supabase auth redirect URLs include the production `/login` path if email confirmation is enabled.
5. Set `SUPABASE_SERVICE_ROLE_KEY` for the interview API routes; the server handlers no longer fall back to anon keys.

## 13. Repository Structure

```text
lifewood-web/
|-- api/                      # Gemini and interview server handlers
|-- components/               # Pages and shared UI sections
|-- docs/                     # Project documentation
|-- supabase/
|   |-- *.sql                 # Database setup and policy scripts
|   `-- functions/send-email/ # Optional edge function using Resend
|-- App.tsx                   # Manual route switcher
|-- auth.ts                   # Auth and profile sync logic
|-- index.html                # Global HTML shell and Tailwind CDN config
|-- index.tsx                 # App bootstrap
|-- supabaseClient.ts         # Shared Supabase browser client
|-- vite.config.ts            # Vite config and local API middleware
`-- vercel.json               # Production rewrites
```

## 14. Notable Non-Core Files

The repository also contains a few files that do not appear to be primary runtime entrypoints:

- `tmp_*` files in the project root
- `metadata.json`
- `update-dashboard.js`

These look like generated artifacts, imports from earlier tooling, or one-off maintenance scripts rather than the main app code. They can be reviewed separately before cleanup.

## 15. Known Design and Maintenance Characteristics

These are not necessarily bugs, but they are important for future maintainers:

- Routing is custom, so adding pages means updating `App.tsx`, nav components, and manual navigation handlers.
- Tailwind is configured from `index.html` instead of a standard Tailwind config/build setup.
- Some large page components are very long and mix data logic with presentation.
- Auth uses both Supabase session state and local storage mirrors.
- Admin pages depend on the `public.users` mirror table and related SQL setup, not only on `auth.users`.
- The interview flow has both API-based and direct-Supabase persistence fallbacks.
- The analytics page can show demo-style data when real applicant data is empty.

## 16. Suggested Next Cleanup Priorities

If this project is going to be maintained long term, the highest-value cleanup items are:

1. Replace manual routing with a router library.
2. Move Tailwind from CDN config into a standard local build setup.
3. Remove hardcoded admin and EmailJS fallback credentials from source.
4. Split very large page components into smaller feature modules.
5. Tighten interview-related public write policies and move all writes behind server functions.
6. Audit and clean root-level temporary files.
