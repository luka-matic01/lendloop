/** Shared types used across multiple features — keep domain models in their feature. */

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
