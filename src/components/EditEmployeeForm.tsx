'use client';

import { useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';

interface EmployeeData {
  firstName: string;
  middleName?: string;
  lastName: string;
  employeeId: string;
  workEmail: string;
  dateOfJoining: string;
  mobileNumber: string;
  isDirector: boolean;
  gender: string;
  workLocation: string;
  designation: string;
  department: string;
  annualCTC: number;
  basicPercent: number;
  hraPercent: number;
  conveyanceAmount: number;
  mealAllowance: number;
  medicalAllowance: number;
  personalPay: number;
  professionTax: number;
  advances: number;
  dob: string;
  address: string;
  paymentMethod: string;
  enablePortalAccess: boolean;
}

interface EditEmployeeFormProps {
  employeeData: EmployeeData;
  onSave: (data: EmployeeData) => void;
  onCancel: () => void;
}

export default function EditEmployeeForm({ employeeData, onSave, onCancel }: EditEmployeeFormProps) {
  const [formData, setFormData] = useState(employeeData);
  const [showNotification, setShowNotification] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
      onSave(formData);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-50 text-green-800 px-6 py-3 rounded-lg shadow-lg border border-green-200 animate-fade-in">
          Successfully updated employee details!
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl font-medium text-black mb-8">
          {formData.firstName}'s basic information
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Name */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Employee Name<span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName || ''}
                  onChange={handleInputChange}
                  placeholder="Middle Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-6">
            {/* Employee ID */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Employee ID<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* Date of Joining */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Date of Joining<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* Work Email */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Work Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="workEmail"
                value={formData.workEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Gender<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
                <MdKeyboardArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 text-black" />
              </div>
            </div>

            {/* Work Location */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Work Location<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                  required
                >
                  <option value="">Select location</option>
                  <option value="Head Office ( college,mumbai...)">Head Office (college, mumbai...)</option>
                </select>
                <MdKeyboardArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 text-black" />
              </div>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Designation<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                  required
                >
                  <option value="">Select designation</option>
                  <option value="IT">IT</option>
                </select>
                <MdKeyboardArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 text-black" />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Department<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                  required
                >
                  <option value="">Select department</option>
                  <option value="IT">IT</option>
                </select>
                <MdKeyboardArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 text-black" />
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="isDirector"
                checked={formData.isDirector}
                onChange={() => handleCheckboxChange('isDirector')}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isDirector" className="ml-2 block text-sm text-black">
                Employee is a Director/person with substantial interest in the company.
              </label>
            </div>

            {/* <div className="flex items-start">
              <input
                type="checkbox"
                id="enablePortalAccess"
                checked={formData.enablePortalAccess}
                onChange={() => handleCheckboxChange('enablePortalAccess')}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div> */}
            
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-black hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 