/* ─── Fast Bian — Settings Panel ─── */
var SettingsPanel = (function(){
  var panel, onConfirm, onLive;
  var curveA = {x:0.55, y:0}, curveC = {x:0.45, y:1};

  function init(confirmCb, liveCb){
    onConfirm = confirmCb;
    onLive = liveCb;
    panel = document.getElementById('settingsPanel');
    panel.addEventListener('click', function(e){
      if(e.target.closest('.sp-close')){
        hide();
        return;
      }
      if(e.target.closest('.sp-btn-cancel')){
        hide();
        return;
      }
      if(e.target.closest('.sp-btn-confirm')){
        doConfirm();
      }
      var seg = e.target.closest('.sp-seg-btn');
      if(seg){
        var segBox = seg.parentElement;
        var btns = segBox.querySelectorAll('.sp-seg-btn');
        for(var i=0;i<btns.length;i++) btns[i].classList.remove('active');
        seg.classList.add('active');
      }
    });
  }

  function show(type, data){
    panel.dataset.type = type;
    panel.dataset.id = data.id;

    var html = type === 'text' ? textForm(data) : type === 'shape' ? shapeForm(data) : type === 'camera' ? cameraForm(data) : type === 'stabilizer' ? stabilizerForm(data) : type === 'animate' ? animateForm(data) : graphForm(data);
    panel.innerHTML = html;
    panel.classList.add('visible');
    wireColor();
    if(type === 'graph') wireCurve();

    var first = panel.querySelector('input:not([type=color]),textarea');
    if(first) setTimeout(function(){ first.focus(); }, 50);
  }

  function wireColor(){
    var c = panel.querySelector('input[type=color]');
    var h = panel.querySelector('.sp-hex');
    if(!c || !h) return;
    c.oninput = function(){ h.value = this.value.toUpperCase(); };
    h.oninput = function(){
      var v = h.value.replace(/[^0-9a-fA-F]/g,'').slice(0,6);
      h.value = '#' + v;
      if(v.length === 6) c.value = '#' + v;
    };
  }

  function hide(){
    panel.classList.remove('visible');
    panel.innerHTML = '';
  }

  function doConfirm(){
    var type = panel.dataset.type;
    var id = panel.dataset.id;
    if(!type || !id) return;

    if(type === 'text'){
      var text = (panel.querySelector('#sp-text') || {}).value || 'Fast Bian';
      var dur = parseFloat((panel.querySelector('#sp-dur') || {}).value) || 2;
      var color = (panel.querySelector('#sp-color') || {}).value || '#ffffff';
      var mode = (panel.querySelector('#sp-mode .sp-seg-btn.active') || {}).dataset.mode || 'in';
      var loop = !!(panel.querySelector('#sp-loop') || {}).checked;
      hide();
      if(onConfirm) onConfirm(type, id, { text:text, dur:dur, color:color, mode:mode, loop:loop });
    } else if(type === 'camera'){
      var start = parseFloat((panel.querySelector('#sp-start') || {}).value) || 0;
      var dur = parseFloat((panel.querySelector('#sp-dur') || {}).value) || 3;
      hide();
      if(onConfirm) onConfirm(type, id, { start:start, dur:dur });
    } else if(type === 'shape'){
      var size = parseFloat((panel.querySelector('#sp-size') || {}).value) || 200;
      var color = (panel.querySelector('#sp-color') || {}).value || '#ffffff';
      hide();
      if(onConfirm) onConfirm(type, id, { size:size, color:color });
    } else if(type === 'graph'){
      hide();
      if(onConfirm) onConfirm(type, id, { curve: computeCurveSamples() });
    } else if(type === 'animate'){
      var dur = parseFloat((panel.querySelector('#sp-dur') || {}).value) || 2;
      var mode = (panel.querySelector('#sp-mode .sp-seg-btn.active') || {}).dataset.mode || 'in';
      var loop = !!(panel.querySelector('#sp-loop') || {}).checked;
      hide();
      if(onConfirm) onConfirm(type, id, { dur: dur, mode: mode, loop: loop });
    } else {
      hide();
      if(onConfirm) onConfirm(type, id, {});
    }
  }

  function textForm(data){
    var modeRows = '';
    if(data.id !== 'typewriter'){
      modeRows = spModeRow() + spLoopRow();
    }
    return [
      '<div class="sp-header" data-type="text" data-id="' + data.id + '">',
        '<span class="sp-title">' + data.name + '</span>',
        '<button class="sp-close">&times;</button>',
      '</div>',
      '<div class="sp-row">',
        '<label>Text</label>',
        '<textarea id="sp-text">Fast Bian</textarea>',
      '</div>',
      modeRows,
      '<div class="sp-row">',
        '<label>Duration</label>',
        '<input type="number" id="sp-dur" value="2" min="0.5" step="0.5">',
        '<label style="min-width:auto;font-size:10px;">detik</label>',
      '</div>',
      '<div class="sp-row">',
        '<label>Warna</label>',
        '<div class="sp-color-wrap">',
          '<input type="color" id="sp-color" value="#ffffff">',
          '<input type="text" class="sp-hex" value="#FFFFFF">',
        '</div>',
      '</div>',
      '<div class="sp-actions">',
        '<button class="sp-btn sp-btn-cancel">Batal</button>',
        '<button class="sp-btn sp-btn-confirm">Terapkan</button>',
      '</div>'
    ].join('');
  }

  function shapeForm(data){
    return [
      '<div class="sp-header" data-type="shape" data-id="' + data.id + '">',
        '<span class="sp-title">' + data.name + '</span>',
        '<button class="sp-close">&times;</button>',
      '</div>',
      '<div class="sp-row">',
        '<label>Ukuran</label>',
        '<input type="number" id="sp-size" value="200" min="20" step="10">',
        '<label style="min-width:auto;font-size:10px;">px</label>',
      '</div>',
      '<div class="sp-row">',
        '<label>Warna</label>',
        '<div class="sp-color-wrap">',
          '<input type="color" id="sp-color" value="#ffffff">',
          '<input type="text" class="sp-hex" value="#FFFFFF">',
        '</div>',
      '</div>',
      '<div class="sp-actions">',
        '<button class="sp-btn sp-btn-cancel">Batal</button>',
        '<button class="sp-btn sp-btn-confirm">Terapkan</button>',
      '</div>'
    ].join('');
  }

  function cameraForm(data){
    return [
      '<div class="sp-header" data-type="camera" data-id="' + data.id + '">',
        '<span class="sp-title">' + data.name + '</span>',
        '<button class="sp-close">&times;</button>',
      '</div>',
      '<div class="sp-row">',
        '<label>Duration</label>',
        '<input type="number" id="sp-dur" value="3" min="0.5" step="0.5">',
        '<label style="min-width:auto;font-size:10px;">detik</label>',
      '</div>',
      '<div class="sp-actions">',
        '<button class="sp-btn sp-btn-cancel">Batal</button>',
        '<button class="sp-btn sp-btn-confirm">Terapkan</button>',
      '</div>'
    ].join('');
  }

  function stabilizerForm(data){
    return [
      '<div class="sp-header" data-type="stabilizer" data-id="' + data.id + '">',
        '<span class="sp-title">' + data.name + '</span>',
        '<button class="sp-close">&times;</button>',
      '</div>',
      '<div class="sp-info"><b>Cara pakai:</b><br>1. Pilih layer video yang mau di-stabilize<br>2. Klik kartu Stabilizer Video di panel<br>3. Klik <b>Terapkan</b><br><br>Warp Stabilizer VFX akan ditambahkan dengan preset yang dipilih. Analysis berjalan saat preview/render.',
      '<div class="sp-actions">',
        '<button class="sp-btn sp-btn-cancel">Batal</button>',
        '<button class="sp-btn sp-btn-confirm">Terapkan</button>',
      '</div>'
    ].join('');
  }

  function spModeRow(){
    return '<div class="sp-row">' +
        '<label>Mode</label>' +
        '<div class="sp-seg" id="sp-mode">' +
          '<button type="button" class="sp-seg-btn active" data-mode="in">Masuk</button>' +
          '<button type="button" class="sp-seg-btn" data-mode="out">Keluar</button>' +
          '<button type="button" class="sp-seg-btn" data-mode="center">Tengah</button>' +
        '</div>' +
      '</div>';
  }
  function spLoopRow(){
    return '<div class="sp-row">' +
        '<label>Looping</label>' +
        '<label class="sp-toggle">' +
          '<input type="checkbox" id="sp-loop">' +
          '<span class="sp-toggle-track"></span>' +
          '<span class="sp-toggle-text">putar terus (maju-mundur)</span>' +
        '</label>' +
      '</div>';
  }

  function animateForm(data){
    return [
      '<div class="sp-header" data-type="animate" data-id="' + data.id + '">',
        '<span class="sp-title">' + data.name + '</span>',
        '<button class="sp-close">&times;</button>',
      '</div>',
      '<div class="sp-info">Animasi diterapkan ke <b>layer yang dipilih</b>, dimulai dari posisi time indicator sekarang.</div>',
      spModeRow(),
      '<div class="sp-row">',
        '<label>Duration</label>',
        '<input type="number" id="sp-dur" value="2" min="0.2" step="0.1">',
        '<label style="min-width:auto;font-size:10px;">detik</label>',
      '</div>',
      spLoopRow(),
      '<div class="sp-actions">',
        '<button class="sp-btn sp-btn-cancel">Batal</button>',
        '<button class="sp-btn sp-btn-confirm">Terapkan</button>',
      '</div>'
    ].join('');
  }

  function graphForm(data){
    return [
      '<div class="sp-header" data-type="graph" data-id="' + data.id + '">',
        '<span class="sp-title">' + data.name + '</span>',
        '<button class="sp-close">&times;</button>',
      '</div>',
      '<div class="sp-curve-label">Kurva Easing <span class="sp-live">LIVE</span> — tarik titik, hasil langsung ke AE</div>',
      '<div class="sp-curve"><canvas id="sp-curve-canvas"></canvas></div>',
      '<div class="sp-curve-presets">',
        '<button class="sp-curve-preset" type="button">In</button>',
        '<button class="sp-curve-preset" type="button">Out</button>',
        '<button class="sp-curve-preset" type="button">Ease</button>',
        '<button class="sp-curve-preset" type="button">Linear</button>',
        '<button class="sp-curve-preset" type="button">Overshoot</button>',
        '<button class="sp-curve-preset" data-reset="1" type="button">Reset</button>',
      '</div>',
      '<div class="sp-info">Kurva akan diterapkan <b>realtime</b> ke keyframe layer terpilih saat kamu menarik. Klik <b>Terapkan</b> untuk mengunci.</div>',
      '<div class="sp-actions">',
        '<button class="sp-btn sp-btn-cancel">Batal</button>',
        '<button class="sp-btn sp-btn-confirm">Terapkan</button>',
      '</div>'
    ].join('');
  }

  // ─── Custom curve editor (canvas) ───
  var CURVE_PRESETS = {
    'in':        [0.42,0, 1,1],
    'out':       [0,0, 0.58,1],
    'ease':      [0.55,0, 0.45,1],
    'linear':    [0.334,0.334, 0.667,0.667],
    'overshoot': [0.52,0.28, 0.2,1.28]
  };
  var curveDrag = null;

  function wireCurve(){
    var id = panel.dataset.id;
    var def = (GRAPH_CURVES && GRAPH_CURVES[id]) || [0.55,0, 0.45,1];
    curveA.x = def[0]; curveA.y = def[1];
    curveC.x = def[2]; curveC.y = def[3];
    curveDrag = null;
    var cv = document.getElementById('sp-curve-canvas');
    if(!cv) return;
    cv.width = Math.max(240, cv.clientWidth || 280);
    cv.height = 150;
    drawCurve();
    cv.onmousedown = function(e){ editStart(e); };
    cv.onmousemove = function(e){ editMove(e); };
    cv.onmouseup = function(){ curveDrag = null; };
    cv.onmouseleave = function(){ curveDrag = null; };
    var ps = panel.querySelectorAll('.sp-curve-preset');
    for(var i=0;i<ps.length;i++){
      (function(btn){
        btn.onclick = function(){
          if(btn.getAttribute('data-reset')){
            var d2 = (GRAPH_CURVES && GRAPH_CURVES[panel.dataset.id]) || [0.55,0,0.45,1];
            curveA.x=d2[0]; curveA.y=d2[1]; curveC.x=d2[2]; curveC.y=d2[3];
          } else {
            var pr = CURVE_PRESETS[btn.textContent.trim().toLowerCase()];
            if(pr){ curveA.x=pr[0]; curveA.y=pr[1]; curveC.x=pr[2]; curveC.y=pr[3]; }
          }
          drawCurve();
        };
      })(ps[i]);
    }
  }
  function editStart(e){
    var cv = document.getElementById('sp-curve-canvas');
    var pos = canvasPos(cv, e);
    var pa = cvToXY(curveA), pc = cvToXY(curveC);
    var da = dist(pos, pa), dc = dist(pos, pc);
    if(da < 28 && da <= dc) curveDrag = 'A';
    else if(dc < 28) curveDrag = 'C';
    else curveDrag = (da < dc) ? 'A' : 'C';
    editApply(pos);
  }
  function editMove(e){
    if(!curveDrag) return;
    var cv = document.getElementById('sp-curve-canvas');
    editApply(canvasPos(cv, e));
  }
  function editApply(pos){
    var cv = document.getElementById('sp-curve-canvas');
    var XW = cv.width - PADX*2, YW = cv.height - PADY*2;
    if(XW <= 0 || YW <= 0) return;
    var u = (pos.x - PADX) / XW;
    var v = (pos.y - PADY) / YW;
    u = Math.max(0, Math.min(1, u));
    v = Math.max(-0.4, Math.min(1.4, v));
    if(curveDrag === 'A'){ curveA.x = u; curveA.y = 1 - v; }
    else { curveC.x = u; curveC.y = 1 - v; }
    drawCurve();
    scheduleLive();
  }

  var liveTimer = null;
  function scheduleLive(){
    if(!onLive) return;
    if(liveTimer) clearTimeout(liveTimer);
    liveTimer = setTimeout(function(){
      var curve = computeCurveSamples();
      onLive('graph', panel.dataset.id, { curve: curve });
    }, 120);
  }
  function cvToXY(c){
    var cv = document.getElementById('sp-curve-canvas');
    var XW = cv.width - PADX*2, YW = cv.height - PADY*2;
    return { x: PADX + c.x*XW, y: (cv.height - PADY) - c.y*YW };
  }
  function canvasPos(cv, e){
    var r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left), y: (e.clientY - r.top) };
  }
  function dist(a, b){
    var dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx*dx + dy*dy);
  }
  function computeCurveSamples(){
    var n = 12, out = [];
    for(var i=0;i<=n;i++){
      var uu = i/n, lo = 0, hi = 1;
      for(var b=0;b<32;b++){
        var mid = (lo+hi)/2, um = 1 - mid;
        var xm = 3*um*um*mid*curveA.x + 3*um*mid*mid*curveC.x + mid*mid*mid;
        if(xm < uu) lo = mid; else hi = mid;
      }
      var t = (lo+hi)/2, u1 = 1 - t;
      out.push(3*u1*u1*t*curveA.y + 3*u1*t*t*curveC.y + t*t*t);
    }
    return out;
  }
  function drawCurve(){
    var cv = document.getElementById('sp-curve-canvas');
    if(!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d');
    var W = cv.width, H = cv.height;
    var XW = W - PADX*2, YW = H - PADY*2;
    function px(u){ return PADX + u*XW; }
    function pyn(v){ return (H - PADY) - v*YW; }
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#1A1E24'; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
    for(var i=0;i<=4;i++){ var gx = px(i/4); ctx.beginPath(); ctx.moveTo(gx,PADY); ctx.lineTo(gx,H-PADY); ctx.stroke(); }
    for(var j=0;j<=4;j++){ var gy = pyn(j/4); ctx.beginPath(); ctx.moveTo(PADX,gy); ctx.lineTo(W-PADX,gy); ctx.stroke(); }
    ctx.setLineDash([4,4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath(); ctx.moveTo(px(0),pyn(0)); ctx.lineTo(px(1),pyn(1)); ctx.stroke();
    ctx.setLineDash([]);
    function xat(t){ var u=1-t; return 3*u*u*t*curveA.x + 3*u*t*t*curveC.x + t*t*t; }
    function yat(t){ var u=1-t; return 3*u*u*t*curveA.y + 3*u*t*t*curveC.y + t*t*t; }
    ctx.strokeStyle = 'rgba(96,165,250,0.45)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px(0),pyn(0)); ctx.lineTo(px(curveA.x),pyn(curveA.y)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px(1),pyn(1)); ctx.lineTo(px(curveC.x),pyn(curveC.y)); ctx.stroke();
    ctx.strokeStyle = '#3B82F6'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    for(var i=0;i<=160;i++){ var t=i/160, x=xat(t), y=yat(t); if(i===0) ctx.moveTo(px(x),pyn(y)); else ctx.lineTo(px(x),pyn(y)); }
    ctx.stroke();
    fillDot(ctx, px(curveA.x), pyn(curveA.y));
    fillDot(ctx, px(curveC.x), pyn(curveC.y));
  }
  function dot(ctx, x, y){
    ctx.beginPath(); ctx.arc(x, y, 5.5, 0, 6.2832);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.strokeStyle = '#3B82F6'; ctx.lineWidth = 2; ctx.stroke();
  }
  var PADX = 22, PADY = 18;

  return { init: init, show: show, hide: hide };
})();

