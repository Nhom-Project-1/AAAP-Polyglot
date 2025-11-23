/* eslint-disable @next/next/no-img-element */
'use client';

import Layout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface UserResponse {
  fullName: string;
  username: string;
  error?: string;
}

export default function AccountPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [originalFullName, setOriginalFullName] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  
  const queryClient = useQueryClient();
  const { setIsLoggedIn, setUser, setIsAdmin } = useAuthStore();

  const [errors, setErrors] = useState({
    fullName: '',
    username: '',
  });

  const { data: userData, isLoading: isFetchingUser } = useQuery<UserResponse>({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await fetch('/api/user', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Không thể tải thông tin người dùng.');
      return res.json();
    }
  });

  useEffect(() => {
    if (userData) {
      setFullName(userData.fullName || '');
      setUsername(userData.username || '');
      setOriginalFullName(userData.fullName || '');
      setOriginalUsername(userData.username || '');
    }
  }, [userData]);

  const updateMutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await fetch('/api/update', {
        method: 'PATCH',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Cập nhật thất bại!');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Cập nhật thành công!');
      setOriginalFullName(fullName);
      setOriginalUsername(username);
      setCurrentPassword('');
      setNewPassword('');
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] }); // Invalidate global user query if exists
    },
    onError: (err: any) => {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra.';
      if (message.includes('401')) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        if(window) window.location.href = '/login';
      } else {
        toast.error(message);
      }
    }
  });

  const hasChanges =
    fullName.trim() !== originalFullName.trim() ||
    username.trim() !== originalUsername.trim() ||
    (newPassword.trim() && currentPassword.trim());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = { fullName: '', username: '' };
    if (!fullName.trim()) newErrors.fullName = 'Họ và tên không được bỏ trống.';
    if (!username.trim())
      newErrors.username = 'Tên đăng nhập không được bỏ trống.';
    setErrors(newErrors);
    if (newErrors.fullName || newErrors.username) {
      return;
    }

    if (currentPassword.trim() && !newPassword.trim()) {
      toast.error(
        'Vui lòng nhập mật khẩu mới hoặc để trống mật khẩu hiện tại để thực hiện những thay đổi khác.',
      );
      return;
    }

    const body: {
      fullName?: string;
      username?: string;
      currentPassword?: string;
      newPassword?: string;
    } = {};

    if (fullName.trim() !== originalFullName.trim())
      body.fullName = fullName.trim();
    if (username.trim() !== originalUsername.trim())
      body.username = username.trim();
    if (newPassword.trim()) {
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }

    if (Object.keys(body).length === 0) {
      toast.error('Không có thay đổi nào để cập nhật!');
      return;
    }

    updateMutation.mutate(body);
  };

  const isLoading = updateMutation.isPending;

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="w-full max-w-md bg-white p-8">
          <h1 className="text-2xl font-bold text-center mb-2">
            Thông tin người dùng
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ và tên */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  const val = e.target.value;
                  setFullName(val);
                }}
                className="w-full px-3 py-2 rounded-lg border border-pink-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Tên đăng nhập */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  const val = e.target.value;
                  setUsername(val);
                }}
                className="w-full px-3 py-2 rounded-lg border border-pink-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            {/* Mật khẩu hiện tại */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-pink-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <img
                    src={showPassword ? '/openeye.svg' : '/closeeye.svg'}
                    alt=""
                    className="h-5 w-5"
                  />
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-pink-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <img
                    src={showNewPassword ? '/openeye.svg' : '/closeeye.svg'}
                    alt=""
                    className="h-5 w-5"
                  />
                </button>
              </div>
            </div>

            <Button
              variant="secondary"
              type="submit"
              disabled={!hasChanges || isLoading}
              className={`px-8 py-3 mx-auto block w-40 rounded-lg text-white transition bg-pink-400 hover:bg-pink-500 
                ${
                  hasChanges || isLoading
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed'
                } flex justify-center items-center gap-2`}
            >
              {isLoading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {isLoading ? 'Đang xử lý...' : 'Lưu thay đổi'}
            </Button>
          </form>
        </div>
      </div>
      <Toaster position="top-center" />
    </Layout>
  );
}
