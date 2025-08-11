'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface SalaryComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (component: any) => void;
  type: 'earnings' | 'deductions';
  component?: {
    id?: string;
    name: string;
    earningType?: string;
    deductionType?: string;
    calculationType: string;
  };
}

const earningCalculationTypes = [
  'Basic (CTC*50%)',
  'HRA (CTC*20%)',
  'Conveyance Allowance (CTC*10%)',
  'Meal Allowance (CTC*10%)',
  'Telephone Allowance (CTC*2%)',
  'Medical Allowance (CTC*3%)',
  'Personal Pay (CTC*5%)'
];

const deductionCalculationTypes = {
  'PT': '200 Deducted',
  'Advance': 'Custom'
};

const earningTypes = [
  'Basic',
  'House Rent Allowance',
  'Conveyance Allowance',
  'Meal Allowance',
  'Telephone Allowance',
  'Medical Allowance',
  'Personal Pay',
  'Custom Allowance'
];

const deductionTypes = [
  'PT',
  'Advance'
];

export default function SalaryComponentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  type,
  component 
}: SalaryComponentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    earningType: '',
    deductionType: '',
    calculationType: type === 'earnings' ? earningCalculationTypes[0] : deductionCalculationTypes['PT']
  });

  useEffect(() => {
    if (component) {
      setFormData({
        name: component.name,
        earningType: component.earningType || '',
        deductionType: component.deductionType || '',
        calculationType: component.calculationType
      });
    } else {
      setFormData({
        name: '',
        earningType: '',
        deductionType: '',
        calculationType: type === 'earnings' ? earningCalculationTypes[0] : deductionCalculationTypes['PT']
      });
    }
  }, [component, type]);

  const handleDeductionTypeChange = (selectedType: string) => {
    setFormData({
      ...formData,
      deductionType: selectedType,
      calculationType: deductionCalculationTypes[selectedType as keyof typeof deductionCalculationTypes]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 backdrop-blur-sm backdrop-filter transition-opacity" />
          </Transition.Child>

          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="w-full">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-6">
                      {component ? 'Edit Component' : `New ${type === 'earnings' ? 'Earning' : 'Deduction'} Component`}
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                          Component Name<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>

                      {type === 'earnings' ? (
                        <div>
                          <label htmlFor="earningType" className="block text-sm font-medium text-gray-900">
                            Earning Type<span className="text-red-500">*</span>
                          </label>
                          <select
                            id="earningType"
                            value={formData.earningType}
                            onChange={(e) => setFormData({ ...formData, earningType: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            required
                          >
                            <option value="">Select Type</option>
                            {earningTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label htmlFor="deductionType" className="block text-sm font-medium text-gray-900">
                            Deduction Type<span className="text-red-500">*</span>
                          </label>
                          <select
                            id="deductionType"
                            value={formData.deductionType}
                            onChange={(e) => handleDeductionTypeChange(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            required
                          >
                            <option value="">Select Type</option>
                            {deductionTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label htmlFor="calculationType" className="block text-sm font-medium text-gray-900">
                          Calculation Type<span className="text-red-500">*</span>
                        </label>
                        {type === 'earnings' ? (
                          <select
                            id="calculationType"
                            value={formData.calculationType}
                            onChange={(e) => setFormData({ ...formData, calculationType: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            required
                          >
                            {earningCalculationTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            id="calculationType"
                            value={formData.calculationType}
                            readOnly={formData.deductionType === 'PT'}
                            onChange={(e) => setFormData({ ...formData, calculationType: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            required
                          />
                        )}
                      </div>

                      <div className="text-xs text-red-500 mt-4">
                        * indicates mandatory fields
                      </div>

                      <div className="mt-5 sm:mt-4 flex justify-end space-x-2">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="inline-flex justify-center rounded-md border border-transparent bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 

