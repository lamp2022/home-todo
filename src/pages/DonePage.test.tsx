import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { StoreProvider } from '../store/StoreContext'
import { DonePage } from './DonePage'
import type { Storage } from '../store/useStore'
import type { AppState } from '../types'
import { DEFAULT_CATEGORIES } from '../types'

function createStorageWith(tasks: AppState['tasks']): Storage {
  const state: AppState = {
    tasks,
    persons: [],
    categories: [...DEFAULT_CATEGORIES],
    deviceOwner: 'Mika',
  }
  const data: Record<string, string> = {
    'kotiasiat-state': JSON.stringify(state),
  }
  return {
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => { data[k] = v },
    removeItem: (k: string) => { delete data[k] },
  }
}

function renderDone(storage: Storage) {
  return render(
    <BrowserRouter>
      <StoreProvider storage={storage}>{<DonePage />}</StoreProvider>
    </BrowserRouter>
  )
}

describe('DonePage', () => {
  it('shows empty state when no completed tasks', () => {
    const storage = createStorageWith([])
    renderDone(storage)
    expect(screen.getByText(/ei vielä tehty/i)).toBeInTheDocument()
  })

  it('shows weekly summary count', () => {
    const now = new Date()
    const storage = createStorageWith([
      {
        id: '1', title: 'Nuohous', category: 'Kodinhoito',
        deadline: { type: null, value: null }, assignee: null,
        recurring: false, recurrence: null, note: null,
        completedAt: now.toISOString(), completedBy: 'Mika',
        createdAt: now.toISOString(),
      },
    ])
    renderDone(storage)
    expect(screen.getByText(/tällä viikolla/i)).toBeInTheDocument()
    expect(screen.getByText(/1/)).toBeInTheDocument()
  })

  it('shows completed task with strikethrough', () => {
    const now = new Date()
    const storage = createStorageWith([
      {
        id: '1', title: 'Nuohous', category: 'Kodinhoito',
        deadline: { type: null, value: null }, assignee: null,
        recurring: false, recurrence: null, note: null,
        completedAt: now.toISOString(), completedBy: 'Mika',
        createdAt: now.toISOString(),
      },
    ])
    renderDone(storage)
    const el = screen.getByText('Nuohous')
    expect(el.className).toContain('line-through')
  })
})
