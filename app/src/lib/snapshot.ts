/**
 * A small, read-only progress snapshot a learner can share with a parent as a link.
 * The data travels in the link's #fragment, which browsers never send to a server.
 */

export type Snapshot = {
  v: 1
  /** first name */
  n: string
  /** grade */
  g: number | null
  /** date the snapshot was made (local YYYY-MM-DD) */
  d: string
  xp: number
  /** current streak (days) */
  st: number
  /** active days in the last 14 */
  ad: number
  /** badges earned */
  b: number
  /** review questions due */
  due: number
  /** per subject (learner's grade path): [mastered, started, total] */
  s: Record<string, [number, number, number]>
  /** time in seconds: today, this week, all time, the last 14 days (oldest first), and per subject this week */
  t: { to: number; wk: number; all: number; days: number[]; sub: Record<string, number> }
  /** topics needing attention and recently mastered (topic keys, up to 5 each) */
  w: string[]
  r: string[]
  /** latest exams: [subjectId, grade, format, earned, total, date] */
  ex: [string, number, 'cbse' | 'ib', number, number, string][]
}

const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const unb64url = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

async function pipe(bytes: Uint8Array<ArrayBuffer>, stream: CompressionStream | DecompressionStream) {
  const out = new Blob([bytes]).stream().pipeThrough(stream)
  return new Uint8Array(await new Response(out).arrayBuffer())
}

/** Encode as "z.<base64url deflate>" (or "j.<base64url json>" where compression isn't available). */
export async function encodeSnapshot(s: Snapshot): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(s))
  if (typeof CompressionStream === 'undefined') return `j.${b64url(json)}`
  return `z.${b64url(await pipe(json, new CompressionStream('deflate-raw')))}`
}

/** Decode a shared snapshot; null if the text isn't a valid one. */
export async function decodeSnapshot(text: string): Promise<Snapshot | null> {
  try {
    const [kind, body] = [text.slice(0, 2), text.slice(2)]
    let bytes: Uint8Array<ArrayBuffer> = unb64url(body)
    if (kind === 'z.') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'))
    else if (kind !== 'j.') return null
    const s = JSON.parse(new TextDecoder().decode(bytes)) as Snapshot
    if (s?.v !== 1 || typeof s.n !== 'string' || typeof s.xp !== 'number' || typeof s.s !== 'object' || !s.t) return null
    return { ...s, w: s.w ?? [], r: s.r ?? [], ex: s.ex ?? [] }
  } catch {
    return null
  }
}
