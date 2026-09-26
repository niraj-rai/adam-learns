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
  { emoji: '🪞', title: 'Concave mirror', story: 'An object is 30 cm from a concave mirror of focal length 15 cm (f = −15 cm). Where is the image?', idea: '1/v + 1/u = 1/f', options: [
    { text: 'v = −30 cm (real, inverted, same size)', ok: true, why: 'The object is at C, so the image is also at C.' },
    { text: 'v = +30 cm', ok: false, why: 'A real image forms in front of the mirror, so v is negative.' },
    { text: 'v = −10 cm', ok: false, why: 'Recalculate: 1/v = −1/15 + 1/30 = −1/30.' },
    { text: 'At infinity', ok: false, why: 'That happens when the object is at F.' },
  ] },
  { emoji: '🚗', title: 'Rear-view mirror', story: 'Why do vehicles use convex mirrors as rear-view mirrors?', idea: 'Convex mirrors always give upright, diminished images', options: [
    { text: 'They give an upright image and a wider field of view', ok: true, why: 'The image is always virtual, upright and smaller, so more fits in.' },
    { text: 'They magnify things behind', ok: false, why: 'That would need a concave mirror.' },
    { text: 'They form real images', ok: false, why: 'Convex mirrors never form real images.' },
    { text: 'They are cheaper', ok: false, why: 'The reason is the optics, not the cost.' },
  ] },
  { emoji: '🔍', title: 'Magnification', story: 'A mirror forms an image with m = −2. What does this tell you?', idea: 'm = h′/h; the sign shows orientation', options: [
    { text: 'Inverted and twice as tall', ok: true, why: 'Negative: inverted; |m| = 2: twice the size.' },
    { text: 'Upright and twice as tall', ok: false, why: 'A negative m means inverted.' },
    { text: 'Inverted and half as tall', ok: false, why: '|m| = 2 means double.' },
    { text: 'Virtual and upright', ok: false, why: 'Virtual images from a single mirror are upright (m > 0).' },
  ] },
  { emoji: '👓', title: 'Lens power', story: 'A lens has a power of −2.5 D. What kind of lens is it, and what is its focal length?', idea: 'P = 1/f (in metres)', options: [
    { text: 'Concave, f = −40 cm', ok: true, why: 'f = 1/−2.5 = −0.4 m.' },
    { text: 'Convex, f = 40 cm', ok: false, why: 'Negative power means diverging (concave).' },
    { text: 'Concave, f = −2.5 cm', ok: false, why: 'Convert: 1/2.5 m = 0.4 m.' },
    { text: 'Convex, f = 2.5 m', ok: false, why: 'Check the sign and the reciprocal.' },
  ] },
  { emoji: '📷', title: 'Convex lens image', story: 'An object is 30 cm from a convex lens of focal length 20 cm. Where is the image?', idea: '1/v − 1/u = 1/f', options: [
    { text: 'v = +60 cm (real, inverted, magnified)', ok: true, why: '1/v = 1/20 − 1/30 = 1/60.' },
    { text: 'v = +12 cm', ok: false, why: 'Subtract, don’t add, 1/30.' },
    { text: 'v = −60 cm', ok: false, why: 'A real image forms on the other side, so v is positive.' },
    { text: 'v = +10 cm', ok: false, why: 'Recalculate with the lens formula.' },
  ] },
  { emoji: '🥤', title: 'Bent straw', story: 'A straw in a glass of water looks bent at the surface. Why?', idea: 'Refraction', options: [
    { text: 'Light bends as it passes from water into air', ok: true, why: 'It changes speed at the boundary.' },
    { text: 'The straw really bends', ok: false, why: 'It’s straight.' },
    { text: 'Water reflects the light', ok: false, why: 'The bending is refraction, not reflection.' },
    { text: 'Light slows in air', ok: false, why: 'Light is faster in air than in water.' },
  ] },
  { emoji: '💎', title: 'Refractive index', story: 'Light travels at 2 × 10⁸ m/s in glass. What is the refractive index of glass? (c = 3 × 10⁸ m/s)', idea: 'n = c/v', options: [
    { text: '1.5', ok: true, why: '3 ÷ 2 = 1.5.' },
    { text: '0.67', ok: false, why: 'That’s v/c.' },
    { text: '6', ok: false, why: 'Divide, don’t multiply.' },
    { text: '1', ok: false, why: 'That’s air.' },
  ] },
  { emoji: '👁️', title: 'Short sight', story: 'A student can’t see the blackboard clearly but reads easily. Which lens corrects this?', idea: 'Myopia is corrected by a concave lens', options: [
    { text: 'A concave (diverging) lens', ok: true, why: 'Distant images form in front of the retina; a diverging lens moves them back.' },
    { text: 'A convex lens', ok: false, why: 'That corrects long sight.' },
    { text: 'A plane glass', ok: false, why: 'That doesn’t change focus.' },
    { text: 'A prism', ok: false, why: 'Prisms are not used for this.' },
  ] },
  { emoji: '🌈', title: 'Dispersion', story: 'White light passes through a prism and spreads into colours. Which colour bends the most?', idea: 'Violet has the shortest wavelength and bends most', options: [
    { text: 'Violet', ok: true, why: 'Violet is refracted most, red least.' },
    { text: 'Red', ok: false, why: 'Red bends the least.' },
    { text: 'Green', ok: false, why: 'Green is in the middle.' },
    { text: 'All bend equally', ok: false, why: 'Then there would be no spectrum.' },
  ] },
  { emoji: '🌅', title: 'Red sunset', story: 'Why does the Sun look red at sunrise and sunset?', idea: 'Scattering ∝ 1/λ⁴ over a long path', options: [
    { text: 'Blue light is scattered out over the long path through the air', ok: true, why: 'Mostly red, the least scattered, reaches us.' },
    { text: 'The Sun cools down in the evening', ok: false, why: 'The Sun’s temperature doesn’t change daily.' },
    { text: 'Red light is scattered most', ok: false, why: 'Red is scattered least.' },
    { text: 'Dust makes light red', ok: false, why: 'The main cause is scattering by air molecules over a long path.' },
  ] },
]

export default function LightMaster() {
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
      if (!useProgress.getState().badges.includes('light-master')) addXp(25 + hearts * 10, 'Light Master!')
      awardBadge('light-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="light-master" title="Boss Challenge: Light Master" subtitle="Ten problems on mirrors, lenses, refraction, the eye and scattering." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🔦</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Light Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
