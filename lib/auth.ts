const API = "https://api.atelai.org";

export function getStoredAuth(): { token: string; did: string } | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("atel_token");
  const did = localStorage.getItem("atel_did");
  if (token && did) return { token, did };
  return null;
}

// Get DID from auth (localStorage) or URL ?did= parameter
export function getDID(searchParams?: URLSearchParams): string | null {
  const auth = getStoredAuth();
  if (auth) return auth.did;
  if (searchParams) {
    const urlDid = searchParams.get("did");
    if (urlDid) return urlDid;
  }
  return null;
}

// Check if user is authenticated (has valid token)
export function isAuthenticated(): boolean {
  return getStoredAuth() !== null;
}

export function clearAuth() {
  localStorage.removeItem("atel_token");
  localStorage.removeItem("atel_did");
}

export async function validateToken(
  token: string
): Promise<string | null> {
  try {
    const resp = await fetch(`${API}/auth/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.ok) {
      const data = await resp.json();
      return data.did;
    }
    return null;
  } catch {
    return null;
  }
}
