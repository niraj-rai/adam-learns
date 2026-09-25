import { z } from 'zod'

// ---------- Board mapping (IB first, CBSE always mapped) ----------

export const IbMapping = z.object({
  programme: z.enum(['PYP', 'MYP', 'DP']),
  /** MYP 1–5 or DP 1–2 */
  year: z.number().int().min(1).max(5),
  note: z.string().optional(),
})

export const CbseMapping = z.object({
  class: z.number().int().min(1).max(12),
  /** e.g. "Curiosity Ch 7: Particulate Nature of Matter" */
  chapter: z.string().optional(),
  /** true when the chapter reference has been checked against the NCERT PDF */
  verified: z.boolean().default(false),
})

export const IbConcepts = z.object({
  keyConcept: z.string(),
  relatedConcepts: z.array(z.string()),
  globalContext: z.string(),
  statementOfInquiry: z.string().optional(),
})

export const Complexity = z.number().int().min(1).max(5)
export const Level = z.enum(['L0', 'L1', 'L2', 'L3', 'L4'])
export const IbCriterion = z.enum(['A', 'B', 'C', 'D'])

// ---------- Subject / unit / topic metadata ----------

export const SubjectMeta = z.object({
  id: z.string(),
  title: z.string(),
  tagline: z.string(),
  color: z.string(),
  icon: z.string(),
})

export const UnitMeta = z.object({
  id: z.string(),
  number: z.number().int(),
  title: z.string(),
  summary: z.string(),
  ib: IbConcepts,
  inquiryQuestions: z.object({
    factual: z.array(z.string()),
    conceptual: z.array(z.string()),
    debatable: z.array(z.string()),
  }),
  cbseChapters: z.array(z.string()),
})

export const TopicMeta = z.object({
  id: z.string(),
  number: z.string(),
  title: z.string(),
  summary: z.string(),
  emoji: z.string(),
  complexity: Complexity,
  level: Level,
  core: z.boolean().default(true),
  grades: z.object({
    ib: IbMapping,
    cbse: z.array(CbseMapping),
  }),
  ibCriteria: z.array(IbCriterion),
  objectives: z.array(z.string()).min(1),
  misconceptions: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  labs: z.array(z.string()).default([]),
  keyTerms: z.array(z.string()).default([]),
  estMinutes: z.number().int().positive(),
})

// ---------- Practice questions ----------

const QuestionBase = z.object({
  id: z.string(),
  difficulty: z.number().int().min(1).max(3),
  ibCriterion: IbCriterion,
  /** Marks questions written in CBSE/NCERT exam style */
  cbseStyle: z.boolean().default(false),
  prompt: z.string(),
  hint: z.string().optional(),
  explain: z.string(),
})

export const Question = z.discriminatedUnion('type', [
  QuestionBase.extend({
    type: z.literal('mcq'),
    options: z.array(z.string()).min(2),
    answer: z.number().int(),
    /** optional per-option feedback for misconceptions */
    feedback: z.record(z.string(), z.string()).optional(),
  }),
  QuestionBase.extend({
    type: z.literal('multi-select'),
    options: z.array(z.string()).min(2),
    answer: z.array(z.number().int()).min(1),
  }),
  QuestionBase.extend({
    type: z.literal('sort-bins'),
    bins: z.array(z.string()).min(2),
    /** item label → bin index */
    items: z.array(z.object({ label: z.string(), bin: z.number().int() })).min(2),
  }),
  QuestionBase.extend({
    type: z.literal('match-pairs'),
    pairs: z.array(z.object({ left: z.string(), right: z.string() })).min(2),
  }),
  QuestionBase.extend({
    type: z.literal('order-steps'),
    /** in the correct order; shuffled when shown */
    steps: z.array(z.string()).min(2),
  }),
  QuestionBase.extend({
    type: z.literal('fill-blank'),
    /** use ___ for each blank */
    text: z.string(),
    blanks: z.array(z.array(z.string()).min(1)).min(1),
    wordBank: z.array(z.string()).optional(),
  }),
  QuestionBase.extend({
    type: z.literal('numeric'),
    answer: z.number(),
    tolerance: z.number().nonnegative().default(0),
    unit: z.string().optional(),
  }),
  QuestionBase.extend({
    type: z.literal('short-answer'),
    modelAnswer: z.string(),
    rubric: z.array(z.string()).min(1),
  }),
])

export const PracticeSet = z.object({
  topicId: z.string(),
  questions: z.array(Question).min(1),
})

export type SubjectMeta = z.infer<typeof SubjectMeta>
export type UnitMeta = z.infer<typeof UnitMeta>
export type TopicMeta = z.infer<typeof TopicMeta>
export type Question = z.infer<typeof Question>
export type QuestionType = Question['type']
export type PracticeSet = z.infer<typeof PracticeSet>
export type IbCriterion = z.infer<typeof IbCriterion>
