import { useState } from 'react'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { gcd } from '../_shared/fraction'

const SUITS = [{ s: '♠', red: false, name: 'spade' }, { s: '♥', red: true, name: 'heart' }, { s: '♦', red: true, name: 'diamond' }, { s: '♣', red: false, name: 'club' }]
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
type Card = { r: string; s: (typeof SUITS)[number] }
const DECK: Card[] = SUITS.flatMap((s) => RANKS.map((r) => ({ r, s })))
const face = (c: Card) => ['J', 'Q', 'K'].includes(c.r)
const EVENTS: { label: string; test: (c: Card) => boolean }[] = [
  { label: 'A red card', test: (c) => c.s.red },
  { label: 'A king', test: (c) => c.r === 'K' },
  { label: 'A face card (J, Q, K)', test: face },
  { label: 'A spade', test: (c) => c.s.name === 'spade' },
  { label: 'The ace of hearts', test: (c) => c.r === 'A' && c.s.name === 'heart' },
  { label: 'A red face card', test: (c) => c.s.red && face(c) },
  { label: 'Not a face card', test: (c) => !face(c) },
  { label: 'A black ace or a red king', test: (c) => (c.r === 'A' && !c.s.red) || (c.r === 'K' && c.s.red) },
]

export default function CardDeck() {
  const [e, setE] = useState(0)
  const [drawn, setDrawn] = useState({ n: 0, hits: 0, last: null as Card | null })
  const ev = EVENTS[e]
  const fav = DECK.filter(ev.test).length
  const g = gcd(fav, 52)
  const draw = (k: number) => {
    let hits = 0
    let last: Card | null = null
    for (let i = 0; i < k; i++) { last = DECK[Math.floor(Math.random() * 52)]; if (ev.test(last)) hits++ }
    setDrawn((d) => ({ n: d.n + k, hits: d.hits + hits, last }))
  }
  return (
    <LabFrame labId="card-deck" title="Deck of Cards" subtitle="With equally likely outcomes, P(event) = favourable outcomes ÷ total outcomes." howTo={<p>Pick an event. The favourable cards light up. Then draw cards at random (with replacement) and compare the experiment with the theory.</p>}>
      <div className="mb-3 flex flex-wrap gap-1">{EVENTS.map((x, i) => <button key={x.label} type="button" aria-pressed={e === i} onClick={() => { setE(i); setDrawn({ n: 0, hits: 0, last: null }) }} className={`rounded-lg border-2 px-2 py-1 text-xs ${e === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted'}`}>{x.label}</button>)}</div>
      <div className="grid gap-0.5 sm:gap-1" style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}>
        {DECK.map((c) => (
          <div key={c.r + c.s.s} className={`flex aspect-[3/4] flex-col items-center justify-center rounded border text-[9px] leading-none sm:text-xs ${ev.test(c) ? 'border-chem bg-chem-soft font-bold' : 'opacity-40'} ${c.s.red ? 'text-red-600' : ''}`}>
            <span>{c.r}</span><span>{c.s.s}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Favourable outcomes" value={`${fav} of 52`} />
        <Readout label="P(event)" value={`${fav}/52 = ${fav / g}/${52 / g} ≈ ${(fav / 52).toFixed(3)}`} />
        <Readout label="P(not the event)" value={`${(52 - fav) / g}/${52 / g}`} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {[1, 10, 100, 1000].map((k) => <button key={k} type="button" onClick={() => draw(k)} className="rounded-lg border-2 px-3 py-1 text-sm hover:bg-muted">Draw {k}</button>)}
        {drawn.last && <span className={`rounded border px-2 py-1 font-bold ${drawn.last.s.red ? 'text-red-600' : ''}`}>{drawn.last.r}{drawn.last.s.s}</span>}
        <span className="text-sm">Draws: {drawn.n} · hits: {drawn.hits} · experimental P ≈ <b>{drawn.n ? (drawn.hits / drawn.n).toFixed(3) : '–'}</b></span>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">A deck has 52 cards: 4 suits of 13, 26 red and 26 black, 12 face cards and 4 aces. For any event E, <b>0 ≤ P(E) ≤ 1</b> and <b>P(E) + P(not E) = 1</b>. The more you draw, the closer the experimental probability gets to the theoretical one.</p>
    </LabFrame>
  )
}
