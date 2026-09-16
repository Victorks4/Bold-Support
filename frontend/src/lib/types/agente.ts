export type Agente = {
  id: string
  nome: string
  email: string
}

export type LoginResponse = {
  access_token: string
  expires_in: number
  agente: Agente
}
