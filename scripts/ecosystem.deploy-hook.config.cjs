const fs = require("fs");
const path = require("path");

const projectDir = "/www/wwwroot/unistays";
const envFile = path.join(projectDir, "scripts/.deploy-webhook.env");
const env = {
  UNISTAYS_DEPLOY_HOST: "127.0.0.1",
  UNISTAYS_DEPLOY_PORT: "9876",
  UNISTAYS_DEPLOY_SCRIPT: path.join(projectDir, "scripts/deploy-vps.sh"),
  UNISTAYS_DEPLOY_LOG: "/www/wwwlogs/unistays-webhook.log",
};

if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
}

module.exports = {
  apps: [
    {
      name: "unistays-deploy-hook",
      script: path.join(projectDir, "scripts/github-webhook-deploy.py"),
      interpreter: "python3",
      cwd: projectDir,
      autorestart: true,
      max_memory_restart: "128M",
      env,
    },
  ],
};
