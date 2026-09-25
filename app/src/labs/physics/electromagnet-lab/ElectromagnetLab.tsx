import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { clipsHeld, compassDeflection, CORES } from './model'

export default function ElectromagnetLab() {
  const [tab, setTab] = useState<'oersted' | 'build'>('oersted')
  return (
    <LabFrame labId="electromagnet-lab" title="Electromagnet Lab" subtitle="Electric current makes a magnetic field. Coil a wire round an iron nail and you have a magnet you can switch on and off!" howTo={<p>Tab 1: repeat Ørsted's 1820 discovery: pass a current through a wire over a compass. Tab 2: build an electromagnet and see how many paper clips it can lift.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['oersted', '🧭 Wire and compass'], ['build', '🧲 Build an electromagnet']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'oersted' ? <Oersted /> : <Build />}
    </LabFrame>
  )
}

function Oersted() {
  const [on, setOn] = useState(false)
  const [cells, setCells] = useState(2)
  const [rev, setRev] = useState(false)
  const d = on ? compassDeflection(cells, rev) : 0
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 400 170" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Compass under a wire; needle turned ${Math.abs(d)} degrees`}>
        <line x1={20} y1={50} x2={380} y2={50} stroke={on ? '#f59e0b' : '#94a3b8'} strokeWidth={4} />
        {on && <text x={200} y={36} fontSize={11} textAnchor="middle" className="fill-foreground">current {rev ? '← flowing left' : 'flowing right →'}</text>}
        <circle cx={200} cy={110} r={45} fill="var(--card)" stroke="currentColor" strokeOpacity={0.4} />
        <text x={200} y={75} fontSize={10} textAnchor="middle" className="fill-muted-foreground">N</text>
        <motion.g animate={{ rotate: d }} style={{ originX: '200px', originY: '110px' }} transition={{ type: 'spring', stiffness: 60, damping: 8 }}>
          <polygon points="200,72 205,110 195,110" fill="#ef4444" />
          <polygon points="200,148 205,110 195,110" fill="#94a3b8" />
        </motion.g>
      </svg>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setOn((o) => !o)}>{on ? '⏹ Switch off' : '⚡ Switch on the current'}</Button>
        <Button variant="outline" onClick={() => setRev((r) => !r)}>🔄 Reverse the cells</Button>
        <Readout label="Needle turned" value={`${Math.abs(d)}° ${d > 0 ? 'clockwise' : d < 0 ? 'anticlockwise' : ''}`} />
      </div>
      <label className="block text-sm">Cells: <b>{cells}</b>
        <Slider value={[cells]} min={1} max={3} step={1} onValueChange={([v]) => setCells(v)} className="mt-1.5" aria-label="Number of cells" />
      </label>
      <p role="status" className="rounded-xl bg-chem-soft px-4 py-2 text-sm">{on ? 'The needle moves! A wire carrying current has a magnetic field around it. Reverse the current and the needle swings the other way. More current gives a bigger deflection.' : 'In 1820, Hans Christian Ørsted noticed a compass needle move when he switched on a current nearby. This linked electricity and magnetism for the first time. Try it!'}</p>
    </div>
  )
}

function Build() {
  const [turns, setTurns] = useState(40)
  const [cells, setCells] = useState(1)
  const [core, setCore] = useState('iron')
  const [on, setOn] = useState(false)
  const n = clipsHeld(turns, cells, core, on)
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <svg viewBox="0 0 300 220" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Electromagnet with ${turns} turns and ${cells} cells holding ${n} paper clips`}>
        <rect x={60} y={40} width={180} height={22} rx={4} fill={core === 'iron' ? '#64748b' : core === 'aluminium' ? '#cbd5e1' : 'transparent'} stroke={core === 'none' ? '#cbd5e1' : 'none'} strokeDasharray="3 3" />
        {Array.from({ length: Math.round(turns / 4) }, (_, i) => (
          <ellipse key={i} cx={66 + i * (168 / Math.max(1, Math.round(turns / 4) - 1))} cy={51} rx={3} ry={15} fill="none" stroke={on ? '#f59e0b' : '#b45309'} strokeWidth={1.8} />
        ))}
        {Array.from({ length: n }, (_, i) => (
          <motion.text key={`${i}-${on}`} x={75 + (i % 10) * 16} y={78 + Math.floor(i / 10) * 18} fontSize={14} initial={{ y: 200, opacity: 0 }} animate={{ y: 78 + Math.floor(i / 10) * 18, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: i * 0.02 }}>📎</motion.text>
        ))}
        <text x={150} y={212} fontSize={10} textAnchor="middle" className="fill-muted-foreground">a pile of paper clips below</text>
      </svg>
      <div className="space-y-3">
        <label className="block text-sm">Turns of wire: <b>{turns}</b>
          <Slider value={[turns]} min={10} max={100} step={10} onValueChange={([v]) => setTurns(v)} className="mt-1.5" aria-label="Turns of wire" />
        </label>
        <label className="block text-sm">Cells: <b>{cells}</b>
          <Slider value={[cells]} min={1} max={3} step={1} onValueChange={([v]) => setCells(v)} className="mt-1.5" aria-label="Number of cells" />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CORES.map((c) => <Button key={c.id} size="sm" variant={core === c.id ? 'default' : 'outline'} onClick={() => setCore(c.id)}>{c.name}</Button>)}
        </div>
        <Button className="w-full" onClick={() => setOn((o) => !o)}>{on ? '⏹ Switch off' : '⚡ Switch on'}</Button>
        <Readout label="Paper clips held" value={n} />
      </div>
      <p role="status" className="rounded-xl bg-chem-soft px-4 py-2 text-sm md:col-span-2">
        {!on ? 'Switch it on! Then switch it off and watch: an electromagnet is only a magnet while current flows.' : core !== 'iron' ? 'Without an iron core, the coil is only a very weak magnet. Iron concentrates the magnetic field.' : 'More turns and more current make a stronger electromagnet. Electromagnets are used in electric bells, scrapyard cranes, speakers, motors, MRI scanners and maglev trains.'}
      </p>
    </div>
  )
}
