import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

const SPHERES = [
  { id: 'atmosphere', name: 'Atmosphere', emoji: '🌬️', text: 'The layer of gases around Earth: air, clouds and weather.' },
  { id: 'hydrosphere', name: 'Hydrosphere', emoji: '🌊', text: 'All liquid water: oceans, rivers, lakes and groundwater.' },
  { id: 'cryosphere', name: 'Cryosphere', emoji: '🧊', text: 'Frozen water: glaciers, ice sheets, snow and permafrost.' },
  { id: 'geosphere', name: 'Geosphere', emoji: '🪨', text: 'Rocks, soil, mountains and Earth’s interior.' },
  { id: 'biosphere', name: 'Biosphere', emoji: '🌳', text: 'All living things, from microbes to forests and people.' },
] as const
type S = (typeof SPHERES)[number]['id']

const EVENTS: { name: string; emoji: string; links: [S, S, string][] }[] = [
  { name: 'Monsoon arrives in Kerala', emoji: '🌧️', links: [['hydrosphere', 'atmosphere', 'The Sun evaporates water from the Arabian Sea into moist winds.'], ['atmosphere', 'hydrosphere', 'Rain fills rivers and wells.'], ['hydrosphere', 'biosphere', 'Crops like rice are sown; forests turn green.'], ['hydrosphere', 'geosphere', 'Heavy rain can cause landslides in the Western Ghats.']] },
  { name: 'A volcano erupts', emoji: '🌋', links: [['geosphere', 'atmosphere', 'Ash and gases (CO₂, SO₂) are thrown into the air.'], ['atmosphere', 'geosphere', 'Ash high in the air reflects sunlight and can cool the planet for a year or two.'], ['geosphere', 'biosphere', 'Lava destroys habitats, but later forms fertile soil.']] },
  { name: 'Himalayan glaciers melt', emoji: '🏔️', links: [['atmosphere', 'cryosphere', 'Warmer air melts glacier ice.'], ['cryosphere', 'hydrosphere', 'Meltwater feeds the Ganga and Brahmaputra.'], ['hydrosphere', 'biosphere', 'Millions of people and farms depend on this water.'], ['cryosphere', 'atmosphere', 'Less white ice means less sunlight reflected: more warming.']] },
  { name: 'A forest is cut down', emoji: '🪓', links: [['biosphere', 'atmosphere', 'Fewer trees take in CO₂; burning adds more.'], ['biosphere', 'geosphere', 'Without roots, soil is washed away (erosion).'], ['biosphere', 'hydrosphere', 'Less water is returned to the air by transpiration, so rainfall can drop.']] },
  { name: 'Mangroves are planted', emoji: '🌱', links: [['biosphere', 'atmosphere', 'Mangroves store lots of carbon.'], ['biosphere', 'geosphere', 'Roots trap mud and protect the coast.'], ['biosphere', 'hydrosphere', 'They shelter fish nurseries and soften storm waves.']] },
]

export default function SpheresExplorer() {
  const [e, setE] = useState(0)
  const [step, setStep] = useState(0)
  const ev = EVENTS[e]
  const active = new Set(ev.links.slice(0, step + 1).flatMap(([a, b]) => [a, b]))
  const pos: Record<S, { x: number; y: number }> = { atmosphere: { x: 150, y: 32 }, hydrosphere: { x: 262, y: 105 }, cryosphere: { x: 215, y: 195 }, geosphere: { x: 85, y: 195 }, biosphere: { x: 38, y: 105 } }
  return (
    <LabFrame labId="spheres-explorer" title="Earth’s Five Spheres" subtitle="Earth is one system: air, water, ice, rock and life constantly swap energy and matter." howTo={<p>Pick an event, then step through what happens. Arrows light up as one sphere affects another.</p>}>
      <div className="mb-3 flex flex-wrap gap-1">{EVENTS.map((x, i) => <button key={x.name} type="button" aria-pressed={e === i} onClick={() => { setE(i); setStep(0) }} className={cn('rounded-lg border-2 px-2 py-1 text-sm', e === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.emoji} {x.name}</button>)}</div>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 300 250" className="w-full rounded-2xl border bg-background" role="img" aria-label={`${ev.name}: spheres involved`}>
          <defs><marker id="sph-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#dc2626" /></marker></defs>
          {ev.links.slice(0, step + 1).map(([a, b], i) => {
            const A = pos[a], B = pos[b]
            const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy)
            const off = i % 2 ? 6 : -6
            return <line key={i} x1={A.x + (dx / L) * 30 + (dy / L) * off} y1={A.y + (dy / L) * 30 - (dx / L) * off} x2={B.x - (dx / L) * 30 + (dy / L) * off} y2={B.y - (dy / L) * 30 - (dx / L) * off} stroke="#dc2626" strokeWidth={i === step ? 3 : 1.5} markerEnd="url(#sph-arrow)" />
          })}
          {SPHERES.map((s) => (
            <g key={s.id} opacity={active.has(s.id) ? 1 : 0.35}>
              <circle cx={pos[s.id].x} cy={pos[s.id].y} r={26} fill="#7c3aed22" stroke="#7c3aed" strokeWidth={active.has(s.id) ? 2.5 : 1} />
              <text x={pos[s.id].x} y={pos[s.id].y + 6} textAnchor="middle" fontSize={20}>{s.emoji}</text>
              <text x={pos[s.id].x} y={pos[s.id].y + 40} textAnchor="middle" fontSize={10} fill="currentColor">{s.name}</text>
            </g>
          ))}
        </svg>
        <div className="space-y-2">
          <ol className="space-y-1">{ev.links.slice(0, step + 1).map(([a, b, t], i) => <li key={i} className={cn('rounded-lg border px-3 py-2 text-sm', i === step && 'border-chem bg-chem-soft')}><b>{SPHERES.find((s) => s.id === a)!.name} → {SPHERES.find((s) => s.id === b)!.name}:</b> {t}</li>)}</ol>
          {step < ev.links.length - 1 ? <button type="button" onClick={() => setStep(step + 1)} className="rounded-lg border-2 px-3 py-1 text-sm hover:bg-muted">What happens next ➜</button> : <p className="text-sm text-muted-foreground">One event touched {active.size} of the 5 spheres. Try another event.</p>}
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-5">{SPHERES.map((s) => <div key={s.id} className="rounded-xl border p-2 text-xs"><p className="font-semibold">{s.emoji} {s.name}</p><p className="text-muted-foreground">{s.text}</p></div>)}</div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Scientists study Earth as a <b>system</b> because a change in one sphere ripples through the others. The Sun supplies the energy; matter such as water, carbon and nitrogen keeps cycling between the spheres.</p>
    </LabFrame>
  )
}
