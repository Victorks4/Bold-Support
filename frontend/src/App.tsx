import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/components/login/LoginPage'
import { AppDataProvider } from '@/lib/store/AppDataContext'
import { ClientsPage } from '@/pages/ClientsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { EventsPage } from '@/pages/EventsPage'
import { QueuePage } from '@/pages/QueuePage'
import { TicketDetailPage } from '@/pages/TicketDetailPage'
import { TicketsPage } from '@/pages/TicketsPage'

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
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/fila" element={<QueuePage />} />
                <Route path="/chamados" element={<TicketsPage />} />
                <Route path="/chamados/:id" element={<TicketDetailPage />} />
                <Route path="/clientes" element={<ClientsPage />} />
                <Route path="/eventos" element={<EventsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
