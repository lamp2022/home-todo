/**
 * Unified category module: color assignment, auto-categorization, and category queries.
 * Replaces: lib/colors.ts, lib/categorize.ts
 */

const PALETTE = [
  '#7c3aed', // violet
  '#0891b2', // cyan
  '#d97706', // amber
  '#059669', // emerald
  '#e11d48', // rose
  '#2563eb', // blue
  '#c026d3', // fuchsia
  '#0d9488', // teal
]

const KEYWORDS: Record<string, string[]> = {
  Kodinhoito: ['nuohous', 'siivous', 'pesu', 'ikkuna', 'lattia', 'imurointi', 'pyykit', 'jääkaappi', 'suodatin', 'ilmanvaihto'],
  Piha: ['haravointi', 'nurmik', 'puutarha', 'lumi', 'kasvi', 'piha', 'ruoho', 'pensas', 'leikkaus', 'kompost'],
  Ajoneuvot: ['katsastus', 'huolto', 'rengas', 'öljy', 'auto', 'mopo', 'bensa', 'pesul'],
  Talous: ['vero', 'lasku', 'vakuutus', 'pankki', 'budjetti', 'maksu', 'laina'],
  Terveys: ['lääkäri', 'hammas', 'resepti', 'rokote', 'tarkastus', 'ajanvaraus'],
}

/** Hash-based color for unknown categories (deterministic) */
function hashColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

/**
 * Get a consistent color for a category.
 * Known categories use index-based assignment; unknown ones use hash.
 */
export function getCategoryColor(category: string, allCategories: string[]): string {
  const index = allCategories.indexOf(category)
  if (index >= 0) return PALETTE[index % PALETTE.length]
  return hashColor(category)
}

/**
 * Suggest a category based on task title keywords.
 * Returns null if no match found.
 */
export function suggestCategory(title: string): string | null {
  const lower = title.toLowerCase()
  for (const [category, words] of Object.entries(KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) return category
  }
  return null
}
