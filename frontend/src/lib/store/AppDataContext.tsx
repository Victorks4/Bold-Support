import {

  createContext,

  useCallback,

  useContext,

  useMemo,

  useState,

  type ReactNode,

} from 'react'

import { logger } from '@/lib/logger'

import { initialClientes } from '@/lib/mocks/clients'

import { initialEventos } from '@/lib/mocks/eventos'

import { initialTickets } from '@/lib/mocks/tickets'

import type { Cliente, ClienteInput } from '@/lib/types/cliente'

import type { WebhookEvento, WebhookEventoTipo } from '@/lib/types/evento'

import type {

  Interacao,

  InteracaoTipo,

  Ticket,

  TicketInput,

  TicketStatus,

} from '@/lib/types/ticket'



interface AppDataContextValue {

  clientes: Cliente[]

  tickets: Ticket[]

  eventos: WebhookEvento[]

  addCliente: (input: ClienteInput) => Cliente

  addTicket: (input: TicketInput) => Ticket

  getClienteById: (id: string) => Cliente | undefined

  getTicketById: (id: string) => Ticket | undefined

  getClienteNome: (clienteId: string) => string

  countTicketsByCliente: (clienteId: string) => number

  updateTicketStatus: (ticketId: string, status: TicketStatus) => void

  addInteracao: (ticketId: string, tipo: InteracaoTipo, mensagem: string) => void

  removeTicket: (ticketId: string) => void

}



const AppDataContext = createContext<AppDataContextValue | null>(null)



function generateId(): string {

  return crypto.randomUUID()

}



function generateProtocolo(): string {

  const date = new Date()

  const y = date.getFullYear()

  const m = String(date.getMonth() + 1).padStart(2, '0')

  const d = String(date.getDate()).padStart(2, '0')

  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()

  return `TKT-${y}${m}${d}-${suffix}`

}



export function AppDataProvider({ children }: { children: ReactNode }) {

  const [clientes, setClientes] = useState<Cliente[]>(initialClientes)

  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)

  const [eventos, setEventos] = useState<WebhookEvento[]>(initialEventos)



  const pushWebhookEvent = useCallback(

    (tipo: WebhookEventoTipo, ticket: Ticket, payload: Record<string, unknown>) => {

      const evento: WebhookEvento = {

        id: generateId(),

        tipo,

        protocolo: ticket.protocolo,

        ticket_id: ticket.id,

        payload,

        criado_em: new Date().toISOString(),

        status: 'simulado',

      }

      setEventos((prev) => [evento, ...prev])

      logger.info('webhook_event', { tipo, protocolo: ticket.protocolo })

    },

    [],

  )



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



  const addCliente = useCallback((input: ClienteInput): Cliente => {

    const cliente: Cliente = {

      id: generateId(),

      ...input,

      criado_em: new Date().toISOString(),

    }

    setClientes((prev) => [cliente, ...prev])

    logger.info('cliente_created', { id: cliente.id, nome: cliente.nome })

    return cliente

  }, [])



  const addTicket = useCallback((input: TicketInput): Ticket => {

    const now = new Date().toISOString()

    const ticketId = generateId()

    const interacao: Interacao = {

      id: generateId(),

      ticket_id: ticketId,

      tipo: 'sistema',

      mensagem: 'Chamado aberto pelo agente no console Bold Support.',

      criado_em: now,

    }

    const ticket: Ticket = {

      id: ticketId,

      protocolo: generateProtocolo(),

      ...input,

      status: 'aberto',

      criado_em: now,

      atualizado_em: now,

      interacoes: [interacao],

    }

    setTickets((prev) => [ticket, ...prev])

    logger.info('ticket_created', { id: ticket.id, protocolo: ticket.protocolo })

    return ticket

  }, [])



  const updateTicketStatus = useCallback(

    (ticketId: string, status: TicketStatus) => {

      const now = new Date().toISOString()

      setTickets((prev) =>

        prev.map((t) => {

          if (t.id !== ticketId) return t

          const interacao: Interacao = {

            id: generateId(),

            ticket_id: ticketId,

            tipo: 'sistema',

            mensagem: `Status alterado para ${status.replace(/_/g, ' ')}.`,

            criado_em: now,

          }

          logger.info('status_changed', { ticketId, from: t.status, to: status })

          pushWebhookEvent('status_alterado', t, {

            status_anterior: t.status,

            status_novo: status,

          })

          return {

            ...t,

            status,

            atualizado_em: now,

            interacoes: [...(t.interacoes ?? []), interacao],

          }

        }),

      )

    },

    [pushWebhookEvent],

  )



  const addInteracao = useCallback(

    (ticketId: string, tipo: InteracaoTipo, mensagem: string) => {

      const now = new Date().toISOString()

      setTickets((prev) =>

        prev.map((t) => {

          if (t.id !== ticketId) return t

          const interacao: Interacao = {

            id: generateId(),

            ticket_id: ticketId,

            tipo,

            mensagem,

            criado_em: now,

          }

          logger.info('interacao_added', { ticketId, tipo })

          if (tipo === 'agente' || tipo === 'cliente') {

            pushWebhookEvent('interacao_adicionada', t, {

              tipo,

              mensagem_preview: mensagem.slice(0, 80),

            })

          }

          return {

            ...t,

            atualizado_em: now,

            interacoes: [...(t.interacoes ?? []), interacao],

          }

        }),

      )

    },

    [pushWebhookEvent],

  )



  const removeTicket = useCallback(

    (ticketId: string) => {

      setTickets((prev) => {

        const ticket = prev.find((t) => t.id === ticketId)

        if (ticket) {

          pushWebhookEvent('ticket_excluido', ticket, { motivo: 'removido pelo agente' })

          logger.info('ticket_removed', { ticketId, protocolo: ticket.protocolo })

        }

        return prev.filter((t) => t.id !== ticketId)

      })

    },

    [pushWebhookEvent],

  )



  const value = useMemo(

    () => ({

      clientes,

      tickets,

      eventos,

      addCliente,

      addTicket,

      getClienteById,

      getTicketById,

      getClienteNome,

      countTicketsByCliente,

      updateTicketStatus,

      addInteracao,

      removeTicket,

    }),

    [

      clientes,

      tickets,

      eventos,

      addCliente,

      addTicket,

      getClienteById,

      getTicketById,

      getClienteNome,

      countTicketsByCliente,

      updateTicketStatus,

      addInteracao,

      removeTicket,

    ],

  )



  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>

}



export function useAppData() {

  const ctx = useContext(AppDataContext)

  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')

  return ctx

}


