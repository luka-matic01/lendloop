import { ConvexError } from "convex/values";

type StructuredConvexError = {
  code?: string;
  message?: string;
};

function structuredConvexErrorData(data: unknown): StructuredConvexError | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }
  const record = data as Record<string, unknown>;
  return {
    code: typeof record.code === "string" ? record.code : undefined,
    message: typeof record.message === "string" ? record.message : undefined,
  };
}

/** User-facing copy from a failed Convex mutation/action (`authError` → `ConvexError.data`). */
export function convexErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ConvexError) {
    if (typeof error.data === "string" && error.data.trim()) {
      return error.data;
    }
    const structured = structuredConvexErrorData(error.data);
    if (structured?.message) {
      return structured.message;
    }
    if (structured?.code) {
      return structured.code;
    }
  }
  return fallback;
}
