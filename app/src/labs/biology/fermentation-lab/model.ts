/** How active yeast is at a temperature (0–1). Best around 35 °C; killed above about 55 °C. */
export function yeastActivity(tempC: number) {
  if (tempC >= 55) return 0
  return Math.max(0, 1 - ((tempC - 35) / 25) ** 2)
}

/** Percentage rise in dough volume. `sugar` (0/1) gives the yeast extra food. */
export function doughRise(tempC: number, yeastTsp: number, hours: number, sugar: boolean) {
  const k = 0.35 * yeastActivity(tempC) * yeastTsp * (sugar ? 1.4 : 1)
  return Math.round(150 * (1 - Math.exp(-k * hours)))
}

/**
 * Hours for milk to set into curd with a spoonful of starter (Lactobacillus).
 * Too cold is very slow; about 40 °C is ideal; above 55 °C the bacteria die. Returns Infinity if it never sets.
 */
export function curdHours(tempC: number, starter: boolean) {
  if (!starter || tempC >= 55 || tempC < 10) return Infinity
  const act = Math.max(0, 1 - ((tempC - 40) / 28) ** 2)
  return act <= 0.05 ? Infinity : Math.round((5 / act) * 10) / 10
}
