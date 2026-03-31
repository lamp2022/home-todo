import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AppState } from '../types'
import { createStore, type Storage } from './useStore'

type StoreApi = ReturnType<typeof createStore>

interface StoreContextValue extends AppState {
  addTask: StoreApi['addTask']
  updateTask: StoreApi['updateTask']
  deleteTask: StoreApi['deleteTask']
  completeTask: StoreApi['completeTask']
  addPerson: StoreApi['addPerson']
  removePerson: StoreApi['removePerson']
  setDeviceOwner: StoreApi['setDeviceOwner']
  addCategory: StoreApi['addCategory']
  removeCategory: StoreApi['removeCategory']
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
        addPerson: wrap(store.addPerson.bind(store)),
        removePerson: wrap(store.removePerson.bind(store)),
        setDeviceOwner: wrap(store.setDeviceOwner.bind(store)),
        addCategory: wrap(store.addCategory.bind(store)),
        removeCategory: wrap(store.removeCategory.bind(store)),
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
