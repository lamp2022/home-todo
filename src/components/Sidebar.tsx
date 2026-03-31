import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/tasks', label: 'Tehtävät' },
  { to: '/done', label: 'Tehty' },
  { to: '/settings', label: 'Asetukset' },
]

export function Sidebar() {
  return (
    <nav className="hidden md:flex flex-col w-52 h-svh sticky top-0 bg-white/80 backdrop-blur-sm border-r border-gray-100 p-5 gap-1">
      <h1 className="text-xl font-bold mb-6 px-3 bg-gradient-to-r from-accent to-accent-mid bg-clip-text text-transparent">
        Kotiasiat
      </h1>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `px-3 py-2.5 rounded-xl text-sm transition-all ${
              isActive
                ? 'bg-accent-light text-accent font-semibold shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
