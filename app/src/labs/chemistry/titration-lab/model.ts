/** Strong acid (HCl) titrated with strong base (NaOH). Volumes in mL, concentrations in mol/L. */
export function pHAfter(acidVol: number, acidConc: number, baseVol: number, baseConc: number) {
  const hPlus = (acidVol * acidConc - baseVol * baseConc) / 1000 // moles of excess H+
  const total = (acidVol + baseVol) / 1000 // litres
  if (Math.abs(hPlus) < 1e-9) return 7
  if (hPlus > 0) return -Math.log10(hPlus / total)
  return 14 + Math.log10(-hPlus / total)
}

export const endpointVolume = (acidVol: number, acidConc: number, baseConc: number) => (acidVol * acidConc) / baseConc
