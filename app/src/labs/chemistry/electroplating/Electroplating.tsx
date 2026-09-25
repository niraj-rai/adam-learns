import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'

const LIQUIDS = [
  { id: 'distilled', name: 'Distilled water', conducts: 0, why: 'Pure water has almost no ions (charged particles) to carry the current.' },
  { id: 'tap', name: 'Tap water', conducts: 0.35, why: 'Tap water contains a few dissolved salts, so it conducts weakly. That is why electricity near water is dangerous!' },
  { id: 'salt', name: 'Salt water', conducts: 1, why: 'Dissolved salt splits into ions that carry the current well.' },
  { id: 'lemon', name: 'Lemon juice', conducts: 0.7, why: 'Acids form ions in water, so they conduct.' },
  { id: 'sugar', name: 'Sugar water', conducts: 0, why: 'Sugar dissolves as whole molecules, not ions, so it does not conduct.' },
  { id: 'oil', name: 'Cooking oil', conducts: 0, why: 'Oil has no ions: it is an insulator.' },
  { id: 'cuso4', name: 'Copper sulfate solution', conducts: 0.9, why: 'Copper sulfate forms copper ions and sulfate ions, so it conducts well.' },
]

export default function Electroplating() {
  const [tab, setTab] = useState<'conduct' | 'plate'>('conduct')
  const [liquid, setLiquid] = useState('salt')
  const [tested, setTested] = useState<string[]>([])
  const l = LIQUIDS.find((x) => x.id === liquid)!

  // electroplating state
  const [current, setCurrent] = useState(3)
  const [on, setOn] = useState(false)
  const [reversed, setReversed] = useState(false)
  const [coat, setCoat] = useState(0) // 0–1 thickness on the key
  const [anode, setAnode] = useState(1) // copper plate remaining
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (timer.current) clearInterval(timer.current)
    if (!on) return
    let last = performance.now()
    timer.current = setInterval(() => {
      // time-based, so plating speed doesn't depend on how often the timer fires
      const now = performance.now()
      const d = current * 0.02 * ((now - last) / 1000)
      last = now
      if (reversed) {
        setCoat((c) => Math.max(0, c - d))
      } else {
        setCoat((c) => Math.min(1, c + d))
        setAnode((a) => Math.max(0.2, a - d * 0.8))
      }
    }, 100)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [on, current, reversed])

  useEffect(() => {
    if (coat >= 1 && on) {
      setOn(false)
      sfx.win()
    }
  }, [coat, on])

  return (
    <LabFrame
      labId="electroplating"
      title="Electricity in Liquids & Electroplating"
      subtitle="Which liquids conduct? Then use electricity to copper-plate an iron key."
      howTo={<p>Tab 1: dip the tester into each liquid. Does the bulb glow? Tab 2: connect an iron key and a copper plate in copper sulfate solution, switch on and watch the key change colour.</p>}
    >
      <div className="mb-3 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {(['conduct', 'plate'] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('rounded-md px-3 py-1', tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
            {t === 'conduct' ? '💡 Does it conduct?' : '🔑 Electroplating'}
          </button>
        ))}
      </div>

      {tab === 'conduct' ? (
        <div className="grid gap-4 md:grid-cols-[1fr_260px]">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {LIQUIDS.map((x) => (
                <button key={x.id} type="button" onClick={() => { setLiquid(x.id); setTested((t) => (t.includes(x.id) ? t : [...t, x.id])) }} className={cn('rounded-full border px-3 py-1.5 text-sm', x.id === liquid ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
                  {x.name}
                </button>
              ))}
            </div>
            <svg viewBox="0 0 240 170" className="mx-auto w-full max-w-sm" role="img" aria-label={`Tester in ${l.name}: bulb ${l.conducts > 0.5 ? 'glows brightly' : l.conducts > 0 ? 'glows dimly' : 'stays off'}`}>
              <rect x={20} y={10} width={40} height={24} rx={3} fill="#334155" />
              <text x={40} y={26} textAnchor="middle" fontSize={10} fill="#fff">battery</text>
              <circle cx={200} cy={22} r={14} fill={l.conducts > 0 ? `rgba(250,204,21,${0.3 + l.conducts * 0.7})` : '#e5e7eb'} stroke="#a3a3a3" />
              {l.conducts > 0.5 && <circle cx={200} cy={22} r={24} fill="#fde047" opacity={0.3} />}
              <path d="M60 22 H186 M40 34 V90 M200 36 V90" stroke="#64748b" strokeWidth={2} fill="none" />
              <path d="M60 60 V160 H180 V60" fill="none" stroke="currentColor" strokeOpacity={0.4} strokeWidth={2.5} />
              <rect x={62} y={90} width={116} height={68} fill={liquid === 'cuso4' ? '#7dd3fc' : liquid === 'oil' ? '#fde68a' : liquid === 'lemon' ? '#fef9c3' : '#e0f2fe'} opacity={0.8} />
              <rect x={36} y={80} width={8} height={60} fill="#78716c" />
              <rect x={196} y={80} width={8} height={60} fill="#78716c" />
            </svg>
          </div>
          <div className="space-y-2">
            <Readout label="Bulb" value={l.conducts > 0.5 ? '💡 Bright' : l.conducts > 0 ? '🔅 Dim' : '⚫ Off'} />
            <p className="rounded-xl bg-chem-soft p-3 text-sm">{l.why}</p>
            <p className="text-xs text-muted-foreground">Liquids tested: {tested.length} / {LIQUIDS.length}</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[1fr_260px]">
          <svg viewBox="0 0 260 200" className="w-full rounded-xl border bg-background" role="img" aria-label={`Iron key ${Math.round(coat * 100)}% copper plated`}>
            <rect x={100} y={8} width={60} height={26} rx={3} fill="#334155" />
            <text x={112} y={25} fontSize={12} fill="#fff">{reversed ? '+' : '−'}</text>
            <text x={142} y={25} fontSize={12} fill="#fff">{reversed ? '−' : '+'}</text>
            <path d="M110 34 V50 H70 V70 M150 34 V50 H190 V70" stroke="#64748b" strokeWidth={2} fill="none" />
            <path d="M40 60 V185 H220 V60" fill="none" stroke="currentColor" strokeOpacity={0.4} strokeWidth={2.5} />
            <rect x={42} y={80} width={176} height={103} fill="#38bdf8" opacity={0.55} />
            {/* iron key (cathode) */}
            <g>
              <circle cx={70} cy={100} r={14} fill="none" stroke="#6b7280" strokeWidth={7} />
              <rect x={66} y={112} width={8} height={55} fill="#6b7280" />
              <rect x={74} y={150} width={10} height={6} fill="#6b7280" />
              <rect x={74} y={160} width={8} height={6} fill="#6b7280" />
              <g opacity={coat}>
                <circle cx={70} cy={100} r={14} fill="none" stroke="#c2410c" strokeWidth={7.5} />
                <rect x={66} y={112} width={8} height={55} fill="#c2410c" />
                <rect x={74} y={150} width={10} height={6} fill="#c2410c" />
                <rect x={74} y={160} width={8} height={6} fill="#c2410c" />
              </g>
            </g>
            {/* copper plate (anode) */}
            <rect x={185} y={70} width={10 * anode + 2} height={100} fill="#c2410c" />
            {on && !reversed &&
              Array.from({ length: 6 }, (_, i) => (
                <motion.text key={i} fontSize={9} fill="#1d4ed8" animate={{ x: [180, 85], y: [100 + i * 10, 110 + i * 8] }} transition={{ repeat: Infinity, duration: 2 / current, delay: i * 0.2 }}>Cu²⁺</motion.text>
              ))}
            <text x={52} y={196} fontSize={9} className="fill-muted-foreground">iron key</text>
            <text x={170} y={196} fontSize={9} className="fill-muted-foreground">copper plate</text>
          </svg>
          <div className="space-y-2">
            <label className="block text-sm">
              Current: <b>{current}</b>
              <Slider value={[current]} min={1} max={5} step={1} onValueChange={([v]) => setCurrent(v)} className="mt-1.5" aria-label="Current" />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => setOn((o) => !o)} variant={on ? 'default' : 'outline'}>{on ? '⏸ Switch off' : '⚡ Switch on'}</Button>
              <Button variant="outline" onClick={() => setReversed((r) => !r)}>🔄 Swap wires</Button>
            </div>
            <Readout label="Copper coating" value={`${Math.round(coat * 100)}%`} />
            <Button variant="ghost" className="w-full" onClick={() => { setCoat(0); setAnode(1); setOn(false); setReversed(false) }}>New key</Button>
            <p className={cn('rounded-xl p-3 text-sm', reversed ? 'bg-warn-soft' : 'bg-chem-soft')} role="status">
              {reversed
                ? '⚠️ The key is now connected to the POSITIVE terminal. Copper will not coat it (any coating is removed). The object to be plated must go on the NEGATIVE terminal.'
                : coat >= 1
                  ? '🎉 Fully copper-plated! Copper ions from the solution gained electrons at the key and became copper metal. The copper plate slowly dissolves to replace them.'
                  : 'The key is on the NEGATIVE terminal. Copper ions (Cu²⁺) are attracted to it and deposit as copper metal.'}
            </p>
          </div>
        </div>
      )}
    </LabFrame>
  )
}
