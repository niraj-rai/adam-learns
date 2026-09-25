export const EYEPIECE = 10
export const OBJECTIVES = [4, 10, 40, 100] as const

export const totalMagnification = (objective: number, eyepiece = EYEPIECE) => objective * eyepiece

/** Diameter of the field of view in micrometres (µm): about 4.5 mm at 40×, shrinking as magnification rises. */
export const fieldOfView = (mag: number) => 180000 / mag

/** Estimate the size of one cell from how many fit across the field of view. */
export const estimateCellSize = (fovMicrometres: number, cellsAcross: number) => fovMicrometres / cellsAcross

/** Blur (in screen pixels) for a focus setting; each specimen has its own sharp focus point. */
export const blurFor = (focus: number, best: number) => Math.min(8, Math.abs(focus - best) * 0.35)

export type SpecimenId = 'onion' | 'cheek' | 'hydrilla' | 'bacteria' | 'blood' | 'neuron'
export const SPECIMENS: { id: SpecimenId; name: string; emoji: string; stain: string; bestFocus: number; typicalSize: number; kind: string }[] = [
  { id: 'onion', name: 'Onion peel', emoji: '🧅', stain: 'iodine', bestFocus: 42, typicalSize: 240, kind: 'Plant cells' },
  { id: 'cheek', name: 'Cheek cells', emoji: '👄', stain: 'methylene blue', bestFocus: 57, typicalSize: 60, kind: 'Animal cells' },
  { id: 'hydrilla', name: 'Hydrilla leaf', emoji: '🌿', stain: 'none needed', bestFocus: 35, typicalSize: 45, kind: 'Plant cells with chloroplasts' },
  { id: 'bacteria', name: 'Curd bacteria', emoji: '🥛', stain: 'crystal violet', bestFocus: 66, typicalSize: 3, kind: 'Bacteria' },
  { id: 'blood', name: 'Blood smear', emoji: '🩸', stain: 'Leishman stain', bestFocus: 50, typicalSize: 7.5, kind: 'Red blood cells' },
  { id: 'neuron', name: 'Nerve tissue', emoji: '🧠', stain: 'silver stain', bestFocus: 46, typicalSize: 300, kind: 'Nerve cells' },
]
