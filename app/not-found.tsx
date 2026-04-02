import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-5 px-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-[#21262d] flex items-center justify-center">
        <AlertCircle className="h-8 w-8 text-[#484f58]" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-[#e6edf3] mb-2">
          Page not found
        </h1>
        <p className="text-[#8b949e] text-sm max-w-xs">
          The assignment you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
      </div>
      <Link
        href="/assignments"
        className="flex items-center gap-2 btn-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to assignments
      </Link>
    </div>
  );
}