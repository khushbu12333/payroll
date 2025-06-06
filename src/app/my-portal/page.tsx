'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';
import { MdHome, MdRequestPage, MdFolder, MdAccountBalanceWallet, MdLogout } from 'react-icons/md';
import { signOut } from 'next-auth/react';

export default function PortalPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('home');

  if (!session) {
    return null;
  }

  const userName = session.user?.name || 'User';
  const userEmail = session.user?.email || '';
  const userImage = session.user?.image || '';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-[#1a1a1a] text-white">
        {/* User Profile */}
        <div className="p-6 text-center border-b border-gray-700">
          <div className="relative w-20 h-20 mx-auto mb-3">
            {userImage ? (
              <Image
                src={userImage}
                alt={userName}
                fill
                className="rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-2xl">
                {userName.charAt(0)}
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold">Welcome {userName}!</h2>
          <p className="text-sm text-gray-400 mt-1">{userEmail}</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center w-full px-4 py-2 rounded-lg ${
              activeTab === 'home' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <MdHome className="w-5 h-5 mr-3" />
            Home
          </button>
          <button
            onClick={() => setActiveTab('salary')}
            className={`flex items-center w-full px-4 py-2 rounded-lg ${
              activeTab === 'salary' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <MdAccountBalanceWallet className="w-5 h-5 mr-3" />
            Salary Details
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center w-full px-4 py-2 rounded-lg ${
              activeTab === 'documents' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <MdFolder className="w-5 h-5 mr-3" />
            Documents
          </button>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 w-full px-4">
          <button
            onClick={() => signOut()}
            className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-gray-800 rounded-lg"
          >
            <MdLogout className="w-5 h-5 mr-3" />
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {activeTab === 'home' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-6">Your Payslips</h2>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-orange-800">
              You will be able to view your payslips once your employer pays you.
            </div>
          </div>
        )}

        {activeTab === 'salary' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-6">Salary Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-700">Take Home</h3>
                <p className="text-2xl font-bold mt-2">₹ ••••••••••</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-700">Deductions</h3>
                <p className="text-2xl font-bold mt-2">₹ ••••••••••</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-6">Documents</h2>
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <MdRequestPage className="w-6 h-6 text-blue-500 mr-3" />
                  <span>Form 16</span>
                </div>
                <button className="text-blue-600 hover:text-blue-700">Download</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}