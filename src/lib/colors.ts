const PALETTE = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#6b7280', // gray
  '#ec4899', // pink
  '#14b8a6', // teal
]

export function getCategoryColor(category: string, allCategories: string[]): string {
  const index = allCategories.indexOf(category)
  return PALETTE[index >= 0 ? index % PALETTE.length : PALETTE.length - 1]
}
