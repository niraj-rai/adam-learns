/** A job that needs `work` worker-days: days × workers stays constant. */
export const days = (workers: number, work = 60) => work / workers
export const SCENARIOS = [
  { id: 'wall', name: 'Painting a wall', emoji: '🧑‍🎨', work: 60, x: 'painters', y: 'days', max: 12 },
  { id: 'trip', name: 'A 240 km trip', emoji: '🚗', work: 240, x: 'speed (km/h)', y: 'hours', max: 120, min: 20, step: 10 },
  { id: 'food', name: 'Food for a camp', emoji: '🍛', work: 120, x: 'campers', y: 'days the food lasts', max: 40, min: 5, step: 5 },
] as const
