import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { playNote } from '../../_kit/audio'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { echoDistance, MEDIA, minEchoDistance, travelTime } from './model'

export default function SoundTravel() {
  const [tab, setTab] = useState<'wave' | 'jar' | 'echo'>('wave')
  return (
    <LabFrame labId="sound-travel" title="How Sound Travels" subtitle="Sound needs a medium: particles to pass the vibration along." howTo={<p>Tab 1: watch particles pass a sound wave along, and race sound through air, water and steel. Tab 2: pump the air out of a bell jar. Tab 3: shout at a cliff and time the echo.</p>}>
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['wave', '〰️ Particles and speed'], ['jar', '🔔 Bell jar'], ['echo', '🏔️ Echoes']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'wave' && <Wave />}
      {tab === 'jar' && <BellJar />}
      {tab === 'echo' && <Echo />}
    </LabFrame>
  )
}

function Wave() {
  const [race, setRace] = useState(0)
  const cols = 24
  const rows = 6
  const dist = 1000 // metres
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 400 120" className="w-full rounded-2xl border bg-background" role="img" aria-label="Particles of air squeezing together and spreading apart as a sound wave passes">
        <text x={4} y={66} fontSize={22}>🔊</text>
        {Array.from({ length: cols * rows }, (_, i) => {
          const cx = 40 + (i % cols) * 15
          const cy = 18 + Math.floor(i / cols) * 17
          return <motion.circle key={i} cx={cx} cy={cy} r={3} fill="#3b82f6" animate={{ x: [0, 5, 0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut', delay: (i % cols) * 0.1 }} />
        })}
      </svg>
      <p className="text-sm text-muted-foreground">Each particle only jiggles back and forth around its place. It's the <b>vibration</b> that travels, as regions where particles are squeezed together (compressions) and spread apart (rarefactions).</p>
      <div className="rounded-2xl border p-3">
        <p className="mb-2 text-sm font-semibold">🏁 Race a sound over 1 km</p>
        {MEDIA.filter((m) => m.speed > 0).map((m) => (
          <div key={m.id} className="mb-1.5 flex items-center gap-2 text-sm">
            <span className="w-20">{m.emoji} {m.name}</span>
            <div className="relative h-3 flex-1 rounded-full bg-muted">
              <motion.div key={race} className="absolute top-0 left-0 h-3 rounded-full bg-chem" initial={{ width: '0%' }} animate={{ width: race ? '100%' : '0%' }} transition={{ duration: race ? travelTime(dist, m.speed) * 2 : 0, ease: 'linear' }} />
            </div>
            <span className="w-24 text-right tabular-nums">{travelTime(dist, m.speed).toFixed(2)} s</span>
          </div>
        ))}
        <Button size="sm" className="mt-2" onClick={() => setRace((r) => r + 1)}>▶ Start the race (slowed down 2×)</Button>
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Sound travels fastest in <b>solids</b>, slower in <b>liquids</b> and slowest in <b>gases</b>, because the particles are closer together and more tightly linked. Put your ear to a railway track and you hear a distant train long before the sound arrives through the air (but never do this on a real track!).</p>
    </div>
  )
}

function BellJar() {
  const [air, setAir] = useState(100)
  const [ringing, setRinging] = useState(false)
  const timer = useRef<number | null>(null)
  useEffect(() => {
    if (!ringing) return
    const tick = () => playNote(880, { duration: 0.35, volume: 0.2 * (air / 100) + 0.0002, overtone: 0.4 })
    tick()
    timer.current = window.setInterval(tick, 400)
    return () => { if (timer.current) window.clearInterval(timer.current) }
  }, [ringing, air])
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <svg viewBox="0 0 240 200" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Electric bell in a jar with ${air}% of the air left`}>
        <path d="M50 180 V70 Q50 20 120 20 Q190 20 190 70 V180" fill="#bae6fd" fillOpacity={air / 250} stroke="#64748b" strokeWidth={2} />
        <rect x={30} y={180} width={180} height={10} fill="#475569" />
        {Array.from({ length: Math.round(air / 6) }, (_, i) => <circle key={i} cx={65 + ((i * 37) % 110)} cy={40 + ((i * 53) % 130)} r={2} fill="#3b82f6" opacity={0.6} />)}
        <motion.text x={120} y={120} textAnchor="middle" fontSize={36} animate={ringing ? { rotate: [-10, 10, -10] } : { rotate: 0 }} transition={{ repeat: Infinity, duration: 0.15 }}>🔔</motion.text>
        <line x1={210} y1={185} x2={235} y2={185} stroke="#475569" strokeWidth={4} />
        <text x={228} y={175} fontSize={9} textAnchor="end" className="fill-muted-foreground">to pump</text>
      </svg>
      <div className="space-y-3">
        <Button className="w-full" variant={ringing ? 'default' : 'outline'} onClick={() => setRinging((r) => !r)}>{ringing ? '🔕 Switch off the bell' : '🔔 Switch on the bell'}</Button>
        <label className="block text-sm">Air left in the jar: <b>{air}%</b>
          <Slider value={[air]} min={0} max={100} step={10} onValueChange={([v]) => setAir(v)} className="mt-1.5" aria-label="Air left in the jar" />
        </label>
        <Readout label="Loudness heard" value={air === 0 ? 'silence' : air < 30 ? 'very faint' : air < 70 ? 'quieter' : 'loud'} />
        <p role="status" className="rounded-lg bg-chem-soft p-3 text-sm">{air === 0 ? 'You can still SEE the bell vibrating, but you hear nothing: sound cannot travel through a vacuum. That’s why space is silent!' : 'Pump out the air and listen. What happens to the sound?'}</p>
      </div>
    </div>
  )
}

function Echo() {
  const [d, setD] = useState(170)
  const [shout, setShout] = useState(0)
  const t = (2 * d) / 343
  const heard = t >= 0.1
  const doShout = () => {
    setShout((s) => s + 1)
    playNote(300, { duration: 0.3, volume: 0.25, overtone: 0.5 })
    if (heard) window.setTimeout(() => playNote(300, { duration: 0.3, volume: 0.08, overtone: 0.5 }), Math.min(t, 3) * 1000)
  }
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 400 140" className="w-full rounded-2xl border bg-sky-50 dark:bg-slate-900" role="img" aria-label={`Person ${d} m from a cliff`}>
        <text x={10} y={110} fontSize={30}>🧍</text>
        <polygon points="370,20 400,20 400,130 350,130" fill="#78716c" />
        <motion.circle key={`o${shout}`} cx={40} cy={90} r={4} fill="#f97316" initial={{ cx: 40, opacity: shout ? 1 : 0 }} animate={{ cx: [40, 350, 40], opacity: shout ? [1, 1, 0.4] : 0 }} transition={{ duration: Math.min(t, 3) * 1.2, ease: 'linear' }} />
        <text x={200} y={130} fontSize={11} textAnchor="middle" className="fill-foreground">{d} m to the cliff</text>
      </svg>
      <label className="block text-sm">Distance to the cliff: <b>{d} m</b>
        <Slider value={[d]} min={5} max={500} step={5} onValueChange={([v]) => setD(v)} className="mt-1.5" aria-label="Distance to the cliff" />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={doShout}>📣 Shout!</Button>
        <Readout label="Echo returns after" value={`${t.toFixed(2)} s`} />
        <Readout label="Distance = speed × time ÷ 2" value={`343 × ${t.toFixed(2)} ÷ 2 = ${echoDistance(t).toFixed(0)} m`} />
      </div>
      <p role="status" className={cn('rounded-xl px-4 py-2 text-sm', heard ? 'bg-chem-soft' : 'bg-warn-soft')}>
        {heard ? 'An echo is a reflected sound. The sound travels to the cliff and back, so we divide by 2.' : `Too close! The echo returns in under 0.1 s and blends with your shout. You must be at least about ${minEchoDistance().toFixed(0)} m away to hear a separate echo.`}
      </p>
    </div>
  )
}
