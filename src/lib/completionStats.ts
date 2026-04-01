import type { Task } from '../types'

export const ENCOURAGEMENTS = [
  'Hienoa työtä! Hommat hoituu!',
  'Olet ollut ahkera — mahtavaa!',
  'Onpas hommia hoideltu!',
  'Hyvin menee, jatka samaan malliin!',
  'Koti kiittää — hyvää duunia!',
  'Tehtävät tippuu listalta — loistavaa!',
  'Arjen sankari!',
  'Näin se käy kun hommiin tartutaan!',
  'Hyvä meininki!',
  'Ahkeruus palkitaan!',
  'Kohta on kaikki tehty!',
  'Eteenpäin, askel kerrallaan!',
] as const

const DAY_MS = 86400000

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay() + 1) // Monday
  return d
}

export function formatDay(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const diff = Math.round((today.getTime() - d.getTime()) / DAY_MS)
  if (diff === 0) return 'Tänään'
  if (diff === 1) return 'Eilen'
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`
}

export function getRecentlyDone(opts: { tasks: Task[]; withinDays: number }): Task[] {
  const now = Date.now()
  return opts.tasks
    .filter((t) => {
      if (!t.completedAt) return false
      const diff = (now - new Date(t.completedAt).getTime()) / DAY_MS
      return diff <= opts.withinDays
    })
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
}

export interface DayGroup {
  label: string
  tasks: Task[]
}

export function groupByDay(tasks: Task[]): DayGroup[] {
  const groups: Record<string, Task[]> = {}
  for (const t of tasks) {
    if (!t.completedAt) continue
    const d = new Date(t.completedAt)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    ;(groups[key] ??= []).push(t)
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, tasks]) => ({
      label: formatDay(new Date(tasks[0].completedAt!)),
      tasks,
    }))
}

export interface WeeklyStats {
  thisWeek: number
  lastWeek: number
}

export function getWeeklyStats(tasks: Task[], now: Date = new Date()): WeeklyStats {
  const thisWeekStart = getWeekStart(now)
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)

  const completed = tasks.filter((t) => t.completedAt)
  const thisWeek = completed.filter((t) => new Date(t.completedAt!) >= thisWeekStart).length
  const lastWeek = completed.filter((t) => {
    const d = new Date(t.completedAt!)
    return d >= lastWeekStart && d < thisWeekStart
  }).length

  return { thisWeek, lastWeek }
}

export function getEncouragementPositions(completedCount: number): Map<number, string> {
  if (completedCount < 3) return new Map()
  const positions = new Map<number, string>()
  const seed = completedCount
  const firstPos = 2 + Math.floor(seededRandom(seed) * 5)
  let pos = firstPos
  let msgIdx = 0
  while (pos < completedCount) {
    positions.set(pos, ENCOURAGEMENTS[msgIdx % ENCOURAGEMENTS.length])
    msgIdx++
    pos += 7 + Math.floor(seededRandom(seed + pos) * 9)
  }
  return positions
}

export function getEncouragementForCount(weeklyCount: number, seed?: number): string | null {
  if (weeklyCount < 2) return null
  const r = seed !== undefined ? seededRandom(seed) : Math.random()
  if (weeklyCount >= 5) return ENCOURAGEMENTS[Math.floor(r * ENCOURAGEMENTS.length)]
  return ENCOURAGEMENTS[Math.floor(r * 4)]
}
