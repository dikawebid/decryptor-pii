import { useState } from 'react';
import { Key, Lock } from 'lucide-react';
import AlgorithmKeyConfig from './components/AlgorithmKeyConfig';
import Tabs, { TabId } from './components/Tabs';
import ExcelTab from './components/ExcelTab';
import TextTab from './components/TextTab';
import { useCrypto } from './hooks/useCrypto';

function App() {
	const [activeTab, setActiveTab] = useState<TabId>('excel');
	const crypto = useCrypto();
	const {
		provider,
		algorithm,
		encryptionKey,
		isSetEncryptionKey,
		setAlgorithm,
		setProvider,
		setEncryptionKey,
		setIsSetEncryptionKey,
	} = crypto;

	const handleProviderChange = (value: 'crypsi' | 'pii-cyclops') => {
		setProvider(value);
		// Providers are incompatible, so clear any stale key from the other library.
		setEncryptionKey('');
		setIsSetEncryptionKey(false);
	};

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="mx-auto max-w-8xl p-6">
				<div className="flex items-center justify-center mb-8">
					<Key className="w-8 h-8 text-blue-600 mr-2" />
					<h1 className="text-3xl font-bold text-gray-800">Decryptor PII</h1>
				</div>

				{/* Configuration — shown first, above the tabs, shared by both tools */}
				<AlgorithmKeyConfig
					provider={provider}
					algorithm={algorithm}
					encryptionKey={encryptionKey}
					isSetEncryptionKey={isSetEncryptionKey}
					onProviderChange={handleProviderChange}
					onAlgorithmChange={setAlgorithm}
					onEncryptionKeyChange={setEncryptionKey}
					onToggleEncryptionKey={() => setIsSetEncryptionKey(!isSetEncryptionKey)}
				/>

				{isSetEncryptionKey ? (
					<>
						{/* Tab Navigation — only available once the key is set */}
						<Tabs activeTab={activeTab} onChange={setActiveTab} />

						{activeTab === 'excel' && <ExcelTab crypto={crypto} />}
						{activeTab === 'text' && <TextTab crypto={crypto} />}
					</>
				) : (
					/* Locked state — configuration not yet complete */
					<div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
						<Lock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
						<p className="text-lg font-medium text-gray-700">Set your encryption key to continue</p>
						<p className="text-sm text-gray-500 mt-1">
							Choose an algorithm, enter a key, and click "Set Encryption Key" above to unlock the Excel and Text tools.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default App;
