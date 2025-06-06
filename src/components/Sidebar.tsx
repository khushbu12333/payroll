'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MdDashboard,
  MdPayments,
  MdApproval,
  MdAttachMoney,
  MdReceiptLong,
  MdTrendingUp,
  MdDescription,
  MdAssessment,
  MdSettings,
  MdPeople,
  MdPersonAdd,
  MdGroups,
  MdWorkHistory,
} from 'react-icons/md';

interface SubMenuItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

interface MenuItem {
  name: string;
  path: string;
  icon: React.ElementType;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: MdDashboard,
  },
  {
    name: 'Employee',
    path: '/employee',
    icon: MdPeople,

  },
  {
    name: 'Payrun',
    path: '/payrun',
    icon: MdPayments,
  },
  {
    name: 'Approvals',
    path: '/approvals',
    icon: MdApproval,
    subItems: [
      {
        name: 'Reimbursements',
        path: '/approvals/reimbursements',
        icon: MdAttachMoney,
      },
      {
        name: 'Proof of Investments',
        path: '/approvals/investments',
        icon: MdReceiptLong,
      },
      {
        name: 'Salary Revision',
        path: '/approvals/salary-revision',
        icon: MdTrendingUp,
      },
    ],
  },
  {
    name: 'Documents',
    path: '/documents',
    icon: MdDescription,
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: MdAssessment,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: MdSettings,
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleSubMenu = (itemName: string) => {
    setExpandedItem(expandedItem === itemName ? null : itemName);
  };

  return (
    <div className="w-64 h-screen bg-blue-50 shadow-lg fixed left-0 top-0">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-blue-900 mb-8">Payroll</h1>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => toggleSubMenu(item.name)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-100 ${
                        pathname.startsWith(item.path) ? 'bg-blue-100' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon className="w-5 h-5 mr-3 text-blue-600" />
                        <span className="text-blue-800">{item.name}</span>
                      </div>
                      <span className={`transform transition-transform text-blue-600 ${
                        expandedItem === item.name ? 'rotate-180' : ''
                      }`}>
                        ▼
                      </span>
                    </button>
                    {expandedItem === item.name && (
                      <ul className="ml-6 mt-2 space-y-2">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              href={subItem.path}
                              className={`flex items-center p-2 rounded-lg hover:bg-blue-100 ${
                                pathname === subItem.path ? 'bg-blue-100 text-blue-700' : 'text-blue-800'
                              }`}
                            >
                              <subItem.icon className="w-4 h-4 mr-3 text-blue-600" />
                              <span>{subItem.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.path}
                    className={`flex items-center p-2 rounded-lg hover:bg-blue-100 ${
                      pathname === item.path ? 'bg-blue-100 text-blue-700' : 'text-blue-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3 text-blue-600" />
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 