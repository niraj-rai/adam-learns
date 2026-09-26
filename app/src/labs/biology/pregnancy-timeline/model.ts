export type Milestone = { week: number; title: string; text: string; size: string }

/** Approximate milestones, counted from fertilisation plus two weeks (as doctors count). */
export const MILESTONES: Milestone[] = [
  { week: 2, title: 'Fertilisation', text: 'A sperm and an egg fuse in the oviduct (fallopian tube) to form a single cell, the zygote. It carries half its DNA from each parent.', size: 'A single cell, smaller than a full stop' },
  { week: 3, title: 'Implantation', text: 'The zygote divides many times as it travels to the uterus, then embeds (implants) in the thick, soft uterus lining.', size: 'A tiny ball of cells' },
  { week: 6, title: 'Heartbeat', text: 'The embryo’s heart starts beating. The placenta is forming: it lets oxygen and food pass from the mother’s blood to the embryo, and wastes pass back, without the two bloods mixing.', size: 'About the size of a lentil' },
  { week: 12, title: 'All organs formed', text: 'All the main organs have formed. By now it is called a foetus, and from here on it mostly grows and matures.', size: 'About the size of a lemon (≈ 5–6 cm)' },
  { week: 20, title: 'First movements', text: 'The mother can feel kicks. The foetus can hear sounds, suck its thumb and has fingerprints.', size: 'About the length of a banana (≈ 25 cm)' },
  { week: 28, title: 'Eyes open', text: 'The eyes open and close, and the lungs keep developing. Babies born this early need special hospital care.', size: 'About 1 kg' },
  { week: 40, title: 'Birth', text: 'The muscles of the uterus contract rhythmically to push the baby out. Pregnancy (gestation) in humans lasts about 9 months.', size: 'About 50 cm long and around 3 kg' },
]

export const milestoneAt = (week: number) => [...MILESTONES].reverse().find((m) => m.week <= week) ?? MILESTONES[0]
