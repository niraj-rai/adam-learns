import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { endpointVolume, pHAfter } from './model'

const ACID_VOL = 25
const BASE_CONC = 0.1

export default function TitrationLab() {
  const [acidConc, setAcidConc] = useState(0.1)
  const [added, setAdded] = useState(0)
  const [readings, setReadings] = useState<{ v: number; pH: number }[]>([])
  const pH = pHAfter(ACID_VOL, acidConc, added, BASE_CONC)
  const pink = pH >= 8.3
  const end = endpointVolume(ACID_VOL, acidConc, BASE_CONC)
  const add = (dv: number) => {
    const v = Math.round(Math.min(50, added + dv) * 10) / 10
    setAdded(v)
    setReadings((r) => [...r.filter((x) => x.v !== v), { v, pH: pHAfter(ACID_VOL, acidConc, v, BASE_CONC) }].sort((a, b) => a.v - b.v))
  }
  const reset = () => { setAdded(0); setReadings([]) }
  const X = (v: number) => 30 + (v / 50) * 260
  const Y = (p: number) => 170 - (p / 14) * 160
  return (
    <LabFrame labId="titration-lab" title="Titration" subtitle="Add alkali to acid drop by drop. The indicator changes colour at the endpoint, when the acid is exactly neutralised." howTo={<p>Add sodium hydroxide from the burette to 25 mL of hydrochloric acid with phenolphthalein. Slow down near the endpoint! Use the volume to find the acid's concentration.</p>}>
      <div className="grid gap-4 md:grid-cols-[160px_1fr]">
        <svg viewBox="0 0 160 260" className="mx-auto w-full max-w-[160px]" role="img" aria-label={`Flask is ${pink ? 'pink' : 'colourless'} at pH ${pH.toFixed(1)}`}>
          <rect x={70} y={5} width={20} height={120} fill="#e0f2fe" stroke="#0369a1" />
          <rect x={70} y={5 + (added / 50) * 120} width={20} height={120 - (added / 50) * 120} fill="#bae6fd" />
          <path d="M75,125 L85,125 L82,145 L78,145 Z" fill="#0369a1" />
          <path d="M55,170 L105,170 L140,245 L20,245 Z" fill={pink ? '#f9a8d4' : '#f1f5f9'} stroke="#64748b" strokeWidth={2} opacity={0.9} />
          <text x={80} y={160} textAnchor="middle" fontSize={9} fill="currentColor">{added.toFixed(1)} mL added</text>
        </svg>
        <div className="space-y-3">
          <label className="block text-sm">Acid concentration (hidden in a real lab!) <b>{acidConc.toFixed(2)} mol/L</b><Slider value={[acidConc]} min={0.05} max={0.2} step={0.01} onValueChange={([v]) => { setAcidConc(v); reset() }} className="mt-1" aria-label="acid concentration" /></label>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => add(5)}>+5 mL</Button>
            <Button variant="outline" onClick={() => add(1)}>+1 mL</Button>
            <Button variant="outline" onClick={() => add(0.1)}>+1 drop (0.1 mL)</Button>
            <Button variant="ghost" onClick={reset}>Reset</Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Readout label="pH" value={pH.toFixed(2)} />
            <Readout label="Indicator" value={pink ? '💗 Pink' : '⚪ Colourless'} />
            <Readout label="NaOH added" value={`${added.toFixed(1)} mL`} />
          </div>
          {pink && <p className="rounded-xl bg-success-soft px-3 py-2 text-sm">Endpoint reached at about {added.toFixed(1)} mL (exact: {end.toFixed(2)} mL). Moles of NaOH = {BASE_CONC} × {end.toFixed(2)} ÷ 1000 = {(BASE_CONC * end / 1000).toFixed(5)} mol = moles of HCl, so the acid's concentration = {(BASE_CONC * end / ACID_VOL).toFixed(3)} mol/L.</p>}
        </div>
      </div>
      <svg viewBox="0 0 300 190" className="mt-3 w-full rounded-2xl border bg-background" role="img" aria-label="pH curve">
        <line x1={30} y1={170} x2={290} y2={170} stroke="currentColor" /><line x1={30} y1={10} x2={30} y2={170} stroke="currentColor" />
        {[0, 7, 14].map((p) => <text key={p} x={26} y={Y(p) + 3} textAnchor="end" fontSize={9} fill="currentColor">{p}</text>)}
        <line x1={30} y1={Y(7)} x2={290} y2={Y(7)} stroke="currentColor" strokeOpacity={0.15} strokeDasharray="3 3" />
        <text x={288} y={185} textAnchor="end" fontSize={9} fill="currentColor">NaOH added (mL) → 50</text>
        {readings.length > 1 && <polyline points={readings.map((r) => `${X(r.v)},${Y(r.pH)}`).join(' ')} fill="none" stroke="#db2777" strokeWidth={2} />}
        {readings.map((r) => <circle key={r.v} cx={X(r.v)} cy={Y(r.pH)} r={2.5} fill="#db2777" />)}
      </svg>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Acid + base → salt + water (neutralisation): HCl + NaOH → NaCl + H₂O. Near the endpoint, the pH jumps from about 4 to 10 with just a drop or two: that's why chemists add the last part drop by drop.</p>
    </LabFrame>
  )
}
