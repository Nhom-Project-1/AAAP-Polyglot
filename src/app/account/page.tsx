"use client";

import Layout from "@/components/layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function AccountPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  type AccountErrors = {
    fullName: string;
    username: string;
    currentPassword: string;
    newPassword: string;
  };

  const [errors, setErrors] = useState<AccountErrors>({
    fullName: "",
    username: "",
    currentPassword: "",
    newPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let valid = true;
    const newErrors: AccountErrors = {
      fullName: "",
      username: "",
      currentPassword: "",
      newPassword: "",
    };

    if (!fullName.trim()) {
      newErrors.fullName = "Họ và tên không được bỏ trống";
      valid = false;
    }
    if (!username.trim()) {
      newErrors.username = "Tên đăng nhập không được bỏ trống";
      valid = false;
    }
    if (!currentPassword.trim()) {
      newErrors.currentPassword = "Mật khẩu không được bỏ trống";
      valid = false;
    }
    if (!newPassword.trim()) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới!";
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    try {
      const res = await fetch("/api/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName,
          username,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Cập nhật thành công!", {
          duration: 3000,
        });
        const langRes = await fetch("/api/user-language", { cache: "no-store" });
        const langData = await langRes.json();

        if (langData.current?.id) {
          localStorage.setItem("currentLangId", langData.current.id);
          } else {
            localStorage.removeItem("currentLangId");
          }
      } else {
        toast.error(data.error || "Có lỗi khi cập nhật!", {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Không thể kết nối máy chủ!", { duration: 3000 });
    }
  };

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-center mb-4">
            Cập nhật tài khoản
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ tên */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-pink-300 focus:ring-2 focus:ring-pink-300"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-pink-300 focus:ring-2 focus:ring-pink-300"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-black-500">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-pink-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <img
                src={showPassword ? "/openeye.svg" : "/closeeye.svg"}
                alt={showPassword ? "Hiện mật khẩu" : "Ẩn mật khẩu"}
                className="w-5 h-5"
              />
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-black-500">
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-pink-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <img
                src={showNewPassword ? "/openeye.svg" : "/closeeye.svg"}
                alt={showNewPassword ? "Hiện mật khẩu" : "Ẩn mật khẩu"}
                className="w-5 h-5"
              />
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
          )}
        </div>

            <Button
              type="submit"
              className="block w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600"
            >
              Lưu thay đổi
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
} 