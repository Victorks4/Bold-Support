/**
 * Stub do cliente HTTP para integração futura com workflows n8n.
 * URLs: {VITE_N8N_WEBHOOK_BASE_URL}/{webhookId}/{path}
 * Ver docs/api.md para webhookIds e contratos.
 */

const baseUrl = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL ?? 'https://dev.boldsolution.com.br/webhook'

export const webhookPaths = {
  postClientes: 'clientes',
  getCliente: (id: string) => `clientes/${id}`,
  deleteCliente: (id: string) => `bold-delete-cliente/clientes/remover/${id}`,
  postTickets: 'tickets',
  getTickets: 'tickets',
  getTicket: (id: string) => `tickets/${id}`,
  deleteTicket: (id: string) => `bold-delete-ticket/tickets/remover/${id}`,
  patchTicketStatus: (id: string) => `bold-patch-ticket-status/tickets/atualizar-status/${id}`,
  postInteracao: (id: string) => `bold-post-ticket-interacao/tickets/adicionar-interacao/${id}`,
} as const

export function buildWebhookUrl(webhookId: string, path: string): string {
  return `${baseUrl}/${webhookId}/${path}`
}

/** Placeholder — ativar na Etapa 3+ quando conectar API real */
export async function apiFetch<T>(_url: string, _init?: RequestInit): Promise<T> {
  throw new Error('API n8n não conectada — usando dados mock no frontend')
}
