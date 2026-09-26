import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { ORGANISMS, RANKS, sharedRank } from './model'

export default function TaxonomyLadder() {
  const [a, setA] = useState(0)
  const [b, setB] = useState(1)
  const A = ORGANISMS[a]
  const B = ORGANISMS[b]
  const shared = sharedRank(A, B)
  const verdict = shared === -1 ? 'Different kingdoms: very distantly related.' : shared === 6 ? 'The same species!' : `They share every rank down to ${RANKS[shared].toLowerCase()} level: ${shared >= 4 ? 'close relatives' : shared >= 2 ? 'fairly related' : 'distant relatives'}.`
  const Picker = ({ value, onChange, label }: { value: number; onChange: (i: number) => void; label: string }) => (
    <label className="text-sm font-semibold">{label}
      <select value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 block w-full rounded-lg border-2 bg-background px-2 py-1.5 font-normal">
        {ORGANISMS.map((o, i) => <option key={o.name} value={i}>{o.emoji} {o.name}</option>)}
      </select>
    </label>
  )
  return (
    <LabFrame labId="taxonomy-ladder" title="Taxonomy Ladder" subtitle="Kingdom → phylum → class → order → family → genus → species. The more ranks two living things share, the more closely related they are." howTo={<p>Choose two organisms and compare them rank by rank. See how the groups get smaller and more alike as you go down the ladder.</p>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Picker value={a} onChange={setA} label="Organism 1" />
        <Picker value={b} onChange={setB} label="Organism 2" />
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[440px] text-sm">
          <thead><tr className="text-left text-xs text-muted-foreground uppercase"><th className="p-1.5">Rank</th><th className="p-1.5">{A.emoji} {A.name}</th><th className="p-1.5">{B.emoji} {B.name}</th></tr></thead>
          <tbody>
            {RANKS.map((r, i) => (
              <tr key={r} className={cn('border-t', i <= shared ? 'bg-success-soft' : '')}>
                <td className="p-1.5 font-semibold" style={{ paddingLeft: `${6 + i * 6}px` }}>{r}</td>
                <td className={cn('p-1.5', i >= 5 && 'italic')}>{A.ranks[i]}</td>
                <td className={cn('p-1.5', i >= 5 && 'italic')}>{B.ranks[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 rounded-xl bg-muted/60 px-4 py-2 text-sm">🔗 {verdict}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl border p-3 text-sm">
          <p className="font-semibold">📝 Binomial nomenclature</p>
          <p className="mt-1">Every species has a two-part scientific name, <i>Genus species</i>, used worldwide. <b>Rules:</b> the genus starts with a capital letter, the species name is all lower case, and it is printed in <i>italics</i> (or underlined when handwritten). e.g. <i>{A.ranks[6]}</i>.</p>
        </div>
        <div className="rounded-2xl border p-3 text-sm">
          <p className="font-semibold">👑 Five kingdoms (Whittaker, 1969)</p>
          <p className="mt-1"><b>Monera</b> (bacteria: no nucleus) · <b>Protista</b> (single-celled with a nucleus, e.g. Amoeba) · <b>Fungi</b> (absorb food, cell walls of chitin) · <b>Plantae</b> (make food, cellulose walls) · <b>Animalia</b> (eat food, no cell walls).</p>
        </div>
      </div>
    </LabFrame>
  )
}
