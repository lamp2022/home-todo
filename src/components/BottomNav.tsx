import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/tasks', label: 'Tehtävät' },
  { to: '/done', label: 'Tehty' },
  { to: '/settings', label: 'Asetukset' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 h-14 bg-white/90 backdrop-blur-sm border-t border-gray-100 flex md:hidden z-10">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex-1 flex items-center justify-center text-xs font-medium transition-colors ${
              isActive ? 'text-accent' : 'text-gray-400'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
