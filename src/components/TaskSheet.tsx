import { useEffect, useState } from 'react'
import type { Task } from '../types'
import { useStore } from '../store/StoreContext'
import { DeadlinePicker } from './DeadlinePicker'
import { RecurrencePicker } from './RecurrencePicker'

interface Props {
  taskId: string
  onClose: () => void
}

export function TaskSheet({ taskId, onClose }: Props) {
  const { tasks, updateTask, deleteTask, categories, persons } = useStore()
  const task = tasks.find((t) => t.id === taskId)
  const [title, setTitle] = useState(task?.title ?? '')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!task) return null

  function handleTitleBlur() {
    if (title.trim() && title !== task!.title) {
      updateTask(task!.id, { title: title.trim() })
    }
  }

  function handleDeadlineTypeChange(type: Task['deadline']['type']) {
    updateTask(task!.id, { deadline: { type, value: type ? '' : null } })
  }

  function handleDeadlineValueChange(value: string) {
    updateTask(task!.id, { deadline: { ...task!.deadline, value } })
  }

  function handleRecurrenceChange(interval: 'weekly' | 'monthly' | 'yearly' | null) {
    if (interval) {
      updateTask(task!.id, {
        recurring: true,
        recurrence: { interval, anchor: task!.deadline.value ?? '' },
      })
    } else {
      updateTask(task!.id, { recurring: false, recurrence: null })
    }
  }

  function handleDelete() {
    if (confirm('Poistetaanko tehtävä?')) {
      deleteTask(task!.id)
      onClose()
    }
  }

  return (
    <>
      <div
        data-testid="sheet-backdrop"
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-20"
        onClick={onClose}
      />
      <div className="fixed bottom-0 inset-x-0 max-h-[85vh] min-h-[60vh] bg-white rounded-t-3xl z-30 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col gap-3 overflow-y-auto shadow-[0_-4px_30px_rgba(0,0,0,0.08)]">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto shrink-0" />

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          enterKeyHint="done"
          autoComplete="off"
          className="text-lg font-semibold border-b border-gray-100 pb-2 focus:outline-none text-gray-800"
        />

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Kategoria</span>
          <select
            value={task.category}
            onChange={(e) => updateTask(task.id, { category: e.target.value })}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <DeadlinePicker
          deadline={task.deadline}
          onTypeChange={handleDeadlineTypeChange}
          onValueChange={handleDeadlineValueChange}
        />

        <RecurrencePicker
          recurring={task.recurring}
          interval={task.recurrence?.interval}
          onChange={handleRecurrenceChange}
        />

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Muistiinpano</span>
          <textarea
            defaultValue={task.note ?? ''}
            onBlur={(e) => updateTask(task.id, { note: e.target.value.trim() || null })}
            onInput={(e) => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px' }}
            placeholder="Lisätietoja..."
            rows={1}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-base resize-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all overflow-hidden"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Vastuuhenkilö</span>
          <select
            value={task.assignee ?? ''}
            onChange={(e) => updateTask(task.id, { assignee: e.target.value || null })}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all"
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
            className="w-full py-2.5 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 active:bg-teal-700 transition-colors"
          >
            OK
          </button>
          <button
            onClick={handleDelete}
            className="text-rose-500 text-sm font-medium py-2 hover:text-rose-600 active:text-rose-700 transition-colors"
          >
            Poista tehtävä
          </button>
        </div>
      </div>
    </>
  )
}
