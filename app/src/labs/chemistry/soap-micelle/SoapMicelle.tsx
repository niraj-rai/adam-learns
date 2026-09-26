import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'

export default function SoapMicelle() {
  const [soap, setSoap] = useState(12)
  const [hard, setHard] = useState(0)
  const [kind, setKind] = useState<'soap' | 'detergent'>('soap')
  const wasted = kind === 'soap' ? Math.min(soap, Math.round(hard * 1.2)) : 0
  const working = soap - wasted
  const ring = Math.max(0, working)
  const cleaned = Math.min(100, Math.round((ring / 16) * 100))
  return (
    <LabFrame labId="soap-micelle" title="How Soap Cleans" subtitle="Soap molecules have a water-loving head and an oil-loving tail. They surround grease in micelles that rinse away." howTo={<p>Add soap molecules to an oily stain. Then make the water harder (more calcium and magnesium salts) and compare soap with a detergent.</p>}>
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <svg viewBox="-110 -110 220 220" className="mx-auto w-full max-w-[240px] rounded-2xl border bg-sky-50 dark:bg-sky-950/30" role="img" aria-label={`${ring} soap molecules around an oil drop`}>
          <circle r={42} fill="#facc15" opacity={0.85} /><text y={4} textAnchor="middle" fontSize={11} fill="#713f12">oil / grease</text>
          {Array.from({ length: ring }, (_, k) => { const a = (2 * Math.PI * k) / Math.max(ring, 1); return <g key={k} transform={`rotate(${(a * 180) / Math.PI})`}><line x1={30} y1={0} x2={62} y2={0} stroke="#78350f" strokeWidth={2.5} /><circle cx={66} cy={0} r={6} fill="#2563eb" /></g> })}
          {Array.from({ length: wasted }, (_, k) => <rect key={k} x={-100 + (k % 10) * 20} y={88 + Math.floor(k / 10) * 8} width={14} height={6} fill="#d6d3d1" />)}
        </svg>
        <div className="space-y-3">
          <div className="inline-flex rounded-lg border p-1 text-sm" role="tablist">{(['soap', 'detergent'] as const).map((k) => <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)} className={cn('rounded-md px-3 py-1 capitalize', kind === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{k}</button>)}</div>
          <label className="block text-sm">{kind === 'soap' ? 'Soap' : 'Detergent'} molecules <b>{soap}</b><Slider value={[soap]} min={0} max={24} step={1} onValueChange={([v]) => setSoap(v)} className="mt-1" aria-label="number of soap molecules" /></label>
          <label className="block text-sm">Hardness of the water <b>{hard === 0 ? 'soft' : hard < 5 ? 'a little hard' : 'very hard'}</b><Slider value={[hard]} min={0} max={10} step={1} onValueChange={([v]) => setHard(v)} className="mt-1" aria-label="water hardness" /></label>
          <div className="grid gap-2 sm:grid-cols-3">
            <Readout label="Working molecules" value={working} />
            <Readout label="Wasted as scum" value={wasted} />
            <Readout label="Cleaning power" value={`${cleaned}%`} />
          </div>
          <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm">{kind === 'soap' ? (hard ? 'In hard water, soap reacts with calcium and magnesium ions to form an insoluble grey scum, so much of it is wasted.' : 'In soft water, soap works well and makes plenty of lather.') : 'Detergents do not form scum with calcium and magnesium ions, so they work well even in hard water.'}</p>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">A soap is the sodium or potassium salt of a long-chain carboxylic acid (made by heating oils with NaOH: <b>saponification</b>). Its ionic <b>head</b> dissolves in water; its long hydrocarbon <b>tail</b> dissolves in oil. The tails bury themselves in the grease and the heads face outwards, forming a <b>micelle</b> that water can carry away.</p>
    </LabFrame>
  )
}
