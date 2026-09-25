/**
 * Typical growth rate (cm per year) by age, simplified from growth-reference data.
 * Girls’ growth spurt tends to peak around 11–12, boys’ around 13–14. Every individual is different!
 */
export function growthRate(age: number, sex: 'girls' | 'boys') {
  const peakAge = sex === 'girls' ? 11.5 : 13.5
  const peak = sex === 'girls' ? 8 : 9.5
  const base = age < 10 ? 5.5 : Math.max(0.5, 5.5 - (age - 10) * 0.9)
  const spurt = peak * Math.exp(-(((age - peakAge) / 1.2) ** 2))
  return Math.round(Math.max(base, spurt) * 10) / 10
}

export const HORMONES = [
  { gland: 'Pituitary gland', hormone: 'Growth hormone', job: 'Controls growth; also signals other glands to start puberty' },
  { gland: 'Thyroid', hormone: 'Thyroxine', job: 'Controls how fast the body uses energy; needs iodine' },
  { gland: 'Adrenal glands', hormone: 'Adrenaline', job: 'Prepares the body to react in stress or danger' },
  { gland: 'Testes', hormone: 'Testosterone', job: 'Brings about puberty changes in boys' },
  { gland: 'Ovaries', hormone: 'Oestrogen', job: 'Brings about puberty changes in girls' },
]

export const MYTHS = [
  { statement: 'Everyone starts puberty at exactly the same age.', fact: false, why: 'Puberty can begin anywhere from about 8 to 14, and it is normal to be earlier or later than friends.' },
  { statement: 'Eating a balanced diet with enough iron, calcium and protein supports healthy growth during adolescence.', fact: true, why: 'The growth spurt needs extra nutrients.' },
  { statement: 'Pimples happen because you are dirty.', fact: false, why: 'Hormones make skin glands more active. Washing the face gently helps, but acne is not a sign of being dirty.' },
  { statement: 'Your voice may crack as the voice box (larynx) grows.', fact: true, why: 'This is especially noticeable in boys (the “Adam’s apple”) and settles with time.' },
  { statement: 'Periods (menstruation) are a sign of illness.', fact: false, why: 'Menstruation is a natural, healthy part of growing up for girls.' },
  { statement: 'It helps to talk to a trusted adult about worries while growing up.', fact: true, why: 'Parents, teachers, doctors and counsellors can help.' },
]
