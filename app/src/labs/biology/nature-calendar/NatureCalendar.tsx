import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { LabFrame, Readout } from '../../_kit/LabFrame'

const MONTHS = [
  { m: 'January', season: 'Winter', weather: '🌫️ Cold mornings, fog in the north', plants: 'Mustard fields bloom yellow; wheat grows', animals: 'Migratory birds like cranes and flamingos visit lakes', people: 'Makar Sankranti, Pongal, Lohri: harvest festivals', farm: 'Rabi crops (wheat, mustard) growing' },
  { m: 'February', season: 'Spring', weather: '🌤️ Pleasant and dry', plants: 'Mango trees flower; palash turns flame-red', animals: 'Birds start building nests', people: 'Basant Panchami', farm: 'Rabi crops ripening' },
  { m: 'March', season: 'Spring', weather: '☀️ Warming up', plants: 'New leaves on many trees', animals: 'Migratory birds fly back north', people: 'Holi', farm: 'Wheat harvest begins' },
  { m: 'April', season: 'Summer', weather: '🔥 Hot', plants: 'Mangoes grow; gulmohar buds', animals: 'Animals rest in shade at noon', people: 'Baisakhi, Vishu, Bihu: new year and harvest', farm: 'Rabi harvest; fields rest' },
  { m: 'May', season: 'Summer', weather: '🥵 Hottest month in much of India', plants: 'Gulmohar and amaltas bloom', animals: 'Water holes shrink; animals gather at them', people: 'Summer holidays', farm: 'Fields ploughed, waiting for rain' },
  { m: 'June', season: 'Monsoon', weather: '🌧️ Monsoon reaches Kerala around 1 June', plants: 'Everything turns green', animals: 'Frogs croak; peacocks dance', people: 'Rath Yatra', farm: 'Kharif sowing (rice, cotton, maize)' },
  { m: 'July', season: 'Monsoon', weather: '⛈️ Heavy rain across India', plants: 'Rice paddies fill with water', animals: 'Earthworms and snails come out', people: 'Umbrellas and raincoats!', farm: 'Rice transplanting' },
  { m: 'August', season: 'Monsoon', weather: '🌦️ Rainy', plants: 'Forests are lush', animals: 'Insects everywhere; birds feed chicks', people: 'Independence Day, Onam, Raksha Bandhan', farm: 'Kharif crops growing' },
  { m: 'September', season: 'Monsoon', weather: '🌈 Rain slowly withdraws', plants: 'Kaas plateau wildflowers bloom', animals: 'Frogs lay eggs in pools', people: 'Ganesh Chaturthi', farm: 'Crops maturing' },
  { m: 'October', season: 'Autumn', weather: '🌤️ Clear skies, cooler nights', plants: 'Some trees shed leaves', animals: 'Birds begin migrating south', people: 'Navratri, Durga Puja, Dussehra', farm: 'Kharif harvest' },
  { m: 'November', season: 'Autumn', weather: '🍂 Cool and dry', plants: 'Harvested fields', animals: 'Migratory ducks arrive', people: 'Diwali, Chhath', farm: 'Rabi sowing (wheat, gram)' },
  { m: 'December', season: 'Winter', weather: '❄️ Cold; snow in the Himalaya', plants: 'Winter vegetables: peas, carrots, cauliflower', animals: 'Some animals hibernate in the mountains', people: 'Christmas', farm: 'Rabi crops growing' },
]
const COLOR: Record<string, string> = { Winter: '#bae6fd', Spring: '#bbf7d0', Summer: '#fde68a', Monsoon: '#93c5fd', Autumn: '#fdba74' }

export default function NatureCalendar() {
  const [i, setI] = useState(5)
  const M = MONTHS[i]
  return (
    <LabFrame labId="nature-calendar" title="Nature’s Calendar" subtitle="Plants, animals, weather and people follow a pattern that repeats every year." howTo={<p>Slide through the year. See how the weather, plants, animals, farms and festivals change month by month.</p>}>
      <div className="grid grid-cols-12 gap-0.5" aria-hidden>{MONTHS.map((x, k) => <button key={x.m} type="button" tabIndex={-1} onClick={() => setI(k)} className={`h-8 rounded text-[9px] font-semibold text-slate-900 ${k === i ? 'ring-2 ring-chem' : ''}`} style={{ background: COLOR[x.season] }}>{x.m.slice(0, 3)}</button>)}</div>
      <label className="mt-2 block text-sm">Month: <b>{M.m}</b> · {M.season}<Slider value={[i]} min={0} max={11} step={1} onValueChange={([v]) => setI(v)} className="mt-1" aria-label="month" /></label>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Readout label="Weather" value={M.weather} />
        <Readout label="Plants" value={`🌸 ${M.plants}`} />
        <Readout label="Animals" value={`🦜 ${M.animals}`} />
        <Readout label="Farms" value={`🌾 ${M.farm}`} />
        <Readout label="Festivals and life" value={`🎉 ${M.people}`} className="sm:col-span-2" />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">These rhythms come from the Earth’s journey round the Sun. Farmers in India plan around two main seasons: <b>kharif</b> crops sown with the monsoon and <b>rabi</b> crops sown in winter. Many festivals celebrate harvests. Keep a nature journal to spot the patterns where you live!</p>
    </LabFrame>
  )
}
