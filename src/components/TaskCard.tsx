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
    <div className="grid grid-cols-[4px_1fr_6rem] items-center h-12 gap-2">
      <div className="h-full rounded-sm" style={{ backgroundColor: color }} />
      <label className="flex items-center gap-2 min-w-0 cursor-pointer">
        <input
          type="checkbox"
          onChange={() => completeTask(task.id)}
          className="shrink-0"
        />
        <span className="truncate text-sm">{task.title}</span>
      </label>
      <div className="flex items-center justify-end gap-1 text-xs text-gray-500">
        <span className={overdue ? 'text-red-500' : ''}>
          {formatDeadline(task)}
        </span>
        {assigneeName && <span>👤{assigneeName}</span>}
      </div>
    </div>
  )
}
