import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { TaskSheet } from '../components/TaskSheet'
import { getRecentlyDone, getWeeklyStats, getEncouragementForCount, groupByDay } from '../lib/completionStats'

export function DonePage() {
  const { tasks } = useStore()
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  const completed = tasks
    .filter((t) => t.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())

  const { thisWeek, lastWeek } = getWeeklyStats(tasks)
  const recent = getRecentlyDone({ tasks, withinDays: 30 })
  const dayGroups = groupByDay(recent)
  const encouragement = getEncouragementForCount(thisWeek)

  if (completed.length === 0) {
    return (
      <div className="flex-1 p-4">
        <p className="text-gray-400 text-sm text-center mt-8">Ei vielä tehty tehtäviä</p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4">
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-emerald-50 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{thisWeek}</div>
          <div className="text-xs text-emerald-500 font-medium">Tällä viikolla</div>
        </div>
        <div className="flex-1 bg-gray-50 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-500">{lastWeek}</div>
          <div className="text-xs text-gray-400 font-medium">Viime viikolla</div>
        </div>
      </div>

      {encouragement && (
        <div className="bg-teal-50 rounded-xl px-4 py-3 mb-4 text-center">
          <span className="text-sm text-teal-700 font-medium">{encouragement}</span>
        </div>
      )}

      {dayGroups.map((group) => (
        <div key={group.label} className="mb-5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            {group.label}
          </h3>
          {group.tasks.map((t) => (
            <div
              key={t.id}
              onClick={() => setEditingTaskId(t.id)}
              className="flex items-center gap-2.5 py-2 px-3 bg-white rounded-xl mb-1 cursor-pointer hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow"
            >
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-xs flex items-center justify-center font-bold shrink-0">
                &#10003;
              </span>
              <span className="line-through text-sm text-gray-400 flex-1">{t.title}</span>
              {t.completedBy && (
                <span className="w-5 h-5 rounded-full bg-accent-light text-accent text-[10px] font-bold flex items-center justify-center">
                  {t.completedBy[0]}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}

      {editingTaskId && (
        <TaskSheet
          taskId={editingTaskId}
          onClose={() => setEditingTaskId(null)}
        />
      )}
    </div>
  )
}
