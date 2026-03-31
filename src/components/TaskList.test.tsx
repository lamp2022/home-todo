import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { StoreProvider } from '../store/StoreContext'
import { TasksPage } from '../pages/TasksPage'
import type { Storage } from '../store/useStore'

function createMemoryStorage(): Storage {
  const data: Record<string, string> = {}
  return {
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => { data[k] = v },
    removeItem: (k: string) => { delete data[k] },
  }
}

function renderApp() {
  const storage = createMemoryStorage()
  return render(
    <BrowserRouter>
      <StoreProvider storage={storage}>
        <TasksPage />
      </StoreProvider>
    </BrowserRouter>
  )
}

describe('TasksPage', () => {
  it('shows empty state when no tasks', () => {
    renderApp()
    expect(screen.getByText(/ei tehtäviä/i)).toBeInTheDocument()
  })

  it('shows a task after adding via QuickInput', async () => {
    const user = userEvent.setup()
    renderApp()
    const input = screen.getByPlaceholderText(/kirjoita tehtävä/i)
    await user.type(input, 'Nuohous{Enter}')
    expect(screen.getByText('Nuohous')).toBeInTheDocument()
  })

  it('groups tasks by category', async () => {
    const user = userEvent.setup()
    renderApp()
    const input = screen.getByPlaceholderText(/kirjoita tehtävä/i)
    await user.type(input, 'Nuohous{Enter}')
    await user.type(input, 'Katsastus{Enter}')
    expect(screen.getByText('Kodinhoito')).toBeInTheDocument()
    expect(screen.getByText('Ajoneuvot')).toBeInTheDocument()
  })

  it('completes a task via checkbox', async () => {
    const user = userEvent.setup()
    renderApp()
    const input = screen.getByPlaceholderText(/kirjoita tehtävä/i)
    await user.type(input, 'Nuohous{Enter}')
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    expect(screen.queryByText('Nuohous')).not.toBeInTheDocument()
  })
})
