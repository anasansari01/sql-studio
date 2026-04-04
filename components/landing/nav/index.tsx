"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, BookOpen, Github, LayoutDashboard, LogOut, LogIn, UserPlus, ChevronDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="sticky top-0 z-50 h-16 border-b border-[#30363d] bg-[#0f1117]/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 group-hover:bg-indigo-500 transition-colors">
            <Database className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-[#e6edf3] text-lg hidden sm:block">
            <span className="text-indigo-400">SQL</span>Studio
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/hub"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/hub" || pathname.startsWith("/hub/")
                ? "bg-[#21262d] text-[#e6edf3]"
                : "text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]"
            )}
          >
            <Layers className="h-4 w-4" />
            <span className="hidden sm:block">Hub</span>
          </Link>

          <Link
            href="/assignments"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/assignments" || pathname.startsWith("/attempt")
                ? "bg-[#21262d] text-[#e6edf3]"
                : "text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]"
            )}
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:block">Assignments</span>
          </Link>

          {user && (
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/dashboard"
                  ? "bg-[#21262d] text-[#e6edf3]"
                  : "text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:block">Dashboard</span>
            </Link>
          )}

          <a
            href="https://github.com/anasansari01"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3] transition-colors"
          >
            <Github className="h-4 w-4" />
            <span className="hidden md:block">GitHub</span>
          </a>
        </div>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-8 w-24 rounded-lg bg-[#21262d] animate-pulse" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((p) => !p)}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-[#21262d] transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-[#e6edf3] hidden sm:block max-w-30 truncate">
                  {user.name}
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-[#8b949e] transition-transform", dropdownOpen && "rotate-180")} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[#30363d] bg-[#161b22] shadow-xl shadow-black/40 overflow-hidden z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-[#30363d]">
                    <p className="text-sm font-semibold text-[#e6edf3] truncate">{user.name}</p>
                    <p className="text-xs text-[#484f58] truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      My dashboard
                    </Link>
                    <Link
                      href="/assignments"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors"
                    >
                      <BookOpen className="h-4 w-4" />
                      Assignments
                    </Link>
                  </div>

                  <div className="border-t border-[#30363d] py-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:block">Sign in</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:block">Sign up</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}