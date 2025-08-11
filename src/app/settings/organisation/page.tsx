'use client';

import { useState, useRef } from 'react';
import { MdUpload, MdClose, MdBusiness } from 'react-icons/md';
import Image from 'next/image';
import SettingsLayout from '@/components/SettingsLayout';

const dateFormats = [
  { value: 'dd MMM yyyy', display: '02 Jun 2025', example: '02 Jun 2025' },
  { value: 'dd/MM/yyyy', display: 'dd/MM/yyyy', example: '02/06/2025' },
  { value: 'MM/dd/yyyy', display: 'MM/dd/yyyy', example: '06/02/2025' },
  { value: 'yyyy-MM-dd', display: 'yyyy-MM-dd', example: '2025-06-02' },
  { value: 'dd-MM-yyyy', display: 'dd-MM-yyyy', example: '02-06-2025' },
  { value: 'dd.MM.yyyy', display: 'dd.MM.yyyy', example: '02.06.2025' },
];

export default function OrganisationProfilePage() {
  const [logo, setLogo] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [formData, setFormData] = useState({
    name: 'build',
    businessLocation: 'India',
    industry: 'Construction',
    dateFormat: 'dd MMM yyyy',
    address1: 'college',
    address2: '',
    state: 'Andaman and Nicobar Islands',
    city: 'mumbai',
    pincode: '401105'
  });

  const states = [
    'Andaman and Nicobar Islands',
    'Andhra Pradesh',
    // Add other states...
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
  };

  const handleSave = () => {
    // Save the form data
    localStorage.setItem('organisationProfile', JSON.stringify(formData));
    
    // Show notification
    setShowNotification(true);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  return (
    <SettingsLayout
      title="Organization Profile"
      description="Configure your company details and basic information"
    >
      {/* Success Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 text-green-800 px-4 py-3 rounded-lg shadow-sm border border-green-200 flex items-center animate-fade-in">
          <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Organisation profile updated successfully
        </div>
      )}

      <div className="p-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Organisation Logo */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100 p-4">
            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
              <MdBusiness className="w-4 h-4 mr-2 text-yellow-500" />
              Organisation Logo
            </h3>
            <div className="border border-dashed border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <div className="flex items-start space-x-4">
                <div className="w-[160px] h-[120px] bg-white border-2 border-yellow-200 rounded-lg flex flex-col items-center justify-center relative shadow-sm">
                  {logo ? (
                    <>
                      <Image
                        src={logo}
                        alt="Organization Logo"
                        fill
                        className="object-contain p-3 rounded-lg"
                      />
                      <button
                        onClick={removeLogo}
                        className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600 transition-colors"
                      >
                        <MdClose className="w-2 h-2" />
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="logo-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                      <label 
                        htmlFor="logo-upload"
                        className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-yellow-50 transition-colors rounded-lg group"
                      >
                        <MdUpload className="w-6 h-6 text-gray-400 group-hover:text-yellow-500 mb-1 transition-colors" />
                        <span className="text-xs text-gray-500 group-hover:text-yellow-600 font-medium">Upload Logo</span>
                      </label>
                    </>
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-xs text-gray-600 mb-1">
                    This logo will be displayed on documents such as Payslip and TDS Worksheet.
                  </p>
                  <p className="text-xs text-gray-500">
                    Preferred Image Size: 240 × 240 pixels @ 72 DPI, Maximum size of 1MB.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100 p-4">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Basic Information</h3>

            {/* Organisation Name */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Organisation Name<span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                This is your registered business name which will appear in all the forms and payslips.
              </p>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full px-3 py-2 rounded-lg border border-yellow-200 shadow-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-20 text-gray-800 placeholder-gray-400 transition-all text-sm"
                placeholder="Enter your organization name"
              />
            </div>

            {/* Business Location and Industry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Business Location<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.businessLocation}
                  readOnly
                  className="block w-full px-3 py-2 rounded-lg border border-yellow-200 bg-yellow-50 shadow-sm text-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Industry<span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="block w-full px-3 py-2 rounded-lg border border-yellow-200 shadow-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-20 text-gray-800 text-sm"
                >
                  <option>Construction</option>
                </select>
              </div>
            </div>

            {/* Date Format */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date Format<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.dateFormat}
                onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                className="block w-full px-3 py-2 rounded-lg border border-yellow-200 shadow-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-20 text-gray-800 text-sm"
              >
                {dateFormats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.display} [ {format.example} ]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100 p-4">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Address Information</h3>
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Organisation Address<span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                This will be considered as the address of your primary work location.
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.address1}
                  onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                  className="block w-full px-3 py-2 rounded-lg border border-yellow-200 shadow-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-20 text-gray-800 placeholder-gray-400 text-sm"
                  placeholder="Address Line 1"
                />
                <input
                  type="text"
                  value={formData.address2}
                  onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                  className="block w-full px-3 py-2 rounded-lg border border-yellow-200 shadow-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-20 text-gray-800 placeholder-gray-400 text-sm"
                  placeholder="Address Line 2"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="block w-full px-3 py-2 rounded-lg border border-yellow-200 shadow-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-20 text-gray-800 text-sm"
                  >
                    <option>Andaman and Nicobar Islands</option>
                  </select>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="block w-full px-3 py-2 rounded-lg border border-yellow-200 shadow-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-20 text-gray-800 placeholder-gray-400 text-sm"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="block w-full px-3 py-2 rounded-lg border border-yellow-200 shadow-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-20 text-gray-800 placeholder-gray-400 text-sm"
                    placeholder="Pincode"
                  />
                </div>
              </div>
            </div>

            {/* Filing Address */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Filing Address</label>
              <p className="text-xs text-gray-500 mb-2">
                This registered address will be used across all Forms and Payslips.
              </p>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-800">Head Office</span>
                  <button className="text-xs text-yellow-600 hover:text-yellow-700 font-medium">Change</button>
                </div>
                <div className="text-xs text-gray-700">
                  <p>{formData.address1}</p>
                  <p>{formData.city}, {formData.state} {formData.pincode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-20 transition-all shadow-sm hover:shadow-md transform hover:scale-105 text-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </SettingsLayout>
  );
} 