/** Shadow height on a screen from a point source (similar triangles): h × (source→screen) ÷ (source→object). */
export const shadowHeight = (objectH: number, sourceToObject: number, sourceToScreen: number) => (objectH * sourceToScreen) / sourceToObject

/** Pinhole camera image height: h × (pinhole→screen depth) ÷ (object→pinhole distance). The image is upside down. */
export const pinholeImage = (objectH: number, objectDist: number, depth: number) => (objectH * depth) / objectDist

export type Material = { id: string; name: string; kind: 'transparent' | 'translucent' | 'opaque'; emoji: string }
export const MATERIALS: Material[] = [
  { id: 'glass', name: 'Clear glass', kind: 'transparent', emoji: '🪟' },
  { id: 'butter', name: 'Butter paper', kind: 'translucent', emoji: '📜' },
  { id: 'frosted', name: 'Frosted glass', kind: 'translucent', emoji: '🧊' },
  { id: 'cardboard', name: 'Cardboard', kind: 'opaque', emoji: '📦' },
  { id: 'hand', name: 'Your hand', kind: 'opaque', emoji: '✋' },
]
