import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame } from '../../_kit/LabFrame'

type Option = { text: string; ok: boolean; why: string }
type Problem = { emoji: string; title: string; story: string; options: Option[]; idea: string }

const PROBLEMS: Problem[] = [
  { emoji: '🔊', title: 'What kind of wave?', story: 'In a sound wave in air, how do the air particles move?', idea: 'Sound is longitudinal', options: [
    { text: 'Back and forth, along the direction the wave travels', ok: true, why: 'That makes compressions and rarefactions: a longitudinal wave.' },
    { text: 'Up and down, at right angles to the wave', ok: false, why: 'That describes a transverse wave.' },
    { text: 'They travel all the way from the source to your ear', ok: false, why: 'The wave carries energy; the particles only vibrate about one place.' },
    { text: 'They don’t move at all', ok: false, why: 'The particles must vibrate to pass the wave on.' } ] },
  { emoji: '🎸', title: 'Wave speed', story: 'A sound has a frequency of 500 Hz and a wavelength of 0.69 m. What is its speed?', idea: 'v = fλ', options: [
    { text: '345 m/s', ok: true, why: '500 × 0.69 = 345 m/s.' },
    { text: '725 m/s', ok: false, why: 'That’s 500 ÷ 0.69; multiply instead.' },
    { text: '500.69 m/s', ok: false, why: 'Multiply, don’t add.' },
    { text: '0.00138 m/s', ok: false, why: 'That’s 0.69 ÷ 500.' } ] },
  { emoji: '🎹', title: 'Find the wavelength', story: 'A note of 344 Hz travels in air at 344 m/s. What is its wavelength?', idea: 'λ = v ÷ f', options: [
    { text: '1 m', ok: true, why: '344 ÷ 344 = 1 m.' },
    { text: '118 336 m', ok: false, why: 'That multiplies instead of dividing.' },
    { text: '688 m', ok: false, why: 'Divide the speed by the frequency.' },
    { text: '0 m', ok: false, why: 'Every sound has a wavelength.' } ] },
  { emoji: '⏱️', title: 'Time period', story: 'A tuning fork vibrates at 250 Hz. What is the time period of one vibration?', idea: 'T = 1 ÷ f', options: [
    { text: '0.004 s', ok: true, why: '1 ÷ 250 = 0.004 s (4 ms).' },
    { text: '250 s', ok: false, why: 'That’s the frequency, not the period.' },
    { text: '0.25 s', ok: false, why: 'That would be a frequency of 4 Hz.' },
    { text: '4 s', ok: false, why: 'Check the decimal point: 1 ÷ 250.' } ] },
  { emoji: '🔉', title: 'Louder, not higher', story: 'You turn up the volume on a speaker playing the same note. What changes?', idea: 'Loudness depends on amplitude; pitch on frequency', options: [
    { text: 'The amplitude increases', ok: true, why: 'Bigger vibrations carry more energy: louder.' },
    { text: 'The frequency increases', ok: false, why: 'That would raise the pitch.' },
    { text: 'The speed of sound increases', ok: false, why: 'Speed depends on the medium, not the volume.' },
    { text: 'The wavelength gets shorter', ok: false, why: 'Same note, same frequency, same wavelength.' } ] },
  { emoji: '⛰️', title: 'Echo distance', story: 'You shout at a cliff and hear the echo 2 s later. Sound travels at 340 m/s. How far away is the cliff?', idea: 'd = v × t ÷ 2', options: [
    { text: '340 m', ok: true, why: '340 × 2 = 680 m there and back, so 340 m each way.' },
    { text: '680 m', ok: false, why: 'That’s the total there-and-back distance; halve it.' },
    { text: '170 m', ok: false, why: 'Multiply by the time first, then halve.' },
    { text: '1360 m', ok: false, why: 'Don’t double it: halve it.' } ] },
  { emoji: '🏫', title: 'No echo', story: 'Why don’t you hear a separate echo when you clap in a small classroom?', idea: 'An echo needs a delay of at least 0.1 s', options: [
    { text: 'The reflection returns in less than 0.1 s and blends with the clap', ok: true, why: 'The walls are closer than 17.2 m, so you hear reverberation instead.' },
    { text: 'Sound doesn’t reflect off classroom walls', ok: false, why: 'It does; that’s why rooms sound ‘boomy’.' },
    { text: 'Sound travels too slowly indoors', ok: false, why: 'The speed in air is the same indoors.' },
    { text: 'The windows absorb all of it', ok: false, why: 'Some is absorbed, but the walls still reflect.' } ] },
  { emoji: '🦇', title: 'Bat hunting', story: 'A bat emits a 50 000 Hz squeak. Can a human hear it?', idea: 'Humans hear about 20 Hz – 20 000 Hz', options: [
    { text: 'No: it is ultrasound', ok: true, why: '50 kHz is above the 20 kHz upper limit of human hearing.' },
    { text: 'Yes: it is a very high note', ok: false, why: 'It’s far above our range.' },
    { text: 'No: it is infrasound', ok: false, why: 'Infrasound is below 20 Hz.' },
    { text: 'Only if it is loud enough', ok: false, why: 'Loudness doesn’t make ultrasound audible.' } ] },
  { emoji: '🚢', title: 'Sea depth', story: 'A ship’s SONAR pulse returns after 3 s. Sound travels at 1500 m/s in sea water. How deep is the sea?', idea: 'Depth = v × t ÷ 2', options: [
    { text: '2250 m', ok: true, why: '1500 × 3 = 4500 m there and back; 4500 ÷ 2 = 2250 m.' },
    { text: '4500 m', ok: false, why: 'Remember to halve for the return journey.' },
    { text: '500 m', ok: false, why: 'That divides 1500 by 3.' },
    { text: '1500 m', ok: false, why: 'Use the time too.' } ] },
  { emoji: '👂', title: 'Tiny bones', story: 'Which part of the ear amplifies vibrations using three tiny bones?', idea: 'The middle ear’s ossicles act as levers', options: [
    { text: 'The middle ear (hammer, anvil, stirrup)', ok: true, why: 'They pass the eardrum’s vibrations to the cochlea, amplifying them.' },
    { text: 'The pinna', ok: false, why: 'The pinna collects sound; it has no bones.' },
    { text: 'The cochlea', ok: false, why: 'The cochlea turns vibrations into nerve signals.' },
    { text: 'The auditory nerve', ok: false, why: 'The nerve carries signals to the brain.' } ] },
]

export default function SoundMaster() {
  const awardBadge = useProgress((s) => s.awardBadge)
  const addXp = useProgress((s) => s.addXp)
  const [round, setRound] = useState(0)
  const problems = useMemo(() => PROBLEMS.map((p) => ({ ...p, options: shuffle(p.options) })), [round])
  const [i, setI] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [picked, setPicked] = useState<Option | null>(null)
  const done = i >= problems.length
  const lost = hearts === 0 && !picked
  const p = problems[i]

  const choose = (o: Option) => {
    if (picked) return
    setPicked(o)
    if (o.ok) sfx.correct()
    else {
      sfx.wrong()
      setHearts((h) => h - 1)
    }
  }
  const next = () => {
    const n = i + 1
    setI(n)
    setPicked(null)
    if (n >= problems.length) {
      sfx.win()
      if (!useProgress.getState().badges.includes('sound-master')) addXp(25 + hearts * 10, 'Sound Master!')
      awardBadge('sound-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="sound-master" title="Boss Challenge: Sound Master" subtitle="Ten problems on sound waves, echoes, ultrasound and the ear." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🎧</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Sound Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
          <Button className="mt-3" variant="outline" onClick={restart}>Play again</Button>
        </div>
      ) : lost ? (
        <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="text-5xl">🧮</p>
          <p className="mt-2 font-heading text-xl font-semibold">Out of lives. Review the idea behind each problem and try again!</p>
          <Button className="mt-3" onClick={restart}>Try again</Button>
        </div>
      ) : (
        <motion.div key={`${round}-${i}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
          <div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4">
            <span className="text-5xl" aria-hidden>{p.emoji}</span>
            <div><p className="font-heading text-xl font-semibold">{p.title}</p><p className="text-[15px]">{p.story}</p></div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {p.options.map((o) => (
              <button key={o.text} type="button" disabled={Boolean(picked)} onClick={() => choose(o)} className={cn('rounded-xl border-2 bg-background px-4 py-3 text-left font-mono text-base', !picked && 'hover:border-chem', picked && o.ok && 'border-success bg-success-soft', picked === o && !o.ok && 'border-destructive/60 bg-destructive/10', picked && picked !== o && !o.ok && 'opacity-50')}>{o.text}</button>
            ))}
          </div>
          {picked && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} role="status" className={cn('rounded-xl p-4 text-sm', picked.ok ? 'bg-success-soft' : 'bg-warn-soft')}>
              <p>{picked.ok ? '✅ ' : '❌ '}{picked.why}</p>
              <p className="mt-1 font-semibold">🧠 Physics idea: {p.idea}</p>
              {hearts > 0 ? <Button className="mt-3" autoFocus onClick={next}>{i + 1 < problems.length ? 'Next problem →' : 'Finish'}</Button> : <Button className="mt-3" variant="outline" onClick={() => setPicked(null)}>See result</Button>}
            </motion.div>
          )}
        </motion.div>
      )}
    </LabFrame>
  )
}
