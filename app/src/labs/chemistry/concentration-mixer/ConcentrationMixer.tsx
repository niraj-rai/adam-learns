import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { massByMass, massByVolume, volumeByVolume } from '../_shared/quantities'

type Mode = 'mm' | 'mv' | 'vv'
const MODES: { m: Mode; label: string; solute: string; unit: string }[] = [
  { m: 'mm', label: '% by mass (m/m)', solute: 'Sugar', unit: 'g' },
  { m: 'mv', label: '% mass by volume (m/v)', solute: 'Salt', unit: 'g' },
  { m: 'vv', label: '% by volume (v/v)', solute: 'Vinegar (acetic acid)', unit: 'mL' },
]
const CHALLENGES: { mode: Mode; text: string; check: (a: number, b: number) => boolean }[] = [
  { mode: 'mm', text: 'Make 200 g of a 10% (m/m) sugar solution.', check: (a, b) => a === 20 && a + b === 200 },
  { mode: 'mv', text: 'Make 500 mL of a 0.9% (m/v) salt solution, like saline used in hospitals.', check: (a, b) => Math.abs(a - 4.5) < 0.01 && b === 500 },
  { mode: 'vv', text: 'Make 100 mL of a 5% (v/v) acetic acid solution, like kitchen vinegar.', check: (a, b) => a === 5 && b === 100 },
]

export default function ConcentrationMixer() {
  const [mode, setMode] = useState<Mode>('mm')
  const [a, setA] = useState(10) // solute amount
  const [b, setB] = useState(150) // solvent g (mm) or solution volume mL (mv, vv)
  const [done, setDone] = useState<number[]>([])
  const cfg = MODES.find((x) => x.m === mode)!
  const pct = mode === 'mm' ? massByMass(a, b) : mode === 'mv' ? massByVolume(a, b) : volumeByVolume(a, b)
  const valid = mode !== 'vv' || a <= b
  const switchMode = (m: Mode) => { setMode(m); if (m === 'mm') { setA(10); setB(150) } else if (m === 'mv') { setA(5); setB(500) } else { setA(10); setB(100) } }
  const tryIt = () => {
    const hits = CHALLENGES.map((c, i) => (c.mode === mode && c.check(a, b) ? i : -1)).filter((i) => i >= 0)
    if (hits.length) { setDone((d) => [...new Set([...d, ...hits])]); sfx.correct() } else sfx.wrong()
  }
  const tint = Math.min(1, pct / 30)
  const fill = mode === 'mm' ? 40 + Math.min(120, (a + b) / 3) : 40 + Math.min(120, b / 5)
  return (
    <LabFrame labId="concentration-mixer" title="Concentration Mixer" subtitle="How strong is a solution? Concentration tells you how much solute is in a given amount of solution." howTo={<p>Choose a type of concentration, set the amounts, and read the percentage. Then try the challenges and press Check my solution.</p>}>
      <div className="inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {MODES.map((x) => <button key={x.m} type="button" role="tab" aria-selected={mode === x.m} onClick={() => switchMode(x.m)} className={cn('rounded-md px-3 py-1', mode === x.m ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{x.label}</button>)}
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-[160px_1fr]">
        <svg viewBox="0 0 160 200" className="mx-auto w-full max-w-[160px]" role="img" aria-label={`Solution of ${pct.toFixed(1)} percent`}>
          <path d="M30,20 L30,185 Q30,195 40,195 L120,195 Q130,195 130,185 L130,20" fill="none" stroke="currentColor" strokeOpacity={0.4} strokeWidth={3} />
          <rect x={32} y={193 - fill} width={96} height={fill} fill={mode === 'vv' ? '#f59e0b' : mode === 'mv' ? '#38bdf8' : '#a78bfa'} opacity={0.2 + tint * 0.7} />
          <text x={80} y={193 - fill - 6} textAnchor="middle" fontSize={12} fill="currentColor" fontWeight={700}>{valid ? `${pct.toFixed(1)}%` : '—'}</text>
        </svg>
        <div className="space-y-3">
          <label className="block text-sm">{cfg.solute} (solute): <b>{a} {cfg.unit}</b><Slider value={[a]} min={0} max={mode === 'mv' ? 50 : 100} step={mode === 'mv' ? 0.5 : 1} onValueChange={([v]) => setA(v)} className="mt-1" aria-label="solute amount" /></label>
          <label className="block text-sm">{mode === 'mm' ? <>Water (solvent): <b>{b} g</b></> : <>Total volume of solution: <b>{b} mL</b></>}<Slider value={[b]} min={mode === 'mm' ? 0 : 50} max={mode === 'mm' ? 500 : 1000} step={10} onValueChange={([v]) => setB(v)} className="mt-1" aria-label={mode === 'mm' ? 'water mass' : 'solution volume'} /></label>
          <div className="grid gap-2 sm:grid-cols-2">
            {mode === 'mm' && <Readout label="Mass of solution" value={`${a} + ${b} = ${a + b} g`} />}
            <Readout label="Concentration" value={!valid ? 'Solute can’t exceed the solution!' : mode === 'mm' ? `${a} ÷ ${a + b} × 100 = ${pct.toFixed(1)}%` : `${a} ÷ ${b} × 100 = ${pct.toFixed(2)}%`} />
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border p-3">
        <p className="font-semibold">🎯 Challenges</p>
        <ul className="mt-1 space-y-1 text-sm">{CHALLENGES.map((c, i) => <li key={i} className={cn(c.mode === mode ? '' : 'opacity-50')}>{done.includes(i) ? '✅' : '⬜'} {c.text}</li>)}</ul>
        <button type="button" onClick={tryIt} className="mt-2 rounded-lg border-2 border-chem bg-chem-soft px-3 py-1 text-sm font-semibold">Check my solution</button>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>Concentration</b> = amount of solute ÷ amount of <b>solution</b> × 100. Remember: solution = solute + solvent. Mass by mass is used for solids, volume by volume for liquids (like the % alcohol on a hand sanitiser), and mass by volume for things like medical saline.</p>
    </LabFrame>
  )
}
