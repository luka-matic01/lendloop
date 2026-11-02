"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { cn } from "@/lib/utils";

type ToastTone = "default" | "error";

type ToastState = {
  message: string;
  tone: ToastTone;
};

type ToastFn = (message: string, tone?: ToastTone) => void;

const ToastContext = createContext<ToastFn | null>(null);

export function useToast(): ToastFn {
  const toast = useContext(ToastContext);
  if (!toast) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return toast;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback<ToastFn>((message, tone = "default") => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast ? (
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "pointer-events-none fixed top-6 left-1/2 z-[100] w-max max-w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 border-2 border-ink px-4 py-2.5 text-sm font-semibold shadow-[4px_4px_0_0_var(--color-ink)] md:top-24",
            toast.tone === "error"
              ? "bg-surface text-negative"
              : "bg-board text-on-board",
          )}
        >
          {toast.message}
        </p>
      ) : null}
    </ToastContext.Provider>
  );
}
