import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { read, utils, write } from 'xlsx';
import {Eye, EyeOff, Upload, Loader2, FileSpreadsheet, FileDown, Key} from 'lucide-react';
import JSZip from "jszip";
import { saveAs } from 'file-saver';
import { aes } from 'crypsi.js';

interface TableData {
	headers: string[];
	rows: any[][];
}

function App() {
	//new instance of zip
	const zip = new JSZip();

	const [tableData, setTableData] = useState<TableData | null>(null);
	const [encryptedColumns, setEncryptedColumns] = useState<{ [key: string]: boolean }>({});
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingExportCSV, setIsLoadingExportCSV] = useState(false);
	const [isLoadingExportXLSX, setIsLoadingExportXLSX] = useState(false);
	const [encryptionKey, setEncryptionKey] = useState("");
	const [isSetEncryptionKey, setIsSetEncryptionKey] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const rowsPerPage = 10;

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
			const initialEncryption = headers.reduce((acc, header) => ({
				...acc,
				[header]: false
			}), {});
			setEncryptedColumns(initialEncryption);
			setCurrentPage(1);
		} catch (error) {
			console.error('Error processing file:', error);
		} finally {
			setIsLoading(false);
		}
	}, []);

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
		setEncryptedColumns(prev => ({
			...prev,
			[header]: !prev[header]
		}));
	};

	// Simple encryption/decryption function (for demonstration)
	const encryptValue = (value: string): string => {
		return value.split('').map(char => {
			const code = char.charCodeAt(0);
			return String.fromCharCode(code + 1);
		}).join('');
	};

	async function decryptAes(str): Promise<string> {
		try {
			const decoder = new TextDecoder();
			const decrypted = await aes.decryptWithAes256Cbc(encryptionKey, str);
			return decoder.decode(decrypted).toString();
		} catch (error) {
			return str;
		}
	}

	const processValueForDisplay = async (value: any, isEncrypted: boolean): Promise<string> => {
		if (value == null) return '';
		const stringValue = String(value);
		return isEncrypted ? await decryptAes(stringValue) : stringValue;
	};

	const exportToFile = (format: 'xlsx' | 'csv') => {
		if (!tableData) return;

		// Export with current encryption state
		const exportData = [
			tableData.headers,
			...tableData.rows.map(row =>
				row.map((cell, index) =>
					processValueForDisplay(cell, encryptedColumns[tableData.headers[index]])
				)
			)
		];

		const ws = utils.aoa_to_sheet(exportData);
		const wb = utils.book_new();
		utils.book_append_sheet(wb, ws, 'Sheet1');

		const filename = `exported-data.${format}`;
		if (format === 'xlsx') {
			setIsLoadingExportXLSX(true);
			let wbout = write(wb, {bookType: 'xlsx', bookSST: true, type: 'binary'});
			zip.file(filename, wbout, {binary: true});
			zip.generateAsync({ type:"blob" }).then(function(content) {
				saveAs(content, "exported-data.zip");
				setIsLoadingExportXLSX(false);
			});
		} else {
			setIsLoadingExportCSV(true);
			let wbout = write(wb, {bookType: 'csv', type: 'binary'});
			zip.file(filename, wbout, {binary: true});
			zip.generateAsync({ type:"blob" }).then(function(content) {
				saveAs(content, "exported-data.zip");
				setIsLoadingExportCSV(false);
			});
		}
	};

	// Pagination calculations
	const totalPages = tableData ? Math.ceil(tableData.rows.length / rowsPerPage) : 0;
	const startIndex = (currentPage - 1) * rowsPerPage;
	const endIndex = startIndex + rowsPerPage;
	const currentRows = tableData ? tableData.rows.slice(startIndex, endIndex) : [];

	const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
	const visiblePageNumbers = pageNumbers.filter(num =>
		num === 1 ||
		num === totalPages ||
		(num >= currentPage - 1 && num <= currentPage + 1)
	);

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-4xl mx-auto p-6">
				<div className="flex items-center justify-center mb-8">
					<Key className="w-8 h-8 text-blue-600 mr-2" />
					<h1 className="text-3xl font-bold text-gray-800">Decryptor PII</h1>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow-md p-6 mb-6">
				<div className="mb-4">
					<label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
						Key
					</label>
					<div className="flex gap-4">
						<input
							type="text"
							id="token"
							disabled={isSetEncryptionKey}
							value={encryptionKey}
							onChange={(e) => setEncryptionKey(e.target.value)}
							placeholder="Enter your encryption key..."
							className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
						/>
						<button
							onClick={(e) => setIsSetEncryptionKey(!isSetEncryptionKey)}
							// disabled={isSetEncryptionKey}
							className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
						>
							{isSetEncryptionKey ? (
								<>
									<Key className="w-4 h-4" />
									Unset Encryption Key
								</>
							) : (
								<>
									<Key className="w-4 h-4" />
									Set Encryption Key
								</>
							)}
						</button>
					</div>
				</div>
			</div>


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
											<button
												onClick={() => toggleEncryption(header)}
												className="p-1 rounded hover:bg-gray-200 transition-colors"
												title={encryptedColumns[header] ? "Decrypt column" : "Encrypt column"}
											>
												{encryptedColumns[header] ? (
													<EyeOff className="w-4 h-4 text-red-600" />
												) : (
													<Eye className="w-4 h-4 text-green-600" />
												)}
											</button>
										</div>
									</th>
								))}
							</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
							{currentRows.map(async (row, rowIndex) => (
								<tr key={rowIndex} className="hover:bg-gray-50">
									{await Promise.all(
										tableData.headers.map(async (header, colIndex) => {
											const processedValue = await processValueForDisplay(row[colIndex], encryptedColumns[header]);
											return (
												<td key={colIndex}
												    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{processedValue}
												</td>
											);
										})
									)}
								</tr>
							))}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					<div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
						<div className="flex items-center justify-between">
							<div className="text-sm text-gray-700">
								Showing {startIndex + 1} to {Math.min(endIndex, tableData.rows.length)} of{' '}
								{tableData.rows.length} entries
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
												className={`px-3 py-1 rounded border ${
													currentPage === pageNum
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
	);
}

export default App;