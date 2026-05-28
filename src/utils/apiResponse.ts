/**
 * Normalizes API list responses from Mahispark backend shapes.
 */

/** Unwrap react-query / customInstance payload: `{ data: body, status }` → body */
export function unwrapApiBody(response: unknown): unknown {
  if (response == null) return null;
  if (typeof response === "object" && !Array.isArray(response)) {
    const o = response as Record<string, unknown>;
    if ("data" in o && "status" in o) return o.data;
    if ("data" in o && Object.keys(o).length <= 3) return o.data;
  }
  return response;
}

function collectArray<T>(value: unknown, depth = 0): T[] | null {
  if (value == null || depth > 4) return null;
  if (Array.isArray(value)) {
    return value.filter((x) => x != null) as T[];
  }
  if (typeof value !== "object") return null;

  const inner = value as Record<string, unknown>;
  const keys = ["data", "Data", "items", "Items", "list", "List", "result", "Result", "records", "Records", "students", "Students"];

  for (const key of keys) {
    const candidate = inner[key];
    if (Array.isArray(candidate)) {
      return candidate.filter((x) => x != null) as T[];
    }
  }

  if (inner.success === true || inner.Success === true) {
    for (const key of keys) {
      const candidate = inner[key];
      const found = collectArray<T>(candidate, depth + 1);
      if (found) return found;
    }
  }

  for (const key of keys) {
    const found = collectArray<T>(inner[key], depth + 1);
    if (found) return found;
  }

  return null;
}

export function parseApiList<T = Record<string, unknown>>(
  response: unknown
): T[] {
  const body = unwrapApiBody(response);
  return collectArray<T>(body) ?? [];
}

export function parseApiData<T = Record<string, unknown>>(
  response: unknown
): T | null {
  const body = unwrapApiBody(response);
  if (!body || typeof body !== "object") return null;

  // First, check if there's a nested array somewhere and we just need the first item
  const arr = collectArray<T>(body);
  if (arr && arr.length > 0) {
    return arr[0];
  }

  // Otherwise, look for a nested object (e.g. data: { ... })
  const inner = body as Record<string, unknown>;
  const keys = ["data", "Data", "result", "Result", "item", "Item", "student", "Student"];
  
  for (const key of keys) {
    const nested = inner[key];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return nested as T;
    }
  }

  // Fallback to returning the unwrapped body itself
  return inner as T;
}

/** Map .NET PascalCase keys → camelCase for Orval models */
export function toCamelCaseRow<T extends Record<string, unknown>>(
  row: Record<string, unknown>
): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (value === undefined) continue;
    const camel = key.length ? key.charAt(0).toLowerCase() + key.slice(1) : key;
    if (out[camel] === undefined) out[camel] = value;
    else out[key] = value;
  }
  return out as T;
}
