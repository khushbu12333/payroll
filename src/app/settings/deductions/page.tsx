'use client';

import { useEffect, useState } from 'react';
import { MdEdit, MdDelete, MdAdd, MdAttachMoney } from 'react-icons/md';
import SettingsLayout from '@/components/SettingsLayout';

interface Deduction {
  id: string;
  name: string;
  calculation_type: string;
  value: string | number;
  is_active: boolean;
  is_taxable: boolean;
  description: string;
}

export default function DeductionsPage() {
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState<Deduction | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeductions();
  }, []);

  const fetchDeductions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/salary-components/?component_type=DEDUCTION');
      if (!response.ok) {
        throw new Error('Failed to fetch deductions');
      }
      const data = await response.json();
      
      // Ensure data is an array and transform it if needed
      const deductionsData = Array.isArray(data) ? data : data.results || [];
      setDeductions(deductionsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching deductions:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDeduction = () => {
    setSelectedDeduction(undefined);
    setIsModalOpen(true);
  };

  const handleEditDeduction = (deduction: Deduction) => {
    setSelectedDeduction(deduction);
    setIsModalOpen(true);
  };

  const handleDeleteDeduction = async (deductionId: string) => {
    if (confirm('Are you sure you want to delete this deduction?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/salary-components/${deductionId}/`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete deduction');
        }
        await fetchDeductions(); // Refresh the list
      } catch (err) {
        console.error('Error deleting deduction:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete deduction');
      }
    }
  };

  const handleSaveDeduction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = selectedDeduction 
        ? `http://127.0.0.1:8000/api/salary-components/${selectedDeduction.id}/`
        : 'http://127.0.0.1:8000/api/salary-components/';
      
      const method = selectedDeduction ? 'PUT' : 'POST';

      const formData = new FormData(e.target as HTMLFormElement);
      const apiData = {
        name: formData.get('name'),
        component_type: 'DEDUCTION',
        calculation_type: String(formData.get('calculation_type') || '').toUpperCase() || 'FIXED',
        value: formData.get('value'),
        is_active: true,
        is_taxable: true,
        description: formData.get('description')
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error('Failed to save deduction');
      }

      setIsModalOpen(false);
      await fetchDeductions();
      alert(selectedDeduction ? 'Deduction updated successfully!' : 'Deduction created successfully!');
    } catch (err) {
      console.error('Error saving deduction:', err);
      setError(err instanceof Error ? err.message : 'Failed to save deduction');
    }
  };

  if (isLoading) {
    return (
      <SettingsLayout
        title="Deductions"
        description="Manage salary deductions"
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
        title="Deductions"
        description="Manage salary deductions"
      >
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchDeductions}
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
      title="Deductions"
      description="Manage salary deductions"
    >
      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Deductions</p>
                <p className="text-2xl font-bold text-blue-900">{deductions.length}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-xl">
                <MdAttachMoney className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Active Deductions</p>
                <p className="text-2xl font-bold text-green-900">
                  {deductions.filter(d => d.is_active).length}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-xl">
                <MdAttachMoney className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">All Deductions</h2>
            <p className="text-gray-600 text-sm mt-1">Manage salary deductions</p>
          </div>
          <button
            onClick={handleAddDeduction}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <MdAdd className="w-5 h-5 mr-2" />
            Add Deduction
          </button>
        </div>

        {/* Deductions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calculation Type
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deductions.map((deduction) => (
                  <tr key={deduction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg mr-3 bg-red-100">
                          <MdAttachMoney className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {deduction.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {deduction.calculation_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {deduction.value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        deduction.is_active 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {deduction.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditDeduction(deduction)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit deduction"
                        >
                          <MdEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDeduction(deduction.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete deduction"
                        >
                          <MdDelete className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {deductions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdAttachMoney className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No deductions yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first deduction to configure payroll calculations
            </p>
            <button
              onClick={handleAddDeduction}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
            >
              <MdAdd className="w-5 h-5 mr-2" />
              Create First Deduction
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Deduction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {selectedDeduction ? 'Edit Deduction' : 'Add New Deduction'}
            </h3>
            <form onSubmit={handleSaveDeduction}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1">
                    Deduction Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={selectedDeduction?.name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="calculation_type" className="block text-sm font-medium text-gray-900 mb-1">
                    Calculation Type
                  </label>
                  <select
                    id="calculation_type"
                    name="calculation_type"
                    defaultValue={selectedDeduction?.calculation_type}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  >
                    <option value="FIXED">Fixed Amount</option>
                    <option value="PERCENTAGE">Percentage of Basic</option>
                    <option value="PERCENTAGE_CTC">Percentage of CTC</option>
                    <option value="CUSTOM">Custom Formula</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="value" className="block text-sm font-medium text-gray-900 mb-1">
                    Value
                  </label>
                  <input
                    type="text"
                    id="value"
                    name="value"
                    defaultValue={selectedDeduction?.value}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={selectedDeduction?.description}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    rows={3}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedDeduction ? 'Save Changes' : 'Create Deduction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SettingsLayout>
  );
} 