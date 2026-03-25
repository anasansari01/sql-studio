import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/landing/nav";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "SQL Studio — Learn SQL by Doing",
  description:
    "A browser-based SQL learning platform with real-time query execution and AI-powered hints.",
  keywords: ["SQL", "learning", "database", "queries", "tutorial"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <body className="min-h-screen bg-[#0f1117] text-[#e6edf3] antialiased">
        <Navbar />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
      </body>
    </html>
  );
}