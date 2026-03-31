import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { StoreProvider } from '../store/StoreContext'
import { SeasonalSection } from './SeasonalSection'
import type { Task } from '../types'

function makeSeasonTask(title: string, season: string): Task {
  return {
    id: crypto.randomUUID(),
    title,
    category: 'Piha',
    deadline: { type: 'season', value: season },
    assignee: null,
    recurring: false,
    recurrence: null,
    completedAt: null,
    completedBy: null,
    createdAt: '2026-01-01T00:00:00Z',
  }
}

function wrap(ui: React.ReactElement) {
  const storage = {
    data: {} as Record<string, string>,
    getItem: (k: string) => storage.data[k] ?? null,
    setItem: (k: string, v: string) => { storage.data[k] = v },
    removeItem: (k: string) => { delete storage.data[k] },
  }
  return render(
    <BrowserRouter>
      <StoreProvider storage={storage}>{ui}</StoreProvider>
    </BrowserRouter>
  )
}

describe('SeasonalSection', () => {
  it('shows current season tasks', () => {
    const tasks = [makeSeasonTask('Haravointi', 'kevät-2026')]
    wrap(<SeasonalSection tasks={tasks} now={new Date('2026-04-01')} />)
    expect(screen.getByText('Haravointi')).toBeInTheDocument()
    expect(screen.getByText(/ajankohtaiset/i)).toBeInTheDocument()
  })

  it('hides when no seasonal tasks match current season', () => {
    const tasks = [makeSeasonTask('Lumityöt', 'talvi-2026')]
    const { container } = wrap(<SeasonalSection tasks={tasks} now={new Date('2026-04-01')} />)
    expect(container.textContent).toBe('')
  })
})
