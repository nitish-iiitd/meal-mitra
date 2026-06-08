// screens.js — screen renderers. Each returns an HTML string.
// Reads global window.State; emits data-* hooks handled by app.js.

(function () {
  const { icon, esc, avatar, tag, tagTone, effort, prefAvatars, placeholder, prefDot } = window.UI;
  const MM = window.MM;
  const typeLabel = id => (MM.MEAL_TYPES.find(t => t.id === id) || {}).label || '';

  // ── ONBOARDING (first-run setup wizard) ─────────────────────
  function onboarding() {
    const ob = window.State.onboard;
    const brand = '<div class="mm-ob-brand">' +
      '<div class="mm-brand-mark">' + icon('meals', { size: 22, stroke: 2, color: '#FFF8EE' }) + '</div>' +
      '<div><div class="mm-brand-name" style="font-size:20px">MealMitra</div>' +
      '<div class="mm-brand-sub">FAMILY KITCHEN</div></div></div>';
    const steps = '<div class="mm-ob-steps">' + [1, 2, 3].map(n =>
      '<span class="mm-ob-dot' + (ob.step >= n ? ' on' : '') + '"></span>').join('') + '</div>';
    const step = ob.step === 1 ? obName(ob) : ob.step === 2 ? obMembers(ob) : obPrefs(ob);
    return '<div class="mm-ob mm-fade"><div class="mm-ob-card">' + brand + steps + step + '</div></div>';
  }

  function obName(ob) {
    return '<div class="mm-eyebrow">Step 1 of 3</div>' +
      '<h1 class="mm-h1" style="margin:8px 0 6px">What’s your family called?</h1>' +
      '<div class="mm-screen-sub" style="margin-bottom:22px">We’ll show this across your kitchen.</div>' +
      '<input class="mm-input" data-ob-name placeholder="e.g. Srivastava" value="' + esc(ob.familyName) + '" style="font-family:var(--display);font-weight:600;font-size:19px">' +
      '<button class="mm-btn mm-btn-primary lg full" data-ob-next="1" style="margin-top:24px">Continue' + icon('right', { size: 20, stroke: 2.4, color: '#FFF8EE' }) + '</button>';
  }

  function obMembers(ob) {
    const swatches = MM.SWATCHES.map(c =>
      '<button class="mm-swatch' + (ob.draft.color === c ? ' on' : '') + '" data-ob-color="' + c + '" style="background:' + c + '"></button>').join('');
    const list = ob.members.length ? ob.members.map(m =>
      '<div class="mm-card" style="display:flex;align-items:center;gap:12px;padding:12px">' +
        avatar(m, { size: 42 }) +
        '<div style="flex:1;min-width:0"><div style="font-family:var(--display);font-weight:600;font-size:15.5px;color:var(--ink)">' + esc(m.name) + '</div>' +
        (m.role ? '<div style="font-size:12.5px;color:var(--ink-soft)">' + esc(m.role) + '</div>' : '') + '</div>' +
        '<button class="mm-icon-btn" data-ob-del="' + m.id + '" title="Remove">' + icon('trash', { size: 18, stroke: 2, color: '#8E2C1C' }) + '</button>' +
      '</div>').join('')
      : '<div style="text-align:center;color:var(--ink-soft);font-size:13.5px;padding:8px">No members yet — add your first above.</div>';
    return '<div class="mm-eyebrow">Step 2 of 3</div>' +
      '<h1 class="mm-h1" style="margin:8px 0 6px">Who’s in the family?</h1>' +
      '<div class="mm-screen-sub" style="margin-bottom:18px">Add everyone who eats at home.</div>' +
      '<div class="mm-card" style="padding:14px;margin-bottom:16px">' +
        '<div style="display:flex;justify-content:center;margin-bottom:14px">' + avatar({ name: ob.draft.name || '?', color: ob.draft.color }, { size: 64 }) + '</div>' +
        '<input class="mm-input" data-ob-draft="name" placeholder="Name" value="' + esc(ob.draft.name) + '">' +
        '<input class="mm-input" data-ob-draft="role" placeholder="Role, e.g. Mom, Son, Guest" value="' + esc(ob.draft.role) + '" style="margin-top:10px">' +
        '<div class="mm-field-label">Pick a colour</div><div style="display:flex;gap:10px;flex-wrap:wrap">' + swatches + '</div>' +
        '<button class="mm-btn mm-btn-soft full" data-ob-add="1" style="margin-top:16px">' + icon('plus', { size: 18, stroke: 2.2 }) + 'Add member</button>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:10px">' + list + '</div>' +
      '<div style="display:flex;gap:10px;margin-top:18px">' +
        '<button class="mm-btn mm-btn-ghost" data-ob-back="1" style="flex:1">Back</button>' +
        '<button class="mm-btn mm-btn-primary" data-ob-next="2" style="flex:2">Continue' + icon('right', { size: 20, stroke: 2.4, color: '#FFF8EE' }) + '</button>' +
      '</div>';
  }

  function obPrefs(ob) {
    const members = ob.members;
    const meals = MM.ONBOARDING_MEALS.map(id => MM.byId(id)).filter(Boolean);
    const head = '<tr><th class="dish">Dish</th>' + members.map(m =>
      '<th><div style="display:flex;flex-direction:column;align-items:center;gap:4px">' + avatar(m, { size: 28 }) +
      '<span style="font-size:10.5px;font-weight:700;color:var(--ink-soft)">' + esc(m.name) + '</span></div></th>').join('') + '</tr>';
    const body = meals.map(meal =>
      '<tr><td class="dish">' + esc(meal.name) + '</td>' + members.map(m => {
        const lvl = (ob.prefs[meal.id] && ob.prefs[meal.id][m.id]) || 'okay';
        const col = MM.PREF_META[lvl].color;
        return '<td style="text-align:center"><span class="mm-grid-cell" data-ob-cell="' + meal.id + ':' + m.id + '" style="background:' + col + '1c">' + prefDot(lvl, 15) + '</span></td>';
      }).join('') + '</tr>').join('');
    return '<div class="mm-eyebrow">Step 3 of 3</div>' +
      '<h1 class="mm-h1" style="margin:8px 0 6px">Who likes what?</h1>' +
      '<div class="mm-screen-sub" style="margin-bottom:6px">Tap a cell to cycle: <b style="color:var(--love)">Loves</b> → <b style="color:#C99A3A">Okay</b> → <b style="color:#C0563C">Avoids</b> → <b style="color:#8E2C1C">Can’t</b>. Refine the rest later.</div>' +
      '<div class="mm-grid-wrap" style="margin-top:14px"><table class="mm-grid"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' +
      '<div style="display:flex;gap:10px;margin-top:18px">' +
        '<button class="mm-btn mm-btn-ghost" data-ob-back="2" style="flex:1">Back</button>' +
        '<button class="mm-btn mm-btn-primary" data-ob-finish="1" style="flex:2">' + icon('check', { size: 20, stroke: 2.2 }) + 'Finish setup</button>' +
      '</div>';
  }

  // ── Reusable: meal-type grid ────────────────────────────────
  function mealTypeGrid(value) {
    return '<div class="mm-mealtypes">' + MM.MEAL_TYPES.map(t => {
      const on = value === t.id;
      return '<button class="mm-mealtype' + (on ? ' on' : '') + '" data-mealtype="' + t.id + '">' +
        icon(t.icon, { size: 26, stroke: 2, color: on ? '#FFF8EE' : 'var(--terra)' }) +
        '<div class="mm-mealtype-label">' + t.label + '</div>' +
        '<div class="mm-mealtype-hint">' + t.hint + '</div>' +
      '</button>';
    }).join('') + '</div>';
  }

  // ── Reusable: member strip ──────────────────────────────────
  function memberStrip(active, present) {
    const allOn = active.every(m => present.includes(m.id));
    const picks = active.map(m => {
      const on = present.includes(m.id);
      const badge = on ? '<span class="mm-member-badge">' + icon('check', { size: 11, stroke: 3, color: '#FFF8EE' }) + '</span>' : '';
      return '<button class="mm-member-pick' + (on ? ' on' : '') + '" data-member="' + m.id + '">' +
        '<span style="position:relative;display:inline-flex">' + avatar(m, { size: 54, ring: true, selected: on, dim: !on }) + badge + '</span>' +
        '<span class="name">' + esc(m.name) + '</span></button>';
    }).join('');
    const toggleAll = '<button class="mm-btn-link" data-member-all="' + (allOn ? '0' : '1') +
      '" style="margin-top:10px;background:none;border:none;cursor:pointer;font-size:13.5px;font-weight:600;color:var(--terra);display:inline-flex;align-items:center;gap:6px;padding:2px">' +
      icon(allOn ? 'x' : 'family', { size: 15, stroke: 2.2 }) + (allOn ? 'Clear all' : 'Everyone\u2019s here') + '</button>';
    return '<div class="mm-member-strip">' + picks + '</div>' + toggleAll;
  }

  // ── Reusable: filter chips ──────────────────────────────────
  function filterChips(activeFilters) {
    return '<div style="display:flex;flex-wrap:wrap;gap:9px">' + MM.FILTERS.map(f => {
      const on = activeFilters.includes(f.id);
      const special = f.id === 'noconflict';
      return '<button class="mm-chip' + (on ? ' on' : '') + (special ? ' special' : '') + '" data-filter="' + f.id + '">' +
        (special ? icon('shield', { size: 14, stroke: 2.2 }) : '') + esc(f.label) + '</button>';
    }).join('') + '</div>';
  }

  // ── HOME ────────────────────────────────────────────────────
  function home() {
    const S = window.State;
    const active = S.members.filter(m => m.active);
    const hr = new Date().getHours();
    const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    const canGo = S.present.length > 0;
    return '<div class="mm-wrap-narrow mm-fade">' +
      '<div><div class="mm-greeting" style="font-size:15px;font-weight:600;color:var(--ink-soft)">' + greeting + '</div>' +
        '<div class="mm-eyebrow" style="margin-top:4px">' + esc(S.familyName || 'Your Family') + '</div></div>' +
      '<h1 class="mm-h1" style="margin:26px 0 22px">What should we cook today?</h1>' +
      mealTypeGrid(S.mealType) +
      '<div style="margin-top:34px"><h2 class="mm-section-title">Who\u2019s eating?</h2>' +
        '<div style="margin-top:14px">' + memberStrip(active, S.present) + '</div></div>' +
      '<div style="margin-top:30px"><h2 class="mm-section-title">Add a filter <span style="font-weight:500;color:var(--ink-soft);font-size:15px">· optional</span></h2>' +
        '<div style="margin-top:14px">' + filterChips(S.filters) + '</div></div>' +
      '<div style="display:flex;gap:11px;margin-top:34px">' +
        '<button class="mm-btn mm-btn-primary lg full" data-act="suggest"' + (canGo ? '' : ' disabled') + '>' +
          icon('meals', { size: 21, stroke: 2.2 }) + (canGo ? 'Suggest meals' : 'Pick who\u2019s eating') + '</button>' +
        '<button class="mm-btn mm-btn-forest lg mm-btn-icon" data-act="surprise"' + (canGo ? '' : ' disabled') + ' title="Surprise me">' +
          icon('dice', { size: 24, stroke: 2 }) + '</button>' +
      '</div>' +
    '</div>';
  }

  // ── Suggestion card ─────────────────────────────────────────
  function suggestionCard(s, rank, idx, hero) {
    const S = window.State;
    const medal = rank === 1 ? '#C99A3A' : rank === 2 ? '#9FB0A0' : rank === 3 ? '#C08A5A' : '#CDB89A';
    let head = '';
    if (hero) {
      head = '<div class="mm-sugg-hero-img">' + placeholder('photo · ' + s.displayName.toLowerCase(), { h: 130, r: 0 }) +
        '<div class="mm-badge-top">' + icon('star', { size: 13, stroke: 2, fill: '#FFF8EE' }) + 'TOP PICK</div>' +
        '<div class="mm-badge-score">Score ' + s.score + '</div></div>';
    }
    const tags = s.tags.filter(t => !['Quick', 'Heavy', 'Medium'].includes(t)).slice(0, 2).map(tag).join('');
    const noConflict = s.noConflict ? '<span class="mm-pill-noconflict">' + icon('shield', { size: 13, stroke: 2.2 }) + 'No-conflict</span>' : '';
    const lastTxt = s.last == null ? 'Never cooked' : s.last === 0 ? 'Cooked today' : s.last === 1 ? 'Cooked yesterday' : s.last + 'd ago';
    const rankBadge = hero ? '' : '<div class="mm-rank" style="background:' + medal + '22;color:' + medal + '">' + rank + '</div>';
    const scoreRight = hero ? '' : '<div style="font-family:var(--display);font-weight:700;font-size:15px;color:var(--ink-soft);flex-shrink:0">' + s.score + '</div>';

    return '<div class="mm-card mm-sugg' + (hero ? ' span-2 hero' : '') + '">' + head +
      '<div style="padding:18px">' +
        '<div style="display:flex;align-items:flex-start;gap:12px">' + rankBadge +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-family:var(--display);font-weight:600;font-size:' + (hero ? 22 : 18) + 'px;color:var(--ink);line-height:1.15;letter-spacing:-.01em">' + esc(s.displayName) + '</div>' +
            '<div style="font-size:13.5px;color:var(--ink-soft);margin-top:3px">' + esc(s.meal.desc) + '</div>' +
          '</div>' + scoreRight +
        '</div>' +
        '<div class="mm-reason">' + icon('spark', { size: 16, stroke: 2, color: 'var(--terra)', fill: 'var(--terra)' }) + '<span>' + esc(s.reason) + '</span></div>' +
        '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:13px">' + noConflict + effort(s.effort) + tags + '</div>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:15px">' +
          prefAvatars(s.levels, S.members) +
          '<span style="font-size:12px;color:var(--ink-soft);font-weight:500;display:inline-flex;align-items:center;gap:5px">' + icon('clock', { size: 13, stroke: 2 }) + lastTxt + '</span>' +
        '</div>' +
        '<div style="display:flex;gap:10px;margin-top:17px">' +
          '<button class="mm-btn mm-btn-primary full" data-cook="' + idx + '" style="flex:1">' + icon('check', { size: 19, stroke: 2.2 }) + 'Cook this</button>' +
          '<button class="mm-btn mm-btn-ghost" data-skip="' + idx + '" style="padding:0 20px">Skip</button>' +
        '</div>' +
      '</div></div>';
  }

  function emptyResults() {
    return '<div class="mm-card mm-empty span-2"><div class="mm-empty-ico">' + icon('meals', { size: 28, stroke: 2 }) + '</div>' +
      '<div style="font-family:var(--display);font-weight:600;font-size:18px;color:var(--ink)">Nothing fits everyone</div>' +
      '<div style="font-size:14px;color:var(--ink-soft);margin-top:6px;line-height:1.5;max-width:420px;margin-inline:auto">Someone present can\u2019t eat the options, or your filters are too tight. Try removing a filter or a member.</div></div>';
  }

  // ── RESULTS ─────────────────────────────────────────────────
  function results() {
    const S = window.State;
    const names = S.present.map(id => (S.members.find(m => m.id === id) || {}).name).filter(Boolean);
    const activeCount = S.members.filter(m => m.active).length;
    const ctx = names.length >= activeCount ? 'Everyone' : names.join(', ');

    if (S.surprise) {
      const s = S.suggestions[0];
      const body = s ? suggestionCard(s, 1, 0, true) : emptyResults();
      return '<div class="mm-wrap-narrow mm-fade">' +
        '<button class="mm-btn-back" data-nav="home" style="background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:6px;color:var(--ink);font-weight:600;font-size:15px;padding:0;margin-bottom:8px">' +
          icon('back', { size: 20, stroke: 2.2 }) + 'Back</button>' +
        '<div style="text-align:center;margin:10px 0 20px">' +
          '<span class="mm-pill-noconflict" style="background:var(--forest-tint);color:var(--forest);font-family:var(--display);letter-spacing:.06em">' + icon('dice', { size: 16, stroke: 2 }) + 'SURPRISE PICK</span>' +
          '<h1 class="mm-h1" style="font-size:27px;margin-top:14px">Tonight, how about…</h1>' +
        '</div>' +
        '<div class="mm-grid-cards" style="grid-template-columns:1fr">' + body + '</div>' +
        '<button class="mm-btn mm-btn-ghost full" data-act="surprise" style="margin-top:14px;border-style:dashed;color:var(--terra)">' + icon('dice', { size: 18, stroke: 2 }) + 'Surprise me again</button>' +
      '</div>';
    }

    const cards = S.suggestions.length
      ? S.suggestions.map((s, i) => suggestionCard(s, i + 1, i, i === 0)).join('')
      : emptyResults();
    return '<div class="mm-wrap mm-fade">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
        '<button class="mm-btn-back" data-nav="home" style="background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:6px;color:var(--ink);font-weight:600;font-size:15px;padding:0">' +
          icon('back', { size: 20, stroke: 2.2 }) + 'Edit choices</button>' +
        '<button class="mm-chip" data-act="surprise" style="color:var(--forest);border-color:var(--line)">' + icon('dice', { size: 15, stroke: 2 }) + 'Surprise me</button>' +
      '</div>' +
      '<h1 class="mm-h1">' + (S.suggestions.length ? S.suggestions.length + ' ' + typeLabel(S.mealType).toLowerCase() + ' ideas' : 'No matches') + '</h1>' +
      '<div class="mm-screen-sub" style="margin-bottom:22px">For ' + esc(ctx) + ' · best to worst</div>' +
      '<div class="mm-grid-cards">' + cards + '</div>' +
    '</div>';
  }

  // ── MEALS ───────────────────────────────────────────────────
  const ITEM_TYPE_LABEL = { complete: 'Complete meal', main: 'Main dish', staple: 'Staple', side: 'Side' };
  function meals() {
    const S = window.State;
    const active = S.members.filter(m => m.active);
    const q = (S.mealQuery || '').toLowerCase();
    // Include regular components (staples/sides) so they can be managed here;
    // dishes first, components after.
    const list = S.meals.filter(m => (S.mealFilter === 'all' || m.types.includes(S.mealFilter)) && m.name.toLowerCase().includes(q))
      .sort((a, b) => (a.regular ? 1 : 0) - (b.regular ? 1 : 0));
    const dishCount = list.filter(m => !m.regular).length;
    const compCount = list.length - dishCount;
    const typeFilters = [{ id: 'all', label: 'All' }].concat(MM.MEAL_TYPES.map(t => ({ id: t.id, label: t.label })));

    const chips = typeFilters.map(t =>
      '<button class="mm-chip pill' + (S.mealFilter === t.id ? ' on' : '') + '" data-mealfilter="' + t.id + '">' + t.label + '</button>'
    ).join('');

    const cards = list.map(m => {
      const loves = active.filter(mb => MM.prefOf(m.id, mb.id) === 'love').length;
      const blocks = active.filter(mb => MM.prefOf(m.id, mb.id) === 'cannot').length;
      const badges = [];
      if (loves) badges.push('<span style="font-size:11.5px;font-weight:700;color:var(--love);background:var(--love-tint);padding:2px 8px;border-radius:100px">' + loves + ' love</span>');
      if (blocks) badges.push('<span style="font-size:11.5px;font-weight:700;color:#8E2C1C;background:#F3E0DA;padding:2px 8px;border-radius:100px">' + blocks + ' can\u2019t eat</span>');
      const t1 = m.tags.filter(t => !['Quick', 'Heavy', 'Medium'].includes(t)).slice(0, 1).map(tag).join('');
      return '<div class="mm-card clickable" data-edit-meal="' + m.id + '" style="display:flex;align-items:center;gap:14px;padding:14px">' +
        placeholder(m.name.toLowerCase(), { h: 54, w: 54, r: 13 }) +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-family:var(--display);font-weight:600;font-size:16px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(m.name) + '</div>' +
          '<div style="display:flex;align-items:center;gap:7px;margin-top:4px">' +
            '<span style="font-size:12px;font-weight:600;color:var(--ink-soft)">' + ITEM_TYPE_LABEL[m.itemType] + (m.group ? ' · ' + esc(m.group) : '') + '</span>' +
            '<span style="width:3px;height:3px;border-radius:3px;background:#CDB89A"></span>' + effort(m.effort) +
          '</div>' +
          '<div style="display:flex;gap:5px;margin-top:8px;flex-wrap:wrap">' + badges.join('') + t1 + '</div>' +
        '</div>' + icon('edit', { size: 18, stroke: 2, color: 'var(--ink-soft)' }) +
      '</div>';
    }).join('') || '<div style="grid-column:1/-1;text-align:center;padding:34px;color:var(--ink-soft);font-size:14px">No dishes found.</div>';

    return '<div class="mm-wrap mm-fade">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">' +
        '<div><h1 class="mm-h1">Meals</h1><div class="mm-screen-sub">' + dishCount + ' dish' + (dishCount === 1 ? '' : 'es') + (compCount ? ' · ' + compCount + ' staple' + (compCount === 1 ? '' : 's') + ' &amp; sides' : '') + '</div></div>' +
        '<button class="mm-btn mm-btn-primary sm" data-act="add-meal">' + icon('plus', { size: 18, stroke: 2.2 }) + 'Add meal</button>' +
      '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:20px 0 16px">' +
        '<div class="mm-search" style="flex:1;min-width:220px"><span>' + icon('search', { size: 19, stroke: 2, color: 'var(--ink-soft)' }) + '</span>' +
          '<input id="mm-meal-search" placeholder="Search dishes" value="' + esc(S.mealQuery || '') + '"></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' + chips + '</div>' +
      '</div>' +
      '<div class="mm-card clickable" data-act="prefs" style="display:flex;align-items:center;gap:13px;background:var(--forest);border-color:var(--forest);margin-bottom:18px;padding:15px">' +
        '<div style="width:42px;height:42px;border-radius:12px;background:rgba(255,248,238,.16);display:flex;align-items:center;justify-content:center;color:#F4EFE4">' + icon('family', { size: 22, stroke: 2 }) + '</div>' +
        '<div style="flex:1"><div style="font-family:var(--display);font-weight:600;font-size:16px;color:#F8F3E8">Who likes what</div>' +
        '<div style="font-size:13px;color:rgba(248,243,232,.74)">Set everyone\u2019s preferences in a grid</div></div>' +
        icon('right', { size: 20, stroke: 2.4, color: '#F4EFE4' }) +
      '</div>' +
      '<div class="mm-grid-cards">' + cards + '</div>' +
    '</div>';
  }

  // ── FAMILY ──────────────────────────────────────────────────
  function family() {
    const S = window.State;
    const cards = S.members.map(m =>
      '<div class="mm-card" style="display:flex;align-items:center;gap:14px;padding:15px;opacity:' + (m.active ? 1 : .65) + '">' +
        avatar(m, { size: 50, dim: !m.active }) +
        '<div style="flex:1;cursor:pointer" data-edit-member="' + m.id + '">' +
          '<div style="font-family:var(--display);font-weight:600;font-size:17px;color:var(--ink)">' + esc(m.name) + '</div>' +
          '<div style="font-size:13px;color:var(--ink-soft);font-weight:500">' + esc(m.role) + (m.active ? '' : ' · inactive') + '</div>' +
        '</div>' +
        '<button class="mm-toggle' + (m.active ? ' on' : '') + '" data-toggle-member="' + m.id + '"><span class="knob"></span></button>' +
      '</div>'
    ).join('');
    return '<div class="mm-wrap mm-fade">' +
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">' +
        '<div><h1 class="mm-h1">Family</h1><div class="mm-screen-sub">' + esc(S.familyName || 'Your Family') + ' · ' + S.members.filter(m => m.active).length + ' active</div></div>' +
        '<button class="mm-btn mm-btn-primary sm" data-act="add-member">' + icon('plus', { size: 18, stroke: 2.2 }) + 'Add</button>' +
      '</div>' +
      '<div class="mm-grid-cards" style="margin-top:22px">' + cards + '</div>' +
      '<div style="margin-top:18px;font-size:12.5px;color:var(--ink-soft);text-align:center;line-height:1.5">Turning someone off hides them from new suggestions but keeps their meal history intact.</div>' +
    '</div>';
  }

  // ── HISTORY ─────────────────────────────────────────────────
  function history() {
    const S = window.State;
    const fmt = d => d === 0 ? 'Today' : d === 1 ? 'Yesterday' : d + ' days ago';
    const groups = [
      { label: 'This week', items: S.history.filter(h => h.daysAgo <= 7) },
      { label: 'Earlier', items: S.history.filter(h => h.daysAgo > 7) },
    ].filter(g => g.items.length);

    const body = groups.map(g =>
      '<div style="margin-bottom:24px"><div class="mm-label" style="margin-bottom:12px">' + g.label + '</div>' +
      '<div class="mm-grid-cards">' + g.items.map(h => {
        const t = MM.MEAL_TYPES.find(x => x.id === h.type) || MM.MEAL_TYPES[0];
        const avs = h.members.slice(0, 5).map((id, i) => {
          const m = S.members.find(x => x.id === id);
          return m ? '<span style="margin-left:' + (i ? -8 : 0) + 'px;display:inline-flex">' + avatar(m, { size: 28, ring: true }) + '</span>' : '';
        }).join('');
        return '<div class="mm-card" style="display:flex;align-items:center;gap:14px;padding:15px">' +
          '<div style="width:44px;height:44px;border-radius:12px;background:var(--cream-3);display:flex;align-items:center;justify-content:center;color:var(--terra);flex-shrink:0">' + icon(t.icon, { size: 22, stroke: 2 }) + '</div>' +
          '<div style="flex:1;min-width:0"><div style="font-family:var(--display);font-weight:600;font-size:15.5px;color:var(--ink);line-height:1.25">' + esc(h.display) + '</div>' +
          '<div style="font-size:12.5px;color:var(--ink-soft);font-weight:500;margin-top:3px">' + t.label + ' · ' + fmt(h.daysAgo) + '</div></div>' +
          '<div style="display:flex;flex-shrink:0">' + avs + '</div>' +
        '</div>';
      }).join('') + '</div></div>'
    ).join('');

    return '<div class="mm-wrap mm-fade"><h1 class="mm-h1">History</h1>' +
      '<div class="mm-screen-sub" style="margin-bottom:22px">What you\u2019ve cooked recently</div>' + body + '</div>';
  }

  // ── SETTINGS ────────────────────────────────────────────────
  function settingsRow(ic, label, value, opts) {
    opts = opts || {};
    const cls = 'mm-set-row' + (opts.last ? ' last' : '') + (opts.attrs ? ' clickable' : '');
    return '<div class="' + cls + '"' + (opts.attrs || '') + '>' +
      '<div class="mm-set-ico">' + icon(ic, { size: 19, stroke: 2 }) + '</div>' +
      '<span style="flex:1;font-size:15px;font-weight:600;color:var(--ink)">' + label + '</span>' +
      (value ? '<span style="font-size:14px;color:var(--ink-soft);font-weight:500">' + value + '</span>' : '') +
      icon('right', { size: 18, stroke: 2, color: '#CDB89A' }) + '</div>';
  }
  function settings() {
    const S = window.State;
    const fam = S.familyName || 'Your Family';
    const initial = esc((fam[0] || 'F').toUpperCase());
    const active = S.members.filter(m => m.active).length;
    const dishes = S.meals.filter(m => !m.regular).length;
    return '<div class="mm-wrap-narrow mm-fade"><h1 class="mm-h1" style="margin-bottom:22px">Settings</h1>' +
      '<div class="mm-card" style="display:flex;align-items:center;gap:14px;margin-bottom:20px">' +
        '<div style="width:52px;height:52px;border-radius:50%;background:var(--terra);color:#FFF8EE;display:flex;align-items:center;justify-content:center;font-family:var(--display);font-weight:600;font-size:22px">' + initial + '</div>' +
        '<div style="flex:1"><div style="font-family:var(--display);font-weight:600;font-size:17px;color:var(--ink)">' + esc(fam) + '</div>' +
        '<div style="font-size:13px;color:var(--ink-soft)">' + active + ' member' + (active === 1 ? '' : 's') + ' · saved on this device</div></div>' +
      '</div>' +
      '<div class="mm-label" style="margin:4px 4px 8px">Family</div>' +
      '<div class="mm-card" style="padding:2px 16px;margin-bottom:20px">' +
        settingsRow('family', 'Family name', esc(fam), { attrs: ' data-act="edit-family"' }) +
        settingsRow('meals', 'Manage meals', dishes + ' dishes', { last: true, attrs: ' data-nav="meals"' }) + '</div>' +
      '<div class="mm-label" style="margin:4px 4px 8px">Suggestions</div>' +
      '<div class="mm-card" style="padding:2px 16px;margin-bottom:20px">' +
        settingsRow('clock', 'Repeat avoidance', MM.TUNING.repeatAvoidance[S.settings.repeatAvoidance].label, { attrs: ' data-tune="repeatAvoidance"' }) +
        settingsRow('star', 'Preference weighting', MM.TUNING.prefWeighting[S.settings.prefWeighting].label, { last: true, attrs: ' data-tune="prefWeighting"' }) + '</div>' +
      '<div class="mm-label" style="margin:4px 4px 8px">Data</div>' +
      '<div class="mm-card" style="padding:2px 16px;margin-bottom:20px">' +
        settingsRow('download', 'Export data', 'JSON', { attrs: ' data-act="export"' }) +
        settingsRow('upload', 'Import data', 'JSON', { last: true, attrs: ' data-act="import"' }) + '</div>' +
      '<button class="mm-btn mm-btn-ghost full" data-act="reset" style="color:#8E2C1C">' + icon('trash', { size: 18, stroke: 2 }) + 'Reset family / start over</button>' +
      '<div style="text-align:center;font-size:12px;color:#B09B7E;margin-top:16px">MealMitra · v1.0 · web</div>' +
    '</div>';
  }

  window.Screens = { onboarding, home, results, meals, family, history, settings, suggestionCard };
})();
