"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SettingsLayout from '@/components/SettingsLayout';

interface WorkShift {
  checkInTime: string;
  checkOutTime: string;
}

interface AttendancePreference {
  id: string;
  checkInTime: string;
  checkOutTime: string;
  calculationType: string;
  halfDay: string;
  fullDay: string;
  maxHours: string;
  allowAnytime: boolean;
  limitRequests: boolean;
  restrictDays: boolean;
  createdAt: string;
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedWorkShift, setEditedWorkShift] = useState<WorkShift>({
    checkInTime: "",
    checkOutTime: ""
  });

  const [regularizationSettings, setRegularizationSettings] = useState({
    allowAnytime: true,
    limitRequests: false,
    restrictDays: false
  });

  const [showNotification, setShowNotification] = useState(false);

  // CRUD State
  const [preferences, setPreferences] = useState<AttendancePreference[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load/save to localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('attendance_preferences');
      if (raw) {
        const parsed = JSON.parse(raw) as AttendancePreference[];
        setPreferences(Array.isArray(parsed) ? parsed : []);
      }
    } catch (_) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('attendance_preferences', JSON.stringify(preferences));
    } catch (_) {
      // ignore
    }
  }, [preferences]);

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

  const handleSave = () => {
    const id = editingId ?? (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`);
    const pref: AttendancePreference = {
      id,
      checkInTime: workShift.checkInTime,
      checkOutTime: workShift.checkOutTime,
      calculationType,
      halfDay: workDayDuration.halfDay,
      fullDay: workDayDuration.fullDay,
      maxHours: workDayDuration.maxHours,
      allowAnytime: regularizationSettings.allowAnytime,
      limitRequests: regularizationSettings.limitRequests,
      restrictDays: regularizationSettings.restrictDays,
      createdAt: new Date().toISOString(),
    };

    setPreferences((prev) => {
      if (editingId) {
        return prev.map(p => p.id === editingId ? pref : p);
      }
      return [pref, ...prev];
    });

    setEditingId(null);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2200);
  };

  const handleEditPreference = (id: string) => {
    const target = preferences.find(p => p.id === id);
    if (!target) return;
    setEditingId(id);
    setWorkShift({ checkInTime: target.checkInTime, checkOutTime: target.checkOutTime });
    setCalculationType(target.calculationType);
    setWorkDayDuration({ halfDay: target.halfDay, fullDay: target.fullDay, maxHours: target.maxHours });
    setRegularizationSettings({ allowAnytime: target.allowAnytime, limitRequests: target.limitRequests, restrictDays: target.restrictDays });
    // Scroll to top of form for visibility
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePreference = (id: string) => {
    if (!confirm('Delete this attendance preference?')) return;
    setPreferences(prev => prev.filter(p => p.id !== id));
    if (editingId === id) setEditingId(null);
  };

  return (
    <SettingsLayout title={"Attendance Preferences"}>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 px-6 py-10">
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.push('/settings/leave-attendance')}
          className="flex items-center text-yellow-800 hover:text-yellow-900 mr-4"
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
          <span className="text-yellow-800">Back</span>
        </button>
        <h1 className="text-2xl font-bold text-yellow-900 flex-1">Attendance Preferences</h1>
      </div>

      <div className="max-w-4xl space-y-8 mx-auto">
        {/* Define Work Shift Time */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100 p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">Define Work Shift Time</h2>
          <p className="text-yellow-700 mb-4">Set the regular working hours for your organisation</p>
          <div className="rounded-lg space-y-4">
            <div className="flex gap-8">
              <div>
                <label className="block text-yellow-900 mb-2">Check-In Time</label>
                <input 
                  type="text" 
                  value={workShift.checkInTime}
                  className="border border-yellow-300 bg-white rounded px-3 py-2 text-yellow-900 shadow-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-yellow-900 mb-2">Check-Out Time</label>
                <input 
                  type="text" 
                  value={workShift.checkOutTime}
                  className="border border-yellow-300 bg-white rounded px-3 py-2 text-yellow-900 shadow-sm"
                  readOnly
                />
              </div>
              <button 
                className="text-yellow-700 self-end hover:text-yellow-900 font-medium underline"
                onClick={handleEditClick}
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="text-sm text-yellow-700 bg-yellow-100 p-3 rounded-lg">
          Note: Based on your work shift hours, we consider a day in your organisation's attendance cycle to start at 2:15 AM and end at 2:15 AM the next day.
        </div>

        {/* Working Hours Calculation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100 p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">Working Hours Calculation</h2>
          <p className="text-yellow-700 mb-4">Define how to calculate the total working hours of the employees</p>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input 
                type="radio" 
                id="first-last" 
                name="calculation"
                checked={calculationType === "first-last"}
                onChange={() => setCalculationType("first-last")}
                className="text-yellow-600"
              />
              <label htmlFor="first-last" className="text-yellow-900">
                First check-in and last check-out
              </label>
            </div>
            <p className="text-sm text-yellow-700 ml-6">
              Track the initial check-in and final check-out times for accurate attendance records.
            </p>
            <div className="flex items-center gap-2">
              <input 
                type="radio" 
                id="every-check"
                name="calculation"
                checked={calculationType === "every-check"}
                onChange={() => setCalculationType("every-check")}
                className="text-yellow-600"
              />
              <label htmlFor="every-check" className="text-yellow-900">
                Every valid check-in and check-out
              </label>
            </div>
          </div>
        </div>

        {/* Workday Duration */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100 p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">Workday Duration</h2>
          <p className="text-yellow-700 mb-4">Define the minimum and maximum hours for a standard workday, including options for half-day and full-day.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-yellow-900 mb-2">
                Minimum Hours<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-900">Half Day</span>
                  <input 
                    type="text" 
                    value={workDayDuration.halfDay}
                    onChange={(e) => setWorkDayDuration({...workDayDuration, halfDay: e.target.value})}
                    className="border border-yellow-300 bg-white rounded px-3 py-2 w-24 text-yellow-900"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-900">Full Day</span>
                  <input 
                    type="text" 
                    value={workDayDuration.fullDay}
                    onChange={(e) => setWorkDayDuration({...workDayDuration, fullDay: e.target.value})}
                    className="border border-yellow-300 bg-white rounded px-3 py-2 w-24 text-yellow-900"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-yellow-900 mb-2">
                Maximum Hours<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-yellow-900">Full Day</span>
                <input 
                  type="text" 
                  placeholder="HH:MM"
                  value={workDayDuration.maxHours}
                  onChange={(e) => setWorkDayDuration({...workDayDuration, maxHours: e.target.value})}
                  className="border border-yellow-300 bg-white rounded px-3 py-2 w-24 text-yellow-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Regularization Settings */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100 p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">Regularization Settings</h2>
          <p className="text-yellow-700 mb-4">
            In situations where check-in or check-out has been missed, choose when employees can request adjustments to ensure accurate records<span className="text-red-500">*</span>
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input 
                type="radio" 
                id="allowAnytime"
                name="regularization"
                checked={regularizationSettings.allowAnytime}
                onChange={() => setRegularizationSettings({
                  ...regularizationSettings,
                  allowAnytime: true,
                  limitRequests: false
                })}
                className="text-yellow-600"
              />
              <label htmlFor="allowAnytime" className="text-yellow-900">
                Allow Anytime
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="radio" 
                id="limitRequests"
                name="regularization"
                checked={regularizationSettings.limitRequests}
                onChange={() => setRegularizationSettings({
                  ...regularizationSettings,
                  allowAnytime: false,
                  limitRequests: true
                })}
                className="text-yellow-600"
              />
              <label htmlFor="limitRequests" className="text-yellow-900 flex items-center gap-2">
                Limit Requests
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="w-5 h-5 text-yellow-600"
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
                className="text-yellow-600"
              />
              <label htmlFor="restrictDays" className="text-yellow-900">
                Restrict the number of regularization days an employee can make in a month
              </label>
            </div>
          </div>

          <div className="mt-6">
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors duration-200 font-semibold shadow-sm hover:shadow-md"
            >
              {editingId ? 'Update Preference' : 'Save Preference'}
            </button>
          </div>
        </div>
      </div>

      {/* Saved Preferences List */}
      {preferences.length > 0 && (
        <div className="max-w-4xl mx-auto mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-yellow-900">Saved Attendance Preferences</h2>
            <span className="text-xs text-yellow-700">{preferences.length} saved</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preferences.map((p) => (
              <div key={p.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{p.checkInTime || '—'} → {p.checkOutTime || '—'}</div>
                    <div className="text-xs text-gray-500 mt-1">Calc: {p.calculationType.replace('-', ' ')}</div>
                  </div>
                  <div className="text-[10px] text-gray-400">{new Date(p.createdAt).toLocaleString()}</div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-700">
                  <div className="bg-yellow-50 border border-yellow-100 rounded px-2 py-1">Half: {p.halfDay}</div>
                  <div className="bg-yellow-50 border border-yellow-100 rounded px-2 py-1">Full: {p.fullDay}</div>
                  <div className="bg-yellow-50 border border-yellow-100 rounded px-2 py-1">Max: {p.maxHours || '—'}</div>
                  <div className="bg-yellow-50 border border-yellow-100 rounded px-2 py-1">Reg: {p.allowAnytime ? 'Anytime' : (p.limitRequests ? 'Limited' : '—')}</div>
                </div>
                <div className="mt-4 flex gap-2 justify-end">
                  <button
                    onClick={() => handleEditPreference(p.id)}
                    className="px-3 py-1 text-xs rounded border border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePreference(p.id)}
                    className="px-3 py-1 text-xs rounded border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Work Shift Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md border border-yellow-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-yellow-900">Edit Shift Time</h3>
              <button 
                onClick={handleCancelEdit}
                className="text-yellow-600 hover:text-yellow-800 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-yellow-900 mb-2">Check-In Time</label>
                <input
                  type="time"
                  value={editedWorkShift.checkInTime}
                  onChange={(e) => setEditedWorkShift({
                    ...editedWorkShift,
                    checkInTime: e.target.value
                  })}
                  className="border border-yellow-300 rounded px-3 py-2 w-full text-yellow-900"
                />
              </div>
              
              <div>
                <label className="block text-yellow-900 mb-2">Check-Out Time</label>
                <input
                  type="time"
                  value={editedWorkShift.checkOutTime}
                  onChange={(e) => setEditedWorkShift({
                    ...editedWorkShift,
                    checkOutTime: e.target.value
                  })}
                  className="border border-yellow-300 rounded px-3 py-2 w-full text-yellow-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-yellow-300 rounded text-yellow-700 hover:bg-yellow-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
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
    </SettingsLayout>
  );
}