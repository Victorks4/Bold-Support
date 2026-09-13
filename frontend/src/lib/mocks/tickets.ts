import type { Ticket } from '@/lib/types/ticket'

const now = Date.now()

function ago(minutes: number): string {
  return new Date(now - minutes * 60000).toISOString()
}

export const initialTickets: Ticket[] = [
  {
    id: 't1a2b3c4-d5e6-7890-abcd-ef1234567890',
    protocolo: 'TKT-20260913-A3F2',
    cliente_id: 'c1a2b3c4-d5e6-7890-abcd-ef1234567890',
    titulo: 'Falha na sincronização de pedidos',
    descricao: 'Pedidos do ERP não estão refletindo no painel desde ontem às 18h.',
    prioridade: 'alta',
    status: 'aberto',
    criado_em: ago(8),
    atualizado_em: ago(8),
    interacoes: [
      {
        id: 'i1',
        ticket_id: 't1a2b3c4-d5e6-7890-abcd-ef1234567890',
        tipo: 'sistema',
        mensagem: 'Ticket aberto automaticamente pelo sistema.',
        criado_em: ago(8),
      },
    ],
  },
  {
    id: 't2b3c4d5-e6f7-8901-bcde-f12345678901',
    protocolo: 'TKT-20260913-B7K1',
    cliente_id: 'c2b3c4d5-e6f7-8901-bcde-f12345678901',
    titulo: 'Acesso bloqueado após reset de senha',
    descricao: 'Usuário não consegue acessar após redefinir a senha pelo link de e-mail.',
    prioridade: 'alta',
    status: 'em_atendimento',
    criado_em: ago(22),
    atualizado_em: ago(15),
    interacoes: [
      {
        id: 'i2',
        ticket_id: 't2b3c4d5-e6f7-8901-bcde-f12345678901',
        tipo: 'sistema',
        mensagem: 'Ticket aberto automaticamente pelo sistema.',
        criado_em: ago(22),
      },
      {
        id: 'i3',
        ticket_id: 't2b3c4d5-e6f7-8901-bcde-f12345678901',
        tipo: 'agente',
        mensagem: 'Verificando logs de autenticação no Supabase.',
        criado_em: ago(15),
      },
    ],
  },
  {
    id: 't3c4d5e6-f7a8-9012-cdef-123456789012',
    protocolo: 'TKT-20260912-C2M9',
    cliente_id: 'c3c4d5e6-f7a8-9012-cdef-123456789012',
    titulo: 'Relatório mensal com dados inconsistentes',
    descricao: 'Total de vendas no relatório não bate com o dashboard.',
    prioridade: 'media',
    status: 'aguardando_cliente',
    criado_em: ago(180),
    atualizado_em: ago(45),
    interacoes: [
      {
        id: 'i4',
        ticket_id: 't3c4d5e6-f7a8-9012-cdef-123456789012',
        tipo: 'sistema',
        mensagem: 'Ticket aberto automaticamente pelo sistema.',
        criado_em: ago(180),
      },
      {
        id: 'i5',
        ticket_id: 't3c4d5e6-f7a8-9012-cdef-123456789012',
        tipo: 'agente',
        mensagem: 'Enviamos planilha de conferência. Aguardando retorno do cliente.',
        criado_em: ago(45),
      },
    ],
  },
  {
    id: 't4d5e6f7-a8b9-0123-def0-234567890123',
    protocolo: 'TKT-20260911-D8P4',
    cliente_id: 'c4d5e6f7-a8b9-0123-def0-234567890123',
    titulo: 'Integração webhook n8n com timeout',
    descricao: 'Workflow de notificação retorna timeout após 30s em produção.',
    prioridade: 'alta',
    status: 'em_atendimento',
    criado_em: ago(320),
    atualizado_em: ago(60),
    interacoes: [
      {
        id: 'i6',
        ticket_id: 't4d5e6f7-a8b9-0123-def0-234567890123',
        tipo: 'sistema',
        mensagem: 'Ticket aberto automaticamente pelo sistema.',
        criado_em: ago(320),
      },
    ],
  },
  {
    id: 't5e6f7a8-b9c0-1234-ef01-345678901234',
    protocolo: 'TKT-20260910-E1Q7',
    cliente_id: 'c5e6f7a8-b9c0-1234-ef01-345678901234',
    titulo: 'Dúvida sobre faturamento recorrente',
    descricao: 'Cliente quer entender cobrança proporcional no upgrade de plano.',
    prioridade: 'baixa',
    status: 'resolvido',
    criado_em: ago(1440),
    atualizado_em: ago(720),
    interacoes: [
      {
        id: 'i7',
        ticket_id: 't5e6f7a8-b9c0-1234-ef01-345678901234',
        tipo: 'sistema',
        mensagem: 'Ticket aberto automaticamente pelo sistema.',
        criado_em: ago(1440),
      },
      {
        id: 'i8',
        ticket_id: 't5e6f7a8-b9c0-1234-ef01-345678901234',
        tipo: 'agente',
        mensagem: 'Explicação enviada por e-mail. Cliente confirmou entendimento.',
        criado_em: ago(720),
      },
    ],
  },
  {
    id: 't6f7a8b9-c0d1-2345-f012-456789012345',
    protocolo: 'TKT-20260909-F5R2',
    cliente_id: 'c1a2b3c4-d5e6-7890-abcd-ef1234567890',
    titulo: 'Solicitação de cancelamento de conta',
    descricao: 'Cliente solicitou encerramento do contrato e exportação de dados.',
    prioridade: 'media',
    status: 'cancelado',
    criado_em: ago(2880),
    atualizado_em: ago(2400),
    interacoes: [
      {
        id: 'i9',
        ticket_id: 't6f7a8b9-c0d1-2345-f012-456789012345',
        tipo: 'sistema',
        mensagem: 'Ticket aberto automaticamente pelo sistema.',
        criado_em: ago(2880),
      },
    ],
  },
]
