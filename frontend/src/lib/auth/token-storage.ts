import type { Agente } from '@/lib/types/agente'

const TOKEN_KEY = 'bold_support_token'
const AGENTE_KEY = 'bold_support_agente'

function readFromStorages(key: string): string | null {
  return sessionStorage.getItem(key) ?? localStorage.getItem(key)
}

export function getAccessToken(): string | null {
  return readFromStorages(TOKEN_KEY)
}

export function getStoredAgente(): Agente | null {
  const raw = readFromStorages(AGENTE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Agente
  } catch {
    return null
  }
}

export function persistSession(token: string, agente: Agente, remember: boolean): void {
  clearSession()
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
  storage.setItem(AGENTE_KEY, JSON.stringify(agente))
}

export function clearSession(): void {
  for (const storage of [sessionStorage, localStorage]) {
    storage.removeItem(TOKEN_KEY)
    storage.removeItem(AGENTE_KEY)
  }
}
