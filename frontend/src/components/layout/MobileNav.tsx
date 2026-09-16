import { NavLink, useNavigate } from 'react-router-dom'
import { Activity, LayoutDashboard, ListOrdered, LogOut, Ticket, Users } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useAppData } from '@/lib/store/AppDataContext'
import { countActiveTickets } from '@/lib/utils/dashboard-metrics'

const items = [
  { to: '/dashboard', label: 'Início', icon: LayoutDashboard },
  { to: '/fila', label: 'Fila', icon: ListOrdered, badge: true },
  { to: '/chamados', label: 'Chamados', icon: Ticket },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/eventos', label: 'Eventos', icon: Activity },
]

export function MobileNav() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { tickets } = useAppData()
  const activeCount = countActiveTickets(tickets)

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-gray-100 bg-white px-1 pb-[env(safe-area-inset-bottom)] lg:hidden dark:border-gray-800 dark:bg-[#161B26]"
      aria-label="Navegação principal"
    >
      {items.map(({ to, label, icon: Icon, badge }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
              isActive ? 'text-[#006AFE]' : 'text-gray-500 dark:text-gray-400'
            }`
          }
        >
          <span className="relative">
            <Icon className="h-5 w-5" />
            {badge && activeCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#006AFE] px-1 text-[9px] font-bold text-white">
                {activeCount > 9 ? '9+' : activeCount}
              </span>
            )}
          </span>
          {label}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={handleLogout}
        className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium text-gray-500 dark:text-gray-400"
        aria-label="Sair"
      >
        <LogOut className="h-5 w-5" />
        Sair
      </button>
    </nav>
  )
}
