import { LabFrame } from '../../_kit/LabFrame'
import { KeyExplorer } from '../_shared/KeyExplorer'
import { ANIMAL_KEY, ANIMAL_SPECIMENS } from '../_shared/keys'

export default function AnimalPhyla() {
  return (
    <LabFrame labId="animal-phyla" title="Animal Kingdom Key" subtitle="From sponges to mammals: sort animals into their phyla and vertebrate classes." howTo={<p>Pick an animal, read its description and answer the questions to find its group.</p>}>
      <KeyExplorer keyData={ANIMAL_KEY} specimens={ANIMAL_SPECIMENS} />
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Animals are grouped by <b>body design</b>: body symmetry, body layers and cavity, segments, jointed legs, a backbone. About 95% of animal species are <b>invertebrates</b>. Chordates have a notochord; vertebrates (fish, amphibians, reptiles, birds and mammals) have a backbone.</p>
    </LabFrame>
  )
}
