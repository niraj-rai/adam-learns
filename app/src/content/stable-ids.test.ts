/// <reference types="node" />
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { BADGES } from '@/lib/badges'
import { LABS } from '@/labs/registry'
import { getAllTopics, getPractice } from './loader'

/**
 * Learners' saved progress points at these ids: topic keys (progress, time), question ids (spaced review),
 * lab ids, badge ids and reflection ids. Renaming or deleting one silently orphans that progress on every
 * device, so the ids in stable-ids.json may only ever grow.
 *
 * New content: run `UPDATE_IDS=1 npx vitest run src/content/stable-ids.test.ts` to add its ids.
 * If an id really must go, remove it from the JSON by hand and explain why in the commit.
 */
type Ids = { topics: Record<string, string[]>; labs: string[]; badges: string[]; reflections: string[] }

const FILE = path.resolve(import.meta.dirname, 'stable-ids.json')
const CONTENT = path.resolve(import.meta.dirname, '../../../content')

function current(): Ids {
  const topics: Record<string, string[]> = {}
  for (const t of getAllTopics()) topics[t.key] = (getPractice(t.key)?.questions ?? []).map((q) => q.id).sort()
  const reflections = new Set<string>()
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else if (e.name === 'lesson.mdx') for (const m of fs.readFileSync(p, 'utf8').matchAll(/<Reflect\s+id="([^"]+)"/g)) reflections.add(m[1])
    }
  }
  walk(CONTENT)
  return { topics, labs: LABS.map((l) => l.id).sort(), badges: Object.keys(BADGES).sort(), reflections: [...reflections].sort() }
}

describe('ids that saved progress depends on', () => {
  const now = current()

  if (process.env.UPDATE_IDS) {
    const old: Ids = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : { topics: {}, labs: [], badges: [], reflections: [] }
    const union = (a: string[], b: string[]) => [...new Set([...a, ...b])].sort()
    const topics: Record<string, string[]> = { ...old.topics }
    for (const [k, qs] of Object.entries(now.topics)) topics[k] = union(old.topics[k] ?? [], qs)
    const merged: Ids = { topics: Object.fromEntries(Object.entries(topics).sort()), labs: union(old.labs, now.labs), badges: union(old.badges, now.badges), reflections: union(old.reflections, now.reflections) }
    fs.writeFileSync(FILE, JSON.stringify(merged, null, 1) + '\n')
  }

  const saved: Ids = JSON.parse(fs.readFileSync(FILE, 'utf8'))

  it('keeps every topic key and question id', () => {
    const missing: string[] = []
    for (const [key, qs] of Object.entries(saved.topics)) {
      if (!now.topics[key]) { missing.push(`topic ${key}`); continue }
      for (const q of qs) if (!now.topics[key].includes(q)) missing.push(`${key}#${q}`)
    }
    expect(missing, 'renamed or removed ids would orphan learners’ progress').toEqual([])
  })

  it('keeps every lab, badge and reflection id', () => {
    expect(saved.labs.filter((id) => !now.labs.includes(id))).toEqual([])
    expect(saved.badges.filter((id) => !now.badges.includes(id))).toEqual([])
    expect(saved.reflections.filter((id) => !now.reflections.includes(id))).toEqual([])
  })

  it('has every current id recorded (run with UPDATE_IDS=1 after adding content)', () => {
    const unrecorded = Object.entries(now.topics).flatMap(([k, qs]) => (saved.topics[k] ? qs.filter((q) => !saved.topics[k].includes(q)).map((q) => `${k}#${q}`) : [`topic ${k}`]))
    expect(unrecorded).toEqual([])
    expect(now.labs.filter((id) => !saved.labs.includes(id))).toEqual([])
  })
})
