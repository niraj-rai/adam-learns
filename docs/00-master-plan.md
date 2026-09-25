# 00 — Master Plan

## 1. Vision

A personal learning lab where a Grade 8 student can **see** science, **try** it, and **use** it. Every concept follows the same loop:

> **Wonder → See → Try → Explain → Practice → Apply**

The student should be able to:

- change things (heat, concentration, voltage) and watch what happens
- predict an outcome before running an experiment
- practise in short, game-like sessions
- move at their own pace, from core concepts to Grade 10 and later Grade 12

## 2. Who it is for

| Item | Detail |
|---|---|
| Learner | Grade 8, IB school, Bengaluru (IB **MYP Year 3**) |
| Primary board | IB MYP (Grades 6–10 = MYP 1–5), then IB DP (Grades 11–12) |
| Also covered | CBSE / NCERT (Grades 6–12), with ICSE/IGCSE overlap noted where useful |
| Device | Laptop first, and works well on a tablet (touch drag-and-drop) |
| Parent | Needs a progress dashboard showing what was covered, weak areas, and time spent |

## 3. How the boards line up

| Grade | IB | CBSE / NCERT | Our level |
|---|---|---|---|
| 5–6 | PYP 5 / MYP 1 | Class 6 *Curiosity* | **L0: Foundations** |
| 7 | MYP 2 | Class 7 *Curiosity* | **L1: Explorer** |
| 8 | MYP 3 | Class 8 *Curiosity* | **L2: Investigator** ← current |
| 9–10 | MYP 4–5 (separate sciences, eAssessment) | Class 9–10 NCERT | **L3: Analyst** |
| 11–12 | DP SL/HL | Class 11–12 NCERT (JEE/NEET base) | **L4: Specialist** |

Board differences the design has to handle:

- **IB MYP** is concept- and inquiry-led. Each unit has a *Key Concept*, *Related Concepts*, a *Global Context*, and a *Statement of Inquiry*. Students are assessed on **Criteria A–D**:
  - A: Knowing & understanding
  - B: Inquiring & designing
  - C: Processing & evaluating
  - D: Reflecting on the impacts of science

  Each IB school designs its own MYP 1–3 unit plans, so the map here is a typical sequence. **Action:** get the school's unit plan and reorder to match it.
- **CBSE** is chapter- and textbook-led (NCERT), with exam-style questions and competency-based questions.
- **Our approach:** each topic page carries both mappings. Practice is tagged by IB criterion *and* by CBSE question style, so the same content serves both boards.

## 4. Complexity scale (used on every topic)

| ★ | Meaning |
|---|---|
| ★ | Observation and vocabulary: "what is it?" |
| ★★ | Describe and classify: "what kinds are there?" |
| ★★★ | Explain with a model (particles, atoms): "why does it happen?" |
| ★★★★ | Quantify: equations and calculations, "how much?" |
| ★★★★★ | Abstract or multi-step reasoning, DP/Class 12 depth |

## 5. Subjects and rollout order

1. **Chemistry**: full detail in [curriculum/chemistry.md](curriculum/chemistry.md). Built first.
2. **Physics**: [curriculum/physics.md](curriculum/physics.md)
3. **Mathematics**: [curriculum/mathematics.md](curriculum/mathematics.md). Supports physics and chemistry calculations.
4. **Biology**: [curriculum/biology.md](curriculum/biology.md)
5. Later: Earth & Space science, Computer Science / coding

## 6. Phased roadmap

Build in stages. Each phase ships something the student can use.

### Phase 0: Scaffolding (about 1 week)
- Vite + React + TS + Tailwind v4 + shadcn/ui + TanStack Router
- Content pipeline: MDX lessons + JSON practice, validated with Zod
- Core UI: subject hub, topic page, lesson player, practice player
- Local progress tracking (XP, completed topics)

### Phase 1: Chemistry L0–L2, up to Grade 8 (about 4–6 weeks) ← **current goal**
- 6 units, 31 topics, about 25 of them core (see the chemistry doc, marked 🎯)
- 8 interactive labs: Particle Simulator, Separation Lab, Element/Compound/Mixture Sorter, Indicator Lab, Change Detective, Metals Reactivity Lab, Combustion & Flame Lab, Atom Builder (intro)
- Practice engine with 8 question types, plus chapter "Boss Challenges"

### Phase 2: Chemistry L3 (Grades 9–10)
- Atomic structure, periodic table, bonding, mole concept, reactions, acids/bases (pH), metals, carbon compounds
- Additional labs: Periodic Table Explorer, Molecule Builder (3D), Equation Balancer, Mole Calculator, Titration Lab

### Phase 3: Physics and Math L0–L2 in parallel
### Phase 4: Biology L0–L2
### Phase 5: L3 for every subject, then L4 (Grades 11–12) on demand

## 7. What "done" looks like for a topic

- [ ] `meta.json` with IB and CBSE mapping, complexity, prerequisites, and objectives
- [ ] Lesson (MDX) with at least 1 interactive element and at least 1 real-life Indian context (for example the kitchen, Bengaluru lakes, or Diwali fireworks)
- [ ] "Predict first" moment before each demo
- [ ] 10–20 practice items using at least 3 question types, tagged by IB criterion
- [ ] Safe home experiment ("Try at home", with parent note)
- [ ] 5-question "Check yourself" quiz that unlocks the next topic
- [ ] Glossary terms linked

## 8. Open decisions (need the parent's input)

1. The school's MYP 3 science unit order. We will match it if we can get it.
2. Hosting: local only, or a free deploy (Vercel/Netlify) so it works on the tablet too.
3. Should progress sync across devices? (Phase 1 uses localStorage. A backend such as Supabase can come later.)
4. Language: English only, or add Hindi/Kannada glossary support later?
