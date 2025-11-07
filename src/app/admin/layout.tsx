/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useAuthStore } from '@/lib/store';
import { LayoutDashboard, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = useAuthStore((state: { isAdmin: any; }) => state.isAdmin);
  const pathname = usePathname();

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-gray-700 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-500">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    { href: '/admin/users', label: 'Users', icon: <Users size={18} /> },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: <Settings size={18} />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-lg">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold tracking-wide">Admin Panel</h2>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                    active
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 text-xs text-gray-400 border-t border-gray-700">
          © {new Date().getFullYear()} Admin System
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
