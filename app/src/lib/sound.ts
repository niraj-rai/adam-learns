import { useSettings } from '@/stores/settings'

let ctx: AudioContext | null = null

function tone(freqs: number[], duration = 0.12, type: OscillatorType = 'sine', gap = 0.09) {
  if (!useSettings.getState().sound) return
  try {
    ctx ??= new AudioContext()
    const now = ctx.currentTime
    freqs.forEach((f, i) => {
      const osc = ctx!.createOscillator()
      const gain = ctx!.createGain()
      osc.type = type
      osc.frequency.value = f
      const start = now + i * gap
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
      osc.connect(gain).connect(ctx!.destination)
      osc.start(start)
      osc.stop(start + duration + 0.02)
    })
  } catch {
    // audio is optional
  }
}

/** Tiny synthesized sounds, so no audio files are needed. */
export const sfx = {
  correct: () => tone([660, 880], 0.14),
  wrong: () => tone([220, 180], 0.16, 'triangle'),
  click: () => tone([520], 0.05),
  win: () => tone([523, 659, 784, 1047], 0.18, 'sine', 0.1),
}
