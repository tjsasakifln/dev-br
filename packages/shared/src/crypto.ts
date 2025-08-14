// Cryptographic utilities
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export function encryptSecret(secret: string, key: string = process.env.ENCRYPTION_KEY || 'default-key'): string {
  try {
    const algorithm = 'aes-256-cbc';
    const iv = randomBytes(16);
    const keyHash = createHash('sha256').update(key).digest();
    const cipher = createCipheriv(algorithm, keyHash, iv);
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    return secret;
  }
}

export function decryptSecret(encryptedSecret: string, key: string = process.env.ENCRYPTION_KEY || 'default-key'): string {
  try {
    const algorithm = 'aes-256-cbc';
    const [ivHex, encrypted] = encryptedSecret.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const keyHash = createHash('sha256').update(key).digest();
    const decipher = createDecipheriv(algorithm, keyHash, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedSecret;
  }
}

export function hashString(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}