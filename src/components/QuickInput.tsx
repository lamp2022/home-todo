import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { suggestCategory } from '../lib/categorize'

export function QuickInput() {
  const { addTask } = useStore()
  const [title, setTitle] = useState('')

  function handleSubmit() {
    const trimmed = title.trim()
    if (!trimmed) return
    const category = suggestCategory(trimmed) ?? 'Muu'
    addTask({ title: trimmed, category })
    setTitle('')
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Kirjoita tehtävä..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
