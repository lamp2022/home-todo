import type { Task } from '../types'

const DAY_NAMES = ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La']

function dayLabel(date: Date, now: Date): string {
  const diff = Math.round((date.getTime() - now.getTime()) / 86400000)
  if (diff === 0) return 'Tänään'
  if (diff === 1) return 'Huomenna'
  return `${DAY_NAMES[date.getDay()]} ${date.getDate()}.${date.getMonth() + 1}.`
}

interface Props {
  tasks: Task[]
  now?: Date
}

export function Carousel({ tasks, now = new Date() }: Props) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const days: { date: Date; label: string; count: number }[] = []

  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getTime() + i * 86400000)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const count = tasks.filter(
      (t) => t.deadline.type === 'date' && t.deadline.value === dateStr
    ).length
    if (count > 0) {
      days.push({ date: d, label: dayLabel(d, today), count })
    }
  }

  return (
    <div className="h-16 flex items-center border-b border-gray-100 px-4 overflow-x-auto gap-3">
      {days.length === 0 ? (
        <p className="text-gray-400 text-sm w-full text-center">
          Ei deadlineja seuraavalle viikolle ✓
        </p>
      ) : (
        days.map((d) => (
          <div
            key={d.date.toISOString()}
            className="flex flex-col items-center shrink-0 px-3 py-1 rounded-lg bg-blue-50"
          >
            <span className="text-xs text-gray-600">{d.label}</span>
            <span className="text-sm font-semibold text-blue-700">{d.count}</span>
          </div>
        ))
      )}
    </div>
  )
}
