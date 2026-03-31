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

  const t = task // non-nullable alias for closures

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

  return (
    <>
      <div
        data-testid="sheet-backdrop"
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-20"
        onClick={onClose}
      />
      <div className="fixed bottom-0 inset-x-0 max-h-[85vh] bg-white rounded-t-3xl z-30 p-5 flex flex-col gap-3 overflow-y-auto shadow-[0_-4px_30px_rgba(0,0,0,0.08)]">
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
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
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
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
          )}

          {task.deadline.type === 'week' && (
            <input
              type="week"
              value={task.deadline.value ?? ''}
              onChange={(e) => handleDeadlineValueChange(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
          )}

          {task.deadline.type === 'month' && (
            <input
              type="month"
              value={task.deadline.value ?? ''}
              onChange={(e) => handleDeadlineValueChange(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
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
                          ? 'bg-accent-light text-accent ring-1 ring-accent/30'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
                          ? 'bg-accent-light text-accent ring-1 ring-accent/30'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Vastuuhenkilö</span>
          <select
            value={task.assignee ?? ''}
            onChange={(e) => handleAssigneeChange(e.target.value || null)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
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
            className="w-full py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors"
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
