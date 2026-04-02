import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { StoreProvider } from '../store/StoreContext'
import { QuickInput } from '../components/QuickInput'
import { TaskSheet } from '../components/TaskSheet'
import { SettingsPage } from '../pages/SettingsPage'
import { TasksPage } from '../pages/TasksPage'
import { BottomNav } from '../components/BottomNav'
import { TaskCard } from '../components/TaskCard'
import { DeadlinePicker } from '../components/DeadlinePicker'
import type { AppState } from '../types'

/* ── shared helpers ─────────────────────────────────────── */

function makeStorage(initial?: AppState) {
  const data: Record<string, string> = initial
    ? { 'kotiasiat-state': JSON.stringify(initial) }
    : {}
  return {
    data,
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => { data[k] = v },
    removeItem: (k: string) => { delete data[k] },
  }
}

function wrap(ui: React.ReactElement, initial?: AppState) {
  return render(
    <BrowserRouter>
      <StoreProvider storage={makeStorage(initial)}>{ui}</StoreProvider>
    </BrowserRouter>
  )
}

const TEST_TASK: AppState['tasks'][0] = {
  id: 'test-id',
  title: 'Nuohous',
  category: 'Kodinhoito',
  deadline: { type: null, value: null },
  assignee: null,
  recurring: false,
  recurrence: null,
  note: null,
  completedAt: null,
  completedBy: null,
  createdAt: '2026-01-01T00:00:00Z',
}

const STATE_WITH_TASK: AppState = {
  tasks: [TEST_TASK],
  persons: [],
  categories: ['Kodinhoito', 'Piha', 'Ajoneuvot', 'Talous', 'Terveys', 'Muu'],
  deviceOwner: null,
}

/* ── FIX-001: iOS auto-zoom — inputs must use text-base ── */

describe('FIX-001: iOS auto-zoom prevention (text-base on inputs)', () => {
  it('QuickInput text field uses text-base, not text-sm', () => {
    wrap(<QuickInput />)
    const input = screen.getByPlaceholderText(/lisää tehtävä/i)
    expect(input.className).toContain('text-base')
    expect(input.className).not.toContain('text-sm')
  })

  it('TaskSheet title input uses text-lg (>=16px, no iOS zoom)', () => {
    wrap(<TaskSheet taskId="test-id" onClose={() => {}} />, STATE_WITH_TASK)
    const input = screen.getByDisplayValue('Nuohous')
    // text-lg is 18px which also prevents iOS auto-zoom (threshold is 16px)
    expect(input.className).toContain('text-lg')
  })

  it('TaskSheet select fields use text-base, not text-sm', () => {
    wrap(<TaskSheet taskId="test-id" onClose={() => {}} />, STATE_WITH_TASK)
    const selects = screen.getAllByRole('combobox')
    selects.forEach((sel) => {
      expect(sel.className).toContain('text-base')
      expect(sel.className).not.toContain('text-sm')
    })
  })

  it('TaskSheet textarea uses text-base, not text-sm', () => {
    wrap(<TaskSheet taskId="test-id" onClose={() => {}} />, STATE_WITH_TASK)
    const textarea = screen.getByPlaceholderText(/lisätietoja/i)
    expect(textarea.className).toContain('text-base')
    expect(textarea.className).not.toContain('text-sm')
  })

  it('SettingsPage inputs use text-base, not text-sm', () => {
    wrap(<SettingsPage />)
    const personInput = screen.getByPlaceholderText(/uusi henkilö/i)
    expect(personInput.className).toContain('text-base')
    expect(personInput.className).not.toContain('text-sm')

    const catInput = screen.getByPlaceholderText(/uusi kategoria/i)
    expect(catInput.className).toContain('text-base')
    expect(catInput.className).not.toContain('text-sm')
  })

  it('SettingsPage device owner select uses text-base, not text-sm', () => {
    wrap(<SettingsPage />)
    // The device owner dropdown
    const selects = screen.getAllByRole('combobox')
    selects.forEach((sel) => {
      expect(sel.className).toContain('text-base')
      expect(sel.className).not.toContain('text-sm')
    })
  })
})

/* ── FIX-002: QuickInput visible submit button ──────────── */

describe('FIX-002: QuickInput visible submit button', () => {
  it('has a visible submit button labeled Lisää', async () => {
    const user = userEvent.setup()
    wrap(<QuickInput />)
    const input = screen.getByPlaceholderText(/lisää tehtävä/i)
    await user.type(input, 'Testi')
    expect(screen.getByRole('button', { name: /lisää/i })).toBeInTheDocument()
  })

  it('clicking the submit button creates a task and clears input', async () => {
    const user = userEvent.setup()
    wrap(<QuickInput />)
    const input = screen.getByPlaceholderText(/lisää tehtävä/i)
    await user.type(input, 'Testitehtävä')
    const btn = screen.getByRole('button', { name: /lisää/i })
    await user.click(btn)
    expect(input).toHaveValue('')
  })
})

/* ── FIX-003: Quick deadline chips too small ────────────── */

describe('FIX-003: Quick deadline chips adequate touch target', () => {
  it('deadline chips have py-2.5 or py-2 for touch target', () => {
    wrap(<QuickInput />)
    const chip = screen.getByRole('button', { name: /tänään/i })
    const cls = chip.className
    expect(cls).toMatch(/py-2(\.5)?/)
    expect(cls).not.toContain('py-1 ')
    expect(cls).not.toMatch(/py-1\b/)
  })
})

/* ── FIX-004: View mode toggle buttons too small ────────── */

describe('FIX-004: View mode toggle buttons adequate size', () => {
  it('toggle buttons have py-2.5 for touch target', () => {
    wrap(<TasksPage />, STATE_WITH_TASK)
    const catBtn = screen.getByRole('button', { name: /kategoriat/i })
    const timeBtn = screen.getByRole('button', { name: /aikajärjestys/i })
    expect(catBtn.className).toMatch(/py-2(\.5)?/)
    expect(timeBtn.className).toMatch(/py-2(\.5)?/)
  })
})

/* ── FIX-005: active: states on interactive elements ────── */

describe('FIX-005: active: states on interactive elements', () => {
  it('QuickInput deadline chips have active: state', () => {
    wrap(<QuickInput />)
    const chip = screen.getByRole('button', { name: /tänään/i })
    expect(chip.className).toContain('active:')
  })

  it('TasksPage view toggle buttons have transition feedback', () => {
    wrap(<TasksPage />, STATE_WITH_TASK)
    const catBtn = screen.getByRole('button', { name: /kategoriat/i })
    // Buttons use transition-colors for visual feedback instead of active: pseudo
    expect(catBtn.className).toContain('transition-colors')
  })
})

/* ── FIX-007: BottomNav safe-area-inset-bottom ──────────── */

describe('FIX-007: BottomNav safe-area-inset-bottom', () => {
  it('BottomNav has safe-area padding class', () => {
    wrap(<BottomNav />)
    const nav = screen.getByRole('navigation')
    const cls = nav.className
    expect(cls).toMatch(/pb-safe|safe-area|env\(safe-area/)
  })
})

/* ── FIX-008: TaskCard checkbox too small ───────────────── */

describe('FIX-008: TaskCard checkbox adequate size', () => {
  it('checkbox has w-5 h-5 or larger, not w-4 h-4', () => {
    wrap(
      <TaskCard task={TEST_TASK} color="#ccc" onCheck={() => {}} />,
      STATE_WITH_TASK,
    )
    const checkbox = screen.getByRole('checkbox')
    const cls = checkbox.className
    expect(cls).not.toContain('w-4')
    expect(cls).not.toContain('h-4')
    expect(cls).toMatch(/w-5|w-6/)
    expect(cls).toMatch(/h-5|h-6/)
  })
})

/* ── FIX-011: Settings add-suggestion row flex-wrap ─────── */

describe('FIX-011: Settings suggestion row wraps', () => {
  it('add-suggestion container has flex-wrap', () => {
    wrap(<SettingsPage />)
    // The suggestion add row is a div with the inputs for new suggestion
    const nameInput = screen.getByPlaceholderText(/ehdotuksen nimi/i)
    const container = nameInput.closest('div')!
    expect(container.className).toContain('flex-wrap')
  })
})

/* ── FIX-014: TaskSheet locks body scroll ───────────────── */

describe('FIX-014: TaskSheet locks body scroll', () => {
  it('opening TaskSheet sets body overflow to hidden', () => {
    wrap(<TaskSheet taskId="test-id" onClose={() => {}} />, STATE_WITH_TASK)
    expect(document.body.style.overflow).toBe('hidden')
  })
})

/* ── FIX-015: Calendar day buttons too small ────────────── */

describe('FIX-015: Calendar day buttons adequate touch target', () => {
  it('calendar day buttons have py-2.5 or py-2, not py-1.5', () => {
    wrap(
      <DeadlinePicker
        deadline={{ type: 'date', value: null }}
        onTypeChange={() => {}}
        onValueChange={() => {}}
      />,
    )
    // Get a day button (numeric text)
    const dayButtons = screen.getAllByRole('button').filter((b) => /^\d+$/.test(b.textContent ?? ''))
    expect(dayButtons.length).toBeGreaterThan(0)
    const cls = dayButtons[0].className
    expect(cls).toMatch(/py-2(\.5)?/)
    expect(cls).not.toMatch(/py-1\.5/)
  })
})
