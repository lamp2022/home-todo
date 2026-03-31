import { useStore } from '../store/StoreContext'

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay() + 1) // Monday
  return d
}

function formatDay(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return 'Tänään'
  if (diff === 1) return 'Eilen'
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`
}

function groupByDay(tasks: { completedAt: string; title: string; completedBy: string | null }[]) {
  const groups: Record<string, typeof tasks> = {}
  for (const t of tasks) {
    const d = new Date(t.completedAt)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    ;(groups[key] ??= []).push(t)
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, tasks]) => ({
      label: formatDay(new Date(tasks[0].completedAt)),
      tasks,
    }))
}

export function DonePage() {
  const { tasks } = useStore()
  const completed = tasks
    .filter((t) => t.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())

  const now = new Date()
  const thisWeekStart = getWeekStart(now)
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)

  const thisWeekCount = completed.filter(
    (t) => new Date(t.completedAt!) >= thisWeekStart
  ).length
  const lastWeekCount = completed.filter(
    (t) => {
      const d = new Date(t.completedAt!)
      return d >= lastWeekStart && d < thisWeekStart
    }
  ).length

  const recent = completed.filter((t) => {
    const d = new Date(t.completedAt!)
    const diff = (now.getTime() - d.getTime()) / 86400000
    return diff <= 7
  })

  const dayGroups = groupByDay(recent.map((t) => ({
    completedAt: t.completedAt!,
    title: t.title,
    completedBy: t.completedBy,
  })))

  if (completed.length === 0) {
    return (
      <div className="flex-1 p-4">
        <p className="text-gray-400 text-sm text-center mt-8">Ei vielä tehty tehtäviä</p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4">
      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-emerald-50 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{thisWeekCount}</div>
          <div className="text-xs text-emerald-500 font-medium">Tällä viikolla</div>
        </div>
        <div className="flex-1 bg-gray-50 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-500">{lastWeekCount}</div>
          <div className="text-xs text-gray-400 font-medium">Viime viikolla</div>
        </div>
      </div>

      {dayGroups.map((group) => (
        <div key={group.label} className="mb-5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            {group.label}
          </h3>
          {group.tasks.map((t, i) => (
            <div key={i} className="flex items-center gap-2.5 py-2 px-3 bg-white rounded-xl mb-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-xs flex items-center justify-center font-bold">
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
    </div>
  )
}
