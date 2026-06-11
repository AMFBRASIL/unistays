#!/usr/bin/env bash
#
# Instala deploy automático no push (webhook GitHub → VPS).
# Uso no VPS:
#   bash /www/wwwroot/unistays/scripts/setup-webhook-vps.sh
#   bash /www/wwwroot/unistays/scripts/setup-webhook-vps.sh minha-chave-secreta
#
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/www/wwwroot/unistays}"
DOMAIN="${DEPLOY_DOMAIN:-unistays.com.br}"
ENV_FILE="$PROJECT_DIR/scripts/.deploy-webhook.env"
NGINX_SNIPPET="$PROJECT_DIR/scripts/nginx-deploy-hook.conf"

cd "$PROJECT_DIR"

if [[ ! -d .git ]]; then
  echo "ERRO: repositório não encontrado em $PROJECT_DIR"
  exit 1
fi

chmod +x scripts/deploy-vps.sh scripts/github-webhook-deploy.py 2>/dev/null || true

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  SECRET="${UNISTAYS_DEPLOY_SECRET:-}"
fi

if [[ -n "${1:-}" ]]; then
  SECRET="$1"
elif [[ -z "${SECRET:-}" ]]; then
  SECRET="$(openssl rand -hex 32)"
fi

cat > "$ENV_FILE" <<EOF
UNISTAYS_DEPLOY_SECRET=$SECRET
EOF
chmod 600 "$ENV_FILE"

cat > "$NGINX_SNIPPET" <<'EOF'
# Cole dentro do server { } do site unistays.com.br (ANTES de location /)
location = /deploy-hook {
    proxy_pass http://127.0.0.1:9876;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
EOF

pm2 delete unistays-deploy-hook >/dev/null 2>&1 || true
pm2 start "$PROJECT_DIR/scripts/ecosystem.deploy-hook.config.cjs"
pm2 save

WEBHOOK_URL="https://${DOMAIN}/deploy-hook?token=${SECRET}"

echo ""
echo "=========================================="
echo " Webhook de deploy instalado com sucesso"
echo "=========================================="
echo ""
echo "1) Nginx — adicione o bloco abaixo no site ${DOMAIN}:"
echo "   Arquivo de referência: $NGINX_SNIPPET"
echo ""
cat "$NGINX_SNIPPET"
echo ""
echo "   Depois: nginx -t && nginx -s reload"
echo ""
echo "2) GitHub → Settings → Webhooks → Add webhook"
echo "   Payload URL: $WEBHOOK_URL"
echo "   Content type: application/json"
echo "   Events: Just the push event"
echo ""
echo "3) Teste manual:"
echo "   curl -X POST \"$WEBHOOK_URL\""
echo ""
echo "4) Logs:"
echo "   tail -f /www/wwwlogs/unistays-webhook.log"
echo "   tail -f /www/wwwlogs/unistays-deploy.log"
echo ""
echo "Guarde o token em local seguro (também em $ENV_FILE)"
echo "=========================================="
