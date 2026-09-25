import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { getIndicator, titrationPH } from '../../_kit/ph'
import { LabFrame, Readout } from '../../_kit/LabFrame'

type Ind = 'universal' | 'phenolphthalein'

export default function NeutraliseIt() {
  const [ml, setMl] = useState(0)
  const [ind, setInd] = useState<Ind>('universal')
  const [hitNeutral, setHitNeutral] = useState(false)
  const pH = titrationPH(ml)
  const colour = getIndicator(ind).colour(pH)
  const neutral = pH >= 6.5 && pH <= 7.5

  const curve = useMemo(() => {
    const pts: { v: number; pH: number }[] = []
    for (let v = 0; v <= ml + 1e-9; v += ml > 60 ? 1 : 0.5) pts.push({ v: Math.round(v * 10) / 10, pH: Math.round(titrationPH(v) * 100) / 100 })
    if (pts.length && pts[pts.length - 1].v !== ml) pts.push({ v: ml, pH: Math.round(pH * 100) / 100 })
    return pts
  }, [ml, pH])

  const add = (d: number) => {
    const next = Math.round(Math.min(100, ml + d) * 10) / 10
    setMl(next)
    const p = titrationPH(next)
    if (p >= 6.5 && p <= 7.5 && !hitNeutral) {
      setHitNeutral(true)
      sfx.win()
    }
  }

  return (
    <LabFrame
      labId="neutralise-it"
      title="Neutralise It!"
      subtitle="Add base drop by drop until the acid is exactly neutral"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>The flask has 50 mL of dilute hydrochloric acid. The burette has sodium hydroxide (a base) of the same strength.</li>
          <li>Add base in big steps at first, then slow down near the end, just like a real titration.</li>
          <li>Aim for pH 7. Watch how suddenly the pH jumps near the end!</li>
        </ul>
      }
    >
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div className="space-y-2">
          <svg viewBox="0 0 160 240" className="mx-auto w-full max-w-[180px]" role="img" aria-label={`Flask pH ${pH.toFixed(1)}, indicator ${colour.label}`}>
            {/* burette */}
            <rect x={72} y={4} width={16} height={100} rx={3} fill="#e0f2fe" stroke="#94a3b8" />
            <rect x={72} y={4 + ml} width={16} height={Math.max(0, 100 - ml)} rx={3} fill="#bae6fd" opacity={0.9} />
            <rect x={77} y={104} width={6} height={16} fill="#94a3b8" />
            {/* flask */}
            <path d="M68 128 V150 L32 225 H128 L92 150 V128" fill="none" stroke="currentColor" strokeOpacity={0.5} strokeWidth={2.5} />
            <motion.path d="M50 188 L32 225 H128 L110 188 Z" animate={{ fill: colour.hex }} transition={{ duration: 0.4 }} opacity={0.85} />
          </svg>
          <div className="grid grid-cols-2 gap-2">
            <Readout label="Base added" value={`${ml.toFixed(1)} mL`} />
            <Readout label="pH" value={pH.toFixed(2)} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(['universal', 'phenolphthalein'] as Ind[]).map((i) => (
              <button key={i} type="button" onClick={() => setInd(i)} className={cn('rounded-full border px-3 py-1.5 text-sm', ind === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
                {getIndicator(i).name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => add(10)} disabled={ml >= 100}>+10 mL</Button>
            <Button onClick={() => add(1)} variant="outline" disabled={ml >= 100}>+1 mL</Button>
            <Button onClick={() => add(0.1)} variant="outline" disabled={ml >= 100}>+1 drop (0.1 mL)</Button>
            <Button onClick={() => { setMl(0); setHitNeutral(false) }} variant="ghost">Refill</Button>
          </div>
          <p className={cn('rounded-xl px-4 py-2 text-sm', neutral ? 'bg-success-soft' : pH < 7 ? 'bg-red-50 dark:bg-red-950/40' : 'bg-blue-50 dark:bg-blue-950/40')} role="status">
            {neutral
              ? `🎉 Neutral! You added ${ml.toFixed(1)} mL. The acid and base cancelled out to make salt (sodium chloride) and water.`
              : pH < 7
                ? `Still acidic. The indicator ${colour.label}. Keep adding base.`
                : `Overshot! Too much base, so now it is basic (indicator ${colour.label}). In a real titration you would start again.`}
          </p>
          <div className="h-52 rounded-xl border bg-background p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curve} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="v" type="number" domain={[0, Math.max(60, ml)]} tick={{ fontSize: 11 }} label={{ value: 'base added (mL)', position: 'insideBottom', offset: -8, fontSize: 11 }} />
                <YAxis domain={[0, 14]} ticks={[0, 2, 4, 6, 7, 8, 10, 12, 14]} tick={{ fontSize: 11 }} width={30} />
                <ReferenceArea y1={6.5} y2={7.5} fill="#22c55e" fillOpacity={0.15} />
                <Tooltip formatter={(v) => [v, 'pH']} labelFormatter={(l) => `${l} mL`} />
                <Line dataKey="pH" stroke="var(--chem)" strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {ind === 'phenolphthalein' && <p className="text-xs text-muted-foreground">Phenolphthalein is colourless in acid and turns pink just past neutral (about pH 8.2). The first permanent pale pink shows you've reached the end point.</p>}
        </div>
      </div>
      <p className="mt-3 text-sm">
        <b>Word equation:</b> hydrochloric acid + sodium hydroxide → sodium chloride (salt) + water
      </p>
    </LabFrame>
  )
}
