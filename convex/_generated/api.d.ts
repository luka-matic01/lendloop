/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as automation from "../automation.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_bootstrapAdmins from "../lib/bootstrapAdmins.js";
import type * as lib_borrowDates from "../lib/borrowDates.js";
import type * as lib_emailVerified from "../lib/emailVerified.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_hmac from "../lib/hmac.js";
import type * as lib_limits from "../lib/limits.js";
import type * as lib_loanLastActivity from "../lib/loanLastActivity.js";
import type * as lib_loanViews from "../lib/loanViews.js";
import type * as lib_loans from "../lib/loans.js";
import type * as lib_scheduleLoanNotification from "../lib/scheduleLoanNotification.js";
import type * as lib_seedFixtures from "../lib/seedFixtures.js";
import type * as lib_userDisplayName from "../lib/userDisplayName.js";
import type * as lib_validators from "../lib/validators.js";
import type * as loanRequests from "../loanRequests.js";
import type * as seed from "../seed.js";
import type * as tools from "../tools.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  automation: typeof automation;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/bootstrapAdmins": typeof lib_bootstrapAdmins;
  "lib/borrowDates": typeof lib_borrowDates;
  "lib/emailVerified": typeof lib_emailVerified;
  "lib/errors": typeof lib_errors;
  "lib/hmac": typeof lib_hmac;
  "lib/limits": typeof lib_limits;
  "lib/loanLastActivity": typeof lib_loanLastActivity;
  "lib/loanViews": typeof lib_loanViews;
  "lib/loans": typeof lib_loans;
  "lib/scheduleLoanNotification": typeof lib_scheduleLoanNotification;
  "lib/seedFixtures": typeof lib_seedFixtures;
  "lib/userDisplayName": typeof lib_userDisplayName;
  "lib/validators": typeof lib_validators;
  loanRequests: typeof loanRequests;
  seed: typeof seed;
  tools: typeof tools;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
