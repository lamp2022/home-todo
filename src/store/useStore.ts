import type { Task, AppState, Suggestion } from '../types'
import { DEFAULT_CATEGORIES } from '../types'

const STORAGE_KEY = 'kotiasiat-state'

function initialState(): AppState {
  return {
    tasks: [],
    persons: [],
    categories: [...DEFAULT_CATEGORIES],
    deviceOwner: null,
  }
}

export interface Storage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

function loadState(storage: Storage): AppState {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return initialState()
}

function saveState(storage: Storage, state: AppState) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function createStore(storage: Storage = localStorage) {
  let state = loadState(storage)

  return {
    getState: () => state,

    addTask(partial: { title: string; category: string; deadline?: Task['deadline']; assignee?: string | null; recurring?: boolean; recurrence?: Task['recurrence'] }) {
      const title = partial.title.trim()
      if (!title) throw new Error('Task title cannot be empty')
      const category = partial.category || state.categories[0] || 'Muu'
      if (!state.categories.includes(category)) {
        state = { ...state, categories: [...state.categories, category] }
      }
      const task: Task = {
        id: crypto.randomUUID(),
        title,
        category,
        deadline: partial.deadline ?? { type: null, value: null },
        assignee: partial.assignee ?? null,
        recurring: partial.recurring ?? false,
        recurrence: partial.recurrence ?? null,
        note: null,
        completedAt: null,
        completedBy: null,
        createdAt: new Date().toISOString(),
      }
      state = { ...state, tasks: [...state.tasks, task] }
      saveState(storage, state)
      return task
    },

    updateTask(id: string, updates: Partial<Pick<Task, 'title' | 'category' | 'deadline' | 'assignee' | 'recurring' | 'recurrence' | 'note'>>) {
      state = {
        ...state,
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }
      saveState(storage, state)
    },

    deleteTask(id: string) {
      state = { ...state, tasks: state.tasks.filter((t) => t.id !== id) }
      saveState(storage, state)
    },

    completeTask(id: string) {
      state = {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === id
            ? { ...t, completedAt: new Date().toISOString(), completedBy: state.deviceOwner }
            : t
        ),
      }
      saveState(storage, state)
    },

    addPerson(name: string) {
      const person = { id: crypto.randomUUID(), name }
      state = { ...state, persons: [...state.persons, person] }
      saveState(storage, state)
      return person
    },

    removePerson(id: string) {
      state = { ...state, persons: state.persons.filter((p) => p.id !== id) }
      saveState(storage, state)
    },

    setDeviceOwner(name: string | null) {
      state = { ...state, deviceOwner: name }
      saveState(storage, state)
    },

    addCategory(name: string) {
      if (state.categories.includes(name)) return
      state = { ...state, categories: [...state.categories, name] }
      saveState(storage, state)
    },

    removeCategory(name: string) {
      state = { ...state, categories: state.categories.filter((c) => c !== name) }
      saveState(storage, state)
    },

    getSuggestions(): Suggestion[] {
      return state.suggestions ?? []
    },

    addSuggestion(s: { title: string; hint: string; category: string }) {
      const suggestion: Suggestion = { id: crypto.randomUUID(), ...s }
      state = { ...state, suggestions: [...(state.suggestions ?? []), suggestion] }
      saveState(storage, state)
      return suggestion
    },

    updateSuggestion(id: string, updates: Partial<Pick<Suggestion, 'title' | 'hint' | 'category'>>) {
      state = {
        ...state,
        suggestions: (state.suggestions ?? []).map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }
      saveState(storage, state)
    },

    removeSuggestion(id: string) {
      state = { ...state, suggestions: (state.suggestions ?? []).filter((s) => s.id !== id) }
      saveState(storage, state)
    },

    uncompleteTask(id: string) {
      state = {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, completedAt: null, completedBy: null } : t
        ),
      }
      saveState(storage, state)
    },
  }
}
