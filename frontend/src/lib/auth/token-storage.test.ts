import { describe, expect, it } from 'vitest'
import {
  clearSession,
  getAccessToken,
  getStoredAgente,
  persistSession,
} from '@/lib/auth/token-storage'
import type { Agente } from '@/lib/types/agente'

const agente: Agente = {
  id: 'agente-1',
  nome: 'Agente Bold',
  email: 'agente@bold.com',
}

describe('token-storage', () => {
  it('persiste sessão em sessionStorage quando lembrar é false', () => {
    persistSession('token-abc', agente, false)

    expect(sessionStorage.getItem('bold_support_token')).toBe('token-abc')
    expect(getAccessToken()).toBe('token-abc')
    expect(getStoredAgente()).toEqual(agente)
  })

  it('persiste sessão em localStorage quando lembrar é true', () => {
    persistSession('token-xyz', agente, true)

    expect(localStorage.getItem('bold_support_token')).toBe('token-xyz')
    expect(getAccessToken()).toBe('token-xyz')
  })

  it('limpa sessão de ambos storages', () => {
    persistSession('token-abc', agente, true)
    persistSession('token-xyz', agente, false)

    clearSession()

    expect(getAccessToken()).toBeNull()
    expect(getStoredAgente()).toBeNull()
  })

  it('retorna null para agente com JSON inválido', () => {
    sessionStorage.setItem('bold_support_agente', '{invalid')
    expect(getStoredAgente()).toBeNull()
  })
})
