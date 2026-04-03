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
  [/(?:^|\s)(viikottain|viikoittain|viikotain|joka viikko)(?:\s|$)/i, 'weekly'],
  [/(?:^|\s)(kuukausittain|kuukausitain|joka kuukausi)(?:\s|$)/i, 'monthly'],
  [/(?:^|\s)(vuosittain|vuositain|joka vuosi|kerran vuodessa)(?:\s|$)/i, 'yearly'],
  [/(?:^|\s)(kausittain|kausitain|joka kausi)(?:\s|$)/i, 'seasonal'],
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getISOWeek(date: Date): number {
  const d = new Date(date.getTime())
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / DAY_MS - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

/** Returns the Monday of the given ISO week */
function isoWeekToDate(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = (jan4.getDay() + 6) % 7 // 0=Mon
  const week1Monday = new Date(jan4.getTime() - dayOfWeek * DAY_MS)
  return new Date(week1Monday.getTime() + (week - 1) * 7 * DAY_MS)
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
      return isoWeekToDate(y, w).getTime()
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

// ─── Deadline helper functions (reusable from UI chips) ─────────────────────

export function todayDeadline(): { type: DeadlineType; value: string } {
  return { type: 'date', value: new Date().toISOString().split('T')[0] }
}

export function tomorrowDeadline(): { type: DeadlineType; value: string } {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return { type: 'date', value: d.toISOString().split('T')[0] }
}

export function nextWeekDeadline(): { type: DeadlineType; value: string } {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  const year = d.getFullYear()
  const week = getISOWeek(d)
  return { type: 'week', value: `${year}-W${String(week).padStart(2, '0')}` }
}

export function thisMonthDeadline(): { type: DeadlineType; value: string } {
  const d = new Date()
  return { type: 'month', value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
}

export function nextMonthDeadline(): { type: DeadlineType; value: string } {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return { type: 'month', value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
}

const DEADLINE_PATTERNS: [RegExp, () => { type: DeadlineType; value: string }][] = [
  [/(?:^|\s)(?:huomenna|huomena)(?:\s|$)/i, tomorrowDeadline],
  [/(?:^|\s)(?:tänään|tänän)(?:\s|$)/i, todayDeadline],
  [/(?:^|\s)ensi viiko(?:lla|la)(?:\s|$)/i, nextWeekDeadline],
  [/(?:^|\s)ensi kuu(?:ssa|sa)(?:\s|$)/i, nextMonthDeadline],
  ...MONTH_NAMES.map((name, i): [RegExp, () => { type: DeadlineType; value: string }] => [
    new RegExp(`(?:^|\\s)${name}kuu(?:ssa|ssä|sa|sä)(?:\\s|$)`, 'i'),
    () => {
      const month = i + 1
      const now = new Date()
      const year = now.getMonth() + 1 > month ? now.getFullYear() + 1 : now.getFullYear()
      return { type: 'month', value: `${year}-${String(month).padStart(2, '0')}` }
    },
  ]),
  [/(?:^|\s)(?:keväällä|kevällä|keväälä)(?:\s|$)/i, () => ({ type: 'season' as DeadlineType, value: `kevät-${deadlineYear('kevät')}` })],
  [/(?:^|\s)(?:kesällä|kesälä)(?:\s|$)/i, () => ({ type: 'season' as DeadlineType, value: `kesä-${deadlineYear('kesä')}` })],
  [/(?:^|\s)(?:syksyllä|syksylä)(?:\s|$)/i, () => ({ type: 'season' as DeadlineType, value: `syksy-${deadlineYear('syksy')}` })],
  [/(?:^|\s)(?:talvella|talvela)(?:\s|$)/i, () => ({ type: 'season' as DeadlineType, value: `talvi-${deadlineYear('talvi')}` })],
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
      const weekStart = isoWeekToDate(y, w)
      const weekEnd = new Date(weekStart.getTime() + 7 * DAY_MS)
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

export type TimeGroup = 'overdue' | 'thisWeek' | 'nextWeek' | 'thisMonth' | 'later' | 'noDeadline'

export const TIME_GROUP_LABELS: Record<TimeGroup, string> = {
  overdue: 'Myöhässä',
  thisWeek: 'Tällä viikolla',
  nextWeek: 'Ensi viikolla',
  thisMonth: 'Tässä kuussa',
  later: 'Myöhemmin',
  noDeadline: 'Ei deadlinea',
}

export function groupByTimeframe(
  tasks: Task[],
  now: Date = new Date()
): { group: TimeGroup; label: string; tasks: Task[] }[] {
  const currentWeek = getISOWeek(now)
  const currentYear = now.getFullYear()
  const weekMonday = isoWeekToDate(currentYear, currentWeek)
  const thisWeekEnd = new Date(weekMonday.getTime() + 7 * DAY_MS)
  const nextWeekEnd = new Date(weekMonday.getTime() + 14 * DAY_MS)
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const buckets: Record<TimeGroup, Task[]> = {
    overdue: [],
    thisWeek: [],
    nextWeek: [],
    thisMonth: [],
    later: [],
    noDeadline: [],
  }

  for (const task of tasks) {
    if (task.deadline.type === null) {
      buckets.noDeadline.push(task)
    } else if (isOverdue(task, now)) {
      buckets.overdue.push(task)
    } else {
      const sortDate = deadlineToSortDate(task)
      if (sortDate < thisWeekEnd.getTime()) {
        buckets.thisWeek.push(task)
      } else if (sortDate < nextWeekEnd.getTime()) {
        buckets.nextWeek.push(task)
      } else if (sortDate <= thisMonthEnd.getTime()) {
        buckets.thisMonth.push(task)
      } else {
        buckets.later.push(task)
      }
    }
  }

  const order: TimeGroup[] = ['overdue', 'thisWeek', 'nextWeek', 'thisMonth', 'later', 'noDeadline']
  return order
    .filter((g) => buckets[g].length > 0)
    .map((g) => ({
      group: g,
      label: TIME_GROUP_LABELS[g],
      tasks: sortByDeadline(buckets[g], now),
    }))
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
