import { NavLink, useNavigate } from 'react-router-dom'
import { Activity, Headphones, Kanban, LayoutDashboard, LogOut, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth/AuthContext'
import { useAppData } from '@/lib/store/AppDataContext'
import { countActiveTickets } from '@/lib/utils/dashboard-metrics'
import { getInitials } from '@/lib/utils/initials'
import { cn } from '@/lib/utils'
import { SidebarBrand } from './SidebarBrand'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/fila', label: 'Fila', icon: Kanban, badge: true },
  { to: '/chamados', label: 'Chamados', icon: Headphones },
  { to: '/clientes', label: 'Base de clientes', icon: Users },
  { to: '/eventos', label: 'Eventos', icon: Activity },
]

type SidebarProps = {
  collapsed?: boolean
}

function menuIconClass(isActive: boolean) {
  return cn(
    'rounded-lg p-1.5 transition-colors duration-200',
    isActive
      ? 'bg-[#006AFE] text-white shadow-sm shadow-[#006AFE]/25'
      : 'text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-800 dark:text-gray-400 dark:group-hover:bg-gray-800 dark:group-hover:text-gray-100',
  )
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const navigate = useNavigate()
  const { agente, logout } = useAuth()
  const { tickets } = useAppData()
  const activeCount = countActiveTickets(tickets)
  const nome = agente?.nome ?? 'Agente'
  const iniciais = getInitials(nome)

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <aside
      className={cn(
        'app-sidebar sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-gray-100 bg-white transition-[width] duration-200 lg:flex dark:border-gray-800 dark:bg-[#121820]',
        collapsed ? 'w-[72px]' : 'w-[240px]',
      )}
    >
      <div className={cn('shrink-0 border-b border-gray-100 px-3 py-3 dark:border-gray-800', collapsed && 'px-2')}>
        <SidebarBrand collapsed={collapsed} />
      </div>

      <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
        {navItems.map(({ to, label, icon: Icon, badge }, index) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04 + index * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <NavLink
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-[#006AFE] dark:text-[#4D9AFF]'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
                  collapsed && 'justify-center px-1.5',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-lg bg-blue-50 dark:bg-[#006AFE]/15"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className={cn('relative z-[1]', menuIconClass(isActive))}>
                    <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                    {badge && activeCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#006AFE] px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#121820]">
                        {activeCount > 9 ? '9+' : activeCount}
                      </span>
                    )}
                  </span>
                  {!collapsed && <span className="relative z-[1] flex-1 truncate">{label}</span>}
                  {isActive && !collapsed && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative z-[1] h-1.5 w-1.5 shrink-0 rounded-full bg-[#00E676]"
                    />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div className="shrink-0 space-y-1.5 border-t border-gray-100 p-2 dark:border-gray-800">
        {!collapsed && (
          <a
            href="https://www.boldsolution.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-2 py-1 text-[11px] font-medium text-[#006AFE] hover:underline dark:text-[#4D9AFF]"
          >
            Suporte Bold →
          </a>
        )}

        <ThemeToggle
          variant={collapsed ? 'icon' : 'sidebar'}
          className={cn(collapsed ? 'mx-auto h-9 w-9' : 'h-9')}
        />

        <div
          className={cn(
            'flex items-center gap-2 rounded-lg bg-gray-50 p-1.5 dark:bg-[#1A2030]',
            collapsed && 'flex-col justify-center',
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#006AFE] text-[10px] font-bold text-white">
            {iniciais}
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#0E121D] dark:text-gray-100">{nome}</p>
              <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">Agente</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-white hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-400"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
