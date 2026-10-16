export const AUTH_SESSION_EVENT = "auth-session-changed";
export const LAST_ACTIVE_KEY = "last_active_timestamp";

const REMEMBER_ME_KEY = "remember_me";
const AUTH_NOTICE_KEY = "auth_session_notice";
const AUTH_KEYS = [
  "token",
  "refreshToken",
  "userId",
  "email",
  "fullName",
  "createdAt",
  "avatarUrl",
  "role",
  LAST_ACTIVE_KEY,
  REMEMBER_ME_KEY,
] as const;

export type AuthSessionData = {
  token: string;
  refreshToken?: string;
  userId?: string;
  email?: string;
  fullName?: string;
  createdAt?: string;
  avatarUrl?: string;
  role?: string;
};

const SESSION_DATA_KEYS: (keyof AuthSessionData)[] = [
  "token",
  "refreshToken",
  "userId",
  "email",
  "fullName",
  "createdAt",
  "avatarUrl",
  "role",
];

export type LogoutReason = "manual" | "idle" | "expired" | "unauthorized";

function browserStorage(): Storage[] {
  if (typeof window === "undefined") return [];
  return [window.sessionStorage, window.localStorage];
}

function activeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  if (window.sessionStorage.getItem("token")) return window.sessionStorage;
  if (window.localStorage.getItem("token")) return window.localStorage;
  return null;
}

function emitSessionChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function setAuthSession(data: AuthSessionData, rememberMe = true) {
  if (typeof window === "undefined") return;
  clearAuthSession(false);
  const storage = rememberMe ? window.localStorage : window.sessionStorage;
  for (const key of SESSION_DATA_KEYS) {
    const value = data[key];
    if (value !== undefined && value !== null && value !== "") storage.setItem(key, String(value));
  }
  storage.setItem(REMEMBER_ME_KEY, String(rememberMe));
  storage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
  emitSessionChange();
}

export function getAuthItem(key: string): string | null {
  return activeStorage()?.getItem(key) ?? null;
}

export function setAuthItem(key: string, value: string) {
  const storage = activeStorage();
  if (!storage) return;
  storage.setItem(key, value);
  emitSessionChange();
}

export function getAccessToken(): string | null {
  return getAuthItem("token");
}

export function getLastActiveTimestamp(): number | null {
  const raw = getAuthItem(LAST_ACTIVE_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function markSessionActive(timestamp = Date.now()) {
  const storage = activeStorage();
  if (!storage) return;
  storage.setItem(LAST_ACTIVE_KEY, String(timestamp));
}

export function clearAuthSession(emit = true) {
  for (const storage of browserStorage()) {
    for (const key of AUTH_KEYS) storage.removeItem(key);
  }
  if (emit) emitSessionChange();
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getJwtExpiration(token: string): number | null {
  const exp = decodeJwtPayload(token)?.exp;
  return typeof exp === "number" && Number.isFinite(exp) ? exp * 1000 : null;
}

export function isJwtExpired(token: string, now = Date.now()): boolean {
  const expiration = getJwtExpiration(token);
  return expiration === null || now >= expiration;
}

export function consumeAuthNotice(): LogoutReason | null {
  if (typeof window === "undefined") return null;
  const reason = window.sessionStorage.getItem(AUTH_NOTICE_KEY) as LogoutReason | null;
  window.sessionStorage.removeItem(AUTH_NOTICE_KEY);
  return reason;
}

export function logout(reason: LogoutReason = "manual", redirect = true) {
  if (typeof window === "undefined") return;
  clearAuthSession();
  const alreadyOnAuthPage = window.location.pathname === "/auth";
  if (reason !== "manual" && !alreadyOnAuthPage) window.sessionStorage.setItem(AUTH_NOTICE_KEY, reason);
  if (redirect && !alreadyOnAuthPage) window.location.replace("/auth");
}
