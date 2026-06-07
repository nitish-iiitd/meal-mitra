// app.js — state, routing, nav, screen event delegation, toast
(function () {
  const { icon, avatar } = window.UI;
  const MM = window.MM;

  // ── Global state ────────────────────────────────────────────
  const State = window.State = {
    route: 'home',
    mealType: 'breakfast',
    present: MM.MEMBERS.filter(m => m.active).map(m => m.id),
    filters: [],
    members: MM.MEMBERS.map(m => Object.assign({}, m)),
    meals: MM.MEALS.slice(),
    history: MM.HISTORY.map(h => Object.assign({}, h)),
    suggestions: [],
    surprise: false,
    mealFilter: 'all',
    mealQuery: '',
  };

  const NAV = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'meals', label: 'Meals', icon: 'meals' },
    { id: 'family', label: 'Family', icon: 'family' },
    { id: 'history', label: 'History', icon: 'history' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];
  const NAV_ROUTES = NAV.map(n => n.id);

  // ── Rendering ───────────────────────────────────────────────
  function render() {
    const fn = window.Screens[State.route] || window.Screens.home;
    $('#mm-screen').html(fn());
    paintNav();
    // keep meal search focus/caret after re-render
    if (State.route === 'meals' && State._focusSearch) {
      const el = document.getElementById('mm-meal-search');
      if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
    }
    document.querySelector('.mm-main').scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function paintNav() {
    const r = NAV_ROUTES.includes(State.route) ? State.route : 'home';
    $('.mm-nav-item, .mm-bottomnav-item').each(function () {
      $(this).toggleClass('active', $(this).data('nav') === r);
    });
  }

  function buildNav() {
    // sidebar
    $('#mm-sidebar-nav').html(NAV.map(n =>
      '<button class="mm-nav-item" data-nav="' + n.id + '">' + icon(n.icon, { size: 22, stroke: 2 }) + '<span>' + n.label + '</span></button>'
    ).join(''));
    // bottom nav (mobile)
    $('#mm-bottomnav').html(NAV.map(n =>
      '<button class="mm-bottomnav-item" data-nav="' + n.id + '"><span class="ico">' + icon(n.icon, { size: 22, stroke: 2 }) + '</span><span class="lbl">' + n.label + '</span></button>'
    ).join(''));
    // family footer card
    const a = State.members.find(m => m.active) || State.members[0];
    $('#mm-sidebar-foot').html(
      '<div class="mm-fam-card">' + avatar(a, { size: 38 }) +
      '<div class="mm-fam-meta"><div class="mm-fam-name">Srivastava Family</div><div class="mm-fam-sub">' +
      State.members.filter(m => m.active).length + ' members</div></div></div>'
    );
  }

  // ── Filters → engine input ──────────────────────────────────
  function buildFilters() {
    const f = {};
    State.filters.forEach(id => {
      const def = MM.FILTERS.find(x => x.id === id);
      if (!def) return;
      if (def.kind === 'effort') f.effort = def.value;
      else if (def.kind === 'tag') f.tags = (f.tags || []).concat(def.value);
      else if (def.kind === 'special') f[def.value] = true;
    });
    return f;
  }

  function runSuggest() {
    const list = MM.suggest({ mealType: State.mealType, presentIds: State.present, filters: buildFilters(), limit: 5 });
    list.forEach(s => s.mealType = State.mealType);
    State.suggestions = list; State.surprise = false; State.route = 'results'; render();
  }
  function runSurprise() {
    const all = MM.suggest({ mealType: State.mealType, presentIds: State.present, filters: buildFilters(), limit: 20 });
    const pool = all.filter(s => s.score > 0).slice(0, 6);
    const base = pool.length ? pool : all;
    const pick = base[Math.floor(Math.random() * base.length)];
    if (pick) pick.mealType = State.mealType;
    State.suggestions = pick ? [pick] : []; State.surprise = true; State.route = 'results'; render();
  }

  // ── App API (used by modals) ────────────────────────────────
  const App = window.App = {
    go(route) { State.route = route; render(); },
    toast(msg) {
      const html = '<div class="mm-toast"><span class="tick">' + icon('check', { size: 13, stroke: 3, color: '#F4EFE4' }) + '</span><span class="msg">' + window.UI.esc(msg) + '</span></div>';
      $('#mm-toast').html(html);
      clearTimeout(App._t); App._t = setTimeout(() => $('#mm-toast').empty(), 2400);
    },
    setPref(meal, member, lvl) {
      if (!MM.PREF_OVERRIDES[meal]) MM.PREF_OVERRIDES[meal] = {};
      MM.PREF_OVERRIDES[meal][member] = lvl;
    },
    saveMember(d) {
      if (d.id) {
        State.members = State.members.map(m => m.id === d.id ? Object.assign({}, m, d) : m);
        App.toast('Member updated');
      } else {
        const id = slug(d.name);
        State.members.push(Object.assign({}, d, { id: id, active: true }));
        State.present.push(id);
        App.toast(d.name + ' added');
      }
      buildNav(); render();
    },
    deleteMember(id) {
      State.members = State.members.map(m => m.id === id ? Object.assign({}, m, { active: false }) : m);
      State.present = State.present.filter(p => p !== id);
      buildNav(); App.toast('Member set inactive'); render();
    },
    saveMeal(editId, data) {
      if (editId) {
        const idx = MM.MEALS.findIndex(x => x.id === editId);
        if (idx >= 0) MM.MEALS[idx] = Object.assign({}, MM.MEALS[idx], data);
        App.toast('Meal updated');
      } else {
        MM.MEALS.push(Object.assign({}, data, { id: slug(data.name), last: null, regular: false }));
        App.toast(data.name + ' added');
      }
      State.meals = MM.MEALS.slice(); render();
    },
    confirmCook(sugg, memberIds, note) {
      State.history = [{ id: 'h' + Date.now(), mealId: sugg.id, type: sugg.mealType, daysAgo: 0, members: memberIds, display: sugg.displayName, note: note }].concat(State.history);
      const m = MM.MEALS.find(x => x.id === sugg.id); if (m) m.last = 0;
      State.meals = MM.MEALS.slice();
      App.toast(sugg.main.name + ' added to history');
      State.route = 'history'; render();
    },
  };

  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 5); }

  // ── Event delegation ────────────────────────────────────────
  function bindEvents() {
    const $doc = $(document);

    $doc.on('click', '[data-nav]', function () { State._focusSearch = false; App.go($(this).data('nav')); });
    $doc.on('click', '[data-mealtype]', function () { State.mealType = $(this).data('mealtype'); render(); });

    $doc.on('click', '[data-member]', function () {
      const id = $(this).data('member');
      State.present = State.present.includes(id) ? State.present.filter(p => p !== id) : State.present.concat(id);
      render();
    });
    $doc.on('click', '[data-member-all]', function () {
      const on = String($(this).data('member-all')) === '1';
      State.present = on ? State.members.filter(m => m.active).map(m => m.id) : [];
      render();
    });
    $doc.on('click', '[data-filter]', function () {
      const id = $(this).data('filter');
      State.filters = State.filters.includes(id) ? State.filters.filter(f => f !== id) : State.filters.concat(id);
      render();
    });

    $doc.on('click', '[data-act]', function () {
      const act = $(this).data('act');
      if ($(this).is(':disabled')) return;
      if (act === 'suggest') runSuggest();
      else if (act === 'surprise') runSurprise();
      else if (act === 'add-meal') window.Modals.openMeal(null);
      else if (act === 'prefs') window.Modals.openPrefs();
      else if (act === 'add-member') window.Modals.openMember(null);
    });

    // results
    $doc.on('click', '[data-cook]', function () {
      const s = State.suggestions[+$(this).data('cook')]; if (s) window.Modals.openCook(s);
    });
    $doc.on('click', '[data-skip]', function () {
      const idx = +$(this).data('skip');
      if (State.surprise) { runSurprise(); return; }
      const id = State.suggestions[idx] && State.suggestions[idx].id;
      State.suggestions = State.suggestions.filter(x => x.id !== id);
      render();
    });

    // meals
    $doc.on('click', '[data-mealfilter]', function () { State._focusSearch = false; State.mealFilter = $(this).data('mealfilter'); render(); });
    $doc.on('input', '#mm-meal-search', function () { State.mealQuery = this.value; State._focusSearch = true; render(); });
    $doc.on('click', '[data-edit-meal]', function () { window.Modals.openMeal(MM.byId($(this).data('edit-meal'))); });

    // family
    $doc.on('click', '[data-edit-member]', function () { window.Modals.openMember(State.members.find(m => m.id === $(this).data('edit-member'))); });
    $doc.on('click', '[data-toggle-member]', function () {
      const id = $(this).data('toggle-member');
      State.members = State.members.map(m => m.id === id ? Object.assign({}, m, { active: !m.active }) : m);
      State.present = State.present.includes(id) ? State.present.filter(x => x !== id) : State.present;
      buildNav(); render();
    });
  }

  // ── Init ────────────────────────────────────────────────────
  $(function () {
    buildNav();
    bindEvents();
    window.Modals.bind();
    render();
  });
})();
