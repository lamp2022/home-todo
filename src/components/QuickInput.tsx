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
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 p-4">
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Lisää tehtävä..."
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 placeholder:text-gray-400 transition-all"
      />
      <div className="flex gap-1.5 mt-2 overflow-x-auto">
        {QUICK_DEADLINES.map((qd) => {
          const dl = qd.get()
          const isActive = pending.type === dl.type && pending.value === dl.value
          return (
            <button
              key={qd.label}
              type="button"
              onClick={() => toggleDeadline(qd.get)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
