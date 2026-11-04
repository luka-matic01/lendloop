/** Last paginated tab results — survives section unmount until cleared on sign-out. */
const tabResultCache = new Map<string, unknown[]>();

export function getStaleTabResultCache<T>(tabKey: string): T[] | undefined {
  return tabResultCache.get(tabKey) as T[] | undefined;
}

export function setStaleTabResultCache<T>(tabKey: string, items: T[]): void {
  tabResultCache.set(tabKey, items);
}

export function clearStaleTabResultCache(): void {
  tabResultCache.clear();
}
