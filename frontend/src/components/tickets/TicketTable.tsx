import { useNavigate } from 'react-router-dom'
import { PriorityBadge } from './PriorityBadge'
import { StatusBadge } from './StatusBadge'
import type { Ticket } from '@/lib/types/ticket'

type TicketTableProps = {
  tickets: Ticket[]
  getClienteNome: (id: string) => string
}

export function TicketTable({ tickets, getClienteNome }: TicketTableProps) {
  const navigate = useNavigate()

  if (tickets.length === 0) {
    return (
      <div className="hidden rounded-2xl border border-gray-100 bg-white p-12 text-center text-sm text-gray-500 md:block dark:border-gray-800 dark:bg-[#161B26] dark:text-gray-400">
        Nenhum chamado encontrado.
      </div>
    )
  }

  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm md:block dark:border-gray-800 dark:bg-[#161B26]">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            <th className="px-6 py-4">Protocolo</th>
            <th className="px-6 py-4">Chamado</th>
            <th className="px-6 py-4">Cliente</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Prioridade</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              onClick={() => navigate(`/chamados/${ticket.id}`)}
              className="cursor-pointer border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/80 dark:border-gray-800 dark:hover:bg-gray-800/40"
            >
              <td className="px-6 py-4 font-medium text-gray-400">{ticket.protocolo}</td>
              <td className="text-app-heading px-6 py-4 font-semibold">{ticket.titulo}</td>
              <td className="text-app-body px-6 py-4">{getClienteNome(ticket.cliente_id)}</td>
              <td className="px-6 py-4">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-6 py-4">
                <PriorityBadge prioridade={ticket.prioridade} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
