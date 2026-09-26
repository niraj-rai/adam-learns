import { describe, expect, it } from 'vitest'
import { renderNotes, toWav } from './sound'

describe('synthesised sounds', () => {
  it('renders notes with the right length and loudness', () => {
    const s = renderNotes({ freqs: [440, 660], duration: 0.2, wave: 'sine', gap: 0.1, peak: 0.5 }, 8000)
    expect(s.length).toBe(Math.ceil((0.1 + 0.2 + 0.03) * 8000))
    const max = Math.max(...s.map(Math.abs))
    expect(max).toBeGreaterThan(0.3)
    expect(max).toBeLessThanOrEqual(1)
    expect(Math.abs(s.at(-1)!)).toBeLessThan(0.01)
  })
  it('makes a valid WAV file', async () => {
    const wav = toWav(new Float32Array([0, 0.5, -0.5, 1]), 8000)
    const bytes = new Uint8Array(await wav.arrayBuffer())
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe('RIFF')
    expect(String.fromCharCode(...bytes.slice(8, 12))).toBe('WAVE')
    expect(bytes.length).toBe(44 + 4 * 2)
    expect(wav.type).toBe('audio/wav')
  })
})
