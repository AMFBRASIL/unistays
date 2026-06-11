#!/usr/bin/env bash
#
# Verifica se há commit novo no GitHub e roda deploy-vps.sh só se mudou.
# Ideal para Cron do aaPanel (a cada 2–5 minutos).
#
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/www/wwwroot/unistays}"
GIT_BRANCH="${GIT_BRANCH:-main}"

cd "$PROJECT_DIR" || exit 1

if [[ ! -d .git ]]; then
  echo "[deploy-if-changed] .git não encontrado em $PROJECT_DIR"
  exit 1
fi

git config core.fileMode false
git fetch origin "$GIT_BRANCH" --quiet 2>/dev/null || {
  echo "[deploy-if-changed] git fetch falhou — verifique remote/token"
  exit 1
}

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$GIT_BRANCH")

if [[ "$LOCAL" == "$REMOTE" ]]; then
  exit 0
fi

echo "[deploy-if-changed] Novo commit detectado: $LOCAL -> $REMOTE"
exec bash "$PROJECT_DIR/scripts/deploy-vps.sh"
