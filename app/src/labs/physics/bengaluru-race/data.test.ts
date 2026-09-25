import { describe, expect, it } from 'vitest'
import { QUESTIONS, TRAVELLERS } from './data'

const at = (id: string, t: number) => TRAVELLERS.find((x) => x.id === id)!.at(t)
const arrival = (id: string) => {
  for (let t = 0; t <= 60; t += 0.1) if (at(id, t) >= 20 - 1e-9) return t
  return Infinity
}

describe('Great Bengaluru Race answers agree with the graph data', () => {
  it('first and last arrivals', () => {
    const order = TRAVELLERS.map((t) => t.id).sort((a, b) => arrival(a) - arrival(b))
    expect(order[0]).toBe((QUESTIONS[0] as { answer: string }).answer)
    expect(order[order.length - 1]).toBe((QUESTIONS[7] as { answer: string }).answer)
  })

  it('leader at 30 minutes', () => {
    const leader = TRAVELLERS.map((t) => t.id).sort((a, b) => at(b, 30) - at(a, 30))[0]
    expect(leader).toBe((QUESTIONS[4] as { answer: string }).answer)
  })

  it('metro average speed', () => {
    const kmh = 20 / (arrival('metro') / 60)
    expect(Math.abs(kmh - (QUESTIONS[6] as { answer: number }).answer)).toBeLessThan(0.6)
  })
})
