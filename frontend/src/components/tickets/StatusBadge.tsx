import { Badge } from '@/components/ui/badge'
import type { TicketStatus } from '@/lib/types/ticket'
import { STATUS_LABELS } from '@/lib/types/ticket'

const variantMap: Record<TicketStatus, 'success' | 'info' | 'muted' | 'warning'> = {
  aberto: 'success',
  em_atendimento: 'info',
  aguardando_cliente: 'muted',
  resolvido: 'success',
  cancelado: 'muted',
}

const dotColor: Record<TicketStatus, string> = {
  aberto: 'bg-emerald-500',
  em_atendimento: 'bg-[#006AFE]',
  aguardando_cliente: 'bg-gray-400',
  resolvido: 'bg-emerald-500',
  cancelado: 'bg-gray-400',
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge variant={variantMap[status]}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor[status]}`} />
      {STATUS_LABELS[status]}
    </Badge>
  )
}
