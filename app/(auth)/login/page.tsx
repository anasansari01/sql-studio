"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Database, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { OtpInput } from "@/components/otp/index";
import { Button } from "@/components/ui/button";

type Step = "credentials" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const googleError = searchParams.get("error");

  const [step, setStep] = useState<Step>("credentials");
  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(
    googleError === "google_denied"
      ? "Google sign-in was cancelled."
      : googleError === "google_failed"
      ? "Google sign-in failed. Please try again."
      : googleError === "google_no_email"
      ? "Google account has no email."
      : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }

      if (data.requiresOtp) {
        setStep("otp");
        startResendCooldown();
      } else {
        router.push(redirect);
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtp = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          code,
          purpose: "login",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Verification failed.");
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setError(null);

    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          purpose: "login",
        }),
      });

      startResendCooldown();
    } catch {
      // silent fail
    }
  };

  function startResendCooldown() {
    setResendCooldown(60);

    const interval = setInterval(() => {
      setResendCooldown((p) => {
        if (p <= 1) {
          clearInterval(interval);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-900/40">
            <Database className="h-6 w-6 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-[#e6edf3]">
            {step === "credentials" ? "Welcome back" : "Check your email"}
          </h1>

          <p className="text-[#8b949e] text-sm mt-1">
            {step === "credentials"
              ? "Sign in to continue your SQL journey"
              : `We sent a 6-digit code to ${form.email}`}
          </p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="rounded-lg bg-red-900/20 border border-red-800/40 px-4 py-3 text-sm text-red-400 mb-5">
              {error}
            </div>
          )}

          {step === "credentials" && (
            <form onSubmit={handleCredentials} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm text-[#8b949e]">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-lg bg-[#0f1117] border border-[#30363d] px-4 py-2.5 text-sm text-[#e6edf3]"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-sm text-[#8b949e]">Password</label>
                  <Link href="/forgot-password" className="text-xs text-indigo-400">
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-[#0f1117] border border-[#30363d] px-4 py-2.5 pr-10 text-sm text-[#e6edf3]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="animate-spin" /> : "Sign in"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <div className="space-y-6">
              <OtpInput length={6} onComplete={handleOtp} />

              <Button disabled={otp.length < 6} onClick={() => handleOtp(otp)}>
                Verify code
              </Button>

              <div className="flex justify-between text-xs">
                <button onClick={() => setStep("credentials")}>
                  ← Change email
                </button>

                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend code"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-indigo-400">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}