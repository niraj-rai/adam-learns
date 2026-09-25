import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { deviation, SPECTRUM, throughFilter } from './model'

export default function PrismLab() {
  const [tab, setTab] = useState<'prism' | 'disc'>('prism')
  return (
    <LabFrame labId="prism-lab" title="Prism and Colour Lab" subtitle="White light is a mixture of colours. A prism spreads them out; a spinning disc mixes them back." howTo={<p>Tab 1: shine white light through a prism, add a second upside-down prism, or put a coloured filter in the beam. Tab 2: spin Newton's colour disc.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['prism', '🔺 Prism'], ['disc', '🎡 Newton’s disc']] as const).map(([t, lbl]) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('rounded-md px-3 py-1', tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'prism' ? <Prism /> : <Disc />}
    </LabFrame>
  )
}

function Prism() {
  const [second, setSecond] = useState(false)
  const [filter, setFilter] = useState<'none' | 'red' | 'green' | 'blue'>('none')
  const pass = throughFilter(filter)
  const hitX = 170
  const hitY = 120
  // exaggerate the tiny differences in angle so they can be seen
  const spread = (n: number) => (deviation(n, 60) - deviation(1.513, 60)) * 14 + 22

  return (
    <div className="space-y-3">
      <svg viewBox="0 0 440 220" className="w-full rounded-2xl border bg-slate-950" role="img" aria-label={second ? 'Two prisms recombine the colours into white light' : `White light split into ${pass.length} colours`}>
        <line x1={10} y1={140} x2={hitX - 25} y2={hitY} stroke="#fff" strokeWidth={4} />
        <polygon points="150,170 200,70 250,170" fill="#93c5fd" fillOpacity={0.18} stroke="#93c5fd" />
        {!second ? (
          SPECTRUM.map((c) => {
            const a = (spread(c.n) * Math.PI) / 180
            const ex = 228 + 200 * Math.cos(a)
            const ey = hitY + 200 * Math.sin(a)
            const on = pass.includes(c.name)
            return (
              <g key={c.name} opacity={on ? 1 : 0.06}>
                <line x1={hitX - 25} y1={hitY} x2={228} y2={hitY + 4} stroke="#fff" strokeWidth={3} opacity={0.35} />
                <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} x1={228} y1={hitY + 4} x2={ex} y2={ey} stroke={c.colour} strokeWidth={4} />
              </g>
            )
          })
        ) : (
          <>
            {SPECTRUM.map((c, i) => <line key={c.name} x1={228} y1={hitY + 4} x2={300} y2={hitY + 22 + i * 4} stroke={c.colour} strokeWidth={3} />)}
            <polygon points="280,80 380,80 330,180" fill="#93c5fd" fillOpacity={0.18} stroke="#93c5fd" />
            <line x1={345} y1={130} x2={430} y2={112} stroke="#fff" strokeWidth={4} />
          </>
        )}
        {filter !== 'none' && !second && <rect x={40} y={118} width={10} height={40} fill={filter === 'red' ? '#ef4444' : filter === 'green' ? '#22c55e' : '#3b82f6'} opacity={0.7} />}
        <text x={14} y={128} fontSize={10} fill="#e2e8f0">white light</text>
      </svg>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={second ? 'default' : 'outline'} onClick={() => setSecond((s) => !s)}>{second ? 'Remove the second prism' : 'Add an upside-down prism'}</Button>
        {(['none', 'red', 'green', 'blue'] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} disabled={second} onClick={() => setFilter(f)}>{f === 'none' ? 'No filter' : `${f[0].toUpperCase()}${f.slice(1)} filter`}</Button>
        ))}
      </div>
      <p role="status" className="rounded-xl bg-chem-soft px-4 py-2 text-sm">
        {second
          ? 'The second prism bends the colours back together, so white light comes out again. This proves the prism doesn’t add colours: they were in white light all along. (Isaac Newton did this experiment in the 1660s.)'
          : filter !== 'none'
            ? `A ${filter} filter lets only some colours through and absorbs the rest, so the spectrum shows just ${pass.join(', ').toLowerCase()}.`
            : 'The prism splits white light into seven colours: VIBGYOR. Violet bends the most, red the least. This splitting is called dispersion. Raindrops do the same to make a rainbow.'}
      </p>
    </div>
  )
}

function Disc() {
  const [spin, setSpin] = useState(false)
  const seg = 360 / SPECTRUM.length
  const bg = `conic-gradient(${SPECTRUM.map((c, i) => `${c.colour} ${i * seg}deg ${(i + 1) * seg}deg`).join(', ')})`
  return (
    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      <div className="grid place-items-center rounded-2xl border bg-background p-4">
        <motion.div animate={{ rotate: spin ? 360 * 50 : 0 }} transition={spin ? { duration: 25, ease: 'linear', repeat: Infinity } : { duration: 0.6 }} className="size-48 rounded-full shadow-inner" style={{ background: bg, filter: spin ? 'blur(10px) saturate(0.15) brightness(1.4)' : 'none', transition: 'filter 0.8s' }} role="img" aria-label={spin ? 'Spinning disc looks whitish' : 'Disc with seven colour segments'} />
      </div>
      <div className="space-y-3">
        <Button onClick={() => setSpin((s) => !s)}>{spin ? '⏹ Stop' : '🌀 Spin the disc'}</Button>
        <p role="status" className="rounded-xl bg-chem-soft px-4 py-2 text-sm">{spin ? 'Spinning fast, the colours blend in your eye and the disc looks almost white! Your eye holds each image for a fraction of a second (persistence of vision), so the colours mix.' : 'Newton’s colour disc has the seven colours of the spectrum. What colour do you think it will look like when it spins fast?'}</p>
        <p className="text-sm text-muted-foreground">🧪 Try at home: colour a cardboard disc in seven sectors, push a pencil through the centre and spin it like a top.</p>
      </div>
    </div>
  )
}
