// store.js — browser localStorage persistence for MealMitra.
// No backend, no login: the whole "database" (family, members, meals,
// preferences, history, settings) lives in localStorage so the app works
// instantly on any device.
//
// Data safety: the key is STABLE and never changes between app versions.
// Schema evolution is handled by additive migrations (see data.js migrate()),
// never by wiping. Older `mealmitra:vN` keys are adopted automatically, and a
// one-step backup of the previous blob is kept on every save.
(function () {
  const KEY = 'mealmitra';                 // canonical, never version-bumped
  const BACKUP_KEY = 'mealmitra:backup';   // rolling one-step safety copy
  const LEGACY_RE = /^mealmitra:v\d+$/;     // pre-stable keys (v1, v2, v3…)

  // Newest legacy versioned key, if any (so an upgrade never abandons data).
  function newestLegacy() {
    let best = null, bestN = -1;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && LEGACY_RE.test(k)) {
          const n = parseInt(k.slice('mealmitra:v'.length), 10) || 0;
          if (n > bestN) { bestN = n; best = k; }
        }
      }
    } catch (e) { /* ignore */ }
    return best;
  }

  // Read the saved snapshot (adopting legacy data if needed), or null.
  function load() {
    try {
      let raw = localStorage.getItem(KEY);
      if (raw == null) {
        const legacy = newestLegacy();
        if (legacy) {
          raw = localStorage.getItem(legacy);
          if (raw != null) localStorage.setItem(KEY, raw); // migrate into canonical key
        }
      }
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('MealMitra: could not read saved data —', e);
      return null;
    }
  }

  // Persist a snapshot, keeping the previous blob as a backup first.
  // Swallows quota / private-mode errors so the app keeps working.
  function save(snapshot) {
    try {
      const prev = localStorage.getItem(KEY);
      if (prev) localStorage.setItem(BACKUP_KEY, prev);
      localStorage.setItem(KEY, JSON.stringify(snapshot));
    } catch (e) {
      console.warn('MealMitra: could not save data —', e);
    }
  }

  // Explicit, user-confirmed wipe only (Settings → Reset family). Clears the
  // canonical key, the backup, and any leftover legacy keys.
  function reset() {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(BACKUP_KEY);
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && LEGACY_RE.test(k)) localStorage.removeItem(k);
      }
    } catch (e) { /* ignore */ }
  }

  window.Store = { KEY, load, save, reset };
})();
