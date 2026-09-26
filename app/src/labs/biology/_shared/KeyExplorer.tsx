import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import type { Key, Specimen } from './key'

/** Walk a specimen through a dichotomous key by answering yes/no questions. */
export function KeyExplorer({ keyData, specimens }: { keyData: Key; specimens: Specimen[] }) {
  const [si, setSi] = useState(0)
  const [node, setNode] = useState(keyData.start)
  const [trail, setTrail] = useState<{ id: string; yes: boolean }[]>([])
  const [solved, setSolved] = useState<string[]>([])
  const s = specimens[si]
  const done = !keyData.nodes[node]
  const correct = done && node === s.group
  const pick = (i: number) => { setSi(i); setNode(keyData.start); setTrail([]) }
  const answer = (yes: boolean) => {
    const n = keyData.nodes[node]
    const next = yes ? n.yes : n.no
    setTrail((t) => [...t, { id: node, yes }])
    setNode(next)
    if (!keyData.nodes[next]) {
      if (next === s.group) { sfx.correct(); setSolved((x) => [...new Set([...x, s.name])]) } else sfx.wrong()
    }
  }
  const wrongStep = done && !correct ? trail.find((t) => s.answers[t.id] !== undefined && s.answers[t.id] !== t.yes) : undefined
  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {specimens.map((x, i) => <button key={x.name} type="button" aria-pressed={si === i} onClick={() => pick(i)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', si === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{solved.includes(x.name) ? '✅ ' : ''}{x.emoji} {x.name}</button>)}
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border bg-muted/40 p-4">
          <p className="text-5xl">{s.emoji}</p>
          <p className="mt-1 font-heading text-xl font-semibold">{s.name}</p>
          <p className="mt-1 text-sm">{s.description}</p>
          {trail.length > 0 && (
            <ol className="mt-3 space-y-1 text-xs">
              {trail.map((t, i) => <li key={i} className="rounded-lg bg-background px-2 py-1">{i + 1}. {keyData.nodes[t.id].q} <b>{t.yes ? 'Yes' : 'No'}</b></li>)}
            </ol>
          )}
        </div>
        <div className="rounded-2xl border-2 p-4">
          {!done ? (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Question {trail.length + 1}</p>
              <p className="mt-1 font-heading text-lg">{keyData.nodes[node].q}</p>
              <div className="mt-3 flex gap-2">
                <Button onClick={() => answer(true)}>✔ Yes</Button>
                <Button variant="outline" onClick={() => answer(false)}>✘ No</Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-4xl">{keyData.groups[node].emoji}</p>
              <p className="font-heading text-xl font-semibold">{correct ? '✅ ' : '❌ '}{keyData.groups[node].name}</p>
              <p className="mt-1 text-sm">{keyData.groups[node].about}</p>
              {!correct && <p className="mt-2 rounded-lg bg-warn-soft px-3 py-2 text-sm">Not quite: {s.name} belongs in <b>{keyData.groups[s.group].name}</b>.{wrongStep ? ` Check this question again: “${keyData.nodes[wrongStep.id].q}”` : ''}</p>}
              <Button className="mt-3" variant="outline" onClick={() => pick(si)}>↺ Try again</Button>
            </>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Keyed out correctly: {solved.length} / {specimens.length}</p>
    </div>
  )
}
