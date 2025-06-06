'use client';

import { useState } from 'react';
import { MdEdit, MdDelete } from 'react-icons/md';
import DesignationModal from '@/components/DesignationModal';

interface Designation {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  designationId: string;
}

export default function DesignationsPage() {
  const [designations, setDesignations] = useState<Designation[]>([
    {
      id: '1',
      name: 'IT'
    },
    {
      id: '2',
      name: 'HR'
    }
  ]);

  // Simulated employees data - in real app, this would come from your API/database
  const [employees] = useState<Employee[]>([
    { id: '1', designationId: '1' },
    { id: '2', designationId: '1' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | undefined>();

  const getEmployeeCount = (designationId: string) => {
    return employees.filter(emp => emp.designationId === designationId).length;
  };

  const handleAddDesignation = () => {
    setSelectedDesignation(undefined);
    setIsModalOpen(true);
  };

  const handleEditDesignation = (designation: Designation) => {
    setSelectedDesignation(designation);
    setIsModalOpen(true);
  };

  const handleDeleteDesignation = async (designationId: string) => {
    const employeeCount = getEmployeeCount(designationId);
    if (employeeCount > 0) {
      alert('Cannot delete designation with assigned employees');
      return;
    }

    if (confirm('Are you sure you want to delete this designation?')) {
      setDesignations(designations.filter(desig => desig.id !== designationId));
    }
  };

  const handleSaveDesignation = (designationData: Omit<Designation, 'id'>) => {
    if (selectedDesignation) {
      // Edit existing designation
      setDesignations(designations.map(desig => 
        desig.id === selectedDesignation.id 
          ? { ...desig, ...designationData }
          : desig
      ));
    } else {
      // Add new designation
      const newDesignation: Designation = {
        id: String(Date.now()),
        ...designationData
      };
      setDesignations([...designations, newDesignation]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Designations</h1>
          <button
            onClick={handleAddDesignation}
            className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            + New Designation
          </button>
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Employees
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {designations.map((designation) => (
                <tr key={designation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      {designation.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getEmployeeCount(designation.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditDesignation(designation)}
                      className="text-gray-400 hover:text-gray-600 mr-3"
                    >
                      <MdEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDesignation(designation.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <MdDelete className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Designation Modal */}
      <DesignationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDesignation}
        designation={selectedDesignation}
      />
    </div>
  );
} 