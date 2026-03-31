import type { Task } from '../types'
import { getCurrentSeason } from '../lib/deadlines'
import { TaskCard } from './TaskCard'
import { getCategoryColor } from '../lib/colors'
import { useStore } from '../store/StoreContext'

interface Props {
  tasks: Task[]
  now?: Date
}

export function SeasonalSection({ tasks, now = new Date() }: Props) {
  const { categories } = useStore()
  const season = getCurrentSeason(now)
  const seasonalTasks = tasks.filter((t) => {
    if (t.deadline.type !== 'season' || !t.deadline.value) return false
    const [s] = t.deadline.value.split('-')
    return s === season
  })

  if (seasonalTasks.length === 0) return null

  const label = season.charAt(0).toUpperCase() + season.slice(1)

  return (
    <div className="mb-5">
      <h3 className="text-[11px] font-bold uppercase tracking-wider mb-2 px-1 text-emerald-600">
        Ajankohtaiset — {label}
      </h3>
      <div className="flex flex-col gap-1.5">
        {seasonalTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            color={getCategoryColor(task.category, categories)}
          />
        ))}
      </div>
    </div>
  )
}
