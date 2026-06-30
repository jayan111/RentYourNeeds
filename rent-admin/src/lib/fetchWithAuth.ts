/**
 * Drop-in fetch wrapper that:
 *  1. Injects the Authorization header automatically
 *  2. On 401: silently refreshes the access token and retries once
 *  3. On refresh failure: clears auth tokens (caller/useAuth handles redirect)
 *
 * Usage: replace `fetch(url, opts)` with `fetchWithAuth(url, opts)`
 * The Authorization header is added automatically — callers don't need to set it.
 */

const API_BASE =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
  'http://localhost:8000/api';

// Deduplicates concurrent refresh attempts — only one in-flight at a time
let inflightRefresh: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  if (inflightRefresh) return inflightRefresh;

  inflightRefresh = (async () => {
    try {
      const refreshToken =
        typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      if (!refreshToken) return false;

      const res = await fetch(`${API_BASE}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        console.warn('[fetchWithAuth] Token refresh failed:', res.status, await res.text().catch(() => ''));
        return false;
      }

      const json = await res.json();
      const { accessToken, refreshToken: newRefreshToken } =
        json.data ?? json;

      if (!accessToken) return false;

      localStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
      return true;
    } catch (err) {
      console.warn('[fetchWithAuth] Token refresh error:', err);
      return false;
    } finally {
      inflightRefresh = null;
    }
  })();

  return inflightRefresh;
}

/**
 * Clears all auth state from localStorage.
 * Does NOT redirect — let the caller (useAuth) handle navigation via Next.js router.
 */
export function clearAuthTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers = new Headers(options.headers as HeadersInit);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const refreshed = await doRefresh();

    if (refreshed) {
      const newToken =
        typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (newToken) headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(url, { ...options, headers });
    } else {
      // Clear tokens so useAuth can detect the logged-out state and redirect via router.push
      clearAuthTokens();
    }
  }

  return response;
}
