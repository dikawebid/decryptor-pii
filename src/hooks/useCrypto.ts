import { useState } from 'react';
import { getCryptoProvider } from '../lib/crypto';
import type { CryptoProviderName } from '../lib/crypto';

export interface CryptoApi {
	algorithm: string;
	provider: CryptoProviderName;
	encryptionKey: string;
	isSetEncryptionKey: boolean;
	encryptAes: (str: string) => Promise<string>;
	decryptAes: (str: string) => Promise<string>;
	setAlgorithm: (value: string) => void;
	setProvider: (value: CryptoProviderName) => void;
	setEncryptionKey: (value: string) => void;
	setIsSetEncryptionKey: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export function useCrypto(): CryptoApi {
	const [algorithm, setAlgorithm] = useState('aes-256-cbc');
	const [provider, setProvider] = useState<CryptoProviderName>('crypsi');
	const [encryptionKey, setEncryptionKey] = useState('');
	const [isSetEncryptionKey, setIsSetEncryptionKey] = useState(false);

	async function decryptAes(str: string): Promise<string> {
		return getCryptoProvider(provider, { algorithm, encryptionKey }).decrypt(str, encryptionKey);
	}

	async function encryptAes(str: string): Promise<string> {
		return getCryptoProvider(provider, { algorithm, encryptionKey }).encrypt(str, encryptionKey);
	}

	return {
		algorithm,
		provider,
		encryptionKey,
		isSetEncryptionKey,
		encryptAes,
		decryptAes,
		setAlgorithm,
		setProvider,
		setEncryptionKey,
		setIsSetEncryptionKey,
	};
}
