import { useStore } from '../store/StoreContext'
import { suggestCategory } from '../lib/CategoryService'
import { parseDeadline as parseInput } from '../lib/Deadline'
import { getCategoryColor } from '../lib/CategoryService'

export const DEFAULT_SUGGESTIONS: { title: string; hint: string; category: string }[] = [
  // Kodinhoito
  { title: 'Ikkunoiden pesu', hint: 'keväällä', category: 'Kodinhoito' },
  { title: 'Ilmanvaihtosuodattimen vaihto', hint: 'vuosittain', category: 'Kodinhoito' },
  { title: 'Jääkaapin puhdistus', hint: '', category: 'Kodinhoito' },
  { title: 'Lattiakaivon puhdistus', hint: '', category: 'Kodinhoito' },
  { title: 'Liesituulettimen rasvasuodatin', hint: '', category: 'Kodinhoito' },
  { title: 'Nuohous', hint: 'vuosittain', category: 'Kodinhoito' },
  { title: 'Palovaroittimen testaus', hint: 'kuukausittain', category: 'Kodinhoito' },
  { title: 'Pesukoneen puhdistus', hint: '', category: 'Kodinhoito' },
  { title: 'Saunan pesu', hint: 'kuukausittain', category: 'Kodinhoito' },
  { title: 'Sähkökeskuksen tarkistus', hint: 'vuosittain', category: 'Kodinhoito' },
  { title: 'Vesimittarin lukema', hint: 'kuukausittain', category: 'Kodinhoito' },
  // Piha
  { title: 'Haravointi', hint: 'syksyllä', category: 'Piha' },
  { title: 'Kukkapenkkien hoito', hint: 'kesällä', category: 'Piha' },
  { title: 'Lumityöt', hint: 'talvella', category: 'Piha' },
  { title: 'Nurmikon leikkuu', hint: 'kesällä', category: 'Piha' },
  { title: 'Pensaiden leikkaus', hint: 'keväällä', category: 'Piha' },
  { title: 'Puutarhakalusteiden huolto', hint: 'keväällä', category: 'Piha' },
  { title: 'Rännien puhdistus', hint: 'syksyllä', category: 'Piha' },
  { title: 'Terassin pesu', hint: 'keväällä', category: 'Piha' },
  // Ajoneuvot
  { title: 'Auton katsastus', hint: 'vuosittain', category: 'Ajoneuvot' },
  { title: 'Auton pesu', hint: '', category: 'Ajoneuvot' },
  { title: 'Pesuneste täyttö', hint: '', category: 'Ajoneuvot' },
  { title: 'Renkaiden vaihto', hint: 'keväällä', category: 'Ajoneuvot' },
  { title: 'Öljynvaihto', hint: 'vuosittain', category: 'Ajoneuvot' },
  // Talous
  { title: 'Laskujen maksu', hint: 'kuukausittain', category: 'Talous' },
  { title: 'Sähkösopimuksen tarkistus', hint: 'vuosittain', category: 'Talous' },
  { title: 'Vakuutusten tarkistus', hint: 'vuosittain', category: 'Talous' },
  { title: 'Veroilmoitus', hint: 'keväällä', category: 'Talous' },
  // Terveys
  { title: 'Hammaslääkäri', hint: 'vuosittain', category: 'Terveys' },
  { title: 'Silmälääkäri', hint: 'vuosittain', category: 'Terveys' },
  { title: 'Terveystarkastus', hint: 'vuosittain', category: 'Terveys' },
]

export function TaskSuggestions() {
  const { addTask, tasks, categories, suggestions } = useStore()

  const existingTitles = new Set(tasks.map((t) => t.title.toLowerCase()))

  // Merge defaults + custom suggestions from store
  const customSuggs = (suggestions ?? []).map((s) => ({ title: s.title, hint: s.hint, category: s.category }))
  const allSuggs = [...DEFAULT_SUGGESTIONS, ...customSuggs]
  const available = allSuggs.filter((s) => !existingTitles.has(s.title.toLowerCase()))

  if (available.length === 0) return null

  function handleAdd(suggestion: { title: string; hint: string; category: string }) {
    const fullText = suggestion.hint ? `${suggestion.title} ${suggestion.hint}` : suggestion.title
    const parsed = parseInput(fullText)
    const category = suggestCategory(fullText) ?? suggestion.category
    addTask({
      title: parsed.title,
      category,
      deadline: parsed.deadline,
    })
  }

  // Group by category
  const grouped = categories
    .map((cat) => ({
      category: cat,
      suggestions: available.filter((s) => s.category === cat).sort((a, b) => a.title.localeCompare(b.title, 'fi')),
      color: getCategoryColor(cat, categories),
    }))
    .filter((g) => g.suggestions.length > 0)

  const uncategorized = available.filter((s) => !categories.includes(s.category)).sort((a, b) => a.title.localeCompare(b.title, 'fi'))
  if (uncategorized.length > 0) {
    grouped.push({
      category: 'Muu',
      suggestions: uncategorized,
      color: getCategoryColor('Muu', categories),
    })
  }

  return (
    <div className="flex flex-col gap-3 mt-4">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Ehdotuksia</h3>
      {grouped.map((g) => (
        <div key={g.category}>
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-1 px-0.5" style={{ color: g.color }}>
            {g.category}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {g.suggestions.map((s) => (
              <button
                key={s.title}
                type="button"
                onClick={() => handleAdd(s)}
                className="px-3 py-1.5 bg-white rounded-xl text-xs text-gray-600 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow border border-gray-100"
              >
                {s.title}
                {s.hint && <span className="text-gray-400 ml-1">· {s.hint}</span>}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
