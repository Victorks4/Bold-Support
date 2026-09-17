import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PageTransition } from '@/components/motion/PageTransition'
import { useAppData } from '@/lib/store/AppDataContext'
import { MobileNav } from './MobileNav'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { isLoading, isRefreshing, error, actionError, clearActionError, refresh } = useAppData()

  return (
    <div className="app-shell flex min-h-dvh bg-[#F3F4F6] dark:bg-[#0E121D]">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          showSidebarToggle
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        />
        {error && (
          <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 sm:mx-6 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void refresh()}
              className="shrink-0 font-semibold underline"
            >
              Tentar novamente
            </button>
          </div>
        )}
        {actionError && (
          <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 sm:mx-6 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <span>{actionError}</span>
            <button
              type="button"
              onClick={clearActionError}
              className="shrink-0 font-semibold underline"
            >
              Fechar
            </button>
          </div>
        )}
        {isLoading && !error && (
          <p className="text-app-muted px-4 pt-3 text-sm sm:px-6">Carregando dados...</p>
        )}
        {isRefreshing && !isLoading && !error && (
          <p className="text-app-muted px-4 pt-2 text-xs sm:px-6">Atualizando dados...</p>
        )}
        <main className="flex-1 overflow-auto p-4 pb-[72px] text-[#0E121D] sm:p-6 lg:pb-6 dark:text-gray-100">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
