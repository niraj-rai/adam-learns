/** Cells after n rounds of division, starting from one cell (each cell splits into two). */
export const cellsAfter = (n: number) => 2 ** n

/** Rounds of doubling needed to reach at least N cells. */
export const doublingsTo = (n: number) => Math.ceil(Math.log2(n))

/** Bacteria dividing every `minutes` minutes: how many after `hours` hours, starting from one? */
export const bacteriaAfter = (hours: number, minutes = 20) => cellsAfter(Math.floor((hours * 60) / minutes))

/** Roughly 37 trillion cells in an adult human body. */
export const HUMAN_CELLS = 3.7e13
