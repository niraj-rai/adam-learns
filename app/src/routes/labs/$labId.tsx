import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { Lab } from '@/components/lesson'
import { getTopicByKey } from '@/content/loader'
import { getLab } from '@/labs/registry'

export const Route = createFileRoute('/labs/$labId')({
  loader: ({ params }) => {
    const lab = getLab(params.labId)
    if (!lab) throw notFound()
    return { id: lab.id, title: lab.title, topics: lab.topics }
  },
  component: LabPage,
})

function LabPage() {
  const lab = Route.useLoaderData()
  return (
    <div className="mx-auto max-w-4xl">
      <nav className="text-sm text-muted-foreground">
        <Link to="/labs" className="hover:underline">
          Labs
        </Link>{' '}
        / {lab.title}
      </nav>
      <Lab id={lab.id} />
      <div className="rounded-2xl border bg-card p-4 text-sm">
        <p className="font-semibold">📚 Learn the ideas behind this lab</p>
        <ul className="mt-2 space-y-1">
          {lab.topics.map((k) => {
            const t = getTopicByKey(k)
            return t ? (
              <li key={k}>
                <Link to="/$subject/$unit/$topic" params={{ subject: t.subjectId, unit: t.unitId, topic: t.id }} className="text-chem hover:underline">
                  {t.emoji} {t.number} {t.title}
                </Link>
              </li>
            ) : null
          })}
        </ul>
      </div>
    </div>
  )
}
