'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MdSearch, MdFilterList } from 'react-icons/md';

interface EmployeeData {
  firstName: string;
  lastName: string;
  employeeId: string;
  workEmail: string;
  department: string;
}

export default function EmployeePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeData[]>([]);

  useEffect(() => {
    // Load employees from localStorage
    const loadEmployees = () => {
      try {
        const savedEmployees = localStorage.getItem('employees');
        if (savedEmployees) {
          const parsedEmployees = JSON.parse(savedEmployees);
          setEmployees(parsedEmployees);
          setFilteredEmployees(parsedEmployees);
        }
      } catch (error) {
        console.error('Error loading employees:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEmployees();
  }, []);

  useEffect(() => {
    // Filter employees based on search query
    const filtered = employees.filter(employee => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      return fullName.includes(searchLower) || 
             employee.employeeId.toLowerCase().includes(searchLower) ||
             employee.workEmail.toLowerCase().includes(searchLower) ||
             employee.department.toLowerCase().includes(searchLower);
    });
    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex-1 w-full h-full bg-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  // Show empty state when no employees
  if (!isLoading && employees.length === 0) {
    return (
      <div className="flex-1 w-full h-full bg-white">
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="mb-4">
              <Image
                src="https://static.zohocdn.com/zpayroll/zpayroll//assets/images/empty-states/add-employee-f7b147ac446fe951044595d9910d9c55.svg"
                alt="Add Employee"
                width={300}
                height={225}
                priority
                className="mx-auto"
              />
            </div>
            
            <div className="mt-6 space-x-4">
              <Link 
                href="/employee/add" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg 
                  className="w-5 h-5 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Employee
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
          <Link 
            href="/employee/add" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Employee
          </Link>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white border border-gray-200 rounded-lg mb-6">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search employees by name, ID, or department"
                />
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                <MdFilterList className="h-5 w-5 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr 
                    key={employee.employeeId}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      localStorage.setItem('currentEmployee', JSON.stringify(employee));
                      window.location.href = '/employee/details';
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{employee.workEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{employee.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{employee.employeeId}</div>
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