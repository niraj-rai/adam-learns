import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAnimationFrame } from '../../_kit/canvas'
import { LabFrame, Readout } from '../../_kit/LabFrame'

type MixtureId = 'salt' | 'ink'
const MIXTURES: Record<MixtureId, { name: string; color: string; flaskTest: string; solute: string }> = {
  salt: { name: 'Salt water', color: '#7dd3fc', flaskTest: 'Very salty! The salt stays behind, getting more concentrated.', solute: 'salt' },
  ink: { name: 'Inky water', color: '#2563eb', flaskTest: 'Dark blue and getting darker! The ink dye stays behind.', solute: 'ink' },
}

const START_ML = 100
const BOIL = 100

export default function Distillation() {
  const [mixture, setMixture] = useState<MixtureId>('ink')
  const [heat, setHeat] = useState(false)
  const [condenser, setCondenser] = useState(true)
  const [ui, setUi] = useState({ T: 25, flask: START_ML, collected: 0, escaped: 0 })
  const [test, setTest] = useState<string | null>(null)
  const s = useRef({ T: 25, flask: START_ML, collected: 0, escaped: 0, acc: 0, t: 0 })

  const reset = (m: MixtureId = mixture) => {
    s.current = { T: 25, flask: START_ML, collected: 0, escaped: 0, acc: 0, t: 0 }
    setUi({ T: 25, flask: START_ML, collected: 0, escaped: 0 })
    setHeat(false)
    setTest(null)
    setMixture(m)
  }

  useAnimationFrame((dt) => {
    const st = s.current
    st.t += dt
    if (heat) {
      if (st.T < BOIL) st.T = Math.min(BOIL, st.T + 12 * dt)
      else if (st.flask > 15) {
        const boiled = Math.min(st.flask - 15, 5 * dt)
        st.flask -= boiled
        if (condenser) {
          st.collected += boiled * 0.95
          st.escaped += boiled * 0.05
        } else {
          st.collected += boiled * 0.1
          st.escaped += boiled * 0.9
        }
      }
    } else if (st.T > 25) {
      st.T = Math.max(25, st.T - 6 * dt)
    }
    st.acc += dt
    if (st.acc > 0.1) {
      st.acc = 0
      setUi({ T: st.T, flask: st.flask, collected: st.collected, escaped: st.escaped })
    }
  })

  const m = MIXTURES[mixture]
  const boiling = heat && ui.T >= BOIL && ui.flask > 15
  const flaskLevel = (ui.flask / START_ML) * 60
  const collectedLevel = Math.min(58, (ui.collected / START_ML) * 70)
  const concentration = START_ML / Math.max(15, ui.flask)
  const dryWarning = heat && ui.flask <= 15.5

  // points along the vapour path: flask neck → side arm → condenser → receiver
  const path = [
    [100, 120],
    [100, 60],
    [140, 60],
    [330, 150],
    [345, 175],
  ]
  const vapour = boiling
    ? Array.from({ length: 10 }, (_, i) => {
        const f = (s.current.t * 0.35 + i / 10) % 1
        const seg = Math.min(path.length - 2, Math.floor(f * (path.length - 1)))
        const local = f * (path.length - 1) - seg
        const [x1, y1] = path[seg]
        const [x2, y2] = path[seg + 1]
        return { x: x1 + (x2 - x1) * local, y: y1 + (y2 - y1) * local, liquid: condenser && seg >= 2 && local > 0.3 }
      })
    : []

  return (
    <LabFrame
      labId="distillation"
      title="Distillation"
      subtitle="Get pure water back from a solution"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>Turn on the heat and watch the thermometer. What happens at 100 °C?</li>
          <li>Follow the vapour into the condenser, where cold water turns it back into a liquid.</li>
          <li>Try turning the condenser water off. How much water do you collect now?</li>
          <li>Test the liquid in the flask and in the beaker.</li>
        </ul>
      }
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(MIXTURES) as MixtureId[]).map((id) => (
          <button key={id} type="button" onClick={() => reset(id)} className={cn('rounded-full border px-3 py-1.5 text-sm', id === mixture ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
            {MIXTURES[id].name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <svg viewBox="0 0 420 270" className="w-full rounded-xl border bg-background" role="img" aria-label={`Distillation apparatus. Flask at ${ui.T.toFixed(0)} °C, ${ui.collected.toFixed(0)} mL of pure water collected.`}>
          {/* condenser jacket */}
          <line x1={160} y1={70} x2={320} y2={145} stroke={condenser ? '#38bdf8' : '#e5e7eb'} strokeWidth={22} strokeLinecap="round" opacity={0.6} />
          <line x1={140} y1={60} x2={335} y2={152} stroke="currentColor" strokeOpacity={0.5} strokeWidth={4} />
          {condenser && (
            <>
              <text x={300} y={178} fontSize={10} className="fill-sky-600">cold water in ↑</text>
              <text x={150} y={48} fontSize={10} className="fill-sky-600">warm water out ↑</text>
            </>
          )}
          <text x={235} y={92} fontSize={11} textAnchor="middle" className="fill-muted-foreground" transform="rotate(25 235 92)">condenser</text>

          {/* flask */}
          <path d="M92 58 V100 A40 40 0 1 0 108 100 V58" fill="none" stroke="currentColor" strokeOpacity={0.55} strokeWidth={3} />
          <clipPath id="flaskClip">
            <circle cx={100} cy={138} r={38} />
          </clipPath>
          <rect x={60} y={176 - flaskLevel} width={80} height={flaskLevel} fill={m.color} opacity={Math.min(0.95, 0.25 + 0.15 * concentration)} clipPath="url(#flaskClip)" />
          {boiling && [0, 1, 2, 3].map((i) => <circle key={i} cx={85 + i * 10} cy={170 - ((s.current.t * 40 + i * 13) % Math.max(10, flaskLevel))} r={2.5} fill="#fff" opacity={0.8} />)}

          {/* thermometer */}
          <rect x={97} y={24} width={6} height={50} rx={3} fill="#fff" stroke="#9ca3af" />
          <rect x={98.5} y={74 - (ui.T / 110) * 48} width={3} height={(ui.T / 110) * 48} fill="#ef4444" />
          <text x={110} y={30} fontSize={11} className="fill-foreground">{ui.T.toFixed(0)} °C</text>

          {/* burner */}
          <rect x={80} y={235} width={40} height={20} rx={3} fill="#64748b" />
          {heat && <path d="M100 232 C90 222 95 210 100 200 C105 210 110 222 100 232 Z" fill="#f97316" />}

          {/* receiver */}
          <path d="M325 170 V250 H385 V170" fill="none" stroke="currentColor" strokeOpacity={0.55} strokeWidth={3} />
          <rect x={327} y={248 - collectedLevel} width={56} height={collectedLevel} fill="#bae6fd" opacity={0.8} />
          <text x={355} y={265} fontSize={10} textAnchor="middle" className="fill-muted-foreground">distillate</text>

          {/* vapour → droplets */}
          {vapour.map((v, i) => (
            <circle key={i} cx={v.x} cy={v.y} r={v.liquid ? 2.8 : 3.5} fill={v.liquid ? '#0ea5e9' : '#cbd5e1'} opacity={0.9} />
          ))}
          {boiling && !condenser && <text x={345} y={140} fontSize={18}>💨</text>}
        </svg>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button size="lg" variant={heat ? 'default' : 'outline'} onClick={() => setHeat((h) => !h)}>
              🔥 {heat ? 'Heat off' : 'Heat on'}
            </Button>
            <Button size="lg" variant={condenser ? 'default' : 'outline'} onClick={() => setCondenser((c) => !c)}>
              ❄️ {condenser ? 'Cooling on' : 'Cooling off'}
            </Button>
          </div>
          <Readout label="Temperature" value={`${ui.T.toFixed(0)} °C`} />
          <div className="grid grid-cols-2 gap-2">
            <Readout label="Left in flask" value={`${ui.flask.toFixed(0)} mL`} />
            <Readout label="Collected" value={`${ui.collected.toFixed(0)} mL`} />
          </div>
          <p className="text-xs text-muted-foreground">Escaped as steam: {ui.escaped.toFixed(0)} mL</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" disabled={ui.collected < 2} onClick={() => setTest('distillate')}>
              Test distillate
            </Button>
            <Button variant="outline" size="sm" onClick={() => setTest('flask')}>
              Test flask
            </Button>
          </div>
          <Button variant="ghost" className="w-full" onClick={() => reset()}>
            Reset
          </Button>
        </div>
      </div>

      <div className="mt-3 space-y-2" aria-live="polite">
        {dryWarning && <p className="rounded-xl border border-warn/50 bg-warn-soft px-4 py-2 text-sm">⚠️ Stop heating before the flask boils dry. The solid left behind could crack the hot glass!</p>}
        {boiling && !condenser && <p className="rounded-xl bg-warn-soft px-4 py-2 text-sm">💨 Without cold water in the condenser, most of the steam escapes instead of turning back into liquid.</p>}
        {test === 'distillate' && (
          <p className="rounded-xl bg-success-soft px-4 py-2 text-sm">
            🧪 <b>Distillate:</b> clear, colourless, <b>pure water</b>. No {m.solute} in it! Only water turned into vapour; the {m.solute} could not evaporate at 100 °C.
          </p>
        )}
        {test === 'flask' && (
          <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">
            🧪 <b>Flask:</b> {m.flaskTest}
          </p>
        )}
      </div>
    </LabFrame>
  )
}
