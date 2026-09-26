const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

function below100(n: number) {
  return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '')
}
function below1000(n: number) {
  const h = Math.floor(n / 100)
  const r = n % 100
  return [h ? `${ONES[h]} hundred` : '', r ? below100(r) : ''].filter(Boolean).join(' ')
}

/** Number name in the Indian system (crore, lakh, thousand), e.g. 205030 → "two lakh five thousand thirty". */
export function indianWords(n: number): string {
  if (n === 0) return 'zero'
  const parts: string[] = []
  const crore = Math.floor(n / 1e7)
  const lakh = Math.floor((n % 1e7) / 1e5)
  const thousand = Math.floor((n % 1e5) / 1000)
  const rest = n % 1000
  if (crore) parts.push(`${indianWords(crore)} crore`)
  if (lakh) parts.push(`${below100(lakh)} lakh`)
  if (thousand) parts.push(`${below100(thousand)} thousand`)
  if (rest) parts.push(below1000(rest))
  return parts.join(' ')
}

/** 1234567 → "12,34,567" */
export const indianCommas = (n: number) => n.toLocaleString('en-IN')
/** 1234567 → "1,234,567" */
export const internationalCommas = (n: number) => n.toLocaleString('en-US')
