'use client';

import { useSession } from 'next-auth/react';
import { redirect, useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  MdPeople,
  MdTrendingUp,
  MdAdd,
} from 'react-icons/md';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import {
  Users,
} from 'lucide-react';
import Notification from "@/components/Notification";
import Link from 'next/link';
import apiClient, { employeeAPI } from '@/lib/api'; // Import both the class instance and standalone object

interface DashboardStats {
  totalEmployees: number;
  totalPayroll: number;
  pendingRequests: number;
  attendanceRate: number;
  leaveRequests: number;
}

function Dashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalPayroll: 0,
    pendingRequests: 0,
    attendanceRate: 0,
    leaveRequests: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  const searchParams = useSearchParams();
  const router = useRouter();
  const msg = searchParams.get("msg");

  useEffect(() => {
    if (msg === "loggedin") {
      setShowNotif(true);
      setSuccessMsg("Successfully logged in!");
      setTimeout(() => {
        setShowNotif(false);
        router.replace("/dashboard", { scroll: false });
      }, 1500);
    }
  }, [msg, router]);

  // Test API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      setConnectionStatus('checking');
      try {
        const isConnected = await apiClient.testConnection();
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
        
        if (!isConnected) {
          setError("Unable to connect to the server. Please check if your Django backend is running.");
          setShowNotif(true);
        }
      } catch (error) {
        console.error("Connection test failed:", error);
        setConnectionStatus('disconnected');
        setError("Connection test failed. Please check your network connection.");
        setShowNotif(true);
      }
    };

    testConnection();
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!session?.user || connectionStatus !== 'connected') {
        console.log("No session or not connected, skipping data load");
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        console.log("🚀 Attempting to fetch dashboard stats...");
        
        // Try multiple methods to get stats
        let statsData: DashboardStats;
        
        try {
          // Method 1: Use the standalone employeeAPI object
          console.log("📊 Trying standalone employeeAPI...");
          statsData = await employeeAPI.getStats();
        } catch (standaloneError) {
          console.warn("⚠️ Standalone API failed, trying class instance:", standaloneError);
          
          try {
            // Method 2: Use the class instance
            console.log("📊 Trying class instance API...");
            statsData = await apiClient.getStats();
          } catch (classError) {
            console.warn("⚠️ Class instance failed, trying dashboard endpoint:", classError);
            
            // Method 3: Try dashboard endpoint directly
            console.log("📊 Trying dashboard endpoint directly...");
            statsData = await apiClient.getDashboardStats();
          }
        }
        
        console.log("✅ Stats data received:", statsData);
        
        // Validate the response structure
        if (!statsData || typeof statsData !== 'object') {
          throw new Error('Invalid response format from API');
        }

        setStats({
          totalEmployees: Number(statsData.totalEmployees) || 0,
          totalPayroll: Number(statsData.totalPayroll) || 0,
          pendingRequests: Number(statsData.pendingRequests) || 0,
          attendanceRate: Number(statsData.attendanceRate) || 0,
          leaveRequests: Number(statsData.leaveRequests) || 0,
        });

        console.log("✅ Dashboard stats updated successfully");

      } catch (error) {
        console.error("💥 Failed to load dashboard data:", error);
        
        let errorMessage = "Failed to load dashboard data.";
        
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = "Request timed out. Please check your internet connection.";
          } else if (error.message.includes('fetch') || error.message.includes('connect')) {
            errorMessage = "Unable to connect to the server. Please check if your Django backend is running on the correct port.";
          } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
            errorMessage = "Authentication failed. Please log in again.";
          } else if (error.message.includes('500')) {
            errorMessage = "Server error. Please try again later.";
          } else if (error.message.includes('404')) {
            errorMessage = "Dashboard stats endpoint not found. Please check your Django URL configuration.";
          } else {
            errorMessage = `Error: ${error.message}`;
          }
        }
        
        setError(errorMessage);
        setSuccessMsg(errorMessage);
        setShowNotif(true);
        setTimeout(() => setShowNotif(false), 5000);
        
        // Keep stats at 0 if API fails
        setStats({
          totalEmployees: 0,
          totalPayroll: 0,
          pendingRequests: 0,
          attendanceRate: 0,
          leaveRequests: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Only load data when session is available and connection is established
    if (status === 'authenticated' && session && connectionStatus === 'connected') {
      loadDashboardData();
    } else if (status === 'authenticated' && connectionStatus === 'disconnected') {
      setIsLoading(false);
    }
  }, [session, status, connectionStatus]);

  type StatCardProps = {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    trend?: string;
  };

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => (
    <div className={`rounded-xl shadow-md p-6 flex items-center gap-4 ${color} text-white`}>
      <div className="bg-white/30 rounded-full p-3">
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <div className="text-xs font-medium">{title}</div>
        <div className="text-2xl font-bold">
          {isLoading ? (
            <div className="animate-pulse bg-white/30 rounded h-6 w-16"></div>
          ) : (
            value
          )}
        </div>
        {trend && <div className="text-xs mt-1">{trend}</div>}
      </div>
    </div>
  );

  const QuickActionCard = ({
    title,
    description,
    icon: Icon,
    color,
    onClick
  }: {
    title: string;
    description: string;
    icon: any;
    color: string;
    onClick: () => void;
  }) => (
    <Card
      className="cursor-pointer hover:shadow-md transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm border border-yellow-100 group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 group-hover:text-yellow-600 transition-colors text-sm">
              {title}
            </h3>
            <p className="text-xs text-gray-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Add a retry function
  const retryFetch = async () => {
    if (session) {
      setError(null);
      setIsLoading(true);
      
      try {
        const statsData = await apiClient.getStats();
        setStats({
          totalEmployees: Number(statsData.totalEmployees) || 0,
          totalPayroll: Number(statsData.totalPayroll) || 0,
          pendingRequests: Number(statsData.pendingRequests) || 0,
          attendanceRate: Number(statsData.attendanceRate) || 0,
          leaveRequests: Number(statsData.leaveRequests) || 0,
        });
        setSuccessMsg("Data loaded successfully!");
        setShowNotif(true);
        setTimeout(() => setShowNotif(false), 2000);
      } catch (error) {
        console.error("Retry failed:", error);
        setError("Retry failed. Please check your connection and server status.");
        setSuccessMsg("Retry failed. Please check your connection.");
        setShowNotif(true);
        setTimeout(() => setShowNotif(false), 3000);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 min-h-screen p-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl shadow p-6 flex items-center justify-between border border-yellow-200 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-gray-600">Here's what's happening with your organization today.</p>
            
            {/* Connection Status Indicator */}
            <div className="flex items-center mt-2">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'disconnected' ? 'bg-red-500' : 
                'bg-yellow-500 animate-pulse'
              }`}></div>
              <span className="text-xs text-gray-600">
                {connectionStatus === 'connected' ? 'Connected to server' : 
                 connectionStatus === 'disconnected' ? 'Server disconnected' : 
                 'Checking connection...'}
              </span>
            </div>
          </div>
          <div className="hidden md:block">
            <MdPeople className="w-16 h-16 text-yellow-400" />
          </div>
        </div>

        {/* Connection Error */}
        {connectionStatus === 'disconnected' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-red-800 font-medium">Server Connection Failed</p>
              <p className="text-red-600 text-sm">
                Unable to connect to the Django backend. Please ensure:
              </p>
              <ul className="text-red-600 text-sm mt-1 ml-4">
                <li>• Django server is running on the correct port</li>
                <li>• CORS is properly configured</li>
                <li>• API URL is correct: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Data Fetch Error */}
        {error && !isLoading && connectionStatus === 'connected' && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-orange-800 font-medium">Unable to load dashboard data</p>
              <p className="text-orange-600 text-sm">{error}</p>
            </div>
            <button
              onClick={retryFetch}
              className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && connectionStatus === 'connected' && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            <span className="ml-2 text-gray-600">Loading dashboard data...</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={Users}
            color="bg-gradient-to-r from-yellow-400 to-orange-400"
            trend="+12% this month"
          />
          <StatCard
            title="Total Payroll"
            value={`₹${stats.totalPayroll.toLocaleString()}`}
            icon={() => <span className="w-7 h-7 text-green-700 text-2xl font-bold">₹</span>}
            color="bg-gradient-to-r from-green-400 to-lime-400"
            trend="+8% this month"
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingRequests}
            icon={MdTrendingUp}
            color="bg-gradient-to-r from-blue-400 to-cyan-400"
            trend="This week"
          />
          <StatCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            icon={() => <span className="w-7 h-7 text-purple-700 text-2xl font-bold">%</span>}
            color="bg-gradient-to-r from-purple-400 to-pink-400"
            trend="This week"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <QuickActionCard
              title="Add Employee"
              description="Register a new team member"
              icon={MdAdd}
              color="bg-gradient-to-r from-yellow-400 to-orange-400"
              onClick={() => window.location.href = '/employee/add'}
            />
            <Link href="/payroll">
              <QuickActionCard
                title="Process Payroll"
                description="Generate monthly payroll"
                icon={() => <span className="w-5 h-5 text-green-700 text-xl font-bold">₹</span>}
                color="bg-gradient-to-r from-green-400 to-lime-400"
                onClick={() => {}}
              />
            </Link>
            <QuickActionCard
              title="View Reports"
              description="Access detailed analytics"
              icon={MdTrendingUp}
              color="bg-gradient-to-r from-blue-400 to-cyan-400"
              onClick={() => window.location.href = '/reports'}
            />
            <QuickActionCard
              title="Manage Attendance"
              description="View attendance records"
              icon={() => <span className="w-5 h-5 text-purple-700 text-xl font-bold">👥</span>}
              color="bg-gradient-to-r from-purple-400 to-pink-400"
              onClick={() => window.location.href = '/attendance'}
            />
          </div>
        </div>

        <Notification message={successMsg} show={showNotif} />
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;