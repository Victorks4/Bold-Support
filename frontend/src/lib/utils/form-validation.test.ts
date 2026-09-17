import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api/client'
import {
  hasFieldErrors,
  mapClienteApiError,
  mapTicketApiError,
  validateClienteInput,
  validateLoginInput,
  validateTicketInput,
} from '@/lib/utils/form-validation'

describe('validateLoginInput', () => {
  it('retorna erro de form quando email e senha estão vazios', () => {
    const errors = validateLoginInput({ email: '', senha: '' })
    expect(errors.form).toBe('Preencha e-mail e senha para entrar.')
  })

  it('rejeita email inválido', () => {
    const errors = validateLoginInput({ email: 'invalido', senha: 'Bold@2026' })
    expect(errors.email).toBe('Informe um e-mail válido.')
  })

  it('aceita credenciais válidas', () => {
    const errors = validateLoginInput({ email: 'agente@bold.com', senha: 'Bold@2026' })
    expect(hasFieldErrors(errors)).toBe(false)
  })
})

describe('validateClienteInput', () => {
  it('exige todos os campos', () => {
    const errors = validateClienteInput({ nome: '', email: '', telefone: '' })
    expect(errors.form).toBe('Preencha todos os dados antes de adicionar o cliente.')
  })

  it('valida email e nome', () => {
    const errors = validateClienteInput({
      nome: 'Victor',
      email: 'email-invalido',
      telefone: '11999998888',
    })
    expect(errors.email).toBe('Informe um e-mail válido.')
    expect(errors.nome).toBeUndefined()
  })

  it('rejeita telefone com menos de 10 dígitos', () => {
    const errors = validateClienteInput({
      nome: 'Victor',
      email: 'victor@empresa.com',
      telefone: '1199999',
    })
    expect(errors.telefone).toMatch(/dígitos/)
  })
})

describe('validateTicketInput', () => {
  it('exige cliente, título e descrição', () => {
    const errors = validateTicketInput({ cliente_id: '', titulo: '', descricao: '' })
    expect(errors.form).toBe('Preencha todos os dados antes de criar o chamado.')
  })

  it('aceita payload válido', () => {
    const errors = validateTicketInput({
      cliente_id: 'uuid',
      titulo: 'Problema no sistema',
      descricao: 'Detalhes do chamado',
    })
    expect(hasFieldErrors(errors)).toBe(false)
  })

  it('rejeita descrição acima de 1000 caracteres', () => {
    const errors = validateTicketInput({
      cliente_id: 'uuid',
      titulo: 'Problema',
      descricao: 'a'.repeat(1001),
    })
    expect(errors.descricao).toMatch(/1000 caracteres/)
  })
})

describe('mapClienteApiError', () => {
  it('mapeia EMAIL_INVALIDO para campo email', () => {
    const err = new ApiError('E-mail inválido', 'EMAIL_INVALIDO', 400)
    expect(mapClienteApiError(err).email).toBe('E-mail inválido')
  })
})

describe('mapTicketApiError', () => {
  it('mapeia DESCRICAO_OBRIGATORIA para campo descricao', () => {
    const err = new ApiError('Descrição obrigatória', 'DESCRICAO_OBRIGATORIA', 400)
    expect(mapTicketApiError(err).descricao).toBe('Descrição obrigatória')
  })
})
