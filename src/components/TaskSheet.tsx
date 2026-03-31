import { useState } from 'react'
import type { Task } from '../types'
import { useStore } from '../store/StoreContext'

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i)

function getISOWeek(date: Date): number {
  const d = new Date(date.getTime())
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

// Consistent chip styles
const CHIP_SELECTED = 'bg-teal-100 text-teal-800 ring-1 ring-teal-300 font-semibold'
const CHIP_DEFAULT = 'bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-teal-700'

const WEEKDAY_NAMES = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su']
const MONTH_NAMES = ['Tammi', 'Helmi', 'Maalis', 'Huhti', 'Touko', 'Kesä', 'Heinä', 'Elo', 'Syys', 'Loka', 'Marras', 'Joulu']

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
    <div>
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
              className={`py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                isSelected
                  ? 'bg-teal-500 text-white shadow-sm'
                  : isToday
                    ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-300'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface Props {
  taskId: string
  onClose: () => void
}

export function TaskSheet({ taskId, onClose }: Props) {
  const { tasks, updateTask, deleteTask, categories, persons } = useStore()
  const task = tasks.find((t) => t.id === taskId)
  const [title, setTitle] = useState(task?.title ?? '')
  const [calPage, setCalPage] = useState(0) // 0 = current month, 1 = next

  if (!task) return null

  const t = task

  function handleTitleBlur() {
    if (title.trim() && title !== t.title) {
      updateTask(t.id, { title: title.trim() })
    }
  }

  function handleCategoryChange(category: string) {
    updateTask(t.id, { category })
  }

  function handleAssigneeChange(assignee: string | null) {
    updateTask(t.id, { assignee })
  }

  function handleDeadlineTypeChange(type: Task['deadline']['type']) {
    updateTask(t.id, { deadline: { type, value: type ? '' : null } })
  }

  function handleDeadlineValueChange(value: string) {
    updateTask(t.id, { deadline: { ...t.deadline, value } })
  }

  function handleDelete() {
    if (confirm('Poistetaanko tehtävä?')) {
      deleteTask(t.id)
      onClose()
    }
  }

  const now = new Date()
  const calMonth = (now.getMonth() + calPage) % 12
  const calYear = now.getFullYear() + Math.floor((now.getMonth() + calPage) / 12)

  return (
    <>
      <div
        data-testid="sheet-backdrop"
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-20"
        onClick={onClose}
      />
      <div className="fixed bottom-0 inset-x-0 max-h-[85vh] min-h-[60vh] bg-white rounded-t-3xl z-30 p-5 flex flex-col gap-3 overflow-y-auto shadow-[0_-4px_30px_rgba(0,0,0,0.08)]">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto shrink-0" />

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="text-lg font-semibold border-b border-gray-100 pb-2 focus:outline-none text-gray-800"
        />

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Kategoria</span>
          <select
            value={task.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

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
                onClick={() => handleDeadlineTypeChange(task.deadline.type === type ? null : type)}
                className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-colors text-center ${
                  task.deadline.type === type
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {task.deadline.type === 'date' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <button
                  type="button"
                  onClick={() => setCalPage(Math.max(0, calPage - 1))}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${calPage === 0 ? 'text-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
                  disabled={calPage === 0}
                >
                  ‹
                </button>
                <span className="text-xs font-semibold text-gray-500">
                  {MONTH_NAMES[calMonth]} {calYear}
                </span>
                <button
                  type="button"
                  onClick={() => setCalPage(calPage + 1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm text-gray-500 hover:bg-gray-100"
                >
                  ›
                </button>
              </div>
              <MiniCalendar
                year={calYear} month={calMonth}
                selected={task.deadline.value || null}
                onSelect={handleDeadlineValueChange}
              />
            </div>
          )}

          {task.deadline.type === 'week' && (() => {
            const currentWeekVal = task.deadline.value
            const startWeek = getISOWeek(now)
            const year = now.getFullYear()
            const weeks = Array.from({ length: 24 }, (_, i) => {
              const w = startWeek + i
              const y = w > 52 ? year + 1 : year
              const wn = w > 52 ? w - 52 : w
              return { label: `Vko ${wn}`, value: `${y}-W${String(wn).padStart(2, '0')}` }
            })
            return (
              <div className="grid grid-cols-4 gap-1.5">
                {weeks.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => handleDeadlineValueChange(w.value)}
                    className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      currentWeekVal === w.value ? CHIP_SELECTED : CHIP_DEFAULT
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            )
          })()}

          {task.deadline.type === 'month' && (() => {
            const currentMonth = task.deadline.value ? parseInt(task.deadline.value.split('-')[1]) : null
            const currentYear = task.deadline.value ? parseInt(task.deadline.value.split('-')[0]) : new Date().getFullYear()
            return (
              <div className="flex flex-col gap-1.5">
                <div className="grid grid-cols-4 gap-1.5">
                  {MONTH_NAMES.map((name, i) => {
                    const m = i + 1
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleDeadlineValueChange(`${currentYear}-${String(m).padStart(2, '0')}`)}
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
                        handleDeadlineValueChange(`${y}-${String(m).padStart(2, '0')}`)
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

          {task.deadline.type === 'season' && (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1.5">
                {(['kevät', 'kesä', 'syksy', 'talvi'] as const).map((s) => {
                  const current = task.deadline.value?.split('-')[0]
                  const isSelected = current === s
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        const year = task.deadline.value?.split('-')[1] ?? String(new Date().getFullYear())
                        handleDeadlineValueChange(`${s}-${year}`)
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
                  const currentYear = task.deadline.value?.split('-')[1]
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        const season = task.deadline.value?.split('-')[0] ?? 'kevät'
                        handleDeadlineValueChange(`${season}-${y}`)
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

          {task.deadline.type === 'year' && (
            <div className="grid grid-cols-5 gap-1.5">
              {YEARS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => handleDeadlineValueChange(String(y))}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    task.deadline.value === String(y) ? CHIP_SELECTED : CHIP_DEFAULT
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>

        {task.deadline.type && (
          <label className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              checked={task.recurring}
              onChange={(e) => {
                const recurring = e.target.checked
                const intervalMap: Record<string, 'weekly' | 'monthly' | 'yearly' | 'seasonal'> = {
                  date: 'monthly', week: 'weekly', month: 'monthly', season: 'seasonal', year: 'yearly',
                }
                const interval = task.deadline.type ? intervalMap[task.deadline.type] : 'yearly'
                updateTask(t.id, {
                  recurring,
                  recurrence: recurring ? { interval, anchor: task.deadline.value ?? '' } : null,
                })
              }}
              className="w-4 h-4 rounded-md border-gray-300 text-teal-500 focus:ring-teal-200"
            />
            <span className="text-xs text-gray-500">Toistuu samalla aikavälillä</span>
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Vastuuhenkilö</span>
          <select
            value={task.assignee ?? ''}
            onChange={(e) => handleAssigneeChange(e.target.value || null)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all"
          >
            <option value="">Ei valittu</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors"
          >
            OK
          </button>
          <button
            onClick={handleDelete}
            className="text-rose-500 text-sm font-medium py-2 hover:text-rose-600 transition-colors"
          >
            Poista tehtävä
          </button>
        </div>
      </div>
    </>
  )
}
