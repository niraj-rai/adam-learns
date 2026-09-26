import { describe, expect, it } from 'vitest'
import { ORGANISMS, sharedRank, isBinomial } from './model'

const o = (n: string) => ORGANISMS.find((x) => x.name === n)!

describe('taxonomy ladder', () => {
  it('closer relatives share lower ranks', () => {
    expect(sharedRank(o('Tiger'), o('Lion'))).toBe(5) // same genus
    expect(sharedRank(o('Tiger'), o('Pet cat'))).toBe(4) // same family
    expect(sharedRank(o('Tiger'), o('Dog'))).toBe(3) // same order
    expect(sharedRank(o('Tiger'), o('Human'))).toBe(2) // same class
    expect(sharedRank(o('Tiger'), o('Housefly'))).toBe(0) // kingdom only
    expect(sharedRank(o('Tiger'), o('Mango'))).toBe(-1)
  })
  it('binomial names follow the rules', () => {
    for (const x of ORGANISMS) expect(isBinomial(x.ranks[6])).toBe(true)
    expect(isBinomial('panthera Tigris')).toBe(false)
    expect(isBinomial('Panthera')).toBe(false)
  })
})
