/** Price after a discount, then GST added on the discounted price. */
export const afterDiscount = (mp: number, d: number) => mp * (1 - d / 100)
export const withGst = (price: number, g: number) => price * (1 + g / 100)
export const profitPercent = (cp: number, sp: number) => ((sp - cp) / cp) * 100
export const ITEMS = [
  { name: 'Cricket bat', emoji: '🏏', cp: 1500, mp: 2000 },
  { name: 'School bag', emoji: '🎒', cp: 800, mp: 1200 },
  { name: 'Headphones', emoji: '🎧', cp: 2400, mp: 3000 },
  { name: 'Mango box', emoji: '🥭', cp: 500, mp: 600 },
]
