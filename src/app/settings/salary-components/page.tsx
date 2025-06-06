'use client';

import { useState } from 'react';
import { MdEdit, MdDelete } from 'react-icons/md';
import SalaryComponentModal from '@/components/SalaryComponentModal';

interface SalaryComponent {
  id: string;
  name: string;
  type: 'earnings' | 'deductions';
  earningType?: string;
  deductionType?: string;
  calculationType: string;
  status: 'Active' | 'Inactive';
}

export default function SalaryComponentsPage() {
  const [activeTab, setActiveTab] = useState<'earnings' | 'deductions'>('earnings');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<SalaryComponent | undefined>();
  const [components, setComponents] = useState<SalaryComponent[]>([
    {
      id: '1',
      name: 'Profession Tax',
      type: 'deductions',
      deductionType: 'PT',
      calculationType: '200 Deducted',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Advances',
      type: 'deductions',
      deductionType: 'Advance',
      calculationType: 'Custom',
      status: 'Active'
    }
  ]);

  const handleAddComponent = (type: 'earnings' | 'deductions') => {
    setActiveTab(type);
    setSelectedComponent(undefined);
    setIsModalOpen(true);
  };

  const handleEditComponent = (component: SalaryComponent) => {
    setSelectedComponent(component);
    setIsModalOpen(true);
  };

  const handleDeleteComponent = (componentId: string) => {
    if (confirm('Are you sure you want to delete this component?')) {
      setComponents(components.filter(comp => comp.id !== componentId));
    }
  };

  const handleToggleStatus = (componentId: string) => {
    setComponents(components.map(comp => 
      comp.id === componentId 
        ? { ...comp, status: comp.status === 'Active' ? 'Inactive' : 'Active' }
        : comp
    ));
  };

  const handleSaveComponent = (componentData: Partial<SalaryComponent>) => {
    if (selectedComponent) {
      // Edit existing component
      setComponents(components.map(comp => 
        comp.id === selectedComponent.id 
          ? { ...comp, ...componentData }
          : comp
      ));
    } else {
      // Add new component
      const newComponent: SalaryComponent = {
        id: String(Date.now()),
        type: activeTab,
        status: 'Active',
        ...componentData as any
      };
      setComponents([...components, newComponent]);
    }
  };

  const filteredComponents = components.filter(comp => comp.type === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Salary Components</h1>
          <button
            onClick={() => handleAddComponent(activeTab)}
            className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Add Component
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('earnings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'earnings'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Earnings
            </button>
            <button
              onClick={() => setActiveTab('deductions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'deductions'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Deductions
            </button>
          </nav>
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'earnings' ? 'Earning Type' : 'Deduction Type'}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calculation Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComponents.map((component) => (
                <tr key={component.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      {component.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activeTab === 'earnings' ? component.earningType : component.deductionType || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {component.calculationType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(component.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                        component.status === 'Active' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {component.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditComponent(component)}
                      className="text-gray-400 hover:text-gray-600 mr-3"
                      title="Edit component"
                    >
                      <MdEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteComponent(component.id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Delete component"
                    >
                      <MdDelete className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-700">
          <div>Total Count: {filteredComponents.length}</div>
          <div className="flex items-center space-x-4">
            <span>50 per page</span>
            <span>1 - {filteredComponents.length}</span>
          </div>
        </div>
      </div>

      {/* Add/Edit Component Modal */}
      <SalaryComponentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveComponent}
        component={selectedComponent}
        type={activeTab}
      />
    </div>
  );
} 