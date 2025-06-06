"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface SetupPreferences {
  attendanceCycle: string;
  reportGenerationDay: string;
  includeLeaveEncashment: boolean;
}

export default function SetupPreferences() {
  const router = useRouter();
  
  const attendanceCycleOptions = [
    "1st - 30th",
    "1st - 31st",
  ];

  const reportGenerationDays = ["7th", "6th", "5th", "4th", "3rd"];

  const [preferences, setPreferences] = useState<SetupPreferences>({
    attendanceCycle: "26th - 25th",
    reportGenerationDay: "End Date",
    includeLeaveEncashment: false
  });

  const handleSave = () => {
    // Add save logic here
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const [showNotification, setShowNotification] = useState(false);

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
        <h1 className="text-2xl font-semibold text-black flex-1">Preferences</h1>
      </div>

      <div className="max-w-3xl space-y-8">
        {/* Attendance Cycle */}
        <div>
          <h2 className="text-lg font-semibold text-black mb-2">Attendance Cycle</h2>
          <p className="text-gray-600 mb-4">Define the start and end days of your organisation's attendance cycle.</p>
          <div className="relative">
            <select 
              value={preferences.attendanceCycle}
              onChange={(e) => setPreferences({...preferences, attendanceCycle: e.target.value})}
              className="appearance-none w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 text-black hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {attendanceCycleOptions.map((cycle) => (
                <option 
                  key={cycle} 
                  value={cycle}
                  className="py-2"
                >
                  {cycle}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Payroll Report Generation Day */}
        <div>
          <h2 className="text-lg font-semibold text-black mb-2">Payroll Report Generation Day</h2>
          <p className="text-gray-600 mb-4">Choose when to generate payroll reports from leave and attendance data.</p>
          <div className="relative">
            <select 
              value={preferences.reportGenerationDay}
              onChange={(e) => setPreferences({...preferences, reportGenerationDay: e.target.value})}
              className="appearance-none w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 text-black hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {reportGenerationDays.map((day) => (
                <option 
                  key={day} 
                  value={day}
                  className="py-2"
                >
                  {day}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Leave Encashment */}
        <div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox"
              id="leaveEncashment"
              checked={preferences.includeLeaveEncashment}
              onChange={(e) => setPreferences({...preferences, includeLeaveEncashment: e.target.checked})}
              className="text-green-500"
            />
            <label htmlFor="leaveEncashment" className="text-black font-medium">Include leave encashment details in pay run</label>
          </div>
          <p className="text-gray-600 ml-6 mt-1">
            Select this option to include leave encashment details of employees in a particular month's pay.
          </p>
          <p className="text-sm text-gray-600 ml-6 mt-4">
            Note: You can access the leave encashment days only if the active leave encashment salary component is 
            formula-based. To view or modify the leave encashment, navigate to{" "}
            <span className="text-blue-600">Settings &gt; Salary Components &gt; Edit Leave Encashment</span>.
          </p>
        </div>

        <div>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-up z-50">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>Leave and Attendance settings have been updated</span>
        </div>
      )}
    </div>
  );
}