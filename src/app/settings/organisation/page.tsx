'use client';

import { useState, useRef } from 'react';
import { MdUpload, MdClose } from 'react-icons/md';
import Image from 'next/image';

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
    <div className="min-h-screen bg-white">
      {/* Success Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 text-green-800 px-4 py-3 rounded-lg shadow-lg border border-green-200 flex items-center animate-fade-in">
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Organisation profile updated successfully
        </div>
      )}

      {/* Content */}
      <div className="max-w-[800px] mx-auto py-8 px-4">
        <div className="space-y-8">
          {/* Organisation Logo */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Organisation Logo</h3>
            <div className="mt-2 border border-dashed border-gray-300 rounded-lg p-6 bg-white">
              <div className="flex items-start space-x-8">
                <div className="w-[240px] h-[160px] bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center relative">
                  {logo ? (
                    <>
                      <Image
                        src={logo}
                        alt="Organization Logo"
                        fill
                        className="object-contain p-4 rounded-lg"
                      />
                      <button
                        onClick={removeLogo}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                      >
                        <MdClose className="w-4 h-4 text-gray-500" />
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
                        className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-100 transition-colors rounded-lg"
                      >
                        <MdUpload className="w-6 h-6 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Upload Logo</span>
                      </label>
                    </>
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-sm text-gray-600">
                    This logo will be displayed on documents such as Payslip and TDS Worksheet.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Preferred Image Size: 240 × 240 pixels @ 72 DPI, Maximum size of 1MB.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Organisation Name */}
          <div className="pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organisation Name<span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-2">
              This is your registered business name which will appear in all the forms and payslips.
            </p>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="block w-full h-10 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm text-black"
            />
          </div>

          {/* Business Location and Industry */}
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Location<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.businessLocation}
                readOnly
                className="block w-full h-10 px-3 rounded-md border border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="block w-full h-10 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm text-black"
              >
                <option>Construction</option>
              </select>
            </div>
          </div>

          {/* Date Format */}
          <div className="pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Format<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.dateFormat}
                  onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                  className="block w-full h-10 px-3 pr-10 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm text-black appearance-none bg-white"
                >
                  {dateFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.display} [ {format.example} ]
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                    <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Organisation Address */}
          <div className="pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organisation Address<span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-2">
              This will be considered as the address of your primary work location.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                value={formData.address1}
                onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                className="block w-full h-10 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm text-black"
                placeholder="Address Line 1"
              />
              <input
                type="text"
                value={formData.address2}
                onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                className="block w-full h-10 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm text-black"
                placeholder="Address Line 2"
              />
              <div className="grid grid-cols-3 gap-4">
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="block w-full h-10 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm text-black"
                >
                  <option>Andaman and Nicobar Islands</option>
                </select>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="block w-full h-10 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm text-black"
                  placeholder="City"
                />
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="block w-full h-10 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm text-black"
                  placeholder="Pincode"
                />
              </div>
            </div>
          </div>

          {/* Filing Address */}
          <div className="pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filing Address</label>
            <p className="text-sm text-gray-500 mb-2">
              This registered address will be used across all Forms and Payslips.
            </p>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">Head Office</span>
                <button className="text-sm text-blue-600 hover:text-blue-700">Change</button>
              </div>
              <div className="text-sm text-gray-600">
                <p>{formData.address1}</p>
                <p>{formData.city}, {formData.state} {formData.pincode}</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
    </div>
  );
} 