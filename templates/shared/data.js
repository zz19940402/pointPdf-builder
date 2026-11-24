/*
 * data.js — 数据层
 * 现在：localStorage 读写。
 * 以后接后端：只改 load()/save() 两个函数，改成 fetch('/api/resume') 即可，
 * 上层 render.js / app.js 完全不用动 —— 这就是为后端留的桥。
 */

(function (global) {
  'use strict';

  var STORAGE_KEY = 'pointPdf-builder:resume:v1';

  // 冻结的 JSON 协议：所有字段都可选，所有段落都是数组。
  function emptyResume() {
    return {
      basic: { name: '', phone: '', email: '', city: '', avatar: '', title: '', age: '', gender: '' },
      intent: { target: '', expectedSalary: '' },
      education: [],
      work: [],
      projects: [],
      skills: [],
      certs: [],
      summary: '',
      // 学信网验证（无需官方授权的可落地版）：填验证号+链接，简历上标"已验证"
      verify: { chsiCode: '', chsiUrl: '', chsiName: '', chsiSchool: '', chsiDegree: '', enabled: false }
    };
  }

  // 深拷贝（避免示例数据污染默认值）
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // 读取：把 localStorage 里的字符串解析成 JSON；坏数据回退到空模板。
  function load() {
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyResume();
      var data = JSON.parse(raw);
      // 逐段补齐，防止旧版本/导入文件缺字段导致渲染崩
      var base = emptyResume();
      Object.keys(base).forEach(function (k) {
        if (data[k] === undefined || data[k] === null) data[k] = base[k];
      });
      ['education', 'work', 'projects', 'skills', 'certs'].forEach(function (k) {
        if (!Array.isArray(data[k])) data[k] = [];
      });
      if (!data.verify || typeof data.verify !== 'object') data.verify = base.verify;
      return data;
    } catch (e) {
      console.warn('[data] load failed, using empty resume', e);
      return emptyResume();
    }
  }

  // 判断是否已有存档（供上层决定是否进示例数据，避免绕过数据层摸存储）
  function hasData() {
    try { return global.localStorage.getItem(STORAGE_KEY) !== null; }
    catch (e) { return false; }
  }

  // 保存：脏检查，内容没变就不写盘；由调用方防抖后到达这里。
  var lastSerialized = '';
  function save(data) {
    try {
      var s = JSON.stringify(data);
      if (s === lastSerialized) return true;
      global.localStorage.setItem(STORAGE_KEY, s);
      lastSerialized = s;
      return true;
    } catch (e) {
      console.warn('[data] save failed', e);
      return false;
    }
  }

  // 导出 JSON 备份：触发浏览器下载。
  function exportJSON(data, filename) {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename || 'resume.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 导入 JSON 备份：返回 Promise<data>。
  function importJSON(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          var base = emptyResume();
          Object.keys(base).forEach(function (k) {
            if (data[k] === undefined) data[k] = base[k];
          });
          resolve(data);
        } catch (e) {
          reject(new Error('JSON 解析失败：' + e.message));
        }
      };
      reader.onerror = function () { reject(new Error('文件读取失败')); };
      reader.readAsText(file, 'utf-8');
    });
  }

  // 一份示例数据，方便第一次打开看到效果、也方便你自己改着用。
  function sample() {
    return {
      basic: {
        name: '张三',
        title: '求职意向：后端开发工程师',
        phone: '138-0000-0000',
        email: 'zhangsan@example.com',
        city: '上海',
        avatar: '',
        age: '24',
        gender: '男'
      },
      intent: { target: '后端开发 / Java 方向', expectedSalary: '面议' },
      education: [{
        school: '某某大学',
        major: '计算机科学与技术',
        degree: '本科',
        start: '2018-09',
        end: '2022-06',
        desc: '主修数据结构、操作系统、计算机网络。'
      }],
      work: [{
        company: '某某科技有限公司',
        title: 'Java 开发实习生',
        start: '2021-07',
        end: '2022-03',
        desc: '参与订单系统的接口开发与单元测试，负责部分模块的重构。'
      }],
      projects: [{
        name: 'mock-auth 登录系统',
        role: '独立开发',
        link: '',
        desc: '实现手机号验证码登录、模拟微信授权等 7 个 API；用 Spring Boot + H2 完成。'
      }],
      skills: [
        { category: '语言', items: ['Java', 'SQL', 'JavaScript'] },
        { category: '框架', items: ['Spring Boot', 'MyBatis'] }
      ],
      certs: [{ name: '计算机二级', date: '2019-12' }],
      summary: '热爱技术，学习能力强，有完整的 Web 项目开发经验。',
      verify: {
        chsiCode: '', chsiUrl: '', chsiName: '', chsiSchool: '', chsiDegree: '', enabled: false
      }
    };
  }

  global.DataLayer = {
    empty: emptyResume,
    sample: sample,
    clone: clone,
    load: load,
    hasData: hasData,
    save: save,
    exportJSON: exportJSON,
    importJSON: importJSON,
    STORAGE_KEY: STORAGE_KEY
  };
})(window);
