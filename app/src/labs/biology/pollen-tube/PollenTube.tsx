import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

const STEPS = [
  { title: 'Pollination', text: 'Pollen grains (containing male gametes) are carried from an anther to a stigma by insects, birds, wind or water. Self-pollination: same flower or plant. Cross-pollination: a different plant of the same kind.' },
  { title: 'Pollen tube grows', text: 'On a sticky stigma of the right species, the pollen grain grows a tube down through the style towards the ovary.' },
  { title: 'Fertilisation', text: 'The tube enters an ovule. A male gamete fuses with the female gamete (egg cell) to form a zygote. This fusion is fertilisation.' },
  { title: 'Seed forms', text: 'The zygote divides to form an embryo. The ovule develops a tough coat and becomes a seed, with stored food for the embryo.' },
  { title: 'Fruit forms', text: 'The ovary swells and ripens into a fruit that protects the seeds and helps disperse them. Petals, sepals and stamens usually wither and fall.' },
]

export default function PollenTube() {
  const [s, setS] = useState(0)
  const [cross, setCross] = useState(true)
  const tube = s >= 1 ? Math.min(1, s === 1 ? 0.6 : 1) : 0
  return (
    <LabFrame labId="pollen-tube" title="From Flower to Fruit" subtitle="Sexual reproduction in flowering plants: pollination, fertilisation, seeds and fruits." howTo={<p>Step through the stages. Watch the pollen tube grow and the ovary turn into a fruit.</p>}>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {(['Cross', 'Self'] as const).map((k) => <button key={k} type="button" aria-pressed={cross === (k === 'Cross')} onClick={() => setCross(k === 'Cross')} className={cn('rounded-lg border-2 px-2.5 py-1', cross === (k === 'Cross') ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{k === 'Cross' ? '🐝 Cross-pollination' : '🌼 Self-pollination'}</button>)}
      </div>
      <svg viewBox="0 0 360 240" className="mt-3 w-full rounded-2xl border bg-background" role="img" aria-label={STEPS[s].title}>
        {s < 4 ? (
          <g>
            <path d="M180,230 L180,200" stroke="#15803d" strokeWidth={6} />
            <path d="M130,200 Q180,215 230,200" fill="#86efac" />
            {[-1, 1].map((d) => <path key={d} d={`M180,190 Q${180 + d * 110},170 ${180 + d * 90},60 Q${180 + d * 50},120 180,190`} fill="#fbcfe8" opacity={s >= 3 ? 0.3 : 0.9} />)}
            <ellipse cx={180} cy={180} rx={32} ry={22} fill="#bbf7d0" stroke="#15803d" strokeWidth={2} />
            {[-14, 0, 14].map((x) => <ellipse key={x} cx={180 + x} cy={182} rx={6} ry={8} fill={s >= 3 && x === 0 ? '#a16207' : '#fef9c3'} stroke="#a16207" />)}
            <path d="M176,158 L176,70 L184,70 L184,158" fill="#bbf7d0" stroke="#15803d" strokeWidth={1.5} />
            <ellipse cx={180} cy={66} rx={14} ry={7} fill="#facc15" stroke="#a16207" />
            {[-1, 1].map((d) => <g key={d}><line x1={180 + d * 22} y1={170} x2={180 + d * 40} y2={95} stroke="#a3a3a3" strokeWidth={2} /><ellipse cx={180 + d * 40} cy={90} rx={6} ry={10} fill="#f59e0b" /></g>)}
            {s === 0 && (cross ? <><text x={40} y={40} fontSize={26}>🐝</text><path d="M70,40 Q120,30 170,60" fill="none" stroke="#f59e0b" strokeDasharray="4 3" /><text x={20} y={80} fontSize={10} fill="currentColor">pollen from another flower</text></> : <path d="M220,88 Q210,60 188,64" fill="none" stroke="#f59e0b" strokeDasharray="4 3" />)}
            {s >= 0 && <circle cx={176} cy={62} r={4} fill="#f59e0b" />}
            {tube > 0 && <path d={`M176,64 L178,${64 + tube * 112}`} stroke="#f97316" strokeWidth={2.5} fill="none" />}
            {s === 2 && <text x={186} y={186} fontSize={14}>✨</text>}
            <g fontSize={9} fill="currentColor">
              <text x={200} y={66}>stigma</text><text x={190} y={120}>style</text><text x={216} y={186}>ovary</text><text x={232} y={90}>anther</text>
            </g>
          </g>
        ) : (
          <g>
            <circle cx={180} cy={120} r={80} fill="#fb923c" stroke="#c2410c" strokeWidth={3} />
            <path d="M180,40 q10,-20 25,-22" stroke="#15803d" strokeWidth={5} fill="none" />
            {[[-30, 0], [0, 10], [30, -5]].map(([x, y], i) => <ellipse key={i} cx={180 + x} cy={125 + y} rx={10} ry={14} fill="#78350f" />)}
            <text x={180} y={225} textAnchor="middle" fontSize={11} fill="currentColor">ovary → fruit · ovules → seeds</text>
          </g>
        )}
      </svg>
      <div className="mt-3 flex flex-wrap gap-1">{STEPS.map((x, i) => <button key={x.title} type="button" aria-pressed={s === i} onClick={() => setS(i)} className={cn('rounded-full border-2 px-2.5 py-0.5 text-sm', s === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{i + 1}. {x.title}</button>)}</div>
      <div className="mt-3 rounded-2xl border p-4">
        <p className="font-heading text-xl font-semibold">{s + 1}. {STEPS[s].title}</p>
        <p className="mt-1">{STEPS[s].text}</p>
        <div className="mt-3 flex gap-2"><Button variant="outline" disabled={s === 0} onClick={() => setS(s - 1)}>← Back</Button><Button disabled={s === STEPS.length - 1} onClick={() => setS(s + 1)}>Next →</Button></div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Sexual reproduction joins gametes from two parents (or two parts of one flower), so offspring are <b>different</b> from each other: this <b>variation</b> helps a species survive changes in its environment. Cross-pollination gives even more variation than self-pollination.</p>
    </LabFrame>
  )
}
