export const PATH = [
  { id: 'body', name: 'Body (organs and muscles)', oxygenated: false },
  { id: 'vena', name: 'Vena cava (main vein)', oxygenated: false },
  { id: 'ra', name: 'Right atrium', oxygenated: false },
  { id: 'rv', name: 'Right ventricle', oxygenated: false },
  { id: 'pa', name: 'Pulmonary artery', oxygenated: false },
  { id: 'lungs', name: 'Lungs (pick up oxygen)', oxygenated: true },
  { id: 'pv', name: 'Pulmonary vein', oxygenated: true },
  { id: 'la', name: 'Left atrium', oxygenated: true },
  { id: 'lv', name: 'Left ventricle', oxygenated: true },
  { id: 'aorta', name: 'Aorta (main artery)', oxygenated: true },
] as const

/** Litres of blood pumped per minute: heart rate × stroke volume (about 70 mL per beat at rest). */
export const cardiacOutput = (bpm: number, strokeMl = 70) => (bpm * strokeMl) / 1000

export const BLOOD = [
  { id: 'rbc', name: 'Red blood cells', job: 'Carry oxygen (using haemoglobin)', share: 44 },
  { id: 'wbc', name: 'White blood cells', job: 'Fight germs and infection', share: 0.5 },
  { id: 'platelets', name: 'Platelets', job: 'Help blood clot at a cut', share: 0.5 },
  { id: 'plasma', name: 'Plasma', job: 'Liquid that carries food, CO₂, wastes and hormones', share: 55 },
]

/** Is the given order of stops a correct loop of the double circulation (starting anywhere)? */
export function correctLoop(order: string[]) {
  if (order.length !== PATH.length) return false
  const ids = PATH.map((p) => p.id) as string[]
  const start = ids.indexOf(order[0])
  return order.every((id, i) => ids[(start + i) % ids.length] === id)
}
