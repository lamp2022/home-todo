import { describe, it, expect } from 'vitest'
import type { Task } from '../types'
import {
  getWeekStart,
  formatDay,
  getRecentlyDone,
  groupByDay,
  getWeeklyStats,
  getEncouragementPositions,
  getEncouragementForCount,
  ENCOURAGEMENTS,
} from './completionStats'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    title: 'Test',
    category: 'Muu',
    deadline: { type: null, value: null },
    assignee: null,
    recurring: false,
    recurrence: null,
    completedAt: null,
    completedBy: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('getWeekStart', () => {
  it('returns Monday for a Wednesday', () => {
    const wed = new Date('2026-04-01') // Wednesday
    const start = getWeekStart(wed)
    expect(start.getDay()).toBe(1) // Monday
    expect(start.getDate()).toBe(30) // March 30
  })

  it('returns same day for a Monday', () => {
    const mon = new Date('2026-03-30')
    const start = getWeekStart(mon)
    expect(start.getDate()).toBe(30)
  })
})

describe('formatDay', () => {
  it('returns Tänään for today', () => {
    expect(formatDay(new Date())).toBe('Tänään')
  })

  it('returns Eilen for yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(formatDay(yesterday)).toBe('Eilen')
  })

  it('returns formatted date for older dates', () => {
    const old = new Date('2026-01-15')
    expect(formatDay(old)).toMatch(/15\.1\.2026/)
  })
})

describe('getRecentlyDone', () => {
  it('returns completed tasks within window', () => {
    const now = new Date()
    const recent = makeTask({ completedAt: new Date(now.getTime() - 2 * 86400000).toISOString() })
    const old = makeTask({ completedAt: new Date(now.getTime() - 10 * 86400000).toISOString() })
    const active = makeTask()

    const result = getRecentlyDone({ tasks: [recent, old, active], withinDays: 7 })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(recent.id)
  })

  it('sorts newest first', () => {
    const now = new Date()
    const a = makeTask({ completedAt: new Date(now.getTime() - 1 * 86400000).toISOString() })
    const b = makeTask({ completedAt: new Date(now.getTime() - 3 * 86400000).toISOString() })

    const result = getRecentlyDone({ tasks: [b, a], withinDays: 7 })
    expect(result[0].id).toBe(a.id)
  })
})

describe('groupByDay', () => {
  it('groups tasks by completion day', () => {
    const t1 = makeTask({ completedAt: '2026-04-01T10:00:00Z' })
    const t2 = makeTask({ completedAt: '2026-04-01T14:00:00Z' })
    const t3 = makeTask({ completedAt: '2026-03-31T10:00:00Z' })

    const groups = groupByDay([t1, t2, t3])
    expect(groups.length).toBeGreaterThanOrEqual(1)
  })
})

describe('getWeeklyStats', () => {
  it('counts tasks in this and last week', () => {
    const now = new Date('2026-04-01T12:00:00Z')
    const thisWeek = makeTask({ completedAt: '2026-04-01T10:00:00Z' })
    const lastWeek = makeTask({ completedAt: '2026-03-25T10:00:00Z' })
    const older = makeTask({ completedAt: '2026-03-01T10:00:00Z' })

    const stats = getWeeklyStats([thisWeek, lastWeek, older], now)
    expect(stats.thisWeek).toBe(1)
    expect(stats.lastWeek).toBe(1)
  })
})

describe('getEncouragementPositions', () => {
  it('returns empty map for small counts', () => {
    expect(getEncouragementPositions(0).size).toBe(0)
    expect(getEncouragementPositions(2).size).toBe(0)
  })

  it('returns positions for larger counts', () => {
    const positions = getEncouragementPositions(20)
    expect(positions.size).toBeGreaterThan(0)
    for (const [pos, msg] of positions) {
      expect(pos).toBeGreaterThanOrEqual(2)
      expect(pos).toBeLessThan(20)
      expect(ENCOURAGEMENTS).toContain(msg)
    }
  })

  it('is deterministic', () => {
    const a = getEncouragementPositions(15)
    const b = getEncouragementPositions(15)
    expect([...a.entries()]).toEqual([...b.entries()])
  })
})

describe('getEncouragementForCount', () => {
  it('returns null for 0-1 tasks', () => {
    expect(getEncouragementForCount(0)).toBeNull()
    expect(getEncouragementForCount(1)).toBeNull()
  })

  it('returns encouragement for 2+ tasks', () => {
    const msg = getEncouragementForCount(3, 42)
    expect(msg).toBeTruthy()
    expect(ENCOURAGEMENTS).toContain(msg)
  })

  it('is deterministic with seed', () => {
    const a = getEncouragementForCount(5, 99)
    const b = getEncouragementForCount(5, 99)
    expect(a).toBe(b)
  })
})
