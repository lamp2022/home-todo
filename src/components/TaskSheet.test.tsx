import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { StoreProvider } from '../store/StoreContext'
import { TaskSheet } from './TaskSheet'
import type { AppState } from '../types'

const TEST_TASK: AppState['tasks'][0] = {
  id: 'test-id',
  title: 'Nuohous',
  category: 'Kodinhoito',
  deadline: { type: null, value: null },
  assignee: null,
  recurring: false,
  recurrence: null,
  completedAt: null,
  completedBy: null,
  createdAt: '2026-01-01T00:00:00Z',
}

function wrap(ui: React.ReactElement) {
  const initialState: AppState = {
    tasks: [TEST_TASK],
    persons: [],
    categories: ['Kodinhoito', 'Piha', 'Ajoneuvot', 'Talous', 'Terveys', 'Muu'],
    deviceOwner: null,
  }
  const storage = {
    data: { 'kotiasiat-state': JSON.stringify(initialState) } as Record<string, string>,
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

describe('TaskSheet', () => {
  it('renders task title for editing', () => {
    wrap(<TaskSheet taskId="test-id" onClose={() => {}} />)
    expect(screen.getByDisplayValue('Nuohous')).toBeInTheDocument()
  })

  it('has a delete button', () => {
    wrap(<TaskSheet taskId="test-id" onClose={() => {}} />)
    expect(screen.getByRole('button', { name: /poista/i })).toBeInTheDocument()
  })

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup()
    let closed = false
    wrap(<TaskSheet taskId="test-id" onClose={() => { closed = true }} />)
    const backdrop = screen.getByTestId('sheet-backdrop')
    await user.click(backdrop)
    expect(closed).toBe(true)
  })
})
