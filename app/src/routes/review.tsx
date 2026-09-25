import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { QuestionView } from '@/components/practice/QuestionView'
import { getPractice, getTopicByKey } from '@/content/loader'
import { dueReviewItems, useProgress } from '@/stores/progress'

export const Route = createFileRoute('/review')({ component: ReviewPage })

function ReviewPage() {
  const review = useProgress((s) => s.review)
  const recordReview = useProgress((s) => s.recordReview)
  // freeze the queue when the page opens so answering doesn't reshuffle it
  const [queue] = useState(() => dueReviewItems(useProgress.getState().review).slice(0, 10))
  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(0)

  const upcoming = useMemo(() => Object.values(review).filter((r) => !queue.some((q) => q.key === `${r.topicKey}#${r.questionId}`)).length, [review, queue])
  const item = queue[index]
  const question = item && getPractice(item.topicKey)?.questions.find((q) => q.id === item.questionId)
  const topic = item && getTopicByKey(item.topicKey)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-heading text-4xl font-bold">🔁 Review</h1>
        <p className="mt-1 text-muted-foreground">
          Questions you missed come back after 1, 3, 7, 14 and 30 days. Get one right and it waits longer; miss it and it comes back tomorrow. This spacing
          helps you remember for the long run.
        </p>
      </header>

      {queue.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed p-10 text-center">
          <p className="text-5xl">🌈</p>
          <p className="mt-3 font-heading text-2xl font-semibold">Nothing to review today!</p>
          <p className="mt-1 text-muted-foreground">
            {upcoming > 0 ? `${upcoming} question(s) are scheduled for later.` : 'Missed practice questions will show up here.'}
          </p>
          <Button asChild className="mt-5">
            <Link to="/">Back home</Link>
          </Button>
        </div>
      ) : index >= queue.length ? (
        <div className="rounded-3xl border-2 bg-card p-10 text-center">
          <p className="text-5xl">✨</p>
          <p className="mt-3 font-heading text-2xl font-semibold">
            Review done: {correct}/{queue.length} correct
          </p>
          <Button asChild className="mt-5">
            <Link to="/">Back home</Link>
          </Button>
        </div>
      ) : question && topic ? (
        <div className="rounded-3xl border-2 bg-card p-6">
          <p className="mb-3 text-sm text-muted-foreground">
            {index + 1} / {queue.length} · from <b>{topic.title}</b>
          </p>
          <QuestionView
            key={item.key}
            q={question}
            onDone={(r) => {
              recordReview(item.key, r.correct)
              if (r.correct) setCorrect((c) => c + 1)
              setIndex((i) => i + 1)
            }}
          />
        </div>
      ) : (
        <Button onClick={() => setIndex((i) => i + 1)}>Skip missing question</Button>
      )}
    </div>
  )
}
