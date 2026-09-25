export type Spread = 'air' | 'water' | 'contact' | 'vector' | 'none'
export const SPREAD: Record<Spread, { name: string; emoji: string; prevent: string }> = {
  air: { name: 'Air (coughs and sneezes)', emoji: '🤧', prevent: 'Cover coughs, wear masks when ill, ventilate rooms, vaccinate' },
  water: { name: 'Contaminated food and water', emoji: '🚰', prevent: 'Safe drinking water, handwashing, toilets, clean cooking' },
  contact: { name: 'Direct contact', emoji: '🤝', prevent: 'Handwashing, not sharing personal items' },
  vector: { name: 'Insect vectors (mosquitoes)', emoji: '🦟', prevent: 'Remove standing water, mosquito nets, repellents' },
  none: { name: 'Not infectious', emoji: '🚫', prevent: 'Healthy diet, exercise, no tobacco, regular check-ups' },
}

export const DISEASES: { id: string; name: string; communicable: boolean; cause: string; spread: Spread }[] = [
  { id: 'cold', name: 'Common cold', communicable: true, cause: 'virus', spread: 'air' },
  { id: 'tb', name: 'Tuberculosis (TB)', communicable: true, cause: 'bacterium', spread: 'air' },
  { id: 'measles', name: 'Measles', communicable: true, cause: 'virus', spread: 'air' },
  { id: 'typhoid', name: 'Typhoid', communicable: true, cause: 'bacterium', spread: 'water' },
  { id: 'cholera', name: 'Cholera', communicable: true, cause: 'bacterium', spread: 'water' },
  { id: 'hepa', name: 'Hepatitis A (jaundice)', communicable: true, cause: 'virus', spread: 'water' },
  { id: 'ringworm', name: 'Ringworm', communicable: true, cause: 'fungus', spread: 'contact' },
  { id: 'malaria', name: 'Malaria', communicable: true, cause: 'protozoan', spread: 'vector' },
  { id: 'dengue', name: 'Dengue', communicable: true, cause: 'virus', spread: 'vector' },
  { id: 'diabetes', name: 'Type 2 diabetes', communicable: false, cause: 'lifestyle and genes', spread: 'none' },
  { id: 'heart', name: 'Heart disease', communicable: false, cause: 'lifestyle and genes', spread: 'none' },
  { id: 'scurvy', name: 'Scurvy', communicable: false, cause: 'lack of vitamin C', spread: 'none' },
]
