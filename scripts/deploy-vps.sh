#!/usr/bin/env bash
#
# Deploy Unistays no VPS (aaPanel + PM2 + Nginx)
# Uso: bash /www/wwwroot/unistays/scripts/deploy-vps.sh
#
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/www/wwwroot/unistays}"
GIT_BRANCH="${GIT_BRANCH:-main}"
PM2_NAME="${PM2_NAME:-Unistays}"
LOG_FILE="${LOG_FILE:-/www/wwwlogs/unistays-deploy.log}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

fail() {
  log "ERRO: $*"
  exit 1
}

log "========== Início do deploy =========="
log "Projeto: $PROJECT_DIR | Branch: $GIT_BRANCH | PM2: $PM2_NAME"

[[ -d "$PROJECT_DIR" ]] || fail "Pasta não encontrada: $PROJECT_DIR"
cd "$PROJECT_DIR"

# ---------------------------------------------------------------------------
# Git — alinha com o GitHub (ignora diffs de permissão/line-ending no VPS)
# Pastas de banco/SQL não vão pro GitHub — preservar no VPS antes do reset
# ---------------------------------------------------------------------------
DB_BACKUP=""
backup_db_dirs() {
  DB_BACKUP="$(mktemp -d /tmp/unistays-db-backup.XXXXXX)"
  for rel in backend/database backend/src/database backend/sql backend/migrations; do
    if [[ -d "$rel" ]]; then
      mkdir -p "$DB_BACKUP/$(dirname "$rel")"
      cp -a "$rel" "$DB_BACKUP/$rel"
    fi
  done
  log "Backup local de pastas database/sql: $DB_BACKUP"
}

restore_db_dirs() {
  [[ -n "$DB_BACKUP" && -d "$DB_BACKUP" ]] || return 0
  for rel in backend/database backend/src/database backend/sql backend/migrations; do
    if [[ -d "$DB_BACKUP/$rel" ]]; then
      mkdir -p "$(dirname "$rel")"
      cp -a "$DB_BACKUP/$rel" "$rel"
    fi
  done
  rm -rf "$DB_BACKUP"
  DB_BACKUP=""
  log "Pastas database/sql restauradas após git pull"
}

if [[ -d .git ]]; then
  git config core.fileMode false
  backup_db_dirs
  git fetch origin "$GIT_BRANCH"
  git reset --hard "origin/$GIT_BRANCH"
  restore_db_dirs
  log "Git atualizado: $(git rev-parse --short HEAD)"
else
  log "AVISO: .git não encontrado — pulando atualização Git"
fi

# ---------------------------------------------------------------------------
# Frontend — Vite/React
# ---------------------------------------------------------------------------
if [[ ! -f .env.production ]]; then
  echo "VITE_API_URL=/api/v1" > .env.production
  log "Criado .env.production com VITE_API_URL=/api/v1"
fi

log "Build frontend..."
npm install
npm run build
[[ -f dist/index.html ]] || fail "Frontend: dist/index.html não gerado"

# ---------------------------------------------------------------------------
# Backend — Express/TypeORM
# ---------------------------------------------------------------------------
[[ -d backend ]] || fail "Pasta backend/ não encontrada"

if [[ ! -f backend/.env ]]; then
  fail "backend/.env não existe. Crie manualmente no VPS (não vai pelo Git)."
fi

log "Build backend..."
cd backend
npm install
npm run build
[[ -f dist/server.js ]] || fail "Backend: dist/server.js não gerado"
cd "$PROJECT_DIR"

# ---------------------------------------------------------------------------
# PM2 — reinicia API na porta 3020
# ---------------------------------------------------------------------------
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_NAME"
  log "PM2 reiniciado: $PM2_NAME"
else
  cd backend
  pm2 start npm --name "$PM2_NAME" -- run start
  pm2 save
  cd "$PROJECT_DIR"
  log "PM2 iniciado: $PM2_NAME"
fi

# ---------------------------------------------------------------------------
# Verificação rápida
# ---------------------------------------------------------------------------
sleep 2
if curl -sf "http://127.0.0.1:3020/health" >/dev/null; then
  log "Health check OK: http://127.0.0.1:3020/health"
else
  log "AVISO: health check falhou — veja: pm2 logs $PM2_NAME --lines 30"
fi

log "========== Deploy concluído =========="
