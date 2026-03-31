import { Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import { TasksPage } from './pages/TasksPage'
import { DonePage } from './pages/DonePage'
import { SettingsPage } from './pages/SettingsPage'
import { BottomNav } from './components/BottomNav'
import { Sidebar } from './components/Sidebar'

export default function App() {
  return (
    <StoreProvider>
      <div className="flex min-h-svh">
        <Sidebar />
        <main className="flex-1 flex flex-col pb-16 md:pb-0">
          <div className="mx-auto w-full max-w-lg flex-1 flex flex-col">
            <Routes>
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/done" element={<DonePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/tasks" replace />} />
            </Routes>
          </div>
        </main>
        <BottomNav />
      </div>
    </StoreProvider>
  )
}
