import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { StoreProvider } from '../store/StoreContext'
import { QuickInput } from './QuickInput'

function renderWithProviders(ui: React.ReactElement) {
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

describe('QuickInput', () => {
  it('creates a task when pressing Enter', async () => {
    const user = userEvent.setup()
    renderWithProviders(<QuickInput />)
    const input = screen.getByPlaceholderText(/kirjoita tehtävä/i)
    await user.type(input, 'Nuohous{Enter}')
    // input should clear after creation
    expect(input).toHaveValue('')
  })

  it('does not create a task with empty title', async () => {
    const user = userEvent.setup()
    renderWithProviders(<QuickInput />)
    const input = screen.getByPlaceholderText(/kirjoita tehtävä/i)
    await user.type(input, '{Enter}')
    expect(input).toHaveValue('')
  })
})
