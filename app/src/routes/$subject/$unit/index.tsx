import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { BoardTags, ComplexityStars } from '@/components/board/BoardTags'
import { Button } from '@/components/ui/button'
import { getUnit } from '@/content/loader'
import { STATUS_STYLE, topicStatus } from '@/lib/status'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { useSettings } from '@/stores/settings'

export const Route = createFileRoute('/$subject/$unit/')({
  loader: ({ params }) => {
    const unit = getUnit(params.subject, params.unit)
    if (!unit) throw notFound()
    return unit
  },
  component: UnitPage,
})

function UnitPage() {
  const unit = Route.useLoaderData()
  const topics = useProgress((s) => s.topics)
  const boardView = useSettings((s) => s.boardView)
  const first = unit.topics.find((t) => !topics[t.key]?.masteredAt) ?? unit.topics[0]

  return (
    <div className="space-y-8">
      <nav className="text-sm text-muted-foreground">
        <Link to="/$subject" params={{ subject: unit.subjectId }} className="hover:underline">
          Chemistry
        </Link>{' '}
        / Unit {unit.number}
      </nav>

      <header className="rounded-3xl border-2 bg-card p-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Unit {unit.number}</p>
        <h1 className="font-heading text-4xl font-bold">{unit.title}</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">{unit.summary}</p>
        {first && (
          <Button asChild size="lg" className="mt-4">
            <Link to="/$subject/$unit/$topic" params={{ subject: unit.subjectId, unit: unit.id, topic: first.id }}>
              {topics[first.key] ? 'Continue' : 'Start'}: {first.title} →
            </Link>
          </Button>
        )}
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border-2 border-ib/40 bg-ib-soft p-5">
          <p className="text-xs font-bold tracking-wide text-ib uppercase">🎓 IB MYP unit framework</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="font-semibold">Key concept</dt>
              <dd>{unit.ib.keyConcept}</dd>
            </div>
            <div>
              <dt className="font-semibold">Related concepts</dt>
              <dd>{unit.ib.relatedConcepts.join(' · ')}</dd>
            </div>
            <div>
              <dt className="font-semibold">Global context</dt>
              <dd>{unit.ib.globalContext}</dd>
            </div>
            {unit.ib.statementOfInquiry && (
              <div>
                <dt className="font-semibold">Statement of inquiry</dt>
                <dd className="font-heading text-base italic">“{unit.ib.statementOfInquiry}”</dd>
              </div>
            )}
          </dl>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">❓ Inquiry questions</p>
          {(['factual', 'conceptual', 'debatable'] as const).map((k) => (
            <div key={k} className="mt-2">
              <p className="text-sm font-semibold capitalize">{k}</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {unit.inquiryQuestions[k].map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {boardView === 'ib+cbse' && (
        <section className="rounded-2xl border border-cbse/40 bg-cbse-soft p-5">
          <p className="text-xs font-bold tracking-wide text-cbse uppercase">📘 CBSE / NCERT mapping</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {unit.cbseChapters.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-heading text-2xl font-semibold">Topics</h2>
        <div className="mt-3 space-y-2">
          {unit.topics.map((t) => {
            const st = topicStatus(topics[t.key])
            const best = topics[t.key]?.bestScore
            return (
              <Link
                key={t.key}
                to="/$subject/$unit/$topic"
                params={{ subject: unit.subjectId, unit: unit.id, topic: t.id }}
                className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-4 transition hover:border-chem"
              >
                <span className="text-3xl">{t.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="font-heading text-lg font-semibold">
                    {t.number} {t.title}
                  </span>
                  <span className="block text-sm text-muted-foreground">{t.summary}</span>
                  <BoardTags topic={t} className="mt-1.5" />
                </span>
                <span className="flex flex-col items-end gap-1 text-xs">
                  <ComplexityStars value={t.complexity} />
                  <span className="text-muted-foreground">~{t.estMinutes} min</span>
                  <span className={cn('rounded-full px-2 py-0.5 font-semibold', STATUS_STYLE[st].cls)}>
                    {STATUS_STYLE[st].label}
                    {best ? ` · best ${Math.round(best * 100)}%` : ''}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
