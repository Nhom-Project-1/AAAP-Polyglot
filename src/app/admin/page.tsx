"use client";

import { useAuthStore } from "@/lib/store";

export default function AdminPage() {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Page</h1>
      <p>Welcome, {user?.fullName || "Admin"}!</p>
    </div>
  );
}
