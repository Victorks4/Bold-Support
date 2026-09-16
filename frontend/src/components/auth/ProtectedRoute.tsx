import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/lib/auth/AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#F3F4F6] text-sm text-gray-500">
        Carregando sessão…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
