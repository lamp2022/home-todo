import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Carousel } from './Carousel'
import type { Task } from '../types'

function makeTask(title: string, dateValue: string): Task {
  return {
    id: crypto.randomUUID(),
    title,
    category: 'Muu',
    deadline: { type: 'date', value: dateValue },
    assignee: null,
    recurring: false,
    recurrence: null,
    completedAt: null,
    completedBy: null,
    createdAt: '2026-01-01T00:00:00Z',
  }
}

describe('Carousel', () => {
  it('shows positive message when no tasks in next 7 days', () => {
    render(<Carousel tasks={[]} now={new Date('2026-04-01')} />)
    expect(screen.getByText(/ei deadlineja/i)).toBeInTheDocument()
  })

  it('shows day labels with task counts', () => {
    const tasks = [
      makeTask('A', '2026-04-01'),
      makeTask('B', '2026-04-01'),
      makeTask('C', '2026-04-03'),
    ]
    render(<Carousel tasks={tasks} now={new Date('2026-04-01')} />)
    expect(screen.getByText(/tänään/i)).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
