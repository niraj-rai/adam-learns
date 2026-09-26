/** Degrees for each slice of a pie chart. */
export const pieAngles = (values: number[]) => { const t = values.reduce((a, b) => a + b, 0); return values.map((v) => (v / t) * 360) }
export const DATASETS = [
  { id: 'day', title: 'How Adam spends a school day', unit: 'hours', items: [{ l: 'Sleep', v: 9 }, { l: 'School', v: 7 }, { l: 'Homework', v: 2 }, { l: 'Play', v: 2 }, { l: 'Meals', v: 2 }, { l: 'Other', v: 2 }] },
  { id: 'sport', title: 'Favourite sport (120 students)', unit: 'students', items: [{ l: 'Cricket', v: 45 }, { l: 'Football', v: 30 }, { l: 'Badminton', v: 20 }, { l: 'Basketball', v: 15 }, { l: 'Kabaddi', v: 10 }] },
  { id: 'rain', title: 'Bengaluru average monthly rainfall (approx.)', unit: 'mm', items: [{ l: 'Jun', v: 105 }, { l: 'Jul', v: 115 }, { l: 'Aug', v: 145 }, { l: 'Sep', v: 210 }, { l: 'Oct', v: 185 }, { l: 'Nov', v: 55 }] },
]
