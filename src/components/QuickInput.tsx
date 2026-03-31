import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { suggestCategory } from '../lib/categorize'
import type { Task } from '../types'

type DeadlineType = Task['deadline']['type']

export function QuickInput() {
  const { addTask, persons } = useStore()
  const [title, setTitle] = useState('')
  const [showPickers, setShowPickers] = useState(false)
  const [deadlineType, setDeadlineType] = useState<DeadlineType>(null)
  const [deadlineValue, setDeadlineValue] = useState('')
  const [assignee, setAssignee] = useState<string | null>(null)

  function reset() {
    setTitle('')
    setDeadlineType(null)
    setDeadlineValue('')
    setAssignee(null)
    setShowPickers(false)
  }

  function handleSubmit() {
    const trimmed = title.trim()
    if (!trimmed) return
    const category = suggestCategory(trimmed) ?? 'Muu'
    addTask({
      title: trimmed,
      category,
      deadline: deadlineType && deadlineValue
        ? { type: deadlineType, value: deadlineValue }
        : { type: null, value: null },
      assignee,
    })
    reset()
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        onFocus={() => setShowPickers(true)}
        placeholder="Kirjoita tehtävä..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {showPickers && (
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <select
            value={deadlineType ?? ''}
            onChange={(e) => {
              setDeadlineType((e.target.value || null) as DeadlineType)
              setDeadlineValue('')
            }}
            className="text-xs border border-gray-200 rounded px-2 py-1"
          >
            <option value="">📅 Ei deadlinea</option>
            <option value="date">📅 Päivä</option>
            <option value="week">📅 Viikko</option>
            <option value="month">📅 Kuukausi</option>
            <option value="season">📅 Kausi</option>
            <option value="year">📅 Vuosi</option>
          </select>

          {deadlineType === 'date' && (
            <input
              type="date"
              value={deadlineValue}
              onChange={(e) => setDeadlineValue(e.target.value)}
              className="text-xs border border-gray-200 rounded px-2 py-1"
            />
          )}
          {deadlineType === 'week' && (
            <input
              type="week"
              value={deadlineValue}
              onChange={(e) => setDeadlineValue(e.target.value)}
              className="text-xs border border-gray-200 rounded px-2 py-1"
            />
          )}
          {deadlineType === 'month' && (
            <input
              type="month"
              value={deadlineValue}
              onChange={(e) => setDeadlineValue(e.target.value)}
              className="text-xs border border-gray-200 rounded px-2 py-1"
            />
          )}
          {deadlineType === 'season' && (
            <select
              value={deadlineValue}
              onChange={(e) => setDeadlineValue(e.target.value)}
              className="text-xs border border-gray-200 rounded px-2 py-1"
            >
              <option value="">Valitse kausi</option>
              {['kevät', 'kesä', 'syksy', 'talvi'].flatMap((s) =>
                [2026, 2027].map((y) => (
                  <option key={`${s}-${y}`} value={`${s}-${y}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)} {y}
                  </option>
                ))
              )}
            </select>
          )}
          {deadlineType === 'year' && (
            <select
              value={deadlineValue}
              onChange={(e) => setDeadlineValue(e.target.value)}
              className="text-xs border border-gray-200 rounded px-2 py-1"
            >
              <option value="">Valitse vuosi</option>
              {[2026, 2027, 2028].map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          )}

          {persons.length > 0 && (
            <select
              value={assignee ?? ''}
              onChange={(e) => setAssignee(e.target.value || null)}
              className="text-xs border border-gray-200 rounded px-2 py-1"
            >
              <option value="">👤 Ei valittu</option>
              {persons.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  )
}
