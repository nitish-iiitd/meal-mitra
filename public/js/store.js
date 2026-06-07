// store.js — browser localStorage persistence for MealMitra.
// No backend, no login: the whole "database" (members, meals, preferences,
// history) lives in localStorage so the app works instantly on any device.
(function () {
  const KEY = 'mealmitra:v3';

  // Read the saved snapshot, or null on first run / unreadable storage.
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('MealMitra: could not read saved data —', e);
      return null;
    }
  }

  // Persist a snapshot. Swallows quota / private-mode errors so the app
  // keeps working (just without saving) instead of throwing mid-interaction.
  function save(snapshot) {
    try {
      localStorage.setItem(KEY, JSON.stringify(snapshot));
    } catch (e) {
      console.warn('MealMitra: could not save data —', e);
    }
  }

  // Wipe saved data (next reload re-seeds from data.js defaults).
  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  window.Store = { KEY, load, save, reset };
})();
