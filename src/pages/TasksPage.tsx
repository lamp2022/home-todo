import { useState, useMemo } from 'react'
import { useStore } from '../store/StoreContext'
import { QuickInput } from '../components/QuickInput'
import { Carousel } from '../components/Carousel'
import { SeasonalSection } from '../components/SeasonalSection'
import { CategoryGroup } from '../components/CategoryGroup'
import { TaskSheet } from '../components/TaskSheet'
import { getCategoryColor } from '../lib/CategoryService'
import { sortByDeadline, formatDeadline } from '../lib/Deadline'
import { TaskSuggestions } from '../components/TaskSuggestions'
import { getRecentlyDone, getEncouragementPositions } from '../lib/completionStats'

export function TasksPage() {
  const { tasks, categories } = useStore()
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'category' | 'time'>('category')

  const activeTasks = tasks.filter((t) => !t.completedAt)
  const sorted = sortByDeadline(activeTasks)

  const recentlyDone = getRecentlyDone({ tasks, withinDays: 7 })

  const encouragementPositions = useMemo(
    () => getEncouragementPositions(recentlyDone.length),
    [recentlyDone.length]
  )

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
        {(activeTasks.length > 0 || recentlyDone.length > 0) && (
          <div className="flex gap-1.5 mb-4">
            <button
              type="button"
              onClick={() => setViewMode('category')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                viewMode === 'category' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              Kategoriat
            </button>
            <button
              type="button"
              onClick={() => setViewMode('time')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                viewMode === 'time' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              Aikajärjestys
            </button>
          </div>
        )}

        {viewMode === 'category' ? (
          <>
            <SeasonalSection tasks={seasonalTasks} onTaskClick={(task) => setEditingTaskId(task.id)} />
            {grouped.length === 0 && seasonalTasks.length === 0 && recentlyDone.length === 0 && (
              <p className="text-gray-400 text-sm text-center mt-8">Ei tehtäviä</p>
            )}
            {grouped.map((g) => (
              <CategoryGroup
                key={g.category}
                {...g}
                onTaskClick={(task) => setEditingTaskId(task.id)}
              />
            ))}
          </>
        ) : (
          <>
            {sorted.length === 0 && recentlyDone.length === 0 && (
              <p className="text-gray-400 text-sm text-center mt-8">Ei tehtäviä</p>
            )}
            <div className="flex flex-col gap-1.5">
              {sorted.map((task) => {
                const dl = formatDeadline(task)
                return (
                  <div key={task.id} onClick={() => setEditingTaskId(task.id)} className="cursor-pointer">
                    <div className="grid grid-cols-[3px_1fr_auto] items-center py-3 px-3 gap-3 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                      <div className="h-8 rounded-full" style={{ backgroundColor: getCategoryColor(task.category, categories) }} />
                      <span className="truncate text-sm text-gray-700">{task.title}</span>
                      <span className="text-xs text-gray-400">{dl || '—'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {recentlyDone.length > 0 && (
          <div className="mt-4 mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 mb-2 px-1">
              Tehty
            </h3>
            <div className="flex flex-col gap-1.5">
              {recentlyDone.map((task, i) => (
                <div key={task.id}>
                  {encouragementPositions.has(i) && (
                    <div className="bg-teal-50 rounded-xl px-4 py-2.5 mb-1.5 text-center">
                      <span className="text-xs text-teal-600 font-medium">{encouragementPositions.get(i)}</span>
                    </div>
                  )}
                  <div onClick={() => setEditingTaskId(task.id)} className="cursor-pointer">
                    <div className="grid grid-cols-[3px_auto_1fr] items-center py-3 px-3 gap-3 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] opacity-60">
                      <div className="h-8 rounded-full bg-emerald-300" />
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-xs flex items-center justify-center font-bold shrink-0">
                        &#10003;
                      </span>
                      <span className="truncate text-sm text-gray-400 line-through">{task.title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
