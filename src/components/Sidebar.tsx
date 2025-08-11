'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home,
  Users,
  FileText,
  Settings,
  Building2,
  Calendar,
  UserCheck,
  ChevronDown,
  ChevronRight,
  User,
  Briefcase,
  MapPin,
  DollarSign,
  Mail,
  Clock,
  FolderOpen,
  Shield,
  BarChart3,
  Plus,
  Minus,
  LayoutDashboard,
  UserPlus,
  FileCheck,
  Cog,
  PieChart,
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({
    "Employee Management": true,
    "System Configuration": false,
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const isActive = (path: string) => pathname === path;

  const navigationGroups = [
    {
      title: "Main",
      items: [
        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { title: "My Portal", href: "/my-portal", icon: User },
      ]
    },
    {
      title: "Employee Management",
      items: [
        { title: "All Employees", href: "/employees", icon: Users },
        { title: "Add Employee", href: "/employee/add", icon: UserPlus },
        { title: "Documents", href: "/documents", icon: FileCheck },
      ]
    },
    {
      title: "Operations",
      items: [
        { title: "Attendance", href: "/attendance", icon: Clock },
        { title: "Leave Management", href: "/leave", icon: Calendar },
        { title: "Management", href: "/management", icon: Building2 },
      ]
    },
    {
      title: "System Configuration",
      items: [
        { title: "Organization", href: "/settings/organisation", icon: Building2 },
        { title: "Departments", href: "/settings/departments", icon: Briefcase },
        { title: "Designations", href: "/settings/designations", icon: Shield },
        { title: "Work Locations", href: "/settings/locations", icon: MapPin },
        { title: "Salary Components", href: "/settings/salary-components", icon: DollarSign },
        { title: "Salary Templates", href: "/settings/salary-templates", icon: BarChart3 },
        { title: "Users & Roles", href: "/settings/users-roles", icon: Users },
        { title: "Leave & Attendance", href: "/settings/leave-attendance", icon: Calendar },
        { title: "Email Templates", href: "/settings/email-templates", icon: Mail },
      ]
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-md z-50 border-r border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center">
            <PieChart className="w-5 h-5 text-yellow-700" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            Payroll
          </h1>
        </div>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-6 px-6">
          {navigationGroups.map((group, groupIndex) => {
            const isExpanded = expandedGroups[group.title];
            const hasActiveItem = group.items.some(item => isActive(item.href));

            return (
              <div key={group.title} className="space-y-3">
                {/* Group Header */}
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {group.title}
                  </h2>
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-gray-500" />
                    )}
                  </button>
                </div>

                {/* Group Items */}
                <div className={`space-y-2 transition-all duration-300 ${
                  isExpanded ? '' : 'hidden'
                }`}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                          active
                            ? "bg-yellow-100 text-yellow-900 font-semibold"
                            : "text-gray-500 hover:bg-yellow-50 hover:text-gray-900"
                        }`}
                      >
                        <div className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
                          active
                            ? "bg-yellow-400 text-white"
                            : "bg-gray-100 group-hover:bg-yellow-200 text-gray-400 group-hover:text-yellow-700"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        <span className={`ml-4 text-sm transition-all duration-200 ${
                          active ? "font-semibold" : "font-medium"
                        }`}>
                          {item.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                {/* Divider */}
                {groupIndex < navigationGroups.length - 1 && (
                  <div className="pt-3">
                    <div className="h-px bg-gray-100" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Payroll System
          </div>
          <div className="text-xs text-gray-400">
            v1.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 