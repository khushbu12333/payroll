'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MdDesignServices, MdContentCopy, MdTimer, MdEdit, MdDelete } from 'react-icons/md';
import SalaryTemplateModal from '@/components/SalaryTemplateModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface SalaryTemplate {
  id: string;
  name: string;
  description: string;
  annualCTC: string;
  monthlyCTC: string;
  status: 'Active' | 'Inactive';
  earnings: Array<{
    name: string;
    calculationType: string;
    calculationBasis: string;
    monthlyAmount: number;
    annualAmount: number;
  }>;
}

export default function SalaryTemplatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [templates, setTemplates] = useState<SalaryTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SalaryTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string>('');

  const handleSaveTemplate = (template: any) => {
    const newTemplate: SalaryTemplate = {
      id: String(Date.now()),
      ...template,
      status: 'Active'
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleEditTemplate = (template: SalaryTemplate) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (templateId: string) => {
    setTemplateToDelete(templateId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setTemplates(templates.filter(template => template.id !== templateToDelete));
    setIsDeleteModalOpen(false);
    setTemplateToDelete('');
  };

  const toggleStatus = (templateId: string) => {
    setTemplates(templates.map(template => 
      template.id === templateId 
        ? { ...template, status: template.status === 'Active' ? 'Inactive' : 'Active' }
        : template
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Salary Templates</h1>
        </div>

        {templates.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div className="relative w-64 h-64 mx-auto mb-6">
              <Image
                src="https://static.zohocdn.com/zpayroll/zpayroll//assets/images/empty-states/ind/salary-template-40e3edf414b7d4b9909393c4af54c91d.svg"
                alt="No salary templates"
                fill
                className="object-contain"
              />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              You haven't created any salary templates yet.
            </h2>
            <p className="text-gray-500 mb-6">
              Create salary templates for commonly used salary structures and assign them to employees.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Create Salary Template
            </button>
          </div>
        ) : (
          // Templates List
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Create New
              </button>
            </div>
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
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
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                          {template.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {template.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                            template.status === 'Active' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                          onClick={() => toggleStatus(template.id)}
                          title="Click to toggle status"
                        >
                          {template.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Edit template"
                          >
                            <MdEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(template.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Delete template"
                          >
                            <MdDelete className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Features Section */}
        {templates.length === 0 && (
          <div className="mt-16">
            <h3 className="text-lg font-medium text-gray-900 text-center mb-8">
              With this feature you can
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Design Feature */}
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MdDesignServices className="w-6 h-6 text-red-500" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Design</h4>
                <p className="text-sm text-gray-500">
                  Create custom salary structures with flexible components
                </p>
              </div>

              {/* Duplicate Feature */}
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MdContentCopy className="w-6 h-6 text-yellow-500" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Duplicate</h4>
                <p className="text-sm text-gray-500">
                  Copy existing templates to create similar structures quickly
                </p>
              </div>

              {/* Save Time Feature */}
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MdTimer className="w-6 h-6 text-green-500" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Save Time</h4>
                <p className="text-sm text-gray-500">
                  Streamline salary structure creation for multiple employees
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Salary Template Modal */}
      <SalaryTemplateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTemplate(null);
        }}
        onSave={handleSaveTemplate}
        template={selectedTemplate || undefined}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTemplateToDelete('');
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
      />
    </div>
  );
} 