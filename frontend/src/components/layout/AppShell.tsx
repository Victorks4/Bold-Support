import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { PageTransition } from '@/components/motion/PageTransition'
import { MobileNav } from './MobileNav'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="app-shell flex min-h-dvh bg-[#F3F4F6] dark:bg-[#0E121D]">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          showSidebarToggle
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        />
        <main className="flex-1 overflow-auto p-4 pb-[72px] text-[#0E121D] sm:p-6 lg:pb-6 dark:text-gray-100">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
