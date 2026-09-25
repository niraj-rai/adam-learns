import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

type Family = 'alkali' | 'halogens' | 'noble'

const ALKALI = [
  { sym: 'Li', name: 'Lithium', speed: 0.5, text: 'Floats and fizzes steadily.', flame: false },
  { sym: 'Na', name: 'Sodium', speed: 1, text: 'Melts into a ball and whizzes around, fizzing fast.', flame: false },
  { sym: 'K', name: 'Potassium', speed: 1.8, text: 'Whizzes around and bursts into a lilac flame!', flame: true },
]
const HALOGENS = [
  { sym: 'F', name: 'Fluorine', colour: '#fef08a', state: 'pale yellow gas', react: 5 },
  { sym: 'Cl', name: 'Chlorine', colour: '#bef264', state: 'green-yellow gas', react: 4 },
  { sym: 'Br', name: 'Bromine', colour: '#b45309', state: 'red-brown liquid', react: 3 },
  { sym: 'I', name: 'Iodine', colour: '#4c1d95', state: 'purple-black solid (purple vapour)', react: 2 },
]
const NOBLE = [
  { sym: 'He', name: 'Helium', glow: '#fda4af', use: 'Balloons and airships (lighter than air, won’t burn)' },
  { sym: 'Ne', name: 'Neon', glow: '#fb923c', use: 'Bright red-orange advertising signs' },
  { sym: 'Ar', name: 'Argon', glow: '#c4b5fd', use: 'Inside light bulbs and for welding' },
  { sym: 'Kr', name: 'Krypton', glow: '#e5e7eb', use: 'Some camera flashes and bright lamps' },
  { sym: 'Xe', name: 'Xenon', glow: '#93c5fd', use: 'Very bright car headlights; ion engines on spacecraft' },
]

export default function ElementFamilies() {
  const [fam, setFam] = useState<Family>('alkali')
  const [drop, setDrop] = useState<string | null>(null)
  const [lit, setLit] = useState<string | null>(null)

  return (
    <LabFrame
      labId="element-families"
      title="Element Families"
      subtitle="Elements in the same group behave alike, with a pattern going down the group"
      howTo={<p>Explore three famous groups. Look for what the elements in each group have in COMMON, and what CHANGES as you go down the group.</p>}
    >
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['alkali', 'Group 1: Alkali metals'], ['halogens', 'Group 17: Halogens'], ['noble', 'Group 18: Noble gases']] as [Family, string][]).map(([f, l]) => (
          <button key={f} type="button" role="tab" aria-selected={fam === f} onClick={() => setFam(f)} className={cn('rounded-md px-3 py-1', fam === f ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
            {l}
          </button>
        ))}
      </div>

      {fam === 'alkali' && (
        <div className="space-y-3">
          <p className="text-sm">All have <b>1 electron</b> in their outer shell, which they lose easily. Drop a small piece of each into water (behind a safety screen!).</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {ALKALI.map((a) => (
              <div key={a.sym} className="rounded-2xl border bg-background p-3 text-center">
                <svg viewBox="0 0 120 90" className="mx-auto w-full max-w-[160px]" aria-hidden>
                  <rect x={10} y={40} width={100} height={45} rx={4} fill="#bae6fd" opacity={0.6} />
                  {drop === a.sym && (
                    <>
                      <motion.circle r={6} fill="#cbd5e1" stroke="#64748b" animate={{ cx: [30, 90, 40, 80, 30], cy: 40 }} transition={{ repeat: Infinity, duration: 2 / a.speed }} />
                      {Array.from({ length: Math.round(6 * a.speed) }, (_, i) => (
                        <motion.circle key={i} r={2} fill="#fff" stroke="#94a3b8" animate={{ cx: 30 + ((i * 17) % 60), cy: [60, 40], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 / a.speed, delay: i * 0.1 }} />
                      ))}
                      {a.flame && <motion.text x={60} y={36} fontSize={22} textAnchor="middle" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.5 }}>🔥</motion.text>}
                    </>
                  )}
                </svg>
                <p className="font-heading font-semibold">{a.name} ({a.sym})</p>
                <Button size="sm" variant="outline" className="mt-1" onClick={() => setDrop(a.sym)}>Drop in water</Button>
                {drop === a.sym && <p className="mt-2 text-xs" role="status">{a.text}</p>}
              </div>
            ))}
          </div>
          <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">⬇️ <b>Pattern:</b> reactivity <b>increases</b> down group 1. The outer electron is further from the nucleus, so it is lost more easily. All make an alkaline solution (metal hydroxide) and hydrogen gas.</p>
        </div>
      )}

      {fam === 'halogens' && (
        <div className="space-y-3">
          <p className="text-sm">All have <b>7 electrons</b> in their outer shell and need just 1 more. That makes them very reactive non-metals. Their name means "salt-formers".</p>
          <div className="grid gap-3 sm:grid-cols-4">
            {HALOGENS.map((h) => (
              <div key={h.sym} className="rounded-2xl border bg-background p-3 text-center">
                <div className="mx-auto h-16 w-10 rounded-b-full border-2 border-slate-300" style={{ background: `linear-gradient(to top, ${h.colour}, ${h.colour}55)` }} aria-hidden />
                <p className="mt-2 font-heading font-semibold">{h.name} ({h.sym})</p>
                <p className="text-xs text-muted-foreground">{h.state}</p>
                <p className="mt-1 text-xs">Reactivity: {'🟥'.repeat(h.react)}</p>
              </div>
            ))}
          </div>
          <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">⬇️ <b>Pattern:</b> going down group 17, halogens get <b>darker</b>, change from <b>gas → liquid → solid</b>, and become <b>less reactive</b>, the opposite of group 1!</p>
        </div>
      )}

      {fam === 'noble' && (
        <div className="space-y-3">
          <p className="text-sm">Their outer shell is already <b>full</b>, so they hardly react at all. Pass electricity through them and they glow with their own colours. Tap a tube to light it.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {NOBLE.map((g) => (
              <button key={g.sym} type="button" onClick={() => setLit(g.sym)} className="rounded-2xl border bg-slate-900 p-3 text-center text-white">
                <motion.div className="mx-auto h-20 w-4 rounded-full" animate={{ background: lit === g.sym ? g.glow : '#334155', boxShadow: lit === g.sym ? `0 0 18px 6px ${g.glow}` : '0 0 0 0 transparent' }} />
                <p className="mt-2 font-heading font-semibold">{g.sym}</p>
                <p className="text-[11px] opacity-80">{g.name}</p>
              </button>
            ))}
          </div>
          {lit && <p className="text-sm" role="status">💡 {NOBLE.find((g) => g.sym === lit)!.name}: {NOBLE.find((g) => g.sym === lit)!.use}</p>}
          <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">🛡️ <b>Pattern:</b> all are colourless gases that are <b>unreactive</b> ("inert") because their outer shells are full. That's why they're used where we need something that won't react.</p>
        </div>
      )}
    </LabFrame>
  )
}
