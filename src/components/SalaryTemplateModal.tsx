'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { MdClose, MdInfo } from 'react-icons/md';

interface SalaryTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: any) => void;
  template?: {
    id?: string;
    name: string;
    description: string;
    annualCTC: string;
    monthlyCTC: string;
    earnings: Array<{
      name: string;
      calculationType: string;
      calculationBasis: string;
      monthlyAmount: number;
      annualAmount: number;
    }>;
  };
}

export default function SalaryTemplateModal({ isOpen, onClose, onSave, template }: SalaryTemplateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    annualCTC: '',
    monthlyCTC: '',
    earnings: [
      {
        name: 'Basic',
        calculationType: '50.00',
        calculationBasis: '% of CTC',
        monthlyAmount: 0,
        annualAmount: 0
      },
      {
        name: 'HRA',
        calculationType: '20.00',
        calculationBasis: '% of CTC',
        monthlyAmount: 0,
        annualAmount: 0
      },
      {
        name: 'Conveyance Allowance',
        calculationType: '10.00',
        calculationBasis: '% of CTC',
        monthlyAmount: 0,
        annualAmount: 0
      },
      {
        name: 'Meal Allowance',
        calculationType: '10.00',
        calculationBasis: '% of CTC',
        monthlyAmount: 0,
        annualAmount: 0
      },
      {
        name: 'Telephone Allowance',
        calculationType: '2.00',
        calculationBasis: '% of CTC',
        monthlyAmount: 0,
        annualAmount: 0
      },
      {
        name: 'Medical Allowance',
        calculationType: '3.00',
        calculationBasis: '% of CTC',
        monthlyAmount: 0,
        annualAmount: 0
      },
      {
        name: 'Personal Pay',
        calculationType: '5.00',
        calculationBasis: '% of CTC',
        monthlyAmount: 0,
        annualAmount: 0
      }
    ]
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        annualCTC: template.annualCTC,
        monthlyCTC: template.monthlyCTC,
        earnings: template.earnings
      });
    } else {
      setFormData({
        name: '',
        description: '',
        annualCTC: '',
        monthlyCTC: '',
        earnings: [
          {
            name: 'Basic',
            calculationType: '50.00',
            calculationBasis: '% of CTC',
            monthlyAmount: 0,
            annualAmount: 0
          },
          {
            name: 'HRA',
            calculationType: '20.00',
            calculationBasis: '% of CTC',
            monthlyAmount: 0,
            annualAmount: 0
          },
          {
            name: 'Conveyance Allowance',
            calculationType: '10.00',
            calculationBasis: '% of CTC',
            monthlyAmount: 0,
            annualAmount: 0
          },
          {
            name: 'Meal Allowance',
            calculationType: '10.00',
            calculationBasis: '% of CTC',
            monthlyAmount: 0,
            annualAmount: 0
          },
          {
            name: 'Telephone Allowance',
            calculationType: '2.00',
            calculationBasis: '% of CTC',
            monthlyAmount: 0,
            annualAmount: 0
          },
          {
            name: 'Medical Allowance',
            calculationType: '3.00',
            calculationBasis: '% of CTC',
            monthlyAmount: 0,
            annualAmount: 0
          },
          {
            name: 'Personal Pay',
            calculationType: '5.00',
            calculationBasis: '% of CTC',
            monthlyAmount: 0,
            annualAmount: 0
          }
        ]
      });
    }
  }, [template]);

  const handleCTCChange = (value: string, type: 'annual' | 'monthly') => {
    const numValue = parseFloat(value) || 0;
    if (type === 'annual') {
      setFormData({
        ...formData,
        annualCTC: value,
        monthlyCTC: (numValue / 12).toString()
      });
    } else {
      setFormData({
        ...formData,
        monthlyCTC: value,
        annualCTC: (numValue * 12).toString()
      });
    }
  };

  const calculateAmounts = () => {
    const annualCTC = parseFloat(formData.annualCTC) || 0;
    const updatedEarnings = formData.earnings.map(earning => {
      const percentage = parseFloat(earning.calculationType) || 0;
      const monthlyAmount = (annualCTC * (percentage / 100)) / 12;
      return {
        ...earning,
        monthlyAmount: Math.round(monthlyAmount),
        annualAmount: Math.round(monthlyAmount * 12)
      };
    });

    setFormData(prev => ({
      ...prev,
      earnings: updatedEarnings
    }));
  };

  useEffect(() => {
    calculateAmounts();
  }, [formData.annualCTC]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity" />
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
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <MdClose className="h-6 w-6" />
                  </button>
                </div>

                <div className="w-full">
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-6">
                    New Salary Template
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Template Details */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                          Template Name<span className="text-red-500">*</span>
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
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-900">
                          Description
                        </label>
                        <input
                          type="text"
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                          placeholder="Max 500 Characters"
                        />
                      </div>
                    </div>

                    {/* CTC Section */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="annualCTC" className="block text-sm font-medium text-gray-900">
                          Annual CTC
                        </label>
                        <div className="mt-1 flex items-center">
                          <span className="text-gray-500 mr-2">₹</span>
                          <input
                            type="number"
                            id="annualCTC"
                            value={formData.annualCTC}
                            onChange={(e) => handleCTCChange(e.target.value, 'annual')}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                          />
                          <span className="text-gray-500 ml-2">per year</span>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="monthlyCTC" className="block text-sm font-medium text-gray-900">
                          Monthly CTC
                        </label>
                        <div className="mt-1 flex items-center">
                          <span className="text-gray-500 mr-2">₹</span>
                          <input
                            type="number"
                            id="monthlyCTC"
                            value={formData.monthlyCTC}
                            onChange={(e) => handleCTCChange(e.target.value, 'monthly')}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                          />
                          <span className="text-gray-500 ml-2">per month</span>
                        </div>
                      </div>
                    </div>

                    {/* Earnings Table */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Earnings</h4>
                      <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Salary Components
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Calculation Type
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Monthly Amount
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Annual Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {formData.earnings.map((earning, index) => (
                              <tr key={earning.name}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {earning.name}
                                  {earning.name === 'Fixed Allowance' && (
                                    <div className="flex items-center mt-1">
                                      <MdInfo className="w-4 h-4 text-gray-400 mr-1" />
                                      <span className="text-xs text-gray-500">{earning.calculationBasis}</span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {earning.name === 'Basic' ? (
                                    <div className="flex items-center">
                                      <input
                                        type="number"
                                        value={earning.calculationType}
                                        onChange={(e) => {
                                          const updatedEarnings = [...formData.earnings];
                                          updatedEarnings[index] = {
                                            ...earning,
                                            calculationType: e.target.value
                                          };
                                          setFormData({ ...formData, earnings: updatedEarnings });
                                          calculateAmounts();
                                        }}
                                        className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                                        step="0.01"
                                      />
                                      <span className="ml-2">% of CTC</span>
                                    </div>
                                  ) : (
                                    earning.calculationType
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  ₹ {earning.monthlyAmount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  ₹ {earning.annualAmount.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                            {/* Cost to Company Row */}
                            <tr className="bg-gray-50">
                              <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Cost to Company
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                ₹ {(parseFloat(formData.annualCTC) / 12 || 0).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                ₹ {(parseFloat(formData.annualCTC) || 0).toLocaleString()}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-6 flex justify-end space-x-2">
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
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 