'use client';

import { useAuthStore } from '@/lib/store';
import { Users, BookOpen, ShieldCheck, BarChart3 } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => (
  <div className={`bg-white p-6 rounded-lg shadow-sm flex items-center gap-6 border-l-4 ${color}`}>
    {icon}
    <div>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  // Dummy data for stats - in a real app, this would be fetched from an API
  const stats = [
    {
      label: 'Total Users',
      value: '1,254',
      icon: <Users size={32} className="text-pink-500" />,
      color: 'border-pink-500',
    },
    {
      label: 'Active Languages',
      value: '8',
      icon: <BookOpen size={32} className="text-blue-500" />,
      color: 'border-blue-500',
    },
    {
      label: 'Admin Accounts',
      value: '3',
      icon: <ShieldCheck size={32} className="text-green-500" />,
      color: 'border-green-500',
    },
    {
      label: 'API Calls Today',
      value: '24,892',
      icon: <BarChart3 size={32} className="text-yellow-500" />,
      color: 'border-yellow-500',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Welcome, {user?.fullName || 'Admin'}!
      </h1>
      <p className="text-gray-500 mb-8">Here is the summary of your application.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Placeholder for future charts or activity feeds */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-4">Recent Activity</h2>
        <p className="text-gray-500 text-sm">Activity feed will be shown here.</p>
      </div>
    </div>
  );
}