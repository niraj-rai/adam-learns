import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { LabFrame, Readout } from '../../_kit/LabFrame'

const COLOURS = [
  { name: 'Violet', nm: 400, rgb: [148, 0, 211] },
  { name: 'Blue', nm: 450, rgb: [0, 90, 255] },
  { name: 'Green', nm: 530, rgb: [0, 200, 60] },
  { name: 'Yellow', nm: 580, rgb: [255, 220, 0] },
  { name: 'Red', nm: 680, rgb: [255, 40, 0] },
]
/** Rayleigh scattering is proportional to 1/λ⁴ (relative to red). */
const scatter = (nm: number) => (680 / nm) ** 4

export default function SkyColours() {
  const [elev, setElev] = useState(60)
  const path = Math.min(38, 1 / Math.sin((Math.max(elev, 1) * Math.PI) / 180)) // air mass
  const k = 0.12
  const left = COLOURS.map((c) => Math.exp(-k * path * scatter(c.nm)))
  // mix the surviving colours, then scale so the brightest channel is 255
  const mix = [0, 1, 2].map((ch) => COLOURS.reduce((sum, c, i) => sum + c.rgb[ch] * left[i], 0))
  const sun = mix.map((x) => Math.round((255 * x) / Math.max(...mix)))
  const skyTop = elev > 8 ? `rgb(${Math.round(60 + 60 * (1 - elev / 90))},${Math.round(120 + 40 * elev / 90)},${Math.round(210 + 40 * elev / 90)})` : `rgb(${120 + elev * 8},${70 + elev * 6},${110 + elev * 10})`
  const skyLow = elev > 8 ? '#bfdbfe' : '#fb923c'
  const sunY = 200 - (elev / 90) * 170
  return (
    <LabFrame labId="sky-colours" title="Why Is the Sky Blue?" subtitle="Air scatters short wavelengths (blue) far more than long ones (red): scattering ∝ 1/λ⁴." howTo={<p>Move the Sun from overhead down to the horizon. At sunset its light travels through much more air, so almost all the blue is scattered away before it reaches you.</p>}>
      <svg viewBox="0 0 400 220" className="w-full rounded-2xl border" role="img" aria-label={`Sun ${elev} degrees above the horizon`}>
        <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={skyTop} /><stop offset="1" stopColor={skyLow} /></linearGradient></defs>
        <rect width={400} height={220} fill="url(#sky)" />
        <circle cx={200} cy={sunY} r={18} fill={`rgb(${sun.join(',')})`} />
        <rect x={0} y={200} width={400} height={20} fill="#166534" />
        <text x={200} y={216} textAnchor="middle" fontSize={10} fill="white">you are here</text>
      </svg>
      <label className="mt-3 block text-sm">Sun's height above the horizon <b>{elev}°</b><Slider value={[elev]} min={0} max={90} step={1} onValueChange={([v]) => setElev(v)} className="mt-1" aria-label="sun elevation" /></label>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Readout label="Air the sunlight passes through" value={`${path.toFixed(1)} × the overhead amount`} />
        <Readout label="Blue light reaching you" value={`${(left[1] * 100).toFixed(0)}%`} />
      </div>
      <div className="mt-3 rounded-2xl border p-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase">How strongly each colour is scattered (red = 1)</p>
        <div className="mt-2 space-y-1">{COLOURS.map((c) => <div key={c.name} className="flex items-center gap-2 text-xs"><span className="w-14">{c.name}</span><div className="h-3 flex-1 rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${(scatter(c.nm) / scatter(400)) * 100}%`, background: `rgb(${c.rgb.join(',')})` }} /></div><span className="w-10 text-right font-mono">{scatter(c.nm).toFixed(1)}×</span></div>)}</div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Blue light (≈ 450 nm) is scattered about 5 times more than red (≈ 680 nm), so scattered blue light reaches your eyes from all over the sky. At sunrise and sunset the light crosses so much air that the blue is scattered out, leaving reds and oranges. Danger lights are red because red is scattered least and can be seen from far away in fog. (Violet is scattered even more, but sunlight has less of it and our eyes are less sensitive to it.)</p>
    </LabFrame>
  )
}
