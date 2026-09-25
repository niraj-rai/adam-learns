import { Link, createFileRoute } from '@tanstack/react-router'
import { getTopicByKey } from '@/content/loader'
import { LABS } from '@/labs/registry'
import { useProgress } from '@/stores/progress'

export const Route = createFileRoute('/labs/')({ component: LabsPage })

function LabsPage() {
  const tried = useProgress((s) => s.labsTried)
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-4xl font-bold">🧪 Lab Sandbox</h1>
        <p className="mt-1 text-muted-foreground">Free play: every interactive lab in one place. Explore, experiment, break things (safely)!</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LABS.map((l) => (
          <Link key={l.id} to="/labs/$labId" params={{ labId: l.id }} className="group rounded-2xl border-2 bg-card p-5 transition hover:-translate-y-0.5 hover:border-chem hover:shadow-md">
            <div className="flex items-start justify-between">
              <span className="text-5xl">{l.emoji}</span>
              {tried.includes(l.id) && <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">Explored</span>}
            </div>
            <p className="mt-3 font-heading text-xl font-semibold">{l.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{l.description}</p>
            <p className="mt-3 text-xs text-muted-foreground">Used in: {l.topics.map((k) => getTopicByKey(k)?.title).filter(Boolean).join(', ')}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
