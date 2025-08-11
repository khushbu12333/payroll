'use client';

import { useState, useEffect } from 'react';
import { MdRefresh, MdPersonAdd, MdSearch, MdEdit, MdDelete, MdVisibility, MdCheckCircle, MdError } from 'react-icons/md';
import { employeeAPI, departmentAPI, type Employee, type Department } from '@/lib/api';

interface ConnectionStatus {
  api: boolean;
  database: boolean;
  admin: boolean;
}

export default function EmployeeDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    api: false,
    database: false,
    admin: false
  });
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Load all data and check connections
  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading employee data from API...');
      
      // Test API connection
      const [employeeData, deptData] = await Promise.all([
        employeeAPI.getAll(),
        departmentAPI.getAll()
      ]);
      
      setEmployees(employeeData);
      setDepartments(deptData);
      
      // Update connection status
      setConnectionStatus({
        api: true,
        database: true, // If API works, database is connected
        admin: true     // If API works, admin is accessible
      });
      
      setLastRefresh(new Date());
      console.log(`✅ Loaded ${employeeData.length} employees successfully`);
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setConnectionStatus({
        api: false,
        database: false,
        admin: false
      });
      alert('⚠️ Cannot connect to backend. Please ensure Django server is running on localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  // Auto refresh every 30 seconds
  useEffect(() => {
    loadAllData();
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing employee data...');
      loadAllData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Delete employee
  const handleDeleteEmployee = async (employee: Employee) => {
    if (!confirm(`Delete ${employee.full_name}? This will remove them from the database permanently.`)) return;

    try {
      await employeeAPI.delete(employee.id!);
      alert(`✅ ${employee.full_name} deleted successfully!`);
      
      // Immediately refresh data
      await loadAllData();
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      alert('❌ Failed to delete employee: ' + error.message);
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700">Loading Employee Data...</p>
          <p className="text-sm text-gray-500">Connecting to Django API on localhost:8000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Connection Status */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">👥 Employee Dashboard</h1>
              <p className="text-blue-100 mb-4">
                Real-time employee management with live database synchronization
              </p>
              
              {/* Connection Status Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2 bg-blue-700/50 rounded-lg p-3">
                  {connectionStatus.api ? (
                    <MdCheckCircle className="w-5 h-5 text-green-300" />
                  ) : (
                    <MdError className="w-5 h-5 text-red-300" />
                  )}
                  <span className="font-semibold">🔌 API:</span>
                  <span className={connectionStatus.api ? 'text-green-300' : 'text-red-300'}>
                    {connectionStatus.api ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 bg-blue-700/50 rounded-lg p-3">
                  {connectionStatus.database ? (
                    <MdCheckCircle className="w-5 h-5 text-green-300" />
                  ) : (
                    <MdError className="w-5 h-5 text-red-300" />
                  )}
                  <span className="font-semibold">🗄️ Database:</span>
                  <span className={connectionStatus.database ? 'text-green-300' : 'text-red-300'}>
                    {connectionStatus.database ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 bg-blue-700/50 rounded-lg p-3">
                  {connectionStatus.admin ? (
                    <MdCheckCircle className="w-5 h-5 text-green-300" />
                  ) : (
                    <MdError className="w-5 h-5 text-red-300" />
                  )}
                  <span className="font-semibold">⚙️ Admin:</span>
                  <span className={connectionStatus.admin ? 'text-green-300' : 'text-red-300'}>
                    {connectionStatus.admin ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
            
            {lastRefresh && (
              <div className="text-right text-blue-100">
                <p className="text-sm">Last Updated:</p>
                <p className="font-semibold">{lastRefresh.toLocaleTimeString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats and Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Employee Database ({employees.length} employees)
              </h2>
              <p className="text-gray-600">
                {departments.length} departments • Real-time synchronization
              </p>
            </div>
            
            <div className="flex space-x-4">
              <a
                href="/management"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <MdPersonAdd className="w-5 h-5 mr-2" />
                Add Employee
              </a>
              
              <button
                onClick={loadAllData}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <MdRefresh className="w-5 h-5 mr-2" />
                Refresh Data
              </button>
            </div>
          </div>

          {/* Quick Access Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <a 
              href="http://localhost:8000/api/employees/" 
              target="_blank"
              className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all"
            >
              <div className="p-2 bg-blue-500 rounded-lg mr-3">
                <MdVisibility className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">View Raw API Data</h3>
                <p className="text-sm text-blue-700">JSON response from Django</p>
              </div>
            </a>
            
            <a 
              href="http://localhost:8000/admin/payroll/employee/" 
              target="_blank"
              className="flex items-center p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-all"
            >
              <div className="p-2 bg-purple-500 rounded-lg mr-3">
                <MdEdit className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">Django Admin Panel</h3>
                <p className="text-sm text-purple-700">Manage via admin interface</p>
              </div>
            </a>
            
            <a 
              href="/management"
              className="flex items-center p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-all"
            >
              <div className="p-2 bg-green-500 rounded-lg mr-3">
                <MdPersonAdd className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Full Management</h3>
                <p className="text-sm text-green-700">Complete CRUD operations</p>
              </div>
            </a>
          </div>

          {/* Search */}
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search employees by name, ID, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Employee Grid */}
        {connectionStatus.api ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">ID: {employee.employee_id}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    employee.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {employee.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p><span className="font-medium">Email:</span> {employee.email}</p>
                  <p><span className="font-medium">Department:</span> {employee.department_name}</p>
                  <p><span className="font-medium">Role:</span> {employee.designation_name}</p>
                  <p><span className="font-medium">Salary:</span> ₹{parseInt(employee.annual_ctc || '0').toLocaleString()}/year</p>
                </div>

                <div className="flex space-x-2">
                  <a
                    href="/management"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <MdEdit className="w-4 h-4 mr-2" />
                    Edit
                  </a>
                  <button
                    onClick={() => handleDeleteEmployee(employee)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-all"
                  >
                    <MdDelete className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdError className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cannot Connect to Backend
            </h3>
            <p className="text-gray-600 mb-6">
              Please ensure Django server is running on localhost:8000
            </p>
            <button
              onClick={loadAllData}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
            >
              <MdRefresh className="w-5 h-5 mr-2" />
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State for Search */}
        {connectionStatus.api && filteredEmployees.length === 0 && searchTerm && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdSearch className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No employees found
            </h3>
            <p className="text-gray-600 mb-6">
              No employees match "{searchTerm}"
            </p>
          </div>
        )}

        {/* No Employees Yet */}
        {connectionStatus.api && employees.length === 0 && !searchTerm && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdPersonAdd className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No employees in database
            </h3>
            <p className="text-gray-600 mb-6">
              Add your first employee to get started
            </p>
            <a
              href="/management"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
            >
              <MdPersonAdd className="w-5 h-5 mr-2" />
              Add First Employee
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 