'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MdBusiness,
  MdLocationOn,
  MdGroups,
  MdWork,
  MdAttachMoney,
  MdDescription,
  MdCalendarMonth,
  MdAdminPanelSettings,
  MdEmail
} from 'react-icons/md';
import SettingsLayout from '@/components/SettingsLayout';

const settingsItems = [
  { href: '/settings/organisation', icon: MdBusiness, title: 'Organization Profile', description: 'Company details and basic info' },
  { href: '/settings/locations', icon: MdLocationOn, title: 'Work Locations', description: 'Manage office locations' },
  { href: '/settings/departments', icon: MdGroups, title: 'Departments', description: 'Create and manage departments' },
  { href: '/settings/designations', icon: MdWork, title: 'Designations', description: 'Define job titles and positions' },
  { href: '/settings/salary-components', icon: MdAttachMoney, title: 'Salary Components', description: 'Configure earnings and deductions' },
  { href: '/settings/salary-templates', icon: MdDescription, title: 'Salary Templates', description: 'Create reusable salary structures' },
  { href: '/settings/leave-attendance', icon: MdCalendarMonth, title: 'Leave & Attendance', description: 'Set up leave types and attendance' },
  { href: '/settings/users-roles', icon: MdAdminPanelSettings, title: 'Users & Roles', description: 'Manage user access and permissions' },
  { href: '/settings/email-templates', icon: MdEmail, title: 'Email Templates', description: 'Customize email templates' },
];

export default function SettingsPage() {
  const pathname = usePathname();

  return (
    <SettingsLayout
      title="Settings"
      description="Manage all your organizational settings from one place."
    >
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link href={item.href} key={item.href} className="block h-full">
                <div
                  className={`group p-5 rounded-xl transition-all duration-300 flex items-center space-x-4 h-full ${
                    isActive
                      ? 'bg-yellow-100/70 border border-yellow-300'
                      : 'bg-white hover:bg-white border border-gray-200 hover:border-yellow-300 hover:shadow-md'
                  }`}
                >
                  <div className={`p-3 rounded-lg transition-colors duration-300 ${isActive ? 'bg-yellow-400' : 'bg-gray-100 group-hover:bg-yellow-100'}`}>
                    <Icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-yellow-700'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isActive ? 'text-yellow-900' : 'text-gray-800'}`}>
                      {item.title}
                    </h3>
                    <p className="text-sm truncate text-gray-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </SettingsLayout>
  );
} 