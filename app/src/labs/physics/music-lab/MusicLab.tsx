import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { playNote } from '../../_kit/audio'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { blowFreq, bowlFreq, inTune, SARGAM, stringFreq, tapFreq } from './model'

export default function MusicLab() {
  const [tab, setTab] = useState<'jal' | 'string' | 'bottle'>('jal')
  return (
    <LabFrame labId="music-lab" title="Music Lab" subtitle="Musical instruments control pitch by changing what vibrates and how." howTo={<p>Tab 1: tune a jal tarang to Sa Re Ga Ma Pa Dha Ni Sa by adding or removing water. Tab 2: change the length and tightness of a veena string. Tab 3: a puzzle: tap a bottle, then blow across it.</p>}>
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['jal', '🥣 Jal tarang'], ['string', '🎸 Strings'], ['bottle', '🍾 Bottle puzzle']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'jal' && <JalTarang />}
      {tab === 'string' && <Strings />}
      {tab === 'bottle' && <Bottles />}
    </LabFrame>
  )
}

function JalTarang() {
  const addXp = useProgress((s) => s.addXp)
  const [fills, setFills] = useState<number[]>(SARGAM.map(() => 0.05))
  const [sel, setSel] = useState(0)
  const [rewarded, setRewarded] = useState(false)
  const freqs = fills.map(bowlFreq)
  const tuned = freqs.map((f, i) => inTune(f, SARGAM[i].f))
  const all = tuned.every(Boolean)
  const strike = (i: number) => { setSel(i); playNote(freqs[i], { duration: 1.5, volume: 0.2 }) }
  const setFill = (v: number) => {
    const next = fills.map((f, i) => (i === sel ? v : f))
    setFills(next)
    if (!rewarded && next.every((fl, i) => inTune(bowlFreq(fl), SARGAM[i].f))) {
      setRewarded(true)
      sfx.win()
      addXp(15, 'Jal tarang tuned!')
    }
  }
  const playScale = () => freqs.forEach((f, i) => window.setTimeout(() => { setSel(i); playNote(f, { duration: 0.9, volume: 0.2 }) }, i * 380))
  const cents = (f: number, t: number) => Math.round(1200 * Math.log2(f / t))

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-center gap-2 rounded-2xl border bg-background p-3">
        {fills.map((fl, i) => (
          <button key={i} type="button" onClick={() => strike(i)} aria-label={`Bowl ${i + 1} (${SARGAM[i].name}), ${Math.round(fl * 100)}% full`} className={cn('flex flex-col items-center rounded-lg p-1', sel === i && 'ring-2 ring-chem')}>
            <svg viewBox="0 0 50 34" className="w-11">
              <path d="M2 4 Q25 40 48 4 Z" fill="#e2e8f0" stroke="#64748b" />
              <motion.path animate={{ d: `M${2 + (1 - fl) * 8} ${4 + (1 - fl) * 14} Q25 ${36} ${48 - (1 - fl) * 8} ${4 + (1 - fl) * 14} Z` }} fill="#38bdf8" opacity={0.8} />
            </svg>
            <span className="text-xs font-semibold">{SARGAM[i].name}{tuned[i] ? ' ✅' : ''}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_240px]">
        <div className="space-y-2">
          <label className="block text-sm">Water in the {SARGAM[sel].name} bowl: <b>{Math.round(fills[sel] * 100)}%</b>
            <Slider value={[fills[sel]]} min={0} max={1} step={0.005} onValueChange={([v]) => setFill(v)} className="mt-1.5" aria-label={`Water level for ${SARGAM[sel].name}`} />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => strike(sel)}>🥢 Strike this bowl</Button>
            <Button size="sm" variant="outline" onClick={playScale}>🎶 Play all eight</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Readout label={`${SARGAM[sel].name}: now / target`} value={`${freqs[sel].toFixed(0)} / ${SARGAM[sel].f.toFixed(0)} Hz`} />
          <p className={cn('text-center text-sm font-semibold', tuned[sel] ? 'text-success' : 'text-muted-foreground')}>
            {tuned[sel] ? 'In tune!' : cents(freqs[sel], SARGAM[sel].f) > 0 ? '▲ Too high: add water' : '▼ Too low: pour some out'}
          </p>
        </div>
      </div>
      <p role="status" className={cn('rounded-xl px-4 py-2 text-sm', all ? 'bg-success-soft' : 'bg-chem-soft')}>
        {all ? '🎉 All eight bowls are in tune. Play the scale! The more water in a bowl, the more slowly it vibrates when struck, and the lower its pitch.' : `${tuned.filter(Boolean).length}/8 bowls in tune. The jal tarang is one of India’s oldest instruments: porcelain bowls with water, struck with thin sticks.`}
      </p>
    </div>
  )
}

function Strings() {
  const [len, setLen] = useState(0.8)
  const [ten, setTen] = useState(60)
  const f = stringFreq(len, ten)
  const [pluck, setPluck] = useState(0)
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 400 90" className="w-full rounded-2xl border bg-background" role="img" aria-label={`String ${len} m long at ${ten} newtons tension`}>
        <rect x={20} y={30} width={10} height={30} fill="#78350f" />
        <rect x={30 + len * 400} y={30} width={6} height={30} fill="#78350f" />
        <motion.path key={pluck} d={`M30 45 Q ${30 + len * 200} 45 ${30 + len * 400} 45`} stroke="#eab308" strokeWidth={1 + ten / 60} fill="none" animate={pluck ? { d: [`M30 45 Q ${30 + len * 200} 25 ${30 + len * 400} 45`, `M30 45 Q ${30 + len * 200} 65 ${30 + len * 400} 45`, `M30 45 Q ${30 + len * 200} 38 ${30 + len * 400} 45`, `M30 45 Q ${30 + len * 200} 45 ${30 + len * 400} 45`] } : {}} transition={{ duration: 0.6 }} />
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">Vibrating length: <b>{Math.round(len * 100)} cm</b>
          <Slider value={[len]} min={0.3} max={0.85} step={0.05} onValueChange={([v]) => setLen(v)} className="mt-1.5" aria-label="String length" />
        </label>
        <label className="block text-sm">Tension (tightness): <b>{ten} N</b>
          <Slider value={[ten]} min={20} max={120} step={5} onValueChange={([v]) => setTen(v)} className="mt-1.5" aria-label="String tension" />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => { setPluck((p) => p + 1); playNote(f, { duration: 1.6, volume: 0.2, overtone: 0.15 }) }}>🎸 Pluck</Button>
        <Readout label="Frequency" value={`${f.toFixed(0)} Hz`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">A <b>shorter</b> or <b>tighter</b> string vibrates faster: higher pitch. That’s why veena and sitar players press the string against a fret to shorten it, and turn the pegs to tune it. Thicker, heavier strings give deeper notes.</p>
    </div>
  )
}

function Bottles() {
  const [fill, setFill] = useState(0.5)
  const [guess, setGuess] = useState<null | 'same' | 'opposite'>(null)
  return (
    <div className="space-y-3">
      <p className="text-sm">Predict first: when you add water to a bottle, does the pitch change the same way whether you <b>tap</b> it or <b>blow</b> across its mouth?</p>
      <div className="flex gap-2">
        <Button size="sm" variant={guess === 'same' ? 'default' : 'outline'} onClick={() => setGuess('same')}>Same way</Button>
        <Button size="sm" variant={guess === 'opposite' ? 'default' : 'outline'} onClick={() => setGuess('opposite')}>Opposite ways</Button>
      </div>
      {guess && (
        <>
          <div className="flex items-end gap-6">
            <svg viewBox="0 0 60 120" className="h-36" role="img" aria-label={`Bottle ${Math.round(fill * 100)}% full of water`}>
              <path d="M22 4 H38 V28 Q52 36 52 50 V114 H8 V50 Q8 36 22 28 Z" fill="none" stroke="#64748b" strokeWidth={2} />
              <rect x={9} y={114 - fill * 70} width={42} height={fill * 70} fill="#38bdf8" opacity={0.7} />
            </svg>
            <div className="flex-1 space-y-2">
              <label className="block text-sm">Water level: <b>{Math.round(fill * 100)}%</b>
                <Slider value={[fill]} min={0} max={0.9} step={0.1} onValueChange={([v]) => setFill(v)} className="mt-1.5" aria-label="Water level in the bottle" />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => playNote(tapFreq(fill), { duration: 0.8, volume: 0.2, overtone: 0.3 })}>🥄 Tap it ({tapFreq(fill).toFixed(0)} Hz)</Button>
                <Button size="sm" variant="outline" onClick={() => playNote(blowFreq(fill), { duration: 1.2, volume: 0.15, overtone: 0.05 })}>🌬️ Blow across it ({blowFreq(fill).toFixed(0)} Hz)</Button>
              </div>
            </div>
          </div>
          <p role="status" className="rounded-xl bg-chem-soft px-4 py-2 text-sm">{guess === 'opposite' ? '✅ Well predicted! ' : '🤔 Surprise! '}When you <b>tap</b>, the glass and water vibrate: more water means more to shake, so the pitch goes <b>down</b>. When you <b>blow</b>, the <b>air column</b> above the water vibrates: more water means a shorter air column, so the pitch goes <b>up</b>. What vibrates matters!</p>
        </>
      )}
    </div>
  )
}
