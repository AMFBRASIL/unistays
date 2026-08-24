import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3020'),
  API_VERSION: process.env.API_VERSION || 'v1',

  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '3306'),
  DB_USERNAME: process.env.DB_USERNAME || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_DATABASE: process.env.DB_DATABASE || 'unistays',
  DB_SYNCHRONIZE: process.env.DB_SYNCHRONIZE === 'true',
  DB_LOGGING: process.env.DB_LOGGING === 'true',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  /** URL pública do frontend (ex.: https://app.seudominio.com) — usada no link do e-mail de redefinição de senha do hóspede */
  FRONTEND_PUBLIC_URL: (process.env.FRONTEND_PUBLIC_URL || process.env.VITE_APP_URL || 'http://localhost:5173').replace(/\/$/, ''),

  /**
   * URL pública da API (ex.: https://unistays.com.br ou http://localhost:3020).
   * Usada para registrar webhooks Channex → Unistays. Em local, use ngrok/túnel.
   */
  API_PUBLIC_URL: (process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || '3020'}`).replace(/\/$/, ''),

  // Email
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@unistays.com',

  // File Upload
  UPLOAD_MAX_SIZE: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760'),
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5000'), // 5000 requests per window

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || './logs/app.log',

  /**
   * Efí Pay (Gerencianet) — PIX
   * @see backend/.env.example
   */
  EFI_GN_ENABLED: process.env.EFI_GN_ENABLED === 'true',
  /** Homologação quando true; produção: defina EFI_GN_SANDBOX=false */
  EFI_GN_SANDBOX: process.env.EFI_GN_SANDBOX !== 'false',
  EFI_GN_CLIENT_ID: process.env.EFI_GN_CLIENT_ID || '',
  EFI_GN_CLIENT_SECRET: process.env.EFI_GN_CLIENT_SECRET || '',
  /** Chave PIX cadastrada na conta Efí */
  EFI_GN_PIX_KEY: process.env.EFI_GN_PIX_KEY || '',
  /** Caminho do .p12 relativo ao cwd do backend ou absoluto */
  EFI_GN_CERTIFICATE_PATH: process.env.EFI_GN_CERTIFICATE_PATH || '',
  /** Alternativa ao arquivo: certificado .p12 em Base64 (uma linha) */
  EFI_GN_CERTIFICATE_BASE64: process.env.EFI_GN_CERTIFICATE_BASE64 || '',
  EFI_GN_CHARGE_EXPIRATION_SECONDS: Math.min(
    86400,
    Math.max(60, parseInt(process.env.EFI_GN_CHARGE_EXPIRATION_SECONDS || '3600', 10) || 3600)
  ),
};
