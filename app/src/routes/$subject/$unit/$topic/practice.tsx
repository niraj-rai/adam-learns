import { Link, createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { BoardTags } from '@/components/board/BoardTags'
import { PracticePlayer } from '@/components/practice/PracticePlayer'
import { getNextTopic, getPractice, getTopic, getUnit } from '@/content/loader'
import { useProgress } from '@/stores/progress'

export const Route = createFileRoute('/$subject/$unit/$topic/practice')({
  loader: ({ params }) => {
    const topic = getTopic(params.subject, params.unit, params.topic)
    const practice = topic && getPractice(topic.key)
    const unit = getUnit(params.subject, params.unit)
    if (!topic || !practice || !unit) throw notFound()
    return { topic, practice, unit }
  },
  component: PracticePage,
})

function PracticePage() {
  const { topic, practice, unit } = Route.useLoaderData()
  const navigate = useNavigate()
  const recordPractice = useProgress((s) => s.recordPractice)
  const addXp = useProgress((s) => s.addXp)
  const awardBadge = useProgress((s) => s.awardBadge)
  const [attempt, setAttempt] = useState(0)
  const next = getNextTopic(topic)

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="text-sm text-muted-foreground">
        <Link to="/$subject/$unit" params={{ subject: topic.subjectId, unit: topic.unitId }} className="hover:underline">
          Unit {unit.number}
        </Link>{' '}
        /{' '}
        <Link to="/$subject/$unit/$topic" params={{ subject: topic.subjectId, unit: topic.unitId, topic: topic.id }} className="hover:underline">
          {topic.title}
        </Link>{' '}
        / Practice
      </nav>
      <header className="mt-2 mb-6">
        <h1 className="font-heading text-3xl font-bold">
          {topic.emoji} Practice: {topic.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {practice.questions.length} questions · Two tries each · Hints after a wrong answer
        </p>
        <BoardTags topic={topic} compact className="mt-2" />
      </header>

      <div className="rounded-3xl border-2 bg-card p-5 sm:p-7">
        <PracticePlayer
          key={attempt}
          questions={practice.questions}
          onFinish={(s) => {
            recordPractice(topic.key, s)
            if (s.xp > 0) addXp(s.xp, `${s.correctIds.length} correct answers`)
            // unit badge: every core topic in Unit 1 mastered
            const unitTopics = unit.topics.filter((t) => t.core)
            const all = useProgress.getState().topics
            if (unit.id === 'matter' && unitTopics.every((t) => all[t.key]?.masteredAt)) awardBadge('unit-matter')
          }}
          onRetry={() => setAttempt((a) => a + 1)}
          finishLabel={next ? `Next: ${next.title}` : 'Back to unit'}
          onFinishAction={() =>
            next
              ? navigate({ to: '/$subject/$unit/$topic', params: { subject: next.subjectId, unit: next.unitId, topic: next.id } })
              : navigate({ to: '/$subject/$unit', params: { subject: topic.subjectId, unit: topic.unitId } })
          }
        />
      </div>
    </div>
  )
}
