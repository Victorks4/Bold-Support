# Testes automatizados - Bold Support

O projeto usa duas camadas de testes:

| Camada | Ferramenta | Escopo |
|--------|------------|--------|
| Frontend | Vitest + Testing Library | Utils, API client, auth, componentes |
| API | Newman (Postman CLI) | Integração com webhooks n8n em produção |

## Pré-requisitos

- Node.js 20+
- `npm install` na raiz e em `frontend/`
- Workflows **ativos** no n8n (`/webhook`, instância Bold)
- Rede para testes de API

## Comandos

```bash
npm install
cd frontend && npm install && cd ..

npm test
npm run test:frontend
npm run test:api

cd frontend && npm test
cd frontend && npm run test:coverage
```

## Variáveis de ambiente (API)

```bash
cp .env.test.example .env.test
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `API_BASE_URL` | Sim | Base dos webhooks (`https://dev.boldsolution.com.br/webhook`) |
| `TEST_AGENT_EMAIL` | Sim | Agente seed (`agente@bold.com`) |
| `TEST_AGENT_PASSWORD` | Sim | Senha do agente (`Bold@2026`) |

`access_token`, `cliente_id` e `ticket_id` são gerados automaticamente durante a execução.

### O que NÃO precisa no `.env.test`

| Variável | Motivo |
|----------|--------|
| `DATABASE_URL` / `SUPABASE_URL` | Testes passam pelo n8n |
| `jwt_secret` | Lido pelo n8n via `app_config` |
| `VITE_*` | Só para build/dev do frontend |

## Estrutura

```
frontend/src/
├── lib/utils/*.test.ts
├── lib/api/client.test.ts
├── lib/auth/token-storage.test.ts
└── components/**/*.test.tsx

postman/
scripts/run-api-tests.mjs
```

## Ordem dos testes de API

1. **Etapa 4** — login JWT
2. **Etapa 1** — CRUD (salva IDs)
3. **Etapa 2** — PATCH, interação, DELETE

## Limitações

- Testes de API criam dados reais no Supabase
- Etapa 2 remove ticket/cliente criados na Etapa 1
- Dependem da instância n8n da Bold estar online
