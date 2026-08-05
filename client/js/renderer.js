/* ─── Fast Bian — Renderer ─── */
var Renderer = (function(){
  var lastCard = null;

  function init(){
    document.getElementById('accordionContainer').addEventListener('click', function(e){
      var card = e.target.closest('.card');
      if(!card) return;
      var id = card.dataset.id;
      var type = card.dataset.type;
      if(!id || !type) return;
      lastCard = card;

      function openPanel(){
        // Show settings panel
        var name = (card.querySelector('.card-name') || {}).textContent || id;
        var data = type === 'text' ? (TEXT_ANIMATIONS.filter(function(a){return a.id===id;})[0] || {id:id, name:name})
          : type === 'shape' ? (SHAPES.filter(function(a){return a.id===id;})[0] || {id:id, name:name})
          : type === 'camera' ? (CAMERA_ANIMATIONS.filter(function(a){return a.id===id;})[0] || {id:id, name:name})
          : type === 'stabilizer' ? (STABILIZER_ANIMATIONS.filter(function(a){return a.id===id;})[0] || {id:id, name:name})
          : type === 'animate' ? (ANIMATE_ANIMATIONS.filter(function(a){return a.id===id;})[0] || {id:id, name:name})
          : (GRAPH_ANIMATIONS.filter(function(a){return a.id===id;})[0] || {id:id, name:name});
        SettingsPanel.show(type, data);
        // Auto-scroll ke atas biar panel setting keliatan
        var body = document.getElementById('body');
        if(body) body.scrollTop = 0;
      }

      // Animasi layer butuh seleksi — cek dulu sebelum buka panel
      if(type === 'animate'){
        var evalFn = getEval();
        if(evalFn){
          evalFn('FastBian_CheckSelection()', function(res){
            if(res === '0'){
              alert('Pilih layer dulu! Animasi akan diterapkan ke layer yang dipilih.');
            } else {
              openPanel();
            }
          });
          return;
        }
      }
      openPanel();
    });
  }

  function render(catKey, items, query){
    var grid = document.querySelector('.card-grid[data-cat="' + catKey + '"]');
    if(!grid) return;
    grid.innerHTML = '';

    for(var i=0;i<items.length;i++){
      var a = items[i];
      var nameHTML = query ? Search.highlightText(a.name, query) : a.name;
      var descHTML = query ? Search.highlightText(a.desc, query) : a.desc;
      var iconSVG = getIcon(catKey, a.icon);

      var card = document.createElement('div');
      card.className = 'card';
      card.dataset.id = a.id;
      card.dataset.type = catKey === 'Speed Graph' ? 'graph' : catKey === 'Shape' ? 'shape' : catKey === 'Camera Movement' ? 'camera' : catKey === 'Stabilizer Video' ? 'stabilizer' : catKey === 'Animate' ? 'animate' : 'text';
      card.innerHTML =
        '<div class="card-icon graph-icon">' + iconSVG + '</div>' +
        '<div class="card-name">' + nameHTML + '</div>' +
        '<div class="card-desc">' + descHTML + '</div>';
      grid.appendChild(card);
    }

    if(items.length === 0){
      grid.innerHTML =
        '<div class="empty-state">' +
          '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width="1.5"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="1.5"/></svg>' +
          '<p>Tidak ditemukan</p>' +
        '</div>';
    }
  }

  function getIcon(catKey, iconKey){
    if(catKey === 'Speed Graph'){
      return GRAPH_ICONS[iconKey] || GRAPH_ICONS['s-curve'];
    }
    if(catKey === 'Camera Movement'){
      return CAMERA_ICONS[iconKey] || CAMERA_ICONS['zoom-in'];
    }
    if(catKey === 'Stabilizer Video'){
      return STABILIZER_ICONS[iconKey] || STABILIZER_ICONS['wind'];
    }
    return LUCIDE_ICONS[iconKey] || LUCIDE_ICONS['circle'];
  }

  function run(type, id, params){
    params = params || {};
    var extPath = decodeURIComponent(window.location.href)
      .replace(/^file:\/\//,'')
      .replace(/\/client\/index\.html$/,'');
    var paramsJson = JSON.stringify(params);
    var script;
    if(type === 'graph'){
      script = 'FastBian_RunCustomGraph("' + id + '","' + extPath + '",' + JSON.stringify(paramsJson) + ')';
    } else if(type === 'shape'){
      script = 'FastBian_RunShape("' + id + '","' + extPath + '",' + JSON.stringify(paramsJson) + ')';
    } else if(type === 'camera'){
      script = 'FastBian_RunCamera("' + id + '","' + extPath + '",' + JSON.stringify(paramsJson) + ')';
    } else if(type === 'stabilizer'){
      script = 'FastBian_RunStabilizer("' + id + '","' + extPath + '")';
    } else if(type === 'animate'){
      script = 'FastBian_RunLayerAnimation("' + id + '","' + extPath + '",' + JSON.stringify(paramsJson) + ')';
    } else {
      script = 'FastBian_RunAnimation("' + id + '","' + extPath + '",' + JSON.stringify(paramsJson) + ')';
    }

    var evalFn = getEval();
    if(!evalFn){
      console.log('FastBian: CSInterface tidak tersedia. Simulasi: ' + id);
      return;
    }
    try {
      evalFn(script, function(res){
        res = (res == null) ? '' : String(res);
        if(res.indexOf('OK') === 0){
          fbToast('✅ ' + res.slice(9));
          if(lastCard) {
            document.querySelectorAll('.card.used').forEach(function(c){c.classList.remove('used');});
            lastCard.classList.add('used');
          }
          console.log('OK: ' + id);
        } else {
          // Bukan OK → tampilkan error (termasuk 'ERR:' ATAU exception mentah dari AE)
          alert('Fast Bian: ' + (res || 'Gagal tanpa pesan error. Cek apakah komposisi & layer aktif sudah benar.'));
          console.log('FastBian error:', res);
        }
      });
    } catch(e){
      alert('FastBian error: ' + e.message);
    }
  }

  function getEval(){
    if(typeof CSInterface !== 'undefined'){
      var cs = new CSInterface();
      return function(s, cb){ cs.evalScript(s, cb); };
    }
    if(window.__adobe_cep__ && typeof window.__adobe_cep__.evalScript === 'function'){
      return function(s, cb){ window.__adobe_cep__.evalScript(s, cb); };
    }
    if(window.cep && typeof window.cep.evalScript === 'function'){
      return function(s, cb){ window.cep.evalScript(s, cb); };
    }
    return null;
  }

  return {
    init: init,
    render: render,
    run: run,
    exec: exec
  };

  function exec(script){
    var evalFn = getEval();
    if(!evalFn){ console.log('FastBian: no bridge (simulasi): ' + script); return; }
    try { evalFn(script, function(){}); } catch(e){ alert('FastBian error: ' + e.message); }
  }

  // Toast feedback kecil di panel
  function fbToast(msg){
    var t = document.createElement('div');
    t.className = 'fb-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function(){ t.classList.add('show'); }, 10);
    setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 300); }, 3200);
  }
})();
