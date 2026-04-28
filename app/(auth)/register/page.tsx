"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Database, Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { OtpInput } from "@/components/otp/index";
import { Button } from "@/components/ui/button";

const PASSWORD_RULES = [
  { label: "At least 8 characters",  test: (p: string) => p.length >= 8 },
  { label: "At least one number",    test: (p: string) => /\d/.test(p) },
  { label: "At least one letter",    test: (p: string) => /[a-zA-Z]/.test(p) },
];

type Step = "form" | "otp";

export default function RegisterPage() {
  const router = useRouter();

  const [step,         setStep]         = useState<Step>("form");
  const [form,         setForm]         = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [isLoading,    setIsLoading]    = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [resendCooldown, setResendCooldown]   = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError(null);
  };

  const passwordValid  = PASSWORD_RULES.every((r) => r.test(form.password));
  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid)  { setError("Please meet all password requirements."); return; }
    if (!passwordsMatch) { setError("Passwords do not match."); return; }

    setIsLoading(true);
    setError(null);

    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed."); return; }
      setStep("otp");
      startResendCooldown();
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
      const res  = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email, code, purpose: "register",
          name: form.name, password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Verification failed."); return; }
      router.push("/dashboard");
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
        body: JSON.stringify({ email: form.email, purpose: "register" }),
      });
      startResendCooldown();
    } catch { /* silent */ }
  };

  function startResendCooldown() {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((p) => { if (p <= 1) { clearInterval(interval); return 0; } return p - 1; });
    }, 1000);
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-900/40">
            <Database className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#e6edf3]">
            {step === "form" ? "Create your account" : "Verify your email"}
          </h1>
          <p className="text-[#8b949e] text-sm mt-1">
            {step === "form"
              ? "Start practicing SQL for free"
              : `We sent a 6-digit code to ${form.email}`}
          </p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="rounded-lg bg-red-900/20 border border-red-800/40 px-4 py-3 text-sm text-red-400 mb-5">
              {error}
            </div>
          )}

          {step === "form" && (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-sm font-medium text-[#8b949e]">Full name</label>
                  <input id="name" name="name" type="text" autoComplete="name" required
                    value={form.name} onChange={handleChange} placeholder="John Snow"
                    className="w-full rounded-lg bg-[#0f1117] border border-[#30363d] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#484f58] transition-colors" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-[#8b949e]">Email</label>
                  <input id="email" name="email" type="email" autoComplete="email" required
                    value={form.email} onChange={handleChange} placeholder="you@example.com"
                    className="w-full rounded-lg bg-[#0f1117] border border-[#30363d] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#484f58] transition-colors" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-[#8b949e]">Password</label>
                  <div className="relative">
                    <input id="password" name="password" type={showPassword ? "text" : "password"}
                      autoComplete="new-password" required value={form.password}
                      onChange={handleChange}
                      onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)}
                      placeholder="••••••••"
                      className="w-full rounded-lg bg-[#0f1117] border border-[#30363d] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-4 py-2.5 pr-11 text-sm text-[#e6edf3] placeholder-[#484f58] transition-colors" />
                    <button type="button" onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#8b949e]">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {(passwordFocused || form.password.length > 0) && (
                    <div className="mt-2 space-y-1">
                      {PASSWORD_RULES.map((rule) => {
                        const passes = rule.test(form.password);
                        return (
                          <div key={rule.label} className="flex items-center gap-1.5">
                            {passes ? <Check className="h-3 w-3 text-emerald-400 shrink-0" /> : <X className="h-3 w-3 text-[#484f58] shrink-0" />}
                            <span className={cn("text-xs", passes ? "text-emerald-400" : "text-[#484f58]")}>{rule.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#8b949e]">Confirm password</label>
                  <div className="relative">
                    <input id="confirmPassword" name="confirmPassword" type={showConfirm ? "text" : "password"}
                      autoComplete="new-password" required value={form.confirmPassword}
                      onChange={handleChange} placeholder="••••••••"
                      className={cn("w-full rounded-lg bg-[#0f1117] border outline-none px-4 py-2.5 pr-11 text-sm text-[#e6edf3] placeholder-[#484f58] transition-colors focus:ring-1",
                        form.confirmPassword.length > 0
                          ? passwordsMatch ? "border-emerald-600 focus:border-emerald-500 focus:ring-emerald-500"
                                           : "border-red-700 focus:border-red-600 focus:ring-red-600"
                          : "border-[#30363d] focus:border-indigo-500 focus:ring-indigo-500"
                      )} />
                    <button type="button" onClick={() => setShowConfirm((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#8b949e]">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-xs text-red-400 mt-1">Passwords do not match.</p>
                  )}
                </div>

                <Button type="submit" disabled={isLoading || !passwordValid || !passwordsMatch}
                  className="w-full btn-primary justify-center py-5 text-sm bg-indigo-600 text-white hover:bg-indigo-500 focus:bg-indigo-500 active:bg-indigo-600 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:bg-indigo-700/50 disabled:text-gray-400">
                  {isLoading
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Sending code…</>
                    : "Continue"}
                </Button>
              </form>
            </>
          )}

          {step === "otp" && (
            <div className="space-y-6">
              <OtpInput length={6} onComplete={handleOtp} disabled={isLoading} autoFocus />

              <Button onClick={() => handleOtp("")} disabled={isLoading}
                className="w-full btn-primary justify-center py-5 text-sm bg-indigo-600 text-white hover:bg-indigo-500 focus:bg-indigo-500 active:bg-indigo-600 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:bg-indigo-700/50 disabled:text-gray-400">
                {isLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</>
                  : "Verify & create account"}
              </Button>

              <div className="flex items-center justify-between text-xs text-[#484f58]">
                <button onClick={() => { setStep("form"); setError(null); }}
                  className="hover:text-[#8b949e] transition-colors">← Edit details</button>
                <button onClick={handleResend} disabled={resendCooldown > 0}
                  className={cn("transition-colors", resendCooldown > 0
                    ? "text-[#484f58] cursor-default"
                    : "text-indigo-400 hover:text-indigo-300")}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-[#8b949e] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}