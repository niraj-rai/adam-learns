export type Enzyme = { id: string; name: string; where: string; substrate: string; product: string; optimumT: number; optimumPH: number }

export const ENZYMES: Enzyme[] = [
  { id: 'amylase', name: 'Salivary amylase', where: 'Mouth (saliva)', substrate: 'Starch', product: 'Maltose (sugar)', optimumT: 37, optimumPH: 7 },
  { id: 'pepsin', name: 'Pepsin', where: 'Stomach (with hydrochloric acid)', substrate: 'Proteins', product: 'Peptides', optimumT: 37, optimumPH: 2 },
  { id: 'trypsin', name: 'Trypsin', where: 'Small intestine (from the pancreas)', substrate: 'Proteins', product: 'Peptides and amino acids', optimumT: 37, optimumPH: 8 },
  { id: 'lipase', name: 'Lipase', where: 'Small intestine (from the pancreas), helped by bile', substrate: 'Fats (emulsified by bile)', product: 'Fatty acids and glycerol', optimumT: 37, optimumPH: 8 },
]

/** Relative activity (0–1): a bell curve around the optimum pH, rising with temperature and collapsing above ~45 °C as the enzyme denatures. */
export function activity(e: Enzyme, T: number, pH: number) {
  const phPart = Math.exp(-((pH - e.optimumPH) ** 2) / 2.5)
  const rise = Math.min(1, Math.max(0, T / e.optimumT))
  const denature = T <= 40 ? 1 : Math.max(0, 1 - (T - 40) / 20)
  return Math.max(0, phPart * rise * denature)
}
