import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'

type Tab = 'magnets' | 'static' | 'gravity'

function Magnet({ flip, x }: { flip: boolean; x: number }) {
  const [l, r] = flip ? ['S', 'N'] : ['N', 'S']
  return (
    <g transform={`translate(${x} 50)`}>
      <rect x={0} y={0} width={45} height={30} fill={l === 'N' ? '#dc2626' : '#2563eb'} />
      <rect x={45} y={0} width={45} height={30} fill={r === 'N' ? '#dc2626' : '#2563eb'} />
      <text x={22} y={20} textAnchor="middle" fontSize={14} fill="#fff" fontWeight={700}>{l}</text>
      <text x={67} y={20} textAnchor="middle" fontSize={14} fill="#fff" fontWeight={700}>{r}</text>
    </g>
  )
}

export default function InvisibleForces() {
  const [tab, setTab] = useState<Tab>('magnets')
  // magnets
  const [flip, setFlip] = useState(false)
  const [gap, setGap] = useState(60)
  // static
  const [rubs, setRubs] = useState(0)
  const [near, setNear] = useState(false)
  // gravity
  const [dropped, setDropped] = useState(false)

  const facing = flip ? 'S–S' : 'S–N' // right end of left magnet vs left end of right magnet
  const attract = !flip
  const strength = Math.round(100 * Math.min(1, (30 / Math.max(10, gap)) ** 2) * 4) / 4
  const charge = Math.min(10, rubs)
  const jumps = near && charge >= 3

  return (
    <LabFrame labId="invisible-forces" title="Invisible Forces" subtitle="Forces that act without touching: magnetic, electrostatic and gravitational" howTo={<p>Explore each tab. In every case, notice that the objects affect each other <b>without touching</b>.</p>}>
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['magnets', '🧲 Magnetic'], ['static', '🎈 Electrostatic'], ['gravity', '🍎 Gravitational']] as [Tab, string][]).map(([t, l]) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('rounded-md px-3 py-1', tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{l}</button>
        ))}
      </div>

      {tab === 'magnets' && (
        <div className="grid gap-4 md:grid-cols-[1fr_260px]">
          <svg viewBox="0 0 400 130" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Two magnets, ${facing} facing, ${attract ? 'attracting' : 'repelling'}`}>
            <Magnet flip={false} x={100 - gap / 2} />
            <motion.g animate={{ x: attract ? -Math.min(8, 600 / gap) : Math.min(8, 600 / gap) }} transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.4 }}>
              <Magnet flip={flip} x={190 + gap / 2} />
            </motion.g>
            <text x={200} y={115} textAnchor="middle" fontSize={12} className="fill-foreground">{attract ? '→ ← attract' : '← → repel'}</text>
          </svg>
          <div className="space-y-3">
            <Button className="w-full" variant="outline" onClick={() => setFlip((f) => !f)}>🔄 Flip the right-hand magnet</Button>
            <label className="block text-sm">Gap between magnets: <b>{gap} mm</b>
              <Slider value={[gap]} min={10} max={120} step={5} onValueChange={([v]) => setGap(v)} className="mt-1.5" aria-label="Gap between magnets" />
            </label>
            <Readout label="Force strength" value={`${Math.round(strength)}%`} />
            <p className="rounded-lg bg-chem-soft p-3 text-sm">{attract ? 'Unlike poles (S facing N) ATTRACT.' : 'Like poles (S facing S) REPEL.'} The force gets much weaker as the gap increases.</p>
          </div>
        </div>
      )}

      {tab === 'static' && (
        <div className="grid gap-4 md:grid-cols-[1fr_260px]">
          <svg viewBox="0 0 400 180" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Balloon with charge ${charge}; paper bits ${jumps ? 'jump up' : 'stay down'}`}>
            <motion.g animate={{ x: near ? 0 : 120, y: near ? 20 : 0 }}>
              <ellipse cx={190} cy={50} rx={32} ry={40} fill="#f43f5e" />
              <path d="M190 90 L185 100 L195 100 Z" fill="#be123c" />
              {Array.from({ length: charge }, (_, i) => <text key={i} x={172 + (i % 4) * 10} y={40 + Math.floor(i / 4) * 12} fontSize={10} fill="#fff">−</text>)}
            </motion.g>
            {Array.from({ length: 10 }, (_, i) => (
              <motion.rect key={i} width={8} height={5} fill="#e5e7eb" stroke="#9ca3af" initial={false} animate={{ x: 150 + (i * 9) % 80, y: jumps ? 120 - (i % 4) * 8 - 30 : 165, rotate: jumps ? i * 30 : 0 }} transition={{ type: 'spring', stiffness: 120 }} />
            ))}
            <rect x={0} y={170} width={400} height={10} fill="#d6d3d1" />
          </svg>
          <div className="space-y-3">
            <Button className="w-full" onClick={() => { setRubs((r) => r + 1); sfx.click() }}>💇 Rub the balloon on your hair ({rubs})</Button>
            <Button className="w-full" variant="outline" onClick={() => setNear((n) => !n)}>{near ? 'Move balloon away' : 'Bring balloon near paper bits'}</Button>
            <Button className="w-full" variant="ghost" onClick={() => { setRubs(0); setNear(false) }}>Discharge (touch the balloon to a tap)</Button>
            <p className="rounded-lg bg-chem-soft p-3 text-sm" role="status">
              {jumps ? '✨ The paper bits jump up to the balloon! Rubbing gave the balloon an electric charge, which pulls on the paper without touching it.' : charge < 3 ? 'Rub a few times to build up charge.' : 'Now bring it close to the paper bits.'}
            </p>
          </div>
        </div>
      )}

      {tab === 'gravity' && (
        <div className="grid gap-4 md:grid-cols-[1fr_260px]">
          <svg viewBox="0 0 400 200" className="w-full rounded-2xl border bg-background" role="img" aria-label="A mango falling from a tree">
            <rect x={60} y={80} width={16} height={110} fill="#92400e" />
            <circle cx={68} cy={70} r={50} fill="#16a34a" />
            <motion.text x={100} fontSize={22} initial={false} animate={{ y: dropped ? 188 : 90 }} transition={{ type: 'tween', ease: 'easeIn', duration: dropped ? 0.6 : 0 }}>🥭</motion.text>
            <rect x={0} y={190} width={400} height={10} fill="#a3e635" />
            <text x={300} y={30} textAnchor="middle" fontSize={40}>🌍</text>
            <text x={300} y={60} textAnchor="middle" fontSize={11} className="fill-muted-foreground">Earth pulls down</text>
          </svg>
          <div className="space-y-3">
            <Button className="w-full" onClick={() => setDropped((d) => !d)}>{dropped ? 'Put the mango back' : '🥭 Let the mango fall'}</Button>
            <p className="rounded-lg bg-chem-soft p-3 text-sm">Nothing touched the mango, yet it fell. The Earth pulls everything towards its centre by <b>gravitational force</b>. It acts on every object, even you, all the time!</p>
          </div>
        </div>
      )}
    </LabFrame>
  )
}
