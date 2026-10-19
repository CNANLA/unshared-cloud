/* UNSHARED — machine configurator (pricing.html) */
(function () {
  'use strict';

  // Strings for both languages. The page language comes from <html lang>.
  var L = {
    zh: {
      core: function (c, g) { return c + ' 核 CPU / ' + g + ' 核 GPU'; },
      delta: function (n) { return '约 +CA$' + n + ' /月'; },
      speedSub: ['标配', '+CA$10 /月', '+CA$20 /月'],
      alt: ' 线稿',
      spec2: function (m, s) { return m + ' 内存 · ' + s + ' 存储起'; },
      unitA: '/月起 · 年付', unitM: '/月起 · 月付',
      smallA: function (x) { return '月付 ' + x + ' 起'; },
      smallM: function (x) { return '年付 ' + x + ' /月起'; },
      rec: '最受欢迎', pick: '选配这台',
      eth25: '标配 2.5Gb 网口', eth10: '10Gb 以太网',
      need10: '所选网速档需要 10Gb 网口', ok25: '支持 1.0–1.5 Gbps 档',
      eth10Sub: function (n) { return 'Apple 选配 · 约 +CA$' + n + ' /月'; },
      port10: '10Gb 以太网', port25: '标配 2.5Gb 网口', port10Std: '10Gb 以太网（标配）',
      line2: function (m, s) { return m + ' 内存 · ' + s + ' 存储'; },
      subA: function (x) { return '年付，首付 12 个月 ' + x; }, subM: '按月订阅，随时可停',
      altA: function (x) { return '月付价 ' + x + ' /月'; }, altM: function (x) { return '改选年付 ' + x + ' /月'; }
    },
    en: {
      core: function (c, g) { return c + '-core CPU / ' + g + '-core GPU'; },
      delta: function (n) { return '≈ +CA$' + n + '/mo'; },
      speedSub: ['Included', '+CA$10/mo', '+CA$20/mo'],
      alt: ' line drawing',
      spec2: function (m, s) { return 'From ' + m + ' memory · ' + s + ' storage'; },
      unitA: '/mo · billed annually', unitM: '/mo · billed monthly',
      smallA: function (x) { return 'Monthly billing from ' + x + '/mo'; },
      smallM: function (x) { return 'Annual billing from ' + x + '/mo'; },
      rec: 'Most popular', pick: 'Configure this Mac',
      eth25: 'Built-in 2.5Gb Ethernet', eth10: '10Gb Ethernet',
      need10: 'This speed tier needs 10Gb', ok25: 'Covers the 1.0–1.5 Gbps tier',
      eth10Sub: function (n) { return 'Apple option · ≈ +CA$' + n + '/mo'; },
      port10: '10Gb Ethernet', port25: 'Built-in 2.5Gb Ethernet', port10Std: '10Gb Ethernet (built-in)',
      line2: function (m, s) { return m + ' memory · ' + s + ' storage'; },
      subA: function (x) { return 'Annual: ' + x + ' up front for 12 months'; }, subM: 'Billed monthly, cancel anytime',
      altA: function (x) { return 'Monthly plan ' + x + '/mo'; }, altM: function (x) { return 'Annual plan ' + x + '/mo'; }
    }
  };

  var D = {
    mini: 'assets/machine-mini.svg',
    studio: 'assets/machine-studio.svg',
    svc: { 'Mac mini': 79, 'Mac Studio': 99 },
    care: { 'Mac mini': 54.99, 'Mac Studio': 89.99 },
    speeds: [
      { t: '1.0–1.5 Gbps', d: 0, v: 1.5 },
      { t: '2.5–3.0 Gbps', d: 10, v: 3 },
      { t: '5.0–8.0 Gbps', d: 20, v: 8 }
    ],
    models: [
      { fam: 'Mac mini', chip: 'M6', base: 1249, k: 1.2, eth: true,
        variants: [{ c: 12, g: 12, d: 0 }],
        mem: [['16GB', 0], ['24GB', 300], ['32GB', 600]],
        st: [['256GB', 0], ['512GB', 300], ['1TB', 750], ['2TB', 1500]] },
      { fam: 'Mac mini', chip: 'M5 Pro', base: 2399, k: 1.25, eth: true, rec: true,
        variants: [{ c: 15, g: 16, d: 0 }, { c: 18, g: 20, d: 300 }],
        mem: [['24GB', 0], ['48GB', 900], ['64GB', 1500]],
        st: [['512GB', 0], ['1TB', 450], ['2TB', 1200], ['4TB', 2700], ['8TB', 5700]] },
      { fam: 'Mac Studio', chip: 'M5 Max', base: 3499, k: 1.25, eth: false,
        variants: [{ c: 18, g: 32, d: 0, mem: [['36GB', 0]] },
                   { c: 18, g: 40, d: 900, mem: [['48GB', 0], ['64GB', 600], ['128GB', 3000]] }],
        st: [['512GB', 0], ['1TB', 450], ['2TB', 1200], ['4TB', 2700], ['8TB', 5700]] },
      { fam: 'Mac Studio', chip: 'M5 Ultra', base: 7799, k: 1.25, eth: false,
        variants: [{ c: 30, g: 64, d: 0 }, { c: 36, g: 80, d: 1950 }],
        mem: [['96GB', 0], ['256GB', 6000]],
        st: [['1TB', 0], ['2TB', 750], ['4TB', 2250], ['8TB', 5250], ['16TB', 11250]] }
    ]
  };

  var DEFAULTS = { m: 1, v: 0, mem: 0, st: 0, eth: 0, speed: 0, pay: 'annual' };

  function r9(x) { return Math.round((x + 1) / 10) * 10 - 1; }
  function money(x) { return 'CA$' + Math.round(x).toLocaleString('en-CA'); }
  // k = model price factor: M6 ×1.2, M5 Pro and above ×1.25 (applied to the whole machine price)
  function priceOf(sale, fam, k) {
    var mo = r9(((sale + D.care[fam]) * 1.5 / 15 + D.svc[fam]) * (k || 1));
    return { mo: mo, yr: r9(mo * 0.8) };
  }
  function opt(label, sub, on, dis, patch) {
    return { label: label, sub: sub || '', on: !!on, dis: !!dis, patch: patch };
  }

  // Same rules as the design canvas: Mac mini needs the 10Gb port above 2.5 Gbps.
  function compute(state, lang, base) {
    var T = L[lang === 'en' ? 'en' : 'zh'];
    base = base || '';
    var core = function (vv) { return T.core(vv.c, vv.g); };
    var s = Object.assign({}, DEFAULTS, state || {});
    var M = D.models[s.m];
    var delta = function (d) { return d > 0 ? T.delta(Math.round(d * 0.1 * M.k)) : ''; };
    var vi = Math.min(s.v, M.variants.length - 1);
    var V = M.variants[vi];
    var memList = V.mem || M.mem;
    var mi = Math.min(s.mem, memList.length - 1);
    var si = Math.min(s.st, M.st.length - 1);
    var spi = D.speeds[s.speed] ? s.speed : 0;
    var sp = D.speeds[spi];
    var needTen = M.eth && sp.v > 2.5;
    var ethOn = M.eth && (s.eth === 1 || needTen);
    var sale = M.base + V.d + memList[mi][1] + M.st[si][1] + (ethOn ? 150 : 0);
    var p = priceOf(sale, M.fam, M.k);
    var net = sp.d;
    var annual = s.pay === 'annual';
    var monthly = (annual ? p.yr : p.mo) + net;
    var total = annual ? (p.yr + net) * 12 + (p.mo + net) * 3 : (p.mo + net) * 15;
    var portText = M.eth ? (ethOn ? T.port10 : T.port25) : T.port10Std;
    var reset = { v: 0, mem: 0, st: 0, eth: 0 };

    return {
      annual: annual,
      cards: D.models.map(function (mm, i) {
        var pp = priceOf(mm.base, mm.fam, mm.k);
        var firstMem = (mm.variants[0].mem || mm.mem)[0][0];
        return {
          sel: i === s.m, isRec: !!mm.rec,
          img: base + (mm.fam === 'Mac mini' ? D.mini : D.studio),
          alt: mm.fam + T.alt, fam: mm.fam, chip: mm.chip,
          spec1: core(mm.variants[0]),
          spec2: T.spec2(firstMem, mm.st[0][0]),
          big: money(annual ? pp.yr : pp.mo),
          unit: annual ? T.unitA : T.unitM,
          small: annual ? T.smallA(money(pp.mo)) : T.smallM(money(pp.yr)),
          rec: T.rec, pick: T.pick,
          patch: Object.assign({ m: i }, reset)
        };
      }),
      optModels: D.models.map(function (mm, i) { return opt(mm.fam + ' ' + mm.chip, '', i === s.m, false, Object.assign({ m: i }, reset)); }),
      optVariants: M.variants.map(function (vv, i) { return opt(core(vv), delta(vv.d), i === vi, false, { v: i, mem: 0 }); }),
      optMems: memList.map(function (mm, i) { return opt(mm[0], delta(mm[1]), i === mi, false, { mem: i }); }),
      optStores: M.st.map(function (ss, i) { return opt(ss[0], delta(ss[1]), i === si, false, { st: i }); }),
      optSpeeds: D.speeds.map(function (x, i) { return opt(x.t, T.speedSub[i], i === spi, false, { speed: i }); }),
      showEth: M.eth,
      optEths: [
        opt(T.eth25, needTen ? T.need10 : T.ok25, !ethOn, needTen, { eth: 0 }),
        opt(T.eth10, T.eth10Sub(Math.round(150 * 0.1 * M.k)), ethOn, false, { eth: 1 })
      ],
      sumImg: base + (M.fam === 'Mac mini' ? D.mini : D.studio),
      sumName: M.fam + ' ' + M.chip,
      sumL1: core(V),
      sumL2: T.line2(memList[mi][0], M.st[si][0]),
      sumL3: portText + ' · ' + sp.t,
      sumPrice: money(monthly),
      sumSub: annual ? T.subA(money((p.yr + net) * 12)) : T.subM,
      sumAlt: annual ? T.altA(money(p.mo + net)) : T.altM(money(p.yr + net)),
      sumTotal: money(total)
    };
  }

  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function patchAttr(p) { return esc(JSON.stringify(p)); }

  function optHTML(list) {
    return list.map(function (o) {
      var cls = o.dis ? 'opt dis' : (o.on ? 'opt on' : 'opt');
      return '<button type="button" class="' + cls + '" aria-pressed="' + (o.on ? 'true' : 'false') + '"' +
        (o.dis ? ' disabled' : '') + ' data-set="' + patchAttr(o.patch) + '">' + esc(o.label) +
        (o.sub ? '<span class="sub">' + esc(o.sub) + '</span>' : '') + '</button>';
    }).join('');
  }

  function cardsHTML(cards) {
    return cards.map(function (c) {
      return '<div class="' + (c.sel ? 'mcard sel' : 'mcard') + '">' +
        (c.isRec ? '<span class="mono" style="position: absolute; top: -11px; left: 20px; background: #f2f2f2; color: #0a0a0a; padding: 3px 10px; border-radius: 3px">' + esc(c.rec) + '</span>' : '') +
        '<div style="background: #0d0d0d; border: 1px solid #1f1f1f; border-radius: 6px; padding: 12px"><img src="' + esc(c.img) + '" alt="' + esc(c.alt) + '" style="width: 100%; height: 140px; object-fit: contain; display: block"></div>' +
        '<span class="mono" style="margin-top: 6px">' + esc(c.fam) + '</span>' +
        '<div style="font-size: 28px; font-weight: 500; color: #f5f5f5">' + esc(c.chip) + '</div>' +
        '<p class="mut" style="font-size: 13px; line-height: 1.6">' + esc(c.spec1) + '<br>' + esc(c.spec2) + '</p>' +
        '<div style="border-top: 1px solid #262626; padding-top: 12px"><span style="font-size: 30px; font-weight: 500; color: #f5f5f5">' + esc(c.big) + '</span><span class="mut" style="font-size: 13px"> ' + esc(c.unit) + '</span></div>' +
        '<div class="mono">' + esc(c.small) + '</div>' +
        '<a href="#configure" class="btn" style="margin-top: 6px" data-set="' + patchAttr(c.patch) + '">' + esc(c.pick) + '</a>' +
        '</div>';
    }).join('');
  }

  // Everything the page shows, keyed by element id (used for the build-time prerender too).
  function views(v) {
    return {
      'cards': cardsHTML(v.cards),
      'opt-models': optHTML(v.optModels),
      'opt-variants': optHTML(v.optVariants),
      'opt-mems': optHTML(v.optMems),
      'opt-stores': optHTML(v.optStores),
      'opt-speeds': optHTML(v.optSpeeds),
      'opt-eths': optHTML(v.optEths)
    };
  }
  var TEXT_IDS = { 'sum-name': 'sumName', 'sum-l1': 'sumL1', 'sum-l2': 'sumL2', 'sum-l3': 'sumL3',
    'sum-price': 'sumPrice', 'sum-sub': 'sumSub', 'sum-alt': 'sumAlt', 'sum-total': 'sumTotal' };

  var api = { compute: compute, views: views, TEXT_IDS: TEXT_IDS, DEFAULTS: DEFAULTS };
  if (typeof window !== 'undefined') window.TLCPricing = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;

  var LANG = (document.documentElement.lang || '').indexOf('en') === 0 ? 'en' : 'zh';
  var me = document.currentScript && document.currentScript.src;
  var BASE = me ? me.replace(/js\/pricing\.js(\?.*)?$/, '') : '';
  var state = Object.assign({}, DEFAULTS);

  function render() {
    var v = compute(state, LANG, BASE);
    var html = views(v);
    Object.keys(html).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.innerHTML = html[id];
    });
    Object.keys(TEXT_IDS).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = v[TEXT_IDS[id]];
    });
    var img = document.getElementById('sum-img');
    if (img) { img.src = v.sumImg; img.alt = v.sumName; }
    var eth = document.getElementById('step-eth');
    if (eth) eth.hidden = !v.showEth;
    var speed = document.getElementById('step-speed');
    if (speed) speed.className = v.showEth ? 'step' : 'step last';
    document.querySelectorAll('[data-pay]').forEach(function (b) {
      var on = (b.getAttribute('data-pay') === 'annual') === v.annual;
      b.className = on ? 'seg on' : 'seg';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-set],[data-pay]');
    if (!t) return;
    if (t.hasAttribute('data-pay')) {
      state.pay = t.getAttribute('data-pay');
    } else {
      if (t.disabled) return;
      Object.assign(state, JSON.parse(t.getAttribute('data-set')));
    }
    render();
  });

  render();
})();
