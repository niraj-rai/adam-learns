import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { ELEMENTS, shells, valency } from '../../_kit/elements'

const NOBLE = [2, 10, 18]
const sup = (c: number) => (c === 0 ? '' : `${Math.abs(c) > 1 ? Math.abs(c) : ''}${c > 0 ? '+' : '−'}`)

export default function IonMaker() {
  const [z, setZ] = useState(11)
  const [electrons, setElectrons] = useState(11)
  const el = ELEMENTS.find((e) => e.z === z)!
  const sh = shells(electrons)
  const charge = z - electrons
  const stable = NOBLE.includes(electrons)
  const outer = shells(z).at(-1)!
  const pick = (nz: number) => { setZ(nz); setElectrons(nz) }
  const change = (d: number) => {
    const ne = Math.max(0, Math.min(z + 3, Math.max(z - 3, electrons + d)))
    setElectrons(ne)
    if (NOBLE.includes(ne) && ne !== z) sfx.correct()
    else sfx.click()
  }
  const R = [26, 46, 66, 86]
  return (
    <LabFrame labId="ion-maker" title="Ion Maker" subtitle="Atoms lose or gain electrons to get a full outer shell. The number they lose or gain is their valency." howTo={<p>Pick an element. Remove or add outer electrons until the atom has a full outer shell like a noble gas, and see the ion's charge.</p>}>
      <div className="grid grid-cols-10 gap-1">
        {ELEMENTS.map((e) => <button key={e.z} type="button" aria-pressed={z === e.z} onClick={() => pick(e.z)} className={cn('rounded-md border py-1 text-xs', z === e.z ? 'border-chem bg-chem-soft font-bold' : 'hover:bg-muted')} title={e.name}>{e.symbol}</button>)}
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-[240px_1fr]">
        <svg viewBox="-100 -100 200 200" className="mx-auto w-full max-w-[240px]" role="img" aria-label={`${el.name} with ${electrons} electrons, charge ${charge}`}>
          <circle r={16} fill="#ef4444" /><text y={4} textAnchor="middle" fontSize={10} fill="white" fontWeight={700}>{z}p</text>
          {sh.map((n, k) => (
            <g key={k}>
              <circle r={R[k]} fill="none" stroke="currentColor" strokeOpacity={0.3} />
              {Array.from({ length: n }, (_, j) => { const a = (2 * Math.PI * j) / n - Math.PI / 2; return <circle key={j} cx={R[k] * Math.cos(a)} cy={R[k] * Math.sin(a)} r={4.5} fill={k === sh.length - 1 ? '#2563eb' : '#64748b'} /> })}
            </g>
          ))}
          {charge !== 0 && <text x={70} y={-78} fontSize={16} fontWeight={700} fill={charge > 0 ? '#dc2626' : '#2563eb'}>{sup(charge)}</text>}
        </svg>
        <div className="space-y-3">
          <p className="font-heading text-2xl font-bold">{el.name} {charge === 0 ? 'atom' : 'ion'}: {el.symbol}<sup>{sup(charge)}</sup></p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => change(-1)} disabled={electrons <= Math.max(0, z - 3)}>➖ Remove an electron</Button>
            <Button variant="outline" onClick={() => change(1)} disabled={electrons >= z + 3}>➕ Add an electron</Button>
            <Button variant="ghost" onClick={() => setElectrons(z)}>↺ Reset</Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Protons / electrons" value={`${z} / ${electrons}`} />
            <Readout label="Electron arrangement" value={sh.join(', ') || '0'} />
            <Readout label="Charge" value={charge === 0 ? '0 (neutral)' : `${charge > 0 ? '+' : '−'}${Math.abs(charge)}`} />
            <Readout label={`Valency of ${el.symbol}`} value={valency(z)} />
          </div>
          <p className={cn('rounded-xl px-3 py-2 text-sm', stable && charge !== 0 ? 'bg-success-soft' : 'bg-muted/60')}>
            {stable && charge === 0 ? `${el.name} already has a full outer shell: a noble gas, valency 0, so it hardly reacts.`
              : stable ? `✅ Full outer shell! ${el.name} ${charge > 0 ? 'lost' : 'gained'} ${Math.abs(charge)} electron${Math.abs(charge) > 1 ? 's' : ''} to become ${el.symbol}${sup(charge)}. Its valency is ${Math.abs(charge)}.`
              : outer === 4 ? `${el.name} has 4 outer electrons: losing or gaining 4 is too hard, so it shares electrons instead (valency 4).`
              : `${el.name} has ${outer} outer electron${outer > 1 ? 's' : ''}. ${outer <= 3 ? `It's easier to lose ${outer}` : `It's easier to gain ${8 - outer}`} to get a full shell. Try it!`}
          </p>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Metals (1–3 outer electrons) <b>lose</b> electrons and form <b>positive ions</b>; non-metals (5–7) <b>gain</b> electrons and form <b>negative ions</b>. Valency, the combining capacity, is the number of electrons lost, gained or shared.</p>
    </LabFrame>
  )
}
