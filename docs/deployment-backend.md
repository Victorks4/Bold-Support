# Deploy do backend (n8n) no Railway

Guia para hospedar o backend Bold Support em uma instancia n8n propria no Railway, mantendo o banco da aplicacao no Supabase.

## Arquitetura

| Banco | Finalidade |
|-------|------------|
| Postgres Railway | Metadados do n8n (workflows, credenciais, execucoes) |
| Supabase | Dados da aplicacao (clientes, tickets, interacoes, agentes, app_config) |

## Pre-requisitos

- Conta no Railway
- Supabase com migrations 001, 002 e 003
- Repositorio Bold-Support no GitHub

## Passo 1 - Teste local (opcional)

cd deploy/n8n
cp .env.example .env
docker compose up -d

Acesse http://localhost:5678

## Passo 2 - Railway

1. railway.app/new -> Deploy from GitHub repo
2. Selecione Bold-Support
3. railway.toml na raiz usa deploy/n8n/Dockerfile

## Passo 3 - Postgres interno

+ New -> Database -> PostgreSQL (so para metadados do n8n)

## Passo 4 - Variaveis (ver deploy/n8n/.env.example)

Obrigatorias: N8N_ENCRYPTION_KEY, N8N_PORT=${{PORT}}, WEBHOOK_URL, N8N_EDITOR_BASE_URL, DB_TYPE=postgresdb, DB_POSTGRESDB_* referenciando Postgres Railway.

## Passo 5 - Dominio publico

Settings -> Networking -> Generate Domain
Atualize WEBHOOK_URL com a URL gerada.
Base API: https://SEU-DOMINIO.up.railway.app/webhook

## Passo 6 - n8n setup

1. Criar conta owner
2. Credencial Postgres -> Bold Support - Supabase (Session Pooler)
3. Importar 11 JSONs de n8n/workflows/
4. Vincular credencial, Always Output Data nos nodes de busca, ativar workflows
5. Atualizar jwt_secret no Supabase app_config

## Passo 7 - Postman

base_url = https://SEU-DOMINIO.up.railway.app/webhook
POST login -> GET clientes

## webhookIds frontend

client.ts: bold-delete-cliente, bold-get-ticket-id, bold-delete-ticket, bold-patch-ticket-status, bold-post-ticket-interacao
