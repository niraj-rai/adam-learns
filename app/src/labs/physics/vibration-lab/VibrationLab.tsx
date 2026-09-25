import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { playNote } from '../../_kit/audio'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { rulerFrequency, SOURCES } from './model'

export default function VibrationLab() {
  const [tab, setTab] = useState<'ruler' | 'sources'>('ruler')
  return (
    <LabFrame labId="vibration-lab" title="Vibration Lab" subtitle="Every sound starts with something vibrating: moving quickly to and fro." howTo={<p>Tab 1: twang a ruler on the edge of a desk. Change how far it sticks out and compare the sound. (The wobble is slowed down so you can see it.) Tab 2: find what vibrates in each instrument.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['ruler', '📏 Twang the ruler'], ['sources', '🪘 What vibrates?']] as const).map(([t, lbl]) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('rounded-md px-3 py-1', tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'ruler' ? <Ruler /> : <Sources />}
    </LabFrame>
  )
}

function Ruler() {
  const [len, setLen] = useState(20)
  const [twang, setTwang] = useState(0)
  const f = rulerFrequency(len)
  const L = len * 9
  const go = () => {
    setTwang((t) => t + 1)
    playNote(f, { duration: 1.4, volume: 0.25, overtone: 0.1 })
  }
  // slow-motion wobble: visible frequency scales with the real one
  const visHz = f / 20
  const swings = Array.from({ length: 12 }, (_, i) => (i % 2 ? -1 : 1) * 30 * Math.exp(-i / 5))
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 400 180" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Ruler overhanging the desk by ${len} cm`}>
        <rect x={0} y={90} width={180} height={90} fill="#a16207" opacity={0.7} />
        <rect x={120} y={78} width={40} height={12} fill="#475569" />
        <motion.g key={twang} style={{ originX: '180px', originY: '88px' }} animate={twang ? { rotate: [0, ...swings.map((s) => s / 3), 0] } : { rotate: 0 }} transition={{ duration: 12 / visHz, ease: 'easeInOut' }}>
          <rect x={60} y={86} width={120 + L} height={5} rx={1} fill="#94a3b8" />
        </motion.g>
      </svg>
      <label className="block text-sm">Overhang: <b>{len} cm</b>
        <Slider value={[len]} min={8} max={24} step={1} onValueChange={([v]) => setLen(v)} className="mt-1.5" aria-label="Ruler overhang" />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={go}>🎵 Twang it!</Button>
        <Readout label="Vibrations per second" value={`${f.toFixed(0)} Hz`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">A <b>shorter</b> overhang vibrates <b>faster</b>, giving a <b>higher</b> pitch. The number of vibrations per second is the <b>frequency</b>, measured in hertz (Hz). A bigger push makes bigger swings (larger amplitude) and a louder sound.</p>
    </div>
  )
}

function Sources() {
  const [picked, setPicked] = useState<string[]>([])
  return (
    <div className="space-y-3">
      <p className="text-sm">Tap each sound source to reveal what is vibrating.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {SOURCES.map((s) => {
          const open = picked.includes(s.id)
          return (
            <button key={s.id} type="button" onClick={() => setPicked((p) => (open ? p : [...p, s.id]))} className={cn('rounded-xl border p-3 text-left text-sm', open ? 'border-chem bg-chem-soft' : 'hover:bg-muted')}>
              <motion.span className="inline-block text-3xl" animate={open ? { x: [0, -2, 2, -2, 2, 0] } : {}} transition={{ repeat: open ? Infinity : 0, duration: 0.25 }}>{s.emoji}</motion.span>
              <b className="ml-2">{s.name}</b>
              <span className="mt-1 block text-muted-foreground">{open ? `Vibrates: ${s.vibrates}.` : 'Tap to reveal'}</span>
            </button>
          )
        })}
      </div>
      {picked.length === SOURCES.length && <p role="status" className="rounded-xl bg-success-soft px-4 py-2 text-sm">✅ Every sound comes from a vibration. Put your fingers gently on your throat and hum: you can feel your vocal cords vibrating!</p>}
    </div>
  )
}
