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
3. Cole o conteúdo de `database/migrations/001_initial_schema.sql`.
4. Execute.

### Opção B — psql

```bash
psql "$DATABASE_URL" -f database/migrations/001_initial_schema.sql
```

Verifique as tabelas: `clientes`, `tickets`, `interacoes`.

## 5. n8n — importar workflows

1. Acesse a instância n8n.
2. **Import from File** para cada JSON em `n8n/workflows/`:
   - `POST_Clientes.json`
   - `GET_Cliente_por_ID.json`
   - `DELETE_Cliente_por_ID.json`
   - `POST_Tickets.json`
   - `GET_Tickets.json`
   - `GET_Ticket_por_ID.json`
   - `DELETE_Ticket_por_ID.json`
   - `PATCH_Ticket_Status.json`
   - `POST_Ticket_Interacao.json`
3. Em **cada** node Postgres, vincule a credencial do banco (Session Pooler recomendado no Supabase).
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

1. Importe `postman/Bold-Support.postman_collection.json` e `postman/Bold-Support.postman_environment.json`.
2. Ative o environment **Bold Support — Produção**.
3. Preencha `cliente_id` e `ticket_id` (crie via workflows da Etapa 1 se necessário).
4. **Etapa 2** — ordem sugerida: PATCH status → POST interação → DELETE ticket → DELETE cliente (sem tickets).

> URLs da collection usam o formato da instância Bold: `/webhook/{webhookId}/{path}`. Copie a Production URL do node `Webhook_1` no n8n para validar.

### Webhook externo (Etapa 2)

1. Crie um endpoint em [webhook.site](https://webhook.site) e copie a URL.
2. Configure `WEBHOOK_EXTERNO_URL` no n8n (variável de ambiente) ou edite o node `Webhook_externo` nos workflows.
3. Ao alterar status ou excluir ticket, verifique o payload `{ protocolo, evento, status }` no webhook.site.

## 7. Produção

Para usar `/webhook/` (sem `-test`), o workflow precisa estar **publicado/ativo** na instância n8n. Na instância Bold, a URL de produção inclui o `webhookId` de cada workflow (ver `docs/api.md`).

## 8. Solução de problemas

| Sintoma | Causa provável | Solução |
|---------|----------------|---------|
| `webhook not registered` | Listen inativo ou expirado | Listen for test event antes do request |
| Fluxo para no Postgres, sem 404 | 0 linhas sem Always Output Data | Ativar Always Output Data no node |
| `ENETUNREACH` IPv6 | Conexão direta Supabase | Usar Session Pooler |
| 500 No Respond to Webhook | Ramo IF sem node Respond | Conectar todos os ramos a `Responde_*` |
| Postman 400 `CLIENTE_ID_INVALIDO` | `cliente_id` vazio no environment | Criar cliente e salvar o `id` retornado |

## 9. Frontend (Etapa 3)

O console do agente está em `frontend/`. Dados mock em memória — não requer banco nem n8n para rodar localmente.

```bash
cd frontend
cp .env.example .env
npm install
npm run dev       # http://localhost:5173
```

### Variáveis de ambiente do frontend

| Variável | Descrição |
|----------|-----------|
| `VITE_N8N_WEBHOOK_BASE_URL` | Base URL dos webhooks n8n (integração futura) |

Os IDs dos workflows (`VITE_WEBHOOK_ID_*`) estão comentados em `frontend/.env.example` — ativar quando conectar a API real.

### Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Build de produção (TypeScript + Vite) |
| `npm run lint` | Oxlint |
| `npm run preview` | Preview do build local |

### Fluxo de teste do frontend

1. Acesse `http://localhost:5173`
2. Na tela de login, clique em **Entrar** (auth mock — qualquer credencial)
3. Navegue pelo dashboard, fila kanban, chamados, clientes e eventos
4. Cadastre um cliente em `/clientes` e abra um chamado
5. Mova cards no kanban em `/fila` e verifique eventos simulados em `/eventos`

Documentação detalhada: [`frontend/README.md`](../frontend/README.md)

## 10. Próximos passos

Etapas 1–3 concluídas no repositório. Próximo: autenticação (Etapa 4, branch `stage/04-authentication`).
