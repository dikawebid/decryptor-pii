import { Upload, FileText } from 'lucide-react';

export type TabId = 'excel' | 'text';

interface TabsProps {
	activeTab: TabId;
	onChange: (tab: TabId) => void;
}

function Tabs({ activeTab, onChange }: TabsProps) {
	return (
		<div className="flex border-b border-gray-200 mb-6">
			<button
				className={`px-4 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'excel' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
				onClick={() => onChange('excel')}
			>
				<Upload className="w-4 h-4 inline mr-2" />
				Excel Operations
			</button>
			<button
				className={`px-4 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'text' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
				onClick={() => onChange('text')}
			>
				<FileText className="w-4 h-4 inline mr-2" />
				Text Encrypt/Decrypt
			</button>
		</div>
	);
}

export default Tabs;
