import { describe, it, expect, beforeEach } from 'vitest'
import { createStore, type Storage } from './useStore'

function createMemoryStorage(): Storage & { data: Record<string, string> } {
  const data: Record<string, string> = {}
  return {
    data,
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => { data[key] = value },
    removeItem: (key: string) => { delete data[key] },
  }
}

let storage: ReturnType<typeof createMemoryStorage>

beforeEach(() => {
  storage = createMemoryStorage()
})

describe('Store', () => {
  it('starts with empty tasks and default categories', () => {
    const store = createStore(storage)
    expect(store.getState().tasks).toEqual([])
    expect(store.getState().categories).toEqual([
      'Kodinhoito', 'Piha', 'Ajoneuvot', 'Talous', 'Terveys', 'Muu',
    ])
  })

  it('adds a task', () => {
    const store = createStore(storage)
    store.addTask({ title: 'Nuohous', category: 'Kodinhoito' })
    const tasks = store.getState().tasks
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('Nuohous')
    expect(tasks[0].category).toBe('Kodinhoito')
    expect(tasks[0].id).toBeTruthy()
    expect(tasks[0].completedAt).toBeNull()
    expect(tasks[0].createdAt).toBeTruthy()
  })

  it('persists tasks to storage', () => {
    const store = createStore(storage)
    store.addTask({ title: 'Katsastus', category: 'Ajoneuvot' })
    const store2 = createStore(storage)
    expect(store2.getState().tasks).toHaveLength(1)
    expect(store2.getState().tasks[0].title).toBe('Katsastus')
  })

  it('updates a task', () => {
    const store = createStore(storage)
    const task = store.addTask({ title: 'Nuohous', category: 'Kodinhoito' })
    store.updateTask(task.id, { title: 'Nuohous 2026', category: 'Piha' })
    expect(store.getState().tasks[0].title).toBe('Nuohous 2026')
    expect(store.getState().tasks[0].category).toBe('Piha')
  })

  it('deletes a task', () => {
    const store = createStore(storage)
    const task = store.addTask({ title: 'Nuohous', category: 'Kodinhoito' })
    store.deleteTask(task.id)
    expect(store.getState().tasks).toHaveLength(0)
  })

  it('completes a task with timestamp and completedBy', () => {
    const store = createStore(storage)
    store.setDeviceOwner('Mika')
    const task = store.addTask({ title: 'Nuohous', category: 'Kodinhoito' })
    store.completeTask(task.id)
    const completed = store.getState().tasks[0]
    expect(completed.completedAt).toBeTruthy()
    expect(completed.completedBy).toBe('Mika')
  })

  it('manages persons', () => {
    const store = createStore(storage)
    const person = store.addPerson('Mika')
    expect(store.getState().persons).toHaveLength(1)
    expect(person.name).toBe('Mika')
    store.removePerson(person.id)
    expect(store.getState().persons).toHaveLength(0)
  })

  it('manages device owner', () => {
    const store = createStore(storage)
    store.setDeviceOwner('Mika')
    expect(store.getState().deviceOwner).toBe('Mika')
  })
})
