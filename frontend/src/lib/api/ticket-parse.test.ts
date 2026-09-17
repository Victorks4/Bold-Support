import { describe, expect, it } from 'vitest'
import { ApiError } from './client'
import { parseTicket } from './ticket-parse'

const ticket = {
  id: '92845250-3a28-4821-9df1-8f3fdca47377',
  protocolo: 'TKT-20260916-ABCD',
  cliente_id: 'f134ec3e-040d-46ac-acee-d96cc4a721b6',
  titulo: 'Teste',
  descricao: 'Descrição',
  prioridade: 'media',
  status: 'aberto',
  criado_em: '2026-09-16T12:00:00.000Z',
  atualizado_em: '2026-09-16T12:00:00.000Z',
}

describe('parseTicket', () => {
  it('aceita ticket completo', () => {
    expect(parseTicket(ticket)).toEqual(ticket)
  })

  it('rejeita resposta vazia', () => {
    expect(() => parseTicket({})).toThrow(ApiError)
  })

  it('rejeita ticket sem protocolo', () => {
    expect(() => parseTicket({ ...ticket, protocolo: '' })).toThrow(ApiError)
  })

  it('preserva interacoes quando presentes', () => {
    const interacao = {
      id: '11111111-1111-4111-8111-111111111111',
      ticket_id: ticket.id,
      tipo: 'agente',
      mensagem: 'Nota do agente',
      criado_em: '2026-09-16T13:00:00.000Z',
    }

    const parsed = parseTicket({ ...ticket, interacoes: [interacao] })
    expect(parsed.interacoes).toEqual([interacao])
  })
})
