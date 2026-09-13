# Entregas por etapa — Bold Support

Este documento descreve a divisão de branches no GitHub conforme solicitado no desafio técnico Bold Solution.

## Convenção de nomenclatura

Padrão: `stage/<número>-<descrição>` — prefixo `stage/` agrupa entregas, número com zero à esquerda garante ordenação, nome em kebab-case descreve o escopo.

## Estratégia de branches

| Branch | Etapa | Conteúdo | Status |
|--------|-------|----------|--------|
| `main` | — | Última etapa estável entregue | Etapa 1 concluída |
| `stage/01-core-api` | 1 | Snapshot congelado — CRUD básico (5 rotas) | Concluída |
| `stage/02-ticket-operations` | 2 | DELETE, PATCH status, interações, webhook externo | Em desenvolvimento |
| `stage/03-frontend` | 3 | Frontend React + Vite | Pendente |
| `stage/04-authentication` | 4 | Autenticação JWT/OAuth | Pendente |

### Fluxo de trabalho

```mermaid
gitGraph
  commit id: "core-api"
  branch stage01
  checkout main
  commit id: "docs/branches"
  branch stage02
  checkout stage02
  commit id: "ticket-ops WIP"
  checkout main
  merge stage02 id: "merge stage-02"
```

1. Desenvolver na branch da etapa atual (`stage/02-ticket-operations`).
2. Ao concluir a etapa: merge em `main`, atualizar este documento e congelar snapshot (`git branch -f stage/0N-...`).
3. Avaliadores podem fazer checkout da branch específica para revisar apenas aquela entrega.

### Comandos úteis

```bash
# Ver todas as branches
git branch -a

# Revisar só a Etapa 1
git checkout stage/01-core-api

# Continuar desenvolvimento (Etapa 2)
git checkout stage/02-ticket-operations
```

## Etapa 1 — Concluída

**Branch:** `stage/01-core-api`

| Método | Rota | Workflow |
|--------|------|----------|
| POST | `/clientes` | `POST_Clientes.json` |
| GET | `/clientes/:id` | `GET_Cliente_por_ID.json` |
| POST | `/tickets` | `POST_Tickets.json` |
| GET | `/tickets` | `GET_Tickets.json` |
| GET | `/tickets/:id` | `GET_Ticket_por_ID.json` |

## Etapa 2 — Em desenvolvimento

**Branch:** `stage/02-ticket-operations`

| Método | Rota | Workflow (a criar) | Status |
|--------|------|-------------------|--------|
| DELETE | `/clientes/:id` | `DELETE_Cliente_por_ID.json` | Pendente |
| DELETE | `/tickets/:id` | `DELETE_Ticket_por_ID.json` | Pendente |
| PATCH | `/tickets/:id/status` | `PATCH_Ticket_Status.json` | Pendente |
| POST | `/tickets/:id/interacoes` | `POST_Ticket_Interacao.json` | Pendente |
| — | Webhook HTTP externo | `WEBHOOK_Ticket_Evento.json` | Pendente |

### Checklist Etapa 2

- [ ] DELETE cliente (tratar `RESTRICT` se cliente tem tickets)
- [ ] DELETE ticket (CASCADE remove interações)
- [ ] PATCH status com validação de enum e `atualizado_em`
- [ ] POST interação com tipos `cliente` / `agente` / `sistema`
- [ ] Disparo HTTP externo em eventos de ticket (protocolo, evento, status)
- [ ] Exportar JSONs em `n8n/workflows/`
- [ ] Atualizar `docs/api.md`, `docs/openapi.yaml` e `README.md`
- [ ] Testar com Postman (Listen for test event)

## Etapa 3 — Pendente

**Branch:** `stage/03-frontend` — React + Vite consumindo a API n8n.

## Etapa 4 — Pendente

**Branch:** `stage/04-authentication` — Autenticação entre frontend e backend.
