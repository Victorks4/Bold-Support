# Bold Support

Sistema de chamados (tickets) para suporte ao cliente. Backend em **n8n** com persistência em **PostgreSQL** (Supabase).

## Objetivo

Permitir cadastro de clientes, abertura e consulta de chamados, com histórico de interações — exposto via API HTTP para consumo por frontend e integrações.

## Funcionalidades (Etapa 1 - implementadas)

- Cadastrar cliente (`POST /clientes`)
- Consultar cliente por ID (`GET /clientes/:id`)
- Criar ticket com protocolo e interação automática (`POST /tickets`)
- Listar tickets com filtro por status e/ou prioridade (`GET /tickets`)
- Consultar ticket com histórico de interações (`GET /tickets/:id`)

## Stack

| Camada | Tecnologia | Finalidade |
|--------|------------|------------|
| Backend | n8n (webhooks) | Orquestração, validação e resposta HTTP |
| Banco | PostgreSQL / Supabase | Persistência relacional |
| Testes | Postman | Validação manual dos endpoints |
| Frontend | React + Vite | **Etapa 3** — não presente no repositório |

## Pré-requisitos

- Conta Supabase (ou PostgreSQL 14+)
- Acesso à instância n8n
- Postman (recomendado)

## Branches (entregas por etapa)

O desafio exige divisão clara das entregas no GitHub:

| Branch | Etapa | Status |
|--------|-------|--------|
| [`etapa-1`](../../tree/etapa-1) | CRUD básico (5 rotas) | Concluída |
| [`etapa-2`](../../tree/etapa-2) | DELETE, PATCH, interações, webhook | Em desenvolvimento |
| [`etapa-3`](../../tree/etapa-3) | Frontend React | Pendente |
| [`etapa-4`](../../tree/etapa-4) | Autenticação | Pendente |
| `main` | Última etapa estável | Sincronizada com entregas |

Detalhes e checklist: [**docs/entregas.md**](docs/entregas.md)

```bash
git checkout etapa-1   # revisar só a Etapa 1
git checkout etapa-2   # continuar desenvolvimento
```

## Instalação rápida

```bash
# 1. Clonar
git clone <url-do-repositorio>
cd Bold-Support

# 2. Variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# 3. Banco de dados
psql "$DATABASE_URL" -f database/migrations/001_initial_schema.sql

# 4. Importar workflows de n8n/workflows/ no n8n
# 5. Testar com Postman — ver docs/installation.md
```

Guia completo: [**docs/installation.md**](docs/installation.md)

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `SUPABASE_URL` | URL do projeto Supabase |
| `N8N_WEBHOOK_BASE_URL` | Base URL dos webhooks n8n |

Detalhes em [`.env.example`](.env.example).

## Estrutura do projeto

```
Bold-Support/
├── database/migrations/       # Schema SQL
├── docs/
│   ├── architecture.md          # Arquitetura e fluxos
│   ├── api.md                   # Endpoints e exemplos
│   ├── database.md              # Modelagem e ER
│   ├── installation.md          # Guia de instalação
│   └── openapi.yaml             # Contrato OpenAPI 3
├── n8n/workflows/               # Backend (5 workflows)
├── postman/                     # Collection de testes
└── .env.example
```

## Arquitetura

Cada rota HTTP é um workflow n8n: **Webhook → validação → Postgres → Respond**.

```mermaid
flowchart LR
  Client[HTTP Client] --> N8N[n8n]
  N8N --> DB[(PostgreSQL)]
  N8N --> Client
```

Detalhes: [**docs/architecture.md**](docs/architecture.md)

## API

| Método | Rota | Workflow |
|--------|------|----------|
| POST | `/clientes` | `POST_Clientes.json` |
| GET | `/clientes/:id` | `GET_Cliente_por_ID.json` |
| POST | `/tickets` | `POST_Tickets.json` |
| GET | `/tickets` | `GET_Tickets.json` |
| GET | `/tickets/:id` | `GET_Ticket_por_ID.json` |

Documentação completa: [**docs/api.md**](docs/api.md) | OpenAPI: [**docs/openapi.yaml**](docs/openapi.yaml)

## Banco de dados

Três tabelas: `clientes`, `tickets`, `interacoes`.

Diagrama ER, índices e constraints: [**docs/database.md**](docs/database.md)

## Tratamento de erros

Respostas de erro no formato `{ "erro": "...", "codigo": "..." }` com HTTP 400 (validação) ou 404 (recurso não encontrado). Códigos documentados em [docs/api.md](docs/api.md).

## Autenticação

**Não implementada** na Etapa 1.

## Limitações conhecidas

- Frontend React ainda não desenvolvido (Etapa 3).
- Rotas DELETE, PATCH status e POST interações pendentes (Etapa 2).
- Modo teste n8n (`/webhook-test`) exige **Listen for test event** por requisição.
- Endpoint de produção (`/webhook`) depende de publicação na instância n8n.


