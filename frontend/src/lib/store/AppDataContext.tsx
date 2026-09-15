import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as clientesApi from '@/lib/api/clientes'
import * as ticketsApi from '@/lib/api/tickets'
import { ApiError } from '@/lib/api/client'
import { logger } from '@/lib/logger'
import type { Cliente, ClienteInput } from '@/lib/types/cliente'
import type { WebhookEvento, WebhookEventoTipo } from '@/lib/types/evento'
import type { InteracaoTipo, Ticket, TicketInput, TicketStatus } from '@/lib/types/ticket'
import { sortByPrioridade } from '@/lib/utils/ticket-sort'

interface AppDataContextValue {
  clientes: Cliente[]
  tickets: Ticket[]
  eventos: WebhookEvento[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  addCliente: (input: ClienteInput) => Promise<Cliente>
  addTicket: (input: TicketInput) => Promise<Ticket>
  getClienteById: (id: string) => Cliente | undefined
  getTicketById: (id: string) => Ticket | undefined
  getClienteNome: (clienteId: string) => string
  countTicketsByCliente: (clienteId: string) => number
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>
  addInteracao: (ticketId: string, tipo: InteracaoTipo, mensagem: string) => Promise<void>
  removeTicket: (ticketId: string) => Promise<void>
  loadTicketDetail: (ticketId: string) => Promise<void>
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

function generateId(): string {
  return crypto.randomUUID()
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [eventos, setEventos] = useState<WebhookEvento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const pushWebhookEvent = useCallback(
    (tipo: WebhookEventoTipo, ticket: Ticket, payload: Record<string, unknown>) => {
      const evento: WebhookEvento = {
        id: generateId(),
        tipo,
        protocolo: ticket.protocolo,
        ticket_id: ticket.id,
        payload,
        criado_em: new Date().toISOString(),
        status: 'entregue',
      }
      setEventos((prev) => [evento, ...prev])
      logger.info('webhook_event', { tipo, protocolo: ticket.protocolo })
    },
    [],
  )

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [clientesData, ticketsData] = await Promise.all([
        clientesApi.listClientes(),
        ticketsApi.fetchAllTickets(),
      ])
      setClientes(clientesData)
      setTickets(ticketsData)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Não foi possível carregar os dados da API.'
      setError(message)
      logger.error('bootstrap_failed', { message })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const getClienteById = useCallback(
    (id: string) => clientes.find((c) => c.id === id),
    [clientes],
  )

  const getTicketById = useCallback(
    (id: string) => tickets.find((t) => t.id === id),
    [tickets],
  )

  const getClienteNome = useCallback(
    (clienteId: string) => getClienteById(clienteId)?.nome ?? 'Cliente desconhecido',
    [getClienteById],
  )

  const countTicketsByCliente = useCallback(
    (clienteId: string) => tickets.filter((t) => t.cliente_id === clienteId).length,
    [tickets],
  )

  const addCliente = useCallback(async (input: ClienteInput): Promise<Cliente> => {
    const cliente = await clientesApi.createCliente(input)
    setClientes((prev) => [cliente, ...prev])
    logger.info('cliente_created', { id: cliente.id, nome: cliente.nome })
    return cliente
  }, [])

  const addTicket = useCallback(async (input: TicketInput): Promise<Ticket> => {
    const ticket = await ticketsApi.createTicket(input)
    setTickets((prev) => sortByPrioridade([ticket, ...prev]))
    logger.info('ticket_created', { id: ticket.id, protocolo: ticket.protocolo })
    return ticket
  }, [])

  const loadTicketDetail = useCallback(async (ticketId: string) => {
    const ticket = await ticketsApi.getTicket(ticketId)
    setTickets((prev) => {
      const exists = prev.some((t) => t.id === ticketId)
      if (!exists) return sortByPrioridade([ticket, ...prev])
      return prev.map((t) => (t.id === ticketId ? ticket : t))
    })
  }, [])

  const updateTicketStatus = useCallback(
    async (ticketId: string, status: TicketStatus) => {
      const previous = tickets.find((t) => t.id === ticketId)
      const updated = await ticketsApi.patchTicketStatus(ticketId, status)
      setTickets((prev) =>
        sortByPrioridade(prev.map((t) => (t.id === ticketId ? { ...t, ...updated } : t))),
      )
      if (previous) {
        pushWebhookEvent('status_alterado', updated, {
          status_anterior: previous.status,
          status_novo: status,
        })
      }
      logger.info('status_changed', { ticketId, to: status })
    },
    [tickets, pushWebhookEvent],
  )

  const addInteracao = useCallback(
    async (ticketId: string, tipo: InteracaoTipo, mensagem: string) => {
      const ticket = tickets.find((t) => t.id === ticketId)
      await ticketsApi.addTicketInteracao(ticketId, tipo, mensagem)
      await loadTicketDetail(ticketId)
      if (ticket && (tipo === 'agente' || tipo === 'cliente')) {
        pushWebhookEvent('interacao_adicionada', ticket, {
          tipo,
          mensagem_preview: mensagem.slice(0, 80),
        })
      }
      logger.info('interacao_added', { ticketId, tipo })
    },
    [tickets, loadTicketDetail, pushWebhookEvent],
  )

  const removeTicket = useCallback(
    async (ticketId: string) => {
      const ticket = tickets.find((t) => t.id === ticketId)
      await ticketsApi.deleteTicket(ticketId)
      if (ticket) {
        pushWebhookEvent('ticket_excluido', ticket, { motivo: 'removido pelo agente' })
        logger.info('ticket_removed', { ticketId, protocolo: ticket.protocolo })
      }
      setTickets((prev) => prev.filter((t) => t.id !== ticketId))
    },
    [tickets, pushWebhookEvent],
  )

  const value = useMemo(
    () => ({
      clientes,
      tickets,
      eventos,
      isLoading,
      error,
      refresh,
      addCliente,
      addTicket,
      getClienteById,
      getTicketById,
      getClienteNome,
      countTicketsByCliente,
      updateTicketStatus,
      addInteracao,
      removeTicket,
      loadTicketDetail,
    }),
    [
      clientes,
      tickets,
      eventos,
      isLoading,
      error,
      refresh,
      addCliente,
      addTicket,
      getClienteById,
      getTicketById,
      getClienteNome,
      countTicketsByCliente,
      updateTicketStatus,
      addInteracao,
      removeTicket,
      loadTicketDetail,
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
