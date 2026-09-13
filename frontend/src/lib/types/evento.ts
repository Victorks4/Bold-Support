/** Eventos disparados pelo webhook externo n8n (Etapa 2) */
export type WebhookEventoTipo = 'status_alterado' | 'interacao_adicionada' | 'ticket_excluido'

export interface WebhookEvento {
  id: string
  tipo: WebhookEventoTipo
  protocolo: string
  ticket_id: string
  payload: Record<string, unknown>
  criado_em: string
  status: 'entregue' | 'simulado'
}

export const EVENTO_LABELS: Record<WebhookEventoTipo, string> = {
  status_alterado: 'Status alterado',
  interacao_adicionada: 'Interação registrada',
  ticket_excluido: 'Chamado excluído',
}
