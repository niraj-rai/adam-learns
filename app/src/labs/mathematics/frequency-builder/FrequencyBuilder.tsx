import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { classHeights, groupData, tally } from './model'

export default function FrequencyBuilder() {
  const [seed, setSeed] = useState(8)
  const data = useMemo(() => classHeights(seed), [seed])
  const [w, setW] = useState(5)
  const bins = groupData(data, w)
  const max = Math.max(...bins.map((b) => b.count))
  const modal = bins.filter((b) => b.count === max)
  return (
    <LabFrame labId="frequency-builder" title="Frequency Builder" subtitle="40 heights are hard to read. Group them into class intervals and a pattern appears." howTo={<p>Change the class width to group the data differently. Watch the tally table and the histogram. Too narrow and it's bumpy; too wide and you lose detail.</p>}>
      <div className="rounded-2xl border bg-background p-3">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Raw data: heights of 40 students (cm)</p>
        <p className="mt-1 font-mono text-xs leading-relaxed break-words">{data.join(', ')}</p>
        <Button size="sm" variant="outline" className="mt-2" onClick={() => setSeed((s) => s + 1)}>New class</Button>
      </div>
      <label className="mt-3 block text-sm">Class width <b>{w} cm</b><Slider value={[w]} min={2} max={10} step={1} onValueChange={([v]) => setW(v)} className="mt-1" aria-label="Class width" /></label>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <table className="w-full rounded-xl border text-sm">
          <thead><tr className="border-b text-left"><th className="p-2">Height (cm)</th><th className="p-2">Tally</th><th className="p-2 text-right">Frequency</th></tr></thead>
          <tbody>
            {bins.map((b) => (
              <tr key={b.from} className="border-b last:border-0">
                <td className="p-1.5 font-mono">{b.from}–{b.to}</td>
                <td className="p-1.5"><Tally n={b.count} /></td>
                <td className="p-1.5 text-right font-mono font-bold">{b.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <svg viewBox="0 0 320 220" className="w-full rounded-2xl border bg-background" role="img" aria-label="Histogram of heights">
          {bins.map((b, i) => {
            const bw = 280 / bins.length
            const h = (b.count / Math.max(1, max)) * 160
            return (
              <g key={b.from}>
                <rect x={30 + i * bw} y={185 - h} width={bw} height={h} fill="#6366f1" fillOpacity={0.6} stroke="#312e81" />
                {b.count > 0 && <text x={30 + i * bw + bw / 2} y={180 - h} textAnchor="middle" fontSize={9} fill="currentColor">{b.count}</text>}
                {(bins.length <= 12 || i % 2 === 0) && <text x={30 + i * bw} y={200} textAnchor="middle" fontSize={8} fill="currentColor">{b.from}</text>}
              </g>
            )
          })}
          <line x1={30} y1={185} x2={310} y2={185} stroke="currentColor" />
          <text x={170} y={215} textAnchor="middle" fontSize={10} fill="currentColor">height (cm)</text>
        </svg>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Number of classes" value={`${bins.length}`} />
        <Readout label="Modal class" value={modal.map((b) => `${b.from}–${b.to}`).join(', ')} />
        <Readout label="Total" value={`${bins.reduce((s, b) => s + b.count, 0)} students`} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Each class includes its lower limit but not its upper limit: a height of {bins[0].to} cm goes in {bins[0].to}–{bins[0].to + w}. A <b>histogram</b> has no gaps between bars, because the classes join up with no gaps. Tallies are grouped in fives (four strokes crossed by a fifth) so they are quick to count.</p>
    </LabFrame>
  )
}

function Tally({ n }: { n: number }) {
  const { fives, ones } = tally(n)
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 font-mono text-sm leading-none" aria-label={`${n}`}>
      {Array.from({ length: fives }, (_, i) => <span key={i} className="relative tracking-[-0.1em]">||||<span className="absolute inset-x-[-2px] top-1/2 h-px -rotate-[20deg] bg-current" /></span>)}
      {ones > 0 && <span className="tracking-[-0.1em]">{'|'.repeat(ones)}</span>}
    </span>
  )
}
