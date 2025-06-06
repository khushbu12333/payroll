'use client';

import { useState } from 'react';
import { MdClose, MdRefresh, MdDelete } from 'react-icons/md';

interface UploadedFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  fileName: string;
  fileSize: string;
  folderName: string;
}

export default function UploadedFileModal({ 
  isOpen, 
  onClose, 
  onSave,
  fileName,
  fileSize,
  folderName
}: UploadedFileModalProps) {
  const [showInPortal, setShowInPortal] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4">
          <h2 className="text-xl text-black">
            New {folderName} Document
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-black mb-4">SELECTED DOCUMENT</h3>
            <div className="bg-white border rounded flex items-center justify-between p-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-50 rounded flex items-center justify-center mr-3">
                  <span className="text-red-500 text-xs uppercase">PDF</span>
                </div>
                <div>
                  <p className="text-sm text-black">{fileName}</p>
                  <p className="text-xs text-gray-500">{fileSize}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  className="text-blue-600 hover:text-blue-700"
                  title="Replace file"
                >
                  <MdRefresh className="w-5 h-5" />
                </button>
                <button 
                  className="text-red-500 hover:text-red-600"
                  title="Remove file"
                >
                  <MdDelete className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm text-black mb-2">
              Folder Name<span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 border rounded text-black bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={folderName}
              disabled
            >
              <option value={folderName}>{folderName}</option>
            </select>
          </div>

          <div>
            <label className="flex items-center text-black">
              <input
                type="checkbox"
                checked={showInPortal}
                onChange={(e) => setShowInPortal(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">Show document in portal</span>
            </label>
          </div>

          {showInPortal && (
            <div className="mt-4 bg-yellow-50 p-4 rounded">
              <p className="text-sm text-black">
                Since the Documents module is not enabled in the portal yet, you need to first enable it from Settings to show this document in the portal.
                <a href="#" className="text-blue-600 hover:text-blue-700 block mt-1">
                  Go to Settings
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 px-6 py-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-black hover:bg-gray-50 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Save File
          </button>
        </div>
      </div>
    </div>
  );
} 