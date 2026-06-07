// modals.js — Bootstrap modals: member editor, meal editor, pref grid, cook sheet
(function () {
  const { icon, esc, avatar, prefDot } = window.UI;
  const MM = window.MM;
  const SWATCHES = MM.SWATCHES;

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
    const footer = mD._confirmDelete
      ? '<div class="mm-danger-confirm">' +
          '<div class="t">Remove ' + esc(mD.name || 'this member') + ' permanently?</div>' +
          '<div class="d">Their preferences are deleted. Meal history is kept.</div>' +
          '<div style="display:flex;gap:10px;margin-top:12px">' +
            '<button class="mm-btn mm-btn-ghost" data-m-delcancel="1" style="flex:1">Cancel</button>' +
            '<button class="mm-btn mm-btn-solid-danger" data-m-delconfirm="1" style="flex:1">Delete</button>' +
          '</div></div>'
      : '<div style="display:flex;gap:10px;margin-top:24px">' +
          (mD.id ? '<button class="mm-btn mm-btn-danger" data-m-delete="1" title="Delete member">' + icon('trash', { size: 18, stroke: 2 }) + '</button>' : '') +
          '<button class="mm-btn mm-btn-primary" data-m-save="1" style="flex:1">' + icon('check', { size: 19, stroke: 2.2 }) + (mD.id ? 'Save' : 'Add member') + '</button>' +
        '</div>';
    return '<div style="display:flex;justify-content:center;margin-bottom:18px" id="mm-mem-prev">' + avatar(prev, { size: 84 }) + '</div>' +
      '<input class="mm-input" data-m-field="name" placeholder="Name" value="' + esc(mD.name) + '">' +
      '<input class="mm-input" data-m-field="role" placeholder="Role, e.g. Mom, Son, Guest" value="' + esc(mD.role) + '" style="margin-top:10px">' +
      '<div class="mm-field-label">Pick a colour</div>' +
      '<div style="display:flex;gap:12px;flex-wrap:wrap">' + swatches + '</div>' +
      footer;
  }

  // ════ MEAL EDITOR ══════════════════════════════════════════
  const TAGS = ['Veg', 'Non-veg', 'Healthy', 'Light', 'Heavy', 'Quick', 'Kids', 'Spicy', 'Protein', 'Tiffin'];
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

    const footer = eD._confirmDelete
      ? '<div class="mm-danger-confirm">' +
          '<div class="t">Delete ' + esc(eD.name || 'this dish') + ' permanently?</div>' +
          '<div class="d">It’s removed from suggestions and your kitchen.</div>' +
          '<div style="display:flex;gap:10px;margin-top:12px">' +
            '<button class="mm-btn mm-btn-ghost" data-e-delcancel="1" style="flex:1">Cancel</button>' +
            '<button class="mm-btn mm-btn-solid-danger" data-e-delconfirm="1" style="flex:1">Delete</button>' +
          '</div></div>'
      : '<div style="display:flex;gap:10px;margin-top:22px">' +
          (eD._editId ? '<button class="mm-btn mm-btn-danger" data-e-delete="1" title="Delete meal">' + icon('trash', { size: 18, stroke: 2 }) + '</button>' : '') +
          '<button class="mm-btn mm-btn-ghost" data-e-cancel="1" style="flex:1">Cancel</button>' +
          '<button class="mm-btn mm-btn-primary" data-e-save="1" style="flex:2">' + icon('check', { size: 19, stroke: 2.2 }) + (eD._editId ? 'Save changes' : 'Add meal') + '</button>' +
        '</div>';
    return '<input class="mm-input" data-e-field="name" placeholder="Dish name, e.g. Rajma" value="' + esc(eD.name) + '" style="font-family:var(--display);font-weight:600;font-size:19px">' +
      '<div class="mm-field-label">Meal type</div><div style="display:flex;flex-wrap:wrap;gap:8px">' + typeChips + '</div>' +
      '<div class="mm-field-label">This dish is a</div><div class="mm-seg">' + itemSeg + '</div>' +
      comboPanel +
      '<div class="mm-field-label">Effort to cook</div><div class="mm-seg">' + effortSeg + '</div>' +
      '<div class="mm-field-label">Tags</div><div style="display:flex;flex-wrap:wrap;gap:8px">' + tagChips + '</div>' +
      '<div class="mm-field-label">Description <span class="hint">· optional</span></div>' +
      '<textarea class="mm-textarea" data-e-field="desc" rows="2" placeholder="A short note about this dish">' + esc(eD.desc) + '</textarea>' +
      footer;
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

  // ════ FAMILY NAME EDITOR ═══════════════════════════════════
  let fnVal = '';
  function openFamilyName() { fnVal = window.State.familyName || ''; open('Family name', familyNameBody(), ''); }
  function familyNameBody() {
    return '<div class="mm-field-label" style="margin-top:0">What’s your family called?</div>' +
      '<input class="mm-input" id="mm-fam-input" value="' + esc(fnVal) + '" placeholder="e.g. Srivastava" style="font-family:var(--display);font-weight:600;font-size:19px">' +
      '<div style="display:flex;gap:10px;margin-top:20px">' +
        '<button class="mm-btn mm-btn-ghost" data-fam-cancel="1" style="flex:1">Cancel</button>' +
        '<button class="mm-btn mm-btn-primary" data-fam-save="1" style="flex:2">' + icon('check', { size: 19, stroke: 2.2 }) + 'Save</button>' +
      '</div>';
  }

  // ════ TUNING PICKER (repeat avoidance / preference weighting) ═
  let tuneKey = null;
  function openTuning(key) {
    tuneKey = key;
    open(key === 'repeatAvoidance' ? 'Repeat avoidance' : 'Preference weighting', tuningBody(), '');
  }
  function tuningBody() {
    const meta = MM.TUNING[tuneKey];
    const cur = window.State.settings[tuneKey];
    const desc = tuneKey === 'repeatAvoidance'
      ? 'How hard the app works to avoid meals you’ve cooked recently.'
      : 'How strongly each person’s likes and dislikes sway the suggestions.';
    const rows = Object.keys(meta).map(k => {
      const o = meta[k], on = cur === k;
      return '<button class="mm-pick-row' + (on ? ' on' : '') + '" data-tune-pick="' + k + '">' +
        '<div><div class="mm-pick-title">' + esc(o.label) + '</div><div class="mm-pick-hint">' + esc(o.hint) + '</div></div>' +
        '<span class="mm-pick-check">' + (on ? icon('check', { size: 18, stroke: 2.6, color: '#FFF8EE' }) : '') + '</span></button>';
    }).join('');
    return '<div style="font-size:13.5px;color:var(--ink-soft);margin-bottom:16px;line-height:1.5">' + desc + '</div>' + rows;
  }

  // ════ RESET FAMILY ═════════════════════════════════════════
  const RESET_PHRASE = 'delete-family';
  function openReset() { open('Reset family', resetBody(), ''); }
  function resetBody() {
    return '<div class="mm-danger-confirm" style="margin-top:0">' +
        '<div class="t">This erases everything on this device</div>' +
        '<div class="d">Your family, members, preferences, meal history and any custom dishes are permanently deleted, and setup starts over. This can’t be undone.</div>' +
      '</div>' +
      '<div class="mm-field-label">Type <b style="color:#8E2C1C;font-family:var(--display)">' + RESET_PHRASE + '</b> to confirm</div>' +
      '<input class="mm-input" id="mm-reset-confirm" placeholder="' + RESET_PHRASE + '" autocomplete="off" autocapitalize="off" spellcheck="false">' +
      '<div style="display:flex;gap:10px;margin-top:18px">' +
        '<button class="mm-btn mm-btn-ghost" data-reset-cancel="1" style="flex:1">Cancel</button>' +
        '<button class="mm-btn mm-btn-solid-danger" data-reset-confirm="1" style="flex:1" disabled>Reset everything</button>' +
      '</div>';
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
    $doc.on('click', '#mm-modal [data-m-delete]', function () { mD._confirmDelete = true; setBody(memberBody()); });
    $doc.on('click', '#mm-modal [data-m-delcancel]', function () { mD._confirmDelete = false; setBody(memberBody()); });
    $doc.on('click', '#mm-modal [data-m-delconfirm]', function () { window.App.deleteMember(mD.id); close(); });

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
    $doc.on('click', '#mm-modal [data-e-delete]', function () { syncMealInputs(); eD._confirmDelete = true; setBody(mealBody()); });
    $doc.on('click', '#mm-modal [data-e-delcancel]', function () { eD._confirmDelete = false; setBody(mealBody()); });
    $doc.on('click', '#mm-modal [data-e-delconfirm]', function () { window.App.deleteMeal(eD._editId); close(); });

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

    // Family name editor
    $doc.on('input', '#mm-modal #mm-fam-input', function () { fnVal = this.value; });
    $doc.on('click', '#mm-modal [data-fam-cancel]', close);
    $doc.on('click', '#mm-modal [data-fam-save]', function () {
      if (!fnVal.trim()) return;
      window.App.setFamilyName(fnVal.trim()); close();
    });

    // Tuning picker — pick one option, save & close
    $doc.on('click', '#mm-modal [data-tune-pick]', function () {
      window.App.setTuning(tuneKey, $(this).data('tune-pick')); close();
    });

    // Reset family — gated behind typing the exact confirmation phrase
    $doc.on('input', '#mm-modal #mm-reset-confirm', function () {
      $('#mm-modal [data-reset-confirm]').prop('disabled', this.value.trim() !== RESET_PHRASE);
    });
    $doc.on('click', '#mm-modal [data-reset-cancel]', close);
    $doc.on('click', '#mm-modal [data-reset-confirm]', function () {
      if ($(this).is(':disabled')) return;
      window.App.resetFamily();
    });
  }

  window.Modals = { openMember, openMeal, openPrefs, openCook, openReset, openFamilyName, openTuning, bind };
})();
