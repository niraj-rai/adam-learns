import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { AGENTS, PARTS, pollinationType } from './model'

type PartId = (typeof PARTS)[number]['id']
/** Where each label sits on the flower drawing. */
const SPOTS: Record<PartId, [number, number]> = { sepal: [70, 185], petal: [40, 110], anther: [182, 48], filament: [172, 95], stigma: [120, 38], style: [120, 90], ovary: [120, 150], ovule: [132, 152] }

export default function FlowerLab() {
  const [tab, setTab] = useState<'label' | 'pollinate'>('label')
  return (
    <LabFrame labId="flower-lab" title="Flower Lab" subtitle="Flowers are the reproductive parts of flowering plants. Label a flower, then be the bee!" howTo={<p>Tab 1: choose a name, then tap the part of the flower it belongs to. Tab 2: fly a bee between flowers on two plants and see self- and cross-pollination.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['label', '🌺 Label the flower'], ['pollinate', '🐝 Be the bee']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'label' ? <Label /> : <Pollinate />}
    </LabFrame>
  )
}

function FlowerDrawing({ onPart, found }: { onPart?: (id: PartId) => void; found: PartId[] }) {
  const hit = (id: PartId) => ({ onClick: () => onPart?.(id), className: cn(onPart && 'cursor-pointer'), opacity: found.includes(id) ? 1 : 0.9 })
  return (
    <svg viewBox="0 0 240 220" className="w-full max-w-sm" role="img" aria-label="Cut-away diagram of a flower">
      <g {...hit('petal')}><path d="M120 150 C 40 150, 10 80, 55 60 C 80 50, 95 110, 118 140 Z" fill="#f472b6" /><path d="M120 150 C 200 150, 230 80, 185 60 C 160 50, 145 110, 122 140 Z" fill="#f472b6" /></g>
      <g {...hit('sepal')}><path d="M120 165 C 80 175, 60 195, 55 200 C 85 190, 105 180, 120 172 Z M120 165 C 160 175, 180 195, 185 200 C 155 190, 135 180, 120 172 Z" fill="#16a34a" /></g>
      <rect x={117} y={165} width={6} height={50} fill="#15803d" />
      <g {...hit('ovary')}><ellipse cx={120} cy={150} rx={20} ry={16} fill="#a3e635" stroke="#4d7c0f" /></g>
      <g {...hit('ovule')}>{[112, 120, 128].map((x) => <circle key={x} cx={x} cy={152} r={3.5} fill="#fef08a" stroke="#a16207" />)}</g>
      <g {...hit('style')}><rect x={117} y={50} width={6} height={86} fill="#bef264" /></g>
      <g {...hit('stigma')}><ellipse cx={120} cy={46} rx={12} ry={7} fill="#facc15" /></g>
      <g {...hit('filament')}><path d="M138 140 Q 160 100 180 55 M102 140 Q 80 100 60 55" stroke="#fde68a" strokeWidth={3} fill="none" /></g>
      <g {...hit('anther')}><ellipse cx={182} cy={50} rx={9} ry={6} fill="#ea580c" /><ellipse cx={58} cy={50} rx={9} ry={6} fill="#ea580c" /></g>
      {found.map((id) => <text key={id} x={SPOTS[id][0] + (id === 'ovule' ? 30 : 0)} y={SPOTS[id][1]} fontSize={9} className="fill-foreground font-semibold" textAnchor="middle">{PARTS.find((p) => p.id === id)!.name}</text>)}
    </svg>
  )
}

function Label() {
  const order = useMemo(() => shuffle(PARTS.map((p) => p.id)), [])
  const [i, setI] = useState(0)
  const [found, setFound] = useState<PartId[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const target = order[i] as PartId | undefined
  const tap = (id: PartId) => {
    if (!target) return
    if (id === target) { sfx.correct(); setFound((f) => [...f, id]); setMsg(PARTS.find((p) => p.id === id)!.job); setI((x) => x + 1) }
    else { sfx.wrong(); setMsg(`That's the ${PARTS.find((p) => p.id === id)!.name.toLowerCase()}. Try again!`) }
  }
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <div className="grid place-items-center rounded-2xl border bg-background p-3"><FlowerDrawing onPart={tap} found={found} /></div>
      <div className="space-y-2">
        {target ? <p className="rounded-xl bg-chem-soft p-3 text-sm">Tap the <b>{PARTS.find((p) => p.id === target)!.name}</b>.</p> : <p role="status" className="rounded-xl bg-success-soft p-3 text-sm">✅ All parts labelled! The <b>stamen</b> (anther + filament) is the male part; the <b>pistil</b> (stigma + style + ovary) is the female part.</p>}
        {msg && <p className="rounded-lg border border-dashed p-2 text-sm">{msg}</p>}
        <Readout label="Labelled" value={`${found.length} / ${PARTS.length}`} />
      </div>
    </div>
  )
}

function Pollinate() {
  const [visits, setVisits] = useState<{ from: 'A' | 'B'; to: 'A' | 'B' }[]>([])
  const [carrying, setCarrying] = useState<'A' | 'B' | null>(null)
  const [bee, setBee] = useState<[number, number]>([160, 30])
  const flowers: { id: string; plant: 'A' | 'B'; x: number; y: number }[] = [
    { id: 'a1', plant: 'A', x: 50, y: 110 }, { id: 'a2', plant: 'A', x: 110, y: 90 },
    { id: 'b1', plant: 'B', x: 220, y: 100 }, { id: 'b2', plant: 'B', x: 280, y: 120 },
  ]
  const visit = (f: (typeof flowers)[number]) => {
    setBee([f.x, f.y - 25])
    if (carrying) setVisits((v) => [...v, { from: carrying, to: f.plant }])
    setCarrying(f.plant)
    sfx.click()
  }
  const cross = visits.filter((v) => pollinationType(v) === 'cross').length
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 330 200" className="w-full rounded-2xl border bg-sky-50 dark:bg-slate-900" role="img" aria-label="Two plants with flowers and a bee">
        <path d="M80 200 V120 M80 150 L50 120 M80 140 L110 100" stroke="#15803d" strokeWidth={4} />
        <path d="M250 200 V120 M250 150 L220 110 M250 140 L280 125" stroke="#15803d" strokeWidth={4} />
        <text x={80} y={195} textAnchor="middle" fontSize={10} className="fill-foreground">Plant A</text>
        <text x={250} y={195} textAnchor="middle" fontSize={10} className="fill-foreground">Plant B</text>
        {flowers.map((f) => (
          <g key={f.id} onClick={() => visit(f)} className="cursor-pointer">
            <circle cx={f.x} cy={f.y} r={16} fill={f.plant === 'A' ? '#f9a8d4' : '#fcd34d'} />
            <circle cx={f.x} cy={f.y} r={5} fill="#ea580c" />
          </g>
        ))}
        <motion.text animate={{ x: bee[0], y: bee[1] }} fontSize={22} textAnchor="middle">🐝</motion.text>
      </svg>
      <div className="flex flex-wrap items-center gap-2">
        <Readout label="Pollen carried from" value={carrying ? `Plant ${carrying}` : 'nothing yet'} />
        <Readout label="Self-pollinations" value={visits.length - cross} />
        <Readout label="Cross-pollinations" value={cross} />
        <Button size="sm" variant="ghost" onClick={() => { setVisits([]); setCarrying(null) }}>↺ Reset</Button>
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Tap flowers to fly the bee. Pollen sticks to its body and rubs off on the next stigma. Pollen landing on a flower of the <b>same plant</b> is <b>self-pollination</b>; pollen carried to <b>another plant</b> of the same kind is <b>cross-pollination</b>, which mixes features and gives more variety. After pollination, a male cell from the pollen fuses with the egg in the ovule: <b>fertilisation</b>. The ovule becomes a seed and the ovary becomes a fruit.</p>
      <div className="grid gap-2 sm:grid-cols-2">{AGENTS.map((a) => <div key={a.id} className="rounded-lg border p-2 text-xs"><b>{a.name}</b>: {a.example}. <span className="text-muted-foreground">Clue: {a.clue}.</span></div>)}</div>
    </div>
  )
}
