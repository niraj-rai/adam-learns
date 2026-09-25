import { describe, expect, it } from 'vitest'
import { isAlive, THINGS } from './model'

const t = (id: string) => THINGS.find((x) => x.id === id)!

describe('is it alive?', () => {
  it('living things show all seven life processes', () => {
    for (const id of ['dog', 'neem', 'seed', 'mushroom', 'you']) expect(isAlive(t(id))).toBe(true)
  })
  it('things that move or grow are not necessarily alive', () => {
    for (const id of ['car', 'fire', 'crystal', 'robot', 'cloud']) expect(isAlive(t(id))).toBe(false)
  })
})
