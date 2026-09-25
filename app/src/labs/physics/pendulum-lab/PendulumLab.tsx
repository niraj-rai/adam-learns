import { useRef, useState } from 'react'
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useAnimationFrame } from '../../_kit/canvas'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { periodOf } from './model'


type Row = { L: number; m: number; a: number; t10: number }

export default function PendulumLab() {
  const [L, setL] = useState(50)
  const [m, setM] = useState(100)
  const [amp, setAmp] = useState(15)
  const [fast, setFast] = useState(false)
  const [timing, setTiming] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const [angle, setAngle] = useState(amp)
  const clock = useRef(0)
  const timer = useRef(0)
  const T = periodOf(L)

  useAnimationFrame((dt) => {
    const speed = fast ? 4 : 1
    clock.current += dt * speed
    setAngle(amp * Math.cos((2 * Math.PI * clock.current) / T))
    if (timing) {
      timer.current += dt * speed
      if (timer.current >= 10 * T) {
        setTiming(false)
        // a human pressing a stopwatch adds a little random error (reaction time)
        const measured = 10 * T + (Math.random() - 0.5) * 0.3
        setRows((r) => [...r, { L, m, a: amp, t10: Math.round(measured * 100) / 100 }].slice(-12))
        sfx.click()
      }
    }
  })

  const start = () => {
    clock.current = 0
    timer.current = 0
    setTiming(true)
  }

  const len = 40 + (L / 150) * 200
  const rad = (angle * Math.PI) / 180
  const bx = 160 + len * Math.sin(rad)
  const by = 20 + len * Math.cos(rad)
  const bobR = 7 + (m / 200) * 9
  const seconds = rows.some((r) => Math.abs(r.t10 / 10 - 2) < 0.03)

  return (
    <LabFrame
      labId="pendulum-lab"
      title="Pendulum Lab"
      subtitle="What affects how long one swing takes? Run a fair test."
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>One <b>oscillation</b> = one full swing there and back. The time for one oscillation is the <b>time period</b>.</li>
          <li>Press <b>Time 10 oscillations</b>, then divide by 10. (Timing 10 swings reduces the error from your reaction time.)</li>
          <li>Change ONE thing at a time: length, mass of the bob, or how far you pull it back.</li>
        </ul>
      }
    >
      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        <div>
          <svg viewBox="0 0 320 290" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Pendulum ${L} cm long swinging`}>
            <rect x={100} y={10} width={120} height={10} rx={2} fill="#78716c" />
            <line x1={160} y1={20} x2={bx} y2={by} stroke="#475569" strokeWidth={1.5} />
            <circle cx={bx} cy={by} r={bobR} fill="#6366f1" stroke="#312e81" />
            <path d={`M ${160 + 40 * Math.sin((-amp * Math.PI) / 180)} ${20 + 40 * Math.cos((amp * Math.PI) / 180)} A 40 40 0 0 0 ${160 + 40 * Math.sin((amp * Math.PI) / 180)} ${20 + 40 * Math.cos((amp * Math.PI) / 180)}`} fill="none" stroke="#a5b4fc" strokeDasharray="3 3" />
            <line x1={160} y1={20} x2={160} y2={280} stroke="#cbd5e1" strokeDasharray="2 4" />
          </svg>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button onClick={start} disabled={timing}>⏱️ {timing ? `Timing… ${(timer.current).toFixed(1)} s` : 'Time 10 oscillations'}</Button>
            <Button variant={fast ? 'default' : 'outline'} onClick={() => setFast((f) => !f)}>{fast ? '⏩ Fast-forward on' : '⏩ Fast-forward'}</Button>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Length of string', unit: 'cm', v: L, set: setL, min: 10, max: 150, step: 0.5 },
            { label: 'Mass of bob', unit: 'g', v: m, set: setM, min: 20, max: 200, step: 10 },
            { label: 'Release angle', unit: '°', v: amp, set: setAmp, min: 5, max: 30, step: 1 },
          ].map((c) => (
            <label key={c.label} className="block text-sm">
              {c.label}: <b>{c.v} {c.unit}</b>
              <Slider value={[c.v]} min={c.min} max={c.max} step={c.step} disabled={timing} onValueChange={([v]) => c.set(v)} className="mt-1.5" aria-label={c.label} />
            </label>
          ))}
          {rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[360px] text-sm">
                <thead className="text-left text-xs text-muted-foreground uppercase">
                  <tr><th>Length</th><th>Mass</th><th>Angle</th><th>Time for 10</th><th>Period</th></tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-1">{r.L} cm</td><td>{r.m} g</td><td>{r.a}°</td><td>{r.t10.toFixed(2)} s</td><td className="font-semibold">{(r.t10 / 10).toFixed(2)} s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {rows.length >= 2 && (
        <div className="mt-4 h-56 rounded-xl border bg-background p-2">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="L" type="number" name="Length" unit=" cm" domain={[0, 150]} tick={{ fontSize: 11 }} label={{ value: 'length (cm)', position: 'insideBottom', offset: -8, fontSize: 11 }} />
              <YAxis dataKey="p" type="number" name="Period" unit=" s" domain={[0, 3]} tick={{ fontSize: 11 }} width={40} />
              <Tooltip />
              <Scatter data={rows.map((r) => ({ L: r.L, p: Math.round((r.t10 / 10) * 100) / 100 }))} fill="var(--chem)" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className={cn('mt-4 rounded-xl border p-3 text-sm', seconds ? 'border-success/50 bg-success-soft' : 'bg-muted/40')}>
        <p className="font-semibold">🎯 Challenge: build a "seconds pendulum" with a period of exactly 2.00 s (1 s each way, used in old grandfather clocks).</p>
        {seconds && <p className="mt-1" role="status">🎉 You did it! A length of about 99 cm gives a 2-second period.</p>}
      </div>
      <Readout className="mt-3" label="Hint" value={<span className="text-sm font-normal">Which of the three changes actually changes the period? Test each one while keeping the other two the same.</span>} />
    </LabFrame>
  )
}
