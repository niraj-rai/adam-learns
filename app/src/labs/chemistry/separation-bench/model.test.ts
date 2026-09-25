import { describe, expect, it } from 'vitest'
import { CHALLENGES, applyTool, isSolved, type ComponentId, type Mix, type ToolId } from './model'

function run(challengeId: string, tools: ToolId[]) {
  const c = CHALLENGES.find((x) => x.id === challengeId)!
  let main: Mix = { items: c.start, dissolved: c.dissolved ?? [] }
  const piles: ComponentId[][] = []
  for (const t of tools) {
    const r = applyTool(t, main)
    expect(r.ok, `${challengeId}: ${t} → ${r.message}`).toBe(true)
    main = r.next
    if (r.removed?.length) piles.push(r.removed)
  }
  return isSolved(c, main, piles)
}

describe('separation bench', () => {
  it('every challenge is solvable with its ideal tools', () => {
    for (const c of CHALLENGES) expect(run(c.id, c.ideal), c.id).toBe(true)
  })

  it('alternative correct routes work', () => {
    expect(run('muddy', ['filter'])).toBe(true)
    expect(run('chai', ['sieve'])).toBe(true)
    expect(run('triple', ['add-water', 'magnet', 'filter', 'evaporate'])).toBe(true)
  })

  it('wrong tools are rejected without changing the mixture', () => {
    const mix: Mix = { items: ['salt', 'water'], dissolved: ['salt'] }
    expect(applyTool('filter', mix).ok).toBe(false)
    expect(applyTool('magnet', { items: ['rice', 'stones'], dissolved: [] }).ok).toBe(false)
    expect(applyTool('evaporate', { items: ['sand', 'water'], dissolved: [] }).ok).toBe(false)
  })

  it('is not solved while the salt is still dissolved in added water', () => {
    const c = CHALLENGES.find((x) => x.id === 'triple')!
    let main: Mix = { items: c.start, dissolved: [] }
    const piles: ComponentId[][] = []
    for (const t of ['magnet', 'add-water', 'filter'] as ToolId[]) {
      const r = applyTool(t, main)
      main = r.next
      if (r.removed?.length) piles.push(r.removed)
    }
    expect(isSolved(c, main, piles)).toBe(false)
  })

  it('filtering before the magnet leaves a mixed pile (not solved)', () => {
    const c = CHALLENGES.find((x) => x.id === 'triple')!
    let main: Mix = { items: c.start, dissolved: [] }
    main = applyTool('add-water', main).next
    const r = applyTool('filter', main)
    expect(r.removed).toEqual(['sand', 'iron'])
    expect(isSolved(c, r.next, [r.removed!])).toBe(false)
  })
})
