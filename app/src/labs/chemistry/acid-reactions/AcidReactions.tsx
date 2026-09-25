import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

type Acid = 'hcl' | 'vinegar'
type Solid = 'mg' | 'zn' | 'cu' | 'marble' | 'soda'
type Gas = 'hydrogen' | 'co2' | null

const ACIDS: Record<Acid, { name: string; short: string; salt: Record<Solid, string> }> = {
  hcl: { name: 'Dilute hydrochloric acid', short: 'hydrochloric acid', salt: { mg: 'magnesium chloride', zn: 'zinc chloride', cu: '', marble: 'calcium chloride', soda: 'sodium chloride' } },
  vinegar: { name: 'Vinegar (acetic acid)', short: 'acetic acid', salt: { mg: 'magnesium acetate', zn: 'zinc acetate', cu: '', marble: 'calcium acetate', soda: 'sodium acetate' } },
}
const SOLIDS: Record<Solid, { name: string; chem: string; emoji: string; kind: 'metal' | 'carbonate'; reactive: boolean; speed: number }> = {
  mg: { name: 'Magnesium ribbon', chem: 'magnesium', emoji: '🎗️', kind: 'metal', reactive: true, speed: 1 },
  zn: { name: 'Zinc granules', chem: 'zinc', emoji: '🪨', kind: 'metal', reactive: true, speed: 0.6 },
  cu: { name: 'Copper turnings', chem: 'copper', emoji: '🟠', kind: 'metal', reactive: false, speed: 0 },
  marble: { name: 'Marble chips (calcium carbonate)', chem: 'calcium carbonate', emoji: '⚪', kind: 'carbonate', reactive: true, speed: 0.7 },
  soda: { name: 'Baking soda (sodium hydrogen carbonate)', chem: 'sodium hydrogen carbonate', emoji: '🧁', kind: 'carbonate', reactive: true, speed: 1 },
}

export default function AcidReactions() {
  const [acid, setAcid] = useState<Acid>('hcl')
  const [solid, setSolid] = useState<Solid>('mg')
  const [added, setAdded] = useState(false)
  const [test, setTest] = useState<'splint' | 'limewater' | null>(null)
  const [log, setLog] = useState<Record<string, true>>({})

  const s = SOLIDS[solid]
  // vinegar is a weak acid: slower fizz with metals
  const speed = s.reactive ? s.speed * (acid === 'vinegar' ? 0.5 : 1) : 0
  const gas: Gas = !added || !s.reactive ? null : s.kind === 'metal' ? 'hydrogen' : 'co2'

  const reset = () => {
    setAdded(false)
    setTest(null)
  }
  const doTest = (t: 'splint' | 'limewater') => {
    setTest(t)
    if (gas === 'hydrogen' && t === 'splint') sfx.win()
    else sfx.click()
    if (gas) setLog((l) => ({ ...l, [`${acid}+${solid}+${t}`]: true }))
  }

  const salt = ACIDS[acid].salt[solid]
  const equation = !s.reactive
    ? `${ACIDS[acid].short} + copper → no reaction`
    : s.kind === 'metal'
      ? `${ACIDS[acid].short} + ${s.chem} → ${salt} + hydrogen`
      : `${ACIDS[acid].short} + ${s.chem} → ${salt} + water + carbon dioxide`

  let testResult: string | null = null
  if (test === 'splint') testResult = gas === 'hydrogen' ? '💥 POP! A lighted splint burns the gas with a squeaky pop. The gas is HYDROGEN.' : gas === 'co2' ? '🕯️ The lighted splint goes OUT. Carbon dioxide does not support burning.' : 'No gas to test.'
  if (test === 'limewater') testResult = gas === 'co2' ? '🥛 Lime water turns MILKY. The gas is CARBON DIOXIDE.' : gas === 'hydrogen' ? 'Lime water stays clear, so it is not carbon dioxide. Try the lighted splint!' : 'No gas to test.'

  return (
    <LabFrame
      labId="acid-reactions"
      title="Reactions of Acids"
      subtitle="Acids + metals and acids + carbonates: which gas is made?"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>Choose an acid and a solid, then add the solid to the acid.</li>
          <li>If it fizzes, identify the gas: try the <b>lighted splint</b> and the <b>lime water</b> tests.</li>
          <li>Find out which metal does NOT react with dilute acid.</li>
        </ul>
      }
    >
      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ACIDS) as Acid[]).map((a) => (
              <button key={a} type="button" onClick={() => { setAcid(a); reset() }} className={cn('rounded-full border px-3 py-1.5 text-sm', a === acid ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
                {ACIDS[a].name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SOLIDS) as Solid[]).map((k) => (
              <button key={k} type="button" onClick={() => { setSolid(k); reset() }} className={cn('rounded-full border px-3 py-1.5 text-sm', k === solid ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
                {SOLIDS[k].emoji} {SOLIDS[k].name.split(' (')[0]}
              </button>
            ))}
          </div>
          <svg viewBox="0 0 220 200" className="mx-auto w-full max-w-sm" role="img" aria-label={gas ? `Fizzing: ${gas} gas` : added ? 'No reaction' : 'Test tube of acid'}>
            <path d="M80 20 V160 a30 30 0 0 0 60 0 V20" fill="none" stroke="currentColor" strokeOpacity={0.45} strokeWidth={3} />
            <path d="M82 90 V160 a28 28 0 0 0 56 0 V90 Z" fill={acid === 'hcl' ? '#e0f2fe' : '#fef3c7'} />
            {added && <motion.text x={110} textAnchor="middle" fontSize={22} initial={{ y: 40 }} animate={{ y: 178 }} transition={{ type: 'spring', stiffness: 60 }}>{s.emoji}</motion.text>}
            {gas &&
              Array.from({ length: Math.round(18 * speed) }, (_, i) => (
                <motion.circle key={i} cx={92 + ((i * 11) % 36)} r={2.5} fill="#fff" stroke="#94a3b8" strokeWidth={0.6} animate={{ cy: [172, 92], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 1.4 / Math.max(0.3, speed), delay: i * 0.08 }} />
              ))}
            {test === 'splint' && (
              <g>
                <rect x={104} y={0} width={6} height={60} fill="#a16207" />
                {gas === 'hydrogen' ? <motion.text x={100} y={20} fontSize={26} initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }}>💥</motion.text> : <text x={96} y={8} fontSize={14}>{gas === 'co2' ? '💨' : '🔥'}</text>}
              </g>
            )}
          </svg>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => { setAdded(true); setTest(null) }} disabled={added}>Add the {SOLIDS[solid].name.split(' (')[0].toLowerCase()}</Button>
            <Button variant="ghost" onClick={reset}>Empty the tube</Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Test the gas</p>
          <Button className="w-full justify-start" variant="outline" disabled={!added} onClick={() => doTest('splint')}>🔥 Lighted splint at the mouth</Button>
          <Button className="w-full justify-start" variant="outline" disabled={!added} onClick={() => doTest('limewater')}>🥛 Bubble gas into lime water</Button>
          {added && (
            <div role="status" className="space-y-2 rounded-xl border bg-chem-soft p-3 text-sm">
              <p>{s.reactive ? `Fizzing${acid === 'vinegar' && s.kind === 'metal' ? ' (slowly: vinegar is a weak acid)' : ''}!` : 'Nothing happens. Copper does not react with dilute acids.'}</p>
              {testResult && <p className="font-semibold">{testResult}</p>}
              <p className="text-muted-foreground"><b>Word equation:</b> {equation}</p>
            </div>
          )}
          <p className="pt-1 text-xs text-muted-foreground">Gas tests done: {Object.keys(log).length}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <p className="rounded-lg border bg-background px-3 py-2"><b>acid + metal</b> → salt + hydrogen</p>
        <p className="rounded-lg border bg-background px-3 py-2"><b>acid + carbonate</b> → salt + water + carbon dioxide</p>
      </div>
    </LabFrame>
  )
}
