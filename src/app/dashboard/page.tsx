'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { 
  MdPeople, 
  MdPayments, 
  MdTrendingUp,
  MdCalendarToday 
} from 'react-icons/md';

const stats = [
  { name: 'Total Employees', value: '25', icon: MdPeople, color: 'bg-blue-500' },
  { name: 'Monthly Payroll', value: '$45,000', icon: MdPayments, color: 'bg-green-500' },
  { name: 'Active Projects', value: '12', icon: MdTrendingUp, color: 'bg-purple-500' },
  { name: 'Next Payroll', value: 'Jun 30', icon: MdCalendarToday, color: 'bg-red-500' },
];

export default function Dashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    },
  });

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {session.user?.name?.split(' ')[0]}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your organization today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className={`absolute rounded-md p-3 ${item.color}`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            </dd>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center text-gray-500">
              No recent activity to show.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}