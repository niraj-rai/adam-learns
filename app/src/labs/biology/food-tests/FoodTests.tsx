import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { FOODS, result, type TestId, TESTS } from './model'

export default function FoodTests() {
  const [test, setTest] = useState<TestId>('starch')
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [last, setLast] = useState<string | null>(null)
  const T = TESTS[test]
  const run = (id: string) => { setLast(id); setDone((d) => ({ ...d, [`${test}:${id}`]: true })) }
  const f = FOODS.find((x) => x.id === last)
  const positive = f ? result(f, test) : false
  const total = Object.keys(done).length
  return (
    <LabFrame labId="food-tests" title="Food Test Lab" subtitle="Which foods contain starch, protein and fat? Test them like a food scientist." howTo={<p>Choose a test, then test each food. Watch the colour change. Fill in the results table: which foods are good sources of each nutrient?</p>}>
      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(TESTS) as TestId[]).map((k) => <Button key={k} size="sm" variant={k === test ? 'default' : 'outline'} onClick={() => { setTest(k); setLast(null) }}>{TESTS[k].name}</Button>)}
      </div>
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div className="grid place-items-center rounded-2xl border bg-background p-4">
          <svg viewBox="0 0 120 140" className="w-40" role="img" aria-label={f ? `${f.name}: ${positive ? T.positive : T.negative}` : 'Empty test tube'}>
            {test === 'fat' ? (
              <g>
                <rect x={10} y={20} width={100} height={110} fill="#fafaf9" stroke="#d6d3d1" />
                {f && <motion.ellipse key={f.id + test} cx={60} cy={75} initial={{ rx: 0, ry: 0 }} animate={{ rx: 30, ry: 22 }} fill={positive ? T.colour : T.none} opacity={positive ? 0.8 : 0.3} />}
                <text x={60} y={15} textAnchor="middle" fontSize={9} className="fill-muted-foreground">paper held up to the light</text>
              </g>
            ) : (
              <g>
                <path d="M45 10 V110 Q45 130 60 130 Q75 130 75 110 V10" fill="none" stroke="#94a3b8" strokeWidth={2} />
                <motion.path key={(f?.id ?? 'none') + test} d="M47 60 V110 Q47 128 60 128 Q73 128 73 110 V60 Z" initial={{ fill: T.none }} animate={{ fill: f ? (positive ? T.colour : T.none) : '#e2e8f0' }} transition={{ duration: 1.2 }} />
              </g>
            )}
          </svg>
          <p className="text-center text-sm">{f ? `${f.emoji} ${f.name}` : 'Choose a food'}</p>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Reagent: <b>{T.reagent}</b>. Positive: <b>{T.positive}</b>. Negative: {T.negative}.</p>
          <div className="flex flex-wrap gap-1.5">
            {FOODS.map((x) => <button key={x.id} type="button" onClick={() => run(x.id)} className={cn('rounded-full border px-3 py-1 text-sm', last === x.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.emoji} {x.name}</button>)}
          </div>
          {f && <p role="status" className={cn('rounded-lg p-3 text-sm', positive ? 'bg-success-soft' : 'bg-muted/50')}>{positive ? `✅ Positive: ${T.positive}. ${f.name} contains ${test}.` : `➖ Negative: ${T.negative}. Little or no ${test} detected in ${f.name.toLowerCase()}.`}</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left"><th className="py-1">Food</th><th>Starch</th><th>Protein</th><th>Fat</th></tr></thead>
              <tbody>
                {FOODS.map((x) => (
                  <tr key={x.id} className="border-b border-dashed">
                    <td className="py-1">{x.emoji} {x.name}</td>
                    {(['starch', 'protein', 'fat'] as const).map((t) => <td key={t}>{done[`${t}:${x.id}`] ? (result(x, t) ? '✅' : '➖') : ''}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Readout label="Tests done" value={`${total} / ${FOODS.length * 3}`} />
        </div>
      </div>
    </LabFrame>
  )
}
