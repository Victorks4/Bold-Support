import { apiFetch, buildWebhookUrl, webhookIds, webhookPaths } from './client'
import type { Cliente, ClienteInput } from '@/lib/types/cliente'

type ListClientesResponse = {
  total: number
  clientes: Cliente[]
}

export async function listClientes(): Promise<Cliente[]> {
  const url = buildWebhookUrl(webhookIds.getClientes, webhookPaths.getClientes)
  const data = await apiFetch<ListClientesResponse>(url)
  return data.clientes ?? []
}

export async function getCliente(id: string): Promise<Cliente> {
  const url = buildWebhookUrl(webhookIds.getCliente, webhookPaths.getCliente(id))
  return apiFetch<Cliente>(url)
}

export async function createCliente(input: ClienteInput): Promise<Cliente> {
  const url = buildWebhookUrl(webhookIds.postClientes, webhookPaths.postClientes)
  return apiFetch<Cliente>(url, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function deleteCliente(id: string): Promise<void> {
  const url = buildWebhookUrl(webhookIds.deleteCliente, webhookPaths.deleteCliente(id))
  await apiFetch(url, { method: 'DELETE' })
}
