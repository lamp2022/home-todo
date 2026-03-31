import type { Task } from '../types'
import { isOverdue } from '../lib/deadlines'
import { useStore } from '../store/StoreContext'

function formatDeadline(task: Task): string {
  const { type, value } = task.deadline
  if (!type || !value) return ''
  switch (type) {
    case 'date': {
      const d = new Date(value)
      return `${d.getDate()}.${d.getMonth() + 1}.`
    }
    case 'week': return `Vko ${value.split('-W')[1]}`
    case 'month': {
      const [y, m] = value.split('-')
      return `${m}/${y}`
    }
    case 'season': {
      const [s, y] = value.split('-')
      return `${s.charAt(0).toUpperCase() + s.slice(1)} ${y}`
    }
    case 'year': return value
    default: return ''
  }
}

export function TaskCard({ task, color }: { task: Task; color: string }) {
  const { completeTask } = useStore()
  const overdue = isOverdue(task)
  const persons = useStore().persons
  const assigneeName = task.assignee
    ? persons.find((p) => p.id === task.assignee)?.name?.[0] ?? ''
    : ''

  return (
    <div className="grid grid-cols-[3px_1fr_auto] items-center py-3 px-3 gap-3 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow">
      <div className="h-8 rounded-full" style={{ backgroundColor: color }} />
      <label className="flex items-center gap-2.5 min-w-0 cursor-pointer">
        <input
          type="checkbox"
          onChange={() => completeTask(task.id)}
          className="shrink-0 w-4 h-4 rounded-md border-gray-300 text-accent focus:ring-accent/30 cursor-pointer"
        />
        <span className="truncate text-sm text-gray-700">{task.title}</span>
      </label>
      <div className="flex items-center gap-1.5 text-xs">
        <span className={`font-medium ${overdue ? 'text-rose-500' : 'text-gray-400'}`}>
          {formatDeadline(task)}
        </span>
        {assigneeName && (
          <span className="w-5 h-5 rounded-full bg-accent-light text-accent text-[10px] font-bold flex items-center justify-center">
            {assigneeName}
          </span>
        )}
      </div>
    </div>
  )
}
