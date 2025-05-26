/**
 * Simple in-memory cache for assembled messages.
 */
const store = new Map<string, any>();

export function get<T>(key: string): T | undefined {
  return store.get(key) as T;
}

export function set<T>(key: string, value: T): void {
  store.set(key, value);
}
