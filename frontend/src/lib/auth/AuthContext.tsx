import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { loginAgente } from '@/lib/api/auth'
import { ApiError, setUnauthorizedHandler } from '@/lib/api/client'
import {
  clearSession,
  getAccessToken,
  getStoredAgente,
  persistSession,
} from '@/lib/auth/token-storage'
import type { Agente } from '@/lib/types/agente'

type AuthContextValue = {
  agente: Agente | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, senha: string, lembrar: boolean) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [agente, setAgente] = useState<Agente | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    clearSession()
    setAgente(null)
  }, [])

  useEffect(() => {
    const token = getAccessToken()
    const stored = getStoredAgente()
    if (token && stored) {
      setAgente(stored)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout()
      if (window.location.pathname !== '/') {
        window.location.assign('/')
      }
    })
    return () => setUnauthorizedHandler(null)
  }, [logout])

  const login = useCallback(async (email: string, senha: string, lembrar: boolean) => {
    try {
      const response = await loginAgente(email, senha)
      persistSession(response.access_token, response.agente, lembrar)
      setAgente(response.agente)
    } catch (err) {
      if (err instanceof ApiError && err.codigo === 'CREDENCIAIS_INVALIDAS') {
        throw new Error('E-mail ou senha incorretos.')
      }
      if (err instanceof ApiError) {
        throw new Error(err.message || 'Não foi possível entrar.')
      }
      throw err
    }
  }, [])

  const value = useMemo(
    () => ({
      agente,
      isAuthenticated: Boolean(agente && getAccessToken()),
      isLoading,
      login,
      logout,
    }),
    [agente, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return ctx
}
