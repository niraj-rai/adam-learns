/**
 * Web Audio helpers for the sound labs. Playing sound is the whole point of these labs, so they play when the
 * learner presses a button even if the app's feedback sounds are muted. Volumes are kept deliberately low.
 */
let ctx: AudioContext | null = null

export function audio() {
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** A struck or plucked note: quick attack, exponential decay, plus a quiet overtone for a richer sound. */
export function playNote(freq: number, { duration = 1.2, volume = 0.18, overtone = 0.25 }: { duration?: number; volume?: number; overtone?: number } = {}) {
  const c = audio()
  if (!c) return
  const now = c.currentTime
  const out = c.createGain()
  out.gain.setValueAtTime(0.0001, now)
  out.gain.exponentialRampToValueAtTime(volume, now + 0.01)
  out.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  out.connect(c.destination)
  ;[
    [freq, 1],
    [freq * 2.76, overtone],
  ].forEach(([f, g]) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.frequency.value = f
    gain.gain.value = g
    osc.connect(gain).connect(out)
    osc.start(now)
    osc.stop(now + duration + 0.05)
  })
}

/** A continuous tone you can change while it plays. Remember to call stop(). */
export function startTone(freq: number, volume: number, type: OscillatorType = 'sine') {
  const c = audio()
  if (!c) return null
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.value = 0
  gain.gain.setTargetAtTime(volume, c.currentTime, 0.02)
  osc.connect(gain).connect(c.destination)
  osc.start()
  return {
    set(f: number, v: number) {
      osc.frequency.setTargetAtTime(f, c.currentTime, 0.02)
      gain.gain.setTargetAtTime(v, c.currentTime, 0.02)
    },
    stop() {
      gain.gain.setTargetAtTime(0, c.currentTime, 0.03)
      osc.stop(c.currentTime + 0.2)
    },
  }
}
