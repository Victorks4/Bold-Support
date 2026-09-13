---
name: bold-support
description: Contexto completo do desafio Bold Support — stack n8n+Supabase, convenções de workflows, etapas de entrega, branches Git, bugs conhecidos e checklist da Etapa 2. Use antes de implementar rotas, documentar ou continuar entregas.
---

# Bold Support — Contexto do Projeto

Skill de continuidade para o desafio técnico FullStack **Bold Solution**. Leia este arquivo antes de implementar novas rotas, criar workflows n8n ou atualizar documentação.

## Repositório e branches

| Item | Valor |
|------|-------|
| Repo local | `Bold-Support` |
| GitHub | `https://github.com/Victorks4/Bold-Support` |
| Branch estável | `main` (última etapa entregue) |
| Branch ativa | `etapa-2` (desenvolvimento atual) |
| Snapshot Etapa 1 | `etapa-1` (congelada, não alterar) |

**Regra:** trabalhar na branch da etapa em curso; ao concluir, merge em `main`. Detalhes em `docs/entregas.md`.

## Stack (obrigatória pelo desafio)

| Camada | Tecnologia | Notas |
|--------|------------|-------|
| Backend | **n8n** (webhooks) | **NÃO usar NestJS** |
| Banco | PostgreSQL / **Supabase** | Projeto `bold-support`, região `us-west-2` |
| Testes | Postman | Modo teste n8n |
| Frontend | React + Vite | Etapa 3 — ainda não existe |

## Infraestrutura

### Supabase

- Migration aplicada: `database/migrations/001_initial_schema.sql`
- Tabelas: `clientes`, `tickets`, `interacoes`
- Credencial Postgres no n8n: usar **Session Pooler** (`aws-0-us-west-2.pooler.supabase.com`), não conexão direta IPv6

### n8n hospedado

- URL base: `https://dev.boldsolution.com.br`
- Teste: `/webhook-test/<rota>` + **Listen for test event** (1 Listen = 1 request)
- Produção `/webhook/`: pode retornar 404 se workflow não estiver publicado

### Variáveis (.env.example)

- `DATABASE_URL`, `SUPABASE_URL`, `N8N_WEBHOOK_BASE_URL`

## Convenções de workflows n8n

Aplicar em **todos** os workflows novos e existentes:

1. **Nomenclatura de nodes:** `Snake_case` descritivo (`Validar_payload`, `Buscar_cliente`, `Responde_400`)
2. **Webhook:** sempre nome `Webhook_1`
3. **Fluxo padrão:** `Webhook → Code (validar) → IF → Postgres → Respond to Webhook`
4. **Postgres de busca:** `Always Output Data = ON` (senão 404 não funciona com 0 linhas)
5. **Respostas de erro:** nodes separados `Responde_400` e `Responde_404` com status HTTP fixo
6. **Query Parameters Postgres:** um `={{ $json.campo }}` por parâmetro
7. **Export JSON:** `n8n/workflows/<Nome_Canônico>.json` (ex.: `DELETE_Cliente_por_ID.json`)

### Formato de erro da API

```json
{
  "erro": "Mensagem legível",
  "codigo": "CODIGO_CONSTANTE"
}
```

- UUID malformado → **400**
- UUID válido inexistente → **404**
- Erro n8n "webhook not registered" → Listen inativo, não é 404 da API

## Etapa 1 — Concluída (branch `etapa-1`)

| Método | Rota | Arquivo |
|--------|------|---------|
| POST | `/clientes` | `POST_Clientes.json` |
| GET | `/clientes/:id` | `GET_Cliente_por_ID.json` |
| POST | `/tickets` | `POST_Tickets.json` |
| GET | `/tickets` | `GET_Tickets.json` |
| GET | `/tickets/:id` | `GET_Ticket_por_ID.json` |

## Etapa 2 — Próxima entrega (branch `etapa-2`)

### Rotas a implementar

| Método | Rota | Arquivo sugerido |
|--------|------|------------------|
| DELETE | `/clientes/:id` | `DELETE_Cliente_por_ID.json` |
| DELETE | `/tickets/:id` | `DELETE_Ticket_por_ID.json` |
| PATCH | `/tickets/:id/status` | `PATCH_Ticket_Status.json` |
| POST | `/tickets/:id/interacoes` | `POST_Ticket_Interacao.json` |

### Integração HTTP externa

Disparar webhook mock em eventos de ticket com campos: `protocolo`, `evento`, `status`.

### Regras de banco relevantes

- `clientes` → `tickets`: `ON DELETE RESTRICT` — não excluir cliente com tickets (retornar erro de negócio)
- `tickets` → `interacoes`: `ON DELETE CASCADE` — excluir ticket remove interações
- Status válidos: `aberto`, `em_atendimento`, `aguardando_cliente`, `resolvido`, `cancelado`
- Prioridades: `baixa`, `media`, `alta`
- Tipos interação: `sistema`, `cliente`, `agente`

### Ao concluir Etapa 2

1. Exportar workflows para `n8n/workflows/`
2. Atualizar `docs/api.md`, `docs/openapi.yaml`, `README.md`
3. Testar no Postman com Listen ativo
4. Merge `etapa-2` → `main`
5. Atualizar `docs/entregas.md`

## Etapas futuras

- **Etapa 3:** Frontend React + Vite (`etapa-3`)
- **Etapa 4:** Autenticação JWT/OAuth (`etapa-4`)

## Problemas já resolvidos (não repetir)

| Problema | Solução |
|----------|---------|
| Postgres 0 linhas para o fluxo | `Always Output Data` no node Postgres |
| 404 vs "webhook not registered" | Listen inativo ≠ 404 da API |
| POST Tickets sem descrição | Separar `Responde_400` (validação) e `Responde_404` (cliente) |
| IF invertido em validação | Revisar condição true/false dos branches |
| Execute workflow ≠ Postman | Só funciona com **Listen for test event** |

## Estrutura do repositório

```
Bold-Support/
├── database/migrations/
├── docs/                    # api, architecture, database, installation, openapi, entregas
├── n8n/workflows/           # Backend (JSONs exportados)
├── .cursor/skills/          # Skills locais (bold-support, project-documentation)
├── .env.example
└── README.md
```

## Skills relacionadas

- `project-documentation` — ao criar/atualizar README, API, arquitetura
- `bold-support` (esta) — contexto de domínio, etapas e convenções n8n

## Documentação de referência

- `docs/entregas.md` — branches e checklist por etapa
- `docs/api.md` — endpoints e códigos de erro
- `docs/architecture.md` — fluxos e diagramas
- `docs/installation.md` — setup Supabase + n8n + Postman
- `docs/openapi.yaml` — contrato OpenAPI

## Segurança

- Nunca commitar `.env`, tokens ou connection strings reais
- Não expor UUIDs de teste em docs públicos do repositório
