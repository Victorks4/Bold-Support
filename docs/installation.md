# Instalação — Bold Support

Guia para configurar o ambiente após clonar o repositório.

## 1. Pré-requisitos

| Ferramenta | Finalidade |
|------------|------------|
| **Node.js 20+** e npm | Frontend React (`frontend/`) |
| Conta **Supabase** (ou PostgreSQL 14+) | Banco de dados |
| Acesso ao **n8n** (instância Bold Solution) | Backend / webhooks |
| **Postman** (ou curl) | Testes manuais da API |
| `psql` ou SQL Editor do Supabase | Aplicar migration |

## 2. Clone do repositório

```bash
git clone <url-do-repositorio>
cd Bold-Support
```

## 3. Variáveis de ambiente

Copie o exemplo e preencha com seus valores:

```bash
cp .env.example .env
```

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL (Session Pooler no Supabase) |
| `SUPABASE_URL` | URL do projeto Supabase |
| `N8N_WEBHOOK_BASE_URL` | Base dos webhooks n8n (produção: `/webhook`) |

> Não commite o arquivo `.env`. Ele está listado no `.gitignore`.

## 4. Banco de dados

### Opção A — Supabase SQL Editor

1. Crie um projeto no Supabase.
2. Abra **SQL Editor**.
3. Cole o conteúdo de `database/migrations/001_initial_schema.sql` e execute.
4. Cole o conteúdo de `database/migrations/002_agentes.sql` e execute.

### Opção B — psql

```bash
psql "$DATABASE_URL" -f database/migrations/001_initial_schema.sql
psql "$DATABASE_URL" -f database/migrations/002_agentes.sql
```

Verifique as tabelas: `clientes`, `tickets`, `interacoes`, `agentes`.

### Agente de teste (desenvolvimento)

A migration `002_agentes.sql` cria um agente para login:

| Campo | Valor |
|-------|-------|
| E-mail | `agente@bold.com` |
| Senha | `Bold@2026` |

> Use apenas em ambiente de desenvolvimento. Não reutilize esta senha em produção.

## 5. n8n — importar workflows

1. Acesse a instância n8n.
2. **Import from File** para cada JSON em `n8n/workflows/`:
   - `POST_Clientes.json`
   - `GET_Clientes.json`
   - `GET_Cliente_por_ID.json`
   - `DELETE_Cliente_por_ID.json`
   - `POST_Tickets.json`
   - `GET_Tickets.json`
   - `GET_Ticket_por_ID.json`
   - `DELETE_Ticket_por_ID.json`
   - `PATCH_Ticket_Status.json`
   - `POST_Ticket_Interacao.json`
   - `POST_Auth_Login.json`
3. Configure variáveis de ambiente no n8n:

| Variável | Descrição |
|----------|-----------|
| `JWT_SECRET` | String longa aleatória para assinar/validar JWT (obrigatório) |
| `JWT_EXPIRES_IN` | Expiração em segundos (opcional, default `3600`) |

4. Em **cada** node Postgres, vincule a credencial do banco (Session Pooler recomendado no Supabase).
4. Nos nodes Postgres de **busca** (`Buscar_cliente`, `Buscar_ticket`, `Verificar_cliente`, `Listar_tickets`, `Buscar_interacoes`): ative **Always Output Data** nas configurações do node.

### Credencial Postgres (Supabase)

| Campo | Valor típico |
|-------|--------------|
| Host | `aws-0-<regiao>.pooler.supabase.com` |
| Port | `5432` |
| Database | `postgres` |
| User | `postgres.<project-ref>` |
| SSL | Allow |

## 6. Testar a API

### Modo teste (desenvolvimento)

1. Abra um workflow no n8n.
2. Clique no node `Webhook_1` → **Listen for test event**.
3. Envie a requisição enquanto estiver escutando.

URL de teste:

```
https://dev.boldsolution.com.br/webhook-test/<rota>
```

> Um Listen = uma requisição. Repita o passo 2 para cada teste.

### Postman (produção)

1. Importe:
   - `postman/Bold-Support-Etapa-4.postman_collection.json` (login JWT)
   - `postman/Bold-Support-Etapa-1.postman_collection.json` (rotas básicas)
   - `postman/Bold-Support-Etapa-2.postman_collection.json` (DELETE, PATCH, interações)
   - `postman/Bold-Support.postman_environment.json`
2. Ative o environment **Bold Support — Produção** (`base_url` = `https://dev.boldsolution.com.br/webhook`).
3. Execute **POST — Login agente** (Etapa 4) — o script preenche `access_token` automaticamente.
4. Preencha `cliente_id` e `ticket_id` com UUIDs válidos.
5. Ordem sugerida Etapa 2: PATCH status → POST interação → DELETE ticket → DELETE cliente (sem tickets).

> Todas as rotas (exceto login) exigem `Authorization: Bearer {{access_token}}`. As collections Etapa 1 e 2 já incluem esse header.

> Na instância Bold, algumas rotas usam só o path (`/webhook/clientes`) e outras incluem `webhookId` (`/webhook/bold-get-ticket-id/tickets/id/:id`). Tabela completa em `docs/api.md`.

### Webhook externo (Etapa 2)

1. Crie um endpoint em [webhook.site](https://webhook.site) e copie a URL.
2. Configure `WEBHOOK_EXTERNO_URL` no n8n (variável de ambiente) ou edite o node `Webhook_externo` nos workflows.
3. Ao alterar status ou excluir ticket, verifique o payload `{ protocolo, evento, status }` no webhook.site.

## 7. Produção

Para usar `/webhook/` (sem `-test`), o workflow precisa estar **publicado/ativo** na instância n8n. Copie a **Production URL** de cada node `Webhook_1` — o formato pode variar (path simples ou com `webhookId` no meio). Ver `docs/api.md`.

## 8. Solução de problemas

| Sintoma | Causa provável | Solução |
|---------|----------------|---------|
| `webhook not registered` | Listen inativo ou expirado | Listen for test event antes do request |
| Fluxo para no Postgres, sem 404 | 0 linhas sem Always Output Data | Ativar Always Output Data no node |
| `ENETUNREACH` IPv6 | Conexão direta Supabase | Usar Session Pooler |
| 500 No Respond to Webhook | Ramo IF sem node Respond | Conectar todos os ramos a `Responde_*` |
| Postman 400 `CLIENTE_ID_INVALIDO` | `cliente_id` vazio no environment | Criar cliente e salvar o `id` retornado |

## 9. Frontend (Etapa 3)

O console do agente está em `frontend/` e consome a API n8n em produção via proxy Vite.

```bash
cd frontend
cp .env.example .env
npm install
npm run dev       # http://localhost:5173
```

### Variáveis de ambiente do frontend

| Variável | Descrição |
|----------|-----------|
| `VITE_N8N_WEBHOOK_BASE_URL` | Base dos webhooks (`/webhook` — proxy para `dev.boldsolution.com.br`) |
| `VITE_WEBHOOK_SITE_TOKEN` | (Opcional) UUID do webhook.site para sincronizar eventos em `/eventos` |

Os `webhookId` por rota estão mapeados em `frontend/src/lib/api/client.ts` conforme a instância Bold.

### Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Build de produção (TypeScript + Vite) |
| `npm run lint` | Oxlint |
| `npm run preview` | Preview do build local |

### Fluxo de teste do frontend

1. Garanta workflows **ativos** no n8n (produção `/webhook`)
2. Acesse `http://localhost:5173`
3. Faça login com o agente de teste (`agente@bold.com` / `Bold@2026`)
4. Verifique clientes e tickets carregados (bootstrap via API)
5. Cadastre cliente e abra chamado em `/clientes`
6. Mova cards no kanban em `/fila` e altere status no detalhe do chamado
7. Confira eventos em `/eventos` (mutações locais + webhook.site se configurado)

Documentação detalhada: [`frontend/README.md`](../frontend/README.md)

## 10. Etapa 4 — Autenticação JWT

1. Aplique `002_agentes.sql` no Supabase.
2. Configure `JWT_SECRET` no n8n e reimporte todos os workflows (incluindo `POST_Auth_Login.json`).
3. Ative/publicar workflows protegidos.
4. Teste no Postman: login → GET clientes com Bearer → GET clientes sem Bearer (401).
5. No frontend, login real com sessão (`localStorage` se "Lembrar-me", senão `sessionStorage`).

Token expirado durante o uso → API retorna `401 TOKEN_INVALIDO` → logout automático e redirect para `/`.
