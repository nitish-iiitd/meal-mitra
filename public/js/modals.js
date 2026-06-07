// modals.js — Bootstrap modals: member editor, meal editor, pref grid, cook sheet
(function () {
  const { icon, esc, avatar, prefDot } = window.UI;
  const MM = window.MM;
  const SWATCHES = ['#C4622D', '#3E5C3A', '#B07A2E', '#9C5A3C', '#5C7A54', '#A84E20', '#6B7F8C', '#8A6D3B'];

  function getModal() { return bootstrap.Modal.getOrCreateInstance(document.getElementById('mm-modal')); }
  function setDialogSize(size) {
    const dlg = document.querySelector('#mm-modal .modal-dialog');
    dlg.className = 'modal-dialog modal-dialog-centered modal-dialog-scrollable' + (size ? ' ' + size : '');
  }
  function open(title, bodyHTML, size) {
    setDialogSize(size);
    $('#mm-modal .modal-title').text(title);
    $('#mm-modal .modal-body').html(bodyHTML);
    getModal().show();
  }
  function setBody(html) { $('#mm-modal .modal-body').html(html); }
  function close() { getModal().hide(); }

  // ════ MEMBER EDITOR ════════════════════════════════════════
  let mD = null;
  function openMember(member) {
    mD = member ? Object.assign({}, member) : { name: '', role: '', color: SWATCHES[0], active: true };
    open(member ? 'Edit member' : 'Add member', memberBody(), '');
  }
  function memberBody() {
    const prev = { name: mD.name || '?', color: mD.color };
    const swatches = SWATCHES.map(c =>
      '<button class="mm-swatch' + (mD.color === c ? ' on' : '') + '" data-m-color="' + c + '" style="background:' + c + '"></button>'
    ).join('');
    return '<div style="display:flex;justify-content:center;margin-bottom:18px" id="mm-mem-prev">' + avatar(prev, { size: 84 }) + '</div>' +
      '<input class="mm-input" data-m-field="name" placeholder="Name" value="' + esc(mD.name) + '">' +
      '<input class="mm-input" data-m-field="role" placeholder="Role, e.g. Mom, Son, Guest" value="' + esc(mD.role) + '" style="margin-top:10px">' +
      '<div class="mm-field-label">Pick a colour</div>' +
      '<div style="display:flex;gap:12px;flex-wrap:wrap">' + swatches + '</div>' +
      '<div style="display:flex;gap:10px;margin-top:24px">' +
        (mD.id ? '<button class="mm-btn mm-btn-danger" data-m-delete="1">' + icon('trash', { size: 18, stroke: 2 }) + '</button>' : '') +
        '<button class="mm-btn mm-btn-primary" data-m-save="1" style="flex:1">' + icon('check', { size: 19, stroke: 2.2 }) + (mD.id ? 'Save' : 'Add member') + '</button>' +
      '</div>';
  }

  // ════ MEAL EDITOR ══════════════════════════════════════════
  const TAGS = ['Veg', 'Non-veg', 'Healthy', 'Light', 'Heavy', 'Quick', 'Kids', 'Spicy', 'Protein'];
  const STAPLES = ['rice', 'roti'], SIDES = ['salad', 'curd', 'papad', 'pickle'];
  let eD = null;
  function openMeal(meal) {
    const blank = { name: '', types: ['breakfast'], itemType: 'complete', effort: 'medium', tags: [], serveWith: [], sides: [], desc: '' };
    eD = meal
      ? Object.assign({}, blank, meal, { serveWith: (meal.serveWith || []).map(s => s.id) })
      : blank;
    eD._editId = meal ? meal.id : null;
    open(meal ? 'Edit meal' : 'Add meal', mealBody(), 'modal-lg');
  }
  function syncMealInputs() {
    const $b = $('#mm-modal .modal-body');
    eD.name = $b.find('[data-e-field="name"]').val() || '';
    eD.desc = $b.find('[data-e-field="desc"]').val() || '';
  }
  function chip(on, attr, label) {
    return '<button class="mm-chip' + (on ? ' on' : '') + '" ' + attr + '>' + esc(label) + '</button>';
  }
  function mealBody() {
    const isMain = eD.itemType === 'main';
    const lunchy = eD.types.includes('lunch') || eD.types.includes('dinner');
    const typeChips = MM.MEAL_TYPES.map(t => chip(eD.types.includes(t.id), 'data-e-toggle="types" data-e-val="' + t.id + '"', t.label)).join('');
    const itemSeg = [['complete', 'Complete meal'], ['main', 'Main dish'], ['side', 'Side / add-on']].map(([v, l]) =>
      '<button class="' + (eD.itemType === v ? 'on' : '') + '" data-e-itemtype="' + v + '">' + l + '</button>').join('');
    const effortSeg = [['quick', 'Quick'], ['medium', 'Medium'], ['heavy', 'Heavy']].map(([v, l]) =>
      '<button class="' + (eD.effort === v ? 'on' : '') + '" data-e-effort="' + v + '">' + l + '</button>').join('');
    const tagChips = TAGS.map(t => chip(eD.tags.includes(t), 'data-e-toggle="tags" data-e-val="' + t + '"', t)).join('');

    let comboPanel = '';
    if (isMain && lunchy) {
      const sw = STAPLES.map(id => chip(eD.serveWith.includes(id), 'data-e-toggle="serveWith" data-e-val="' + id + '"', MM.byId(id).name)).join('');
      const sd = SIDES.map(id => chip(eD.sides.includes(id), 'data-e-toggle="sides" data-e-val="' + id + '"', MM.byId(id).name)).join('');
      const combo = (eD.serveWith.length || eD.sides.length)
        ? '<div style="font-size:13px;color:var(--ink-soft);margin-top:12px">Suggests as <b style="color:var(--terra-deep);font-family:var(--display)">' +
            esc([eD.name || 'Dish'].concat(eD.serveWith.map(i => MM.byId(i).name), eD.sides.map(i => MM.byId(i).name)).join(' + ')) + '</b></div>'
        : '';
      comboPanel = '<div style="background:var(--cream-3);border-radius:16px;padding:4px 14px 16px;margin-top:16px">' +
        '<div class="mm-field-label">Usually served with <span class="hint">· builds the combo</span></div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px">' + sw + sd + '</div>' + combo + '</div>';
    }

    return '<input class="mm-input" data-e-field="name" placeholder="Dish name, e.g. Rajma" value="' + esc(eD.name) + '" style="font-family:var(--display);font-weight:600;font-size:19px">' +
      '<div class="mm-field-label">Meal type</div><div style="display:flex;flex-wrap:wrap;gap:8px">' + typeChips + '</div>' +
      '<div class="mm-field-label">This dish is a</div><div class="mm-seg">' + itemSeg + '</div>' +
      comboPanel +
      '<div class="mm-field-label">Effort to cook</div><div class="mm-seg">' + effortSeg + '</div>' +
      '<div class="mm-field-label">Tags</div><div style="display:flex;flex-wrap:wrap;gap:8px">' + tagChips + '</div>' +
      '<div class="mm-field-label">Description <span class="hint">· optional</span></div>' +
      '<textarea class="mm-textarea" data-e-field="desc" rows="2" placeholder="A short note about this dish">' + esc(eD.desc) + '</textarea>' +
      '<div style="display:flex;gap:10px;margin-top:22px">' +
        '<button class="mm-btn mm-btn-ghost" data-e-cancel="1" style="flex:1">Cancel</button>' +
        '<button class="mm-btn mm-btn-primary" data-e-save="1" style="flex:2">' + icon('check', { size: 19, stroke: 2.2 }) + (eD._editId ? 'Save changes' : 'Add meal') + '</button>' +
      '</div>';
  }

  // ════ PREFERENCE GRID ══════════════════════════════════════
  const CYCLE = { love: 'okay', okay: 'avoid', avoid: 'cannot', cannot: 'love' };
  let pgType = 'breakfast';
  function openPrefs() { pgType = 'breakfast'; open('Who likes what', prefBody(), 'modal-lg'); }
  function prefBody() {
    const S = window.State;
    const active = S.members.filter(m => m.active);
    const rows = S.meals.filter(m => !m.regular && m.types.includes(pgType));
    const tabs = MM.MEAL_TYPES.map(t =>
      '<button class="mm-chip pill' + (pgType === t.id ? ' on' : '') + '" data-pg-type="' + t.id + '">' + t.label + '</button>').join('');
    const head = '<tr><th class="dish">Dish</th>' + active.map(m =>
      '<th><div style="display:flex;flex-direction:column;align-items:center;gap:4px">' + avatar(m, { size: 30 }) +
      '<span style="font-size:10.5px;font-weight:700;color:var(--ink-soft)">' + esc(m.name) + '</span></div></th>').join('') + '</tr>';
    const body = rows.map(meal =>
      '<tr><td class="dish">' + esc(meal.name) + '</td>' + active.map(m => {
        const lvl = MM.prefOf(meal.id, m.id);
        const col = MM.PREF_META[lvl].color;
        return '<td style="text-align:center"><span class="mm-grid-cell" data-pg-cell="' + meal.id + ':' + m.id + '" style="background:' + col + '1c">' + prefDot(lvl, 15) + '</span></td>';
      }).join('') + '</tr>').join('');
    return '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">' + tabs + '</div>' +
      '<div style="font-size:13px;color:var(--ink-soft);margin-bottom:12px;font-weight:500">Tap a cell to cycle: ' +
        '<b style="color:var(--love)">Loves</b> → <b style="color:#C99A3A">Okay</b> → <b style="color:#C0563C">Avoids</b> → <b style="color:#8E2C1C">Can\u2019t</b></div>' +
      '<div class="mm-grid-wrap"><table class="mm-grid"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' +
      '<button class="mm-btn mm-btn-primary full" data-pg-done="1" style="margin-top:14px">' + icon('check', { size: 19, stroke: 2.2 }) + 'Done</button>';
  }

  // ════ COOK SHEET ═══════════════════════════════════════════
  let cSugg = null, cSel = [];
  function openCook(sugg) {
    cSugg = sugg; cSel = window.State.present.slice();
    open('Cook this', cookBody(), '');
  }
  function cookBody() {
    const S = window.State;
    const active = S.members.filter(m => m.active);
    const tl = (MM.MEAL_TYPES.find(t => t.id === cSugg.mealType) || {}).label || '';
    const picks = active.map(m => {
      const on = cSel.includes(m.id);
      return '<button class="mm-member-pick' + (on ? ' on' : '') + '" data-cook-member="' + m.id + '" style="width:56px">' +
        avatar(m, { size: 46, ring: true, selected: on, dim: !on }) +
        '<span class="name" style="font-size:11px">' + esc(m.name) + '</span></button>';
    }).join('');
    return '<div class="mm-card" style="display:flex;align-items:center;gap:14px;margin-bottom:18px;background:var(--cream-3);border-color:transparent;padding:14px">' +
        window.UI.placeholder(cSugg.displayName.toLowerCase(), { h: 56, w: 56, r: 13 }) +
        '<div style="flex:1"><div style="font-family:var(--display);font-weight:600;font-size:17px;color:var(--ink)">' + esc(cSugg.displayName) + '</div>' +
        '<div style="font-size:13px;color:var(--ink-soft);font-weight:500;margin-top:2px">Cooking today · ' + tl + '</div></div></div>' +
      '<div class="mm-field-label" style="margin-top:0">Who ate?</div>' +
      '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:8px">' + picks + '</div>' +
      '<div class="mm-field-label">Note <span class="hint">· optional</span></div>' +
      '<textarea class="mm-textarea" id="mm-cook-note" rows="2" placeholder="e.g. made it less spicy for Aarav"></textarea>' +
      '<button class="mm-btn mm-btn-primary lg full" data-cook-confirm="1" style="margin-top:18px">' + icon('check', { size: 21, stroke: 2.2 }) + 'Mark as cooked</button>';
  }

  // ════ EVENT DELEGATION (scoped to #mm-modal) ═══════════════
  function bind() {
    const $doc = $(document);

    // Member editor
    $doc.on('input', '#mm-modal [data-m-field]', function () { mD[$(this).data('m-field')] = this.value; });
    $doc.on('click', '#mm-modal [data-m-color]', function () {
      mD.color = $(this).data('m-color');
      $('#mm-modal [data-m-color]').removeClass('on'); $(this).addClass('on');
      $('#mm-mem-prev').html(avatar({ name: mD.name || '?', color: mD.color }, { size: 84 }));
    });
    $doc.on('click', '#mm-modal [data-m-save]', function () {
      if (!mD.name.trim()) return;
      window.App.saveMember(mD); close();
    });
    $doc.on('click', '#mm-modal [data-m-delete]', function () { window.App.deleteMember(mD.id); close(); });

    // Meal editor
    $doc.on('click', '#mm-modal [data-e-toggle]', function () {
      syncMealInputs();
      const key = $(this).data('e-toggle'), val = String($(this).data('e-val'));
      eD[key] = eD[key].includes(val) ? eD[key].filter(x => x !== val) : eD[key].concat(val);
      setBody(mealBody());
    });
    $doc.on('click', '#mm-modal [data-e-itemtype]', function () { syncMealInputs(); eD.itemType = $(this).data('e-itemtype'); setBody(mealBody()); });
    $doc.on('click', '#mm-modal [data-e-effort]', function () { syncMealInputs(); eD.effort = $(this).data('e-effort'); setBody(mealBody()); });
    $doc.on('click', '#mm-modal [data-e-cancel]', close);
    $doc.on('click', '#mm-modal [data-e-save]', function () {
      syncMealInputs();
      if (!eD.name.trim()) return;
      const out = Object.assign({}, eD, { serveWith: eD.serveWith.map(id => ({ id, score: 4 })) });
      window.App.saveMeal(eD._editId, out); close();
    });

    // Pref grid
    $doc.on('click', '#mm-modal [data-pg-type]', function () { pgType = $(this).data('pg-type'); setBody(prefBody()); });
    $doc.on('click', '#mm-modal [data-pg-cell]', function () {
      const [meal, member] = String($(this).data('pg-cell')).split(':');
      window.App.setPref(meal, member, CYCLE[MM.prefOf(meal, member)]);
      setBody(prefBody());
    });
    $doc.on('click', '#mm-modal [data-pg-done]', close);

    // Cook sheet
    $doc.on('click', '#mm-modal [data-cook-member]', function () {
      const id = $(this).data('cook-member');
      cSel = cSel.includes(id) ? cSel.filter(x => x !== id) : cSel.concat(id);
      const on = cSel.includes(id);
      $(this).toggleClass('on', on);
      const m = window.State.members.find(x => x.id === id);
      $(this).find('.mm-avatar').replaceWith(avatar(m, { size: 46, ring: true, selected: on, dim: !on }));
    });
    $doc.on('click', '#mm-modal [data-cook-confirm]', function () {
      if (!cSel.length) return;
      const note = $('#mm-cook-note').val() || '';
      window.App.confirmCook(cSugg, cSel, note); close();
    });
  }

  window.Modals = { openMember, openMeal, openPrefs, openCook, bind };
})();
