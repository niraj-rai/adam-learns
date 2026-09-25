import { describe, expect, it } from 'vitest'
import { MISSIONS } from './model'

const m = (id: string) => MISSIONS.find((x) => x.id === id)!

describe('moon commander missions', () => {
  it('each mission has a correct setting', () => {
    expect(m('full').check(180, false)).toBe(true)
    expect(m('diwali').check(0, false)).toBe(true)
    expect(m('fq').check(90, false)).toBe(true)
    expect(m('crescent').check(40, false)).toBe(true)
    expect(m('midnight').check(270, false)).toBe(true)
    expect(m('lunar').check(180, true)).toBe(true)
    expect(m('solar').check(0, true)).toBe(true)
    expect(m('noeclipse').check(180, false)).toBe(true)
  })
  it('wrong settings are rejected', () => {
    expect(m('lunar').check(180, false)).toBe(false)
    expect(m('solar').check(180, true)).toBe(false)
    expect(m('crescent').check(320, false)).toBe(false)
    expect(m('midnight').check(90, false)).toBe(false)
  })
})
