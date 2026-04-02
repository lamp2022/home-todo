import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { DEFAULT_CATEGORIES } from '../types'
import { DEFAULT_SUGGESTIONS } from '../components/TaskSuggestions'

export function SettingsPage() {
  const {
    persons, categories, deviceOwner, suggestions,
    addPerson, removePerson, setDeviceOwner, addCategory, removeCategory,
    addSuggestion, updateSuggestion, removeSuggestion,
  } = useStore()
  const [newPerson, setNewPerson] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newSuggTitle, setNewSuggTitle] = useState('')
  const [newSuggHint, setNewSuggHint] = useState('')
  const [newSuggCat, setNewSuggCat] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editHint, setEditHint] = useState('')

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

  function handleAddSuggestion() {
    const title = newSuggTitle.trim()
    if (!title) return
    addSuggestion({ title, hint: newSuggHint.trim(), category: newSuggCat || 'Muu' })
    setNewSuggTitle('')
    setNewSuggHint('')
    setNewSuggCat('')
  }

  function startEdit(s: { id: string; title: string; hint: string }) {
    setEditingId(s.id)
    setEditTitle(s.title)
    setEditHint(s.hint)
  }

  function saveEdit(id: string) {
    updateSuggestion(id, { title: editTitle.trim(), hint: editHint.trim() })
    setEditingId(null)
  }

  const isDefault = (cat: string) => (DEFAULT_CATEGORIES as readonly string[]).includes(cat)

  // Merge default + custom suggestions
  const customSuggs = suggestions ?? []
  const allSuggs = [
    ...DEFAULT_SUGGESTIONS.map((s) => ({ ...s, id: `default-${s.title}`, isDefault: true })),
    ...customSuggs.map((s) => ({ ...s, isDefault: false })),
  ]

  return (
    <div className="flex-1 p-4 flex flex-col gap-8">
      <section>
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Henkilöt</h2>
        <div className="flex flex-col gap-1">
          {persons.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-xl">
              <span className="text-sm text-gray-700">{p.name}</span>
              {p.id !== deviceOwner && (
                <button onClick={() => removePerson(p.id)} className="text-xs text-rose-500 font-medium p-2 -mr-2 hover:text-rose-600 active:text-rose-700">Poista</button>
              )}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={newPerson}
          onChange={(e) => setNewPerson(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddPerson()}
          enterKeyHint="done"
          autoComplete="off"
          placeholder="Uusi henkilö..."
          className="mt-2 w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all"
        />
      </section>

      <section>
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Kategoriat</h2>
        <div className="flex flex-col gap-1">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center justify-between py-2 px-3 bg-white rounded-xl">
              <span className="text-sm text-gray-700">{cat}</span>
              {!isDefault(cat) && (
                <button onClick={() => removeCategory(cat)} className="text-xs text-rose-500 font-medium p-2 -mr-2 hover:text-rose-600 active:text-rose-700">Poista</button>
              )}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          enterKeyHint="done"
          autoComplete="off"
          placeholder="Uusi kategoria..."
          className="mt-2 w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all"
        />
      </section>

      <section>
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Ehdotukset</h2>
        <div className="flex flex-col gap-1">
          {allSuggs.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-xl gap-2">
              {editingId === s.id ? (
                <>
                  <div className="flex-1 flex gap-1">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      enterKeyHint="done"
                      autoComplete="off"
                      className="flex-1 text-base border border-gray-200 rounded-lg px-2 py-2"
                    />
                    <input
                      type="text"
                      value={editHint}
                      onChange={(e) => setEditHint(e.target.value)}
                      placeholder="vinkki"
                      enterKeyHint="done"
                      autoComplete="off"
                      className="w-24 text-base border border-gray-200 rounded-lg px-2 py-2"
                    />
                  </div>
                  <button onClick={() => saveEdit(s.id)} className="text-xs text-teal-600 font-medium">OK</button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-700 truncate block">{s.title}</span>
                    {s.hint && <span className="text-xs text-gray-400">{s.hint}</span>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!s.isDefault && (
                      <>
                        <button onClick={() => startEdit(s)} className="text-xs text-gray-500 font-medium p-2 hover:text-gray-700 active:text-gray-900">Muokkaa</button>
                        <button onClick={() => removeSuggestion(s.id)} className="text-xs text-rose-500 font-medium p-2 -mr-2 hover:text-rose-600 active:text-rose-700">Poista</button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          <input
            type="text"
            value={newSuggTitle}
            onChange={(e) => setNewSuggTitle(e.target.value)}
            enterKeyHint="done"
            autoComplete="off"
            placeholder="Ehdotuksen nimi..."
            className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all"
          />
          <input
            type="text"
            value={newSuggHint}
            onChange={(e) => setNewSuggHint(e.target.value)}
            enterKeyHint="done"
            autoComplete="off"
            placeholder="vinkki"
            className="w-24 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all"
          />
          <select
            value={newSuggCat}
            onChange={(e) => setNewSuggCat(e.target.value)}
            className="w-28 px-2 py-2.5 bg-white border border-gray-200 rounded-xl text-base"
          >
            <option value="">Kategoria</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={handleAddSuggestion}
            className="px-3 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 active:bg-teal-700"
          >
            +
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Tämä laite</h2>
        <select
          value={deviceOwner ?? ''}
          onChange={(e) => setDeviceOwner(e.target.value || null)}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all"
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
