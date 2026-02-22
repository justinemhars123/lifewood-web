export const AUTH_STORAGE_KEY = "lifewood_auth_user";
export const FIXED_AUTH_EMAIL = "test1@gmail.com";
export const FIXED_AUTH_PASSWORD = "test123";
export const AUTH_EVENT_NAME = "lifewood-auth-changed";

export type AuthUser = {
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  school?: string;
  role?: string;
  avatarUrl?: string;
};

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthUser();
}

export function loginWithFixedAccount(email: string, password: string): boolean {
  if (typeof window === "undefined") return false;
  const normalizedEmail = email.trim().toLowerCase();
  const isMatch =
    normalizedEmail === FIXED_AUTH_EMAIL && password === FIXED_AUTH_PASSWORD;
  if (!isMatch) return false;

  const user: AuthUser = {
    email: FIXED_AUTH_EMAIL,
    name: "test1",
    firstName: "test",
    lastName: "1",
    phone: "+63 9XX XXX XXXX",
    school: "Select your school",
    role: "LIFEWOOD PH INTERN",
  };
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_EVENT_NAME));
  return true;
}

export function updateAuthUser(partial: Partial<AuthUser>): AuthUser | null {
  if (typeof window === "undefined") return null;
  const current = getAuthUser();
  if (!current) return null;
  const next: AuthUser = { ...current, ...partial };
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(AUTH_EVENT_NAME));
  return next;
}

export function logoutAuth(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}
