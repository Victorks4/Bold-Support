import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LoginLeftPanel } from './LoginLeftPanel'
import { LoginForm } from './LoginForm'
import { useIsDesktopLoginPanel } from '@/hooks/useIsDesktopLoginPanel'
import { useAuth } from '@/lib/auth/AuthContext'

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const showLoginPanel = useIsDesktopLoginPanel()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <main className="login-page flex min-h-dvh w-full max-w-full flex-col lg:min-h-dvh lg:grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
      {showLoginPanel ? (
        <motion.div
          data-login-panel
          className="login-page-panel relative w-full shrink-0 overflow-hidden lg:min-h-dvh lg:min-w-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <LoginLeftPanel />
        </motion.div>
      ) : null}

      <div
        data-login-form
        className="login-page-form flex min-h-dvh w-full flex-col items-center justify-center bg-[#F3F4F6] p-6 sm:p-8 lg:min-h-dvh lg:min-w-0 lg:px-6 xl:px-10"
      >
        <motion.div
          className="w-full max-w-[400px]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 14 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <LoginForm />
        </motion.div>
      </div>
    </main>
  )
}
