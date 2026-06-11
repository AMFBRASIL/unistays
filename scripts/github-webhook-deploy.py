#!/usr/bin/env python3
"""
Webhook local para deploy automático (alternativa ao Git Manager do aaPanel).

Uso no VPS:
  export UNISTAYS_DEPLOY_SECRET="sua-chave-secreta-longa"
  python3 /www/wwwroot/unistays/scripts/github-webhook-deploy.py

Ou com PM2:
  pm2 start scripts/github-webhook-deploy.py --name unistays-deploy-hook --interpreter python3

GitHub → Webhooks → Payload URL:
  https://unistays.com.br/deploy-hook?token=SUA_CHAVE_SECRETA
  Event: push
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

SECRET = os.environ.get("UNISTAYS_DEPLOY_SECRET", "")
DEPLOY_SCRIPT = os.environ.get(
    "UNISTAYS_DEPLOY_SCRIPT", "/www/wwwroot/unistays/scripts/deploy-vps.sh"
)
HOST = os.environ.get("UNISTAYS_DEPLOY_HOST", "127.0.0.1")
PORT = int(os.environ.get("UNISTAYS_DEPLOY_PORT", "9876"))
LOG_FILE = os.environ.get("UNISTAYS_DEPLOY_LOG", "/www/wwwlogs/unistays-webhook.log")


def log(message: str) -> None:
    line = f"[webhook] {message}\n"
    sys.stderr.write(line)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as handle:
            handle.write(line)
    except OSError:
        pass


class DeployHandler(BaseHTTPRequestHandler):
    def _token_ok(self) -> bool:
        if not SECRET:
            return False
        header_token = self.headers.get("X-Deploy-Token", "")
        if header_token == SECRET:
            return True
        from urllib.parse import parse_qs, urlparse

        query = parse_qs(urlparse(self.path).query)
        query_token = (query.get("token") or [""])[0]
        return query_token == SECRET

    def _unauthorized(self) -> None:
        self.send_response(403)
        self.end_headers()
        self.wfile.write(b"Forbidden")

    def _accepted(self) -> None:
        self.send_response(202)
        self.end_headers()
        self.wfile.write(b"Deploy started")

    def do_POST(self) -> None:
        if not SECRET:
            log("UNISTAYS_DEPLOY_SECRET não configurado")
            self._unauthorized()
            return

        if not self._token_ok():
            log("Token inválido")
            self._unauthorized()
            return

        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length) if length else b"{}"

        try:
            payload = json.loads(body.decode("utf-8") or "{}")
            ref = payload.get("ref", "")
            if ref and ref != "refs/heads/main":
                log(f"Ignorado (branch): {ref}")
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b"Ignored branch")
                return
        except json.JSONDecodeError:
            pass

        log("Iniciando deploy...")
        with open("/www/wwwlogs/unistays-deploy.log", "a", encoding="utf-8") as deploy_log:
            deploy_log.write(f"\n[webhook] Deploy disparado em {self.headers.get('X-Github-Event', 'push')}\n")
        subprocess.Popen(
            ["bash", DEPLOY_SCRIPT],
            stdout=open("/www/wwwlogs/unistays-deploy.log", "a"),
            stderr=subprocess.STDOUT,
            start_new_session=True,
        )
        self._accepted()

    def do_GET(self) -> None:
        if self._token_ok():
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"Webhook OK")
            return
        self._unauthorized()

    def log_message(self, format: str, *args) -> None:
        return


def main() -> None:
    if not SECRET:
        print("Defina UNISTAYS_DEPLOY_SECRET antes de iniciar.", file=sys.stderr)
        sys.exit(1)

    server = HTTPServer((HOST, PORT), DeployHandler)
    log(f"Escutando em http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
