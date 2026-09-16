# Bold Support

Sistema de chamados (tickets) para suporte ao cliente. Backend em **n8n** com persistÃªncia em **PostgreSQL** (Supabase) e console web para agentes em **React**.

## Objetivo

Permitir cadastro de clientes, abertura e consulta de chamados, com histÃ³rico de interaÃ§Ãµes - exposto via API HTTP para consumo por frontend e integraÃ§Ãµes.

## Funcionalidades

### Etapa 1 - API bÃ¡sica

- Listar clientes (`GET /clientes`)
- Cadastrar cliente (`POST /clientes`)
- Consultar cliente por ID (`GET /clientes/id/:id`)
- Criar ticket com protocolo e interaÃ§Ã£o automÃ¡tica (`POST /tickets/criar`)
- Listar tickets com filtro por status e/ou prioridade (`GET /tickets/listar`)
- Consultar ticket com histÃ³rico de interaÃ§Ãµes (`GET /tickets/id/:id`)

### Etapa 2 - Regras de negÃ³cio e integraÃ§Ã£o

- Remover cliente sem tickets (`DELETE /clientes/remover/:id`)
- Remover ticket (`DELETE /tickets/remover/:id`)
- Atualizar status com transiÃ§Ãµes validadas (`PATCH /tickets/atualizar-status/:id`)
- Adicionar interaÃ§Ã£o (`POST /tickets/adicionar-interacao/:id`)
- Webhook HTTP externo em eventos de ticket

### Etapa 3 - Console do agente (frontend)

- Login split-screen com vÃ­deo e identidade Bold
- Dashboard com mÃ©tricas derivadas, Ãºltimos eventos e chamados recentes
- Fila kanban (4 colunas, drag-and-drop, aÃ§Ã£o rÃ¡pida de status)
- Central de chamados (tabela desktop + cards mobile, filtros locais)
- Detalhe do chamado com timeline de interaÃ§Ãµes
- Base de clientes e abertura de chamado pelo agente
- IntegraÃ§Ã£o com API n8n real (clientes, tickets, status, interaÃ§Ãµes)
- Log de eventos derivados das mutaÃ§Ãµes + polling opcional webhook.site
- Layout responsivo (sidebar colapsÃ¡vel, mobile nav, notificaÃ§Ãµes)
- Tema claro/escuro

### Etapa 4 - AutenticaÃ§Ã£o JWT

- Login por agente (`POST /auth/login`)
- JWT HS256 validado no n8n em cada rota protegida
- SessÃ£o no frontend (`localStorage` / `sessionStorage`)
- Logout e redirect automÃ¡tico em token expirado

## Stack

| Camada | Tecnologia | Finalidade |
|--------|------------|------------|
| Backend | n8n (webhooks) | OrquestraÃ§Ã£o, validaÃ§Ã£o e resposta HTTP |
| Banco | PostgreSQL / Supabase | PersistÃªncia relacional |
| Frontend | React 19 + Vite 8 + Tailwind 4 + Framer Motion | Console do agente |
| Testes | Postman | ValidaÃ§Ã£o manual dos endpoints |

## PrÃ©-requisitos

- Node.js 20+ (frontend)
- Conta Supabase (ou PostgreSQL 14+)
- Acesso Ã  instÃ¢ncia n8n
- Postman (recomendado)

## Branches (entregas por etapa)

O desafio exige divisÃ£o clara das entregas no GitHub:

| Branch | Etapa | Status |
|--------|-------|--------|
| [`stage/01-core-api`](../../tree/stage/01-core-api) | CRUD bÃ¡sico (5 rotas) | ConcluÃ­da |
| [`stage/02-ticket-operations`](../../tree/stage/02-ticket-operations) | DELETE, PATCH, interaÃ§Ãµes, webhook | ConcluÃ­da |
| [`stage/03-frontend`](../../tree/stage/03-frontend) | Frontend React - console do agente | ConcluÃ­da |
| [`stage/04-authentication`](../../tree/stage/04-authentication) | AutenticaÃ§Ã£o JWT | ConcluÃ­da |
| `main` | Ãšltima etapa estÃ¡vel | Etapas 1, 2, 3 e 4 |

Detalhes e checklist: [**docs/entregas.md**](docs/entregas.md)

```bash
git checkout stage/01-core-api           # revisar sÃ³ a Etapa 1
git checkout stage/02-ticket-operations  # revisar Etapa 2
git checkout stage/03-frontend           # revisar Etapa 3
```

## InstalaÃ§Ã£o rÃ¡pida

```bash
# 1. Clonar
git clone <url-do-repositorio>
cd Bold-Support

# 2. VariÃ¡veis de ambiente (backend)
cp .env.example .env
# Editar .env com suas credenciais

# 3. Banco de dados
psql "$DATABASE_URL" -f database/migrations/001_initial_schema.sql
psql "$DATABASE_URL" -f database/migrations/002_agentes.sql
psql "$DATABASE_URL" -f database/migrations/003_app_config.sql

# 4. Importar workflows de n8n/workflows/ no n8n
# 5. Testar com Postman - ver docs/installation.md

# 6. Frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```

Guia completo: [**docs/installation.md**](docs/installation.md)

Deploy do backend (n8n no Railway): [**docs/deployment-backend.md**](docs/deployment-backend.md)

## VariÃ¡veis de ambiente

### Backend (raiz)

| VariÃ¡vel | DescriÃ§Ã£o |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `SUPABASE_URL` | URL do projeto Supabase |
| `N8N_WEBHOOK_BASE_URL` | Base URL dos webhooks n8n |
| `WEBHOOK_EXTERNO_URL` | URL do webhook mock (integraÃ§Ã£o externa) |

Detalhes em [`.env.example`](.env.example).

### Frontend (`frontend/.env`)

| VariÃ¡vel | DescriÃ§Ã£o |
|----------|-----------|
| `VITE_N8N_WEBHOOK_BASE_URL` | Base URL dos webhooks n8n (`/webhook` em dev com proxy Vite) |
| `VITE_WEBHOOK_SITE_TOKEN` | (Opcional) UUID do webhook.site para sincronizar `/eventos` |

Detalhes em [`frontend/.env.example`](frontend/.env.example).

## Estrutura do projeto

```
Bold-Support/
â”œâ”€â”€ database/migrations/       # Schema SQL
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ architecture.md        # Arquitetura e fluxos
â”‚   â”œâ”€â”€ api.md                 # Endpoints e exemplos
â”‚   â”œâ”€â”€ database.md            # Modelagem e ER
â”‚   â”œâ”€â”€ entregas.md            # Branches e checklist por etapa
â”‚   â”œâ”€â”€ installation.md        # Guia de instalaÃ§Ã£o
â”‚   â””â”€â”€ openapi.yaml           # Contrato OpenAPI 3
â”œâ”€â”€ frontend/                  # React + Vite (console do agente)
â”‚   â”œâ”€â”€ public/images/         # logobold.png, boldiconsidebar.png, boldfavicon.png
â”‚   â”œâ”€â”€ public/videos/         # boldsupport.mp4 (painel de login)
â”‚   â””â”€â”€ src/
â”‚       â”œâ”€â”€ pages/             # Dashboard, Fila, Chamados, Clientes, Eventos
â”‚       â”œâ”€â”€ components/        # layout, dashboard, queue, tickets, ui
â”‚       â””â”€â”€ lib/
â”‚           â”œâ”€â”€ store/         # AppDataContext (estado + API n8n)
â”‚           â”œâ”€â”€ api/           # client.ts, clientes.ts, tickets.ts
â”‚           â””â”€â”€ types/         # Cliente, Ticket, Evento
â”œâ”€â”€ n8n/workflows/             # Backend (10 workflows)
â”œâ”€â”€ postman/                   # Collections Etapa 1 e 2 + environment
â””â”€â”€ .env.example
```

## Frontend (Etapa 3)

Console do agente Bold - login em `/`, dashboard em `/dashboard`. Consumo da API n8n via proxy Vite em desenvolvimento (`/webhook` â†’ `dev.boldsolution.com.br`).

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

DocumentaÃ§Ã£o detalhada: [**frontend/README.md**](frontend/README.md)

Assets: favicon `boldfavicon.png` | sidebar `boldiconsidebar.png` | login `logobold.png` | vÃ­deo `boldsupport.mp4`

## Arquitetura

Backend: cada rota HTTP Ã© um workflow n8n (**Webhook â†’ validaÃ§Ã£o â†’ Postgres â†’ Respond**).

Frontend: SPA React com `AppDataContext` consumindo webhooks n8n via `lib/api/`.

```mermaid
flowchart LR
  Browser[Navegador React]
  Ctx[AppDataContext]
  N8N[n8n Webhooks]
  DB[(PostgreSQL)]

  Browser --> Ctx
  Ctx -->|HTTP /webhook| N8N
  N8N --> DB
```

Detalhes: [**docs/architecture.md**](docs/architecture.md)

## API

| MÃ©todo | Rota lÃ³gica | Workflow |
|--------|-------------|----------|
| GET | `/clientes` | `GET_Clientes.json` |
| POST | `/clientes` | `POST_Clientes.json` |
| GET | `/clientes/id/:id` | `GET_Cliente_por_ID.json` |
| DELETE | `/clientes/remover/:id` | `DELETE_Cliente_por_ID.json` |
| POST | `/tickets/criar` | `POST_Tickets.json` |
| GET | `/tickets/listar` | `GET_Tickets.json` |
| GET | `/tickets/id/:id` | `GET_Ticket_por_ID.json` |
| DELETE | `/tickets/remover/:id` | `DELETE_Ticket_por_ID.json` |
| PATCH | `/tickets/atualizar-status/:id` | `PATCH_Ticket_Status.json` |
| POST | `/tickets/adicionar-interacao/:id` | `POST_Ticket_Interacao.json` |

> URLs de produÃ§Ã£o na instÃ¢ncia Bold podem incluir `webhookId` no path - ver tabela completa em [docs/api.md](docs/api.md).

DocumentaÃ§Ã£o completa: [**docs/api.md**](docs/api.md) | OpenAPI: [**docs/openapi.yaml**](docs/openapi.yaml)

## Banco de dados

TrÃªs tabelas: `clientes`, `tickets`, `interacoes`.

Diagrama ER, Ã­ndices e constraints: [**docs/database.md**](docs/database.md)

## Tratamento de erros

Respostas de erro no formato `{ "erro": "...", "codigo": "..." }` com HTTP 400 (validaÃ§Ã£o) ou 404 (recurso nÃ£o encontrado). CÃ³digos documentados em [docs/api.md](docs/api.md).

## AutenticaÃ§Ã£o

JWT (Etapa 4). Login em `POST /auth/login` com email e senha; rotas protegidas exigem `Authorization: Bearer <token>`. Detalhes em [docs/api.md](docs/api.md) e [docs/installation.md](docs/installation.md).

## LimitaÃ§Ãµes conhecidas

- URLs n8n misturam path simples e path com `webhookId`, copiar Production URL de cada workflow.
- Paths da Etapa 2 usam prefixos Ãºnicos (`remover`, `atualizar-status`, `adicionar-interacao`), exigÃªncia do n8n hospedado.
- Webhook externo usa URL configurÃ¡vel; falha nÃ£o bloqueia a API (`continueOnFail`).
- Sem portal self-service do cliente, o produto Ã© console do agente Bold.
