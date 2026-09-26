import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { ELEMENTS, shells } from '../../_kit/elements'
import { pretty } from '../_shared/quantities'

const METALS = [11, 19, 12, 20, 13] // Na, K, Mg, Ca, Al
const NONMETALS = [9, 17, 8, 16] // F, Cl, O, S
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)

function Atom({ z, electrons, x, colour, label }: { z: number; electrons: number; x: number; colour: string; label: string }) {
  const sh = shells(electrons)
  const R = [16, 30, 44, 58]
  return (
    <g transform={`translate(${x},80)`}>
      <circle r={10} fill={colour} /><text y={4} textAnchor="middle" fontSize={9} fill="white" fontWeight={700}>{z}+</text>
      {sh.map((n, k) => <g key={k}><circle r={R[k]} fill="none" stroke="currentColor" strokeOpacity={0.25} />{Array.from({ length: n }, (_, j) => { const a = (2 * Math.PI * j) / n; return <circle key={j} cx={R[k] * Math.cos(a)} cy={R[k] * Math.sin(a)} r={3.5} fill={k === sh.length - 1 ? colour : '#64748b'} /> })}</g>)}
      <text y={-66} textAnchor="middle" fontSize={11} fill="currentColor" fontWeight={700}>{label}</text>
    </g>
  )
}

export default function IonicBond() {
  const [m, setM] = useState(11)
  const [nm, setNm] = useState(17)
  const [done, setDone] = useState(false)
  const metal = ELEMENTS.find((e) => e.z === m)!
  const non = ELEMENTS.find((e) => e.z === nm)!
  const lose = shells(m).at(-1)!
  const gain = 8 - shells(nm).at(-1)!
  const g = gcd(lose, gain)
  const nMetal = gain / g
  const nNon = lose / g
  const formula = `${metal.symbol}${nMetal > 1 ? nMetal : ''}${non.symbol}${nNon > 1 ? nNon : ''}`
  const sup = (c: number) => `${Math.abs(c) > 1 ? Math.abs(c) : ''}${c > 0 ? '+' : '−'}`
  return (
    <LabFrame labId="ionic-bond" title="Ionic Bonding" subtitle="Metals give electrons to non-metals. The oppositely charged ions attract: an ionic bond." howTo={<p>Choose a metal and a non-metal, then press Transfer to move the electrons. See the ions and the formula.</p>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-wrap gap-1">{METALS.map((z) => { const e = ELEMENTS.find((x) => x.z === z)!; return <button key={z} type="button" aria-pressed={m === z} onClick={() => { setM(z); setDone(false) }} className={cn('rounded-lg border-2 px-2 py-1 text-sm', m === z ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{e.name}</button> })}</div>
        <div className="flex flex-wrap gap-1">{NONMETALS.map((z) => { const e = ELEMENTS.find((x) => x.z === z)!; return <button key={z} type="button" aria-pressed={nm === z} onClick={() => { setNm(z); setDone(false) }} className={cn('rounded-lg border-2 px-2 py-1 text-sm', nm === z ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{e.name}</button> })}</div>
      </div>
      <svg viewBox="0 0 360 160" className="mt-3 w-full rounded-2xl border bg-background" role="img" aria-label={done ? `${formula} formed from ions` : 'Atoms before transfer'}>
        <Atom z={m} electrons={done ? m - lose : m} x={95} colour="#6366f1" label={done ? `${metal.symbol}${sup(lose)}` : metal.symbol} />
        <Atom z={nm} electrons={done ? nm + gain : nm} x={265} colour="#10b981" label={done ? `${non.symbol}${sup(-gain)}` : non.symbol} />
        {!done && <path d="M160,80 Q180,60 200,80" fill="none" stroke="#f59e0b" strokeWidth={2} markerEnd="url(#ib)" />}
        <defs><marker id="ib" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#f59e0b" /></marker></defs>
      </svg>
      <button type="button" onClick={() => setDone((d) => !d)} className="mt-2 rounded-lg border-2 border-chem bg-chem-soft px-3 py-1 text-sm font-semibold">{done ? '↺ Undo' : `⚡ Transfer ${lose} electron${lose > 1 ? 's' : ''}`}</button>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label={`${metal.name} loses`} value={`${lose} e⁻ → ${metal.symbol}${sup(lose)}`} />
        <Readout label={`${non.name} gains`} value={`${gain} e⁻ → ${non.symbol}${sup(-gain)}`} />
        <Readout label="Formula" value={pretty(formula)} />
      </div>
      {(nMetal > 1 || nNon > 1) && <p className="mt-2 text-sm text-muted-foreground">To balance the charges you need {nMetal} {metal.name.toLowerCase()} ion{nMetal > 1 ? 's' : ''} for every {nNon} {non.name.toLowerCase()} ion{nNon > 1 ? 's' : ''}.</p>}
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>Ionic compounds</b> form giant lattices of ions held by strong attractions, so they are hard solids with <b>high melting and boiling points</b>, often soluble in water, and they <b>conduct electricity when molten or dissolved</b> (the ions can move) but not as solids.</p>
    </LabFrame>
  )
}
