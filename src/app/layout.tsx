'use client';

import { useAuthStore } from '@/lib/store';
import { Geist, Geist_Mono } from 'next/font/google';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setIsLoggedIn, setUser, setIsAdmin } = useAuthStore();
  useEffect(() => {
    document.title = "AAAP - From Word to World";

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const user = await res.json();
          setUser(user);
          setIsLoggedIn(true);
          if (user.role === 'admin') {
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    };

    fetchUser();
  }, [setIsLoggedIn, setUser, setIsAdmin]);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
