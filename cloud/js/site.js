/* UNSHARED — shared: mobile menu */
(function () {
  'use strict';
  var btn = document.querySelector('.burger');
  var menu = document.getElementById('m-menu');
  if (!btn || !menu) return;
  var EN = (document.documentElement.lang || '').indexOf('en') === 0;
  var OPEN = EN ? 'Open menu' : '打开菜单', CLOSE = EN ? 'Close menu' : '关闭菜单';

  function setOpen(open) {
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? CLOSE : OPEN);
  }

  btn.addEventListener('click', function () {
    setOpen(!menu.classList.contains('open'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      setOpen(false);
      btn.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 860 && menu.classList.contains('open')) setOpen(false);
  });
})();
