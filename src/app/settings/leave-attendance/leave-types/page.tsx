"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface LeaveType {
  leaveName: string;
  leaveType: string;
  unit: string;
  status: string;
}

export default function LeaveTypes() {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  // Initialize with default "Absent" leave type
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([
    {
      leaveName: "Absent",
      leaveType: "Unpaid",
      unit: "Day",
      status: "Active",
    }
  ]);

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

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.push('/settings/leave-attendance')}
          className="flex items-center text-black hover:text-gray-800 mr-4"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
          <span className="text-black">Back to Leave Settings</span>
        </button>
        <h1 className="text-2xl font-semibold text-black flex-1">Leave Types</h1>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            + Add New
          </button>
        )}
      </div>

      {!showAddForm ? (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left text-black">Leave Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-black">Leave Type</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-black">Unit</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-black">Status</th>
            </tr>
          </thead>
          <tbody>
            {leaveTypes.map((leave, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2 text-black">{leave.leaveName}</td>
                <td className="border border-gray-300 px-4 py-2 text-black">{leave.leaveType}</td>
                <td className="border border-gray-300 px-4 py-2 text-black">{leave.unit}</td>
                <td className="border border-gray-300 px-4 py-2 text-green-600">{leave.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-black mb-4">Add Leave Type</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-black font-medium mb-2">Leave Name*</label>
                <input
                  type="text"
                  name="leaveName"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Enter leave name"
                />
              </div>
              <div>
                <label className="block text-black font-medium mb-2">Select Type*</label>
                <select 
                  name="leaveType"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Select</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-black font-medium mb-2">
                Employee Leave Request Preferences
              </label>
              <div className="space-y-2">
                <div>
                  <input type="checkbox" id="negativeBalance" />
                  <label htmlFor="negativeBalance" className="ml-2 text-black">Allow negative leave balance</label>
                </div>
                <div>
                  <input type="checkbox" id="pastDates" />
                  <label htmlFor="pastDates" className="ml-2 text-black">
                    Allow applying for leave on past dates
                  </label>
                </div>
                <div>
                  <input type="checkbox" id="futureDates" />
                  <label htmlFor="futureDates" className="ml-2 text-black">
                    Allow applying for leave on future dates
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-black font-medium mb-2">
                Applicability and Validity
              </label>
              <div className="space-y-4">
                <div>
                  <label className="text-black font-medium">Who can apply this leave?</label>
                  <div className="flex items-center gap-4 mt-2">
                    <input type="radio" id="allEmployees" name="applicability" />
                    <label htmlFor="allEmployees" className="text-black">All employees</label>
                    <input type="radio" id="criteriaBased" name="applicability" />
                    <label htmlFor="criteriaBased" className="text-black">
                      Criteria-Based Employees
                    </label>
                  </div>
                </div>
                <div>
                  <input type="checkbox" id="postponeCredits" />
                  <label htmlFor="postponeCredits" className="ml-2 text-black">
                    Postpone leave credits for employees
                  </label>
                </div>
                <div>
                  <label className="block text-black font-medium mb-2">
                    Leave type effective from
                  </label>
                  <input
                    type="date"
                    className="border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <input type="checkbox" id="setExpiry" />
                  <label htmlFor="setExpiry" className="ml-2 text-black">
                    Set expiry for leave type
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save Leave Type
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}