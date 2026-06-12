# PreDeparture

PreDeparture helps international students prepare for an exchange in the United States. It turns scattered tasks around visas, housing, insurance, banking, funding and arrival logistics into a personalized roadmap.

The first supported host universities are UC Berkeley and Stanford University.

## What It Does

- Builds a personalized exchange profile from destination, host university, nationality, arrival date and duration
- Generates a chronological checklist before departure and after arrival
- Shows a timeline view for early, pre-departure and arrival-week priorities
- Provides official-source resource guides for visa, housing, insurance, banking, phone setup, funding and arrival
- Supports guest mode for local browser-only planning
- Supports Supabase accounts for profile, checklist and community chat sync
- Includes a Gemini-powered AI assistant through a secure Vercel API route
- Includes cohort-based community groups for students going to the same university and term

## Tech Stack

- React
- TypeScript
- Vite
- TanStack Router
- Tailwind CSS
- shadcn/radix UI components
- Supabase for optional auth, database sync and community chat
- Vercel serverless API route for the Gemini assistant

## Requirements

- Node.js `20.19+` or `22.12+`
- npm

The project may fail with Vite errors on older Node versions.

## Getting Started

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

The production build is generated in `dist`.

## Environment Variables

Create `.env.local` for local development. Use `.env.example` as the template.

```bash
GEMINI_API_KEY=your_gemini_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

`GEMINI_API_KEY` is server-side only. Do not prefix it with `VITE_`, and do not expose it in frontend code.

Supabase variables are optional for local guest-only testing. Without them, account sync and community chat will not be available.

## AI Assistant

The frontend calls `/api/ask`. The Vercel serverless route then calls Gemini with `process.env.GEMINI_API_KEY`, so the Gemini key never reaches the browser.

The assistant is scoped to exchange preparation topics such as F-1 visa, DS-160, SEVIS, housing, insurance, banking, phone plans, arrival logistics, scholarships and student community. If Gemini returns a temporary quota error, the app shows a clean usage-limit message instead of exposing backend details.

## Supabase Setup

PreDeparture works without Supabase in guest mode. To enable accounts, cloud checklist sync and community chat:

1. Create a Supabase project.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local` and to your Vercel environment variables.
3. In Supabase, open `Authentication -> URL Configuration`.
4. Set the Site URL to your deployed site, for example `https://your-project.vercel.app`.
5. Add redirect URLs:

```text
https://your-project.vercel.app/auth
http://localhost:5173/auth
```

6. Run [supabase/schema.sql](./supabase/schema.sql) in the Supabase SQL editor.
7. Enable Realtime for `predeparture_community_messages` if it is not enabled automatically.

The SQL file creates profile, progress, community membership and community message tables with row-level security policies.

## Deployment

### Vercel

Recommended deployment target.

- Build command: `npm run build`
- Output directory: `dist`
- Node version: `20.19+` or `22.12+`
- Add environment variables in `Project Settings -> Environment Variables`
- SPA rewrites are configured in `vercel.json`

Required for the AI assistant:

```text
GEMINI_API_KEY
```

Optional for auth and community:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### Netlify

The static app can be deployed to Netlify, but `/api/ask` is currently implemented as a Vercel serverless function. For Netlify, create an equivalent Netlify Function or deploy the app on Vercel for the AI assistant to work without changes.

Static deployment settings:

- Build command: `npm run build`
- Publish directory: `dist`
- Add a SPA redirect to `index.html`

## Useful Commands

```bash
npm run dev
npm run build
npm run preview
```

Type-checking:

```bash
./node_modules/.bin/tsc --noEmit
```

## Project Notes

- Guest mode stores the roadmap in the current browser only.
- Signed-in users sync profile and checklist data to Supabase.
- Signing out clears local roadmap data so another person using the same device does not see the previous account's data.
- Community cohorts are based on host university and arrival term, for example `UC Berkeley - Fall 2026`.
- The app is a preparation tool, not an official university, immigration, legal, medical or financial authority.
- Deadlines and requirements are planning guidance. Students should verify important details with official university, embassy or government websites before paying fees, booking appointments, signing housing contracts or submitting documents.
