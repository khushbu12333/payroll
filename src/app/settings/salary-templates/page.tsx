'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MdDesignServices, MdContentCopy, MdTimer, MdEdit, MdDelete, MdAdd, MdReceipt, MdPeople, MdCheckCircle, MdDescription } from 'react-icons/md';
import SalaryTemplateModal from '@/components/SalaryTemplateModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import SettingsLayout from '@/components/SettingsLayout';

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
  const [templates, setTemplates] = useState<SalaryTemplate[]>([
    {
      id: '1',
      name: 'Junior Developer Template',
      description: 'Standard template for junior software developers',
      annualCTC: '600000',
      monthlyCTC: '50000',
      status: 'Active',
      earnings: [
        { name: 'Basic Salary', calculationType: 'Fixed', calculationBasis: 'Monthly', monthlyAmount: 30000, annualAmount: 360000 },
        { name: 'HRA', calculationType: 'Percentage', calculationBasis: 'Basic', monthlyAmount: 15000, annualAmount: 180000 },
        { name: 'Special Allowance', calculationType: 'Fixed', calculationBasis: 'Monthly', monthlyAmount: 5000, annualAmount: 60000 }
      ]
    },
    {
      id: '2',
      name: 'Senior Developer Template',
      description: 'Template for senior software developers and team leads',
      annualCTC: '1200000',
      monthlyCTC: '100000',
      status: 'Active',
      earnings: [
        { name: 'Basic Salary', calculationType: 'Fixed', calculationBasis: 'Monthly', monthlyAmount: 60000, annualAmount: 720000 },
        { name: 'HRA', calculationType: 'Percentage', calculationBasis: 'Basic', monthlyAmount: 30000, annualAmount: 360000 },
        { name: 'Performance Bonus', calculationType: 'Fixed', calculationBasis: 'Monthly', monthlyAmount: 10000, annualAmount: 120000 }
      ]
    }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<SalaryTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string>('');

  const handleSaveTemplate = (template: any) => {
    if (selectedTemplate) {
      // Edit existing template
      setTemplates(templates.map(t => 
        t.id === selectedTemplate.id 
          ? { ...selectedTemplate, ...template }
          : t
      ));
    } else {
      // Create new template
      const newTemplate: SalaryTemplate = {
        id: String(Date.now()),
        ...template,
        status: 'Active'
      };
      setTemplates([...templates, newTemplate]);
    }
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

  const activeTemplates = templates.filter(t => t.status === 'Active').length;
  const inactiveTemplates = templates.filter(t => t.status === 'Inactive').length;

  return (
    <SettingsLayout
      title="Salary Templates"
      description="Manage your company's salary templates and structures"
    >
      <div className="p-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Salary Templates</h1>
              <p className="text-gray-600 mt-1 text-sm">Manage your company's salary templates and structures</p>
            </div>
            <button
              onClick={() => {
                setSelectedTemplate(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-sm hover:shadow-md transform hover:scale-105 text-sm"
            >
              <MdAdd className="w-4 h-4 mr-2" />
              Add Template
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Templates</p>
                  <p className="text-2xl font-bold text-gray-800">{templates.length}</p>
                </div>
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg">
                  <MdDescription className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-orange-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Active Templates</p>
                  <p className="text-2xl font-bold text-gray-800">{activeTemplates}</p>
                </div>
                <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg">
                  <MdDescription className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Employees</p>
                  <p className="text-2xl font-bold text-gray-800">0</p>
                </div>
                <div className="p-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg">
                  <MdDescription className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Templates List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100">
            <div className="p-4 border-b border-yellow-100">
              <h2 className="text-lg font-semibold text-gray-800">All Salary Templates</h2>
            </div>
            
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <MdDescription className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  No Salary Templates Added
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
                  Start by adding your first salary template. You can manage salary structures.
                </p>
                <button
                  onClick={() => {
                    setSelectedTemplate(null);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-sm hover:shadow-md transform hover:scale-105 text-sm"
                >
                  <MdAdd className="w-4 h-4 mr-2" />
                  Add First Template
                </button>
              </div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-yellow-100 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                          <MdDescription className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsModalOpen(true);
                            }}
                            className="p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                          >
                            <MdEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(template.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <MdDelete className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-800 mb-1 text-sm">{template.name}</h3>
                      <p className="text-xs text-gray-600">{template.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
    </SettingsLayout>
  );
} 