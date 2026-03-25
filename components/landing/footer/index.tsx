import Link from "next/link";
import { Database, Github, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-[#30363d] mt-16">

      <div className="absolute inset-0 bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row justify-between gap-10">

        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 text-[#e6edf3] font-semibold">
          <Database className="h-5 w-5 text-indigo-400" />
          SQL Studio
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-[#8b949e]">

          <div>
            <h4 className="font-semibold mb-2 text-[#8b949e]">Product</h4>
            <Link href="/assignments" className="block hover:text-[#e6edf3] transition">
              Assignments
            </Link>
            <Link href="#features" className="block hover:text-[#e6edf3] transition">
              Features
            </Link>
            <Link href="/about" className="block hover:text-[#e6edf3] transition">
              About
            </Link>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-[#8b949e]">Resources</h4>
            <Link href="/docs" className="block hover:text-[#e6edf3] transition">Docs</Link>
            <Link href="/faq" className="block hover:text-[#e6edf3] transition">FAQ</Link>
            <Link href="/blog" className="block hover:text-[#e6edf3] transition">Blog</Link>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-[#8b949e]">Community</h4>
            <a href="https://github.com/anasansari01/" target="_blank" className="block hover:text-[#e6edf3] transition">GitHub</a>
            <a href="https://linkedin.com/in/4nas-ansari" target="_blank" className="block hover:text-[#e6edf3] transition">LinkedIn</a>
            <a href="https://twitter.com" target="_blank" className="block hover:text-[#e6edf3] transition">Twitter</a>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-[#8b949e]">Legal</h4>
            <Link href="/privacy" className="block hover:text-[#e6edf3] transition">Privacy Policy</Link>
            <Link href="/terms" className="block hover:text-[#e6edf3] transition">Terms of Service</Link>
          </div>

        </div>
      </div>

      <div className="text-center text-xs text-[#6e7681] pb-6 relative z-10">
        © {new Date().getFullYear()} SQL Studio. Built for learning by doing.
      </div>

    </footer>
  );
}