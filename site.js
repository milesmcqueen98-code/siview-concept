/* Si View Metro Parks concept site, prepared for RFP 2026-01. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var BUILT = 'Home, Swim lessons, Pool schedule and the Spooktacular';
  var desktopNav = window.matchMedia('(min-width: 901px)');
  var wideNotes = window.matchMedia('(min-width: 1100px)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  // Session storage is a convenience only. It can be blocked, so every call is guarded.
  function store(key, value) {
    try {
      if (value === undefined) { return window.sessionStorage.getItem(key); }
      if (value === null) { window.sessionStorage.removeItem(key); } else { window.sessionStorage.setItem(key, value); }
    } catch (e) { /* storage unavailable */ }
    return null;
  }

  var inFrame = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();

  /* ---------- Toast for pages that are not part of the concept ---------- */
  var toastEl = $('#toast');
  var toastTimer;
  function toast(message) {
    if (!toastEl) { return; }
    toastEl.textContent = '';
    window.clearTimeout(toastTimer);
    window.setTimeout(function () {
      toastEl.textContent = message;
      toastEl.classList.add('show');
    }, 60);
    toastTimer = window.setTimeout(function () { toastEl.classList.remove('show'); }, 5200);
  }

  doc.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href="#"]') : null;
    if (!link) { return; }
    e.preventDefault();
    var label = (link.getAttribute('data-label') || link.textContent || '').replace(/\s+/g, ' ').trim();
    toast('“' + label + '” is not built in this concept. Built pages: ' + BUILT + '.');
  });

  /* ---------- Main menu (disclosure pattern) ---------- */
  var navButtons = $$('.nav-btn');

  function setMenu(btn, open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    var panel = doc.getElementById(btn.getAttribute('aria-controls'));
    if (panel) { panel.hidden = !open; }
  }

  function closeMenus(except) {
    navButtons.forEach(function (b) { if (b !== except) { setMenu(b, false); } });
  }

  navButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      closeMenus(btn);
      setMenu(btn, !open);
    });
  });

  $$('[data-menu-close]').forEach(function (b) {
    b.addEventListener('click', function () {
      var owner = doc.querySelector('.nav-btn[aria-controls="' + b.getAttribute('data-menu-close') + '"]');
      closeMenus(null);
      if (owner) { owner.focus(); }
    });
  });

  doc.addEventListener('click', function (e) {
    if (desktopNav.matches && !e.target.closest('.main-nav')) { closeMenus(null); }
  });

  // On wide screens, an open panel closes as soon as focus leaves its menu item.
  doc.addEventListener('focusin', function (e) {
    if (!desktopNav.matches) { return; }
    var openBtn = $('.nav-btn[aria-expanded="true"]');
    if (openBtn && !openBtn.closest('.nav-item').contains(e.target)) { setMenu(openBtn, false); }
  });

  /* ---------- Phone menu and search ---------- */
  var menuToggle = $('.menu-toggle');
  var mainNav = $('#main-nav');
  function setPhoneMenu(open) {
    if (!menuToggle || !mainNav) { return; }
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    mainNav.classList.toggle('is-open', open);
    if (!open) { closeMenus(null); }
  }
  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      setPhoneMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  var searchToggle = $('.search-toggle');
  var siteSearch = $('#site-search');
  if (searchToggle && siteSearch) {
    searchToggle.addEventListener('click', function () {
      var open = searchToggle.getAttribute('aria-expanded') !== 'true';
      searchToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      siteSearch.classList.toggle('is-open', open);
      if (open) { var input = siteSearch.querySelector('input'); if (input) { input.focus(); } }
    });
  }

  /* ---------- Escape closes the most recent layer ---------- */
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' && e.key !== 'Esc') { return; }
    var openMenu = $('.nav-btn[aria-expanded="true"]');
    if (openMenu) { closeMenus(null); openMenu.focus(); return; }
    if (root.classList.contains('notes-on')) { closeNotes(true); return; }
    if (menuToggle && menuToggle.getAttribute('aria-expanded') === 'true') { setPhoneMenu(false); menuToggle.focus(); }
  });

  /* ---------- Accordions ---------- */
  $$('.acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      var panel = doc.getElementById(btn.getAttribute('aria-controls'));
      if (panel) { panel.hidden = open; }
    });
  });

  /* ---------- Alert bar ---------- */
  var alertEl = $('#alert');
  if (alertEl) {
    if (store('svAlertHidden') === '1') { alertEl.hidden = true; }
    var dismiss = $('[data-dismiss-alert]');
    if (dismiss) {
      dismiss.addEventListener('click', function () {
        alertEl.hidden = true;
        store('svAlertHidden', '1');
        var brand = $('.brand');
        if (brand) { brand.focus(); }
      });
    }
  }

  /* ---------- E-News form (concept: validates, sends nothing) ---------- */
  $$('form[data-enews]').forEach(function (form) {
    var input = $('input[type="email"]', form);
    var error = $('.field-error', form);
    var status = $('.form-status', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = input.value.trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      if (!valid) {
        input.setAttribute('aria-invalid', 'true');
        error.hidden = false;
        status.textContent = '';
        status.classList.remove('ok');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      error.hidden = true;
      form.reset();
      status.classList.add('ok');
      status.textContent = 'Thanks. This is a concept, so nothing was sent. On the live site, this signs you up for E-News through Constant Contact.';
    });
  });

  /* ---------- Pool schedule data, shared by the homepage and the schedule page ---------- */
  var pool = (function () {
    var el = $('#pool-data');
    if (!el) { return null; }
    try { return JSON.parse(el.textContent); } catch (e) { return null; }
  })();

  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function pacificToday() {
    var parts = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles', weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    return { weekday: parts.weekday, iso: parts.year + '-' + parts.month + '-' + parts.day };
  }

  function addDays(iso, n) {
    var d = new Date(iso + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return { iso: d.toISOString().slice(0, 10), weekday: DAYS[d.getUTCDay()] };
  }

  // AP style, matching the schedule tables: 7 a.m., 7:30 a.m., noon.
  function clock(t) {
    var h = parseInt(t.split(':')[0], 10);
    var m = parseInt(t.split(':')[1], 10);
    if (h === 12 && m === 0) { return { t: 'noon', ap: '' }; }
    var num = String(h % 12 || 12) + (m ? ':' + (m < 10 ? '0' : '') + m : '');
    return { t: num, ap: h >= 12 ? 'p.m.' : 'a.m.' };
  }

  function join(x) { return x.ap ? x.t + ' ' + x.ap : x.t; }

  function range(a, b) {
    var x = clock(a);
    if (!b) { return 'from ' + join(x); }
    var y = clock(b);
    if (x.ap && x.ap === y.ap) { return x.t + '–' + y.t + ' ' + y.ap; }
    return join(x) + '–' + join(y);
  }

  function slotsOf(dayName, type) {
    return (pool.days[dayName] || []).filter(function (s) { return s[3] === type; });
  }

  function nextSlot(fromIso, type) {
    for (var i = 1; i <= 14; i++) {
      var d = addDays(fromIso, i);
      if (d.iso > pool.season[1]) { return null; }
      if (pool.closures[d.iso]) { continue; }
      var s = slotsOf(d.weekday, type);
      if (s.length) { return { day: i === 1 ? 'tomorrow' : d.weekday, slot: s[0] }; }
    }
    return null;
  }

  var todayBox = $('#pool-today');
  if (todayBox && pool) {
    var now = pacificToday();
    var label = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
    var dateEl = $('.today-date', todayBox);
    var body = $('.today-body', todayBox);
    if (dateEl) { dateEl.textContent = label; }
    if (body) {
      if (now.iso < pool.season[0] || now.iso > pool.season[1]) {
        body.innerHTML = '<p>The fall schedule runs August 23 to December 20. See the pool schedule for current hours.</p>';
      } else if (pool.closures[now.iso]) {
        body.innerHTML = '<p><strong>Si View Pool is closed today</strong> for ' + pool.closures[now.iso] + '.</p>';
      } else {
        var rows = [['Lap swim', 'lap'], ['Public swim', 'public']].map(function (pair) {
          var list = slotsOf(now.weekday, pair[1]);
          var text;
          if (list.length) {
            text = list.map(function (s) { return range(s[0], s[1]); }).join(', ');
          } else {
            var next = nextSlot(now.iso, pair[1]);
            text = next ? 'None today. Next: ' + next.day + ', ' + range(next.slot[0], next.slot[1]) : 'None today';
          }
          return '<div><dt>' + pair[0] + '</dt><dd>' + text + '</dd></div>';
        }).join('');
        body.innerHTML = '<dl class="today-list">' + rows + '</dl>';
      }
    }
  }

  /* ---------- Pool schedule tabs (enhances a plain list of days) ---------- */
  var tabsRoot = $('[data-tabs]');
  if (tabsRoot) {
    var panels = $$('.day', tabsRoot);
    var tablist = doc.createElement('div');
    tablist.className = 'tablist';
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', 'Day of the week');
    var tabs = panels.map(function (panel) {
      var heading = $('.day-h', panel);
      var name = panel.getAttribute('data-day');
      var tab = doc.createElement('button');
      tab.type = 'button';
      tab.className = 'tab';
      tab.id = 'tab-' + panel.id;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      tab.innerHTML = '<span class="tab-full">' + name + '</span><span class="tab-abbr" aria-hidden="true">' + name.slice(0, 3) + '</span>';
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.setAttribute('tabindex', '0');
      panel.classList.add('tabpanel-pad');
      if (heading) { heading.classList.add('sr'); }
      tablist.appendChild(tab);
      return tab;
    });
    tabsRoot.insertBefore(tablist, panels[0]);

    var select = function (index, moveFocus) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
      });
      if (moveFocus) { tabs[index].focus(); }
    };

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(i, false); });
      tab.addEventListener('keydown', function (e) {
        var n = tabs.length;
        var j = null;
        if (e.key === 'ArrowRight') { j = (i + 1) % n; }
        else if (e.key === 'ArrowLeft') { j = (i - 1 + n) % n; }
        else if (e.key === 'Home') { j = 0; }
        else if (e.key === 'End') { j = n - 1; }
        if (j !== null) { e.preventDefault(); select(j, true); }
      });
    });

    var todayName = pacificToday().weekday;
    var start = 0;
    panels.forEach(function (p, i) { if (p.getAttribute('data-day') === todayName) { start = i; } });
    tabs[start].insertAdjacentHTML('beforeend', '<span class="tab-today"><span class="sr">, </span>Today</span>');
    select(start, false);
  }

  /* ---------- Search results page ---------- */
  var resultsWrap = $('#search-results');
  var indexEl = $('#search-index');
  if (resultsWrap && indexEl) {
    var index = [];
    try { index = JSON.parse(indexEl.textContent); } catch (e) { index = []; }
    var query = '';
    try { query = new URLSearchParams(window.location.search).get('q') || ''; } catch (e) { query = ''; }
    query = query.trim().slice(0, 80);
    var pageInput = $('#search-page-q');
    var headerInput = $('#q');
    if (pageInput) { pageInput.value = query; }
    if (headerInput) { headerInput.value = query; }

    var count = doc.createElement('h2');
    count.className = 'results-count';
    count.id = 'results-count';
    resultsWrap.appendChild(count);

    if (!query) {
      count.textContent = 'Type a word to search, such as swim, camps or rentals.';
    } else {
      var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      var scored = index.map(function (item) {
        var title = item.t.toLowerCase();
        var hay = (item.t + ' ' + item.s + ' ' + (item.k || '') + ' ' + (item.d || '')).toLowerCase();
        var score = 0;
        for (var i = 0; i < terms.length; i++) {
          var term = terms[i];
          if (hay.indexOf(term) === -1) { return null; }
          if (title.indexOf(term) === 0) { score += 10; }
          else if (title.indexOf(term) > -1) { score += 6; }
          else if ((item.k || '').toLowerCase().indexOf(term) > -1) { score += 4; }
          else { score += 1; }
        }
        if (item.u) { score += 8; }
        return { item: item, score: score };
      }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, 15);

      count.textContent = scored.length + (scored.length === 1 ? ' result for “' : ' results for “') + query + '”';
      if (!scored.length) {
        var none = doc.createElement('p');
        none.textContent = 'Try a shorter word, or browse the menu.';
        resultsWrap.appendChild(none);
      } else {
        var list = doc.createElement('ul');
        list.className = 'results';
        list.setAttribute('aria-labelledby', 'results-count');
        scored.forEach(function (r) {
          var li = doc.createElement('li');
          li.className = 'result';
          var a = doc.createElement('a');
          a.href = r.item.u || '#';
          a.textContent = r.item.t;
          li.appendChild(a);
          if (!r.item.u) {
            var tag = doc.createElement('span');
            tag.className = 'not-built';
            tag.textContent = 'Not in concept';
            li.appendChild(tag);
          }
          var path = doc.createElement('p');
          path.className = 'result-path';
          path.textContent = r.item.s;
          li.appendChild(path);
          if (r.item.d) {
            var desc = doc.createElement('p');
            desc.className = 'result-desc';
            desc.textContent = r.item.d;
            li.appendChild(desc);
          }
          list.appendChild(li);
        });
        resultsWrap.appendChild(list);
      }
    }
  }

  /* ---------- RFP notes for reviewers ---------- */
  var notes = $('#rfp-notes');
  var notesBtn = $('.notes-toggle');

  function setNotesLabel(open) {
    if (!notesBtn) { return; }
    notesBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    var lab = $('.nt-label', notesBtn);
    if (lab) { lab.textContent = open ? 'Hide RFP notes' : 'Show RFP notes'; }
  }

  function openNotes(moveFocus) {
    if (!notes) { return; }
    notes.hidden = false;
    root.classList.add('notes-on');
    setNotesLabel(true);
    store('svNotes', '1');
    if (moveFocus) { var title = $('#notes-title'); if (title) { title.focus(); } }
  }

  function closeNotes(returnFocus) {
    if (!notes) { return; }
    notes.hidden = true;
    root.classList.remove('notes-on');
    setNotesLabel(false);
    store('svNotes', null);
    if (returnFocus && notesBtn) { notesBtn.focus(); }
  }

  if (notes && notesBtn && !inFrame) {
    $$('[data-note]').forEach(function (el) {
      var pin = doc.createElement('span');
      pin.className = 'pin' + (el.hasAttribute('data-pin-inside') ? ' pin-inside' : '');
      pin.setAttribute('aria-hidden', 'true');
      pin.textContent = el.getAttribute('data-note');
      if (window.getComputedStyle(el).position === 'static') { el.style.position = 'relative'; }
      el.appendChild(pin);
    });

    notesBtn.addEventListener('click', function () {
      if (root.classList.contains('notes-on')) { closeNotes(false); } else { openNotes(true); }
    });
    var closeBtn = $('.notes-close');
    if (closeBtn) { closeBtn.addEventListener('click', function () { closeNotes(true); }); }

    $$('.note-show').forEach(function (b) {
      b.addEventListener('click', function () {
        var target = doc.querySelector('[data-note="' + b.getAttribute('data-show') + '"]');
        if (!target) { return; }
        if (target.hidden) { target.hidden = false; store('svAlertHidden', null); }
        if (target.id === 'main-nav' && !desktopNav.matches) { setPhoneMenu(true); }
        if (!wideNotes.matches) { closeNotes(false); }
        target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
        target.classList.remove('note-flash');
        void target.offsetWidth;
        target.classList.add('note-flash');
        window.setTimeout(function () { target.classList.remove('note-flash'); }, 2600);
      });
    });

    if (store('svNotes') === '1') { openNotes(false); }
  }
})();
