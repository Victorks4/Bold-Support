import type { Cliente } from '@/lib/types/cliente'

export const initialClientes: Cliente[] = [
  {
    id: 'c1a2b3c4-d5e6-7890-abcd-ef1234567890',
    nome: 'Marina Costa',
    email: 'marina@luminalabs.com',
    telefone: '(11) 99876-5432',
    criado_em: '2026-09-10T10:00:00.000Z',
  },
  {
    id: 'c2b3c4d5-e6f7-8901-bcde-f12345678901',
    nome: 'Rafael Nogueira',
    email: 'rafael@nortecomercial.com',
    telefone: '(21) 98765-4321',
    criado_em: '2026-09-11T14:30:00.000Z',
  },
  {
    id: 'c3c4d5e6-f7a8-9012-cdef-123456789012',
    nome: 'Carla Vieira',
    email: 'carla@verdeagro.com',
    telefone: '(31) 97654-3210',
    criado_em: '2026-09-12T09:15:00.000Z',
  },
  {
    id: 'c4d5e6f7-a8b9-0123-def0-234567890123',
    nome: 'Diego Almeida',
    email: 'diego@techflow.io',
    telefone: '(41) 96543-2109',
    criado_em: '2026-09-12T16:45:00.000Z',
  },
  {
    id: 'c5e6f7a8-b9c0-1234-ef01-345678901234',
    nome: 'Fernanda Lima',
    email: 'fernanda@clinicavida.com',
    telefone: '(51) 95432-1098',
    criado_em: '2026-09-13T08:00:00.000Z',
  },
]

export function getInitials(nome: string): string {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}
