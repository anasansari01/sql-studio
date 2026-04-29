"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Props {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({ length = 6, onComplete, disabled = false, autoFocus = false }: Props) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  const focus = (idx: number) => {
    inputs.current[Math.max(0, Math.min(idx, length - 1))]?.focus();
  };

  const handleChange = useCallback(
    (idx: number, raw: string) => {
      const digit = raw.replace(/\D/g, "").slice(-1);
      const next = [...values];
      next[idx] = digit;
      setValues(next);

      if (digit) {
        if (idx < length - 1) focus(idx + 1);
        if (idx === length - 1) {
          const code = next.join("");
          if (code.length === length) onComplete(code);
        }
      }
    },
    [values, length, onComplete]
  );

  const handleKeyDown = useCallback(
    (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        const next = [...values];
        if (next[idx]) {
          next[idx] = "";
          setValues(next);
        } else if (idx > 0) {
          next[idx - 1] = "";
          setValues(next);
          focus(idx - 1);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        focus(idx - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        focus(idx + 1);
      }
    },
    [values]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
      if (!pasted) return;
      const next = Array(length).fill("");
      for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
      setValues(next);
      const lastFilled = Math.min(pasted.length, length - 1);
      focus(lastFilled);
      if (pasted.length === length) onComplete(pasted);
    },
    [length, onComplete]
  );

  const code = values.join("");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        {values.map((v, idx) => (
          <input
            key={idx}
            ref={(el) => { inputs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={v}
            disabled={disabled}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={cn(
              "h-12 w-10 sm:w-12 text-center text-xl font-bold rounded-lg border",
              "bg-[#0f1117] text-[#e6edf3] outline-none transition-all duration-150",
              "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
              v
                ? "border-indigo-500 bg-indigo-900/20"
                : "border-[#30363d] hover:border-[#484f58]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-1.5">
        {values.map((v, idx) => (
          <div
            key={idx}
            className={cn(
              "h-1 rounded-full transition-all duration-200",
              v ? "w-4 bg-indigo-500" : "w-1.5 bg-[#30363d]"
            )}
          />
        ))}
      </div>
    </div>
  );
}