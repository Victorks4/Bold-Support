/** Payload enviado pelo n8n para webhook.site (Etapa 2) */
export type WebhookExternoPayload = {
  protocolo: string
  evento: WebhookEventoTipo
  status: string
}

export type WebhookEventoTipo = 'status_alterado' | 'interacao_adicionada' | 'ticket_excluido'

export interface WebhookEvento {
  id: string
  tipo: WebhookEventoTipo
  protocolo: string
  ticket_id: string
  payload: WebhookExternoPayload
  criado_em: string
  status: 'entregue' | 'recebido'
  origem: 'api' | 'webhook.site'
}

export const EVENTO_LABELS: Record<WebhookEventoTipo, string> = {
  status_alterado: 'Status alterado',
  interacao_adicionada: 'Interação registrada',
  ticket_excluido: 'Chamado excluído',
}
