import { useState, useRef } from 'react'
import { useStore } from '../store/StoreContext'
import { suggestCategory } from '../lib/CategoryService'
import { parseDeadline as parseInput, todayDeadline, tomorrowDeadline, nextWeekDeadline, thisMonthDeadline, nextMonthDeadline } from '../lib/Deadline'
import type { Task } from '../types'

const QUICK_DEADLINES: { label: string; get: () => Task['deadline'] }[] = [
  { label: 'Tänään', get: todayDeadline },
  { label: 'Huomenna', get: tomorrowDeadline },
  { label: 'Ensi vko', get: nextWeekDeadline },
  { label: 'Tässä kk', get: thisMonthDeadline },
  { label: 'Ensi kk', get: nextMonthDeadline },
]

export function QuickInput() {
  const { addTask } = useStore()
  const [title, setTitle] = useState('')
  const [pending, setPending] = useState<Task['deadline']>({ type: null, value: null })
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(value: string) {
    if (value.length === 1 && title.length === 0) {
      setTitle(value.charAt(0).toUpperCase() + value.slice(1))
    } else {
      setTitle(value)
    }
  }

  function handleSubmit() {
    const trimmed = title.trim()
    if (!trimmed) return
    const scrollY = window.scrollY
    const parsed = parseInput(trimmed)
    const category = suggestCategory(trimmed) ?? 'Muu'
    const deadline = pending.type ? pending : parsed.deadline
    addTask({
      title: parsed.title,
      category,
      deadline,
      recurring: parsed.recurring,
      recurrence: parsed.recurrence,
    })
    setTitle('')
    setPending({ type: null, value: null })
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY)
      inputRef.current?.focus()
    })
  }

  function toggleDeadline(get: () => Task['deadline']) {
    const dl = get()
    if (pending.type === dl.type && pending.value === dl.value) {
      setPending({ type: null, value: null })
    } else {
      setPending(dl)
    }
  }

  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 p-4 min-w-0 overflow-hidden">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          enterKeyHint="done"
          autoComplete="off"
          placeholder="Lisää tehtävä..."
          className="w-full px-4 py-2.5 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 placeholder:text-gray-400 transition-all"
        />
        {title.trim() && (
          <button
            type="button"
            onClick={handleSubmit}
            aria-label="Lisää tehtävä"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-teal-500 text-white active:bg-teal-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {QUICK_DEADLINES.map((qd) => {
          const dl = qd.get()
          const isActive = pending.type === dl.type && pending.value === dl.value
          return (
            <button
              key={qd.label}
              type="button"
              onClick={() => toggleDeadline(qd.get)}
              className={`px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              {qd.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
