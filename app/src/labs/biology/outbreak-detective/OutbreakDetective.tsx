import { useMemo, useState } from 'react'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame } from '../../_kit/LabFrame'
import { cases, countByWell, SOURCE, WELLS } from './model'

const STEPS = [
  { q: 'Patients have severe watery diarrhoea and vomiting. Several have tested positive for Vibrio bacteria. Which disease is it?', options: ['Cholera', 'Malaria', 'Tuberculosis', 'Diabetes'], answer: 'Cholera', why: 'Cholera is caused by Vibrio cholerae bacteria and spreads through contaminated water and food.' },
  { q: 'So how is this disease spreading in the town?', options: ['Through contaminated drinking water', 'Through mosquito bites', 'Through the air when people cough', 'It is inherited'], answer: 'Through contaminated drinking water', why: 'That’s why you need to look at the water sources.' },
  { q: 'MAP', options: [], answer: SOURCE, why: 'Most cases are clustered around well B. A few cases elsewhere are people who visited or worked near it.' },
  { q: 'What should the health team do FIRST?', options: ['Close well B and supply safe water', 'Spray for mosquitoes', 'Give everyone antibiotics without testing', 'Close the schools only'], answer: 'Close well B and supply safe water', why: 'Removing the source stops new cases. In 1854, John Snow did exactly this in London by removing the handle of a pump!' },
  { q: 'Which message should the team give to every family?', options: ['Boil or chlorinate drinking water, and wash hands with soap', 'Stay indoors all day', 'Stop eating vegetables', 'Wear masks'], answer: 'Boil or chlorinate drinking water, and wash hands with soap', why: 'Safe water, sanitation and hygiene prevent diseases spread by water.' },
  { q: 'How do patients with cholera recover best while being treated?', options: ['Oral rehydration solution (ORS) to replace lost water and salts', 'Only rest, no drinking', 'Eating lots of sugar', 'Cold baths'], answer: 'Oral rehydration solution (ORS) to replace lost water and salts', why: 'ORS, a simple mix of water, salt and sugar, has saved millions of lives from diarrhoeal diseases.' },
]

export default function OutbreakDetective() {
  const addXp = useProgress((s) => s.addXp)
  const awardBadge = useProgress((s) => s.awardBadge)
  const pts = useMemo(() => cases(), [])
  const counts = useMemo(() => countByWell(), [])
  const [i, setI] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [picked, setPicked] = useState<string | null>(null)
  const [showCounts, setShowCounts] = useState(false)
  const done = i >= STEPS.length
  const st = STEPS[Math.min(i, STEPS.length - 1)]
  const choose = (o: string) => {
    if (picked) return
    setPicked(o)
    if (o === st.answer) sfx.correct()
    else { sfx.wrong(); setHearts((h) => h - 1) }
  }
  const next = () => {
    const n = i + 1
    setI(n); setPicked(null)
    if (n >= STEPS.length) {
      sfx.win()
      if (!useProgress.getState().badges.includes('disease-detective')) addXp(25 + hearts * 10, 'Disease Detective!')
      awardBadge('disease-detective')
    }
  }
  const restart = () => { setI(0); setHearts(3); setPicked(null); setShowCounts(false) }

  return (
    <LabFrame labId="outbreak-detective" title="Boss Challenge: Outbreak Detective" subtitle="A sudden outbreak has hit a town. Work like an epidemiologist: identify the disease, find the source and stop it." howTo={<p>Answer each step of the investigation. On the map, each red dot is a household with a case and each blue square is a well. A wrong answer costs a ❤️.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(Math.max(0, hearts))}{'🤍'.repeat(3 - Math.max(0, hearts))}</span>
        <span className="text-sm text-muted-foreground">Step {Math.min(i + 1, STEPS.length)} / {STEPS.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🕵️‍♀️</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Outbreak contained! {'⭐'.repeat(Math.max(0, hearts))}</p>
          <Button className="mt-3" variant="outline" onClick={restart}>Investigate again</Button>
        </div>
      ) : hearts <= 0 && !picked ? (
        <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="font-heading text-xl font-semibold">Out of lives. Review how diseases spread and try again!</p>
          <Button className="mt-3" onClick={restart}>Try again</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <svg viewBox="0 0 320 250" className="w-full rounded-2xl border bg-amber-50 dark:bg-stone-900" role="img" aria-label="Town map with cases and wells">
            <path d="M0 140 Q 160 120 320 150" stroke="#cbd5e1" strokeWidth={10} fill="none" />
            <path d="M170 0 V250" stroke="#cbd5e1" strokeWidth={8} />
            {pts.map((p, k) => <circle key={k} cx={p.x} cy={p.y} r={4} fill="#dc2626" opacity={0.8} />)}
            {WELLS.map((w) => (
              <g key={w.id} onClick={() => st.q === 'MAP' && choose(w.id)} className={cn(st.q === 'MAP' && !picked && 'cursor-pointer')}>
                <rect x={w.x - 10} y={w.y - 10} width={20} height={20} rx={4} fill="#2563eb" stroke={picked === w.id ? '#fbbf24' : '#fff'} strokeWidth={2} />
                <text x={w.x} y={w.y + 4} textAnchor="middle" fontSize={11} fill="#fff" fontWeight={700}>{w.id}</text>
                {showCounts && <text x={w.x} y={w.y - 14} textAnchor="middle" fontSize={10} className="fill-foreground">{counts[w.id]} cases</text>}
              </g>
            ))}
          </svg>
          {st.q === 'MAP' ? (
            <div className="space-y-2">
              <p className="rounded-2xl bg-muted/50 p-3 font-semibold">🗺️ Which well is the most likely source? Tap it on the map.</p>
              <Button size="sm" variant="outline" onClick={() => setShowCounts(true)}>📊 Count cases nearest each well</Button>
            </div>
          ) : (
            <>
              <p className="rounded-2xl bg-muted/50 p-3 font-semibold">🔎 {st.q}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {st.options.map((o) => <button key={o} type="button" disabled={Boolean(picked)} onClick={() => choose(o)} className={cn('rounded-xl border-2 bg-background px-3 py-2 text-left text-sm', !picked && 'hover:border-chem', picked && o === st.answer && 'border-success bg-success-soft', picked === o && o !== st.answer && 'border-destructive/60 bg-destructive/10')}>{o}</button>)}
              </div>
            </>
          )}
          {picked && (
            <div role="status" className={cn('rounded-xl p-3 text-sm', picked === st.answer ? 'bg-success-soft' : 'bg-warn-soft')}>
              <p>{picked === st.answer ? '✅ ' : '❌ '}{st.why}</p>
              {hearts > 0 ? <Button className="mt-2" autoFocus onClick={next}>{i + 1 < STEPS.length ? 'Next step →' : 'Finish'}</Button> : <Button className="mt-2" variant="outline" onClick={() => setPicked(null)}>See result</Button>}
            </div>
          )}
        </div>
      )}
    </LabFrame>
  )
}
