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

export function getCategoryColor(category: string, allCategories: string[]): string {
  const index = allCategories.indexOf(category)
  return PALETTE[index >= 0 ? index % PALETTE.length : PALETTE.length - 1]
}
