/*
  官方LINE小幫手：每日發送報告
  在 chat.line.biz（高群）頁面執行。先設定 window.__olhReport = { url, key, to: [聯絡人 id…], date?: 'YYYY/MM/DD', dryRun?: true }。
  1. 從 Google 試算表讀當天的發送紀錄（只有總數，沒有家長資料）
  2. 畫一張重點圖（畫在網頁裡，不用存檔）
  3. 用聊天室發給指定的人：先文字，再圖；發完到聊天室確認送達
  dryRun：只畫圖、不發送，把圖顯示在頁面上給人看。
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
        ok: num(r['發送成功']) + num(r['補發成功']), fail: num(r['未成功']), status: r['狀態'], time: r['時間'] };
    });
    var sum = tasks.reduce(function (a, t) { a.total += t.total; a.ok += t.ok; a.fail += t.fail; return a; }, { total: 0, ok: 0, fail: 0 });
    var rate = sum.total ? Math.round(sum.ok / sum.total * 1000) / 10 : 0;
    var pending = tasks.filter(function (t) { return t.fail > 0; });
    var byType = {}; tasks.forEach(function (t) { byType[t.type] = (byType[t.type] || 0) + 1; });

    /* 2. 文字重點 */
    var text = '📊 官方LINE小幫手 每日發送報告｜' + dateLabel + '\n';
    if (!tasks.length) text += '今天沒有發送紀錄。';
    else {
      text += '任務 ' + tasks.length + ' 個（' + Object.keys(byType).map(function (k) { return k + ' ' + byType[k]; }).join('、') + '）\n' +
        '訊息 ' + sum.total + ' 則｜成功 ' + sum.ok + ' 則（' + rate + '%）\n';
      text += pending.length
        ? '⚠ 還有 ' + sum.fail + ' 則沒發出去：\n' + pending.map(function (t) { return '・' + t.name + '（' + t.bot + '，' + t.fail + ' 則）'; }).join('\n') + '\n請到小幫手最上面按「▶ 繼續發送」補發。'
        : '✅ 全部都已送達。';
    }
    res.text = text;

    /* 3. 重點圖（沒有紀錄就不畫） */
    var blob = null;
    if (tasks.length) {
      res.step = 'draw';
      var W = 1080, rowH = 64, list = tasks.slice(0, 12), H = 430 + list.length * rowH + (tasks.length > 12 ? 40 : 0) + 70;
      var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      var g = cv.getContext('2d'), F = '"Microsoft JhengHei","PingFang TC",sans-serif';
      g.fillStyle = '#f5f7f8'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#06c755'; g.fillRect(0, 0, W, 130);
      g.fillStyle = '#fff'; g.font = 'bold 46px ' + F; g.fillText('每日發送報告', 50, 75);
      g.font = '28px ' + F; g.fillText(dateLabel + '　官方LINE小幫手', 52, 115);
      var cards = [['任務', tasks.length + ' 個', '#1565c0'], ['訊息', sum.total + ' 則', '#6a1b9a'], ['成功率', rate + '%', '#2e7d32'], ['未成功', sum.fail + ' 則', sum.fail ? '#c62828' : '#2e7d32']];
      cards.forEach(function (c, i) {
        var x = 40 + i * 255, y = 160;
        g.fillStyle = '#fff'; g.fillRect(x, y, 235, 150);
        g.fillStyle = c[2]; g.fillRect(x, y, 235, 8);
        g.fillStyle = '#555'; g.font = '28px ' + F; g.fillText(c[0], x + 22, y + 55);
        g.fillStyle = c[2]; g.font = 'bold 50px ' + F; g.fillText(c[1], x + 22, y + 120);
      });
      g.fillStyle = '#222'; g.font = 'bold 32px ' + F; g.fillText('各任務（綠＝成功、紅＝未成功）', 40, 370);
      var maxT = Math.max.apply(null, list.map(function (t) { return t.total; }).concat([1]));
      list.forEach(function (t, i) {
        var y = 400 + i * rowH, barX = 430, barW = 520;
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
        fd.append('file', new File([blob], '每日發送報告_' + date.replace(/\//g, '') + '.png', { type: 'image/png' })); fd.append('sendId', sid2);
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
