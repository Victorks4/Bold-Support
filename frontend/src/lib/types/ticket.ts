export type TicketStatus =
  | 'aberto'
  | 'em_atendimento'
  | 'aguardando_cliente'
  | 'resolvido'
  | 'cancelado'

export type TicketPrioridade = 'baixa' | 'media' | 'alta'

export type InteracaoTipo = 'sistema' | 'cliente' | 'agente'

export interface Interacao {
  id: string
  ticket_id: string
  tipo: InteracaoTipo
  mensagem: string
  criado_em: string
}

export interface Ticket {
  id: string
  protocolo: string
  cliente_id: string
  titulo: string
  descricao: string
  prioridade: TicketPrioridade
  status: TicketStatus
  criado_em: string
  atualizado_em: string
  interacoes?: Interacao[]
}

export interface TicketInput {
  cliente_id: string
  titulo: string
  descricao: string
  prioridade: TicketPrioridade
}

export const STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  aberto: ['em_atendimento', 'cancelado'],
  em_atendimento: ['aguardando_cliente', 'resolvido', 'cancelado'],
  aguardando_cliente: ['em_atendimento', 'resolvido', 'cancelado'],
  resolvido: [],
  cancelado: [],
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  aberto: 'Aberto',
  em_atendimento: 'Em atendimento',
  aguardando_cliente: 'Aguardando cliente',
  resolvido: 'Resolvido',
  cancelado: 'Cancelado',
}

export const PRIORIDADE_LABELS: Record<TicketPrioridade, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
}
