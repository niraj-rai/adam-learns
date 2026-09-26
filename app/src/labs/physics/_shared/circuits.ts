/** Grade 10 electricity helpers. */
export const ohm = { current: (V: number, R: number) => V / R, voltage: (I: number, R: number) => I * R, resistance: (V: number, I: number) => V / I }
export const series = (rs: number[]) => rs.reduce((a, b) => a + b, 0)
export const parallel = (rs: number[]) => 1 / rs.reduce((a, b) => a + 1 / b, 0)
/** R = ρL/A */
export const resistanceOfWire = (rho: number, L: number, A: number) => (rho * L) / A
export const electricPower = (V: number, I: number) => V * I
/** Heat produced H = I²Rt (joules). */
export const heat = (I: number, R: number, t: number) => I * I * R * t
/** Smallest standard fuse rating above the working current. */
export const FUSES = [1, 3, 5, 10, 13, 15, 20, 32]
export const fuseFor = (current: number) => FUSES.find((f) => f > current) ?? null
