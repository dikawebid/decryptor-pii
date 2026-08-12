import { Key } from 'lucide-react';
import type { CryptoProviderName } from '../lib/crypto';

const ALGORITHM_OPTIONS = [
	{ value: 'aes-128-cbc', label: 'AES-128-CBC' },
	{ value: 'aes-256-cbc', label: 'AES-256-CBC' },
	{ value: 'aes-128-gcm', label: 'AES-128-GCM' },
	{ value: 'aes-256-gcm', label: 'AES-256-GCM' },
];

const PROVIDER_OPTIONS: { value: CryptoProviderName; label: string }[] = [
	{ value: 'crypsi', label: 'crypsi.js' },
	{ value: 'pii-cyclops', label: 'pii-cyclops' },
];

interface AlgorithmKeyConfigProps {
	provider: CryptoProviderName;
	algorithm: string;
	encryptionKey: string;
	isSetEncryptionKey: boolean;
	onProviderChange: (value: CryptoProviderName) => void;
	onAlgorithmChange: (value: string) => void;
	onEncryptionKeyChange: (value: string) => void;
	onToggleEncryptionKey: () => void;
}

function AlgorithmKeyConfig({
	provider,
	algorithm,
	encryptionKey,
	isSetEncryptionKey,
	onProviderChange,
	onAlgorithmChange,
	onEncryptionKeyChange,
	onToggleEncryptionKey,
}: AlgorithmKeyConfigProps) {
	return (
		<div className="bg-white rounded-lg shadow-md p-6 mb-6">
			<div className="mb-4">
				<label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
					Encryption Library
				</label>
				<div className="flex gap-4">
					<select
						id="provider"
						disabled={isSetEncryptionKey}
						value={provider}
						onChange={(e) => onProviderChange(e.target.value as CryptoProviderName)}
						className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
					>
						{PROVIDER_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
			</div>
			{provider === 'crypsi' ? (
				<div className="mb-4">
					<label htmlFor="algorithm" className="block text-sm font-medium text-gray-700 mb-2">
						Algorithm
					</label>
					<div className="flex gap-4">
						<select
							id="algorithm"
							disabled={isSetEncryptionKey}
							value={algorithm}
							onChange={(e) => onAlgorithmChange(e.target.value)}
							className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
						>
							{ALGORITHM_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>
				</div>
			) : (
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 mb-2">Algorithm</label>
					<div className="flex gap-4">
						<p className="flex-1">AES-CBC (fixed)</p>
					</div>
					<p className="text-xs text-gray-500 mt-1">
						pii-cyclops uses a fixed AES-CBC algorithm.
					</p>
				</div>
			)}
			<div className="mb-4">
				<label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-2">
					Key
				</label>
				<div className="flex gap-4">
					<input
						type="text"
						id="key"
						disabled={isSetEncryptionKey}
						value={encryptionKey}
						onChange={(e) => onEncryptionKeyChange(e.target.value)}
						placeholder="Enter your encryption key..."
						className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
					/>
					<button
						onClick={onToggleEncryptionKey}
						className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						<Key className="w-4 h-4" />
						{isSetEncryptionKey ? 'Unset Encryption Key' : 'Set Encryption Key'}
					</button>
				</div>
			</div>
		</div>
	);
}

export default AlgorithmKeyConfig;
