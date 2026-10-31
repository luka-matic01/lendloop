import { ConvexError } from "convex/values";

export const AuthErrorCode = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  USER_NOT_PROVISIONED: "USER_NOT_PROVISIONED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export type AuthErrorCode =
  (typeof AuthErrorCode)[keyof typeof AuthErrorCode];

export function authError(code: AuthErrorCode, message?: string): never {
  throw new ConvexError({ code, message: message ?? code });
}
