import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { useState } from 'react'
import { BoardTags, ComplexityStars } from '@/components/board/BoardTags'
import { getSubject } from '@/content/loader'
import { STAGE_LABEL } from '@/content/schema'
import { STATUS_STYLE, topicStatus } from '@/lib/status'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'

export const Route = createFileRoute('/$subject/')({
  loader: ({ params }) => {
    const subject = getSubject(params.subject)
    if (!subject) throw notFound()
    return subject
  },
  component: SubjectPage,
})

function SubjectPage() {
  const subject = Route.useLoaderData()
  const topics = useProgress((s) => s.topics)
  const stages = (['G5', 'G6-8', 'G9', 'G10'] as const).filter((st) => subject.units.some((u) => u.stage === st))
  const [stage, setStageState] = useState(() => {
    try {
      const saved = localStorage.getItem(`adamlearns-stage-${subject.id}`)
      if (saved && stages.includes(saved as (typeof stages)[number])) return saved as (typeof stages)[number]
    } catch { /* storage unavailable */ }
    return stages.includes('G6-8') ? 'G6-8' : stages[0]
  })
  const setStage = (st: (typeof stages)[number]) => {
    setStageState(st)
    try { localStorage.setItem(`adamlearns-stage-${subject.id}`, st) } catch { /* ignore */ }
  }
  const units = subject.units.filter((u) => u.stage === stage)

  return (
    <div className="space-y-8">
      <header>
        <p className="text-5xl">{subject.icon}</p>
        <h1 className="mt-2 font-heading text-4xl font-bold">{subject.title}</h1>
        <p className="mt-1 text-lg text-muted-foreground">{subject.tagline}</p>
        {stages.length > 1 && (
          <div className="mt-4 inline-flex flex-wrap rounded-xl border p-1" role="tablist" aria-label="Choose a grade">
            {stages.map((st) => {
              const all = subject.units.filter((u) => u.stage === st).flatMap((u) => u.topics)
              const done = all.filter((tp) => topics[tp.key]?.masteredAt).length
              return (
                <button key={st} type="button" role="tab" aria-selected={stage === st} onClick={() => setStage(st)} className={cn('rounded-lg px-3 py-1.5 text-sm font-semibold', stage === st ? 'bg-chem text-white' : 'text-muted-foreground hover:bg-muted')}>
                  {STAGE_LABEL[st]} <span className="font-normal opacity-80">· {done}/{all.length}</span>
                </button>
              )
            })}
          </div>
        )}
      </header>

      <ol className="relative space-y-6 border-l-4 border-dashed border-chem/30 pl-6">
        {units.map((unit) => {
          const done = unit.topics.filter((t) => topics[t.key]?.masteredAt).length
          return (
            <li key={unit.id} className="relative">
              <span className="absolute top-4 -left-[42px] grid size-8 place-items-center rounded-full bg-chem font-heading font-bold text-white">{unit.number}</span>
              <div className="rounded-3xl border-2 bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Unit {unit.number}</p>
                    <Link to="/$subject/$unit" params={{ subject: subject.id, unit: unit.id }} className="font-heading text-2xl font-semibold hover:underline">
                      {unit.title}
                    </Link>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{unit.summary}</p>
                    <p className="mt-2 text-xs">
                      <span className="rounded-full bg-ib-soft px-2 py-0.5 font-semibold text-ib">Key concept: {unit.ib.keyConcept}</span>{' '}
                      <span className="rounded-full bg-muted px-2 py-0.5">{unit.ib.globalContext}</span>
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-heading text-2xl font-bold">
                      {done}/{unit.topics.length}
                    </p>
                    <p className="text-muted-foreground">mastered</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {unit.topics.map((t) => {
                    const st = topicStatus(topics[t.key])
                    return (
                      <Link
                        key={t.key}
                        to="/$subject/$unit/$topic"
                        params={{ subject: subject.id, unit: unit.id, topic: t.id }}
                        className="flex items-start gap-3 rounded-2xl border bg-background p-3 transition hover:border-chem hover:shadow-sm"
                      >
                        <span className="text-3xl">{t.emoji}</span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{t.number}</span>
                            <span className="font-heading font-semibold">{t.title}</span>
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-2">
                            <ComplexityStars value={t.complexity} />
                            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', STATUS_STYLE[st].cls)}>{STATUS_STYLE[st].label}</span>
                            {!t.core && <span className="rounded-full border px-2 py-0.5 text-[11px]">Extension</span>}
                          </span>
                          <BoardTags topic={t} compact className="mt-1.5" />
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </li>
          )
        })}
        {subject.comingNext && stage === stages[stages.length - 1] && (
          <li className="relative">
            <span className="absolute top-3 -left-[42px] grid size-8 place-items-center rounded-full bg-muted font-heading font-bold text-muted-foreground">+</span>
            <div className="rounded-3xl border-2 border-dashed p-5 text-muted-foreground">
              <p className="font-heading text-lg font-semibold">Coming next</p>
              <p className="text-sm">{subject.comingNext}</p>
            </div>
          </li>
        )}
      </ol>
    </div>
  )
}
