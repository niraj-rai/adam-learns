# AdamLearns — Interactive Science & Math Lab

An interactive learning website for a Grade 8 student at an IB school in Bengaluru. It is aligned to **IB MYP** and cross-mapped to **CBSE/NCERT**, so each topic works for both boards.

**Status:** Chemistry up to Grade 8 is complete (6 units). **Physics** up to Grade 8 is complete (7 units): Measurement & Motion; Forces & Pressure; Energy, Heat & Temperature; Light; Sound; Electricity & Magnetism; Earth & Space. See [docs/curriculum/physics.md](docs/curriculum/physics.md). **Biology** is in progress: Units 1–7 (Living Things & Classification; Cells; Microorganisms; Nutrition; Human Body Systems; Health & Disease; Reproduction & Adolescence) are built; see [docs/curriculum/biology.md](docs/curriculum/biology.md). Mathematics follows. Subjects appear in the order Physics, Chemistry, Biology, Mathematics.

## Run it locally

```bash
npm --prefix app install
npm --prefix app run dev        # http://localhost:5173
npm --prefix app test           # content validation + grading tests
npm --prefix app run build      # tests → type-check → production build
```

## Hosting (GitHub Pages)

`.github/workflows/deploy-pages.yml` builds and deploys on every push to `main`.
Site URL: `https://<github-user>.github.io/<repo-name>/` (for this repo: `https://niraj-rai.github.io/Adam-learns/`).

One-time setup after creating the GitHub repo:
1. Push this folder to the repo (`main` branch).
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Add a new topic

1. Create `content/<subject>/<NN-unit>/<NN-topic>/` with `meta.json`, `lesson.mdx` and `practice.json` (copy an existing topic).
2. Fill in the IB mapping first, then the CBSE mapping (`"verified": true` only after checking the NCERT PDF).
3. Run `npm --prefix app test`. It fails loudly if anything is inconsistent.
4. A new interactive lab goes in `app/src/labs/<subject>/<lab-id>/` and is registered in `app/src/labs/registry.ts`.

## Read the plan in this order

| # | Document | What it covers |
|---|----------|----------------|
| 0 | [docs/00-master-plan.md](docs/00-master-plan.md) | Vision, board alignment, levels, and phased roadmap |
| 1 | [docs/01-tech-architecture.md](docs/01-tech-architecture.md) | Tech stack, folder structure, content schema, and routes |
| 2 | [docs/02-learning-experience.md](docs/02-learning-experience.md) | Lesson flow, interactive labs, practice types, and gamification |
| 3 | [docs/curriculum/chemistry.md](docs/curriculum/chemistry.md) | **Built first.** Chemistry topic by topic, from foundations to Grade 12 |
| 4 | [docs/curriculum/physics.md](docs/curriculum/physics.md) | Physics topic map (L0–L2 complete) |
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
