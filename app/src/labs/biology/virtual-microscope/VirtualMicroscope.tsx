import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { blurFor, fieldOfView, OBJECTIVES, SPECIMENS, type SpecimenId, totalMagnification } from './model'
import { Specimen } from './Specimen'

const VIEW = 300 // px diameter of the eyepiece view

/** The circular eyepiece view, shared with the Mystery Slides boss. */
export function EyepieceView({ id, objective, focus, stained, label }: { id: SpecimenId; objective: number; focus: number; stained: boolean; label: string }) {
  const s = SPECIMENS.find((x) => x.id === id)!
  const mag = totalMagnification(objective)
  const fov = fieldOfView(mag)
  const scale = VIEW / fov
  const blur = blurFor(focus, s.bestFocus)
  const fid = `blur-${id}`
  return (
    <svg viewBox={`${-VIEW / 2} ${-VIEW / 2} ${VIEW} ${VIEW}`} className="w-full max-w-80 rounded-full border-8 border-slate-800 bg-black" role="img" aria-label={label}>
      <defs>
        <filter id={fid}><feGaussianBlur stdDeviation={blur} /></filter>
        <clipPath id="eyepiece"><circle r={VIEW / 2} /></clipPath>
      </defs>
      <g clipPath="url(#eyepiece)">
        <g filter={blur > 0.05 ? `url(#${fid})` : undefined}>
          <g transform={`scale(${scale})`}>
            <Specimen id={id} stained={stained} radius={fov / 2 + 20} />
          </g>
        </g>
      </g>
    </svg>
  )
}

export default function VirtualMicroscope() {
  const [id, setId] = useState<SpecimenId>('onion')
  const [objective, setObjective] = useState(4)
  const [focus, setFocus] = useState(20)
  const [stained, setStained] = useState(false)
  const s = SPECIMENS.find((x) => x.id === id)!
  const mag = totalMagnification(objective)
  const fov = fieldOfView(mag)
  const sharp = blurFor(focus, s.bestFocus) < 0.6

  return (
    <LabFrame labId="virtual-microscope" title="Virtual Microscope" subtitle="Prepare a slide, focus the microscope and zoom in on the building blocks of life." howTo={<p>Choose a slide. Start with the lowest-power objective (4×), turn the focus knob until the image is sharp, then switch to higher power and refocus. Add a stain to see the nucleus. Use the field of view to estimate the size of one cell.</p>}>
      <div className="mb-3 flex flex-wrap gap-2">
        {SPECIMENS.map((x) => <button key={x.id} type="button" onClick={() => { setId(x.id); setStained(false); setFocus(20) }} className={cn('rounded-full border px-3 py-1.5 text-sm', x.id === id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.emoji} {x.name}</button>)}
      </div>
      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        <div className="grid place-items-center">
          <EyepieceView id={id} objective={objective} focus={focus} stained={stained} label={`${s.name} at ${mag}× ${sharp ? 'in focus' : 'blurred'}${stained ? ', stained' : ''}`} />
        </div>
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-sm font-semibold">Objective lens</p>
            <div className="flex flex-wrap gap-1.5">
              {OBJECTIVES.map((o) => <Button key={o} size="sm" variant={o === objective ? 'default' : 'outline'} onClick={() => setObjective(o)}>{o}×{o === 100 ? ' (oil)' : ''}</Button>)}
            </div>
          </div>
          <label className="block text-sm">Focus knob: <b>{focus}</b> {sharp ? '✅ sharp' : ''}
            <Slider value={[focus]} min={0} max={100} step={1} onValueChange={([v]) => setFocus(v)} className="mt-1.5" aria-label="Focus" />
          </label>
          <Button size="sm" variant={stained ? 'default' : 'outline'} onClick={() => setStained((x) => !x)} disabled={s.stain === 'none needed'}>🧪 {stained ? 'Stained' : `Add stain (${s.stain})`}</Button>
          <div className="grid grid-cols-2 gap-2">
            <Readout label="Total magnification" value={`10 × ${objective} = ${mag}×`} />
            <Readout label="Field of view" value={fov >= 1000 ? `${(fov / 1000).toFixed(1)} mm` : `${fov.toFixed(0)} µm`} />
          </div>
          <p className="rounded-lg bg-chem-soft p-3 text-sm"><b>{s.kind}.</b> {id === 'onion' && 'Brick-shaped cells with a thick cell wall. Stain with iodine to see the nucleus. No chloroplasts: the peel grows underground, away from light.'}{id === 'cheek' && 'Irregular, flat animal cells with no cell wall. Methylene blue stains the nucleus.'}{id === 'hydrilla' && 'Plant cells packed with green chloroplasts, where photosynthesis happens.'}{id === 'bacteria' && 'Lactobacillus from curd: tiny rod-shaped cells with no nucleus. You need the 100× oil lens to see them clearly!'}{id === 'blood' && 'Red blood cells: round, dimpled discs with NO nucleus, which leaves more room to carry oxygen. The purple cells are white blood cells.'}{id === 'neuron' && 'Nerve cells with long branches that carry messages around the body. One nerve cell can be a metre long!'}</p>
          <p className="text-xs text-muted-foreground">📏 1 millimetre (mm) = 1000 micrometres (µm). A typical onion cell is about {SPECIMENS.find((x) => x.id === 'onion')!.typicalSize} µm long; a red blood cell is only about 7.5 µm across.</p>
        </div>
      </div>
    </LabFrame>
  )
}
