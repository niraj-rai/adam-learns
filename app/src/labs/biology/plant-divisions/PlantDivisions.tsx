import { LabFrame } from '../../_kit/LabFrame'
import { KeyExplorer } from '../_shared/KeyExplorer'
import { PLANT_KEY, PLANT_SPECIMENS } from '../_shared/keys'

export default function PlantDivisions() {
  return (
    <LabFrame labId="plant-divisions" title="Plant Kingdom Key" subtitle="Five big groups of plants, sorted by body parts, water-carrying tissue, seeds and fruits." howTo={<p>Pick a plant. Read its description and answer each yes/no question to key it out into its group.</p>}>
      <KeyExplorer keyData={PLANT_KEY} specimens={PLANT_SPECIMENS} />
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Plants are grouped by <b>how complex their body is</b>: whether it is divided into roots, stems and leaves, whether it has <b>vascular tissue</b>, whether it makes <b>seeds</b>, and whether the seeds are <b>inside fruits</b>. Thallophyta, Bryophyta and Pteridophyta have no seeds (cryptogams); gymnosperms and angiosperms are seed plants (phanerogams).</p>
    </LabFrame>
  )
}
