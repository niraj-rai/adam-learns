import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { driftPerYear, festivalDay, LUNAR_YEAR, monthsBetweenLeapMonths, SOLAR_YEAR, yearsToCycle } from './model'

const START = 2026
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
function dateOf(dayOfYear: number) {
  let d = Math.round(dayOfYear)
  for (let m = 0; m < 12; m++) {
    if (d < MONTH_DAYS[m]) return `${d + 1} ${MONTH_NAMES[m]}`
    d -= MONTH_DAYS[m]
  }
  return '31 December'
}
const SEASON = (d: number) => (d < 59 || d >= 334 ? 'winter' : d < 151 ? 'spring/summer' : d < 273 ? 'monsoon' : 'post-monsoon')

const FESTIVALS = [
  { id: 'sankranti', name: 'Makar Sankranti / Pongal', emoji: '🪁', kind: 'solar' as const, start: 13, colour: '#f59e0b', note: 'Follows the Sun: the day it enters Makara (Capricorn), so it stays around 14–15 January.' },
  { id: 'diwali', name: 'Diwali', emoji: '🪔', kind: 'lunisolar' as const, start: 311, colour: '#ef4444', note: 'Falls on the new moon (Amavasya) of the month of Kartika. Leap months keep it in October–November.' },
  { id: 'eid', name: 'Eid al-Fitr', emoji: '🌙', kind: 'lunar' as const, start: 78, colour: '#22c55e', note: 'Follows a purely lunar calendar (12 lunar months), so it comes about 11 days earlier each year.' },
]

export default function SkyCalendar() {
  const [y, setY] = useState(0)
  return (
    <LabFrame labId="sky-calendar" title="Sky Calendar" subtitle="Days come from Earth's spin, months from the Moon, years from the Sun. They don't fit together neatly!" howTo={<p>Slide forward through the years. Watch where three festivals fall: one follows the Sun, one the Moon, and one both. Why do some festivals move around the calendar?</p>}>
      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <svg viewBox="-110 -110 220 220" className="w-full max-w-64 justify-self-center" role="img" aria-label={`Festival dates in ${START + y}`}>
          {MONTH_NAMES.map((m, i) => {
            const a = (i / 12) * 2 * Math.PI - Math.PI / 2
            return (
              <g key={m}>
                <line x1={0} y1={0} x2={100 * Math.cos(a)} y2={100 * Math.sin(a)} stroke="var(--border)" />
                <text x={88 * Math.cos(a + Math.PI / 12)} y={88 * Math.sin(a + Math.PI / 12) + 3} fontSize={8} textAnchor="middle" className="fill-muted-foreground">{m.slice(0, 3)}</text>
              </g>
            )
          })}
          <circle r={100} fill="none" stroke="currentColor" strokeOpacity={0.3} />
          {FESTIVALS.map((f, k) => {
            const d = festivalDay(f.kind, f.start, y)
            const a = (d / SOLAR_YEAR) * 2 * Math.PI - Math.PI / 2
            const r = 40 + k * 18
            return <text key={f.id} x={r * Math.cos(a)} y={r * Math.sin(a) + 5} fontSize={16} textAnchor="middle">{f.emoji}</text>
          })}
          <text y={4} fontSize={14} textAnchor="middle" className="fill-foreground font-semibold">{START + y}</text>
        </svg>
        <div className="space-y-3">
          <label className="block text-sm">Year: <b>{START + y}</b>
            <Slider value={[y]} min={0} max={36} step={1} onValueChange={([v]) => setY(v)} className="mt-1.5" aria-label="Year" />
          </label>
          {FESTIVALS.map((f) => {
            const d = festivalDay(f.kind, f.start, y)
            return (
              <div key={f.id} className="rounded-xl border p-3 text-sm" style={{ borderColor: f.colour }}>
                <p className="font-semibold">{f.emoji} {f.name} <span className="font-normal text-muted-foreground">({f.kind} calendar)</span></p>
                <p>Around <b>{dateOf(d)}</b> · {SEASON(d)}</p>
                <p className="text-xs text-muted-foreground">{f.note}</p>
              </div>
            )
          })}
          <p className="text-xs text-muted-foreground">Dates are modelled, so real dates may differ by a day or two, or by a month in leap-month years.</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Readout label="Solar year" value={`${SOLAR_YEAR.toFixed(2)} days`} />
        <Readout label="12 lunar months" value={`${LUNAR_YEAR.toFixed(2)} days`} />
        <Readout label="Difference per year" value={`${driftPerYear.toFixed(1)} days`} />
        <Readout label="Leap month every" value={`~${monthsBetweenLeapMonths.toFixed(0)} months`} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">A lunar year is about 11 days shorter than a solar year, so a purely lunar festival moves right round the seasons in about {yearsToCycle.toFixed(0)} years. Lunisolar calendars, like most Hindu calendars, add an extra month (<b>adhik maas</b>) roughly every 32–33 months to stay in step with the seasons. The Gregorian calendar adds a leap day every 4 years to handle the extra ¼ day. India's official national calendar, the Saka calendar (adopted in 1957), is solar.</p>
    </LabFrame>
  )
}
