// minimal utility: decode JWT, schedule refresh, and fetch wrapper
export function parseJwt(token) {
	if (!token) return null;
	try {
		const [, payload] = token.split(".");
		const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
		return JSON.parse(json);
	} catch (e) {
		return null;
	}
}

// schedule automatic refresh before expiry
let refreshTimer = null;
export function startAutoRefresh(getAccessToken, setAccessToken, options = {}) {
	const bufferSeconds = options.bufferSeconds || 120; // refresh this many seconds before expiry

	function schedule() {
		if (refreshTimer) {
			clearTimeout(refreshTimer);
			refreshTimer = null;
		}
		const token = getAccessToken();
		if (!token) return;
		const payload = parseJwt(token);
		if (!payload || !payload.exp) return;
		const msUntilExpiry = payload.exp * 1000 - Date.now();
		const msUntilRefresh = Math.max(1000, msUntilExpiry - bufferSeconds * 1000);
		refreshTimer = setTimeout(async () => {
			try {
				// call refresh endpoint (refresh token sent via cookie)
				const resp = await fetch("/api/refresh-token", {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
				});
				if (resp.ok) {
					const data = await resp.json();
					if (data?.accessToken) {
						setAccessToken(data.accessToken);
						// reschedule based on new token
						schedule();
						return;
					}
				}
				// on failure clear token (frontend may redirect to login)
				setAccessToken(null);
			} catch (err) {
				console.error("Auto refresh failed:", err);
				setAccessToken(null);
			}
		}, msUntilRefresh);
	}

	// run once immediately
	schedule();

	// return stop function
	return () => {
		if (refreshTimer) clearTimeout(refreshTimer);
		refreshTimer = null;
	};
}

// fetch wrapper that retries once after refreshing when 401 returned
export async function fetchWithRefresh(input, init = {}, getAccessToken, setAccessToken) {
	const token = getAccessToken();
	const headers = new Headers(init.headers || {});
	if (token) headers.set("Authorization", `Bearer ${token}`);

	const resp = await fetch(input, { ...init, headers, credentials: init.credentials || "include" });
	if (resp.status !== 401) {
		// if server rotated token and set x-access-token, update it automatically
		const rotated = resp.headers.get("x-access-token");
		if (rotated) setAccessToken(rotated);
		return resp;
	}

	// try refreshing
	try {
		const r = await fetch("/api/refresh-token", { method: "POST", credentials: "include" });
		if (!r.ok) {
			setAccessToken(null);
			return resp; // return original 401
		}
		const data = await r.json();
		if (data?.accessToken) {
			setAccessToken(data.accessToken);
			// retry original request with new token
			const headers2 = new Headers(init.headers || {});
			headers2.set("Authorization", `Bearer ${data.accessToken}`);
			const retry = await fetch(input, { ...init, headers: headers2, credentials: init.credentials || "include" });
			const rotated = retry.headers.get("x-access-token");
			if (rotated) setAccessToken(rotated);
			return retry;
		}
	} catch (e) {
		console.error("fetchWithRefresh refresh error:", e);
	}
	return resp;
}
