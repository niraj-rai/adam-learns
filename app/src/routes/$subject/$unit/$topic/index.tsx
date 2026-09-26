import { Link, createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import { Suspense, lazy, useEffect, useMemo } from 'react'
import { BoardTags, ComplexityStars } from '@/components/board/BoardTags'
import { lessonComponents } from '@/components/lesson'
import { Button } from '@/components/ui/button'
import { getNextTopic, getPrevTopic, getSubject, getTopic, getTopicByKey, getUnit } from '@/content/loader'
import { getLab } from '@/labs/registry'
import { missingPrereqs } from '@/lib/status'
import { useProgress } from '@/stores/progress'
import { useSettings } from '@/stores/settings'

export const Route = createFileRoute('/$subject/$unit/$topic/')({
  loader: ({ params }) => {
    const topic = getTopic(params.subject, params.unit, params.topic)
    const unit = getUnit(params.subject, params.unit)
    if (!topic || !unit) throw notFound()
    return { topic, unit }
  },
  component: LessonPage,
})

function LessonPage() {
  const { topic, unit } = Route.useLoaderData()
  const navigate = useNavigate()
  const progress = useProgress((s) => s.topics[topic.key])
  const allProgress = useProgress((s) => s.topics)
  const completeLesson = useProgress((s) => s.completeLesson)
  const markActive = useProgress((s) => s.markActive)
  const boardView = useSettings((s) => s.boardView)
  const next = getNextTopic(topic)
  const prev = getPrevTopic(topic)
  const missing = missingPrereqs(topic, allProgress)

  const Lesson = useMemo(() => (topic.loadLesson ? lazy(topic.loadLesson) : null), [topic])

  useEffect(() => {
    markActive()
    window.scrollTo(0, 0)
  }, [topic.key, markActive])

  const finish = () => {
    completeLesson(topic.key)
    if (topic.hasPractice) navigate({ to: '/$subject/$unit/$topic/practice', params: { subject: topic.subjectId, unit: topic.unitId, topic: topic.id } })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <article className="min-w-0">
        <nav className="text-sm text-muted-foreground">
          <Link to="/$subject" params={{ subject: topic.subjectId }} className="hover:underline">
            {getSubject(topic.subjectId)?.title}
          </Link>{' '}
          /{' '}
          <Link to="/$subject/$unit" params={{ subject: topic.subjectId, unit: topic.unitId }} className="hover:underline">
            Unit {unit.number}: {unit.title}
          </Link>
        </nav>

        <header className="mt-3">
          <div className="flex items-start gap-4">
            <span className="text-5xl sm:text-6xl">{topic.emoji}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-muted-foreground">Topic {topic.number}</p>
              <h1 className="font-heading text-3xl leading-tight font-bold break-words hyphens-auto sm:text-4xl">{topic.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <ComplexityStars value={topic.complexity} />
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" /> ~{topic.estMinutes} min
                </span>
                {progress?.lessonDone && (
                  <span className="inline-flex items-center gap-1 text-success">
                    <CheckCircle2 className="size-3.5" /> Lesson done
                  </span>
                )}
              </div>
              <BoardTags topic={topic} className="mt-2" />
            </div>
          </div>
        </header>

        {missing.length > 0 && (
          <div className="mt-5 rounded-xl border border-warn/50 bg-warn-soft px-4 py-3 text-sm">
            💡 This topic builds on{' '}
            {missing.map((k, i) => {
              const t = getTopicByKey(k)!
              return (
                <span key={k}>
                  {i > 0 && ', '}
                  <Link to="/$subject/$unit/$topic" params={{ subject: t.subjectId, unit: t.unitId, topic: t.id }} className="font-semibold underline">
                    {t.title}
                  </Link>
                </span>
              )
            })}
            . You can carry on, but it may help to do that first.
          </div>
        )}

        <div className="mt-6 rounded-2xl border bg-card p-5">
          <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">🎯 By the end you can…</p>
          <ul className="mt-2 space-y-1.5">
            {topic.objectives.map((o) => (
              <li key={o} className="flex gap-2 text-[15px]">
                <span className="text-chem">✓</span> {o}
              </li>
            ))}
          </ul>
        </div>

        <div className="prose prose-neutral mt-6 max-w-none dark:prose-invert prose-headings:font-heading prose-p:text-[16.5px] prose-p:leading-relaxed prose-li:text-[16px]">
          {Lesson ? (
            <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
              <Lesson components={lessonComponents} />
            </Suspense>
          ) : (
            <p>This lesson is being written. Check back soon!</p>
          )}
        </div>

        <div className="mt-10 rounded-3xl border-2 border-chem/40 bg-chem-soft p-6 text-center">
          <p className="text-4xl">🏁</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Finished the lesson?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {topic.hasPractice ? 'Now practise. Score 80% or more to master this topic.' : 'Mark it done and move on.'}
          </p>
          <Button size="lg" className="mt-4" onClick={finish}>
            {topic.hasPractice ? 'Start practice' : 'Mark as done'} <ArrowRight />
          </Button>
        </div>

        <div className="mt-6 flex justify-between gap-3">
          {prev ? (
            <Button asChild variant="ghost" className="min-w-0 max-w-[48%]">
              <Link to="/$subject/$unit/$topic" params={{ subject: prev.subjectId, unit: prev.unitId, topic: prev.id }}>
                <ArrowLeft /> <span className="truncate">{prev.title}</span>
              </Link>
            </Button>
          ) : (
            <span />
          )}
          {next && (
            <Button asChild variant="ghost" className="min-w-0 max-w-[48%]">
              <Link to="/$subject/$unit/$topic" params={{ subject: next.subjectId, unit: next.unitId, topic: next.id }}>
                <span className="truncate">{next.title}</span> <ArrowRight />
              </Link>
            </Button>
          )}
        </div>
      </article>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <SideCard title="🎓 IB connection">
          <p>
            <b>Key concept:</b> {unit.ib.keyConcept}
          </p>
          <p>
            <b>Criteria practised:</b> {topic.ibCriteria.join(', ')}
          </p>
          <p className="text-muted-foreground">
            {topic.grades.ib.programme} Year {topic.grades.ib.year}
            {topic.grades.ib.note ? `: ${topic.grades.ib.note}` : ''}
          </p>
        </SideCard>
        {boardView === 'ib+cbse' && (
          <SideCard title="📘 CBSE / NCERT">
            {topic.grades.cbse.map((c) => (
              <p key={`${c.class}${c.chapter}`}>
                <b>Class {c.class}</b>
                {c.chapter ? `: ${c.chapter}` : ''}
                {!c.verified && <span className="text-muted-foreground"> (chapter to verify)</span>}
              </p>
            ))}
          </SideCard>
        )}
        {topic.keyTerms.length > 0 && (
          <SideCard title="🔤 Key terms">
            <div className="flex flex-wrap gap-1.5">
              {topic.keyTerms.map((k) => (
                <span key={k} className="rounded-full border bg-background px-2 py-0.5 text-xs">
                  {k}
                </span>
              ))}
            </div>
          </SideCard>
        )}
        {topic.labs.length > 0 && (
          <SideCard title="🧪 Labs in this topic">
            {topic.labs.map((id) => {
              const lab = getLab(id)
              return lab ? (
                <Link key={id} to="/labs/$labId" params={{ labId: id }} className="block hover:underline">
                  {lab.emoji} {lab.title}
                </Link>
              ) : null
            })}
          </SideCard>
        )}
        {topic.hasPractice && (
          <Button asChild variant="outline" className="w-full">
            <Link to="/$subject/$unit/$topic/practice" params={{ subject: topic.subjectId, unit: topic.unitId, topic: topic.id }}>
              Go to practice{progress?.bestScore ? ` (best ${Math.round(progress.bestScore * 100)}%)` : ''}
            </Link>
          </Button>
        )}
      </aside>
    </div>
  )
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-4 text-sm">
      <p className="mb-2 font-heading font-semibold">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}
