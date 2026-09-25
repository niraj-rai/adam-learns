import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ComplexityStars } from '@/components/board/BoardTags'
import { getAllTopics } from '@/content/loader'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/curriculum')({ component: CurriculumPage })

/** Planned chemistry units (from docs/curriculum/chemistry.md) not yet built. */
const PLANNED = [
  { unit: '3. Physical & Chemical Changes', ib: 'MYP 1–3', cbse: '7, 8, 9' },
  { unit: '4. Acids, Bases & Salts', ib: 'MYP 1–3', cbse: '7, 10' },
  { unit: '5. Metals, Non-metals & Materials', ib: 'MYP 2–3', cbse: '8, 10' },
  { unit: '6. Atoms & the Periodic Table', ib: 'MYP 3', cbse: '9, 10' },
  { unit: '7–16. Grades 9–10 (atomic structure → carbon compounds)', ib: 'MYP 4–5', cbse: '9–10' },
]

function CurriculumPage() {
  const [view, setView] = useState<'ib' | 'cbse'>('ib')
  const topics = getAllTopics().sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))

  const groups =
    view === 'ib'
      ? [...new Set(topics.map((t) => `${t.grades.ib.programme} ${t.grades.ib.year}`))].sort().map((g) => ({
          label: `IB ${g} (Grade ${t2g(g)})`,
          items: topics.filter((t) => `${t.grades.ib.programme} ${t.grades.ib.year}` === g),
        }))
      : [...new Set(topics.flatMap((t) => t.grades.cbse.map((c) => c.class)))]
          .sort((a, b) => a - b)
          .map((cls) => ({ label: `CBSE Class ${cls}`, items: topics.filter((t) => t.grades.cbse.some((c) => c.class === cls)) }))

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-4xl font-bold">🗺️ Curriculum Map</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          AdamLearns follows the <b className="text-ib">IB MYP</b> approach first (concepts, inquiry, criteria A–D), and every topic is mapped to{' '}
          <b className="text-cbse">CBSE/NCERT</b> so nothing is missed.
        </p>
      </header>

      <div className="inline-flex rounded-xl border p-1">
        {(['ib', 'cbse'] as const).map((v) => (
          <button key={v} type="button" onClick={() => setView(v)} className={cn('rounded-lg px-4 py-1.5 text-sm font-semibold', view === v ? (v === 'ib' ? 'bg-ib text-white' : 'bg-cbse text-white') : 'hover:bg-muted')}>
            By {v === 'ib' ? 'IB MYP year' : 'CBSE class'}
          </button>
        ))}
      </div>

      {groups.map((g) => (
        <section key={g.label}>
          <h2 className="font-heading text-xl font-semibold">{g.label}</h2>
          <div className="mt-2 overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full min-w-[640px] text-sm">
              <tbody>
                {g.items.map((t) => (
                  <tr key={t.key} className="border-t first:border-t-0">
                    <td className="w-16 px-4 py-2 text-muted-foreground">{t.number}</td>
                    <td className="px-4 py-2">
                      <Link to="/$subject/$unit/$topic" params={{ subject: t.subjectId, unit: t.unitId, topic: t.id }} className="font-semibold hover:underline">
                        {t.emoji} {t.title}
                      </Link>
                    </td>
                    <td className="px-4 py-2">
                      <ComplexityStars value={t.complexity} />
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {view === 'ib'
                        ? t.grades.cbse.map((c) => `CBSE ${c.class}${c.chapter ? `: ${c.chapter}` : ''}`).join(' · ')
                        : `IB ${t.grades.ib.programme} ${t.grades.ib.year} · Criteria ${t.ibCriteria.join(', ')}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section>
        <h2 className="font-heading text-xl font-semibold">Coming next in Chemistry</h2>
        <ul className="mt-2 space-y-1.5 text-sm">
          {PLANNED.map((p) => (
            <li key={p.unit} className="rounded-xl border border-dashed px-4 py-2">
              <b>{p.unit}</b> <span className="text-ib">· IB {p.ib}</span> <span className="text-cbse">· CBSE {p.cbse}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function t2g(g: string) {
  const [prog, year] = g.split(' ')
  const n = Number(year)
  return prog === 'MYP' ? n + 5 : prog === 'DP' ? n + 10 : n
}
