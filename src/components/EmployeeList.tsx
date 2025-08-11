'use client';

import { useState, useEffect } from 'react';
import { MdPersonAdd, MdSearch, MdFilterList, MdRefresh, MdEdit, MdDelete, MdVisibility, MdEmail, MdPhone, MdLocationOn, MdBusiness, MdCalendarToday, MdAttachMoney, MdMoreVert, MdFavorite, MdShare, MdAdd } from 'react-icons/md';
import { employeeAPI, type Employee } from '@/lib/api';
import AddEmployeeModal from './AddEmployeeModal';

export default function EmployeeList({ 
  employees, 
  onDeleteEmployee 
}: { 
  employees: Employee[]; 
  onDeleteEmployee: (id: string) => void; 
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Load employees from API
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const employeeData = await employeeAPI.getAll();
      setError(null);
    } catch (error: any) {
      console.error('Error loading employees:', error);
      setError('Failed to load employees. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadEmployees();
  }, []);

  // Handle employee added
  const handleEmployeeAdded = (newEmployee: Employee) => {
    // Optionally reload all employees to get the latest data
    loadEmployees();
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEmployees();
    setRefreshing(false);
  };

  // Enhanced filtering
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || employee.department_name === selectedDepartment;
    const matchesStatus = !selectedStatus || employee.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getInitialColor = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-yellow-300 to-yellow-400',
      'bg-gradient-to-br from-orange-300 to-orange-400', 
      'bg-gradient-to-br from-blue-300 to-blue-400',
      'bg-gradient-to-br from-cyan-300 to-cyan-400',
      'bg-gradient-to-br from-green-300 to-green-400',
      'bg-gradient-to-br from-purple-300 to-purple-400',
      'bg-gradient-to-br from-pink-300 to-pink-400',
      'bg-gradient-to-br from-red-300 to-red-400'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-300 shadow-sm';
      case 'INACTIVE':
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300 shadow-sm';
      case 'SUSPENDED':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 border-yellow-300 shadow-sm';
      default:
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300 shadow-sm';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 animate-pulse shadow-sm border border-yellow-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-yellow-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-yellow-200 rounded w-3/4"></div>
                <div className="h-3 bg-yellow-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-yellow-200 rounded"></div>
              <div className="h-3 bg-yellow-200 rounded w-2/3"></div>
              <div className="h-3 bg-yellow-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-gradient-to-br from-red-300 to-red-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <MdRefresh className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-red-700 mb-2">Connection Error</h3>
        <p className="text-red-600 mb-6 text-sm">{error}</p>
        <button
          onClick={handleRefresh}
          className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-400 to-red-500 text-white font-medium rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 overflow-hidden text-sm"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
          <MdRefresh className="w-4 h-4 mr-2 relative z-10" />
          <span className="relative z-10">Try Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Employee Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredEmployees.map((employee) => (
          <div
            key={employee.id}
            className="group relative bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100 p-4 hover:shadow-md transition-all duration-300 transform hover:scale-105 hover:bg-white/90 overflow-hidden"
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-200/10 to-orange-200/10 rounded-full transform translate-x-10 -translate-y-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-blue-200/10 to-cyan-200/10 rounded-full transform -translate-x-8 translate-y-8"></div>
            
            {/* Employee Header */}
            <div className="relative flex items-center mb-4">
              <div className={`w-12 h-12 rounded-lg ${getInitialColor(employee.first_name)} flex items-center justify-center text-white font-bold text-sm mr-3 shadow-sm group-hover:shadow-md transition-shadow`}>
                {getInitials(employee.first_name, employee.last_name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-700 group-hover:text-yellow-600 transition-colors truncate mb-1">
                  {employee.first_name} {employee.last_name}
                </h3>
                <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded-md inline-block">#{employee.employee_id}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(employee.status)}`}>
                  {employee.status_display || employee.status}
                </span>
                <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all duration-200">
                  <MdMoreVert className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Employee Details */}
            <div className="relative space-y-2 mb-4">
              <div className="flex items-center text-sm group/item">
                <div className="w-6 h-6 bg-yellow-100 rounded-md flex items-center justify-center mr-2 group-hover/item:bg-yellow-200 transition-colors">
                  <MdEmail className="w-3 h-3 text-yellow-600" />
                </div>
                <span className="text-gray-700 font-medium truncate">{employee.email}</span>
              </div>
              
              {employee.phone && (
                <div className="flex items-center text-sm group/item">
                  <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center mr-2 group-hover/item:bg-green-200 transition-colors">
                    <MdPhone className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700 truncate">{employee.phone}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm group/item">
                <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center mr-2 group-hover/item:bg-orange-200 transition-colors">
                  <MdBusiness className="w-3 h-3 text-orange-600" />
                </div>
                <span className="text-gray-700 font-medium truncate">{employee.department_name}</span>
              </div>
              
              <div className="flex items-center text-sm group/item">
                <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center mr-2 group-hover/item:bg-blue-200 transition-colors">
                  <MdLocationOn className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-gray-700 truncate">{employee.designation_name}</span>
              </div>
              
              {employee.work_location_name && (
                <div className="flex items-center text-sm group/item">
                  <div className="w-6 h-6 bg-cyan-100 rounded-md flex items-center justify-center mr-2 group-hover/item:bg-cyan-200 transition-colors">
                    <MdLocationOn className="w-3 h-3 text-cyan-600" />
                  </div>
                  <span className="text-gray-700 truncate">{employee.work_location_name}</span>
                </div>
              )}
            </div>

            {/* Employee Stats */}
            <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 mb-4 border border-gray-200/50">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center group/item">
                  <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center mr-2 group-hover/item:bg-blue-200 transition-colors">
                    <MdCalendarToday className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Joined</p>
                    <p className="font-bold text-gray-700 text-xs">
                      {new Date(employee.date_of_joining).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {employee.annual_ctc && (
                  <div className="flex items-center group/item">
                    <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center mr-2 group-hover/item:bg-green-200 transition-colors">
                      <MdAttachMoney className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Annual CTC</p>
                      <p className="font-bold text-green-600 text-xs">
                        ₹{parseInt(employee.annual_ctc).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="relative flex items-center justify-between pt-3 border-t border-gray-200/50">
              <div className="flex items-center space-x-1">
                <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 hover:scale-110" title="View Details">
                  <MdVisibility className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-all duration-200 hover:scale-110" title="Edit Employee">
                  <MdEdit className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-md transition-all duration-200 hover:scale-110" title="Send Email">
                  <MdEmail className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-md transition-all duration-200 hover:scale-110" title="Share Profile">
                  <MdShare className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center space-x-1">
                <button className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-md transition-all duration-200 hover:scale-110" title="Add to Favorites">
                  <MdFavorite className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteEmployee(employee.id?.toString() || '')}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-all duration-200 hover:scale-110"
                  title="Delete Employee"
                >
                  <MdDelete className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Empty State */}
      {filteredEmployees.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <MdPersonAdd className="w-10 h-10 text-gray-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-sm animate-bounce">
              <MdAdd className="w-3 h-3 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-4">
            {searchTerm ? 'No employees found' : 'No employees yet'}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            {searchTerm 
              ? `No employees match your search "${searchTerm}"`
              : 'Start building your dream team by adding your first employee'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 overflow-hidden text-sm"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <MdPersonAdd className="w-4 h-4 mr-2 relative z-10" />
              <span className="relative z-10">Add First Employee</span>
            </button>
          )}
        </div>
      )}

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onEmployeeAdded={handleEmployeeAdded}
      />
    </div>
  );
} 