/** Surface area, volume and surface-area-to-volume ratio of a cube-shaped cell with side s. */
export function cubeStats(s: number) {
  const area = 6 * s * s
  const volume = s * s * s
  return { area, volume, ratio: area / volume }
}

export const SPECIAL = [
  { id: 'nerve', name: 'Nerve cell (neuron)', emoji: '🧠', shape: 'Very long, with many branches', job: 'Carries electrical messages quickly around the body' },
  { id: 'rbc', name: 'Red blood cell', emoji: '🩸', shape: 'Small dimpled disc with no nucleus', job: 'Carries oxygen: more room for haemoglobin, and it can squeeze through tiny vessels' },
  { id: 'muscle', name: 'Muscle cell', emoji: '💪', shape: 'Long and spindle-shaped, able to shorten', job: 'Contracts to move parts of the body' },
  { id: 'roothair', name: 'Root hair cell', emoji: '🌱', shape: 'A long, thin extension sticking out into the soil', job: 'Gives a large surface area to absorb water and minerals' },
  { id: 'guard', name: 'Guard cells', emoji: '🍃', shape: 'Bean-shaped pair around a tiny pore in the leaf', job: 'Open and close the pore (stoma) to let gases in and out' },
  { id: 'sperm', name: 'Sperm cell', emoji: '🏊', shape: 'Streamlined head with a long tail', job: 'Swims to reach and fertilise an egg cell' },
]
