import { useState } from 'react';
import { Lock, Unlock, FileText, Copy, Check, Eraser } from 'lucide-react';
import type { CryptoApi } from '../hooks/useCrypto';

interface TextTabProps {
	crypto: CryptoApi;
}

function TextTab({ crypto }: TextTabProps) {
	const { encryptionKey, encryptAes, decryptAes } = crypto;

	const [inputText, setInputText] = useState('');
	const [outputText, setOutputText] = useState('');
	const [textOperation, setTextOperation] = useState<'encrypt' | 'decrypt'>('encrypt');
	const [copied, setCopied] = useState(false);

	const handleTextOperation = async () => {
		if (!encryptionKey) {
			alert('Please set an encryption key first');
			return;
		}

		if (!inputText) {
			alert('Please enter text to process');
			return;
		}

		if (textOperation === 'encrypt') {
			const encrypted = await encryptAes(inputText);
			setOutputText(encrypted);
		} else {
			const decrypted = await decryptAes(inputText);
			setOutputText(decrypted);
		}
	};

	const clearTextFields = () => {
		setInputText('');
		setOutputText('');
	};

	return (
		<div className="mx-auto">
			<div className="bg-white rounded-lg shadow-md overflow-hidden">
				{/* Card header */}
				<div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
					<div className="flex items-center">
						<div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
							{textOperation === 'encrypt' ? <Lock className="w-4 h-4 text-blue-600" /> : <Unlock className="w-4 h-4 text-blue-600" />}
						</div>
						<div>
							<h2 className="text-base font-semibold text-gray-800">
								{textOperation === 'encrypt' ? 'Encrypt Text' : 'Decrypt Text'}
							</h2>
							<p className="text-xs text-gray-500">
								{textOperation === 'encrypt'
									? 'Turn plain text into encrypted text using the configured key.'
									: 'Decrypt previously encrypted text using the configured key.'}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={clearTextFields}
							disabled={!inputText && !outputText}
							className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						>
							<Eraser className="w-4 h-4" />
							Clear
						</button>
					</div>
				</div>

				<div className="p-6">
					{/* Operation toggle — segmented control */}
					<div className="mb-6">
						<p className="block text-sm font-medium text-gray-700 mb-2">Operation</p>
						<div className="inline-flex rounded-lg bg-gray-100 p-1 w-full sm:w-auto">
							<button
								type="button"
								onClick={() => setTextOperation('encrypt')}
								className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-colors ${
									textOperation === 'encrypt'
										? 'bg-blue-600 text-white shadow-sm'
										: 'text-gray-600 hover:text-gray-900'
								}`}
							>
								<Lock className="w-4 h-4" />
								Encrypt
							</button>
							<button
								type="button"
								onClick={() => setTextOperation('decrypt')}
								className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-colors ${
									textOperation === 'decrypt'
										? 'bg-blue-600 text-white shadow-sm'
										: 'text-gray-600 hover:text-gray-900'
								}`}
							>
								<Unlock className="w-4 h-4" />
								Decrypt
							</button>
						</div>
					</div>

					{/* Input field */}
					<div className="mb-5">
						<div className="flex items-center justify-between mb-2">
							<label htmlFor="text-input" className="flex items-center text-sm font-medium text-gray-700">
								<FileText className="w-4 h-4 text-gray-400 mr-2" />
								Input
							</label>
							<span className="text-xs text-gray-400">{inputText.length} chars</span>
						</div>
						<textarea
							id="text-input"
							value={inputText}
							onChange={(e) => setInputText(e.target.value)}
							rows={5}
							className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-y"
							placeholder={
								textOperation === 'encrypt'
									? 'Enter the plain text you want to encrypt...'
									: 'Enter the encrypted text you want to decrypt...'
							}
						/>
					</div>

					{/* Action flow */}
					<div className="flex items-center gap-3 mb-5">
						<button
							type="button"
							onClick={handleTextOperation}
							disabled={!inputText}
							className="flex items-center justify-center gap-2 flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{textOperation === 'encrypt' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
							{textOperation === 'encrypt' ? 'Encrypt Text' : 'Decrypt Text'}
						</button>
						<div className="h-px flex-1 bg-gray-200 hidden sm:block" aria-hidden="true" />
					</div>

					{/* Output field */}
					<div className="mb-2">
						<div className="flex items-center justify-between mb-2">
							<label htmlFor="text-output" className="flex items-center text-sm font-medium text-gray-700">
								{textOperation === 'encrypt' ? <Lock className="w-4 h-4 text-gray-400 mr-2" /> : <Unlock className="w-4 h-4 text-gray-400 mr-2" />}
								Output
							</label>
							<button
								type="button"
								onClick={async () => {
									if (!outputText) return;
									try {
										await navigator.clipboard.writeText(outputText);
										setCopied(true);
										setTimeout(() => setCopied(false), 1500);
									} catch {
										// Clipboard unavailable — ignore
									}
								}}
								disabled={!outputText}
								className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-gray-500 border border-gray-300 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
								title="Copy output to clipboard"
							>
								{copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
								{copied ? 'Copied' : 'Copy'}
							</button>
						</div>
						<textarea
							id="text-output"
							value={outputText}
							readOnly
							rows={5}
							className={`w-full p-3 border border-gray-200 rounded-md bg-gray-50 font-mono text-sm resize-y ${
								outputText ? 'text-gray-900' : 'text-gray-400'
							}`}
							placeholder="Result will appear here..."
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TextTab;
