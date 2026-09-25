import { describe, expect, it } from 'vitest'
import { BLOOD, cardiacOutput, correctLoop, PATH } from './model'

describe('heart and circulation', () => {
  it('at 72 beats per minute the heart pumps about 5 litres a minute', () => {
    expect(cardiacOutput(72)).toBeCloseTo(5, 0)
  })
  it('blood picks up oxygen in the lungs and the left side carries oxygenated blood', () => {
    expect(PATH.find((p) => p.id === 'lungs')!.oxygenated).toBe(true)
    expect(PATH.find((p) => p.id === 'lv')!.oxygenated).toBe(true)
    expect(PATH.find((p) => p.id === 'rv')!.oxygenated).toBe(false)
  })
  it('recognises the loop in order from any starting point, and rejects a wrong order', () => {
    const ids = PATH.map((p) => p.id) as string[]
    expect(correctLoop([...ids.slice(3), ...ids.slice(0, 3)])).toBe(true)
    expect(correctLoop([...ids].reverse())).toBe(false)
  })
  it('blood shares add up to 100%', () => {
    expect(BLOOD.reduce((s, b) => s + b.share, 0)).toBe(100)
  })
})
