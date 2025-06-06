"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Holiday {
  name: string;
  date: string;
  location: string;
  year: string;
}

interface AddHolidayFormData {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  locations: string[];
}

export default function HolidayManagement() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<AddHolidayFormData>({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    locations: ['All Locations']
  });

  const years = ["2026", "2025", "2024", "2023", "2022"];
  const locations = ["All Locations", "Location 1", "Location 2"];

  const handleAddNew = () => {
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      description: '',
      locations: ['All Locations']
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new holiday object
    const newHoliday: Holiday = {
      name: formData.name,
      date: `${formData.startDate}${formData.endDate !== formData.startDate ? ` - ${formData.endDate}` : ''}`,
      location: formData.locations[0],
      year: new Date(formData.startDate).getFullYear().toString()
    };

    // Add new holiday to the list
    setHolidays([...holidays, newHoliday]);
    
    // Reset form
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      description: '',
      locations: ['All Locations']
    });
    
    // Close form
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
        <h1 className="text-2xl font-semibold text-black flex-1">Holidays</h1>
        <button 
          onClick={handleAddNew}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          + Add New
        </button>
      </div>

      {showAddForm ? (
        <div className="max-w-3xl mx-auto bg-white p-6">
          <h2 className="text-xl font-semibold text-black mb-6">Add Holiday</h2>
          <form onSubmit={handleSave}>
            <div className="space-y-6">
              <div>
                <label className="block text-black font-medium mb-2">
                  Holiday Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-black font-medium mb-2">
                  Date<span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    required
                    className="border border-gray-300 rounded-md px-3 py-2 text-black"
                    placeholder="Start date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                  <input
                    type="date"
                    required
                    className="border border-gray-300 rounded-md px-3 py-2 text-black"
                    placeholder="End date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-black font-medium mb-2">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-black font-medium mb-2">
                  This Holiday is applicable for?
                </label>
                <div>
                  <label className="block text-black mb-2">Work Locations</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                    value={formData.locations[0]}
                    onChange={(e) => setFormData({...formData, locations: [e.target.value]})}
                  >
                    <option value="All Locations">All Locations</option>
                    {locations.map((location) => (
                      location !== "All Locations" && (
                        <option key={location} value={location}>{location}</option>
                      )
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-white text-gray-600 px-4 py-2 rounded border border-gray-300"
              >
                Cancel
              </button>
            </div>
            <p className="mt-4 text-sm text-red-500">* indicates mandatory fields</p>
          </form>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-black font-medium">FILTER BY :</span>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 bg-white text-black"
                  >
                    {years.map((year) => (
                      <option key={year} value={year} className="text-black">
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 bg-white text-black"
                  >
                    {locations.map((location) => (
                      <option key={location} value={location} className="text-black">
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {holidays.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6">
                <img
                  src="https://static.zohocdn.com/zpayroll/zpayroll//assets/images/empty-states/holiday-empty-state-4813599e4b5328ee0c47f7993d69f192.svg"
                  alt="Configure Holidays"
                  className="mx-auto w-48 h-48"
                />
              </div>
              <h2 className="text-xl font-semibold text-black mb-2">
                Configure Holidays For Your Organisation
              </h2>
              <p className="text-black mb-6">
                Add new holidays to your calendar for accurate tracking and attendance management.
              </p>
              <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                + Add New
              </button>
            </div>
          ) : (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left text-black">Holiday Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-black">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-black">Location</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((holiday, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2 text-black">{holiday.name}</td>
                    <td className="border border-gray-300 px-4 py-2 text-black">{holiday.date}</td>
                    <td className="border border-gray-300 px-4 py-2 text-black">{holiday.location}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button className="text-blue-600 hover:text-blue-800">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}