import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { NotificationDropdown } from './NotificationDropdown'

type TopBarProps = {
  onToggleSidebar?: () => void
  showSidebarToggle?: boolean
}

export function TopBar({ onToggleSidebar, showSidebarToggle }: TopBarProps) {
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
            BA
          </span>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight text-[#0E121D] dark:text-gray-100">Bruno Alves</p>
            <p className="flex items-center justify-end gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E676]" />
              Online
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
