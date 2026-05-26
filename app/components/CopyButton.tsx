// app/components/CopyButton.tsx
"use client";

import { useState, useEffect, useRef } from "react";

interface CopyButtonProps {
  text: string;
  disabled?: boolean;
}

export function CopyButton({ text, disabled = false }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up any pending reset timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy() {
    // Clear any pending reset before starting a new copy action
    if (timerRef.current) clearTimeout(timerRef.current);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fallback: clipboard unavailable, permission denied, or non-secure context
    }
  }

  return (
    <button
      onClick={handleCopy}
      disabled={disabled}
      className="
        px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200
        border border-orange-300 text-orange-600
        hover:bg-orange-50 active:scale-95
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
      "
    >
      {copied ? "已复制 ✓" : "复制"}
    </button>
  );
}
