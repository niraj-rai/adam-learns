import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

const PLANT_HORMONES = [
  { name: 'Auxin', job: 'Makes cells on the shaded side grow longer, so shoots bend towards light.' },
  { name: 'Gibberellin', job: 'Helps stems grow taller and seeds germinate.' },
  { name: 'Cytokinin', job: 'Promotes cell division; found in fruits and seeds.' },
  { name: 'Abscisic acid', job: 'Slows growth; causes leaves to wilt and fall; closes stomata in drought.' },
]
const GLANDS = [
  { gland: 'Pituitary', hormone: 'Growth hormone and others', job: 'Controls growth; the “master gland” controlling other glands.' },
  { gland: 'Thyroid', hormone: 'Thyroxine (needs iodine)', job: 'Controls metabolism. Iodine shortage causes goitre: hence iodised salt.' },
  { gland: 'Pancreas', hormone: 'Insulin', job: 'Lowers blood sugar. Too little insulin causes diabetes.' },
  { gland: 'Adrenal', hormone: 'Adrenaline', job: '“Fight or flight”: faster heartbeat and breathing in an emergency.' },
  { gland: 'Testes / Ovaries', hormone: 'Testosterone / Oestrogen', job: 'Changes at puberty.' },
]

export default function TropismLab() {
  const [light, setLight] = useState<'left' | 'top' | 'right'>('left')
  const [tipped, setTipped] = useState(false)
  const bend = light === 'left' ? -28 : light === 'right' ? 28 : 0
  return (
    <LabFrame labId="tropism-lab" title="Plant and Animal Hormones" subtitle="Plants respond to light and gravity using hormones like auxin. Animals use hormones from endocrine glands." howTo={<p>Move the light and tip the pot on its side. Watch the shoot and root respond. Then explore human hormones.</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <div>
        <svg viewBox="0 0 240 240" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Shoot bends ${bend < 0 ? 'left' : bend > 0 ? 'right' : 'up'} towards the light`}>
          <text x={light === 'left' ? 10 : light === 'right' ? 205 : 110} y={30} fontSize={26}>💡</text>
          <g transform={tipped ? 'rotate(90 120 170)' : undefined}>
            <rect x={90} y={150} width={60} height={50} fill="#a16207" rx={4} />
            {!tipped && <path d={`M120,150 Q${120 + bend / 2},110 ${120 + bend},80`} fill="none" stroke="#16a34a" strokeWidth={5} />}
            <path d="M120,200 L120,225" stroke="#78350f" strokeWidth={3} />
          </g>
          {tipped && <><path d="M140,170 Q180,170 182,125" fill="none" stroke="#16a34a" strokeWidth={5} /><path d="M65,170 Q52,182 56,218" fill="none" stroke="#78350f" strokeWidth={3} /></>}
        </svg>
        <p className="mt-1 text-center text-xs text-muted-foreground">{tipped ? 'Shoot grows up (away from gravity); root grows down (towards gravity).' : 'Shoot bends towards the light.'}</p>
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">{(['left', 'top', 'right'] as const).map((l) => <button key={l} type="button" aria-pressed={light === l} onClick={() => { setLight(l); setTipped(false) }} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm capitalize', light === l && !tipped ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>💡 Light from {l}</button>)}<button type="button" aria-pressed={tipped} onClick={() => setTipped((t) => !t)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', tipped ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>🔄 Tip the pot</button></div>
          <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm">{tipped ? <><b>Geotropism:</b> roots grow towards gravity (positive), shoots away from it (negative).</> : <><b>Phototropism:</b> auxin collects on the shaded side of the shoot, making those cells grow longer, so the shoot bends towards the light.</>} The touch-sensitive <i>Mimosa</i> (chhui-mui) folds its leaves without growth, by changing the water in its cells.</p>
          <ul className="space-y-1 text-sm">{PLANT_HORMONES.map((h) => <li key={h.name}><b>{h.name}:</b> {h.job}</li>)}</ul>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead><tr className="text-left text-xs text-muted-foreground"><th className="p-1">Gland</th><th className="p-1">Hormone</th><th className="p-1">What it does</th></tr></thead>
          <tbody>{GLANDS.map((g) => <tr key={g.gland} className="border-t"><td className="p-1 font-semibold">{g.gland}</td><td className="p-1">{g.hormone}</td><td className="p-1">{g.job}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Hormones are chemical messengers carried in the blood (or, in plants, from cell to cell). They act more slowly than nerves but their effects last longer. Many are controlled by <b>feedback</b>: when blood sugar rises, insulin is released; when it falls, less is released.</p>
    </LabFrame>
  )
}
