import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { INDICATORS, getSolution, type IndicatorId } from '../../_kit/ph'
import { LabFrame } from '../../_kit/LabFrame'

const ROWS = ['hcl', 'lemon', 'vinegar', 'water', 'salt', 'bakingsoda', 'soap', 'limewater'].map(getSolution)
const COLS: IndicatorId[] = ['blue-litmus', 'red-litmus', 'turmeric', 'china-rose', 'red-cabbage', 'phenolphthalein', 'methyl-orange']
const SHORT: Record<string, string> = {
  'blue-litmus': 'Blue litmus',
  'red-litmus': 'Red litmus',
  turmeric: 'Turmeric',
  'china-rose': 'China rose',
  'red-cabbage': 'Red cabbage',
  phenolphthalein: 'Phenol-phthalein',
  'methyl-orange': 'Methyl orange',
}

export default function IndicatorLab({ natural = false }: { natural?: boolean }) {
  const cols = natural ? COLS.filter((c) => INDICATORS.find((i) => i.id === c)!.natural) : COLS
  const [done, setDone] = useState<Set<string>>(new Set())
  const [last, setLast] = useState<string | null>(null)
  const total = ROWS.length * cols.length

  const drop = (r: string, c: string) => {
    const k = `${r}|${c}`
    setDone((d) => new Set(d).add(k))
    setLast(k)
    sfx.click()
  }

  const lastInfo = last
    ? (() => {
        const [r, c] = last.split('|')
        const s = getSolution(r)
        const ind = INDICATORS.find((i) => i.id === c)!
        return `${ind.name} in ${s.name.toLowerCase()}: ${ind.colour(s.pH).label}.`
      })()
    : null

  return (
    <LabFrame
      labId="indicator-lab"
      title="Indicator Lab"
      subtitle="A spotting tile: test every indicator in every solution"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>Each row is a solution; each column is an indicator. Tap a well to add a few drops.</li>
          <li>Look for patterns: which indicators change in acids? In bases? Which change in both?</li>
          <li>Colour labels are shown too, so you don't have to rely on colour alone.</li>
        </ul>
      }
    >
      <div className="overflow-x-auto">
        <table className="mx-auto border-separate border-spacing-1.5 text-xs">
          <thead>
            <tr>
              <th />
              {cols.map((c) => (
                <th key={c} className="w-16 px-1 text-center align-bottom font-semibold">
                  <span className="mx-auto mb-1 block size-3 rounded-full border border-black/20" style={{ background: INDICATORS.find((i) => i.id === c)!.start }} />
                  {SHORT[c]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((s) => (
              <tr key={s.id}>
                <th className="pr-2 text-right font-semibold whitespace-nowrap">
                  {s.emoji} {s.name}
                </th>
                {cols.map((c) => {
                  const k = `${s.id}|${c}`
                  const shown = done.has(k)
                  const res = INDICATORS.find((i) => i.id === c)!.colour(s.pH)
                  return (
                    <td key={c} className="p-0">
                      <button
                        type="button"
                        onClick={() => drop(s.id, c)}
                        className={cn('grid size-14 place-items-center rounded-full border-2 bg-background shadow-inner transition hover:border-primary', last === k && 'ring-2 ring-primary')}
                        aria-label={shown ? `${SHORT[c]} in ${s.name}: ${res.label}` : `Test ${SHORT[c]} in ${s.name}`}
                      >
                        {shown ? (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid size-11 place-items-center rounded-full border border-black/10 text-[9px] leading-tight font-semibold" style={{ background: res.hex, color: ['#f8fafc', '#facc15', '#c084fc'].includes(res.hex) ? '#334155' : '#fff' }}>
                            {res.label.replace('turns ', '').replace('stays ', '= ')}
                          </motion.span>
                        ) : (
                          <span className="text-muted-foreground">+</span>
                        )}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="text-sm">
          Wells tested: <b>{done.size}</b> / {total}
        </p>
        <Button size="sm" variant="outline" disabled={done.size < 10} onClick={() => setDone(new Set(ROWS.flatMap((r) => cols.map((c) => `${r.id}|${c}`))))}>
          Fill the rest {done.size < 10 && '(test 10 first)'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setDone(new Set()); setLast(null) }}>
          Clean the tile
        </Button>
      </div>
      {lastInfo && <p role="status" className="mt-2 rounded-lg bg-chem-soft px-3 py-2 text-sm">🔬 {lastInfo}</p>}
      {done.size === total && (
        <div className="mt-3 rounded-xl border bg-success-soft p-3 text-sm">
          <p className="font-semibold">Patterns to notice:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            <li><b>Turmeric</b> and <b>phenolphthalein</b> only change in bases. They can't tell an acid from a neutral solution.</li>
            <li><b>China rose</b> and <b>red cabbage</b> change in BOTH acids and bases. Red cabbage even shows how strong!</li>
            <li>You need <b>both</b> litmus colours to be sure something is neutral.</li>
          </ul>
        </div>
      )}
    </LabFrame>
  )
}
