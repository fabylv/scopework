# ScopeWork 🏗️

> AI-powered repair estimator for real estate investors, property managers, and contractors.

## What It Does

ScopeWork lets you walk a property, snap photos, and get an AI-generated repair list with cost estimates — powered by real contractor rates and live Home Depot pricing.

### Core Features

- 📸 **Smart Photo Capture** — AI guides you in real time: better angles, missing details, closer shots
- 🔍 **Repair Detection** — AI analyzes photos and builds a repair list automatically
- 💰 **Cost Estimation** — Materials from Home Depot API + your contractor's labor rates
- 📋 **Project Management** — Save and revisit property assessments
- 👷 **Contractor Profiles** — Add your contractors and their prices per repair type
- 🔐 **User Accounts** — Login, save projects, manage your team

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI Vision:** OpenAI GPT-4o Vision (photo analysis + repair detection)
- **Pricing:** Home Depot API
- **Auth:** (TBD)
- **Database:** (TBD)

## Project Structure

```
src/
├── app/
│   ├── (auth)/         # Login / Register
│   ├── dashboard/      # User dashboard
│   ├── projects/       # Project list + detail pages
│   └── contractors/    # Contractor management
├── components/
│   ├── ui/             # Shared UI components
│   ├── photos/         # Camera + photo analysis components
│   ├── repairs/        # Repair list components
│   └── estimates/      # Cost estimate components
├── lib/
│   ├── ai/             # AI vision integration
│   ├── homedepot/      # Home Depot API
│   └── db/             # Database helpers
└── types/              # Shared TypeScript types
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Roadmap

- [ ] Phase 1: AI photo analysis (take photo → get repair list)
- [ ] Phase 2: Cost estimation (contractor rates + HD pricing)
- [ ] Phase 3: User accounts + project saving
- [ ] Phase 4: Contractor management
- [ ] Phase 5: Monetization
