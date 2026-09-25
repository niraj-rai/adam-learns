import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

type Test = 'hammer' | 'circuit' | 'drop' | 'look'
type Sample = {
  id: string
  name: string
  emoji: string
  colour: string
  metal: boolean
  results: Record<Test, { ok: boolean; text: string }>
  note?: string
}

const SAMPLES: Sample[] = [
  { id: 'iron', name: 'Iron nail', emoji: '🔩', colour: '#6b7280', metal: true, results: { hammer: { ok: true, text: 'Flattens without breaking (malleable)' }, circuit: { ok: true, text: 'Bulb lights: conducts electricity' }, drop: { ok: true, text: 'Ringing "clang" (sonorous)' }, look: { ok: true, text: 'Shiny grey when scratched (lustrous)' } } },
  { id: 'copper', name: 'Copper wire', emoji: '🟠', colour: '#c2410c', metal: true, results: { hammer: { ok: true, text: 'Flattens easily (malleable)' }, circuit: { ok: true, text: 'Bulb lights brightly: excellent conductor' }, drop: { ok: true, text: 'Rings (sonorous)' }, look: { ok: true, text: 'Shiny reddish-brown (lustrous)' } } },
  { id: 'aluminium', name: 'Aluminium foil', emoji: '🥈', colour: '#cbd5e1', metal: true, results: { hammer: { ok: true, text: 'Flattens into an even thinner sheet' }, circuit: { ok: true, text: 'Bulb lights: conducts electricity' }, drop: { ok: true, text: 'A thick piece rings (sonorous)' }, look: { ok: true, text: 'Shiny silver (lustrous)' } } },
  { id: 'sulfur', name: 'Sulfur lump', emoji: '🟡', colour: '#facc15', metal: false, results: { hammer: { ok: false, text: 'Shatters into powder (brittle)' }, circuit: { ok: false, text: 'Bulb stays off: does not conduct' }, drop: { ok: false, text: 'Dull thud' }, look: { ok: false, text: 'Dull yellow' } } },
  { id: 'coal', name: 'Coal (carbon)', emoji: '⚫', colour: '#1f2937', metal: false, results: { hammer: { ok: false, text: 'Breaks into pieces (brittle)' }, circuit: { ok: false, text: 'Bulb stays off' }, drop: { ok: false, text: 'Dull thud' }, look: { ok: false, text: 'Dull black' } } },
  { id: 'graphite', name: 'Graphite (pencil lead)', emoji: '✏️', colour: '#475569', metal: false, results: { hammer: { ok: false, text: 'Snaps and crumbles (brittle)' }, circuit: { ok: true, text: 'Bulb lights! A non-metal that CONDUCTS' }, drop: { ok: false, text: 'Dull tap' }, look: { ok: true, text: 'Slightly shiny grey' } }, note: 'Graphite is the exception: a non-metal (carbon) that conducts electricity. That is why it is used in batteries.' },
  { id: 'iodine', name: 'Iodine crystals', emoji: '💜', colour: '#581c87', metal: false, results: { hammer: { ok: false, text: 'Crumbles (brittle)' }, circuit: { ok: false, text: 'Bulb stays off' }, drop: { ok: false, text: 'No ring' }, look: { ok: true, text: 'Shiny purple-black crystals!' } }, note: 'Iodine is a non-metal that is shiny (lustrous), another exception to the rules.' },
]

const TESTS: { id: Test; name: string; emoji: string; property: string }[] = [
  { id: 'hammer', name: 'Hammer it', emoji: '🔨', property: 'Malleable?' },
  { id: 'circuit', name: 'Put it in a circuit', emoji: '💡', property: 'Conducts?' },
  { id: 'drop', name: 'Drop it on the floor', emoji: '🔔', property: 'Sonorous?' },
  { id: 'look', name: 'Scratch and look', emoji: '🔍', property: 'Lustrous?' },
]

export default function PropertyTester() {
  const [sid, setSid] = useState(SAMPLES[0].id)
  const [done, setDone] = useState<Record<string, Test[]>>({})
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [last, setLast] = useState<Test | null>(null)
  const s = SAMPLES.find((x) => x.id === sid)!
  const tested = done[sid] ?? []
  const score = SAMPLES.filter((x) => answers[x.id] === x.metal).length

  const run = (t: Test) => {
    setDone((d) => ({ ...d, [sid]: [...new Set([...(d[sid] ?? []), t])] }))
    setLast(t)
    sfx.click()
  }
  const classify = (metal: boolean) => {
    if (sid in answers) return
    setAnswers((a) => ({ ...a, [sid]: metal }))
    ;(metal === s.metal ? sfx.correct : sfx.wrong)()
  }

  return (
    <LabFrame
      labId="property-tester"
      title="Property Tester"
      subtitle="Hammer, wire up, drop and scratch 7 materials. Metal or non-metal?"
      howTo={<p>Choose a sample, run all four tests, then decide: metal or non-metal? Look out for two surprising exceptions!</p>}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {SAMPLES.map((x) => (
          <button key={x.id} type="button" onClick={() => { setSid(x.id); setLast(null) }} className={cn('rounded-full border px-3 py-1.5 text-sm', x.id === sid ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
            {x.emoji} {x.name} {x.id in answers && (answers[x.id] === x.metal ? '✅' : '❌')}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          <div className="grid h-40 place-items-center rounded-2xl border bg-background">
            <motion.div
              key={`${sid}-${last}`}
              initial={{ scale: 1 }}
              animate={last === 'hammer' ? (s.results.hammer.ok ? { scaleY: [1, 0.4], scaleX: [1, 1.8] } : { scale: [1, 1.1, 0.2], opacity: [1, 1, 0.3] }) : last === 'drop' ? { y: [0, 40, 0] } : {}}
              transition={{ duration: 0.5 }}
              className="size-20 rounded-xl border-2 border-black/20 shadow-inner"
              style={{ background: s.colour }}
              aria-hidden
            />
            {last === 'circuit' && <span className="text-4xl">{s.results.circuit.ok ? '💡' : '⚫'}</span>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TESTS.map((t) => (
              <Button key={t.id} variant="outline" onClick={() => run(t.id)} className="justify-start">
                {t.emoji} {t.name}
              </Button>
            ))}
          </div>
          {last && (
            <p role="status" className="rounded-lg bg-chem-soft px-3 py-2 text-sm">
              {TESTS.find((t) => t.id === last)!.emoji} {s.results[last].text}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <table className="w-full text-sm">
            <tbody>
              {TESTS.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="py-1.5">{t.property}</td>
                  <td className="py-1.5 text-right">{tested.includes(t.id) ? (s.results[t.id].ok ? '✅ Yes' : '❌ No') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-sm font-semibold">Is {s.name.toLowerCase()} a metal or a non-metal?</p>
          <div className="grid grid-cols-2 gap-2">
            {[true, false].map((m) => (
              <Button key={String(m)} disabled={tested.length < 4 || sid in answers} variant={answers[sid] === m ? (m === s.metal ? 'default' : 'destructive') : 'outline'} onClick={() => classify(m)}>
                {m ? 'Metal' : 'Non-metal'}
              </Button>
            ))}
          </div>
          {tested.length < 4 && <p className="text-xs text-muted-foreground">Run all four tests first.</p>}
          {sid in answers && (
            <p className="text-sm">
              {answers[sid] === s.metal ? '✅ Correct.' : `❌ It's a ${s.metal ? 'metal' : 'non-metal'}.`} {s.note ?? ''}
            </p>
          )}
          <p className="text-center text-sm">Score: <b>{score}</b> / {SAMPLES.length}</p>
        </div>
      </div>
    </LabFrame>
  )
}
