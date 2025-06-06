'use client';

import { useState, useEffect } from 'react';
import { MdEdit, MdMoreVert, MdPerson, MdDelete } from 'react-icons/md';
import WorkLocationModal from '@/components/WorkLocationModal';

interface Employee {
  id: string;
  workLocationId: string;
}

interface WorkLocation {
  id: string;
  name: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  isFilingAddress: boolean;
}

export default function WorkLocationsPage() {
  const [locations, setLocations] = useState<WorkLocation[]>([
    {
      id: '1',
      name: 'Head Office',
      address: 'college',
      city: 'mumbai',
      state: 'Andaman and Nicobar Islands',
      pincode: '401105',
      isFilingAddress: true
    }
  ]);

  // Simulated employees data - in real app, this would come from your API/database
  const [employees] = useState<Employee[]>([
    { id: '1', workLocationId: '1' },
    { id: '2', workLocationId: '1' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<WorkLocation | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);

  const getEmployeeCount = (locationId: string) => {
    return employees.filter(emp => emp.workLocationId === locationId).length;
  };

  const handleAddLocation = () => {
    setSelectedLocation(undefined);
    setIsModalOpen(true);
  };

  const handleEditLocation = (location: WorkLocation) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
  };

  const handleDeleteLocation = (locationId: string) => {
    const employeeCount = getEmployeeCount(locationId);
    if (employeeCount > 0) {
      alert('Cannot delete location with assigned employees');
      return;
    }
    
    const isFilingLocation = locations.find(loc => loc.id === locationId)?.isFilingAddress;
    if (isFilingLocation) {
      alert('Cannot delete filing address location');
      return;
    }

    setLocationToDelete(locationId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (locationToDelete) {
      setLocations(locations.filter(loc => loc.id !== locationToDelete));
    }
    setShowDeleteConfirm(false);
    setLocationToDelete(null);
  };

  const handleSaveLocation = (locationData: Omit<WorkLocation, 'id' | 'isFilingAddress'>) => {
    if (selectedLocation) {
      // Edit existing location
      setLocations(locations.map(loc => 
        loc.id === selectedLocation.id 
          ? { ...loc, ...locationData }
          : loc
      ));
    } else {
      // Add new location
      const newLocation: WorkLocation = {
        id: String(Date.now()),
        ...locationData,
        isFilingAddress: false
      };
      setLocations([...locations, newLocation]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Work Locations</h1>
          <button
            onClick={handleAddLocation}
            className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Add Work Location
          </button>
        </div>

        {/* Location Cards */}
        <div className="grid grid-cols-1 gap-6">
          {locations.map((location) => (
            <div
              key={location.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">{location.name}</h2>
                    <div className="mt-1 text-sm text-gray-500">
                      <p>{location.address}</p>
                      {location.address2 && <p>{location.address2}</p>}
                      <p>{location.city}, {location.state} {location.pincode}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditLocation(location)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      title="Edit location"
                    >
                      <MdEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(location.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                      title="Delete location"
                    >
                      <MdDelete className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Employee Count */}
                <div className="flex items-center mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MdPerson className="w-5 h-5 mr-1.5 text-gray-400" />
                    <span>{getEmployeeCount(location.id)} Employees</span>
                  </div>
                  {location.isFilingAddress && (
                    <span className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      FILING ADDRESS
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Location Modal */}
      <WorkLocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLocation}
        location={selectedLocation}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="relative bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Location</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this location? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 