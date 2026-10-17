// Si View Metro Parks website concept (RFP 2026-01). Interactions for the prototype only.
(function () {
  function panelFor(btn) { return document.getElementById(btn.getAttribute('aria-controls')); }

  function setOpen(btn, open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    var panel = panelFor(btn);
    if (panel) { panel.hidden = !open; }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var topButtons = Array.prototype.slice.call(document.querySelectorAll('.top-btn'));

    function closeMenus(except) {
      topButtons.forEach(function (b) { if (b !== except) { setOpen(b, false); } });
    }

    // Main menu: opens by click, tap, Enter or Space; announces its state.
    topButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        closeMenus(btn);
        setOpen(btn, !open);
      });
    });

    document.querySelectorAll('[data-close-menu]').forEach(function (b) {
      b.addEventListener('click', function () {
        var open = document.querySelector('.top-btn[aria-expanded="true"]');
        closeMenus(null);
        if (open) { open.focus(); }
      });
    });

    // Escape closes an open menu and returns focus to its button.
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') { return; }
      var open = document.querySelector('.top-btn[aria-expanded="true"]');
      if (open) { closeMenus(null); open.focus(); }
    });

    // Clicking outside the menu closes it on wide screens.
    document.addEventListener('click', function (e) {
      if (window.matchMedia('(min-width: 761px)').matches && !e.target.closest('.main-nav')) { closeMenus(null); }
    });

    // Phone menu toggle.
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
        nav.classList.toggle('open', !open);
        var label = toggle.querySelector('.label');
        if (label) { label.textContent = open ? 'Menu' : 'Close'; }
      });
    }

    // Accordions.
    document.querySelectorAll('.acc button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setOpen(btn, btn.getAttribute('aria-expanded') !== 'true');
      });
    });

    // Dismissible urgent message.
    document.querySelectorAll('[data-dismiss]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.getElementById(btn.getAttribute('data-dismiss'));
        if (target) { target.hidden = true; }
      });
    });

    // Demo forms and buttons explain what the live site would do.
    document.querySelectorAll('form[data-demo]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var status = form.querySelector('.status');
        if (status) { status.textContent = form.getAttribute('data-demo'); }
      });
    });
    document.querySelectorAll('[data-demo-note]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var status = document.getElementById(btn.getAttribute('data-demo-note'));
        if (status) { status.textContent = btn.getAttribute('data-demo-text'); }
      });
    });

    // Sample links in the concept go nowhere.
    document.querySelectorAll('a[href="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); });
    });
  });
})();
