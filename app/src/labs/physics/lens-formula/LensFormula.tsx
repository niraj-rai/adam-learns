import { LabFrame } from '../../_kit/LabFrame'
import { FormulaBench } from '../_shared/FormulaBench'

export default function LensFormula() {
  return (
    <LabFrame labId="lens-formula" title="Lens Formula Bench" subtitle="1/v − 1/u = 1/f and power P = 1/f: the maths behind cameras, spectacles and projectors." howTo={<p>Choose a lens and move the object. Distances are measured from the optical centre; the object side is negative. Try to make a real image twice the size of the object.</p>}>
      <FormulaBench kind="lens" />
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">A convex (converging) lens has a positive focal length and positive power; a concave (diverging) lens has negative ones. Power is measured in <b>dioptres</b> (D) with f in metres: a +2 D lens has f = 50 cm. Opticians add the powers of lenses placed together: P = P₁ + P₂.</p>
    </LabFrame>
  )
}
