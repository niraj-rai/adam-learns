import { motion } from 'motion/react'
import { useState } from 'react'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { BRIEFS, costOf, DEFAULT_DESIGN, type Design, indoorTemp, meetsBrief, PARTS } from './model'

export default function CoolHouse() {
  const addXp = useProgress((s) => s.addXp)
  const awardBadge = useProgress((s) => s.awardBadge)
  const [bi, setBi] = useState(0)
  const [design, setDesign] = useState<Design>(DEFAULT_DESIGN)
  const [tested, setTested] = useState<null | boolean>(null)
  const [solved, setSolved] = useState<string[]>([])
  const [why, setWhy] = useState<string | null>(null)
  const b = BRIEFS[bi]
  const t = indoorTemp(design, b)
  const cost = costOf(design)
  const allDone = solved.length === BRIEFS.length

  const choose = (part: keyof Design, id: string, reason: string) => {
    setDesign((d) => ({ ...d, [part]: id }))
    setTested(null)
    setWhy(reason)
  }
  const test = () => {
    const ok = meetsBrief(design, b)
    setTested(ok)
    if (!ok) return sfx.wrong()
    sfx.win()
    if (!solved.includes(b.id)) {
      const next = [...solved, b.id]
      setSolved(next)
      addXp(15, `Cool House: ${b.title}`)
      if (next.length === BRIEFS.length) {
        if (!useProgress.getState().badges.includes('cool-house-architect')) addXp(25, 'Cool House Architect!')
        awardBadge('cool-house-architect')
      }
    }
  }
  const pickBrief = (i: number) => { setBi(i); setDesign(DEFAULT_DESIGN); setTested(null); setWhy(null) }

  const hot = b.season === 'summer'
  const fill = hot ? `hsl(${Math.max(0, 40 - (t - 26) * 4)} 90% 60%)` : `hsl(${Math.min(220, 200 - (t - 6) * 10)} 80% 65%)`

  return (
    <LabFrame labId="cool-house" title="Boss Challenge: Cool House" subtitle="Design homes that stay comfortable without air conditioners or heaters." howTo={<p>Read the brief, choose a roof, walls, windows, surroundings and paint, then test your design. Tap an option to see why it helps or hurts. Solve all three briefs to become a Cool House Architect. (This is a teaching model: each choice adds or removes a few degrees.)</p>}>
      {tested && <Confetti count={allDone ? 80 : 30} />}
      <div className="mb-3 flex flex-wrap gap-2">
        {BRIEFS.map((x, i) => (
          <button key={x.id} type="button" onClick={() => pickBrief(i)} className={cn('rounded-full border px-3 py-1.5 text-sm', i === bi ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{solved.includes(x.id) ? '✅' : x.emoji} {x.title}</button>
        ))}
      </div>
      <p className="mb-3 rounded-xl bg-muted/50 px-4 py-2 text-sm"><b>{b.emoji} Brief:</b> {b.story}</p>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="space-y-3">
          {PARTS.map((p) => (
            <fieldset key={p.id}>
              <legend className="mb-1 text-sm font-semibold">{p.name}</legend>
              <div className="flex flex-wrap gap-1.5">
                {p.options.map((o) => (
                  <button key={o.id} type="button" aria-pressed={design[p.id] === o.id} onClick={() => choose(p.id, o.id, `${o.emoji} ${o.name}: ${o.why}`)} className={cn('rounded-lg border px-2.5 py-1.5 text-left text-xs', design[p.id] === o.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
                    {o.emoji} {o.name} <span className="text-muted-foreground">· {o.cost}🪙</span>
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          {why && <p className="rounded-lg border border-dashed px-3 py-2 text-xs" aria-live="polite">{why}</p>}
        </div>

        <div className="space-y-2">
          <svg viewBox="0 0 200 150" className="w-full rounded-2xl border bg-background" role="img" aria-label={`House design. Predicted indoor temperature ${t} °C`}>
            <text x={170} y={26} fontSize={22}>{hot ? '☀️' : '🌙'}</text>
            <motion.rect x={40} y={60} width={120} height={70} animate={{ fill }} stroke="#475569" />
            <polygon points="30,62 100,20 170,62" fill={design.roof === 'green' ? '#16a34a' : design.roof === 'tiles' ? '#c2410c' : design.roof === 'cool-roof' ? '#f8fafc' : design.roof === 'tin' ? '#94a3b8' : '#9ca3af'} stroke="#475569" />
            {design.outside === 'trees' && <text x={0} y={128} fontSize={30}>🌳</text>}
            <text x={100} y={102} textAnchor="middle" fontSize={20} fontWeight={700} fill="#111">{t} °C</text>
            <rect x={0} y={130} width={200} height={20} fill={design.outside === 'paving' ? '#374151' : '#a16207'} opacity={0.6} />
          </svg>
          <Readout label="Outside" value={`${b.outdoor} °C`} />
          <Readout label="Predicted indoors" value={`${t} °C (goal ${hot ? '≤' : '≥'} ${b.goal} °C)`} />
          <Readout label="Cost" value={`${cost} 🪙${b.budget !== null ? ` (budget ${b.budget})` : ''}`} className={cn(b.budget !== null && cost > b.budget && 'text-destructive')} />
          <Button className="w-full" onClick={test}>🔬 Test the design</Button>
        </div>
      </div>

      {tested !== null && (
        <p role="status" className={cn('mt-3 rounded-xl px-4 py-2 text-sm', tested ? 'bg-success-soft' : 'bg-warn-soft')}>
          {tested
            ? allDone ? '🏆 All three briefs solved. You are a Cool House Architect! Good design can replace a lot of electricity.' : `✅ Brief solved: ${t} °C${b.budget !== null ? ` for ${cost} coins` : ''}. Try another brief!`
            : b.budget !== null && cost > b.budget && (hot ? t <= b.goal : t >= b.goal)
              ? `Comfortable, but ${cost} coins is over the budget of ${b.budget}. Which choice gives the most cooling per coin?`
              : `Not yet: ${t} °C. ${hot ? 'Think about reflecting radiation, insulating with trapped air and using convection to carry heat away.' : 'Think about insulation (trapped air) and letting in the winter sun.'}`}
        </p>
      )}
    </LabFrame>
  )
}
