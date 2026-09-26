import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { add, compare, frac, lcm, mixed, sub } from '../_shared/fraction'
import { equivalentsOnWall, ROWS } from './model'

type Pick = { n: number; d: number }
const COLORS = { A: { fill: 'bg-sky-400/80', line: '#0284c7' }, B: { fill: 'bg-pink-400/80', line: '#db2777' } }

export default function FractionWall() {
  const [a, setA] = useState<Pick>({ n: 2, d: 3 })
  const [b, setB] = useState<Pick>({ n: 3, d: 4 })
  const [active, setActive] = useState<'A' | 'B'>('A')
  const fa = frac(a.n, a.d)
  const fb = frac(b.n, b.d)
  const c = compare(fa, fb)
  const L = lcm(a.d, b.d)
  const eq = equivalentsOnWall(fa.n, fa.d)
  const set = (d: number, n: number) => (active === 'A' ? setA : setB)({ n, d })
  return (
    <LabFrame labId="fraction-wall" title="Fraction Wall" subtitle="Every row is one whole cut into equal pieces. Compare, find equivalents and add." howTo={<p>Choose fraction A or B, then tap a piece on the wall: tapping the 3rd piece of the eighths row makes 3/8. The coloured lines show where each fraction ends.</p>}>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span>Setting:</span>
        {(['A', 'B'] as const).map((k) => (
          <button key={k} type="button" aria-pressed={active === k} onClick={() => setActive(k)} className={cn('rounded-lg border-2 px-3 py-1 font-semibold', active === k ? 'border-chem bg-chem-soft' : 'hover:bg-muted')}>
            <span className={cn('mr-1 inline-block size-3 rounded-sm', COLORS[k].fill)} />Fraction {k} = {(k === 'A' ? a : b).n}/{(k === 'A' ? a : b).d}
          </button>
        ))}
      </div>
      <div className="relative rounded-2xl border bg-background p-2">
        {ROWS.map((d) => (
          <div key={d} className="flex h-7 gap-px py-px">
            {Array.from({ length: d }, (_, k) => {
              const inA = a.d === d && k < a.n
              const inB = b.d === d && k < b.n
              return (
                <button key={k} type="button" onClick={() => set(d, k + 1)} aria-label={`${k + 1}/${d}`} className={cn('flex-1 rounded-sm border text-[10px] leading-none transition hover:brightness-95', inA ? COLORS.A.fill : inB ? COLORS.B.fill : 'bg-muted/60')}>
                  {d <= 10 ? (d === 1 ? '1' : `1/${d}`) : ''}
                </button>
              )
            })}
          </div>
        ))}
        {([['A', a], ['B', b]] as const).map(([k, f]) => (
          <div key={k} aria-hidden className="pointer-events-none absolute top-1 bottom-1 w-0.5" style={{ left: `calc(0.5rem + (100% - 1rem) * ${f.n / f.d})`, background: COLORS[k].line }} />
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Compare" value={`${a.n}/${a.d} ${c < 0 ? '<' : c > 0 ? '>' : '='} ${b.n}/${b.d}`} />
        <Readout label="A + B" value={`${a.n * (L / a.d)}/${L} + ${b.n * (L / b.d)}/${L} = ${mixed(add(fa, fb))}`} />
        <Readout label="A − B" value={mixed(sub(fa, fb)).replace('-', '−')} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">
        <b>Equivalent to A on this wall:</b> {eq.map(([d, n]) => `${n}/${d}`).join(' = ')}.
        {' '}To add or subtract, rewrite both fractions with a <b>common denominator</b> ({L} here, the LCM of {a.d} and {b.d}) so the pieces are the same size.
      </p>
    </LabFrame>
  )
}
