import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { CATEGORY_STYLE, ELEMENTS, shells, type Element } from '../../_kit/elements'
import { LabFrame } from '../../_kit/LabFrame'
import { BohrDiagram } from '../atom-builder/AtomBuilder'

type ColourBy = 'category' | 'state' | 'metal'

const QUESTS: { q: string; check: (e: Element) => boolean; explain: string }[] = [
  { q: 'Find the noble gas in period 3', check: (e) => e.z === 18, explain: 'Argon (Ar): group 18, period 3.' },
  { q: 'Find the alkali metal with 3 electron shells', check: (e) => e.z === 11, explain: 'Sodium (Na): group 1, period 3.' },
  { q: 'Find the element with 6 protons', check: (e) => e.z === 6, explain: 'Carbon (C): atomic number 6.' },
  { q: 'Find the halogen in period 2', check: (e) => e.z === 9, explain: 'Fluorine (F): group 17, period 2.' },
  { q: 'Find a metalloid (it behaves partly like a metal and partly like a non-metal)', check: (e) => e.category === 'metalloid', explain: 'Boron (B) and silicon (Si) are metalloids.' },
  { q: 'Find an element that is a gas and has 2 electrons in its outer shell', check: (e) => e.z === 2, explain: 'Helium (He): 2 electrons, a full first shell.' },
  { q: 'Find the metal in group 13', check: (e) => e.z === 13, explain: 'Aluminium (Al): the first metal in group 13 (boron above it is a metalloid).' },
  { q: 'Find the element with the most protons on this table', check: (e) => e.z === 20, explain: 'Calcium (Ca), atomic number 20.' },
]

function colourFor(e: Element, by: ColourBy) {
  if (by === 'category') return CATEGORY_STYLE[e.category].bg
  if (by === 'state') return e.state === 'gas' ? '#bae6fd' : e.state === 'liquid' ? '#93c5fd' : '#e7e5e4'
  return e.category === 'metalloid' ? '#a7f3d0' : ['alkali metal', 'alkaline earth metal', 'metal'].includes(e.category) ? '#cbd5e1' : '#fde68a'
}

export default function PeriodicExplorer() {
  const [sel, setSel] = useState<Element>(ELEMENTS[5])
  const [by, setBy] = useState<ColourBy>('category')
  const [collected, setCollected] = useState<number[]>([6])
  const [quest, setQuest] = useState<number | null>(null)
  const [questResult, setQuestResult] = useState<string | null>(null)
  const [questScore, setQuestScore] = useState(0)

  const pick = (e: Element) => {
    setSel(e)
    setCollected((c) => (c.includes(e.z) ? c : [...c, e.z]))
    if (quest !== null && !questResult) {
      const q = QUESTS[quest]
      if (q.check(e)) {
        setQuestScore((s) => s + 1)
        setQuestResult(`✅ Yes! ${q.explain}`)
        sfx.correct()
      } else {
        setQuestResult(`❌ Not ${e.name}. ${q.explain}`)
        sfx.wrong()
      }
    }
  }

  const legend =
    by === 'category'
      ? Object.values(CATEGORY_STYLE).map((c) => ({ bg: c.bg, label: c.label }))
      : by === 'state'
        ? [{ bg: '#e7e5e4', label: 'Solid' }, { bg: '#bae6fd', label: 'Gas' }]
        : [{ bg: '#cbd5e1', label: 'Metal' }, { bg: '#a7f3d0', label: 'Metalloid' }, { bg: '#fde68a', label: 'Non-metal' }]

  return (
    <LabFrame
      labId="periodic-explorer"
      title="Periodic Table Explorer"
      subtitle="The first 20 elements: tap to explore, collect all 20, and complete the quests"
      howTo={<p>Rows are <b>periods</b> (same number of electron shells). Columns are <b>groups</b> (same number of outer electrons, so similar properties). Change the colouring to spot patterns.</p>}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold">Colour by:</span>
        {(['category', 'metal', 'state'] as ColourBy[]).map((b) => (
          <button key={b} type="button" onClick={() => setBy(b)} className={cn('rounded-full border px-3 py-1', by === b ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
            {b === 'category' ? 'Family' : b === 'metal' ? 'Metal / non-metal' : 'State at room temperature'}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[640px] gap-1" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
          {Array.from({ length: 18 }, (_, g) => (
            <div key={`g${g}`} className="text-center text-[10px] text-muted-foreground">{g + 1}</div>
          ))}
          {[1, 2, 3, 4].flatMap((period) =>
            Array.from({ length: 18 }, (_, gi) => {
              const g = gi + 1
              const e = ELEMENTS.find((x) => x.period === period && x.group === g)
              if (!e) {
                const future = period === 4 && g > 2
                return <div key={`${period}-${g}`} className={cn('aspect-square rounded', future && 'border border-dashed opacity-40')} title={future ? 'Elements 21–36: coming in Grade 9' : undefined} />
              }
              return (
                <motion.button
                  key={e.z}
                  type="button"
                  whileHover={{ scale: 1.08 }}
                  onClick={() => pick(e)}
                  className={cn('flex aspect-square flex-col items-center justify-center rounded border border-black/15 text-slate-900', sel.z === e.z && 'ring-2 ring-primary ring-offset-1')}
                  style={{ background: colourFor(e, by) }}
                  aria-label={`${e.name}, atomic number ${e.z}`}
                >
                  <span className="text-[9px] leading-none">{e.z}</span>
                  <span className="font-heading text-sm leading-tight font-bold">{e.symbol}</span>
                </motion.button>
              )
            }),
          )}
        </div>
      </div>
      <div className="mt-1 flex flex-wrap gap-2 text-xs">
        {legend.map((l) => (
          <span key={l.label} className="inline-flex items-center gap-1"><span className="size-3 rounded border border-black/20" style={{ background: l.bg }} />{l.label}</span>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr]">
        <div className="aspect-square rounded-2xl border bg-background p-1">
          <BohrDiagram p={sel.z} n={sel.mass - sel.z} e={sel.z} size={200} />
        </div>
        <motion.div key={sel.z} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 rounded-2xl border bg-card p-4 text-sm">
          <p className="font-heading text-2xl font-bold">{sel.name} <span className="text-muted-foreground">{sel.symbol}</span></p>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <span className="rounded-full px-2 py-0.5 text-slate-900" style={{ background: CATEGORY_STYLE[sel.category].bg }}>{CATEGORY_STYLE[sel.category].label}</span>
            <span className="rounded-full bg-muted px-2 py-0.5">Group {sel.group}</span>
            <span className="rounded-full bg-muted px-2 py-0.5">Period {sel.period}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 capitalize">{sel.state}</span>
          </div>
          <p>Atomic number <b>{sel.z}</b> ({sel.z} protons) · Mass number <b>{sel.mass}</b> ({sel.mass - sel.z} neutrons) · Electrons <b>{shells(sel.z).join(', ')}</b></p>
          <p>💡 {sel.fact}</p>
        </motion.div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border p-3">
          <p className="text-sm font-semibold">🃏 Element cards collected: {collected.length} / 20</p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-chem" style={{ width: `${(collected.length / 20) * 100}%` }} /></div>
        </div>
        <div className="rounded-xl border p-3">
          <p className="text-sm font-semibold">🧭 Quests: {questScore} / {QUESTS.length}</p>
          {quest === null ? (
            <Button size="sm" className="mt-2" onClick={() => { setQuest(0); setQuestResult(null) }}>Start quests</Button>
          ) : quest < QUESTS.length ? (
            <>
              <p className="mt-1 text-sm">{QUESTS[quest].q}. Tap it on the table!</p>
              {questResult && (
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                  <span role="status">{questResult}</span>
                  <Button size="sm" variant="outline" onClick={() => { setQuest((q) => (q ?? 0) + 1); setQuestResult(null) }}>Next quest</Button>
                </div>
              )}
            </>
          ) : (
            <p className="mt-1 text-sm">🎉 All quests done!</p>
          )}
        </div>
      </div>
    </LabFrame>
  )
}
