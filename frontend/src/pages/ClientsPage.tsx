import { PageHeader } from '@/components/layout/PageHeader'
import { ClientRegisterCard } from '@/components/clients/ClientRegisterCard'
import { TicketCreateCard } from '@/components/clients/TicketCreateCard'
import { getInitials } from '@/lib/mocks/clients'
import { useAppData } from '@/lib/store/AppDataContext'

export function ClientsPage() {
  const { clientes, addCliente, addTicket, countTicketsByCliente } = useAppData()

  return (
    <div>
      <PageHeader
        eyebrow="Relacionamento"
        title="Base de clientes"
      />
      <p className="text-app-muted mb-6 text-sm">
        Cadastre o cliente e abra o chamado em nome dele. O atendimento é conduzido pelo agente no console.
      </p>

      <div className="relative grid gap-6 lg:grid-cols-2">
        <ClientRegisterCard
          onAdd={addCliente}
          recentClientes={clientes}
          countTickets={countTicketsByCliente}
          getInitials={getInitials}
        />

        <div className="hidden lg:flex absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 items-center">
          <div className="h-px w-8 bg-[#00E676]" />
          <div className="h-3 w-3 rounded-full border-2 border-[#00E676] bg-white" />
          <div className="h-px w-8 bg-[#00E676]" />
        </div>

        <TicketCreateCard clientes={clientes} onCreate={addTicket} />
      </div>
    </div>
  )
}
