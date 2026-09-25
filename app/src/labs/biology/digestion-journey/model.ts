export const STAGES = [
  { id: 'mouth', name: 'Mouth', emoji: '👄', minutes: 1, lengthCm: 10, starch: 85, protein: 100, fat: 100, happens: 'Teeth chew the food into small pieces. Saliva moistens it and its enzyme (amylase) starts breaking starch into sugar. The tongue rolls it into a ball (bolus).' },
  { id: 'oesophagus', name: 'Food pipe (oesophagus)', emoji: '🔽', minutes: 0.2, lengthCm: 25, starch: 85, protein: 100, fat: 100, happens: 'Waves of muscle contraction (peristalsis) push the food down to the stomach, even if you are upside down!' },
  { id: 'stomach', name: 'Stomach', emoji: '🫃', minutes: 180, lengthCm: 25, starch: 80, protein: 60, fat: 100, happens: 'Strong muscles churn the food with acid, which kills germs, and digestive juices that start digesting proteins.' },
  { id: 'small', name: 'Small intestine', emoji: '🌀', minutes: 240, lengthCm: 650, starch: 0, protein: 0, fat: 0, happens: 'Juices from the liver (bile) and pancreas finish digesting starch, proteins and fats. Millions of finger-like villi absorb the nutrients into the blood.' },
  { id: 'large', name: 'Large intestine', emoji: '💧', minutes: 1800, lengthCm: 150, starch: 0, protein: 0, fat: 0, happens: 'Water and some minerals are absorbed. Fibre and undigested remains form faeces.' },
  { id: 'anus', name: 'Rectum and anus', emoji: '🚽', minutes: 60, lengthCm: 15, starch: 0, protein: 0, fat: 0, happens: 'Faeces are stored in the rectum and removed through the anus (egestion).' },
]

export const totalLengthM = () => STAGES.reduce((s, x) => s + x.lengthCm, 0) / 100
export const totalHours = () => STAGES.reduce((s, x) => s + x.minutes, 0) / 60

/** Saliva test: iodine colour on a starch solution after `minutes` with saliva (starch left, %). */
export const starchLeft = (minutes: number, saliva: boolean) => (saliva ? Math.max(0, Math.round(100 * Math.exp(-minutes / 4))) : 100)
