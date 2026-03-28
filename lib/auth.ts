const API = "https://api.atelai.org";

export interface AgentSession {
  did: string;
  token: string;
  name: string;
  linkedAt: string;
}

// Get all linked agents
export function getLinkedAgents(): AgentSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("atel_agents");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Get currently active agent
export function getStoredAuth(): { token: string; did: string } | null {
  if (typeof window === "undefined") return null;
  const did = localStorage.getItem("atel_active_did");
  const agents = getLinkedAgents();
  const active = agents.find(a => a.did === did);
  if (active) return { token: active.token, did: active.did };
  // Fallback: use first agent if active not found
  if (agents.length > 0) {
    localStorage.setItem("atel_active_did", agents[0].did);
    return { token: agents[0].token, did: agents[0].did };
  }
  // Legacy: check old single-agent keys
  const legacyToken = localStorage.getItem("atel_token");
  const legacyDid = localStorage.getItem("atel_did");
  if (legacyToken && legacyDid) return { token: legacyToken, did: legacyDid };
  return null;
}

// Get active agent with name
export function getActiveAgent(): AgentSession | null {
  if (typeof window === "undefined") return null;
  const did = localStorage.getItem("atel_active_did");
  const agents = getLinkedAgents();
  return agents.find(a => a.did === did) || agents[0] || null;
}

// Link a new agent (after CLI auth)
export function linkAgent(did: string, token: string, name: string) {
  const agents = getLinkedAgents();
  // Remove existing entry for this DID (re-link)
  const filtered = agents.filter(a => a.did !== did);
  filtered.push({ did, token, name, linkedAt: new Date().toISOString() });
  localStorage.setItem("atel_agents", JSON.stringify(filtered));
  localStorage.setItem("atel_active_did", did);
  // Clean up legacy keys
  localStorage.removeItem("atel_token");
  localStorage.removeItem("atel_did");
}

// Switch active agent
export function switchAgent(did: string): boolean {
  const agents = getLinkedAgents();
  if (agents.find(a => a.did === did)) {
    localStorage.setItem("atel_active_did", did);
    return true;
  }
  return false;
}

// Remove a linked agent
export function unlinkAgent(did: string) {
  const agents = getLinkedAgents().filter(a => a.did !== did);
  localStorage.setItem("atel_agents", JSON.stringify(agents));
  const activeDid = localStorage.getItem("atel_active_did");
  if (activeDid === did) {
    localStorage.setItem("atel_active_did", agents[0]?.did || "");
  }
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

export function isAuthenticated(): boolean {
  return getStoredAuth() !== null;
}

export function clearAuth() {
  localStorage.removeItem("atel_agents");
  localStorage.removeItem("atel_active_did");
  localStorage.removeItem("atel_token");
  localStorage.removeItem("atel_did");
}

export async function validateToken(token: string): Promise<string | null> {
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
