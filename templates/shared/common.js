/* common.js — 公共渲染工具（4 个模板共用） */
(function (global) {
  'use strict';
  function esc(s){if(s==null)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function lines(s){if(!s)return'';return String(s).split(/\r?\n/).filter(function(x){return x.trim()}).map(function(x){return '<p>'+esc(x)+'</p>'}).join('');}
  function dr(a,b){a=esc(a||'');b=esc(b||'');return(a&&b)?(a+' — '+b):(a||b||'');}
  function contacts(b){var a=[];if(b.phone)a.push('☎ '+esc(b.phone));if(b.email)a.push('✉ '+esc(b.email));if(b.city)a.push('⌖ '+esc(b.city));var ex=[b.gender,b.age?(b.age+'岁'):''].filter(Boolean).join(' · ');if(ex)a.push(esc(ex));return a;}
  function verifyBox(v){if(!v||!v.enabled)return'';var s='<div class="vbox"><b>✓ 学历已验证</b>';if(v.chsiSchool||v.chsiDegree||v.chsiName)s+='<div>'+[v.chsiName,v.chsiSchool,v.chsiDegree].filter(Boolean).map(esc).join(' · ')+'</div>';if(v.chsiCode)s+='<div class="vk">验证号：'+esc(v.chsiCode)+'</div>';if(v.chsiUrl)s+='<div class="vk">'+esc(v.chsiUrl)+'</div>';return s+'</div>';}
  global.H = { esc:esc, lines:lines, dr:dr, contacts:contacts, verifyBox:verifyBox };
  // 让各 render 文件里的裸函数调用生效
  global.esc=esc; global.lines=lines; global.dr=dr; global.contacts=contacts; global.verifyBox=verifyBox;
  /* ---------- 轻量弹层：toast 提示 + 自绘确认框（替代原生 confirm/alert） ---------- */

  function toast(msg, ms) {
    var el = document.getElementById('__toast');
    if (!el) {
      el = document.createElement('div');
      el.id = '__toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    // 先移除再下一帧加回，保证连续调用时淡入动画重放
    el.classList.remove('show');
    requestAnimationFrame(function () { el.classList.add('show'); });
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('show'); }, ms || 1800);
  }

  function confirmBox(msg) {
    return new Promise(function (resolve) {
      var mask = document.createElement('div');
      mask.className = 'modal-mask';
      mask.innerHTML =
        '<div class="modal" role="dialog" aria-modal="true"><p>' + esc(msg) + '</p>' +
        '<div class="modal-act">' +
        '<button type="button" class="btn btn-ghost" data-r="0">取消</button>' +
        '<button type="button" class="btn" data-r="1">确定</button>' +
        '</div></div>';
      mask.addEventListener('click', function (e) {
        var b = e.target.closest('[data-r]');
        if (b) { resolve(b.getAttribute('data-r') === '1'); mask.remove(); }
        else if (e.target === mask) { resolve(false); mask.remove(); }
      });
      document.body.appendChild(mask);
      mask.querySelector('[data-r="1"]').focus();
    });
  }

  global.toast = toast;
  global.confirmBox = confirmBox;
})(window);
