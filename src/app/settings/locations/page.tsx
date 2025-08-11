'use client';

import { useEffect, useState } from 'react';
import { MdEdit, MdDelete, MdAdd, MdLocationOn, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import SettingsLayout from '@/components/SettingsLayout';
import WorkLocationModal from '@/components/WorkLocationModal';

interface WorkLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  status: 'Active' | 'Inactive';
}

interface ApiWorkLocation {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  status: 'Active' | 'Inactive';
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<WorkLocation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<WorkLocation | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<WorkLocation>>({
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    status: 'Active'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLocations();
  }, [currentPage]);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/work-locations/?page=${currentPage}&page_size=${itemsPerPage}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch work locations');
      }
      
      const data: PaginationInfo = await response.json();
      
      // Calculate total pages
      const total = data.count || 0;
      const pages = Math.ceil(total / itemsPerPage);
      setTotalPages(pages);
      setTotalItems(total);
      
      // Transform the data to match our interface
      const transformedData = data.results.map((item: any) => ({
        id: String(item.id || ''),
        name: String(item.name || ''),
        address: String(item.address || ''),
        city: String(item.city || ''),
        state: String(item.state || ''),
        country: String(item.country || ''),
        pincode: String(item.pincode || ''),
        status: item.status === 'Inactive' ? 'Inactive' : 'Active' as 'Active' | 'Inactive'
      }));

      console.log('Fetched locations:', transformedData);
      setLocations(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLocation = () => {
    setSelectedLocation(undefined);
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleEditLocation = (location: WorkLocation) => {
    setSelectedLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state,
      country: location.country,
      pincode: location.pincode,
      status: location.status
    });
    setIsModalOpen(true);
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (confirm('Are you sure you want to delete this work location?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/work-locations/${locationId}/`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete work location');
        }
        await fetchLocations(); // Refresh the list
      } catch (err) {
        console.error('Error deleting location:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete work location');
      }
    }
  };

  const handleToggleStatus = async (locationId: string) => {
    try {
      const location = locations.find(loc => loc.id === locationId);
      if (!location) return;

      const response = await fetch(`http://127.0.0.1:8000/api/work-locations/${locationId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: location.status === 'Active' ? 'Inactive' : 'Active'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update work location status');
      }
      await fetchLocations(); // Refresh the list
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update work location status');
    }
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = selectedLocation 
        ? `http://127.0.0.1:8000/api/work-locations/${selectedLocation.id}/`
        : 'http://127.0.0.1:8000/api/work-locations/';
      
      const method = selectedLocation ? 'PUT' : 'POST';

      // Prepare the data according to Django model fields
      const apiData = {
        name: formData.name?.trim() || '',
        address: formData.address?.trim() || '',
        city: formData.city?.trim() || '',
        state: formData.state?.trim() || '',
        country: formData.country?.trim() || '',
        pincode: formData.pincode?.trim() || '',
        status: formData.status || 'Active'
      };

      console.log('Sending data to API:', {
        url,
        method,
        data: apiData
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: responseData
        });

        let errorMessage = 'Failed to save work location';
        if (responseData) {
          if (typeof responseData === 'object') {
            const errors = Object.entries(responseData)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('\n');
            errorMessage = `Validation Error:\n${errors}`;
          } else if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else if (responseData.detail) {
            errorMessage = responseData.detail;
          }
        }

        throw new Error(errorMessage);
      }

      console.log('API Response:', responseData);

      // Close modal and refresh data
      setIsModalOpen(false);
      await fetchLocations();

      // Show success message
      alert(selectedLocation ? 'Work location updated successfully!' : 'Work location created successfully!');
    } catch (err) {
      console.error('Error saving location:', err);
      setError(err instanceof Error ? err.message : 'Failed to save work location');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const activeCount = locations.filter(loc => loc.status === 'Active').length;

  if (isLoading) {
    return (
      <SettingsLayout
        title="Work Locations"
        description="Manage company work locations"
      >
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </SettingsLayout>
    );
  }

  if (error) {
    return (
      <SettingsLayout
        title="Work Locations"
        description="Manage company work locations"
      >
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchLocations}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout
      title="Work Locations"
      description="Manage company work locations"
    >
      <div className="p-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">All Work Locations</h1>
              <p className="text-gray-600 mt-1 text-sm">Manage your company's work locations and addresses</p>
            </div>
            <button
              onClick={() => {
                setSelectedLocation(undefined);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-sm hover:shadow-md transform hover:scale-105 text-sm"
            >
              <MdAdd className="w-4 h-4 mr-2" />
              Add Location
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Locations</p>
                  <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
                </div>
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg">
                  <MdLocationOn className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-orange-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Active Locations</p>
                  <p className="text-2xl font-bold text-gray-800">{activeCount}</p>
                </div>
                <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg">
                  <MdLocationOn className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">States Covered</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {new Set(locations.map(loc => loc.state)).size}
                  </p>
                </div>
                <div className="p-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg">
                  <MdLocationOn className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Locations List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-100">
            <div className="p-4 border-b border-yellow-100">
              <h2 className="text-lg font-semibold text-gray-800">All Locations</h2>
            </div>
            
            {locations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <MdLocationOn className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  No Locations Added
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
                  Start by adding your first work location. You can manage addresses and contact information.
                </p>
                <button
                  onClick={() => {
                    setSelectedLocation(undefined);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-sm hover:shadow-md transform hover:scale-105 text-sm"
                >
                  <MdAdd className="w-4 h-4 mr-2" />
                  Add First Location
                </button>
              </div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locations.map((location) => (
                    <div key={location.id} className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-yellow-100 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                          <MdLocationOn className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setSelectedLocation(location);
                              setIsModalOpen(true);
                            }}
                            className="p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                          >
                            <MdEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(location.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <MdDelete className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-800 mb-2 text-sm">{location.name}</h3>
                      
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>{location.address}</p>
                        {location.address2 && <p>{location.address2}</p>}
                        <p>{location.city}, {location.state} {location.pincode}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Work Location Modal */}
        <WorkLocationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveLocation}
          location={selectedLocation}
        />
      </div>
    </SettingsLayout>
  );
} 