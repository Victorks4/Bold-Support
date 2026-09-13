import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PriorityBadge } from '@/components/tickets/PriorityBadge'
import { StatusBadge } from '@/components/tickets/StatusBadge'
import type { Ticket } from '@/lib/types/ticket'
import { relativeTime } from '@/lib/utils/time'

type RecentTicketCardProps = {
  ticket: Ticket
  clienteNome: string
}

export function RecentTicketCard({ ticket, clienteNome }: RecentTicketCardProps) {
  return (
    <Link to={`/chamados/${ticket.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="pt-5">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-gray-400">{ticket.protocolo}</span>
            <StatusBadge status={ticket.status} />
          </div>
          <p className="text-app-heading mt-2 text-sm font-bold line-clamp-2">{ticket.titulo}</p>
          <div className="mt-3 flex items-center justify-between">
            <PriorityBadge prioridade={ticket.prioridade} />
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              {relativeTime(ticket.criado_em)}
            </span>
          </div>
          <p className="text-app-muted mt-2 text-xs">{clienteNome}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
