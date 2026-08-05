/* ─── Fast Bian — Main Entry ─── */
(function(){
  var tabTools = document.getElementById('tabTools');
  var tabCurve = document.getElementById('tabCurve');
  var tabChat = document.getElementById('tabChat');

  // ─── Tab switching ───
  var tabs = document.querySelectorAll('.tab');
  for(var t=0;t<tabs.length;t++){
    tabs[t].addEventListener('click', function(){
      var target = this.getAttribute('data-tab');
      var isChat = target === 'chat';
      var isCurve = target === 'curve';

      document.querySelectorAll('.tab').forEach(function(el){ el.classList.remove('active'); });
      document.querySelectorAll('.tab-content').forEach(function(el){ el.classList.remove('active'); });
      this.classList.add('active');

      if(tabTools) {
        tabTools.classList.toggle('active', !isChat && !isCurve);
        tabTools.style.display = !isChat && !isCurve ? 'flex' : 'none';
      }
      if(tabCurve) {
        tabCurve.classList.toggle('active', isCurve);
        tabCurve.hidden = !isCurve;
        tabCurve.style.display = isCurve ? 'flex' : 'none';
      }
      if(tabChat) {
        tabChat.classList.toggle('active', isChat);
        tabChat.hidden = !isChat;
        tabChat.style.display = isChat ? 'flex' : 'none';
      }

      // Fix body scroll for tools tab
      if(target === 'tools') {
        var accordion = document.getElementById('accordionContainer');
        if(accordion) accordion.style.display = '';
      }

      if(isChat && Chat && typeof Chat.show === 'function'){
        Chat.show();
      } else if(Chat && typeof Chat.hide === 'function'){
        Chat.hide();
      }
    });
  }

  // ─── Tools Tab ───
  Accordion.init(document.getElementById('accordionContainer'));
  Renderer.init();
  Search.init('searchInput', 'searchClear', function(query){
    renderView(query);
  });

  // Wire up settings confirm → run in AE
  SettingsPanel.init(function(type, id, params){
    Renderer.run(type, id, params);
  }, function(type, id, params){
    Renderer.run(type, id, params);
  });

  // Undo / Redo buttons
  document.getElementById('btnUndo').onclick = function(){ Renderer.exec('FB_Undo()'); };
  document.getElementById('btnRedo').onclick = function(){ Renderer.exec('FB_Redo()'); };

  function renderCurveView(query){
    var list = document.getElementById('curveList');
    var preview = document.getElementById('curvePreview');
    var state = document.getElementById('curveState');
    if(!list) return;

    var items = GRAPH_ANIMATIONS.slice();
    if(query){
      var q = query.toLowerCase();
      items = items.filter(function(a){
        return (a.name || '').toLowerCase().indexOf(q) > -1 || (a.desc || '').toLowerCase().indexOf(q) > -1;
      });
    }

    var activeId = (state && state.dataset.curveId) || (items[0] && items[0].id) || 'easy-ease';
    list.innerHTML = '';

    for(var i=0;i<items.length;i++){
      var item = items[i];
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'curve-card' + (item.id === activeId ? ' active' : '');
      card.innerHTML = '<span class="curve-name">' + item.name + '</span><span class="curve-desc">' + item.desc + '</span>';
      card.addEventListener('click', function(id, label){
        return function(){
          if(state){ state.dataset.curveId = id; state.textContent = label + ' dipilih — seret kurva lalu klik Terapkan.'; }
          initCurveCanvas(id, preview);
        };
      }(item.id, item.name));
      list.appendChild(card);
    }

    if(items.length === 0){
      list.innerHTML = '<div class="curve-empty">Tidak ada curve yang cocok.</div>';
    }

    if(!preview) return;
    initCurveCanvas(activeId, preview);
    if(state && !state.dataset.curveId){ state.dataset.curveId = activeId; }
  }

  function initCurveCanvas(id, preview){
    if(!preview) return;
    preview.innerHTML = '';
    var canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    preview.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var curve = getCurveControlPoints(id);
    var drag = null;
    var active = 0;

    function draw(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(15,23,42,0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(148,163,184,0.35)';
      ctx.lineWidth = 1;
      for(var i=0;i<5;i++){
        var y = 30 + i * 30;
        ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(canvas.width - 20, y); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(20, canvas.height - 20); ctx.lineTo(canvas.width - 20, canvas.height - 20); ctx.stroke();

      ctx.strokeStyle = 'rgba(59,130,246,0.9)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(20, canvas.height - 20);
      ctx.bezierCurveTo(curve.cp1.x, curve.cp1.y, curve.cp2.x, curve.cp2.y, canvas.width - 20, 20);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(59,130,246,0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(20, canvas.height - 20); ctx.lineTo(curve.cp1.x, curve.cp1.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(canvas.width - 20, 20); ctx.lineTo(curve.cp2.x, curve.cp2.y); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#3b82f6';
      var points = [
        {x:20, y:canvas.height - 20},
        curve.cp1,
        curve.cp2,
        {x:canvas.width - 20, y:20}
      ];
      for(var i=0;i<points.length;i++){
        var p = points[i];
        ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }

      setPreviewCurveData(preview, curve);
    }

    canvas.addEventListener('pointerdown', function(e){
      var rect = canvas.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      var y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      var hit = null;
      var points = [
        {x:20, y:canvas.height - 20},
        curve.cp1,
        curve.cp2,
        {x:canvas.width - 20, y:20}
      ];
      for(var i=0;i<points.length;i++){
        var p = points[i];
        var dx = x - p.x;
        var dy = y - p.y;
        if(dx * dx + dy * dy <= 36){ hit = i; break; }
      }
      if(hit === 1 || hit === 2){ drag = hit; active = hit; draw(); }
    });

    canvas.addEventListener('pointermove', function(e){
      if(drag === null) return;
      var rect = canvas.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      var y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      if(drag === 1){ curve.cp1.x = Math.max(20, Math.min(canvas.width - 20, x)); curve.cp1.y = Math.max(20, Math.min(canvas.height - 20, y)); }
      if(drag === 2){ curve.cp2.x = Math.max(20, Math.min(canvas.width - 20, x)); curve.cp2.y = Math.max(20, Math.min(canvas.height - 20, y)); }
      draw();
    });

    canvas.addEventListener('pointerup', function(){ drag = null; });
    canvas.addEventListener('pointerleave', function(){ drag = null; });

    draw();
  }

  function getCurveControlPoints(id){
    var curve = GRAPH_CURVES && GRAPH_CURVES[id] ? GRAPH_CURVES[id] : [0.55,0, 0.45,1];
    var width = 320 - 40;
    var height = 180 - 40;
    return {
      cp1: {x: 20 + curve[0] * width, y: 180 - 20 - curve[1] * height},
      cp2: {x: 20 + curve[2] * width, y: 180 - 20 - curve[3] * height}
    };
  }

  function setPreviewCurveData(preview, curve){
    if(!preview) return;
    var samples = buildCurveSamples(curve);
    preview.dataset.curve = JSON.stringify(samples);
    preview.dataset.curveId = (document.getElementById('curveState') && document.getElementById('curveState').dataset.curveId) || 'easy-ease';
  }

  function buildCurveSamples(curve){
    var width = 320 - 40;
    var height = 180 - 40;
    var p0 = {x:0, y:0};
    var p1 = {x:(curve.cp1.x - 20) / width, y:1 - (curve.cp1.y - 20) / height};
    var p2 = {x:(curve.cp2.x - 20) / width, y:1 - (curve.cp2.y - 20) / height};
    var p3 = {x:1, y:1};
    var samples = [];
    var steps = 7;
    for(var i=0;i<steps;i++){
      var t = i / (steps - 1);
      var x = cubicBezier(t, p0.x, p1.x, p2.x, p3.x);
      var y = cubicBezier(t, p0.y, p1.y, p2.y, p3.y);
      samples.push(Math.max(0, Math.min(1, y)));
    }
    return samples;
  }

  function cubicBezier(t, p0, p1, p2, p3){
    var mt = 1 - t;
    return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
  }

  function renderView(query){
    var categories = [
      {key:'Text Animation', items:TEXT_ANIMATIONS},
      {key:'Animate', items:ANIMATE_ANIMATIONS},
      {key:'Shape', items:SHAPES}
    ];
    Accordion.render(categories);

    for(var i=0;i<categories.length;i++){
      var cat = categories[i];
      var items = cat.items;
      if(query){
        items = items.filter(function(a){
          return a.name.toLowerCase().indexOf(query) > -1 ||
                 a.desc.toLowerCase().indexOf(query) > -1;
        });
      }
      Renderer.render(cat.key, items, query);
    }

    // Collapse all by default
    if(!query){
      var accs = document.querySelectorAll('.accordion');
      for(var a=0;a<accs.length;a++) accs[a].classList.remove('open');
    } else {
      // Open all when searching
      var accs = document.querySelectorAll('.accordion');
      for(var a=0;a<accs.length;a++) accs[a].classList.add('open');
    }
  }

  var curveApply = document.getElementById('curveApply');
  var curveReset = document.getElementById('curveReset');

  if(curveApply){
    curveApply.addEventListener('click', function(){
      var state = document.getElementById('curveState');
      var preview = document.getElementById('curvePreview');
      var id = state && state.dataset.curveId ? state.dataset.curveId : 'easy-ease';
      var curve = preview && preview.dataset.curve ? JSON.parse(preview.dataset.curve) : null;
      Renderer.run('graph', id, { curve: curve, source: 'curve-editor' });
      if(state){ state.textContent = 'Curve diterapkan ke layer yang dipilih.'; }
    });
  }

  if(curveReset){
    curveReset.addEventListener('click', function(){
      var state = document.getElementById('curveState');
      var id = state && state.dataset.curveId ? state.dataset.curveId : 'easy-ease';
      if(state){ state.dataset.curveId = id; state.textContent = 'Kurva direset ke preset awal.'; }
      var preview = document.getElementById('curvePreview');
      initCurveCanvas(id, preview);
    });
  }

  // Hide settings on search
  document.getElementById('searchInput').addEventListener('input', function(){
    SettingsPanel.hide();
    renderCurveView(this.value);
  });

  renderView('');
  renderCurveView('');

  // Cmd+F / Ctrl+F focus search
  document.addEventListener('keydown', function(e){
    if((e.ctrlKey || e.metaKey) && e.key === 'f'){
      e.preventDefault();
      document.getElementById('searchInput').focus();
    }
  });

  // ─── AI Chat Tab ───
  Chat.init();
})();
