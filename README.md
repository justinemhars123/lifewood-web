# Lifewood Web

Lifewood Web is a Vite + React single-page application for Lifewood's public website, careers funnel, applicant AI interview flow, user dashboard, and admin back office.

The project combines:
- A marketing site with multiple branded landing pages
- Public contact and job application forms backed by Supabase
- Supabase authentication with user and admin roles
- An AI interview workflow powered by Gemini through local/serverless API handlers
- Admin tools for user management, applicants, analytics, and contact replies

## Quick Start

1. Install dependencies:
   `npm install`
2. Create `.env.local` and add the required environment variables:
   `VITE_SUPABASE_URL`
   `VITE_SUPABASE_ANON_KEY`
   `VITE_SUPABASE_EMAIL_REDIRECT_TO`
   `VITE_EMAILJS_SERVICE_ID`
   `VITE_EMAILJS_SCREENING_TEMPLATE_ID`
   `VITE_EMAILJS_DECISION_TEMPLATE_ID`
   `VITE_EMAILJS_PUBLIC_KEY`
   `GEMINI_API_KEY`
   `SUPABASE_SERVICE_ROLE_KEY`
3. Run the Supabase SQL scripts in the `supabase/` folder.
4. Start the dev server:
   `npm run dev`
5. Build for production:
   `npm run build`

Useful checks:
- `npm run typecheck`
- `npm run lint`
- `npm run test:run`

## Documentation

Project analysis, architecture, setup notes, routes, data model, and maintenance guidance live here:

[docs/PROJECT_DOCUMENTATION.md](/c:/Users/Mumar/OneDrive/Desktop/OJT/lifewood-web/docs/PROJECT_DOCUMENTATION.md)

## Deployment Notes

- `vercel.json` rewrites `/api/*` to serverless handlers and all other paths to `index.html`.
- `vite.config.ts` mounts the same API handlers as dev middleware so the app works locally without a separate backend server.
- Client and server environment variables both need to be configured in the deployment target.
- The interview server handlers now expect `SUPABASE_SERVICE_ROLE_KEY` instead of silently falling back to anon credentials.

## Important Notes

- Routing is custom and path-based in `App.tsx`; the project does not use `react-router`.
- Tailwind is loaded from the CDN in `index.html`, not from a local Tailwind build pipeline.
- The repo still contains some temporary/generated files from earlier iterations. The main runtime entrypoints are `index.tsx`, `App.tsx`, `components/`, `api/`, and `supabase/`.
