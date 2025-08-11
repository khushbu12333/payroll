'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MdSearch, MdKeyboardArrowDown } from 'react-icons/md';

interface EmployeeData {
  firstName: string;
  lastName: string;
  employeeId: string;
  department: string;
}

export default function EmployeeSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeData[]>([]);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load all saved employees from localStorage
    const loadEmployees = () => {
      const savedEmployees = localStorage.getItem('employees');
      if (savedEmployees) {
        setEmployees(JSON.parse(savedEmployees));
      }
    };

    loadEmployees();

    // Add event listener to close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Filter employees based on search query
    const filtered = employees.filter(employee => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      return fullName.includes(searchLower) || employee.employeeId.toLowerCase().includes(searchLower);
    });
    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  const handleEmployeeClick = (employeeId: string) => {
    // Find the complete employee data
    const employeeData = localStorage.getItem(`employee_${employeeId}`);
    if (employeeData) {
      localStorage.setItem('currentEmployee', employeeData);
      router.push('/employee/details');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MdSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="block w-80 pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search Employee"
        />
        <button 
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <MdKeyboardArrowDown className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-auto z-50">
          {filteredEmployees.length > 0 ? (
            filteredEmployees
              .filter(emp => emp.employeeId)
              .map(employee => (
                <button
                  key={employee.employeeId || `${employee.firstName}-${employee.lastName}-${Math.random()}`}
                  onClick={() => handleEmployeeClick(employee.employeeId)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group"
                >
                  <div>
                    <div className="text-sm font-medium text-black">
                      {employee.firstName} {employee.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {employee.employeeId} • {employee.department}
                    </div>
                  </div>
                </button>
              ))
          ) : searchQuery ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No employees found
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              Type to search employees
            </div>
          )}
        </div>
      )}
    </div>
  );
} 