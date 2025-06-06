"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface WorkShift {
  checkInTime: string;
  checkOutTime: string;
}

export default function AttendanceManagement() {
  const router = useRouter();
  const [workShift, setWorkShift] = useState<WorkShift>({
    checkInTime: "10:30 AM",
    checkOutTime: "6:00 PM"
  });
  const [calculationType, setCalculationType] = useState("first-last");
  const [workDayDuration, setWorkDayDuration] = useState({
    halfDay: "04:00",
    fullDay: "08:00",
    maxHours: ""
  });
  // Add new state for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedWorkShift, setEditedWorkShift] = useState<WorkShift>({
    checkInTime: "",
    checkOutTime: ""
  });

  // Add new state for regularization settings
  const [regularizationSettings, setRegularizationSettings] = useState({
    allowAnytime: true,
    limitRequests: false,
    restrictDays: false
  });

  // Add state for notification
  const [showNotification, setShowNotification] = useState(false);

  // Add handlers for edit functionality
  const handleEditClick = () => {
    setEditedWorkShift(workShift);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    setWorkShift(editedWorkShift);
    setShowEditModal(false);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
  };

  // Update the save handler
  const handleSave = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000); // Hide after 3 seconds
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
        <h1 className="text-2xl font-semibold text-black flex-1">Attendance Preference</h1>
      </div>

      <div className="max-w-3xl space-y-8">
        {/* Define Work Shift Time */}
        <div>
          <h2 className="text-lg font-semibold text-black mb-2">Define Work Shift Time</h2>
          <p className="text-gray-600 mb-4">Set the regular working hours for your organisation</p>
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex gap-8">
              <div>
                <label className="block text-black mb-2">Check-In Time</label>
                <input 
                  type="text" 
                  value={workShift.checkInTime}
                  className="border rounded px-3 py-2 text-black"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-black mb-2">Check-Out Time</label>
                <input 
                  type="text" 
                  value={workShift.checkOutTime}
                  className="border rounded px-3 py-2 text-black"
                  readOnly
                />
              </div>
              <button 
                className="text-blue-600 self-end hover:text-blue-800"
                onClick={handleEditClick}
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="text-sm text-gray-600">
          Note: Based on your work shift hours, we consider a day in your organisation's attendance cycle to start at 2:15 AM and end at 2:15 AM the next day.
        </div>

        {/* Working Hours Calculation */}
        <div>
          <h2 className="text-lg font-semibold text-black mb-2">Working Hours Calculation</h2>
          <p className="text-gray-600 mb-4">Define how to calculate the total working hours of the employees</p>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input 
                type="radio" 
                id="first-last" 
                checked={calculationType === "first-last"}
                onChange={() => setCalculationType("first-last")}
              />
              <label htmlFor="first-last" className="text-black">
                First check-in and last check-out
              </label>
            </div>
            <p className="text-sm text-gray-600 ml-6">
              Track the initial check-in and final check-out times for accurate attendance records.
            </p>
            <div className="flex items-center gap-2">
              <input 
                type="radio" 
                id="every-check"
                checked={calculationType === "every-check"}
                onChange={() => setCalculationType("every-check")}
              />
              <label htmlFor="every-check" className="text-black">
                Every valid check-in and check-out
              </label>
            </div>
          </div>
        </div>

        {/* Workday Duration */}
        <div>
          <h2 className="text-lg font-semibold text-black mb-2">Workday Duration</h2>
          <p className="text-gray-600 mb-4">Define the minimum and maximum hours for a standard workday, including options for half-day and full-day.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-black mb-2">
                Minimum Hours<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-black">Half Day</span>
                  <input 
                    type="text" 
                    value={workDayDuration.halfDay}
                    className="border rounded px-3 py-2 w-24 text-black"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-black">Full Day</span>
                  <input 
                    type="text" 
                    value={workDayDuration.fullDay}
                    className="border rounded px-3 py-2 w-24 text-black"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-black mb-2">
                Maximum Hours<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-black">Full Day</span>
                <input 
                  type="text" 
                  placeholder="HH:MM"
                  className="border rounded px-3 py-2 w-24 text-black"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Regularization Settings */}
        <div className="relative">
          <h2 className="text-lg font-semibold text-black mb-2">Regularization Settings</h2>
          <p className="text-gray-600 mb-4">
            In situations where check-in or check-out has been missed, choose when employees can request adjustments to ensure accurate records<span className="text-red-500">*</span>
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input 
                type="radio" 
                id="allowAnytime"
                checked={regularizationSettings.allowAnytime}
                onChange={() => setRegularizationSettings({
                  ...regularizationSettings,
                  allowAnytime: true,
                  limitRequests: false
                })}
                className="text-green-500"
              />
              <label htmlFor="allowAnytime" className="text-black">
                Allow Anytime
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="radio" 
                id="limitRequests"
                checked={regularizationSettings.limitRequests}
                onChange={() => setRegularizationSettings({
                  ...regularizationSettings,
                  allowAnytime: false,
                  limitRequests: true
                })}
                className="text-green-500"
              />
              <label htmlFor="limitRequests" className="text-black flex items-center gap-2">
                Limit Requests
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="w-5 h-5 text-gray-400"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm-.25 3.75a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5a.75.75 0 00-.75-.75z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                id="restrictDays"
                checked={regularizationSettings.restrictDays}
                onChange={(e) => setRegularizationSettings({
                  ...regularizationSettings,
                  restrictDays: e.target.checked
                })}
                className="text-green-500"
              />
              <label htmlFor="restrictDays" className="text-black">
                Restrict the number of regularization days an employee can make in a month
              </label>
            </div>
          </div>

          <div className="mt-6">
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Edit Work Shift Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Edit Shift Time</h3>
              <button 
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-black mb-2">Check-In Time</label>
                <input
                  type="time"
                  value={editedWorkShift.checkInTime}
                  onChange={(e) => setEditedWorkShift({
                    ...editedWorkShift,
                    checkInTime: e.target.value
                  })}
                  className="border rounded px-3 py-2 w-full text-black"
                />
              </div>
              
              <div>
                <label className="block text-black mb-2">Check-Out Time</label>
                <input
                  type="time"
                  value={editedWorkShift.checkOutTime}
                  onChange={(e) => setEditedWorkShift({
                    ...editedWorkShift,
                    checkOutTime: e.target.value
                  })}
                  className="border rounded px-3 py-2 w-full text-black"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-up">
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
          <span>Your preferences for attendance has been updated successfully</span>
        </div>
      )}
    </div>
  );
}