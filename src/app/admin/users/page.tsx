'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  joined: string;
  status: Status;
};

// Dummy data for users - in a real app, this would be fetched from an API
const users: User[] = [
  {
    id: 1,
    name: 'Tú Anh',
    email: 'tuanh@example.com',
    role: 'User',
    joined: '2023-10-28',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Phương Anh',
    email: 'phuonganh@example.com',
    role: 'User',
    joined: '2023-11-15',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Admin User',
    email: 'admin@gmail.com',
    role: 'Admin',
    joined: '2023-09-01',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Lan Anh',
    email: 'lananh@example.com',
    role: 'User',
    joined: '2024-01-05',
    status: 'Inactive',
  },
];

type Status = 'Active' | 'Inactive';

const statusColor: Record<Status, string> = {
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-red-100 text-red-800',
}

export default function UsersPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Users</h1>
            <p className="text-gray-500">Manage all users in your application.</p>
        </div>
        <Button>
          <PlusCircle size={18} className="mr-2" />
          Create User
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-sm text-gray-600">Name</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Role</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Joined Date</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-4">
                    <p className='font-medium text-gray-900'>{user.name}</p>
                    <p className='text-sm text-gray-500'>{user.email}</p>
                </td>
                <td className="p-4 text-gray-700">{user.role}</td>
                <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[user.status]}`}>
                        {user.status}
                    </span>
                </td>
                <td className="p-4 text-gray-700">{user.joined}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button variant="secondaryOutline" size="sm">
                      <Edit size={14} />
                    </Button>
                    <Button variant="dangerOutline" size="sm">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}