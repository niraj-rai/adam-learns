import { useSettings } from '@/stores/settings'

type Wave = 'sine' | 'triangle'
type Spec = { freqs: number[]; duration: number; wave: Wave; gap: number; peak: number }

const RATE = 22050

const waveAt = (wave: Wave, phase: number) => (wave === 'sine' ? Math.sin(2 * Math.PI * phase) : 1 - 4 * Math.abs(((phase + 0.25) % 1) - 0.5))

/** Synthesise a sequence of notes into 16-bit mono PCM samples, with a short attack and an exponential fade. */
export function renderNotes({ freqs, duration, wave, gap, peak }: Spec, rate = RATE) {
  const total = Math.ceil(((freqs.length - 1) * gap + duration + 0.03) * rate)
  const out = new Float32Array(total)
  freqs.forEach((f, i) => {
    const start = Math.round(i * gap * rate)
    const len = Math.round(duration * rate)
    const attack = Math.round(0.01 * rate)
    for (let n = 0; n < len && start + n < total; n++) {
      const env = n < attack ? n / attack : Math.pow(0.0001, (n - attack) / (len - attack))
      out[start + n] += peak * env * waveAt(wave, (f * n) / rate)
    }
  })
  return out
}

/** Wrap samples in a WAV file so a plain <audio> element can play them. */
export function toWav(samples: Float32Array, rate = RATE) {
  const buf = new ArrayBuffer(44 + samples.length * 2)
  const v = new DataView(buf)
  const str = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)))
  str(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); str(8, 'WAVE')
  str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  str(36, 'data'); v.setUint32(40, samples.length * 2, true)
  samples.forEach((s, i) => v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 0x7fff, true))
  return new Blob([buf], { type: 'audio/wav' })
}

const urls = new Map<string, string>()

/**
 * Plays through an <audio> element rather than Web Audio: it isn't silenced by the iPhone/iPad ring switch
 * and doesn't depend on an AudioContext that may have been created (and suspended) before the first click.
 */
function play(name: string, spec: Spec) {
  if (!useSettings.getState().sound) return
  try {
    let url = urls.get(name)
    if (!url) {
      url = URL.createObjectURL(toWav(renderNotes(spec)))
      urls.set(name, url)
    }
    void new Audio(url).play().catch(() => {})
  } catch {
    // audio is optional
  }
}

const S = (freqs: number[], duration: number, wave: Wave = 'sine', gap = 0.09, peak = 0.3): Spec => ({ freqs, duration, wave, gap, peak })

/** Tiny synthesized sounds, so no audio files are needed. */
export const sfx = {
  correct: () => play('correct', S([660, 880], 0.14)),
  wrong: () => play('wrong', S([220, 180], 0.16, 'triangle')),
  click: () => play('click', S([520], 0.05, 'sine', 0.09, 0.2)),
  win: () => play('win', S([523, 659, 784, 1047], 0.18, 'sine', 0.1)),
  /** study-plan reminder: a clear three-note chime */
  chime: () => play('chime', S([784, 988, 1319], 0.6, 'sine', 0.22, 0.7)),
  /** study session starts now: a brighter rising call, played twice */
  start: () => play('start', S([523, 784, 1047, 523, 784, 1047], 0.22, 'triangle', 0.14, 0.7)),
}
