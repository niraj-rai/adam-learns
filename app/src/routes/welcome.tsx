import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Logo } from '@/components/layout/Logo'
import { StudyPlanStep } from '@/components/plan/StudyPlan'
import { Button } from '@/components/ui/button'
import { getSubject, getSubjects, getTopicByKey } from '@/content/loader'
import { buildSkillsCheck, effectiveGrade, scoreSkillsCheck, strength, type CheckItem } from '@/lib/learner'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { GRADES, isOnboarded, useProfile, type Grade, type SkillsCheck } from '@/stores/profile'

type Step = 'name' | 'grade' | 'intro' | 'check' | 'results' | 'schedule'
type StartAt = 'check' | 'grade' | 'schedule'

export const Route = createFileRoute('/welcome')({
  validateSearch: (s: Record<string, unknown>): { step?: StartAt } => (s.step === 'check' || s.step === 'grade' || s.step === 'schedule' ? { step: s.step } : {}),
  component: Welcome,
})

const GRADE_INFO: Record<Grade, { ib: string; cbse: string; note?: string }> = {
  5: { ib: 'PYP 5', cbse: 'Class 5', note: 'Starter units are on the way' },
  6: { ib: 'MYP 1', cbse: 'Class 6' },
  7: { ib: 'MYP 2', cbse: 'Class 7' },
  8: { ib: 'MYP 3', cbse: 'Class 8' },
  9: { ib: 'MYP 4', cbse: 'Class 9', note: 'Being added unit by unit' },
  10: { ib: 'MYP 5', cbse: 'Class 10', note: 'Coming after Grade 9' },
}

function Welcome() {
  const profile = useProfile()
  const navigate = useNavigate()
  const { step: startAt } = Route.useSearch()
  const ready = isOnboarded(profile)
  const [step, setStep] = useState<Step>(!ready ? 'name' : startAt === 'check' ? 'intro' : startAt === 'grade' ? 'grade' : startAt === 'schedule' ? 'schedule' : 'name')
  const [startGrade] = useState(profile.grade)
  const hadCheck = useState(() => Boolean(profile.check))[0]
  const [first, setFirst] = useState(profile.firstName)
  const [last, setLast] = useState(profile.lastName)
  const [grade, setGrade] = useState<Grade | null>(profile.grade)
  const [result, setResult] = useState<SkillsCheck | null>(null)
  // the check result waits here while the learner looks at the (optional) study plan step
  const [pending, setPending] = useState<SkillsCheck | null>(null)

  const steps: Step[] = ['name', 'grade', 'intro', 'schedule']
  const dot = steps.indexOf(step === 'check' || step === 'results' ? 'intro' : step)
  const done = (check: SkillsCheck | null) => {
    profile.finish(check)
    navigate({ to: '/' })
  }
  const toPlan = (check: SkillsCheck | null) => {
    setPending(check)
    setStep('schedule')
  }

  return (
    <div className="mx-auto max-w-2xl">
      {step !== 'check' && (
        <div className="mb-6 flex items-center justify-center gap-2" aria-hidden>
          {steps.map((s, i) => <span key={s} className={cn('h-2 rounded-full transition-all', i <= dot ? 'w-8 bg-brand' : 'w-2 bg-muted')} />)}
        </div>
      )}

      {step === 'name' && (
        <form
          className="rounded-3xl border-2 bg-card p-6 shadow-sm sm:p-8"
          onSubmit={(e) => {
            e.preventDefault()
            if (!first.trim()) return
            profile.setName(first, last)
            setStep('grade')
          }}
        >
          <Logo className="size-16 drop-shadow" />
          <h1 className="mt-4 font-heading text-3xl font-bold sm:text-4xl">{ready ? 'Your profile' : 'Welcome to AdamLearns!'}</h1>
          <p className="mt-2 text-muted-foreground">Interactive lessons, labs and practice for Physics, Chemistry, Biology and Maths. First, what should we call you?</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              First name
              <input autoFocus required value={first} onChange={(e) => setFirst(e.target.value)} maxLength={30} autoComplete="given-name" className="mt-1 block w-full rounded-xl border-2 bg-background px-3 py-2 text-base font-normal focus:border-brand focus:outline-none" />
            </label>
            <label className="text-sm font-semibold">
              Last name
              <input value={last} onChange={(e) => setLast(e.target.value)} maxLength={30} autoComplete="family-name" className="mt-1 block w-full rounded-xl border-2 bg-background px-3 py-2 text-base font-normal focus:border-brand focus:outline-none" />
            </label>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">🔒 Your name stays on this device. We never collect or send it anywhere (see the <Link to="/privacy" className="underline">privacy policy</Link>).</p>
          <p className="mt-2 rounded-xl bg-brand-soft px-3 py-2 text-xs">💡 <b>Use the same device and browser each time.</b> Your progress, badges and streak are saved in this browser, so that's how you keep learning where you left off. Switching devices? Use Export and Import on the Progress page.</p>
          <div className="mt-6 flex justify-end">
            <Button type="submit" size="lg" disabled={!first.trim()} className="bg-brand text-white hover:bg-brand/90">
              Next <ArrowRight />
            </Button>
          </div>
        </form>
      )}

      {step === 'grade' && (
        <div className="rounded-3xl border-2 bg-card p-6 shadow-sm sm:p-8">
          <h1 className="font-heading text-3xl font-bold">Hi <HandName name={first.trim()} className="text-4xl" />! {ready ? 'Which grade are you in now?' : 'Which grade are you in?'}</h1>
          <p className="mt-2 text-muted-foreground">
            {ready && startGrade ? <>You're set to <b>Grade {startGrade}</b>. Moved up a class, or picked the wrong one? Choose your grade below. </> : null}
            We'll show your grade's topics first, with warm-ups from earlier grades when you need them.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Your grade">
            {GRADES.map((g) => (
              <button
                key={g}
                type="button"
                role="radio"
                aria-checked={grade === g}
                onClick={() => { setGrade(g); sfx.click() }}
                className={cn('rounded-2xl border-2 p-3 text-left transition', grade === g ? 'border-brand bg-brand-soft' : 'hover:border-brand/50')}
              >
                <span className="block font-heading text-2xl font-bold">Grade {g}</span>
                <span className="block text-xs"><span className="font-semibold text-ib">IB {GRADE_INFO[g].ib}</span> · <span className="font-semibold text-cbse">CBSE {GRADE_INFO[g].cbse}</span></span>
                {GRADE_INFO[g].note && <span className="mt-1 block text-[11px] text-muted-foreground">{GRADE_INFO[g].note}</span>}
              </button>
            ))}
          </div>
          {grade && effectiveGrade(grade) !== grade && (
            <p className="mt-4 rounded-xl bg-warn-soft px-3 py-2 text-sm">Grade {grade} content isn't ready yet, so we'll start you with Grade {effectiveGrade(grade)} topics. Everything else is open to explore too.</p>
          )}
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={() => setStep('name')}><ArrowLeft /> Back</Button>
            <Button size="lg" disabled={!grade} className="bg-brand text-white hover:bg-brand/90" onClick={() => { profile.setGrade(grade!); setStep('intro') }}>
              Next <ArrowRight />
            </Button>
          </div>
        </div>
      )}

      {step === 'intro' && grade && (
        <div className="rounded-3xl border-2 bg-card p-6 shadow-sm sm:p-8">
          <p className="text-5xl">🧭</p>
          <h1 className="mt-3 font-heading text-3xl font-bold">Quick skills check</h1>
          {ready && startGrade && startGrade !== grade && (
            <p className="mt-2 rounded-xl bg-brand-soft px-3 py-2 text-sm">🎓 You've moved from Grade {startGrade} to <b>Grade {grade}</b>.{hadCheck ? ' Your old warm-ups were for Grade ' + startGrade + ', so take the check again to get new ones.' : ''}</p>
          )}
          <p className="mt-2 text-muted-foreground">
            About 12 questions across all four subjects, from the grades before yours. It shows your strengths and picks a few <b>warm-up topics</b> to practise before your Grade {grade} topics, since they build on these basics.
          </p>
          <ul className="mt-4 space-y-1 text-sm">
            <li>⏱️ Takes about 5 minutes</li>
            <li>🤷 Not sure? Press “I don't know yet”: that's useful too</li>
            <li>🚫 No marks, no XP lost: it's just to find your starting point</li>
          </ul>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={() => setStep('grade')}><ArrowLeft /> Back</Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" size="lg" onClick={() => toPlan(null)}>Skip, go to my topics</Button>
              <Button size="lg" className="bg-brand text-white hover:bg-brand/90" onClick={() => setStep('check')}>Start the check <ArrowRight /></Button>
            </div>
          </div>
        </div>
      )}

      {step === 'check' && grade && <SkillsQuiz grade={grade} onFinish={(r) => { setResult(r); setStep('results') }} />}

      {step === 'results' && result && <Results name={first.trim()} grade={grade!} result={result} onDone={() => toPlan(Object.keys(result.results).length ? result : null)} />}

      {step === 'schedule' && (
        <StudyPlanStep
          name={first.trim()}
          initial={profile.schedule}
          onSave={(s) => { profile.setSchedule(s); done(pending) }}
          onSkip={() => done(pending)}
          onRemove={profile.schedule ? () => { profile.setSchedule(null); done(pending) } : undefined}
        />
      )}
    </div>
  )
}

function SkillsQuiz({ grade, onFinish }: { grade: Grade; onFinish: (r: SkillsCheck) => void }) {
  const items = useMemo(() => buildSkillsCheck(grade), [grade])
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [picked, setPicked] = useState<number | null | undefined>(undefined)
  const it: CheckItem | undefined = items[i]
  if (!it) return null
  const subject = getSubject(it.subjectId)
  const topic = getTopicByKey(it.topicKey)
  const revealed = picked !== undefined
  const choose = (c: number | null) => {
    if (revealed) return
    setPicked(c)
    if (c === it.q.answer) sfx.correct()
    else sfx.wrong()
  }
  const next = () => {
    const a = [...answers, picked ?? null]
    setAnswers(a)
    setPicked(undefined)
    if (i + 1 >= items.length) onFinish(scoreSkillsCheck(items, a))
    else setI(i + 1)
  }
  return (
    <div className="rounded-3xl border-2 bg-card p-5 shadow-sm sm:p-7" data-subject={it.subjectId}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold">{subject?.icon} {subject?.title}</span>
        <span className="tabular-nums text-muted-foreground">{i + 1} / {items.length}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(i / items.length) * 100}%` }} />
      </div>
      <p className="mt-5 font-heading text-xl leading-snug font-semibold">{it.q.prompt}</p>
      <div className="mt-4 grid gap-2">
        {it.q.options.map((o, k) => (
          <button
            key={k}
            type="button"
            disabled={revealed}
            onClick={() => choose(k)}
            className={cn(
              'flex items-center justify-between gap-2 rounded-xl border-2 px-4 py-3 text-left transition',
              !revealed && 'hover:border-brand hover:bg-brand-soft',
              revealed && k === it.q.answer && 'border-success bg-success-soft',
              revealed && picked === k && k !== it.q.answer && 'border-destructive bg-destructive/10',
              revealed && picked !== k && k !== it.q.answer && 'opacity-60',
            )}
          >
            <span>{o}</span>
            {revealed && k === it.q.answer && <Check className="size-5 shrink-0 text-success" />}
            {revealed && picked === k && k !== it.q.answer && <X className="size-5 shrink-0 text-destructive" />}
          </button>
        ))}
      </div>
      {revealed && (
        <p className="mt-4 rounded-xl bg-muted/60 px-4 py-3 text-sm">
          {picked === it.q.answer ? '✅ Nice! ' : picked === null ? '👍 No problem. ' : '❌ Not quite. '}
          {it.q.explain} {picked !== it.q.answer && topic && <span className="text-muted-foreground">We'll add “{topic.title}” to your warm-ups.</span>}
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        {revealed ? (
          <>
            <button type="button" onClick={() => onFinish(scoreSkillsCheck(items, [...answers, picked ?? null]))} className="text-sm text-muted-foreground underline-offset-2 hover:underline">Skip the rest</button>
            <Button size="lg" className="bg-brand text-white hover:bg-brand/90" onClick={next}>{i + 1 >= items.length ? 'See my results' : 'Next'} <ArrowRight /></Button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => onFinish(scoreSkillsCheck(items, answers))} className="text-sm text-muted-foreground underline-offset-2 hover:underline">Skip the rest</button>
            <Button variant="outline" onClick={() => choose(null)}>🤷 I don't know yet</Button>
          </>
        )}
      </div>
    </div>
  )
}

function Results({ name, grade, result, onDone }: { name: string; grade: Grade; result: SkillsCheck; onDone: () => void }) {
  const warm = result.warmups.map(getTopicByKey).filter((t) => t !== undefined)
  const answered = Object.values(result.results).reduce((s, r) => s + r.total, 0)
  return (
    <div className="rounded-3xl border-2 bg-card p-6 shadow-sm sm:p-8">
      <p className="text-5xl">🎉</p>
      <h1 className="mt-3 font-heading text-3xl font-bold">Well done, <HandName name={name} className="text-4xl" />!</h1>
      <p className="mt-2 text-muted-foreground">{answered ? 'Here is your starting point.' : 'You skipped the questions, so there are no warm-ups yet. You can take the check any time from the Progress page.'}</p>
      {answered > 0 && (
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {getSubjects().filter((s) => result.results[s.id]).map((s) => {
            const r = result.results[s.id]
            const st = strength(r)
            return (
              <div key={s.id} className="flex items-center justify-between gap-2 rounded-2xl border p-3">
                <span className="font-semibold">{s.icon} {s.title} <span className="font-normal text-muted-foreground tabular-nums">{r.correct}/{r.total}</span></span>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', st.cls)}>{st.emoji} {st.label}</span>
              </div>
            )
          })}
        </div>
      )}
      {warm.length > 0 && (
        <div className="mt-5">
          <p className="font-heading text-lg font-semibold">🔧 Your warm-ups ({warm.length})</p>
          <p className="text-sm text-muted-foreground">Practise these first: your Grade {grade} topics build on them. They'll be at the top of your home page.</p>
          <ul className="mt-2 space-y-1 text-sm">
            {warm.map((t) => <li key={t.key} className="rounded-xl bg-muted/50 px-3 py-2">{getSubject(t.subjectId)?.icon} {t.emoji} {t.title}</li>)}
          </ul>
        </div>
      )}
      <p className="mt-5 rounded-xl bg-brand-soft px-4 py-3 text-sm">💡 Come back on <b>this same device and browser</b> to keep your progress, streak and warm-ups. Moving to another device? Export your progress from the Progress page and import it there.</p>
      {answered > 0 && !warm.length && <p className="mt-5 rounded-xl bg-success-soft px-4 py-3 text-sm">💪 No warm-ups needed: you're ready for your Grade {grade} topics!</p>}
      <div className="mt-6 flex justify-end">
        <Button size="lg" className="bg-brand text-white hover:bg-brand/90" onClick={onDone}>Let's go! <ArrowRight /></Button>
      </div>
    </div>
  )
}

/** The learner's name in handwriting; punctuation after it stays in the normal font, with a little space. */
function HandName({ name, className }: { name: string; className?: string }) {
  return <span className={cn('mr-2 font-hand font-bold text-brand', className)}>{name}</span>
}
