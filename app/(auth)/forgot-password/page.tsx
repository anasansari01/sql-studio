"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Database, Eye, EyeOff, Loader2, Check, X, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { OtpInput } from "@/components/otp/index";
import { Button } from "@/components/ui/button";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "At least one number",   test: (p: string) => /\d/.test(p) },
  { label: "At least one letter",   test: (p: string) => /[a-zA-Z]/.test(p) },
];

type Step = "email" | "otp" | "new_password" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step,         setStep]      = useState<Step>("email");
  const [email,        setEmail]     = useState("");
  const [verifiedCode, setVerifiedCode] = useState("");
  const [newPassword,  setNewPassword]  = useState("");
  const [confirmPw,    setConfirmPw]    = useState("");
  const [showPw,       setShowPw]       = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [error,        setError]     = useState<string | null>(null);
  const [isLoading,    setIsLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [resendCooldown,  setResendCooldown]  = useState(0);

  const passwordValid  = PASSWORD_RULES.every((r) => r.test(newPassword));
  const passwordsMatch = newPassword === confirmPw && confirmPw.length > 0;

  // Step 1 — send OTP to email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to send code."); return; }
      setStep("otp");
      startCooldown();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 — verify OTP (just verify, don't reset yet)
  const handleVerifyOtp = async (code: string) => {
    // We store the code and move to password step — the actual reset happens in step 3
    // so the user has a chance to enter their new password after OTP is confirmed
    setVerifiedCode(code);
    setStep("new_password");
  };

  // Step 3 — verify OTP + set new password in one call
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid)  { setError("Please meet all password requirements."); return; }
    if (!passwordsMatch) { setError("Passwords do not match."); return; }

    setIsLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: verifiedCode,
          purpose: "reset_password",
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // OTP may have expired between steps — send user back to OTP step
        if (data.error?.includes("expired") || data.error?.includes("not found")) {
          setStep("otp");
          setVerifiedCode("");
        }
        setError(data.error ?? "Reset failed.");
        return;
      }
      setStep("done");
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
      await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      startCooldown();
    } catch { /* silent */ }
  };

  function startCooldown() {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown((p) => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; });
    }, 1000);
  }

  const stepTitle: Record<Step, string> = {
    email:        "Forgot your password?",
    otp:          "Check your email",
    new_password: "Set a new password",
    done:         "Password updated!",
  };

  const stepSub: Record<Step, string> = {
    email:        "Enter your email and we'll send a reset code.",
    otp:          `We sent a code to ${email}`,
    new_password: "Almost there — choose a new password.",
    done:         "You can now sign in with your new password.",
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-900/40">
            <Database className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#e6edf3]">{stepTitle[step]}</h1>
          <p className="text-[#8b949e] text-sm mt-1 text-center">{stepSub[step]}</p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="rounded-lg bg-red-900/20 border border-red-800/40 px-4 py-3 text-sm text-red-400 mb-5">
              {error}
            </div>
          )}

          {/* ── Step 1: Email ───────────────────────────────────────────── */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-[#8b949e]">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#484f58]" />
                  <input
                    id="email" type="email" required
                    value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 rounded-lg bg-[#0f1117] border border-[#30363d] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none py-2.5 text-sm text-[#e6edf3] placeholder-[#484f58] transition-colors"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading || !email} className="w-full btn-primary justify-center py-5 text-sm bg-indigo-600 text-white hover:bg-indigo-500 focus:bg-indigo-500 active:bg-indigo-600 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:bg-indigo-700/50 disabled:text-gray-400"> {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Sending code…</> : "Send reset code"} </Button>
            </form>
          )}

          {/* ── Step 2: OTP ─────────────────────────────────────────────── */}
          {step === "otp" && (
            <div className="space-y-6">
              <OtpInput length={6} onComplete={handleVerifyOtp} disabled={isLoading} autoFocus />

              <div className="flex items-center justify-between text-xs text-[#484f58]">
                <button onClick={() => { setStep("email"); setError(null); }}
                  className="hover:text-[#8b949e] transition-colors cursor-pointer">
                  ← Change email
                </button>
                <button onClick={handleResend} disabled={resendCooldown > 0}
                  className={cn("transition-colors cursor-pointer ", resendCooldown > 0
                    ? "text-[#484f58] cursor-default"
                    : "bg-indigo-400 text-white")}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: New password ─────────────────────────────────────── */}
          {step === "new_password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="newPassword" className="block text-sm font-medium text-[#8b949e]">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="newPassword" type={showPw ? "text" : "password"}
                    autoComplete="new-password" required
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholder="••••••••"
                    className="w-full rounded-lg bg-[#0f1117] border border-[#30363d] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-4 py-2.5 pr-11 text-sm text-[#e6edf3] placeholder-[#484f58] transition-colors"
                  />
                  <button type="button" onClick={() => setShowPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#8b949e] cursor-pointer">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {(passwordFocused || newPassword.length > 0) && (
                  <div className="mt-2 space-y-1">
                    {PASSWORD_RULES.map((rule) => {
                      const ok = rule.test(newPassword);
                      return (
                        <div key={rule.label} className="flex items-center gap-1.5">
                          {ok ? <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                              : <X className="h-3 w-3 text-[#484f58] shrink-0" />}
                          <span className={cn("text-xs", ok ? "text-emerald-400" : "text-[#484f58]")}>
                            {rule.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPw" className="block text-sm font-medium text-[#8b949e]">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    id="confirmPw" type={showConfirm ? "text" : "password"}
                    autoComplete="new-password" required
                    value={confirmPw}
                    onChange={(e) => { setConfirmPw(e.target.value); setError(null); }}
                    placeholder="••••••••"
                    className={cn(
                      "w-full rounded-lg bg-[#0f1117] border outline-none px-4 py-2.5 pr-11 text-sm text-[#e6edf3] placeholder-[#484f58] transition-colors focus:ring-1",
                      confirmPw.length > 0
                        ? passwordsMatch
                          ? "border-emerald-600 focus:border-emerald-500 focus:ring-emerald-500"
                          : "border-red-700 focus:border-red-600 focus:ring-red-600"
                        : "border-[#30363d] focus:border-indigo-500 focus:ring-indigo-500"
                    )}
                  />
                  <button type="button" onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#8b949e] cursor-pointer">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPw.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match.</p>
                )}
              </div>

              <Button type="submit"
                disabled={isLoading || !passwordValid || !passwordsMatch}
                className="w-full btn-primary justify-center py-5 text-sm bg-indigo-600 text-white hover:bg-indigo-500 focus:bg-indigo-500 active:bg-indigo-600 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:bg-indigo-700/50 disabled:text-gray-400">
                {isLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Resetting…</>
                  : "Reset password"}
              </Button>
            </form>
          )}

          {/* ── Step 4: Done ─────────────────────────────────────────────── */}
          {step === "done" && (
            <div className="text-center space-y-5">
              <div className="h-16 w-16 rounded-full bg-emerald-900/30 border border-emerald-700/40 flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-emerald-400" />
              </div>
              <p className="text-[#8b949e] text-sm">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <Button
                onClick={() => router.push("/login")}
                className="w-full btn-primary justify-center py-5 text-sm bg-indigo-600 text-white hover:bg-indigo-500 focus:bg-indigo-500 active:bg-indigo-600 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:bg-indigo-700/50 disabled:text-gray-400"
              >
                Go to sign in
              </Button>
            </div>
          )}
        </div>

        {step !== "done" && (
          <p className="text-center text-sm text-[#8b949e] mt-6">
            Remember your password?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}