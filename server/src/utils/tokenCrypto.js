import crypto from 'crypto';

function key() {
  return crypto.createHash('sha256').update(process.env.JWT_SECRET || 'issuepilot-dev').digest();
}

export function encryptToken(token) {
  if (!token) return undefined;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':');
}

export function decryptToken(payload) {
  if (!payload) return undefined;
  const [ivHex, tagHex, encryptedHex] = payload.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final()
  ]).toString('utf8');
}
