import { encryptText, decryptText } from 'pii-cyclops';
import type { CryptoProvider } from '../types';

/**
 * pii-cyclops uses a fixed AES-CBC (CryptoJS AES default) with Base64 output.
 * Note: decrypting a non-pii-cyclops ciphertext (e.g. crypsi output) will throw,
 * so we return the input unchanged on failure to keep Excel column detection safe.
 */
export function createPiiCyclopsProvider(): CryptoProvider {
	async function encrypt(str: string, key: string): Promise<string> {
		return encryptText(str, key).encrypted;
	}

	async function decrypt(str: string, key: string): Promise<string> {
		try {
			return decryptText(str, key);
		} catch (error) {
			return str;
		}
	}

	return {
		name: 'pii-cyclops',
		label: 'pii-cyclops',
		encrypt,
		decrypt,
	};
}
