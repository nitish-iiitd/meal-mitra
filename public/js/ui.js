// ui.js — HTML-string UI helpers (icons, avatars, tags, effort, dots)
// Everything returns a string so screens can compose markup, then jQuery injects it.

(function () {
  const PATHS = {
    home:    'M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9',
    meals:   'M4 8h16M4 8a8 8 0 0 0 16 0M12 20v-4M8 20h8',
    family:  'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20c0-3 2.5-5 6-5s6 2 6 5M17 11a3 3 0 1 0-2-5.2M21 20c0-2.4-1.4-4-3.5-4.6',
    history: 'M12 7v5l3 2M3.5 12a8.5 8.5 0 1 0 2.6-6.1M3.5 5v3.5H7',
    settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 13.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 6.8 19.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1A2 2 0 1 1 6.8 4.2l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z',
    plus:    'M12 5v14M5 12h14',
    check:   'M5 12.5 10 17 19 7',
    x:       'M6 6l12 12M18 6 6 18',
    right:   'M9 6l6 6-6 6',
    left:    'M15 6l-6 6 6 6',
    back:    'M19 12H5M11 6l-6 6 6 6',
    spark:   'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.2L12 3ZM19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z',
    filter:  'M3 5h18M6 12h12M10 19h4',
    sunrise: 'M12 3v3M5.6 9.6 7 11M3 16h3M18 16h3M17 11l1.4-1.4M8 16a4 4 0 0 1 8 0M3 20h18',
    sun:     'M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19',
    cup:     'M5 8h12v4a6 6 0 0 1-12 0V8ZM17 9h2a2 2 0 0 1 0 4h-2M5 21h12',
    moon:    'M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z',
    edit:    'M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4',
    search:  'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM21 21l-4.5-4.5',
    shield:  'M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3ZM9 12l2 2 4-4',
    flame:   'M12 3c1 3-1.5 4-1.5 6.5A1.5 1.5 0 0 0 12 11a2 2 0 0 0 1.5-3.3C16 9 17 11.5 17 14a5 5 0 0 1-10 0c0-2 1-3.8 2.5-5C10 7.5 11 5.5 12 3Z',
    leaf:    'M5 19c0-8 6-13 14-13 0 8-5 14-13 13M5 19c2-4 4-6 7-8',
    clock:   'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
    dots:    'M12 6h.01M12 12h.01M12 18h.01',
    trash:   'M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13',
    bell:    'M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6ZM10 20a2 2 0 0 0 4 0',
    user:    'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20c0-3.5 3-6 7-6s7 2.5 7 6',
    star:    'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.1 6.8 19.6l1-5.8L3.5 9.7l5.9-.9L12 3.5Z',
    dice:    'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM9 9h.01M15 15h.01M9 15h.01M15 9h.01M12 12h.01',
  };

  function icon(name, opts) {
    opts = opts || {};
    const size = opts.size || 22, stroke = opts.stroke || 2;
    const fill = opts.fill || 'none', color = opts.color || 'currentColor';
    const d = PATHS[name] || '';
    const segs = d.split('M').filter(Boolean).map(s => '<path d="M' + s + '"/>').join('');
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="' + fill +
      '" stroke="' + color + '" stroke-width="' + stroke + '" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex-shrink:0">' +
      segs + '</svg>';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function avatar(member, opts) {
    opts = opts || {};
    const size = opts.size || 44;
    const cls = ['mm-avatar'];
    if (opts.ring) cls.push('ring');
    if (opts.selected) cls.push('selected');
    if (opts.dim) cls.push('dim');
    const bg = opts.dim ? '#E7D9C2' : member.color;
    const style = 'width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * 0.4) +
      'px;background:' + bg + ';' + (opts.ml ? 'margin-left:' + opts.ml + 'px;' : '');
    return '<span class="' + cls.join(' ') + '" style="' + style + '">' + esc(member.name[0]) + '</span>';
  }

  function tagTone(tag) {
    if (tag === 'Veg') return 'veg';
    if (tag === 'Non-veg') return 'nonveg';
    if (tag === 'Spicy') return 'spicy';
    return '';
  }
  function tag(text) {
    const tone = tagTone(text);
    return '<span class="mm-tag' + (tone ? ' ' + tone : '') + '">' + esc(text) + '</span>';
  }

  function effort(level, mini) {
    const map = { quick: { n: 1, label: 'Quick' }, medium: { n: 2, label: 'Medium' }, heavy: { n: 3, label: 'Heavy' } };
    const e = map[level] || map.medium;
    let flames = '';
    for (let i = 0; i < 3; i++) {
      const on = i < e.n;
      flames += icon('flame', { size: 13, stroke: 2.2, color: on ? 'var(--terra)' : '#DCC9AC', fill: on ? 'var(--terra)' : 'none' });
    }
    return '<span class="mm-effort"><span class="flames">' + flames + '</span>' + (mini ? '' : e.label) + '</span>';
  }

  function prefDot(level, size) {
    size = size || 12;
    const m = window.MM.PREF_META[level];
    if (level === 'cannot') {
      return '<span class="mm-pref-dot" style="width:' + size + 'px;height:' + size + 'px;border:2px solid ' + m.color +
        ';align-items:center;justify-content:center;background:transparent">' +
        '<span style="width:' + (size * 0.6) + 'px;height:2px;background:' + m.color + ';border-radius:2px;display:block"></span></span>';
    }
    return '<span class="mm-pref-dot" style="width:' + size + 'px;height:' + size + 'px;background:' + m.color + '"></span>';
  }

  // overlapping avatar row with a small preference badge
  function prefAvatars(levels, members) {
    const ids = Object.keys(levels);
    return '<div style="display:flex">' + ids.map((id, i) => {
      const m = members.find(x => x.id === id);
      if (!m) return '';
      const lvl = levels[id] || 'okay';
      const col = window.MM.PREF_META[lvl].color;
      const dash = lvl === 'cannot' ? '<span style="width:6px;height:1.6px;background:#fff;display:block"></span>' : '';
      return '<div style="position:relative;margin-left:' + (i ? -8 : 0) + 'px">' +
        avatar(m, { size: 30 }) +
        '<span style="position:absolute;right:-2px;bottom:-2px;width:13px;height:13px;border-radius:50%;background:' + col +
        ';border:2px solid var(--card);display:flex;align-items:center;justify-content:center">' + dash + '</span></div>';
    }).join('') + '</div>';
  }

  function placeholder(label, opts) {
    opts = opts || {};
    const h = opts.h || 96, r = (opts.r != null ? opts.r : 14);
    const w = opts.w ? 'width:' + opts.w + 'px;' : '';
    return '<div class="mm-ph" style="height:' + h + 'px;border-radius:' + r + 'px;' + w + (opts.style || '') + '"><span>' + esc(label) + '</span></div>';
  }

  window.UI = { icon, esc, avatar, tag, tagTone, effort, prefDot, prefAvatars, placeholder };
})();
