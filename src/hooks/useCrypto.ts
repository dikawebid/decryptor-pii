import { useState } from 'react';
import { aes } from 'crypsi.js';

export interface CryptoApi {
	algorithm: string;
	encryptionKey: string;
	isSetEncryptionKey: boolean;
	encryptAes: (str: string) => Promise<string>;
	decryptAes: (str: string) => Promise<string>;
	setAlgorithm: (value: string) => void;
	setEncryptionKey: (value: string) => void;
	setIsSetEncryptionKey: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export function useCrypto(): CryptoApi {
	const [algorithm, setAlgorithm] = useState("aes-256-cbc");
	const [encryptionKey, setEncryptionKey] = useState("");
	const [isSetEncryptionKey, setIsSetEncryptionKey] = useState(false);

	async function decryptAes(str: string): Promise<string> {
		try {
			const decoder = new TextDecoder();
			let decrypted = await aes.decryptWithAes256Cbc(encryptionKey, str);

			if (algorithm === "aes-128-cbc") {
				decrypted = await aes.decryptWithAes128Cbc(encryptionKey, str);
			} else if (algorithm === "aes-128-gcm") {
				decrypted = await aes.decryptWithAes128Gcm(encryptionKey, str);
			} else if (algorithm === "aes-256-gcm") {
				decrypted = await aes.decryptWithAes256Gcm(encryptionKey, str);
			}

			return decoder.decode(decrypted).toString();
		} catch (error) {
			return str;
		}
	}

	async function encryptAes(str: string): Promise<string> {
		try {
			let encrypted = await aes.encryptWithAes256Cbc(encryptionKey, str);

			if (algorithm === "aes-128-cbc") {
				encrypted = await aes.encryptWithAes128Cbc(encryptionKey, str);
			} else if (algorithm === "aes-128-gcm") {
				encrypted = await aes.encryptWithAes128Gcm(encryptionKey, str);
			} else if (algorithm === "aes-256-gcm") {
				encrypted = await aes.encryptWithAes256Gcm(encryptionKey, str);
			}

			return encrypted;
		} catch (error) {
			console.error('Encryption error:', error);
			return str;
		}
	}

	return {
		algorithm,
		encryptionKey,
		isSetEncryptionKey,
		encryptAes,
		decryptAes,
		setAlgorithm,
		setEncryptionKey,
		setIsSetEncryptionKey,
	};
}
