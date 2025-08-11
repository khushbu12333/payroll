"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SettingsLayout from "@/components/SettingsLayout";

interface LeaveType {
  leaveName: string;
  leaveType: string;
  unit: string;
  status: string;
}

export default function LeaveTypes() {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [applicabilityType, setApplicabilityType] = useState<'all' | 'criteria'>('criteria');
  
  // Initialize with default "Absent" leave type
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([
    {
      leaveName: "Absent",
      leaveType: "Unpaid",
      unit: "Day",
      status: "Active",
    }
  ]);

  const [showResetEvery, setShowResetEvery] = useState(true);
  const [showCarryForward, setShowCarryForward] = useState(true);
  const [showEncashment, setShowEncashment] = useState(true);

  const [showNegativeBalance, setShowNegativeBalance] = useState(true);
  const [showPastDates, setShowPastDates] = useState(true);
  const [showFutureDates, setShowFutureDates] = useState(true);

  const [pastDateLimitType, setPastDateLimitType] = useState<'no-limit' | 'set-limit'>('no-limit');
  const [futureDateLimitType, setFutureDateLimitType] = useState<'no-limit' | 'set-limit'>('no-limit');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newLeaveType: LeaveType = {
      leaveName: formData.get('leaveName') as string,
      leaveType: formData.get('leaveType') as string,
      unit: "Day",
      status: "Active",
    };

    setLeaveTypes([...leaveTypes, newLeaveType]);
    setShowAddForm(false);
  };

  // Toggle status function
  const toggleStatus = (index: number) => {
    const updatedLeaveTypes = [...leaveTypes];
    updatedLeaveTypes[index].status = updatedLeaveTypes[index].status === "Active" ? "Inactive" : "Active";
    setLeaveTypes(updatedLeaveTypes);
  };

  return (
    <SettingsLayout title="Leave Types" description="Set up and manage leave types for your organization">
      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push('/settings/leave-attendance')}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 group"
        >
          <svg 
                className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
          </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-semibold">Add New</span>
          </button>
        )}
      </div>

      {!showAddForm ? (
          /* Leave Types Table */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Leave Types</h2>
              <p className="text-gray-600 text-sm mt-1">Manage your organization's leave types and policies</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
          <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Leave Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Leave Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
                <tbody className="bg-white divide-y divide-gray-100">
            {leaveTypes.map((leave, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white font-semibold text-sm">{leave.leaveName.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{leave.leaveName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          leave.leaveType === 'Paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {leave.leaveType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{leave.unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleStatus(index)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 ${
                            leave.status === "Active"
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            leave.status === "Active" ? 'bg-green-400' : 'bg-red-400'
                          }`}></span>
                          {leave.status}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 transition-colors p-1 hover:bg-blue-50 rounded">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button className="text-red-600 hover:text-red-900 transition-colors p-1 hover:bg-red-50 rounded">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
              </tr>
            ))}
          </tbody>
        </table>
            </div>
            
            {leaveTypes.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leave types found</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first leave type</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200"
                >
                  Add Leave Type
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Add Leave Type Form */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
              <h2 className="text-xl font-semibold text-gray-800">Add New Leave Type</h2>
              <p className="text-gray-600 text-sm mt-1">Configure leave type settings and preferences</p>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Leave Name *</label>
                <input
                  type="text"
                  name="leaveName"
                  required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="e.g., Annual Leave, Sick Leave"
                />
              </div>
              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type *</label>
                <select 
                  name="leaveType"
                  required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="">Select leave type</option>
                        <option value="Paid">Paid Leave</option>
                        <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>
            </div>

                  {/* Description Field */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter leave type description..."
                    />
                  </div>
                </div>

                {/* Leave Allocation Settings */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How many leaves do employees get? *
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Leave Quantity */}
                    <div className="flex items-center space-x-4">
                      <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                        <option value="yearly">Yearly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        defaultValue="1"
                        className="w-20 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                      <span className="text-gray-700 font-medium">Days</span>
                    </div>

                    {/* Pro-rate Option */}
                    <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                      <input type="checkbox" id="proRate" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" defaultChecked />
                      <label htmlFor="proRate" className="ml-3 text-sm font-medium text-gray-700 flex items-center">
                        Pro-rate leave balance for new joinees based on their date of joining
                        <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                  </label>
                </div>

                    {/* Reset Balance Option */}
                    <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        id="resetBalance"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={showResetEvery}
                        onChange={() => setShowResetEvery((prev) => !prev)}
                      />
                      <label htmlFor="resetBalance" className="ml-3 text-sm font-medium text-gray-700 flex items-center">
                        Reset the leave balance of employees
                        <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </label>
                      {showResetEvery && (
                        <div className="ml-4 flex items-center space-x-2">
                          <span className="text-sm text-gray-600">every</span>
                          <select className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                            <option value="yearly">Yearly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Carry Forward Option */}
                    <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        id="carryForward"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={showCarryForward}
                        onChange={() => setShowCarryForward((prev) => !prev)}
                      />
                      <label htmlFor="carryForward" className="ml-3 text-sm font-medium text-gray-700 flex items-center">
                        Carry forward unused leave days upon reset?
                        <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </label>
                      {showCarryForward && (
                        <div className="ml-4 flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Max carry forward days</span>
                          <input
                            type="number"
                            min="0"
                            defaultValue="0"
                            className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>
                      )}
                    </div>

                    {/* Encashment Option */}
                    <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        id="encashment"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={showEncashment}
                        onChange={() => setShowEncashment((prev) => !prev)}
                      />
                      <label htmlFor="encashment" className="ml-3 text-sm font-medium text-gray-700 flex items-center">
                        Encash remaining leave days?
                        <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </label>
                      {showEncashment && (
                        <div className="ml-4 flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Max encashment days</span>
                          <input
                            type="number"
                            min="0"
                            className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>
                      )}
                    </div>
              </div>
            </div>

                {/* Employee Leave Request Preferences */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Employee Leave Request Preferences
                  </h3>
                  <div className="space-y-6">
                    {/* Allow negative leave balance */}
                    <div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="negativeBalance"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={showNegativeBalance}
                          onChange={() => setShowNegativeBalance((prev) => !prev)}
                        />
                        <label htmlFor="negativeBalance" className="ml-3 text-sm font-medium text-gray-700 flex items-center">
                          Allow negative leave balance
                          <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </label>
                      </div>
                      {showNegativeBalance && (
                        <div className="flex items-center mt-3 ml-7">
                          <span className="text-sm text-gray-600 mr-2">Consider negative leave balance as</span>
                          <select className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                            <option value="">Select</option>
                            <option value="no-limit">No limit</option>
                            <option value="year-end-limit">Year end limit</option>
                            <option value="no-limit-lop">No limit and mark as LOP</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Allow applying for leave on past dates */}
                    <div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="allowPastDates"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={showPastDates}
                          onChange={() => setShowPastDates((prev) => !prev)}
                        />
                        <label htmlFor="allowPastDates" className="ml-3 text-sm font-medium text-gray-700">
                          Allow applying for leave on past dates
                        </label>
                      </div>
                      {showPastDates && (
                        <div className="ml-7 mt-2 space-y-2">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="noLimitPast"
                              name="pastDateLimit"
                              checked={pastDateLimitType === 'no-limit'}
                              onChange={() => setPastDateLimitType('no-limit')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="noLimitPast" className="ml-2 text-sm text-gray-700">No limit on past dates</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="setLimitPast"
                              name="pastDateLimit"
                              checked={pastDateLimitType === 'set-limit'}
                              onChange={() => setPastDateLimitType('set-limit')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="setLimitPast" className="ml-2 text-sm text-gray-700">Set Limit</label>
                            {pastDateLimitType === 'set-limit' && (
                              <>
                                <input
                                  type="number"
                                  min="0"
                                  className="ml-2 w-24 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                  placeholder="days"
                                />
                                <span className="ml-2 text-sm text-gray-500">days before today</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Allow applying for leave on future dates */}
                    <div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="allowFutureDates"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={showFutureDates}
                          onChange={() => setShowFutureDates((prev) => !prev)}
                        />
                        <label htmlFor="allowFutureDates" className="ml-3 text-sm font-medium text-gray-700">
                          Allow applying for leave on future dates
                        </label>
                      </div>
                      {showFutureDates && (
                        <div className="ml-7 mt-2 space-y-2">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="noLimitFuture"
                              name="futureDateLimit"
                              checked={futureDateLimitType === 'no-limit'}
                              onChange={() => setFutureDateLimitType('no-limit')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="noLimitFuture" className="ml-2 text-sm text-gray-700">No limit on future dates</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="setLimitFuture"
                              name="futureDateLimit"
                              checked={futureDateLimitType === 'set-limit'}
                              onChange={() => setFutureDateLimitType('set-limit')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="setLimitFuture" className="ml-2 text-sm text-gray-700">Set Limit</label>
                            {futureDateLimitType === 'set-limit' && (
                              <>
                                <input
                                  type="number"
                                  min="0"
                                  className="ml-2 w-24 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                  placeholder="days"
                                />
                                <span className="ml-2 text-sm text-gray-500">days after today</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Applicability and Validity */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Applicability and Validity
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Who can apply this leave */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Who all can apply this leave?</label>
                      <div className="space-y-3">
                        <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                          <input 
                            type="radio" 
                            id="allEmployees" 
                            name="applicability" 
                            checked={applicabilityType === 'all'}
                            onChange={() => setApplicabilityType('all')}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                          />
                          <label htmlFor="allEmployees" className="ml-3 text-sm font-medium text-gray-700">All employees</label>
                        </div>
                        <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                          <input 
                            type="radio" 
                            id="criteriaBased" 
                            name="applicability" 
                            checked={applicabilityType === 'criteria'}
                            onChange={() => setApplicabilityType('criteria')}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                          />
                          <label htmlFor="criteriaBased" className="ml-3 text-sm font-medium text-gray-700">Criteria-Based Employees</label>
                        </div>
                      </div>
                    </div>

                    {/* Criteria-Based Filters */}
                    <div className={`ml-7 space-y-4 ${applicabilityType === 'all' ? 'opacity-50 pointer-events-none' : ''}`}>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">Add criteria option</h4>
                        <button
                          type="button"
                          disabled={applicabilityType === 'all'}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Criteria
                        </button>
                      </div>

                      {/* Work Locations */}
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 w-24">Work Locations</span>
                        <span className="text-sm text-gray-600">is</span>
                        <div className="flex-1">
                          <select 
                            disabled={applicabilityType === 'all'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">Select Work Location</option>
                            <option value="head-office">Head Office</option>
                            <option value="branch-1">Branch 1</option>
                            <option value="branch-2">Branch 2</option>
                            <option value="remote">Remote</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          disabled={applicabilityType === 'all'}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Departments */}
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 w-24">Departments</span>
                        <span className="text-sm text-gray-600">is</span>
                        <div className="flex-1">
                          <select 
                            disabled={applicabilityType === 'all'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">Select Department</option>
                            <option value="it">IT</option>
                            <option value="hr">HR</option>
                            <option value="finance">Finance</option>
                            <option value="marketing">Marketing</option>
                            <option value="operations">Operations</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          disabled={applicabilityType === 'all'}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Designations */}
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 w-24">Designations</span>
                        <span className="text-sm text-gray-600">is</span>
                        <div className="flex-1">
                          <select 
                            disabled={applicabilityType === 'all'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">Select Designation</option>
                            <option value="manager">Manager</option>
                            <option value="senior-developer">Senior Developer</option>
                            <option value="developer">Developer</option>
                            <option value="hr-executive">HR Executive</option>
                            <option value="accountant">Accountant</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          disabled={applicabilityType === 'all'}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Gender */}
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 w-24">Gender</span>
                        <span className="text-sm text-gray-600">is</span>
                        <div className="flex-1">
                          <select 
                            disabled={applicabilityType === 'all'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          disabled={applicabilityType === 'all'}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Postpone leave credits */}
                    <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                      <input type="checkbox" id="postponeCredits" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <label htmlFor="postponeCredits" className="ml-3 text-sm font-medium text-gray-700">Postpone leave credits for employees</label>
                      <div className="ml-4 flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          defaultValue="0"
                          className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                        <select className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                          <option value="year">Year</option>
                          <option value="month">Month</option>
                        </select>
                        <span className="text-sm text-gray-600">after date of joining</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Leave type effective from */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Leave type effective from</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>

                    {/* Set expiry for leave type */}
                    <div>
                      <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                        <input type="checkbox" id="setExpiry" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <label htmlFor="setExpiry" className="ml-3 text-sm font-medium text-gray-700">Set expiry for leave type</label>
                      </div>
                      <div className="ml-1 mt-3">
                        <input
                          type="date"
                          placeholder="dd MMM yyyy"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 font-medium shadow-lg"
                  >
                    Save Leave Type
                  </button>
            </div>
          </form>
            </div>
        </div>
      )}
    </div>
    </SettingsLayout>
  );
}