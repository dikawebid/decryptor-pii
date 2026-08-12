import { Key } from 'lucide-react';

const ALGORITHM_OPTIONS = [
	{ value: 'aes-128-cbc', label: 'AES-128-CBC' },
	{ value: 'aes-256-cbc', label: 'AES-256-CBC' },
	{ value: 'aes-128-gcm', label: 'AES-128-GCM' },
	{ value: 'aes-256-gcm', label: 'AES-256-GCM' },
];

interface AlgorithmKeyConfigProps {
	algorithm: string;
	encryptionKey: string;
	isSetEncryptionKey: boolean;
	onAlgorithmChange: (value: string) => void;
	onEncryptionKeyChange: (value: string) => void;
	onToggleEncryptionKey: () => void;
}

function AlgorithmKeyConfig({
	algorithm,
	encryptionKey,
	isSetEncryptionKey,
	onAlgorithmChange,
	onEncryptionKeyChange,
	onToggleEncryptionKey,
}: AlgorithmKeyConfigProps) {
	return (
		<div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
