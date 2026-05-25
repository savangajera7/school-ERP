/**
 * Normalizes API list responses from Mahispark backend shapes.
 */
export function parseApiList<T = Record<string, unknown>>(
  response: unknown
): T[] {
  if (!response) return [];
  const root = (response as { data?: unknown })?.data ?? response;
  if (Array.isArray(root)) return root as T[];
  if (root && typeof root === "object") {
    const inner = root as Record<string, unknown>;
    if (Array.isArray(inner.data)) return inner.data as T[];
    if (Array.isArray(inner.items)) return inner.items as T[];
    if (Array.isArray(inner.list)) return inner.list as T[];
    if ((inner as { success?: boolean }).success && Array.isArray(inner.data)) {
      return inner.data as T[];
    }
  }
  return [];
}

export function parseApiData<T = Record<string, unknown>>(
  response: unknown
): T | null {
  if (!response) return null;
  const root = (response as { data?: unknown })?.data ?? response;
  if (root && typeof root === "object" && !Array.isArray(root)) {
    const inner = root as Record<string, unknown>;
    if (inner.data && typeof inner.data === "object" && !Array.isArray(inner.data)) {
      return inner.data as T;
    }
    return inner as T;
  }
  return null;
}
