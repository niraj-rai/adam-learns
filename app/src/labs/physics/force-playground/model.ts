/** One time-step of a box pushed along a floor. force > 0 pushes to the right (N). */
export function stepBox(v: number, force: number, friction: number, mass: number, dt: number) {
  if (v === 0) {
    if (Math.abs(force) <= friction) return 0 // static friction holds it
    return ((force - Math.sign(force) * friction) / mass) * dt
  }
  const a = (force - Math.sign(v) * friction) / mass
  const next = v + a * dt
  // friction can bring the box to a stop but never push it backwards
  return Math.sign(next) !== Math.sign(v) ? 0 : next
}
