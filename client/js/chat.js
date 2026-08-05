/* ─── Fast Bian — AI Chat (9router) ─── */
var Chat = (function(){
  var msgsEl, inputEl, btnEl, sessionBtnEl, sessionMenuEl, sessionListEl, sessionLabelEl, newSessionBtnEl;
  var history = [];
  var sessions = [];
  var activeSessionId = null;
  var API = 'http://127.0.0.1:20128/v1/chat/completions';
  var KEY = window.FB_API_KEY || ''; // key di file js/apiKey.js (TIDAK ikut di-commit)
  var MODEL = 'Free';
  var busy = false;
  var fixTries = 0; // berapa kali perbaikan otomatis dalam satu pesan
  var STORAGE_KEY = 'fastbian_chat_history';
  var VER_KEY = 'fastbian_chat_ver';
  var CHAT_VER = '8'; // bump when system prompt changes
  var SYSTEM = [
    'Kamu adalah asisten AI di dalam panel "Fast Bian" untuk After Effects.',
    'Kamu membantu user bikin animasi, text, dan efek langsung di timeline AE.',
    '',
    'RULES:',
    '- Generate ExtendScript (.jsx) untuk After Effects',
    '- Output kode dalam blok ```jsx',
    '- Jangan generate HTML/CSS/JavaScript untuk web',
    '- Jaga kode ringkas, tambah error handling basic',
    '- Kalo user minta bikin text + animasi: buat text layer baru + set animasi langsung',
    '',
    'FUNGSI BAWAAN PANEL (PAKAI INI — JAUH LEBIH AMAN DARIPADA NULIS EXTENDSCRIPT MANUAL):',
    '- FastBian_ApplyRotationLoop()  → keyframe Rotation 0→360° (2 detik) + loopOut("cycle") di semua layer terpilih. Mengembalikan string OK/ERR.',
    '- FastBian_RunLayerAnimation("bounce"|"pop"|"fade"|"slide"|"swing", "", \'{"dur":2,"mode":"in","loop":false}\') → animasi ke layer yang DIPILIH (mode: in = masuk, out = keluar, center = gerak terus). Mengembalikan string OK/ERR.',
    '- Panggil fungsi bawaan sebagai EKSPRESI TERAKHIR di kode (contoh: FastBian_ApplyRotationLoop();) supaya hasilnya OK/ERR tampil di panel.',
    '- JANGAN bungkus panggilan fungsi bawaan dalam try/catch + alert(); langsung panggil saja. Jangan pakai alert() untuk laporan hasil — biarkan fungsi bawaan melapor lewat return.',
    '- JANGAN pakai alert()/confirm()/prompt() di kode (dibungkam otomatis oleh panel) dan JANGAN bungkus kode dalam try/catch — panel sudah menangkap error otomatis dan akan memperbaikinya.',
    '- Kode kamu langsung dijalankan di AE: tulis operasinya langsung, jangan minta user mengklik apa pun.',
    '- Kalau operasi spesifik tidak ada fungsi bawaannya, baru tulis ExtendScript manual (dengan null-check wajib).',
    '',
    'NULL-SAFE (WAJIB, untuk hindari "TypeError: null is not an object"):',
    '- Setiap .property() BISA balikin null (tergantung jenis layer).',
    '- JANGAN pernah langsung pakai hasil .property() — selalu cek dulu:',
    '```jsx',
    'var tp = l.property("ADBE Text Properties");',
    'if(tp){',
    '  var td = tp.property("ADBE Text Document");',
    '  if(td){\n    var doc = td.value;      // sekarang aman',
    '    doc.text = "Isi baru";',
    '    td.setValue(doc);',
    '  }',
    '}',
    '```',
    '- RULES: cek null untuk tiap .property() sebelum pakai .value / .setValue / .setValueAtTime.',
    '- Terapkan juga untuk Position/Scale/Rotation/Opacity (layer camera tak punya Scale/Opacity).',
    '- Sebaiknya bungkus operasi dalam try/catch agar error tak menghentikan script.',
    '',
    'EDIT LAYER YANG SUDAH ADA:',
    '- Cari layer: comp.layer("nama layer")',
    '- Kalo gak ketemu, lempar error: throw new Error("Layer \\"nama\\" tidak ditemukan")',
    '',
    'PENTING: newTextDocument() TIDAK ADA di AE. Gunakan cara di bawah ini.',
    '```jsx',
    'var l = comp.layer("nama layer");',
    'if(l){',
    '  var tp = l.property("ADBE Text Properties").property("ADBE Text Document");',
    '  var doc = tp.value;',
    '  doc.text = "Isi baru";',
    '  tp.setValue(doc);',
    '}',
    '```',
    '',
    'INFO LAYER (WAJIB DIBACA):',
    '- Setiap pesan user dilengkapi blok "[INFO AE]" berisi komposisi aktif + daftar layer (jenis, status DIPILIH, dan keyframe-nya).',
    '- Blok [INFO AE] di PESAN TERBARU adalah satu-satunya kondisi terkini yang valid — abaikan blok [INFO AE] di pesan lama yang sudah usang (keyframe bisa sudah dihapus/diubah).',
    '- SEBELUM edit layer, cocokkan nama layer yang diminta user dengan daftar [INFO AE] TERBARU.',
    '- Kalo user menyebut layer yang TIDAK ada di daftar, jawab jujur: "Layer \\"nama\\" tidak ada di komposisi ini." JANGAN berasumsi layer itu ada.',
    '- Kalo user bilang "layer yang dipilih" / "layer ini", pakai layer berstatus [DIPILIH].',
    '- Kalo tidak ada layer DIPILIH tapi user minta edit layer yang dipilih, bilang: "Tidak ada layer yang dipilih."',
    '- Info keyframe (mis. Position(3)) bisa kamu sebutkan di jawaban sebagai konfirmasi.',
    '',
    'PROPERTIES TRANSFORM:',
    '- Position: ADBE Position (array [x,y] atau [x,y,z])',
    '- Scale: ADBE Scale (array [x%,y%])',
    '- Rotation: ADBE Rotation (derajat)',
    '- Opacity: ADBE Opacity (0-100)',
    '- Anchor Point: ADBE Anchor Point',
    '',
    'RESPONSE FORMAT:',
    '1. Penjelasan singkat',
    '2. Blok kode ExtendScript (```jsx)'
  ].join('\n');

  var useNode = false;
  try { useNode = typeof require !== 'undefined' && !!require('http'); } catch(e){}

  function init(){
    msgsEl = document.getElementById('chatMessages');
    inputEl = document.getElementById('chatInput');
    btnEl = document.getElementById('chatSend');
    sessionBtnEl = document.getElementById('chatSessionMenuBtn');
    sessionMenuEl = document.getElementById('chatSessionMenu');
    sessionListEl = document.getElementById('chatSessionList');
    sessionLabelEl = document.getElementById('chatSessionLabel');
    newSessionBtnEl = document.getElementById('chatNewSession');

    loadHistory();
    hide();
    inputEl.oninput = function(){ this.style.height='32px';this.style.height=Math.min(this.scrollHeight,120)+'px'; };
    inputEl.onkeydown = function(e){
      if((e.key === 'Enter' || e.keyCode === 13) && !e.shiftKey){
        if(e.preventDefault) e.preventDefault();
        e.returnValue = false;
        send();
      }
    };
    btnEl.onclick = send;

    if(sessionBtnEl){
      sessionBtnEl.onclick = function(e){
        e.stopPropagation();
        toggleSessionMenu();
      };
    }
    if(newSessionBtnEl){
      newSessionBtnEl.onclick = function(){
        createNewSession();
      };
    }
    document.addEventListener('click', function(){
      if(sessionMenuEl) sessionMenuEl.classList.add('hidden');
    });
  }

  function loadHistory(){
    try {
      var ver = localStorage.getItem(VER_KEY);
      if(ver !== CHAT_VER){
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(VER_KEY, CHAT_VER);
      } else {
        var saved = localStorage.getItem(STORAGE_KEY);
        if(saved){
          var arr = JSON.parse(saved);
          if(arr && arr.length > 0){
            history = arr;
            for(var i=0;i<history.length;i++){
              var m = history[i];
              if(m.role === 'system') continue;
              if(m.role === 'user' || m.role === 'assistant'){
                addMsg(m.role, m.content, true);
              }
            }
            setTimeout(function(){
              var els = msgsEl.querySelectorAll('pre code');
              for(var j=0;j<els.length;j++) els[j]._executed = true;
            }, 10);
          }
        }
      }
    } catch(e){ /* ignore */ }

    if(history.length === 0){
      history.push({role:'system', content:SYSTEM});
    } else if(history[0] && history[0].role === 'system' && history[0].content !== SYSTEM){
      history[0].content = SYSTEM;
    }

    sessions = JSON.parse(localStorage.getItem('fastbian_chat_sessions') || 'null') || [{id:'default', name:'Sesi 1', history: history.slice()}];
    activeSessionId = localStorage.getItem('fastbian_active_session') || sessions[0].id;
    if(!findSession(activeSessionId)) activeSessionId = sessions[0].id;
    applySession(activeSessionId);
  }

  function saveHistory(){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      var current = findSession(activeSessionId);
      if(current){
        current.history = history.slice();
        localStorage.setItem('fastbian_chat_sessions', JSON.stringify(sessions));
        localStorage.setItem('fastbian_active_session', activeSessionId);
      }
    } catch(e){ /* ignore */ }
  }

  function show(){
    var panel = document.getElementById('tabChat');
    if(panel) panel.hidden = false;
    if(msgsEl && msgsEl.children.length === 0) showWelcome();
    renderSessionList();
  }

  function hide(){
    var panel = document.getElementById('tabChat');
    if(panel) panel.hidden = true;
  }

  function findSession(id){
    for(var i=0;i<sessions.length;i++) if(sessions[i].id === id) return sessions[i];
    return null;
  }

  function createNewSession(){
    var id = 'session-' + Date.now();
    var session = {id:id, name:'Sesi ' + (sessions.length + 1), history: []};
    sessions.push(session);
    activeSessionId = id;
    history = [{role:'system', content:SYSTEM}];
    saveHistory();
    applySession(id);
    renderSessionList();
  }

  function applySession(id){
    var session = findSession(id);
    if(!session) return;
    activeSessionId = id;
    history = (session.history && session.history.slice()) || [{role:'system', content:SYSTEM}];
    if(history.length === 0) history.push({role:'system', content:SYSTEM});
    if(sessionLabelEl) sessionLabelEl.textContent = session.name;
    if(msgsEl){
      msgsEl.innerHTML = '';
      for(var i=0;i<history.length;i++){
        var m = history[i];
        if(m.role === 'system') continue;
        if(m.role === 'user' || m.role === 'assistant') addMsg(m.role, m.content, true);
      }
      if(msgsEl.children.length === 0) showWelcome();
    }
    renderSessionList();
  }

  function renderSessionList(){
    if(!sessionListEl) return;
    sessionListEl.innerHTML = '';
    for(var i=0;i<sessions.length;i++){
      var s = sessions[i];
      var row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '4px';

      var btn = document.createElement('button');
      btn.className = 'chat-session-item';
      btn.textContent = s.name;
      btn.style.flex = '1';
      btn.onclick = (function(session){
        return function(){
          applySession(session.id);
          if(sessionMenuEl) sessionMenuEl.classList.add('hidden');
        };
      })(s);

      var del = document.createElement('button');
      del.className = 'chat-session-item';
      del.textContent = '×';
      del.style.width = '24px';
      del.style.padding = '6px';
      del.onclick = (function(session){
        return function(e){
          e.stopPropagation();
          deleteSession(session.id);
        };
      })(s);

      row.appendChild(btn);
      row.appendChild(del);
      sessionListEl.appendChild(row);
    }
  }

  function deleteSession(id){
    if(sessions.length <= 1) return;
    var idx = -1;
    for(var i=0;i<sessions.length;i++){
      if(sessions[i].id === id){ idx = i; break; }
    }
    if(idx < 0) return;

    sessions.splice(idx, 1);
    if(activeSessionId === id){
      activeSessionId = sessions[0].id;
    }
    history = [{role:'system', content:SYSTEM}];
    var next = findSession(activeSessionId);
    if(next && next.history && next.history.length > 0){
      history = next.history.slice();
    }
    saveHistory();
    applySession(activeSessionId);
    renderSessionList();
  }

  function toggleSessionMenu(){
    if(!sessionMenuEl) return;
    sessionMenuEl.classList.toggle('hidden');
  }

  function showWelcome(){
    if(!msgsEl || msgsEl.children.length > 0) return;
    msgsEl.innerHTML = '<div class="chat-welcome">' +
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>' +
      '<h3>AI Chat</h3>' +
      '<p>Tanya apa aja — langsung ke timeline AE.</p>' +
      '<button id="chatClear" style="background:#333;color:#aaa;border:1px solid #444;border-radius:4px;padding:4px 12px;font-size:11px;cursor:pointer;margin-top:8px;">Hapus Riwayat</button></div>';
    setTimeout(function(){
      var clr = document.getElementById('chatClear');
      if(clr) clr.onclick = clearHistory;
    }, 50);
  }

  function clearHistory(){
    history = [{role:'system', content:SYSTEM}];
    if(activeSessionId){
      var current = findSession(activeSessionId);
      if(current) current.history = history.slice();
    }
    saveHistory();
    msgsEl.innerHTML = '';
    showWelcome();
  }

  function escapeHtml(s){
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function addMsg(role, text, skipSave){
    var wel = msgsEl.querySelector('.chat-welcome');
    if(wel) wel.remove();
    removeTyping();

    var div = document.createElement('div');
    div.className = 'msg ' + role;
    if(role === 'assistant'){
      div.innerHTML = renderAssistant(text);
    } else {
      div.textContent = text;
    }
    msgsEl.appendChild(div);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    if(!skipSave) saveHistory();
  }

  function renderAssistant(text){
    var html = '';
    var parts = text.split(/(```[\w]*\n?)/);
    var inCode = false, codeLang = '', codeContent = '';
    for(var i=0;i<parts.length;i++){
      var p = parts[i];
      if(/^```[\w]*\n?$/.test(p)){
        if(inCode){
          html += renderCodeBlock(codeContent, codeLang);
          codeContent = '';
          inCode = false;
        } else {
          inCode = true;
          codeLang = p.replace(/```/,'').replace(/\n/,'').trim();
        }
      } else if(inCode){
        codeContent += p;
      } else {
        html += escapeHtml(p).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>');
      }
    }
    if(inCode && codeContent) html += renderCodeBlock(codeContent, codeLang);
    return html;
  }

  function renderCodeBlock(code, lang){
    return '<div style="background:#1C2027;border:1px solid rgba(255,255,255,.08);border-radius:8px;margin:6px 0;overflow:hidden;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:#222;font-size:10px;color:#888;">' +
      '<span>' + escapeHtml(lang || 'jsx') + '</span></div>' +
      '<pre style="margin:0;padding:8px 10px;font-size:11px;line-height:1.4;overflow-x:auto;color:#94A3B8;"><code>' + escapeHtml(code) + '</code></pre></div>';
  }

  function addTyping(){
    if(msgsEl.querySelector('.msg.typing')) return;
    var div = document.createElement('div');
    div.className = 'msg typing';
    div.textContent = 'Sedang mikir';
    msgsEl.appendChild(div);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function removeTyping(){
    var typ = msgsEl.querySelector('.msg.typing');
    if(typ) typ.remove();
  }

  function handleReply(err, reply){
    busy = false;
    if(btnEl) btnEl.disabled = false;
    removeTyping();

    if(err){
      addMsg('error', err);
    } else if(reply){
      addMsg('assistant', reply);
      history.push({role:'assistant', content:reply});
      saveHistory();
      setTimeout(autoExecute, 50);
    } else {
      addMsg('error', 'Respon kosong dari AI.');
    }
  }

  function autoExecute(){
    var els = msgsEl.querySelectorAll('pre code');
    for(var i=0;i<els.length;i++){
      if(els[i]._executed) continue;
      els[i]._executed = true;
      var code = els[i].textContent;
      if(code.trim()) execCode(code, els[i]);
    }
  }

  function evalAE(code, callback){
    if(typeof window.__adobe_cep__ !== 'undefined' && window.__adobe_cep__.evalScript){
      window.__adobe_cep__.evalScript(code, function(r){ callback(r); });
    } else if(typeof CSInterface !== 'undefined'){
      new CSInterface().evalScript(code, callback);
    } else {
      callback('__ERR__:Panel harus dijalankan di After Effects.');
    }
  }

  // Otomatis netralkan pola paling rawan null di kode hasil AI
  function hardenCode(code){
    // Pola "rotasi looping manual" → paksa pakai fungsi bawaan yang teruji (jangan manual)
    if(/loopOut\s*\(/.test(code) && /ADBE Rotation/.test(code)){
      return 'FastBian_ApplyRotationLoop();';
    }
    var s = code;
    // l.property("ADBE Text Properties").property("ADBE Text Document") -> FB_TXT_PROP(l)
    s = s.replace(/([A-Za-z_$][\w$]*)\s*\.property\("ADBE Text Properties"\)\s*\.property\("ADBE Text Document"\)/g,
      'FB_TXT_PROP($1)');
    // Bungkam dialog modal — error ditangani panel, bukan alert
    s = s.replace(/\balert\s*\(/g, '__FB_SILENT(');
    s = s.replace(/\bconfirm\s*\(/g, '__FB_SILENT(');
    s = s.replace(/\bprompt\s*\(/g, '__FB_SILENT(');
    return s;
  }

  function execCode(code, codeEl){
    var statusEl = document.createElement('div');
    statusEl.style.cssText = 'font-size:11px;color:#888;padding:2px 0 6px 10px;';
    statusEl.textContent = '⏳ Menjalankan di AE...';
    if(codeEl){
      var wrap = codeEl.parentElement && codeEl.parentElement.parentElement;
      if(wrap && wrap.parentElement) wrap.parentElement.insertBefore(statusEl, wrap.nextSibling);
      else msgsEl.appendChild(statusEl);
    } else {
      msgsEl.appendChild(statusEl);
    }
    msgsEl.scrollTop = msgsEl.scrollHeight;

    var helper =
      'function FB_TXT_PROP(l){var t;try{t=l.property("ADBE Text Properties");}catch(e){return null;}return t?t.property("ADBE Text Document"):null;}\n' +
      'function FB_SAFE(obj,name){var p=null;try{p=obj.property(name);}catch(e){}return p||null;}\n' +
      'function __FB_SILENT(){return null;}\n';
    var wrapped = 'try{\n' + helper + 'var __RES__ = (function(){\n' + hardenCode(code) + '\n})();\nString(__RES__);\n}catch(e){"__ERR__:" + e.toString();}';

    evalAE('FastBian_SceneFingerprint()', function(before){
      evalAE(wrapped, function(result){
        var txt = (result || '').toString();
        if(txt.indexOf('__ERR__:') === 0 || txt.indexOf('ERR:') === 0){
          statusEl.textContent = '❌ Gagal: ' + txt.replace(/^__ERR__:|^ERR:/,'');
          if(fixTries < 2){
            fixTries++;
            autoFix(statusEl, txt.replace(/^__ERR__:|^ERR:/,''));
          } else {
            statusEl.textContent = '❌ Masih gagal setelah 2x perbaikan otomatis: ' + txt.replace(/^__ERR__:|^ERR:/,'');
          }
        } else if(txt.indexOf('OK:') === 0){
          statusEl.textContent = '✅ ' + txt.replace(/^OK:\s*/,'');
        } else {
          // Tak ada hasil OK/ERR — verifikasi nyata ke AE apakah ada perubahan
          evalAE('FastBian_SceneFingerprint()', function(after){
            if(after && after !== before){
              statusEl.textContent = '✅ Berhasil (AE berubah)';
            } else {
              statusEl.textContent = '⚠️ Kode jalan tanpa error, tapi AE TIDAK berubah sama sekali. Maksudnya: tidak ada satu pun keyframe/nilai layer yang berganti. Penyebab paling umum: layer yang dimaksud tidak dipilih, atau nama layer yang dipakai AI beda. Coba: pilih dulu layernya → kirim ulang.';
            }
          });
        }
      });
    });
  }

  // Kode gagal di AE — minta AI perbaiki sendiri, lalu jalanin lagi
  function autoFix(statusEl, errText){
    statusEl.textContent = '🤖 Kode gagal — AI memperbaiki otomatis...';
    var fixMsg = 'Kode ExtendScript yang kamu kirim sebelumnya GAGAL dijalankan di After Effects dengan error:\n' + errText +
      '\n\nPerbaiki kode ExtendScript-nya. Kemungkinan besar layer tidak punya properti yang dipakai (mis. Rotation/Scale/Opacity tidak ada di layer itu) atau object bernilai null.\n' +
      'Aturan: selalu null-check tiap .property() sebelum dipakai (if(prop){...}), jangan akses .value/.setValue/.setValueAtTime dari properti null.\n' +
      'Keluarkan HANYA blok kode ```jsx yang sudah diperbaiki — tanpa penjelasan atau teks lain.';
    var messages = history.concat([{role:'user', content:fixMsg}]);
    var body = JSON.stringify({ model:MODEL, messages:messages, stream:false, max_tokens:8192 });
    if(useNode) sendViaNode(body);
    else sendViaXHR(body);
  }

  // Ambil info AE terkini (komposisi, layer, seleksi, keyframe) untuk konteks AI
  function getSceneInfo(cb){
    evalAE('FastBian_GetSceneInfo()', function(r){
      var txt = (r || '').toString().trim();
      var info = null;
      try { info = JSON.parse(txt); } catch(e){}
      if(!info || !info.comp) return cb('');
      var lines = ['[TOOLS PANEL FAST BIAN — PAKAI INI, JANGAN TULIS EXTENDSCRIPT MANUAL]'];
      lines.push('- FastBian_ApplyRotationLoop();  → rotasi looping 0→360° (2 detik) + loopOut("cycle") ke semua layer terpilih.');
      lines.push('- FastBian_RunLayerAnimation("bounce|pop|fade|slide|swing", "", \'{"dur":2,"mode":"in","loop":false}\');  → animasi ke layer terpilih (mode: in = masuk, out = keluar, center = gerak terus).');
      lines.push('- Panggil fungsi bawaan sebagai ekspresi terakhir, jangan bungkus try/catch/alert.');
      lines.push('');
      lines.push('[INFO AE] Komposisi: "' + info.comp + '" (durasi ' + info.duration.toFixed(1) + 's, playhead ' + info.time.toFixed(1) + 's)');
      if(!info.layers || info.layers.length === 0){
        lines.push('(komposisi kosong)');
      } else {
        lines.push('Layers:');
        for(var i=0;i<info.layers.length;i++){
          var L = info.layers[i];
          var tag = '[' + L.type + ']' + (L.selected ? ' [DIPILIH]' : '');
          var kf = L.keys ? ' - keyframes: ' + L.keys.join(', ') : '';
          lines.push((L.index) + '. "' + L.name + '" ' + tag + kf);
        }
      }
      cb(lines.join('\n'));
    });
  }

  function send(){
    if(busy) return;
    var text = inputEl.value.trim();
    if(!text) return;
    inputEl.value = '';
    inputEl.style.height = '32px';

    addMsg('user', text);
    addTyping();
    busy = true;
    btnEl.disabled = true;

    if(!KEY){
      statusEl.textContent = '❌ API key belum diatur. Buat file client/js/apiKey.js berisi: window.FB_API_KEY = \'Bearer sk-...\'; lalu restart panel.';
      busy = false;
      btnEl.disabled = false;
      removeTyping();
      return;
    }

    getSceneInfo(function(sceneText){
      fixTries = 0;
      // Bersihkan snapshot [INFO AE] lama dari history — hanya kondisi terkini yang valid
      for(var h=0;h<history.length;h++){
        var m = history[h];
        if(m.role === 'user' && m.content){
          var idx = m.content.lastIndexOf('\n\n[INFO AE]');
          if(idx !== -1) m.content = m.content.substring(0, idx);
        }
      }
      var content = sceneText ? text + '\n\n' + sceneText : text;
      history.push({role:'user', content:content});
      saveHistory();
      var body = JSON.stringify({
        model: MODEL,
        messages: history,
        stream: false,
        max_tokens: 8192
      });
      if(useNode) sendViaNode(body);
      else sendViaXHR(body);
    });
  }

  function sendViaXHR(body){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', API);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.setRequestHeader('Authorization', KEY);
    xhr.responseType = 'json';
    xhr.onload = function(){
      if(xhr.status === 200 && xhr.response){
        var msg = xhr.response.choices && xhr.response.choices[0].message;
        var reply = msg && (msg.content || msg.reasoning_content || '');
        handleReply(null, reply);
      } else {
        var errMsg = xhr.response && xhr.response.error && xhr.response.error.message;
        handleReply('Error ' + xhr.status + ': ' + (errMsg || 'Gagal hubungi 9router.'));
      }
    };
    xhr.onerror = function(){
      handleReply('Gagal terhubung ke 9router. Jalankan "9router" di terminal.');
    };
    xhr.send(body);
  }

  function sendViaNode(body){
    try {
      var http = require('http');
      var url = require('url').parse(API);
      var opts = {
        hostname: url.hostname, port: url.port, path: url.path,
        method: 'POST',
        headers: {'Content-Type':'application/json','Authorization':KEY}
      };
      var req = http.request(opts, function(res){
        var data = '';
        res.on('data', function(c){ data += c; });
        res.on('end', function(){
          try {
            var json = JSON.parse(data);
            var msg = json.choices && json.choices[0] && json.choices[0].message;
            var reply = msg && (msg.content || msg.reasoning_content || '');
            handleReply(null, reply);
          } catch(e){ handleReply('Gagal parse respon AI.'); }
        });
      });
      req.on('error', function(e){ handleReply('Gagal hubungi 9router: ' + e.message); });
      req.write(body);
      req.end();
    } catch(e){ handleReply('Node.js error: ' + e.message); }
  }

  return {
    init: init,
    show: show,
    hide: hide
  };
})();