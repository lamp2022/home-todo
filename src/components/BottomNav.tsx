import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/tasks', label: 'Tehtävät', icon: '📋' },
  { to: '/done', label: 'Tehty', icon: '✅' },
  { to: '/settings', label: 'Asetukset', icon: '⚙️' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 bg-white border-t border-gray-200 flex md:hidden z-10">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 text-xs ${
              isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
            }`
          }
        >
          <span className="text-lg">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
