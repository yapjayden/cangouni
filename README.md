# CanGoUni

> *Eh, can go uni or not?* — university admission probabilities for Singapore JC & Poly students.

Enter your grades, upload a resume, pick your interests, and CanGoUni matches you
against real IGP (Indicative Grade Profile) data across all 6 local universities —
then estimates your admission chance for every course and lets you chat with an AI advisor.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Google Gemini** (`@google/generative-ai`) for resume parsing & the AI advisor
- Styling is done with **inline `style={{ }}` objects** — there is no CSS framework in
  use. Brand colors & fonts live in one place: [`src/theme.ts`](src/theme.ts).

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts: `npm run build` (production build), `npm run start` (serve the build),
`npm run lint`.

### Environment variables

Create a `.env.local` file in the project root:

```
GEMINI_API_KEY=your_google_gemini_api_key
```

The resume parser (`/api/parse-resume`) and AI advisor (`/api/chat`) need this key.
Everything else (probability scoring, filtering) runs without it.

## How it works

1. **Onboard** (`/onboard`) — a 5-step form (grades → resume → interests → industries →
   lifestyle). The profile is saved to `sessionStorage` under `cgu_profile` — nothing
   is sent to a server or database.
2. **Dashboard** (`/dashboard`) — reads that profile, runs the scoring engine, and shows
   every course ranked by your chances, with filters.
3. **Chat** (`/chat`) — an AI advisor that answers questions using your profile as context.

## Project map

```
src/
├── app/                      # Next.js App Router — each folder is a route
│   ├── page.tsx              # Landing page
│   ├── onboard/page.tsx      # 5-step profile form
│   ├── dashboard/page.tsx    # Ranked course results + filters
│   ├── chat/page.tsx         # AI advisor chat
│   ├── layout.tsx            # Root layout — loads fonts, sets metadata
│   ├── globals.css           # Global resets
│   └── api/                  # Server routes (run on the backend)
│       ├── chat/             # Streams AI advisor replies (Gemini)
│       ├── parse-resume/     # Extracts text + keywords from an uploaded resume
│       └── probability/      # Scoring endpoint
│
├── components/               # Reusable UI, grouped by feature
│   ├── chat/                 # ChatBubble, ChatInput, ChatThread
│   ├── dashboard/            # FilterSidebar, ProbabilityCard, ResultsGrid
│   └── onboard/steps/        # Interests, Industries, ResumeUpload
│
├── lib/                      # Business logic (no UI)
│   ├── probability.ts        # The admission-chance scoring engine
│   ├── courses.ts            # Course lookup / matching helpers
│   └── pdf-extract.ts        # Pulls text out of uploaded PDFs
│
├── data/
│   └── igp.ts                # The course dataset (IGP cut-off points)
│
├── types/index.ts            # Shared TypeScript types (UserProfile, CourseEntry, …)
└── theme.ts                  # 🎨 Brand colors & fonts — edit here to restyle
```

## Common edits — where to look

| I want to…                          | Edit this                                         |
| ----------------------------------- | ------------------------------------------------- |
| Change brand colors / fonts         | `src/theme.ts`                                    |
| Add or update a course              | `src/data/igp.ts`                                 |
| Tweak how chances are calculated    | `src/lib/probability.ts`                          |
| Change the onboarding questions     | `src/app/onboard/page.tsx` + `components/onboard/`|
| Change the AI advisor's behaviour   | `src/app/api/chat/route.ts`                       |
| Edit the landing page               | `src/app/page.tsx`                                |

> **Note on data:** A user's profile lives only in their browser (`sessionStorage`).
> Refreshing keeps it; closing the tab clears it. There is no database.
