import { useState } from 'react'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { indianCommas, indianWords, internationalCommas } from '../_shared/words'

const PLACES = [
  { name: 'Lakhs', short: 'L', value: 100000 },
  { name: 'Ten thousands', short: 'TTh', value: 10000 },
  { name: 'Thousands', short: 'Th', value: 1000 },
  { name: 'Hundreds', short: 'H', value: 100 },
  { name: 'Tens', short: 'T', value: 10 },
  { name: 'Ones', short: 'O', value: 1 },
]

export default function PlaceValue() {
  const [digits, setDigits] = useState([1, 2, 0, 5, 3, 0])
  const n = digits.reduce((s, d, i) => s + d * PLACES[i].value, 0)
  const set = (i: number, dv: number) => setDigits(digits.map((d, j) => (j === i ? (d + dv + 10) % 10 : d)))
  const expanded = digits.map((d, i) => d * PLACES[i].value).filter(Boolean)
  return (
    <LabFrame labId="place-value" title="Place Value Counter" subtitle="Each place is worth ten times the place to its right. Build big numbers and read them the Indian way." howTo={<p>Tap ▲ and ▼ to change each digit. Watch the number, its commas and its name change.</p>}>
      <div className="grid grid-cols-6 gap-1 sm:gap-2">
        {PLACES.map((p, i) => (
          <div key={p.name} className="rounded-xl border p-1 text-center sm:p-2">
            <p className="text-[10px] text-muted-foreground sm:text-xs"><span className="sm:hidden">{p.short}</span><span className="hidden sm:inline">{p.name}</span></p>
            <button type="button" aria-label={`more ${p.name}`} onClick={() => set(i, 1)} className="w-full rounded hover:bg-muted">▲</button>
            <p className="font-heading text-2xl font-bold text-chem sm:text-3xl">{digits[i]}</p>
            <button type="button" aria-label={`fewer ${p.name}`} onClick={() => set(i, -1)} className="w-full rounded hover:bg-muted">▼</button>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Readout label="Indian system" value={indianCommas(n)} />
        <Readout label="International system" value={internationalCommas(n)} />
      </div>
      <p className="mt-3 rounded-xl border px-3 py-2 text-sm"><b>Number name:</b> {indianWords(n)}</p>
      <p className="mt-2 rounded-xl bg-muted/60 px-3 py-2 font-mono text-sm">Expanded form: {expanded.length ? expanded.map((x) => indianCommas(x)).join(' + ') : '0'}</p>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">In India we group digits as <b>lakhs, thousands and ones</b> (12,34,567). Most other countries group in threes (1,234,567). 1 lakh = 100 thousand, and 10 lakh = 1 million. The place-value system with zero was developed in India and spread around the world.</p>
    </LabFrame>
  )
}
