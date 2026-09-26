/** A dichotomous key: each question node has a yes branch and a no branch; leaves are groups. */
export type KeyNode = { q: string; yes: string; no: string }
export type Key = { start: string; nodes: Record<string, KeyNode>; groups: Record<string, { name: string; emoji: string; about: string }> }
export type Specimen = { name: string; emoji: string; description: string; group: string; answers: Record<string, boolean> }

/** Follow a specimen's true answers through the key and return the group it lands in. */
export function identify(key: Key, answers: Record<string, boolean>) {
  let id = key.start
  const path: string[] = []
  for (let i = 0; i < 20 && key.nodes[id]; i++) {
    path.push(id)
    id = answers[id] ? key.nodes[id].yes : key.nodes[id].no
  }
  return { group: id, path }
}
