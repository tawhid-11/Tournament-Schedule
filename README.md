# TourneyPro - Tournament Fixture & Match Banner Management System

A production-grade, full-stack tournament management and match-day banner generation platform built with **Next.js 14+ (App Router)**, **TypeScript (strict)**, **PostgreSQL + Prisma ORM**, **Tailwind CSS + shadcn/ui**, **dnd-kit**, and **Satori + Resvg**.

---

## 🌟 Key Features

1. **Tournament Formats Supported**:
   - **Single Elimination**: Standard seeding (1 vs 8, 4 vs 5, etc.), automatic byes for non-powers-of-2, optional 3rd-place match.
   - **Double Elimination**: Winners Bracket + Losers Bracket with dropping teams, Grand Final, and optional Grand Final Reset match.
   - **Round Robin**: Canonical circle method (Berger tables), single or double leg (home & away), handles odd team counts with rest rounds.
   - **Group Stage + Knockout**: FIFA World Cup / UEFA Champions League style group pots followed by knockout brackets.
   - **Swiss System**: Non-elimination record-based pairing avoiding rematches.
   - **Custom Multi-Stage**: Freely chain stages from Groups to Round of 16 to Quarter-Finals to Final.
   - **Generic Sports Model**: Football (goals), Cricket (runs/wickets), Badminton/Tennis (sets), Basketball/Esports (points).

2. **User-Controlled Group Builder (`@dnd-kit`)**:
   - Drag-and-drop teams directly into groups.
   - One-click **Auto Draw** (FIFA-style Seeded Pots, Snake Draft, or Random).
   - Real-time group size validation with uneven group warnings.
   - Configurable qualification thresholds (e.g. Top 2 advance, Best 3rd-placed).

3. **Constraint-Based Auto-Scheduler**:
   - Intelligent scheduling based on start date, time slots, venue availability, and matchday ordering.
   - **Conflict Detection**: Real-time detection of same-day team double-booking, rest day violations, and venue double-booking.

4. **Results, Standings & Progression**:
   - Live standings tables with configurable tie-breakers: Points ➔ Goal Difference ➔ Goals For ➔ Head-to-Head ➔ Wins.
   - Score entry modal with extra time, penalty shootout, and walkover handling.
   - **Automatic Progression**: Advancing winners/losers instantly to downstream matches (`Winner of M1`).

5. **Server-Side Match Banner Studio (`Satori + Resvg`)**:
   - **5 Built-In Templates**: Modern Bold, Cyber Neon, Classic Heritage, Minimalist Dark, Stadium Broadcast.
   - **4 Output Dimensions**:
     - `1080x1080` (Instagram Post)
     - `1080x1920` (Instagram / TikTok Story)
     - `1920x1080` (YouTube / Facebook Landscape)
     - `1200x630` (Twitter / Meta Link Preview)
   - **Dynamic Server Endpoint**: `GET /api/banners/[matchId]?template=&size=` returns high-resolution PNGs.
   - **Bulk ZIP Export**: Download all match banners for a stage/round in a single ZIP file.

---

## 🏗️ Architecture Diagram

```mermaid
flowchart TD
    subgraph UI ["User Interface (Next.js 14 App Router)"]
        Dashboard["Dashboard & Wizard"]
        DnD["Group Builder (@dnd-kit)"]
        Bracket["Interactive Bracket Tree"]
        SchedulerUI["Calendar & Conflict Alert"]
        Studio["Banner Studio & Preview"]
        Public["Public Read-Only Live Hub"]
    end

    subgraph CoreEngine ["Pure Engines (Zero DB/UI Dependencies)"]
        FixtureEngine["/lib/fixture-engine<br/>• Round Robin<br/>• Single Elimination<br/>• Double Elimination<br/>• Swiss System<br/>• Standings & Progression"]
        ConstraintScheduler["/lib/scheduler<br/>• Auto-Scheduler<br/>• Conflict Detector"]
        BannerRenderer["/lib/banner<br/>• Satori (SVG)<br/>• Resvg (PNG)<br/>• JSZip Archiver"]
    end

    subgraph Storage ["Database & Storage Layer"]
        PrismaORM["Prisma Client"]
        Postgres[("PostgreSQL Database")]
        StoreRepo["Tournament Store (Dev Fallback & Seed Data)"]
    end

    Dashboard --> FixtureEngine
    DnD --> FixtureEngine
    SchedulerUI --> ConstraintScheduler
    Studio --> BannerRenderer
    FixtureEngine --> StoreRepo
    ConstraintScheduler --> StoreRepo
    StoreRepo --> PrismaORM
    PrismaORM --> Postgres
```

---

## 📁 Folder Structure

```
├── prisma/
│   ├── schema.prisma              # PostgreSQL schema with all entities & relations
│   └── seed.ts                    # Seeding script (16-team World Cup & 8-team Single Elim)
├── src/
│   ├── app/
│   │   ├── (auth)/                # Login & Auth screens
│   │   ├── (dashboard)/           # Tournaments dashboard, wizard, detail workspace
│   │   ├── (public)/              # Public share pages (/t/[slug])
│   │   └── api/                   # REST API routes (tournaments, banners, schedule)
│   ├── components/
│   │   ├── banner-studio/         # Live banner canvas & batch export
│   │   ├── tournament/            # DnD group builder, bracket viewer, score entry
│   │   └── shared/                # Navbar, sidebar, layout components
│   ├── lib/
│   │   ├── fixture-engine/        # Pure algorithms: round-robin, single/double elim, swiss
│   │   ├── scheduler/             # Constraint-based auto-scheduler & conflict detector
│   │   ├── banner/                # Satori + Resvg engine with 5 templates & ZIP packager
│   │   ├── validations/           # Zod validation schemas
│   │   └── tournament-store.ts    # In-memory repository with pre-seeded tournaments
│   └── tests/                     # 20+ Vitest unit tests for fixture & scheduling engines
├── vitest.config.ts
├── tailwind.config.ts
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tournaments?schema=public"
NEXTAUTH_SECRET="your-super-secret-jwt-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client & Database
```bash
npx prisma generate
npx prisma db push # (When connected to a PostgreSQL server)
npm run prisma:seed # (Seeds demo user, templates, 16-team & 8-team tournaments)
```

### 3. Run Unit Tests (Vitest)
```bash
npm test
```
All 20 unit tests verify odd team byes, 1 & 2-leg round robins, single elimination seeding, double elimination brackets, Swiss pairings, and schedule conflict detection.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- Default Demo Admin Login: `demo@tournament.app` / `demo123`

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tournaments` | List all tournaments |
| `POST` | `/api/tournaments` | Create new tournament via wizard |
| `GET` | `/api/tournaments/:id` | Get tournament details, matches, and stages |
| `POST` | `/api/tournaments/:id/teams` | Add teams (single or CSV bulk import) |
| `POST` | `/api/tournaments/:id/groups/draw` | Execute auto-draw (Seeded Pots, Snake, Random) |
| `POST` | `/api/tournaments/:id/fixtures/generate` | Generate fixtures via pure engine |
| `POST` | `/api/tournaments/:id/schedule/auto` | Run auto-scheduler with constraints |
| `POST` | `/api/tournaments/:id/matches/:matchId/result` | Record match score & advance winner |
| `GET` | `/api/tournaments/:id/standings` | Fetch calculated group / league standings |
| `GET` | `/api/banners/:matchId` | **Server-side PNG generation** (Satori + Resvg) |
| `POST` | `/api/tournaments/:id/banners/export-zip` | Export bulk ZIP of all match banners |
| `GET` | `/api/public/t/:slug` | Public read-only tournament hub |
