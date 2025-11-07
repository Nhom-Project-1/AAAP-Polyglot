'use client';

import { useAuthStore } from '@/lib/store';
import { LayoutDashboard, Settings, Users, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, setUser, setIsAdmin, setIsLoggedIn } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      setUser(null);
      setIsAdmin(false);
      setIsLoggedIn(false);
      router.push('/loginAdmin');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-pink-500 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to view this page.
          </p>
          <Button onClick={() => router.push('/loginAdmin')}>Go to Admin Login</Button>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    { href: '/admin/users', label: 'Users', icon: <Users size={20} /> },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: <Settings size={20} />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 flex items-center gap-3 border-b border-gray-200">
          <img src="/logo.png" alt="Logo" className="w-10 h-10" />
          <h2 className="text-xl font-bold text-gray-800 tracking-wide">Admin</h2>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all font-medium ${
                    active
                      ? 'bg-pink-50 text-pink-600'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
            <Button variant="secondaryOutline" onClick={handleLogout} className="w-full flex items-center gap-2">
                <LogOut size={16} />
                <span>Logout</span>
            </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}