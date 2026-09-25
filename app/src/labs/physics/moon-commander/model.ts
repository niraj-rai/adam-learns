import { eclipse, phaseName, SYNODIC } from '../moon-lab/model'

/** Moon position as degrees around its orbit from new moon (0) → first quarter (90) → full (180) → last quarter (270). */
export const dayFromAngle = (deg: number) => (deg / 360) * SYNODIC

export type Mission = { id: string; text: string; check: (deg: number, onNode: boolean) => boolean; why: string }

const phase = (deg: number) => phaseName(dayFromAngle(deg))
const nodeOffset = (onNode: boolean) => (onNode ? 0 : 30)

export const MISSIONS: Mission[] = [
  { id: 'full', text: 'Make it Purnima: a full moon.', check: (d) => phase(d) === 'Full moon', why: 'Full moon: Earth is between the Sun and the Moon, so we see the whole lit face.' },
  { id: 'diwali', text: 'Set the sky for Diwali night, which falls on Amavasya (the darkest night).', check: (d) => phase(d) === 'New moon', why: 'Amavasya is the new moon: the Moon is between Earth and the Sun, with its dark side facing us.' },
  { id: 'fq', text: 'Show a first-quarter moon: the right half lit, as seen from India.', check: (d) => phase(d) === 'First quarter', why: 'A quarter of the way round its orbit, we see half of the lit side.' },
  { id: 'crescent', text: 'Make a thin crescent that is visible in the west just after sunset.', check: (d) => phase(d) === 'Waxing crescent', why: 'A few days after new moon, the Moon is a little east of the Sun, so it sets soon after the Sun.' },
  { id: 'midnight', text: 'Make a Moon that rises around midnight.', check: (d) => phase(d) === 'Last quarter', why: 'The last-quarter Moon rises around midnight and is high in the sky at dawn.' },
  { id: 'lunar', text: 'Create a lunar eclipse.', check: (d, n) => eclipse(dayFromAngle(d), nodeOffset(n)) === 'lunar', why: 'A lunar eclipse needs a full moon AND the Moon at a node, so that it passes through Earth’s shadow.' },
  { id: 'solar', text: 'Create a solar eclipse.', check: (d, n) => eclipse(dayFromAngle(d), nodeOffset(n)) === 'solar', why: 'A solar eclipse needs a new moon AND the Moon at a node, so that its shadow falls on Earth.' },
  { id: 'noeclipse', text: 'Show a full moon that does NOT cause an eclipse (this happens most months).', check: (d, n) => phase(d) === 'Full moon' && !n, why: 'Because the Moon’s orbit is tilted by about 5°, most full moons pass just above or below Earth’s shadow.' },
]
