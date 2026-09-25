import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

type Station = 'oxygen' | 'water' | 'acid'
type R = { level: number; text: string; danger?: boolean }

const METALS: { id: string; name: string; symbol: string; r: Record<Station, R> }[] = [
  { id: 'K', name: 'Potassium', symbol: 'K', r: { oxygen: { level: 5, text: 'Tarnishes instantly in air; burns with a lilac flame. Stored under kerosene!' }, water: { level: 5, text: 'Whizzes around, melts, and the hydrogen catches fire with a lilac flame!' }, acid: { level: 5, text: 'Far too dangerous to try: it would explode.', danger: true } } },
  { id: 'Na', name: 'Sodium', symbol: 'Na', r: { oxygen: { level: 5, text: 'Tarnishes quickly; burns with a bright yellow-orange flame. Stored under kerosene!' }, water: { level: 5, text: 'Fizzes violently, melts into a silvery ball and races across the water.' }, acid: { level: 5, text: 'Far too dangerous to try.', danger: true } } },
  { id: 'Ca', name: 'Calcium', symbol: 'Ca', r: { oxygen: { level: 4, text: 'Burns with a brick-red flame.' }, water: { level: 3, text: 'Fizzes steadily; the water turns cloudy (calcium hydroxide forms). Calcium floats on the bubbles!' }, acid: { level: 4, text: 'Vigorous fizzing.' } } },
  { id: 'Mg', name: 'Magnesium', symbol: 'Mg', r: { oxygen: { level: 4, text: 'Burns with a DAZZLING white light, leaving white powder (magnesium oxide).' }, water: { level: 1, text: 'Very slow bubbles in cold water (reacts quickly with steam).' }, acid: { level: 4, text: 'Fast fizzing; the tube gets warm.' } } },
  { id: 'Zn', name: 'Zinc', symbol: 'Zn', r: { oxygen: { level: 2, text: 'Burns only as powder, when strongly heated.' }, water: { level: 0, text: 'No reaction with cold water.' }, acid: { level: 3, text: 'Steady fizzing: hydrogen is given off.' } } },
  { id: 'Fe', name: 'Iron', symbol: 'Fe', r: { oxygen: { level: 2, text: 'Iron wool burns with sparks; a nail slowly rusts in moist air.' }, water: { level: 0, text: 'No reaction with cold water (it rusts slowly over days).' }, acid: { level: 2, text: 'Slow fizzing.' } } },
  { id: 'Cu', name: 'Copper', symbol: 'Cu', r: { oxygen: { level: 1, text: 'Does not burn, but gets a black coating (copper oxide) when heated.' }, water: { level: 0, text: 'No reaction.' }, acid: { level: 0, text: 'No reaction with dilute acid.' } } },
  { id: 'Au', name: 'Gold', symbol: 'Au', r: { oxygen: { level: 0, text: 'No reaction, even when heated. It stays shiny forever!' }, water: { level: 0, text: 'No reaction.' }, acid: { level: 0, text: 'No reaction.' } } },
]
const STATIONS: { id: Station; name: string; emoji: string; product: string }[] = [
  { id: 'oxygen', name: 'Heat in air (oxygen)', emoji: '🔥', product: 'metal + oxygen → metal oxide' },
  { id: 'water', name: 'Drop into cold water', emoji: '💧', product: 'metal + water → metal hydroxide + hydrogen' },
  { id: 'acid', name: 'Drop into dilute acid', emoji: '🧪', product: 'metal + acid → salt + hydrogen' },
]

export default function MetalReactions() {
  const [metal, setMetal] = useState(METALS[3].id)
  const [station, setStation] = useState<Station>('acid')
  const [seen, setSeen] = useState<Record<string, true>>({})
  const [shown, setShown] = useState(false)
  const m = METALS.find((x) => x.id === metal)!
  const r = m.r[station]

  const run = () => {
    setShown(true)
    setSeen((s) => ({ ...s, [`${metal}|${station}`]: true }))
    if (r.level >= 4) sfx.win()
    else sfx.click()
  }

  return (
    <LabFrame
      labId="metal-reactions"
      title="Metal Reactions"
      subtitle="Test 8 metals with oxygen, water and acid. Which is the most reactive?"
      howTo={<p>Pick a metal and a test station, then run it. Your results build a league table below. Rank the metals from most to least reactive!</p>}
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        {METALS.map((x) => (
          <button key={x.id} type="button" onClick={() => { setMetal(x.id); setShown(false) }} className={cn('rounded-full border px-3 py-1.5 text-sm', x.id === metal ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
            <b>{x.symbol}</b> {x.name}
          </button>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {STATIONS.map((s) => (
          <button key={s.id} type="button" onClick={() => { setStation(s.id); setShown(false) }} className={cn('rounded-full border px-3 py-1.5 text-sm', s.id === station ? 'border-primary bg-primary/10 font-semibold' : 'hover:bg-muted')}>
            {s.emoji} {s.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <div className="grid h-48 place-items-center rounded-2xl border bg-background">
          {shown ? (
            <motion.div key={`${metal}${station}`} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
              <motion.p className="text-6xl" animate={r.level >= 4 ? { rotate: [0, -8, 8, -8, 0], scale: [1, 1.2, 1] } : r.level > 0 ? { y: [0, -4, 0] } : {}} transition={{ repeat: r.level > 0 ? Infinity : 0, duration: 1.2 - r.level * 0.15 }}>
                {r.danger ? '⚠️' : r.level >= 4 ? (station === 'oxygen' ? '✨' : '💥') : r.level > 0 ? '🫧' : '😶'}
              </motion.p>
              <p className="mt-1 text-xs text-muted-foreground">Reactivity: {'🟥'.repeat(r.level)}{'⬜'.repeat(5 - r.level)}</p>
            </motion.div>
          ) : (
            <Button size="lg" onClick={run}>Run the test</Button>
          )}
        </div>
        <div className="space-y-2">
          {shown && (
            <>
              <p role="status" className={cn('rounded-xl px-4 py-3 text-sm', r.danger ? 'bg-warn-soft' : 'bg-chem-soft')}>
                <b>{m.name}</b>: {r.text}
              </p>
              {!r.danger && r.level > 0 && <p className="text-sm text-muted-foreground">General equation: {STATIONS.find((s) => s.id === station)!.product}</p>}
            </>
          )}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <p className="mb-1 text-sm font-semibold">League table ({Object.keys(seen).length} / {METALS.length * 3} tests)</p>
        <table className="w-full min-w-[480px] text-sm">
          <thead className="text-left text-xs text-muted-foreground uppercase">
            <tr><th className="py-1">Metal</th>{STATIONS.map((s) => <th key={s.id} className="py-1">{s.emoji} {s.id}</th>)}</tr>
          </thead>
          <tbody>
            {METALS.map((x) => (
              <tr key={x.id} className="border-t">
                <td className="py-1 font-semibold">{x.symbol} {x.name}</td>
                {STATIONS.map((s) => (
                  <td key={s.id} className="py-1 tracking-tight">
                    {seen[`${x.id}|${s.id}`] ? (x.r[s.id].danger ? '⚠️ too dangerous' : '🟥'.repeat(x.r[s.id].level) || 'none') : '·'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LabFrame>
  )
}
