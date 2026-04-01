export interface Task {
  id: string
  title: string
  category: string
  deadline: {
    type: 'date' | 'week' | 'month' | 'season' | 'year' | null
    value: string | null
  }
  assignee: string | null
  recurring: boolean
  recurrence: {
    interval: 'weekly' | 'monthly' | 'yearly' | 'seasonal'
    anchor: string
  } | null
  completedAt: string | null
  completedBy: string | null
  createdAt: string
}

export interface Person {
  id: string
  name: string
}

export interface Suggestion {
  id: string
  title: string
  hint: string
  category: string
}

export interface AppState {
  tasks: Task[]
  persons: Person[]
  categories: string[]
  deviceOwner: string | null
  suggestions?: Suggestion[]
}

export const DEFAULT_CATEGORIES = [
  'Kodinhoito',
  'Piha',
  'Ajoneuvot',
  'Talous',
  'Terveys',
  'Muu',
] as const
