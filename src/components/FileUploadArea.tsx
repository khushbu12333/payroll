'use client';

import { useState } from 'react';
import { MdCloudUpload } from 'react-icons/md';
import UploadedFileModal from './UploadedFileModal';

interface FileUploadAreaProps {
  onFileUpload: (files: FileList) => void;
  folderName: string;
}

export default function FileUploadArea({ onFileUpload, folderName }: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    validateAndProcessFile(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndProcessFile(e.target.files);
    }
  };

  const validateAndProcessFile = (files: FileList) => {
    const file = files[0]; // Only process the first file
    
    // Validate file type and size
    const isPDF = file.type === 'application/pdf';
    const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB

    if (!isPDF || !isValidSize) {
      alert('Please ensure the file is a PDF and under 50MB');
      return;
    }

    setSelectedFile(file);
    setShowModal(true);
  };

  const handleSave = () => {
    if (selectedFile) {
      onFileUpload(new DataTransfer().files);
      setShowModal(false);
      setSelectedFile(null);
    }
  };

  return (
    <>
      <div className="p-6">
        <div 
          className={`border-2 border-dashed rounded-lg p-8 ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 mb-4 rounded-full bg-blue-50 flex items-center justify-center">
              <MdCloudUpload className="w-10 h-10 text-blue-500" />
            </div>
            
            <h3 className="text-lg font-medium text-black mb-2">
              Drag & Drop File Here
            </h3>
            
            <p className="text-sm text-black mb-4">- or -</p>
            
            <label className="cursor-pointer">
              <span className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Choose file to upload
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileSelect}
              />
            </label>

            <p className="mt-4 text-sm text-black max-w-md">
              While uploading .zip ensure that files are of type .pdf and the names of the files correspond to the ID that person (file size should not exceed 50MB)
            </p>
          </div>
        </div>
      </div>

      {selectedFile && (
        <UploadedFileModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedFile(null);
          }}
          onSave={handleSave}
          fileName={selectedFile.name}
          fileSize={`${(selectedFile.size / 1024).toFixed(1)}KB`}
          folderName={folderName}
        />
      )}
    </>
  );
} 