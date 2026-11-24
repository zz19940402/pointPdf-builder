/*
 * app.js — 控制器
 * 负责：表单 <-> 数据同步、实时预览、增删数组条目、工具栏动作。
 * 它只通过 DataLayer 读写数据、只通过 Render 渲染预览，不直接碰 localStorage/模板细节。
 */

(function (global) {
  'use strict';

  var state = null;                 // 当前数据对象
  var previewEl = null;             // 预览容器

  // 需要同步的简单字段：data 路径 -> 表单 input 的 data-field
  // 数组段落用 data-list + data-idx + data-key 处理，见 bindForm()
  function get(path, obj) {
    return path.split('.').reduce(function (o, k) { return o && o[k]; }, obj);
  }
  function set(path, obj, val) {
    var parts = path.split('.');
    var o = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      if (!o[parts[i]]) o[parts[i]] = {};
      o = o[parts[i]];
    }
    o[parts[parts.length - 1]] = val;
  }

  // 把数据填回表单（导入/重置时调用）
  function fillForm(data) {
    document.querySelectorAll('[data-field]').forEach(function (el) {
      var v = get(el.getAttribute('data-field'), data);
      el.value = v === undefined || v === null ? '' : v;
    });
    // 头像预览（base64 或 URL）
    var av = document.getElementById('avatar-preview');
    if (av) {
      if (data.basic.avatar) { av.src = data.basic.avatar; av.style.display = 'block'; }
      else { av.src = ''; av.style.display = 'none'; }
    }
    // verify 复选框回填
    var vEn = document.getElementById('verify-enabled');
    if (vEn) vEn.checked = !!(data.verify && data.verify.enabled);
  }

  /* ---------- 渲染与保存调度 ----------
   * 输入路径：rAF 合帧渲染（一帧只建一次 DOM）+ 300ms 防抖保存；
   * 结构变化（增删/导入/重置）：立即渲染并保存。 */
  var pendingRender = 0, pendingSave = 0;

  function doRender() {
    if (!previewEl) return;
    var panel = previewEl.parentElement;
    var y = panel ? panel.scrollTop : 0;      // 重建内容后保住预览滚动位置
    previewEl.innerHTML = Render.render(state);
    if (panel) panel.scrollTop = y;
  }

  function flashSaved() {
    var t = document.getElementById('save-tip');
    if (!t) return;
    t.textContent = '已保存';
    t.classList.add('show');
    clearTimeout(flashSaved._t);
    flashSaved._t = setTimeout(function () { t.classList.remove('show'); }, 1200);
  }

  function doSave() {
    if (DataLayer.save(state)) flashSaved();
  }

  function scheduleRender() {
    if (pendingRender) return;
    pendingRender = requestAnimationFrame(function () {
      pendingRender = 0;
      doRender();
    });
  }

  function scheduleSave() {
    clearTimeout(pendingSave);
    pendingSave = setTimeout(doSave, 300);
  }

  // 立即渲染并保存（增删条目、导入、重置等结构变化时用）
  function refresh() {
    doRender();
    doSave();
  }

  // 渲染某个数组段落的表单控件
  function renderList(containerId, listKey, fields, data) {
    var box = document.getElementById(containerId);
    if (!box) return;
    var list = data[listKey] || [];
    box.innerHTML = list.map(function (item, idx) {
      var controls = fields.map(function (f) {
        var val = item[f.key] || '';
        if (f.type === 'textarea') {
          return '<label class="fld"><span>' + f.label + '</span><textarea data-list="' + listKey + '" data-idx="' + idx + '" data-key="' + f.key + '">' + Render.esc(val) + '</textarea></label>';
        }
        return '<label class="fld"><span>' + f.label + '</span><input type="text" data-list="' + listKey + '" data-idx="' + idx + '" data-key="' + f.key + '" value="' + Render.esc(val) + '"/></label>';
      }).join('');
      return '<div class="entry"><div class="entry-bar"><span class="entry-no">#' + (idx + 1) + '</span>' +
        '<button type="button" class="btn-mini danger" data-del="' + listKey + '" data-idx="' + idx + '">删除</button></div>' +
        '<div class="entry-fields">' + controls + '</div></div>';
    }).join('');
  }

  var LIST_FIELDS = {
    education: [
      { key: 'school', label: '学校' }, { key: 'major', label: '专业' },
      { key: 'degree', label: '学历' }, { key: 'start', label: '开始' },
      { key: 'end', label: '结束' }, { key: 'desc', label: '描述', type: 'textarea' }
    ],
    work: [
      { key: 'company', label: '公司' }, { key: 'title', label: '职位' },
      { key: 'start', label: '开始' }, { key: 'end', label: '结束' },
      { key: 'desc', label: '描述', type: 'textarea' }
    ],
    projects: [
      { key: 'name', label: '项目名' }, { key: 'role', label: '角色' },
      { key: 'link', label: '链接' }, { key: 'desc', label: '描述', type: 'textarea' }
    ],
    skills: [
      { key: 'category', label: '分类' }, { key: 'items', label: '内容(逗号分隔)', type: 'textarea' }
    ],
    certs: [
      { key: 'name', label: '证书名' }, { key: 'date', label: '日期' }
    ]
  };

  function renderAllLists() {
    Object.keys(LIST_FIELDS).forEach(function (k) {
      renderList('list-' + k, k, LIST_FIELDS[k], state);
    });
  }

  // 只重绘受影响的列表，避免其它列表输入框失焦
  function renderOne(key) {
    renderList('list-' + key, key, LIST_FIELDS[key], state);
  }

  // 事件：用一个委托监听整个表单区，减少绑定次数
  function bindEvents() {
    var form = document.getElementById('form-area');

    // 简单字段 + 数组字段 的输入事件
    form.addEventListener('input', function (e) {
      var el = e.target;
      if (el.hasAttribute('data-field')) {
        set(el.getAttribute('data-field'), state, el.value);
        scheduleRender();
        scheduleSave();
      } else if (el.hasAttribute('data-list')) {
        var key = el.getAttribute('data-list');
        var idx = parseInt(el.getAttribute('data-idx'), 10);
        var fk = el.getAttribute('data-key');
        var val = el.value;
        // skills.items 是数组：逗号分隔 -> 数组
        if (key === 'skills' && fk === 'items') {
          val = val.split(/[,，]/).map(function (x) { return x.trim(); }).filter(Boolean);
        }
        state[key][idx][fk] = val;
        scheduleRender();
        scheduleSave();
      }
    });

    // 删除数组条目
    form.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-del]');
      if (!btn) return;
      var key = btn.getAttribute('data-del');
      var idx = parseInt(btn.getAttribute('data-idx'), 10);
      state[key].splice(idx, 1);
      renderOne(key);
      refresh();
    });

    // 新增数组条目
    document.querySelectorAll('[data-add]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-add');
        var blank = {};
        LIST_FIELDS[key].forEach(function (f) { blank[f.key] = f.type === 'textarea' ? '' : ''; });
        if (key === 'skills') blank.items = [];
        state[key].push(blank);
        renderOne(key);
        refresh();
        // 新条目首字段自动聚焦
        var box = document.getElementById('list-' + key);
        var first = box && box.querySelector('.entry:last-child input, .entry:last-child textarea');
        if (first) first.focus();
      });
    });

    // 工具栏
    document.getElementById('btn-print').addEventListener('click', function () { global.print(); });
    document.getElementById('btn-reset').addEventListener('click', function () {
      confirmBox('确定清空所有内容？此操作不可撤销。').then(function (ok) {
        if (!ok) return;
        state = DataLayer.empty();
        fillForm(state); renderAllLists(); refresh();
      });
    });
    document.getElementById('btn-sample').addEventListener('click', function () {
      confirmBox('载入示例数据会覆盖当前内容，确定？').then(function (ok) {
        if (!ok) return;
        state = DataLayer.sample();
        fillForm(state); renderAllLists(); refresh();
      });
    });
    document.getElementById('btn-export').addEventListener('click', function () {
      DataLayer.exportJSON(state, 'resume-' + (state.basic.name || 'backup') + '.json');
    });
    document.getElementById('btn-import').addEventListener('click', function () {
      document.getElementById('file-import').click();
    });
    document.getElementById('file-import').addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      DataLayer.importJSON(file).then(function (data) {
        state = data; fillForm(state); renderAllLists(); refresh();
        toast('导入成功');
      }).catch(function (err) { toast('导入失败：' + err.message); });
      e.target.value = '';
    });
    // 照片上传：读文件 -> 压缩到指定边长 -> base64 存进 basic.avatar
    document.getElementById('btn-upload-photo').addEventListener('click', function () {
      document.getElementById('file-photo').click();
    });
    document.getElementById('file-photo').addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      if (!/^image\//.test(file.type)) { toast('请选择图片文件'); return; }
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          try {
            var MAX = 400; // 头像压缩到最长边 400px，够打印且省空间
            var scale = Math.min(1, MAX / Math.max(img.width, img.height));
            var w = Math.round(img.width * scale), h = Math.round(img.height * scale);
            var cv = document.createElement('canvas');
            cv.width = w; cv.height = h;
            cv.getContext('2d').drawImage(img, 0, 0, w, h);
            var dataUrl = cv.toDataURL('image/jpeg', 0.82);
            state.basic.avatar = dataUrl;
            var av = document.getElementById('avatar-preview');
            if (av) { av.src = dataUrl; av.style.display = 'block'; }
            refresh();
          } catch (err) { toast('图片处理失败：' + err.message); }
        };
        img.onerror = function () { toast('图片加载失败'); };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });

    // verify 复选框
    var vEn = document.getElementById('verify-enabled');
    if (vEn) vEn.addEventListener('change', function () {
      if (!state.verify) state.verify = {};
      state.verify.enabled = vEn.checked;
      refresh();
    });
  }

  function init() {
    previewEl = document.getElementById('preview');
    state = DataLayer.load();
    // 第一次打开（没有任何存档）时载入示例，让用户立刻看到效果
    if (!DataLayer.hasData()) state = DataLayer.sample();
    fillForm(state);
    renderAllLists();
    refresh();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.App = { init: init };
})(window);
