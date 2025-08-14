"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Eye, 
  Search, 
  Filter,
  Calendar,
  User,
  Building,
  X,
  Upload,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import Sidebar from '@/components/Sidebar';
import DashboardLayout from '@/components/DashboardLayout';

interface Document {
  id: number;
  name: string;
  type: string;
  employee: string;
  department: string;
  description: string;
  file_path?: string;
  upload_date: string;
  size: string;
  status: string;
}

type FormDataType = {
  name: string;
  type: string;
  employee: string;
  department: string;
  description: string;
  file: File | null;
};

interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

function PayrollDocumentSystem() {
  // const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    type: '',
    employee: '',
    department: '',
    description: '',
    file: null
  });

  const documentTypes = ['All', 'Salary Report', 'Tax Document', 'Bonus Report', 'Leave Record', 'Other'];
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];

// Notification functions
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now();
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove notification after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const showSuccessNotification = (title: string, message: string) => {
    addNotification({
      type: 'success',
      title,
      message,
      duration: 4000
    });
  };

  const showErrorNotification = (title: string, message: string) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: 6000
    });
  };

  const showWarningNotification = (title: string, message: string) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration: 5000
    });
  };

  const showInfoNotification = (title: string, message: string) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration: 4000
    });
  };

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Fetch documents from API
const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching documents from API...');
      
    const response = await fetch(`${API_BASE}/documents/`);
      console.log('Fetch response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch API Error Response:', errorText);
        throw new Error(`Failed to fetch documents: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Handle different API response structures
      const documentsArray = data.results || data || [];
      console.log('Documents array:', documentsArray);
      setDocuments(documentsArray);
    } catch (error) {
      console.error('API error:', error);
      
      // Show error notification
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          showErrorNotification(
            'Connection Error',
            'Unable to connect to the server. Please check if the Django server is running.'
          );
        } else if (error.message.includes('CORS')) {
          showErrorNotification(
            'CORS Error',
            'Cross-origin request blocked. Please configure CORS in Django settings.'
          );
        } else {
          showErrorNotification(
            'Error Loading Documents',
            error.message
          );
        }
      }
      
      // Set empty array if API fails
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

useEffect(() => {
  fetchDocuments();
}, [fetchDocuments]);

  // Create new document via API
  const createDocument = async (documentData: FormData) => {
    try {
      console.log('Sending document data to API...');
      
      // Log the FormData contents for debugging
      for (const [key, value] of documentData.entries()) {
        console.log(`${key}:`, value);
      }
      
      const response = await fetch(`${API_BASE}/documents/`, {
        method: 'POST',
        body: documentData,
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to create document: ${response.status} - ${errorText}`);
      }
      
      const newDocument = await response.json();
      console.log('Created document:', newDocument);
      return newDocument;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  };

  // Update document via API
  const updateDocument = async (id: number, documentData: FormData) => {
    try {
      console.log(`Updating document ${id}...`);
      
      const response = await fetch(`${API_BASE}/documents/${id}/`, {
        method: 'PATCH',
        body: documentData,
      });
      
      console.log('Update response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update API Error Response:', errorText);
        throw new Error(`Failed to update document: ${response.status} - ${errorText}`);
      }
      
      const updatedDocument = await response.json();
      console.log('Updated document:', updatedDocument);
      return updatedDocument;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  };

  // Delete document via API
  const deleteDocument = async (id: number) => {
    try {
      console.log(`Deleting document ${id}...`);
      
      const response = await fetch(`${API_BASE}/documents/${id}/`, {
        method: 'DELETE',
      });
      
      console.log('Delete response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete API Error Response:', errorText);
        throw new Error(`Failed to delete document: ${response.status} - ${errorText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || doc.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const openModal = (type: 'add' | 'edit' | 'view', document: Document | null = null) => {
    setModalType(type);
    setSelectedDocument(document);
    setIsModalOpen(true);
    
    if (type === 'edit' && document) {
      setFormData({
        name: document.name,
        type: document.type,
        employee: document.employee,
        department: document.department,
        description: document.description,
        file: null
      });
    } else if (type === 'add') {
      setFormData({
        name: '',
        type: '',
        employee: '',
        department: '',
        description: '',
        file: null
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
    setFormData({
      name: '',
      type: '',
      employee: '',
      department: '',
      description: '',
      file: null
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData(prev => ({
      ...prev,
      file: file
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.type || !formData.employee || !formData.department) {
      showWarningNotification(
        'Missing Information',
        'Please fill in all required fields before submitting.'
      );
      return;
    }
    
    try {
      console.log('Form data:', formData);
      
      // Create FormData for file upload
      const apiFormData = new FormData();
      apiFormData.append('name', formData.name);
      apiFormData.append('type', formData.type);
      apiFormData.append('employee', formData.employee);
      apiFormData.append('department', formData.department);
      apiFormData.append('description', formData.description || '');
      apiFormData.append('status', 'Active');
      
      // Only append file if one is selected
      if (formData.file) {
        apiFormData.append('file', formData.file);
        console.log('File attached:', formData.file.name, 'Size:', formData.file.size);
      } else {
        console.log('No file selected');
      }
      
      if (modalType === 'add') {
        await createDocument(apiFormData);
        showSuccessNotification(
          'Document Added Successfully!',
          `"${formData.name}" has been added to the document management system.`
        );
      } else if (modalType === 'edit' && selectedDocument) {
        await updateDocument(selectedDocument.id, apiFormData);
        showSuccessNotification(
          'Document Updated Successfully!',
          `"${formData.name}" has been updated with the latest information.`
        );
      }
      
      // Refresh the documents list
      await fetchDocuments();
      closeModal();
    } catch (error) {
      console.error('Submit error details:', error);

      // More specific error messages with notifications
      if (error instanceof Error) {
        const message = error.message;
        if (message.includes('CORS')) {
          showErrorNotification(
            'CORS Configuration Error',
            'Please check if your Django backend allows requests from localhost:3000'
          );
        } else if (message.includes('Failed to fetch')) {
          showErrorNotification(
            'Network Connection Error',
            'Please check if your Django server is running on http://127.0.0.1:8000'
          );
        } else if (message.includes('400')) {
          showErrorNotification(
            'Invalid Request',
            'Please check if all required fields are filled correctly'
          );
        } else if (message.includes('500')) {
          showErrorNotification(
            'Server Error',
            'Internal server error occurred. Please check your Django backend logs'
          );
        } else {
          showErrorNotification(
            'Error Saving Document',
            message
          );
        }
      } else {
        showErrorNotification(
          'Unknown Error',
          'An unexpected error occurred while saving the document'
        );
      }
    }
  };

  const handleDelete = async (documentToDelete: Document) => {
    if (window.confirm(`Are you sure you want to delete "${documentToDelete.name}"?`)) {
      try {
        await deleteDocument(documentToDelete.id);
        showSuccessNotification(
          'Document Deleted Successfully!',
          `"${documentToDelete.name}" has been permanently removed from the system.`
        );
        // Refresh the documents list
        await fetchDocuments();
      } catch (error) {
        console.error('Delete error:', error);
        showErrorNotification(
          'Error Deleting Document',
          `Failed to delete "${documentToDelete.name}". Please try again.`
        );
      }
    }
  };

  const handleDownload = (doc: Document) => {
    if (doc.file_path) {
      // If there's an actual file path, try to download it
      window.open(`${API_BASE.replace(/\/api$/, '')}${doc.file_path}`, '_blank');
      showInfoNotification(
        'Download Started',
        `Downloading "${doc.name}"...`
      );
    } else {
      // Fallback: create a text file with document details
      const blob = new Blob([`Document: ${doc.name}\nEmployee: ${doc.employee}\nDepartment: ${doc.department}\nDescription: ${doc.description}`], 
                           { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.name}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccessNotification(
        'Download Complete',
        `"${doc.name}" document details downloaded successfully.`
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  // Calculate stats
  const totalDocuments = documents.length;
  const activeDocuments = documents.filter(doc => doc.status === 'Active').length;
  const totalSize = documents.reduce((sum, doc) => {
    const sizeStr = doc.size || '0 MB';
    const size = parseFloat(sizeStr.split(' ')[0]);
    return sum + (isNaN(size) ? 0 : size);
  }, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Notifications Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`flex items-start space-x-3 p-4 rounded-lg border shadow-lg transform transition-all duration-300 ease-in-out ${getNotificationStyles(notification.type)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{notification.title}</p>
              <p className="text-xs mt-1 opacity-90">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Document Management</h1>
                <p className="text-gray-600">Manage payroll documents and records</p>
              </div>
            </div>
            <button
              onClick={() => openModal('add')}
              className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{totalDocuments}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Documents</p>
                <p className="text-2xl font-bold text-gray-900">{activeDocuments}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">{totalSize.toFixed(1)} MB</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
              >
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map(document => (
            <div key={document.id} className="bg-white rounded-xl shadow-sm border border-yellow-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FileText className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight">{document.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{document.type}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                    {document.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{document.employee}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Building className="w-4 h-4" />
                    <span>{document.department}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{document.upload_date}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{document.size}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openModal('view', document)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openModal('edit', document)}
                      className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors duration-200"
                      title="Edit Document"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(document)}
                      className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors duration-200"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(document)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDocuments.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No documents found matching your criteria</p>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-70 p-10">
            <div className="relative flex items-center justify-center min-h-screen p-6 z-10">
              <div className="bg-white rounded-xl shadow-xl max-w-8xl w-full max-h-[100vh] overflow-y-auto">
                <div className="p-10">
                  <div className="flex items-center justify-between mb-9">
                    <h2 className="text-xl font-bold text-gray-800">
                      {modalType === 'add' ? 'Add New Document' : 
                       modalType === 'edit' ? 'Edit Document' : 'Document Details'}
                    </h2>
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {modalType === 'view' && selectedDocument ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                          <p className="text-gray-900 bg-gray-50 p-2 rounded-lg">{selectedDocument.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <p className="text-gray-900 bg-gray-50 p-2 rounded-lg">{selectedDocument.type}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                          <p className="text-gray-900 bg-gray-50 p-2 rounded-lg">{selectedDocument.employee}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                          <p className="text-gray-900 bg-gray-50 p-2 rounded-lg">{selectedDocument.department}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Date</label>
                          <p className="text-gray-900 bg-gray-50 p-2 rounded-lg">{selectedDocument.upload_date}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">File Size</label>
                          <p className="text-gray-900 bg-gray-50 p-2 rounded-lg">{selectedDocument.size}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <p className="text-gray-900 bg-gray-50 p-2 rounded-lg">{selectedDocument.description}</p>
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleDownload(selectedDocument)}
                          className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            required
                          >
                            <option value="">Select Type</option>
                            {documentTypes.slice(1).map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                          <input
                            type="text"
                            name="employee"
                            value={formData.employee}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                          <select
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            required
                          >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="Enter document description..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                          />
                          <label
                            htmlFor="file-upload"
                            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Choose File</span>
                          </label>
                          {formData.file && (
                            <span className="text-sm text-gray-600">{formData.file.name}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={closeModal}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmit}
                          className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                          <Save className="w-4 h-4" />
                          <span>{modalType === 'add' ? 'Add Document' : 'Update Document'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default PayrollDocumentSystem;