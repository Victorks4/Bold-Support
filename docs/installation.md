# Instalação — Bold Support

Guia para configurar o ambiente após clonar o repositório.

## 1. Pré-requisitos

| Ferramenta | Finalidade |
|------------|------------|
| Conta **Supabase** (ou PostgreSQL 14+) | Banco de dados |
| Acesso ao **n8n** (instância Bold Solution) | Backend / webhooks |
| **Postman** (ou curl) | Testes manuais da API |
| `psql` ou SQL Editor do Supabase | Aplicar migration |

**Não identificado no código:** `package.json`, Docker Compose ou scripts npm — o projeto Etapa 1 não possui frontend nem servidor Node local.

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
   - `POST_Tickets.json`
   - `GET_Tickets.json`
   - `GET_Ticket_por_ID.json`
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

### Postman

1. Importe `postman/Bold-Support.postman_collection.json`.
2. Importe `postman/Bold-Support.postman_environment.json`.
3. Ative o environment **Bold Support**.
4. Execute as requests na ordem: criar cliente → consultar → criar ticket → listar → detalhe.

## 7. Produção

Para usar `/webhook/` (sem `-test`), o workflow precisa estar **publicado/ativo** na instância n8n.

> **Necessita confirmação:** disponibilidade do endpoint de produção depende da configuração da instância Bold Solution.

## 8. Solução de problemas

| Sintoma | Causa provável | Solução |
|---------|----------------|---------|
| `webhook not registered` | Listen inativo ou expirado | Listen for test event antes do request |
| Fluxo para no Postgres, sem 404 | 0 linhas sem Always Output Data | Ativar Always Output Data no node |
| `ENETUNREACH` IPv6 | Conexão direta Supabase | Usar Session Pooler |
| 500 No Respond to Webhook | Ramo IF sem node Respond | Conectar todos os ramos a `Responde_*` |
| Postman 400 `CLIENTE_ID_INVALIDO` | `cliente_id` vazio no environment | Criar cliente e salvar o `id` retornado |

## 9. Próximos passos

Após a Etapa 1: implementar rotas da Etapa 2 (DELETE, PATCH status, POST interações) e frontend React (Etapa 3).
