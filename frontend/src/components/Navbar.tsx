"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { apiLogout } from "@/lib/api";
import Button from "./Button";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // swallow: might already be expired
    }
    logout();
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <Link
          href="/subjects"
          className="flex items-center gap-2 font-semibold text-white hover:text-indigo-400 transition-colors"
        >
          <span className="text-indigo-500 text-xl">◈</span>
          <span>LearnHub</span>
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-slate-400">
              {user?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
