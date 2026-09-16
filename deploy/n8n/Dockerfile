# n8n para Railway - Bold Support
# Versao fixada para evitar surpresas na apresentacao.
# Docker Hub evita rate limit (429) do registry docker.n8n.io no Railway
FROM n8nio/n8n:1.70.1

EXPOSE 5678

# Railway injeta PORT em runtime; n8n so le N8N_PORT.
# Evita "n8n ready on port 0" quando N8N_PORT=${{PORT}} nao resolve no painel.
CMD ["sh", "-c", "N8N_PORT=${PORT:-5678} exec n8n start"]
