-- Bold Support — agentes (autenticação Etapa 4)
-- Requer extensão pgcrypto (criada em 001_initial_schema.sql)

CREATE TABLE IF NOT EXISTS agentes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        VARCHAR(150) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  senha_hash  TEXT         NOT NULL,
  criado_em   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT agentes_email_unique UNIQUE (email)
);

-- Agente de teste (desenvolvimento). Senha documentada em docs/installation.md
INSERT INTO agentes (nome, email, senha_hash)
VALUES ('Agente Teste', 'agente@bold.com', crypt('Bold@2026', gen_salt('bf')))
ON CONFLICT (email) DO NOTHING;
