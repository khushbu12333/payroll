'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  MdArrowBack, 
  MdSettings,
  MdBusiness,
  MdLocationOn,
  MdPeople,
  MdWork,
  MdAttachMoney,
  MdReceipt,
  MdEventNote,
  MdGroup,
  MdEmail,
  MdDashboard,
  MdDescription
} from 'react-icons/md';
import DashboardLayout from './DashboardLayout';

interface SettingsLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  showBackButton?: boolean;
}

const settingsNavigation = [
  { 
    name: 'Organization Profile', 
    href: '/settings/organisation', 
    icon: MdBusiness,
    description: 'Company details and basic information'
  },
  { 
    name: 'Work Locations', 
    href: '/settings/locations', 
    icon: MdLocationOn,
    description: 'Manage office locations'
  },
  { 
    name: 'Departments', 
    href: '/settings/departments', 
    icon: MdPeople,
    description: 'Create and manage departments'
  },
  { 
    name: 'Designations', 
    href: '/settings/designations', 
    icon: MdWork,
    description: 'Define job titles and positions'
  },
  { 
    name: 'Salary Components', 
    href: '/settings/salary-components', 
    icon: MdAttachMoney,
    description: 'Configure earnings and deductions'
  },
  { 
    name: 'Salary Templates', 
    href: '/settings/salary-templates', 
    icon: MdReceipt,
    description: 'Create reusable salary structures'
  },
  { 
    name: 'Leave & Attendance', 
    href: '/settings/leave-attendance', 
    icon: MdEventNote,
    description: 'Set up leave types and attendance'
  },
  // { 
  //   name: 'Users & Roles', 
  //   href: '/settings/users-roles', 
  //   icon: MdGroup,
  //   description: 'Manage user access and permissions'
  // },
  { 
    name: 'Email Templates', 
    href: '/settings/email-templates', 
    icon: MdEmail,
    description: 'Customize email templates'
  }
];

// Add Documents to navigation if we're on a documents page
const additionalRoutes = [
  {
    name: 'Documents',
    href: '/documents',
    icon: MdDescription,
    description: 'Manage company documents'
  }
];

export default function SettingsLayout({ 
  children, 
  title, 
  description, 
  showBackButton = true 
}: SettingsLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  // Determine if we're on a documents page
  const isDocumentsPage = pathname && pathname.startsWith('/documents');
  
  // Combine navigation items
  const allNavigation = isDocumentsPage
    ? [...additionalRoutes, ...settingsNavigation]
    : settingsNavigation;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left Sidebar Navigation */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl border-r border-yellow-200 overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl">
                <MdSettings className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Settings</h2>
            </div>
            {showBackButton && (
              <button
                onClick={handleBackToDashboard}
                className="p-2 rounded-xl border border-yellow-200 hover:bg-white hover:shadow-md transition-all group"
                title="Back to Dashboard"
              >
                <MdArrowBack className="w-5 h-5 text-gray-600 group-hover:text-yellow-700" />
              </button>
            )}
          </div>
          
          {/* Quick Dashboard Link */}
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 px-3 py-2 text-sm text-yellow-700 hover:bg-yellow-200/50 rounded-lg transition-all"
          >
            <MdDashboard className="w-4 h-4" />
            <span>← Back to Dashboard</span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="p-4">
          <nav className="space-y-2">
            {allNavigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (typeof pathname === 'string' && pathname.startsWith(item.href + '/'));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-800'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-white/20' 
                      : 'bg-yellow-100 group-hover:bg-yellow-200'
                  }`}>
                    <item.icon className={`w-5 h-5 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-yellow-700 group-hover:text-yellow-800'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${isActive ? 'text-white' : ''}`}>
                      {item.name}
                    </p>
                    <p className={`text-xs truncate ${
                      isActive 
                        ? 'text-yellow-100' 
                        : 'text-gray-500 group-hover:text-yellow-700'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-yellow-200 rounded-lg">
                <MdSettings className="w-4 h-4 text-yellow-700" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Need Help?</h4>
                <p className="text-xs text-gray-600 mb-2">
                  Configure your organization settings step by step.
                </p>
                <button className="text-xs text-yellow-700 hover:text-yellow-800 font-medium">
                  View Setup Guide →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-80">
        <div className="min-h-screen">
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl">
                  <MdSettings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  {description && (
                    <p className="text-gray-600 mt-1">{description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-3">
              <Link href="/dashboard" className="hover:text-yellow-700 transition-colors">
                Dashboard
              </Link>
              <span>•</span>
              <Link href="/settings" className="hover:text-yellow-700 transition-colors">
                Settings
              </Link>
              <span>•</span>
              <span className="text-gray-900 font-medium">{title}</span>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-96">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 