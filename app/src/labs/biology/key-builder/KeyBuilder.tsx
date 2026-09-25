import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame } from '../../_kit/LabFrame'
import { ORGANISMS, QUESTIONS, split } from './model'

type Node = { group: string[]; q?: string; yes?: Node; no?: Node }
const emoji = (id: string) => ORGANISMS.find((o) => o.id === id)!.emoji
const name = (id: string) => ORGANISMS.find((o) => o.id === id)!.name

/** Find the first group in the tree that still has more than one organism. */
function firstOpen(n: Node, path: ('yes' | 'no')[] = []): ('yes' | 'no')[] | null {
  if (!n.q) return n.group.length > 1 ? path : null
  return firstOpen(n.yes!, [...path, 'yes']) ?? firstOpen(n.no!, [...path, 'no'])
}
function at(n: Node, path: ('yes' | 'no')[]): Node { return path.reduce((x, p) => x[p]!, n) }
function withSplit(n: Node, path: ('yes' | 'no')[], q: string): Node {
  if (!path.length) { const s = split(n.group, q); return { group: n.group, q, yes: { group: s.yes }, no: { group: s.no } } }
  const [h, ...rest] = path
  return { ...n, [h]: withSplit(n[h]!, rest, q) }
}

function Tree({ n, depth = 0 }: { n: Node; depth?: number }) {
  if (!n.q) return <div className={cn('inline-flex flex-wrap gap-1 rounded-lg border px-2 py-1 text-sm', n.group.length === 1 && 'border-success bg-success-soft')}>{n.group.map((id) => <span key={id} title={name(id)}>{emoji(id)}</span>)}{n.group.length === 1 && <span className="ml-1 text-xs">{name(n.group[0])}</span>}</div>
  return (
    <div className="space-y-1" style={{ marginLeft: depth ? 12 : 0 }}>
      <p className="text-sm font-semibold">❓ {QUESTIONS.find((q) => q.id === n.q)!.text}</p>
      <div className="flex items-start gap-2 border-l-2 border-chem/40 pl-2"><span className="text-xs text-success">Yes →</span><Tree n={n.yes!} depth={depth + 1} /></div>
      <div className="flex items-start gap-2 border-l-2 border-chem/40 pl-2"><span className="text-xs text-destructive">No →</span><Tree n={n.no!} depth={depth + 1} /></div>
    </div>
  )
}

export default function KeyBuilder() {
  const addXp = useProgress((s) => s.addXp)
  const [tree, setTree] = useState<Node>({ group: ORGANISMS.map((o) => o.id) })
  const [msg, setMsg] = useState<string | null>(null)
  const [rewarded, setRewarded] = useState(false)
  const open = firstOpen(tree)
  const current = open ? at(tree, open) : null
  const ask = (q: string) => {
    if (!current || !open) return
    const s = split(current.group, q)
    if (!s.useful) { setMsg('That question doesn’t divide this group: every organism here gives the same answer. Try another.'); sfx.wrong(); return }
    const next = withSplit(tree, open, q)
    setTree(next)
    setMsg(null)
    sfx.click()
    if (!firstOpen(next) && !rewarded) { setRewarded(true); sfx.win(); addXp(10, 'Dichotomous key complete') }
  }
  return (
    <LabFrame labId="key-builder" title="Key Builder" subtitle="A dichotomous key splits living things into two groups at each step, until each one stands alone." howTo={<p>Look at the highlighted group. Choose a yes/no question that splits it into two smaller groups. Keep going until every organism is on its own. Can you do it in as few questions as possible?</p>}>
      {current && (
        <div className="mb-3 rounded-2xl border-2 border-chem bg-chem-soft p-3">
          <p className="text-sm font-semibold">Split this group:</p>
          <p className="text-2xl">{current.group.map((id) => <span key={id} title={name(id)} className="mr-1">{emoji(id)}</span>)}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{QUESTIONS.map((q) => <Button key={q.id} size="sm" variant="outline" onClick={() => ask(q.id)}>{q.text}</Button>)}</div>
        </div>
      )}
      {msg && <p role="status" className="mb-3 rounded-lg bg-warn-soft px-3 py-2 text-sm">{msg}</p>}
      <div className="overflow-x-auto rounded-2xl border bg-background p-3"><Tree n={tree} /></div>
      {!current && <p role="status" className="mt-3 rounded-xl bg-success-soft px-4 py-2 text-sm">✅ Your key works: every organism can be identified by answering yes/no questions. Scientists use keys like this in field guides to identify plants, insects and birds.</p>}
      <Button className="mt-3" variant="ghost" onClick={() => { setTree({ group: ORGANISMS.map((o) => o.id) }); setMsg(null) }}>↺ Start again</Button>
    </LabFrame>
  )
}
