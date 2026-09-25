export type Surface = { id: string; name: string; fill: string; absorb: number }

/** Dull black surfaces absorb (and give out) radiation best; shiny surfaces reflect it. For a surface, absorbing well = emitting well. */
export const SURFACES: Surface[] = [
  { id: 'black', name: 'Dull black', fill: '#1f2937', absorb: 0.95 },
  { id: 'white', name: 'White', fill: '#f8fafc', absorb: 0.3 },
  { id: 'foil', name: 'Shiny foil', fill: 'url(#foil)', absorb: 0.1 },
]

/** One step of a can of water under a lamp: gains radiation it absorbs, loses heat it emits. */
export function radiationStep(temp: number, absorb: number, lampOn: boolean, dt: number, ambient = 25) {
  const gain = lampOn ? 1.2 * absorb : 0
  const lose = 0.02 * (0.3 + absorb) * (temp - ambient)
  return temp + (gain - lose) * dt
}

/**
 * Convection velocity field in a pot heated from the bottom centre (two rolling cells).
 * x in [0, 1] across the pot, y in [0, 1] from bottom to top. Returns (vx, vy); the water rises at the centre.
 */
export function convectionVelocity(x: number, y: number) {
  const k = Math.PI
  // stream function ψ = sin(2πx) · sin(πy); vx = ∂ψ/∂y and vy = −∂ψ/∂x (divergence-free), so the centre column rises
  const vx = k * Math.sin(2 * k * x) * Math.cos(k * y)
  const vy = -2 * k * Math.cos(2 * k * x) * Math.sin(k * y)
  return { vx, vy }
}
