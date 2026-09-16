-- Bold Support - configuração da aplicação (Etapa 4)
-- Usado pelos workflows n8n para JWT quando não há $env/$vars 

CREATE TABLE IF NOT EXISTS app_config (
  chave         VARCHAR(100) PRIMARY KEY,
  valor         TEXT         NOT NULL,
  atualizado_em TIMESTAMPTZ  NOT NULL DEFAULT now()
);

INSERT INTO app_config (chave, valor)
VALUES
  ('jwt_secret', 'bold-support-jwt-CHAVE-QUE-VOU-ATUALIZAR'),
  ('jwt_expires_in', '3600')
ON CONFLICT (chave) DO NOTHING;
