import { LogOut, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/AuthContext'
import { NotificationDropdown } from './NotificationDropdown'

type TopBarProps = {
  onToggleSidebar?: () => void
  showSidebarToggle?: boolean
}

function initialsFromName(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function TopBar({ onToggleSidebar, showSidebarToggle }: TopBarProps) {
  const navigate = useNavigate()
  const { agente, logout } = useAuth()
  const nome = agente?.nome ?? 'Agente'
  const iniciais = initialsFromName(nome)

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 sm:h-16 sm:px-6 dark:border-gray-800 dark:bg-[#161B26]">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {showSidebarToggle && onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden rounded-lg p-2 text-gray-500 hover:bg-gray-50 lg:inline-flex dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Alternar menu lateral"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="relative hidden min-w-0 flex-1 sm:block sm:max-w-xl">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar chamados, clientes..."
            className="h-10 w-full rounded-xl bg-gray-50 pl-10 text-sm shadow-none dark:bg-[#1A2030]"
          />
        </div>
        <img
          src="/images/logobold.png"
          alt="Bold Support"
          className="h-7 w-auto object-contain lg:hidden"
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <NotificationDropdown />
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#006AFE] text-xs font-bold text-white">
            {iniciais}
          </span>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight text-[#0E121D] dark:text-gray-100">
              {nome}
            </p>
            <p className="flex items-center justify-end gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E676]" />
              Online
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#006AFE] dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}
