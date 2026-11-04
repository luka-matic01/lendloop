import { defineConfig, globalIgnores } from "eslint/config";
import clerkNext from "@clerk/eslint-plugin/next";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { "@clerk/next": clerkNext },
    rules: {
      "@clerk/next/require-auth-protection": [
        "error",
        {
          // Auth once in `(app)/layout.tsx` — not duplicated on thin route pages.
          protected: ["src/app/(app)/layout.tsx"],
          public: [
            "src/app/sign-in/**",
            "src/app/sign-up/**",
            "src/app/page.tsx",
            "src/app/layout.tsx",
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "convex/_generated/**",
  ]),
]);

export default eslintConfig;
