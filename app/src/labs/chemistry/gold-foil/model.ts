/** Distance between gold nuclei in the zoomed-in foil (px). */
export const SPACING = 36

/**
 * Rutherford scattering: deflection angle θ = 2·atan(K / b), where b is how far the alpha particle
 * passes from a nucleus. K is tiny because the nucleus is tiny, so almost every particle passes
 * straight through and only a very few bounce back, as in the real experiment.
 */
export const K = 0.05

export function deflection(b: number) {
  return 2 * Math.atan(K / Math.max(1e-4, Math.abs(b)))
}

export type Outcome = 'straight' | 'small' | 'back'
export function classify(angleRad: number): Outcome {
  const deg = Math.abs(angleRad) * (180 / Math.PI)
  return deg < 3 ? 'straight' : deg < 90 ? 'small' : 'back'
}
