// lib/api.ts - API client that only uses real data from backend

export interface Employee {
  id?: number; // backend uses employee_id as PK; keep optional id for compatibility
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  work_email: string;
  personal_email?: string | null;
  mobile_number?: string | null;
  phone_number?: string | null;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'O';
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  department?: number;
  designation: string;
  work_location?: string | null;
  employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  date_of_joining: string;
  date_of_leaving?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
  status_display?: string;
  manager?: number;
  basic_salary: string;
  annual_ctc: string;
  monthly_ctc?: number;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  pan_number?: string;
  aadhar_number?: string;
  created_at?: string;
  updated_at?: string;
  department_name?: string;
  designation_name?: string;
  work_location_name?: string;
  employment_type_display?: string;
  gender_display?: string;
}

interface APIResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
}

interface DashboardStats {
  totalEmployees: number;
  totalPayroll: number;
  pendingRequests: number;
  attendanceRate: number;
  leaveRequests: number;
}

// Helper function to safely extract error messages
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
};

// Get token function - implement based on your auth system
const getToken = (): string | null => {
  // For NextAuth.js with JWT
  if (typeof window !== 'undefined') {
    // Try to get token from localStorage, sessionStorage, or cookies
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || null;
  }
  return null;
};

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/+$/, '');

// Build robust candidates from configured base (with and without /api) and known fallbacks
const configuredBase = API_BASE_URL;
const configuredWithApi = configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`;
const POSSIBLE_BASE_URLS = Array.from(new Set([
  configuredBase,
  configuredWithApi,
  'http://127.0.0.1:8000/api',
  'http://localhost:8000/api',
]));

class APIClient {
  private baseURL: string;
  private workingBaseURL: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    console.log(`🌐 API Client initialized with base URL: ${this.baseURL}`);
  }

  // Find working base URL and endpoint
  private async findWorkingEndpoint(): Promise<string> {
    if (this.workingBaseURL) {
      return this.workingBaseURL;
    }

    console.log('🔍 Testing different API configurations...');

    for (const baseUrl of POSSIBLE_BASE_URLS) {
      // Only test the employees endpoint under the configured API base
      const endpointPatterns = [`${baseUrl}/employees/`];

      for (const endpoint of endpointPatterns) {
        try {
          console.log(`🧪 Testing: ${endpoint}`);
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
          });

          console.log(`📡 Response from ${endpoint}: ${response.status} ${response.statusText}`);

          if (response.ok) {
            // Extract base URL from working endpoint
            this.workingBaseURL = endpoint.replace('/employees/', '');
            console.log(`✅ Found working API base: ${this.workingBaseURL}`);
            return this.workingBaseURL;
          } else if (response.status < 500) {
            // 4xx errors might still indicate the right endpoint (just no data or auth issues)
            const text = await response.text();
            if (!text.includes('<!DOCTYPE') && !text.includes('<html')) {
              this.workingBaseURL = endpoint.replace('/employees/', '');
              console.log(`✅ Found working API base (with auth/permission issue): ${this.workingBaseURL}`);
              return this.workingBaseURL;
            }
          }
        } catch (error) {
          console.log(`❌ Failed ${endpoint}:`, error instanceof Error ? error.message : error);
        }
      }
    }

    throw new Error(`No working API endpoint found. Tested candidates: ${POSSIBLE_BASE_URLS.map(u => u + '/employees/').join(', ')}`);
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    let baseUrl: string;
    
    try {
      baseUrl = await this.findWorkingEndpoint();
    } catch (error) {
      console.warn('⚠️ Could not find working endpoint, using default:', this.baseURL);
      baseUrl = this.baseURL;
    }
    
    const url = `${baseUrl}${endpoint}`;
    const token = getToken();
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add authentication header if token exists
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    };

    console.log(`🔄 API Request: ${config.method || 'GET'} ${url}`);
    if (config.body) {
      console.log('📤 Request Body:', config.body);
    }

    try {
      const response = await fetch(url, config);
      
      console.log(`📡 API Response Status: ${response.status} ${response.statusText}`);
      
      const responseText = await response.text();
      console.log(`📥 Raw Response Text (${responseText.length} chars):`, responseText.substring(0, 200));

      if (!response.ok) {
        if (responseText.trim().startsWith('<!DOCTYPE')) {
          throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}. Please check if the Django server is running and the endpoint exists.`);
        }

        try {
          const errorData = JSON.parse(responseText);
          throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
        } catch {
          throw new Error(`HTTP ${response.status}: ${responseText}`);
        }
      }

      if (!responseText) {
        throw new Error('Empty response from server');
      }

      try {
        const data = JSON.parse(responseText);
        console.log('✅ Parsed Response Data:', data);
        return data;
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }
    } catch (error) {
      console.error('💥 API Request Failed:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(`Unable to connect to the server at ${url}. Please ensure:\n1. Django server is running on ${this.baseURL.replace('/api', '')}\n2. CORS is properly configured\n3. The endpoint exists`);
      }
      
      throw error;
    }
  }

  // Test connection method with better diagnostics
  async testConnection(): Promise<boolean> {
    console.log('🧪 Running comprehensive API connection test...');
    
    try {
      const workingBase = await this.findWorkingEndpoint();
      console.log(`✅ Successfully found working API at: ${workingBase}`);
      
      // Try to fetch actual data
      const testResponse = await this.makeRequest<any>('/employees/');
      console.log('📊 Sample response:', testResponse);
      
      return true;
    } catch (error) {
      console.error('🧪 Connection test failed:', error);
      console.error('💡 Troubleshooting steps:');
      console.error('   1. Check if Django server is running: python manage.py runserver');
      console.error('   2. Verify the employees endpoint exists in your Django URLs');
      console.error('   3. Check CORS settings in Django');
      console.error('   4. Verify the API returns JSON, not HTML');
      return false;
    }
  }

  // Add a method to list available endpoints
  async discoverEndpoints(): Promise<string[]> {
    console.log('🔍 Discovering available API endpoints...');
    const discoveredEndpoints: string[] = [];

    for (const baseUrl of POSSIBLE_BASE_URLS) {
      try {
        // Try root endpoint first
        const rootResponse = await fetch(baseUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        if (rootResponse.ok) {
          const data = await rootResponse.text();
          console.log(`📋 Root endpoint ${baseUrl} response:`, data.substring(0, 200));
          discoveredEndpoints.push(baseUrl);
        }
      } catch (error) {
        // Silent fail for discovery
      }

      // Try common endpoints
      const commonEndpoints = ['/employees/', '/employee/', '/api/', '/admin/'];
      for (const endpoint of commonEndpoints) {
        try {
          const testUrl = `${baseUrl}${endpoint}`;
          const response = await fetch(testUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
          });

          if (response.status < 500) {
            discoveredEndpoints.push(testUrl);
            console.log(`📍 Found endpoint: ${testUrl} (${response.status})`);
          }
        } catch (error) {
          // Silent fail for discovery
        }
      }
    }

    return [...new Set(discoveredEndpoints)]; // Remove duplicates
  }

  // Employee API methods - NO MOCK DATA
  async getAll(): Promise<Employee[]> {
    console.log('🔍 Fetching all employees from API...');
    
    try {
      const response = await this.makeRequest<APIResponse<Employee> | Employee[]>('/employees/');
      
      // Handle both paginated and direct array responses
      if (Array.isArray(response)) {
        console.log(`✅ Retrieved ${response.length} employees (direct array)`);
        return response;
      } else if (response.results && Array.isArray(response.results)) {
        console.log(`✅ Retrieved ${response.results.length} employees (paginated)`);
        return response.results;
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        throw new Error('Unexpected response format from employees endpoint');
      }
    } catch (error) {
      console.error('❌ Failed to fetch employees from API:', error);
      throw new Error(`Failed to fetch employees: ${getErrorMessage(error)}`);
    }
  }

  async getById(employeeId: string): Promise<Employee> {
    console.log(`🔍 Fetching employee ${employeeId} from API...`);
    
    try {
      const employee = await this.makeRequest<Employee>(`/employees/${employeeId}/`);
      console.log(`✅ Retrieved employee ${employeeId}`);
      return employee;
    } catch (error) {
      console.error(`❌ Failed to fetch employee ${employeeId}:`, error);
      throw new Error(`Failed to fetch employee ${employeeId}: ${getErrorMessage(error)}`);
    }
  }

  async create(employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<Employee> {
    console.log('➕ Creating new employee...');
    
    try {
      const newEmployee = await this.makeRequest<Employee>('/employees/', {
        method: 'POST',
        body: JSON.stringify(employeeData),
      });
      console.log('✅ Employee created successfully');
      return newEmployee;
    } catch (error) {
      console.error('❌ Failed to create employee:', error);
      throw new Error(`Failed to create employee: ${getErrorMessage(error)}`);
    }
  }

  async update(employeeId: string, employeeData: Partial<Employee>): Promise<Employee> {
    console.log(`✏️ Updating employee ${employeeId}...`);
    
    try {
      const updatedEmployee = await this.makeRequest<Employee>(`/employees/${employeeId}/`, {
        method: 'PATCH',
        body: JSON.stringify(employeeData),
      });
      console.log(`✅ Employee ${employeeId} updated successfully`);
      return updatedEmployee;
    } catch (error) {
      console.error(`❌ Failed to update employee ${employeeId}:`, error);
      throw new Error(`Failed to update employee ${employeeId}: ${getErrorMessage(error)}`);
    }
  }

  async delete(employeeId: string): Promise<void> {
    console.log(`🗑️ Deleting employee ${employeeId}...`);
    
    try {
      await this.makeRequest<void>(`/employees/${employeeId}/`, {
        method: 'DELETE',
      });
      console.log(`✅ Employee ${employeeId} deleted successfully`);
    } catch (error) {
      console.error(`❌ Failed to delete employee ${employeeId}:`, error);
      throw new Error(`Failed to delete employee ${employeeId}: ${getErrorMessage(error)}`);
    }
  }

  // Dashboard Stats - Calculate from real employee data
  async getStats(): Promise<DashboardStats> {
    console.log('📊 Calculating dashboard stats from real employee data...');
    
    try {
      const employees = await this.getAll();
      const activeEmployees = employees.filter(emp => 
        emp.status === 'ACTIVE' || emp.status_display === 'Active'
      );
      
      const totalPayroll = activeEmployees.reduce((sum, emp) => {
        const monthlyCtc = emp.monthly_ctc || (parseFloat(emp.annual_ctc) / 12) || 0;
        return sum + monthlyCtc;
      }, 0);

      console.log(`✅ Calculated stats from ${employees.length} employees (${activeEmployees.length} active)`);
      
      return {
        totalEmployees: activeEmployees.length,
        totalPayroll: Math.round(totalPayroll),
        pendingRequests: 0, // You can implement this endpoint later
        attendanceRate: 0, // You can implement this endpoint later
        leaveRequests: 0, // You can implement this endpoint later
      };
    } catch (error) {
      console.error('❌ Failed to calculate dashboard stats:', error);
      throw new Error(`Failed to get dashboard statistics: ${getErrorMessage(error)}`);
    }
  }

  // Try to get dashboard stats from dedicated endpoint (if it exists)
  async getDashboardStats(): Promise<DashboardStats> {
    console.log('📊 Fetching dashboard stats from dedicated endpoint...');
    
    try {
      return await this.makeRequest<DashboardStats>('/dashboard/stats/');
    } catch (error) {
      console.warn('⚠️ Dedicated dashboard endpoint not available, calculating from employee data');
      return this.getStats();
    }
  }

  // Health check methods
  async ping(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest<{ status: string; timestamp: string }>('/health/');
  }

  async getServerInfo(): Promise<any> {
    return this.makeRequest<any>('/health/');
  }
}

// Standalone employeeAPI object for backward compatibility
export const employeeAPI = {
  async getStats(): Promise<DashboardStats> {
    const client = new APIClient();
    return client.getStats();
  },

  async testConnection(): Promise<boolean> {
    const client = new APIClient();
    return client.testConnection();
  },

  async getAll(): Promise<Employee[]> {
    const client = new APIClient();
    return client.getAll();
  },

  async getById(id: string): Promise<Employee> {
    const client = new APIClient();
    return client.getById(id);
  },

  async create(employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<Employee> {
    const client = new APIClient();
    return client.create(employeeData);
  },

  async update(id: string, employeeData: Partial<Employee>): Promise<Employee> {
    const client = new APIClient();
    return client.update(id, employeeData);
  },

  async delete(id: string): Promise<void> {
    const client = new APIClient();
    return client.delete(id);
  }
};

// Create and export the single API client instance
const apiClient = new APIClient();

// Export diagnostic functions for troubleshooting
export const diagnostics = {
  async runFullDiagnostic(): Promise<void> {
    console.log('🔧 Running full API diagnostic...');
    
    console.log('\n1. Testing connection...');
    const connected = await apiClient.testConnection();
    
    console.log('\n2. Discovering endpoints...');
    const endpoints = await apiClient.discoverEndpoints();
    console.log('📍 Discovered endpoints:', endpoints);
    
    console.log('\n3. Testing Django server status...');
    for (const baseUrl of ['http://127.0.0.1:8000', 'http://localhost:8000']) {
      try {
        const response = await fetch(baseUrl);
        console.log(`${baseUrl}: ${response.status} ${response.statusText}`);
        if (response.ok) {
          const text = await response.text();
          console.log(`Content preview: ${text.substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`${baseUrl}: Connection failed -`, error);
      }
    }

    console.log('\n📋 Diagnostic Summary:');
    console.log(`- API Connection: ${connected ? '✅ Working' : '❌ Failed'}`);
    console.log(`- Endpoints found: ${endpoints.length}`);
    console.log('\n💡 If issues persist:');
    console.log('   1. Ensure Django server is running: python manage.py runserver');
    console.log('   2. Check your Django urls.py has the employees endpoint');
    console.log('   3. Verify CORS settings allow your frontend domain');
    console.log('   4. Check if authentication is required');
  },

  async testSpecificUrl(url: string): Promise<void> {
    console.log(`🧪 Testing specific URL: ${url}`);
    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      console.log(`Status: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.log(`Response preview: ${text.substring(0, 200)}`);
      
      if (text.startsWith('{') || text.startsWith('[')) {
        try {
          const json = JSON.parse(text);
          console.log('✅ Valid JSON response:', json);
        } catch {
          console.log('⚠️ Response looks like JSON but failed to parse');
        }
      } else {
        console.log('⚠️ Response is not JSON (likely HTML error page)');
      }
    } catch (error) {
      console.error('❌ Request failed:', error);
    }
  }
};

export default apiClient;

// Export the class for flexibility
export { APIClient };