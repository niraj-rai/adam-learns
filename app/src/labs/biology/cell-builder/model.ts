export type OrganelleId = 'membrane' | 'cytoplasm' | 'nucleus' | 'mitochondria' | 'wall' | 'chloroplast' | 'vacuole'

export const ORGANELLES: { id: OrganelleId; name: string; emoji: string; job: string }[] = [
  { id: 'nucleus', name: 'Nucleus', emoji: '🟣', job: 'Controls the cell and holds the genetic information (DNA).' },
  { id: 'membrane', name: 'Cell membrane', emoji: '⭕', job: 'A thin, flexible layer that controls what enters and leaves the cell.' },
  { id: 'cytoplasm', name: 'Cytoplasm', emoji: '💧', job: 'Jelly-like substance where most of the cell’s chemical reactions happen.' },
  { id: 'mitochondria', name: 'Mitochondria', emoji: '🔋', job: 'Release energy from food by respiration: the cell’s power stations.' },
  { id: 'wall', name: 'Cell wall', emoji: '🧱', job: 'A tough outer layer of cellulose that supports and protects plant cells.' },
  { id: 'chloroplast', name: 'Chloroplasts', emoji: '🟢', job: 'Contain green chlorophyll and make food by photosynthesis.' },
  { id: 'vacuole', name: 'Large central vacuole', emoji: '🫧', job: 'Stores cell sap and keeps the plant cell firm.' },
]

const BOTH: OrganelleId[] = ['membrane', 'cytoplasm', 'nucleus', 'mitochondria']
export const NEEDS: Record<'plant' | 'animal', OrganelleId[]> = {
  plant: [...BOTH, 'wall', 'chloroplast', 'vacuole'],
  animal: BOTH,
}

export function checkCell(kind: 'plant' | 'animal', chosen: OrganelleId[]) {
  const need = NEEDS[kind]
  return {
    missing: need.filter((o) => !chosen.includes(o)),
    wrong: chosen.filter((o) => !need.includes(o)),
    complete: need.every((o) => chosen.includes(o)) && chosen.every((o) => need.includes(o)),
  }
}
