export type Outcome = [number, number]
export const TWO_DICE: Outcome[] = Array.from({ length: 36 }, (_, i) => [Math.floor(i / 6) + 1, (i % 6) + 1])
export const EVENTS: { id: string; name: string; test: (o: Outcome) => boolean }[] = [
  { id: 'sum7', name: 'The sum is 7', test: ([a, b]) => a + b === 7 },
  { id: 'double', name: 'A double', test: ([a, b]) => a === b },
  { id: 'six', name: 'At least one 6', test: ([a, b]) => a === 6 || b === 6 },
  { id: 'big', name: 'The sum is more than 9', test: ([a, b]) => a + b > 9 },
  { id: 'even', name: 'The sum is even', test: ([a, b]) => (a + b) % 2 === 0 },
  { id: 'prime', name: 'The sum is prime', test: ([a, b]) => [2, 3, 5, 7, 11].includes(a + b) },
]
export const count = (test: (o: Outcome) => boolean) => TWO_DICE.filter(test).length
