import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame } from '../../_kit/LabFrame'
import { FEATURES, HABITATS, helpful, survives } from './model'

const REAL: Record<string, string> = {
  desert: '🐫 The camel: humps of fat, wide padded feet for sand, long eyelashes and closable nostrils against sandstorms.',
  snow: '🐆 The snow leopard: thick fur, wide furry paws that act like snowshoes, pale camouflage and a long thick tail it wraps around itself.',
  ocean: '🐬 The dolphin (and fish): streamlined bodies and fins; fish breathe with gills, while dolphins and whales have blubber to keep warm.',
  forest: '🐒 The lion-tailed macaque climbs with gripping hands; the Malabar gliding frog and flying lizards glide between trees; green camouflage hides many animals.',
}

export default function AdaptationLab() {
  const addXp = useProgress((s) => s.addXp)
  const [hab, setHab] = useState('desert')
  const [picked, setPicked] = useState<string[]>([])
  const [tested, setTested] = useState<null | boolean>(null)
  const [solved, setSolved] = useState<string[]>([])
  const h = HABITATS.find((x) => x.id === hab)!
  const toggle = (id: string) => {
    setTested(null)
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? p : [...p, id]))
  }
  const test = () => {
    const ok = survives(picked, hab)
    setTested(ok)
    if (ok) {
      sfx.win()
      if (!solved.includes(hab)) { setSolved((s) => [...s, hab]); addXp(5, `Survivor: ${h.name}`) }
    } else sfx.wrong()
  }
  return (
    <LabFrame labId="adaptation-lab" title="Adapt-o-matic" subtitle="Design an animal that can survive in a tough habitat. Every feature must earn its place!" howTo={<p>Pick a habitat, read its challenges, then choose exactly three features for your animal. Test it. Can you design a survivor for all four habitats?</p>}>
      <div className="mb-3 flex flex-wrap gap-2">
        {HABITATS.map((x) => <button key={x.id} type="button" onClick={() => { setHab(x.id); setPicked([]); setTested(null) }} className={cn('rounded-full border px-3 py-1.5 text-sm', x.id === hab ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{solved.includes(x.id) ? '✅' : x.emoji} {x.name}</button>)}
      </div>
      <p className="mb-3 rounded-xl bg-muted/50 px-4 py-2 text-sm"><b>{h.emoji} Challenges:</b> {h.challenge}</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => {
          const on = picked.includes(f.id)
          return (
            <button key={f.id} type="button" onClick={() => toggle(f.id)} aria-pressed={on} className={cn('rounded-xl border px-3 py-2 text-left text-sm', on ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted', tested !== null && on && (helpful(f.id, hab) ? 'border-success' : 'border-destructive'))}>
              {f.emoji} {f.name}{tested !== null && on ? (helpful(f.id, hab) ? ' ✓' : ' ✗') : ''}
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button onClick={test} disabled={picked.length !== 3}>🧪 Test my animal ({picked.length}/3)</Button>
      </div>
      {tested !== null && (
        <p role="status" className={cn('mt-3 rounded-xl px-4 py-2 text-sm', tested ? 'bg-success-soft' : 'bg-warn-soft')}>
          {tested ? `✅ Your animal survives! Real example: ${REAL[hab]}` : '❌ At least one feature doesn’t help here (marked ✗). An adaptation is a feature that helps a living thing survive in its particular habitat.'}
        </p>
      )}
    </LabFrame>
  )
}
