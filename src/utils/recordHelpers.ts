/** Extract display fields from heterogeneous API records */
export function recordId(
  item: Record<string, unknown>,
  ...keys: string[]
): string {
  for (const k of keys) {
    const v = item[k];
    if (v != null && v !== "") return String(v);
  }
  return "";
}

export function recordLabel(
  item: Record<string, unknown>,
  ...keys: string[]
): string {
  for (const k of keys) {
    const v = item[k];
    if (v != null && String(v).trim()) return String(v);
  }
  return "—";
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  const e = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

export function compareVersions(remote: string, current: string): number {
  const r = remote.split(".").map((n) => parseInt(n, 10) || 0);
  const c = current.split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(r.length, c.length);
  for (let i = 0; i < len; i++) {
    if ((r[i] ?? 0) > (c[i] ?? 0)) return 1;
    if ((r[i] ?? 0) < (c[i] ?? 0)) return -1;
  }
  return 0;
}
