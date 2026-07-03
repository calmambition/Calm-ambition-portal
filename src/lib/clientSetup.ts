import type { ClientProfile } from "../hooks/use-client-profile";

// A one-time setup link the coach hands to a client after the first session.
// The client-facing pre-load (their details plus the session anchor) rides in
// the URL fragment, so there is no server and nothing leaves the device except
// the link the coach chooses to send. Private coach notes are never included.

export interface ClientSetupPayload {
  v: 1;
  setupId: string;
  name: string;
  role: string;
  intake: Partial<ClientProfile["intake"]>;
  sessionAnchor: Partial<ClientProfile["sessionAnchor"]>;
}

function b64urlEncode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// Client-facing slice of a profile. Drops the coach's private notes and the
// unused intake email; keeps intake context and the session anchor.
export function buildSetupPayload(profile: ClientProfile): ClientSetupPayload {
  const intake = { ...profile.intake };
  delete (intake as Partial<ClientProfile["intake"]>).email;
  const sessionAnchor = { ...profile.sessionAnchor };
  delete (sessionAnchor as Partial<ClientProfile["sessionAnchor"]>).coachNotes;
  return {
    v: 1,
    setupId: crypto.randomUUID ? crypto.randomUUID() : `setup-${Date.now()}`,
    name: profile.intake.name || "",
    role: profile.intake.currentRole || "",
    intake,
    sessionAnchor,
  };
}

export function encodeSetup(payload: ClientSetupPayload): string {
  return b64urlEncode(JSON.stringify(payload));
}

export function decodeSetup(encoded: string): ClientSetupPayload | null {
  try {
    const obj = JSON.parse(b64urlDecode(encoded));
    if (obj && obj.v === 1 && typeof obj.setupId === "string") return obj as ClientSetupPayload;
  } catch { /* malformed or truncated link */ }
  return null;
}

export function buildSetupUrl(payload: ClientSetupPayload): string {
  const base = window.location.origin + window.location.pathname;
  return `${base}#setup=${encodeSetup(payload)}`;
}
