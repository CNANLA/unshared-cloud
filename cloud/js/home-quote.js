/* UNSHARED — homepage quick quote. Prices come from pricing.js, so this can never drift from the configurator. */
(function () {
  'use strict';
  var IS_NODE = typeof module !== 'undefined' && module.exports;
  var api = IS_NODE ? require('./pricing.js') : (typeof window !== 'undefined' && window.TLCPricing);
  // cheapest option pre-selected: Mac mini M6, base config, 1.0–1.5 Gbps, annual
  var DEF = { m: 0, v: 0, mem: 0, st: 0, eth: 0, speed: 0, pay: 'annual' };

  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function pill(o, patch, sub) {
    return '<button type="button" class="' + (o.on ? 'opt on' : 'opt') + '" aria-pressed="' + (o.on ? 'true' : 'false') +
      '" data-qset="' + esc(JSON.stringify(patch)) + '">' + esc(o.label) +
      (sub && o.sub ? '<span class="sub">' + esc(o.sub) + '</span>' : '') + '</button>';
  }
  function build(state, lang) {
    var v = api.compute(Object.assign({}, DEF, state), lang, '');
    return {
      annual: state.pay !== 'monthly',
      'q-models': v.optModels.map(function (o, i) { return pill(o, { m: i }); }).join(''),
      'q-speeds': v.optSpeeds.map(function (o, i) { return pill(o, { speed: i }, true); }).join(''),
      'q-price': v.sumPrice,
      'q-sub': v.sumSub,
      'q-alt': v.sumAlt,
      'q-spec': v.sumL1 + ' · ' + v.sumL2 + ' · ' + v.sumL3,
      'q-total': v.sumTotal
    };
  }

  if (IS_NODE) {
    module.exports = { views: function (lang) { return build(DEF, lang); } };
    return;
  }
  var box = document.getElementById('quick-quote');
  if (!box || !api) return;
  var LANG = (document.documentElement.lang || '').indexOf('en') === 0 ? 'en' : 'zh';
  var state = Object.assign({}, DEF);

  function render() {
    var h = build(state, LANG);
    ['q-models', 'q-speeds'].forEach(function (id) { document.getElementById(id).innerHTML = h[id]; });
    ['q-price', 'q-sub', 'q-alt', 'q-spec', 'q-total'].forEach(function (id) { document.getElementById(id).textContent = h[id]; });
    box.querySelectorAll('[data-qpay]').forEach(function (b) {
      var on = (b.getAttribute('data-qpay') === 'annual') === h.annual;
      b.className = on ? 'seg on' : 'seg';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  box.addEventListener('click', function (e) {
    var t = e.target.closest('[data-qset],[data-qpay]');
    if (!t) return;
    if (t.hasAttribute('data-qpay')) state.pay = t.getAttribute('data-qpay');
    else Object.assign(state, JSON.parse(t.getAttribute('data-qset')));
    render();
  });
  render();
})();
