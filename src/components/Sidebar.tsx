import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/tasks', label: 'Tehtävät', icon: '📋' },
  { to: '/done', label: 'Tehty', icon: '✅' },
  { to: '/settings', label: 'Asetukset', icon: '⚙️' },
]

export function Sidebar() {
  return (
    <nav className="hidden md:flex flex-col w-48 h-svh sticky top-0 bg-gray-50 border-r border-gray-200 p-4 gap-1">
      <h1 className="text-lg font-semibold mb-4 px-3">Kotiasiat</h1>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              isActive
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
