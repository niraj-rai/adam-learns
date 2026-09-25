import type { ComponentType } from 'react'
import {
  PracticeSet,
  SubjectMeta,
  TopicMeta,
  UnitMeta,
  type PracticeSet as PracticeSetT,
  type SubjectMeta as SubjectMetaT,
  type TopicMeta as TopicMetaT,
  type UnitMeta as UnitMetaT,
} from './schema'

/**
 * Content lives in /content (outside the app) as:
 *   content/<subject>/subject.json
 *   content/<subject>/<NN-unit>/unit.json
 *   content/<subject>/<NN-unit>/<NN-topic>/{meta.json, lesson.mdx, practice.json}
 * Folder numbers set the order; ids come from the folder names minus the number prefix.
 */

const subjectFiles = import.meta.glob('../../../content/*/subject.json', { eager: true, import: 'default' })
const unitFiles = import.meta.glob('../../../content/*/*/unit.json', { eager: true, import: 'default' })
const topicFiles = import.meta.glob('../../../content/*/*/*/meta.json', { eager: true, import: 'default' })
const practiceFiles = import.meta.glob('../../../content/*/*/*/practice.json', { eager: true, import: 'default' })
type MdxModule = { default: ComponentType<{ components?: Record<string, unknown> }> }
const lessonFiles = import.meta.glob<MdxModule>('../../../content/*/*/*/lesson.mdx')

export type Subject = SubjectMetaT & { units: Unit[] }
export type Unit = UnitMetaT & { subjectId: string; order: number; topics: Topic[] }
export type Topic = TopicMetaT & {
  subjectId: string
  unitId: string
  order: number
  /** "chemistry/matter/states-of-matter" — stable key for progress */
  key: string
  hasPractice: boolean
  loadLesson?: () => Promise<MdxModule>
}

const stripOrder = (seg: string) => seg.replace(/^\d+-/, '')
const orderOf = (seg: string) => Number(seg.match(/^(\d+)-/)?.[1] ?? 0)
const segments = (path: string) => path.replace('../../../content/', '').split('/')

function parse<T>(schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: unknown } }, value: unknown, path: string): T {
  const result = schema.safeParse(value)
  if (!result.success) {
    throw new Error(`Invalid content in ${path}:\n${String(result.error)}`)
  }
  return result.data as T
}

function build() {
  const subjects = new Map<string, Subject>()
  for (const [path, raw] of Object.entries(subjectFiles)) {
    const [subjectDir] = segments(path)
    const meta = parse<SubjectMetaT>(SubjectMeta, raw, path)
    if (meta.id !== subjectDir) throw new Error(`${path}: id "${meta.id}" must match folder "${subjectDir}"`)
    subjects.set(meta.id, { ...meta, units: [] })
  }

  const units = new Map<string, Unit>()
  for (const [path, raw] of Object.entries(unitFiles)) {
    const [subjectId, unitDir] = segments(path)
    const meta = parse<UnitMetaT>(UnitMeta, raw, path)
    if (meta.id !== stripOrder(unitDir)) throw new Error(`${path}: id "${meta.id}" must match folder "${unitDir}"`)
    const subject = subjects.get(subjectId)
    if (!subject) throw new Error(`${path}: missing ${subjectId}/subject.json`)
    const unit: Unit = { ...meta, subjectId, order: orderOf(unitDir), topics: [] }
    units.set(`${subjectId}/${meta.id}`, unit)
    subject.units.push(unit)
  }

  const topics = new Map<string, Topic>()
  for (const [path, raw] of Object.entries(topicFiles)) {
    const [subjectId, unitDir, topicDir] = segments(path)
    const meta = parse<TopicMetaT>(TopicMeta, raw, path)
    if (meta.id !== stripOrder(topicDir)) throw new Error(`${path}: id "${meta.id}" must match folder "${topicDir}"`)
    const unitId = stripOrder(unitDir)
    const unit = units.get(`${subjectId}/${unitId}`)
    if (!unit) throw new Error(`${path}: missing unit.json for ${unitDir}`)
    const base = `../../../content/${subjectId}/${unitDir}/${topicDir}`
    const key = `${subjectId}/${unitId}/${meta.id}`
    const topic: Topic = {
      ...meta,
      subjectId,
      unitId,
      order: orderOf(topicDir),
      key,
      hasPractice: `${base}/practice.json` in practiceFiles,
      loadLesson: lessonFiles[`${base}/lesson.mdx`],
    }
    topics.set(key, topic)
    unit.topics.push(topic)
  }

  const practice = new Map<string, PracticeSetT>()
  for (const [path, raw] of Object.entries(practiceFiles)) {
    const [subjectId, unitDir] = segments(path)
    const set = parse<PracticeSetT>(PracticeSet, raw, path)
    const key = `${subjectId}/${stripOrder(unitDir)}/${set.topicId}`
    if (!topics.has(key)) throw new Error(`${path}: topicId "${set.topicId}" has no matching meta.json`)
    const ids = new Set<string>()
    for (const q of set.questions) {
      if (ids.has(q.id)) throw new Error(`${path}: duplicate question id "${q.id}"`)
      ids.add(q.id)
    }
    practice.set(key, set)
  }

  for (const subject of subjects.values()) {
    subject.units.sort((a, b) => a.order - b.order)
    for (const unit of subject.units) unit.topics.sort((a, b) => a.order - b.order)
  }

  // prerequisites are topic keys; make sure they exist
  for (const topic of topics.values()) {
    for (const pre of topic.prerequisites) {
      if (!topics.has(pre)) throw new Error(`${topic.key}: unknown prerequisite "${pre}"`)
    }
  }

  return { subjects, units, topics, practice }
}

const content = build()

export const getSubjects = () => [...content.subjects.values()].sort((a, b) => a.order - b.order)
export const getSubject = (id: string) => content.subjects.get(id)
export const getUnit = (subjectId: string, unitId: string) => content.units.get(`${subjectId}/${unitId}`)
export const getTopic = (subjectId: string, unitId: string, topicId: string) =>
  content.topics.get(`${subjectId}/${unitId}/${topicId}`)
export const getTopicByKey = (key: string) => content.topics.get(key)
export const getAllTopics = () => [...content.topics.values()]
export const getPractice = (topicKey: string) => content.practice.get(topicKey)

/** Next topic in reading order across units of the same subject */
export function getNextTopic(topic: Topic): Topic | undefined {
  const subject = content.subjects.get(topic.subjectId)
  if (!subject) return undefined
  const ordered = subject.units.flatMap((u) => u.topics)
  const i = ordered.findIndex((t) => t.key === topic.key)
  return i >= 0 ? ordered[i + 1] : undefined
}

export function getPrevTopic(topic: Topic): Topic | undefined {
  const subject = content.subjects.get(topic.subjectId)
  if (!subject) return undefined
  const ordered = subject.units.flatMap((u) => u.topics)
  const i = ordered.findIndex((t) => t.key === topic.key)
  return i > 0 ? ordered[i - 1] : undefined
}
