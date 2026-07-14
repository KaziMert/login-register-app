import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export interface EncryptedPrivateKey {
  salt: string;
  iv: string;
  authTag: string;
  data: string;
}

export interface EncryptedMessage {
  encryptedKey: string;
  iv: string;
  authTag: string;
  data: string;
}

@Injectable()
export class CryptoService {
  generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return { publicKey, privateKey };
  }

  encryptPrivateKey(privateKey: string, password: string): EncryptedPrivateKey {
    const salt = crypto.randomBytes(16);
    const derivedKey = crypto.scryptSync(password, salt, 32);
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(privateKey, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return {
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      data: encrypted.toString('hex'),
    };
  }

  decryptPrivateKey(encrypted: EncryptedPrivateKey, password: string): string {
    const salt = Buffer.from(encrypted.salt, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 32);
    const iv = Buffer.from(encrypted.iv, 'hex');
    const authTag = Buffer.from(encrypted.authTag, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted.data, 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  // Mesajı, alıcının PUBLIC KEY'i ile şifreler (hibrit yöntem)
  encryptMessage(message: string, publicKey: string): EncryptedMessage {
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(message, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // AES anahtarını, alıcının public key'i ile şifrele
    const encryptedKey = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      aesKey,
    );

    return {
      encryptedKey: encryptedKey.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      data: encrypted.toString('hex'),
    };
  }

  // Mesajı, alıcının PRIVATE KEY'i ile çözer
  decryptMessage(encrypted: EncryptedMessage, privateKey: string): string {
    const aesKey = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(encrypted.encryptedKey, 'hex'),
    );

    const iv = Buffer.from(encrypted.iv, 'hex');
    const authTag = Buffer.from(encrypted.authTag, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted.data, 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }
}