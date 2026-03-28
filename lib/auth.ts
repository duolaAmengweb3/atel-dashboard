const API = "https://api.atelai.org";

export function getStoredAuth(): { token: string; did: string } | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("atel_token");
  const did = localStorage.getItem("atel_did");
  if (token && did) return { token, did };
  return null;
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
