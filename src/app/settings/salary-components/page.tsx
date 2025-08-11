'use client';

import { useEffect, useState } from 'react';
import { MdEdit, MdDelete, MdAdd, MdAttachMoney, MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import SalaryComponentModal from '@/components/SalaryComponentModal';
import SettingsLayout from '@/components/SettingsLayout';

interface SalaryComponent {
  id: string;
  name: string;
  type: 'earnings' | 'deductions';
  earningType?: string;
  deductionType?: string;
  calculationType: string;
  status: 'Active' | 'Inactive';
  component_type?: string;
  value?: string | number;
}

interface ApiSalaryComponent {
  name: string;
  type: 'earnings' | 'deductions';
  calculation_type: string;
  status: 'Active' | 'Inactive';
  earning_type?: string | null;
  deduction_type?: string | null;
  component_type: string;
  value: string | number;
}

export default function SalaryComponentsPage() {
  const [activeTab, setActiveTab] = useState<'earnings' | 'deductions'>('earnings');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<SalaryComponent | undefined>();
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      setIsLoading(true);
      // Fetch both earnings and deductions
      const [earningsResponse, deductionsResponse] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/salary-components/?component_type=EARNING'),
        fetch('http://127.0.0.1:8000/api/salary-components/?component_type=DEDUCTION')
      ]);
      
      if (!earningsResponse.ok || !deductionsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const earningsData = await earningsResponse.json();
      const deductionsData = await deductionsResponse.json();
      
      // Transform earnings data
      const transformedEarnings = (Array.isArray(earningsData) ? earningsData : earningsData.results || [])
        .map((item: any) => ({
          id: String(item.id || ''),
          name: String(item.name || ''),
          type: 'earnings',
          earningType: String(item.name || ''),
          calculationType: String(item.calculation_type || ''),
          status: item.is_active ? 'Active' : 'Inactive',
          component_type: 'EARNING',
          value: item.value || '0'
        }));

      // Transform deductions data
      const transformedDeductions = (Array.isArray(deductionsData) ? deductionsData : deductionsData.results || [])
        .map((item: any) => ({
          id: String(item.id || ''),
          name: String(item.name || ''),
          type: 'deductions',
          deductionType: 'Percentage',
          calculationType: String(item.calculation_type || ''),
          status: item.is_active ? 'Active' : 'Inactive',
          component_type: 'DEDUCTION',
          value: item.value ?? '0'
        }));

      // Add default deductions if they don't exist
      const defaultDeductions = [
        {
          id: '1',
          name: 'PF Contribution',
          type: 'deductions',
          deductionType: 'Percentage',
          calculationType: 'PERCENTAGE',
          status: 'Active',
          component_type: 'DEDUCTION',
          value: '0.00'
        },
        {
          id: '2',
          name: 'Professional Tax',
          type: 'deductions',
          deductionType: 'Percentage',
          calculationType: 'FIXED',
          status: 'Active',
          component_type: 'DEDUCTION',
          value: '200.00'
        }
      ];

      // Check if default deductions exist in the transformed data
      const existingNames = transformedDeductions.map((item: { name: string }) => item.name);
      const missingDeductions = defaultDeductions.filter(
        deduction => !existingNames.includes(deduction.name)
      );

      // Add missing deductions to the API
      for (const deduction of missingDeductions) {
        try {
          const response = await fetch('http://127.0.0.1:8000/api/salary-components/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              name: deduction.name,
              component_type: 'DEDUCTION',
              calculation_type: deduction.calculationType,
              value: deduction.value,
              is_active: true,
              is_taxable: true,
              description: `${deduction.name} - ${deduction.deductionType}`
            }),
          });

          if (!response.ok) {
            const body = await response.text().catch(() => '');
            console.error(`Failed to add ${deduction.name}: ${response.status} ${response.statusText} ${body}`);
          }
        } catch (err) {
          console.error(`Error adding ${deduction.name}:`, err);
        }
      }

      // Fetch updated deductions after adding defaults
      const updatedDeductionsResponse = await fetch('http://127.0.0.1:8000/api/salary-components/?component_type=DEDUCTION');
      const updatedDeductionsData = await updatedDeductionsResponse.json();
      
      const finalTransformedDeductions = (Array.isArray(updatedDeductionsData) ? updatedDeductionsData : updatedDeductionsData.results || [])
        .map((item: any) => ({
          id: String(item.id || ''),
          name: String(item.name || ''),
          type: 'deductions',
          deductionType: String(item.deduction_type || 'Percentage'),
          calculationType: String(item.calculation_type || ''),
          status: item.is_active ? 'Active' : 'Inactive',
          component_type: 'DEDUCTION',
          value: item.calculation_type || '0'
        }));

      // Combine earnings and deductions
      const allComponents = [...transformedEarnings, ...finalTransformedDeductions];
      
      console.log('Transformed data:', allComponents);
      setComponents(allComponents);
      setError(null);
    } catch (err) {
      console.error('Error fetching components:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComponent = (type: 'earnings' | 'deductions') => {
    setActiveTab(type);
    setSelectedComponent(undefined);
    setIsModalOpen(true);
  };

  const handleEditComponent = (component: SalaryComponent) => {
    // Ensure all required fields are present when editing
    const componentToEdit: SalaryComponent = {
      ...component,
      earningType: component.earningType || undefined,
      deductionType: component.deductionType || undefined,
      calculationType: component.calculationType || '',
      status: component.status || 'Active',
      component_type: component.component_type || (component.type === 'earnings' ? 'Basic' : 'PT'),
      value: component.value || (component.calculationType === 'Fixed Amount' ? '0' : '0%')
    };
    console.log('Editing component:', componentToEdit);
    setSelectedComponent(componentToEdit);
    setIsModalOpen(true);
  };

  const handleDeleteComponent = async (componentId: string) => {
    if (confirm('Are you sure you want to delete this component?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/salary-components/${componentId}/`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete component');
        }
        await fetchComponents(); // Refresh the list
      } catch (err) {
        console.error('Error deleting component:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete component');
      }
    }
  };

  const handleToggleStatus = async (componentId: string) => {
    try {
      const component = components.find(comp => comp.id === componentId);
      if (!component) return;

      const response = await fetch(`http://127.0.0.1:8000/api/salary-components/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          is_active: component.status === 'Active' ? false : true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update component status');
      }

      // Update the local state immediately for better UX
      setComponents(prevComponents => 
        prevComponents.map(comp => 
          comp.id === componentId 
            ? { ...comp, status: comp.status === 'Active' ? 'Inactive' : 'Active' }
            : comp
        )
      );

      // Show success message
      alert(`Component ${component.status === 'Active' ? 'deactivated' : 'activated'} successfully!`);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update component status');
      
      // Revert the local state if the API call failed
      await fetchComponents();
    }
  };

  // Removed erroneous console.log referencing undefined 'componentData'

  // Removed unused saveComponent helper to avoid confusing error messages



  const handleSaveComponent = async (componentData: Partial<SalaryComponent>) => {
    try {
      const url = selectedComponent
        ? `http://127.0.0.1:8000/api/salary-components/${selectedComponent.id}/`
        : 'http://127.0.0.1:8000/api/salary-components/';
      
      const method = selectedComponent ? 'PUT' : 'POST';

      // Map the calculation type to the correct API value
      const getCalculationType = (type: string | undefined) => {
        switch (type?.toLowerCase()) {
          case 'percentage':
            return 'PERCENTAGE';
          case 'fixed amount':
            return 'FIXED';
          case 'meal allowance (ctc*10%)':
            return 'PERCENTAGE'; // For meal allowance, we'll use percentage
          default:
            return 'FIXED';
        }
      };

      // Prepare the data based on the active tab
      const apiData = {
        name: componentData.name || '',
        component_type: activeTab === 'earnings' ? 'EARNING' : 'DEDUCTION',
        earning_type: activeTab === 'earnings' ? componentData.earningType || 'Basic' : null,
        deduction_type: activeTab === 'deductions' ? componentData.deductionType || 'Percentage' : null,
        calculation_type: getCalculationType(componentData.calculationType),
        value: componentData.value || '0',
        is_active: true,
        is_taxable: true,
        description: `${componentData.name} - ${activeTab === 'earnings' ? componentData.earningType : componentData.deductionType || 'Percentage'}`
      };

      console.log('Sending data to API:', {
        url,
        method,
        data: apiData
      });

      const response = await fetch(
        typeof url === 'string' ? url : String(url),
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: responseData
        });

        let errorMessage = 'Failed to save component';
        if (responseData) {
          if (typeof responseData === 'object') {
            const errors = Object.entries(responseData)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('\n');
            errorMessage = `Validation Error:\n${errors}`;
          } else if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else if (responseData.detail) {
            errorMessage = responseData.detail;
          }
        }

        throw new Error(errorMessage);
      }

      console.log('API Response:', responseData);

      // Close modal and refresh data
      setIsModalOpen(false);
      await fetchComponents();

      // Show success message
      alert(selectedComponent ? 'Component updated successfully!' : 'Component created successfully!');
    } catch (err) {
      console.error('Error saving component:', err);
      setError(err instanceof Error ? err.message : 'Failed to save component');
    }
  };

  // Ensure components is always an array before filtering
  const filteredComponents = Array.isArray(components) ? components.filter(comp => comp.type === activeTab) : [];
  const earningsCount = Array.isArray(components) ? components.filter(comp => comp.type === 'earnings').length : 0;
  const deductionsCount = Array.isArray(components) ? components.filter(comp => comp.type === 'deductions').length : 0;
  const activeCount = Array.isArray(components) ? components.filter(comp => comp.status === 'Active').length : 0;

  if (isLoading) {
    return (
      <SettingsLayout
        title="Salary Components"
        description="Configure earnings and deductions for payroll processing"
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
        title="Salary Components"
        description="Configure earnings and deductions for payroll processing"
      >
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchComponents}
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
      title="Salary Components"
      description="Configure earnings and deductions for payroll processing"
    >
      <div className="p-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Salary Components</h1>
              <p className="text-gray-600 mt-1 text-sm">Manage your company's salary structure and components</p>
            </div>
            <button
              onClick={() => {
                setSelectedComponent(undefined);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-sm hover:shadow-md transform hover:scale-105 text-sm"
            >
              <MdAdd className="w-4 h-4 mr-2" />
              Add Component
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Components</p>
                  <p className="text-2xl font-bold text-gray-800">{components.length}</p>
                </div>
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg">
                  <MdAttachMoney className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-orange-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Earnings</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {components.filter(c => c.type === 'earnings').length}
                  </p>
                </div>
                <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg">
                  <MdAttachMoney className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Deductions</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {components.filter(c => c.type === 'deductions').length}
                  </p>
                </div>
                <div className="p-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg">
                  <MdAttachMoney className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Components List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100">
            <div className="p-4 border-b border-yellow-100">
              <h2 className="text-lg font-semibold text-gray-800">All Salary Components</h2>
            </div>
            
            {components.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <MdAttachMoney className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  No Salary Components Added
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
                  Start by adding your first salary component. You can manage earnings and deductions.
                </p>
                <button
                  onClick={() => {
                    setSelectedComponent(undefined);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-sm hover:shadow-md transform hover:scale-105 text-sm"
                >
                  <MdAdd className="w-4 h-4 mr-2" />
                  Add First Component
                </button>
              </div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {components.map((component, idx) => (
                    <div key={component.id || `temp-${idx}`} className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-yellow-100 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          component.type === 'earnings' 
                            ? 'bg-gradient-to-r from-green-400 to-green-500' 
                            : 'bg-gradient-to-r from-red-400 to-red-500'
                        }`}>
                          <MdAttachMoney className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setSelectedComponent(component);
                              setIsModalOpen(true);
                            }}
                            className="p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                          >
                            <MdEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteComponent(component.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <MdDelete className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-800 mb-1 text-sm">{component.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">Type: {component.type}</p>
                      {/* Description property removed as it does not exist on SalaryComponent */}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Salary Component Modal */}
        <SalaryComponentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveComponent}
          component={selectedComponent}
          type={selectedComponent?.type ?? 'earnings'}
        />
      </div>
    </SettingsLayout>
  );
} 

