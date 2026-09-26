/** Elbow angle 30° (fully bent) to 180° (straight). Biceps shortens as the arm bends; triceps the opposite. */
export const bicepsContraction = (angle: number) => Math.max(0, Math.min(1, (180 - angle) / 150))

export type Habits = { calciumMg: number; sunMinutes: number; exerciseDays: number }

/** A simple 0–100 bone-health score for a teenager, from daily habits (a teaching model, not medical advice). */
export function boneScore(h: Habits) {
  const calcium = Math.min(1, h.calciumMg / 1200) * 40 // teenagers need roughly 1000–1300 mg a day
  const sun = Math.min(1, h.sunMinutes / 20) * 20
  const exercise = Math.min(1, h.exerciseDays / 5) * 40
  return Math.round(calcium + sun + exercise)
}
