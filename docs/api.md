# API — Bold Support (Etapa 1)

Backend em **n8n**. Base URL de teste (confirmada em `docs/openapi.yaml` e `.env.example`):

```
https://dev.boldsolution.com.br/webhook-test
```

Autenticação: **não implementada** na Etapa 1.

Contrato OpenAPI: [`openapi.yaml`](openapi.yaml)

## Formato de erro

Todas as respostas de erro seguem:

```json
{
  "erro": "Mensagem legível",
  "codigo": "CODIGO_CONSTANTE"
}
```

---

## Clientes

### POST /clientes

**Workflow:** `POST_Clientes.json`

Cadastra um novo cliente.

**Body (JSON):**

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "telefone": "11999998888"
}
```

| Campo | Obrigatório | Regras |
|-------|-------------|--------|
| `nome` | Sim | 1–150 caracteres |
| `email` | Sim | Formato e-mail válido |
| `telefone` | Sim | Não vazio |

**201 — Sucesso:**

```json
{
  "id": "uuid",
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "telefone": "11999998888",
  "criado_em": "2026-09-10T12:00:00.000Z"
}
```

**400 — Erros:**

| codigo | Condição |
|--------|----------|
| `NOME_INVALIDO` | Nome ausente ou > 150 chars |
| `EMAIL_INVALIDO` | E-mail inválido |
| `TELEFONE_OBRIGATORIO` | Telefone ausente |

---

### GET /clientes/:id

**Workflow:** `GET_Cliente_por_ID.json`

Retorna dados de um cliente pelo UUID.

**Exemplo:** `GET /clientes/18695f4c-43be-4646-83dd-98c55ca9c90f`

**200 — Sucesso:** objeto `Cliente` (mesmos campos do POST).

**400:** `ID_INVALIDO` — UUID malformado.

**404:** `CLIENTE_NAO_ENCONTRADO` — UUID válido, cliente inexistente.

---

## Tickets

### POST /tickets

**Workflow:** `POST_Tickets.json`

Cria ticket vinculado a um cliente. Gera protocolo `TKT-YYYYMMDD-XXXX`, status `aberto` e uma interação automática do tipo `sistema`.

**Body (JSON):**

```json
{
  "cliente_id": "uuid-do-cliente",
  "titulo": "Erro no login",
  "descricao": "Não consigo acessar o sistema",
  "prioridade": "alta"
}
```

| Campo | Obrigatório | Regras |
|-------|-------------|--------|
| `cliente_id` | Sim | UUID válido |
| `titulo` | Sim | 1–200 caracteres |
| `descricao` | Sim | Não vazio |
| `prioridade` | Não | `baixa`, `media`, `alta` (default: `media`) |

**201 — Sucesso:** objeto ticket completo (`id`, `protocolo`, `cliente_id`, `titulo`, `descricao`, `prioridade`, `status`, `criado_em`, `atualizado_em`).

**400 — Erros:**

| codigo | Condição |
|--------|----------|
| `CLIENTE_ID_INVALIDO` | UUID inválido |
| `TITULO_INVALIDO` | Título ausente ou > 200 chars |
| `DESCRICAO_OBRIGATORIA` | Descrição vazia |
| `PRIORIDADE_INVALIDA` | Valor fora do enum |

**404:** `CLIENTE_NAO_ENCONTRADO` — cliente_id não existe no banco.

---

### GET /tickets

**Workflow:** `GET_Tickets.json`

Lista tickets com **ao menos um** filtro na query string.

**Exemplos:**

```
GET /tickets?status=aberto
GET /tickets?prioridade=alta
GET /tickets?status=aberto&prioridade=alta
```

| Query | Valores |
|-------|---------|
| `status` | `aberto`, `em_atendimento`, `aguardando_cliente`, `resolvido`, `cancelado` |
| `prioridade` | `baixa`, `media`, `alta` |

**200 — Sucesso:**

```json
{
  "total": 1,
  "filtros": { "status": "aberto", "prioridade": null },
  "tickets": [
    {
      "id": "uuid",
      "protocolo": "TKT-20260910-XXXX",
      "cliente_id": "uuid",
      "titulo": "Erro no login",
      "descricao": "...",
      "prioridade": "alta",
      "status": "aberto",
      "criado_em": "...",
      "atualizado_em": "..."
    }
  ]
}
```

**400 — Erros:**

| codigo | Condição |
|--------|----------|
| `FILTRO_OBRIGATORIO` | Sem `status` nem `prioridade` |
| `STATUS_INVALIDO` | Status fora do enum |
| `PRIORIDADE_INVALIDA` | Prioridade fora do enum |

---

### GET /tickets/:id

**Workflow:** `GET_Ticket_por_ID.json`

Retorna ticket com array `interacoes` ordenado por `criado_em` ASC.

**200 — Sucesso:**

```json
{
  "id": "uuid",
  "protocolo": "TKT-20260910-XXXX",
  "cliente_id": "uuid",
  "titulo": "Erro no login",
  "descricao": "...",
  "prioridade": "alta",
  "status": "aberto",
  "criado_em": "...",
  "atualizado_em": "...",
  "interacoes": [
    {
      "id": "uuid",
      "ticket_id": "uuid",
      "tipo": "sistema",
      "mensagem": "Ticket aberto automaticamente pelo sistema.",
      "criado_em": "..."
    }
  ]
}
```

**400:** `ID_INVALIDO`

**404:** `TICKET_NAO_ENCONTRADO`

---

## Testes com Postman

Arquivos em `postman/`:

- `Bold-Support.postman_collection.json`
- `Bold-Support.postman_environment.json`

No n8n, antes de cada request em modo teste: **Webhook → Listen for test event**.

Variável `base_url` no environment: `https://dev.boldsolution.com.br/webhook-test`
