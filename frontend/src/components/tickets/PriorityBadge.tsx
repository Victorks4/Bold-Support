import type { TicketPrioridade } from '@/lib/types/ticket'
import { PRIORIDADE_LABELS } from '@/lib/types/ticket'

const colorMap: Record<TicketPrioridade, string> = {
  alta: 'text-red-600 font-semibold',
  media: 'text-gray-600',
  baixa: 'text-gray-400',
}

export function PriorityBadge({ prioridade }: { prioridade: TicketPrioridade }) {
  return <span className={`text-sm ${colorMap[prioridade]}`}>{PRIORIDADE_LABELS[prioridade]}</span>
}
