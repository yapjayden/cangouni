// src/lib/storage.ts
// Centralised browser persistence for CanGoUni. The profile is kept in
// localStorage so it survives closing the tab (it used to live in
// sessionStorage). Bookmarks (a course shortlist) live alongside it.

import type { UserProfile } from "@/types";

const PROFILE_KEY = "cgu_profile";
const BOOKMARKS_KEY = "cgu_bookmarks";

export function saveProfile(p: UserProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable (private mode / quota) — fail quietly */
  }
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
