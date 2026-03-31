import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { DEFAULT_CATEGORIES } from '../types'

export function SettingsPage() {
  const { persons, categories, deviceOwner, addPerson, removePerson, setDeviceOwner, addCategory, removeCategory } = useStore()
  const [newPerson, setNewPerson] = useState('')
  const [newCategory, setNewCategory] = useState('')

  function handleAddPerson() {
    const name = newPerson.trim()
    if (!name) return
    addPerson(name)
    setNewPerson('')
  }

  function handleAddCategory() {
    const name = newCategory.trim()
    if (!name) return
    addCategory(name)
    setNewCategory('')
  }

  const isDefault = (cat: string) => (DEFAULT_CATEGORIES as readonly string[]).includes(cat)

  return (
    <div className="flex-1 p-4 flex flex-col gap-8">
      <section>
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Henkilöt</h2>
        <div className="flex flex-col gap-1">
          {persons.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-xl">
              <span className="text-sm text-gray-700">{p.name}</span>
              {p.id !== deviceOwner && (
                <button onClick={() => removePerson(p.id)} className="text-xs text-rose-500 font-medium hover:text-rose-600">Poista</button>
              )}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={newPerson}
          onChange={(e) => setNewPerson(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddPerson()}
          placeholder="Uusi henkilö..."
          className="mt-2 w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
        />
      </section>

      <section>
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Kategoriat</h2>
        <div className="flex flex-col gap-1">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center justify-between py-2 px-3 bg-white rounded-xl">
              <span className="text-sm text-gray-700">{cat}</span>
              {!isDefault(cat) && (
                <button onClick={() => removeCategory(cat)} className="text-xs text-rose-500 font-medium hover:text-rose-600">Poista</button>
              )}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          placeholder="Uusi kategoria..."
          className="mt-2 w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
        />
      </section>

      <section>
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Tämä laite</h2>
        <select
          value={deviceOwner ?? ''}
          onChange={(e) => setDeviceOwner(e.target.value || null)}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
        >
          <option value="">Ei valittu</option>
          {persons.map((p) => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
      </section>
    </div>
  )
}
