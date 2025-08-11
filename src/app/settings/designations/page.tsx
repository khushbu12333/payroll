'use client';

import { useEffect, useState } from 'react';
import { MdEdit, MdDelete, MdAdd, MdWork, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import SettingsLayout from '@/components/SettingsLayout';
import DesignationModal from '@/components/DesignationModal';

interface Designation {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
}

interface ApiDesignation {
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

export default function DesignationsPage() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Designation>>({
    name: '',
    description: '',
    status: 'Active'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);

  useEffect(() => {
    fetchDesignations();
  }, [currentPage]);

  const fetchDesignations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/designations/?page=${currentPage}&page_size=${itemsPerPage}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch designations');
      }
      
      const data: PaginationInfo = await response.json();
      
      // Calculate total pages
      const total = data.count || 0;
      const pages = Math.ceil(total / itemsPerPage);
      setTotalPages(pages);
      setTotalItems(total);
      
      // Transform the data to match our interface
      const transformedData = data.results.map((item: any) => ({
        id: String(item.id || ''),
        name: String(item.name || ''),
        description: String(item.description || ''),
        status: item.status === 'Inactive' ? 'Inactive' : 'Active'
      }));

      console.log('Fetched designations:', transformedData);
      setDesignations(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching designations:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDesignation = () => {
    setSelectedDesignation(undefined);
    setFormData({
      name: '',
      description: '',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleEditDesignation = (designation: Designation) => {
    setSelectedDesignation(designation);
    setFormData({
      name: designation.name,
      description: designation.description,
      status: designation.status
    });
    setIsModalOpen(true);
  };

  const handleDeleteDesignation = async (designationId: string) => {
    if (confirm('Are you sure you want to delete this designation?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/designations/${designationId}/`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete designation');
        }
        await fetchDesignations(); // Refresh the list
      } catch (err) {
        console.error('Error deleting designation:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete designation');
      }
    }
  };

  const handleToggleStatus = async (designationId: string) => {
    try {
      const designation = designations.find(des => des.id === designationId);
      if (!designation) return;

      const response = await fetch(`http://127.0.0.1:8000/api/designations/${designationId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: designation.status === 'Active' ? 'Inactive' : 'Active'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update designation status');
      }
      await fetchDesignations(); // Refresh the list
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update designation status');
    }
  };

  const handleSaveDesignation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = selectedDesignation 
        ? `http://127.0.0.1:8000/api/designations/${selectedDesignation.id}/`
        : 'http://127.0.0.1:8000/api/designations/';
      
      const method = selectedDesignation ? 'PUT' : 'POST';

      // Prepare the data according to Django model fields
      const apiData = {
        name: formData.name?.trim() || '',
        description: formData.description?.trim() || '',
        status: formData.status || 'Active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Sending data to API:', {
        url,
        method,
        data: apiData
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: responseData
        });

        let errorMessage = 'Failed to save designation';
        if (responseData) {
          if (typeof responseData === 'object') {
            const errors = Object.entries(responseData)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('\n');
            errorMessage = `Validation Error:\n${errors}`;
          } else if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else if (responseData.detail) {
            errorMessage = responseData.detail;
          }
        }

        throw new Error(errorMessage);
      }

      console.log('API Response:', responseData);

      // Close modal and refresh data
      setIsModalOpen(false);
      await fetchDesignations();

      // Show success message
      alert(selectedDesignation ? 'Designation updated successfully!' : 'Designation created successfully!');
    } catch (err) {
      console.error('Error saving designation:', err);
      setError(err instanceof Error ? err.message : 'Failed to save designation');
    }
  };

  const activeCount = designations.filter(des => des.status === 'Active').length;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (isLoading) {
    return (
      <SettingsLayout
        title="Designations"
        description="Manage employee designations and roles"
      >
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </SettingsLayout>
    );
  }

  if (error) {
    return (
      <SettingsLayout
        title="Designations"
        description="Manage employee designations and roles"
      >
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchDesignations}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout
      title="Designations"
      description="Manage your company's job titles and designations"
    >
      <div className="p-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Designations</h1>
              <p className="text-gray-600 mt-1 text-sm">Manage your company's job titles and designations</p>
            </div>
            <button
              onClick={() => {
                setEditingDesignation(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-sm hover:shadow-md transform hover:scale-105 text-sm"
            >
              <MdAdd className="w-4 h-4 mr-2" />
              Add Designation
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Designations</p>
                  <p className="text-2xl font-bold text-gray-800">{designations.length}</p>
                </div>
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg">
                  <MdWork className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-orange-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Active Designations</p>
                  <p className="text-2xl font-bold text-gray-800">{activeCount}</p>
                </div>
                <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg">
                  <MdWork className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Employees</p>
                  <p className="text-2xl font-bold text-gray-800">0</p>
                </div>
                <div className="p-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg">
                  <MdWork className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Designations List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100">
            <div className="p-4 border-b border-yellow-100">
              <h2 className="text-lg font-semibold text-gray-800">All Designations</h2>
            </div>
            
            {designations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <MdWork className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  No Designations Added
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
                  Start by adding your first designation. You can manage job titles and roles.
                </p>
                <button
                  onClick={() => {
                    setEditingDesignation(null);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-sm hover:shadow-md transform hover:scale-105 text-sm"
                >
                  <MdAdd className="w-4 h-4 mr-2" />
                  Add First Designation
                </button>
              </div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {designations.map((designation) => (
                    <div key={designation.id} className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-yellow-100 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                          <MdWork className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingDesignation(designation);
                              setIsModalOpen(true);
                            }}
                            className="p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                          >
                            <MdEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDesignation(designation.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <MdDelete className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-800 text-sm">{designation.name}</h3>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Designation Modal */}
        <DesignationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveDesignation}
          designation={editingDesignation}
        />
      </div>
    </SettingsLayout>
  );
} 