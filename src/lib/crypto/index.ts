import type { CryptoProvider, CryptoProviderName } from './types';
import { createCrypsiProvider } from './providers/crypsi';
import { createPiiCyclopsProvider } from './providers/piiCyclops';

export type { CryptoProvider, CryptoProviderName } from './types';

interface GetCryptoProviderOptions {
	algorithm: string;
	encryptionKey: string;
}

export function getCryptoProvider(
	providerName: CryptoProviderName,
	{ algorithm, encryptionKey }: GetCryptoProviderOptions,
): CryptoProvider {
	if (providerName === 'pii-cyclops') {
		return createPiiCyclopsProvider();
	}
	return createCrypsiProvider(algorithm, encryptionKey);
}
