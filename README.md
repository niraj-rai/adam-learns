# Schooling — Interactive Science & Math Lab

An interactive learning website for a Grade 8 student at an IB school in Bengaluru. It is aligned to **IB MYP** and cross-mapped to **CBSE/NCERT**, so each topic works for both boards.

**Status:** Planning. Nothing is built yet.

## Read the plan in this order

| # | Document | What it covers |
|---|----------|----------------|
| 0 | [docs/00-master-plan.md](docs/00-master-plan.md) | Vision, board alignment, levels, and phased roadmap |
| 1 | [docs/01-tech-architecture.md](docs/01-tech-architecture.md) | Tech stack, folder structure, content schema, and routes |
| 2 | [docs/02-learning-experience.md](docs/02-learning-experience.md) | Lesson flow, interactive labs, practice types, and gamification |
| 3 | [docs/curriculum/chemistry.md](docs/curriculum/chemistry.md) | **Built first.** Chemistry topic by topic, from foundations to Grade 12 |
| 4 | [docs/curriculum/physics.md](docs/curriculum/physics.md) | Physics topic map |
| 5 | [docs/curriculum/biology.md](docs/curriculum/biology.md) | Biology topic map |
| 6 | [docs/curriculum/mathematics.md](docs/curriculum/mathematics.md) | Mathematics topic map |

## Top-level layout (after scaffolding)

```
Schooling/
├── README.md
├── docs/        ← plans, curriculum maps, decisions
├── content/     ← lesson content, kept separate from code (MDX + JSON)
└── app/         ← the website (Vite + React + TypeScript)
```
