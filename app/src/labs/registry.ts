import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export type LabInfo = {
  id: string
  title: string
  description: string
  subject: 'chemistry' | 'physics' | 'biology' | 'mathematics'
  emoji: string
  /** topic keys that use this lab */
  topics: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: LazyExoticComponent<ComponentType<any>>
}

export const LABS: LabInfo[] = [
  {
    id: 'matter-or-not',
    title: 'Matter or Not?',
    description: 'A quick card game: does it have mass and take up space?',
    subject: 'chemistry',
    emoji: '🃏',
    topics: ['chemistry/matter/what-is-matter'],
    component: lazy(() => import('./chemistry/matter-or-not/MatterOrNot')),
  },
  {
    id: 'particle-simulator',
    title: 'Particle Simulator',
    description: 'Heat and cool 5 substances. Watch particles and draw the heating curve.',
    subject: 'chemistry',
    emoji: '⚛️',
    topics: ['chemistry/matter/states-of-matter', 'chemistry/matter/changes-of-state'],
    component: lazy(() => import('./chemistry/particle-simulator/ParticleSimulator')),
  },
  {
    id: 'diffusion-race',
    title: 'Diffusion Race',
    description: 'Design a fair test: does temperature or medium make dye spread faster?',
    subject: 'chemistry',
    emoji: '🏁',
    topics: ['chemistry/matter/diffusion'],
    component: lazy(() => import('./chemistry/diffusion-race/DiffusionRace')),
  },
  {
    id: 'syringe-squeeze',
    title: 'Syringe Squeeze',
    description: 'Push sealed syringes of solid, liquid and gas. Which one squashes?',
    subject: 'chemistry',
    emoji: '💉',
    topics: ['chemistry/matter/forces-and-spaces'],
    component: lazy(() => import('./chemistry/syringe-squeeze/SyringeSqueeze')),
  },
  {
    id: 'density-tower',
    title: 'Density Tower',
    description: 'Calculate density, predict, and drop objects into oil, water and honey.',
    subject: 'chemistry',
    emoji: '🍯',
    topics: ['chemistry/matter/density'],
    component: lazy(() => import('./chemistry/density-tower/DensityTower')),
  },
]

export const getLab = (id: string) => LABS.find((l) => l.id === id)
