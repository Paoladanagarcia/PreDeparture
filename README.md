# PreDeparture

PreDeparture is a web app that helps international students prepare for an exchange abroad. It turns scattered information about visas, housing, insurance, banking, arrival logistics and funding into a personalized roadmap.

The first supported destination is UC Berkeley in the United States.

## Features

- Personalized onboarding for destination, university, nationality, arrival date and duration
- Chronological checklist before departure and after arrival
- Timeline view grouped by preparation phase
- Resource guides for visa, housing, banking, phone plans, arrival, scholarships and insurance
- Local fallback assistant with optional external AI endpoint
- Profile page with exchange details and progress
- About / Sources page explaining official-source guidance and deadline limitations
- Mobile navigation and responsive dashboard layout

## Tech Stack

- React
- TypeScript
- Vite
- TanStack Router
- Tailwind CSS
- shadcn/radix UI components
- Vercel-ready static deployment

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

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

The production build is generated in the `dist` folder.

## Deployment

This project is configured as a standard Vite/React single-page app.

For Vercel:

- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrites are configured in `vercel.json`

For Netlify:

- Build command: `npm run build`
- Publish directory: `dist`
- Add a SPA redirect to send all routes to `index.html` if needed

## Optional Assistant Endpoint

The assistant works locally with a free fallback knowledge base. If you later add your own API endpoint, set:

```bash
VITE_AI_ASSISTANT_ENDPOINT=https://your-endpoint.example.com
```

Without this variable, the app keeps using the local fallback assistant.

## Source and Safety Note

PreDeparture is a preparation tool, not an official university, immigration, legal, medical or financial authority.

Deadlines are planning estimates based on the user's arrival date. Students should verify important requirements directly with official sources such as UC Berkeley, their home university, the relevant embassy or government websites before paying fees, booking appointments, signing housing contracts or submitting documents.
