import { aes } from 'crypsi.js';
import type { CryptoProvider } from '../types';

export function createCrypsiProvider(algorithm: string, encryptionKey: string): CryptoProvider {
	async function decrypt(str: string): Promise<string> {
		try {
			const decoder = new TextDecoder();
			let decrypted = await aes.decryptWithAes256Cbc(encryptionKey, str);

			if (algorithm === 'aes-128-cbc') {
				decrypted = await aes.decryptWithAes128Cbc(encryptionKey, str);
			} else if (algorithm === 'aes-128-gcm') {
				decrypted = await aes.decryptWithAes128Gcm(encryptionKey, str);
			} else if (algorithm === 'aes-256-gcm') {
				decrypted = await aes.decryptWithAes256Gcm(encryptionKey, str);
			}

			return decoder.decode(decrypted).toString();
		} catch (error) {
			return str;
		}
	}

	async function encrypt(str: string): Promise<string> {
		try {
			let encrypted = await aes.encryptWithAes256Cbc(encryptionKey, str);

			if (algorithm === 'aes-128-cbc') {
				encrypted = await aes.encryptWithAes128Cbc(encryptionKey, str);
			} else if (algorithm === 'aes-128-gcm') {
				encrypted = await aes.encryptWithAes128Gcm(encryptionKey, str);
			} else if (algorithm === 'aes-256-gcm') {
				encrypted = await aes.encryptWithAes256Gcm(encryptionKey, str);
			}

			return encrypted;
		} catch (error) {
			console.error('Encryption error:', error);
			return str;
		}
	}

	return {
		name: 'crypsi',
		label: 'crypsi.js',
		encrypt,
		decrypt,
	};
}
