export type Story = { title: string; x: string; y: string; pts: [number, number][]; options: string[]; answer: number; why: string }
export const STORIES: Story[] = [
  { title: 'Walk to school', x: 'time (min)', y: 'distance from home (m)', pts: [[0, 0], [5, 400], [8, 400], [15, 1000]], answer: 1,
    options: ['Adam walks up a hill, then down a hill', 'Adam walks, stops at a shop for 3 minutes, then walks the rest of the way faster', 'Adam walks at the same speed all the way', 'Adam walks to school and back home'],
    why: 'The flat part means the distance isn’t changing: he has stopped. The last part is steeper, so he is moving faster.' },
  { title: 'Water tank', x: 'time (min)', y: 'water in tank (L)', pts: [[0, 0], [10, 100], [15, 100], [25, 0]], answer: 2,
    options: ['The tank is always filling', 'The tank empties, then fills', 'The tank fills, stays full for 5 minutes, then drains', 'The tank fills faster and faster'],
    why: 'Rising line = filling, flat = staying the same, falling line = draining.' },
  { title: 'Bath time', x: 'time (min)', y: 'water depth (cm)', pts: [[0, 0], [8, 30], [9, 38], [20, 38], [21, 30], [28, 0]], answer: 0,
    options: ['Bath fills, someone gets in (depth jumps), soaks, gets out, then the bath drains', 'The bath fills twice', 'The tap is turned on and off repeatedly', 'Nobody uses the bath'],
    why: 'The sudden jump is a person getting in and raising the water level; the sudden drop is them getting out.' },
  { title: 'Cricket ball', x: 'time (s)', y: 'height (m)', pts: [[0, 1], [0.5, 4.8], [1, 7.1], [1.5, 7.9], [2, 7.2], [2.5, 5], [3, 1.3], [3.14, 0]], answer: 3,
    options: ['A ball rolling along the ground', 'A ball falling from a roof', 'A ball rising at a constant speed', 'A ball thrown upwards: it slows, stops at the top, then falls faster and faster'],
    why: 'The curve gets flatter at the top (slowing down) and steeper again as it falls (speeding up).' },
  { title: 'Cup of chai', x: 'time (min)', y: 'temperature (°C)', pts: [[0, 85], [5, 62], [10, 48], [15, 39], [20, 34], [30, 29], [40, 27]], answer: 1,
    options: ['The chai heats up steadily', 'The chai cools quickly at first, then more slowly as it nears room temperature', 'The chai cools at a steady rate', 'The chai stays hot'],
    why: 'The graph is steep at first and flattens out: cooling slows down as the chai gets closer to room temperature.' },
]
