import { ApiError } from '@/lib/api/client'
import {
  DESCRICAO_MAX_LENGTH,
  NOME_MAX_LENGTH,
  TELEFONE_MAX_DIGITS,
  TELEFONE_MIN_DIGITS,
  TITULO_MAX_LENGTH,
} from '@/lib/constants/field-limits'
import { sanitizeTelefoneInput } from '@/lib/utils/input-masks'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type FieldErrors<T extends string> = Partial<Record<T, string>> & { form?: string }

export function hasFieldErrors<T extends string>(errors: FieldErrors<T>): boolean {
  return Boolean(errors.form) || Object.keys(errors).some((key) => key !== 'form' && errors[key as T])
}

export function validateClienteInput(input: {
  nome: string
  email: string
  telefone: string
}): FieldErrors<'nome' | 'email' | 'telefone'> {
  const nome = input.nome.trim()
  const email = input.email.trim()
  const telefone = sanitizeTelefoneInput(input.telefone.trim())

  if (!nome && !email && !telefone) {
    return { form: 'Preencha todos os dados antes de adicionar o cliente.' }
  }

  const errors: FieldErrors<'nome' | 'email' | 'telefone'> = {}

  if (!nome) errors.nome = 'Preencha o nome.'
  else if (nome.length > NOME_MAX_LENGTH) {
    errors.nome = `O nome deve ter no máximo ${NOME_MAX_LENGTH} caracteres.`
  }

  if (!email) errors.email = 'Preencha o e-mail.'
  else if (!EMAIL_RE.test(email)) errors.email = 'Informe um e-mail válido.'

  if (!telefone) errors.telefone = 'Preencha o telefone.'
  else if (telefone.length < TELEFONE_MIN_DIGITS || telefone.length > TELEFONE_MAX_DIGITS) {
    errors.telefone = `Informe um telefone com ${TELEFONE_MIN_DIGITS} ou ${TELEFONE_MAX_DIGITS} dígitos.`
  }

  return errors
}

export function validateTicketInput(input: {
  cliente_id: string
  titulo: string
  descricao: string
}): FieldErrors<'cliente_id' | 'titulo' | 'descricao'> {
  const titulo = input.titulo.trim()
  const descricao = input.descricao.trim()
  const cliente_id = input.cliente_id.trim()

  if (!cliente_id && !titulo && !descricao) {
    return { form: 'Preencha todos os dados antes de criar o chamado.' }
  }

  const errors: FieldErrors<'cliente_id' | 'titulo' | 'descricao'> = {}

  if (!cliente_id) errors.cliente_id = 'Selecione um cliente.'
  if (!titulo) errors.titulo = 'Preencha o título.'
  else if (titulo.length > TITULO_MAX_LENGTH) {
    errors.titulo = `O título deve ter no máximo ${TITULO_MAX_LENGTH} caracteres.`
  }
  if (!descricao) errors.descricao = 'Preencha a descrição.'
  else if (descricao.length > DESCRICAO_MAX_LENGTH) {
    errors.descricao = `A descrição deve ter no máximo ${DESCRICAO_MAX_LENGTH} caracteres.`
  }

  return errors
}

export function mapClienteApiError(err: ApiError): FieldErrors<'nome' | 'email' | 'telefone'> {
  switch (err.codigo) {
    case 'NOME_INVALIDO':
      return { nome: err.message || 'Nome inválido ou ausente.' }
    case 'EMAIL_INVALIDO':
      return { email: err.message || 'E-mail inválido.' }
    case 'TELEFONE_OBRIGATORIO':
      return { telefone: err.message || 'Telefone obrigatório.' }
    default:
      return { form: err.message || 'Não foi possível cadastrar o cliente.' }
  }
}

export function validateLoginInput(input: {
  email: string
  senha: string
}): FieldErrors<'email' | 'senha'> {
  const email = input.email.trim()
  const senha = input.senha

  if (!email && !senha) {
    return { form: 'Preencha e-mail e senha para entrar.' }
  }

  const errors: FieldErrors<'email' | 'senha'> = {}

  if (!email) errors.email = 'Preencha o e-mail.'
  else if (!EMAIL_RE.test(email)) errors.email = 'Informe um e-mail válido.'

  if (!senha) errors.senha = 'Preencha a senha.'

  return errors
}

export function mapTicketApiError(
  err: ApiError,
): FieldErrors<'cliente_id' | 'titulo' | 'descricao' | 'prioridade'> {
  switch (err.codigo) {
    case 'CLIENTE_ID_INVALIDO':
      return { cliente_id: err.message || 'Cliente inválido.' }
    case 'CLIENTE_NAO_ENCONTRADO':
      return { cliente_id: err.message || 'Cliente não encontrado.' }
    case 'TITULO_INVALIDO':
      return { titulo: err.message || 'Título inválido.' }
    case 'DESCRICAO_OBRIGATORIA':
      return { descricao: err.message || 'Descrição obrigatória.' }
    case 'PRIORIDADE_INVALIDA':
      return { form: err.message || 'Prioridade inválida.' }
    case 'ERRO_INTERNO':
      return { form: 'Falha ao salvar o chamado no banco. Reimporte o workflow POST_Tickets no n8n.' }
    case 'RESPOSTA_INVALIDA':
      return {
        form:
          'O servidor respondeu sem os dados do chamado. Reimporte o workflow POST_Tickets no n8n (npm run n8n:import).',
      }
    default:
      return { form: err.message || 'Não foi possível criar o chamado.' }
  }
}
