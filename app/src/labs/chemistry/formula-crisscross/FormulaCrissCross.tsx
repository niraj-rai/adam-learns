import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { ANIONS, CATIONS, ionicFormula, molarMass, pretty, type Ion } from '../_shared/quantities'

const sup = (c: number) => `${Math.abs(c) > 1 ? Math.abs(c) : ''}${c > 0 ? '⁺' : '⁻'}`.replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)])
const ionLabel = (i: Ion) => `${pretty(i.formula)}${sup(i.charge)}`

export default function FormulaCrissCross() {
  const [ci, setCi] = useState(7) // Fe³⁺
  const [ai, setAi] = useState(3) // O²⁻
  const cat = CATIONS[ci]
  const an = ANIONS[ai]
  const r = ionicFormula(cat, an)
  const raw = { c: Math.abs(an.charge), a: Math.abs(cat.charge) }
  const simplified = raw.c !== r.cations
  return (
    <LabFrame labId="formula-crisscross" title="Formula Criss-Cross" subtitle="Valency is an atom's combining capacity. Swap the valencies to write the formula of an ionic compound." howTo={<p>Choose a positive ion and a negative ion. Watch the valencies cross over, then check that the charges balance.</p>}>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="mb-1 text-sm font-semibold">Positive ions (cations)</p>
          <div className="flex flex-wrap gap-1">{CATIONS.map((c, i) => <button key={c.name} type="button" aria-pressed={ci === i} onClick={() => setCi(i)} className={cn('rounded-lg border-2 px-2 py-1 text-sm', ci === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{c.name} {ionLabel(c)}</button>)}</div>
        </div>
        <div>
          <p className="mb-1 text-sm font-semibold">Negative ions (anions)</p>
          <div className="flex flex-wrap gap-1">{ANIONS.map((a, i) => <button key={a.name} type="button" aria-pressed={ai === i} onClick={() => setAi(i)} className={cn('rounded-lg border-2 px-2 py-1 text-sm', ai === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{a.name} {ionLabel(a)}</button>)}</div>
        </div>
      </div>
      <svg viewBox="0 0 400 150" className="mx-auto mt-4 w-full max-w-md rounded-2xl border bg-background" role="img" aria-label={`${cat.name} and ${an.name} make ${r.formula}`}>
        <text x={110} y={50} textAnchor="middle" fontSize={30} fontWeight={700} fill="currentColor">{pretty(cat.formula)}</text>
        <text x={150} y={30} fontSize={18} fill="#dc2626" fontWeight={700}>{Math.abs(cat.charge)}</text>
        <text x={270} y={50} textAnchor="middle" fontSize={30} fontWeight={700} fill="currentColor">{pretty(an.formula)}</text>
        <text x={310} y={30} fontSize={18} fill="#2563eb" fontWeight={700}>{Math.abs(an.charge)}</text>
        <path d="M156,36 L262,108" stroke="#dc2626" strokeWidth={2} markerEnd="url(#cc-r)" fill="none" />
        <path d="M316,36 L126,108" stroke="#2563eb" strokeWidth={2} markerEnd="url(#cc-b)" fill="none" />
        <defs>
          <marker id="cc-r" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#dc2626" /></marker>
          <marker id="cc-b" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#2563eb" /></marker>
        </defs>
        <text x={120} y={130} textAnchor="middle" fontSize={14} fill="#2563eb">× {raw.c}</text>
        <text x={270} y={130} textAnchor="middle" fontSize={14} fill="#dc2626">× {raw.a}</text>
      </svg>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Formula" value={<span className="text-2xl">{pretty(r.formula)}</span>} />
        <Readout label="Charge check" value={`${r.cations} × (${cat.charge > 0 ? '+' : ''}${cat.charge}) + ${r.anions} × (${an.charge}) = ${r.cations * cat.charge + r.anions * an.charge}`} />
        <Readout label="Formula unit mass" value={`${molarMass(r.formula)} u`} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">
        {simplified ? <>The crossed numbers were {raw.c} and {raw.a}; we divide both by {raw.c / r.cations} to get the simplest ratio. </> : null}
        {(cat.poly && r.cations > 1) || (an.poly && r.anions > 1) ? <>A polyatomic ion (a group of atoms with one overall charge) goes in <b>brackets</b> when there's more than one of it. </> : null}
        The total positive charge must equal the total negative charge, so the compound is neutral.
      </p>
    </LabFrame>
  )
}
