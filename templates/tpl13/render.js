/*
 * render.js — 渲染层 v4（仿 tpl13：左侧青绿侧栏 + 右侧白主栏）
 * 左栏：头像/姓名/联系方式/技能/证书/验证  右栏：简介/工作/教育/项目
 */

(function (global) {
  'use strict';

  function esc(s) {
    if (s === undefined || s === null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function lines(s) {
    if (!s) return '';
    return String(s).split(/\r?\n/).filter(function (x) { return x.trim(); })
      .map(function (x) { return '<p class="desc">' + esc(x) + '</p>'; }).join('');
  }

  function dateRange(a, b) {
    var l = esc(a || ''), r = esc(b || '');
    if (l && r) return l + ' — ' + r;
    return l || r || '';
  }

  function tlItem(head, sub, meta, desc) {
    var h = '<div class="tl-head"><span class="tl-title">' + head + '</span>' +
      (meta ? '<span class="tl-meta">' + meta + '</span>' : '') + '</div>';
    var s = sub ? '<div class="tl-sub">' + sub + '</div>' : '';
    return '<div class="tl-item">' + h + s + desc + '</div>';
  }

  function sec(title, body) {
    if (!body || !body.trim()) return '';
    return '<section class="sec"><h2 class="sec-title">' + esc(title) + '</h2>' + body + '</section>';
  }

  function renderWork(list) {
    if (!list || !list.length) return '';
    return sec('工作经历', '<div class="timeline">' + list.map(function (w) {
      return tlItem(esc(w.company), esc(w.title), dateRange(w.start, w.end), lines(w.desc));
    }).join('') + '</div>');
  }
  function renderEdu(list) {
    if (!list || !list.length) return '';
    return sec('教育经历', '<div class="timeline">' + list.map(function (e) {
      return tlItem(esc(e.school), esc(e.major) + (e.major && e.degree ? ' · ' : '') + esc(e.degree),
        dateRange(e.start, e.end), lines(e.desc));
    }).join('') + '</div>');
  }
  function renderProjects(list) {
    if (!list || !list.length) return '';
    return sec('项目经历', '<div class="timeline">' + list.map(function (p) {
      var sub = esc(p.role) + (p.link ? ' · ' + esc(p.link) : '');
      return tlItem(esc(p.name), sub, '', lines(p.desc));
    }).join('') + '</div>');
  }
  function renderSkills(list) {
    if (!list || !list.length) return '';
    var html = list.map(function (s) {
      if (!s.category && !(s.items && s.items.length)) return '';
      var items = Array.isArray(s.items) ? s.items : [];
      var tags = items.map(function (i) { return '<span class="tag">' + esc(i) + '</span>'; }).join('');
      return '<div class="skill-row"><div class="skill-cat">' + esc(s.category) +
        '</div><div class="skill-items">' + tags + '</div></div>';
    }).join('');
    return sec('技能特长', html);
  }
  function renderCerts(list) {
    if (!list || !list.length) return '';
    var html = list.map(function (c) {
      return '<div class="cert-row"><span>' + esc(c.name) + '</span>' +
        (c.date ? '<span class="side-meta">' + esc(c.date) + '</span>' : '') + '</div>';
    }).join('');
    return sec('证书', html);
  }
  function renderVerify(v) {
    if (!v || !v.enabled) return '';
    var badge = '<div class="verify-badge">✓ 学历已验证</div>';
    var detail = '';
    if (v.chsiSchool || v.chsiDegree || v.chsiName) {
      detail = '<div class="verify-detail">' +
        [v.chsiName, v.chsiSchool, v.chsiDegree].filter(Boolean).map(esc).join('<br/>') + '</div>';
    }
    if (v.chsiCode) detail += '<div class="verify-code">验证号：' + esc(v.chsiCode) + '</div>';
    if (v.chsiUrl) detail += '<div class="verify-url">' + esc(v.chsiUrl) + '</div>';
    return sec('学历验证', badge + detail);
  }

  function render(data) {
    var b = data.basic || {};
    var intent = data.intent || {};

    // 联系方式（侧栏）
    var contactHtml = '';
    if (b.phone) contactHtml += '<div class="contact-line"><span class="ci">☎</span>' + esc(b.phone) + '</div>';
    if (b.email) contactHtml += '<div class="contact-line"><span class="ci">✉</span>' + esc(b.email) + '</div>';
    if (b.city)  contactHtml += '<div class="contact-line"><span class="ci">⌖</span>' + esc(b.city) + '</div>';
    var extra = [b.gender, b.age ? (b.age + '岁') : ''].filter(Boolean).join(' · ');
    if (extra) contactHtml += '<div class="contact-line"><span class="ci">◷</span>' + esc(extra) + '</div>';

    // 左侧栏
    var side =
      '<div class="side-photo">' +
        (b.avatar ? '<img src="' + esc(b.avatar) + '" alt="头像"/>' : '<div class="photo-ph">照片</div>') +
      '</div>' +
      (contactHtml ? '<div class="side-block">' + contactHtml + '</div>' : '') +
      renderSkills(data.skills) +
      renderCerts(data.certs) +
      renderVerify(data.verify);

    // 右侧主栏（姓名在顶部）
    var head =
      '<h1 class="name">' + esc(b.name || '你的名字') + '</h1>' +
      (b.title ? '<div class="head-title">' + esc(b.title) + '</div>' : '') +
      ((intent.target || intent.expectedSalary) ?
        '<div class="intent">求职意向：' + esc(intent.target) +
        (intent.target && intent.expectedSalary ? ' ｜ ' : '') + esc(intent.expectedSalary) + '</div>' : '');

    var main =
      '<div class="main-head">' + head + '</div>' +
      (data.summary ? sec('个人简介', '<p class="desc">' + esc(data.summary) + '</p>') : '') +
      renderWork(data.work) +
      renderEdu(data.education) +
      renderProjects(data.projects);

    return '<article class="resume-page">' +
      '<aside class="side">' + side + '</aside>' +
      '<div class="main">' + main + '</div>' +
      '</article>';
  }

  global.Render = { render: render, esc: esc };
})(window);
