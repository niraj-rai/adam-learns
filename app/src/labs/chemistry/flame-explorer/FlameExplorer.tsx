import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

type Zone = 'outer' | 'middle' | 'inner'
const ZONES: Record<Zone, { name: string; colour: string; heat: string; burning: string; fact: string }> = {
  outer: {
    name: 'Outermost zone (non-luminous)',
    colour: 'Pale blue, hard to see',
    heat: '🔥🔥🔥 Hottest part',
    burning: 'COMPLETE combustion: plenty of oxygen from the air around it',
    fact: 'Goldsmiths blow through a metal pipe onto the outermost zone of a flame to melt gold and silver.',
  },
  middle: {
    name: 'Middle zone (luminous)',
    colour: 'Bright yellow, gives the most light',
    heat: '🔥🔥 Moderately hot',
    burning: 'PARTIAL combustion: not enough oxygen, so tiny glowing particles of unburnt carbon give the yellow light',
    fact: 'Hold a glass plate here and it gets a black coating of soot (carbon).',
  },
  inner: {
    name: 'Innermost zone (dark)',
    colour: 'Dark, around the wick',
    heat: '🔥 Least hot',
    burning: 'NO combustion: this is unburnt wax vapour',
    fact: 'Put one end of a thin glass tube here and you can light the wax vapour at the other end!',
  },
}

export default function FlameExplorer() {
  const [zone, setZone] = useState<Zone | null>(null)
  const [quiz, setQuiz] = useState<{ q: Zone; picked?: Zone } | null>(null)
  const [score, setScore] = useState(0)

  const pick = (z: Zone) => {
    if (quiz && !quiz.picked) {
      setQuiz({ ...quiz, picked: z })
      if (z === quiz.q) {
        setScore((s) => s + 1)
        sfx.correct()
      } else sfx.wrong()
    }
    setZone(z)
  }

  const QUESTIONS: { q: Zone; text: string }[] = [
    { q: 'outer', text: 'Tap the HOTTEST zone.' },
    { q: 'middle', text: 'Where would soot collect on a glass plate?' },
    { q: 'inner', text: 'Which zone contains unburnt wax vapour?' },
    { q: 'outer', text: 'Which zone has complete combustion?' },
    { q: 'middle', text: 'Which zone gives out the most light?' },
  ]
  const [qi, setQi] = useState(0)

  return (
    <LabFrame labId="flame-explorer" title="Flame Explorer" subtitle="A candle flame has three zones. Tap each one to explore it." howTo={<p>Tap the zones of the flame to learn about them, then try the zone quiz.</p>}>
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <svg viewBox="0 0 160 280" className="mx-auto w-full max-w-[200px]" role="img" aria-label="Candle flame with three zones">
          <rect x={58} y={200} width={44} height={75} rx={4} fill="#fef3c7" stroke="#d6d3d1" />
          <line x1={80} y1={200} x2={80} y2={185} stroke="#1f2937" strokeWidth={2.5} />
          <motion.g animate={{ scaleY: [1, 1.04, 0.98, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} style={{ originX: '80px', originY: '195px' }}>
            <path d="M80 20 C40 90 42 170 80 196 C118 170 120 90 80 20 Z" fill="#93c5fd" fillOpacity={0.35} stroke={zone === 'outer' ? '#1d4ed8' : '#93c5fd'} strokeWidth={zone === 'outer' ? 3 : 1.5} onClick={() => pick('outer')} className="cursor-pointer" role="button" aria-label="Outermost zone" />
            <path d="M80 45 C52 105 54 165 80 185 C106 165 108 105 80 45 Z" fill="#fde047" stroke={zone === 'middle' ? '#a16207' : 'none'} strokeWidth={3} onClick={() => pick('middle')} className="cursor-pointer" role="button" aria-label="Middle zone" />
            <path d="M80 120 C68 145 68 170 80 184 C92 170 92 145 80 120 Z" fill="#1f2937" stroke={zone === 'inner' ? '#f97316' : 'none'} strokeWidth={3} onClick={() => pick('inner')} className="cursor-pointer" role="button" aria-label="Innermost zone" />
          </motion.g>
        </svg>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ZONES) as Zone[]).map((z) => (
              <Button key={z} variant={zone === z ? 'default' : 'outline'} size="sm" onClick={() => pick(z)}>
                {ZONES[z].name.split(' (')[0]}
              </Button>
            ))}
          </div>
          {zone ? (
            <motion.div key={zone} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-chem-soft p-4 text-sm">
              <p className="font-heading text-lg font-semibold">{ZONES[zone].name}</p>
              <ul className="mt-1 space-y-1">
                <li><b>Colour:</b> {ZONES[zone].colour}</li>
                <li><b>Temperature:</b> {ZONES[zone].heat}</li>
                <li><b>What is happening:</b> {ZONES[zone].burning}</li>
                <li>💡 {ZONES[zone].fact}</li>
              </ul>
            </motion.div>
          ) : (
            <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">👆 Tap a zone of the flame.</p>
          )}

          <div className="rounded-xl border p-4">
            <p className="font-semibold">Zone quiz · Score {score}/{QUESTIONS.length}</p>
            {qi < QUESTIONS.length ? (
              <>
                <p className="mt-1 text-sm">{QUESTIONS[qi].text}</p>
                {!quiz ? (
                  <Button className="mt-2" size="sm" onClick={() => setQuiz({ q: QUESTIONS[qi].q })}>
                    {qi === 0 ? 'Start quiz' : 'Ready'}
                  </Button>
                ) : quiz.picked ? (
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <span className={cn(quiz.picked === quiz.q ? 'text-success' : 'text-destructive')}>{quiz.picked === quiz.q ? '✅ Correct' : `❌ It's the ${ZONES[quiz.q].name.split(' (')[0].toLowerCase()}`}</span>
                    <Button size="sm" variant="outline" onClick={() => { setQuiz(null); setQi((i) => i + 1) }}>
                      Next
                    </Button>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">Tap your answer on the flame.</p>
                )}
              </>
            ) : (
              <p className="mt-1 text-sm">🎉 Quiz complete! {score === QUESTIONS.length ? 'Flame master!' : 'Tap the zones again to review.'}</p>
            )}
          </div>
        </div>
      </div>
    </LabFrame>
  )
}
