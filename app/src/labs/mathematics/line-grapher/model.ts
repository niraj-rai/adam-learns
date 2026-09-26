export type Preset = { id: string; name: string; emoji: string; m: number; c: number; x: string; y: string; xMax: number; rate: (m: number) => string; start: (c: number) => string }
export const PRESETS: Preset[] = [
  { id: 'free', name: 'Any line', emoji: '📈', m: 2, c: 1, x: 'x', y: 'y', xMax: 10, rate: (m) => `y ${m >= 0 ? 'rises' : 'falls'} by ${Math.abs(m)} for each 1 across`, start: (c) => `the line crosses the y-axis at ${c}` },
  { id: 'auto', name: 'Auto fare', emoji: '🛺', m: 15, c: 30, x: 'distance (km)', y: 'fare (₹)', xMax: 10, rate: (m) => `the fare goes up by ₹${m} for each extra km`, start: (c) => `₹${c} is charged before the auto even moves` },
  { id: 'temp', name: '°C to °F', emoji: '🌡️', m: 1.8, c: 32, x: 'temperature (°C)', y: 'temperature (°F)', xMax: 100, rate: (m) => `each 1 °C warmer adds ${m} °F`, start: (c) => `0 °C (water freezing) is ${c} °F` },
  { id: 'tank', name: 'Draining tank', emoji: '🪣', m: -20, c: 200, x: 'time (min)', y: 'water left (L)', xMax: 10, rate: (m) => `the tank loses ${Math.abs(m)} L every minute`, start: (c) => `the tank starts with ${c} L` },
  { id: 'savings', name: 'Savings', emoji: '🐷', m: 50, c: 200, x: 'weeks', y: 'savings (₹)', xMax: 10, rate: (m) => `savings grow by ₹${m} each week`, start: (c) => `you start with ₹${c}` },
]
export const y = (m: number, c: number, x: number) => Math.round((m * x + c) * 1000) / 1000
/** Gradient and intercept of the line through two points. */
export function through([x1, y1]: [number, number], [x2, y2]: [number, number]) {
  const m = (y2 - y1) / (x2 - x1)
  return { m, c: y1 - m * x1 }
}
