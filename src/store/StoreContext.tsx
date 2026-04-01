import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AppState } from '../types'
import { createStore, type Storage } from './useStore'

type StoreApi = ReturnType<typeof createStore>

interface StoreContextValue extends AppState {
  addTask: StoreApi['addTask']
  updateTask: StoreApi['updateTask']
  deleteTask: StoreApi['deleteTask']
  completeTask: StoreApi['completeTask']
  uncompleteTask: StoreApi['uncompleteTask']
  addPerson: StoreApi['addPerson']
  removePerson: StoreApi['removePerson']
  setDeviceOwner: StoreApi['setDeviceOwner']
  addCategory: StoreApi['addCategory']
  removeCategory: StoreApi['removeCategory']
  addSuggestion: StoreApi['addSuggestion']
  updateSuggestion: StoreApi['updateSuggestion']
  removeSuggestion: StoreApi['removeSuggestion']
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children, storage }: { children: ReactNode; storage?: Storage }) {
  const [store] = useState(() => createStore(storage))
  const [state, setState] = useState(() => store.getState())

  const wrap = useCallback(
    <T extends unknown[], R>(fn: (...args: T) => R) =>
      (...args: T): R => {
        const result = fn(...args)
        setState({ ...store.getState() })
        return result
      },
    [store]
  )

  return (
    <StoreContext.Provider
      value={{
        ...state,
        addTask: wrap(store.addTask.bind(store)),
        updateTask: wrap(store.updateTask.bind(store)),
        deleteTask: wrap(store.deleteTask.bind(store)),
        completeTask: wrap(store.completeTask.bind(store)),
        uncompleteTask: wrap(store.uncompleteTask.bind(store)),
        addPerson: wrap(store.addPerson.bind(store)),
        removePerson: wrap(store.removePerson.bind(store)),
        setDeviceOwner: wrap(store.setDeviceOwner.bind(store)),
        addCategory: wrap(store.addCategory.bind(store)),
        removeCategory: wrap(store.removeCategory.bind(store)),
        addSuggestion: wrap(store.addSuggestion.bind(store)),
        updateSuggestion: wrap(store.updateSuggestion.bind(store)),
        removeSuggestion: wrap(store.removeSuggestion.bind(store)),
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

/** Selective hooks — use these to reduce re-renders */
export function useTasks() { return useStore().tasks }
export function useCategories() { return useStore().categories }
export function usePersons() { return useStore().persons }
export function useDeviceOwner() { return useStore().deviceOwner }

export function useTaskActions() {
  const { addTask, updateTask, deleteTask, completeTask, uncompleteTask } = useStore()
  return { addTask, updateTask, deleteTask, completeTask, uncompleteTask }
}

export function useSuggestionActions() {
  const { addSuggestion, updateSuggestion, removeSuggestion } = useStore()
  return { addSuggestion, updateSuggestion, removeSuggestion }
}
