export interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  criado_em: string
}

export interface ClienteInput {
  nome: string
  email: string
  telefone: string
}
