'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Search, Plus, Trash2, Edit3, Users, Calculator, Download, Filter, Eye, EyeOff } from 'lucide-react';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  MdArrowBack, 
  MdSettings,
  MdBusiness,
  MdLocationOn,
  MdPeople,
  MdWork,
  MdAttachMoney,
  MdReceipt,
  MdEventNote,
  MdGroup,
  MdEmail,
  MdDashboard,
  MdDescription
} from 'react-icons/md';
import SettingsLayout from '@/components/SettingsLayout';

type Employee = {
  id: number;
  name: string;
  position: string;
  grossPay: number;
  deductions: number;
  bonus: number;
  overtime: number;
  department: string;
  joinDate: string;
};

const settingsNavigation = [
  { 
    name: 'Organization Profile', 
    href: '/settings/organisation', 
    icon: MdBusiness,
    description: 'Company details and basic information'
  },
  { 
    name: 'Work Locations', 
    href: '/settings/locations', 
    icon: MdLocationOn,
    description: 'Manage office locations'
  },
  { 
    name: 'Departments', 
    href: '/settings/departments', 
    icon: MdPeople,
    description: 'Create and manage departments'
  },
  { 
    name: 'Designations', 
    href: '/settings/designations', 
    icon: MdWork,
    description: 'Define job titles and positions'
  },
  { 
    name: 'Salary Components', 
    href: '/settings/salary-components', 
    icon: MdAttachMoney,
    description: 'Configure earnings and deductions'
  },
  { 
    name: 'Salary Templates', 
    href: '/settings/salary-templates', 
    icon: MdReceipt,
    description: 'Create reusable salary structures'
  },
  { 
    name: 'Leave & Attendance', 
    href: '/settings/leave-attendance', 
    icon: MdEventNote,
    description: 'Set up leave types and attendance'
  },
  { 
    name: 'Users & Roles', 
    href: '/settings/users-roles', 
    icon: MdGroup,
    description: 'Manage user access and permissions'
  },
  { 
    name: 'Email Templates', 
    href: '/settings/email-templates', 
    icon: MdEmail,
    description: 'Customize email templates'
  }
];

// Add Documents to navigation if we're on a documents page
const additionalRoutes = [
  {
    name: 'Documents',
    href: '/documents',
    icon: MdDescription,
    description: 'Manage company documents'
  }
];

const PayrollPage = () => {
  const [payDate, setPayDate] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'grossPay' | 'netPay'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showPayDetails, setShowPayDetails] = useState(false);
  
  // Add loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add state for available employees
  const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);
  
  const [newEmployee, setNewEmployee] = useState({
    employee_id: '', // Changed from 'name'
    month: '',
    designation: '',
    daysWorked: '30',
    department: '',
    totalIncome: '',
    totalEarnings: '', // Added to match DB
    basicSalary: '',
    hra: '',
    bonus: '0',
    overtime: '0',
    conveyance: '',
    meal: '',
    telephone: '',
    medical: '',
    personalPay: '',
    professionTax: '0',
    advance: '0',
    totalDeduction: '0',
    totalDeductions: '0', // Added to match DB
  });

  const departments = ['HR', 'Engineering', 'Sales', 'Marketing', 'IT', 'Finance', 'Operations'];

  // Improved API configuration with better error handling
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const API_ENDPOINT = `${API_BASE_URL}/api/payroll/`;

  // Enhanced fetch function with comprehensive error handling
  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching payroll data from:', API_ENDPOINT);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(API_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
        mode: 'cors', // Explicitly set CORS mode
      });

      clearTimeout(timeoutId);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('API endpoint not found, using mock data');
          // Use mock data when API is not available
          const mockEmployees = [
            {
              id: 1,
              name: 'John Doe',
              position: 'Software Engineer',
              grossPay: 75000,
              deductions: 5000,
              bonus: 2000,
              overtime: 1500,
              department: 'Engineering',
              joinDate: '2024-01-15'
            },
            {
              id: 2,
              name: 'Jane Smith',
              position: 'HR Manager',
              grossPay: 65000,
              deductions: 4500,
              bonus: 1500,
              overtime: 0,
              department: 'HR',
              joinDate: '2023-12-01'
            }
          ];
          setEmployees(mockEmployees);
          setError('Using demo data - API server not available');
          return;
        }
        
        let errorMessage = '';
        try {
          const errorData = await response.json();
          if (errorData.detail) errorMessage += errorData.detail;
          if (errorData.errors) {
            Object.entries(errorData.errors).forEach(([field, messages]) => {
              errorMessage += `\n${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
            });
          }
        } catch (jsonError) {
          try {
            const errorText = await response.text();
            errorMessage += errorText;
          } catch (textError) {
            errorMessage += response.statusText;
          }
        }
        throw new Error(`HTTP ${response.status}: ${errorMessage || response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        throw new Error(`Expected JSON response but got: ${contentType}`);
      }

      const data = await response.json();
      console.log('Received data:', data);

      // Handle different response structures more robustly
      let employeeData = [];
      
      if (data?.results && Array.isArray(data.results)) {
        employeeData = data.results;
      } else if (Array.isArray(data)) {
        employeeData = data;
      } else if (data?.data && Array.isArray(data.data)) {
        employeeData = data.data;
      } else {
        console.warn('Unexpected data structure:', data);
        employeeData = [];
      }

      const employees = employeeData.map((item: any, index: number) => ({
        id: item.id || Date.now() + index,
        name: item.employee_name || (item.employee?.first_name && item.employee?.last_name ? `${item.employee.first_name} ${item.employee.last_name}` : `Employee ${index + 1}`),
        position: item.designation || item.position || 'Not Specified',
        grossPay: parseFloat(item.total_income || item.gross_pay || '0'),
        deductions: parseFloat(item.total_deductions || '0'),
        bonus: parseFloat(item.bonus || '0'),
        overtime: parseFloat(item.overtime || '0'),
        department: item.department || 'Not Assigned',
        joinDate: item.pay_period_start || new Date().toISOString().split('T')[0]
      }));

      setEmployees(employees);
      
      if (employees.length === 0) {
        setError('No employee data found in the API response.');
      }
      
    } catch (error: unknown) {
      console.error('Error fetching payroll data:', error);
      
      let errorMessage = 'Failed to fetch payroll data';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. The server is taking too long to respond.';
        } else if (error instanceof TypeError && error.message.includes('fetch')) {
          errorMessage = `Network Error: Cannot connect to ${API_BASE_URL}. Please ensure:\n` +
                       '• Django server is running\n' +
                       '• CORS is properly configured\n' +
                       '• API endpoint exists';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      // Load mock data on error for demonstration
      const mockEmployees = [
        {
          id: 1,
          name: 'John Doe',
          position: 'Software Engineer',
          grossPay: 75000,
          deductions: 5000,
          bonus: 2000,
          overtime: 1500,
          department: 'Engineering',
          joinDate: '2024-01-15'
        },
        {
          id: 2,
          name: 'Jane Smith',
          position: 'HR Manager',
          grossPay: 65000,
          deductions: 4500,
          bonus: 1500,
          overtime: 0,
          department: 'HR',
          joinDate: '2023-12-01'
        }
      ];
      setEmployees(mockEmployees);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPayrollData();
    fetchAvailableEmployees();
  }, []);

  // Filter and sort employees
  useEffect(() => {
    let filtered = employees.filter((emp) => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emp.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !selectedDepartment || emp.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });

    // Sort employees
    filtered.sort((a, b) => {
      let aValue: number | string = sortBy === 'name' ? '' : 0;
      let bValue: number | string = sortBy === 'name' ? '' : 0;

      if (sortBy === 'name') {
        aValue = a.name;
        bValue = b.name;
      } else if (sortBy === 'grossPay') {
        aValue = a.grossPay;
        bValue = b.grossPay;
      } else if (sortBy === 'netPay') {
        aValue = a.grossPay - a.deductions + a.bonus + a.overtime;
        bValue = b.grossPay - b.deductions + b.bonus + b.overtime;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc'
          ? (aValue ?? 0) - (bValue ?? 0)
          : (bValue ?? 0) - (aValue ?? 0);
      }
      return 0;
    });

    setFilteredEmployees(filtered);
  }, [searchTerm, selectedDepartment, employees, sortBy, sortOrder]);

  const calculateNetPay = (emp: Employee) => {
    return emp.grossPay - emp.deductions + emp.bonus + emp.overtime;
  };

  const getTotalPayroll = () => {
    return filteredEmployees.reduce((total, emp) => total + calculateNetPay(emp), 0);
  };

  // Fetch available employees from the employee page
  const fetchAvailableEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employees/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableEmployees(data.results || []);
        console.log('Available employees:', data.results);
      } else {
        console.error('Failed to fetch available employees');
      }
    } catch (error) {
      console.error('Error fetching available employees:', error);
    }
  };

  // Improved employee validation and creation
  const validateEmployeeData = () => {
    const errors = [];

    if (!newEmployee.employee_id.trim()) {
      errors.push('Employee name is required');
    }

    if (!newEmployee.month) {
      errors.push('Month is required');
    }
    
    if (!newEmployee.designation.trim()) {
      errors.push('Designation is required');
    }
    
    if (!newEmployee.department) {
      errors.push('Department is required');
    }
    
    if (!newEmployee.totalIncome || parseFloat(newEmployee.totalIncome) <= 0) {
      errors.push('Valid total income is required');
    }
    
    return errors;
  };

  // const handleAddEmployee = async () => {
  //   const validationErrors = validateEmployeeData();
  //   if (validationErrors.length > 0) {
  //     alert('Please fix the following errors:\n' + validationErrors.join('\n'));
  //     return;
  //   }

  //   try {
  //     setLoading(true);
      
  //     // Calculate net salary
  //     const totalIncome = parseFloat(newEmployee.totalIncome) || 0;
  //     const totalDeduction = parseFloat(newEmployee.totalDeduction) || 0;
  //     const bonus = parseFloat(newEmployee.bonus) || 0;
  //     const overtime = parseFloat(newEmployee.overtime) || 0;
  //     const netSalary = totalIncome - totalDeduction + bonus + overtime;
      
  //     const monthDate = new Date(newEmployee.month + '-01');
  //     const payPeriodStart = newEmployee.month + '-01';
  //     const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  //     const payPeriodEnd = `${newEmployee.month}-${lastDay.toString().padStart(2, '0')}`;
      

  //     const employeeData = {
  //       employee_id: newEmployee.employee_id.trim(), // Changed from 'name'
  //       designation: newEmployee.designation.trim(),
  //       department: newEmployee.department,
  //       pay_period_start: payPeriodStart,
  //       pay_period_end: payPeriodEnd,
  //       month: newEmployee.month,
  //       days_worked: parseInt(newEmployee.daysWorked) || 30,
  //       basic_salary: parseFloat(newEmployee.basicSalary) || 0,
  //       hra: parseFloat(newEmployee.hra) || 0,
  //       conveyance: parseFloat(newEmployee.conveyance) || 0,
  //       meal_allowance: parseFloat(newEmployee.meal) || 0,
  //       telephone_allowance: parseFloat(newEmployee.telephone) || 0,
  //       medical_allowance: parseFloat(newEmployee.medical) || 0,
  //       personal_pay: parseFloat(newEmployee.personalPay) || 0,
  //       bonus: parseFloat(newEmployee.bonus) || 0,
  //       overtime: parseFloat(newEmployee.overtime) || 0,
  //       total_income: parseFloat(newEmployee.totalIncome) || 0,
  //       total_earnings: parseFloat(newEmployee.totalIncome) || 0, // Same as total_income
  //       profession_tax: parseFloat(newEmployee.professionTax) || 0,
  //       advance: parseFloat(newEmployee.advance) || 0,
  //       total_deduction: parseFloat(newEmployee.totalDeduction) || 0,
  //       total_deductions: parseFloat(newEmployee.totalDeduction) || 0, // Same as total_deduction
  //       net_salary: netSalary,
  //       status: 'active'
  //     };

  //     console.log('Sending employee data:', employeeData);

  //     const response = await fetch(API_ENDPOINT, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Accept': 'application/json',
  //       },
  //       body: JSON.stringify(employeeData),
  //       mode: 'cors',
  //     });

  //     console.log('Add employee response status:', response.status);

  //     try {
  //       const response = await fetch(API_ENDPOINT, {
  //         // ... your fetch config
  //       });
      
  //       if (!response.ok) {
  //         const errorData = await response.json();
  //         console.error('Server validation errors:', errorData);
  //         // Display these errors to the user
  //         if (errorData.errors) {
  //           alert(`Validation errors:\n${JSON.stringify(errorData.errors, null, 2)}`);
  //         } else {
  //           alert(`Error: ${errorData.detail || 'Unknown server error'}`);
  //         }
  //         return;
  //       }
      
  //       // ... rest of your success handling
  //     } catch (error) {
  //       console.error('Network error:', error);
  //       alert('Network error - check console for details');
  //     }

  //     if (!response.ok) {
  //       let errorMessage = '';
  //       try {
  //         const errorData = await response.json();
  //         if (errorData.detail) errorMessage += errorData.detail;
  //         if (errorData.errors) {
  //           Object.entries(errorData.errors).forEach(([field, messages]) => {
  //             errorMessage += `\n${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
  //           });
  //         }
  //         throw new Error(errorMessage || response.statusText);
  //       } catch (jsonError) {
  //         try {
  //           const errorText = await response.text();
  //           throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  //         } catch (textError) {
  //           throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  //         }
  //       }
  //     }

  //     const result = await response.json();
  //     console.log('Employee added successfully:', result);

  //     // Add the new employee to the local state immediately
  //     const newEmpForState: Employee = {
  //       id: result.id || Date.now(),
  //       name: employeeData.employee_id || '', // Use employee_id as name fallback, since employee_name and name do not exist
  //       position: employeeData.designation,
  //       grossPay: employeeData.total_income,
  //       deductions: employeeData.total_deduction,
  //       bonus: employeeData.bonus,
  //       overtime: employeeData.overtime,
  //       department: employeeData.department,
  //       joinDate: employeeData.pay_period_start,
  //     };
      
  //     setEmployees(prev => [...prev, newEmpForState]);
      
  //     // Reset form
  //     resetForm();
  //     setShowAddModal(false);
      
  //     alert('Employee added successfully!');
      
  //   } catch (error: unknown) {
  //     console.error('Error adding employee:', error);
  //     const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  //     alert(`Failed to add employee:\n${errorMessage}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleAddEmployee = async () => {
    const validationErrors = validateEmployeeData();
    if (validationErrors.length > 0) {
      alert('Please fix the following errors:\n' + validationErrors.join('\n'));
      return;
    }
  
    try {
      setLoading(true);
      
      // Calculate values
      const totalIncome = parseFloat(newEmployee.totalIncome) || 0;
      const totalDeduction = parseFloat(newEmployee.totalDeduction) || 0;
      const bonus = parseFloat(newEmployee.bonus) || 0;
      const overtime = parseFloat(newEmployee.overtime) || 0;
      const netSalary = totalIncome - totalDeduction + bonus + overtime;
      
      // Create pay period dates
      const monthDate = new Date(newEmployee.month + '-01');
      const payPeriodStart = newEmployee.month + '-01';
      const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      const payPeriodEnd = `${newEmployee.month}-${lastDay.toString().padStart(2, '0')}`;
  
      // First, we need to create or get the employee
      let employee;
      try {
        console.log('Searching for employee:', newEmployee.employee_id.trim());
        // Try to get existing employee by employee_id
        const employeeResponse = await fetch(`${API_BASE_URL}/api/employees/?search=${newEmployee.employee_id.trim()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        if (employeeResponse.ok) {
          const employeeData = await employeeResponse.json();
          console.log('Employee search response:', employeeData);
          if (employeeData.results && employeeData.results.length > 0) {
            employee = employeeData.results[0];
            console.log('Found existing employee:', employee);
          }
        }
        
        // If employee doesn't exist, create a new one
        if (!employee) {
          console.log('Creating new employee...');
          const createEmployeeResponse = await fetch(`${API_BASE_URL}/api/employees/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              employee_id: newEmployee.employee_id.trim(),
              first_name: newEmployee.employee_id.trim().split(' ')[0] || 'Unknown',
              last_name: newEmployee.employee_id.trim().split(' ').slice(1).join(' ') || 'Employee',
              work_email: `${newEmployee.employee_id.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '.').replace(/\.+/g, '.')}@company.com`,
              date_of_joining: new Date().toISOString().split('T')[0],
              date_of_birth: '1990-01-01', // Default date
              age: 30, // Default age
              gender: 'M', // Default gender
              address: 'Default Address',
              designation: newEmployee.designation.trim(),
              department: null, // We'll handle department separately
              employment_type: 'FULL_TIME',
              basic_salary: parseFloat(newEmployee.basicSalary) || 1000, // Minimum value to avoid validation error
              annual_ctc: parseFloat(newEmployee.totalIncome) * 12 || 12000, // Minimum value to avoid validation error
            }),
          });
          
          if (createEmployeeResponse.ok) {
            employee = await createEmployeeResponse.json();
            console.log('Created new employee:', employee);
          } else {
            const errorData = await createEmployeeResponse.json();
            console.error('Employee creation error:', errorData);
            if (errorData.errors) {
              throw new Error(`Employee creation failed: ${JSON.stringify(errorData.errors)}`);
            } else {
              throw new Error(`Employee creation failed: ${errorData.detail || 'Unknown error'}`);
            }
          }
        }
      } catch (error) {
        console.error('Error handling employee:', error);
        throw new Error('Failed to create or get employee');
      }

      // Prepare payload matching your database schema
      console.log('Preparing payroll payload with employee:', employee);
      const payload = {
        employee: employee.employee_id, // Use the employee_id string as the foreign key
        designation: newEmployee.designation.trim(),
        department: newEmployee.department || 'General', // Payroll model expects string
        pay_period_start: payPeriodStart,
        pay_period_end: payPeriodEnd,
        days_worked: parseInt(newEmployee.daysWorked) || 30,
        basic_salary: parseFloat(newEmployee.basicSalary) || 0,
        hra: parseFloat(newEmployee.hra) || 0,
        conveyance: parseFloat(newEmployee.conveyance) || 0,
        meal_allowance: parseFloat(newEmployee.meal) || 0,
        telephone_allowance: parseFloat(newEmployee.telephone) || 0,
        medical_allowance: parseFloat(newEmployee.medical) || 0,
        personal_pay: parseFloat(newEmployee.personalPay) || 0,
        bonus: bonus,
        overtime: overtime,
        profession_tax: parseFloat(newEmployee.professionTax) || 0,
        advance: parseFloat(newEmployee.advance) || 0,
        status: 'DRAFT'
      };
  
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
        mode: 'cors',
      });
      
      console.log('Sending payroll payload:', payload);
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Payroll creation error:', errorData);
        let errorMessage = 'Failed to create payroll record';
        
        if (errorData.errors) {
          errorMessage += `:\n${JSON.stringify(errorData.errors, null, 2)}`;
        } else if (errorData.detail) {
          errorMessage += `: ${errorData.detail}`;
        } else {
          errorMessage += ': Unknown server error';
        }
        
        alert(errorMessage);
        return;
      }
  
      const result = await response.json();
      console.log('Employee added successfully:', result);
  
      // Add to local state
      const newEmpForState: Employee = {
        id: result.id || Date.now(),
        name: result.employee_name || employee.first_name + ' ' + employee.last_name,
        position: result.designation || payload.designation,
        grossPay: result.total_income || result.gross_pay || 0,
        deductions: result.total_deductions || 0,
        bonus: result.bonus || payload.bonus,
        overtime: result.overtime || payload.overtime,
        department: result.department || payload.department,
        joinDate: result.pay_period_start || payload.pay_period_start,
      };
      
      setEmployees(prev => [...prev, newEmpForState]);
      resetForm();
      setShowAddModal(false);
      alert('Employee added successfully!');
      
    } catch (error: unknown) {
      console.error('Error adding employee:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to add employee:\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewEmployee({
      employee_id: '', // Changed from 'name'
      month: '',
      designation: '',
      daysWorked: '30',
      department: '',
      totalIncome: '',
      totalEarnings: '', // Added
      basicSalary: '',
      hra: '',
      bonus: '0',
      overtime: '0',
      conveyance: '',
      meal: '',
      telephone: '',
      medical: '',
      personalPay: '',
      professionTax: '0',
      advance: '0',
      totalDeduction: '0',
      totalDeductions: '0' // Added
    });
  };

  const handleEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    
    // Extract month from joinDate (assuming it's in YYYY-MM-DD format)
    const month = emp.joinDate ? emp.joinDate.substring(0, 7) : '';
    
    setNewEmployee({
      employee_id: emp.name || '', // Use name as employee_id since that's what we store
      month: month,
      designation: emp.position || '',
      daysWorked: '30', // Default value
      department: emp.department || '',
      totalIncome: emp.grossPay.toString(),
      totalEarnings: emp.grossPay.toString(),
      basicSalary: (emp.grossPay * 0.5).toString(),
      hra: (emp.grossPay * 0.2).toString(),
      bonus: emp.bonus.toString(),
      overtime: emp.overtime.toString(),
      conveyance: (emp.grossPay * 0.1).toString(),
      meal: (emp.grossPay * 0.1).toString(),
      telephone: (emp.grossPay * 0.02).toString(),
      medical: (emp.grossPay * 0.03).toString(),
      personalPay: (emp.grossPay * 0.05).toString(),
      professionTax: (emp.deductions * 0.5).toString(),
      advance: (emp.deductions * 0.5).toString(),
      totalDeduction: emp.deductions.toString(),
      totalDeductions: emp.deductions.toString()
    });
    setShowAddModal(true);
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;

    const validationErrors = validateEmployeeData();
    if (validationErrors.length > 0) {
      alert('Please fix the following errors:\n' + validationErrors.join('\n'));
      return;
    }

    try {
      setLoading(true);
      
      // Calculate values
      const totalIncome = parseFloat(newEmployee.totalIncome) || 0;
      const totalDeduction = parseFloat(newEmployee.totalDeduction) || 0;
      const bonus = parseFloat(newEmployee.bonus) || 0;
      const overtime = parseFloat(newEmployee.overtime) || 0;
      
      // Create pay period dates
      const monthDate = new Date(newEmployee.month + '-01');
      const payPeriodStart = newEmployee.month + '-01';
      const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      const payPeriodEnd = `${newEmployee.month}-${lastDay.toString().padStart(2, '0')}`;

      // First, we need to get or create the employee
      let employee;
      try {
        console.log('Searching for employee for update:', newEmployee.employee_id.trim());
        const employeeResponse = await fetch(`${API_BASE_URL}/api/employees/?search=${newEmployee.employee_id.trim()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        if (employeeResponse.ok) {
          const employeeData = await employeeResponse.json();
          console.log('Employee search response for update:', employeeData);
          if (employeeData.results && employeeData.results.length > 0) {
            employee = employeeData.results[0];
            console.log('Found existing employee for update:', employee);
          }
        }
        
        // If employee doesn't exist, create a new one
        if (!employee) {
          console.log('Creating new employee for update...');
          const createEmployeeResponse = await fetch(`${API_BASE_URL}/api/employees/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              employee_id: newEmployee.employee_id.trim(),
              first_name: newEmployee.employee_id.trim().split(' ')[0] || 'Unknown',
              last_name: newEmployee.employee_id.trim().split(' ').slice(1).join(' ') || 'Employee',
              work_email: `${newEmployee.employee_id.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '.').replace(/\.+/g, '.')}@company.com`,
              date_of_joining: new Date().toISOString().split('T')[0],
              date_of_birth: '1990-01-01',
              age: 30,
              gender: 'M',
              address: 'Default Address',
              designation: newEmployee.designation.trim(),
              department: null,
              employment_type: 'FULL_TIME',
              basic_salary: parseFloat(newEmployee.basicSalary) || 1000,
              annual_ctc: parseFloat(newEmployee.totalIncome) * 12 || 12000,
            }),
          });
          
          if (createEmployeeResponse.ok) {
            employee = await createEmployeeResponse.json();
            console.log('Created new employee for update:', employee);
          } else {
            const errorData = await createEmployeeResponse.json();
            console.error('Employee creation error for update:', errorData);
            if (errorData.errors) {
              throw new Error(`Employee creation failed: ${JSON.stringify(errorData.errors)}`);
            } else {
              throw new Error(`Employee creation failed: ${errorData.detail || 'Unknown error'}`);
            }
          }
        }
      } catch (error) {
        console.error('Error handling employee for update:', error);
        throw new Error('Failed to create or get employee for update');
      }

      // Prepare payload for payroll update
      console.log('Preparing payroll update payload with employee:', employee);
      const payload = {
        employee: employee.employee_id,
        designation: newEmployee.designation.trim(),
        department: newEmployee.department || 'General',
        pay_period_start: payPeriodStart,
        pay_period_end: payPeriodEnd,
        days_worked: parseInt(newEmployee.daysWorked) || 30,
        basic_salary: parseFloat(newEmployee.basicSalary) || 0,
        hra: parseFloat(newEmployee.hra) || 0,
        conveyance: parseFloat(newEmployee.conveyance) || 0,
        meal_allowance: parseFloat(newEmployee.meal) || 0,
        telephone_allowance: parseFloat(newEmployee.telephone) || 0,
        medical_allowance: parseFloat(newEmployee.medical) || 0,
        personal_pay: parseFloat(newEmployee.personalPay) || 0,
        bonus: bonus,
        overtime: overtime,
        profession_tax: parseFloat(newEmployee.professionTax) || 0,
        advance: parseFloat(newEmployee.advance) || 0,
        status: 'DRAFT'
      };
      
      console.log('Sending payroll update payload:', payload);

      const response = await fetch(`${API_ENDPOINT}${editingEmployee.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Payroll update error:', errorData);
        let errorMessage = 'Failed to update payroll record';
        
        if (errorData.errors) {
          errorMessage += `:\n${JSON.stringify(errorData.errors, null, 2)}`;
        } else if (errorData.detail) {
          errorMessage += `: ${errorData.detail}`;
        } else {
          errorMessage += ': Unknown server error';
        }
        
        alert(errorMessage);
        return;
      }

      const result = await response.json();
      console.log('Payroll updated successfully:', result);

      // Update the employee in local state
      setEmployees(prev => prev.map(emp => 
        emp.id === editingEmployee.id 
          ? {
              ...emp,
              name: result.employee_name || employee.first_name + ' ' + employee.last_name,
              position: result.designation || payload.designation,
              grossPay: result.total_income || result.gross_pay || 0,
              deductions: result.total_deductions || 0,
              bonus: result.bonus || payload.bonus,
              overtime: result.overtime || payload.overtime,
              department: result.department || payload.department,
              joinDate: result.pay_period_start || payload.pay_period_start,
            }
          : emp
      ));
      
      setEditingEmployee(null);
      resetForm();
      setShowAddModal(false);
      
      alert('Payroll record updated successfully!');
      
    } catch (error: unknown) {
      console.error('Error updating employee:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to update employee:\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${API_ENDPOINT}${id}/`, {
        method: 'DELETE',
        mode: 'cors',
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete employee: ${response.statusText}`);
      }

      // Remove from local state
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      
      alert('Employee deleted successfully!');
      
    } catch (error: unknown) {
      console.error('Error deleting employee:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      // Still remove from local state even if API call fails
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      alert(`Employee removed from list. API Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: 'name' | 'grossPay' | 'netPay') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // const handleAddEmployee = async () => {
  //   try {
  //     setLoading(true);
      
  //     // Calculate net salary
  //     const totalIncome = parseFloat(newEmployee.totalIncome) || 0;
  //     const totalDeduction = parseFloat(newEmployee.totalDeduction) || 0;
  //     const netSalary = totalIncome - totalDeduction;
  
  //     // Create pay period dates
  //     const monthDate = new Date(newEmployee.month + '-01');
  //     const payPeriodStart = newEmployee.month + '-01';
  //     const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  //     const payPeriodEnd = newEmployee.month + '-' + lastDay.toString().padStart(2, '0');
  
  //     // Prepare data matching your PostgreSQL schema exactly
  //     const payload = {
  //       employee_id: newEmployee.employee_id.trim(),
  //       designation: newEmployee.designation.trim(),
  //       department: newEmployee.department,
  //       pay_period_start: payPeriodStart,
  //       pay_period_end: payPeriodEnd,
  //       month: newEmployee.month,
  //       days_worked: parseInt(newEmployee.daysWorked) || 30,
  //       basic_salary: parseFloat(newEmployee.basicSalary) || 0,
  //       hra: parseFloat(newEmployee.hra) || 0,
  //       conveyance: parseFloat(newEmployee.conveyance) || 0,
  //       meal_allowance: parseFloat(newEmployee.meal) || 0,
  //       telephone_allowance: parseFloat(newEmployee.telephone) || 0,
  //       medical_allowance: parseFloat(newEmployee.medical) || 0,
  //       personal_pay: parseFloat(newEmployee.personalPay) || 0,
  //       bonus: parseFloat(newEmployee.bonus) || 0,
  //       overtime: parseFloat(newEmployee.overtime) || 0,
  //       total_income: totalIncome,
  //       total_earnings: totalIncome, // Same as total_income if no difference
  //       profession_tax: parseFloat(newEmployee.professionTax) || 0,
  //       advance: parseFloat(newEmployee.advance) || 0,
  //       total_deduction: totalDeduction,
  //       total_deductions: totalDeduction, // Same as total_deduction
  //       net_salary: netSalary,
  //       status: 'active'
  //     };
  
  //     const response = await fetch(API_ENDPOINT, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'X-CSRFToken': getCookie('csrftoken') || '',
  //       },
  //       body: JSON.stringify(payload),
  //       credentials: 'include'
  //     });
  
  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       console.error('Validation errors:', errorData);
  //       throw new Error(errorData.detail || 'Validation failed');
  //     }
  
  //     // Success handling
  //     const result = await response.json();
  //     setEmployees(prev => [...prev, result]);
  //     setShowAddModal(false);
  //     resetForm();
  
  //   } catch (error) {
  //     console.error('Error:', error);
  //     alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Update both total_earnings and total_income when totalIncome changes
useEffect(() => {
  const total = parseFloat(newEmployee.totalIncome) || 0;
  if (total === 0) return;
  
  setNewEmployee((prev) => ({
    ...prev,
    basicSalary: (total * 0.5).toFixed(2),
    hra: (total * 0.2).toFixed(2),
    conveyance: (total * 0.1).toFixed(2),
    meal: (total * 0.1).toFixed(2),
    telephone: (total * 0.02).toFixed(2),
    medical: (total * 0.03).toFixed(2),
    personalPay: (total * 0.05).toFixed(2),
    totalEarnings: total.toFixed(2) // Add this line
  }));
}, [newEmployee.totalIncome]);

// Auto-populate employee details when employee_id changes
useEffect(() => {
  if (newEmployee.employee_id && availableEmployees.length > 0) {
    const selectedEmployee = availableEmployees.find(
      emp => emp.employee_id === newEmployee.employee_id
    );
    
    if (selectedEmployee) {
      setNewEmployee((prev) => ({
        ...prev,
        designation: selectedEmployee.designation || prev.designation,
        department: selectedEmployee.department?.name || prev.department,
        // You can add more auto-population here if needed
      }));
    }
  }
}, [newEmployee.employee_id, availableEmployees]);

// Update both deduction fields
useEffect(() => {
  const professionTax = parseFloat(newEmployee.professionTax) || 0;
  const advance = parseFloat(newEmployee.advance) || 0;
  const totalDeduction = (professionTax + advance).toFixed(2);
  
  setNewEmployee((prev) => ({
    ...prev,
    totalDeduction,
    totalDeductions: totalDeduction
  }));
}, [newEmployee.professionTax, newEmployee.advance]);

  // Auto-calculate total deduction
  useEffect(() => {
    const professionTax = parseFloat(newEmployee.professionTax) || 0;
    const advance = parseFloat(newEmployee.advance) || 0;
    setNewEmployee((prev) => ({
      ...prev,
      totalDeduction: (professionTax + advance).toFixed(2),
    }));
  }, [newEmployee.professionTax, newEmployee.advance]);

  return (
    <SettingsLayout title="Payroll" description="Manage payroll and salary processing">
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 p-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Payroll 
                {loading && <span className="text-sm text-blue-600 ml-2">(Processing...)</span>}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-5 h-5 text-yellow-600" />
                <span className="font-medium">Pay Date: {payDate || 'Not Set'}</span>
              </div>
              {error && (
                <div className="mt-2 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">{error}</p>
                  <button 
                    onClick={fetchPayrollData}
                    className="mt-2 text-sm text-yellow-600 hover:text-yellow-800 underline"
                    disabled={loading}
                  >
                    {loading ? 'Retrying...' : 'Retry Connection'}
                  </button>
                </div>
              )}
            </div>
            
            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-yellow-100 rounded-xl p-4 min-w-[120px]">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-700" />
                  <div>
                    <p className="text-sm text-yellow-700">Employees</p>
                    <p className="text-xl font-bold text-yellow-800">{filteredEmployees.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-100 rounded-xl p-4 min-w-[140px]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 text-green-700 text-xl font-bold">₹</span>
                  <div>
                    <p className="text-sm text-green-700">Total Payroll</p>
                    <p className="text-xl font-bold text-green-800">₹{getTotalPayroll().toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Department Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="pl-10 pr-8 py-3 border border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-300 focus:border-transparent appearance-none bg-white min-w-[150px]"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowPayDetails(!showPayDetails)}
                className="flex items-center gap-2 px-4 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors duration-200"
              >
                {showPayDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPayDetails ? 'Hide' : 'Show'} Details
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setEditingEmployee(null);
                  setShowAddModal(true);
                }}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add Employee
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-yellow-100 to-amber-100">
                <tr>
                  <th 
                    className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-yellow-200 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Employee Details
                      {sortBy === 'name' && (
                        <span className="text-yellow-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-yellow-200 transition-colors"
                    onClick={() => handleSort('grossPay')}
                  >
                    <div className="flex items-center gap-2">
                      Gross Pay
                      {sortBy === 'grossPay' && (
                        <span className="text-yellow-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  {showPayDetails && (
                    <>
                      <th className="p-4 text-left font-semibold text-gray-700">Deductions</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Bonus</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Overtime</th>
                    </>
                  )}
                  <th 
                    className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-yellow-200 transition-colors"
                    onClick={() => handleSort('netPay')}
                  >
                    <div className="flex items-center gap-2">
                      Net Pay
                      {sortBy === 'netPay' && (
                        <span className="text-yellow-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && employees.length === 0 ? (
                  <tr>
                    <td colSpan={showPayDetails ? 7 : 4} className="text-center p-12">
                      <div className="text-gray-500">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                        <p className="text-lg font-medium">Loading employees...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp, index) => (
                    <tr 
                      key={emp.id} 
                      className={`border-b border-yellow-100 hover:bg-yellow-50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white/50' : 'bg-yellow-25'
                      }`}
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-semibold text-gray-800">{emp.name}</div>
                          <div className="text-sm text-gray-600">{emp.position}</div>
                          <div className="text-xs text-gray-500">{emp.department}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-800">₹{emp.grossPay.toLocaleString()}</span>
                      </td>
                      {showPayDetails && (
                        <>
                          <td className="p-4">
                            <span className="text-red-600 font-medium">-₹{emp.deductions.toLocaleString()}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-green-600 font-medium">+₹{emp.bonus.toLocaleString()}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-blue-600 font-medium">+₹{emp.overtime.toLocaleString()}</span>
                          </td>
                        </>
                      )}
                      <td className="p-4">
                        <span className="font-bold text-green-700 text-lg">₹{calculateNetPay(emp).toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditEmployee(emp)}
                            disabled={loading}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Edit Employee"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp.id)}
                            disabled={loading}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={showPayDetails ? 7 : 4} className="text-center p-12">
                      <div className="text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No employees found</p>
                        <p className="text-sm">
                          {searchTerm || selectedDepartment 
                            ? 'Try adjusting your search or filter criteria' 
                            : 'Add employees to get started with payroll'
                          }
                        </p>
                        {error && (
                          <button 
                            onClick={fetchPayrollData}
                            disabled={loading}
                            className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                          >
                            {loading ? 'Retrying...' : 'Retry Loading'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Employee Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Fill in the employee details below. Fields marked with * are required.
                </p>
              </div>
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-gray-800">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Employee Name */}
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee Name *
                      </label>
                      <input
                        type="text"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                        placeholder="Enter employee name"
                        required
                      />
                    </div> */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee ID *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newEmployee.employee_id}
                          onChange={(e) => setNewEmployee({ ...newEmployee, employee_id: e.target.value })}
                          onFocus={() => fetchAvailableEmployees()} // Refresh employees when focused
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                          placeholder="Enter employee ID or select from dropdown"
                          required
                          list="employee-list"
                        />
                        <datalist id="employee-list">
                          {availableEmployees.map((emp) => (
                            <option key={emp.employee_id} value={emp.employee_id}>
                              {emp.employee_id} - {emp.first_name} {emp.last_name}
                            </option>
                          ))}
                        </datalist>
                      </div>
                      {availableEmployees.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Available employees: {availableEmployees.length} found
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={fetchAvailableEmployees}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1 underline"
                      >
                        Refresh employee list
                      </button>
                    </div>
                    
                    {/* Month */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pay Period *
                      </label>
                      <input
                        type="month"
                        value={newEmployee.month}
                        onChange={(e) => setNewEmployee({ ...newEmployee, month: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    {/* Designation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Designation *
                      </label>
                      <input
                        type="text"
                        value={newEmployee.designation}
                        onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                        placeholder="Enter designation"
                        required
                      />
                    </div>
                    
                    {/* Department */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department *
                      </label>
                      <select
                        value={newEmployee.department}
                        onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Days Worked */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Days Worked
                      </label>
                      <input
                        type="number"
                        value={newEmployee.daysWorked}
                        onChange={(e) => setNewEmployee({ ...newEmployee, daysWorked: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                        placeholder="30"
                        min="1"
                        max="31"
                      />
                    </div>
                    
                    {/* Total Income */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Income *
                      </label>
                      <input
                        type="number"
                        value={newEmployee.totalIncome}
                        onChange={(e) => setNewEmployee({ ...newEmployee, totalIncome: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                        placeholder="Enter total income"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Earnings Breakdown */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-gray-800">
                    Earnings Breakdown
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      (Auto-calculated based on total income)
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Basic Salary (50%)
                      </label>
                      <input
                        type="number"
                        value={newEmployee.basicSalary}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        House Rent Allowance (20%)
                      </label>
                      <input
                        type="number"
                        value={newEmployee.hra}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conveyance Allowance (10%)
                      </label>
                      <input
                        type="number"
                        value={newEmployee.conveyance}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meal Allowance (10%)
                      </label>
                      <input
                        type="number"
                        value={newEmployee.meal}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telephone Allowance (2%)
                      </label>
                      <input
                        type="number"
                        value={newEmployee.telephone}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical Allowance (3%)
                      </label>
                      <input
                        type="number"
                        value={newEmployee.medical}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Personal Pay (5%)
                      </label>
                      <input
                        type="number"
                        value={newEmployee.personalPay}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Earnings */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-gray-800">Additional Earnings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bonus
                      </label>
                      <input
                        type="number"
                        value={newEmployee.bonus}
                        onChange={(e) => setNewEmployee({ ...newEmployee, bonus: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Overtime
                      </label>
                      <input
                        type="number"
                        value={newEmployee.overtime}
                        onChange={(e) => setNewEmployee({ ...newEmployee, overtime: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-gray-800">Deductions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Tax
                      </label>
                      <input
                        type="number"
                        value={newEmployee.professionTax}
                        onChange={(e) => setNewEmployee({ ...newEmployee, professionTax: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Advance
                      </label>
                      <input
                        type="number"
                        value={newEmployee.advance}
                        onChange={(e) => setNewEmployee({ ...newEmployee, advance: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Deduction
                      </label>
                      <input
                        type="number"
                        value={newEmployee.totalDeduction}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Net Pay Summary */}
                {newEmployee.totalIncome && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h3 className="font-semibold text-lg mb-2 text-green-800">Pay Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Gross Pay:</span>
                        <span className="font-semibold text-gray-800 ml-2">
                          ₹{parseFloat(newEmployee.totalIncome || '0').toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Deductions:</span>
                        <span className="font-semibold text-red-600 ml-2">
                          -₹{parseFloat(newEmployee.totalDeduction || '0').toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Net Pay:</span>
                        <span className="font-bold text-green-700 ml-2 text-lg">
                          ₹{(
                            parseFloat(newEmployee.totalIncome || '0') - 
                            parseFloat(newEmployee.totalDeduction || '0') + 
                            parseFloat(newEmployee.bonus || '0') + 
                            parseFloat(newEmployee.overtime || '0')
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end bg-gray-50">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEmployee(null);
                    resetForm();
                  }}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
                  // disabled={loading || !newEmployee.name || !newEmployee.totalIncome || !newEmployee.designation || !newEmployee.department}
                  disabled={loading || !newEmployee.employee_id || !newEmployee.totalIncome || !newEmployee.designation || !newEmployee.department}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading 
                    ? (editingEmployee ? 'Updating...' : 'Adding...') 
                    : (editingEmployee ? 'Update Employee' : 'Add Employee')
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
};

export default PayrollPage;

function getCookie(name: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
}
