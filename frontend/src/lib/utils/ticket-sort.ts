import type { Ticket, TicketPrioridade } from '@/lib/types/ticket'

const PRIORIDADE_ORDEM: Record<TicketPrioridade, number> = {
  alta: 0,
  media: 1,
  baixa: 2,
}

export function sortByPrioridade(tickets: Ticket[]): Ticket[] {
  return [...tickets].sort((a, b) => {
    const byPriority = PRIORIDADE_ORDEM[a.prioridade] - PRIORIDADE_ORDEM[b.prioridade]
    if (byPriority !== 0) return byPriority
    return new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime()
  })
}
