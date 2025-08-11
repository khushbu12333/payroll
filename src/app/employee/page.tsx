"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Edit, Trash2, Eye, Building, Calendar, DollarSign, Mail, Phone, MapPin, Filter, Search, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import employeeAPI, { type Employee } from '@/lib/api';

// Utility function to format dates
function formatDate(dateString: string) {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Invalid Date';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy}`;
  } catch (error) {
    return 'Invalid Date';
  }
}

// Toast notification component
const Toast: React.FC<{
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      <div className="flex items-center space-x-2">
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-lg">&times;</button>
      </div>
    </div>
  );
};

const EmployeePage: React.FC = () => {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<string | null>(null);
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Show toast notification
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  // Load employees with improved error handling
  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading employees...');
      const employeeData = await employeeAPI.getAll();
      
      if (Array.isArray(employeeData)) {
        setEmployees(employeeData);
        console.log(`Loaded ${employeeData.length} employees successfully`);
      } else {
        console.error('Invalid employee data format:', employeeData);
        setError('Invalid data format received from server');
      }
    } catch (error: any) {
      console.error('Error loading employees:', error);
      const message = error?.message || 'Unknown error occurred';
      setError(`Failed to load employees: ${message}`);
      
      // Test API connection
      try {
        const connectionOk = await employeeAPI.testConnection();
        if (!connectionOk) {
          setError('Connection Error: Unable to reach the server.');
        }
      } catch (connError) {
        console.error('Connection test failed:', connError);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Listen for focus events to refresh data
  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing data...');
        loadEmployees();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadEmployees();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadEmployees]);

  // Function to handle successful employee addition
  const handleEmployeeAdded = useCallback((newEmployee: Employee) => {
    setEmployees(prev => [newEmployee, ...prev]);
    showToast('Employee added successfully!', 'success');
  }, [showToast]);

  // Function to refresh employee data
  const refreshEmployees = useCallback(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Get unique departments and statuses for filters
  const departments = ['All', ...Array.from(new Set(employees.map(e => (e as any).department_name || (e as any).department).filter(Boolean)))];
  const statuses = ['All', 'ACTIVE', 'INACTIVE', 'TERMINATED'];

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const email = (emp.work_email || '').toLowerCase();
    const phoneAny = emp.mobile_number || emp.phone_number || '';
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      (phoneAny && phoneAny.includes(searchTerm));
    const empDept = (emp as any).department_name || (emp as any).department;
    const matchesDepartment = filterDepartment === 'All' || empDept === filterDepartment;
    const matchesStatus = filterStatus === 'All' || emp.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Calculate statistics
  const totalEmployees = employees.length;
  const totalDepartments = new Set(employees.map(e => e.department_name).filter(Boolean)).size;
  const newJoiners = employees.filter(e => {
    try {
      const joinDate = new Date(e.date_of_joining);
      const now = new Date();
      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
    } catch {
      return false;
    }
  }).length;
  const avgCTC = employees.length
    ? `₹${Math.round(employees.reduce((sum, e) => sum + Number(e.annual_ctc || 0), 0) / employees.length).toLocaleString()}`
    : '₹0';

  // Handle edit employee
  const handleEdit = useCallback((employee: Employee) => {
    setEditEmployee({ ...employee }); // Create a copy to avoid mutations
    setIsEditMode(true);
    setIsDrawerOpen(true);
    setViewEmployee(null);
  }, []);

  // Handle view employee
  const handleView = useCallback((employee: Employee) => {
    setViewEmployee(employee);
    setIsDrawerOpen(true);
    setIsEditMode(false);
    setEditEmployee(null);
  }, []);

  // Handle delete employee
  const handleDelete = useCallback((id: string) => {
    setDeleteEmployeeId(id);
    setShowDeleteConfirm(true);
  }, []);

  // Confirm delete employee
  const confirmDelete = useCallback(async () => {
    if (!deleteEmployeeId) return;
    
    try {
      await employeeAPI.delete(deleteEmployeeId);
      setEmployees(prev => prev.filter(emp => emp.employee_id !== deleteEmployeeId));
      showToast('Employee deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting employee:', error);
      showToast('Failed to delete employee. Please try again.', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setDeleteEmployeeId(null);
    }
  }, [deleteEmployeeId, showToast]);

  // Handle save changes
  const handleSaveChanges = useCallback(async () => {
    if (!editEmployee) return;
    
    try {
      setSaving(true);
      const updatedEmployee = await employeeAPI.update(editEmployee.employee_id, editEmployee);
      setEmployees(prev => prev.map(emp => 
        emp.employee_id === updatedEmployee.employee_id ? updatedEmployee : emp
      ));
      setIsDrawerOpen(false);
      setEditEmployee(null);
      setIsEditMode(false);
      showToast('Employee updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating employee:', error);
      showToast('Failed to update employee. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }, [editEmployee, showToast]);

  // Get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'TERMINATED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  // Handle refresh button click
  const handleRefresh = useCallback(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Close drawer
  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setViewEmployee(null);
    setEditEmployee(null);
    setIsEditMode(false);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading employees...</p>
            <p className="text-sm text-gray-500 mt-2">Connecting to API...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
          <div className="text-center max-w-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
            <p className="text-gray-600 mb-6 whitespace-pre-wrap">{error}</p>
            <div className="space-y-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-6 py-3 bg-yellow-500 text-white font-semibold rounded-xl hover:bg-yellow-600 transition-colors duration-200"
              >
                Retry Connection
              </button>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Troubleshooting steps:</p>
                <ul className="text-left list-disc list-inside space-y-1">
                  <li>Check if your backend server is running</li>
                  <li>Verify API URL in environment variables</li>
                  <li>Check network connectivity</li>
                  <li>Look at browser console for detailed errors</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto min-h-screen bg-gray-50 p-6">
        {/* Toast notifications */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Employee's Details</h1>
                <p className="text-gray-600">Manage your organization's employees</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
                title="Refresh employee list"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              <Link
                href="/employee/add"
                className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
              </Link>
            </div>
          </div>
        </div>
            
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">{totalDepartments}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Joiners</p>
                <p className="text-2xl font-bold text-gray-900">{newJoiners}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. CTC</p>
                <p className="text-2xl font-bold text-gray-900">{avgCTC}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
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
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-4 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map(employee => (
            <div key={employee.employee_id} className="bg-white rounded-xl shadow-sm border border-yellow-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{employee.first_name} {employee.last_name}</h3>
                      <p className="text-sm text-gray-500">{employee.designation_name || 'No designation'}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(employee.status)}`}>
                    {employee.status_display || employee.status}
                  </span>
                </div>
                    
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{employee.work_email}</span>
                  </div>
                  {(employee.mobile_number || employee.phone_number) && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{employee.mobile_number || employee.phone_number}</span>
                    </div>
                  )}
                  {employee.department_name && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{employee.department_name}</span>
                    </div>
                  )}
                  {employee.work_location_name && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{employee.work_location_name}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Joined: {formatDate(employee.date_of_joining)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>₹{Number(employee.annual_ctc || 0).toLocaleString()}/year</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">ID: {employee.employee_id}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleView(employee)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <Link href={`/employee/edit/${employee.employee_id}`}>
                      <button
                        className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors duration-200"
                        title="Edit Employee"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(employee.employee_id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                      title="Delete Employee"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No employees found matching your criteria</p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this employee? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View/Edit Employee Drawer */}
        {isDrawerOpen && (viewEmployee || editEmployee) && (
          <>
            {/* Overlay with blur */}
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40"></div>
            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                      {isEditMode ? 'Edit Employee' : 'Employee Details'}
                    </h2>
                    <button
                      onClick={closeDrawer}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      <span className="text-gray-500 text-xl">&times;</span>
                    </button>
                  </div>

                  {isEditMode && editEmployee ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <input
                            type="text"
                            value={editEmployee.first_name ?? ''}
                            onChange={(e) => setEditEmployee({...editEmployee, first_name: e.target.value})}
                            className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <input
                            type="text"
                            value={editEmployee.last_name ?? ''}
                            onChange={(e) => setEditEmployee({...editEmployee, last_name: e.target.value})}
                            className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
                          <input
                            type="email"
                            value={editEmployee.work_email ?? ''}
                            onChange={(e) => setEditEmployee({...editEmployee, work_email: e.target.value})}
                            className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={editEmployee.mobile_number || editEmployee.phone_number || ''}
                            onChange={(e) => setEditEmployee({...editEmployee, mobile_number: e.target.value})}
                            className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            value={editEmployee.status}
                            onChange={(e) => setEditEmployee({...editEmployee, status: e.target.value as any})}
                            className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="TERMINATED">Terminated</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Annual CTC</label>
                          <input
                            type="number"
                            value={editEmployee.annual_ctc ?? ''}
                            onChange={(e) => setEditEmployee({...editEmployee, annual_ctc: e.target.value})}
                            className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={closeDrawer}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveChanges}
                          disabled={saving}
                          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  ) : viewEmployee ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                          <p className="text-gray-900 bg-gray-50 p-2 rounded-lg">{viewEmployee.employee_id}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <p className="text-gray-900 bg-gray-50 p-2 rounded-lg">{viewEmployee.first_name} {viewEmployee.last_name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
                          <p className="text-gray-900 bg-gray-50 p-2 rounded-lg">{viewEmployee.work_email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <p className="text-gray-900 bg-gray-50 p-2 rounded-lg">{viewEmployee.mobile_number || viewEmployee.phone_number || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                          <p className="text-gray-900 bg-gray-50 p-2 rounded-lg">{viewEmployee.department_name || 'Not assigned'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                          <p className="text-gray-900 bg-gray-50 p-2 rounded-lg">{viewEmployee.designation_name || 'Not assigned'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Work Location</label>
                          <p className="text-gray-900 bg-gray-50 p-2 rounded-lg">{viewEmployee.work_location_name || 'Not assigned'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <p className="text-gray-900 bg-gray-50 p-2 rounded-lg">{viewEmployee.status_display || viewEmployee.status}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                          <p className="text-gray-900 bg-gray-50 p-2 rounded-lg">{formatDate(viewEmployee.date_of_joining)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Annual CTC</label>
                          <p className="text-gray-900 bg-gray-50 p-2 rounded-lg">₹{Number(viewEmployee.annual_ctc || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(viewEmployee)}
                          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-200"
                        >
                          Edit Employee
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployeePage;