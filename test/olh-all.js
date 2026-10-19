/*
  官方LINE小幫手：把「批次上標籤」「批次發訊息」「批次發成績」三個小工具放在同一個視窗。
  用法：在 chat.line.biz 按書籤列的「官方LINE小幫手」。
  三個工具的程式本身沒有改，build_install_page.py 會把它們包進下面的 __TOOLS__ 位置，
  只把「放到網頁上」那一行改成「放進分頁」。
  注意：本檔案只能用 區塊註解，不要用雙斜線註解（做成書籤時會壞掉）。
*/
(function () {
  'use strict';

  /* 版本編號：每次改完要更新之前，先把這裡加一（例如 1.2 → 1.3），日期也改成今天，
     再執行 build_install_page.py，先 publish.py test 給管理者試用，確認沒問題才 publish.py release，
     並在「更新紀錄.txt」寫一行改了什麼。 */
  var VERSION = '1.28', VERSION_DATE = '2026/10/19';

  var SHELL_ID = 'olh-shell-2026';
  var botId = location.pathname.split('/')[1] || '';

  var old = document.getElementById(SHELL_ID);
  if (old) {
    var sameBot = old.getAttribute('data-bot') === botId, sameVer = old.getAttribute('data-ver') === VERSION;
    if (sameBot && sameVer) {
      old.style.display = old.style.display === 'none' ? 'flex' : 'none';
      return;
    }
    /* 換了帳號（舊視窗裡的資料是上一個帳號的），或換了新版書籤：要重開 */
    if (!confirm(!sameBot ? 'LINE 帳號已經換了。\n要用新帳號重新開啟小幫手嗎？（剛才視窗裡的內容會清掉）'
      : '畫面上開著的是舊版（v' + old.getAttribute('data-ver') + '），要換成新版 v' + VERSION + ' 嗎？（剛才視窗裡的內容會清掉）')) return;
    if (window.__olhUnload) window.removeEventListener('beforeunload', window.__olhUnload);
    old.parentNode.removeChild(old);
  }

  if (location.hostname !== 'chat.line.biz' || !/^U[0-9a-f]{32}$/.test(botId)) {
    alert('請先打開 LINE 官方帳號的聊天後台（chat.line.biz），並選好要用的帳號，再按一次。');
    return;
  }

  /* 舊的單獨書籤視窗還開著的話，會和小幫手打架，請先重新整理 */
  if (['lt-panel-2026', 'lg-panel-2026', 'lm-panel-2026'].some(function (id) { return document.getElementById(id); })) {
    alert('這個頁面上還開著舊的小工具視窗。\n請先按 F5 重新整理頁面，再按「官方LINE小幫手」。');
    return;
  }

  var TABS = [
    { key: 'tag', name: '批次上標籤', color: '#ef6c00' },
    { key: 'msg', name: '批次發訊息', color: '#6a1b9a' },
    { key: 'grade', name: '批次發成績', color: '#1565c0' }
    /* 回覆小幫手：2026/10/19 管理者說先不要放，要用時把下面這行和 build_install_page.py 的 assist 那行打開
    , { key: 'assist', name: '回覆小幫手', color: '#00897b' } */
  ];

  var S = '#' + SHELL_ID;
  var css = '' +
    S + '{position:fixed;top:12px;right:12px;width:560px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);z-index:2147483000;display:flex;flex-direction:column;background:#fff;color:#222;border:1px solid #cfd8dc;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,.28);font:14px/1.5 "Microsoft JhengHei","PingFang TC",sans-serif;overflow:hidden;resize:both;min-width:360px;min-height:180px}' +
    S + ' .olh-set{flex:none;display:none;background:#e8f5e9;border-bottom:1px solid #c8e6c9;padding:5px 12px;align-items:center;gap:6px;flex-wrap:wrap;font-size:13px}' +
    S + '.olh-set-on .olh-set{display:flex}' +
    S + ' .olh-sbtn{padding:1px 9px;border:1px solid #06c755;background:#fff;color:#06a046;border-radius:6px;cursor:pointer;font-size:13px;line-height:1.5}' +
    S + ' .olh-sbtn:hover{background:#f1fbf4}' +
    S + ' .olh-zv{min-width:40px;text-align:center;font-weight:bold;font-size:13px}' +
    S + ' .olh-set-h{flex-basis:100%;font-size:12px;color:#555}' +
    S + ' .olh-head{flex:none;background:#06c755;color:#fff;padding:5px 8px 5px 12px;display:flex;align-items:center;gap:6px;cursor:move;user-select:none}' +
    S + ' .olh-title{flex:1;min-width:0}' +
    S + ' .olh-title b{display:block;font-size:15px;line-height:1.3}' +
    S + ' .olh-ver{font-size:12px;font-weight:normal;background:rgba(255,255,255,.25);border-radius:8px;padding:1px 7px;margin-left:4px;vertical-align:2px}' +
    S + ' .olh-title span{display:block;font-size:12px;opacity:.92}' +
    S + ' .olh-hbtn{flex:none;cursor:pointer;background:rgba(255,255,255,.18);border:none;color:#fff;font-size:16px;line-height:1;width:26px;height:26px;border-radius:6px}' +
    S + ' .olh-hbtn:hover{background:rgba(255,255,255,.35)}' +
    S + ' .olh-acct{flex:none;background:#fff8e1;border-bottom:2px solid #ffca28;padding:8px 14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}' +
    S + ' .olh-acct-l{font-size:15px;color:#555}' +
    S + ' .olh-acct-n{font-size:22px;font-weight:bold;color:#b71c1c;background:#fff;border:2px solid #ffca28;border-radius:8px;padding:0 12px;line-height:1.5}' +
    S + ' .olh-acct-h{font-size:12px;color:#777;flex-basis:100%}' +
    S + '.olh-min .olh-acct-h{display:none}' +
    /* 三個工具各自的「目前帳號」小框，改由上面這一條統一顯示 */
    S + ' .lt-box:has(.lt-bot),' + S + ' .lg-box:has(.lg-bot){display:none!important}' +
    S + ' .olh-tabs{flex:none;display:flex;gap:6px;padding:8px 10px 0;background:#f5f7f8;border-bottom:1px solid #dfe5e8}' +
    S + ' .olh-tabs button{flex:1;padding:8px 6px;border:1px solid #dfe5e8;border-bottom:none;background:#fff;color:#555;border-radius:8px 8px 0 0;font-size:15px;cursor:pointer;margin-bottom:-1px}' +
    S + ' .olh-tabs button.on{color:#fff;font-weight:bold}' +
    S + ' .olh-main{flex:1;min-height:0;overflow:auto}' +
    S + '.olh-min .olh-tabs,' + S + '.olh-min .olh-main,' + S + '.olh-min .olh-set{display:none!important}' +
    S + '.olh-min{width:320px!important;height:auto!important;min-height:0;resize:none}' +
    /* 三個工具原本是各自浮在畫面上的視窗，放進分頁後改成普通區塊，並藏起它們自己的標題列 */
    S + ' #lt-panel-2026,' + S + ' #lg-panel-2026,' + S + ' #lm-panel-2026,' + S + ' #la-panel-2026{position:static!important;width:auto!important;max-width:none!important;max-height:none!important;overflow:visible!important;border:none!important;border-radius:0!important;box-shadow:none!important;z-index:auto!important}' +
    S + ' .lt-head,' + S + ' .lg-head{display:none!important}' +
    /* 最上面的「上次沒發完的工作」橫幅、發送紀錄總表 */
    S + ' .olh-pend{flex:none;background:#ffebee;border-bottom:3px solid #e53935;padding:8px 14px;color:#b71c1c}' +
    S + ' .olh-pend b.t{font-size:16px}' +
    S + ' .olh-pend .row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:6px;background:#fff;border:1px solid #ef9a9a;border-radius:8px;padding:6px 8px;color:#222}' +
    S + ' .olh-pbtn{padding:5px 12px;border-radius:6px;border:1px solid #c62828;background:#c62828;color:#fff;font-size:14px;font-weight:bold;cursor:pointer}' +
    S + ' .olh-pbtn.sec{background:#fff;color:#c62828;font-weight:normal}' +
    S + ' .olh-logview{flex:none;max-height:55%;overflow:auto;border-bottom:2px solid #06c755;background:#fff;padding:8px 10px}' +
    S + ' .olh-logview table{border-collapse:collapse;font-size:12px;width:100%}' +
    S + ' .olh-logview th,' + S + ' .olh-logview td{border:1px solid #ddd;padding:3px 5px;white-space:nowrap}' +
    S + ' .olh-logview th{background:#f5f7f8}' +
    S + ' .olh-set input.olh-in{padding:3px 6px;border:1px solid #ccc;border-radius:6px;font-size:14px}' +
    S + '.olh-min .olh-pend .row,' + S + '.olh-min .olh-logview{display:none!important}';

  var shell = document.createElement('div');
  shell.id = SHELL_ID;
  shell.setAttribute('data-bot', botId);
  shell.setAttribute('data-ver', VERSION);
  shell.innerHTML = '<style>' + css + '</style>' +
    '<div class="olh-head" title="按住這裡可以拖動視窗">' +
    '<div class="olh-title"><b>官方LINE小幫手 <small class="olh-ver" title="版本日期 ' + VERSION_DATE + '">v' + VERSION + '</small>' +
    (window.__olhTest ? ' <small class="olh-ver" style="background:#d32f2f">測試版</small>' : '') + '</b><span>鼎盛文教事業（高群、金頭腦資優、空中美語）</span></div>' +
    '<button class="olh-hbtn olh-set-btn" title="顯示設定：字的大小、視窗大小">⚙</button>' +
    '<button class="olh-hbtn olh-min-btn" title="縮小／放大">－</button>' +
    '<button class="olh-hbtn olh-close" title="關閉">×</button></div>' +
    '<div class="olh-set"><b>縮放比例</b><button class="olh-sbtn olh-zdn" title="縮小">－</button><span class="olh-zv">100%</span>' +
    '<button class="olh-sbtn olh-zup" title="放大">＋</button><button class="olh-sbtn olh-reset">恢復預設</button>' +
    '<button class="olh-sbtn olh-logbtn">📋 發送紀錄總表</button>' +
    '<span class="olh-set-h">視窗大小：拖視窗<b>右下角</b>的斜線調整。設定會記在這台電腦。</span></div>' +
    '<div class="olh-logview" style="display:none"></div>' +
    '<div class="olh-pend" style="display:none"></div>' +
    '<div class="olh-acct"><span class="olh-acct-l">目前帳號</span><span class="olh-acct-n">讀取中…</span>' +
    '<span class="olh-acct-h">帳號不對？先到 LINE 後台左上角切換帳號，再按一次書籤。</span></div>' +
    '<div class="olh-tabs">' + TABS.map(function (t) { return '<button data-k="' + t.key + '">' + t.name + '</button>'; }).join('') + '</div>' +
    '<div class="olh-main">' + TABS.map(function (t) { return '<div class="olh-slot" data-k="' + t.key + '" style="display:none"></div>'; }).join('') + '</div>';
  document.body.appendChild(shell);

  var q = function (s) { return shell.querySelector(s); };
  var slot = function (k) { return shell.querySelector('.olh-slot[data-k="' + k + '"]'); };
  var TAB_KEY = 'olh-tab', POS_KEY = 'olh-pos';
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  /* ========== 目前帳號 ========== */
  fetch('/api/v1/bots/' + botId + '?noFilter=true', { headers: { 'Accept': 'application/json' }, credentials: 'same-origin' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (b) { botName = b.name || botId; q('.olh-acct-n').textContent = botName; })
    .catch(function () { q('.olh-acct-n').textContent = '（讀不到帳號名稱）'; });

  /* ========== 分頁 ========== */
  function showTab(k) {
    TABS.forEach(function (t) {
      var b = q('.olh-tabs button[data-k="' + t.key + '"]'), on = t.key === k;
      b.classList.toggle('on', on);
      b.style.background = on ? t.color : '#fff';
      b.style.borderColor = on ? t.color : '#dfe5e8';
      slot(t.key).style.display = on ? '' : 'none';
    });
    q('.olh-main').scrollTop = 0;
    save(TAB_KEY, k);
  }
  shell.querySelectorAll('.olh-tabs button').forEach(function (b) { b.onclick = function () { showTab(this.getAttribute('data-k')); }; });

  /* ========== 拖動視窗（按住綠色標題列） ========== */
  function clamp(x, y) {
    var w = shell.offsetWidth, vw = window.innerWidth, vh = window.innerHeight;
    return [Math.min(Math.max(x, 60 - w), vw - 60), Math.min(Math.max(y, 0), vh - 40)];
  }
  function place(x, y) {
    var p = clamp(x, y);
    shell.style.left = p[0] + 'px'; shell.style.top = p[1] + 'px'; shell.style.right = 'auto';
    return p;
  }
  var saved = (load(POS_KEY) || '').split(',');
  if (saved.length === 2 && !isNaN(+saved[0]) && !isNaN(+saved[1])) place(+saved[0], +saved[1]);

  q('.olh-head').addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || e.target.closest('button')) return;
    var r = shell.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top, head = this;
    head.setPointerCapture(e.pointerId);
    function move(ev) { place(ev.clientX - dx, ev.clientY - dy); }
    function up(ev) {
      head.releasePointerCapture(ev.pointerId);
      head.removeEventListener('pointermove', move); head.removeEventListener('pointerup', up);
      var nr = shell.getBoundingClientRect();
      save(POS_KEY, Math.round(nr.left) + ',' + Math.round(nr.top));
    }
    head.addEventListener('pointermove', move); head.addEventListener('pointerup', up);
    e.preventDefault();
  });
  window.addEventListener('resize', function () {
    if (shell.style.left) { var r = shell.getBoundingClientRect(); place(r.left, r.top); }
  });

  /* ========== 顯示設定：縮放比例、視窗大小（記在這台電腦） ========== */
  /* 預設 90%（2026/10/19 管理者說 100% 有點太大）；換了記錄名稱，所以大家會先回到新的預設 */
  /* 畫面上寫的 100% 實際是 BASE（2026/10/19 管理者說介面占比太大，100% 要比以前小）；換了記錄名稱，大家會回到新的 100% */
  var BASE = 0.86, ZOOMS = [0.8, 0.85, 0.9, 0.95, 1, 1.1, 1.25, 1.4], ZOOM_KEY = 'olh-zoom3', SIZE_KEY = 'olh-size2', ZOOM_DEFAULT = 1;
  var zoom = parseFloat(load(ZOOM_KEY)) || ZOOM_DEFAULT;
  function applyZoom() {
    /* 標題列不縮放，下面的內容才縮放，拖動位置才不會跑掉 */
    ['.olh-set', '.olh-logview', '.olh-pend', '.olh-acct', '.olh-tabs', '.olh-main'].forEach(function (s) { q(s).style.zoom = zoom * BASE; });
    q('.olh-zv').textContent = Math.round(zoom * 100) + '%';
    q('.olh-zdn').disabled = zoom <= ZOOMS[0]; q('.olh-zup').disabled = zoom >= ZOOMS[ZOOMS.length - 1];
    save(ZOOM_KEY, String(zoom));
  }
  function stepZoom(d) {
    var i = 0; ZOOMS.forEach(function (z, k) { if (Math.abs(z - zoom) < Math.abs(ZOOMS[i] - zoom)) i = k; });
    zoom = ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, i + d))]; applyZoom();
  }
  q('.olh-zdn').onclick = function () { stepZoom(-1); };
  q('.olh-zup').onclick = function () { stepZoom(1); };
  q('.olh-set-btn').onclick = function () { shell.classList.toggle('olh-set-on'); };
  q('.olh-reset').onclick = function () {
    zoom = ZOOM_DEFAULT; applyZoom();
    shell.style.width = ''; shell.style.height = '';
    try { localStorage.removeItem(SIZE_KEY); } catch (e) { }
  };
  applyZoom();
  var size = (load(SIZE_KEY) || '').split(',');
  if (size.length === 2 && /px$/.test(size[0]) && /px$/.test(size[1])) { shell.style.width = size[0]; shell.style.height = size[1]; }
  /* 拖右下角改大小時，瀏覽器會在視窗上寫 width/height；有寫才記起來 */
  if (window.ResizeObserver) new ResizeObserver(function () {
    if (!shell.classList.contains('olh-min') && shell.style.width && shell.style.height) save(SIZE_KEY, shell.style.width + ',' + shell.style.height);
  }).observe(shell);

  /* ========== 縮小、關閉 ========== */
  q('.olh-min-btn').onclick = function () {
    var min = shell.classList.toggle('olh-min');
    this.textContent = min ? '□' : '－';
    if (shell.style.left) { var r = shell.getBoundingClientRect(); place(r.left, r.top); }
  };

  /* 還在發送或上標籤：畫面上有看得到的「停止」按鈕 */
  function working() {
    return Array.prototype.some.call(shell.querySelectorAll('.lg-stop, .p-stop'), function (b) { return b.style.display !== 'none'; });
  }
  q('.olh-close').onclick = function () {
    var msg = '正在使用官方LINE小幫手，確定要關掉嗎？\n（關掉後再按一次書籤，可以回到剛才的畫面）';
    if (working()) msg = '⚠ 目前還在發送／上標籤中！\n關掉視窗「不會」停止，若要停止請先按「停止」。\n\n' + msg;
    if (confirm(msg)) shell.style.display = 'none';
  };

  /* 視窗開著時，關掉分頁、重新整理或離開網頁前，瀏覽器會先問一次（提示文字由瀏覽器決定） */
  window.__olhUnload = function (e) {
    if (!document.getElementById(SHELL_ID) || shell.style.display === 'none') return;
    e.preventDefault(); e.returnValue = '正在使用官方LINE小幫手，確定要離開嗎？';
    return e.returnValue;
  };
  window.addEventListener('beforeunload', window.__olhUnload);

  /* ========== 發送紀錄總表、待補發（三個工具共用：window.OLH） ==========
     總表：每個任務一列（只有則數，不存家長或學生資料），存在這台電腦；有設定「總表同步網址」就同步到 Google 試算表。
     待補發：沒發出去的訊息內容（含照片）只存在這台電腦的瀏覽器（IndexedDB），關掉分頁、換帳號、重開電腦都還在。 */
  var LOG_KEY = 'olh-log', PC_KEY = 'olh-pc', SHEET_KEY = 'olh-sheet', HOUR_KEY = 'olh-hour-' + botId;
  /* Google 試算表接收網址（總表同步_設定教學.txt 的 A-5）；建好試算表後填在這裡，所有電腦就會在背景自動同步 */
  var SHEET_URL = 'https://script.google.com/macros/s/AKfycbzrYiZFGw4ptwJOoc0rHM9WB4j-zYmkzg8hHuM3ceQsw_jqdEmAulMZhZz31Qo3jbHK/exec';
  var botName = '';
  function jget(k, d) { try { return JSON.parse(load(k)) || d; } catch (e) { return d; } }
  function jset(k, v) { save(k, JSON.stringify(v)); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function nowParts() { var d = new Date(); return { date: d.getFullYear() + '/' + pad2(d.getMonth() + 1) + '/' + pad2(d.getDate()), time: pad2(d.getHours()) + ':' + pad2(d.getMinutes()) }; }
  function uid() { return window.crypto && crypto.randomUUID ? crypto.randomUUID() : 't' + Date.now() + Math.random().toString(16).slice(2); }
  function escH(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function idb() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open('olh-db', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('pending', { keyPath: 'id' }); };
      r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); };
    });
  }
  function idbDo(mode, fn) {
    return idb().then(function (db) {
      return new Promise(function (res, rej) {
        var tx = db.transaction('pending', mode), req = fn(tx.objectStore('pending'));
        tx.oncomplete = function () { res(req ? req.result : undefined); }; tx.onerror = function () { rej(tx.error); };
      });
    });
  }

  var OLH = window.OLH = {
    botId: botId,
    HOUR_LIMIT: 200,
    botName: function () { return botName; },
    /* 這台電腦的代號：第一次自動產生（例如 電腦-7F3K），總表的「主機」欄用 */
    pc: function () {
      var v = load(PC_KEY);
      if (!v) { v = '電腦-' + Math.random().toString(36).slice(2, 6).toUpperCase(); save(PC_KEY, v); }
      return v;
    },
    /* 這台電腦 1 小時內發過幾個不同的聊天室（防呆提醒用；其他電腦發的算不到） */
    hourCount: function () {
      var now = Date.now(), m = jget(HOUR_KEY, {}), n = 0, k;
      for (k in m) { if (now - m[k] < 3600000) n++; else delete m[k]; }
      jset(HOUR_KEY, m); return n;
    },
    noteSent: function (chatId) { var m = jget(HOUR_KEY, {}); m[chatId] = Date.now(); jset(HOUR_KEY, m); },
    newTask: function (type, name, total) {
      var p = nowParts();
      return { id: uid(), pc: OLH.pc() || '（未設定）', bot: botName, type: type, name: name, total: total,
        ok: 0, notOk: 0, resendOk: 0, fail: 0, date: p.date, time: p.time, status: '進行中' };
    },
    /* 新增或更新總表的一列（同一個任務 id 會更新同一列） */
    saveTask: function (t) {
      var p = nowParts(), log = jget(LOG_KEY, []), i;
      t.updated = p.date + ' ' + p.time; t.synced = false;
      for (i = 0; i < log.length && log[i].id !== t.id; i++);
      log[i] = JSON.parse(JSON.stringify(t));
      jset(LOG_KEY, log.slice(-500)); OLH.sync();
      if (q('.olh-logview').style.display !== 'none') renderLog();
    },
    log: function () { return jget(LOG_KEY, []); },
    /* 背景同步到 Google 試算表（網址寫在程式最上面的 SHEET_URL；還沒設定就只存在這台電腦），畫面上不顯示 */
    sync: function () {
      var url = SHEET_URL || load(SHEET_KEY);
      if (!url) return;
      jget(LOG_KEY, []).filter(function (t) { return !t.synced; }).forEach(function (t) {
        fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(t) }).then(function () {
          var l2 = jget(LOG_KEY, []);
          l2.forEach(function (x) { if (x.id === t.id && x.updated === t.updated) x.synced = true; });
          jset(LOG_KEY, l2);
        }).catch(function () { });
      });
    },
    savePending: function (p) { p.bot = botId; p.botName = botName; return idbDo('readwrite', function (st) { return st.put(p); }).then(refreshPending); },
    removePending: function (id) { return idbDo('readwrite', function (st) { return st['delete'](id); }).then(refreshPending); },
    listPending: function () { return idbDo('readonly', function (st) { return st.getAll(); }).then(function (r) { return r || []; }); },
    resumers: {},
    showTab: function (k) { showTab(k); }
  };

  /* 最上面的紅色橫幅：上次沒發出去的訊息，一鍵繼續發 */
  function refreshPending() {
    return OLH.listPending().then(function (list) {
      var mine = list.filter(function (p) { return p.bot === botId; }), others = list.length - mine.length, box = q('.olh-pend');
      if (!mine.length && !others) { box.style.display = 'none'; box.innerHTML = ''; return; }
      var h = '<b class="t">⚠ 有上次沒發出去的訊息，' + (mine.length ? '按「繼續發送」接著發' : '請切換帳號再補發') + '</b>';
      mine.forEach(function (p) {
        h += '<div class="row"><span style="flex:1;min-width:180px"><b>' + escH(p.task.name) + '</b>（' + escH(p.task.type) + '）<br>' +
          '<span style="font-size:12px;color:#555">' + escH(p.task.date + ' ' + p.task.time) + '　還有 <b style="color:#c62828">' + p.jobs.length + '</b> 則沒發' +
          (p.reason ? '　原因：' + escH(p.reason) : '') + '</span></span>' +
          '<button class="olh-pbtn olh-pgo" data-id="' + escH(p.id) + '">▶ 繼續發送</button>' +
          '<button class="olh-pbtn sec olh-pdrop" data-id="' + escH(p.id) + '">放棄</button></div>';
      });
      if (others) h += '<div style="font-size:12px;margin-top:4px">另有 ' + others + ' 筆是其他帳號的工作（' +
        escH(list.filter(function (p) { return p.bot !== botId; }).map(function (p) { return p.botName || p.bot; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join('、')) + '），切換到那個帳號才會顯示。</div>';
      box.innerHTML = h; box.style.display = 'block';
      box.querySelectorAll('.olh-pgo').forEach(function (b) {
        b.onclick = function () {
          var p = mine.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0];
          if (!p || !OLH.resumers[p.tool]) return;
          showTab(p.tool); OLH.resumers[p.tool](p);
        };
      });
      box.querySelectorAll('.olh-pdrop').forEach(function (b) {
        b.onclick = function () {
          if (!b.classList.contains('sure')) { b.classList.add('sure'); b.textContent = '再按一次：確定放棄（不再補發）'; return; }
          var p = mine.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0];
          if (p) { p.task.status = '已放棄補發'; OLH.saveTask(p.task); OLH.removePending(p.id); }
        };
      });
    }).catch(function () { });
  }

  /* 發送紀錄總表（⚙ →「發送紀錄總表」）；可以匯出 Excel */
  var LOG_COLS = [['pc', '主機'], ['bot', '帳號'], ['type', '訊息'], ['name', '名稱'], ['total', '訊息數'], ['ok', '發送成功'], ['notOk', '未發送成功'],
    ['resendOk', '補發成功'], ['fail', '未成功'], ['date', '日期'], ['time', '時間'], ['status', '狀態']];
  function renderLog() {
    var log = OLH.log().slice().reverse();
    q('.olh-logview').innerHTML = '<b>發送紀錄總表</b>（這台電腦，最新的在最上面）　<button class="olh-sbtn olh-logcsv">匯出 Excel</button> <button class="olh-sbtn olh-logx">關閉</button>' +
      '<table><tr><th>NO</th>' + LOG_COLS.map(function (c) { return '<th>' + c[1] + '</th>'; }).join('') + '</tr>' +
      log.map(function (t, i) { return '<tr><td>' + (log.length - i) + '</td>' + LOG_COLS.map(function (c) { return '<td>' + escH(t[c[0]]) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</table>' + (log.length ? '' : '<div style="color:#777;margin-top:6px">還沒有紀錄。</div>');
    q('.olh-logx').onclick = function () { q('.olh-logview').style.display = 'none'; };
    q('.olh-logcsv').onclick = function () {
      var rows = [['NO'].concat(LOG_COLS.map(function (c) { return c[1]; }))];
      OLH.log().forEach(function (t, i) { rows.push([i + 1].concat(LOG_COLS.map(function (c) { return t[c[0]]; }))); });
      var csv = '﻿' + rows.map(function (r) { return r.map(function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = '發送紀錄總表_' + (OLH.pc() || '這台電腦') + '.csv'; a.click();
    };
  }
  q('.olh-logbtn').onclick = function () { var v = q('.olh-logview'); v.style.display = v.style.display === 'none' ? 'block' : 'none'; if (v.style.display === 'block') renderLog(); };

  /* ========== 三個工具 ========== */
  function mount(k) { return function (panel) { slot(k).appendChild(panel); }; }

  /* ===== line-tagger.js ===== */
(function (__mount) {
/*
  LINE 官方帳號「批次上標籤」小工具
  用法：在 chat.line.biz（LINE 官方帳號聊天後台）按書籤列的「批次上標籤」。
  流程：讀名單 → 選標籤 → 搜尋預覽（可勾選）→ 開始上標籤 → 結果表 + 漏上檢查。
  只在「聯絡人」資料上加標籤，不會開啟聊天室，不會讓訊息變已讀。
  注意：本檔案只能用 區塊註解，不要用雙斜線註解（做成書籤時會壞掉）。
*/
(function () {
  'use strict';

  var PANEL_ID = 'lt-panel-2026';
  var old = document.getElementById(PANEL_ID);
  if (old) { old.style.display = old.style.display === 'none' ? 'block' : 'none'; return; }

  var botId = location.pathname.split('/')[1] || '';
  if (location.hostname !== 'chat.line.biz' || !/^U[0-9a-f]{32}$/.test(botId)) {
    alert('請先打開 LINE 官方帳號的聊天後台（chat.line.biz），並選好要用的帳號，再按一次。');
    return;
  }

  /* ========== 基本工具 ========== */
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var csrf = null;

  function api(path, opts) {
    opts = opts || {};
    var headers = { 'Accept': 'application/json' };
    var p = Promise.resolve();
    if (opts.method && opts.method !== 'GET') {
      headers['Content-Type'] = 'application/json';
      p = getCsrf().then(function (c) { headers[c.headerName] = c.token; });
    }
    return p.then(function () {
      return fetch(path, { method: opts.method || 'GET', headers: headers, credentials: 'same-origin',
        body: opts.body ? JSON.stringify(opts.body) : undefined });
    }).then(function (r) {
      if (!r.ok) throw new Error('LINE 回應錯誤 ' + r.status);
      return r.text().then(function (t) { return t ? JSON.parse(t) : {}; });
    });
  }
  function getCsrf() {
    if (csrf) return Promise.resolve(csrf);
    return fetch('/api/v1/csrfToken', { credentials: 'same-origin' }).then(function (r) { return r.json(); })
      .then(function (j) { csrf = j; return j; });
  }

  async function getTags() {
    var all = [], next = null, guard = 0;
    do {
      var j = await api('/api/v1/bots/' + botId + '/tags' + (next ? '?next=' + encodeURIComponent(next) : ''));
      all = all.concat(j.list || []); next = j.next; guard++;
    } while (next && guard < 50);
    return all;
  }

  async function searchContacts(query) {
    var j = await api('/api/v2/bots/' + botId + '/contacts?query=' + encodeURIComponent(query) + '&limit=50');
    return j.list || [];
  }

  async function chatsWithTag(tagId) {
    var all = [], seen = {}, next = null, guard = 0, added;
    do {
      var j = await api('/api/v2/bots/' + botId + '/chats?folderType=ALL&tagIds=' + tagId + '&autoTagIds=&limit=25' +
        (next ? '&next=' + encodeURIComponent(next) : ''));
      added = 0;
      (j.list || []).forEach(function (c) { if (!seen[c.chatId]) { seen[c.chatId] = 1; all.push(c); added++; } });
      next = j.next; guard++;
      await sleep(150);
    } while (next && added && guard < 400);
    return all;
  }

  async function allContacts(onProgress) {
    var all = [], seen = {}, next = null, guard = 0, added;
    do {
      var j = await api('/api/v2/bots/' + botId + '/contacts?query=&limit=50' + (next ? '&next=' + encodeURIComponent(next) : ''));
      added = 0;
      (j.list || []).forEach(function (c) { if (!seen[c.contactId]) { seen[c.contactId] = 1; all.push(c); added++; } });
      next = j.next; guard++;
      if (onProgress) onProgress(all.length);
      await sleep(120);
    } while (next && added && guard < 1000);
    return all;
  }

  /* 建立新標籤（同名已存在就直接用），回傳 tagId */
  async function ensureTag(name) {
    var found = (await getTags()).filter(function (t) { return t.name === name; })[0];
    if (found) return found.tagId;
    await api('/api/v1/bots/' + botId + '/tags', { method: 'POST', body: { name: name } });
    found = (await getTags()).filter(function (t) { return t.name === name; })[0];
    if (!found) throw new Error('建立標籤「' + name + '」失敗');
    return found.tagId;
  }

  function setContactTags(contactId, tagIds) {
    return api('/api/v1/bots/' + botId + '/contacts/' + contactId + '/tags', { method: 'PUT', body: { tagIds: tagIds } });
  }

  function displayName(c) { var p = c.profile || {}; return p.nickname || p.name || '(沒有名稱)'; }

  /* 「118慈文林文琪媽媽」→「媽媽」、「…程冠耘123永順程光廷媽媽」→「媽媽」；後面沒字就顯示整個名稱 */
  var ROLE = /(媽媽|爸爸|本人|母親|父親|阿嬤|阿公|奶奶|爺爺|外婆|外公|阿姨|姑姑|舅舅|叔叔|伯伯|哥哥|姊姊|姐姐|家長|監護人)/;
  function shortLabel(student, nick) {
    var i = nick.lastIndexOf(student);
    if (i < 0) return nick;
    var rest = nick.slice(i + student.length);
    var m = rest.match(ROLE);
    if (m) return rest.slice(m.index).trim();
    rest = rest.replace(/^[\s\d\-_/()（）]+/, '').trim();
    return rest || nick;
  }

  /* ========== 讀名單（Excel / CSV / 貼上） ========== */
  var NAME_HEADERS = ['姓名', '學生姓名', '學生', '名字', '中文姓名'];

  function pickNames(rows) {
    var col = 0, start = 0, found = false;
    for (var r = 0; r < Math.min(rows.length, 10) && !found; r++) {
      for (var c = 0; c < (rows[r] || []).length; c++) {
        var v = String(rows[r][c] || '').trim();
        if (NAME_HEADERS.indexOf(v) >= 0) { col = c; start = r + 1; found = true; break; }
      }
    }
    var seen = {}, out = [];
    for (var i = start; i < rows.length; i++) {
      var n = String((rows[i] || [])[col] || '').replace(/\s+/g, '');
      if (!n || NAME_HEADERS.indexOf(n) >= 0 || seen[n]) continue;
      seen[n] = 1; out.push(n);
    }
    return out;
  }

  function parseText(text) {
    var lines = text.replace(/\r/g, '').split('\n').filter(function (l) { return l.trim(); });
    var sep = lines.some(function (l) { return l.indexOf('\t') >= 0; }) ? '\t' : (lines.some(function (l) { return l.indexOf(',') >= 0; }) ? ',' : /[、，]/);
    return lines.map(function (l) { return l.split(sep).map(function (s) { return s.replace(/^"|"$/g, '').trim(); }); });
  }

  /* 簡易 xlsx 讀取（xlsx 其實是 zip 壓縮檔） */
  async function readXlsx(buf) {
    var dv = new DataView(buf), u8 = new Uint8Array(buf);
    var eocd = -1;
    for (var i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 70000); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('這個檔案不是 .xlsx 格式');
    var count = dv.getUint16(eocd + 10, true), off = dv.getUint32(eocd + 16, true);
    var files = {}, dec = new TextDecoder('utf-8');
    for (var k = 0; k < count; k++) {
      var method = dv.getUint16(off + 10, true), csize = dv.getUint32(off + 20, true);
      var nlen = dv.getUint16(off + 28, true), elen = dv.getUint16(off + 30, true), clen = dv.getUint16(off + 32, true);
      var lho = dv.getUint32(off + 42, true);
      var name = dec.decode(u8.subarray(off + 46, off + 46 + nlen));
      files[name] = { method: method, csize: csize, lho: lho };
      off += 46 + nlen + elen + clen;
    }
    async function read(name) {
      var f = files[name]; if (!f) return null;
      var l = f.lho, start = l + 30 + dv.getUint16(l + 26, true) + dv.getUint16(l + 28, true);
      var data = u8.subarray(start, start + f.csize);
      if (f.method === 0) return dec.decode(data);
      var ds = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return await new Response(ds).text();
    }
    var xml = function (t) { return new DOMParser().parseFromString(t, 'application/xml'); };
    var shared = [];
    var sst = await read('xl/sharedStrings.xml');
    if (sst) {
      var sis = xml(sst).getElementsByTagName('si');
      for (var s = 0; s < sis.length; s++) {
        var ts = sis[s].getElementsByTagName('t'), str = '';
        for (var q = 0; q < ts.length; q++) str += ts[q].textContent;
        shared.push(str);
      }
    }
    var sheetName = Object.keys(files).filter(function (n) { return /^xl\/worksheets\/sheet\d+\.xml$/.test(n); })
      .sort(function (a, b) { return parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]); })[0];
    if (!sheetName) throw new Error('Excel 裡找不到工作表');
    var doc = xml(await read(sheetName));
    var rows = [], rowEls = doc.getElementsByTagName('row');
    for (var r = 0; r < rowEls.length; r++) {
      var cells = rowEls[r].getElementsByTagName('c'), row = [];
      for (var c = 0; c < cells.length; c++) {
        var ref = cells[c].getAttribute('r') || '', letters = ref.replace(/\d+/g, ''), idx = 0;
        for (var z = 0; z < letters.length; z++) idx = idx * 26 + (letters.charCodeAt(z) - 64);
        idx = letters ? idx - 1 : row.length;
        var t = cells[c].getAttribute('t'), v = cells[c].getElementsByTagName('v')[0], val = '';
        if (t === 's' && v) val = shared[parseInt(v.textContent)] || '';
        else if (t === 'inlineStr') { var it = cells[c].getElementsByTagName('t'); for (var w = 0; w < it.length; w++) val += it[w].textContent; }
        else if (v) val = v.textContent;
        row[idx] = val;
      }
      rows.push(row);
    }
    return rows;
  }

  /* ========== 核心流程（不碰畫面，也給 Claude 用） ========== */

  /* 搜尋預覽：每位學生找出家長 LINE，預設勾選「名稱裡有學生姓名」的 */
  async function preview(names, tagId, onProgress) {
    var out = [];
    for (var i = 0; i < names.length; i++) {
      var n = names[i];
      if (onProgress) onProgress(i + 1, names.length, n);
      var list = [];
      try { list = await searchContacts(n); } catch (e) { out.push({ student: n, error: e.message, contacts: [] }); continue; }
      var contacts = list.map(function (c) {
        var nick = displayName(c), byNick = nick.indexOf(n) >= 0;
        var note = [];
        if (!byNick) note.push('名稱裡沒有學生姓名，請確認');
        if (c.spam) note.push('垃圾訊息');
        if (c.friend === false) note.push('非好友/已封鎖');
        return { contactId: c.contactId, nick: nick, label: shortLabel(n, nick), tagIds: c.tagIds || [],
          hasTag: (c.tagIds || []).indexOf(tagId) >= 0, checked: byNick && !c.spam, note: note.join('、') };
      });
      out.push({ student: n, contacts: contacts });
      await sleep(200);
    }
    return out;
  }

  /* 上標籤：只處理有勾選、還沒有這個標籤的；上之前重新讀一次最新標籤，避免蓋掉別人剛改的 */
  async function apply(previewRows, tagId, onProgress) {
    var todo = [];
    previewRows.forEach(function (row) {
      row.contacts.forEach(function (c) { if (c.checked) todo.push({ row: row, c: c }); });
    });
    var students = [];
    previewRows.forEach(function (r) { if (r.contacts.some(function (c) { return c.checked; })) students.push(r); });
    for (var i = 0; i < students.length; i++) {
      var row = students[i];
      if (onProgress) onProgress(i + 1, students.length, row.student);
      var fresh = {};
      try { (await searchContacts(row.student)).forEach(function (c) { fresh[c.contactId] = c.tagIds || []; }); }
      catch (e) { row.contacts.forEach(function (c) { if (c.checked) c.result = '失敗：' + e.message; }); continue; }
      for (var k = 0; k < row.contacts.length; k++) {
        var c = row.contacts[k];
        if (!c.checked) continue;
        var cur = fresh[c.contactId];
        if (!cur) { c.result = '失敗：找不到這個 LINE'; continue; }
        if (cur.indexOf(tagId) >= 0) { c.result = '原本就有'; continue; }
        try {
          await setContactTags(c.contactId, cur.concat([tagId]));
          c.result = '成功';
        } catch (e) { c.result = '失敗：' + e.message; }
        await sleep(250);
      }
    }
    return previewRows;
  }

  /* 漏上檢查：名單上每位學生是否都有上到；標籤裡有沒有不在名單上的人 */
  async function check(names, tagId, onProgress) {
    var res = { ok: [], missing: [], notFound: [], extra: [], extraItems: [], tagCount: null };
    var taggedIds = {};
    for (var i = 0; i < names.length; i++) {
      var n = names[i];
      if (onProgress) onProgress(i + 1, names.length + 1, n);
      var list = await searchContacts(n);
      var mine = list.filter(function (c) { return displayName(c).indexOf(n) >= 0 && !c.spam; });
      if (!mine.length) { res.notFound.push(n); await sleep(200); continue; }
      var has = mine.filter(function (c) { return (c.tagIds || []).indexOf(tagId) >= 0; });
      var lack = mine.filter(function (c) { return (c.tagIds || []).indexOf(tagId) < 0; });
      has.forEach(function (c) { taggedIds[c.contactId] = 1; });
      if (has.length) res.ok.push({ student: n, labels: has.map(function (c) { return shortLabel(n, displayName(c)); }), nicks: has.map(displayName) });
      if (lack.length) res.missing.push({ student: n, nicks: lack.map(displayName), noneTagged: !has.length });
      await sleep(200);
    }
    if (onProgress) onProgress(names.length + 1, names.length + 1, '檢查標籤裡的所有人');
    var members = await chatsWithTag(tagId);
    members.forEach(function (m) {
      var nick = displayName(m);
      var inList = names.some(function (n) { return nick.indexOf(n) >= 0; });
      if (!inList) { res.extra.push(nick); res.extraItems.push({ id: m.chatId, nick: nick }); }
    });
    var tags = await getTags();
    var t = tags.filter(function (x) { return x.tagId === tagId; })[0];
    res.tagCount = t ? t.count : null;
    res.taggedInList = Object.keys(taggedIds).length;
    return res;
  }

  /* ========== 畫面 ========== */
  var css = '' +
    '#' + PANEL_ID + '{position:fixed;top:12px;right:12px;width:520px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow:auto;z-index:2147483000;background:#fff;color:#222;border:1px solid #cfd8dc;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,.25);font:14px/1.5 "Microsoft JhengHei","PingFang TC",sans-serif}' +
    '#' + PANEL_ID + ' *{box-sizing:border-box}' +
    '#' + PANEL_ID + ' .lt-head{position:sticky;top:0;background:#ef6c00;color:#fff;padding:10px 14px;font-weight:bold;font-size:16px;display:flex;justify-content:space-between;align-items:center;z-index:1}' +
    '#' + PANEL_ID + ' .lt-x{cursor:pointer;background:none;border:none;color:#fff;font-size:20px;line-height:1}' +
    '#' + PANEL_ID + ' .lt-body{padding:12px 14px}' +
    '#' + PANEL_ID + ' .lt-step{margin-bottom:14px;padding-bottom:12px;border-bottom:1px dashed #ddd}' +
    '#' + PANEL_ID + ' .lt-step h4{margin:0 0 6px;font-size:15px}' +
    '#' + PANEL_ID + ' textarea{width:100%;height:70px;font-size:13px;padding:6px;border:1px solid #ccc;border-radius:6px}' +
    '#' + PANEL_ID + ' select,#' + PANEL_ID + ' input[type=text]{width:100%;padding:6px;border:1px solid #ccc;border-radius:6px;font-size:14px}' +
    '#' + PANEL_ID + ' button.lt-btn{padding:7px 12px;margin:4px 6px 0 0;border-radius:6px;border:1px solid #ef6c00;background:#ef6c00;color:#fff;font-size:14px;cursor:pointer}' +
    '#' + PANEL_ID + ' button.lt-btn.lt-sec{background:#fff;color:#e65100}' +
    '#' + PANEL_ID + ' button.lt-btn:disabled{opacity:.4;cursor:not-allowed}' +
    '#' + PANEL_ID + ' table{width:100%;border-collapse:collapse;margin-top:6px;font-size:13px}' +
    '#' + PANEL_ID + ' th,#' + PANEL_ID + ' td{border-bottom:1px solid #eee;padding:6px 4px;text-align:left;vertical-align:top}' +
    '#' + PANEL_ID + ' th{background:#f5f7f8}' +
    '#' + PANEL_ID + ' .lt-muted{color:#777;font-size:12px}' +
    '#' + PANEL_ID + ' .lt-red{color:#d32f2f;font-weight:bold}' +
    '#' + PANEL_ID + ' .lt-green{color:#2e7d32}' +
    '#' + PANEL_ID + ' .lt-warn{color:#a0522d}' +
    '#' + PANEL_ID + ' .lt-box{background:#f5f7f8;border-radius:6px;padding:8px 10px;margin-top:6px}' +
    '#' + PANEL_ID + ' label.lt-c{display:block;cursor:pointer}' +
    '#' + PANEL_ID + ' .lt-prog{margin-top:6px;color:#e65100;font-weight:bold}' +
    '#' + PANEL_ID + ' .lt-tabs{display:flex;gap:6px;margin-bottom:12px}' +
    '#' + PANEL_ID + ' .lt-tabs button{flex:1;padding:8px;border:1px solid #ef6c00;background:#fff;color:#e65100;border-radius:6px;font-size:14px;cursor:pointer}' +
    '#' + PANEL_ID + ' .lt-tabs button.on{background:#ef6c00;color:#fff;font-weight:bold}' +
    '#' + PANEL_ID + ' .lt-scroll{max-height:240px;overflow:auto;border:1px solid #eee;border-radius:6px;padding:4px 6px;margin-top:4px}' +
    '#' + PANEL_ID + ' input.lt-prefix{width:90px;font-size:18px;font-weight:bold;text-align:center;padding:4px;border:2px solid #ef6c00;border-radius:6px}' +
    '#' + PANEL_ID + ' .lt-bar{position:relative;display:none;height:18px;margin-top:6px;background:#eceff1;border-radius:9px;overflow:hidden}' +
    '#' + PANEL_ID + ' .lt-bar i{display:block;height:100%;width:0;background:#ef6c00;transition:width .25s}' +
    '#' + PANEL_ID + ' .lt-bar.ind i{width:30%;animation:lt-ind 1.2s linear infinite}' +
    '#' + PANEL_ID + ' .lt-bar span{position:absolute;left:0;right:0;top:0;font-size:12px;line-height:18px;text-align:center;color:#222;font-weight:bold}' +
    '@keyframes lt-ind{from{margin-left:-30%}to{margin-left:100%}}' +
    '#' + PANEL_ID + ' .lt-small{font-size:12px;margin-left:6px;cursor:pointer;color:#e65100;text-decoration:underline;background:none;border:none;padding:0}';

  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = '<style>' + css + '</style>' +
    '<div class="lt-head"><span>批次上標籤</span><button class="lt-x" title="關閉">×</button></div>' +
    '<div class="lt-body">' +
    '<div class="lt-box" style="margin:0 0 12px">目前帳號：<b class="lt-bot">讀取中…</b>' +
    '<div class="lt-muted">帳號不對的話，先關掉這個視窗，到左上角切換帳號，再按一次書籤。</div></div>' +
    '<div class="lt-tabs"><button class="lt-tab1 on">依名單上標籤</button><button class="lt-tab2">依名稱開頭上標籤</button></div>' +
    '<div class="lt-t2" style="display:none">' +
    '<div class="lt-step"><h4>① LINE 名稱以 <input type="text" class="lt-prefix" placeholder="115"> 為開頭</h4>' +
    '<button class="lt-btn p-load">找出這些人</button>' +
    '<div class="lt-muted">會讀取全部聯絡人（幾千人約需 30 秒），只讀不改。</div>' +
    '<div class="lt-prog p-prog1"></div><div class="lt-bar p-bar1"><i></i><span></span></div>' +
    '<div class="p-sum"></div></div>' +
    '<div class="lt-step p-s2" style="display:none"><h4>② 扣掉有這些標籤的人（自己勾）</h4>' +
    '<input type="text" class="p-filter" placeholder="輸入關鍵字篩選標籤">' +
    '<div class="lt-scroll p-ex"></div></div>' +
    '<div class="lt-step p-s3" style="display:none"><h4>③ 要上的新標籤</h4>' +
    '<input type="text" class="p-newtag" placeholder="例如：115高一下招生">' +
    '<div class="p-tagnote lt-muted"></div></div>' +
    '<div class="lt-step p-s4" style="display:none"><h4>④ 執行</h4>' +
    '<button class="lt-btn p-preview">預覽名單</button>' +
    '<button class="lt-btn p-apply" disabled>開始上標籤</button>' +
    '<button class="lt-btn lt-sec p-stop" style="display:none">停止</button>' +
    '<div class="lt-prog p-prog"></div><div class="lt-bar p-bar"><i></i><span></span></div></div>' +
    '<div class="p-out"></div>' +
    '</div>' +
    '<div class="lt-t1">' +
    '<div class="lt-step"><h4>① 名單</h4>' +
    '<div>選 Excel 檔（.xlsx / .csv）：<input type="file" class="lt-file" accept=".xlsx,.csv,.txt"></div>' +
    '<div class="lt-muted" style="margin:4px 0">或從 Excel 複製「姓名」那一欄貼在下面（一行一位）：</div>' +
    '<textarea class="lt-paste" placeholder="胡祐綸&#10;林文琪&#10;…"></textarea>' +
    '<div class="lt-names lt-muted"></div></div>' +
    '<div class="lt-step"><h4>② 要上的標籤</h4><input type="text" class="lt-filter" placeholder="輸入關鍵字篩選標籤">' +
    '<select class="lt-tag" size="6" style="margin-top:4px"></select></div>' +
    '<div class="lt-step"><h4>③ 執行</h4>' +
    '<button class="lt-btn lt-preview">搜尋預覽</button>' +
    '<button class="lt-btn lt-apply" disabled>開始上標籤</button>' +
    '<button class="lt-btn lt-sec lt-check">只做漏上檢查</button>' +
    '<div class="lt-prog"></div><div class="lt-bar lt-bar1"><i></i><span></span></div></div>' +
    '<div class="lt-out"></div>' +
    '</div>' +
    '</div>';
  __mount(panel);

  var $ = function (s) { return panel.querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); };
  var state = { names: [], tags: [], rows: null, busy: false };

  $('.lt-x').onclick = function () { panel.style.display = 'none'; };

  function showNames() {
    var n = state.names;
    $('.lt-names').innerHTML = n.length ? '讀到 <b>' + n.length + '</b> 位：' + esc(n.slice(0, 30).join('、')) + (n.length > 30 ? '…' : '') : '';
    state.rows = null; $('.lt-apply').disabled = true;
  }
  $('.lt-paste').oninput = function () { state.names = pickNames(parseText(this.value)); showNames(); };
  $('.lt-file').onchange = async function () {
    var f = this.files[0]; if (!f) return;
    try {
      var rows = /\.xlsx$/i.test(f.name) ? await readXlsx(await f.arrayBuffer()) : parseText(await f.text());
      state.names = pickNames(rows);
      $('.lt-paste').value = state.names.join('\n');
      showNames();
      if (!state.names.length) alert('檔案裡找不到姓名。請確認有一欄標題叫「姓名」。');
    } catch (e) { alert('讀取失敗：' + e.message + '\n可以改用「複製姓名欄貼上」。'); }
  };

  function fillTags() {
    var kw = $('.lt-filter').value.trim(), sel = $('.lt-tag'), keep = sel.value;
    sel.innerHTML = state.tags.filter(function (t) { return !kw || t.name.indexOf(kw) >= 0; })
      .map(function (t) { return '<option value="' + esc(t.tagId) + '">' + esc(t.name) + '（' + t.count + '）</option>'; }).join('');
    if (keep) sel.value = keep;
  }
  $('.lt-filter').oninput = fillTags;
  $('.lt-tag').onchange = function () { state.rows = null; $('.lt-apply').disabled = true; };
  getTags().then(function (t) { state.tags = t; fillTags(); }).catch(function (e) { alert('讀取標籤失敗：' + e.message); });
  api('/api/v1/bots/' + botId + '?noFilter=true').then(function (b) { state.botName = b.name || botId; $('.lt-bot').textContent = state.botName; })
    .catch(function () { state.botName = botId; $('.lt-bot').textContent = botId; });

  function tagName(id) { var t = state.tags.filter(function (x) { return x.tagId === id; })[0]; return t ? t.name : id; }
  function ready() {
    if (state.busy) return false;
    if (!state.names.length) { alert('請先放名單。'); return false; }
    if (!$('.lt-tag').value) { alert('請先選要上的標籤。'); return false; }
    return true;
  }
  /* 進度條：有總數就顯示百分比；沒有總數（例如讀取全部聯絡人）就顯示來回跑的動畫 */
  function setBar(el, i, n, label) {
    el.style.display = 'block';
    if (!n) { el.classList.add('ind'); el.querySelector('i').style.width = ''; el.querySelector('span').textContent = label || ''; return; }
    var p = Math.min(100, Math.round(i / n * 100));
    el.classList.remove('ind'); el.querySelector('i').style.width = p + '%';
    el.querySelector('span').textContent = p + '%（' + i + ' / ' + n + '）';
  }
  function hideBar(el) { el.style.display = 'none'; }
  function prog(i, n, name) { $('.lt-prog').textContent = '處理中 ' + i + ' / ' + n + '：' + name; setBar($('.lt-bar1'), i, n); }
  function busy(b) {
    state.busy = b; panel.querySelectorAll('button.lt-btn').forEach(function (x) { x.disabled = b; });
    if (!b) {
      $('.lt-apply').disabled = !state.rows; hideBar($('.lt-bar1'));
      var ex = $('.lt-ex-remove'); if (ex && ex.recount) ex.recount();
    }
  }

  /* 搜尋預覽 */
  $('.lt-preview').onclick = async function () {
    if (!ready()) return;
    var tagId = $('.lt-tag').value;
    busy(true); $('.lt-out').innerHTML = '';
    try {
      state.rows = sortRows(await preview(state.names, tagId, prog));
      state.tagId = tagId;
      renderPreview();
      $('.lt-prog').textContent = '預覽完成。請確認勾選，再按「開始上標籤」。';
    } catch (e) { alert('搜尋失敗：' + e.message); }
    busy(false);
  };

  /* 預覽排序：還沒上標籤的排最前面（方便勾選），找不到的其次，全部都已經有標籤的放最後；
     同一位學生裡，還沒上的 LINE 也排前面。同一組裡維持名單原本的順序。 */
  function rowRank(r) {
    if (r.contacts.some(function (c) { return !c.hasTag; })) return 0;
    return r.contacts.length ? 2 : 1;
  }
  function sortRows(rows) {
    rows.forEach(function (r) { r.contacts.sort(function (a, b) { return (a.hasTag ? 1 : 0) - (b.hasTag ? 1 : 0); }); });
    return rows.map(function (r, i) { return { r: r, i: i }; })
      .sort(function (a, b) { return rowRank(a.r) - rowRank(b.r) || a.i - b.i; })
      .map(function (x) { return x.r; });
  }

  function renderPreview() {
    var rows = state.rows, nf = rows.filter(function (r) { return !r.contacts.length; }).length;
    var had = 0; rows.forEach(function (r) { r.contacts.forEach(function (c) { if (c.hasTag) had++; }); });
    var h = '<div class="lt-box">標籤：<b>' + esc(tagName(state.tagId)) + '</b>　名單 ' + rows.length + ' 位<br>這次會新加 <b class="lt-total">' + countTodo() + '</b> 個 LINE' +
      (had ? '（另有 ' + had + ' 個原本就有）' : '') +
      (nf ? '　<span class="lt-red">找不到 ' + nf + ' 位</span>' : '') +
      '<div class="lt-muted">有勾的才會上。灰色說明代表要你確認（例如名稱裡沒有學生姓名）。</div></div>' +
      '<table><tr><th style="width:80px">學生</th><th>找到的家長 LINE（勾選＝要上）</th></tr>';
    var lastRank = 0;
    rows.forEach(function (r, ri) {
      var rk = rowRank(r);
      if (rk !== lastRank) {
        var cnt = rows.filter(function (x) { return rowRank(x) === rk; }).length;
        h += '<tr><td colspan="2" style="background:#fff3e0;font-weight:bold;color:#555">' +
          (rk === 1 ? '以下 ' + cnt + ' 位找不到 LINE' : '以下 ' + cnt + ' 位已經有這個標籤，不用再勾') + '</td></tr>';
        lastRank = rk;
      }
      h += '<tr><td>' + esc(r.student) + '</td><td>';
      if (r.error) h += '<span class="lt-red">搜尋失敗：' + esc(r.error) + '</span>';
      else if (!r.contacts.length) h += '<span class="lt-red">找不到</span>';
      r.contacts.forEach(function (c, ci) {
        h += '<label class="lt-c"><input type="checkbox" data-r="' + ri + '" data-c="' + ci + '"' + (c.checked ? ' checked' : '') + (c.hasTag ? ' disabled' : '') + '> ' +
          esc(c.nick) + (c.hasTag ? ' <span class="lt-green">（已經有這個標籤）</span>' : '') +
          (c.note ? ' <span class="lt-warn">（' + esc(c.note) + '）</span>' : '') + '</label>';
      });
      h += '</td></tr>';
    });
    h += '</table>';
    $('.lt-out').innerHTML = h;
    $('.lt-out').querySelectorAll('input[type=checkbox]').forEach(function (cb) {
      cb.onchange = function () {
        state.rows[this.dataset.r].contacts[this.dataset.c].checked = this.checked;
        $('.lt-total').textContent = countTodo();
      };
    });
  }
  function countTodo() {
    var t = 0; (state.rows || []).forEach(function (r) { r.contacts.forEach(function (c) { if (c.checked && !c.hasTag) t++; }); });
    return t;
  }

  /* 開始上標籤 */
  $('.lt-apply').onclick = async function () {
    if (!state.rows || state.busy) return;
    var todo = countTodo();
    if (!todo) { alert('沒有需要上的（勾選的都已經有這個標籤了）。'); return; }
    if (!confirm('帳號：' + (state.botName || '') + '\n確定要幫 ' + todo + ' 個 LINE 加上標籤「' + tagName(state.tagId) + '」嗎？\n（原本的標籤會保留）')) return;
    busy(true);
    try {
      await apply(state.rows, state.tagId, prog);
      logTagTask(tagName(state.tagId), (function () { var a = []; state.rows.forEach(function (r) { r.contacts.forEach(function (c) { if (c.checked && c.result) a.push(c.result); }); }); return a; })());
      $('.lt-prog').textContent = '上標籤完成，正在做漏上檢查…';
      var chk = await check(state.names, state.tagId, prog);
      renderResult(state.rows, chk);
      $('.lt-prog').textContent = '完成！';
    } catch (e) { alert('發生錯誤：' + e.message); }
    state.rows = null; busy(false);
  };

  /* 只做漏上檢查 */
  $('.lt-check').onclick = async function () {
    if (!ready()) return;
    var tagId = $('.lt-tag').value; state.tagId = tagId;
    busy(true); $('.lt-out').innerHTML = '';
    try { renderResult(null, await check(state.names, tagId, prog)); $('.lt-prog').textContent = '檢查完成！'; }
    catch (e) { alert('檢查失敗：' + e.message); }
    busy(false);
  };

  function renderResult(rows, chk) {
    var name = tagName(state.tagId), h = '', lines = [];
    var failed = [];
    if (rows) rows.forEach(function (r) { r.contacts.forEach(function (c) { if (c.result && c.result.indexOf('失敗') === 0) failed.push(r.student + '：' + c.nick + '（' + c.result + '）'); }); });

    h += '<div class="lt-box">帳號：<b>' + esc(state.botName || '') + '</b><br>名單上 <b>' + state.names.length + '</b> 位學生，有上到 <b>' + chk.ok.length + '</b> 位，共 <b>' + chk.taggedInList + '</b> 個家長 LINE。<br>' +
      '後台「' + esc(name) + '」標籤目前共 <b>' + (chk.tagCount === null ? '?' : chk.tagCount) + '</b> 個聊天室。</div>';

    h += '<h4 style="margin:12px 0 4px">上標籤結果</h4><table><tr><th style="width:90px">學生</th><th>加好的家長 LINE</th></tr>';
    lines.push('學生\t加好的家長 LINE');
    chk.ok.forEach(function (o) {
      h += '<tr><td>' + esc(o.student) + '</td><td title="' + esc(o.nicks.join('\n')) + '">' + esc(o.labels.join('、')) + '</td></tr>';
      lines.push(o.student + '\t' + o.labels.join('、'));
    });
    h += '</table>';

    h += '<h4 style="margin:14px 0 4px">漏上檢查</h4>';
    var allGood = !chk.missing.length && !chk.notFound.length && !failed.length && !chk.extra.length;
    if (allGood) h += '<div class="lt-box lt-green">✔ 名單上每一位都有上到，標籤裡也沒有名單以外的人。</div>';
    if (chk.notFound.length) h += '<div class="lt-box"><span class="lt-red">找不到 LINE（' + chk.notFound.length + ' 位）</span>：' + esc(chk.notFound.join('、')) +
      '<div class="lt-muted">可能家長沒加好友，或後台名稱沒有打學生姓名。請到「聯絡人」用家長名字找找看。</div></div>';
    if (chk.missing.length) {
      h += '<div class="lt-box"><span class="lt-red">少上的（' + chk.missing.length + ' 位學生）</span><table>';
      chk.missing.forEach(function (m) {
        h += '<tr><td style="width:90px">' + esc(m.student) + (m.noneTagged ? '<div class="lt-red">完全沒上到</div>' : '<div class="lt-warn">部分沒上</div>') + '</td><td>' + m.nicks.map(esc).join('<br>') + '</td></tr>';
      });
      h += '</table><div class="lt-muted">這些家長 LINE 名稱裡有學生姓名，但沒有這個標籤。如果是同名的別人，可以不用管。</div></div>';
    }
    if (failed.length) h += '<div class="lt-box"><span class="lt-red">上標籤失敗</span>：<br>' + failed.map(esc).join('<br>') + '</div>';
    if (chk.extraItems.length) h += '<div class="lt-box lt-extra"><span class="lt-warn">多出來的（' + chk.extraItems.length + ' 個）</span>：標籤裡有，但不是名單上的學生。' +
      '<div class="lt-muted">可能是以前就上過、兄弟姊妹共用的 LINE，或上錯人。<b>有勾＝保留標籤；取消勾選＝要拿掉這個標籤</b>（其他標籤不會動）。</div>' +
      '<div style="margin-top:4px"><button class="lt-small lt-ex-all">全部勾選</button><button class="lt-small lt-ex-none">全部取消</button></div>' +
      '<div class="lt-scroll" style="max-height:220px">' + chk.extraItems.map(function (x, i) {
        return '<label class="lt-c"><input type="checkbox" class="lt-keep" data-i="' + i + '" checked> ' + esc(x.nick) + ' <span class="lt-ex-res"></span></label>';
      }).join('') + '</div>' +
      '<button class="lt-btn lt-ex-remove" style="background:#c62828;border-color:#c62828" disabled>拿掉沒勾的標籤（<span class="lt-ex-n">0</span> 個）</button></div>';

    lines.push('', '漏上檢查');
    lines.push('找不到 LINE：' + (chk.notFound.join('、') || '無'));
    lines.push('少上的：' + (chk.missing.map(function (m) { return m.student + '（' + m.nicks.join('、') + '）'; }).join('；') || '無'));
    lines.push('多出來的：' + (chk.extra.join('、') || '無'));
    if (failed.length) lines.push('上標籤失敗：' + failed.join('；'));

    h += '<button class="lt-btn lt-sec lt-copy">複製結果（可貼到 Excel / LINE）</button>';
    $('.lt-out').innerHTML = h;
    if (chk.extraItems.length) wireExtra(chk.extraItems, state.tagId, name);
    $('.lt-copy').onclick = function () {
      var text = '帳號：' + (state.botName || '') + '\n標籤：' + name + '\n' + lines.join('\n');
      navigator.clipboard.writeText(text).then(function () { alert('已複製！'); }, function () { prompt('請手動複製：', text); });
    };
  }

  /* 多出來的人：取消勾選的，按按鈕把這個標籤拿掉（重新讀最新標籤，只拿掉這一個，其他保留） */
  function wireExtra(items, tagId, name) {
    var box = $('.lt-extra');
    var boxes = function () { return box.querySelectorAll('input.lt-keep'); };
    function todo() { return Array.prototype.filter.call(boxes(), function (cb) { return !cb.checked && !cb.disabled; }); }
    function count() { var n = todo().length; box.querySelector('.lt-ex-n').textContent = n; box.querySelector('.lt-ex-remove').disabled = !n || state.busy; }
    box.querySelector('.lt-ex-remove').recount = count;
    boxes().forEach(function (cb) { cb.onchange = count; });
    box.querySelector('.lt-ex-all').onclick = function () { boxes().forEach(function (cb) { if (!cb.disabled) cb.checked = true; }); count(); };
    box.querySelector('.lt-ex-none').onclick = function () { boxes().forEach(function (cb) { if (!cb.disabled) cb.checked = false; }); count(); };
    box.querySelector('.lt-ex-remove').onclick = async function () {
      var list = todo();
      if (!list.length || state.busy) return;
      if (!confirm('帳號：' + (state.botName || '') + '\n要把 ' + list.length + ' 個 LINE 的「' + name + '」標籤拿掉嗎？\n（只拿掉這一個標籤，其他標籤會保留）')) return;
      busy(true); box.querySelector('.lt-ex-remove').disabled = true;
      var ok = 0;
      for (var i = 0; i < list.length; i++) {
        var cb = list[i], it = items[cb.dataset.i], res = cb.parentNode.querySelector('.lt-ex-res');
        prog(i + 1, list.length, '拿掉標籤：' + it.nick);
        try {
          var found = (await searchContacts(it.nick)).filter(function (c) { return c.contactId === it.id; })[0];
          if (!found) { res.innerHTML = '<span class="lt-red">失敗：找不到這個 LINE</span>'; continue; }
          var cur = found.tagIds || [];
          if (cur.indexOf(tagId) < 0) { res.innerHTML = '<span class="lt-muted">（原本就沒有）</span>'; cb.disabled = true; continue; }
          await setContactTags(it.id, cur.filter(function (t) { return t !== tagId; }));
          res.innerHTML = '<span class="lt-green">✔ 已拿掉</span>'; cb.disabled = true; ok++;
        } catch (e) { res.innerHTML = '<span class="lt-red">失敗：' + esc(e.message) + '</span>'; }
        await sleep(250);
      }
      busy(false);
      getTags().then(function (t) { state.tags = t; fillTags(); });
      $('.lt-prog').textContent = '拿掉標籤完成：成功 ' + ok + ' / ' + list.length + ' 個。';
      count();
    };
    count();
  }

  /* 上完標籤記到官方LINE小幫手的「發送紀錄總表」（單獨使用時略過）：成功＝新加上或原本就有，未成功＝失敗／略過／停止 */
  function logTagTask(name, results) {
    if (!window.OLH || !results.length) return;
    var tk = window.OLH.newTask('標籤', name, results.length);
    tk.ok = results.filter(function (r) { return r === '成功' || r === '原本就有'; }).length;
    tk.notOk = tk.fail = results.length - tk.ok;
    tk.status = '已結束';
    window.OLH.saveTask(tk);
  }

  /* ========== 分頁切換 ========== */
  $('.lt-tab1').onclick = function () { $('.lt-t1').style.display = ''; $('.lt-t2').style.display = 'none'; this.classList.add('on'); $('.lt-tab2').classList.remove('on'); };
  $('.lt-tab2').onclick = function () { $('.lt-t2').style.display = ''; $('.lt-t1').style.display = 'none'; this.classList.add('on'); $('.lt-tab1').classList.remove('on'); };

  /* ========== 依名稱開頭上標籤 ========== */

  /*
    把聯絡人分三組（prefix 例如 115）：
    A＝名稱開頭就是 115；B＝115 出現在名稱中間（兄弟姊妹共用的 LINE）；
    C＝只寫兩碼「15」（例如「15武陵…」），要人工判斷。
  */
  function classifyByPrefix(contacts, prefix) {
    var p = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var isNum = /^\d+$/.test(prefix);
    var reB = new RegExp((isNum ? '(^|\\D)' : '') + p + (isNum ? '(?!\\d)' : ''));
    var short = /^1\d\d$/.test(prefix) ? prefix.slice(1) : null;
    var reC = short ? new RegExp('(^|\\D)' + short + '(?=[^\\d\\s])') : null;
    var g = { A: [], B: [], C: [] };
    contacts.forEach(function (c) {
      if (c.spam) return;
      var nick = displayName(c).trim();
      var item = { contactId: c.contactId, nick: nick, tagIds: c.tagIds || [] };
      if (nick.indexOf(prefix) === 0 && !(isNum && /\d/.test(nick.charAt(prefix.length)))) { item.group = 'A'; g.A.push(item); }
      else if (reB.test(nick)) { item.group = 'B'; g.B.push(item); }
      else if (reC && reC.test(nick)) { item.group = 'C'; g.C.push(item); }
    });
    return g;
  }

  /* 上標籤：items 是要上的人；會重新讀最新標籤，有排除標籤或已經有的就跳過 */
  async function applyToItems(items, tagId, excludeIds, onProgress, shouldStop) {
    for (var i = 0; i < items.length; i++) {
      if (shouldStop && shouldStop()) { for (var k = i; k < items.length; k++) items[k].result = '未處理（已停止）'; break; }
      var it = items[i];
      if (onProgress) onProgress(i + 1, items.length, it.nick);
      var cur = null;
      try {
        var found = (await searchContacts(it.nick)).filter(function (c) { return c.contactId === it.contactId; })[0];
        cur = found ? (found.tagIds || []) : it.tagIds;
        if (cur.indexOf(tagId) >= 0) { it.result = '原本就有'; continue; }
        var ex = cur.filter(function (t) { return excludeIds.indexOf(t) >= 0; });
        if (ex.length) { it.result = '略過（剛被加了排除的標籤）'; continue; }
        await setContactTags(it.contactId, cur.concat([tagId]));
        it.result = '成功';
      } catch (e) { it.result = '失敗：' + e.message; }
      await sleep(200);
    }
    return items;
  }

  var st2 = { all: null, groups: null, exclude: {}, cPick: {}, uncheck: {}, targets: null, stop: false, busy: false };
  var q2 = function (s) { return $('.lt-t2').querySelector(s); };
  function prog2(t) { q2('.p-prog').textContent = t; }
  function busy2(b) {
    st2.busy = b;
    $('.lt-t2').querySelectorAll('button.lt-btn').forEach(function (x) { if (!x.classList.contains('p-stop')) x.disabled = b; });
    q2('.p-stop').style.display = b ? '' : 'none';
    if (b) setBar(q2('.p-bar')); else hideBar(q2('.p-bar'));
    if (!b) q2('.p-apply').disabled = !st2.targets;
  }
  function resetPreview() { st2.targets = null; q2('.p-apply').disabled = true; q2('.p-out').innerHTML = ''; }

  q2('.p-load').onclick = async function () {
    var prefix = q2('.lt-prefix').value.trim();
    if (!prefix) { alert('請先輸入名稱開頭，例如 115。'); return; }
    busy2(true); resetPreview(); st2.exclude = {}; st2.cPick = {}; st2.uncheck = {};
    /* 進度條：總人數用這台電腦上次讀到的人數估計（第一次不知道總數，就顯示跑動的動畫＋已讀人數） */
    var TOTAL_KEY = 'lt-contacts-total-' + botId, total = 0;
    try { total = parseInt(localStorage.getItem(TOTAL_KEY), 10) || 0; } catch (e) { }
    var bar1 = q2('.p-bar1');
    q2('.p-prog1').textContent = '讀取聯絡人中…'; setBar(bar1, 0, total, '已讀 0 人');
    try {
      st2.all = await allContacts(function (n) {
        q2('.p-prog1').textContent = '讀取聯絡人中… ' + n + ' 人' + (total ? '（上次共 ' + total + ' 人）' : '');
        if (total && n <= total) setBar(bar1, n, total); else setBar(bar1, 0, 0, '已讀 ' + n + ' 人');
      });
      try { localStorage.setItem(TOTAL_KEY, String(st2.all.length)); } catch (e) { }
      setBar(bar1, 1, 1); q2('.p-prog1').textContent = '讀取完成：共 ' + st2.all.length + ' 人。';
      st2.prefix = prefix;
      st2.groups = classifyByPrefix(st2.all, prefix);
      var g = st2.groups;
      q2('.p-sum').innerHTML = '<div class="lt-box">共讀取 ' + st2.all.length + ' 個聯絡人，跟「' + esc(prefix) + '」有關的：<br>' +
        'A. 名稱開頭是 ' + esc(prefix) + '：<b>' + g.A.length + '</b> 個<br>' +
        'B. ' + esc(prefix) + ' 在名稱中間（兄弟姊妹共用）：<b>' + g.B.length + '</b> 個（會算進來）<br>' +
        (g.C.length || /^1\d\d$/.test(prefix) ? 'C. 只寫兩碼「' + esc(prefix.slice(1)) + '」：<b>' + g.C.length + '</b> 個（預覽時自己勾）' : '') + '</div>';
      renderExclude();
      ['.p-s2', '.p-s3', '.p-s4'].forEach(function (s) { q2(s).style.display = ''; });
      prog2('讀取完成。請勾選要扣掉的標籤、輸入新標籤，再按「預覽名單」。');
    } catch (e) { alert('讀取失敗：' + e.message); prog2(''); q2('.p-prog1').textContent = ''; }
    hideBar(bar1);
    busy2(false);
  };

  function renderExclude() {
    var g = st2.groups, cnt = {};
    g.A.concat(g.B, g.C).forEach(function (it) { it.tagIds.forEach(function (t) { cnt[t] = (cnt[t] || 0) + 1; }); });
    var kw = q2('.p-filter').value.trim();
    var list = state.tags.filter(function (t) { return cnt[t.tagId] && (!kw || t.name.indexOf(kw) >= 0); })
      .sort(function (a, b) { return cnt[b.tagId] - cnt[a.tagId]; });
    q2('.p-ex').innerHTML = list.length ? list.map(function (t) {
      return '<label class="lt-c"><input type="checkbox" data-t="' + esc(t.tagId) + '"' + (st2.exclude[t.tagId] ? ' checked' : '') + '> ' +
        esc(t.name) + ' <span class="lt-muted">（這群裡有 ' + cnt[t.tagId] + ' 個）</span></label>';
    }).join('') : '<span class="lt-muted">沒有符合的標籤</span>';
    q2('.p-ex').querySelectorAll('input').forEach(function (cb) {
      cb.onchange = function () { if (this.checked) st2.exclude[this.dataset.t] = 1; else delete st2.exclude[this.dataset.t]; resetPreview(); };
    });
  }
  q2('.p-filter').oninput = function () { if (st2.groups) renderExclude(); };

  q2('.p-newtag').oninput = function () {
    var name = this.value.trim(), t = state.tags.filter(function (x) { return x.name === name; })[0];
    q2('.p-tagnote').innerHTML = !name ? '' : t ? '<span class="lt-warn">後台已經有「' + esc(name) + '」（目前 ' + t.count + ' 個），會直接加在這個標籤上。</span>'
      : '這是新標籤，按「開始上標籤」時會自動建立。';
    resetPreview();
  };

  function exIds() { return Object.keys(st2.exclude); }
  function exNames(it) { return it.tagIds.filter(function (t) { return st2.exclude[t]; }).map(tagName); }

  q2('.p-preview').onclick = function () {
    if (!st2.groups) { alert('請先按「找出這些人」。'); return; }
    var newName = q2('.p-newtag').value.trim();
    if (!newName) { alert('請輸入要上的新標籤名稱。'); return; }
    var existing = state.tags.filter(function (x) { return x.name === newName; })[0];
    if (existing && st2.exclude[existing.tagId]) { alert('新標籤不能同時是要扣掉的標籤。'); return; }
    st2.newName = newName; st2.newTagId = existing ? existing.tagId : null;
    renderPreview2();
  };

  function renderPreview2() {
    var g = st2.groups, keep = [], removed = [], had = [];
    function sort(it) {
      if (exNames(it).length) removed.push(it);
      else if (st2.newTagId && it.tagIds.indexOf(st2.newTagId) >= 0) had.push(it);
      else keep.push(it);
    }
    g.A.forEach(sort); g.B.forEach(sort);
    var cRows = g.C.map(function (it) { return { it: it, ex: exNames(it), had: st2.newTagId && it.tagIds.indexOf(st2.newTagId) >= 0 }; });
    st2.keep = keep; st2.removedList = removed;
    function count() {
      var n = keep.filter(function (it) { return !st2.uncheck[it.contactId]; }).length;
      cRows.forEach(function (r) { if (!r.ex.length && !r.had && st2.cPick[r.it.contactId]) n++; });
      return n;
    }
    var h = '<div class="lt-box">新標籤：<b>' + esc(st2.newName) + '</b>' + (st2.newTagId ? '（已存在）' : '（會新建）') +
      '<br>這次會上 <b class="p-total">' + count() + '</b> 個 LINE；扣掉 <b>' + removed.length + '</b> 個（有勾選的標籤）' +
      (had.length ? '；' + had.length + ' 個原本就有新標籤' : '') + '</div>';
    if (cRows.length) {
      h += '<h4 style="margin:12px 0 4px">C 組：只寫兩碼，請判斷要不要上</h4><div class="lt-scroll">';
      cRows.forEach(function (r) {
        h += '<label class="lt-c"><input type="checkbox" class="p-c" data-id="' + esc(r.it.contactId) + '"' +
          (st2.cPick[r.it.contactId] ? ' checked' : '') + (r.ex.length || r.had ? ' disabled' : '') + '> ' + esc(r.it.nick) +
          (r.ex.length ? ' <span class="lt-warn">（有排除標籤：' + esc(r.ex.join('、')) + '）</span>' : '') +
          (r.had ? ' <span class="lt-green">（原本就有）</span>' : '') + '</label>';
      });
      h += '</div>';
    }
    h += '<h4 style="margin:12px 0 4px">要上的名單（' + keep.length + '，可取消勾選）</h4><div class="lt-scroll">';
    keep.forEach(function (it) {
      h += '<label class="lt-c"><input type="checkbox" class="p-k" data-id="' + esc(it.contactId) + '"' + (st2.uncheck[it.contactId] ? '' : ' checked') + '> ' +
        esc(it.nick) + (it.group === 'B' ? ' <span class="lt-muted">（中間有）</span>' : '') + '</label>';
    });
    h += '</div>';
    h += '<details style="margin-top:8px"><summary>扣掉的人（' + removed.length + '）</summary><div class="lt-scroll">' +
      removed.map(function (it) { return esc(it.nick) + ' <span class="lt-muted">← ' + esc(exNames(it).join('、')) + '</span>'; }).join('<br>') + '</div></details>';
    q2('.p-out').innerHTML = h;
    q2('.p-out').querySelectorAll('input.p-c').forEach(function (cb) {
      cb.onchange = function () { if (this.checked) st2.cPick[this.dataset.id] = 1; else delete st2.cPick[this.dataset.id]; q2('.p-total').textContent = count(); };
    });
    q2('.p-out').querySelectorAll('input.p-k').forEach(function (cb) {
      cb.onchange = function () { if (this.checked) delete st2.uncheck[this.dataset.id]; else st2.uncheck[this.dataset.id] = 1; q2('.p-total').textContent = count(); };
    });
    st2.cRows = cRows;
    st2.targets = true; q2('.p-apply').disabled = false;
    prog2('預覽完成。確認名單後按「開始上標籤」。');
  }

  function currentTargets() {
    var t = st2.keep.filter(function (it) { return !st2.uncheck[it.contactId]; });
    st2.cRows.forEach(function (r) { if (!r.ex.length && !r.had && st2.cPick[r.it.contactId]) t.push(r.it); });
    return t.map(function (it) { return { contactId: it.contactId, nick: it.nick, tagIds: it.tagIds, group: it.group }; });
  }

  q2('.p-stop').onclick = function () { st2.stop = true; prog2('停止中，做完目前這一個就停…'); };

  q2('.p-apply').onclick = async function () {
    if (!st2.targets || st2.busy) return;
    var targets = currentTargets();
    if (!targets.length) { alert('沒有要上的人。'); return; }
    if (!confirm('帳號：' + (state.botName || '') + '\n要幫 ' + targets.length + ' 個 LINE 加上標籤「' + st2.newName + '」' +
      (st2.newTagId ? '' : '（會先建立這個新標籤）') + '\n原本的標籤會保留。確定嗎？')) return;
    busy2(true); st2.stop = false;
    try {
      prog2('準備標籤…');
      var tagId = await ensureTag(st2.newName);
      st2.newTagId = tagId;
      state.tags = await getTags(); fillTags();
      await applyToItems(targets, tagId, exIds(), function (i, n, nick) { prog2('上標籤中 ' + i + ' / ' + n + '：' + nick); setBar(q2('.p-bar'), i, n); }, function () { return st2.stop; });
      logTagTask(st2.newName, targets.map(function (x) { return x.result || ''; }));
      prog2('上完了，正在做漏上檢查（重新讀取全部聯絡人）…');
      var total = st2.all ? st2.all.length : 0;
      setBar(q2('.p-bar'), 0, total);
      var fresh = await allContacts(function (n) { prog2('漏上檢查：讀取聯絡人 ' + n + ' 人'); setBar(q2('.p-bar'), Math.min(n, total), total); });
      renderResult2(targets, fresh, tagId);
      prog2(st2.stop ? '已停止。' : '完成！');
    } catch (e) { alert('發生錯誤：' + e.message); prog2('發生錯誤：' + e.message); }
    st2.targets = null; busy2(false);
  };

  function renderResult2(targets, fresh, tagId) {
    var byId = {}; fresh.forEach(function (c) { byId[c.contactId] = c; });
    var want = {}; targets.forEach(function (t) { want[t.contactId] = 1; });
    var removedIds = {}; st2.removedList.forEach(function (it) { removedIds[it.contactId] = 1; });
    var ok = [], missing = [], failed = [], skipped = [], extra = [], wrong = [];
    targets.forEach(function (t) {
      var c = byId[t.contactId], has = c && (c.tagIds || []).indexOf(tagId) >= 0;
      if (t.result && t.result.indexOf('失敗') === 0) failed.push(t);
      else if (t.result && t.result.indexOf('略過') === 0) skipped.push(t);
      if (has) ok.push(t); else if (!(t.result && t.result.indexOf('略過') === 0)) missing.push(t);
    });
    fresh.forEach(function (c) {
      if ((c.tagIds || []).indexOf(tagId) < 0 || want[c.contactId]) return;
      if (removedIds[c.contactId]) wrong.push(displayName(c)); else extra.push(displayName(c));
    });
    var tcount = (state.tags.filter(function (x) { return x.tagId === tagId; })[0] || {}).count;
    var h = '<div class="lt-box">帳號：<b>' + esc(state.botName || '') + '</b>　標籤：<b>' + esc(st2.newName) + '</b><br>' +
      '預計 <b>' + targets.length + '</b> 個，確認有上到 <b>' + ok.length + '</b> 個。後台這個標籤目前共 <b>' +
      fresh.filter(function (c) { return (c.tagIds || []).indexOf(tagId) >= 0; }).length + '</b> 個。</div>';
    h += '<h4 style="margin:12px 0 4px">上標籤結果（' + ok.length + '）</h4><div class="lt-scroll"><table><tr><th style="width:60px">類型</th><th>LINE 名稱</th></tr>' +
      ok.map(function (t) { return '<tr><td>' + ({ A: '開頭', B: '中間', C: '兩碼' }[t.group] || '') + '</td><td>' + esc(t.nick) + '</td></tr>'; }).join('') + '</table></div>';
    h += '<h4 style="margin:14px 0 4px">漏上檢查</h4>';
    if (!missing.length && !failed.length && !wrong.length && !extra.length) h += '<div class="lt-box lt-green">✔ 該上的都上了，扣掉的人也都沒有被上到。</div>';
    if (missing.length) h += '<div class="lt-box"><span class="lt-red">少上的（' + missing.length + '）</span>：<div class="lt-scroll">' +
      missing.map(function (t) { return esc(t.nick) + (t.result ? ' <span class="lt-muted">（' + esc(t.result) + '）</span>' : ''); }).join('<br>') + '</div>' +
      '<div class="lt-muted">可以再按一次「預覽名單」→「開始上標籤」補上。</div></div>';
    if (wrong.length) h += '<div class="lt-box"><span class="lt-red">扣掉的人卻有新標籤（' + wrong.length + '）</span>：<div class="lt-scroll">' + wrong.map(esc).join('<br>') + '</div></div>';
    if (skipped.length) h += '<div class="lt-box"><span class="lt-warn">略過（' + skipped.length + '）</span>：上標籤當下發現已有排除的標籤：<br>' + skipped.map(function (t) { return esc(t.nick); }).join('<br>') + '</div>';
    if (extra.length) h += '<div class="lt-box"><span class="lt-warn">多出來的（' + extra.length + '）</span>：有新標籤，但不在這次名單裡：<div class="lt-scroll">' + extra.map(esc).join('<br>') +
      '</div><div class="lt-muted">如果新標籤以前就存在，這些可能是以前上的。</div></div>';
    h += '<button class="lt-btn lt-sec p-copy">複製結果（可貼到 Excel）</button>';
    q2('.p-out').innerHTML = h;
    q2('.p-copy').onclick = function () {
      var lines = ['帳號\t' + (state.botName || ''), '標籤\t' + st2.newName, '', '類型\tLINE 名稱\t結果'];
      targets.forEach(function (t) { lines.push(({ A: '開頭', B: '中間', C: '兩碼' }[t.group] || '') + '\t' + t.nick + '\t' + (byId[t.contactId] && (byId[t.contactId].tagIds || []).indexOf(tagId) >= 0 ? '有上到' : '沒上到 ' + (t.result || ''))); });
      if (extra.length) { lines.push('', '多出來的'); extra.forEach(function (n) { lines.push('\t' + n); }); }
      if (wrong.length) { lines.push('', '扣掉的人卻有新標籤'); wrong.forEach(function (n) { lines.push('\t' + n); }); }
      var text = lines.join('\n');
      navigator.clipboard.writeText(text).then(function () { alert('已複製！'); }, function () { prompt('請手動複製：', text); });
    };
  }

  /* 給 Claude 用的介面 */
  window.LineTagger = { botId: botId, getTags: getTags, searchContacts: searchContacts, pickNames: pickNames, parseText: parseText,
    preview: preview, apply: apply, check: check, shortLabel: shortLabel,
    allContacts: allContacts, classifyByPrefix: classifyByPrefix, ensureTag: ensureTag, applyToItems: applyToItems };
})();

})(mount('tag'));

/* ===== line-messages.js ===== */
(function (__mount) {
/*
  LINE 官方帳號「批次發訊息」小工具
  用法：在 chat.line.biz（LINE 官方帳號聊天後台）按書籤列的「批次發訊息」。
  兩種模式：
    統一訊息：名單（Excel 或貼姓名）＋一段訊息，每個人收到一樣的內容（可用 [姓名] 代入）。
    每人不同：Excel 有「姓名」和「訊息」兩欄，每個人收到自己那一列的訊息。
  流程：名單 → 模式／訊息 → 搜尋預覽 → 輸入則數確認 → 發送 → 結果、漏發檢查、重發。
  發送、重發、防重複的部分和「批次發成績」是同一套（2026/10 已實測）。
  注意：本檔案只能用 區塊註解，不要用雙斜線註解（做成書籤時會壞掉）。
*/
(function () {
  'use strict';

  /* true＝可以發送；改成 false 就變成只能預覽 */
  var SEND_ENABLED = true;

  /* 統一訊息的公版範本（2026/10/18 改成「圖示條列」寫法：第一行看出是什麼事、中間條列、最後寫要家長做什麼；
     三個帳號共用，所以不寫補習班名稱）。要改範本文字就改這裡，改完重新產生、發布。
     [姓名] 會換成名單上的學生；其他 [方括號] 會在視窗裡出現填空欄（名稱有「日期」的用行事曆選）。 */
  var TEMPLATES = [
    { name: '1 作業沒寫', text: '📌 作業未完成｜[姓名]同學\n📚 [班別]\n✅ 請家長協助：\n1. 提醒孩子盡快完成作業\n2. 下次上課帶來檢查及補交。' },
    { name: '2 輔導沒到', text: '📌 輔導未到班｜[姓名]\n📚 [班別]\n✅ 接下來請爸爸、媽媽協助：\n1. 到櫃台領取今天的考卷，回家多加練習。\n2. 或回覆這則訊息，我們傳電子檔給您。' },
    { name: '3 缺課', text: '📌 缺課通知｜[姓名]\n🗓 [缺課日期]　[班別]\n✅ 請協助：提醒孩子自行到classroom完成線上補課' },
    { name: '4 上課提醒', text: '⏰ 上課提醒\n📚 [班別]\n🗓 [日期]　[時間]\n🎒 記得帶講義\n照常上課，請準時到班，謝謝！' },
    { name: '5 調課通知', text: '🔄 調課通知｜[班別]\n❌ 原本：[日期]　[時間]\n✅ 改為：[新日期]　[新時間]' },
    { name: '5-2 停課提醒', text: '🚫 停課提醒\n📚 [班別]\n🗓 [日期] 停課一次\n當天不用到班，之後照原課表上課，謝謝！' }
  ];

  var PANEL_ID = 'lm-panel-2026';
  var old = document.getElementById(PANEL_ID);
  if (old) { old.style.display = old.style.display === 'none' ? 'block' : 'none'; return; }

  var botId = location.pathname.split('/')[1] || '';
  if (location.hostname !== 'chat.line.biz' || !/^U[0-9a-f]{32}$/.test(botId)) {
    alert('請先打開 LINE 官方帳號的聊天後台（chat.line.biz），並選好要用的帳號，再按一次。');
    return;
  }

  /* ========== 連線 ========== */
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function api(path) {
    return fetch(path, { headers: { 'Accept': 'application/json' }, credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error('LINE 回應錯誤 ' + r.status);
      return r.json();
    });
  }
  var csrf = null;
  async function getCsrf() {
    if (!csrf) csrf = await (await fetch('/api/v1/csrfToken', { credentials: 'same-origin' })).json();
    return csrf;
  }
  function newSendId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }
  /* 發一則文字訊息（跟後台聊天室手動送出一樣）。回傳 HTTP 狀態碼；200＝成功、429＝太快被擋（確定沒送出） */
  async function sendText(chatId, text, sendId) {
    var c = await getCsrf(), headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    headers[c.headerName] = c.token;
    var r = await fetch('/api/v1/bots/' + botId + '/chats/' + chatId + '/messages/send', {
      method: 'POST', headers: headers, credentials: 'same-origin',
      body: JSON.stringify({ type: 'text', text: text, sendId: sendId })
    });
    return r.status;
  }


  /* 發一張照片（跟後台聊天室按「傳送圖片」一樣）。回傳 HTTP 狀態碼 */
  async function sendFile(chatId, file, sendId) {
    var c = await getCsrf(), headers = { 'Accept': 'application/json' };
    headers[c.headerName] = c.token;
    var fd = new FormData();
    fd.append('file', file, file.name);
    fd.append('sendId', sendId);
    var r = await fetch('/api/v1/bots/' + botId + '/chats/' + chatId + '/messages/sendFile', {
      method: 'POST', headers: headers, credentials: 'same-origin', body: fd
    });
    return r.status;
  }
  /* 讀聊天室最新 50 則（只讀，不會變已讀）；讀不到回傳 null */
  async function recentSent(chatId) {
    try { var j = await api('/api/v3/bots/' + botId + '/chats/' + chatId + '/messages?limit=50'); return (j.list || []).filter(function (x) { return x.type === 'messageSent'; }); }
    catch (e) { return null; }
  }

  /* 送達確認：讀聊天室最新 50 則（只讀，不會變已讀），找這次發的那一則（用發送編號 sendId，或同樣文字＋時間）。
     回傳 true＝找到、false＝找不到、null＝讀不到 */
  async function inChat(chatId, sendId, text, sentAt) {
    try {
      var j = await api('/api/v3/bots/' + botId + '/chats/' + chatId + '/messages?limit=50');
      return (j.list || []).some(function (x) {
        return x.type === 'messageSent' && (x.sendId === sendId || (x.message && x.message.text === text && x.timestamp >= sentAt - 120000));
      });
    } catch (e) { return null; }
  }

  /* 防重複：記住 24 小時內發過的「同一個 LINE＋同一段內容」（只存在這台電腦的瀏覽器） */
  var SENT_KEY = 'lg-sent-log';
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return String(h); }
  function sentLog() {
    try { var o = JSON.parse(localStorage.getItem(SENT_KEY) || '{}'), now = Date.now(), k;
      for (k in o) if (now - o[k] > 86400000) delete o[k]; return o; } catch (e) { return {}; }
  }
  function markSent(chatId, text) { try { var o = sentLog(); o[chatId + ':' + hash(text)] = Date.now(); localStorage.setItem(SENT_KEY, JSON.stringify(o)); } catch (e) { } }
  function alreadySent(chatId, text) { return !!sentLog()[chatId + ':' + hash(text)]; }
  function unmarkSent(chatId, text) { try { var o = sentLog(); delete o[chatId + ':' + hash(text)]; localStorage.setItem(SENT_KEY, JSON.stringify(o)); } catch (e) { } }

  function searchContacts(q) {
    return api('/api/v2/bots/' + botId + '/contacts?query=' + encodeURIComponent(q) + '&limit=50').then(function (j) { return j.list || []; });
  }
  function getChat(id) { return api('/api/v1/bots/' + botId + '/chats/' + id).catch(function () { return null; }); }
  function displayName(c) { var p = c.profile || {}; return p.nickname || p.name || '(沒有名稱)'; }

  /* ========== 讀 Excel / 貼上 ========== */
  var NAME_HEADERS = ['姓名', '學生姓名', '學生', '名字', '中文姓名'];
  var MSG_HEADERS = ['訊息', '訊息內容', '內容', '要發的訊息', '通知內容'];

  function parseText(text) {
    var lines = text.replace(/\r/g, '').split('\n').filter(function (l) { return l.trim(); });
    var sep = lines.some(function (l) { return l.indexOf('\t') >= 0; }) ? '\t' : ',';
    return lines.map(function (l) { return l.split(sep).map(function (s) { return s.replace(/^"|"$/g, '').trim(); }); });
  }

  /* 找出標題列（含「姓名」那一列），整理成 [{欄名: 值}]。
     統一訊息模式可以只貼一排姓名（沒有標題）：這時第一欄就當姓名。 */
  function toTable(rows) {
    var hr = -1, nameCol = -1;
    for (var r = 0; r < Math.min(rows.length, 10) && hr < 0; r++) {
      for (var c = 0; c < (rows[r] || []).length; c++) {
        if (NAME_HEADERS.indexOf(String(rows[r][c] || '').trim()) >= 0) { hr = r; nameCol = c; break; }
      }
    }
    var headers;
    if (hr < 0) {
      if (!rows.length) throw new Error('名單是空的。');
      headers = ['姓名']; nameCol = 0; hr = -1;
    } else {
      headers = rows[hr].map(function (h) { return String(h || '').trim(); });
    }
    var records = [], seen = {};
    for (var i = hr + 1; i < rows.length; i++) {
      var row = rows[i] || [], rec = {}, any = false;
      headers.forEach(function (h, k) { if (!h) return; var v = row[k] == null ? '' : String(row[k]).trim(); rec[h] = v; if (v) any = true; });
      rec.__name = String(row[nameCol] || '').replace(/\s+/g, '');
      rec.__row = i + 1;
      if (!any || !rec.__name || NAME_HEADERS.indexOf(rec.__name) >= 0) continue;
      records.push(rec);
    }
    var msgHeader = MSG_HEADERS.filter(function (h) { return headers.indexOf(h) >= 0; })[0] || '';
    return { headers: headers.filter(Boolean), nameHeader: headers[nameCol], msgHeader: msgHeader, records: records, noHeader: hr < 0 };
  }

  /* Excel 的數字：整數照寫，小數最多留 1 位（例如 82.4615 → 82.5） */
  function fmt(v) {
    if (/^-?\d+\.\d{2,}$/.test(v)) { var n = Math.round(parseFloat(v) * 10) / 10; return String(n); }
    return v;
  }

  async function readXlsx(buf) {
    var dv = new DataView(buf), u8 = new Uint8Array(buf), eocd = -1;
    for (var i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 70000); i--) { if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
    if (eocd < 0) throw new Error('這個檔案不是 .xlsx 格式');
    var count = dv.getUint16(eocd + 10, true), off = dv.getUint32(eocd + 16, true), files = {}, dec = new TextDecoder('utf-8');
    for (var k = 0; k < count; k++) {
      var method = dv.getUint16(off + 10, true), csize = dv.getUint32(off + 20, true);
      var nlen = dv.getUint16(off + 28, true), elen = dv.getUint16(off + 30, true), clen = dv.getUint16(off + 32, true), lho = dv.getUint32(off + 42, true);
      files[dec.decode(u8.subarray(off + 46, off + 46 + nlen))] = { method: method, csize: csize, lho: lho };
      off += 46 + nlen + elen + clen;
    }
    async function read(name) {
      var f = files[name]; if (!f) return null;
      var l = f.lho, start = l + 30 + dv.getUint16(l + 26, true) + dv.getUint16(l + 28, true), data = u8.subarray(start, start + f.csize);
      if (f.method === 0) return dec.decode(data);
      return await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
    }
    var xml = function (t) { return new DOMParser().parseFromString(t, 'application/xml'); };
    var shared = [], sst = await read('xl/sharedStrings.xml');
    if (sst) {
      var sis = xml(sst).getElementsByTagName('si');
      for (var s = 0; s < sis.length; s++) { var ts = sis[s].getElementsByTagName('t'), str = ''; for (var q = 0; q < ts.length; q++) str += ts[q].textContent; shared.push(str); }
    }
    var sheetName = Object.keys(files).filter(function (n) { return /^xl\/worksheets\/sheet\d+\.xml$/.test(n); })
      .sort(function (a, b) { return parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]); })[0];
    if (!sheetName) throw new Error('Excel 裡找不到工作表');
    var doc = xml(await read(sheetName)), rows = [], rowEls = doc.getElementsByTagName('row');
    for (var r = 0; r < rowEls.length; r++) {
      var cells = rowEls[r].getElementsByTagName('c'), row = [];
      var rn = parseInt(rowEls[r].getAttribute('r') || (r + 1)) - 1;
      for (var c = 0; c < cells.length; c++) {
        var ref = cells[c].getAttribute('r') || '', letters = ref.replace(/\d+/g, ''), idx = 0;
        for (var z = 0; z < letters.length; z++) idx = idx * 26 + (letters.charCodeAt(z) - 64);
        idx = letters ? idx - 1 : row.length;
        var t = cells[c].getAttribute('t'), v = cells[c].getElementsByTagName('v')[0], val = '';
        if (t === 's' && v) val = shared[parseInt(v.textContent)] || '';
        else if (t === 'inlineStr') { var it = cells[c].getElementsByTagName('t'); for (var w = 0; w < it.length; w++) val += it[w].textContent; }
        else if (v) val = fmt(v.textContent);
        row[idx] = val;
      }
      rows[rn] = row;
    }
    for (var e = 0; e < rows.length; e++) if (!rows[e]) rows[e] = [];
    return rows;
  }

  /* ========== 訊息 ========== */
  /* 把 [欄名] 或 {欄名} 換成資料；回傳 { text, missing: [空白的欄], unknown: [Excel 沒有的欄] } */
  function render(template, rec, headers) {
    var missing = [], unknown = [];
    var text = template.replace(/\{([^{}]+)\}|\[([^\[\]]+)\]/g, function (all, k1, k2) {
      var key = (k1 || k2).trim();
      if (headers.indexOf(key) < 0) { if (unknown.indexOf(key) < 0) unknown.push(key); return all; }
      var v = rec[key];
      if (!v) { if (missing.indexOf(key) < 0) missing.push(key); return ''; }
      return v;
    });
    return { text: text, missing: missing, unknown: unknown };
  }

  /* ========== 預覽（只讀） ==========
     規則（寧可不發，也不要發錯人）：
     - 只考慮「後台名稱裡有學生姓名」的 LINE
     - 名稱裡學生姓名「前面那段」不一樣 → 可能是不同人 → 先不勾（待確認，可一次全部勾選）
     - 訊息要用的欄位是空的（例如這一列沒寫訊息）→ 不發
     - 家長有未讀訊息 → 提醒 */
  async function preview(table, template, onProgress) {
    var out = [];
    var hasNameInTemplate = template.indexOf('{' + table.nameHeader + '}') >= 0 || template.indexOf('[' + table.nameHeader + ']') >= 0;
    for (var i = 0; i < table.records.length; i++) {
      var rec = table.records[i], n = rec.__name;
      if (onProgress) onProgress(i + 1, table.records.length, n);
      var msg = render(template, rec, table.headers);
      msg.text = msg.text.replace(/!/g, '！');   /* 驚嘆號一律全形 */
      var photos = table.photos || [];
      var key = msg.text + (photos.length ? '|照片:' + photos.map(function (f) { return f.name + '/' + f.size; }).join(',') + '|' + state.porder : '');
      var item ={ student: n, row: rec.__row, text: msg.text, photos: photos, key: key, missing: msg.missing, unknown: msg.unknown, contacts: [], warn: [], block: '' };
      var list;
      try { list = await searchContacts(n); } catch (e) { item.block = '搜尋失敗：' + e.message; out.push(item); continue; }
      var mine = list.filter(function (c) { return displayName(c).indexOf(n) >= 0 && !c.spam; });
      var others = list.filter(function (c) { return displayName(c).indexOf(n) < 0 && !c.spam; });
      if (!mine.length) item.block = '找不到 LINE';
      var prefixes = {};
      mine.forEach(function (c) { var nick = displayName(c); prefixes[nick.slice(0, nick.indexOf(n)).replace(/\s/g, '')] = 1; });
      var ambiguous = Object.keys(prefixes).length > 1;
      if (ambiguous) item.warn.push('找到的 LINE 看起來不是同一家人（名稱前面不一樣），請確認後再勾');
      if (others.length) item.warn.push('另有 ' + others.length + ' 個 LINE 只有本名相符，已排除');
      if (msg.missing.length) item.warn.push('「' + msg.missing.join('、') + '」是空的，這位不會發');
      if (!msg.text.trim() && !msg.missing.length && !photos.length) item.warn.push('訊息是空的，這位不會發');
      for (var k = 0; k < mine.length; k++) {
        var c = mine[k], nick = displayName(c), chat = await getChat(c.contactId);
        var siblings = (nick.match(/\d{2,3}(?=[一-鿿])/g) || []).length >= 2;
        var note = [], dup = alreadySent(c.contactId, key);
        if (dup) note.push('24 小時內已經發過一樣的內容，預設不重發');
        if (msg.text.length > 4900) note.push('訊息太長，LINE 可能不收');
        if (nick.indexOf('本人') >= 0) note.push('這是學生本人的 LINE');
        if (chat && chat.read === false) note.push('家長有未讀訊息，記得回覆');
        if (c.friend === false) note.push('非好友/已封鎖，可能收不到');
        if (siblings && !hasNameInTemplate) note.push('兄弟姊妹共用的 LINE，訊息裡最好寫孩子姓名');
        var okToSend = !dup && (msg.text.trim() || photos.length) && msg.text.length <= 4900 && !msg.missing.length && !msg.unknown.length && c.friend !== false;
        item.contacts.push({ contactId: c.contactId, nick: nick, unread: !!(chat && chat.read === false), note: note.join('、'),
          checked: !!(!ambiguous && okToSend), pending: !!(ambiguous && okToSend) });
        await sleep(120);
      }
      out.push(item);
      await sleep(150);
    }
    return out;
  }

  /* ========== 畫面 ========== */
  var P = '#' + PANEL_ID, MAIN = '#6a1b9a';
  var css = '' +
    P + '{position:fixed;top:12px;right:12px;width:600px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow:auto;z-index:2147483000;background:#fff;color:#222;border:1px solid #cfd8dc;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,.25);font:14px/1.5 "Microsoft JhengHei","PingFang TC",sans-serif}' +
    P + ' *{box-sizing:border-box}' +
    P + ' .lg-head{position:sticky;top:0;background:' + MAIN + ';color:#fff;padding:10px 14px;font-weight:bold;font-size:16px;display:flex;justify-content:space-between;align-items:center;z-index:1}' +
    P + ' .lg-x{cursor:pointer;background:none;border:none;color:#fff;font-size:20px;line-height:1}' +
    P + ' .lg-body{padding:12px 14px}' +
    P + ' .lg-step{margin-bottom:14px;padding-bottom:12px;border-bottom:1px dashed #ddd}' +
    P + ' .lg-step h4{margin:0 0 6px;font-size:15px}' +
    P + ' textarea{width:100%;font-size:14px;padding:6px;border:1px solid #ccc;border-radius:6px}' +
    P + ' button.lg-btn{padding:7px 12px;margin:4px 6px 0 0;border-radius:6px;border:1px solid ' + MAIN + ';background:' + MAIN + ';color:#fff;font-size:14px;cursor:pointer}' +
    P + ' button.lg-btn.lg-sec{background:#fff;color:' + MAIN + '}' +
    P + ' button.lg-chip{padding:2px 8px;margin:2px;border-radius:12px;border:1px solid #ce93d8;background:#f3e5f5;color:#4a148c;font-size:12px;cursor:pointer}' +
    P + ' button:disabled{opacity:.4;cursor:not-allowed}' +
    P + ' table{width:100%;border-collapse:collapse;margin-top:6px;font-size:13px}' +
    P + ' th,' + P + ' td{border-bottom:1px solid #eee;padding:6px 4px;text-align:left;vertical-align:top}' +
    P + ' th{background:#f5f7f8}' +
    P + ' .lg-muted{color:#777;font-size:12px}' +
    P + ' .lg-red{color:#d32f2f;font-weight:bold}' +
    P + ' .lg-warn{color:#e65100}' +
    P + ' .lg-box{background:#f5f7f8;border-radius:6px;padding:8px 10px;margin-top:6px}' +
    P + ' .lg-msg{white-space:pre-wrap;background:#e8f5e9;border-radius:8px;padding:6px 8px;margin-top:4px}' +
    P + ' .lg-banner{background:#fff3e0;color:#e65100;border-radius:6px;padding:6px 10px;margin-bottom:10px;font-weight:bold}' +
    P + ' label.lg-c{display:block;cursor:pointer}' +
    P + ' .lg-mode{display:block;padding:8px 10px;border:2px solid #e0e0e0;border-radius:8px;margin-bottom:6px;cursor:pointer}' +
    P + ' .lg-mode.on{border-color:' + MAIN + ';background:#f3e5f5}' +
    P + ' .lg-prog{margin-top:6px;color:' + MAIN + ';font-weight:bold}' +
    P + ' .lg-sendbox{border:2px solid #90caf9;background:#e3f2fd;border-radius:8px;padding:8px 10px;margin:6px 0}' +
    P + ' .lg-bar{position:relative;height:20px;background:#fff;border:1px solid #bbdefb;border-radius:10px;overflow:hidden;margin:6px 0}' +
    P + ' .lg-bar i{display:block;height:100%;width:0;background:' + MAIN + ';transition:width .25s}' +
    P + ' .lg-bar span{position:absolute;left:0;right:0;top:0;text-align:center;font-size:12px;line-height:20px;font-weight:bold;color:#222}' +
    P + ' .lg-done{border-radius:8px;padding:10px 12px;margin:6px 0;font-size:16px;font-weight:bold}' +
    P + ' .lg-done-ok{background:#e8f5e9;color:#1b5e20;border:2px solid #66bb6a}' +
    P + ' .lg-done-bad{background:#ffebee;color:#b71c1c;border:2px solid #ef5350}';

  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = '<style>' + css + '</style>' +
    '<div class="lg-head"><span>批次發訊息</span><button class="lg-x" title="關閉">×</button></div>' +
    '<div class="lg-body">' +
    (SEND_ENABLED ? '' : '<div class="lg-banner">預覽版：只會顯示每位家長會收到的內容，不會真的發送。</div>') +
    '<div class="lg-box" style="margin:0 0 12px">目前帳號：<b class="lg-bot">讀取中…</b></div>' +
    '<div class="lg-step"><h4>① 選模式</h4>' +
    '<label class="lg-mode on"><input type="radio" name="lm-mode" value="same" checked> <b>統一訊息</b>：每個人收到一樣的內容（可以用 [姓名] 代入名字）</label>' +
    '<label class="lg-mode"><input type="radio" name="lm-mode" value="each"> <b>每人不同</b>：Excel 有「姓名」和「訊息」兩欄，每個人收到自己那一列的訊息</label>' +
    '</div>' +
    '<div class="lg-step"><h4>② 名單</h4>' +
    '<div>選檔案（.xlsx / .csv）：<input type="file" class="lg-file" accept=".xlsx,.csv,.txt"></div>' +
    '<div class="lg-muted lg-paste-hint" style="margin:4px 0"></div>' +
    '<textarea class="lg-paste" style="height:70px"></textarea>' +
    '<div class="lg-info lg-muted"></div></div>' +
    '<div class="lg-step"><h4 class="lg-msg-title">③ 訊息內容</h4>' +
    '<div class="lg-tplbar" style="margin-bottom:6px">套用範本：<select class="lg-tsel" style="padding:4px;border:1px solid #ccc;border-radius:6px;font-size:14px"></select>' +
    ' <span class="lg-muted">選了之後可以在下面直接改字（只改這一次）</span></div>' +
    '<div class="lg-muted lg-msg-hint"></div>' +
    '<div class="lg-chips"></div>' +
    '<textarea class="lg-tpl" style="height:130px"></textarea>' +
    '<div class="lg-fill"></div>' +
    '<div class="lg-livepv" style="display:none;margin-top:8px"></div>' +
    '<div class="lg-photobar" style="margin-top:8px;padding:8px 10px;border:1px dashed #ce93d8;border-radius:8px;background:#fcf7fd">' +
    '📷 <b>附加照片</b>（可以不加）：<input type="file" class="lg-photo" accept="image/jpeg,image/png" multiple>' +
    '<div class="lg-muted">最多 5 張，每張 10MB 以內（jpg、png）。順序：' +
    '<label style="cursor:pointer"><input type="radio" name="lm-porder" value="text" checked> 先文字再照片</label> ' +
    '<label style="cursor:pointer"><input type="radio" name="lm-porder" value="photo"> 先照片再文字</label></div>' +
    '<div class="lg-thumbs" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px"></div></div></div>' +
    '<div class="lg-step"><h4>④ 預覽</h4>' +
    '<div style="margin-bottom:6px">任務名稱（記在發送紀錄總表）：<input type="text" class="lg-task" placeholder="例如：沒寫作業通知" style="width:58%;padding:4px;border:1px solid #ccc;border-radius:6px;font-size:14px"></div>' +
    '<button class="lg-btn lg-preview">搜尋預覽</button>' +
    (SEND_ENABLED
      ? '<button class="lg-btn lg-send" disabled title="先按「搜尋預覽」並確認內容" style="background:#c62828;border-color:#c62828">開始發送</button>' +
        '<button class="lg-btn lg-sec lg-stop" style="display:none;color:#c62828;border-color:#c62828">停止發送</button>'
      : '<button class="lg-btn lg-send" disabled title="預覽版還不能發送">開始發送（尚未開放）</button>') +
    '<div class="lg-prog"></div></div>' +
    '<div class="lg-out"></div>' +
    '</div>';
  __mount(panel);

  var $ = function (s) { return panel.querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); };
  var state = { table: null, items: null, busy: false, sameText: '' };
  $('.lg-x').onclick = function () { panel.style.display = 'none'; };
  api('/api/v1/bots/' + botId + '?noFilter=true').then(function (b) { $('.lg-bot').textContent = b.name || botId; }, function () { $('.lg-bot').textContent = botId; });

  function mode() { return panel.querySelector('input[name=lm-mode]:checked').value; }

  /* ========== 範本與填空 ========== */
  /* 範本全部寫在上面的 TEMPLATES，每台電腦都一樣（不另外存個人版本） */
  function tplText(name) { var t = TEMPLATES.filter(function (x) { return x.name === name; })[0]; return t ? t.text : ''; }
  function fillTplSelect() {
    $('.lg-tsel').innerHTML = '<option value="">－ 選一個範本 －</option>' + TEMPLATES.map(function (t) {
      return '<option value="' + esc(t.name) + '">' + esc(t.name) + '</option>';
    }).join('');
  }
  function isTemplateText(s) { return !s.trim() || TEMPLATES.some(function (t) { return t.text === s; }); }
  $('.lg-tsel').onchange = function () {
    var name = this.value; if (!name) return;
    var cur = $('.lg-tpl').value;
    if (!isTemplateText(cur) && !confirm('訊息框裡已經有內容，要換成「' + name + '」範本嗎？')) { this.value = ''; return; }
    $('.lg-tpl').value = tplText(name); renderFill(true);
  };

  /* 訊息裡名單沒有的 [方括號] → 填空欄；名稱有「日期」的用行事曆，會寫成 10/25(六) */
  state.fill = {};
  function knownHeaders() { return state.table ? state.table.headers : ['姓名']; }
  function fillKeys() {
    var keys = [], re = /\[([^\[\]]+)\]/g, m, txt = $('.lg-tpl').value, known = knownHeaders();
    while ((m = re.exec(txt))) { var k = m[1].trim(); if (known.indexOf(k) < 0 && keys.indexOf(k) < 0) keys.push(k); }
    return keys;
  }
  function fmtDate(v) {
    if (!v) return '';
    var p = v.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]);
    return (+p[1]) + '/' + (+p[2]) + '(' + '日一二三四五六'.charAt(d.getDay()) + ')';
  }
  function fillValue(k) { var v = (state.fill[k] || '').trim(); return k.indexOf('日期') >= 0 ? fmtDate(v) : v; }

  /* 訊息預覽：用「吳政興」當範例，邊打字邊顯示家長會收到的樣子（還沒填的空格保留 [方括號]） */
  var SAMPLE_NAME = '吳政興';
  function renderLivePreview() {
    var box = $('.lg-livepv'); if (!box) return;
    var tpl = $('.lg-tpl').value, each = mode() === 'each';
    if (!tpl.trim() && !(state.photos && state.photos.length && !each)) { box.style.display = 'none'; return; }
    var nameH = state.table ? state.table.nameHeader : '姓名';
    var txt = tpl.replace(/\[([^\[\]]+)\]|\{([^{}]+)\}/g, function (all, a, b) {
      var k = (a || b).trim();
      if (k === '姓名' || k === nameH) return SAMPLE_NAME;
      if (each && state.table && k === state.table.msgHeader) return '（這一位在 Excel「' + k + '」欄的內容）';
      if (Object.prototype.hasOwnProperty.call(state.fill, k) && fillValue(k)) return fillValue(k);
      return all;
    }).replace(/!/g, '！');
    var nPh = !each && state.photos ? state.photos.length : 0;
    box.innerHTML = '<div class="lg-muted">👀 訊息預覽（範例：' + SAMPLE_NAME + '）</div>' +
      '<div class="lg-msg" style="max-width:360px">' + (txt.trim() ? esc(txt) : '<span class="lg-muted">（沒有文字，只發照片）</span>') +
      (nPh ? '<div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap">' + state.photos.map(function (f) { return photoThumb(f, 48); }).join('') + '</div>' : '') + '</div>';
    box.style.display = 'block';
  }
  panel.addEventListener('input', function (e) { if (!e.target.closest('.lg-out')) setTimeout(renderLivePreview, 0); });
  panel.addEventListener('change', function (e) { if (!e.target.closest('.lg-out')) setTimeout(renderLivePreview, 0); });
  var lastKeys = '';
  function renderFill(force) {
    var keys = fillKeys(), sig = keys.join('|');
    if (sig === lastKeys && !force) return;
    lastKeys = sig;
    if (!keys.length) { $('.lg-fill').innerHTML = ''; return; }
    var h = '<div class="lg-box" style="background:#f3e5f5"><b>請填空格</b>（每個人都一樣）：';
    keys.forEach(function (k) {
      var isDate = k.indexOf('日期') >= 0, ph = isDate ? '' : (k.indexOf('時間') >= 0 ? '例如：14:00-17:00' : (k.indexOf('班別') >= 0 ? '例如：國二數資班' : ''));
      h += '<div style="margin-top:6px">[' + esc(k) + ']：<input ' + (isDate ? 'type="date"' : 'type="text"') + ' data-k="' + esc(k) + '" placeholder="' + ph + '" value="' + esc(state.fill[k] || '') + '" style="width:60%;padding:4px;border:1px solid #ccc;border-radius:6px;font-size:14px">' +
        (isDate ? ' <span class="lg-muted lg-fmt" data-k="' + esc(k) + '">' + esc(fillValue(k)) + '</span>' : '') + '</div>';
    });
    $('.lg-fill').innerHTML = h + '</div>';
    $('.lg-fill').querySelectorAll('input').forEach(function (inp) {
      inp.oninput = inp.onchange = function () {
        state.fill[this.dataset.k] = this.value;
        var s = $('.lg-fill').querySelector('.lg-fmt[data-k="' + this.dataset.k + '"]'); if (s) s.textContent = fillValue(this.dataset.k);
      };
    });
  }
  $('.lg-tpl').addEventListener('input', function () { renderFill(false); });
  fillTplSelect();

  /* 切換模式：調整說明文字與訊息框 */
  function applyMode() {
    var m = mode(), t = state.table;
    panel.querySelectorAll('.lg-mode').forEach(function (l) { l.classList.toggle('on', l.querySelector('input').checked); });
    if (m === 'same') {
      $('.lg-paste-hint').textContent = '或直接貼上姓名（一行一位）。也可以從 Excel 連標題一起複製貼上。';
      $('.lg-paste').placeholder = '林文琪\n胡祐綸\n陳宥維';
      $('.lg-msg-title').textContent = '③ 要發的訊息（每個人都一樣）';
      $('.lg-msg-hint').textContent = '可以點下面的按鈕插入 [姓名]，發送時會換成每位學生的名字。';
      if (/^\s*\[[^\]]+\]\s*$/.test($('.lg-tpl').value)) $('.lg-tpl').value = state.sameText || '';
      $('.lg-tpl').placeholder = '例如：\n親愛的家長您好：[姓名]下週六（10/25）停課一次，補課時間另行通知，謝謝！';
    } else {
      $('.lg-paste-hint').textContent = 'Excel 要有「姓名」和「訊息」兩欄（第一列是標題）。也可以從 Excel 連標題一起複製貼上。';
      $('.lg-paste').placeholder = '姓名\t訊息\n林文琪\t文琪這週作業還沒交喔\n胡祐綸\t祐綸下週二要補考';
      $('.lg-msg-title').textContent = '③ 訊息格式';
      $('.lg-msg-hint').textContent = '[訊息] 會換成 Excel 裡每個人那一列的訊息。前後可以加共同的開頭或結尾，例如「親愛的家長您好：[訊息]」。';
      if (!/\[[^\]]+\]/.test($('.lg-tpl').value)) state.sameText = $('.lg-tpl').value;
      $('.lg-tpl').value = '[' + ((t && t.msgHeader) || '訊息') + ']';
      $('.lg-tpl').placeholder = '';
    }
    $('.lg-tplbar').style.display = m === 'same' ? 'block' : 'none';
    $('.lg-photobar').style.display = m === 'same' ? 'block' : 'none';
    if (t) showInfo();
    renderFill(true);
  }
  panel.querySelectorAll('input[name=lm-mode]').forEach(function (r) { r.onchange = function () { state.items = null; $('.lg-out').innerHTML = ''; $('.lg-send').disabled = true; applyMode(); }; });

  function showInfo() {
    var t = state.table, m = mode();
    var info = '讀到 <b>' + t.records.length + '</b> 位' + (t.noHeader ? '（沒有標題列，第一欄當作姓名）' : '，欄位：' + esc(t.headers.join('、')));
    if (m === 'each') {
      if (t.msgHeader) info += '<br><b style="color:' + MAIN + '">訊息＝「' + esc(t.msgHeader) + '」那一欄</b>';
      else info += '<br><span class="lg-red">找不到「訊息」欄。每人不同模式需要一欄標題叫「訊息」。</span>';
      var empty = t.msgHeader ? t.records.filter(function (r) { return !r[t.msgHeader]; }).length : 0;
      if (empty) info += '<br><span class="lg-warn">有 ' + empty + ' 位的訊息是空的，這幾位不會發。</span>';
    }
    $('.lg-info').innerHTML = info;
    $('.lg-chips').innerHTML = t.headers.map(function (h) { return '<button class="lg-chip" data-h="' + esc(h) + '">[' + esc(h) + ']</button>'; }).join('');
    $('.lg-chips').querySelectorAll('button').forEach(function (b) {
      b.onclick = function () {
        var ta = $('.lg-tpl'), ins = '[' + this.dataset.h + ']', s = ta.selectionStart || ta.value.length;
        ta.value = ta.value.slice(0, s) + ins + ta.value.slice(ta.selectionEnd || s); ta.focus();
        ta.selectionStart = ta.selectionEnd = s + ins.length;
      };
    });
  }

  function setTable(rows) {
    try { state.table = toTable(rows); } catch (e) { state.table = null; $('.lg-info').innerHTML = '<span class="lg-red">' + esc(e.message) + '</span>'; $('.lg-chips').innerHTML = ''; return; }
    /* Excel 有「訊息」欄 → 自動切到「每人不同」 */
    if (state.table.msgHeader && mode() === 'same') { panel.querySelector('input[name=lm-mode][value=each]').checked = true; }
    applyMode();
    state.items = null; $('.lg-out').innerHTML = ''; $('.lg-send').disabled = true;
  }
  $('.lg-paste').oninput = function () { if (this.value.trim()) setTable(parseText(this.value)); };
  $('.lg-file').onchange = async function () {
    var f = this.files[0]; if (!f) return;
    try { setTable(/\.xlsx$/i.test(f.name) ? await readXlsx(await f.arrayBuffer()) : parseText(await f.text())); }
    catch (e) { alert('讀取失敗：' + e.message + '\n可以改用「複製貼上」。'); }
  };
  applyMode();


  /* ========== 附加照片（只有統一訊息） ========== */
  state.photos = [];
  function photoThumb(f, size) {
    if (!f.__url) f.__url = URL.createObjectURL(f);
    return '<img src="' + f.__url + '" style="width:' + size + 'px;height:' + size + 'px;object-fit:cover;border-radius:6px;border:1px solid #ddd">';
  }
  function renderThumbs() {
    $('.lg-thumbs').innerHTML = state.photos.map(function (f, k) {
      return '<div style="position:relative">' + photoThumb(f, 70) +
        '<button class="lg-ph-x" data-k="' + k + '" title="拿掉" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;border:none;background:#c62828;color:#fff;cursor:pointer;line-height:20px;padding:0">×</button>' +
        '<div class="lg-muted" style="font-size:11px;text-align:center">' + (k + 1) + '</div></div>';
    }).join('');
    $('.lg-thumbs').querySelectorAll('.lg-ph-x').forEach(function (b) {
      b.onclick = function () { state.photos.splice(+this.dataset.k, 1); renderThumbs(); photosChanged(); };
    });
  }
  function photosChanged() { state.items = null; $('.lg-out').innerHTML = ''; $('.lg-send').disabled = true; renderLivePreview(); }
  $('.lg-photo').onchange = function () {
    var bad = [];
    Array.prototype.forEach.call(this.files, function (f) {
      if (!/^image\/(jpeg|png)$/.test(f.type)) bad.push(f.name + '（不是 jpg／png）');
      else if (f.size > 10 * 1024 * 1024) bad.push(f.name + '（超過 10MB）');
      else if (state.photos.length >= 5) bad.push(f.name + '（最多 5 張）');
      else state.photos.push(f);
    });
    this.value = '';
    if (bad.length) alert('這些照片沒有加進去：\n' + bad.join('\n'));
    renderThumbs(); photosChanged();
  };
  panel.querySelectorAll('input[name=lm-porder]').forEach(function (r) { r.onchange = photosChanged; });

  function prog(i, n, name) { $('.lg-prog').textContent = '處理中 ' + i + ' / ' + n + '：' + name; }

  $('.lg-preview').onclick = async function () {
    if (state.busy) return;
    if (!state.table || !state.table.records.length) { alert('請先放名單。'); return; }
    var tpl = $('.lg-tpl').value.trim();
    var usePhotos = mode() === 'same' ? state.photos.slice() : [];
    if (!tpl && !usePhotos.length) { alert('請先寫要發的訊息，或附加照片。'); $('.lg-tpl').focus(); return; }
    state.porder = panel.querySelector('input[name=lm-porder]:checked').value;
    if (mode() === 'each' && !state.table.msgHeader && /\[訊息\]/.test(tpl)) { alert('Excel 裡找不到「訊息」欄。請在 Excel 加一欄標題叫「訊息」，或改用「統一訊息」。'); return; }
    /* 填空欄：全部填好才可以預覽；填的內容當成每個人都一樣的欄位 */
    var keys = fillKeys(), vals = {}, empty = [];
    keys.forEach(function (k) { vals[k] = fillValue(k); if (!vals[k]) empty.push('[' + k + ']'); });
    if (empty.length) { alert('還有空格沒填：' + empty.join('、')); var e1 = $('.lg-fill input'); if (e1) e1.focus(); return; }
    var t0 = state.table, table = { headers: t0.headers.concat(keys), nameHeader: t0.nameHeader, msgHeader: t0.msgHeader, photos: usePhotos,
      records: t0.records.map(function (r) { var o = {}, k; for (k in r) o[k] = r[k]; for (k in vals) o[k] = vals[k]; return o; }) };
    state.busy = true; this.disabled = true; $('.lg-send').disabled = true; $('.lg-out').innerHTML = '';
    try {
      if (!$('.lg-task').value.trim()) {
        var tn = $('.lg-tsel') && $('.lg-tsel').value ? $('.lg-tsel').value.replace(/^[\d-]+\s*/, '') + '通知' : '';
        $('.lg-task').value = tn || (tpl.replace(/[\[\]【】\s]/g, '').slice(0, 12) || '照片通知');
      }
      state.items = await preview(table, tpl, prog); renderPreview();
      $('.lg-prog').textContent = SEND_ENABLED ? '預覽完成。請逐一確認內容與勾選，沒問題再按「開始發送」。' : '預覽完成。';
      if (SEND_ENABLED) $('.lg-send').disabled = false;
    } catch (e) { alert('預覽失敗：' + e.message); }
    state.busy = false; this.disabled = false;
  };

  function renderPreview() {
    var items = state.items, send = 0, students = 0, blocked = [], unread = [];
    items.forEach(function (it) {
      var n = it.contacts.filter(function (c) { return c.checked; }).length;
      send += n; if (n) students++;
      if (it.block) blocked.push(it.student + '（' + it.block + '）');
      it.contacts.forEach(function (c) { if (c.unread) unread.push(c.nick); });
    });
    var unknown = []; items.forEach(function (it) { it.unknown.forEach(function (u) { if (unknown.indexOf(u) < 0) unknown.push(u); }); });
    var nPh = items.length && items[0].photos ? items[0].photos.length : 0;
    var h = '<div class="lg-box">共 ' + items.length + ' 位：會發給 <b>' + students + '</b> 位學生的家長，共 <b class="lg-total">' + send + '</b> 則' +
      (nPh ? '<br>📷 每位家長會收到：' + (items[0].text.trim() ? '文字＋' : '') + '<b>' + nPh + ' 張照片</b>（' + (state.porder === 'photo' ? '先照片再文字' : '先文字再照片') + '）' : '') +
      (blocked.length ? '<br><span class="lg-red">不會發（' + blocked.length + ' 位）</span>：' + esc(blocked.join('、')) : '') +
      (unknown.length ? '<br><span class="lg-red">訊息裡的 [' + esc(unknown.join(']、[')) + '] 在名單裡找不到這個欄位，請修改。</span>' : '') +
      (unread.length ? '<br><span class="lg-warn">⚠ 有 ' + unread.length + ' 位家長有未讀訊息：' + esc(unread.join('、')) + '（記得回覆）</span>' : '') +
      '</div><table><tr><th style="width:84px">學生</th><th>發給 ／ 訊息內容</th></tr>';
    items.forEach(function (it, ii) {
      h += '<tr><td>' + esc(it.student) + '<div class="lg-muted">第 ' + it.row + ' 列</div></td><td>';
      if (it.block) h += '<span class="lg-red">' + esc(it.block) + '，不會發</span>';
      it.warn.forEach(function (w) { h += '<div class="lg-warn">⚠ ' + esc(w) + '</div>'; });
      it.contacts.forEach(function (c, ci) {
        h += '<label class="lg-c"><input type="checkbox" data-i="' + ii + '" data-c="' + ci + '"' + (c.checked ? ' checked' : '') + '> ' + esc(c.nick) +
          (c.note ? ' <span class="lg-warn">（' + esc(c.note) + '）</span>' : '') + '</label>';
      });
      if (!it.block) h += '<div class="lg-msg">' + (it.text.trim() ? esc(it.text) : '<span class="lg-muted">（沒有文字，只發照片）</span>') +
        (it.photos && it.photos.length ? '<div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap">' + it.photos.map(function (f) { return photoThumb(f, 48); }).join('') + '</div>' : '') + '</div>';
      h += '</td></tr>';
    });
    h += '</table>';
    var pend = [];
    items.forEach(function (it) { it.contacts.forEach(function (c) { if (c.pending && !c.checked) pend.push(it.student + '：' + c.nick); }); });
    if (pend.length) {
      h = '<div class="lg-box" style="border:1px solid #ffb74d;background:#fff8e1"><b class="lg-warn">待確認 ' + pend.length + ' 個 LINE</b>（名稱前面不一樣，可能不是同一家人，所以先沒勾）：' +
        '<div style="max-height:120px;overflow:auto;margin:4px 0">' + pend.map(esc).join('<br>') + '</div>' +
        '<button class="lg-btn lg-pend-all" style="background:#ef6c00;border-color:#ef6c00">我看過了，把待確認的全部勾選</button></div>' + h;
    }
    $('.lg-out').innerHTML = h;
    if (pend.length) $('.lg-pend-all').onclick = function () {
      state.items.forEach(function (it) { it.contacts.forEach(function (c) { if (c.pending) c.checked = true; }); });
      renderPreview();
      $('.lg-prog').textContent = '已把 ' + pend.length + ' 個待確認的 LINE 勾選。請再看一次，沒問題再按「開始發送」。';
    };
    $('.lg-out').querySelectorAll('input[type=checkbox]').forEach(function (cb) {
      cb.onchange = function () {
        state.items[this.dataset.i].contacts[this.dataset.c].checked = this.checked;
        var t = 0; state.items.forEach(function (it) { it.contacts.forEach(function (c) { if (c.checked) t++; }); });
        $('.lg-total').textContent = t;
      };
    });
  }

  /* ========== 發送 ==========
     安全設計：
     - 只發預覽裡「有勾選」的 LINE
     - 要輸入則數才會開始（防手滑）
     - 每則之前重新確認這個 LINE 還在、名稱裡還有學生姓名
     - 24 小時內發過一樣內容給同一個 LINE → 自動略過
     - 一則一則慢慢發（間隔約 1.5 秒），隨時可以按「停止發送」
     - 結果不確定（例如網路斷掉）時不會自動重發，請到聊天室確認 */
  if (SEND_ENABLED) {
    $('.lg-send').onclick = function () { doSend(); };
    $('.lg-stop').onclick = function () { state.stop = true; this.disabled = true; this.textContent = '停止中…（這一則發完就停）'; };
  }


  /* 發送前確認：在視窗裡輸入則數（不用瀏覽器的跳出視窗，有些瀏覽器會擋掉） */
  function askCount(text, n) {
    return new Promise(function (resolve) {
      var old = panel.querySelector('.lg-ask'); if (old) old.parentNode.removeChild(old);
      var box = document.createElement('div');
      box.className = 'lg-box lg-ask';
      box.style.cssText = 'border:2px solid #c62828;background:#fff5f5;margin:8px 0';
      box.innerHTML = '<div style="white-space:pre-wrap;font-weight:bold">' + esc(text) + '</div>' +
        '<input type="number" class="lg-ask-n" style="width:90px;font-size:18px;padding:4px;margin-top:6px;border:2px solid #c62828;border-radius:6px"> ' +
        '<button class="lg-btn lg-ask-ok" style="background:#c62828;border-color:#c62828">確定發送</button>' +
        '<button class="lg-btn lg-sec lg-ask-no">取消</button><div class="lg-red lg-ask-err"></div>';
      var anchor = $('.lg-prog'); anchor.parentNode.insertBefore(box, anchor.nextSibling);
      var inp = box.querySelector('.lg-ask-n');
      function done(v) { if (box.parentNode) box.parentNode.removeChild(box); resolve(v); }
      box.querySelector('.lg-ask-ok').onclick = function () {
        if (String(inp.value).trim() === String(n)) done(true);
        else { box.querySelector('.lg-ask-err').textContent = '數字不對，請輸入 ' + n + '（或按「取消」）。'; inp.focus(); }
      };
      box.querySelector('.lg-ask-no').onclick = function () { done(false); $('.lg-prog').textContent = '已取消，沒有發送任何訊息。'; };
      inp.onkeydown = function (e) { if (e.key === 'Enter') box.querySelector('.lg-ask-ok').click(); };
      box.scrollIntoView({ block: 'center' }); inp.focus();
    });
  }


  /* ========== 任務紀錄、保留待補發（配合官方LINE小幫手的總表；單獨使用時這些功能會自動略過） ========== */
  var OLHX = window.OLH || null;
  function remainingJobs() {
    var out = [];
    (state.items || []).forEach(function (it) { it.contacts.forEach(function (c) { if (c.resend === 'safe' || c.resend === 'unsure') out.push({ it: it, c: c }); }); });
    return out;
  }
  function updateTask(jobs, isResend) {
    if (!state.task || !OLHX) return;
    var okNow = jobs.filter(function (j) { return j.c.result === '成功'; }).length;
    if (!isResend) { state.task.ok = okNow; state.task.notOk = state.task.total - okNow; }
    else state.task.resendOk += okNow;
    state.task.fail = remainingJobs().length;
    if (!state.task.closed) state.task.status = state.limit ? '保留待補發（已達上限）' : (state.task.fail ? '未完成' : '已發完（待按結束）');
    OLHX.saveTask(state.task);
  }
  /* 把還沒發出去的訊息內容存到這台電腦（關掉分頁、換帳號都還在），之後最上面可以按「繼續發送」 */
  function keepPending(reason) {
    var jobs = remainingJobs();
    if (!OLHX || !state.task) return Promise.resolve(0);
    if (!jobs.length) { if (state.pendingId) OLHX.removePending(state.pendingId); state.pendingId = null; return Promise.resolve(0); }
    var p = { id: state.pendingId || state.task.id, tool: 'msg', task: state.task, reason: reason || '', porder: state.porder || '',
      jobs: jobs.map(function (j) {
        return { student: j.it.student, row: j.it.row, score: j.it.score, text: j.it.text, key: j.it.key || '', photos: j.it.photos || [],
          retest: !!j.it.retest, contactId: j.c.contactId, nick: j.c.nick, unsure: j.c.resend === 'unsure',
          parts: j.c.parts ? j.c.parts.map(function (x) { return { kind: x.kind, i: x.i, ok: !!(x.ok && x.seen) }; }) : null };
      }) };
    state.pendingId = p.id;
    return OLHX.savePending(p).then(function () { return jobs.length; });
  }
  /* 從最上面紅色橫幅按「繼續發送」：把保留的工作放回來，接著發 */
  if (OLHX) OLHX.resumers['msg'] = function (p) {
    if (state.busy) { alert('目前正在發送中，請等這一批發完。'); return; }
    var byKey = {}, items = [], jobs = [];
    p.jobs.forEach(function (j) {
      var k = j.student + '|' + j.text + '|' + j.key, it = byKey[k];
      if (!it) { it = byKey[k] = { student: j.student, row: j.row, score: j.score, text: j.text, key: j.key, photos: j.photos, retest: j.retest, contacts: [], warn: [], unknown: [], missing: [], block: '' }; items.push(it); }
      var c = { contactId: j.contactId, nick: j.nick, checked: true, note: j.unsure ? '上次不確定有沒有送出' : '', result: '', resend: '',
        parts: j.parts ? j.parts.map(function (x) { return { kind: x.kind, i: x.i, ok: x.ok, seen: x.ok }; }) : null };
      it.contacts.push(c); jobs.push({ it: it, c: c });
    });
    state.items = items; state.task = p.task; state.task.closed = false; state.pendingId = p.id; if (p.porder) state.porder = p.porder;
    $('.lg-task').value = p.task.name;
    panel.querySelectorAll('.lg-locked').forEach(function (s) { s.classList.remove('lg-locked'); });
    $('.lg-out').innerHTML = '<div class="lg-box" style="border:2px solid #c62828;background:#fff5f5"><b>繼續上次的工作：「' + esc(p.task.name) + '」</b>（' + esc(p.task.date + ' ' + p.task.time) + '）<br>還有 <b>' + jobs.length + '</b> 則沒發出去。按下面的確認就會接著發。</div>';
    doSend(jobs, true);
  };
  function taskButtons(need) {
    if (!OLHX || !state.task) return '';
    if (state.task.closed) return '<div class="lg-muted" style="margin-top:6px">✔ 這個任務已結束，已記到發送紀錄總表（' + esc(state.task.status) + '）。</div>';
    return need
      ? '<br><button class="lg-btn lg-sec lg-keep" style="color:#c62828;border-color:#c62828">先結束任務（保留未成功的訊息）</button>'
      : '<br><button class="lg-btn lg-endtask" style="background:#2e7d32;border-color:#2e7d32">✔ 結束此階段任務</button>';
  }
  function wireTaskButtons() {
    var end = $('.lg-endtask'), keep = $('.lg-keep');
    if (end) end.onclick = function () {
      state.task.status = '已結束'; state.task.closed = true; OLHX.saveTask(state.task);
      if (state.pendingId) { OLHX.removePending(state.pendingId); state.pendingId = null; }
      renderSendResult();
    };
    if (keep) keep.onclick = function () {
      var n = remainingJobs().length;
      var box = document.createElement('div');
      box.className = 'lg-box'; box.style.cssText = 'border:2px solid #c62828;background:#fff5f5;margin-top:6px';
      box.innerHTML = '<b>將未成功發出去的 ' + n + ' 則訊息內容，先保留至系統內。</b><br>之後打開小幫手，最上面會有「▶ 繼續發送」可以補發。<br>' +
        '<button class="lg-btn lg-keep-ok" style="background:#c62828;border-color:#c62828">確定保留並結束任務</button><button class="lg-btn lg-sec lg-keep-no">取消</button>';
      keep.parentNode.insertBefore(box, keep.nextSibling); keep.style.display = 'none';
      box.querySelector('.lg-keep-no').onclick = function () { box.parentNode.removeChild(box); keep.style.display = ''; };
      box.querySelector('.lg-keep-ok').onclick = function () {
        keepPending('先結束任務').then(function () {
          state.task.status = '保留待補發'; state.task.closed = true; OLHX.saveTask(state.task); renderSendResult();
        });
      };
    };
  }
  /* 已達 LINE 短時間上限：剩下的自動保留，跳出說明 */
  function showLimitBox(sent, left) {
    var box = document.createElement('div');
    box.className = 'lg-box'; box.style.cssText = 'border:3px solid #c62828;background:#ffebee;margin:8px 0;font-size:15px';
    box.innerHTML = '<b style="font-size:17px;color:#b71c1c">⚠ 已達短時間內可發送的訊息數量上限</b><br>' +
      '這次已發出 <b>' + sent + '</b> 則，剩下 <b>' + left + '</b> 則的內容已保留在這台電腦。<br>' +
      '換個使用者登入即可恢復發訊息功能：切換帳號後重新打開小幫手，最上面按「<b>▶ 繼續發送</b>」就會接著發。<br>' +
      '<button class="lg-btn lg-sec lg-limit-x">知道了</button>';
    $('.lg-out').insertBefore(box, $('.lg-out').firstChild);
    box.querySelector('.lg-limit-x').onclick = function () { box.parentNode.removeChild(box); };
    box.scrollIntoView({ block: 'center' });
  }

  /* resendJobs：重發時只傳入要重發的那幾則；沒傳＝發送全部有勾選的 */
  async function doSend(resendJobs, resuming) {
    if (state.busy || !state.items) return;
    var jobs = [];
    if (resendJobs) jobs = resendJobs;
    else state.items.forEach(function (it) {
      if (it.block) return;
      it.contacts.forEach(function (c) { if (c.checked) jobs.push({ it: it, c: c }); });
    });
    if (!jobs.length) { alert('沒有勾選任何要發送的 LINE。'); return; }
    var names = {}; jobs.forEach(function (j) { names[j.it.student] = 1; });
    var nStudents = Object.keys(names).length;
    var hourWarn = '';
    if (OLHX) {
      var hc = OLHX.hourCount();
      if (hc + jobs.length > OLHX.HOUR_LIMIT) hourWarn = '⚠ 提醒：這台電腦 1 小時內已發 ' + hc + ' 個聊天室，這次再發 ' + jobs.length + ' 個，可能超過 LINE「1 小時 200 個聊天室」的上限。' +
        '發到一半被擋的話，剩下的會自動保留，之後可以接著發。\n\n';
    }
    var ans = await askCount(hourWarn + '帳號：' + $('.lg-bot').textContent + '\n即將' + (resuming ? '繼續發送' : resendJobs ? '重發' : '發送') + ' ' + jobs.length + ' 則訊息，給 ' + nStudents + ' 位學生的家長。\n' +
      (jobs[0].it.photos && jobs[0].it.photos.length ? '每位：' + (jobs[0].it.text.trim() ? '文字＋' : '') + jobs[0].it.photos.length + ' 張照片\n' : '') + '送出後無法收回。\n\n請在下面輸入數字 ' + jobs.length + ' 確認：', jobs.length);
    if (!ans) return;
    if (OLHX && (!resendJobs || !state.task || state.task.closed)) {
      if (!resendJobs) { state.task = OLHX.newTask('通知', $('.lg-task').value.trim() || '（未命名）', jobs.length); state.pendingId = null; }
      else if (state.task) state.task.closed = false;
    }
    state.limit = false;

    state.busy = true; state.stop = false;
    panel.querySelectorAll('button.lg-btn').forEach(function (b) { b.disabled = true; });
    panel.querySelectorAll('.lg-out input[type=checkbox]').forEach(function (b) { b.disabled = true; });
    var stopBtn = $('.lg-stop'); stopBtn.style.display = 'inline-block'; stopBtn.disabled = false; stopBtn.textContent = '停止發送';

    /* 進度框：放在結果區最上面（按下面的「重發」時也看得到），有自己的停止按鈕 */
    var out = $('.lg-out'), sb = document.createElement('div');
    sb.className = 'lg-sendbox';
    sb.innerHTML = '<b class="lg-sb-t"></b><div class="lg-bar"><i></i><span></span></div><div class="lg-sb-s lg-muted"></div>' +
      '<button class="lg-btn lg-sec lg-sb-stop" style="color:#c62828;border-color:#c62828">停止發送</button>';
    out.insertBefore(sb, out.firstChild);
    sb.scrollIntoView({ block: 'nearest' });
    sb.querySelector('.lg-sb-stop').onclick = function () { stopBtn.onclick.call(stopBtn); this.disabled = true; this.textContent = '停止中…（這一則發完就停）'; };
    state.sbar = function (title, i, n, sub) {
      var p = n ? Math.round(i / n * 100) : 0;
      sb.querySelector('.lg-sb-t').textContent = title;
      sb.querySelector('.lg-bar i').style.width = p + '%';
      sb.querySelector('.lg-bar span').textContent = p + '%（' + i + ' / ' + n + '）';
      sb.querySelector('.lg-sb-s').textContent = sub || '';
      $('.lg-prog').textContent = title + ' ' + i + ' / ' + n + (sub ? '：' + sub : '');
    };
    var label = resendJobs ? '重發中' : '發送中';
    state.sbar(label, 0, jobs.length, '準備中…');

    var done = 0, byStudent = {}, gap = 1500, WAITS = [15000];
    jobs.forEach(function (j) { j.c.result = ''; j.c.resend = ''; j.c.verify = ''; });
    var cur = null;
    for (var i = 0; i < jobs.length; i++) {
      var job = jobs[i], it = job.it, c = job.c;
      if (state.limit) { c.result = '未發送：已達短時間上限（已保留）'; c.resend = 'safe'; continue; }
      if (state.stop) { c.result = '已停止（沒發）'; c.resend = 'safe'; continue; }
      state.sbar(label, i, jobs.length, '正在發：' + it.student + ' → ' + c.nick);
      try {
        if (!byStudent[it.student]) {
          byStudent[it.student] = {};
          (await searchContacts(it.student)).forEach(function (x) { byStudent[it.student][x.contactId] = displayName(x); });
        }
        var nowNick = byStudent[it.student][c.contactId];
        if (!nowNick || nowNick.indexOf(it.student) < 0) { c.result = '失敗：找不到這個 LINE（沒發）'; continue; }
        if (alreadySent(c.contactId, it.key)) { c.result = '略過：24 小時內已發過一樣的內容'; continue; }
        /* 這一則要發的內容：文字＋照片；重發時只發還沒送到的部分 */
        if (!resendJobs || !c.parts) c.parts = buildParts(it);
        var failKind = '', st = 0;
        for (var pi = 0; pi < c.parts.length; pi++) {
          var part = c.parts[pi];
          if (part.ok) continue;
          if (state.stop) { failKind = 'stop'; break; }
          cur = part;
          if (c.parts.length > 1) state.sbar(label, i, jobs.length, '正在發：' + it.student + ' → ' + c.nick + '（' + partName(part) + '）');
          part.sendId = newSendId(); part.sentAt = Date.now(); part.unsure = false;
          st = await sendPart(c.contactId, it, part); var tries = 0;
          /* LINE 說太快（429＝確定沒送出）：等 15、30、60 秒再試，之後放慢成每 3 秒一則 */
          while (st === 429 && tries < WAITS.length && !state.stop) {
            gap = 3000;
            state.sbar(label, i, jobs.length, 'LINE 說發太快了，等 ' + (WAITS[tries] / 1000) + ' 秒再試一次…');
            await sleep(WAITS[tries]); tries++;
            part.sendId = newSendId(); part.sentAt = Date.now();
            st = await sendPart(c.contactId, it, part);
          }
          if (st >= 200 && st < 300) part.ok = true;
          else if (st === 429) { part.sendId = null; failKind = 'blocked'; state.limit = true; break; }
          else { part.unsure = true; failKind = 'unsure'; break; }
          if (pi < c.parts.length - 1) await sleep(800);
        }
        cur = null;
        if (!failKind) { c.result = '成功'; markSent(c.contactId, it.key); done++; if (OLHX) OLHX.noteSent(c.contactId); }
        else if (failKind === 'stop') { c.result = '已停止（還有部分沒發）'; c.resend = 'safe'; }
        else if (failKind === 'blocked') { c.result = '未發送：已達短時間上限（已保留）'; c.resend = 'safe'; }
        else { c.result = '失敗（代碼 ' + st + '），請到聊天室確認有沒有送出'; c.resend = 'unsure'; }
      } catch (e) {
        if (cur && cur.sendId) cur.unsure = true;
        cur = null;
        c.result = '失敗（連線錯誤），請到聊天室確認有沒有送出'; c.resend = 'unsure';
      }
      await sleep(gap);
    }
    state.sbar(label, jobs.length, jobs.length, state.stop ? '已停止' : '發送完畢，接著到聊天室確認送達…');
    sb.querySelector('.lg-sb-stop').style.display = 'none';
    stopBtn.style.display = 'none';
    await verifySent(jobs);
    $('.lg-preview').disabled = false;
    state.busy = false;
    updateTask(jobs, !!resendJobs);
    var limitHit = state.limit && OLHX;
    if (limitHit) { await keepPending('已達短時間內可發送的訊息數量上限'); state.task.status = '保留待補發（已達上限）'; state.task.closed = true; OLHX.saveTask(state.task); }
    var okN = jobs.filter(function (j) { return j.c.result === '成功'; }).length;
    var vN = jobs.filter(function (j) { return j.c.verify === 'ok'; }).length;
    $('.lg-prog').textContent = (state.stop ? '已停止。' : (resendJobs ? '重發完成。' : '發送完成。')) + '這次成功 ' + okN + ' 則，其中 ' + vN + ' 則已在聊天室確認。';
    renderSendResult();
    if (limitHit) showLimitBox(jobs.filter(function (j) { return j.c.result === '成功'; }).length, remainingJobs().length);
    else if (resuming && OLHX) keepPending(state.task.status);
  }

  /* 發完之後到每個聊天室確認真的有這則訊息（和批次發成績同一套）：
     - 「成功」的：找到＝✔ 已確認；找不到（等 2、5、15 秒各查一次都沒有）＝改成失敗，可以重發
     - 「不確定」的（連線錯誤等）：找到＝改成成功；找不到＝確定沒送出，可以重發 */
  async function verifySent(jobs) {
    var todo = jobs.filter(function (j) { return j.c.parts && (j.c.result === '成功' || j.c.resend === 'unsure') && j.c.parts.some(function (p) { return p.sendId; }); });
    var waits = [2000, 5000, 15000];
    for (var round = 0; round < waits.length && todo.length; round++) {
      state.sbar('送達確認' + (round ? '（第 ' + (round + 1) + ' 次）' : ''), 0, todo.length, '等 ' + (waits[round] / 1000) + ' 秒後到聊天室檢查…');
      await sleep(waits[round]);
      var left = [];
      for (var i = 0; i < todo.length; i++) {
        var j = todo[i], c = j.c;
        state.sbar('送達確認' + (round ? '（第 ' + (round + 1) + ' 次）' : ''), i + 1, todo.length, j.it.student + ' → ' + c.nick);
        var list = await recentSent(c.contactId);
        if (list === null) { c.verify = 'error'; continue; }
        var used = {};
        c.parts.forEach(function (p) {
          if (!p.sendId || p.seen) return;
          var hit = list.filter(function (x, k) {
            if (used[k]) return false;
            if (x.sendId === p.sendId) return true;
            if (p.kind === 'text') return x.message && x.message.text === j.it.text && x.timestamp >= p.sentAt - 120000;
            return x.message && x.message.type !== 'text' && x.timestamp >= p.sentAt - 5000;
          })[0];
          if (hit) { used[list.indexOf(hit)] = 1; p.seen = true; p.ok = true; p.unsure = false; }
        });
        var missing = c.parts.filter(function (p) { return p.sendId && !p.seen; });
        if (missing.length) { left.push(j); }
        else if (c.parts.every(function (p) { return p.seen; })) {
          c.verify = 'ok';
          if (c.result !== '成功') { c.result = '成功'; c.resend = ''; markSent(c.contactId, j.it.key); }
        } else {
          c.verify = 'partial'; c.result = '失敗：還有部分沒送出（已送到的不會重發），可以按下面「重發」'; c.resend = 'safe';
        }
        await sleep(150);
      }
      todo = left;
    }
    todo.forEach(function (j) {
      j.c.parts.forEach(function (p) { if (p.sendId && !p.seen) { p.ok = false; p.sendId = null; p.unsure = false; } });
      j.c.verify = 'missing'; j.c.result = '失敗：聊天室裡找不到' + (j.c.parts.length > 1 ? '部分內容' : '這則訊息') + '（沒送出），可以按下面「重發」'; j.c.resend = 'safe';
      unmarkSent(j.c.contactId, j.it.key);
    });
  }

  /* 一則要發的內容拆成幾個部分：文字、照片 1、照片 2…（順序看設定） */
  function buildParts(it) {
    var parts = [];
    if (it.text.trim()) parts.push({ kind: 'text' });
    (it.photos || []).forEach(function (f, k) { parts.push({ kind: 'photo', i: k }); });
    if (state.porder === 'photo') parts.sort(function (a, b) { return (a.kind === 'text') - (b.kind === 'text'); });
    return parts;
  }
  function partName(p) { return p.kind === 'text' ? '文字' : '照片 ' + (p.i + 1); }
  function sendPart(chatId, it, p) { return p.kind === 'text' ? sendText(chatId, it.text, p.sendId) : sendFile(chatId, it.photos[p.i], p.sendId); }

  function renderSendResult() {
    var items = state.items, ok = 0, verified = 0, fail = [], stopped = 0, skipped = [], notFound = [], unchecked = [], lines = ['學生\t發給\t結果'];
    var h = '<table><tr><th style="width:84px">學生</th><th>發給</th><th style="width:38%">結果</th></tr>';
    items.forEach(function (it) {
      var sent = it.contacts.filter(function (c) { return c.result; });
      if (it.block) { notFound.push(it.student + '（' + it.block + '）'); return; }
      if (!sent.length) { unchecked.push(it.student); return; }
      sent.forEach(function (c, k) {
        var cls = c.result === '成功' ? 'color:#2e7d32;font-weight:bold' : (c.result.indexOf('略過') === 0 || c.result.indexOf('已停止') === 0 ? 'color:#e65100' : 'color:#c62828;font-weight:bold');
        if (c.result === '成功') ok++;
        else if (c.result.indexOf('已停止') === 0) stopped++;
        else if (c.result.indexOf('略過') === 0) skipped.push(it.student + '：' + c.nick);
        else fail.push(it.student + '：' + c.nick + '（' + c.result + '）');
        var vmark = c.verify === 'ok' ? '（✔ 已在聊天室確認）' : (c.verify === 'error' && c.result === '成功' ? '（無法確認，請到聊天室看一下）' : '');
        if (c.verify === 'ok') verified++;
        h += '<tr><td>' + (k ? '' : esc(it.student)) + '</td><td>' + esc(c.nick) + '</td><td style="' + cls + '">' + esc(c.result) +
          (vmark ? '<div style="font-weight:normal;font-size:12px">' + esc(vmark) + '</div>' : '') + '</td></tr>';
        lines.push(it.student + '\t' + c.nick + '\t' + c.result + vmark);
      });
    });
    h += '</table>';
    var box = '<div class="lg-box"><b>發送結果</b>：成功 <b style="color:#2e7d32">' + ok + '</b> 則（其中 <b style="color:#2e7d32">' + verified + '</b> 則已在聊天室確認送達）' +
      (fail.length ? '，<span class="lg-red">失敗 ' + fail.length + ' 則</span>' : '') +
      (stopped ? '，<span class="lg-warn">停止沒發 ' + stopped + ' 則</span>' : '') +
      (skipped.length ? '，<span class="lg-warn">略過 ' + skipped.length + ' 則</span>' : '') + '</div>';
    var miss = '<h4 style="margin:14px 0 4px">漏發檢查</h4>';
    if (!fail.length && !stopped && !notFound.length && !unchecked.length) miss += '<div class="lg-box" style="color:#2e7d32">✔ 名單上每一位學生的家長都發到了。</div>';
    if (notFound.length) miss += '<div class="lg-box"><span class="lg-red">沒發到：找不到 LINE（' + notFound.length + ' 位）</span><br>' + esc(notFound.join('、')) + '</div>';
    if (unchecked.length) miss += '<div class="lg-box"><span class="lg-warn">沒發到：有 LINE 但沒勾選（' + unchecked.length + ' 位）</span><br>' + esc(unchecked.join('、')) + '</div>';
    if (fail.length) miss += '<div class="lg-box"><span class="lg-red">發送失敗（' + fail.length + ' 則）</span><br>' + fail.map(esc).join('<br>') + '</div>';
    if (stopped) miss += '<div class="lg-box"><span class="lg-warn">按了停止，還有 ' + stopped + ' 則沒發</span>。可以按下面「重發」。</div>';
    /* 重發：safe＝確定沒送出（LINE 擋下、按了停止）；unsure＝不確定有沒有送出，要先到聊天室確認 */
    var safeJobs = [], unsureJobs = [];
    items.forEach(function (it) { it.contacts.forEach(function (c) {
      if (c.resend === 'safe') safeJobs.push({ it: it, c: c });
      else if (c.resend === 'unsure') unsureJobs.push({ it: it, c: c });
    }); });
    var rs = '';
    if (safeJobs.length) rs += '<button class="lg-btn lg-resend-safe" style="background:#c62828;border-color:#c62828">重發沒送出的 ' + safeJobs.length + ' 則</button>';
    if (unsureJobs.length) rs += '<div class="lg-box" style="margin-top:8px"><span class="lg-warn">有 ' + unsureJobs.length + ' 則不確定有沒有送出</span>：請先到聊天室看家長有沒有收到。確認<b>沒收到</b>再按：<br>' +
      '<button class="lg-btn lg-sec lg-resend-unsure" style="color:#c62828;border-color:#c62828">我確認過沒收到，重發這 ' + unsureJobs.length + ' 則</button></div>';
    lines.push('', '沒發到（找不到 LINE）：' + (notFound.join('、') || '無'), '沒發到（沒勾選）：' + (unchecked.join('、') || '無'), '發送失敗：' + (fail.join('；') || '無'));
    /* 最上面的大橫幅：全部完成（綠）或還沒完成（紅，附重發按鈕） */
    var need = fail.length + stopped, notSent = notFound.length + unchecked.length;
    var banner = need
      ? '<div class="lg-done lg-done-bad">⚠ 還沒全部完成：有 ' + need + ' 則沒有確定送出' +
        (safeJobs.length ? '<br><button class="lg-btn lg-resend-safe2" style="background:#c62828;border-color:#c62828">重發沒送出的 ' + safeJobs.length + ' 則</button>' : '') +
        (unsureJobs.length ? '<div style="font-size:13px;font-weight:normal">另有 ' + unsureJobs.length + ' 則不確定，請看最下面。</div>' : '') + taskButtons(true) + '</div>'
      : '<div class="lg-done lg-done-ok">✔ 全部完成：' + ok + ' 則都已送出' + (ok && verified === ok ? '，也都在聊天室確認了' : '（其中 ' + verified + ' 則已在聊天室確認）') + taskButtons(false) + '</div>';
    if (notSent) banner += '<div class="lg-box lg-warn">另有 ' + notSent + ' 位學生沒有發（找不到 LINE 或沒勾選），請看下面「漏發檢查」。</div>';
    $('.lg-out').innerHTML = banner + box + h + miss + (rs ? '<div style="margin:8px 0">' + rs + '</div>' : '') + '<button class="lg-btn lg-sec lg-copy">複製結果（可貼到 Excel）</button>';
    if (safeJobs.length) $('.lg-resend-safe').onclick = $('.lg-resend-safe2').onclick = function () { doSend(safeJobs); };
    $('.lg-out').firstChild.scrollIntoView({ block: 'nearest' });
    wireTaskButtons();
    if (unsureJobs.length) $('.lg-resend-unsure').onclick = function () { doSend(unsureJobs); };
    $('.lg-copy').onclick = function () {
      var text = '帳號：' + $('.lg-bot').textContent + '\n' + lines.join('\n');
      navigator.clipboard.writeText(text).then(function () { alert('已複製！'); }, function () { prompt('請手動複製：', text); });
    };
  }

  window.LineMessages = { botId: botId, toTable: toTable, parseText: parseText, render: render, preview: preview, SEND_ENABLED: SEND_ENABLED };
})();

})(mount('msg'));

/* ===== line-grades.js ===== */
(function (__mount) {
/*
  LINE 官方帳號「批次發成績」小工具
  用法：在 chat.line.biz（LINE 官方帳號聊天後台）按書籤列的「批次發成績」。
  流程：讀成績 Excel → 班別／補考 → 訊息範本 → 搜尋預覽（每位家長會收到什麼）→ 輸入則數確認 → 發送 → 結果與漏發檢查。
  注意：本檔案只能用 區塊註解，不要用雙斜線註解（做成書籤時會壞掉）。
*/
(function () {
  'use strict';

  /* true＝可以發送。2026/10/17 已用櫃台同事的 LINE 實測：發送成功、不會把聊天室標成已讀、
     「聊天」類訊息在後台用量表不算付費額度（2026/11/1 LINE 調價後請再確認）。
     改成 false 就變回只能預覽的版本。 */
  var SEND_ENABLED = true;

  var PANEL_ID = 'lg-panel-2026';
  var old = document.getElementById(PANEL_ID);
  if (old) { old.style.display = old.style.display === 'none' ? 'block' : 'none'; return; }

  var botId = location.pathname.split('/')[1] || '';
  if (location.hostname !== 'chat.line.biz' || !/^U[0-9a-f]{32}$/.test(botId)) {
    alert('請先打開 LINE 官方帳號的聊天後台（chat.line.biz），並選好要用的帳號，再按一次。');
    return;
  }

  /* ========== 連線 ========== */
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function api(path) {
    return fetch(path, { headers: { 'Accept': 'application/json' }, credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error('LINE 回應錯誤 ' + r.status);
      return r.json();
    });
  }
  var csrf = null;
  async function getCsrf() {
    if (!csrf) csrf = await (await fetch('/api/v1/csrfToken', { credentials: 'same-origin' })).json();
    return csrf;
  }
  function newSendId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }
  /* 發一則文字訊息（跟後台聊天室手動送出一樣）。回傳 HTTP 狀態碼；200＝成功、429＝太快被擋（確定沒送出） */
  async function sendText(chatId, text, sendId) {
    var c = await getCsrf(), headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    headers[c.headerName] = c.token;
    var r = await fetch('/api/v1/bots/' + botId + '/chats/' + chatId + '/messages/send', {
      method: 'POST', headers: headers, credentials: 'same-origin',
      body: JSON.stringify({ type: 'text', text: text, sendId: sendId })
    });
    return r.status;
  }

  /* 送達確認：讀聊天室最新 50 則（只讀，不會變已讀），找這次發的那一則（用發送編號 sendId，或同樣文字＋時間）。
     回傳 true＝找到、false＝找不到、null＝讀不到 */
  async function inChat(chatId, sendId, text, sentAt) {
    try {
      var j = await api('/api/v3/bots/' + botId + '/chats/' + chatId + '/messages?limit=50');
      return (j.list || []).some(function (x) {
        return x.type === 'messageSent' && (x.sendId === sendId || (x.message && x.message.text === text && x.timestamp >= sentAt - 120000));
      });
    } catch (e) { return null; }
  }

  /* 防重複：記住 24 小時內發過的「同一個 LINE＋同一段內容」（只存在這台電腦的瀏覽器） */
  var SENT_KEY = 'lg-sent-log';
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return String(h); }
  function sentLog() {
    try { var o = JSON.parse(localStorage.getItem(SENT_KEY) || '{}'), now = Date.now(), k;
      for (k in o) if (now - o[k] > 86400000) delete o[k]; return o; } catch (e) { return {}; }
  }
  function markSent(chatId, text) { try { var o = sentLog(); o[chatId + ':' + hash(text)] = Date.now(); localStorage.setItem(SENT_KEY, JSON.stringify(o)); } catch (e) { } }
  function alreadySent(chatId, text) { return !!sentLog()[chatId + ':' + hash(text)]; }
  function unmarkSent(chatId, text) { try { var o = sentLog(); delete o[chatId + ':' + hash(text)]; localStorage.setItem(SENT_KEY, JSON.stringify(o)); } catch (e) { } }

  function searchContacts(q) {
    return api('/api/v2/bots/' + botId + '/contacts?query=' + encodeURIComponent(q) + '&limit=50').then(function (j) { return j.list || []; });
  }
  function getChat(id) { return api('/api/v1/bots/' + botId + '/chats/' + id).catch(function () { return null; }); }
  function displayName(c) { var p = c.profile || {}; return p.nickname || p.name || '(沒有名稱)'; }

  /* ========== 讀 Excel / 貼上 ========== */
  var NAME_HEADERS = ['姓名', '學生姓名', '學生', '名字', '中文姓名'];

  function parseText(text) {
    var lines = text.replace(/\r/g, '').split('\n').filter(function (l) { return l.trim(); });
    var sep = lines.some(function (l) { return l.indexOf('\t') >= 0; }) ? '\t' : ',';
    return lines.map(function (l) { return l.split(sep).map(function (s) { return s.replace(/^"|"$/g, '').trim(); }); });
  }

  /* 找出標題列（含「姓名」那一列），整理成 [{欄名: 值}] */
  function toTable(rows) {
    var hr = -1, nameCol = -1;
    for (var r = 0; r < Math.min(rows.length, 10) && hr < 0; r++) {
      for (var c = 0; c < (rows[r] || []).length; c++) {
        if (NAME_HEADERS.indexOf(String(rows[r][c] || '').trim()) >= 0) { hr = r; nameCol = c; break; }
      }
    }
    if (hr < 0) throw new Error('找不到「姓名」欄。請確認 Excel 第一列有一格寫「姓名」。');
    var headers = rows[hr].map(function (h) { return String(h || '').trim(); });
    var records = [];
    for (var i = hr + 1; i < rows.length; i++) {
      var row = rows[i] || [], rec = {}, any = false;
      headers.forEach(function (h, k) { if (!h) return; var v = row[k] == null ? '' : String(row[k]).trim(); rec[h] = v; if (v) any = true; });
      rec.__name = String(row[nameCol] || '').replace(/\s+/g, '');
      rec.__row = i + 1;
      if (any && rec.__name) records.push(rec);
    }
    return { headers: headers.filter(Boolean), nameHeader: headers[nameCol], records: records };
  }

  /* Excel 的數字：整數照寫，小數最多留 1 位（例如 82.4615 → 82.5） */
  function fmt(v) {
    if (/^-?\d+\.\d{2,}$/.test(v)) { var n = Math.round(parseFloat(v) * 10) / 10; return String(n); }
    return v;
  }

  async function readXlsx(buf) {
    var dv = new DataView(buf), u8 = new Uint8Array(buf), eocd = -1;
    for (var i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 70000); i--) { if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
    if (eocd < 0) throw new Error('這個檔案不是 .xlsx 格式');
    var count = dv.getUint16(eocd + 10, true), off = dv.getUint32(eocd + 16, true), files = {}, dec = new TextDecoder('utf-8');
    for (var k = 0; k < count; k++) {
      var method = dv.getUint16(off + 10, true), csize = dv.getUint32(off + 20, true);
      var nlen = dv.getUint16(off + 28, true), elen = dv.getUint16(off + 30, true), clen = dv.getUint16(off + 32, true), lho = dv.getUint32(off + 42, true);
      files[dec.decode(u8.subarray(off + 46, off + 46 + nlen))] = { method: method, csize: csize, lho: lho };
      off += 46 + nlen + elen + clen;
    }
    async function read(name) {
      var f = files[name]; if (!f) return null;
      var l = f.lho, start = l + 30 + dv.getUint16(l + 26, true) + dv.getUint16(l + 28, true), data = u8.subarray(start, start + f.csize);
      if (f.method === 0) return dec.decode(data);
      return await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
    }
    var xml = function (t) { return new DOMParser().parseFromString(t, 'application/xml'); };
    var shared = [], sst = await read('xl/sharedStrings.xml');
    if (sst) {
      var sis = xml(sst).getElementsByTagName('si');
      for (var s = 0; s < sis.length; s++) { var ts = sis[s].getElementsByTagName('t'), str = ''; for (var q = 0; q < ts.length; q++) str += ts[q].textContent; shared.push(str); }
    }
    var sheetName = Object.keys(files).filter(function (n) { return /^xl\/worksheets\/sheet\d+\.xml$/.test(n); })
      .sort(function (a, b) { return parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]); })[0];
    if (!sheetName) throw new Error('Excel 裡找不到工作表');
    var doc = xml(await read(sheetName)), rows = [], rowEls = doc.getElementsByTagName('row');
    for (var r = 0; r < rowEls.length; r++) {
      var cells = rowEls[r].getElementsByTagName('c'), row = [];
      var rn = parseInt(rowEls[r].getAttribute('r') || (r + 1)) - 1;
      for (var c = 0; c < cells.length; c++) {
        var ref = cells[c].getAttribute('r') || '', letters = ref.replace(/\d+/g, ''), idx = 0;
        for (var z = 0; z < letters.length; z++) idx = idx * 26 + (letters.charCodeAt(z) - 64);
        idx = letters ? idx - 1 : row.length;
        var t = cells[c].getAttribute('t'), v = cells[c].getElementsByTagName('v')[0], val = '';
        if (t === 's' && v) val = shared[parseInt(v.textContent)] || '';
        else if (t === 'inlineStr') { var it = cells[c].getElementsByTagName('t'); for (var w = 0; w < it.length; w++) val += it[w].textContent; }
        else if (v) val = fmt(v.textContent);
        row[idx] = val;
      }
      rows[rn] = row;
    }
    for (var e = 0; e < rows.length; e++) if (!rows[e]) rows[e] = [];
    return rows;
  }

  /* ========== 自動計算的欄位 ==========
     應考人數：有分數的人數（分數空白＝缺考，不算）
     名次：Excel 沒有「名次」欄時，依分數由高到低排（同分同名次）
     平均：Excel 沒有「平均」欄時，用有分數的人算，四捨五入到小數 1 位 */
  var SCORE_HEADERS = ['分數', '成績', '得分'];
  function addComputed(t) {
    t.computed = [];
    var isNum = function (v) { return /^-?\d+(\.\d+)?$/.test(String(v || '').trim()); };
    var sk = SCORE_HEADERS.filter(function (h) { return t.headers.indexOf(h) >= 0; })[0];
    /* 系統匯出的格式：分數那一欄的標題是考試名稱（例如「1018國二愛迪生小考」）。
       沒有「分數」欄時，找「大部分是數字、又不是名次／學號／座號」的那一欄當分數 */
    if (!sk) {
      var NOT_SCORE = ['名次', '學號', '座號', '編號', '序號', '平均', '班平均', '應考人數', '電話', '手機', '年級', t.nameHeader];
      var cands = t.headers.filter(function (h) {
        if (NOT_SCORE.indexOf(h) >= 0) return false;
        var vals = t.records.map(function (r) { return r[h]; }).filter(function (v) { return v; });
        if (!vals.length) return false;
        var nums = vals.filter(isNum);
        return nums.length / vals.length >= 0.6 && nums.every(function (v) { return parseFloat(v) >= 0 && parseFloat(v) <= 150; });
      });
      if (cands.length) {
        t.examName = cands[cands.length - 1];
        t.records.forEach(function (r) { r['分數'] = isNum(r[t.examName]) ? r[t.examName] : ''; });
        t.headers.push('分數');
        sk = '分數';
      }
    }
    if (!sk) return;
    var scores = t.records.filter(function (r) { return isNum(r[sk]); }).map(function (r) { return parseFloat(r[sk]); });
    var count = scores.length;
    function add(h, fn) {
      if (t.headers.indexOf(h) >= 0) return;
      t.records.forEach(function (r) { r[h] = fn(r); });
      t.headers.push(h); t.computed.push(h);
    }
    add('應考人數', function () { return String(count); });
    add('名次', function (r) {
      if (!isNum(r[sk])) return '';
      var s = parseFloat(r[sk]);
      return String(1 + scores.filter(function (x) { return x > s; }).length);
    });
    add('平均', function () {
      if (!count) return '';
      return String(Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / count * 10) / 10);
    });
    t.summary = '應考人數 ' + count + (t.computed.indexOf('平均') >= 0 && count ? '、平均 ' + t.records[0]['平均'] : '');
  }

  /* ========== 訊息 ========== */
  /* 把 [欄名] 或 {欄名} 換成資料；回傳 { text, missing: [空白的欄], unknown: [Excel 沒有的欄] } */
  function render(template, rec, headers) {
    var missing = [], unknown = [];
    var text = template.replace(/\{([^{}]+)\}|\[([^\[\]]+)\]/g, function (all, k1, k2) {
      var key = (k1 || k2).trim();
      if (headers.indexOf(key) < 0) { if (unknown.indexOf(key) < 0) unknown.push(key); return all; }
      var v = rec[key];
      if (!v) { if (missing.indexOf(key) < 0) missing.push(key); return ''; }
      return v;
    });
    return { text: text, missing: missing, unknown: unknown };
  }

  /* ========== 預覽（只讀） ==========
     規則（寧可不發，也不要發錯人）：
     - 只考慮「後台名稱裡有學生姓名」的 LINE
     - 名稱裡學生姓名「前面那段」不一樣（例如 118慈文 vs 117振聲）→ 可能是不同人 → 預設不發
     - 名稱裡還有別的小孩（兄弟姊妹共用）→ 提醒訊息要寫孩子姓名
     - 範本要用的欄位是空的 → 預設不發
     - 家長有未讀訊息 → 提醒 */
  async function preview(table, template, onProgress) {
    var out = [];
    var hasNameInTemplate = template.indexOf('{' + table.nameHeader + '}') >= 0 || template.indexOf('[' + table.nameHeader + ']') >= 0;
    for (var i = 0; i < table.records.length; i++) {
      var rec = table.records[i], n = rec.__name;
      if (onProgress) onProgress(i + 1, table.records.length, n);
      var msg = render(template, rec, table.headers);
      if (rec.__retest) msg.text += '\n' + rec.__retest;
      if (rec.__tutor) msg.text += '\n' + rec.__tutor;
      msg.text = msg.text.replace(/!/g, '！');   /* 驚嘆號一律全形 */
      var item = { student: n, row: rec.__row, score: table.scoreKey ? (rec[table.scoreKey] || '') : null, text: msg.text, missing: msg.missing, unknown: msg.unknown, contacts: [], warn: [], block: '', retest: !!rec.__retest, tutor: !!rec.__tutor };
      var list;
      try { list = await searchContacts(n); } catch (e) { item.block = '搜尋失敗：' + e.message; out.push(item); continue; }
      var mine = list.filter(function (c) { return displayName(c).indexOf(n) >= 0 && !c.spam; });
      var others = list.filter(function (c) { return displayName(c).indexOf(n) < 0 && !c.spam; });
      if (!mine.length) item.block = '找不到 LINE';
      var prefixes = {};
      mine.forEach(function (c) { var nick = displayName(c); prefixes[nick.slice(0, nick.indexOf(n)).replace(/\s/g, '')] = 1; });
      var ambiguous = Object.keys(prefixes).length > 1;
      if (ambiguous) item.warn.push('找到的 LINE 看起來不是同一家人（名稱前面不一樣），請確認後再勾');
      if (others.length) item.warn.push('另有 ' + others.length + ' 個 LINE 只有本名相符，已排除');
      if (msg.missing.length) item.warn.push('「' + msg.missing.join('、') + '」是空的');
      for (var k = 0; k < mine.length; k++) {
        var c = mine[k], nick = displayName(c), chat = await getChat(c.contactId);
        /* 名稱裡有兩個以上年級數字（例如 112武陵…118經國…）→ 多半是兄弟姊妹共用 */
        var siblings = (nick.match(/\d{2,3}(?=[一-鿿])/g) || []).length >= 2;
        var note = [], dup = alreadySent(c.contactId, msg.text);
        if (dup) note.push('24 小時內已經發過一樣的內容，預設不重發');
        if (msg.text.length > 4900) note.push('訊息太長，LINE 可能不收');
        if (nick.indexOf('本人') >= 0) note.push('這是學生本人的 LINE');
        if (chat && chat.read === false) note.push('家長有未讀訊息，記得回覆');
        if (c.friend === false) note.push('非好友/已封鎖，可能收不到');
        if (siblings && !hasNameInTemplate) note.push('兄弟姊妹共用的 LINE，訊息裡最好寫孩子姓名');
        var okToSend = !dup && msg.text.length <= 4900 && !msg.missing.length && !msg.unknown.length && c.friend !== false;
        /* pending＝只因為「看起來不是同一家人」而沒勾，可以用「把待確認的全部勾選」一次勾起來 */
        item.contacts.push({ contactId: c.contactId, nick: nick, unread: !!(chat && chat.read === false), note: note.join('、'),
          checked: !ambiguous && okToSend, pending: ambiguous && okToSend });
        await sleep(120);
      }
      out.push(item);
      await sleep(150);
    }
    return out;
  }

  /* ========== 畫面 ========== */
  var P = '#' + PANEL_ID;
  var css = '' +
    P + '{position:fixed;top:12px;right:12px;width:600px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow:auto;z-index:2147483000;background:#fff;color:#222;border:1px solid #cfd8dc;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,.25);font:14px/1.5 "Microsoft JhengHei","PingFang TC",sans-serif}' +
    P + ' *{box-sizing:border-box}' +
    P + ' .lg-head{position:sticky;top:0;background:#1565c0;color:#fff;padding:10px 14px;font-weight:bold;font-size:16px;display:flex;justify-content:space-between;align-items:center;z-index:1}' +
    P + ' .lg-x{cursor:pointer;background:none;border:none;color:#fff;font-size:20px;line-height:1}' +
    P + ' .lg-body{padding:12px 14px}' +
    P + ' .lg-step{margin-bottom:14px;padding-bottom:12px;border-bottom:1px dashed #ddd}' +
    P + ' .lg-step h4{margin:0 0 6px;font-size:15px}' +
    P + ' textarea{width:100%;font-size:14px;padding:6px;border:1px solid #ccc;border-radius:6px}' +
    P + ' button.lg-btn{padding:7px 12px;margin:4px 6px 0 0;border-radius:6px;border:1px solid #1565c0;background:#1565c0;color:#fff;font-size:14px;cursor:pointer}' +
    P + ' button.lg-btn.lg-sec{background:#fff;color:#1565c0}' +
    P + ' button.lg-chip{padding:2px 8px;margin:2px;border-radius:12px;border:1px solid #90caf9;background:#e3f2fd;color:#0d47a1;font-size:12px;cursor:pointer}' +
    P + ' button:disabled{opacity:.4;cursor:not-allowed}' +
    P + ' table{width:100%;border-collapse:collapse;margin-top:6px;font-size:13px}' +
    P + ' th,' + P + ' td{border-bottom:1px solid #eee;padding:6px 4px;text-align:left;vertical-align:top}' +
    P + ' th{background:#f5f7f8}' +
    P + ' .lg-muted{color:#777;font-size:12px}' +
    P + ' .lg-red{color:#d32f2f;font-weight:bold}' +
    P + ' .lg-warn{color:#e65100}' +
    P + ' .lg-box{background:#f5f7f8;border-radius:6px;padding:8px 10px;margin-top:6px}' +
    P + ' .lg-msg{white-space:pre-wrap;background:#e8f5e9;border-radius:8px;padding:6px 8px;margin-top:4px}' +
    P + ' .lg-banner{background:#fff3e0;color:#e65100;border-radius:6px;padding:6px 10px;margin-bottom:10px;font-weight:bold}' +
    P + ' label.lg-c{display:block;cursor:pointer}' +
    P + ' .lg-prog{margin-top:6px;color:#1565c0;font-weight:bold}' +
    P + ' .lg-locked{opacity:.35;pointer-events:none;filter:grayscale(1)}' +
    P + ' .lg-sendbox{border:2px solid #90caf9;background:#e3f2fd;border-radius:8px;padding:8px 10px;margin:6px 0}' +
    P + ' .lg-bar{position:relative;height:20px;background:#fff;border:1px solid #bbdefb;border-radius:10px;overflow:hidden;margin:6px 0}' +
    P + ' .lg-bar i{display:block;height:100%;width:0;background:' + '#1565c0' + ';transition:width .25s}' +
    P + ' .lg-bar span{position:absolute;left:0;right:0;top:0;text-align:center;font-size:12px;line-height:20px;font-weight:bold;color:#222}' +
    P + ' .lg-done{border-radius:8px;padding:10px 12px;margin:6px 0;font-size:16px;font-weight:bold}' +
    P + ' .lg-done-ok{background:#e8f5e9;color:#1b5e20;border:2px solid #66bb6a}' +
    P + ' .lg-done-bad{background:#ffebee;color:#b71c1c;border:2px solid #ef5350}';

  /* 班別下拉選單（依年級分組）。來源：班別清單_LINE與共用資料夾.xlsx 的「建議下拉選單」，2026/10/18 整理。
     要增減班別就改這裡；選單最下面一定有「其他（自己輸入）」。 */
  var CLASS_GROUPS = [
    ['國一', ['國一數資週五班', '國一數資週六班', '國一數資輔導', '國一數學進度班', '國一數學進度輔導', '國一愛迪生週六班', '國一愛迪生週日班',
      '國一愛迪生輔導', '國一英文超前班', '國一英文進度班', '國一英文輔導班', '國一生物進階班']],
    ['國二', ['國二小霍金自然班', '國二小霍金數學班', '國二霍金首部曲班', '國二理化公校班', '國二理化公校輔導', '國二理化私校班', '國二理化私校輔導',
      '國二數資A班', '國二數資B班', '國二數資輔導', '國二數學進度班', '國二數學進度輔導', '國二英文班', '國二愛迪生班']],
    ['國三', ['國三霍金A班數學', '國三霍金A班自然', '國三霍金B班數學', '國三霍金B班自然']],
    ['高一', ['高一武陵數學班', '高一桃高數學班', '高一科資數學班', '高一數學輔導班', '高一必修化學班', '高一必修物理班', '高一英文班', '高中生物一貫班']],
    ['高二', ['高二超修物理班', '高二超修化學班', '高二武陵數學班', '高二武陵物理班', '高二武陵化學班', '高二桃高數學班', '高二桃高物理班',
      '高二桃高化學班', '高二數資數學班', '高二科學班數學', '高二英文班']],
    ['高三', ['高三超修物理班', '高三超修化學班', '高三學測數學週六班', '高三學測數學週日班', '高三學測化學班', '高三學測物理班',
      '高三學測英寫班', '高三學測國寫班', '高三化學進度班']]
  ];

  /* 各班輔導時間：由 build_tutor_schedule.py 從共用資料夾的年級課表自動產生，不要手動改這一行。
     classTutor＝哪一班要去哪一堂輔導；schedule＝每堂輔導的 [日期, 開始, 結束]。 */
  /* TUTOR_DATA_START */ var TUTOR_DATA = {"source": "115年第二次段考", "updated": "2026-10-18", "until": "2026-12-13", "schedule": {"國一數資輔導": [["2026-10-25", "10:00", "12:00"], ["2026-11-01", "10:00", "12:00"], ["2026-11-08", "10:00", "12:00"], ["2026-11-15", "10:00", "12:00"], ["2026-11-22", "10:00", "12:00"], ["2026-12-06", "10:00", "12:00"], ["2026-12-13", "10:00", "12:00"]], "國一數學進度輔導": [["2026-10-20", "18:00", "20:30"], ["2026-10-27", "18:00", "20:30"], ["2026-11-03", "18:00", "20:30"], ["2026-11-10", "18:00", "20:30"], ["2026-11-17", "18:00", "20:30"], ["2026-12-08", "18:00", "20:30"]], "國一愛迪生輔導": [["2026-10-25", "18:00", "20:30"], ["2026-11-01", "18:00", "20:30"], ["2026-11-08", "18:00", "20:30"], ["2026-11-15", "18:00", "20:30"], ["2026-11-22", "18:00", "20:30"], ["2026-12-06", "18:00", "20:30"], ["2026-12-13", "18:00", "20:30"]], "國一英文輔導班": [["2026-10-24", "10:00", "12:00"], ["2026-10-31", "10:00", "12:00"], ["2026-11-07", "10:00", "12:00"], ["2026-11-14", "10:00", "12:00"], ["2026-11-21", "10:00", "12:00"], ["2026-12-05", "10:00", "12:00"], ["2026-12-12", "10:00", "12:00"]], "國二理化公校輔導": [["2026-10-24", "10:00", "12:00"], ["2026-10-31", "10:00", "12:00"], ["2026-11-07", "10:00", "12:00"], ["2026-11-14", "10:00", "12:00"], ["2026-11-21", "10:00", "12:00"], ["2026-12-05", "10:00", "12:00"], ["2026-12-12", "10:00", "12:00"]], "國二理化私校輔導": [["2026-10-20", "18:30", "21:00"], ["2026-10-27", "18:30", "21:00"], ["2026-11-03", "18:30", "21:00"], ["2026-11-10", "18:30", "21:00"], ["2026-11-17", "18:30", "21:00"], ["2026-12-08", "18:30", "21:00"]], "國二數學進度輔導": [["2026-10-21", "18:00", "20:30"], ["2026-10-28", "18:00", "20:30"], ["2026-11-04", "18:00", "20:30"], ["2026-11-11", "18:00", "20:30"], ["2026-11-18", "18:00", "20:30"], ["2026-12-02", "18:00", "20:30"], ["2026-12-09", "18:00", "20:30"]], "高一武陵數學輔導": [["2026-11-01", "13:00", "15:00"], ["2026-11-08", "13:00", "15:00"], ["2026-11-15", "13:00", "15:00"], ["2026-11-22", "13:00", "15:00"], ["2026-12-06", "13:00", "15:00"], ["2026-12-13", "13:00", "15:00"]], "高一桃高數學輔導": [["2026-10-25", "15:10", "17:10"], ["2026-11-01", "15:10", "17:10"], ["2026-11-08", "15:10", "17:10"], ["2026-11-15", "15:10", "17:10"], ["2026-12-06", "15:10", "17:10"], ["2026-12-13", "15:10", "17:10"]], "高二數學輔導": [["2026-10-25", "18:00", "20:00"], ["2026-11-01", "18:00", "20:00"], ["2026-11-08", "18:00", "20:00"], ["2026-11-15", "18:00", "20:00"], ["2026-11-22", "18:00", "20:00"], ["2026-12-06", "18:00", "20:00"], ["2026-12-13", "18:00", "20:00"]]}, "classTutor": {"國一數資週五班": "國一數資輔導", "國一數資週六班": "國一數資輔導", "國一數資輔導": "國一數資輔導", "國一數學進度班": "國一數學進度輔導", "國一數學進度輔導": "國一數學進度輔導", "國一愛迪生週六班": "國一愛迪生輔導", "國一愛迪生週日班": "國一愛迪生輔導", "國一愛迪生輔導": "國一愛迪生輔導", "國一英文超前班": "國一英文輔導班", "國一英文進度班": "國一英文輔導班", "國一英文輔導班": "國一英文輔導班", "國二理化公校班": "國二理化公校輔導", "國二理化公校輔導": "國二理化公校輔導", "國二理化私校班": "國二理化私校輔導", "國二理化私校輔導": "國二理化私校輔導", "國二數學進度班": "國二數學進度輔導", "國二數學進度輔導": "國二數學進度輔導", "高一武陵數學班": "高一武陵數學輔導", "高一桃高數學班": "高一桃高數學輔導", "高二武陵數學班": "高二數學輔導", "高二桃高數學班": "高二數學輔導"}}; /* TUTOR_DATA_END */

  /* 需要輔導的學生，訊息最後自動加上這一句（[輔導時間] 會換成選的日期與時間） */
  var TUTOR_SENTENCE = '請同學於[輔導時間]準時到班參加輔導。';

  /* 需要補考的學生，訊息最後自動加上這一句（視窗裡可以改；[補考時間] 會換成選的日期與時間，例如 10/24(六)下午15:00-17:00） */
  var RETEST_SENTENCE = '請成績低於[成績標準]的同學，務必要於[補考時間]，到班進行補考及個別輔導。';
  var DEFAULT_TEMPLATE ='親愛的家長您好：貴子弟[姓名]於今日[班別]小考成績為[分數]分，名次為第[名次]名，應考人[應考人數]位。班平均為[平均]分。特此通知您。';

  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = '<style>' + css + '</style>' +
    '<div class="lg-head"><span>批次發成績</span><button class="lg-x" title="關閉">×</button></div>' +
    '<div class="lg-body">' +
    (SEND_ENABLED ? '' : '<div class="lg-banner">預覽版：只會顯示每位家長會收到的內容，不會真的發送。</div>') +
    '<div class="lg-box" style="margin:0 0 12px">目前帳號：<b class="lg-bot">讀取中…</b></div>' +
    '<div class="lg-step"><h4>① 成績 Excel</h4>' +
    '<div>選檔案（.xlsx / .csv）：<input type="file" class="lg-file" accept=".xlsx,.csv,.txt"></div>' +
    '<div class="lg-muted" style="margin:4px 0">第一列要是標題，其中一欄叫「姓名」。或從 Excel 連標題一起複製貼在下面：</div>' +
    '<textarea class="lg-paste" style="height:60px" placeholder="姓名&#9;分數&#10;林文琪&#9;92&#10;胡祐綸&#9;85"></textarea>' +
    '<div class="lg-info lg-muted"></div></div>' +
    '<div class="lg-step"><h4>② 班別</h4>' +
    '<select class="lg-class-sel" style="width:100%;padding:6px;border:1px solid #ccc;border-radius:6px;font-size:15px"></select>' +
    '<input type="text" class="lg-class" placeholder="輸入班別，例如：高二數學A班" style="display:none;width:100%;margin-top:6px;padding:6px;border:1px solid #ccc;border-radius:6px;font-size:15px">' +
    '<div class="lg-muted">會放進訊息裡的 [班別]。</div>' +
    '<div class="lg-q" style="margin-top:12px;padding:8px 10px;border:2px solid #ffb74d;border-radius:8px;background:#fff8e1"><b style="font-size:15px">需要補考／輔導嗎？</b>' +
    '<label style="cursor:pointer;margin-left:12px;font-size:15px"><input type="radio" name="lg-rtq" value="yes"> 要</label>' +
    '<label style="cursor:pointer;margin-left:12px;font-size:15px"><input type="radio" name="lg-rtq" value="no"> 不要</label>' +
    '<div class="lg-red lg-rtq-need" style="font-size:13px">← 一定要選「要」或「不要」，才能往下一步（③ 訊息範本、④ 預覽）。</div></div>' +
    '<div class="lg-retest-box" style="display:none;margin:6px 0 0 22px">' +
    '<div>輔導課：<select class="lg-tu-cls" style="padding:4px;border:1px solid #ccc;border-radius:6px;font-size:14px"></select></div>' +
    '<div class="lg-tu-hint" style="margin-top:4px;font-size:13px"></div>' +
    '<div class="lg-tu-list" style="margin-top:2px"></div>' +
    '<div style="margin-top:6px">補考／輔導日期：<input type="date" class="lg-tu-date" style="padding:4px;border:1px solid #ccc;border-radius:6px;font-size:14px"></div>' +
    '<div style="margin-top:6px">補考／輔導時間：<input type="time" class="lg-tu-start" step="300" style="padding:4px;border:1px solid #ccc;border-radius:6px;font-size:14px">' +
    ' 到 <input type="time" class="lg-tu-end" step="300" style="padding:4px;border:1px solid #ccc;border-radius:6px;font-size:14px"></div>' +
    '<div style="margin-top:4px">訊息裡會寫成：<b class="lg-tu-show" style="color:#c62828">（請選日期）</b> <span class="lg-tu-diff lg-warn"></span></div>' +
    '<div style="margin-top:8px">補考／輔導對象：' +
    '<label style="cursor:pointer;margin-right:10px"><input type="radio" name="lg-rt" value="avg" checked> 低於班平均</label>' +
    '<label style="cursor:pointer;margin-right:10px"><input type="radio" name="lg-rt" value="below"> 分數低於 ' +
    '<input type="number" class="lg-retest-min" value="60" style="width:56px;padding:2px;border:1px solid #ccc;border-radius:6px"> 分</label>' +
    '<label style="cursor:pointer"><input type="radio" name="lg-rt" value="all"> 全部學生</label></div>' +
    '<div style="margin-top:8px">補考／輔導那一句（會加在需要的學生訊息最後，可以改；<b>[成績標準]</b> 會跟著上面的對象變成「班平均」或「60分」）：</div>' +
    '<textarea class="lg-rt-text" style="height:52px;margin-top:2px"></textarea>' +
    '</div>' +
    '</div>' +
    '<div class="lg-step lg-s3 lg-locked"><h4>③ 訊息範本</h4>' +
    '<div class="lg-muted">用 [欄位名稱] 代入每位學生的資料。點下面的按鈕可以插入欄位（綠色是工具自動算的）：</div>' +
    '<div class="lg-chips"></div>' +
    '<textarea class="lg-tpl" style="height:110px"></textarea>' +
    '<div class="lg-livepv" style="margin-top:8px"></div></div>' +
    '<div class="lg-step lg-s4 lg-locked"><h4>④ 預覽</h4>' +
    '<div style="margin-bottom:6px">任務名稱（記在發送紀錄總表）：<input type="text" class="lg-task" placeholder="例如：高一數學小考成績" style="width:58%;padding:4px;border:1px solid #ccc;border-radius:6px;font-size:14px"></div>' +
    '<button class="lg-btn lg-preview">搜尋預覽</button>' +
    (SEND_ENABLED
      ? '<button class="lg-btn lg-send" disabled title="先按「搜尋預覽」並確認內容" style="background:#c62828;border-color:#c62828">開始發送</button>' +
        '<button class="lg-btn lg-sec lg-stop" style="display:none;color:#c62828;border-color:#c62828">停止發送</button>'
      : '<button class="lg-btn lg-send" disabled title="預覽版還不能發送">開始發送（尚未開放）</button>') +
    '<div class="lg-prog"></div></div>' +
    '<div class="lg-out"></div>' +
    '</div>';
  __mount(panel);

  var $ = function (s) { return panel.querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); };

  /* 訊息預覽：用「吳政興」當範例（分數等用 Excel 第一位的；還沒放 Excel 就用範例數字），邊改邊顯示家長會收到的樣子 */
  var SAMPLE_NAME = '吳政興';
  function renderLivePreview() {
    var box = panel.querySelector('.lg-livepv'), tpl = panel.querySelector('.lg-tpl').value;
    if (!box) return;
    if (!tpl.trim()) { box.innerHTML = ''; return; }
    var t = state.table, rec = {}, k;
    if (t && t.records.length) for (k in t.records[0]) rec[k] = t.records[0][k];
    var nameH = t ? t.nameHeader : '姓名';
    rec[nameH] = SAMPLE_NAME; rec['姓名'] = SAMPLE_NAME;
    [['分數', '85'], ['名次', '3'], ['應考人數', '20'], ['平均', '78.5']].forEach(function (d) { if (!rec[d[0]]) rec[d[0]] = d[1]; });
    rec['班別'] = currentClass() || rec['班別'] || '';
    var txt = tpl.replace(/\[([^\[\]]+)\]|\{([^{}]+)\}/g, function (all, a, b) { var v = rec[(a || b).trim()]; return v ? v : all; });
    var extra = '';
    if (answer('lg-rtq') === 'yes') {
      var tm = retestTimeText() || '[補考時間]';
      extra = '\n' + fillRt(panel.querySelector('.lg-rt-text').value.trim(), tm);
    }
    box.innerHTML = '<div class="lg-muted">👀 訊息預覽（範例：' + SAMPLE_NAME + (t && t.records.length ? '，分數等用 Excel 第一位的' : '，分數等是範例數字') + '）</div>' +
      '<div class="lg-msg" style="max-width:380px">' + esc((txt + extra).replace(/!/g, '！')) + '</div>' +
      (extra ? '<div class="lg-muted">最後一句只有「需要補考／輔導」的學生才會有。</div>' : '');
  }
  setTimeout(function () {
    panel.addEventListener('input', function (e) { if (!e.target.closest('.lg-out')) setTimeout(renderLivePreview, 0); });
    panel.addEventListener('change', function (e) { if (!e.target.closest('.lg-out')) setTimeout(renderLivePreview, 0); });
    panel.addEventListener('click', function (e) { if (e.target.closest('.lg-chip, .lg-tu-pick')) setTimeout(renderLivePreview, 0); });
    renderLivePreview();
  }, 0);
  var state = { table: null, items: null, busy: false };
  $('.lg-tpl').value = DEFAULT_TEMPLATE;

  /* 班別選單：依年級分組，最下面是「其他（自己輸入）」 */
  var CLASS_OTHER = '__other__';
  $('.lg-class-sel').innerHTML = '<option value="">－ 請選擇班別 －</option>' +
    CLASS_GROUPS.map(function (g) {
      return '<optgroup label="' + esc(g[0]) + '">' + g[1].map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '</optgroup>';
    }).join('') +
    '<option value="' + CLASS_OTHER + '">其他（自己輸入）…</option>';
  function showClassInput(show) { $('.lg-class').style.display = show ? 'block' : 'none'; }
  $('.lg-class-sel').onchange = function () {
    var other = this.value === CLASS_OTHER;
    showClassInput(other);
    if (other) $('.lg-class').focus();
    autoTutor();
  };
  function currentClass() {
    var v = $('.lg-class-sel').value;
    return v === CLASS_OTHER ? $('.lg-class').value.trim() : v;
  }
  /* 從考試名稱猜到的班別：選單裡有就選起來（例如「國二愛迪生」→「國二愛迪生班」），沒有就放進「其他」 */
  function setClassGuess(guess) {
    var all = [];
    CLASS_GROUPS.forEach(function (g) { all = all.concat(g[1]); });
    var hit = all.filter(function (c) { return c === guess; })[0] || all.filter(function (c) { return c === guess + '班'; })[0];
    if (!hit) { var starts = all.filter(function (c) { return c.indexOf(guess) === 0; }); if (starts.length === 1) hit = starts[0]; }
    if (hit) { $('.lg-class-sel').value = hit; showClassInput(false); autoTutor(); return hit; }
    $('.lg-class-sel').value = CLASS_OTHER; showClassInput(true); $('.lg-class').value = guess;
    return guess + '（選單裡沒有，放在「其他」）';
  }
  $('.lg-rt-text').value = RETEST_SENTENCE;

  /* 補考／輔導那一句裡的 [成績標準]：跟著上面的「對象」——低於班平均 →「班平均」，分數低於 60 分 →「60分」；
     選「全部學生」時「成績低於[成績標準]的同學」會變成「全部同學」。[補考時間] 換成選的日期與時間。 */
  function rtStandard() {
    var r = panel.querySelector('input[name=lg-rt]:checked'), mode = r ? r.value : 'avg';
    if (mode === 'below') { var n = $('.lg-retest-min').value.trim(); return n ? n + '分' : '[成績標準]'; }
    return mode === 'all' ? '' : '班平均';
  }
  function fillRt(text, tm) {
    var r = panel.querySelector('input[name=lg-rt]:checked');
    if (r && r.value === 'all') text = text.split('成績低於[成績標準]的同學').join('全部同學').split('成績低於{成績標準}的同學').join('全部同學');
    var sd = rtStandard();
    return text.split('[補考時間]').join(tm).split('{補考時間}').join(tm).split('[成績標準]').join(sd).split('{成績標準}').join(sd);
  }
  $('.lg-retest-min').addEventListener('input', function () {
    var b = panel.querySelector('input[name=lg-rt][value=below]'); if (b && !b.checked) b.checked = true;   /* 改分數就自動選「分數低於」 */
  });

  /* 把選的日期、時間組成「10/24(六)下午15:00-17:00」；沒選好就回傳空字串 */
  function retestTimeText() {
    return slotText($('.lg-tu-date').value, $('.lg-tu-start').value, $('.lg-tu-end').value);
    var d, s, e;
    var p = d.split('-'), dt = new Date(+p[0], +p[1] - 1, +p[2]);
    var wk = '日一二三四五六'.charAt(dt.getDay()), h = parseInt(s, 10);
    var part = h < 12 ? '上午' : (h < 18 ? '下午' : '晚上');
    return (+p[1]) + '/' + (+p[2]) + '(' + wk + ')' + part + s + '-' + e;
  }
  function showRetestTime() {
    var t = retestTimeText(), bad = $('.lg-rt-start').value && $('.lg-rt-end').value && $('.lg-rt-end').value <= $('.lg-rt-start').value;
    $('.lg-rt-show').textContent = bad ? '結束時間要晚於開始時間' : (t || '（請選日期）');
  }

  /* ========== 是否補考／是否輔導：兩題都一定要回答「要」或「不要」才能預覽（防呆） ========== */
  function answer(name) { var r = panel.querySelector('input[name=' + name + ']:checked'); return r ? r.value : ''; }
  function wireQ(name, box) {
    panel.querySelectorAll('input[name=' + name + ']').forEach(function (r) {
      r.onchange = function () {
        var yes = answer(name) === 'yes';
        $(box).style.display = yes ? 'block' : 'none';
        $('.' + name + '-need').style.display = 'none';
        panel.querySelectorAll('.lg-s3, .lg-s4').forEach(function (s) { s.classList.remove('lg-locked'); });
        if (yes) { if (!$('.lg-tu-date').value) autoTutor(); else renderTutorHint(); }
      };
    });
  }
  wireQ('lg-rtq', '.lg-retest-box');

  /* ========== 輔導時間：依班別自動從課表帶入最近一堂，也可以自己改（臨時改時間） ========== */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function todayStr() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function slotText(d, s, e) {
    if (!d || !s || !e) return '';
    var p = d.split('-'), dt = new Date(+p[0], +p[1] - 1, +p[2]);
    var wk = '日一二三四五六'.charAt(dt.getDay()), h = parseInt(s, 10);
    var part = h < 12 ? '上午' : (h < 18 ? '下午' : '晚上');
    return (+p[1]) + '/' + (+p[2]) + '(' + wk + ')' + part + s + '-' + e;
  }
  var TUTOR_NAMES = Object.keys(TUTOR_DATA.schedule || {});
  $('.lg-tu-cls').innerHTML = '<option value="">－ 選輔導課（或直接填下面的時間）－</option>' +
    TUTOR_NAMES.map(function (n) { return '<option>' + esc(n) + '</option>'; }).join('');
  function upcoming(name) { return ((TUTOR_DATA.schedule || {})[name] || []).filter(function (r) { return r[0] >= todayStr(); }); }
  function setSlot(r) { $('.lg-tu-date').value = r[0]; $('.lg-tu-start').value = r[1]; $('.lg-tu-end').value = r[2]; showTutorTime(); }
  function renderTutorHint() {
    var name = $('.lg-tu-cls').value, list = name ? upcoming(name) : [], src = TUTOR_DATA.source ? '「' + TUTOR_DATA.source + '」課表' : '課表';
    var h;
    if (!name) h = (TUTOR_DATA.classTutor || {})[currentClass()] ? '' : '<span class="lg-warn">這個班別沒有對應的輔導課，請選輔導課，或直接填下面的日期、時間。</span>';
    else if (!list.length) h = '<span class="lg-warn">' + esc(src) + '裡找不到「' + esc(name) + '」今天以後的時間，請自己填。</span>';
    else h = '<span style="color:#2e7d32">已依' + esc(src) + '帶入最近一堂。</span>臨時改時間：直接改下面的日期、時間，或點其他堂。';
    $('.lg-tu-hint').innerHTML = h;
    $('.lg-tu-list').innerHTML = list.slice(0, 4).map(function (r, i) {
      return '<button class="lg-chip lg-tu-pick" data-i="' + i + '">' + esc(slotText(r[0], r[1], r[2])) + '</button>';
    }).join('');
    $('.lg-tu-list').querySelectorAll('.lg-tu-pick').forEach(function (b) { b.onclick = function () { setSlot(list[+this.dataset.i]); }; });
    showTutorTime();
  }
  function autoTutor() {
    var name = (TUTOR_DATA.classTutor || {})[currentClass()];
    if (name) { $('.lg-tu-cls').value = name; var l = upcoming(name); if (l.length) setSlot(l[0]); }
    renderTutorHint();
  }
  function showTutorTime() {
    var d = $('.lg-tu-date').value, s = $('.lg-tu-start').value, e = $('.lg-tu-end').value, t = slotText(d, s, e);
    $('.lg-tu-show').textContent = s && e && e <= s ? '結束時間要晚於開始時間' : (t || '（請選日期）');
    var name = $('.lg-tu-cls').value, inSchedule = upcoming(name).some(function (r) { return r[0] === d && r[1] === s && r[2] === e; });
    $('.lg-tu-diff').textContent = name && t && !inSchedule ? '（跟課表不一樣：臨時改時間）' : '';
  }
  $('.lg-tu-cls').onchange = function () { var l = upcoming(this.value); if (l.length) setSlot(l[0]); renderTutorHint(); };
  ['.lg-tu-date', '.lg-tu-start', '.lg-tu-end'].forEach(function (s) { $(s).oninput = showTutorTime; $(s).onchange = showTutorTime; });
  renderTutorHint();
  $('.lg-x').onclick = function () { panel.style.display = 'none'; };
  api('/api/v1/bots/' + botId + '?noFilter=true').then(function (b) { $('.lg-bot').textContent = b.name || botId; }, function () { $('.lg-bot').textContent = botId; });

  function setTable(rows) {
    try { state.table = toTable(rows); } catch (e) { state.table = null; $('.lg-info').innerHTML = '<span class="lg-red">' + esc(e.message) + '</span>'; $('.lg-chips').innerHTML = ''; return; }
    var t = state.table;
    addComputed(t);
    /* [班別] 來自視窗上的輸入欄（Excel 有「班別」欄而輸入欄空白時，用 Excel 的） */
    t.classFromExcel = t.headers.indexOf('班別') >= 0;
    if (!t.classFromExcel) t.headers.push('班別');
    var fromExcel = t.headers.filter(function (h) { return t.computed.indexOf(h) < 0 && (h !== '班別' || t.classFromExcel) && !(t.examName && h === '分數'); });
    /* 系統匯出格式：班別欄空著時，從考試名稱帶入（「1018國二愛迪生小考」→「國二愛迪生」） */
    var classHint = '';
    if (t.examName && !currentClass()) {
      var guess = t.examName.replace(/^\d{3,4}\s*/, '').replace(/(小考|大考|考試|測驗|週考|複習考)\s*$/, '').trim();
      if (guess) { var picked = setClassGuess(guess); classHint = '<br>班別已自動帶入「' + esc(picked) + '」，不對可以在②修改。'; }
    }
    $('.lg-info').innerHTML = '讀到 <b>' + t.records.length + '</b> 位學生，欄位：' + esc(fromExcel.join('、')) +
      (t.examName ? '<br><b style="color:#1565c0">分數＝「' + esc(t.examName) + '」那一欄</b>' : '') + classHint +
      (t.computed.length ? '<br>工具自動算：' + esc(t.computed.join('、')) + (t.summary ? '（' + esc(t.summary) + '）' : '') : '') +
      (t.headers.some(function (h) { return SCORE_HEADERS.indexOf(h) >= 0; }) ? '' : '<br><span class="lg-warn">沒有「分數」欄，無法自動算應考人數／名次／平均。</span>');
    $('.lg-chips').innerHTML = t.headers.map(function (h) {
      var auto = t.computed.indexOf(h) >= 0 || (h === '班別' && !t.classFromExcel);
      return '<button class="lg-chip" data-h="' + esc(h) + '"' + (auto ? ' style="background:#e8f5e9;border-color:#a5d6a7;color:#1b5e20"' : '') + '>[' + esc(h) + ']</button>';
    }).join('');
    $('.lg-chips').querySelectorAll('button').forEach(function (b) {
      b.onclick = function () {
        var ta = $('.lg-tpl'), ins = '[' + this.dataset.h + ']', s = ta.selectionStart || ta.value.length;
        ta.value = ta.value.slice(0, s) + ins + ta.value.slice(ta.selectionEnd || s); ta.focus();
        ta.selectionStart = ta.selectionEnd = s + ins.length;
      };
    });
    state.items = null; $('.lg-out').innerHTML = '';
  }
  $('.lg-paste').oninput = function () { if (this.value.trim()) setTable(parseText(this.value)); };
  $('.lg-file').onchange = async function () {
    var f = this.files[0]; if (!f) return;
    try { setTable(/\.xlsx$/i.test(f.name) ? await readXlsx(await f.arrayBuffer()) : parseText(await f.text())); }
    catch (e) { alert('讀取失敗：' + e.message + '\n可以改用「複製貼上」。'); }
  };

  function prog(i, n, name) { $('.lg-prog').textContent = '處理中 ' + i + ' / ' + n + '：' + name; }

  $('.lg-preview').onclick = async function () {
    if (state.busy) return;
    if (!state.table || !state.table.records.length) { alert('請先放成績 Excel。'); return; }
    var tpl = $('.lg-tpl').value.trim();
    if (!tpl) { alert('請先寫訊息範本。'); return; }
    var cls = currentClass(), t = state.table;
    if (/\[班別\]|\{班別\}/.test(tpl) && !cls && !t.classFromExcel) {
      alert($('.lg-class-sel').value === CLASS_OTHER ? '請輸入班別。' : '請先選「班別」。');
      ($('.lg-class-sel').value === CLASS_OTHER ? $('.lg-class') : $('.lg-class-sel')).focus(); return;
    }
    t.records.forEach(function (r) {
      if (!t.classFromExcel) r['班別'] = cls;
      else if (cls) r['班別'] = cls;
    });
    /* 防呆：補考、輔導都要先回答「要」或「不要」 */
    var rtq = answer('lg-rtq');
    if (!rtq) { $('.lg-rtq-need').style.display = ''; alert('請先回答②「需要補考／輔導嗎？」（要／不要）。'); $('.lg-rtq-need').scrollIntoView({ block: 'center' }); return; }
    /* 補考：選「要」後，依「補考對象」決定哪些學生的訊息最後要加補考那一句 */
    var retest = rtq === 'yes', rtTime = retestTimeText();
    var rtMode = panel.querySelector('input[name=lg-rt]:checked').value;
    var rtMin = parseFloat($('.lg-retest-min').value), rtText = $('.lg-rt-text').value.trim();
    var sk = SCORE_HEADERS.filter(function (h) { return t.headers.indexOf(h) >= 0; })[0];
    if (retest) {
      if (!$('.lg-tu-date').value) { alert('請選「補考／輔導日期」。'); $('.lg-tu-date').focus(); return; }
      if (!rtTime || $('.lg-tu-end').value <= $('.lg-tu-start').value) { alert('請確認補考／輔導的開始和結束時間。'); $('.lg-tu-start').focus(); return; }
      if (!rtText) { alert('請填「補考／輔導那一句」。'); $('.lg-rt-text').focus(); return; }
      if (rtMode === 'below' && isNaN(rtMin)) { alert('請填分數門檻，例如 60。'); $('.lg-retest-min').focus(); return; }
      if (rtMode !== 'all' && !sk) { alert('Excel 沒有「分數」欄，只能選「全部學生」。'); return; }
      if ($('.lg-tu-date').value < todayStr() && !confirm('補考／輔導日期 ' + rtTime + ' 已經過了，確定要用這個日期嗎？')) return;
    }
    /* 班平均：Excel 有「平均」欄就用它，沒有就用工具算的 */
    var avg = t.records.length ? parseFloat(t.records[0]['平均']) : NaN;
    if (retest && rtMode === 'avg' && isNaN(avg)) { alert('算不出班平均，請改選其他補考對象。'); return; }
    state.rtq = rtq;
    t.records.forEach(function (r) {
      var score = sk ? parseFloat(r[sk]) : NaN;
      var need = retest && (rtMode === 'all' || (!isNaN(score) && score < (rtMode === 'avg' ? avg : rtMin)));
      r.__retest = need ? fillRt(rtText, rtTime) : '';
      r.__tutor = '';
    });
    state.busy = true; this.disabled = true; $('.lg-send').disabled = true; $('.lg-out').innerHTML = '';
    try {
      /* 預覽和發送結果都依分數由高到低排；沒有分數（缺考）的排最後 */
      var sorted = t.records.slice();
      if (sk) {
        var sc = function (r) { var v = parseFloat(r[sk]); return isNaN(v) ? -Infinity : v; };
        sorted.sort(function (a, b) { return sc(b) - sc(a); });
      }
      if (!$('.lg-task').value.trim()) $('.lg-task').value = (cls || (t.examName || '').replace(/^\d{3,4}\s*/, '') || '') + (/(小考|考試|成績)$/.test(cls || '') ? '' : '小考成績');
      state.items = await preview({ headers: t.headers, nameHeader: t.nameHeader, records: sorted, scoreKey: sk }, tpl, prog); renderPreview();
      $('.lg-prog').textContent = SEND_ENABLED ? '預覽完成。請逐一確認內容與勾選，沒問題再按「開始發送」。' : '預覽完成。';
      if (SEND_ENABLED) $('.lg-send').disabled = false;
    } catch (e) { alert('預覽失敗：' + e.message); }
    state.busy = false; this.disabled = false;
  };

  /* 學生姓名下面顯示分數（空白＝缺考） */
  function scoreTag(it) {
    if (it.score == null) return '';
    return '<div style="font-weight:bold;color:#1565c0">' + (it.score === '' ? '<span class="lg-muted">缺考</span>' : esc(it.score) + ' 分') + '</div>';
  }

  function renderPreview() {
    var items = state.items, send = 0, students = 0, blocked = [], unread = [];
    items.forEach(function (it) {
      var n = it.contacts.filter(function (c) { return c.checked; }).length;
      send += n; if (n) students++;
      if (it.block) blocked.push(it.student + '（' + it.block + '）');
      it.contacts.forEach(function (c) { if (c.unread) unread.push(c.nick); });
    });
    var unknown = []; items.forEach(function (it) { it.unknown.forEach(function (u) { if (unknown.indexOf(u) < 0) unknown.push(u); }); });
    var rtList = items.filter(function (it) { return it.retest; }).map(function (it) { return it.student; });
    var tuList = items.filter(function (it) { return it.tutor; }).map(function (it) { return it.student; });
    var h = '<div class="lg-box">共 ' + items.length + ' 位學生：會發給 <b>' + students + '</b> 位學生的家長，共 <b class="lg-total">' + send + '</b> 則' +
      '<br>補考／輔導：<b>' + (state.rtq === 'yes' ? '要' : '不要') + '</b>' +
      (rtList.length ? '<br><span style="color:#c62828;font-weight:bold">需補考／輔導 ' + rtList.length + ' 位</span>：' + esc(rtList.join('、')) : '') +
      (tuList.length ? '<br><span style="color:#1565c0;font-weight:bold">需輔導 ' + tuList.length + ' 位</span>：' + esc(tuList.join('、')) : '') +
      (blocked.length ? '<br><span class="lg-red">不會發（' + blocked.length + ' 位）</span>：' + esc(blocked.join('、')) : '') +
      (unknown.length ? '<br><span class="lg-red">範本裡的 [' + esc(unknown.join(']、[')) + '] 在 Excel 找不到這個欄位，請修改範本。</span>' : '') +
      (unread.length ? '<br><span class="lg-warn">⚠ 有 ' + unread.length + ' 位家長有未讀訊息：' + esc(unread.join('、')) + '（記得回覆）</span>' : '') +
      '</div><table><tr><th style="width:84px">學生</th><th>發給 ／ 訊息內容</th></tr>';
    items.forEach(function (it, ii) {
      h += '<tr><td>' + esc(it.student) + scoreTag(it) + '<div class="lg-muted">Excel 第 ' + it.row + ' 列</div></td><td>';
      if (it.block) h += '<span class="lg-red">' + esc(it.block) + '，不會發</span>';
      if (it.retest) h += '<div><span style="background:#fde7e9;color:#c62828;border-radius:10px;padding:1px 8px;font-size:12px;font-weight:bold">需補考／輔導</span></div>';
      if (it.tutor) h += '<div><span style="background:#e3f2fd;color:#1565c0;border-radius:10px;padding:1px 8px;font-size:12px;font-weight:bold">需輔導</span></div>';
      it.warn.forEach(function (w) { h += '<div class="lg-warn">⚠ ' + esc(w) + '</div>'; });
      it.contacts.forEach(function (c, ci) {
        h += '<label class="lg-c"><input type="checkbox" data-i="' + ii + '" data-c="' + ci + '"' + (c.checked ? ' checked' : '') + '> ' + esc(c.nick) +
          (c.note ? ' <span class="lg-warn">（' + esc(c.note) + '）</span>' : '') + '</label>';
      });
      if (!it.block) h += '<div class="lg-msg">' + esc(it.text) + '</div>';
      h += '</td></tr>';
    });
    h += '</table>';
    /* 待確認：名稱前面不一樣而沒勾的 LINE，看過名單後可以一次全部勾選 */
    var pend = [];
    items.forEach(function (it) { it.contacts.forEach(function (c) { if (c.pending && !c.checked) pend.push(it.student + '：' + c.nick); }); });
    if (pend.length) {
      h = '<div class="lg-box" style="border:1px solid #ffb74d;background:#fff8e1"><b class="lg-warn">待確認 ' + pend.length + ' 個 LINE</b>（名稱前面不一樣，可能不是同一家人，所以先沒勾）：' +
        '<div style="max-height:120px;overflow:auto;margin:4px 0">' + pend.map(esc).join('<br>') + '</div>' +
        '<button class="lg-btn lg-pend-all" style="background:#ef6c00;border-color:#ef6c00">我看過了，把待確認的全部勾選</button></div>' + h;
    }
    $('.lg-out').innerHTML = h;
    if (pend.length) $('.lg-pend-all').onclick = function () {
      state.items.forEach(function (it) { it.contacts.forEach(function (c) { if (c.pending) c.checked = true; }); });
      renderPreview();
      $('.lg-prog').textContent = '已把 ' + pend.length + ' 個待確認的 LINE 勾選。請再看一次，沒問題再按「開始發送」。';
    };
    $('.lg-out').querySelectorAll('input[type=checkbox]').forEach(function (cb) {
      cb.onchange = function () {
        state.items[this.dataset.i].contacts[this.dataset.c].checked = this.checked;
        var t = 0; state.items.forEach(function (it) { it.contacts.forEach(function (c) { if (c.checked) t++; }); });
        $('.lg-total').textContent = t;
      };
    });
  }

  /* ========== 發送 ==========
     安全設計：
     - 只發預覽裡「有勾選」的 LINE
     - 要輸入則數才會開始（防手滑）
     - 每則之前重新確認這個 LINE 還在、名稱裡還有學生姓名
     - 24 小時內發過一樣內容給同一個 LINE → 自動略過
     - 一則一則慢慢發（間隔約 1.5 秒），隨時可以按「停止發送」
     - 結果不確定（例如網路斷掉）時不會自動重發，請到聊天室確認 */
  if (SEND_ENABLED) {
    $('.lg-send').onclick = function () { doSend(); };
    $('.lg-stop').onclick = function () { state.stop = true; this.disabled = true; this.textContent = '停止中…（這一則發完就停）'; };
  }


  /* 發送前確認：在視窗裡輸入則數（不用瀏覽器的跳出視窗，有些瀏覽器會擋掉） */
  function askCount(text, n) {
    return new Promise(function (resolve) {
      var old = panel.querySelector('.lg-ask'); if (old) old.parentNode.removeChild(old);
      var box = document.createElement('div');
      box.className = 'lg-box lg-ask';
      box.style.cssText = 'border:2px solid #c62828;background:#fff5f5;margin:8px 0';
      box.innerHTML = '<div style="white-space:pre-wrap;font-weight:bold">' + esc(text) + '</div>' +
        '<input type="number" class="lg-ask-n" style="width:90px;font-size:18px;padding:4px;margin-top:6px;border:2px solid #c62828;border-radius:6px"> ' +
        '<button class="lg-btn lg-ask-ok" style="background:#c62828;border-color:#c62828">確定發送</button>' +
        '<button class="lg-btn lg-sec lg-ask-no">取消</button><div class="lg-red lg-ask-err"></div>';
      var anchor = $('.lg-prog'); anchor.parentNode.insertBefore(box, anchor.nextSibling);
      var inp = box.querySelector('.lg-ask-n');
      function done(v) { if (box.parentNode) box.parentNode.removeChild(box); resolve(v); }
      box.querySelector('.lg-ask-ok').onclick = function () {
        if (String(inp.value).trim() === String(n)) done(true);
        else { box.querySelector('.lg-ask-err').textContent = '數字不對，請輸入 ' + n + '（或按「取消」）。'; inp.focus(); }
      };
      box.querySelector('.lg-ask-no').onclick = function () { done(false); $('.lg-prog').textContent = '已取消，沒有發送任何訊息。'; };
      inp.onkeydown = function (e) { if (e.key === 'Enter') box.querySelector('.lg-ask-ok').click(); };
      box.scrollIntoView({ block: 'center' }); inp.focus();
    });
  }


  /* ========== 任務紀錄、保留待補發（配合官方LINE小幫手的總表；單獨使用時這些功能會自動略過） ========== */
  var OLHX = window.OLH || null;
  function remainingJobs() {
    var out = [];
    (state.items || []).forEach(function (it) { it.contacts.forEach(function (c) { if (c.resend === 'safe' || c.resend === 'unsure') out.push({ it: it, c: c }); }); });
    return out;
  }
  function updateTask(jobs, isResend) {
    if (!state.task || !OLHX) return;
    var okNow = jobs.filter(function (j) { return j.c.result === '成功'; }).length;
    if (!isResend) { state.task.ok = okNow; state.task.notOk = state.task.total - okNow; }
    else state.task.resendOk += okNow;
    state.task.fail = remainingJobs().length;
    if (!state.task.closed) state.task.status = state.limit ? '保留待補發（已達上限）' : (state.task.fail ? '未完成' : '已發完（待按結束）');
    OLHX.saveTask(state.task);
  }
  /* 把還沒發出去的訊息內容存到這台電腦（關掉分頁、換帳號都還在），之後最上面可以按「繼續發送」 */
  function keepPending(reason) {
    var jobs = remainingJobs();
    if (!OLHX || !state.task) return Promise.resolve(0);
    if (!jobs.length) { if (state.pendingId) OLHX.removePending(state.pendingId); state.pendingId = null; return Promise.resolve(0); }
    var p = { id: state.pendingId || state.task.id, tool: 'grade', task: state.task, reason: reason || '', porder: state.porder || '',
      jobs: jobs.map(function (j) {
        return { student: j.it.student, row: j.it.row, score: j.it.score, text: j.it.text, key: j.it.key || '', photos: j.it.photos || [],
          retest: !!j.it.retest, contactId: j.c.contactId, nick: j.c.nick, unsure: j.c.resend === 'unsure',
          parts: j.c.parts ? j.c.parts.map(function (x) { return { kind: x.kind, i: x.i, ok: !!(x.ok && x.seen) }; }) : null };
      }) };
    state.pendingId = p.id;
    return OLHX.savePending(p).then(function () { return jobs.length; });
  }
  /* 從最上面紅色橫幅按「繼續發送」：把保留的工作放回來，接著發 */
  if (OLHX) OLHX.resumers['grade'] = function (p) {
    if (state.busy) { alert('目前正在發送中，請等這一批發完。'); return; }
    var byKey = {}, items = [], jobs = [];
    p.jobs.forEach(function (j) {
      var k = j.student + '|' + j.text + '|' + j.key, it = byKey[k];
      if (!it) { it = byKey[k] = { student: j.student, row: j.row, score: j.score, text: j.text, key: j.key, photos: j.photos, retest: j.retest, contacts: [], warn: [], unknown: [], missing: [], block: '' }; items.push(it); }
      var c = { contactId: j.contactId, nick: j.nick, checked: true, note: j.unsure ? '上次不確定有沒有送出' : '', result: '', resend: '',
        parts: j.parts ? j.parts.map(function (x) { return { kind: x.kind, i: x.i, ok: x.ok, seen: x.ok }; }) : null };
      it.contacts.push(c); jobs.push({ it: it, c: c });
    });
    state.items = items; state.task = p.task; state.task.closed = false; state.pendingId = p.id; if (p.porder) state.porder = p.porder;
    $('.lg-task').value = p.task.name;
    panel.querySelectorAll('.lg-locked').forEach(function (s) { s.classList.remove('lg-locked'); });
    $('.lg-out').innerHTML = '<div class="lg-box" style="border:2px solid #c62828;background:#fff5f5"><b>繼續上次的工作：「' + esc(p.task.name) + '」</b>（' + esc(p.task.date + ' ' + p.task.time) + '）<br>還有 <b>' + jobs.length + '</b> 則沒發出去。按下面的確認就會接著發。</div>';
    doSend(jobs, true);
  };
  function taskButtons(need) {
    if (!OLHX || !state.task) return '';
    if (state.task.closed) return '<div class="lg-muted" style="margin-top:6px">✔ 這個任務已結束，已記到發送紀錄總表（' + esc(state.task.status) + '）。</div>';
    return need
      ? '<br><button class="lg-btn lg-sec lg-keep" style="color:#c62828;border-color:#c62828">先結束任務（保留未成功的訊息）</button>'
      : '<br><button class="lg-btn lg-endtask" style="background:#2e7d32;border-color:#2e7d32">✔ 結束此階段任務</button>';
  }
  function wireTaskButtons() {
    var end = $('.lg-endtask'), keep = $('.lg-keep');
    if (end) end.onclick = function () {
      state.task.status = '已結束'; state.task.closed = true; OLHX.saveTask(state.task);
      if (state.pendingId) { OLHX.removePending(state.pendingId); state.pendingId = null; }
      renderSendResult();
    };
    if (keep) keep.onclick = function () {
      var n = remainingJobs().length;
      var box = document.createElement('div');
      box.className = 'lg-box'; box.style.cssText = 'border:2px solid #c62828;background:#fff5f5;margin-top:6px';
      box.innerHTML = '<b>將未成功發出去的 ' + n + ' 則訊息內容，先保留至系統內。</b><br>之後打開小幫手，最上面會有「▶ 繼續發送」可以補發。<br>' +
        '<button class="lg-btn lg-keep-ok" style="background:#c62828;border-color:#c62828">確定保留並結束任務</button><button class="lg-btn lg-sec lg-keep-no">取消</button>';
      keep.parentNode.insertBefore(box, keep.nextSibling); keep.style.display = 'none';
      box.querySelector('.lg-keep-no').onclick = function () { box.parentNode.removeChild(box); keep.style.display = ''; };
      box.querySelector('.lg-keep-ok').onclick = function () {
        keepPending('先結束任務').then(function () {
          state.task.status = '保留待補發'; state.task.closed = true; OLHX.saveTask(state.task); renderSendResult();
        });
      };
    };
  }
  /* 已達 LINE 短時間上限：剩下的自動保留，跳出說明 */
  function showLimitBox(sent, left) {
    var box = document.createElement('div');
    box.className = 'lg-box'; box.style.cssText = 'border:3px solid #c62828;background:#ffebee;margin:8px 0;font-size:15px';
    box.innerHTML = '<b style="font-size:17px;color:#b71c1c">⚠ 已達短時間內可發送的訊息數量上限</b><br>' +
      '這次已發出 <b>' + sent + '</b> 則，剩下 <b>' + left + '</b> 則的內容已保留在這台電腦。<br>' +
      '換個使用者登入即可恢復發訊息功能：切換帳號後重新打開小幫手，最上面按「<b>▶ 繼續發送</b>」就會接著發。<br>' +
      '<button class="lg-btn lg-sec lg-limit-x">知道了</button>';
    $('.lg-out').insertBefore(box, $('.lg-out').firstChild);
    box.querySelector('.lg-limit-x').onclick = function () { box.parentNode.removeChild(box); };
    box.scrollIntoView({ block: 'center' });
  }

  /* resendJobs：重發時只傳入要重發的那幾則；沒傳＝發送全部有勾選的 */
  async function doSend(resendJobs, resuming) {
    if (state.busy || !state.items) return;
    var jobs = [];
    if (resendJobs) jobs = resendJobs;
    else state.items.forEach(function (it) {
      if (it.block) return;
      it.contacts.forEach(function (c) { if (c.checked) jobs.push({ it: it, c: c }); });
    });
    if (!jobs.length) { alert('沒有勾選任何要發送的 LINE。'); return; }
    var names = {}; jobs.forEach(function (j) { names[j.it.student] = 1; });
    var nStudents = Object.keys(names).length;
    var nRt = 0, nTu = 0; Object.keys(names).length && jobs.forEach(function (j) { if (j.it.retest) names[j.it.student] |= 2; if (j.it.tutor) names[j.it.student] |= 4; });
    Object.keys(names).forEach(function (k) { if (names[k] & 2) nRt++; if (names[k] & 4) nTu++; });
    var hourWarn = '';
    if (OLHX) {
      var hc = OLHX.hourCount();
      if (hc + jobs.length > OLHX.HOUR_LIMIT) hourWarn = '⚠ 提醒：這台電腦 1 小時內已發 ' + hc + ' 個聊天室，這次再發 ' + jobs.length + ' 個，可能超過 LINE「1 小時 200 個聊天室」的上限。' +
        '發到一半被擋的話，剩下的會自動保留，之後可以接著發。\n\n';
    }
    var ans = await askCount(hourWarn + '帳號：' + $('.lg-bot').textContent + '\n即將' + (resuming ? '繼續發送' : resendJobs ? '重發' : '發送') + ' ' + jobs.length + ' 則訊息，給 ' + nStudents + ' 位學生的家長。\n' +
      '補考／輔導：' + (state.rtq === 'yes' ? '要（' + nRt + ' 位）' : '不要') + '\n送出後無法收回。\n\n請在下面輸入數字 ' + jobs.length + ' 確認：', jobs.length);
    if (!ans) return;
    if (OLHX && (!resendJobs || !state.task || state.task.closed)) {
      if (!resendJobs) { state.task = OLHX.newTask('成績', $('.lg-task').value.trim() || '（未命名）', jobs.length); state.pendingId = null; }
      else if (state.task) state.task.closed = false;
    }
    state.limit = false;

    state.busy = true; state.stop = false;
    panel.querySelectorAll('button.lg-btn').forEach(function (b) { b.disabled = true; });
    panel.querySelectorAll('.lg-out input[type=checkbox]').forEach(function (b) { b.disabled = true; });
    var stopBtn = $('.lg-stop'); stopBtn.style.display = 'inline-block'; stopBtn.disabled = false; stopBtn.textContent = '停止發送';

    /* 進度框：放在結果區最上面（按下面的「重發」時也看得到），有自己的停止按鈕 */
    var out = $('.lg-out'), sb = document.createElement('div');
    sb.className = 'lg-sendbox';
    sb.innerHTML = '<b class="lg-sb-t"></b><div class="lg-bar"><i></i><span></span></div><div class="lg-sb-s lg-muted"></div>' +
      '<button class="lg-btn lg-sec lg-sb-stop" style="color:#c62828;border-color:#c62828">停止發送</button>';
    out.insertBefore(sb, out.firstChild);
    sb.scrollIntoView({ block: 'nearest' });
    sb.querySelector('.lg-sb-stop').onclick = function () { stopBtn.onclick.call(stopBtn); this.disabled = true; this.textContent = '停止中…（這一則發完就停）'; };
    state.sbar = function (title, i, n, sub) {
      var p = n ? Math.round(i / n * 100) : 0;
      sb.querySelector('.lg-sb-t').textContent = title;
      sb.querySelector('.lg-bar i').style.width = p + '%';
      sb.querySelector('.lg-bar span').textContent = p + '%（' + i + ' / ' + n + '）';
      sb.querySelector('.lg-sb-s').textContent = sub || '';
      $('.lg-prog').textContent = title + ' ' + i + ' / ' + n + (sub ? '：' + sub : '');
    };
    var label = resendJobs ? '重發中' : '發送中';
    state.sbar(label, 0, jobs.length, '準備中…');

    var done = 0, byStudent = {}, gap = 1500, WAITS = [15000];
    jobs.forEach(function (j) { j.c.result = ''; j.c.resend = ''; j.c.sendId = null; j.c.verify = ''; });
    for (var i = 0; i < jobs.length; i++) {
      var job = jobs[i], it = job.it, c = job.c;
      if (state.limit) { c.result = '未發送：已達短時間上限（已保留）'; c.resend = 'safe'; continue; }
      if (state.stop) { c.result = '已停止（沒發）'; c.resend = 'safe'; continue; }
      state.sbar(label, i, jobs.length, '正在發：' + it.student + ' → ' + c.nick);
      try {
        if (!byStudent[it.student]) {
          byStudent[it.student] = {};
          (await searchContacts(it.student)).forEach(function (x) { byStudent[it.student][x.contactId] = displayName(x); });
        }
        var nowNick = byStudent[it.student][c.contactId];
        if (!nowNick || nowNick.indexOf(it.student) < 0) { c.result = '失敗：找不到這個 LINE（沒發）'; continue; }
        if (alreadySent(c.contactId, it.text)) { c.result = '略過：24 小時內已發過一樣的內容'; continue; }
        c.sendId = newSendId(); c.sentAt = Date.now();
        var st = await sendText(c.contactId, it.text, c.sendId), tries = 0;
        /* LINE 說太快（429＝確定沒送出）：等 15、30、60 秒再試，之後放慢成每 3 秒一則 */
        while (st === 429 && tries < WAITS.length && !state.stop) {
          gap = 3000;
          state.sbar(label, i, jobs.length, 'LINE 說發太快了，等 ' + (WAITS[tries] / 1000) + ' 秒再試一次…');
          await sleep(WAITS[tries]); tries++;
          c.sendId = newSendId(); c.sentAt = Date.now();
          st = await sendText(c.contactId, it.text, c.sendId);
        }
        if (st >= 200 && st < 300) { c.result = '成功'; markSent(c.contactId, it.text); done++; if (OLHX) OLHX.noteSent(c.contactId); }
        else if (st === 429) { c.result = '未發送：已達短時間上限（已保留）'; c.resend = 'safe'; c.sendId = null; state.limit = true; }
        else { c.result = '失敗（代碼 ' + st + '），請到聊天室確認有沒有送出'; c.resend = 'unsure'; }
      } catch (e) {
        c.result = '失敗（連線錯誤），請到聊天室確認有沒有送出'; c.resend = 'unsure';
      }
      await sleep(gap);
    }
    state.sbar(label, jobs.length, jobs.length, state.stop ? '已停止' : '發送完畢，接著到聊天室確認送達…');
    sb.querySelector('.lg-sb-stop').style.display = 'none';
    stopBtn.style.display = 'none';
    await verifySent(jobs);
    $('.lg-preview').disabled = false;
    state.busy = false;
    updateTask(jobs, !!resendJobs);
    var limitHit = state.limit && OLHX;
    if (limitHit) { await keepPending('已達短時間內可發送的訊息數量上限'); state.task.status = '保留待補發（已達上限）'; state.task.closed = true; OLHX.saveTask(state.task); }
    var okN = jobs.filter(function (j) { return j.c.result === '成功'; }).length;
    var vN = jobs.filter(function (j) { return j.c.verify === 'ok'; }).length;
    $('.lg-prog').textContent = (state.stop ? '已停止。' : (resendJobs ? '重發完成。' : '發送完成。')) + '這次成功 ' + okN + ' 則，其中 ' + vN + ' 則已在聊天室確認。';
    renderSendResult();
    if (limitHit) showLimitBox(jobs.filter(function (j) { return j.c.result === '成功'; }).length, remainingJobs().length);
    else if (resuming && OLHX) keepPending(state.task.status);
  }

  /* 發完之後到每個聊天室確認真的有這則訊息：
     - 「成功」的：找到＝✔ 已確認；找不到（等 2、5、15 秒各查一次都沒有）＝改成失敗，可以重發
     - 「不確定」的（連線錯誤等）：找到＝改成成功；找不到＝確定沒送出，可以重發 */
  async function verifySent(jobs) {
    var todo = jobs.filter(function (j) { return j.c.sendId && (j.c.result === '成功' || j.c.resend === 'unsure'); });
    var waits = [2000, 5000, 15000];
    for (var round = 0; round < waits.length && todo.length; round++) {
      state.sbar('送達確認' + (round ? '（第 ' + (round + 1) + ' 次）' : ''), 0, todo.length, '等 ' + (waits[round] / 1000) + ' 秒後到聊天室檢查…');
      await sleep(waits[round]);
      var left = [];
      for (var i = 0; i < todo.length; i++) {
        var j = todo[i], c = j.c;
        state.sbar('送達確認' + (round ? '（第 ' + (round + 1) + ' 次）' : ''), i + 1, todo.length, j.it.student + ' → ' + c.nick);
        var found = await inChat(c.contactId, c.sendId, j.it.text, c.sentAt);
        if (found === null) c.verify = 'error';
        else if (found) {
          c.verify = 'ok';
          if (c.result !== '成功') { c.result = '成功'; c.resend = ''; markSent(c.contactId, j.it.text); }
        } else left.push(j);
        await sleep(150);
      }
      todo = left;
    }
    todo.forEach(function (j) {
      j.c.verify = 'missing'; j.c.result = '失敗：聊天室裡找不到這則訊息（沒送出），可以按下面「重發」'; j.c.resend = 'safe';
      unmarkSent(j.c.contactId, j.it.text);
    });
  }

  function renderSendResult() {
    var items = state.items, ok = 0, verified = 0, fail = [], stopped = 0, skipped = [], notFound = [], unchecked = [], lines = ['學生\t發給\t結果'];
    var h = '<table><tr><th style="width:84px">學生</th><th>發給</th><th style="width:38%">結果</th></tr>';
    items.forEach(function (it) {
      var sent = it.contacts.filter(function (c) { return c.result; });
      if (it.block) { notFound.push(it.student + '（' + it.block + '）'); return; }
      if (!sent.length) { unchecked.push(it.student); return; }
      sent.forEach(function (c, k) {
        var cls = c.result === '成功' ? 'color:#2e7d32;font-weight:bold' : (c.result.indexOf('略過') === 0 || c.result.indexOf('已停止') === 0 ? 'color:#e65100' : 'color:#c62828;font-weight:bold');
        if (c.result === '成功') ok++;
        else if (c.result.indexOf('已停止') === 0) stopped++;
        else if (c.result.indexOf('略過') === 0) skipped.push(it.student + '：' + c.nick);
        else fail.push(it.student + '：' + c.nick + '（' + c.result + '）');
        var vmark = c.verify === 'ok' ? '（✔ 已在聊天室確認）' : (c.verify === 'error' && c.result === '成功' ? '（無法確認，請到聊天室看一下）' : '');
        if (c.verify === 'ok') verified++;
        h += '<tr><td>' + (k ? '' : esc(it.student) + scoreTag(it)) + '</td><td>' + esc(c.nick) + '</td><td style="' + cls + '">' + esc(c.result) +
          (vmark ? '<div style="font-weight:normal;font-size:12px">' + esc(vmark) + '</div>' : '') + '</td></tr>';
        lines.push(it.student + '\t' + c.nick + '\t' + c.result + vmark);
      });
    });
    h += '</table>';
    var box = '<div class="lg-box"><b>發送結果</b>：成功 <b style="color:#2e7d32">' + ok + '</b> 則（其中 <b style="color:#2e7d32">' + verified + '</b> 則已在聊天室確認送達）' +
      (fail.length ? '，<span class="lg-red">失敗 ' + fail.length + ' 則</span>' : '') +
      (stopped ? '，<span class="lg-warn">停止沒發 ' + stopped + ' 則</span>' : '') +
      (skipped.length ? '，<span class="lg-warn">略過 ' + skipped.length + ' 則</span>' : '') + '</div>';
    var miss = '<h4 style="margin:14px 0 4px">漏發檢查</h4>';
    if (!fail.length && !stopped && !notFound.length && !unchecked.length) miss += '<div class="lg-box" style="color:#2e7d32">✔ 名單上每一位學生的家長都發到了。</div>';
    if (notFound.length) miss += '<div class="lg-box"><span class="lg-red">沒發到：找不到 LINE（' + notFound.length + ' 位）</span><br>' + esc(notFound.join('、')) + '</div>';
    if (unchecked.length) miss += '<div class="lg-box"><span class="lg-warn">沒發到：有 LINE 但沒勾選（' + unchecked.length + ' 位）</span><br>' + esc(unchecked.join('、')) + '</div>';
    if (fail.length) miss += '<div class="lg-box"><span class="lg-red">發送失敗（' + fail.length + ' 則）</span><br>' + fail.map(esc).join('<br>') + '</div>';
    if (stopped) miss += '<div class="lg-box"><span class="lg-warn">按了停止，還有 ' + stopped + ' 則沒發</span>。可以按下面「重發」。</div>';
    /* 重發：safe＝確定沒送出（LINE 擋下、按了停止）；unsure＝不確定有沒有送出，要先到聊天室確認 */
    var safeJobs = [], unsureJobs = [];
    items.forEach(function (it) { it.contacts.forEach(function (c) {
      if (c.resend === 'safe') safeJobs.push({ it: it, c: c });
      else if (c.resend === 'unsure') unsureJobs.push({ it: it, c: c });
    }); });
    var rs = '';
    if (safeJobs.length) rs += '<button class="lg-btn lg-resend-safe" style="background:#c62828;border-color:#c62828">重發沒送出的 ' + safeJobs.length + ' 則</button>';
    if (unsureJobs.length) rs += '<div class="lg-box" style="margin-top:8px"><span class="lg-warn">有 ' + unsureJobs.length + ' 則不確定有沒有送出</span>：請先到聊天室看家長有沒有收到。確認<b>沒收到</b>再按：<br>' +
      '<button class="lg-btn lg-sec lg-resend-unsure" style="color:#c62828;border-color:#c62828">我確認過沒收到，重發這 ' + unsureJobs.length + ' 則</button></div>';
    lines.push('', '沒發到（找不到 LINE）：' + (notFound.join('、') || '無'), '沒發到（沒勾選）：' + (unchecked.join('、') || '無'), '發送失敗：' + (fail.join('；') || '無'));
    /* 最上面的大橫幅：全部完成（綠）或還沒完成（紅，附重發按鈕） */
    var need = fail.length + stopped, notSent = notFound.length + unchecked.length;
    var banner = need
      ? '<div class="lg-done lg-done-bad">⚠ 還沒全部完成：有 ' + need + ' 則沒有確定送出' +
        (safeJobs.length ? '<br><button class="lg-btn lg-resend-safe2" style="background:#c62828;border-color:#c62828">重發沒送出的 ' + safeJobs.length + ' 則</button>' : '') +
        (unsureJobs.length ? '<div style="font-size:13px;font-weight:normal">另有 ' + unsureJobs.length + ' 則不確定，請看最下面。</div>' : '') + taskButtons(true) + '</div>'
      : '<div class="lg-done lg-done-ok">✔ 全部完成：' + ok + ' 則都已送出' + (ok && verified === ok ? '，也都在聊天室確認了' : '（其中 ' + verified + ' 則已在聊天室確認）') + taskButtons(false) + '</div>';
    if (notSent) banner += '<div class="lg-box lg-warn">另有 ' + notSent + ' 位學生沒有發（找不到 LINE 或沒勾選），請看下面「漏發檢查」。</div>';
    $('.lg-out').innerHTML = banner + box + h + miss + (rs ? '<div style="margin:8px 0">' + rs + '</div>' : '') + '<button class="lg-btn lg-sec lg-copy">複製結果（可貼到 Excel）</button>';
    if (safeJobs.length) $('.lg-resend-safe').onclick = $('.lg-resend-safe2').onclick = function () { doSend(safeJobs); };
    $('.lg-out').firstChild.scrollIntoView({ block: 'nearest' });
    wireTaskButtons();
    if (unsureJobs.length) $('.lg-resend-unsure').onclick = function () { doSend(unsureJobs); };
    $('.lg-copy').onclick = function () {
      var text = '帳號：' + $('.lg-bot').textContent + '\n' + lines.join('\n');
      navigator.clipboard.writeText(text).then(function () { alert('已複製！'); }, function () { prompt('請手動複製：', text); });
    };
  }

  window.LineGrades = { botId: botId, toTable: toTable, parseText: parseText, render: render, preview: preview, SEND_ENABLED: SEND_ENABLED };
})();

})(mount('grade'));

  var first = load(TAB_KEY);
  showTab(TABS.some(function (t) { return t.key === first; }) ? first : TABS[0].key);
  refreshPending(); OLH.sync();
})();
