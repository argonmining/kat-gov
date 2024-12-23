import crypto from 'crypto';
import { createModuleLogger } from './logger.js';
import { config } from '../config/env.js';

const logger = createModuleLogger('encryptionUtils');

const algorithm = 'aes-256-cbc';
const key = Buffer.from(config.security.encryptionKey!, 'utf-8');

export function encryptPrivateKey(privateKey: string): string {
  try {
    logger.debug('Encrypting private key');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    logger.debug('Private key encrypted successfully');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    logger.error({ error }, 'Error encrypting private key');
    throw error;
  }
}

export function decryptPrivateKey(encryptedData: string): string {
  try {
    logger.debug('Decrypting private key');
    const [ivHex, encryptedHex] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    logger.debug('Private key decrypted successfully');
    return decrypted;
  } catch (error) {
    logger.error({ error }, 'Error decrypting private key');
    throw error;
  }
}
