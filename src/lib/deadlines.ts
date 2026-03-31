import type { Task } from '../types'

const SEASONS = {
  kevät: { start: 3, end: 5 },
  kesä: { start: 6, end: 8 },
  syksy: { start: 9, end: 11 },
  talvi: { start: 12, end: 2 },
} as const

type Season = keyof typeof SEASONS

export function getCurrentSeason(date: Date): Season {
  const month = date.getMonth() + 1
  if (month >= 3 && month <= 5) return 'kevät'
  if (month >= 6 && month <= 8) return 'kesä'
  if (month >= 9 && month <= 11) return 'syksy'
  return 'talvi'
}

export function getSeasonStartDate(season: string, year: number): Date {
  const s = SEASONS[season as Season]
  if (!s) return new Date(year, 0, 1)
  return new Date(year, s.start - 1, 1)
}

function getSeasonEndDate(season: string, year: number): Date {
  const s = SEASONS[season as Season]
  if (!s) return new Date(year, 11, 31)
  if (season === 'talvi') {
    return new Date(year + 1, 2, 0) // end of Feb next year
  }
  return new Date(year, s.end, 0) // last day of end month
}

function deadlineToSortDate(task: Task): number {
  const { type, value } = task.deadline
  if (!type || !value) return Infinity

  switch (type) {
    case 'date':
      return new Date(value).getTime()
    case 'week': {
      const [y, w] = value.split('-W').map(Number)
      const jan1 = new Date(y, 0, 1)
      return jan1.getTime() + (w - 1) * 7 * 86400000
    }
    case 'month': {
      const [y, m] = value.split('-').map(Number)
      return new Date(y, m - 1, 1).getTime()
    }
    case 'season': {
      const [s, y] = value.split('-')
      return getSeasonStartDate(s, Number(y)).getTime()
    }
    case 'year':
      return new Date(Number(value), 0, 1).getTime()
    default:
      return Infinity
  }
}

export function isOverdue(task: Task, now: Date = new Date()): boolean {
  const { type, value } = task.deadline
  if (!type || !value) return false

  switch (type) {
    case 'date':
      return new Date(value) < now
    case 'week': {
      const [y, w] = value.split('-W').map(Number)
      const jan1 = new Date(y, 0, 1)
      const weekEnd = new Date(jan1.getTime() + w * 7 * 86400000)
      return weekEnd < now
    }
    case 'month': {
      const [y, m] = value.split('-').map(Number)
      const monthEnd = new Date(y, m, 0) // last day of month
      return monthEnd < now
    }
    case 'season': {
      const [s, y] = value.split('-')
      return getSeasonEndDate(s, Number(y)) < now
    }
    case 'year':
      return new Date(Number(value), 11, 31) < now
    default:
      return false
  }
}

export function sortByDeadline(tasks: Task[], now: Date = new Date()): Task[] {
  return [...tasks].sort((a, b) => {
    const aOverdue = isOverdue(a, now)
    const bOverdue = isOverdue(b, now)
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1
    return deadlineToSortDate(a) - deadlineToSortDate(b)
  })
}
