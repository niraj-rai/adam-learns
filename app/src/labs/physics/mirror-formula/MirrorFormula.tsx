import { LabFrame } from '../../_kit/LabFrame'
import { FormulaBench } from '../_shared/FormulaBench'

export default function MirrorFormula() {
  return (
    <LabFrame labId="mirror-formula" title="Mirror Formula Bench" subtitle="1/v + 1/u = 1/f: predict exactly where a curved mirror forms an image, and how big it is." howTo={<p>Choose a mirror and move the object. Distances are measured from the pole; anything in front of the mirror (where the object is) is negative. Watch the signs of v and m.</p>}>
      <FormulaBench kind="mirror" />
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>New Cartesian sign convention:</b> measure from the pole; distances in the direction of the incident light are positive, against it negative; heights above the axis are positive. A concave mirror has f negative; a convex mirror f positive. Magnification m = h′/h = −v/u.</p>
    </LabFrame>
  )
}
