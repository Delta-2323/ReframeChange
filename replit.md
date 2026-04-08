# Game Changer — REM16™ Framework

## Overview

A change management web application based on the REM16™ framework that maps stakeholders to one of 16 distinct mental models and generates AI-powered, psychologically safe communication messages tailored to each model.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Python version**: 3.12
- **Package manager**: pnpm (frontend), pip/uv (Python backend)
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/game-changer)
- **API framework**: Python Flask (artifacts/api-server/app.py)
- **Database**: Supabase PostgreSQL (accessed via supabase-py from Python backend)
- **Storage**: Supabase Storage (project documents)
- **AI Integration**: Replit AI Integrations → OpenAI (gpt-5.2)
- **Charts**: Recharts (mental model distribution)
- **Forms**: react-hook-form + @hookform/resolvers + zod
- **PDF Extraction**: pdfjs-dist (frontend)

## Architecture

### Python Flask API Server (All Backend Logic)
All operations go through the Python Flask API at `/api/*`:
- **Projects**: CRUD, activate/deactivate toggle, document upload/download/delete, field document management
- **Surveys**: submit (with REM16™ mental model computation), list, get by ID
- **AI Messages**: generate (OpenAI), list, get, update, send email (Gmail SMTP)
- **Concerns**: create, list, assign to SME, SME response, manager response, resolve
- **Dashboard**: stats aggregation, AI-powered strategic summary

### React Frontend
The React frontend calls the Python API for all operations via `fetch()`. No direct Supabase client calls from the browser.

### REM16™ Logic
The mental model computation runs on both frontend (`rem16.ts` for display) and backend (`app.py` for survey submission).

## Structure

```text
artifacts/
  api-server/          # Python Flask API server
    app.py             # All routes: projects, surveys, messages, concerns, dashboard
  game-changer/        # React + Vite frontend
    src/
      lib/supabase-services.ts  # API client (fetch calls to Python backend)
      lib/rem16.ts              # REM16™ mental model engine (frontend display)
      lib/pdf-extract.ts        # PDF text extraction utility
      hooks/use-supabase.ts     # React Query hooks
      pages/
        Home.tsx
        survey/SurveyForm.tsx
        survey/SurveyResult.tsx
        dashboard/ManagerDashboard.tsx
        dashboard/MessageReview.tsx
        dashboard/ConcernsPage.tsx
        sme/SmeRespond.tsx
```

## Environment Variables

### Frontend (Vite)
- `VITE_SUPABASE_URL` — Supabase project URL (still needed for supabase.ts import)
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key (still needed for supabase.ts import)

### Server (Python)
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anon key
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Replit AI Integrations OpenAI proxy URL
- `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit AI Integrations API key
- `GMAIL_FROM_EMAIL` — Gmail sender address
- `GMAIL_APP_PASSWORD` — Gmail App Password (Secret)

## Key Features

### REM16™ Mental Models
16 models derived from 3 dimensions:
- **Thinking Focus** (HBDI-based): Proof | Process | People | Possibility
- **Orientation**: Eager | Cautious
- **Change Role**: Rockstar | Roadie

### Stakeholder Survey
4-question multi-step form with progress indicator. Mental model computed on both frontend and backend.

### Manager Dashboard
- PIN-protected (password: `manager123`)
- Overview with stats cards (surveys, projects, messages, approved, open concerns), RM16 analytics panel (two-column: mental model distribution with progress bars + thinking styles radar chart)
- Projects: 5 strategy components (BCIP Canvas, Change Logic, Change Strategy, Communication Plan, Stakeholder Impact) with text + PDF/Word upload + PDF text extraction; key dates (start, go-live, communication start, assessment end); activate/deactivate toggle
- Survey responses table
- AI message generation, review/edit/approve
- Concerns workflow: log concern, assign to SME, SME response via public link `/sme/respond/:id`, manager direct response, resolve

### Concerns Workflow
- `/manager/concerns` — full concerns management page (filter by status, create, assign to SME, respond directly)
- `/sme/respond/:id` — public page for SME to submit response
- Status flow: open → assigned → responded → resolved

### AI Message Generation
Uses OpenAI gpt-5.2 via Replit AI Integrations. Python backend reads survey + project from Supabase, generates message, saves to Supabase.

## Supabase Setup

Run `supabase-migration.sql` in the Supabase SQL Editor to create tables, RLS policies, and storage bucket.

Tables: `surveys`, `projects`, `ai_messages`, `conversations`, `messages`, `concerns`
Additional migration: Run `supabase-add-features.sql` for new project columns + concerns table. Run `supabase-add-field-docs.sql` for comm_plan + impact doc columns.
Storage: `project-documents` bucket (public)
RLS: Permissive policies (app uses PIN auth, not Supabase Auth)

## Development

```bash
# Frontend (auto-assigned port)
pnpm --filter @workspace/game-changer run dev

# Python API server (port 8080)
PORT=8080 python3 artifacts/api-server/app.py
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/healthz | Health check |
| POST | /api/projects | Create project |
| GET | /api/projects | List projects |
| GET | /api/projects/:id | Get project |
| PUT | /api/projects/:id | Update project |
| PATCH | /api/projects/:id/status | Toggle active/inactive |
| POST | /api/projects/:id/document | Upload document |
| GET | /api/projects/:id/document | Download document |
| DELETE | /api/projects/:id/document | Delete document |
| POST | /api/projects/:id/field-document | Upload field document |
| GET | /api/projects/:id/field-document/:field | Download field document |
| DELETE | /api/projects/:id/field-document/:field | Delete field document |
| POST | /api/surveys | Submit survey |
| GET | /api/surveys | List surveys |
| GET | /api/surveys/:id | Get survey |
| POST | /api/messages | Generate AI message |
| GET | /api/messages | List messages |
| GET | /api/messages/:id | Get message |
| PUT | /api/messages/:id | Update message |
| POST | /api/messages/:id/send-email | Send email |
| GET | /api/dashboard/stats | Dashboard stats |
| GET | /api/dashboard/rm16-analytics | RM16 model distribution + thinking styles |
| POST | /api/dashboard/ai-summary | AI strategic summary |
| POST | /api/concerns | Create concern |
| GET | /api/concerns | List concerns |
| GET | /api/concerns/:id | Get concern |
| PATCH | /api/concerns/:id/assign | Assign to SME |
| PATCH | /api/concerns/:id/sme-response | SME response |
| PATCH | /api/concerns/:id/manager-response | Manager response |
| PATCH | /api/concerns/:id/resolve | Resolve concern |
