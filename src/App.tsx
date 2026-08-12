import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { read, utils, write } from 'xlsx';
import { Upload, Loader2, FileSpreadsheet, FileDown, Key, FileText, Lock, Unlock } from 'lucide-react';
import JSZip from "jszip";
import { saveAs } from 'file-saver';
import { aes } from 'crypsi.js';
import AlgorithmKeyConfig from './components/AlgorithmKeyConfig';

interface TableData {
	headers: string[];
	rows: any[][];
}

interface ProcessedRow {
	[key: string]: string;
}

function App() {
	//new instance of zip
	const zip = new JSZip();

	const [activeTab, setActiveTab] = useState<'excel' | 'text'>('excel');
	const [tableData, setTableData] = useState<TableData | null>(null);
	type ColumnOp = 'encrypt' | 'decrypt' | 'none';
	const [columnOperation, setColumnOperation] = useState<{ [key: string]: ColumnOp }>({});
	const [detectedStatus, setDetectedStatus] = useState<{ [key: string]: boolean }>({});
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingExportCSV, setIsLoadingExportCSV] = useState(false);
	const [isLoadingExportXLSX, setIsLoadingExportXLSX] = useState(false);
	const [algorithm, setAlgorithm] = useState("aes-256-cbc");
	const [encryptionKey, setEncryptionKey] = useState("");
	const [isSetEncryptionKey, setIsSetEncryptionKey] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [processedData, setProcessedData] = useState<ProcessedRow[]>([]);
	const rowsPerPage = 10;

	// Text encrypt/decrypt state
	const [inputText, setInputText] = useState('');
	const [outputText, setOutputText] = useState('');
	const [textOperation, setTextOperation] = useState<'encrypt' | 'decrypt'>('encrypt');

	async function detectIfEncrypted(value: any): Promise<boolean> {
		const str = value == null ? '' : String(value);
		if (!str) return false;
		const original = str;
		const decrypted = await decryptAes(str);
		return decrypted !== original;
	}

	const processFile = useCallback(async (file: File) => {
		setIsLoading(true);
		try {
			const buffer = await file.arrayBuffer();
			const workbook = read(buffer);
			const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
			const data = utils.sheet_to_json(firstSheet, { header: 1 });

			const headers = data[0] as string[];
			const rows = data.slice(1) as any[][];

			setTableData({ headers, rows });

			const detectedEncryption: { [key: string]: boolean } = {};
			await Promise.all(
				headers.map(async (header) => {
					const colIndex = headers.indexOf(header);
					const values = rows
						.map((row) => row[colIndex])
						.filter((v) => v != null && String(v).trim() !== '');

					if (values.length === 0) {
						detectedEncryption[header] = false;
						return;
					}

					const results = await Promise.all(values.map(detectIfEncrypted));
					const encryptedCount = results.filter(Boolean).length;
					detectedEncryption[header] = encryptedCount > values.length / 2;
				})
			);
			setDetectedStatus(detectedEncryption);
			const operations: { [key: string]: ColumnOp } = headers.reduce((acc, header) => ({
				...acc,
				[header]: 'none'
			}), {});
			setColumnOperation(operations);
			setCurrentPage(1);
		} catch (error) {
			console.error('Error processing file:', error);
		} finally {
			setIsLoading(false);
		}
	}, [decryptAes]);

	const onDrop = useCallback((acceptedFiles: File[]) => {
		const file = acceptedFiles[0];
		if (file) {
			processFile(file);
		}
	}, [processFile]);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'text/csv': ['.csv'],
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
			'application/vnd.ms-excel': ['.xls']
		},
		multiple: false,
		disabled: isLoading
	});

	const toggleEncryption = (header: string) => {
		setColumnOperation(prev => {
			const current = prev[header] || 'none';
			const next = current === 'none'
				? (detectedStatus[header] ? 'decrypt' : 'encrypt')
				: 'none';
			return {
				...prev,
				[header]: next
			};
		});
	};

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

	const processValueForDisplay = (value: any, header: string): Promise<string> => {
		if (value == null || value === '') return Promise.resolve('');
		const stringValue = String(value);
		const op = columnOperation[header];
		if (op === 'decrypt') return decryptAes(stringValue);
		if (op === 'encrypt') {
			return detectedStatus[header] ? Promise.resolve(stringValue) : encryptAes(stringValue);
		}
		return Promise.resolve(stringValue);
	};

	// Process data when tableData or columnOperation change
	useEffect(() => {
		const processData = async () => {
			if (!tableData) return;

			const processed = await Promise.all(
				tableData.rows.map(async (row) => {
					const processedRow: ProcessedRow = {};
					await Promise.all(
						tableData.headers.map(async (header, index) => {
							processedRow[header] = await processValueForDisplay(
								row[index],
								header
							);
						})
					);
					return processedRow;
				})
			);
			setProcessedData(processed);
		};

		processData();
	}, [tableData, columnOperation]);

	const exportToFile = async (format: 'xlsx' | 'csv') => {
		if (!tableData) return;

		// Process data for export
		const exportData = [
			tableData.headers,
			...await Promise.all(tableData.rows.map(async (row) =>
				await Promise.all(row.map(async (cell, index) => {
					const header = tableData.headers[index];
					return await processValueForDisplay(cell, header);
				}))
			))
		];

		const ws = utils.aoa_to_sheet(exportData);
		const wb = utils.book_new();
		utils.book_append_sheet(wb, ws, 'Sheet1');

		const filename = `exported-data.${format}`;
		if (format === 'xlsx') {
			setIsLoadingExportXLSX(true);
			let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
			zip.file(filename, wbout, { binary: true });
			zip.generateAsync({ type: "blob" }).then(function (content) {
				saveAs(content, "exported-data.zip");
				setIsLoadingExportXLSX(false);
			});
		} else {
			setIsLoadingExportCSV(true);
			let wbout = write(wb, { bookType: 'csv', type: 'binary' });
			zip.file(filename, wbout, { binary: true });
			zip.generateAsync({ type: "blob" }).then(function (content) {
				saveAs(content, "exported-data.zip");
				setIsLoadingExportCSV(false);
			});
		}
	};

	// Pagination calculations
	const totalPages = processedData ? Math.ceil(processedData.length / rowsPerPage) : 0;
	const startIndex = (currentPage - 1) * rowsPerPage;
	const endIndex = startIndex + rowsPerPage;
	const currentRows = processedData.slice(startIndex, endIndex);

	const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
	const visiblePageNumbers = pageNumbers.filter(num =>
		num === 1 ||
		num === totalPages ||
		(num >= currentPage - 1 && num <= currentPage + 1)
	);

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="mx-auto max-w-8xl p-6">
				<div className="flex items-center justify-center mb-8">
					<Key className="w-8 h-8 text-blue-600 mr-2" />
					<h1 className="text-3xl font-bold text-gray-800">Decryptor PII</h1>
				</div>

				{/* Configuration — shown first, above the tabs, shared by both tools */}
				<AlgorithmKeyConfig
					algorithm={algorithm}
					encryptionKey={encryptionKey}
					isSetEncryptionKey={isSetEncryptionKey}
					onAlgorithmChange={setAlgorithm}
					onEncryptionKeyChange={setEncryptionKey}
					onToggleEncryptionKey={() => setIsSetEncryptionKey(!isSetEncryptionKey)}
				/>

				{isSetEncryptionKey ? (
					<>
						{/* Tab Navigation — only available once the key is set */}
						<div className="flex border-b border-gray-200 mb-6">
							<button
								className={`px-4 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'excel' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
								onClick={() => setActiveTab('excel')}
							>
								<Upload className="w-4 h-4 inline mr-2" />
								Excel Operations
							</button>
							<button
								className={`px-4 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'text' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
								onClick={() => setActiveTab('text')}
							>
								<FileText className="w-4 h-4 inline mr-2" />
								Text Encrypt/Decrypt
							</button>
						</div>

						{activeTab === 'excel' && (
							<div className="mx-auto">
								<div
									{...getRootProps()}
									className={`mb-8 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors relative
									${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
									${isLoading ? 'pointer-events-none' : ''}`}
								>
									<input {...getInputProps()} />
									{isLoading ? (
										<div className="flex flex-col items-center">
											<Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
											<p className="text-lg text-blue-600">Processing file...</p>
										</div>
									) : (
										<>
											<Upload className="mx-auto mb-4 text-gray-400" size={48} />
											{isDragActive ? (
												<p className="text-lg text-blue-600">Drop the file here...</p>
											) : (
												<div>
													<p className="text-lg text-gray-600">Drag and drop a CSV or Excel file here</p>
													<p className="text-sm text-gray-400 mt-2">or click to select a file</p>
												</div>
											)}
										</>
									)}
								</div>

								{tableData && (
									<div className="bg-white rounded-lg shadow overflow-hidden">
										<div className="p-4 border-b flex justify-between items-center">
											<h2 className="text-xl font-semibold text-gray-800">Data Preview</h2>
											<div className="flex gap-2">
												<button
													onClick={() => exportToFile('xlsx')}
													className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
													disabled={isLoadingExportXLSX}
												>
													<FileSpreadsheet className="w-4 h-4" />
													Export XLSX
												</button>
												<button
													onClick={() => exportToFile('csv')}
													className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
													disabled={isLoadingExportCSV}
												>
													<FileDown className="w-4 h-4" />
													Export CSV
												</button>
											</div>
										</div>
										<div className="overflow-x-auto">
											<table className="min-w-full divide-y divide-gray-200">
												<thead className="bg-gray-50">
													<tr>
														{tableData.headers.map((header, index) => (
															<th
																key={index}
																className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
															>
																<div className="flex items-center space-x-2">
																	<span>{header}</span>
																	<span
																		className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${detectedStatus[header]
																			? 'bg-red-100 text-red-700'
																			: 'bg-green-100 text-green-700'
																			}`}
																		title={detectedStatus[header] ? "Detected as encrypted" : "Detected as plain text"}
																	>
																		{detectedStatus[header] ? 'Encrypted' : 'Plain'}
																	</span>
																	<button
																		onClick={() => toggleEncryption(header)}
																		className="p-1 rounded hover:bg-gray-200 transition-colors"
																		title={columnOperation[header] === 'decrypt' ? "Decrypt column" : columnOperation[header] === 'encrypt' ? "Encrypt column" : "No operation (raw)"}
																	>
																		{columnOperation[header] === 'decrypt' ? (
																			<Lock className="w-4 h-4 text-red-600" />
																		) : columnOperation[header] === 'encrypt' ? (
																			<Lock className="w-4 h-4 text-blue-600" />
																		) : (
																			<Lock className="w-4 h-4 text-gray-600" />
																		)}
																	</button>
																</div>
															</th>
														))}
													</tr>
												</thead>
												<tbody className="bg-white divide-y divide-gray-200">
													{currentRows.map((row, rowIndex) => (
														<tr key={rowIndex} className="hover:bg-gray-50">
															{tableData.headers.map((header, colIndex) => (
																<td
																	key={colIndex}
																	className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
																>
																	{row[header]}
																</td>
															))}
														</tr>
													))}
												</tbody>
											</table>
										</div>

										{/* Pagination */}
										<div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
											<div className="flex items-center justify-between">
												<div className="text-sm text-gray-700">
													Showing {startIndex + 1} to {Math.min(endIndex, processedData.length)} of{' '}
													{processedData.length} entries
												</div>
												<div className="flex gap-1">
													<button
														onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
														disabled={currentPage === 1}
														className="px-3 py-1 rounded border border-gray-300 bg-white text-sm font-medium text-gray-700
															hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
													>
														Previous
													</button>
													{visiblePageNumbers.map((pageNum, index) => {
														const isGap = index > 0 && pageNum - visiblePageNumbers[index - 1] > 1;
														return (
															<React.Fragment key={pageNum}>
																{isGap && <span className="px-3 py-1">...</span>}
																<button
																	onClick={() => setCurrentPage(pageNum)}
																	className={`px-3 py-1 rounded border ${currentPage === pageNum
																		? 'bg-blue-600 text-white border-blue-600'
																		: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
																		}`}
																>
																	{pageNum}
																</button>
															</React.Fragment>
														);
													})}
													<button
														onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
														disabled={currentPage === totalPages}
														className="px-3 py-1 rounded border border-gray-300 bg-white text-sm font-medium text-gray-700
															hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
													>
														Next
													</button>
												</div>
											</div>
										</div>
									</div>
								)}
							</div>
						)}
						{activeTab === 'text' && (
							<div className="mx-auto">
								<div className="bg-white rounded-lg shadow-md p-6">
									<div className="mb-4">
										<div className="flex gap-4 mb-4">
											<button
												type="button"
												className={`flex-1 py-2 px-4 rounded-md ${textOperation === 'encrypt' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
												onClick={() => setTextOperation('encrypt')}
											>
												<Lock className="w-4 h-4 inline mr-2" />
												Encrypt
											</button>
											<button
												type="button"
												className={`flex-1 py-2 px-4 rounded-md ${textOperation === 'decrypt' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
												onClick={() => setTextOperation('decrypt')}
											>
												<Unlock className="w-4 h-4 inline mr-2" />
												Decrypt
											</button>
										</div>

										<div className="mb-4">
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Input Text
											</label>
											<textarea
												value={inputText}
												onChange={(e) => setInputText(e.target.value)}
												rows={4}
												className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
												placeholder="Enter text to encrypt or decrypt..."
											/>
										</div>

										<div className="mb-4">
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Output Text
											</label>
											<textarea
												value={outputText}
												readOnly
												rows={4}
												className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
												placeholder="Encrypted or decrypted text will appear here..."
											/>
										</div>

										<div className="flex gap-2">
											<button
												type="button"
												onClick={handleTextOperation}
												className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
											>
												{textOperation === 'encrypt' ? 'Encrypt Text' : 'Decrypt Text'}
											</button>
											<button
												type="button"
												onClick={clearTextFields}
												className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
											>
												Clear
											</button>
										</div>
									</div>
								</div>
							</div>
						)}
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