// data.js — MealMitra seed data + suggestion engine (Indian household)
// Exposes window.MM (data + helpers). No framework dependencies.

// ── Family members ────────────────────────────────────────────
// Empty by default — a new family is created through onboarding, then
// persisted to localStorage. The meal catalog below stays predefined.
const MEMBERS = [];

// Colour palette offered when adding a member (shared by onboarding + editor).
const SWATCHES = ['#C4622D', '#3E5C3A', '#B07A2E', '#9C5A3C', '#5C7A54', '#A84E20', '#6B7F8C', '#8A6D3B'];

// Meals shown in the onboarding "who likes what" step — a representative
// spread across meal types. The rest default to "okay" and can be set later.
const ONBOARDING_MEALS = ['poha', 'upma', 'sandwich', 'maggi', 'bhel', 'samosa', 'dhokla', 'khichdi', 'pulao', 'rajma', 'bhindi', 'aloogobi'];

// ── Meal items ────────────────────────────────────────────────
const MEALS = [
  // Breakfast (complete)
  { id: 'poha',     name: 'Poha',         types: ['breakfast'], itemType: 'complete', effort: 'quick', tags: ['Veg','Light','Quick','Tiffin'], last: null, desc: 'Flattened rice with onions, peas & a squeeze of lemon.' },
  { id: 'upma',     name: 'Upma',         types: ['breakfast'], itemType: 'complete', effort: 'quick', tags: ['Veg','Light','Quick','Tiffin'], last: null, desc: 'Savoury semolina with veggies & curry leaves.' },
  { id: 'sandwich', name: 'Veg Sandwich', types: ['breakfast'], itemType: 'complete', effort: 'quick', tags: ['Veg','Quick','Kids','Tiffin'], last: null, desc: 'Grilled bread layered with veggies & green chutney.' },

  // Snacks (complete)
  { id: 'bhel',     name: 'Bhel Puri',    types: ['snacks'], itemType: 'complete', effort: 'quick',  tags: ['Veg','Light','Quick'], last: null, desc: 'Puffed rice tossed with chutneys & sev.' },
  { id: 'samosa',   name: 'Samosa',       types: ['snacks'], itemType: 'complete', effort: 'heavy',  tags: ['Veg','Heavy'], last: null, desc: 'Crisp pastry with spiced potato filling.' },
  { id: 'dhokla',   name: 'Dhokla',       types: ['snacks'], itemType: 'complete', effort: 'medium', tags: ['Veg','Light','Healthy'], last: null, desc: 'Steamed savoury cakes, soft and tangy.' },
  { id: 'maggi',    name: 'Masala Maggi', types: ['breakfast','snacks'], itemType: 'complete', effort: 'quick', tags: ['Kids','Quick'], last: null, desc: '2-minute noodles, the kids\u2019 favourite.' },

  // Lunch / Dinner — complete
  { id: 'khichdi',  name: 'Khichdi',      types: ['lunch','dinner'], itemType: 'complete', effort: 'quick',  tags: ['Veg','Light','Healthy','Quick'], last: null, desc: 'One-pot rice & lentils, comforting and light.' },
  { id: 'pulao',    name: 'Veg Pulao',    types: ['lunch','dinner'], itemType: 'complete', effort: 'medium', tags: ['Veg','Tiffin'], last: null, desc: 'Fragrant rice cooked with vegetables & whole spices.' },

  // Lunch / Dinner — main dishes
  { id: 'rajma',    name: 'Rajma',        types: ['lunch','dinner'], itemType: 'main', effort: 'medium', tags: ['Veg','Protein','Tiffin'], last: null,
    serveWith: [{ id: 'rice', score: 5 }, { id: 'roti', score: 2 }], sides: ['salad'], desc: 'Kidney beans in a rich tomato-onion gravy.' },
  { id: 'bhindi',   name: 'Bhindi Sabzi', types: ['lunch','dinner'], itemType: 'main', effort: 'medium', tags: ['Veg','Tiffin'], last: null,
    serveWith: [{ id: 'roti', score: 5 }, { id: 'rice', score: 2 }], sides: ['curd'], desc: 'Stir-fried okra with onions & spices.' },
  { id: 'aloogobi', name: 'Aloo Gobi',    types: ['lunch','dinner'], itemType: 'main', effort: 'quick', tags: ['Veg','Quick','Tiffin'], last: null,
    serveWith: [{ id: 'roti', score: 5 }, { id: 'rice', score: 2 }], sides: ['curd'], desc: 'Dry potato & cauliflower stir-fry.' },

  // Regular items — staples
  { id: 'rice',     name: 'Rice',         types: ['lunch','dinner'], itemType: 'staple', regular: true, defaultOn: true, effort: 'quick', tags: ['Veg'], last: null, desc: 'Steamed basmati rice.' },
  { id: 'roti',     name: 'Roti',         types: ['lunch','dinner'], itemType: 'staple', regular: true, defaultOn: true, effort: 'medium', tags: ['Veg'], last: null, desc: 'Soft whole-wheat flatbread.' },

  // Regular items — sides
  { id: 'salad',    name: 'Salad',        types: ['lunch','dinner'], itemType: 'side', regular: true, defaultOn: true, effort: 'quick', tags: ['Veg','Healthy'], last: null, desc: 'Onion, cucumber & tomato with lemon.' },
  { id: 'curd',     name: 'Curd',         types: ['lunch','dinner'], itemType: 'side', regular: true, defaultOn: false, effort: 'quick', tags: ['Veg'], last: null, desc: 'Fresh set yogurt.' },
];

// ── Preferences  meal -> member -> level (love|okay|avoid|cannot) ──
// Empty by default — filled during onboarding and via the preference grid.
// Any (meal, member) not listed here defaults to 'okay'.
const PREF_OVERRIDES = {};

// ── Scoring constants ─────────────────────────────────────────
const PREF_SCORE = { love: 3, okay: 1, avoid: -2, cannot: -999 };
const WEIGHT = { main: 1.0, staple: 0.5, side: 0.3 };

function recentPenalty(days) {
  if (days == null) return 1;
  if (days === 0) return -10;
  if (days <= 1) return -5;
  if (days <= 3) return -3;
  if (days <= 7) return -1;
  return 2;
}

const byId = id => MEALS.find(m => m.id === id);
const memberById = id => MEMBERS.find(m => m.id === id);
function prefOf(mealId, memberId) {
  const o = PREF_OVERRIDES[mealId];
  if (o && o[memberId]) return o[memberId];
  return 'okay';
}

function scoreComponent(mealId, presentIds) {
  const levels = {};
  let sum = 0, blocked = false;
  presentIds.forEach(mid => {
    const lvl = prefOf(mealId, mid);
    levels[mid] = lvl;
    if (lvl === 'cannot') blocked = true;
    else sum += PREF_SCORE[lvl];
  });
  return { score: sum, blocked, levels };
}

function pickStaple(main, presentIds) {
  if (!main.serveWith) return null;
  let best = null;
  main.serveWith.forEach(({ id, score }) => {
    const cs = scoreComponent(id, presentIds);
    if (cs.blocked) return;
    const total = cs.score * WEIGHT.staple + score;
    if (!best || total > best.total) best = { id, compat: score, ...cs, total };
  });
  return best;
}

function pickSides(main, presentIds) {
  if (!main.sides) return [];
  return main.sides
    .map(id => ({ id, ...scoreComponent(id, presentIds) }))
    .filter(s => !s.blocked);
}

function buildSuggestion(meal, presentIds, filters, tuning) {
  const prefMult = (tuning && tuning.pref) || 1;    // how much member likes/dislikes count
  const repeatMult = (tuning && tuning.repeat) || 1; // how hard to avoid recent meals
  const mainC = scoreComponent(meal.id, presentIds);
  if (mainC.blocked) return null;

  let score = mainC.score * WEIGHT.main * prefMult;
  let parts = [{ id: meal.id, name: meal.name, levels: mainC.levels, role: 'main' }];
  let allLevels = Object.values(mainC.levels);
  let staple = null, sides = [];

  if (meal.itemType === 'main') {
    staple = pickStaple(meal, presentIds);
    if (staple) {
      score += staple.score * WEIGHT.staple * prefMult + staple.compat;
      const s = byId(staple.id);
      parts.push({ id: s.id, name: s.name, levels: staple.levels, role: 'staple' });
      allLevels = allLevels.concat(Object.values(staple.levels));
    }
    sides = pickSides(meal, presentIds);
    sides.forEach(sd => {
      score += sd.score * WEIGHT.side * prefMult;
      const s = byId(sd.id);
      parts.push({ id: s.id, name: s.name, levels: sd.levels, role: 'side' });
      allLevels = allLevels.concat(Object.values(sd.levels));
    });
  }

  const penalty = recentPenalty(meal.last) * repeatMult;
  score += penalty;

  let filterBonus = 0;
  if (filters.effort && meal.effort === filters.effort) filterBonus += 2;
  (filters.tags || []).forEach(t => { if (meal.tags.includes(t)) filterBonus += 1; });
  score += filterBonus;

  if (filters.tags && filters.tags.includes('Veg') && meal.tags.includes('Non-veg')) return null;
  if (filters.effort && meal.effort !== filters.effort && filters.effortStrict) return null;

  const noConflict = !allLevels.some(l => l === 'avoid' || l === 'cannot');
  if (filters.noConflictOnly && !noConflict) return null;
  if (noConflict) score += 2;

  const likeCount = Object.values(mainC.levels).filter(l => l === 'love').length;
  const okPlus = Object.values(mainC.levels).filter(l => l === 'love' || l === 'okay').length;

  return {
    id: meal.id, meal,
    displayName: parts.map(p => p.name).join(' + '),
    parts, main: parts[0],
    staple: staple ? byId(staple.id) : null,
    sides: sides.map(s => byId(s.id)),
    score: Math.round(score * 10) / 10,
    baseScore: mainC.score, penalty, filterBonus, noConflict,
    likeCount, okPlus, present: presentIds.length,
    effort: meal.effort, tags: meal.tags, last: meal.last, levels: mainC.levels,
  };
}

function reasonFor(s) {
  const bits = [];
  if (s.likeCount === s.present && s.present > 1) bits.push(`All ${s.present} love it`);
  else if (s.likeCount > 0) bits.push(`${s.likeCount} of ${s.present} love it`);
  else if (s.okPlus === s.present) bits.push(`Everyone\u2019s okay with it`);

  if (s.noConflict) bits.push('no one objects');

  if (s.last == null) bits.push('never cooked');
  else if (s.last >= 8) bits.push(`not cooked in ${s.last} days`);
  else if (s.last <= 1) bits.push(`cooked ${s.last === 0 ? 'today' : 'yesterday'}`);

  if (s.effort === 'quick') bits.push('quick to make');
  return bits.slice(0, 3).map((b, i) => i === 0 ? b.charAt(0).toUpperCase() + b.slice(1) : b).join(' \u00b7 ') + '.';
}

function suggest({ mealType, presentIds, filters = {}, limit = 5, tuning }) {
  if (!presentIds || !presentIds.length) return [];
  const single = mealType === 'breakfast' || mealType === 'snacks';
  const candidates = MEALS.filter(m =>
    m.types.includes(mealType) && !m.regular &&
    (single ? m.itemType === 'complete' : (m.itemType === 'main' || m.itemType === 'complete'))
  );
  const out = candidates
    .map(m => buildSuggestion(m, presentIds, filters, tuning))
    .filter(Boolean)
    .sort((a, b) =>
      b.score - a.score ||
      (b.last ?? 99) - (a.last ?? 99) ||
      a.displayName.localeCompare(b.displayName)
    );
  out.forEach((s, i) => { s.rank = i + 1; s.reason = reasonFor(s); });
  return out.slice(0, limit);
}

// Empty by default — fills up as the family marks meals cooked.
const HISTORY = [];

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', hint: 'Morning', icon: 'sunrise' },
  { id: 'lunch',     label: 'Lunch',     hint: 'Midday',  icon: 'sun' },
  { id: 'snacks',    label: 'Snacks',    hint: 'Evening', icon: 'cup' },
  { id: 'dinner',    label: 'Dinner',    hint: 'Night',   icon: 'moon' },
];

const FILTERS = [
  { id: 'quick',     label: 'Quick',        kind: 'effort', value: 'quick' },
  { id: 'tiffin',    label: 'Tiffin',       kind: 'tag',    value: 'Tiffin' },
  { id: 'healthy',   label: 'Healthy',      kind: 'tag',    value: 'Healthy' },
  { id: 'light',     label: 'Light',        kind: 'tag',    value: 'Light' },
  { id: 'kids',      label: 'Kids-friendly',kind: 'tag',    value: 'Kids' },
  { id: 'veg',       label: 'Veg only',     kind: 'tag',    value: 'Veg' },
  { id: 'noconflict',label: 'No-conflict',  kind: 'special',value: 'noConflictOnly' },
];

// ── Suggestion tuning (Settings → controls the engine) ────────
// `mult` scales the relevant score contribution. Default values keep the
// classic behaviour (1.0). Stored per-family and persisted to localStorage.
const TUNING = {
  repeatAvoidance: {
    relaxed:  { label: 'Relaxed',  hint: 'Repeats are totally fine',    mult: 0.4 },
    balanced: { label: 'Balanced', hint: 'A little variety, not strict', mult: 1.0 },
    strict:   { label: 'Strict',   hint: 'Strongly avoid recent meals',  mult: 1.8 },
  },
  prefWeighting: {
    gentle:  { label: 'Gentle',  hint: 'Loosely follow likes & dislikes',  mult: 0.6 },
    default: { label: 'Default', hint: 'Balance everyone fairly',          mult: 1.0 },
    strong:  { label: 'Strong',  hint: 'Strongly favour what people love',  mult: 1.6 },
  },
};
const DEFAULT_SETTINGS = { repeatAvoidance: 'balanced', prefWeighting: 'default' };

const PREF_META = {
  love:   { label: 'Loves it',   short: 'Loves',  color: '#3E7C4F', score: '+3' },
  okay:   { label: 'Okay',       short: 'Okay',   color: '#C99A3A', score: '+1' },
  avoid:  { label: 'Avoids',     short: 'Avoids', color: '#C0563C', score: '\u22122' },
  cannot: { label: 'Cannot eat', short: 'Can\u2019t', color: '#8E2C1C', score: 'block' },
};

// Pristine snapshot of the shipped meal catalog, taken before any persistence
// or app mutation. Used to (a) ship newly-added predefined dishes to existing
// families on upgrade, and (b) detect which predefined dishes a family deleted.
const CATALOG = JSON.parse(JSON.stringify(MEALS));

// Bump only when the SHAPE of stored data changes. Migrations are additive —
// they fill in new fields, never drop existing data — so a schema change (even
// an accidental one) upgrades old data instead of wiping it.
const CURRENT_SCHEMA = 3;
function migrate(data) {
  if (!data || typeof data !== 'object') return data;
  // v<2: no familyName/onboarded → treated as not-onboarded (handled below).
  // v<3: no settings → defaults applied at read time.
  if (data.settings == null) data.settings = {};
  // (future, version-gated migrations go here — always additive)
  data.schemaVersion = CURRENT_SCHEMA;
  return data;
}

window.MM = {
  MEMBERS, MEALS, MEAL_TYPES, FILTERS, HISTORY, PREF_META, PREF_OVERRIDES,
  SWATCHES, ONBOARDING_MEALS, TUNING, DEFAULT_SETTINGS, CATALOG, CURRENT_SCHEMA,
  suggest, reasonFor, prefOf, memberById, byId, buildSuggestion, scoreComponent,
  boot: { familyName: '', onboarded: false, settings: DEFAULT_SETTINGS },
};

// ── Persistence: hydrate from localStorage, or seed it on first run ───
// MEMBERS / MEALS / HISTORY / PREF_OVERRIDES are the live data the rest of
// the app reads. We mutate them in place (not reassign) so every existing
// reference — window.MM.* and the closures in suggest()/prefOf() — stays valid.
(function hydrate() {
  if (!window.Store) return;

  const replaceArray = (arr, next) => {
    if (!Array.isArray(next)) return;
    arr.length = 0;
    next.forEach(item => arr.push(item));
  };
  const replaceObject = (obj, next) => {
    if (!next || typeof next !== 'object') return;
    Object.keys(obj).forEach(k => delete obj[k]);
    Object.assign(obj, next);
  };

  const saved = migrate(window.Store.load());
  if (saved && saved.onboarded) {
    // Returning family: restore their saved data. Guards below mean a missing
    // or malformed field falls back to a safe default instead of wiping.
    replaceArray(MEMBERS, saved.members || []);
    replaceArray(HISTORY, saved.history || []);
    replaceObject(PREF_OVERRIDES, saved.prefs || {});

    // Meals = the family's saved meals, PLUS any predefined dishes shipped
    // since they last saved (and not deliberately deleted). This lets new
    // catalog dishes reach existing families without touching their data.
    const savedMeals = (Array.isArray(saved.meals) && saved.meals.length) ? saved.meals.slice() : CATALOG.slice();
    const have = new Set(savedMeals.map(m => m.id));
    const deleted = new Set(saved.deletedMealIds || []);
    CATALOG.forEach(c => { if (!have.has(c.id) && !deleted.has(c.id)) savedMeals.push(JSON.parse(JSON.stringify(c))); });
    replaceArray(MEALS, savedMeals);

    window.MM.boot = {
      familyName: saved.familyName || '',
      onboarded: true,
      settings: Object.assign({}, DEFAULT_SETTINGS, saved.settings),
    };
  } else {
    // First visit (or setup never finished): keep the predefined meals,
    // leave the family empty, and let onboarding take over. Nothing is
    // written to storage until setup is completed.
    window.MM.boot = { familyName: '', onboarded: false, settings: DEFAULT_SETTINGS };
  }
})();
