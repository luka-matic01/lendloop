import { publicEnv } from "@/constants";

export function isAppConfigured(): {
  hasConvex: boolean;
  hasClerk: boolean;
  isReady: boolean;
} {
  const hasConvex = Boolean(
    publicEnv.convexUrl &&
      publicEnv.convexUrl.startsWith("http") &&
      !publicEnv.convexUrl.includes("your-deployment-name")
  );
  const hasClerk = Boolean(
    publicEnv.clerkPublishableKey &&
      publicEnv.clerkPublishableKey.startsWith("pk_") &&
      !publicEnv.clerkPublishableKey.includes("replace_me")
  );
  return {
    hasConvex,
    hasClerk,
    isReady: hasConvex && hasClerk,
  };
}
