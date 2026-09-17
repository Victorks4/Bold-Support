# n8n para Railway - Bold Support
# Docker Hub evita rate limit (429) do registry docker.n8n.io no Railway
FROM n8nio/n8n:1.70.1

# Porta fixa: no Railway use Generate Domain com porta 5678
ENV N8N_PORT=5678
ENV N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true

EXPOSE 5678
