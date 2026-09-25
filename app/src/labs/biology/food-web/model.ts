/** A simplified Western Ghats forest food web. `eats` lists food sources. Producers eat nothing. */
export const SPECIES: { id: string; name: string; emoji: string; eats: string[] }[] = [
  { id: 'grass', name: 'Grass', emoji: '🌱', eats: [] },
  { id: 'trees', name: 'Fruit trees', emoji: '🌳', eats: [] },
  { id: 'insects', name: 'Insects', emoji: '🐛', eats: ['grass', 'trees'] },
  { id: 'deer', name: 'Sambar deer', emoji: '🦌', eats: ['grass'] },
  { id: 'langur', name: 'Langur', emoji: '🐒', eats: ['trees'] },
  { id: 'frog', name: 'Frog', emoji: '🐸', eats: ['insects'] },
  { id: 'hornbill', name: 'Hornbill', emoji: '🦜', eats: ['trees', 'insects'] },
  { id: 'snake', name: 'Snake', emoji: '🐍', eats: ['frog'] },
  { id: 'eagle', name: 'Serpent eagle', emoji: '🦅', eats: ['snake', 'frog'] },
  { id: 'leopard', name: 'Leopard', emoji: '🐆', eats: ['langur', 'deer'] },
  { id: 'tiger', name: 'Tiger', emoji: '🐅', eats: ['deer'] },
]

/** Species that lose all their food (directly or through a chain) if `removed` disappears. */
export function collapse(removed: string[]) {
  const gone = new Set(removed)
  let changed = true
  while (changed) {
    changed = false
    for (const s of SPECIES) {
      if (gone.has(s.id) || s.eats.length === 0) continue
      if (s.eats.every((f) => gone.has(f))) { gone.add(s.id); changed = true }
    }
  }
  return [...gone].filter((id) => !removed.includes(id))
}

/** Is a list a valid food chain (each eats the one before)? */
export function validChain(chain: string[]) {
  if (chain.length < 2) return false
  const first = SPECIES.find((s) => s.id === chain[0])
  if (!first || first.eats.length) return false
  return chain.every((id, i) => i === 0 || SPECIES.find((s) => s.id === id)!.eats.includes(chain[i - 1]))
}
