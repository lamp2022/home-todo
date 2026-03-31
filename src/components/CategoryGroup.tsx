import type { Task } from '../types'
import { TaskCard } from './TaskCard'

export function CategoryGroup({ category, tasks, color, onTaskClick }: {
  category: string
  tasks: Task[]
  color: string
  onTaskClick?: (task: Task) => void
}) {
  if (tasks.length === 0) return null
  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide mb-1 px-1" style={{ color }}>
        {category}
      </h3>
      <div className="flex flex-col gap-1">
        {tasks.map((task) => (
          <div key={task.id} onClick={() => onTaskClick?.(task)} className="cursor-pointer">
            <TaskCard task={task} color={color} />
          </div>
        ))}
      </div>
    </div>
  )
}
