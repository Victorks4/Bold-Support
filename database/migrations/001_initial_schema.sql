-- Bold Support — schema inicial
-- Etapa 1: clientes, tickets e interacoes

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE clientes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        VARCHAR(150) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  telefone    VARCHAR(20)  NOT NULL,
  criado_em   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT clientes_email_unique UNIQUE (email)
);

CREATE TABLE tickets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo     VARCHAR(30)  NOT NULL,
  cliente_id    UUID         NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  titulo        VARCHAR(200) NOT NULL,
  descricao     TEXT         NOT NULL,
  prioridade    VARCHAR(20)  NOT NULL DEFAULT 'media',
  status        VARCHAR(30)  NOT NULL DEFAULT 'aberto',
  criado_em     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT tickets_protocolo_unique UNIQUE (protocolo),
  CONSTRAINT tickets_prioridade_check CHECK (prioridade IN ('baixa', 'media', 'alta')),
  CONSTRAINT tickets_status_check CHECK (status IN (
    'aberto', 'em_atendimento', 'aguardando_cliente', 'resolvido', 'cancelado'
  ))
);

CREATE TABLE interacoes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id  UUID        NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  tipo       VARCHAR(30) NOT NULL DEFAULT 'sistema',
  mensagem   TEXT        NOT NULL,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT interacoes_tipo_check CHECK (tipo IN ('sistema', 'cliente', 'agente'))
);

CREATE INDEX idx_tickets_cliente_id ON tickets(cliente_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_prioridade ON tickets(prioridade);
CREATE INDEX idx_interacoes_ticket_id ON interacoes(ticket_id);
