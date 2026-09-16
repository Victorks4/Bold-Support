import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

const authState = {
  isAuthenticated: false,
  isLoading: false,
}

vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    agente: authState.isAuthenticated
      ? { id: '1', nome: 'Agente', email: 'agente@bold.com' }
      : null,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))

function renderProtectedRoute(initialPath = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<div>Login</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    authState.isAuthenticated = false
    authState.isLoading = false
  })

  it('mostra loading enquanto sessão carrega', () => {
    authState.isLoading = true
    renderProtectedRoute()
    expect(screen.getByText(/carregando sessão/i)).toBeInTheDocument()
  })

  it('redireciona para login quando não autenticado', () => {
    renderProtectedRoute()
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('renderiza rota protegida quando autenticado', () => {
    authState.isAuthenticated = true
    renderProtectedRoute()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
