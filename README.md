# SQL Studio

> An AI-powered SQL learning platform where you solve real database problems in a sandboxed PostgreSQL environment — with a Monaco editor, validation engine, AI hints, OTP authentication, and LeetCode-style progress tracking.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-sql--studio--ai.vercel.app-6366f1?style=flat&logo=vercel)](https://sql-studio-ai.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F)](https://orm.drizzle.team)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**[→ Try it live: sql-studio-ai.vercel.app](https://sql-studio-ai.vercel.app)**

---

## 📸 Screenshots

| | | |
|:---:|:---:|:---:|
| ![Home Page](https://github.com/anasansari01/images/blob/main/sqlStudio/s1.png) | ![Dashboard](https://github.com/anasansari01/images/blob/main/sqlStudio/s2.png) | ![Assignment Hub](https://github.com/anasansari01/images/blob/main/sqlStudio/s3.png) |
| *Home Page — landing page / website preview* | *Dashboard — progress tracking* | *Assignment Hub — category view* |

| | | |
|:---:|:---:|:---:|
| ![Assignments](https://github.com/anasansari01/images/blob/main/sqlStudio/s4.png) | ![AI Hints with SQL Editor](https://github.com/anasansari01/images/blob/main/sqlStudio/s5.png) | ![Mobile Responsive View](https://github.com/anasansari01/images/blob/main/sqlStudio/s6.png) |
| *Assignments — all questions with categories* | *AI-powered hints with SQL Monaco editor* | *Mobile responsiveness — fully responsive editor* |

---

## What is this?

SQL Studio is a full-stack SQL learning platform built like LeetCode — but purpose-built for SQL. Users browse problem categories, write queries in a Monaco editor, get them validated against a canonical solution at column, row count, and value level, and receive AI-powered hints when stuck. Every query runs inside an isolated PostgreSQL schema so students can never touch production data or break each other's environments.

---

## Features

### Core Platform
- **Monaco Editor** with SQL syntax highlighting, autocomplete, and `Ctrl+Enter` to run
- **Sandboxed query execution** — each assignment runs in its own PostgreSQL schema (`assignment_ecommerce`, `assignment_hr`, `assignment_school`)
- **Three-layer validation engine** — compares student output against the canonical solution at column level → row count level → value level (order-insensitive, numeric-tolerant)
- **AI-powered hints** via OpenAI and Groq — Socratic nudges from live schema context, never reveals the solution
- **Schema viewer** — shows table structure for each assignment directly in the editor UI
- **Results panel** — renders query output as a scrollable table with execution time

### Assignment Hub
- **Category cards** with live progress bars (X/Y solved per category)
- **LeetCode-style problem list** per category — searchable, filterable (solved/unsolved), sortable by difficulty
- **Six problem categories**: Top 50 SQL Interview, NeetCode 150, Aggregations, JOINs, Window Functions, Subqueries & CTEs
- **Completion badges** when all problems in a category are solved

### Authentication
- **Email + Password** registration with live password strength indicator
- **OTP email verification** on register and login (2FA) — 6-digit code sent via Gmail
- **Forgot password** — OTP-based reset flow (email → verify code → new password)
- **JWT sessions** backed by the DB (`sessions` table) — true server-side logout with jti invalidation
- **Rate-limited OTP** — 5 wrong attempts locks the code, 60-second resend cooldown on the UI

### Progress Tracking
- Per-user per-assignment solve tracking (`solved_assignments` table)
- Dashboard: total solved, total attempts, accuracy %, attempt breakdown bar (correct / wrong / error)
- Per-difficulty progress bars (easy / medium / hard)
- Full attempt history with expandable query view and status icons

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Components) |
| Language | TypeScript 5 |
| Database | PostgreSQL 16 |
| ORM | Drizzle ORM |
| Auth | JWT (`jose`) + bcrypt (`bcryptjs`) + OTP via Gmail |
| AI | OpenAI API + Groq |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Validation | Zod |
| Deployment | Vercel |

---

## Project Structure

```
sql-studio/
├── app/
│   ├── (auth)/
│   │   ├── forgot-password/        ← email → OTP → new password
│   │   ├── login/                  ← credentials + OTP step
│   │   └── register/               ← form + OTP step
│   ├── about/
│   │   └── page.tsx
│   ├── api/
│   │   ├── assignments/            ← GET all / GET by id
│   │   ├── attempts/               ← user attempt history
│   │   ├── auth/
│   │   │   ├── login/              ← verify password → send OTP
│   │   │   ├── register/           ← validate → send OTP
│   │   │   ├── verify-otp/         ← verify code → create session
│   │   │   ├── send-otp/           ← resend OTP
│   │   │   ├── logout/             ← invalidate session
│   │   │   └── me/                 ← current user
│   │   ├── dashboard/              ← user stats
│   │   ├── execute/                ← run query → validate → persist
│   │   ├── hint/                   ← AI hint generation
│   │   ├── hub/                    ← categories + per-user progress
│   │   └── seed/                   ← seed endpoint
│   ├── assignments/
│   │   └── page.tsx                ← browse all problems
│   ├── attempt/[id]/
│   │   └── page.tsx                ← full IDE (editor + panels)
│   ├── dashboard/
│   │   └── page.tsx
│   ├── hub/
│   │   ├── [slug]/                 ← LeetCode-style problem list per category
│   │   └── page.tsx                ← category cards dashboard
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx                    ← landing page
│
├── components/
│   ├── assignment/
│   │   └── assignmentCard.tsx
│   ├── categories/
│   │   └── categoryProblemClient.tsx
│   ├── coding/                     ← all IDE sub-components
│   │   ├── AttemptClient.tsx       ← main IDE orchestrator
│   │   ├── editorPanel.tsx
│   │   ├── hintPanel.tsx
│   │   ├── leftPanel.tsx
│   │   ├── mobileLayout.tsx
│   │   ├── questionPanel.tsx
│   │   ├── resultPanel.tsx
│   │   ├── schemaViewer.tsx
│   │   ├── sqlEditor.tsx           ← Monaco wrapper
│   │   └── tabButton.tsx
│   ├── dashboard/
│   │   ├── attemptBreakdownBar.tsx
│   │   ├── attemptList.tsx
│   │   ├── dashboardClient.tsx
│   │   ├── emptyState.tsx
│   │   ├── legendItem.tsx
│   │   ├── solvedItem.tsx
│   │   └── statCard.tsx
│   ├── hub/
│   │   ├── categoryHubCard.tsx
│   │   └── hubClient.tsx
│   ├── landing/                    ← landing page sections
│   │   ├── ctaSection/
│   │   ├── featureCard/
│   │   ├── featureSection/
│   │   ├── footer/
│   │   ├── hero/
│   │   └── nav/
│   ├── otp/                        ← OTP input component
│   ├── ui/                         ← shared UI primitives
│   └── difficultyBadge.tsx
│
├── constants/
│   └── features.ts                 ← landing page feature content
│
├── db/
│   ├── client.ts                   ← Drizzle + pg Pool
│   ├── schema.ts                   ← all tables + relations + types
│   └── seed.ts                     ← sandbox schemas + 12 assignments + 6 categories
│
├── hooks/
│   ├── useExecuteQuery.ts
│   ├── useHint.ts
│   ├── useMobile.ts
│   └── useUser.ts
│
├── lib/
│   ├── auth.ts                     ← JWT sign/verify, session helpers
│   ├── email.ts                    ← Gmail OTP email transport
│   ├── executeSandboxQuery.ts      ← sandboxed pg query runner
│   ├── getSchemaInfo.ts            ← introspect pg schema for viewer
│   ├── groq.ts                     ← Groq AI client
│   ├── hashPassword.ts             ← bcrypt wrappers
│   ├── openai.ts                   ← OpenAI client
│   ├── otp.ts                      ← generate, hash, verify OTP codes
│   ├── sanitizeQuery.ts            ← block dangerous SQL keywords
│   ├── utils.ts                    ← cn(), formatDuration()
│   └── validateAnswer.ts           ← three-layer result comparison
│
├── middleware.ts                   ← protect /attempt/* and /dashboard
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Database Schema

```
users               — id, name, email, passwordHash, emailVerified, createdAt
sessions            — id, userId, jti, expiresAt
otp_codes           — id, email, codeHash, purpose, attempts, expiresAt
categories          — id, slug, name, description, icon, color, displayOrder
assignments         — id, title, description, difficulty, question, sandboxSchema, solutionQuery
assignment_categories — assignmentId, categoryId, position
attempts            — id, userId, assignmentId, sqlQuery, status, rowCount, executionTimeMs
solved_assignments  — userId, assignmentId, bestQuery, solvedAt  [unique per user+assignment]
```

The `attempts.status` enum has four precise values:

| Status | Meaning |
|---|---|
| `correct` | Ran successfully and passed all validation checks |
| `wrong` | Ran successfully but the answer was incorrect |
| `error` | SQL syntax or runtime error — query failed to execute |
| `empty` | Ran successfully but returned zero rows |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local or hosted — [Neon](https://neon.tech) works great)
- OpenAI or Groq API key
- Gmail account with OAuth2 credentials for OTP emails

### 1. Clone and install

```bash
git clone https://github.com/anasansari01/sql-studio.git
cd sql-studio
npm install
```

### 2. Configure environment variables

```bash
cp env.example .env.local
```

Fill in `.env.local`:

```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/sqlstudio

# AI — OpenAI and/or Groq
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...

# JWT — generate with: openssl rand -base64 32
JWT_SECRET=your-secret-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Gmail OAuth2 — for sending OTP emails
GMAIL_USER=yourgmail@gmail.com
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
GOOGLE_REFRESH_TOKEN=1//xxxx
```

### 3. Gmail OAuth2 setup (for OTP emails)

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → enable **Gmail API**
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add `https://developers.google.com/oauthplayground` as an authorised redirect URI
4. Go to [OAuth Playground](https://developers.google.com/oauthplayground) → gear icon → use your own credentials
5. Authorise scope `https://mail.google.com/` → exchange for tokens → copy **Refresh token**
6. Fill in `GMAIL_USER`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`

### 4. Set up the database

```bash
# Create the database
createdb sqlstudio

# Push schema — creates all tables
npm run db:push

# Seed everything
npm run db:seed
```

The seed creates three PostgreSQL sandbox schemas with realistic data, 12 SQL assignments across 6 categories, and all category-to-assignment mappings with sequential ordering.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How Query Validation Works

When a user submits a query the system runs a four-step pipeline entirely server-side:

```
User submits query
       ↓
1. sanitizeQuery()
   Blocks DROP, INSERT, UPDATE, DELETE, ALTER, pg_sleep etc.
   Uses \bword\b boundaries — won't block columns named "is_deleted"
       ↓
2. executeSandboxQuery()
   SET search_path = assignment_schema
   Runs with a 5-second statement timeout
   Returns columns, rows, rowCount, executionTimeMs
       ↓
3. validateAnswer()   ← solutionQuery runs here, never sent to client
   │
   ├─ Check 1: Column names match (sorted, exact)
   │     "Missing: total_spent. Unexpected: sum" → wrong
   │
   ├─ Check 2: Row count matches exactly
   │     "Expected 3 rows, got 10" → SELECT * caught here
   │
   └─ Check 3: Row values match (order-insensitive, numeric-tolerant)
         Normalises NUMERIC strings + integers to float(4dp)
         Set comparison — ORDER BY differences are ignored
       ↓
4. Persist attempt: correct | wrong | error | empty
   If correct → upsert solvedAssignments (idempotent, unique per user+assignment)
```

The `solutionQuery` is stored server-side only and never appears in any client-facing API response.

---

## How OTP Authentication Works

```
Register:
  POST /api/auth/register   →  validate fields, send OTP to email
  User enters 6-digit code
  POST /api/auth/verify-otp (purpose=register)  →  create user + set session cookie

Login (2FA):
  POST /api/auth/login      →  verify bcrypt password, send OTP
  User enters 6-digit code
  POST /api/auth/verify-otp (purpose=login)  →  set session cookie

Forgot password:
  POST /api/auth/reset-password  →  send OTP (silent if email not found)
  User enters code + new password
  POST /api/auth/verify-otp (purpose=reset_password)  →  update passwordHash
```

Security details: codes are **bcrypt-hashed** before storage, expire in **10 minutes**, lock after **5 wrong attempts**, and are **deleted on successful verification** so they cannot be replayed.

---

## Available Scripts

```bash
npm run dev           # start dev server at http://localhost:3000
npm run build         # production build
npm run start         # start production server
npm run lint          # ESLint
npm run db:push       # sync Drizzle schema to database
npm run db:generate   # generate migration files
npm run db:migrate    # run pending migrations
npm run db:studio     # open Drizzle Studio (visual DB browser)
npm run db:seed       # seed sandbox data + assignments + categories
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `OPENAI_API_KEY` | ✅ | OpenAI API key for hint generation |
| `GROQ_API_KEY` | ✅ | Groq API key (alternative AI provider) |
| `JWT_SECRET` | ✅ | JWT signing secret — minimum 32 characters |
| `NEXT_PUBLIC_APP_URL` | ✅ | Full app URL e.g. `http://localhost:3000` |
| `GMAIL_USER` | ✅ | Gmail address used to send OTP emails |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth2 client secret |
| `GOOGLE_REFRESH_TOKEN` | ✅ | Gmail OAuth2 refresh token |

---

## Deployment

Deployed on **Vercel** at [sql-studio-ai.vercel.app](https://sql-studio-ai.vercel.app).

To deploy your own:

1. Push the repo to GitHub
2. Import into [Vercel](https://vercel.com)
3. Add all environment variables in the Vercel dashboard
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL
5. Use a hosted PostgreSQL database — [Neon](https://neon.tech) integrates natively with Vercel

---

## Sandbox Security Model

Every student query passes through multiple layers of protection:

- **Keyword sanitization** — blocks `DROP`, `ALTER`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `CREATE`, `GRANT`, `REVOKE`, `pg_sleep`, `pg_read_file`, and block comments. Uses `\bword\b` regex boundaries to avoid false positives on column names like `is_deleted` or table names containing blocked substrings.
- **Schema isolation** — `SET search_path TO assignment_schema` scopes every query to that assignment's tables only. Students cannot reference other schemas.
- **Statement timeout** — queries are killed after 5 seconds.
- **SELECT-only enforcement** — queries must begin with `SELECT` or `WITH`. Everything else is rejected before reaching the database.
- **Row display cap** — results are capped at 200 rows for the UI, while the full `rowCount` is retained for accurate validation.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the project:

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

---

## 👨‍💻 Author

Built with passion by **Anas Ansari** — a developer dedicated to AI-powered applications, clean architecture, and modern web technologies.

[![GitHub](https://img.shields.io/badge/GitHub-anasansari01-181717?logo=github&style=flat)](https://github.com/anasansari01)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Anas%20Ansari-0077B5?logo=linkedin&style=flat)](https://linkedin.com/in/4nas-ansari)

---

<p align="center">
  <strong>If you like this project, consider giving it a ⭐ on GitHub!</strong>
</p>

<p align="center">
  <a href="https://github.com/anasansari01/sql-studio">
    <img src="https://img.shields.io/github/stars/anasansari01/sql-studio?style=social" alt="GitHub stars">
  </a>
  &nbsp;·&nbsp;
  <a href="https://sql-studio-ai.vercel.app">sql-studio-ai.vercel.app</a>
</p>
