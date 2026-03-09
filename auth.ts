import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export const AUTH_STORAGE_KEY = "lifewood_auth_user";
export const AUTH_EVENT_NAME = "lifewood-auth-changed";
export const SUPER_ADMIN_EMAIL = "admin@gmail.com";
const AUTH_PENDING_PROFILE_SYNC_KEY = "lifewood_pending_profile_sync";
const SUPER_ADMIN_PASSWORD = "admin123";
const SUPER_ADMIN_NAME = "Super Admin";

export type AuthUser = {
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  school?: string;
  role?: AuthRole;
  avatarUrl?: string;
};

export type AuthRole = "USER" | "ADMIN" | "SUPER ADMIN";

type AuthResult = {
  success: boolean;
  error?: string;
  message?: string;
};

type UserProfileRow = {
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  school?: string | null;
  avatar_url?: string | null;
  role?: string | null;
};

let hasRegisteredAuthListener = false;
let hasRegisteredNetworkListener = false;

function getSignUpEmailRedirectTo(): string {
  const configured = (import.meta.env.VITE_SUPABASE_EMAIL_REDIRECT_TO || "").trim();
  if (configured) return configured;
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/login`;
  }
  return "http://localhost:5173/login";
}

function notifyAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

function readStoredAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeStoredAuthUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }
}

function fallbackNameFromEmail(email: string) {
  return email.split("@")[0] || "User";
}

function isInlineDataUrl(value?: string): boolean {
  return typeof value === "string" && value.startsWith("data:");
}

function isNetworkFetchError(message?: string): boolean {
  const value = (message || "").trim().toLowerCase();
  return (
    value.includes("failed to fetch") ||
    value.includes("networkerror") ||
    value.includes("network request failed") ||
    value.includes("err_connection_reset")
  );
}

function readPendingProfileSyncPayload():
  | { email?: string; data?: Record<string, string> }
  | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_PENDING_PROFILE_SYNC_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { email?: string; data?: Record<string, string> };
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writePendingProfileSyncPayload(payload: { email?: string; data?: Record<string, string> }) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_PENDING_PROFILE_SYNC_KEY, JSON.stringify(payload));
}

function clearPendingProfileSyncPayload() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_PENDING_PROFILE_SYNC_KEY);
}

function applyPendingProfilePayload(
  user: AuthUser,
  payload: { email?: string; data?: Record<string, string> }
): AuthUser {
  const metadata = payload.data || {};
  const nextEmail = (payload.email || user.email || "").trim().toLowerCase() || user.email;
  const nextFirstName =
    typeof metadata.firstName === "string" ? metadata.firstName : user.firstName || "";
  const nextLastName =
    typeof metadata.lastName === "string" ? metadata.lastName : user.lastName || "";
  const nextDisplayName =
    typeof metadata.name === "string" && metadata.name.trim()
      ? metadata.name.trim()
      : [nextFirstName, nextLastName].filter(Boolean).join(" ").trim() || user.name;
  const nextRole =
    typeof metadata.role === "string" ? normalizeRole(metadata.role) : normalizeRole(user.role);

  return {
    ...user,
    email: nextEmail,
    firstName: nextFirstName || undefined,
    lastName: nextLastName || undefined,
    name: nextDisplayName,
    phone: typeof metadata.phone === "string" ? metadata.phone : user.phone,
    school: typeof metadata.school === "string" ? metadata.school : user.school,
    role: nextRole,
    avatarUrl:
      typeof metadata.avatarUrl === "string" && metadata.avatarUrl.trim()
        ? metadata.avatarUrl
        : user.avatarUrl,
  };
}

function normalizeRole(role?: string): AuthRole {
  const value = (role || "").trim().toLowerCase();
  if (value.includes("super") && value.includes("admin")) return "SUPER ADMIN";
  if (value === "admin") return "ADMIN";
  return "USER";
}

function isSuperAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL;
}

function getFixedSuperAdminUser(previous?: AuthUser | null): AuthUser {
  return {
    email: SUPER_ADMIN_EMAIL,
    name: SUPER_ADMIN_NAME,
    firstName: "Super",
    lastName: "Admin",
    phone: previous?.phone || "+63 XXX XXX XXXX",
    school: previous?.school || "System",
    role: "SUPER ADMIN",
    avatarUrl: previous?.avatarUrl,
  };
}

function persistFixedSuperAdmin() {
  const current = readStoredAuthUser();
  const user = getFixedSuperAdminUser(current);
  writeStoredAuthUser(user);
  notifyAuthChanged();
  return user;
}

export function isSuperAdmin(user?: AuthUser | null): boolean {
  if (!user) return false;
  return isSuperAdminEmail(user.email) || normalizeRole(user.role) === "SUPER ADMIN";
}

export function hasAdminAccess(user?: AuthUser | null): boolean {
  if (!user) return false;
  const role = normalizeRole(user.role);
  return role === "ADMIN" || role === "SUPER ADMIN";
}

function mapSupabaseUserToAuthUser(user: User, previous?: AuthUser | null): AuthUser {
  const metadata = user.user_metadata || {};
  const email = (user.email || previous?.email || "").trim().toLowerCase();
  if (isSuperAdminEmail(email)) {
    return getFixedSuperAdminUser(previous);
  }
  const firstName =
    typeof metadata.firstName === "string"
      ? metadata.firstName
      : previous?.firstName || "";
  const lastName =
    typeof metadata.lastName === "string" ? metadata.lastName : previous?.lastName || "";
  const composedName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const fallbackName =
    typeof metadata.name === "string" && metadata.name.trim()
      ? metadata.name.trim()
      : previous?.name || fallbackNameFromEmail(email);

  const metadataAvatar =
    typeof metadata.avatarUrl === "string" ? metadata.avatarUrl.trim() : "";
  const previousAvatar = previous?.avatarUrl?.trim() || "";
  const resolvedAvatar =
    isInlineDataUrl(previousAvatar) && metadataAvatar && !isInlineDataUrl(metadataAvatar)
      ? previousAvatar
      : metadataAvatar || previousAvatar;

  return {
    email,
    name: composedName || fallbackName,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    phone:
      typeof metadata.phone === "string"
        ? metadata.phone
        : previous?.phone || "+63 XXX XXX XXXX",
    school:
      typeof metadata.school === "string"
        ? metadata.school
        : previous?.school || "Select your school",
    role:
      typeof metadata.role === "string"
        ? normalizeRole(metadata.role)
        : normalizeRole(previous?.role),
    avatarUrl: resolvedAvatar || undefined,
  };
}

async function upsertUserRow(user: User, authUser?: AuthUser | null): Promise<void> {
  const source = authUser || mapSupabaseUserToAuthUser(user);
  const payload = {
    id: user.id,
    email: source.email.trim().toLowerCase(),
    full_name: source.name || fallbackNameFromEmail(source.email),
    first_name: source.firstName || null,
    last_name: source.lastName || null,
    phone: source.phone || null,
    school: source.school || null,
    avatar_url: source.avatarUrl || null,
    role: normalizeRole(source.role),
    status: "Active",
    last_seen: new Date().toISOString(),
  };

  const { error } = await supabase.from("users").upsert(payload, { onConflict: "id" });
  if (error) {
    console.warn("Failed to sync user row to Supabase:", error.message);
  }
}

function mergeUserRowIntoAuthUser(current: AuthUser, row: UserProfileRow): AuthUser {
  const firstName = row.first_name?.trim() || current.firstName || "";
  const lastName = row.last_name?.trim() || current.lastName || "";
  const fallbackName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const rowAvatar = row.avatar_url?.trim() || "";
  const currentAvatar = current.avatarUrl?.trim() || "";
  const keepCurrentAvatar =
    !rowAvatar ||
    (currentAvatar && isInlineDataUrl(currentAvatar) && rowAvatar !== currentAvatar);
  return {
    ...current,
    name: row.full_name?.trim() || fallbackName || current.name,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    phone: row.phone?.trim() || current.phone,
    school: row.school?.trim() || current.school,
    avatarUrl: keepCurrentAvatar ? currentAvatar || undefined : rowAvatar,
    role: row.role ? normalizeRole(row.role) : current.role,
  };
}

async function hydrateCurrentUserFromUsersTable(user: User, baseUser?: AuthUser | null): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("full_name, first_name, last_name, phone, school, avatar_url, role")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data) return;

    const current = baseUser || readStoredAuthUser();
    if (!current) return;
    const merged = mergeUserRowIntoAuthUser(current, data as UserProfileRow);
    writeStoredAuthUser(merged);
    notifyAuthChanged();
  } catch {
    // Ignore hydration failures; local/auth data remains usable.
  }
}

async function syncCurrentUserRowFromLocal(): Promise<void> {
  if (typeof window === "undefined") return;
  const local = readStoredAuthUser();
  if (!local) return;

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) return;
    await upsertUserRow(data.session.user, local);
  } catch {
    // Ignore transient network failures; sync will retry on next auth or online event.
  }
}

function persistSupabaseUser(user: User | null): AuthUser | null {
  if (typeof window === "undefined") return null;
  if (!user) {
    writeStoredAuthUser(null);
    notifyAuthChanged();
    return null;
  }

  const current = readStoredAuthUser();
  const normalized = mapSupabaseUserToAuthUser(user, current);
  const pending = readPendingProfileSyncPayload();
  const merged = pending ? applyPendingProfilePayload(normalized, pending) : normalized;
  writeStoredAuthUser(merged);
  notifyAuthChanged();
  void upsertUserRow(user, merged);
  void hydrateCurrentUserFromUsersTable(user, merged);
  return merged;
}

async function flushPendingProfileSync(): Promise<void> {
  if (typeof window === "undefined") return;
  const pending = readPendingProfileSyncPayload();
  if (!pending || Object.keys(pending).length === 0) return;

  const { data, error } = await supabase.auth.updateUser(pending);
  if (error) {
    if (!isNetworkFetchError(error.message)) {
      console.warn("Failed to flush pending profile sync:", error.message);
    }
    return;
  }

  clearPendingProfileSyncPayload();
  if (!data.user) return;

  const normalized = persistSupabaseUser(data.user);
  await upsertUserRow(data.user, normalized);
  await syncCurrentUserRowFromLocal();
}

export function ensureAuthSubscription(): void {
  if (typeof window === "undefined" || hasRegisteredAuthListener) return;
  hasRegisteredAuthListener = true;
  supabase.auth.onAuthStateChange((_event, session) => {
    persistSupabaseUser(session?.user ?? null);
    void flushPendingProfileSync();
    void syncCurrentUserRowFromLocal();
  });

  if (!hasRegisteredNetworkListener) {
    hasRegisteredNetworkListener = true;
    window.addEventListener("online", () => {
      void flushPendingProfileSync();
      void syncCurrentUserRowFromLocal();
    });
  }
}

export async function initializeAuth(): Promise<AuthUser | null> {
  if (typeof window === "undefined") return null;
  ensureAuthSubscription();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Failed to get Supabase session:", error.message);
    return null;
  }
  const user = persistSupabaseUser(data.session?.user ?? null);
  void flushPendingProfileSync();
  void syncCurrentUserRowFromLocal();
  return user;
}

export function getAuthUser(): AuthUser | null {
  return readStoredAuthUser();
}

export function isAuthenticated(): boolean {
  return !!getAuthUser();
}

export async function loginWithPassword(
  email: string,
  password: string
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (isSuperAdminEmail(normalizedEmail)) {
    if (password !== SUPER_ADMIN_PASSWORD) {
      return { success: false, error: "Invalid super admin credentials." };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (error || !data.user) {
      return {
        success: false,
        error:
          "Super admin must exist in Supabase Authentication. Create/sign in that account first.",
      };
    }
    persistSupabaseUser(data.user);
    return { success: true };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes("database error saving new user")) {
      return {
        success: false,
        error:
          "Signup failed due to database trigger setup. Re-run `supabase/users_setup.sql` in Supabase SQL Editor, then try again.",
      };
    }
    return { success: false, error: error.message };
  }

  persistSupabaseUser(data.user ?? null);
  return { success: true };
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export async function signUpWithPassword(
  fullName: string,
  email: string,
  password: string
): Promise<AuthResult> {
  const normalizedName = fullName.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedName || !normalizedEmail || !password) {
    return { success: false, error: "Please fill in full name, email, and password." };
  }
  if (isSuperAdminEmail(normalizedEmail)) {
    return { success: false, error: "This email is reserved for the system super admin." };
  }

  const { firstName, lastName } = splitFullName(normalizedName);
  const emailRedirectTo = getSignUpEmailRedirectTo();
  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo,
      data: {
        name: normalizedName,
        firstName,
        lastName,
        role: "USER",
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }
  if (!data.user) {
    return {
      success: false,
      error: "Signup could not be completed. Please try again.",
    };
  }

  persistSupabaseUser(data.session?.user ?? null);
  if (!data.session) {
    const looksLikeExistingUser =
      Array.isArray(data.user.identities) && data.user.identities.length === 0;
    if (looksLikeExistingUser) {
      return {
        success: true,
        message:
          "This email may already be registered. Please try Sign in.",
      };
    }
    return {
      success: true,
      message:
        "Account created. Verification email sent. Check inbox/spam and use the link to activate your account.",
    };
  }

  return {
    success: true,
    message:
      "Account created and signed in. If you expected email verification, enable Confirm Email in Supabase Auth settings.",
  };
}

export async function updateAuthUser(partial: Partial<AuthUser>): Promise<AuthUser | null> {
  if (typeof window === "undefined") return null;
  const current = getAuthUser();
  if (!current) return null;
  if (isSuperAdmin(current)) return current;

  const next: AuthUser = {
    ...current,
    ...partial,
    role: normalizeRole(current.role),
  };
  const metadata: Record<string, string> = {};
  if (next.name) metadata.name = next.name;
  if (next.firstName) metadata.firstName = next.firstName;
  if (next.lastName) metadata.lastName = next.lastName;
  if (next.phone) metadata.phone = next.phone;
  if (next.school) metadata.school = next.school;
  if (next.role) metadata.role = normalizeRole(next.role);
  // Avoid sending base64 image blobs to auth metadata; this often causes network/request failures.
  if (next.avatarUrl && !isInlineDataUrl(next.avatarUrl)) metadata.avatarUrl = next.avatarUrl;

  const payload: { email?: string; data?: Record<string, string> } = {};
  if (next.email && next.email !== current.email) payload.email = next.email;
  if (Object.keys(metadata).length > 0) payload.data = metadata;

  if (Object.keys(payload).length > 0) {
    const { data, error } = await supabase.auth.updateUser(payload);
    if (error) {
      console.warn("Failed to sync profile to Supabase:", error.message);
      if (isNetworkFetchError(error.message)) {
        writeStoredAuthUser(next);
        notifyAuthChanged();
        writePendingProfileSyncPayload(payload);
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session?.user) {
            await upsertUserRow(sessionData.session.user, next);
          }
        } catch {
          // Ignore while offline; pending sync will retry.
        }
        return next;
      }
      throw new Error(error.message);
    }

    if (data.user) {
      const normalized = mapSupabaseUserToAuthUser(data.user, next);
      writeStoredAuthUser(normalized);
      notifyAuthChanged();
      await upsertUserRow(data.user, normalized);
      return normalized;
    }
  }

  writeStoredAuthUser(next);
  notifyAuthChanged();

  // Best effort sync to public.users even when auth metadata/email did not change.
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) {
      await upsertUserRow(data.user, next);
    }
  } catch {
    // Ignore background sync failures; local profile state is already updated.
  }

  return next;
}

function clearSupabaseAuthArtifacts() {
  if (typeof window === "undefined") return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    if (key.startsWith("sb-") && (key.includes("auth-token") || key.includes("code-verifier"))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
}

export async function logoutAuth(): Promise<void> {
  if (typeof window === "undefined") return;
  writeStoredAuthUser(null);
  notifyAuthChanged();
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch (error) {
    console.warn("Failed to complete local sign out cleanly:", error);
  } finally {
    clearSupabaseAuthArtifacts();
    writeStoredAuthUser(null);
    notifyAuthChanged();
  }
}
