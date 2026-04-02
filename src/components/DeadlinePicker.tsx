import { useState } from 'react'
import type { Task } from '../types'
import { weekOptions } from '../lib/Deadline'

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i)

const CHIP_SELECTED = 'bg-teal-100 text-teal-800 ring-1 ring-teal-300 font-semibold'
const CHIP_DEFAULT = 'bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-teal-700 active:bg-teal-100'

const WEEKDAY_NAMES = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su']
const MONTH_NAMES = ['Tammi', 'Helmi', 'Maalis', 'Huhti', 'Touko', 'Kesä', 'Heinä', 'Elo', 'Syys', 'Loka', 'Marras', 'Joulu']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function MiniCalendar({ year, month, selected, onSelect }: {
  year: number; month: number; selected: string | null
  onSelect: (value: string) => void
}) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const cells: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="grid grid-cols-7 gap-px text-center">
      {WEEKDAY_NAMES.map((d) => (
        <div key={d} className="text-[10px] font-semibold text-gray-400 pb-1">{d}</div>
      ))}
      {cells.map((day, i) => {
        if (day === null) return <div key={i} />
        const value = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const isSelected = selected === value
        const isToday = value === todayStr
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(value)}
            className={`py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
              isSelected
                ? 'bg-teal-500 text-white shadow-sm'
                : isToday
                  ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-300'
                  : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
            }`}
          >
            {day}
          </button>
        )
      })}
    </div>
  )
}

interface Props {
  deadline: Task['deadline']
  onTypeChange: (type: Task['deadline']['type']) => void
  onValueChange: (value: string) => void
}

export function DeadlinePicker({ deadline, onTypeChange, onValueChange }: Props) {
  const [calPage, setCalPage] = useState(0)
  const now = new Date()
  const calMonth = (now.getMonth() + calPage) % 12
  const calYear = now.getFullYear() + Math.floor((now.getMonth() + calPage) / 12)

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Deadline</span>
      <div className="flex flex-wrap gap-1.5">
        {([
          ['date', 'Päivä'],
          ['week', 'Viikko'],
          ['month', 'Kk'],
          ['season', 'Kausi'],
          ['year', 'Vuosi'],
        ] as [Task['deadline']['type'], string][]).map(([type, label]) => (
          <button
            key={type}
            type="button"
            onClick={() => onTypeChange(deadline.type === type ? null : type)}
            className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-colors text-center ${
              deadline.type === type
                ? 'bg-teal-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {deadline.type === 'date' && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <button
              type="button"
              onClick={() => setCalPage(Math.max(0, calPage - 1))}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${calPage === 0 ? 'text-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
              disabled={calPage === 0}
            >
              &#8249;
            </button>
            <span className="text-xs font-semibold text-gray-500">
              {MONTH_NAMES[calMonth]} {calYear}
            </span>
            <button
              type="button"
              onClick={() => setCalPage(calPage + 1)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm text-gray-500 hover:bg-gray-100"
            >
              &#8250;
            </button>
          </div>
          <MiniCalendar
            year={calYear} month={calMonth}
            selected={deadline.value || null}
            onSelect={onValueChange}
          />
        </div>
      )}

      {deadline.type === 'week' && (
        <div className="grid grid-cols-4 gap-1.5">
          {weekOptions(24, now).map((w) => (
            <button
              key={w.value}
              type="button"
              onClick={() => onValueChange(w.value)}
              className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                deadline.value === w.value ? CHIP_SELECTED : CHIP_DEFAULT
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      )}

      {deadline.type === 'month' && (() => {
        const currentMonth = deadline.value ? parseInt(deadline.value.split('-')[1]) : null
        const currentYear = deadline.value ? parseInt(deadline.value.split('-')[0]) : new Date().getFullYear()
        return (
          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-4 gap-1.5">
              {MONTH_NAMES.map((name, i) => {
                const m = i + 1
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onValueChange(`${currentYear}-${String(m).padStart(2, '0')}`)}
                    className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      currentMonth === m ? CHIP_SELECTED : CHIP_DEFAULT
                    }`}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {YEARS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    const m = currentMonth ?? 1
                    onValueChange(`${y}-${String(m).padStart(2, '0')}`)
                  }}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    currentYear === y ? CHIP_SELECTED : CHIP_DEFAULT
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        )
      })()}

      {deadline.type === 'season' && (
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1.5">
            {(['kevät', 'kesä', 'syksy', 'talvi'] as const).map((s) => {
              const current = deadline.value?.split('-')[0]
              const isSelected = current === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    const year = deadline.value?.split('-')[1] ?? String(new Date().getFullYear())
                    onValueChange(`${s}-${year}`)
                  }}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isSelected ? CHIP_SELECTED : CHIP_DEFAULT
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              )
            })}
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {YEARS.map((y) => {
              const currentYear = deadline.value?.split('-')[1]
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    const season = deadline.value?.split('-')[0] ?? 'kevät'
                    onValueChange(`${season}-${y}`)
                  }}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    currentYear === String(y) ? CHIP_SELECTED : CHIP_DEFAULT
                  }`}
                >
                  {y}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {deadline.type === 'year' && (
        <div className="grid grid-cols-5 gap-1.5">
          {YEARS.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => onValueChange(String(y))}
              className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                deadline.value === String(y) ? CHIP_SELECTED : CHIP_DEFAULT
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
