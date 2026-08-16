const API_CACHE = new Map<string, { data: unknown; expiresAt: number }>();

export async function fetchWithCache<T>(
  url: string,
  ttlMs: number = 30000
): Promise<T | null> {
  const cached = API_CACHE.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    API_CACHE.set(url, { data, expiresAt: Date.now() + ttlMs });
    return data as T;
  } catch {
    return null;
  }
}

export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}
