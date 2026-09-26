import type { ReactNode } from 'react'
import { Slider } from '@/components/ui/slider'

/** A labelled slider showing its current value. */
export function SliderRow({ label, value, shown, min, max, step = 1, onChange }: { label: ReactNode; value: number; shown?: ReactNode; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <label className="block text-sm">
      {label} = <b>{shown ?? value}</b>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} className="mt-1" aria-label={typeof label === 'string' ? label : undefined} />
    </label>
  )
}
