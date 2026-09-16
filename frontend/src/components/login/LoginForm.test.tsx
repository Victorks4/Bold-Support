import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from '@/components/login/LoginForm'

const loginMock = vi.fn()

vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: () => ({
    login: loginMock,
    logout: vi.fn(),
    agente: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}))

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>,
  )
}

describe('LoginForm', () => {
  it('mostra erros de validação quando campos estão vazios', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(screen.getByText('Preencha e-mail e senha para entrar.')).toBeInTheDocument()
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('mostra erro de email inválido', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText(/^email$/i), 'email-invalido')
    await user.type(screen.getByLabelText(/^senha$/i), 'Bold@2026')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument()
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('chama login com credenciais válidas', async () => {
    loginMock.mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText(/^email$/i), 'agente@bold.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'Bold@2026')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(loginMock).toHaveBeenCalledWith('agente@bold.com', 'Bold@2026', false)
  })
})
