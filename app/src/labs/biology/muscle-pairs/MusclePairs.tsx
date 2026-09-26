import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { bicepsContraction, boneScore } from './model'

const JOINTS = [
  { name: 'Hinge', emoji: '🚪', where: 'Elbow, knee, fingers', moves: 'Back and forth in one plane, like a door.' },
  { name: 'Ball and socket', emoji: '⚾', where: 'Shoulder, hip', moves: 'In all directions, and it can rotate.' },
  { name: 'Pivot', emoji: '🔄', where: 'Between the top two neck vertebrae', moves: 'Rotates, letting you turn your head.' },
  { name: 'Gliding', emoji: '🧊', where: 'Wrist and ankle bones, between vertebrae', moves: 'Small sliding movements.' },
  { name: 'Fixed', emoji: '🔒', where: 'Skull bones', moves: 'No movement: they protect the brain.' },
]

export default function MusclePairs() {
  const [angle, setAngle] = useState(120)
  const [calciumMg, setCal] = useState(700)
  const [sunMinutes, setSun] = useState(10)
  const [exerciseDays, setEx] = useState(2)
  const c = bicepsContraction(angle)
  const rad = (angle * Math.PI) / 180
  // shoulder at (60,60), elbow at (200,60), forearm rotates about the elbow
  const hand = { x: 200 - 120 * Math.cos(rad), y: 60 + 120 * Math.sin(rad) }
  const bicepsW = 10 + c * 18
  const tricepsW = 10 + (1 - c) * 14
  const score = boneScore({ calciumMg, sunMinutes, exerciseDays })
  return (
    <LabFrame labId="muscle-pairs" title="Muscles, Bones and Joints" subtitle="Muscles can only pull, so they work in antagonistic pairs to move bones at joints." howTo={<p>Bend and straighten the arm and watch the biceps and triceps. Then explore joint types and build healthy bone habits.</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 280 200" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Arm bent to ${angle} degrees`}>
          <line x1={60} y1={60} x2={200} y2={60} stroke="#e7e5e4" strokeWidth={14} strokeLinecap="round" />
          <line x1={200} y1={60} x2={hand.x} y2={hand.y} stroke="#e7e5e4" strokeWidth={12} strokeLinecap="round" />
          <ellipse cx={130} cy={60 - 8 - bicepsW / 2} rx={60} ry={bicepsW / 2 + 2} fill="#ef4444" opacity={0.85} />
          <line x1={190} y1={60 - 8 - bicepsW / 2} x2={200 - 30 * Math.cos(rad)} y2={60 + 30 * Math.sin(rad) - 6} stroke="#f5f5f4" strokeWidth={3} />
          <ellipse cx={130} cy={60 + 8 + tricepsW / 2} rx={62} ry={tricepsW / 2 + 2} fill="#3b82f6" opacity={0.8} />
          <circle cx={200} cy={60} r={8} fill="#a8a29e" />
          <text x={130} y={60 - 14 - bicepsW} textAnchor="middle" fontSize={10} fill="#ef4444" fontWeight={600}>biceps {c > 0.5 ? 'contracts' : 'relaxes'}</text>
          <text x={130} y={60 + 26 + tricepsW} textAnchor="middle" fontSize={10} fill="#3b82f6" fontWeight={600}>triceps {c > 0.5 ? 'relaxes' : 'contracts'}</text>
          <text x={hand.x} y={hand.y + 5} textAnchor="middle" fontSize={18}>✊</text>
          <text x={206} y={50} fontSize={9} fill="currentColor">elbow (hinge)</text>
        </svg>
        <div className="space-y-3">
          <label className="block text-sm">Elbow angle <b>{angle}°</b><Slider value={[angle]} min={30} max={180} step={5} onValueChange={([v]) => setAngle(v)} className="mt-1" aria-label="elbow angle" /></label>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Biceps" value={c > 0.5 ? '💪 Contracting (shorter)' : 'Relaxed (longer)'} />
            <Readout label="Triceps" value={c > 0.5 ? 'Relaxed (longer)' : '💪 Contracting (shorter)'} />
          </div>
          <p className="text-sm text-muted-foreground"><b>Tendons</b> (tough, inelastic) join muscles to bones; <b>ligaments</b> (strong, slightly elastic) join bones to bones at a joint. <b>Cartilage</b> and <b>synovial fluid</b> make joints move smoothly.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {JOINTS.map((j) => <div key={j.name} className="rounded-xl border p-3 text-sm"><p className="font-semibold">{j.emoji} {j.name}</p><p className="text-xs text-muted-foreground">{j.where}</p><p className="mt-1 text-xs">{j.moves}</p></div>)}
      </div>
      <div className="mt-4 rounded-2xl border p-3">
        <p className="font-semibold">🦴 Build strong bones (a teaching model, not medical advice)</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Calcium a day <b>{calciumMg} mg</b> (a glass of milk ≈ 300 mg)<Slider value={[calciumMg]} min={200} max={1600} step={100} onValueChange={([v]) => setCal(v)} className="mt-1" aria-label="calcium per day" /></label>
          <label className="text-sm">Sunlight a day (vitamin D) <b>{sunMinutes} min</b><Slider value={[sunMinutes]} min={0} max={40} step={5} onValueChange={([v]) => setSun(v)} className="mt-1" aria-label="sunlight minutes" /></label>
          <label className="text-sm">Active days a week <b>{exerciseDays}</b><Slider value={[exerciseDays]} min={0} max={7} step={1} onValueChange={([v]) => setEx(v)} className="mt-1" aria-label="exercise days" /></label>
        </div>
        <div className="mt-3 h-4 overflow-hidden rounded-full bg-muted"><div className={cn('h-full rounded-full', score >= 70 ? 'bg-success' : score >= 40 ? 'bg-warn' : 'bg-destructive')} style={{ width: `${score}%` }} /></div>
        <p className="mt-1 text-sm">Bone health score: <b>{score}/100</b>. {score >= 70 ? 'Great habits! Your teenage years are when you build most of your bone strength.' : 'Try more calcium (milk, curd, ragi, sesame, green leafy vegetables), a little sunlight, and weight-bearing exercise like running, skipping and sports.'}</p>
      </div>
    </LabFrame>
  )
}
