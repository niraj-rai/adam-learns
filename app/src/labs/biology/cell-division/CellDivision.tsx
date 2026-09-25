import { motion } from 'motion/react'
import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { bacteriaAfter, cellsAfter, doublingsTo, HUMAN_CELLS } from './model'

const fmt = (n: number) => (n >= 1e12 ? `${(n / 1e12).toFixed(1)} trillion` : n >= 1e9 ? `${(n / 1e9).toFixed(1)} billion` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} million` : n.toLocaleString('en-IN'))

export default function CellDivision() {
  const [tab, setTab] = useState<'split' | 'bacteria'>('split')
  const [n, setN] = useState(3)
  const [hours, setHours] = useState(4)
  const shown = Math.min(cellsAfter(n), 64)
  return (
    <LabFrame labId="cell-division" title="One Cell to Many" subtitle="New cells come only from existing cells. Watch one cell become millions." howTo={<p>Tab 1: split a cell again and again. How quickly do the numbers grow? Tab 2: see how fast bacteria multiply in food left out on a warm day.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['split', '🔬 Divide!'], ['bacteria', '🦠 Bacteria in food']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'split' ? (
        <div className="space-y-3">
          <div className="flex min-h-40 flex-wrap content-center justify-center gap-1 rounded-2xl border bg-background p-3" aria-label={`${cellsAfter(n)} cells`}>
            {Array.from({ length: shown }, (_, i) => (
              <motion.span key={`${n}-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.01 }} className="grid place-items-center rounded-full bg-lime-200 dark:bg-lime-800" style={{ width: Math.max(10, 60 - n * 8), height: Math.max(10, 60 - n * 8) }}>
                <span className="block rounded-full bg-violet-500" style={{ width: Math.max(3, 16 - n * 2), height: Math.max(3, 16 - n * 2) }} />
              </motion.span>
            ))}
            {cellsAfter(n) > 64 && <span className="self-center text-sm text-muted-foreground">…and {fmt(cellsAfter(n) - 64)} more</span>}
          </div>
          <label className="block text-sm">Rounds of division: <b>{n}</b>
            <Slider value={[n]} min={0} max={46} step={1} onValueChange={([v]) => setN(v)} className="mt-1.5" aria-label="Rounds of division" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Readout label="Number of cells" value={fmt(cellsAfter(n))} />
            <Readout label="Human body (about)" value={`${fmt(HUMAN_CELLS)} cells ≈ ${doublingsTo(HUMAN_CELLS)} doublings`} />
          </div>
          <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Each division makes two cells from one, so the numbers <b>double</b> every time. You began as a single cell! Growth, and the repair of cuts and broken bones, happen by cell division. Unicellular organisms like amoeba and bacteria reproduce by simply splitting in two.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block text-sm">Hours that cooked rice is left out on a warm day: <b>{hours}</b>
            <Slider value={[hours]} min={0} max={10} step={1} onValueChange={([v]) => setHours(v)} className="mt-1.5" aria-label="Hours left out" />
          </label>
          <Readout label="Bacteria from ONE bacterium (dividing every 20 min)" value={fmt(bacteriaAfter(hours))} />
          <p className="rounded-xl bg-warn-soft px-4 py-2 text-sm">Some bacteria can divide every 20 minutes in warm, moist food. In just 8 hours, one bacterium could become over 16 million! That's why cooked food should be eaten fresh or kept in the fridge: cold slows division right down. (In real food, growth eventually slows as food and space run out.)</p>
        </div>
      )}
    </LabFrame>
  )
}
