import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

type Tab = 'handspan' | 'ruler' | 'parallax'

const PEOPLE = [
  { name: 'Adam', emoji: '🧒', span: 16 },
  { name: 'Papa', emoji: '👨', span: 22 },
  { name: 'Little sister', emoji: '👧', span: 11 },
]
const TABLE_CM = 132

const OBJECTS = [
  { name: 'Pencil', emoji: '✏️', length: 14.3, start: 0 },
  { name: 'Eraser', emoji: '🧽', length: 4.6, start: 0 },
  { name: 'Leaf', emoji: '🍃', length: 8.7, start: 0 },
  { name: 'Crayon on a BROKEN ruler', emoji: '🖍️', length: 6.4, start: 2 },
  { name: 'Key on a BROKEN ruler', emoji: '🔑', length: 5.2, start: 1 },
]

const PX_PER_CM = 30

function Ruler({ from, to }: { from: number; to: number }) {
  const ticks = []
  for (let mm = from * 10; mm <= to * 10; mm++) {
    const x = (mm / 10 - from) * PX_PER_CM + 10
    const cm = mm % 10 === 0
    ticks.push(<line key={mm} x1={x} x2={x} y1={0} y2={cm ? 18 : mm % 5 === 0 ? 12 : 7} stroke="#334155" strokeWidth={cm ? 1.4 : 0.7} />)
    if (cm) ticks.push(<text key={`t${mm}`} x={x} y={30} fontSize={10} textAnchor="middle" fill="#334155">{mm / 10}</text>)
  }
  return (
    <g>
      <rect x={0} y={0} width={(to - from) * PX_PER_CM + 20} height={36} rx={3} fill="#fde68a" stroke="#ca8a04" />
      {ticks}
    </g>
  )
}

export default function MeasureIt() {
  const [tab, setTab] = useState<Tab>('handspan')
  // handspan
  const [measured, setMeasured] = useState<string[]>([])
  // ruler
  const [oi, setOi] = useState(0)
  const [guess, setGuess] = useState('')
  const [rulerResult, setRulerResult] = useState<'right' | 'wrong' | null>(null)
  const [rulerScore, setRulerScore] = useState(0)
  // parallax
  const [eye, setEye] = useState(-40)
  const [parallaxAnswer, setParallaxAnswer] = useState<string | null>(null)

  const obj = OBJECTS[oi]
  const trueEnd = obj.start + obj.length
  const apparent = useMemo(() => 7.5 + eye * 0.012, [eye])

  const checkRuler = () => {
    const g = Number(guess)
    const ok = Math.abs(g - obj.length) <= 0.11
    setRulerResult(ok ? 'right' : 'wrong')
    if (ok) {
      setRulerScore((s) => s + 1)
      sfx.correct()
    } else sfx.wrong()
  }

  return (
    <LabFrame
      labId="measure-it"
      title="Measure It!"
      subtitle="Why we need standard units, and how to measure length accurately"
      howTo={<p>Work through the three tabs: the handspan problem, reading a ruler (including a broken one!) and avoiding parallax error.</p>}
    >
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['handspan', '✋ The handspan problem'], ['ruler', '📏 Read the ruler'], ['parallax', '👁️ Parallax error']] as [Tab, string][]).map(([t, l]) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('rounded-md px-3 py-1', tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'handspan' && (
        <div className="space-y-3">
          <p className="text-sm">Three family members measure the <b>same dining table</b> using their handspans (a traditional body unit, like the <i>angula</i> and <i>hasta</i> used in ancient India).</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {PEOPLE.map((p) => {
              const done = measured.includes(p.name)
              const spans = TABLE_CM / p.span
              return (
                <div key={p.name} className="rounded-2xl border bg-background p-3 text-center">
                  <p className="text-4xl">{p.emoji}</p>
                  <p className="font-heading font-semibold">{p.name}</p>
                  <div className="relative mx-auto mt-2 h-6 w-full max-w-[220px] rounded bg-amber-700/70">
                    {done && Array.from({ length: Math.floor(spans) }, (_, k) => (
                      <motion.span key={k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: k * 0.12 }} className="absolute top-0 text-sm" style={{ left: `${(k / spans) * 100}%` }}>✋</motion.span>
                    ))}
                  </div>
                  {done ? <p className="mt-2 text-sm">Table = <b>{spans.toFixed(1)} handspans</b></p> : <Button size="sm" className="mt-2" onClick={() => setMeasured((m) => [...m, p.name])}>Measure</Button>}
                </div>
              )
            })}
          </div>
          {measured.length === 3 && (
            <p role="status" className="rounded-xl bg-chem-soft px-4 py-3 text-sm">
              🤔 Same table, three different answers! Body parts are different sizes for different people. That's why the world agreed on <b>standard units</b>: the <b>SI unit of length is the metre (m)</b>. The table is <b>{TABLE_CM} cm = {TABLE_CM / 100} m</b> for everyone.
            </p>
          )}
        </div>
      )}

      {tab === 'ruler' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {OBJECTS.map((o, i) => (
              <button key={o.name} type="button" onClick={() => { setOi(i); setGuess(''); setRulerResult(null) }} className={cn('rounded-full border px-3 py-1.5 text-sm', i === oi ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
                {o.emoji} {o.name}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto rounded-2xl border bg-background p-4">
            <svg viewBox={`0 0 ${(Math.ceil(trueEnd) + 1 - obj.start) * PX_PER_CM + 40} 90`} className="h-28 min-w-[420px]" role="img" aria-label={`${obj.name} placed on a ruler starting at ${obj.start} cm`}>
              <rect x={10} y={10} width={obj.length * PX_PER_CM} height={22} rx={6} fill="#7dd3fc" stroke="#0369a1" />
              <text x={10 + (obj.length * PX_PER_CM) / 2} y={26} textAnchor="middle" fontSize={14}>{obj.emoji}</text>
              <line x1={10} x2={10} y1={5} y2={50} stroke="#dc2626" strokeDasharray="3 2" />
              <line x1={10 + obj.length * PX_PER_CM} x2={10 + obj.length * PX_PER_CM} y1={5} y2={50} stroke="#dc2626" strokeDasharray="3 2" />
              <g transform="translate(0 44)">
                <Ruler from={obj.start} to={Math.ceil(trueEnd) + 1} />
              </g>
            </svg>
          </div>
          {obj.start > 0 && <p className="text-sm text-warn">⚠️ This ruler's end is broken, so the object starts at the {obj.start} cm mark, not 0!</p>}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm">Length of the {obj.name.split(' ')[0].toLowerCase()}:</span>
            <input value={guess} onChange={(e) => { setGuess(e.target.value); setRulerResult(null) }} inputMode="decimal" placeholder="0.0" className="h-9 w-24 rounded-lg border bg-background px-3 text-sm" aria-label="Your measurement in centimetres" />
            <span className="text-sm">cm</span>
            <Button variant="outline" onClick={checkRuler} disabled={!guess}>Check</Button>
            <span className="text-sm text-muted-foreground">Score {rulerScore}</span>
          </div>
          {rulerResult && (
            <p role="status" className={cn('rounded-lg px-3 py-2 text-sm', rulerResult === 'right' ? 'bg-success-soft' : 'bg-warn-soft')}>
              {rulerResult === 'right' ? `✅ Correct: ${obj.length} cm.` : `❌ Read where the object ENDS (${trueEnd.toFixed(1)} cm) and subtract where it STARTS (${obj.start} cm): ${trueEnd.toFixed(1)} − ${obj.start} = ${obj.length} cm.`}
            </p>
          )}
        </div>
      )}

      {tab === 'parallax' && (
        <div className="grid gap-4 md:grid-cols-[1fr_260px]">
          <svg viewBox="0 0 300 200" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Eye at angle ${eye}, apparent reading ${apparent.toFixed(1)} cm`}>
            <g transform="translate(20 120)">
              <Ruler from={5} to={13} />
            </g>
            <rect x={20} y={100} width={(7.5 - 5) * PX_PER_CM + 10} height={18} rx={4} fill="#7dd3fc" stroke="#0369a1" />
            <text x={150 + eye * 1.6} y={32} fontSize={26} textAnchor="middle">👁️</text>
            <line x1={150 + eye * 1.6} y1={40} x2={30 + (7.5 - 5) * PX_PER_CM} y2={109} stroke="#16a34a" strokeDasharray="4 3" />
            <line x1={30 + (7.5 - 5) * PX_PER_CM} y1={109} x2={30 + (apparent - 5) * PX_PER_CM} y2={120} stroke="#dc2626" strokeWidth={2} />
            <text x={30 + (apparent - 5) * PX_PER_CM} y={196} fontSize={11} textAnchor="middle" fill="#dc2626">reads {apparent.toFixed(1)}</text>
          </svg>
          <div className="space-y-3">
            <p className="text-sm">The end of the object is really at <b>7.5 cm</b>, but the ruler's marks are slightly below it. Move your eye:</p>
            <Slider value={[eye]} min={-60} max={60} step={1} onValueChange={([v]) => { setEye(v); setParallaxAnswer(null) }} aria-label="Eye position" />
            <p className="text-center font-heading text-2xl font-semibold">Reading: {apparent.toFixed(1)} cm</p>
            <p className="text-sm font-semibold">Where should your eye be?</p>
            {['To the left', 'Directly above the mark', 'To the right'].map((o) => (
              <Button key={o} variant={parallaxAnswer === o ? (o.startsWith('Directly') ? 'default' : 'destructive') : 'outline'} className="w-full justify-start" onClick={() => { setParallaxAnswer(o); (o.startsWith('Directly') ? sfx.correct : sfx.wrong)() }}>
                {o}
              </Button>
            ))}
            {parallaxAnswer && <p role="status" className="text-sm">{parallaxAnswer.startsWith('Directly') ? '✅ Yes! Looking from the side gives a wrong reading. This is called parallax error. Always look straight down at the mark.' : '❌ Looking from the side makes the reading wrong (parallax error). Look straight down at the mark.'}</p>}
          </div>
        </div>
      )}
    </LabFrame>
  )
}
