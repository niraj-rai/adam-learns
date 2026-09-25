import { useState } from 'react'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { METHODS } from '../food-preserver/model'
import { batterRise, batterVerdict, curdReady, safeOvernight, SPOTS } from './model'

const ORDERS = [
  { id: 'idli', title: 'Order 1: Soft idlis for breakfast', emoji: '🍚', story: 'You ground the idli batter at 9 pm on a cool, rainy Bengaluru night. Breakfast is at 7 am (10 hours). Where should the batter ferment?' },
  { id: 'curd', title: 'Order 2: Curd for the lunch thali', emoji: '🥛', story: 'Lunch is in 6 hours and you need a bowl of thick curd. You have boiled milk and some curd from yesterday. How do you set it?' },
  { id: 'sambar', title: 'Order 3: Leftover sambar', emoji: '🍲', story: 'A big pot of sambar is left after dinner. You want to serve it safely at breakfast, 12 hours from now. How do you store it?' },
]

export default function IdliChef() {
  const addXp = useProgress((s) => s.addXp)
  const awardBadge = useProgress((s) => s.awardBadge)
  const [i, setI] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [result, setResult] = useState<null | { ok: boolean; msg: string }>(null)
  const [spot, setSpot] = useState('counter')
  const [milk, setMilk] = useState(90)
  const [starter, setStarter] = useState(false)
  const [store, setStore] = useState('room')
  const done = i >= ORDERS.length
  const o = ORDERS[Math.min(i, ORDERS.length - 1)]

  const check = () => {
    let ok = false
    let msg = ''
    if (o.id === 'idli') {
      const s = SPOTS.find((x) => x.id === spot)!
      const rise = batterRise(s.temp, 10)
      const v = batterVerdict(rise)
      ok = v === 'perfect'
      msg = ok ? `The batter rose ${rise}% and is light and bubbly. The warmth let bacteria and yeast ferment it, making gas and a pleasant sour taste. Soft, fluffy idlis!` : s.temp >= 50 ? 'Too hot: the heat killed the microbes, so the batter never fermented.' : `The batter only rose ${rise}%. It was too cold for the microbes to work fast enough: flat, hard idlis.`
    } else if (o.id === 'curd') {
      ok = curdReady(milk, starter, 6)
      msg = ok ? 'Thick, set curd by lunchtime! Lukewarm milk plus a spoonful of starter gave the Lactobacillus bacteria perfect conditions.' : !starter ? 'No starter, so there were no Lactobacillus bacteria to turn the milk into curd.' : milk >= 55 ? 'The milk was too hot and killed the bacteria in the starter.' : 'The milk was too cold: the bacteria worked too slowly to set it in time.'
    } else {
      ok = safeOvernight(store)
      const m = METHODS.find((x) => x.id === store)!
      msg = ok ? `Safe! ${m.note} Reheat it until it's boiling before serving.` : `Unsafe: ${m.note} By morning there could be enough bacteria to make people ill.`
    }
    setResult({ ok, msg })
    if (ok) sfx.correct()
    else { sfx.wrong(); setHearts((h) => h - 1) }
  }
  const next = () => {
    const n = i + 1
    setI(n)
    setResult(null)
    if (n >= ORDERS.length) {
      sfx.win()
      if (!useProgress.getState().badges.includes('microbe-master')) addXp(25 + hearts * 10, 'Microbe Master Chef!')
      awardBadge('microbe-master')
    }
  }
  const restart = () => { setI(0); setHearts(3); setResult(null); setSpot('counter'); setMilk(90); setStarter(false); setStore('room') }

  return (
    <LabFrame labId="idli-chef" title="Boss Challenge: Idli Master Chef" subtitle="Run a South Indian kitchen for a day using what you know about microbes, both friendly and not." howTo={<p>Complete three kitchen orders. Choose the conditions, then check the result. A failed order costs a ❤️, but you can adjust and try again.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(Math.max(0, hearts))}{'🤍'.repeat(3 - Math.max(0, hearts))}</span>
        <span className="text-sm text-muted-foreground">Order {Math.min(i + 1, ORDERS.length)} / {ORDERS.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">👩‍🍳</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Kitchen closed: every order perfect! {'⭐'.repeat(Math.max(0, hearts))}</p>
          <Button className="mt-3" variant="outline" onClick={restart}>Play again</Button>
        </div>
      ) : hearts <= 0 && !result ? (
        <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="font-heading text-xl font-semibold">The kitchen had a bad day. Revisit the fermentation and preservation labs, then try again!</p>
          <Button className="mt-3" onClick={restart}>Try again</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl bg-muted/50 p-4">
            <p className="font-heading text-lg font-semibold">{o.emoji} {o.title}</p>
            <p className="text-[15px]">{o.story}</p>
          </div>
          {o.id === 'idli' && (
            <div className="grid gap-2 sm:grid-cols-2">
              {SPOTS.map((s) => <button key={s.id} type="button" disabled={Boolean(result)} onClick={() => setSpot(s.id)} className={cn('rounded-xl border px-3 py-2 text-left text-sm', spot === s.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{s.name} <span className="text-muted-foreground">(~{s.temp} °C)</span></button>)}
            </div>
          )}
          {o.id === 'curd' && (
            <div className="space-y-3">
              <label className="block text-sm">Let the boiled milk cool to: <b>{milk} °C</b>
                <Slider value={[milk]} min={10} max={95} step={5} disabled={Boolean(result)} onValueChange={([v]) => setMilk(v)} className="mt-1.5" aria-label="Milk temperature" />
              </label>
              <Button size="sm" disabled={Boolean(result)} variant={starter ? 'default' : 'outline'} onClick={() => setStarter((x) => !x)}>🥄 {starter ? 'Starter added' : 'Add a spoon of yesterday’s curd'}</Button>
            </div>
          )}
          {o.id === 'sambar' && (
            <div className="grid gap-2 sm:grid-cols-2">
              {METHODS.filter((m) => ['room', 'boil', 'fridge', 'boilfridge'].includes(m.id)).map((m) => <button key={m.id} type="button" disabled={Boolean(result)} onClick={() => setStore(m.id)} className={cn('rounded-xl border px-3 py-2 text-left text-sm', store === m.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{m.emoji} {m.name}</button>)}
            </div>
          )}
          {!result ? (
            <Button onClick={check}>👩‍🍳 Serve it!</Button>
          ) : (
            <div role="status" className={cn('rounded-xl p-4 text-sm', result.ok ? 'bg-success-soft' : 'bg-warn-soft')}>
              <p>{result.ok ? '✅ ' : '❌ '}{result.msg}</p>
              {result.ok ? <Button className="mt-3" autoFocus onClick={next}>{i + 1 < ORDERS.length ? 'Next order →' : 'Finish'}</Button> : hearts > 0 ? <Button className="mt-3" variant="outline" onClick={() => setResult(null)}>Adjust and try again</Button> : <Button className="mt-3" variant="outline" onClick={() => setResult(null)}>See result</Button>}
            </div>
          )}
          {o.id === 'idli' && result && <Readout label="Batter rise" value={`${batterRise(SPOTS.find((x) => x.id === spot)!.temp, 10)}%`} />}
        </div>
      )}
    </LabFrame>
  )
}
