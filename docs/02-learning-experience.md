# 02 — Learning Experience Design

## 1. The lesson loop (every topic)

| Step | What the student does | Component |
|---|---|---|
| 1. **Wonder** | Sees a hook question or phenomenon ("Why does a steel spoon sink but a steel ship float?") | `HookCard` |
| 2. **Predict** | Commits to a guess *before* seeing the answer (a strong way to fix misconceptions) | `PredictFirst` |
| 3. **See** | Watches an animated model or a guided demo in the lab | `Lab` (guided mode) |
| 4. **Try** | Changes variables freely and records observations | `Lab` (free mode) + `ObservationLog` |
| 5. **Explain** | Short concept cards, key terms, one diagram. Maximum 3 cards per screen | `ConceptCard`, `KeyTerm`, `StepReveal` |
| 6. **Practice** | 8–12 mixed questions with instant feedback and hints | `PracticePlayer` |
| 7. **Apply** | Real-life and IB Criterion D reflection ("How does this affect Bengaluru's lakes?") and an optional home experiment | `RealLife`, `HomeExperiment` |
| 8. **Check** | 5-question mastery check. Scoring 80% or more unlocks the next topic | `MasteryCheck` |

Target length: **15–25 minutes per topic**. Short sessions, often.

## 2. Interactive lab patterns (reused across subjects)

| Pattern | Example |
|---|---|
| **Slider sandbox**: change one variable, watch the model | Temperature → particle speed; concentration → pH |
| **Virtual bench**: drag equipment and substances, get a result | Filter a muddy mixture; add indicator to a solution |
| **Builder**: assemble parts, get feedback | Build an atom (p/n/e) → element name, charge, mass |
| **Sorter**: drag items into categories | Element / compound / mixture; metal / non-metal |
| **Explorer**: click to inspect | Interactive periodic table; flame zones |
| **Fair-test designer** (IB Criterion B) | Choose the independent, dependent, and controlled variables, then run the test and plot results |
| **Graph-it** (IB Criterion C) | Plot data the lab generated, then pick a conclusion |

Each lab has **Guided** mode (steps with prompts, used inside lessons) and **Free** mode (sandbox, available from `/labs`).

## 3. Practice question types

MCQ · Multi-select · Sort into bins · Match pairs · Order the steps · Fill in the blank · Numeric (with units and tolerance) · Predict & observe (runs the lab) · Label the diagram · Short answer (self-marked against a rubric, IB-style)

**Feedback rules**
- Wrong answer: give a hint first, then show a worked explanation. Never just "Wrong".
- Common misconceptions get specific feedback (for example "Particles don't expand; the *gaps* between them grow").
- Every question is tagged `ibCriterion` A–D and `difficulty` 1–3, which lets the practice player adapt (two correct in a row moves up a level).

## 4. Making it fun

- **XP** for lessons, practice, and streaks. **Levels** are named for lab ranks: *Lab Rookie → Lab Assistant → Scientist → Chief Scientist → Nobel Candidate*
- **Badges**: "Separation Specialist", "pH Detective", "Flame Master", "7-day streak"
- **Boss Challenge** at the end of each unit: a timed, mixed, scenario-based mission (for example "Rescue the village well: purify this water")
- **Daily Challenge**: 3 questions pulled from the review queue
- **Element collection**: unlock element cards as they appear in topics (Pokédex-style)
- Confetti and sound on mastery, all mutable. No leaderboards (single learner). Compete against **your own best**.

## 5. Parent dashboard (`/parent`)

- Topics completed by subject and grade, with IB/CBSE coverage percentage
- Weak areas: lowest mastery topics and most-missed misconceptions
- Time spent per week and streak history
- A printable summary of "what we learned this week"

## 6. Content writing guidelines

- Reading level: Grade 8. Short sentences. Define every new term the first time it appears.
- Use Indian and Bengaluru everyday contexts: the kitchen (haldi, lime, baking soda), filter coffee (filtration), the monsoon, Bellandur lake foam, idli batter (fermentation), agarbatti smoke (diffusion), Diwali (combustion and colours).
- One idea per card. Show a picture or animation before the text wherever possible.
- Every topic lists the **common misconceptions** it targets.
- Safety first: home experiments use only kitchen-safe materials, with an adult note.
