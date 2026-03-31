import type { Task } from '../types'

type DeadlineType = Task['deadline']['type']
type Recurrence = Task['recurrence']

interface ParseResult {
  title: string
  deadline: Task['deadline']
  recurring: boolean
  recurrence: Recurrence
}

// Use (?:^|\s) and (?:\s|$) instead of \b — JS \b doesn't work with ä/ö
const RECURRENCE_PATTERNS: [RegExp, 'weekly' | 'monthly' | 'yearly' | 'seasonal'][] = [
  [/(?:^|\s)(viikottain|viikoittain|joka viikko)(?:\s|$)/i, 'weekly'],
  [/(?:^|\s)(kuukausittain|joka kuukausi)(?:\s|$)/i, 'monthly'],
  [/(?:^|\s)(vuosittain|joka vuosi|kerran vuodessa)(?:\s|$)/i, 'yearly'],
  [/(?:^|\s)(kausittain|joka kausi)(?:\s|$)/i, 'seasonal'],
]

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
  [/(?:^|\s)keväällä(?:\s|$)/i, () => ({ type: 'season' as DeadlineType, value: `kevät-${deadlineYear('kevät')}` })],
  [/(?:^|\s)kesällä(?:\s|$)/i, () => ({ type: 'season' as DeadlineType, value: `kesä-${deadlineYear('kesä')}` })],
  [/(?:^|\s)syksyllä(?:\s|$)/i, () => ({ type: 'season' as DeadlineType, value: `syksy-${deadlineYear('syksy')}` })],
  [/(?:^|\s)talvella(?:\s|$)/i, () => ({ type: 'season' as DeadlineType, value: `talvi-${deadlineYear('talvi')}` })],
]

function getISOWeek(date: Date): number {
  const d = new Date(date.getTime())
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

const SEASON_MONTHS: Record<string, number[]> = {
  kevät: [3, 4, 5],
  kesä: [6, 7, 8],
  syksy: [9, 10, 11],
  talvi: [12, 1, 2],
}

function deadlineYear(season: string): number {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const seasonMonths = SEASON_MONTHS[season]
  const lastMonth = Math.max(...seasonMonths)
  if (currentMonth <= lastMonth) return now.getFullYear()
  return now.getFullYear() + 1
}

export function parseInput(raw: string): ParseResult {
  let title = raw.trim()
  let deadline: Task['deadline'] = { type: null, value: null }
  let recurring = false
  let recurrence: Recurrence = null

  // Check recurrence
  for (const [pattern, interval] of RECURRENCE_PATTERNS) {
    if (pattern.test(title)) {
      recurring = true
      recurrence = { interval, anchor: new Date().toISOString().split('T')[0] }
      title = title.replace(pattern, ' ').trim()
      break
    }
  }

  // Check deadline
  for (const [pattern, getDeadline] of DEADLINE_PATTERNS) {
    if (pattern.test(title)) {
      deadline = getDeadline()
      title = title.replace(pattern, ' ').trim()
      break
    }
  }

  // If recurring yearly but no deadline, set year deadline
  if (recurring && recurrence?.interval === 'yearly' && !deadline.type) {
    deadline = { type: 'year', value: String(new Date().getFullYear()) }
  }

  // Clean up extra spaces
  title = title.replace(/\s{2,}/g, ' ').trim()

  return { title, deadline, recurring, recurrence }
}
