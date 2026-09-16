import { apiFetch, buildWebhookUrl, webhookPaths } from '@/lib/api/client'
import type { LoginResponse } from '@/lib/types/agente'

export async function loginAgente(email: string, senha: string): Promise<LoginResponse> {
  const url = buildWebhookUrl(webhookPaths.authLogin)
  return apiFetch<LoginResponse>(url, {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
    skipAuth: true,
  })
}
