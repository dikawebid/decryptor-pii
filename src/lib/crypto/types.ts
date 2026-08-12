export type CryptoProviderName = 'crypsi' | 'pii-cyclops';

export interface CryptoProvider {
	name: CryptoProviderName;
	label: string;
	encrypt: (str: string, key: string) => Promise<string>;
	decrypt: (str: string, key: string) => Promise<string>;
}
