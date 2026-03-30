# Game Changer — REM16™ Framework

## Overview

A change management web application based on the REM16™ framework that maps stakeholders to one of 16 distinct mental models and generates AI-powered, psychologically safe communication messages tailored to each model.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/game-changer)
- **API framework**: Express 5 (artifacts/api-server) — AI generation + email only
- **Database**: Supabase PostgreSQL (direct client from frontend)
- **Storage**: Supabase Storage (project documents)
- **AI Integration**: Replit AI Integrations → OpenAI (gpt-5.2)
- **Charts**: Recharts (mental model distribution)
- **Forms**: react-hook-form + @hookform/resolvers + zod

## Architecture

### Supabase (Frontend Direct)
All CRUD operations go directly from the React frontend to Supabase via `@supabase/supabase-js`:
- Surveys: create, list, get by ID
- Projects: create, update, list, get by ID
- AI Messages: list, get by ID, update (status/content)
- Dashboard Stats: aggregated from surveys/projects/messages
- Document Storage: Supabase Storage bucket `project-documents`

### Express Server (AI + Email Only)
The Express API server is kept only for operations requiring server-side secrets:
- `POST /api/messages` — AI message generation (needs OpenAI key)
- `POST /api/messages/:id/send-email` — email sending (needs Gmail credentials)
- `POST /api/dashboard/ai-summary` — AI landscape analysis (needs OpenAI key)

### REM16™ Logic
The mental model computation (`rem16.ts`) runs entirely on the frontend — no server call needed for survey classification.

## Structure

```text
artifacts/
  api-server/          # Express API (AI + email only)
    src/
      lib/supabase.ts  # Server-side Supabase client
      lib/email.ts     # Nodemailer + Gmail
      routes/
        aiMessages.ts  # AI generation + email sending
        dashboard.ts   # AI summary generation
  game-changer/        # React + Vite frontend
    src/
      lib/supabase.ts           # Frontend Supabase client
      lib/supabase-services.ts  # All CRUD service functions
      lib/rem16.ts              # REM16™ mental model engine (frontend)
      hooks/use-supabase.ts     # React Query hooks for Supabase
      pages/
        Home.tsx
        survey/SurveyForm.tsx
        survey/SurveyResult.tsx
        dashboard/ManagerDashboard.tsx
        dashboard/MessageReview.tsx
```

## Environment Variables

### Frontend (Vite)
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key

### Server
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anon key
- `GMAIL_FROM_EMAIL` — Gmail sender address
- `GMAIL_APP_PASSWORD` — Gmail App Password (Secret)

## Key Features

### REM16™ Mental Models
16 models derived from 3 dimensions:
- **Thinking Focus** (HBDI-based): Proof | Process | People | Possibility
- **Orientation**: Eager | Cautious
- **Change Role**: Rockstar | Roadie

### Stakeholder Survey
4-question multi-step form with progress indicator. Mental model computed on frontend via `rem16.ts`, saved directly to Supabase.

### Manager Dashboard
- PIN-protected (password: `manager123`)
- Overview with stats and mental model distribution bar chart
- Projects management with Supabase Storage document upload
- Survey responses table
- AI message generation (calls Express), review/edit/approve (Supabase direct)

### AI Message Generation
Uses OpenAI gpt-5.2 via Replit AI Integrations. Express reads survey + project from Supabase, generates message, saves to Supabase.

## Supabase Setup

Run `supabase-migration.sql` in the Supabase SQL Editor to create tables, RLS policies, and storage bucket.

Tables: `surveys`, `projects`, `ai_messages`, `conversations`, `messages`
Storage: `project-documents` bucket (public)
RLS: Permissive policies (app uses PIN auth, not Supabase Auth)

## Development

```bash
pnpm --filter @workspace/game-changer run dev   # Frontend (port 19819)
pnpm --filter @workspace/api-server run dev      # API (port 8080)
```
