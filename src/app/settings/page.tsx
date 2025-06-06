'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MdBusiness,
  MdLocationOn,
  MdPeople,
  MdWork,
  MdAttachMoney,
  MdReceipt,
  MdSchedule,
  MdSettings,
  MdAutorenew,
  MdCode,
  MdGroup,
  MdLabel,
  MdPayment,
  MdEventNote
} from 'react-icons/md';

const settingsNavigation = [
  { name: 'Organisation Profile', href: '/settings/organisation', icon: MdBusiness },
  { name: 'Work Locations', href: '/settings/locations', icon: MdLocationOn },
  { name: 'Departments', href: '/settings/departments', icon: MdPeople },
  { name: 'Designations', href: '/settings/designations', icon: MdWork },
  { name: 'Salary Components', href: '/settings/salary-components', icon: MdAttachMoney },
  { name: 'Salary Templates', href: '/settings/salary-templates', icon: MdReceipt },
  { name: 'Leave & Attendance', href: '/settings/leave-attendance', icon: MdEventNote },
  { name: 'Users & Roles', href: '/settings/users-roles', icon: MdGroup },
  { name: 'Email Templates', href: '/settings/email-templates', icon: MdWork}
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r">
        <div className="p-4">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Settings</h1>
          <nav className="space-y-1">
            {settingsNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <item.icon className="w-5 h-5 mr-3 text-gray-400" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 text-sm font-medium border-b-2 ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Organisation Profile
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Organisation Logo */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Organisation Logo</h3>
                <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-400">Upload Logo</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    This logo will be displayed on documents such as Payslip and TDS Worksheet.
                  </p>
                  <p className="text-xs text-gray-400">
                    Preferred Image Size: 240 x 240 pixels @ 72 DPI, Maximum size of 1MB.
                  </p>
                </div>
              </div>

              {/* Organisation Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organisation Name<span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    This is your registered business name which will appear in all the forms and payslips.
                  </p>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter organisation name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Location<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value="India"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry<span className="text-red-500">*</span>
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option>Construction</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Format<span className="text-red-500">*</span>
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option>dd/MM/yyyy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field Separator
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option>/</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organisation Address<span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    This will be considered as the address of your primary work location.
                  </p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Address Line 1"
                    />
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Address Line 2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 