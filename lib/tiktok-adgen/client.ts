/** Browser-side API client — session via HttpOnly cookie (credentials: include). */

export type ApiResult<T> = { ok: boolean; status: number; data: T };

export async function apiFetch<T = unknown>(path: string, opts: RequestInit = {}): Promise<ApiResult<T>> {
  const res = await fetch(path, {
    ...opts,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers as Record<string, string> | undefined),
    },
  });

  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}
