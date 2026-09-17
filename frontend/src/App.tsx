import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/components/login/LoginPage'
import { AppDataProvider } from '@/lib/store/AppDataContext'

const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const QueuePage = lazy(() => import('@/pages/QueuePage').then((m) => ({ default: m.QueuePage })))
const TicketsPage = lazy(() => import('@/pages/TicketsPage').then((m) => ({ default: m.TicketsPage })))
const TicketDetailPage = lazy(() =>
  import('@/pages/TicketDetailPage').then((m) => ({ default: m.TicketDetailPage })),
)
const ClientsPage = lazy(() => import('@/pages/ClientsPage').then((m) => ({ default: m.ClientsPage })))
const EventsPage = lazy(() => import('@/pages/EventsPage').then((m) => ({ default: m.EventsPage })))

function PageLoader() {
  return <p className="text-app-muted py-12 text-center text-sm">Carregando página...</p>
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route
                element={
                  <AppDataProvider>
                    <AppShell />
                  </AppDataProvider>
                }
              >
                <Route
                  path="/dashboard"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <DashboardPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/fila"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <QueuePage />
                    </Suspense>
                  }
                />
                <Route
                  path="/chamados"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <TicketsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/chamados/:id"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <TicketDetailPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/clientes"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ClientsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/eventos"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <EventsPage />
                    </Suspense>
                  }
                />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
