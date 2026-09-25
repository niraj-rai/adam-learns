export type ComponentId = 'rice' | 'stones' | 'wheat' | 'husk' | 'flour' | 'bran' | 'sand' | 'water' | 'salt' | 'iron' | 'tea-leaves' | 'tea'

export type Component = {
  id: ComponentId
  name: string
  emoji: string
  liquid?: boolean
  /** particle size class for sieving: fine passes through a sieve, coarse and grain stay */
  size?: 1 | 2 | 3
  magnetic?: boolean
  /** light enough to blow away when winnowing */
  light?: boolean
  soluble?: boolean
  /** different enough in size/colour to pick out by hand */
  pickable?: boolean
}

export const COMPONENTS: Record<ComponentId, Component> = {
  rice: { id: 'rice', name: 'rice', emoji: '🍚', size: 3 },
  stones: { id: 'stones', name: 'small stones', emoji: '🪨', size: 3, pickable: true },
  wheat: { id: 'wheat', name: 'wheat grains', emoji: '🌾', size: 3 },
  husk: { id: 'husk', name: 'husk', emoji: '🍂', size: 3, light: true },
  flour: { id: 'flour', name: 'fine flour (atta)', emoji: '🥣', size: 1 },
  bran: { id: 'bran', name: 'bran', emoji: '🟫', size: 2 },
  sand: { id: 'sand', name: 'sand', emoji: '⏳', size: 1 },
  water: { id: 'water', name: 'water', emoji: '💧', liquid: true },
  salt: { id: 'salt', name: 'salt', emoji: '🧂', size: 1, soluble: true },
  iron: { id: 'iron', name: 'iron filings', emoji: '🧲', size: 1, magnetic: true },
  'tea-leaves': { id: 'tea-leaves', name: 'tea leaves', emoji: '🍃', size: 2 },
  tea: { id: 'tea', name: 'tea (liquid)', emoji: '☕', liquid: true },
}

export type ToolId = 'handpick' | 'winnow' | 'sieve' | 'magnet' | 'add-water' | 'filter' | 'decant' | 'evaporate'

export const TOOLS: { id: ToolId; name: string; emoji: string; hint: string }[] = [
  { id: 'handpick', name: 'Hand-pick', emoji: '🤏', hint: 'Pick out big, easy-to-see pieces by hand' },
  { id: 'winnow', name: 'Winnow', emoji: '🌬️', hint: 'Drop it in the wind: light parts blow away' },
  { id: 'sieve', name: 'Sieve', emoji: '🥅', hint: 'Small particles pass through the holes' },
  { id: 'magnet', name: 'Magnet', emoji: '🧲', hint: 'Pulls out magnetic materials such as iron' },
  { id: 'add-water', name: 'Add water & stir', emoji: '🚰', hint: 'Soluble substances dissolve' },
  { id: 'filter', name: 'Filter', emoji: '🧻', hint: 'Filter paper traps insoluble solids; liquid passes' },
  { id: 'decant', name: 'Settle & decant', emoji: '🫗', hint: 'Let heavy solids settle, then pour off the liquid' },
  { id: 'evaporate', name: 'Evaporate', emoji: '🔥', hint: 'Heat to drive off the liquid; dissolved solids stay' },
]

export type Mix = { items: ComponentId[]; dissolved: ComponentId[] }

export type Challenge = {
  id: string
  title: string
  emoji: string
  story: string
  start: ComponentId[]
  /** components already dissolved at the start (e.g. salt in sea water) */
  dissolved?: ComponentId[]
  ideal: ToolId[]
}

export const CHALLENGES: Challenge[] = [
  { id: 'rice', title: 'Clean the rice', emoji: '🍚', story: 'Amma bought rice, but it has some small stones in it.', start: ['rice', 'stones'], ideal: ['handpick'] },
  { id: 'wheat', title: 'After the harvest', emoji: '🌾', story: 'A farmer near Mysuru has wheat grains mixed with light, dry husk.', start: ['wheat', 'husk'], ideal: ['winnow'] },
  { id: 'atta', title: 'Fine atta for rotis', emoji: '🫓', story: 'Freshly ground flour has coarse bran in it. Make it fine for soft rotis.', start: ['flour', 'bran'], ideal: ['sieve'] },
  { id: 'chai', title: 'Chai time', emoji: '☕', story: 'The tea has boiled with tea leaves. Separate the leaves before drinking.', start: ['tea-leaves', 'tea'], ideal: ['filter'] },
  { id: 'muddy', title: 'Muddy water', emoji: '🟤', story: 'After monsoon rain, a bucket of water is full of sand.', start: ['sand', 'water'], ideal: ['decant'] },
  { id: 'salty', title: 'Salt from the sea', emoji: '🌊', story: 'Get the salt out of sea water, just like salt pans in Gujarat.', start: ['salt', 'water'], dissolved: ['salt'], ideal: ['evaporate'] },
  { id: 'triple', title: 'The science-fair puzzle', emoji: '🏆', story: 'Someone mixed sand, salt and iron filings. Get all three back, separately!', start: ['sand', 'salt', 'iron'], ideal: ['magnet', 'add-water', 'filter', 'evaporate'] },
]

export type Result = { ok: boolean; message: string; next: Mix; removed?: ComponentId[]; lost?: ComponentId[] }

const names = (ids: ComponentId[]) => ids.map((i) => COMPONENTS[i].name).join(' and ')

/** Apply a separation tool to the current mixture. Pure function, so it's easy to test. */
export function applyTool(tool: ToolId, mix: Mix): Result {
  const all = [...mix.items]
  const liquids = all.filter((c) => COMPONENTS[c].liquid)
  const solids = all.filter((c) => !COMPONENTS[c].liquid && !mix.dissolved.includes(c))
  const hasLiquid = liquids.length > 0
  const same = { ok: false, next: mix }

  switch (tool) {
    case 'handpick': {
      const pick = solids.filter((c) => COMPONENTS[c].pickable)
      if (hasLiquid) return { ...same, message: 'Hand-picking from a liquid? Messy! Hand-picking works for big solid pieces.' }
      if (!pick.length || pick.length === solids.length) return { ...same, message: 'Nothing here is easy to pick out by hand. The pieces are too small or all look the same.' }
      return { ok: true, message: `You picked out the ${names(pick)} by hand. It works because they are big and look different.`, removed: pick, next: { items: all.filter((c) => !pick.includes(c)), dissolved: mix.dissolved } }
    }
    case 'winnow': {
      const light = solids.filter((c) => COMPONENTS[c].light)
      if (hasLiquid) return { ...same, message: "You can't winnow a wet mixture. Winnowing needs dry solids." }
      if (!light.length) return { ...same, message: 'Nothing blew away. Winnowing only works when one part is much lighter (like husk).' }
      return { ok: true, message: `The wind carried away the light ${names(light)}; the heavier part fell straight down.`, removed: light, next: { items: all.filter((c) => !light.includes(c)), dissolved: mix.dissolved } }
    }
    case 'sieve': {
      if (hasLiquid) {
        // a tea strainer is a sieve: it holds back big bits and lets the liquid through
        const big = solids.filter((c) => (COMPONENTS[c].size ?? 1) >= 2)
        if (big.length && big.length === solids.length) {
          return { ok: true, message: `The strainer (a sieve) held back the ${names(big)}; the liquid passed through.`, removed: big, next: { items: all.filter((c) => !big.includes(c)), dissolved: mix.dissolved } }
        }
        return { ...same, message: 'The fine solid pours straight through the sieve holes along with the liquid. Try a method for liquids.' }
      }
      const sizes = [...new Set(solids.map((c) => COMPONENTS[c].size ?? 1))]
      if (sizes.length < 2) return { ...same, message: 'Everything is about the same size, so it all passes through (or all stays) together.' }
      const smallest = Math.min(...sizes)
      const through = solids.filter((c) => (COMPONENTS[c].size ?? 1) === smallest)
      return { ok: true, message: `The small ${names(through)} fell through the holes; the bigger pieces stayed in the sieve.`, removed: through, next: { items: all.filter((c) => !through.includes(c)), dissolved: mix.dissolved } }
    }
    case 'magnet': {
      const mag = solids.filter((c) => COMPONENTS[c].magnetic)
      if (!mag.length) return { ...same, message: 'The magnet attracts nothing here. None of these is magnetic.' }
      return { ok: true, message: `The magnet pulled out the ${names(mag)}!`, removed: mag, next: { items: all.filter((c) => !mag.includes(c)), dissolved: mix.dissolved } }
    }
    case 'add-water': {
      if (hasLiquid) return { ...same, message: 'There is already a liquid here. Adding more water just makes it more dilute.' }
      const sol = solids.filter((c) => COMPONENTS[c].soluble)
      if (!sol.length) return { ...same, message: 'Nothing dissolved. Adding water only helps when one part is soluble. Now you have wet stuff!' }
      return { ok: true, message: `The ${names(sol)} dissolved in the water. The rest did not dissolve (it is insoluble).`, next: { items: [...all, 'water'], dissolved: [...mix.dissolved, ...sol] } }
    }
    case 'filter':
    case 'decant': {
      if (!hasLiquid) return { ...same, message: tool === 'filter' ? 'Filtering needs a liquid to pour through the filter paper.' : 'Decanting means pouring off a liquid, but there is no liquid here.' }
      if (!solids.length) return { ...same, message: 'Everything passed through! Dissolved substances are too small to be trapped. Try another method.' }
      const msg =
        tool === 'filter'
          ? `The ${names(solids)} stayed on the filter paper (the residue). The liquid that passed through is the filtrate.`
          : `You let the ${names(solids)} settle to the bottom (sedimentation), then carefully poured off the liquid (decantation).`
      return { ok: true, message: msg, removed: solids, next: { items: all.filter((c) => !solids.includes(c)), dissolved: mix.dissolved } }
    }
    case 'evaporate': {
      if (!hasLiquid) return { ...same, message: 'There is no liquid to evaporate.' }
      if (solids.length) return { ...same, message: 'Evaporating now would leave everything mixed together at the bottom. Remove the insoluble solids first!' }
      return {
        ok: true,
        message: mix.dissolved.length ? `The ${names(liquids)} evaporated and ${names(mix.dissolved)} crystals were left behind.` : `The ${names(liquids)} evaporated, and there was nothing dissolved in it.`,
        lost: liquids,
        next: { items: all.filter((c) => !liquids.includes(c)), dissolved: [] },
      }
    }
  }
}

/**
 * Solved when every original component has ended up on its own.
 * Water we added only counts while it is still holding an original component (e.g. salt still dissolved).
 */
export function isSolved(challenge: Challenge, main: Mix, piles: ComponentId[][]) {
  const originals = new Set(challenge.start)
  const pileGroups = piles.map((g) => g.filter((c) => originals.has(c))).filter((g) => g.length > 0)
  const mainHasOriginal = main.items.some((c) => originals.has(c))
  const groups = mainHasOriginal ? [...pileGroups, main.items] : pileGroups
  return groups.every((g) => g.length === 1)
}
