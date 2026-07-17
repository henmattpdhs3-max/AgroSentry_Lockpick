# AgroSentry Pro

**Community-powered agricultural intelligence for Indonesian smallholder farmers.**

AgroSentry Pro turns every crop disease diagnosis into two things at once: immediate, trustworthy advice for the farmer who submitted it, and anonymous intelligence that strengthens disease monitoring for every farmer nearby. Diagnosis is the entry point — not the destination.

## Why this exists

Indonesian smallholder farmers often lack access to agricultural experts, get generic or unreliable advice online, and have no visibility into disease trends affecting their region. Most diagnosis tools stop the moment they name the disease. AgroSentry keeps going: every verified observation feeds a shared, anonymous map of regional crop health.

## Features

| # | Feature | Status |
|---|---------|--------|
| 1 | AI Disease Diagnosis (MobileNetV2 via ONNX Runtime) | 🚧 In progress |
| 2 | Explainable AI (Grad-CAM heatmap) | 🚧 In progress |
| 3 | Grounded Recommendations (RAG over Ministry of Agriculture guidance + Gemini/OpenAI) | 🚧 In progress |
| 4 | Anonymous Community Contribution | ✅ Done |
| 5 | Regional Intelligence Dashboard (Leaflet map) | 🚧 In progress |
| 6 | Community Forum | ⬜ Not started |

## Tech stack

- **Frontend:** Next.js (Pages Router), Leaflet for the regional map
- **Backend:** FastAPI
- **Inference:** ONNX Runtime running an exported MobileNetV2 model
- **Explainability:** Grad-CAM
- **Recommendations:** RAG pipeline over official guidance documents, generated via Gemini or OpenAI
- **Database:** Supabase (Postgres + Row Level Security)
- **Deployment:** Vercel (frontend), Render (backend)

## Getting started

### Prerequisites
- Python 3.11+ (a virtual environment is strongly recommended)
- Node.js 18+
- A Supabase project (see [Database setup](#database-setup) below)

### Backend setup

```bash
# from the backend directory
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

python3 -m pip install -r requirements.txt

cp .env.example .env             # then fill in your Supabase keys, see below
```

Run the server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### Frontend setup

```bash
# from the frontend directory
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

### Database setup

1. Create a Supabase project.
2. In the Supabase SQL Editor, run `feature4_supabase_schema.sql` to create the `community_diagnoses` table (Row Level Security is configured automatically — public read, service-role-only write).
3. Copy your project URL and `service_role` key into `.env` (see [Environment variables](#environment-variables)).

## Environment variables

Create a `.env` file in the backend directory (never commit it):

| Variable | Where to find it | Notes |
|---|---|---|
| `SUPABASE_URL` | Supabase Dashboard → Project Settings → API | Safe to expose publicly |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → `service_role` secret | **Backend only.** Never expose to the frontend or commit to git — it bypasses Row Level Security |
| `SUPABASE_ANON_KEY` | Same page, `anon` `public` key | Safe for frontend use, e.g. if the dashboard reads `community_diagnoses` directly from Next.js |

## Project structure

```
AgroSentry/
├── backend/
│   ├── main.py                        # FastAPI entrypoint
│   ├── feature4_backend.py            # Anonymous community contribution
│   ├── feature4_supabase_schema.sql   # community_diagnoses table + RLS
│   ├── requirements.txt
│   └── .env                           # not committed
├── frontend/
│   ├── pages/
│   ├── components/
│   └── package.json
└── README.md
```

## Testing

A standalone smoke test for the community contribution pipeline (works even before the diagnosis model is wired up):

```bash
python3 test_feature4.py
```

This submits a fake diagnosis directly to Supabase and confirms the insert, Row Level Security, and anonymity guarantees all work end to end.

## Privacy by design

No personally identifiable information is ever stored in `community_diagnoses`: no user ID, name, phone number, exact GPS coordinates, or raw photo. Locations are resolved to district level only, and timestamps are bucketed to the hour, so individual submissions can't be fingerprinted back to a specific farmer.

## Roadmap

Explored as future directions, not part of this build: nationwide disease forecasting, government monitoring dashboards, agribusiness analytics, supply chain optimization, commodity intelligence, and advanced epidemiological modelling.
