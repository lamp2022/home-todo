const CHIP_SELECTED = 'bg-teal-100 text-teal-800 ring-1 ring-teal-300 font-semibold'
const CHIP_DEFAULT = 'bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-teal-700'

const INTERVALS = [
  ['weekly', 'Viikoittain'],
  ['monthly', 'Kuukausittain'],
  ['yearly', 'Vuosittain'],
] as const

interface Props {
  recurring: boolean
  interval: string | null | undefined
  onChange: (interval: 'weekly' | 'monthly' | 'yearly' | null) => void
}

export function RecurrencePicker({ recurring, interval, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Toistuu</span>
      <div className="flex gap-1.5">
        {INTERVALS.map(([int, label]) => {
          const isActive = recurring && interval === int
          return (
            <button
              key={int}
              type="button"
              onClick={() => onChange(isActive ? null : int)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive ? CHIP_SELECTED : CHIP_DEFAULT
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
