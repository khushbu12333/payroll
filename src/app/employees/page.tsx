'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import EditEmployeeForm from '@/components/EditEmployeeForm';

const defaultEmployeeData = {
  firstName: '',
  middleName: '',
  lastName: '',
  employeeId: '',
  workEmail: '',
  dateOfJoining: '',
  mobileNumber: '',
  isDirector: false,
  gender: '',
  workLocation: '',
  designation: '',
  department: '',
  enablePortalAccess: false,
  annualCTC: 0,
  basicPercent: 0,
  hraPercent: 0,
  conveyanceAmount: 0,
  dob: '',
  address: '',
  paymentMethod: '',
};

export default function EmployeesPage() {
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Employee
        </button>
      </div>

      {showForm ? (
        <EditEmployeeForm
          employeeData={defaultEmployeeData}
          onSave={(data) => {
            console.log('Saving employee data:', data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center text-gray-500">
              No employees added yet. Click "Add Employee" to get started.
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 