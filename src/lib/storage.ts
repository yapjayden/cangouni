// src/lib/storage.ts
// Browser persistence for CanGoUni. localStorage is the live cache (so all the
// existing synchronous reads stay fast and simple). When a user is signed in,
// writes are ALSO mirrored to Supabase, and on sign-in the cloud copy is pulled
// down into localStorage. Guests (not signed in) just use localStorage.

import type { UserProfile } from "@/types";
import { supabase } from "@/lib/supabase";

const PROFILE_KEY = "cgu_profile";
const BOOKMARKS_KEY = "cgu_bookmarks";

// Set by the auth layer once we know who is signed in (null = guest).
let cloudUserId: string | null = null;
export function setCloudUser(id: string | null) {
  cloudUserId = id;
}

// Fire-and-forget upsert of the whole row when signed in.
function pushToCloud() {
  if (!cloudUserId || !supabase) return;
  const profile = loadProfile();
  const bookmarks = loadBookmarks();
  void supabase
    .from("profiles")
    .upsert({ id: cloudUserId, profile, bookmarks, updated_at: new Date().toISOString() })
    .then(({ error }) => {
      if (error) console.error("Cloud sync failed:", error.message);
    });
}

export function saveProfile(p: UserProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable (private mode / quota) — fail quietly */
  }
  pushToCloud();
}

export function loadProfile(): UserProfile | null {
  try {
    // Fall back to (and migrate from) sessionStorage for older sessions.
    const raw = localStorage.getItem(PROFILE_KEY) ?? sessionStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as UserProfile;
    localStorage.setItem(PROFILE_KEY, raw);
    sessionStorage.removeItem(PROFILE_KEY);
    return p;
  } catch {
    return null;
  }
}

export function clearProfile() {
  try {
    localStorage.removeItem(PROFILE_KEY);
    sessionStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(BOOKMARKS_KEY);
  } catch {
    /* ignore */
  }
  pushToCloud();
}

export function loadBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveBookmarks(ids: string[]) {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
  pushToCloud();
}

/**
 * Pull the signed-in user's saved profile + bookmarks from Supabase into
 * localStorage. Called by the auth layer right after sign-in. Returns the
 * profile if one was found in the cloud.
 */
export async function pullFromCloud(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("profile, bookmarks")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("Cloud load failed:", error.message);
    return null;
  }
  if (!data) return null;
  try {
    if (data.profile) localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile));
    if (data.bookmarks) localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(data.bookmarks));
  } catch {
    /* ignore */
  }
  return (data.profile as UserProfile) ?? null;
}

/** Wipe the local cache (used on sign-out so the next guest starts clean). */
export function clearLocalCache() {
  try {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(BOOKMARKS_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Encode a profile into a URL-safe string for shareable links. The bulky raw
 * resume text is dropped — keywords are enough to reproduce the results.
 */
export function encodeProfile(p: UserProfile): string {
  const slim = { ...p, resumeText: "" };
  return btoa(encodeURIComponent(JSON.stringify(slim)));
}

export function decodeProfile(s: string): UserProfile | null {
  try {
    return JSON.parse(decodeURIComponent(atob(s))) as UserProfile;
  } catch {
    return null;
  }
}
