'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  MdPerson
} from 'react-icons/md';
import EmployeeSearch from './EmployeeSearch';

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
      // { name: 'Users & Roles', href: '/settings/users-roles' },
      { name: 'Email Templates', href: '/settings/email-templates' }
    ]
  },
];

const settingsSubmenu = navigation.find(item => item.name === 'Settings')?.submenu;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const PayrollLogo = () => (
  <svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" className="h-14 w-auto mr-2">
    {/* Background circle */}
    <circle cx="60" cy="60" r="45" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2"/>
    {/* Dollar sign */}
    <text x="60" y="75" fontFamily="Arial, sans-serif" fontSize="36" fontWeight="bold" fill="#1f2937" textAnchor="middle">$</text>
    {/* Document/payslip representation */}
    <rect x="25" y="35" width="70" height="50" fill="none" stroke="#1f2937" strokeWidth="2" rx="3"/>
    <line x1="35" y1="45" x2="85" y2="45" stroke="#1f2937" strokeWidth="1.5"/>
    <line x1="35" y1="52" x2="75" y2="52" stroke="#1f2937" strokeWidth="1"/>
    <line x1="35" y1="59" x2="80" y2="59" stroke="#1f2937" strokeWidth="1"/>
    <line x1="35" y1="66" x2="70" y2="66" stroke="#1f2937" strokeWidth="1"/>
    <line x1="35" y1="73" x2="85" y2="73" stroke="#1f2937" strokeWidth="1.5"/>
    {/* Company name */}
    <text x="130" y="45" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#f59e0b">PAYROLL</text>
    <text x="130" y="70" fontFamily="Arial, sans-serif" fontSize="14" fill="#64748b">SOLUTIONS</text>
    {/* Decorative elements */}
    <circle cx="270" cy="30" r="3" fill="#10b981"/>
    <circle cx="280" cy="40" r="2" fill="#f59e0b"/>
    <circle cx="260" cy="50" r="2.5" fill="#ef4444"/>
  </svg>
);

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);

  const settingsItemRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const [flyoutPosition, setFlyoutPosition] = useState<{ top: number } | null>(null);

  useEffect(() => {
    setMounted(true);

    function handleClickOutside(event: MouseEvent) {
      if (
        flyoutRef.current && !flyoutRef.current.contains(event.target as Node) &&
        settingsItemRef.current && !settingsItemRef.current.contains(event.target as Node)
      ) {
        setExpandedSubmenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setExpandedSubmenu(null);
  }, [pathname]);

  const handleSubmenuToggle = (name: string) => {
    if (name === 'Settings' && settingsItemRef.current) {
      if (expandedSubmenu !== 'Settings') {
        const rect = settingsItemRef.current.getBoundingClientRect();
        setFlyoutPosition({ top: rect.top });
      }
    }
    setExpandedSubmenu(expandedSubmenu === name ? null : name);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (!session || !mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div 
        className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out z-40 border-r border-gray-100 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="h-16 flex items-center justify-center px-4 border-b border-gray-100">
          {!isCollapsed && (
            <Link href="/dashboard" className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <PayrollLogo />
            </Link>
          )}
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const hasSubmenu = 'submenu' in item;
            const isSettingsOpen = expandedSubmenu === 'Settings';
            
            return (
              <div key={item.name} ref={item.name === 'Settings' ? settingsItemRef : null}>
                <div
                  className={`relative flex items-center justify-between px-3 py-3 rounded-xl text-sm group cursor-pointer transition-all duration-200 ${
                    (isActive || (item.name === 'Settings' && isSettingsOpen))
                      ? 'bg-yellow-100 text-yellow-900 font-semibold'
                      : 'text-gray-500 hover:bg-yellow-50 hover:text-gray-800'
                  }`}
                  onClick={() => hasSubmenu ? handleSubmenuToggle(item.name) : (item.href && router.push(item.href))}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
                    <item.icon className={`w-6 h-6 transition-all duration-200 ${isCollapsed ? '' : 'mr-3'} ${isActive || (item.name ==='Settings' && isSettingsOpen) ? 'text-yellow-700' : 'text-gray-400 group-hover:text-yellow-600'}`} />
                    {!isCollapsed && <span className="font-medium">{item.name}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
        
        <div className="absolute bottom-16 w-full px-4">
          <Link
            href="/my-portal"
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} w-full px-3 py-3 text-sm text-gray-500 hover:bg-yellow-50 hover:text-gray-800 rounded-xl group transition-all duration-200`}
          >
            <MdPerson className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'} text-gray-400 group-hover:text-yellow-600 transition-transform`} />
            {!isCollapsed && <span className="font-medium">My Portal</span>}
          </Link>
        </div>

        <div className="absolute bottom-4 w-full px-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="relative flex items-center justify-center w-full px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-xl group transition-all duration-200"
          >
            {isCollapsed ? <MdChevronRight className="w-6 h-6" /> : <MdChevronLeft className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {settingsSubmenu && (
        <div
          ref={flyoutRef}
          style={{
            top: flyoutPosition?.top ?? 0,
            left: isCollapsed ? '5rem' : '16rem',
            visibility: expandedSubmenu === 'Settings' && flyoutPosition ? 'visible' : 'hidden',
          }}
          className={`fixed z-50 w-64 transition-all duration-200 ease-in-out ${expandedSubmenu === 'Settings' && flyoutPosition ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-2">
            <div className="p-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings Menu</p>
            </div>
            <div className="mt-1 space-y-1">
              {settingsSubmenu.map((subItem) => {
                const isSubActive = pathname === subItem.href;
                return (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    className={`flex items-center w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                      isSubActive ? 'bg-yellow-100 text-yellow-900 font-semibold' : 'text-gray-600 hover:bg-yellow-50 hover:text-gray-800'
                    }`}
                  >
                    {subItem.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 h-16">
            <div className="flex-1"><EmployeeSearch /></div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><MdNotifications className="h-5 w-5" /></button>
              <button onClick={handleLogout} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-sm text-gray-700 font-medium">Logout</span>
              </button>
            </div>
          </div>
        </header>
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}