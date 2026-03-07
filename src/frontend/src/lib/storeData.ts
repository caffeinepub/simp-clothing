// ─── Store Data Sync Utility ──────────────────────────────────────────────────
// Provides export/import of all admin-editable store data via base64-encoded JSON.
// This enables cross-device sync when the admin copies a "sync code" from one
// device and pastes it on another.

const LS_KEYS = [
  "jade_products",
  "jade_reviews",
  "jade_orders",
  "jade_faq",
  "jade_hero",
  "jade_about",
  "jade_categories",
  "jade_payment_settings",
] as const;

type StoreSnapshot = Partial<Record<string, unknown>>;

/**
 * Reads all store data from localStorage and returns a base64-encoded JSON string.
 */
export function exportStoreData(): string {
  const snapshot: StoreSnapshot = {};
  for (const key of LS_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        snapshot[key] = JSON.parse(raw);
      } catch {
        snapshot[key] = raw;
      }
    }
  }
  const json = JSON.stringify(snapshot);
  return btoa(unescape(encodeURIComponent(json)));
}

/**
 * Returns a human-readable JSON string of all store data (for debugging).
 */
export function getStoreDataJson(): string {
  const snapshot: StoreSnapshot = {};
  for (const key of LS_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        snapshot[key] = JSON.parse(raw);
      } catch {
        snapshot[key] = raw;
      }
    }
  }
  return JSON.stringify(snapshot, null, 2);
}

/**
 * Decodes the base64 sync code and writes all keys back to localStorage.
 * Returns `true` on success, `false` on error.
 */
export function importStoreData(code: string): boolean {
  try {
    const trimmed = code.trim();
    if (!trimmed) return false;
    const json = decodeURIComponent(escape(atob(trimmed)));
    const snapshot = JSON.parse(json) as StoreSnapshot;
    for (const key of LS_KEYS) {
      if (Object.prototype.hasOwnProperty.call(snapshot, key)) {
        localStorage.setItem(key, JSON.stringify(snapshot[key]));
      }
    }
    return true;
  } catch {
    return false;
  }
}
