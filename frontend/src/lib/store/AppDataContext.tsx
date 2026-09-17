import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import * as clientesApi from '@/lib/api/clientes'
import * as ticketsApi from '@/lib/api/tickets'
import { fetchWebhookSiteEvents, normalizeWebhookSiteToken } from '@/lib/api/webhook-site'
import { ApiError } from '@/lib/api/client'
import { logger } from '@/lib/logger'
import type { Cliente, ClienteInput } from '@/lib/types/cliente'
import type { WebhookEvento, WebhookEventoTipo, WebhookExternoPayload } from '@/lib/types/evento'
import type { InteracaoTipo, Ticket, TicketInput, TicketStatus } from '@/lib/types/ticket'
import { sortByPrioridade } from '@/lib/utils/ticket-sort'

interface AppDataContextValue {
  clientes: Cliente[]
  tickets: Ticket[]
  eventos: WebhookEvento[]
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  actionError: string | null
  clearActionError: () => void
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
  loadTicketDetail: (ticketId: string) => Promise<Ticket | undefined>
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

const WEBHOOK_SITE_TOKEN = normalizeWebhookSiteToken(import.meta.env.VITE_WEBHOOK_SITE_TOKEN ?? '')
const WEBHOOK_POLL_MS = 60_000

function generateId(): string {
  return crypto.randomUUID()
}

function findTicketIdByProtocolo(tickets: Ticket[], protocolo: string): string {
  return tickets.find((t) => t.protocolo === protocolo)?.id ?? ''
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [eventos, setEventos] = useState<WebhookEvento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const knownWebhookIds = useRef(new Set<string>())
  const hasLoadedOnce = useRef(false)
  const clientesCountRef = useRef(0)
  const ticketsCountRef = useRef(0)
  clientesCountRef.current = clientes.length
  ticketsCountRef.current = tickets.length

  const clearActionError = useCallback(() => setActionError(null), [])

  const pushWebhookEvent = useCallback(
    (
      tipo: WebhookEventoTipo,
      ticket: Ticket,
      payload: WebhookExternoPayload,
      origem: 'api' | 'webhook.site' = 'api',
    ) => {
      const evento: WebhookEvento = {
        id: generateId(),
        tipo,
        protocolo: ticket.protocolo,
        ticket_id: ticket.id,
        payload,
        criado_em: new Date().toISOString(),
        status: origem === 'webhook.site' ? 'recebido' : 'entregue',
        origem,
      }
      setEventos((prev) => [evento, ...prev])
      logger.info('webhook_event', { tipo, protocolo: ticket.protocolo, origem })
    },
    [],
  )

  const mergeWebhookSiteEvents = useCallback(
    (remote: Awaited<ReturnType<typeof fetchWebhookSiteEvents>>) => {
      if (remote.length === 0) return

      const novos: WebhookEvento[] = []
      for (const row of remote) {
        if (knownWebhookIds.current.has(row.id)) continue

        const ticketId = findTicketIdByProtocolo(tickets, row.payload.protocolo)
        if (!ticketId && isLoading && tickets.length === 0) continue

        knownWebhookIds.current.add(row.id)
        novos.push({
          id: row.id,
          tipo: row.payload.evento,
          protocolo: row.payload.protocolo,
          ticket_id: ticketId,
          payload: row.payload,
          criado_em: row.criado_em,
          status: 'recebido',
          origem: 'webhook.site',
        })
      }

      if (novos.length > 0) {
        setEventos((prev) => {
          const ids = new Set(prev.map((e) => e.id))
          const filtered = novos.filter((e) => !ids.has(e.id))
          return [...filtered, ...prev]
        })
      }
    },
    [isLoading, tickets],
  )

  useEffect(() => {
    if (tickets.length === 0) return
    setEventos((prev) =>
      prev.map((evento) => {
        if (evento.ticket_id || !evento.protocolo) return evento
        const ticketId = findTicketIdByProtocolo(tickets, evento.protocolo)
        return ticketId ? { ...evento, ticket_id: ticketId } : evento
      }),
    )
  }, [tickets])

  const refresh = useCallback(async () => {
    const initialLoad = !hasLoadedOnce.current
    if (initialLoad) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setError(null)

    const [clientesResult, ticketsResult] = await Promise.allSettled([
      clientesApi.listClientes(),
      ticketsApi.fetchAllTickets(),
    ])

    const errors: string[] = []

    if (clientesResult.status === 'fulfilled') {
      setClientes(clientesResult.value)
    } else if (initialLoad || clientesCountRef.current === 0) {
      const message =
        clientesResult.reason instanceof ApiError
          ? clientesResult.reason.message
          : 'Não foi possível carregar os clientes.'
      errors.push(message)
      logger.error('clientes_load_failed', { message })
    }

    if (ticketsResult.status === 'fulfilled') {
      setTickets(ticketsResult.value)
    } else if (initialLoad || ticketsCountRef.current === 0) {
      const message =
        ticketsResult.reason instanceof ApiError
          ? ticketsResult.reason.message
          : 'Não foi possível carregar os chamados.'
      errors.push(message)
      logger.error('tickets_load_failed', { message })
    }

    if (errors.length > 0) {
      setError(errors.join(' '))
    }

    hasLoadedOnce.current = true
    setIsLoading(false)
    setIsRefreshing(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!WEBHOOK_SITE_TOKEN) return

    let cancelled = false

    async function poll() {
      try {
        const remote = await fetchWebhookSiteEvents(WEBHOOK_SITE_TOKEN)
        if (!cancelled) mergeWebhookSiteEvents(remote)
      } catch {
        // webhook.site indisponível - eventos locais da API continuam
      }
    }

    void poll()
    const timer = window.setInterval(() => void poll(), WEBHOOK_POLL_MS)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [mergeWebhookSiteEvents])

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
    clearActionError()
    try {
      const cliente = await clientesApi.createCliente(input)
      setClientes((prev) => [cliente, ...prev])
      logger.info('cliente_created', { id: cliente.id, nome: cliente.nome })
      return cliente
    } catch (err) {
      const isValidation = err instanceof ApiError && err.status === 400
      if (!isValidation) {
        const message = err instanceof ApiError ? err.message : 'Não foi possível cadastrar o cliente.'
        setActionError(message)
      }
      throw err
    }
  }, [clearActionError])

  const addTicket = useCallback(async (input: TicketInput): Promise<Ticket> => {
    clearActionError()
    try {
      const ticket = await ticketsApi.createTicket(input)
      setTickets((prev) =>
        sortByPrioridade([ticket, ...prev.filter((item) => item.id !== ticket.id)]),
      )
      void refresh()
      logger.info('ticket_created', { id: ticket.id, protocolo: ticket.protocolo })
      return ticket
    } catch (err) {
      const isValidation = err instanceof ApiError && (err.status === 400 || err.status === 404)
      if (!isValidation) {
        const message = err instanceof ApiError ? err.message : 'Não foi possível criar o chamado.'
        setActionError(message)
      }
      throw err
    }
  }, [clearActionError, refresh])

  const loadTicketDetail = useCallback(
    async (ticketId: string) => {
      clearActionError()
      try {
        const ticket = await ticketsApi.getTicket(ticketId)
        setTickets((prev) => {
          const exists = prev.some((t) => t.id === ticketId)
          if (!exists) return sortByPrioridade([ticket, ...prev])
          return prev.map((t) => (t.id === ticketId ? ticket : t))
        })
        return ticket
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Não foi possível carregar o chamado.'
        setActionError(message)
        return undefined
      }
    },
    [clearActionError],
  )

  const updateTicketStatus = useCallback(
    async (ticketId: string, status: TicketStatus) => {
      clearActionError()
      const previous = tickets.find((t) => t.id === ticketId)
      if (!previous) return

      setTickets((prev) =>
        sortByPrioridade(
          prev.map((t) =>
            t.id === ticketId ? { ...t, status, atualizado_em: new Date().toISOString() } : t,
          ),
        ),
      )

      try {
        const updated = await ticketsApi.patchTicketStatus(ticketId, status)
        setTickets((prev) =>
          sortByPrioridade(prev.map((t) => (t.id === ticketId ? { ...t, ...updated } : t))),
        )
        pushWebhookEvent('status_alterado', updated, {
          protocolo: updated.protocolo,
          evento: 'status_alterado',
          status: updated.status,
        })
        logger.info('status_changed', { ticketId, to: status })
      } catch (err) {
        setTickets((prev) =>
          sortByPrioridade(prev.map((t) => (t.id === ticketId ? previous : t))),
        )
        const message =
          err instanceof ApiError ? err.message : 'Não foi possível atualizar o status.'
        setActionError(message)
        throw err
      }
    },
    [tickets, pushWebhookEvent, clearActionError],
  )

  const addInteracao = useCallback(
    async (ticketId: string, tipo: InteracaoTipo, mensagem: string) => {
      clearActionError()
      const ticket = tickets.find((t) => t.id === ticketId)
      try {
        await ticketsApi.addTicketInteracao(ticketId, tipo, mensagem)
        const refreshed = (await loadTicketDetail(ticketId)) ?? ticket
        if (refreshed && (tipo === 'agente' || tipo === 'cliente')) {
          pushWebhookEvent('interacao_adicionada', refreshed, {
            protocolo: refreshed.protocolo,
            evento: 'interacao_adicionada',
            status: refreshed.status,
          })
        }
        logger.info('interacao_added', { ticketId, tipo })
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Não foi possível registrar a interação.'
        setActionError(message)
        throw err
      }
    },
    [tickets, loadTicketDetail, pushWebhookEvent, clearActionError],
  )

  const removeTicket = useCallback(
    async (ticketId: string) => {
      clearActionError()
      const ticket = tickets.find((t) => t.id === ticketId)
      try {
        await ticketsApi.deleteTicket(ticketId)
        if (ticket) {
          pushWebhookEvent('ticket_excluido', ticket, {
            protocolo: ticket.protocolo,
            evento: 'ticket_excluido',
            status: ticket.status,
          })
          logger.info('ticket_removed', { ticketId, protocolo: ticket.protocolo })
        }
        setTickets((prev) => prev.filter((t) => t.id !== ticketId))
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Não foi possível remover o chamado.'
        setActionError(message)
        throw err
      }
    },
    [tickets, pushWebhookEvent, clearActionError],
  )

  const value = useMemo(
    () => ({
      clientes,
      tickets,
      eventos,
      isLoading,
      isRefreshing,
      error,
      actionError,
      clearActionError,
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
      isRefreshing,
      error,
      actionError,
      clearActionError,
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
