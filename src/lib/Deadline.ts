import type { Task } from '../types'

// ─── Constants ───────────────────────────────────────────────────────────────

type DeadlineType = Task['deadline']['type']
type Recurrence = Task['recurrence']

const DAY_MS = 86400000

const SEASONS = {
  kevät: { start: 3, end: 5 },
  kesä: { start: 6, end: 8 },
  syksy: { start: 9, end: 11 },
  talvi: { start: 12, end: 2 },
} as const

type Season = keyof typeof SEASONS

const SEASON_MONTHS: Record<string, number[]> = {
  kevät: [3, 4, 5],
  kesä: [6, 7, 8],
  syksy: [9, 10, 11],
  talvi: [12, 1, 2],
}

const MONTH_NAMES = [
  'tammi', 'helmi', 'maalis', 'huhti', 'touko', 'kesä',
  'heinä', 'elo', 'syys', 'loka', 'marras', 'joulu',
]

const RECURRENCE_PATTERNS: [RegExp, 'weekly' | 'monthly' | 'yearly' | 'seasonal'][] = [
  [/(?:^|\s)(viikottain|viikoittain|joka viikko)(?:\s|$)/i, 'weekly'],
  [/(?:^|\s)(kuukausittain|joka kuukausi)(?:\s|$)/i, 'monthly'],
  [/(?:^|\s)(vuosittain|joka vuosi|kerran vuodessa)(?:\s|$)/i, 'yearly'],
  [/(?:^|\s)(kausittain|joka kausi)(?:\s|$)/i, 'seasonal'],
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getISOWeek(date: Date): number {
  const d = new Date(date.getTime())
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / DAY_MS - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

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
  if (season === 'talvi') return new Date(year + 1, 2, 0)
  return new Date(year, s.end, 0)
}

function deadlineYear(season: string): number {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const seasonMonths = SEASON_MONTHS[season]
  const lastMonth = Math.max(...seasonMonths)
  if (currentMonth <= lastMonth) return now.getFullYear()
  return now.getFullYear() + 1
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
      return jan1.getTime() + (w - 1) * 7 * DAY_MS
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

// ─── Deadline patterns for parsing ───────────────────────────────────────────

const DEADLINE_PATTERNS: [RegExp, () => { type: DeadlineType; value: string }][] = [
  [/(?:^|\s)huomenna(?:\s|$)/i, () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return { type: 'date', value: d.toISOString().split('T')[0] }
  }],
  [/(?:^|\s)tänään(?:\s|$)/i, () => ({
    type: 'date',
    value: new Date().toISOString().split('T')[0],
  })],
  [/(?:^|\s)ensi viikolla(?:\s|$)/i, () => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    const year = d.getFullYear()
    const week = getISOWeek(d)
    return { type: 'week', value: `${year}-W${String(week).padStart(2, '0')}` }
  }],
  [/(?:^|\s)ensi kuussa(?:\s|$)/i, () => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    return { type: 'month', value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
  }],
  ...MONTH_NAMES.map((name, i): [RegExp, () => { type: DeadlineType; value: string }] => [
    new RegExp(`(?:^|\\s)${name}kuu(?:ssa|ssä|ssa)(?:\\s|$)`, 'i'),
    () => {
      const month = i + 1
      const now = new Date()
      const year = now.getMonth() + 1 > month ? now.getFullYear() + 1 : now.getFullYear()
      return { type: 'month', value: `${year}-${String(month).padStart(2, '0')}` }
    },
  ]),
  [/(?:^|\s)keväällä(?:\s|$)/i, () => ({ type: 'season' as DeadlineType, value: `kevät-${deadlineYear('kevät')}` })],
  [/(?:^|\s)kesällä(?:\s|$)/i, () => ({ type: 'season' as DeadlineType, value: `kesä-${deadlineYear('kesä')}` })],
  [/(?:^|\s)syksyllä(?:\s|$)/i, () => ({ type: 'season' as DeadlineType, value: `syksy-${deadlineYear('syksy')}` })],
  [/(?:^|\s)talvella(?:\s|$)/i, () => ({ type: 'season' as DeadlineType, value: `talvi-${deadlineYear('talvi')}` })],
]

// ─── Public API ──────────────────────────────────────────────────────────────

export interface ParseResult {
  title: string
  deadline: Task['deadline']
  recurring: boolean
  recurrence: Recurrence
}

export function parseDeadline(raw: string): ParseResult {
  let title = raw.trim()
  let deadline: Task['deadline'] = { type: null, value: null }
  let recurring = false
  let recurrence: Recurrence = null

  for (const [pattern, interval] of RECURRENCE_PATTERNS) {
    if (pattern.test(title)) {
      recurring = true
      recurrence = { interval, anchor: new Date().toISOString().split('T')[0] }
      title = title.replace(pattern, ' ').trim()
      break
    }
  }

  for (const [pattern, getDeadline] of DEADLINE_PATTERNS) {
    if (pattern.test(title)) {
      deadline = getDeadline()
      title = title.replace(pattern, ' ').trim()
      break
    }
  }

  if (recurring && recurrence?.interval === 'yearly' && !deadline.type) {
    deadline = { type: 'year', value: String(new Date().getFullYear()) }
  }

  title = title.replace(/\s{2,}/g, ' ').trim()

  return { title, deadline, recurring, recurrence }
}

export function formatDeadline(task: Task): string {
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

export function isOverdue(task: Task, now: Date = new Date()): boolean {
  const { type, value } = task.deadline
  if (!type || !value) return false

  switch (type) {
    case 'date':
      return new Date(value) < now
    case 'week': {
      const [y, w] = value.split('-W').map(Number)
      const jan1 = new Date(y, 0, 1)
      const weekEnd = new Date(jan1.getTime() + w * 7 * DAY_MS)
      return weekEnd < now
    }
    case 'month': {
      const [y, m] = value.split('-').map(Number)
      const monthEnd = new Date(y, m, 0)
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

export function weekOptions(count = 24, from: Date = new Date()): { label: string; value: string }[] {
  const startWeek = getISOWeek(from)
  const year = from.getFullYear()
  return Array.from({ length: count }, (_, i) => {
    const w = startWeek + i
    const y = w > 52 ? year + 1 : year
    const wn = w > 52 ? w - 52 : w
    return { label: `Vko ${wn}`, value: `${y}-W${String(wn).padStart(2, '0')}` }
  })
}
