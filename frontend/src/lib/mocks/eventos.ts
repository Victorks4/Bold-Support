import type { WebhookEvento } from '@/lib/types/evento'

export const initialEventos: WebhookEvento[] = [
  {
    id: 'ev-1',
    tipo: 'status_alterado',
    protocolo: 'TKT-20260913-B7K1',
    ticket_id: 't2b3c4d5-e6f7-8901-bcde-f12345678901',
    payload: {
      protocolo: 'TKT-20260913-B7K1',
      evento: 'status_alterado',
      status: 'em_atendimento',
    },
    criado_em: new Date(Date.now() - 15 * 60000).toISOString(),
    status: 'entregue',
    origem: 'api',
  },
  {
    id: 'ev-2',
    tipo: 'interacao_adicionada',
    protocolo: 'TKT-20260912-C2M9',
    ticket_id: 't3c4d5e6-f7a8-9012-cdef-123456789012',
    payload: {
      protocolo: 'TKT-20260912-C2M9',
      evento: 'interacao_adicionada',
      status: 'aguardando_cliente',
    },
    criado_em: new Date(Date.now() - 45 * 60000).toISOString(),
    status: 'entregue',
    origem: 'api',
  },
]
