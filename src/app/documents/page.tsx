'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  MdFolder,
  MdChevronRight,
  MdAdd,
  MdPerson,
  MdExpandMore,
  MdStorage,
  MdDelete,
  MdInfo,
  MdClose,
  MdFilterList,
  MdPictureAsPdf,
  MdMoreVert
} from 'react-icons/md';
import NewFolderModal from '@/components/NewFolderModal';
import FileUploadArea from '@/components/FileUploadArea';

interface FilterOption {
  id: string;
  label: string;
}

interface Folder {
  id: string;
  name: string;
  description: string;
  type: 'org' | 'employee';
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
}

interface Document {
  id: string;
  fileName: string;
  folderName: string;
  name: string;
  uploadedOn: string;
  type: 'pdf' | 'doc' | 'image';
}

const employeeStatuses: FilterOption[] = [
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
  { id: 'all', label: 'All' }
];

export default function DocumentsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [orgFolderExpanded, setOrgFolderExpanded] = useState(false);
  const [employeeFolderExpanded, setEmployeeFolderExpanded] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderType, setNewFolderType] = useState<'org' | 'employee'>('org');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      fileName: 'DEED OF CONVEYANCE CTS NO.1234',
      folderName: 'Employee Documents',
      name: 'All Employees',
      uploadedOn: '31/05/2025 04:54 PM',
      type: 'pdf'
    }
  ]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Add file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddFolder = (type: 'org' | 'employee') => {
    setNewFolderType(type);
    setShowNewFolderModal(true);
  };

  const handleSaveFolder = (name: string, description: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      description,
      type: newFolderType
    };
    setFolders([...folders, newFolder]);
    setShowNewFolderModal(false);
  };

  const handleFolderClick = (folder: Folder) => {
    setSelectedFolder(folder);
    setShowUploadArea(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Create new document entries for each file
      const newDocuments = Array.from(files).map((file) => {
        let docType: 'pdf' | 'doc' | 'image';
        if (file.type.includes('pdf')) {
          docType = 'pdf';
        } else if (file.type.includes('image')) {
          docType = 'image';
        } else {
          docType = 'doc';
        }

        return {
          id: Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          folderName: 'Employee Documents',
          name: 'All Employees',
          uploadedOn: new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          type: docType
        };
      });

      setDocuments([...documents, ...newDocuments]);
    }
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
    setOpenMenuId(null);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">All Documents</h1>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MdAdd className="w-5 h-5 mr-2" />
              Add Documents
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg mb-6">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">FILTER BY :</div>
              
              {/* Employee Status Filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="block w-48 pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Employee Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Employee Filter */}
              <div className="relative">
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="block w-48 pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an Employee</option>
                  <option value="all">All Employees</option>
                </select>
              </div>

              <button className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                <MdFilterList className="w-5 h-5 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="w-8 py-3 pl-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Folder Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded On
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="py-4 pl-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MdPictureAsPdf className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-sm text-blue-600 hover:text-blue-800">
                          {doc.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.folderName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.uploadedOn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative" ref={menuRef}>
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MdMoreVert className="h-5 w-5" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {openMenuId === doc.id && (
                          <div className="absolute right-0 top-0 mt-6 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 rounded-lg"
                            >
                              <MdDelete className="h-4 w-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 