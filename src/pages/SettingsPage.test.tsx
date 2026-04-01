import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { StoreProvider } from '../store/StoreContext'
import { SettingsPage } from './SettingsPage'
import type { Storage } from '../store/useStore'

function createMemoryStorage(): Storage {
  const data: Record<string, string> = {}
  return {
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => { data[k] = v },
    removeItem: (k: string) => { delete data[k] },
  }
}

function renderSettings() {
  return render(
    <BrowserRouter>
      <StoreProvider storage={createMemoryStorage()}>
        <SettingsPage />
      </StoreProvider>
    </BrowserRouter>
  )
}

describe('SettingsPage', () => {
  it('shows default categories', () => {
    renderSettings()
    expect(screen.getAllByText('Kodinhoito').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Piha').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Ajoneuvot').length).toBeGreaterThanOrEqual(1)
  })

  it('can add a person', async () => {
    const user = userEvent.setup()
    renderSettings()
    const input = screen.getByPlaceholderText(/uusi henkilö/i)
    await user.type(input, 'Mika{Enter}')
    expect(screen.getAllByText('Mika').length).toBeGreaterThanOrEqual(1)
  })

  it('can add a custom category', async () => {
    const user = userEvent.setup()
    renderSettings()
    const input = screen.getByPlaceholderText(/uusi kategoria/i)
    await user.type(input, 'Lemmikit{Enter}')
    expect(screen.getAllByText('Lemmikit').length).toBeGreaterThanOrEqual(1)
  })
})
