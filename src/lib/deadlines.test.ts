import { describe, it, expect } from 'vitest'
import { getCurrentSeason, isOverdue, sortByDeadline, getSeasonStartDate } from './deadlines'
import type { Task } from '../types'

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
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('getCurrentSeason', () => {
  it('returns kevät for March-May', () => {
    expect(getCurrentSeason(new Date('2026-03-15'))).toBe('kevät')
    expect(getCurrentSeason(new Date('2026-05-31'))).toBe('kevät')
  })

  it('returns kesä for June-August', () => {
    expect(getCurrentSeason(new Date('2026-06-01'))).toBe('kesä')
    expect(getCurrentSeason(new Date('2026-08-31'))).toBe('kesä')
  })

  it('returns syksy for September-November', () => {
    expect(getCurrentSeason(new Date('2026-09-01'))).toBe('syksy')
    expect(getCurrentSeason(new Date('2026-11-30'))).toBe('syksy')
  })

  it('returns talvi for December-February', () => {
    expect(getCurrentSeason(new Date('2026-12-01'))).toBe('talvi')
    expect(getCurrentSeason(new Date('2027-01-15'))).toBe('talvi')
    expect(getCurrentSeason(new Date('2027-02-28'))).toBe('talvi')
  })
})

describe('getSeasonStartDate', () => {
  it('returns March 1 for kevät', () => {
    expect(getSeasonStartDate('kevät', 2026)).toEqual(new Date(2026, 2, 1))
  })

  it('returns December 1 for talvi', () => {
    expect(getSeasonStartDate('talvi', 2026)).toEqual(new Date(2026, 11, 1))
  })
})

describe('isOverdue', () => {
  const now = new Date('2026-04-01')

  it('detects overdue date deadline', () => {
    const task = makeTask({ deadline: { type: 'date', value: '2026-03-15' } })
    expect(isOverdue(task, now)).toBe(true)
  })

  it('future date is not overdue', () => {
    const task = makeTask({ deadline: { type: 'date', value: '2026-04-15' } })
    expect(isOverdue(task, now)).toBe(false)
  })

  it('detects overdue season', () => {
    const task = makeTask({ deadline: { type: 'season', value: 'talvi-2025' } })
    expect(isOverdue(task, now)).toBe(true)
  })

  it('current season is not overdue', () => {
    const task = makeTask({ deadline: { type: 'season', value: 'kevät-2026' } })
    expect(isOverdue(task, now)).toBe(false)
  })

  it('no deadline is never overdue', () => {
    const task = makeTask()
    expect(isOverdue(task, now)).toBe(false)
  })

  it('detects overdue month', () => {
    const task = makeTask({ deadline: { type: 'month', value: '2026-02' } })
    expect(isOverdue(task, now)).toBe(true)
  })

  it('detects overdue year', () => {
    const task = makeTask({ deadline: { type: 'year', value: '2025' } })
    expect(isOverdue(task, now)).toBe(true)
  })
})

describe('sortByDeadline', () => {
  const now = new Date('2026-04-01')

  it('sorts overdue before non-overdue', () => {
    const overdue = makeTask({ title: 'overdue', deadline: { type: 'date', value: '2026-03-01' } })
    const future = makeTask({ title: 'future', deadline: { type: 'date', value: '2026-04-15' } })
    const sorted = sortByDeadline([future, overdue], now)
    expect(sorted[0].title).toBe('overdue')
  })

  it('sorts nearer dates first', () => {
    const near = makeTask({ title: 'near', deadline: { type: 'date', value: '2026-04-05' } })
    const far = makeTask({ title: 'far', deadline: { type: 'date', value: '2026-04-20' } })
    const sorted = sortByDeadline([far, near], now)
    expect(sorted[0].title).toBe('near')
  })

  it('sorts no-deadline last', () => {
    const dated = makeTask({ title: 'dated', deadline: { type: 'date', value: '2026-04-05' } })
    const none = makeTask({ title: 'none' })
    const sorted = sortByDeadline([none, dated], now)
    expect(sorted[0].title).toBe('dated')
    expect(sorted[1].title).toBe('none')
  })
})
