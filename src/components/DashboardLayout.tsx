'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  MdDashboard,
  MdPeople,
  MdPayments,
  MdDescription,
  MdSettings,
  MdLogout,
  MdMenu,
  MdClose,
  MdSearch,
  MdNotifications,
  MdKeyboardArrowDown,
  MdChevronLeft,
  MdChevronRight,
  MdEmail,
  MdPerson // Add this for portal access
} from 'react-icons/md';
import EmployeeSearch from './EmployeeSearch';

// Update navigation array to include email templates in settings
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: MdDashboard },
  { name: 'Employees', href: '/employee', icon: MdPeople },
  { name: 'Payroll', href: '/payroll', icon: MdPayments },
  { name: 'Documents', href: '/documents', icon: MdDescription },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: MdSettings,
    submenu: [
      { name: 'Organisation Profile', href: '/settings/organisation' },
      { name: 'Work Locations', href: '/settings/locations' },
      { name: 'Departments', href: '/settings/departments' },
      { name: 'Designations', href: '/settings/designations' },
      { name: 'Salary Components', href: '/settings/salary-components' },
      { name: 'Salary Templates', href: '/settings/salary-templates' },
      { name: 'Leave & Attendance', href: '/settings/leave-attendance' },
      { name: 'Users & Roles', href: '/settings/users-roles' },
      { name: 'Email Templates', href: '/settings/email-templates', icon: MdEmail }
    ]
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);

  // Only show the UI after mounting to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSubmenu = (name: string) => {
    setExpandedSubmenu(expandedSubmenu === name ? null : name);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  if (!session || !mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full bg-white border-r transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        } overflow-y-auto`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {!isCollapsed && (
            <Link href="/dashboard" className="text-xl font-semibold text-gray-900">
              Payroll
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const hasSubmenu = 'submenu' in item;
            const isExpanded = expandedSubmenu === item.name;

            return (
              <div key={item.name}>
                <div
                  className={`relative flex items-center justify-${isCollapsed ? 'center' : 'between'} px-2 py-2 rounded-lg text-sm group cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => hasSubmenu ? toggleSubmenu(item.name) : null}
                >
                  <div className="flex items-center">
                    <item.icon className={`${isCollapsed ? 'w-12 h-12' : 'w-6 h-6 mr-3'} transition-transform group-hover:scale-105`} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                  
                  {!isCollapsed && hasSubmenu && (
                    <MdChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  )}
                </div>

                {/* Submenu */}
                {hasSubmenu && !isCollapsed && isExpanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.submenu?.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`flex items-center px-2 py-1.5 text-sm rounded-lg ${
                            isSubActive
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-2"></span>
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Portal Access Button */}
        <div className="absolute bottom-16 w-full px-4">
          <Link
            href="/my-portal"
            className={`flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-start'
            } w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg group`}
          >
            <MdPerson className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}`} />
            {!isCollapsed && <span>Access My Portal</span>}
          </Link>
        </div>

        {/* Toggle Button at Bottom */}
        <div className="absolute bottom-4 w-full px-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="relative flex items-center justify-center w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg group"
          >
            {isCollapsed ? (
              <>
                <MdChevronRight className="w-6 h-6" />
              </>
            ) : (
              <>
                <MdChevronLeft className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <header className="bg-white border-b">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center flex-1">
              <div className="ml-4 lg:ml-0">
                <EmployeeSearch />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-1.5 text-black hover:bg-gray-50 rounded-full">
                <MdNotifications className="h-5 w-5" />
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {session?.user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-sm text-gray-700">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}