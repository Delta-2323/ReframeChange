# Game Changer — REM16™ Framework

## Overview

A change management web application based on the REM16™ framework that maps stakeholders to one of 16 distinct mental models and generates AI-powered, psychologically safe communication messages tailored to each model.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/game-changer)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **AI Integration**: Replit AI Integrations → OpenAI (gpt-5.2)
- **Charts**: Recharts (mental model distribution)
- **Forms**: react-hook-form + @hookform/resolvers + zod

## Structure

```text
artifacts/
  api-server/       # Express API server
    src/
      lib/rem16.ts  # REM16™ mental model logic engine
      routes/
        surveys.ts  # Survey submission + retrieval
        projects.ts # Project context management
        aiMessages.ts # AI message generation
        dashboard.ts  # Stats and analytics
  game-changer/     # React + Vite frontend
    src/
      pages/
        Home.tsx
        survey/SurveyForm.tsx
        survey/SurveyResult.tsx
        dashboard/ManagerDashboard.tsx
        dashboard/MessageReview.tsx

lib/
  api-spec/openapi.yaml       # OpenAPI contract (source of truth)
  api-client-react/           # Generated React Query hooks
  api-zod/                    # Generated Zod schemas
  db/src/schema/              # Drizzle ORM schemas
    surveys.ts
    projects.ts
    aiMessages.ts
  integrations-openai-ai-server/  # OpenAI server-side integration
  integrations-openai-ai-react/   # OpenAI React client hooks
```

## Key Features

### REM16™ Mental Models
16 models derived from 3 dimensions:
- **Thinking Focus** (HBDI-based): Proof | Process | People | Possibility
- **Orientation**: Eager | Cautious
- **Change Role**: Rockstar | Roadie

### Stakeholder Survey
4-question multi-step form with progress indicator. Outputs the stakeholder's mental model archetype.

### Manager Dashboard
- PIN-protected (password: `manager123`)
- Overview with stats and mental model distribution bar chart
- Projects management (BCIP Canvas, Change Logic, Change Strategy)
- Survey responses table
- AI message generation, review, and approval workflow

### AI Message Generation
Uses OpenAI gpt-5.2 via Replit AI Integrations to generate tailored, psychologically safe change management messages. No user API key required.

## Development

```bash
# Run all services
pnpm --filter @workspace/game-changer run dev   # Frontend (port 19819)
pnpm --filter @workspace/api-server run dev      # API (port 8080)

# DB migrations
pnpm --filter @workspace/db run push

# Codegen after OpenAPI changes
pnpm --filter @workspace/api-spec run codegen
```

## API Endpoints

All prefixed with `/api/`:
- `POST/GET /surveys` — survey submission and retrieval
- `POST/GET /projects` + `PUT /projects/:id` — project CRUD
- `POST/GET /messages` + `PUT /messages/:id` — AI message management
- `GET /dashboard/stats` — analytics and mental model distribution
