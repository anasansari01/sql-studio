"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, BookOpen, Github } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

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
            href="/"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/"
                ? "bg-[#21262d] text-[#e6edf3]"
                : "text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]"
            )}
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:block">Assignments</span>
          </Link>

          <a
            href="https://github.com/anasansari01"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3] transition-colors"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:block">GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );
}