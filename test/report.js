/*
  官方LINE小幫手：每日發送報告
  在 chat.line.biz（高群）頁面執行。先設定 window.__olhReport = { url, key, to: [聯絡人 id…], date?: 'YYYY/MM/DD', dryRun?: true, courses?: [...] }。
  courses：今日課程（today_courses.py 從課表算出來的 JSON），報告會多一張「今日課程｜小考成績 已發送／未發送」表。
  1. 從 Google 試算表讀當天的發送紀錄（只有總數，沒有家長資料）
  2. 畫一張重點圖（畫在網頁裡，不用存檔）
  3. 用聊天室發給指定的人：先文字，再圖；發完到聊天室確認送達
  dryRun：只畫圖、不發送，把圖顯示在頁面上給人看。
  second：第二次檢測（每晚 22:30）。只列上一次報告之後新的任務；沒有新紀錄就不發。今日課程小考成績表一樣列全部。
  結果放在 window.__olhReportResult。
*/
(async function () {
  var cfg = window.__olhReport || {};
  var res = window.__olhReportResult = { ok: false, step: 'start' };
  try {
    var botId = location.pathname.split('/')[1];
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var now = new Date(), date = cfg.date || (now.getFullYear() + '/' + pad(now.getMonth() + 1) + '/' + pad(now.getDate()));
    var p = date.split('/'), dt = new Date(+p[0], +p[1] - 1, +p[2]);
    var dateLabel = (+p[1]) + '/' + (+p[2]) + '(' + '日一二三四五六'.charAt(dt.getDay()) + ')';

    /* 1. 讀資料 */
    res.step = 'fetch';
    var j = cfg.fakeRows ? {} : await (await fetch(cfg.url + '?key=' + encodeURIComponent(cfg.key) + '&date=' + encodeURIComponent(date))).json();
    if (j.error) throw new Error('試算表讀取失敗：' + j.error);
    var rows = (cfg.fakeRows || j.rows || []).filter(function (r) { return r['狀態'] !== '測試'; });
    var num = function (v) { return parseInt(v, 10) || 0; };
    var tasks = rows.map(function (r) {
      return { name: r['名稱'], type: r['訊息'], bot: r['帳號'], pc: r['主機'], total: num(r['訊息數']),
        ok: num(r['發送成功']) + num(r['補發成功']), fail: num(r['未成功']), status: r['狀態'], time: r['時間'],
        upd: r['最後更新'] || ((r['日期'] || date) + ' ' + (r['時間'] || '')) };
    });
    /* 換帳號「繼續發送」會在試算表多一筆新紀錄（同名稱、同帳號、同則數），舊的那筆還留著「未成功」。
       有未成功的舊紀錄，如果後面有比較新的同一個任務，就只算新的那筆（不重複算、也不會誤報未發完）。 */
    tasks = tasks.filter(function (t) {
      if (!(t.fail > 0)) return true;
      return !tasks.some(function (u) { return u !== t && u.name === t.name && u.bot === t.bot && u.total === t.total && (u.upd || '') > (t.upd || ''); });
    });

    /* 今日課程的小考成績有沒有發：cfg.courses 由 today_courses.py 從課表算出來 [{label, cls}]。
       當天「成績」任務對到這一班就算已發送；有未成功的算「未發完」。
       對法：任務名稱裡有完整班別（國二理化公校班）最準；
       名稱比較短時（例如「國二理化小考成績」→ 國二理化），對到班別開頭是它的班；同時對到好幾班時，
       名稱有「輔導」就算輔導課、沒有就算正課。 */
    /* 比對前先統一寫法：拿掉「(上)」「（下）」和空白；「數學超前資優／數學超前／數超」都當成「數資」
       （課表寫「數學超前A」、任務常寫「國一數資A班」；任務常寫「高二(上)桃高化學」） */
    var norm = function (s) {
      return String(s || '').replace(/[（(][上下][）)]/g, '').replace(/\s+/g, '')
        .replace(/數學超前資優|數學超前|數超/g, '數資');
    };
    var cList = (cfg.courses || []).map(function (c) { return { label: norm(c.label), cls: c.cls ? norm(c.cls) : c.cls, show: c.label, hits: [] }; });
    tasks.filter(function (t) { return t.type === '成績'; }).forEach(function (t) {
      var name = norm(t.name), isTu = /輔導/.test(name);
      var hit = cList.filter(function (c) { return [c.cls, c.label].some(function (k) { return k && name.indexOf(k) >= 0; }); });
      if (!hit.length) {
        var core = name.replace(/[（(].*$/, '').replace(/(小考)?成績$|小考$/, '').replace(/班$/, '').trim();
        if (core.length >= 3) {
          hit = cList.filter(function (c) { return [c.cls, c.label].some(function (k) { return k && k.indexOf(core) === 0; }); });
          /* 再對不到：同年級＋同科目（「高一化學」→ 高一必修化學） */
          if (!hit.length) {
            var gr = core.slice(0, 2), subj = core.slice(2);
            if (subj.length >= 2) hit = cList.filter(function (c) { return [c.cls, c.label].some(function (k) { return k && k.indexOf(gr) === 0 && k.indexOf(subj, 2) >= 0; }); });
          }
          var pref = hit.filter(function (c) { return /輔導/.test(c.cls || c.label) === isTu; });
          if (pref.length) hit = pref;
        }
      }
      hit.forEach(function (c) { c.hits.push(t); });
    });
    var courses = cList.map(function (c) {
      var st = !c.hits.length ? '未發送' : (c.hits.some(function (t) { return t.fail > 0; }) ? '未發完' : '已發送');
      return { label: c.show, status: st };
    });

    /* 第二次檢測（cfg.second）：只看上一次報告之後「新的紀錄」（開始或最後更新在那之後的任務）。
       上一次報告的時間：到 cfg.to[0] 的聊天室找今天最後一則報告訊息；找不到用 21:00。cfg.since（'HH:MM'）可以直接指定。
       沒有新紀錄就不發（res.skipped = true）。今日課程小考成績表一樣用「今天全部」的任務算。 */
    var HEAD1 = '📊 官方LINE小幫手 每日發送報告｜' + dateLabel, HEAD2 = '🔁 官方LINE小幫手 第二次檢測｜' + dateLabel;
    if (cfg.second) {
      var since = cfg.since || '';
      if (!since && cfg.to && cfg.to[0]) {
        try {
          var hist = ((await (await fetch('/api/v3/bots/' + botId + '/chats/' + cfg.to[0] + '/messages?limit=50', { credentials: 'same-origin' })).json()).list || []);
          var last = 0;
          hist.forEach(function (m) {
            var tx = m.type === 'messageSent' && m.message && m.message.text || '';
            if ((tx.indexOf(HEAD1) === 0 || tx.indexOf(HEAD2) === 0) && m.timestamp > last) last = m.timestamp;
          });
          if (last) { var ld = new Date(last); since = pad(ld.getHours()) + ':' + pad(ld.getMinutes()); }
        } catch (e) { }
      }
      since = since || '21:00';
      res.since = since;
      var cut = date + ' ' + since;
      tasks = tasks.filter(function (t) { return (t.upd || '') > cut; });
      if (!tasks.length) { res.ok = true; res.skipped = true; res.step = 'done'; res.text = '（' + since + ' 之後沒有新紀錄，不用發）'; return; }
    }
    var sum = tasks.reduce(function (a, t) { a.total += t.total; a.ok += t.ok; a.fail += t.fail; return a; }, { total: 0, ok: 0, fail: 0 });
    var rate = sum.total ? Math.round(sum.ok / sum.total * 1000) / 10 : 0;
    var pending = tasks.filter(function (t) { return t.fail > 0; });
    var byType = {}; tasks.forEach(function (t) { byType[t.type] = (byType[t.type] || 0) + 1; });

    /* 2. 文字重點 */
    var text = (cfg.second ? HEAD2 + '\n' + since + ' 報告之後新的紀錄：\n' : HEAD1 + '\n');
    if (!tasks.length) text += '今天沒有發送紀錄。';
    else {
      text += '任務 ' + tasks.length + ' 個（' + Object.keys(byType).map(function (k) { return k + ' ' + byType[k]; }).join('、') + '）\n' +
        '訊息 ' + sum.total + ' 則｜成功 ' + sum.ok + ' 則（' + rate + '%）\n';
      text += pending.length
        ? '⚠ 還有 ' + sum.fail + ' 則沒發出去：\n' + pending.map(function (t) { return '・' + t.name + '（' + t.bot + '，' + t.fail + ' 則）'; }).join('\n') + '\n請到小幫手最上面按「▶ 繼續發送」補發。'
        : '✅ 全部都已送達。';
    }
    if (courses.length) {
      var ICON = { '已發送': '✅', '未發完': '⚠', '未發送': '❌' };
      text += '\n\n📝 今日課程小考成績：\n' + courses.map(function (c) { return ICON[c.status] + ' ' + c.label + '：' + c.status; }).join('\n');
    }
    if (cfg.testLabel) text = '【測試，請忽略：以下是假資料】\n' + text;
    res.text = text;

    /* 3. 重點圖（沒有紀錄就不畫） */
    var blob = null;
    if (tasks.length || courses.length) {
      res.step = 'draw';
      var COLS = 4, cellH = 64, blocks = Math.ceil(courses.length / COLS);
      var tblH = courses.length ? 70 + blocks * (cellH * 2 + 24) : 0;
      var W = 1080, rowH = 64, list = tasks.slice(0, 12);
      var H = (tasks.length ? 430 + list.length * rowH + (tasks.length > 12 ? 40 : 0) + 70 : 160) + tblH;
      var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      var g = cv.getContext('2d'), F = '"Microsoft JhengHei","PingFang TC",sans-serif';
      g.fillStyle = '#f5f7f8'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#06c755'; g.fillRect(0, 0, W, 130);
      g.fillStyle = '#fff'; g.font = 'bold 46px ' + F; g.fillText((cfg.second ? '第二次檢測' : '每日發送報告') + (cfg.testLabel ? '（測試・假資料）' : ''), 50, 75);
      g.font = '28px ' + F; g.fillText(dateLabel + '　官方LINE小幫手' + (cfg.second ? '　' + since + ' 報告之後新的紀錄' : ''), 52, 115);
      var ty = 160;   /* 小考成績表格從這裡開始畫 */
      if (tasks.length) {
      var cards = [['任務', tasks.length + ' 個', '#1565c0'], ['訊息', sum.total + ' 則', '#6a1b9a'], ['成功率', rate + '%', '#2e7d32'], ['未成功', sum.fail + ' 則', sum.fail ? '#c62828' : '#2e7d32']];
      cards.forEach(function (c, i) {
        var x = 40 + i * 255, y = 160;
        g.fillStyle = '#fff'; g.fillRect(x, y, 235, 150);
        g.fillStyle = c[2]; g.fillRect(x, y, 235, 8);
        g.fillStyle = '#555'; g.font = '28px ' + F; g.fillText(c[0], x + 22, y + 55);
        g.fillStyle = c[2]; g.font = 'bold 50px ' + F; g.fillText(c[1], x + 22, y + 120);
      });
      g.fillStyle = '#222'; g.font = 'bold 32px ' + F; g.fillText((cfg.second ? '新的任務' : '各任務') + '（綠＝成功、紅＝未成功）', 40, 370);
      var maxT = Math.max.apply(null, list.map(function (t) { return t.total; }).concat([1]));
      list.forEach(function (t, i) {
        var y = 400 + i * rowH, barX = 400, barW = 480;
        g.fillStyle = '#222'; g.font = '26px ' + F;
        var label = t.name.length > 13 ? t.name.slice(0, 12) + '…' : t.name;
        g.fillText(label, 40, y + 38);
        g.fillStyle = '#888'; g.font = '20px ' + F; g.fillText(t.type + '・' + t.bot.replace('文理補習班', ''), 40, y + 60);
        var wOk = Math.round(barW * t.ok / maxT), wF = Math.round(barW * t.fail / maxT);
        g.fillStyle = '#e0e0e0'; g.fillRect(barX, y + 14, barW, 30);
        g.fillStyle = '#43a047'; g.fillRect(barX, y + 14, wOk, 30);
        g.fillStyle = '#e53935'; g.fillRect(barX + wOk, y + 14, wF, 30);
        g.fillStyle = t.fail ? '#c62828' : '#2e7d32'; g.font = 'bold 24px ' + F;
        g.fillText(t.ok + '/' + t.total + (t.fail ? '　⚠' + t.fail : ''), barX + barW + 14, y + 38);
      });
      var fy = 400 + list.length * rowH + 20;
      g.fillStyle = '#777'; g.font = '22px ' + F;
      if (tasks.length > 12) { g.fillText('另有 ' + (tasks.length - 12) + ' 個任務，請看試算表。', 40, fy); fy += 40; }
      g.fillText(pending.length ? '⚠ 未成功的請到小幫手最上面按「▶ 繼續發送」補發。' : '✅ 今天的訊息都已送達。', 40, fy + 10);
      ty = fy + 50;
      }
      /* 今日課程 × 小考成績 表格（像：今日課程｜國一英文｜國二數學…／小考成績｜已發送｜未發送…），一列最多 4 班 */
      if (courses.length) {
        g.fillStyle = '#222'; g.font = 'bold 32px ' + F; g.fillText('今日課程小考成績', 40, ty + 40);
        var COLOR = { '已發送': '#2e7d32', '未發完': '#ef6c00', '未發送': '#c62828' };
        var headW = 170, cw = Math.floor((W - 80 - headW) / COLS);
        for (var b = 0; b < blocks; b++) {
          var y0 = ty + 70 + b * (cellH * 2 + 24), part = courses.slice(b * COLS, b * COLS + COLS);
          var cellsW = headW + part.length * cw;
          g.fillStyle = '#fff'; g.fillRect(40, y0, cellsW, cellH * 2);
          g.fillStyle = '#e8f5e9'; g.fillRect(40, y0, headW, cellH * 2);
          g.strokeStyle = '#bbb'; g.lineWidth = 2;
          g.strokeRect(40, y0, cellsW, cellH * 2);
          g.beginPath(); g.moveTo(40, y0 + cellH); g.lineTo(40 + cellsW, y0 + cellH);
          for (var cI = 0; cI <= part.length; cI++) { var x = 40 + headW + cI * cw; g.moveTo(x, y0); g.lineTo(x, y0 + cellH * 2); }
          g.stroke();
          g.fillStyle = '#222'; g.font = 'bold 26px ' + F;
          g.fillText('今日課程', 58, y0 + 42); g.fillText('小考成績', 58, y0 + cellH + 42);
          part.forEach(function (c, i) {
            var x = 40 + headW + i * cw, lab = c.label, fs = 26;
            g.font = fs + 'px ' + F;
            while (fs > 16 && g.measureText(lab).width > cw - 16) { fs -= 2; g.font = fs + 'px ' + F; }
            g.fillStyle = '#222'; g.fillText(lab, x + (cw - g.measureText(lab).width) / 2, y0 + 42);
            g.fillStyle = COLOR[c.status]; g.font = 'bold 26px ' + F;
            g.fillText(c.status, x + (cw - g.measureText(c.status).width) / 2, y0 + cellH + 42);
          });
        }
      }
      blob = await new Promise(function (r) { cv.toBlob(r, 'image/png'); });
      res.imageBytes = blob.size;
      if (cfg.dryRun) {
        var old = document.getElementById('olh-report-preview'); if (old) old.remove();
        var wrap = document.createElement('div'); wrap.id = 'olh-report-preview';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:2147483600;background:#333;overflow:auto;padding:20px;text-align:center';
        var img = new Image(); img.src = cv.toDataURL('image/png'); img.style.cssText = 'max-width:520px;width:100%;background:#fff';
        wrap.appendChild(img); wrap.onclick = function () { wrap.remove(); }; document.body.appendChild(wrap);
      }
    }
    if (cfg.dryRun) { res.ok = true; res.step = 'dry-run'; return; }

    /* 4. 發送：每個人先文字、再圖 */
    res.step = 'send';
    var csrf = await (await fetch('/api/v1/csrfToken', { credentials: 'same-origin' })).json();
    var hdr = function (json) { var h = { 'Accept': 'application/json' }; if (json) h['Content-Type'] = 'application/json'; h[csrf.headerName] = csrf.token; return h; };
    var uuid = function () { return crypto.randomUUID(); };
    res.sent = [];
    for (var i = 0; i < (cfg.to || []).length; i++) {
      var id = cfg.to[i], r1 = { to: id, text: 0, image: null, ids: [] };
      var sid = uuid(); r1.ids.push(sid);
      r1.text = (await fetch('/api/v1/bots/' + botId + '/chats/' + id + '/messages/send', { method: 'POST', credentials: 'same-origin', headers: hdr(true),
        body: JSON.stringify({ type: 'text', text: text, sendId: sid }) })).status;
      if (blob) {
        await new Promise(function (r) { setTimeout(r, 800); });
        var fd = new FormData(), sid2 = uuid(); r1.ids.push(sid2);
        fd.append('file', new File([blob], (cfg.second ? '第二次檢測_' : '每日發送報告_') + date.replace(/\//g, '') + '.png', { type: 'image/png' })); fd.append('sendId', sid2);
        r1.image = (await fetch('/api/v1/bots/' + botId + '/chats/' + id + '/messages/sendFile', { method: 'POST', credentials: 'same-origin', headers: hdr(false), body: fd })).status;
      }
      res.sent.push(r1);
      await new Promise(function (r) { setTimeout(r, 1200); });
    }

    /* 5. 送達確認 */
    res.step = 'verify';
    await new Promise(function (r) { setTimeout(r, 4000); });
    for (var k = 0; k < res.sent.length; k++) {
      var s = res.sent[k];
      var list2 = ((await (await fetch('/api/v3/bots/' + botId + '/chats/' + s.to + '/messages?limit=20', { credentials: 'same-origin' })).json()).list || []);
      s.delivered = s.ids.every(function (x) { return list2.some(function (m) { return m.sendId === x; }); });
    }
    res.ok = res.sent.length > 0 && res.sent.every(function (s) { return s.delivered; });
    res.step = 'done';
  } catch (e) {
    res.error = String(e && e.message || e);
  }
})();
