import { useState } from 'react'
import type { Task } from '../types'
import { useStore } from '../store/StoreContext'

interface Props {
  task: Task
  onClose: () => void
}

export function TaskSheet({ task, onClose }: Props) {
  const { updateTask, deleteTask, categories, persons } = useStore()
  const [title, setTitle] = useState(task.title)

  function handleTitleBlur() {
    if (title.trim() && title !== task.title) {
      updateTask(task.id, { title: title.trim() })
    }
  }

  function handleCategoryChange(category: string) {
    updateTask(task.id, { category })
  }

  function handleAssigneeChange(assignee: string | null) {
    updateTask(task.id, { assignee })
  }

  function handleDeadlineTypeChange(type: Task['deadline']['type']) {
    updateTask(task.id, { deadline: { type, value: type ? '' : null } })
  }

  function handleDeadlineValueChange(value: string) {
    updateTask(task.id, { deadline: { ...task.deadline, value } })
  }

  function handleDelete() {
    if (confirm('Poistetaanko tehtävä?')) {
      deleteTask(task.id)
      onClose()
    }
  }

  return (
    <>
      <div
        data-testid="sheet-backdrop"
        className="fixed inset-0 bg-black/30 z-20"
        onClick={onClose}
      />
      <div className="fixed bottom-0 inset-x-0 h-[60vh] bg-white rounded-t-2xl z-30 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto shrink-0" />

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="text-lg font-medium border-b border-gray-200 pb-2 focus:outline-none"
        />

        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">Kategoria</span>
          <select
            value={task.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">Deadline-tyyppi</span>
          <select
            value={task.deadline.type ?? ''}
            onChange={(e) => handleDeadlineTypeChange((e.target.value || null) as Task['deadline']['type'])}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Ei deadlinea</option>
            <option value="date">Päivä</option>
            <option value="week">Viikko</option>
            <option value="month">Kuukausi</option>
            <option value="season">Kausi</option>
            <option value="year">Vuosi</option>
          </select>
        </label>

        {task.deadline.type === 'date' && (
          <input
            type="date"
            value={task.deadline.value ?? ''}
            onChange={(e) => handleDeadlineValueChange(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        )}

        {task.deadline.type === 'season' && (
          <select
            value={task.deadline.value ?? ''}
            onChange={(e) => handleDeadlineValueChange(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
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

        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">Vastuuhenkilö</span>
          <select
            value={task.assignee ?? ''}
            onChange={(e) => handleAssigneeChange(e.target.value || null)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Ei valittu</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>

        <button
          onClick={handleDelete}
          className="mt-auto text-red-500 text-sm font-medium py-2"
        >
          Poista tehtävä
        </button>
      </div>
    </>
  )
}
