"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SettingsLayout from "@/components/SettingsLayout";

interface Holiday {
  id: string;
  name: string;
  date: string;
  year: string;
  description: string;
  startDate: string;
  endDate: string;
  category: string;
}

interface AddHolidayFormData {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  category: string;
}

export default function HolidayManagement() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [formData, setFormData] = useState<AddHolidayFormData>({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    category: 'National'
  });

  const years = ["2026", "2025", "2024", "2023", "2022"];
  const categories = ["All Categories", "National", "Religious", "Cultural", "Company"];

  const getCategoryColor = (category: string) => {
    const colors = {
      National: "bg-blue-100 text-blue-800 border-blue-200",
      Religious: "bg-purple-100 text-purple-800 border-purple-200",
      Cultural: "bg-green-100 text-green-800 border-green-200",
      Company: "bg-orange-100 text-orange-800 border-orange-200"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const handleAddNew = () => {
    setShowAddForm(true);
    setEditingHoliday(null);
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      description: '',
      category: 'National'
    });
  };

  const handleEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setShowAddForm(true);
    setFormData({
      name: holiday.name,
      startDate: holiday.startDate,
      endDate: holiday.endDate,
      description: holiday.description,
      category: holiday.category
    });
  };

  const handleDelete = (holidayId: string) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      setHolidays(holidays.filter(holiday => holiday.id !== holidayId));
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingHoliday(null);
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      description: '',
      category: 'National'
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingHoliday) {
      const updatedHoliday: Holiday = {
        ...editingHoliday,
        name: formData.name,
        date: `${formData.startDate}${formData.endDate !== formData.startDate ? ` - ${formData.endDate}` : ''}`,
        year: new Date(formData.startDate).getFullYear().toString(),
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        category: formData.category
      };

      setHolidays(holidays.map(holiday => 
        holiday.id === editingHoliday.id ? updatedHoliday : holiday
      ));
    } else {
      const newHoliday: Holiday = {
        id: Date.now().toString(),
        name: formData.name,
        date: `${formData.startDate}${formData.endDate !== formData.startDate ? ` - ${formData.endDate}` : ''}`,
        year: new Date(formData.startDate).getFullYear().toString(),
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        category: formData.category
      };

      setHolidays([...holidays, newHoliday]);
    }
    
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      description: '',
      category: 'National'
    });
    
    setShowAddForm(false);
    setEditingHoliday(null);
  };

  const filteredHolidays = holidays.filter(holiday => {
    const yearMatch = selectedYear === "All Years" || holiday.year === selectedYear;
    const categoryMatch = selectedCategory === "All Categories" || holiday.category === selectedCategory;
    return yearMatch && categoryMatch;
  });

  return (
    <SettingsLayout title="Holiday Management">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/settings/leave-attendance')}
              className="group flex items-center space-x-2 bg-white text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Holiday Management
              </h1>
              <p className="text-slate-600 mt-1">Organize and manage your company holidays</p>
            </div>
          </div>
          
          <button 
            onClick={handleAddNew}
            className="group flex items-center space-x-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-semibold">Add Holiday</span>
          </button>
        </div>

        {showAddForm ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingHoliday ? 'Edit Holiday' : 'Create New Holiday'}
                </h2>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-3">
                      Holiday Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
                      placeholder="Enter holiday name..."
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-3">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-3">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-3">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="National">National Holiday</option>
                      <option value="Religious">Religious Holiday</option>
                      <option value="Cultural">Cultural Holiday</option>
                      <option value="Company">Company Holiday</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-3">
                      Description
                    </label>
                    <textarea
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all duration-200 resize-none"
                      rows={4}
                      placeholder="Add a description for this holiday..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-200">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-semibold">{editingHoliday ? 'Update Holiday' : 'Save Holiday'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center space-x-2 bg-slate-500 text-white px-8 py-3 rounded-xl hover:bg-slate-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="font-semibold">Cancel</span>
                  </button>
                </div>
                <p className="text-sm text-slate-500 mt-4">
                  <span className="text-red-500">*</span> Required fields
                </p>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl mb-8 border border-white/20 shadow-lg">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                  </div>
                  <span className="text-slate-700 font-semibold">Filter by:</span>
                </div>
                
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="border-2 border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-800 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border-2 border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-800 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Holiday List or Empty State */}
            {filteredHolidays.length === 0 ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-32 h-32 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">
                    {holidays.length === 0 ? 'Start Building Your Holiday Calendar' : 'No holidays found'}
                  </h2>
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    {holidays.length === 0 
                      ? 'Create your first holiday to begin organizing your company calendar and improving attendance tracking.'
                      : 'Try adjusting your filters or create a new holiday for the selected criteria.'
                    }
                  </p>
                  <button 
                    onClick={handleAddNew}
                    className="group inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-semibold">Create Your First Holiday</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                        <th className="px-6 py-4 text-left text-slate-700 font-bold">Holiday Name</th>
                        <th className="px-6 py-4 text-left text-slate-700 font-bold">Date</th>
                        <th className="px-6 py-4 text-left text-slate-700 font-bold">Category</th>
                        <th className="px-6 py-4 text-left text-slate-700 font-bold">Description</th>
                        <th className="px-6 py-4 text-center text-slate-700 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHolidays.map((holiday, index) => (
                        <tr key={holiday.id} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-800">{holiday.name}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{holiday.date}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(holiday.category)}`}>
                              {holiday.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {holiday.description ? (
                              <div className="max-w-xs">
                                <p className="text-sm leading-relaxed">
                                  {holiday.description.length > 60 ? holiday.description.substring(0, 60) + '...' : holiday.description}
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm italic">No description</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => handleEdit(holiday)}
                                className="group flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                              >
                                <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span className="font-medium text-sm">Edit</span>
                              </button>
                              <button 
                                onClick={() => handleDelete(holiday.id)}
                                className="group flex items-center space-x-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                              >
                                <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="font-medium text-sm">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Summary */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600 flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Showing <strong>{filteredHolidays.length}</strong> of <strong>{holidays.length}</strong> holidays</span>
                    </p>
                    {filteredHolidays.length > 0 && (
                      <div className="text-sm text-slate-500">
                        Year: <strong>{selectedYear}</strong> | Category: <strong>{selectedCategory}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </SettingsLayout>
  );
}