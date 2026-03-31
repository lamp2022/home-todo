import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { suggestCategory } from '../lib/categorize'
import { parseInput } from '../lib/parseInput'

export function QuickInput() {
  const { addTask } = useStore()
  const [title, setTitle] = useState('')

  function handleChange(value: string) {
    if (value.length === 1 && title.length === 0) {
      setTitle(value.charAt(0).toUpperCase() + value.slice(1))
    } else {
      setTitle(value)
    }
  }

  function handleSubmit() {
    const trimmed = title.trim()
    if (!trimmed) return
    const parsed = parseInput(trimmed)
    const category = suggestCategory(trimmed) ?? 'Muu'
    addTask({
      title: parsed.title,
      category,
      deadline: parsed.deadline,
    })
    if (parsed.recurring || parsed.recurrence) {
      // recurrence is stored but not yet editable in UI
    }
    setTitle('')
  }

  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 p-4">
      <input
        type="text"
        value={title}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Lisää tehtävä..."
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 placeholder:text-gray-400 transition-all"
      />
      <p className="text-[10px] text-gray-400 mt-1.5 px-1">
        Tunnistaa: tänään, huomenna, ensi viikolla/kuussa, keväällä/kesällä/syksyllä/talvella, vuosittain, kuukausittain
      </p>
    </div>
  )
}
