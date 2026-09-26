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
  { emoji: '🐅', title: 'Name it right', story: 'Which is the correct way to write the tiger’s scientific name?', idea: 'Genus capitalised, species lower case, in italics', options: [
    { text: 'Panthera tigris', ok: true, why: 'Genus with a capital, species in lower case (printed in italics).' },
    { text: 'panthera Tigris', ok: false, why: 'The capital goes on the genus, not the species.' },
    { text: 'Panthera Tigris', ok: false, why: 'The species name is always lower case.' },
    { text: 'PANTHERA TIGRIS', ok: false, why: 'Only the first letter of the genus is a capital.' } ] },
  { emoji: '🪜', title: 'Ladder order', story: 'Which list goes from the biggest group to the smallest?', idea: 'Kingdom → phylum → class → order → family → genus → species', options: [
    { text: 'Kingdom, class, family, species', ok: true, why: 'Each rank is smaller and more specific than the one above.' },
    { text: 'Species, genus, family, order', ok: false, why: 'That goes from smallest to biggest.' },
    { text: 'Class, kingdom, genus, order', ok: false, why: 'The ranks are mixed up.' },
    { text: 'Family, order, class, phylum', ok: false, why: 'That goes upwards, from smaller to bigger.' } ] },
  { emoji: '🦁', title: 'Close relatives', story: 'The lion is Panthera leo and the tiger is Panthera tigris. What does this tell you?', idea: 'Same genus = closely related', options: [
    { text: 'They belong to the same genus', ok: true, why: 'Both are in the genus Panthera.' },
    { text: 'They are the same species', ok: false, why: 'The second word (species) is different.' },
    { text: 'They are in different families', ok: false, why: 'Same genus means the same family too.' },
    { text: 'They are not related', ok: false, why: 'Sharing a genus means they are closely related.' } ] },
  { emoji: '🍄', title: 'Not a plant', story: 'Why are mushrooms put in the kingdom Fungi, not Plantae?', idea: 'Fungi cannot photosynthesise', options: [
    { text: 'They have no chlorophyll and absorb food from dead matter', ok: true, why: 'Fungi are saprophytes; their cell walls are made of chitin.' },
    { text: 'They are too small', ok: false, why: 'Size doesn’t decide the kingdom.' },
    { text: 'They have no cells', ok: false, why: 'Fungi are made of cells.' },
    { text: 'They are animals', ok: false, why: 'Fungi are a kingdom of their own.' } ] },
  { emoji: '🦠', title: 'No nucleus', story: 'Single-celled organisms with no nucleus belong to which kingdom?', idea: 'Monera are prokaryotes', options: [
    { text: 'Monera', ok: true, why: 'Bacteria have no nucleus: their DNA lies free in the cell.' },
    { text: 'Protista', ok: false, why: 'Protists do have a nucleus.' },
    { text: 'Fungi', ok: false, why: 'Fungi have nuclei.' },
    { text: 'Plantae', ok: false, why: 'Plants are many-celled with nuclei.' } ] },
  { emoji: '🌿', title: 'Fern clue', story: 'A plant has roots, stems, leaves and vascular tissue, but makes spores instead of seeds. Which group?', idea: 'Pteridophytes: vascular but seedless', options: [
    { text: 'Pteridophyta', ok: true, why: 'Ferns have vascular tissue but reproduce by spores.' },
    { text: 'Bryophyta', ok: false, why: 'Bryophytes have no vascular tissue.' },
    { text: 'Gymnosperms', ok: false, why: 'Gymnosperms make seeds.' },
    { text: 'Thallophyta', ok: false, why: 'Thallophytes have no roots, stems or leaves.' } ] },
  { emoji: '🌲', title: 'Naked seeds', story: 'Pine trees make seeds on cones, not inside fruits. They are…', idea: 'Gymnosperm means “naked seed”', options: [
    { text: 'Gymnosperms', ok: true, why: 'Their seeds are not enclosed in a fruit.' },
    { text: 'Angiosperms', ok: false, why: 'Angiosperm seeds are inside fruits.' },
    { text: 'Bryophytes', ok: false, why: 'Bryophytes have no seeds.' },
    { text: 'Algae', ok: false, why: 'Algae have no seeds.' } ] },
  { emoji: '🦀', title: 'Biggest group', story: 'Crabs, spiders and butterflies all have jointed legs and an exoskeleton. Their phylum is…', idea: 'Arthropoda: “jointed legs”', options: [
    { text: 'Arthropoda', ok: true, why: 'The largest animal phylum.' },
    { text: 'Mollusca', ok: false, why: 'Molluscs have soft bodies and a foot.' },
    { text: 'Annelida', ok: false, why: 'Annelids are segmented worms without legs.' },
    { text: 'Echinodermata', ok: false, why: 'Echinoderms have spiny skin.' } ] },
  { emoji: '🐬', title: 'Not a fish', story: 'A dolphin lives in the sea and has fins. Why is it a mammal?', idea: 'Mammals breathe air with lungs and feed young on milk', options: [
    { text: 'It breathes with lungs and feeds its young on milk', ok: true, why: 'Those are mammal features, even in the sea.' },
    { text: 'It is very intelligent', ok: false, why: 'Intelligence isn’t used for classification.' },
    { text: 'It has gills', ok: false, why: 'Dolphins have no gills.' },
    { text: 'It lives in water', ok: false, why: 'Fish also live in water; habitat doesn’t decide the class.' } ] },
  { emoji: '🐸', title: 'Double life', story: 'Which vertebrate class lives partly in water and partly on land, with moist skin and eggs laid in water?', idea: 'Amphibians: “double life”', options: [
    { text: 'Amphibians', ok: true, why: 'Frogs and toads start life in water with gills.' },
    { text: 'Reptiles', ok: false, why: 'Reptiles have dry scaly skin and lay eggs on land.' },
    { text: 'Fish', ok: false, why: 'Fish live in water all their lives.' },
    { text: 'Birds', ok: false, why: 'Birds have feathers.' } ] },
]

export default function ClassificationMaster() {
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
      if (!useProgress.getState().badges.includes('classification-master')) addXp(25 + hearts * 10, 'Classification Master!')
      awardBadge('classification-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="classification-master" title="Boss Challenge: Classification Master" subtitle="Ten problems on kingdoms, names, plant groups and animal phyla." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🦚</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Classification Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
              <p className="mt-1 font-semibold">🧠 Biology idea: {p.idea}</p>
              {hearts > 0 ? <Button className="mt-3" autoFocus onClick={next}>{i + 1 < problems.length ? 'Next problem →' : 'Finish'}</Button> : <Button className="mt-3" variant="outline" onClick={() => setPicked(null)}>See result</Button>}
            </motion.div>
          )}
        </motion.div>
      )}
    </LabFrame>
  )
}
