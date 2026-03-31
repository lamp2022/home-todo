import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { QuickInput } from '../components/QuickInput'
import { Carousel } from '../components/Carousel'
import { SeasonalSection } from '../components/SeasonalSection'
import { CategoryGroup } from '../components/CategoryGroup'
import { TaskSheet } from '../components/TaskSheet'
import { getCategoryColor } from '../lib/colors'
import { sortByDeadline } from '../lib/deadlines'
import { TaskSuggestions } from '../components/TaskSuggestions'

export function TasksPage() {
  const { tasks, categories } = useStore()
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  const activeTasks = tasks.filter((t) => !t.completedAt)
  const sorted = sortByDeadline(activeTasks)

  const seasonalTasks = sorted.filter((t) => t.deadline.type === 'season')

  const grouped = categories
    .map((cat) => ({
      category: cat,
      tasks: sorted.filter((t) => t.category === cat),
      color: getCategoryColor(cat, categories),
    }))
    .filter((g) => g.tasks.length > 0)

  return (
    <div className="flex-1 flex flex-col">
      <QuickInput />
      <Carousel tasks={activeTasks} />
      <div className="flex-1 p-4">
        <SeasonalSection tasks={seasonalTasks} />
        {grouped.length === 0 && seasonalTasks.length === 0 && (
          <p className="text-gray-400 text-sm text-center mt-8">Ei tehtäviä</p>
        )}
        {grouped.map((g) => (
          <CategoryGroup
            key={g.category}
            {...g}
            onTaskClick={(task) => setEditingTaskId(task.id)}
          />
        ))}
        <TaskSuggestions />
      </div>
      {editingTaskId && (
        <TaskSheet
          taskId={editingTaskId}
          onClose={() => setEditingTaskId(null)}
        />
      )}
    </div>
  )
}
