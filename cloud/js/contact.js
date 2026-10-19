/* UNSHARED — booking form (contact.html)
 *
 * 自动提交可使用 Web3Forms（https://web3forms.com）。上线前必须用
 * adminunsharedtrt@gmail.com 注册并确认一个新的 Access Key，再填到下面。
 * 原镜像里的 Key 无法证明收件人，已经停用，避免客户资料发给未知收件箱。
 * Key 留空时，表单会打开一封收件人为下方邮箱的邮件草稿，不会假装已经发送。
 */
var WEB3FORMS_KEY = '';
var FORM_ENDPOINT = 'https://api.web3forms.com/submit';
var DIRECT_EMAIL = 'adminunsharedtrt@gmail.com';

(function () {
  'use strict';
  var form = document.getElementById('booking-form');
  var sent = document.getElementById('sent-box');
  var again = document.getElementById('send-again');
  var note = document.getElementById('form-note');
  var mailFallback = document.getElementById('mail-fallback');
  var mailAppLink = document.getElementById('open-mail-app');
  var gmailLink = document.getElementById('open-gmail-web');
  var copyMailBtn = document.getElementById('copy-mail-content');
  var currentDraft = '';
  if (!form || !sent) return;
  var submitBtn = form.querySelector('button[type="submit"]');
  var EN = (document.documentElement.lang || '').indexOf('en') === 0;
  var MSG = EN ? {
    mail: 'We tried to open your email app. If nothing opened, use one of the options below.',
    copied: 'Email address, subject and request details copied. Paste them into any email app and send.',
    copyFail: 'Copy did not work. Please open Gmail on the web or email us directly.',
    fail: 'That did not go through. Please try again later, or reach us by email or WeChat.'
  } : {
    mail: '已尝试打开邮件应用。如果没有反应，请使用下面的备用方式。',
    copied: '收件邮箱、主题和预约内容已复制。粘贴到任意邮件应用并发送即可。',
    copyFail: '复制失败，请打开 Gmail 网页版，或直接发送邮件联系我们。',
    fail: '提交没有成功，请稍后再试，或通过右侧的邮箱、微信联系我们。'
  };

  function showNote(msg) {
    note.textContent = msg;
    note.hidden = false;
  }

  function openEmailDraft(data) {
    var labels = EN ? [
      ['name', 'Name'], ['company', 'Company / team'], ['industry', 'Industry'],
      ['email', 'Reply email'], ['im', 'WeChat / other contact'], ['model', 'Model'],
      ['quantity', 'Quantity'], ['billing', 'Billing'], ['speed', 'Speed'],
      ['use', 'Main uses'], ['notes', 'Notes']
    ] : [
      ['name', '姓名'], ['company', '公司 / 团队'], ['industry', '所处行业'],
      ['email', '回复邮箱'], ['im', '微信 / 其他联系方式'], ['model', '感兴趣的机型'],
      ['quantity', '数量'], ['billing', '付款方式'], ['speed', '网速需求'],
      ['use', '主要用途'], ['notes', '补充说明']
    ];
    var lines = [];
    labels.forEach(function (item) {
      var values = data.getAll(item[0]).filter(function (value) { return value; });
      if (values.length) lines.push(item[1] + ': ' + values.join(', '));
    });
    var subject = EN ? 'Booking request — UNSHARED' : '预约咨询 — UNSHARED';
    var body = lines.join('\n');
    var mailto = 'mailto:' + DIRECT_EMAIL
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body);
    var gmail = 'https://mail.google.com/mail/?view=cm&fs=1'
      + '&to=' + encodeURIComponent(DIRECT_EMAIL)
      + '&su=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body);
    currentDraft = (EN ? 'To: ' : '收件人：') + DIRECT_EMAIL + '\n'
      + (EN ? 'Subject: ' : '主题：') + subject + '\n\n' + body;
    mailAppLink.href = mailto;
    gmailLink.href = gmail;
    mailFallback.hidden = false;
    showNote(MSG.mail);
    mailAppLink.click();
  }

  function copyDraft() {
    if (!currentDraft) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(currentDraft)
        .then(function () { showNote(MSG.copied); })
        .catch(function () { legacyCopyDraft(); });
      return;
    }
    legacyCopyDraft();
  }

  function legacyCopyDraft() {
    var box = document.createElement('textarea');
    box.value = currentDraft;
    box.setAttribute('readonly', '');
    box.style.position = 'fixed';
    box.style.opacity = '0';
    document.body.appendChild(box);
    box.select();
    try {
      if (!document.execCommand('copy')) throw new Error('copy failed');
      showNote(MSG.copied);
    } catch (err) {
      showNote(MSG.copyFail);
    }
    document.body.removeChild(box);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    note.hidden = true;
    var data = new FormData(form);
    if (!WEB3FORMS_KEY) {
      openEmailDraft(data);
      return;
    }
    submitBtn.disabled = true;
    data.append('access_key', WEB3FORMS_KEY);
    data.append('from_name', "UNSHARED Website");
    data.append('subject', EN ? "New booking request — UNSHARED" : "新的预约咨询 — UNSHARED");
    fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res || !res.success) throw new Error((res && res.message) || 'failed');
        form.reset();
        form.hidden = true;
        sent.hidden = false;
        sent.focus();
      })
      .catch(function () {
        showNote(MSG.fail);
      })
      .then(function () { submitBtn.disabled = false; });
  });

  again.addEventListener('click', function () {
    sent.hidden = true;
    form.hidden = false;
    var first = form.querySelector('input');
    if (first) first.focus();
  });

  copyMailBtn.addEventListener('click', copyDraft);
})();
