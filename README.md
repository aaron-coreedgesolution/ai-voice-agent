# 🎯 AI Voice Agent Tool

A comprehensive web application for configuring, testing, and analyzing AI voice agent calls in logistics scenarios. Built with React, FastAPI, and Supabase, integrated with Retell AI for voice capabilities and OpenAI for transcript analysis.

## 🌟 Features

### ✅ **Core Functionality**
- **Agent Configuration**: Create and manage AI voice agents with custom prompts
- **Web Call Integration**: Start voice calls using Retell AI Web SDK
- **AI-Powered Analysis**: Enhanced OpenAI integration for comprehensive transcript analysis
- **Webhook-Only Data**: Single source of truth with webhook-only call record creation
# 🎯 AI Voice Agent

AI Voice Agent is a web application to configure, test and analyze AI-powered phone calls for logistics scenarios. It combines a React + TypeScript frontend with a FastAPI backend, stores data in Supabase, and integrates with Retell AI (voice) and OpenAI (transcript analysis).

This README was updated to reflect the current state of the repository (TypeScript frontend, Tailwind CSS, centralized Axios API, and backend cleanup).

---

## Quick summary of recent important changes

- Frontend migrated largely to TypeScript (.tsx). Components and pages now use explicit types.
- Tailwind CSS is used across the frontend. A temporary CDN fallback is present for development; PostCSS adapter configuration was added to compile Tailwind in the dev build.
- Shared UI components were added under `frontend/src/components/ui/` (Card, Button, FormInput, Badge, Avatar, Loader, EmptyState, Table, etc.).
- API requests in the frontend use a central axios instance (`frontend/src/api.ts` and `frontend/src/api/api.ts`) with request/response interceptors.
- Backend housekeeping: removed local test files and a duplicate/typo init file (`backend/_init_.py`).

---

## Repo layout (high level)

backend/         FastAPI app, routes, services and database helpers
frontend/        React + TypeScript SPA (Vite) with Tailwind CSS
supabase/        SQL migrations and config

Key frontend folders:
- `frontend/src/components` — shared components and UI primitives
- `frontend/src/pages` — page components (Dashboard, CallRecords, AgentConfigs, CreateAgent)
- `frontend/src/api` — axios API helpers

Key backend files:
- `backend/main.py` — FastAPI app entry
- `backend/routes/agent_routes.py` — agent create/list/delete (creates agent on Retell)
- `backend/routes/call_routes.py` — start call endpoint
- `backend/routes/webhook_routes.py` — webhook receiver for Retell
- `backend/services/*` — supabase, retell client integration, enhanced webhook processing

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- Supabase project (for storage)
- Retell AI account and API key
- OpenAI API key (for analysis features)

Notes for Windows/PowerShell users: use PowerShell commands shown below. If you see execution policy restrictions for scripts or npx, run PowerShell as Administrator or use Git Bash.

---

## Local development (PowerShell-friendly)

1) Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1   # In PowerShell
pip install -r requirements.txt
```

Create `.env` in `backend/` with the keys below (example):

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
RETELL_API_KEY=your_retell_api_key
RETELL_LLM_ID=your_retell_llm_id
RETELL_VOICE_ID=11labs-Adrian
WEBHOOK_URL=https://your-public-url/webhook/retell
```

2) Frontend

```powershell
cd frontend
npm install
```

Important: If Tailwind utilities are not being compiled by Vite, install the adapter and Tailwind locally (only needed once):

```powershell
npm install -D @tailwindcss/postcss@latest tailwindcss@latest postcss@latest
```

3) Run locally (two terminals)

Backend (PowerShell):
```powershell
cd backend
uvicorn main:app --reload
```

Frontend (PowerShell):
```powershell
cd frontend
npm run dev
```

4) TypeScript check (optional but recommended):

```powershell
cd frontend
npx tsc --noEmit
```

---

## What to expect in the UI

- Dashboard — start test calls (uses Retell Web SDK), see active call with End Call button, and view recent calls.
- Call Records — paginated/grid view with expandable structured data for each call. Calls are shown newest-first.
- Agents — create agents via the Create Agent page. The UI no longer exposes an "Advanced Settings" field by default; the backend uses reasonable defaults and will create the agent on Retell.

---

## API (selected endpoints)

- `POST /agents/` — create agent (also creates agent on Retell and stores the returned `retell_agent_id` in Supabase)
- `GET /agents/` — list agent configs
- `DELETE /agents/{id}` — delete agent config
- `POST /calls/start` — start a web call (returns temporary access token for Retell; webhook will create the record when the call completes)
- `GET /calls/` — fetch call records (frontend sorts newest-first)
- `POST /webhook/retell` — webhook receiver for Retell events (call completed, transcripts, structured data enrichment)

---

## Notes on design decisions

- Centralized axios instance: frontend uses `frontend/src/api` for consistent headers, timeouts and error handling.
- Tailwind + shared UI primitives: components in `frontend/src/components/ui/` reduce duplication and make styling consistent.
- Webhook-only call creation: starting a call does not create a DB record; the webhook from Retell supplies the final, analyzed record.

---

## Cleanups performed

- Removed several local test artifacts from `backend/` (`test_retell.py`, `test_enhanced_webhook.py`, `test_dispatch_scenario.py`, `test_web_call.html`).
- Removed a malformed duplicate init file (`backend/_init_.py`) — only `backend/__init__.py` remains.

If you prefer these scripts kept for local testing, I can move them to `dev-scripts/` instead of deleting.

---

## Troubleshooting tips

- If Tailwind classes appear unstyled in the dev server, ensure `@tailwindcss/postcss` and `tailwindcss` are installed and restart Vite. A temporary CDN fallback may be present in `frontend/index.html` for quick visual testing.
- If `npx` or `npm` commands fail in PowerShell due to execution policy, run PowerShell as Administrator or use Git Bash.
- If Retell calls don't connect, verify `RETELL_API_KEY` and `WEBHOOK_URL` are correct and reachable from the public internet.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes and run `npx tsc --noEmit` (frontend) and start backend to verify
4. Submit a pull request with a clear description of changes

---

## License

MIT

---

If you want, I can:

- Run the TypeScript check and the dev server here and report errors (one command at a time), or
- Move the removed backend test scripts into `dev-scripts/` instead of deleting them, or
- Add a short `backend/README.md` with local dev tips and environment variables.

Which of those would you like next?
