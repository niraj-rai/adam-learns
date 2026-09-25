# 01 — Tech Architecture

## 1. Stack

| Concern | Choice | Why |
|---|---|---|
| Build | **Vite** | Fast dev server; static output that can be hosted anywhere |
| UI | **React 19 + TypeScript (strict)** | Requested; type-safe content |
| Routing | **TanStack Router** (file-based, type-safe params) | Requested; typed `/$subject/$unit/$topic` routes, search-param state for lab settings |
| Styling | **Tailwind CSS v4** | Requested |
| Components | **shadcn/ui** (Radix) | Accessible building blocks: Card, Tabs, Dialog, Slider, Progress, Tooltip, Sheet |
| Animation | **Motion** (`motion/react`) | Smooth drag, spring, and layout animations for labs and rewards |
| Drag & drop | **dnd-kit** | Sorting, matching, and build-an-atom interactions (touch-friendly) |
| Simulations | SVG + Canvas 2D; **react-three-fiber + drei** (Phase 2) for 3D molecules | Particles on Canvas, diagrams in SVG, 3D only where it adds value |
| Formulas | **KaTeX** + **mhchem** (`\ce{H2O}`) | Correct chemical equations and math |
| Charts | **Recharts** | Heating curves, pH scale, reaction rates |
| Content | **MDX** (`@mdx-js/rollup`) + JSON | Lessons are text with embedded interactive components |
| Validation | **Zod** | Every `meta.json` and `practice.json` is checked at build time |
| State | **Zustand** + `persist` (localStorage) | Progress, XP, streaks, settings. Can swap to Supabase later |
| Data fetching | TanStack Query (only when a backend is added) | Not needed in Phase 1 |
| Sound | Small UI sound effects (howler or plain Audio), with a mute toggle | Makes feedback feel like a game |
| Testing | **Vitest** + React Testing Library; **Playwright** smoke tests | Especially for the practice engine's answer checking |
| Lint/format | ESLint + Prettier (or Biome) | Consistency |
| Package manager | **pnpm** | Fast; good workspace support if content becomes a package |
| Later | PWA (vite-plugin-pwa) for offline tablet use | |

## 2. Folder structure

**Rule:** content lives in `content/` and code lives in `app/`. Content is organized **subject → unit → topic**, not by grade, because one topic (for example acids and bases) runs across Grades 7, 10, and 12. Grade and board are **metadata**, so the site can filter by grade or board without duplicating files.

```
Schooling/
├── README.md
├── docs/
│   ├── 00-master-plan.md
│   ├── 01-tech-architecture.md
│   ├── 02-learning-experience.md
│   ├── curriculum/            ← topic maps per subject (source of truth for scope)
│   └── decisions/             ← short ADRs, e.g. 001-content-in-mdx.md
│
├── content/
│   ├── _shared/
│   │   ├── glossary/chemistry.json
│   │   └── images/
│   └── chemistry/
│       ├── subject.json                       ← title, colour, icon, unit order
│       ├── 01-matter-and-its-nature/
│       │   ├── unit.json                      ← unit meta, IB key concept, statement of inquiry
│       │   ├── 01-what-is-matter/
│       │   │   ├── meta.json                  ← grade/board mapping, complexity, prereqs, objectives
│       │   │   ├── lesson.mdx                 ← the lesson, embeds <ParticleSimulator/> etc.
│       │   │   ├── practice.json              ← question bank
│       │   │   ├── home-experiment.mdx        ← optional safe "Try at home"
│       │   │   └── assets/
│       │   ├── 02-states-of-matter/
│       │   └── ...
│       ├── 02-separating-mixtures/
│       └── ...
│   ├── physics/  biology/  mathematics/       ← same shape
│
└── app/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── components.json                        ← shadcn config
    └── src/
        ├── main.tsx
        ├── routes/                            ← TanStack file routes
        │   ├── __root.tsx                     ← shell: top bar, XP, theme
        │   ├── index.tsx                      ← home: continue learning, daily challenge
        │   ├── $subject/
        │   │   ├── index.tsx                  ← subject map (units as a "world map")
        │   │   └── $unit/
        │   │       ├── index.tsx              ← unit overview + boss challenge
        │   │       └── $topic/
        │   │           ├── index.tsx          ← lesson player
        │   │           └── practice.tsx       ← practice player
        │   ├── labs/
        │   │   ├── index.tsx                  ← all labs gallery ("sandbox mode")
        │   │   └── $labId.tsx
        │   ├── grade/$grade.tsx               ← "everything for Grade 8" (IB or CBSE filter)
        │   ├── review.tsx                     ← spaced-repetition review queue
        │   ├── glossary.tsx
        │   └── parent.tsx                     ← parent dashboard
        ├── components/
        │   ├── ui/                            ← shadcn generated (do not hand-edit)
        │   ├── layout/                        ← AppShell, TopBar, SubjectNav, Breadcrumbs
        │   ├── lesson/                        ← ConceptCard, PredictFirst, DidYouKnow, KeyTerm,
        │   │                                     RealLife, StepReveal, Callout, Video, Equation
        │   ├── practice/                      ← PracticePlayer + one component per question type
        │   └── gamification/                  ← XPBar, StreakFlame, BadgeToast, Confetti
        ├── labs/
        │   ├── _kit/                          ← shared lab parts: Beaker, Flask, Burner, Thermometer,
        │   │                                     Slider controls, ObservationLog, useSimulationLoop
        │   ├── chemistry/
        │   │   ├── particle-simulator/
        │   │   ├── separation-lab/
        │   │   ├── indicator-lab/
        │   │   └── ...
        │   ├── physics/
        │   └── registry.ts                    ← labId → lazy component (used by MDX + /labs)
        ├── content/                           ← loaders: import.meta.glob over ../../content
        │   ├── schema.ts                      ← Zod schemas (TopicMeta, Question, Unit…)
        │   ├── loader.ts
        │   └── mdx-components.tsx             ← components available inside lesson.mdx
        ├── stores/                            ← zustand: progress, settings, review queue
        ├── lib/                               ← utils, answer checkers, SRS scheduler, sound
        ├── hooks/
        └── styles/
```

## 3. Content schema (Zod, summarized)

```ts
// meta.json
TopicMeta = {
  id: "chem.matter.states-of-matter",
  title: "States of Matter",
  summary: string,
  complexity: 1 | 2 | 3 | 4 | 5,
  level: "L0" | "L1" | "L2" | "L3" | "L4",
  grades: {
    ib:   { programme: "MYP" | "DP", year: number, note?: string },
    cbse: { class: number, chapter?: string } | null,
  },
  ibConcepts?: { key: string, related: string[], globalContext: string },
  objectives: string[],               // "I can explain…"
  prerequisites: string[],            // other topic ids → unlock graph
  labs: string[],                     // lab ids used
  estMinutes: number,
  tags: string[],
}

// practice.json → Question[] (discriminated union on `type`)
Question =
  | { type: "mcq", prompt, options[], answer, explain }
  | { type: "multi-select", ... }
  | { type: "sort-bins", items[], bins[], answer: Record<item, bin> }
  | { type: "match-pairs", left[], right[], answer }
  | { type: "order-steps", steps[] }
  | { type: "fill-blank", text, blanks[] }
  | { type: "numeric", prompt, answer, tolerance, unit }
  | { type: "predict-observe", labId, setup, prediction options, explain }
  | { type: "label-diagram", image, hotspots[] }
  | { type: "short-answer", prompt, rubric[] }      // self-assessed against a rubric (IB-style)
  // each question also has: id, difficulty 1-3, ibCriterion "A"|"B"|"C"|"D", cbseStyle?, hint?
```

The build fails if any topic references a missing lab, a missing prerequisite, or invalid practice data.

## 4. How a lesson embeds interactivity

```mdx
import { PredictFirst, ConceptCard } from "@/components/lesson"

# States of Matter

<PredictFirst question="What happens to ice particles when you heat them?"
  options={["They get bigger", "They move faster", "They disappear"]} />

<Lab id="particle-simulator" preset={{ substance: "water", temperature: -10 }} />

<ConceptCard term="Melting point">…</ConceptCard>
```

## 5. Progress model (localStorage in Phase 1)

- `topicProgress[topicId] = { lessonDone, bestScore, attempts, lastSeen, mastery 0-1 }`
- `xp`, `streak`, `badges[]`
- `reviewQueue`: a Leitner/SM-2-lite schedule, so missed questions return after 1, 3, 7, and 14 days
- Export and import progress as JSON (backup, or move to the tablet) until there is a backend

## 6. Non-functional requirements

- **Accessibility:** keyboard-operable labs, colour-blind-safe indicator colours (colour is never the only cue), `prefers-reduced-motion`
- **Performance:** lazy-load each lab and each subject; Canvas sims run at 60fps on a mid-range tablet
- **Safety:** no external links without a parent gate; "Try at home" experiments show adult-supervision notes
- **Theming:** light/dark, and each subject has its own accent colour (Chemistry = teal, Physics = indigo, Biology = green, Math = amber)
