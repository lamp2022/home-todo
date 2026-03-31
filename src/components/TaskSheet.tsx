import { useState } from 'react'
import type { Task } from '../types'
import { useStore } from '../store/StoreContext'

interface Props {
  taskId: string
  onClose: () => void
}

export function TaskSheet({ taskId, onClose }: Props) {
  const { tasks, updateTask, deleteTask, categories, persons } = useStore()
  const task = tasks.find((t) => t.id === taskId)
  const [title, setTitle] = useState(task?.title ?? '')

  if (!task) return null

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

        <div className="flex flex-col gap-2">
          <span className="text-xs text-gray-500">Deadline</span>
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
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  task.deadline.type === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {task.deadline.type === 'date' && (
            <input
              type="date"
              value={task.deadline.value ?? ''}
              onChange={(e) => handleDeadlineValueChange(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          )}

          {task.deadline.type === 'week' && (
            <input
              type="week"
              value={task.deadline.value ?? ''}
              onChange={(e) => handleDeadlineValueChange(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          )}

          {task.deadline.type === 'month' && (
            <input
              type="month"
              value={task.deadline.value ?? ''}
              onChange={(e) => handleDeadlineValueChange(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          )}

          {task.deadline.type === 'season' && (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1.5">
                {(['kevät', 'kesä', 'syksy', 'talvi'] as const).map((s) => {
                  const current = task.deadline.value?.split('-')[0]
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        const year = task.deadline.value?.split('-')[1] ?? String(new Date().getFullYear())
                        handleDeadlineValueChange(`${s}-${year}`)
                      }}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        current === s
                          ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-1.5">
                {[2025, 2026, 2027].map((y) => {
                  const currentYear = task.deadline.value?.split('-')[1]
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        const season = task.deadline.value?.split('-')[0] ?? 'kevät'
                        handleDeadlineValueChange(`${season}-${y}`)
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        currentYear === String(y)
                          ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
            <div className="flex gap-1.5">
              {[2025, 2026, 2027, 2028].map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => handleDeadlineValueChange(String(y))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    task.deadline.value === String(y)
                      ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>

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
