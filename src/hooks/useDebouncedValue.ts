"use client";

import { useEffect, useState } from "react";

/** Debounces string updates; clears immediately when empty or whitespace-only. */
export function useDebouncedValue(value: string, delayMs = 250): string {
  const [debounced, setDebounced] = useState(() =>
    value.trim() === "" ? "" : value,
  );

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === "") {
      const clearId = setTimeout(() => {
        setDebounced("");
      }, 0);
      return () => {
        clearTimeout(clearId);
      };
    }

    const id = setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => {
      clearTimeout(id);
    };
  }, [value, delayMs]);

  return debounced;
}
