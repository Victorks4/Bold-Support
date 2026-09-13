import { Link } from 'react-router-dom'
import { PriorityBadge } from './PriorityBadge'
import { StatusBadge } from './StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import type { Ticket } from '@/lib/types/ticket'
import { relativeTime } from '@/lib/utils/time'

type TicketCardListProps = {
  tickets: Ticket[]
  getClienteNome: (id: string) => string
}

export function TicketCardList({ tickets, getClienteNome }: TicketCardListProps) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-[#161B26] dark:text-gray-400">
        Nenhum chamado encontrado.
      </div>
    )
  }

  return (
    <div className="space-y-3 md:hidden">
      {tickets.map((ticket) => (
        <Link key={ticket.id} to={`/chamados/${ticket.id}`}>
          <Card className="transition-colors hover:border-blue-100">
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-medium text-gray-400">{ticket.protocolo}</p>
                <span className="text-[10px] text-gray-400">{relativeTime(ticket.atualizado_em)}</span>
              </div>
              <p className="text-app-heading mt-1 text-sm font-semibold">{ticket.titulo}</p>
              <p className="mt-1 text-xs text-gray-500">{getClienteNome(ticket.cliente_id)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={ticket.status} />
                <PriorityBadge prioridade={ticket.prioridade} />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
