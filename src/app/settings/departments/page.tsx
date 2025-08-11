'use client';

import { useEffect, useState } from 'react';
import { MdEdit, MdDelete, MdAdd, MdBusiness, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import SettingsLayout from '@/components/SettingsLayout';
import DepartmentModal from '@/components/DepartmentModal';

interface Department {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
}

interface ApiDepartment {
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

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Department>>({
    name: '',
    description: '',
    status: 'Active'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, [currentPage]);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/departments/?page=${currentPage}&page_size=${itemsPerPage}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
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
        status: item.status === 'Inactive' ? 'Inactive' : 'Active' as 'Active' | 'Inactive'
      }));

      console.log('Fetched departments:', transformedData);
      setDepartments(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDepartment = () => {
    setSelectedDepartment(undefined);
    setFormData({
      name: '',
      description: '',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description,
      status: department.status
    });
    setIsModalOpen(true);
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/departments/${departmentId}/`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete department');
        }
        await fetchDepartments(); // Refresh the list
      } catch (err) {
        console.error('Error deleting department:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete department');
      }
    }
  };

  const handleToggleStatus = async (departmentId: string) => {
    try {
      const department = departments.find(dept => dept.id === departmentId);
      if (!department) return;

      const response = await fetch(`http://127.0.0.1:8000/api/departments/${departmentId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: department.status === 'Active' ? 'Inactive' : 'Active'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update department status');
      }
      await fetchDepartments(); // Refresh the list
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update department status');
    }
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = selectedDepartment 
        ? `http://127.0.0.1:8000/api/departments/${selectedDepartment.id}/`
        : 'http://127.0.0.1:8000/api/departments/';
      
      const method = selectedDepartment ? 'PUT' : 'POST';

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

        let errorMessage = 'Failed to save department';
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
      await fetchDepartments();

      // Show success message
      alert(selectedDepartment ? 'Department updated successfully!' : 'Department created successfully!');
    } catch (err) {
      console.error('Error saving department:', err);
      setError(err instanceof Error ? err.message : 'Failed to save department');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const activeCount = departments.filter(dept => dept.status === 'Active').length;

  if (isLoading) {
    return (
      <SettingsLayout
        title="Departments"
        description="Manage company departments and teams"
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
        title="Departments"
        description="Manage company departments and teams"
      >
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchDepartments}
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
      title="Departments"
      description="Manage your company's departments and organizational structure"
    >
      <div className="p-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🏢 Departments</h1>
              <p className="text-gray-600 mt-1 text-sm">Manage your company's departments and organizational structure</p>
            </div>
            <button
              onClick={() => {
                setEditingDepartment(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-sm hover:shadow-md transform hover:scale-105 text-sm"
            >
              <MdAdd className="w-4 h-4 mr-2" />
              Add Department
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Departments</p>
                  <p className="text-2xl font-bold text-gray-800">{departments.length}</p>
                </div>
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg">
                  <MdBusiness className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-orange-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Active Departments</p>
                  <p className="text-2xl font-bold text-gray-800">{activeCount}</p>
                </div>
                <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg">
                  <MdBusiness className="w-5 h-5 text-white" />
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
                  <MdBusiness className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Departments List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100">
            <div className="p-4 border-b border-yellow-100">
              <h2 className="text-lg font-semibold text-gray-800">All Departments</h2>
            </div>
            
            {departments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <MdBusiness className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  No Departments Added
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
                  Start by adding your first department. You can organize your team structure.
                </p>
                <button
                  onClick={() => {
                    setEditingDepartment(null);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-sm hover:shadow-md transform hover:scale-105 text-sm"
                >
                  <MdAdd className="w-4 h-4 mr-2" />
                  Add First Department
                </button>
              </div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map((department) => (
                    <div key={department.id} className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-yellow-100 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                          <MdBusiness className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingDepartment(department);
                              setIsModalOpen(true);
                            }}
                            className="p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                          >
                            <MdEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(department.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <MdDelete className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-800 mb-1 text-sm">{department.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">Code: {department.code}</p>
                      <p className="text-xs text-gray-600">{department.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Department Modal */}
        <DepartmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveDepartment}
          department={editingDepartment}
        />
      </div>
    </SettingsLayout>
  );
} 