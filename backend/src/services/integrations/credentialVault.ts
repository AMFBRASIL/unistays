import crypto from 'crypto';
import { env } from '@/config/env';

/**
 * Lightweight credential vault for integration tokens.
 * Not a substitute for KMS — rotate JWT_SECRET carefully in production.
 */
export function encryptCredentials(payload: Record<string, string>): string {
  const key = crypto.createHash('sha256').update(env.JWT_SECRET).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const json = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptCredentials(blob: string | null | undefined): Record<string, string> {
  if (!blob) return {};
  try {
    const buf = Buffer.from(blob, 'base64');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const key = crypto.createHash('sha256').update(env.JWT_SECRET).digest();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const json = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}
