// Fast Bian — Host Script

function fb_getPropByNameOrIndex(parent, names, idx){
  try {
    if(!parent) return null;
    for(var i=0;i<names.length;i++){
      var p = parent.property(names[i]);
      if(p) return p;
    }
    if(typeof idx !== 'undefined'){
      try { return parent.property(idx); } catch(e){}
    }
  } catch(e){}
  return null;
}

function fb_addPropByName(parent, names, idx){
  try {
    if(!parent) return null;
    for(var i=0;i<names.length;i++){
      try { var p = parent.addProperty(names[i]); if(p) return p; } catch(e){}
    }
    if(typeof idx !== 'undefined'){
      try { return parent.property(idx); } catch(e){}
    }
  } catch(e){}
  return null;
}

// ─── Run Text Animation preset (bikin layer teks baru) ───
function FastBian_RunAnimation(id, extPath, paramsJson){
  app.beginUndoGroup('FastBian: ' + fb_label(id));
  try {
    if(!app.project) return 'ERR: No project opened.';
    var comp = app.project.activeItem;
    if(!comp || !(comp instanceof CompItem)) return 'ERR: No active composition.';

    var p = paramsJson ? eval('(' + paramsJson + ')') : {};
    var text = p.text || 'Fast Bian';
    var start = parseFloat(p.start) || comp.time;
    var dur = parseFloat(p.dur) || 2;
    var color = p.color || '#ffffff';
    var mode = p.mode || 'in';
    var loop = p.loop === true || p.loop === 1 || p.loop === '1';
    var amp = parseFloat(p.amp); if(isNaN(amp)) amp = 50; // Amplitude 0..100
    var freq = parseFloat(p.freq) || 1;
    var style = p.style || 'default';

    var L = comp.layers.addText(text);
    L.name = 'Fast Bian \u2014 ' + fb_label(id);
    L.inPoint = start;
    L.outPoint = start + dur;

    try {
      var textProp = L.property("ADBE Text Properties").property("ADBE Text Document");
      var doc = textProp.value;
      if(doc) {
        doc.fillColor = fb_parseColor(color);
        textProp.setValue(doc);
      }
    } catch(e) {}

    if(id === 'typewriter'){
      fb_runAnimationCode('typewriter', L, dur, { start: start });
    } else {
      fb_runLayerAnim(id, mode, L, dur, start, amp);
      if(loop) fb_applyLoopToKeys(L);
    }
    return 'OK: ' + fb_label(id) + ' applied (' + dur + 's)';
  } catch(e){
    return 'ERR: ' + e.toString();
  } finally {
    app.endUndoGroup();
  }
}

// ─── Run Shape preset ───
function FastBian_RunShape(id, extPath, paramsJson){
  app.beginUndoGroup('FastBian: ' + fb_label(id));
  try {
    if(!app.project) return 'ERR: No project opened.';
    var comp = app.project.activeItem;
    if(!comp || !(comp instanceof CompItem)) return 'ERR: No active composition.';

    var p = paramsJson ? eval('(' + paramsJson + ')') : {};
    var size = parseFloat(p.size) || 200;
    var color = p.color || '#ffffff';

    var L = comp.layers.addShape();
    L.name = 'Fast Bian \u2014 ' + fb_label(id);

    var root = L.property('ADBE Root Vectors Group');
    while(root && root.numProperties > 0) {
      try { root.property(1).remove(); } catch(e) { break; }
    }

    var group = fb_addPropByName(root, ['ADBE Vector Group'], 1);
    if(group) group.name = 'Shape';
    var vg = fb_getPropByNameOrIndex(group, ['ADBE Vectors Group', 'ADBE Vector Group'], 1);

    var shapeProp = null;
    if(id === 'rect' || id === 'square' || id === 'diamond'){
      shapeProp = fb_addPropByName(vg, ['ADBE Vector Shape - Rect'], 1);
      if(shapeProp){
        var r = shapeProp.value;
        if(r && typeof r.setSize === 'function'){
          if(id === 'square' || id === 'diamond') r.setSize([size, size]);
          else r.setSize([size, Math.round(size * 0.6)]);
          shapeProp.setValue(r);
        }
      }
      if(id === 'diamond'){
        var trans = fb_getPropByNameOrIndex(group, ['ADBE Vector Transform Group', 'Transform'], 2);
        var rot = trans ? fb_getPropByNameOrIndex(trans, ['ADBE Vector Rotation'], 1) : null;
        if(rot) rot.setValue(45);
      }
    } else if(id === 'circle' || id === 'ellipse'){
      shapeProp = fb_addPropByName(vg, ['ADBE Vector Shape - Ellipse'], 1);
      if(shapeProp){
        var e = shapeProp.value;
        if(e && typeof e.setSize === 'function'){
          if(id === 'circle') e.setSize([size, size]);
          else e.setSize([size, Math.round(size * 0.6)]);
          shapeProp.setValue(e);
        }
      }
    } else if(id === 'triangle' || id === 'pentagon' || id === 'hexagon' || id === 'star'){
      shapeProp = fb_addPropByName(vg, ['ADBE Vector Shape - Star'], 1);
      if(shapeProp){
        var st = shapeProp.value;
        if(st){
          st.starType = (id === 'star') ? 1 : 2;
          st.starPoints = (id === 'triangle') ? 3 : (id === 'pentagon') ? 5 : (id === 'hexagon') ? 6 : 5;
          st.starOuterRadius = size / 2;
          st.starInnerRadius = size / 4;
          st.starInnerRoundness = 0;
          st.starOuterRoundness = 0;
          shapeProp.setValue(st);
        }
      }
    }

    if(shapeProp && vg){
      var fill = fb_addPropByName(vg, ['ADBE Vector Graphic - Fill'], 2);
      if(fill){
        var fillColor = fb_getPropByNameOrIndex(fill, ['ADBE Vector Fill Color'], 1);
        if(fillColor) fillColor.setValue(fb_parseColor(color));
      }
    }

    return 'OK: ' + fb_label(id) + ' dibuat (' + size + 'px)';
  } catch(e){
    return 'ERR: ' + e.toString();
  } finally {
    app.endUndoGroup();
  }
}

// ─── Run Camera preset ───
function FastBian_RunCamera(id, extPath, paramsJson){
  app.beginUndoGroup('FastBian: ' + fb_label(id));
  try {
    if(!app.project) return 'ERR: No project opened.';
    var comp = app.project.activeItem;
    if(!comp || !(comp instanceof CompItem)) return 'ERR: No active composition.';

    var p = paramsJson ? eval('(' + paramsJson + ')') : {};
    var start = parseFloat(p.start) || comp.time;
    var dur = parseFloat(p.dur) || 3;

    var cam = fb_getCamera(comp);
    if(!cam) return 'ERR: Could not create camera.';

    fb_runCameraCode(id, cam, comp, start, dur);
    return 'OK: ' + fb_label(id) + ' (' + dur + 's)';
  } catch(e){
    return 'ERR: ' + e.toString();
  } finally {
    app.endUndoGroup();
  }
}

// ─── Get or create a Camera layer ───
function fb_getCamera(comp){
  // Find existing camera
  for(var i=1;i<=comp.layers.length;i++){
    var l = comp.layers[i];
    if(l instanceof CameraLayer) return l;
  }
  // Create new 50mm camera at current time
  comp.openInViewer();
  var cam = comp.layers.addCamera('Fast Bian Camera', [comp.width/2, comp.height/2]);
  cam.name = 'Fast Bian Camera';
  // Set zoom to 50mm equivalent
  var ci = cam.property("ADBE Camera Options");
  if(ci) try{ ci.property("ADBE Camera Zoom").setValue(500); }catch(e){}
  return cam;
}

// ─── Execute camera animation by ID ───
function fb_getCamProp(grp, matchName, idx){
  var p = grp.property(matchName);
  if(p) return p;
  // Fallback: use index (most reliable across AE versions)
  return grp.property(idx);
}
function fb_runCameraCode(id, cam, comp, start, dur){
  var ip = start;
  var w = comp.width;
  var h = comp.height;
  // Get Transform Group - try match name, localized name, then index 1
  var grp = cam.property("ADBE Transform Group") || cam.property("Transform") || cam.property(1);
  if(!grp) throw "Camera transform group not found";
  // Camera layers: index 1 = POI, index 2 = Position
  var poi = fb_getCamProp(grp, "ADBE Point of Interest", 1);
  var pos = fb_getCamProp(grp, "ADBE Position", 2);
  if(!pos || !poi) throw "Camera position or POI not found";
  var sv = pos.value;    // original position [x,y,z]
  var pv = poi.value;    // original POI [x,y,z]
  var cx = w/2, cy = h/2;
  var cz = sv.length >= 3 ? sv[2] : -500;  // default Z
  var radius = sv.length >= 3 ? Math.sqrt(Math.pow(sv[0]-cx,2)+Math.pow(sv[1]-cy,2)+Math.pow(cz+Math.abs(pv[2]||0),2)) : 500;
  if(radius < 100) radius = 500;

  switch(id){
    // ─── Push In (Dolly forward) ───
    case 'cam-push-in':{
      pos.setValueAtTime(ip, [cx, cy, cz - radius*0.6]);
      pos.setValueAtTime(ip + dur, [cx, cy, cz]);
      poi.setValueAtTime(ip, [cx, cy, 0]);
      poi.setValueAtTime(ip + dur, [cx, cy, 0]);
      fb_easeBiased(pos, 10, 75);
      break;
    }
    // ─── Push Out (Dolly backward) ───
    case 'cam-push-out':{
      pos.setValueAtTime(ip, [cx, cy, cz]);
      pos.setValueAtTime(ip + dur, [cx, cy, cz + radius*0.6]);
      poi.setValueAtTime(ip, [cx, cy, 0]);
      poi.setValueAtTime(ip + dur, [cx, cy, 0]);
      fb_easeBiased(pos, 10, 75);
      break;
    }
    // ─── Truck Left ───
    case 'cam-truck-left':{
      pos.setValueAtTime(ip, [cx + w*0.5, cy, cz]);
      pos.setValueAtTime(ip + dur, [cx, cy, cz]);
      poi.setValueAtTime(ip, [cx + w*0.5, cy, 0]);
      poi.setValueAtTime(ip + dur, [cx, cy, 0]);
      fb_easeBiased(pos, 10, 75);
      break;
    }
    // ─── Truck Right ───
    case 'cam-truck-right':{
      pos.setValueAtTime(ip, [cx - w*0.5, cy, cz]);
      pos.setValueAtTime(ip + dur, [cx, cy, cz]);
      poi.setValueAtTime(ip, [cx - w*0.5, cy, 0]);
      poi.setValueAtTime(ip + dur, [cx, cy, 0]);
      fb_easeBiased(pos, 10, 75);
      break;
    }
    // ─── Pedestal Up ───
    case 'cam-pedestal-up':{
      pos.setValueAtTime(ip, [cx, cy + h*0.5, cz]);
      pos.setValueAtTime(ip + dur, [cx, cy, cz]);
      poi.setValueAtTime(ip, [cx, cy + h*0.5, 0]);
      poi.setValueAtTime(ip + dur, [cx, cy, 0]);
      fb_easeBiased(pos, 10, 75);
      break;
    }
    // ─── Pedestal Down ───
    case 'cam-pedestal-down':{
      pos.setValueAtTime(ip, [cx, cy - h*0.5, cz]);
      pos.setValueAtTime(ip + dur, [cx, cy, cz]);
      poi.setValueAtTime(ip, [cx, cy - h*0.5, 0]);
      poi.setValueAtTime(ip + dur, [cx, cy, 0]);
      fb_easeBiased(pos, 10, 75);
      break;
    }
    // ─── Orbit Left ───
    case 'cam-orbit-left':{
      var ox = cx - radius;
      pos.setValueAtTime(ip, [ox, cy, cz]);
      pos.setValueAtTime(ip + dur, [cx, cy, cz]);
      poi.setValueAtTime(ip, [cx, cy, 0]);
      poi.setValueAtTime(ip + dur, [cx, cy, 0]);
      fb_easeBiased(pos, 10, 75);
      break;
    }
    // ─── Orbit Right ───
    case 'cam-orbit-right':{
      var ox = cx + radius;
      pos.setValueAtTime(ip, [ox, cy, cz]);
      pos.setValueAtTime(ip + dur, [cx, cy, cz]);
      poi.setValueAtTime(ip, [cx, cy, 0]);
      poi.setValueAtTime(ip + dur, [cx, cy, 0]);
      fb_easeBiased(pos, 10, 75);
      break;
    }
    // ─── Roll (Z rotation) ───
    case 'cam-roll':{
      var rot = fb_getCamProp(grp, "ADBE Rotation", 3);
      if(!rot) rot = fb_prop(grp, "ADBE Rotate Z");
      if(!rot) rot = fb_getCamProp(grp, "ADBE Orientation", 3);
      if(!rot) break;
      // Orientation is 3D vector, Rotation is single value
      var rv = rot.value;
      if(rv instanceof Array && rv.length === 3){
        rot.setValueAtTime(ip, [rv[0], rv[1], 15]);
        rot.setValueAtTime(ip + dur, [rv[0], rv[1], 0]);
      } else {
        rot.setValueAtTime(ip, 15);
        rot.setValueAtTime(ip + dur, 0);
      }
      fb_easeBiased(rot, 15, 75);
      break;
    }
  }
}

// ─── Run Stabilizer preset ───
function FastBian_RunStabilizer(id, extPath){
  try {
    if(!app.project) return 'ERR: No project opened.';
    var comp = app.project.activeItem;
    if(!comp || !(comp instanceof CompItem)) return 'ERR: No active composition.';
    var sel = comp.selectedLayers;
    if(sel.length === 0) return 'ERR: Select a video layer first.';

    fb_runStabilizerCode(id, sel);
    return 'OK: ' + fb_label(id) + ' applied';
  } catch(e){
    return 'ERR: ' + e.toString();
  } finally {
    app.endUndoGroup();
  }
}

// ─── Execute stabilizer by ID ───
function fb_runStabilizerCode(id, layers){
  for(var i=0;i<layers.length;i++){
    var fx = layers[i].property("ADBE Effect Parade");
    if(!fx) continue;
    var ws = fx.addProperty("ADBE Warp Stabilizer VFX");
    if(!ws) continue;

    // Try to set properties — indices vary by AE version, use try-catch
    try {
      switch(id){
        case 'stab-smooth':{
          // Method=Subspace Warp (default), Smoothness=50
          var met = ws.property(1); if(met) met.setValue(4);
          var smo = ws.property(2); if(smo) smo.setValue(50);
          var asf = ws.property(3); if(asf) asf.setValue(100);  // Additional Scale
          break;
        }
        case 'stab-lock':{
          // Method=Position Scale Rotation, Smoothness=100
          var met = ws.property(1); if(met) met.setValue(2);
          var smo = ws.property(2); if(smo) smo.setValue(100);
          break;
        }
        case 'stab-crop-less':{
          // Framing=Stabilize Only (no crop)
          var met = ws.property(1); if(met) met.setValue(4);
          var smo = ws.property(2); if(smo) smo.setValue(30);
          var asf = ws.property(3); if(asf) asf.setValue(120);
          // Try to disable auto-scale — property name varies
          break;
        }
        case 'stab-scale':{
          // Method=Position Scale Rotation
          var met = ws.property(1); if(met) met.setValue(2);
          var smo = ws.property(2); if(smo) smo.setValue(50);
          break;
        }
        case 'stab-roll':{
          // Method=Position (only translation, no roll)
          var met = ws.property(1); if(met) met.setValue(1);
          var smo = ws.property(2); if(smo) smo.setValue(70);
          break;
        }
      }
    } catch(e){}
  }
}

// ─── Cek ada layer terpilih (untuk alur Animate) ───
// Return: '0' = belum ada layer terpilih, '1' = ada
function FastBian_CheckSelection(){
  try {
    if(!app.project || !app.project.activeItem) return '0';
    return app.project.activeItem.selectedLayers.length > 0 ? '1' : '0';
  } catch(e){ return '0'; }
}

// ─── Bikin rotasi looping 0→360 di layer terpilih (dipakai AI chat juga) ───
function FastBian_ApplyRotationLoop(){
  app.beginUndoGroup('FastBian: Rotation Loop');
  try {
    if(!app.project) return 'ERR: No project opened.';
    var comp = app.project.activeItem;
    if(!comp || !(comp instanceof CompItem)) return 'ERR: No active composition.';
    var layers = comp.selectedLayers;
    if(layers.length === 0) return 'ERR: Select a layer first.';
    var done = 0;
    for(var i=0;i<layers.length;i++){
      var grp = layers[i].property("ADBE Transform Group");
      if(!grp) continue;
      var rot = grp.property("ADBE Rotation");
      if(!rot) continue;
      try { rot.expression = ''; } catch(e){}
      for(var k=rot.numKeys;k>=1;k--){ try { rot.removeKey(k); } catch(e){} }
      var t0 = layers[i].inPoint;
      rot.setValueAtTime(t0, 0);
      rot.setValueAtTime(t0 + 2, 360);
      rot.expression = 'loopOut("cycle")';
      done++;
    }
    return done > 0
      ? 'OK: Rotation loop (0-360°, 2 detik, loopOut cycle) diterapkan ke ' + done + ' layer'
      : 'ERR: Tidak ada layer terpilih yang punya properti Rotation.';
  } catch(e){
    return 'ERR: ' + e.toString();
  } finally { app.endUndoGroup(); }
}

// ─── Sidik jari scene (kompak) untuk verifikasi perubahan setelah eksekusi ───
function FastBian_SceneFingerprint(){
  try {
    if(!app.project || !app.project.activeItem) return 'none';
    var comp = app.project.activeItem;
    if(!(comp instanceof CompItem)) return 'none';
    var s = comp.name + '@' + comp.time.toFixed(2);
    var names = ["ADBE Position","ADBE Scale","ADBE Rotation","ADBE Opacity","ADBE Anchor Point"];
    var max = Math.min(comp.numLayers, 40);
    for(var i=1;i<=max;i++){
      var L = comp.layer(i);
      s += '|' + L.index + ':' + L.name;
      var grp = L.property("ADBE Transform Group");
      if(!grp) continue;
      for(var n=0;n<names.length;n++){
        var p = grp.property(names[n]);
        if(!p) continue;
        s += ';' + names[n].replace("ADBE ","") + ':' + p.numKeys + '=';
        try { var v = p.value; s += (typeof v === 'number') ? v.toFixed(1) : v.toString(); } catch(e){ s += '?'; }
      }
    }
    return s;
  } catch(e){ return 'none'; }
}

// ─── Info scene untuk AI chat: komposisi + daftar layer + seleksi + keyframe ───
function FastBian_GetSceneInfo(){
  try {
    if(!app.project || !app.project.activeItem) return '{"comp":null,"layers":[]}';
    var comp = app.project.activeItem;
    if(!(comp instanceof CompItem)) return '{"comp":null,"layers":[]}';
    var out = { comp: comp.name, time: comp.time, duration: comp.duration, layers: [] };
    var max = Math.min(comp.numLayers, 40);
    for(var i=1;i<=max;i++){
      var L = comp.layer(i);
      var info = { index:i, name:L.name, selected:false, type:'unknown', keys:null };
      try { info.selected = L.selected; } catch(e){}
      try {
        if(L.property("ADBE Text Properties")) info.type = 'text';
        else if(L instanceof ShapeLayer) info.type = 'shape';
        else if(L instanceof CameraLayer) info.type = 'camera';
        else if(L instanceof LightLayer) info.type = 'light';
        else if(L.source instanceof SolidSource) info.type = 'solid';
        else if(L instanceof AVLayer && L.hasVideo && L.hasAudio) info.type = 'video';
        else if(L instanceof AVLayer && L.hasVideo) info.type = 'video';
        else if(L instanceof AVLayer && L.hasAudio) info.type = 'audio';
      } catch(e){}
      var grp = L.property("ADBE Transform Group");
      if(grp){
        var names = ["ADBE Position","ADBE Scale","ADBE Rotation","ADBE Opacity","ADBE Anchor Point"];
        var arr = [];
        for(var n=0;n<names.length;n++){
          var p = grp.property(names[n]);
          if(p && p.numKeys >= 1) arr.push(names[n].replace("ADBE ","") + "(" + p.numKeys + ")");
        }
        if(arr.length > 0) info.keys = arr;
      }
      out.layers.push(info);
    }
    return JSON.stringify(out);
  } catch(e){
    return '{"comp":null,"layers":[]}';
  }
}

// ─── Apply animasi ke layer yang dipilih (bukan bikin layer baru) ───
function FastBian_RunLayerAnimation(id, extPath, paramsJson){
  var p = paramsJson ? eval('(' + paramsJson + ')') : {};
  var dur = Math.max(0.2, parseFloat(p.dur) || 2);
  var mode = p.mode || 'in';
  var loop = p.loop === true || p.loop === 1 || p.loop === '1';
  var amp = parseFloat(p.amp); if(isNaN(amp)) amp = 50; // Amplitude 0..100
  app.beginUndoGroup('FastBian: ' + fb_label(id) + ' ' + mode);
  try {
    if(!app.project) return 'ERR: No project opened.';
    var comp = app.project.activeItem;
    if(!comp || !(comp instanceof CompItem)) return 'ERR: No active composition.';
    var layers = comp.selectedLayers;
    if(layers.length === 0) return 'ERR: Select a layer first.';
    for(var i=0;i<layers.length;i++){
      fb_runLayerAnim(id, mode, layers[i], dur, comp.time, amp);
      if(loop) fb_applyLoopToKeys(layers[i]);
    }
    return 'OK: ' + fb_label(id) + ' (' + mode + ', ' + dur + 's' + (loop ? ', loop' : '') + ')';
  } catch(e){
    return 'ERR: ' + e.toString();
  } finally {
    app.endUndoGroup();
  }
}

// ─── Satu gaya animasi dengan 3 mode: in / out / center ───
function fb_runLayerAnim(id, mode, L, dur, start, amp){
  var grp = L.property("ADBE Transform Group");
  if(!grp) throw "Transform group not found";
  var hh = L.containingComp.height;
  var ip = start;
  var F = (typeof amp === 'number' && amp > 0) ? amp/50 : 1; // 0..100 → 0..2; 50 = standar

  // Shake — digarap manual (envelope sinus = mulai/berhenti halus, tanpa sentakan)
  if(id === 'shake'){
    var pos = fb_prop(grp, "ADBE Position");
    var op  = fb_prop(grp, "ADBE Opacity");
    var sv = pos.value;
    if(pos) fb_shakeKeys(pos, sv, ip, dur, ((mode === 'out') ? 16 : 12) * F);
    if(op){
      if(mode === 'in'){ op.setValueAtTime(ip, 0); op.setValueAtTime(ip + dur*0.25, 100); fb_easeBiased(op, 60, 10); }
      else if(mode === 'out'){ op.setValueAtTime(ip, 100); op.setValueAtTime(ip + dur*0.7, 100); op.setValueAtTime(ip + dur, 0); fb_easeBiased(op, 60, 10); }
    }
    return;
  }

  // Mode Masuk — pakai preset reveal yang sudah ada
  if(mode === 'in'){
    var inMap = { bounce:'bounce-in', pop:'pop-in', fade:'fade-in', slide:'slide-up', swing:'bounce-rotate' };
    fb_runAnimationCode(inMap[id] || 'pop-in', L, dur, { start: start });
    return;
  }

  var pos = fb_prop(grp, "ADBE Position");
  var sc  = fb_prop(grp, "ADBE Scale");
  var op  = fb_prop(grp, "ADBE Opacity");
  var rot = fb_prop(grp, "ADBE Rotation");
  var sv = pos ? pos.value : null;

  // Mode Keluar
  if(mode === 'out'){
    switch(id){
      case 'fade': fb_runAnimationCode('fade-out', L, dur, { start: start }); break;
      case 'pop':  fb_runAnimationCode('scale-out', L, dur, { start: start }); break;
      case 'bounce':{
        if(pos) pos.setValueAtTime(ip, sv);
        if(op){ op.setValueAtTime(ip, 100); op.setValueAtTime(ip + dur*0.3, 100); op.setValueAtTime(ip + dur, 0); fb_easeBiased(op, 60, 10); }
        if(pos){ pos.setValueAtTime(ip + dur*0.3, sv); pos.setValueAtTime(ip + dur, [sv[0], sv[1] - hh*0.5*F]); fb_easeBiased(pos, 10, 75); }
        break;
      }
      case 'slide':{
        if(op){ op.setValueAtTime(ip, 100); op.setValueAtTime(ip + dur*0.6, 100); op.setValueAtTime(ip + dur, 0); fb_easeBiased(op, 60, 10); }
        if(pos){ pos.setValueAtTime(ip, sv); pos.setValueAtTime(ip + dur*0.7, sv); pos.setValueAtTime(ip + dur, [sv[0], sv[1] + hh*0.6*F]); fb_easeBiased(pos, 10, 75); }
        break;
      }
      case 'swing':{
        if(op){ op.setValueAtTime(ip, 100); op.setValueAtTime(ip + dur*0.5, 100); op.setValueAtTime(ip + dur, 0); fb_easeBiased(op, 60, 10); }
        if(rot){ rot.setValueAtTime(ip, 0); rot.setValueAtTime(ip + dur*0.15, 8*F); rot.setValueAtTime(ip + dur*0.35, -6*F); rot.setValueAtTime(ip + dur*0.6, 4*F); rot.setValueAtTime(ip + dur, -14*F); fb_easeBiased(rot, 10, 75); }
        break;
      }
    }
    return;
  }

  // Mode Dari Tengah — langsung gerak dari posisi sekarang
  switch(id){
    case 'bounce':{
      if(pos){ pos.setValueAtTime(ip, sv);
        pos.setValueAtTime(ip + dur*0.25, [sv[0], sv[1] - 60*F]);
        pos.setValueAtTime(ip + dur*0.5, sv);
        pos.setValueAtTime(ip + dur*0.75, [sv[0], sv[1] - 30*F]);
        pos.setValueAtTime(ip + dur, sv);
        fb_easeBiased(pos, 8, 70);
      }
      break;
    }
    case 'pop':{
      if(sc){ sc.setValueAtTime(ip, [100,100]);
        sc.setValueAtTime(ip + dur*0.2, [100+18*F,100+18*F]);
        sc.setValueAtTime(ip + dur*0.45, [100-8*F,100-8*F]);
        sc.setValueAtTime(ip + dur*0.7, [100+8*F,100+8*F]);
        sc.setValueAtTime(ip + dur, [100,100]);
        fb_easeBiased(sc, 8, 70);
      }
      break;
    }
    case 'fade':{
      if(op){ op.setValueAtTime(ip, 100);
        op.setValueAtTime(ip + dur*0.25, 100-60*F);
        op.setValueAtTime(ip + dur*0.5, 100);
        op.setValueAtTime(ip + dur*0.75, 100-60*F);
        op.setValueAtTime(ip + dur, 100);
        fb_easeBiased(op, 30, 60);
      }
      break;
    }
    case 'slide':{
      if(pos){ pos.setValueAtTime(ip, sv);
        pos.setValueAtTime(ip + dur*0.5, [sv[0], sv[1] - 50*F]);
        pos.setValueAtTime(ip + dur, sv);
        fb_easeBiased(pos, 10, 70);
      }
      break;
    }
    case 'swing':{
      if(rot){ rot.setValueAtTime(ip, 0);
        rot.setValueAtTime(ip + dur*0.25, 8*F);
        rot.setValueAtTime(ip + dur*0.5, 0);
        rot.setValueAtTime(ip + dur*0.75, -8*F);
        rot.setValueAtTime(ip + dur, 0);
        fb_easeBiased(rot, 10, 70);
      }
      break;
    }
  }
}

// ─── Keyframe shake halus: envelope sinus + osilasi posisi ───
function fb_shakeKeys(pos, sv, ip, dur, amp){
  var N = 8;
  for(var k=0;k<=N;k++){
    var env = Math.sin(Math.PI*k/N); // 0 → 1 → 0: mulai & berhenti pelan
    var o = (k%2===0) ? 1 : -1;
    pos.setValueAtTime(ip + dur*k/N, [sv[0] + amp*env*o, sv[1] - amp*0.5*env*o]);
  }
  fb_easeBiased(pos, 25, 60);
}

// ─── Pasang expression loop pingpong ke semua properti transform ber-keyframe ───
function fb_applyLoopToKeys(layer){
  var grp = layer.property("ADBE Transform Group");
  if(!grp) return;
  for(var j=1;j<=grp.numProperties;j++){
    var p = grp.property(j);
    if(!p || p.numKeys < 2) continue;
    try { p.expression = 'loopOut("pingpong")'; } catch(e){}
  }
}

// ─── Run Speed Graph preset ───
function FastBian_RunGraph(id, extPath){
  try {
    if(!app.project) return 'ERR: No project opened.';
    var comp = app.project.activeItem;
    if(!comp || !(comp instanceof CompItem)) return 'ERR: No active composition.';
    var sel = comp.selectedLayers;
    if(sel.length === 0) return 'ERR: Select a layer with keyframes first.';
    var hasKeys = false;
    for(var i=0;i<sel.length;i++){ if(fb_hasAnyKeys(sel[i])){ hasKeys=true; break; } }
    if(!hasKeys) return 'ERR: No keyframes found on selected layers.';

    fb_runGraphCode(id, sel);
    return 'OK: ' + fb_label(id) + ' applied';
  } catch(e){
    return 'ERR: ' + e.toString();
  }
}

// ─── Null-safe accessor: balikin properti asli atau stub no-op kalau null ───
// Mencegah "TypeError: null is not an object" saat layer tak punya properti tertentu (mis. camera).
function fb_prop(grp, name){
  var p = null;
  try { p = grp.property(name); } catch(e){}
  if(p) return p;
  return {
    value:[0,0], numKeys:0, propertyValueType:undefined,
    setValueAtTime:function(){}, setValue:function(){},
    setTemporalEaseAtKey:function(){}, removeKey:function(){},
    keyTime:function(){return 0;}, keyScale:function(){},
    velocityAtTime:function(){return {value:0};}
  };
}

// ─── Execute animation by ID ───
function fb_parseColor(color){
  try {
    if(!color) return [1,1,1];
    if(color.indexOf('#') === 0){
      var hex = color.replace('#','');
      if(hex.length === 3) hex = hex.split('').map(function(c){return c+c;}).join('');
      if(hex.length === 6){
        var r = parseInt(hex.substr(0,2),16)/255;
        var g = parseInt(hex.substr(2,2),16)/255;
        var b = parseInt(hex.substr(4,2),16)/255;
        return [r,g,b];
      }
    }
  } catch(e){}
  return [1,1,1];
}

function fb_runAnimationCode(id, L, dur, opts){
  opts = opts || {};
  var ip = (opts && opts.start) ? opts.start : L.inPoint;
  var grp = L.property("ADBE Transform Group");
  if(!grp) throw "Transform group not found";
  var hw = L.containingComp.width;
  var hh = L.containingComp.height;

  switch(id){
    // ─── Fade In ───
    case 'fade-in':{
      var op = fb_prop(grp, "ADBE Opacity");
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.05, 0);
      op.setValueAtTime(ip + dur*0.75, 100);
      fb_easeBiased(op, 20, 70);
      break;
    }
    // ─── Fade Out ───
    case 'fade-out':{
      var op = fb_prop(grp, "ADBE Opacity");
      op.setValueAtTime(ip, 100);
      op.setValueAtTime(ip + dur*0.15, 100);
      op.setValueAtTime(ip + dur*0.85, 0);
      op.setValueAtTime(ip + dur, 0);
      fb_easeBiased(op, 70, 20);
      break;
    }
    // ─── Fade Up ───
    case 'fade-up':{
      var op = fb_prop(grp, "ADBE Opacity");
      var pos = fb_prop(grp, "ADBE Position");
      var sv = pos.value;
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.05, 0);
      op.setValueAtTime(ip + dur*0.8, 100);
      pos.setValueAtTime(ip, [sv[0], sv[1]+70]);
      pos.setValueAtTime(ip + dur*0.7, sv);
      fb_easeBiased(op, 20, 65);
      fb_easeBiased(pos, 15, 75);
      break;
    }
    // ─── Fade Down ───
    case 'fade-down':{
      var op = fb_prop(grp, "ADBE Opacity");
      var pos = fb_prop(grp, "ADBE Position");
      var sv = pos.value;
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.05, 0);
      op.setValueAtTime(ip + dur*0.8, 100);
      pos.setValueAtTime(ip, [sv[0], sv[1]-70]);
      pos.setValueAtTime(ip + dur*0.7, sv);
      fb_easeBiased(op, 20, 65);
      fb_easeBiased(pos, 15, 75);
      break;
    }
    // ─── Slide Left ───
    case 'slide-left':{
      var op = fb_prop(grp, "ADBE Opacity");
      var pos = fb_prop(grp, "ADBE Position");
      var sv = pos.value;
      pos.setValueAtTime(ip, [sv[0]+hw*0.5+200, sv[1]]);
      pos.setValueAtTime(ip + dur*0.8, sv);
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.05, 0);
      op.setValueAtTime(ip + dur*0.6, 100);
      fb_easeBiased(pos, 10, 80);
      fb_easeBiased(op, 20, 60);
      break;
    }
    // ─── Slide Right ───
    case 'slide-right':{
      var op = fb_prop(grp, "ADBE Opacity");
      var pos = fb_prop(grp, "ADBE Position");
      var sv = pos.value;
      pos.setValueAtTime(ip, [sv[0]-hw*0.5-200, sv[1]]);
      pos.setValueAtTime(ip + dur*0.8, sv);
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.05, 0);
      op.setValueAtTime(ip + dur*0.6, 100);
      fb_easeBiased(pos, 10, 80);
      fb_easeBiased(op, 20, 60);
      break;
    }
    // ─── Slide Up ───
    case 'slide-up':{
      var op = fb_prop(grp, "ADBE Opacity");
      var pos = fb_prop(grp, "ADBE Position");
      var sv = pos.value;
      pos.setValueAtTime(ip, [sv[0], sv[1]+hh*0.5+200]);
      pos.setValueAtTime(ip + dur*0.8, sv);
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.05, 0);
      op.setValueAtTime(ip + dur*0.6, 100);
      fb_easeBiased(pos, 10, 80);
      fb_easeBiased(op, 20, 60);
      break;
    }
    // ─── Slide Down ───
    case 'slide-down':{
      var op = fb_prop(grp, "ADBE Opacity");
      var pos = fb_prop(grp, "ADBE Position");
      var sv = pos.value;
      pos.setValueAtTime(ip, [sv[0], sv[1]-hh*0.5-200]);
      pos.setValueAtTime(ip + dur*0.8, sv);
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.05, 0);
      op.setValueAtTime(ip + dur*0.6, 100);
      fb_easeBiased(pos, 10, 80);
      fb_easeBiased(op, 20, 60);
      break;
    }
    // ─── Scale In ───
    case 'scale-in':{
      var sc = fb_prop(grp, "ADBE Scale");
      var op = fb_prop(grp, "ADBE Opacity");
      sc.setValueAtTime(ip, [0,0]);
      sc.setValueAtTime(ip + dur*0.2, [115,115]);
      sc.setValueAtTime(ip + dur*0.4, [92,92]);
      sc.setValueAtTime(ip + dur*0.55, [108,108]);
      sc.setValueAtTime(ip + dur*0.7, [100,100]);
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.05, 0);
      op.setValueAtTime(ip + dur*0.5, 100);
      fb_easeBiased(sc, 10, 70);
      fb_easeBiased(op, 20, 60);
      break;
    }
    // ─── Scale Out ───
    case 'scale-out':{
      var sc = fb_prop(grp, "ADBE Scale");
      var op = fb_prop(grp, "ADBE Opacity");
      sc.setValueAtTime(ip, [100,100]);
      sc.setValueAtTime(ip + dur*0.15, [105,105]);
      sc.setValueAtTime(ip + dur*0.3, [95,95]);
      sc.setValueAtTime(ip + dur*0.5, [0,0]);
      op.setValueAtTime(ip, 100);
      op.setValueAtTime(ip + dur*0.3, 100);
      op.setValueAtTime(ip + dur*0.5, 0);
      fb_easeBiased(sc, 60, 10);
      fb_easeBiased(op, 60, 10);
      break;
    }
    // ─── Pop In ───
    case 'pop-in':{
      var sc = fb_prop(grp, "ADBE Scale");
      var op = fb_prop(grp, "ADBE Opacity");
      sc.setValueAtTime(ip, [0,0]);
      sc.setValueAtTime(ip + dur*0.12, [128,128]);
      sc.setValueAtTime(ip + dur*0.28, [82,82]);
      sc.setValueAtTime(ip + dur*0.45, [112,112]);
      sc.setValueAtTime(ip + dur*0.6, [100,100]);
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.05, 0);
      op.setValueAtTime(ip + dur*0.4, 100);
      fb_easeBiased(sc, 5, 65);
      fb_easeBiased(op, 20, 55);
      break;
    }
    // ─── Bounce In ───
    case 'bounce-in':{
      var pos = fb_prop(grp, "ADBE Position");
      var sv = pos.value;
      pos.setValueAtTime(ip, [sv[0], -hh*0.5-200]);
      pos.setValueAtTime(ip + dur*0.2, sv);
      pos.setValueAtTime(ip + dur*0.35, [sv[0], sv[1]+70]);
      pos.setValueAtTime(ip + dur*0.5, sv);
      pos.setValueAtTime(ip + dur*0.62, [sv[0], sv[1]+30]);
      pos.setValueAtTime(ip + dur*0.73, sv);
      pos.setValueAtTime(ip + dur*0.8, [sv[0], sv[1]+8]);
      pos.setValueAtTime(ip + dur*0.88, sv);
      fb_easeBiased(pos, 5, 60);
      break;
    }
    // ─── Blur In ───
    case 'blur-in':{
      var fx = L.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2");
      if(!fx) throw "Gaussian Blur effect not found";
      var blur = fx.property(1);
      if(!blur) throw "Blurriness property not found";
      blur.setValueAtTime(ip, 60);
      blur.setValueAtTime(ip + dur*0.05, 60);
      blur.setValueAtTime(ip + dur*0.65, 0);
      var op = fb_prop(grp, "ADBE Opacity");
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.05, 0);
      op.setValueAtTime(ip + dur*0.6, 100);
      fb_easeBiased(blur, 15, 75);
      fb_easeBiased(op, 20, 65);
      break;
    }
    // ─── Typewriter ───
    case 'typewriter':{
      var txt = L.property("Source Text").value;
      var ot = txt.text;
      var esc = ot.replace(/\\/g,"\\\\\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n");
      var fx = L.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
      fx.name = "Typewriter";
      var sl = fx.property("Slider");
      sl.setValueAtTime(ip, 0);
      sl.setValueAtTime(ip + dur, ot.length + 1);
      for(var kk=1;kk<=sl.numKeys;kk++) sl.setInterpolationTypeAtKey(kk,KeyframeInterpolationType.LINEAR,KeyframeInterpolationType.LINEAR);
      L.property("Source Text").expression = 'var t=effect("Typewriter")("Slider").value;var s="'+esc+'";if(t>s.length)t=s.length;s.substr(0,Math.floor(t));';
      break;
    }
    // ─── Word by Word ───
    case 'word-by-word':{
      var txt = L.property("Source Text").value;
      var ot = txt.text;
      var esc = ot.replace(/\\/g,"\\\\\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n");
      var words = ot.split(/\s+/);
      var cnt = words.length || 1;
      var fx = L.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
      fx.name = "WordCount";
      var sl = fx.property("Slider");
      sl.setValueAtTime(ip, 0);
      sl.setValueAtTime(ip + dur, cnt + 1);
      for(var kk=1;kk<=sl.numKeys;kk++) sl.setInterpolationTypeAtKey(kk,KeyframeInterpolationType.LINEAR,KeyframeInterpolationType.LINEAR);
      L.property("Source Text").expression = 'var idx=Math.floor(effect("WordCount")("Slider").value);var w="'+esc+'".split(/\\s+/);if(idx>w.length)idx=w.length;w.slice(0,idx).join(" ");';
      break;
    }
    // ─── Char by Char (embedded text, like typewriter) ───
    case 'char-by-char':{
      var txt = L.property("Source Text").value;
      var ot = txt.text;
      var esc = ot.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n");
      var cnt = ot.length || 1;
      var fx = L.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
      fx.name = "CharReveal";
      var sl = fx.property("Slider");
      sl.setValueAtTime(ip, 0);
      sl.setValueAtTime(ip + dur*0.05, 0);
      sl.setValueAtTime(ip + dur, cnt + 1);
      for(var kk=1;kk<=sl.numKeys;kk++) sl.setInterpolationTypeAtKey(kk,KeyframeInterpolationType.LINEAR,KeyframeInterpolationType.LINEAR);
      L.property("Source Text").expression = 'var t=Math.floor(effect("CharReveal")("Slider").value);var s="'+esc+'";if(t>s.length)t=s.length;s.substr(0,t);';
      break;
    }
    // ─── Line by Line (text animator, no expression) ───
    case 'line-by-line':{
      var txt = L.property("Source Text").value;
      var ot = txt.text;
      var lines = ot.split('\n');
      var cnt = lines.length || 1;
      var tProps = L.property("ADBE Text Properties");
      var ag = tProps.property("ADBE Text Animators");
      var an = ag.addProperty("ADBE Text Animator");
      an.name = "LineReveal";
      var sg=null, pg=null;
      for(var gi=1;gi<=an.numProperties;gi++){
        var p2=an.property(gi);
        if(!p2) continue;
        var mn=p2.matchName||'';
        if(mn.indexOf('Selector')>=0) sg=p2;
        if(mn.indexOf('Property')>=0||mn.indexOf('Animator Properties')>=0) pg=p2;
      }
      if(!sg) sg=an.property(1);
      if(!pg) pg=an.property(2);
      var sel = sg.addProperty("ADBE Text Selector");
      try{ var ut=sel.property("ADBE Text Selector Unit Type"); if(ut) ut.setValue(3); }catch(e){}
      var op = pg.addProperty("ADBE Text Opacity");
      if(op) op.setValue(0);
      var st = sel.property("ADBE Text Range Start");
      if(st){ st.setValueAtTime(ip,0); st.setValueAtTime(ip+dur*0.05,0); st.setValueAtTime(ip+dur,cnt); fb_easeBiased(st,15,75); }
      var en = sel.property("ADBE Text Range End");
      if(en) en.setValue(cnt);
      break;
    }
    // ─── Fade Up Per Word (text animator, words reveal upward) ───
    case 'fade-up-word':{
      var txt = L.property("Source Text").value;
      var ot = txt.text;
      var esc = ot.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n");
      var words = ot.split(/\s+/);
      var cnt = words.length || 1;
      var fx = L.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
      fx.name = "FadeUpWord";
      var sl = fx.property("Slider");
      sl.setValueAtTime(ip, 0);
      sl.setValueAtTime(ip + dur, cnt + 1);
      for(var kk=1;kk<=sl.numKeys;kk++) sl.setInterpolationTypeAtKey(kk,KeyframeInterpolationType.LINEAR,KeyframeInterpolationType.LINEAR);
      L.property("Source Text").expression = 'var idx=Math.floor(effect("FadeUpWord")("Slider").value);var w="'+esc+'".split(/\\s+/);if(idx>w.length)idx=w.length;w.slice(0,idx).join(" ");';
      var op = fb_prop(grp, "ADBE Opacity");
      var pos = fb_prop(grp, "ADBE Position");
      var sv = pos.value;
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.05, 0);
      op.setValueAtTime(ip + dur*0.8, 100);
      pos.setValueAtTime(ip, [sv[0], sv[1]+70]);
      pos.setValueAtTime(ip + dur*0.7, sv);
      fb_easeBiased(op, 20, 65);
      fb_easeBiased(pos, 15, 75);
      break;
    }
    // ─── Fade Down Per Word (expression + layer transform) ───
    case 'fade-down-word':{
      var txt = L.property("Source Text").value;
      var ot = txt.text;
      var esc = ot.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n");
      var words = ot.split(/\s+/);
      var cnt = words.length || 1;
      var fx = L.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
      fx.name = "FadeDownWord";
      var sl = fx.property("Slider");
      sl.setValueAtTime(ip, 0);
      sl.setValueAtTime(ip + dur, cnt + 1);
      for(var kk=1;kk<=sl.numKeys;kk++) sl.setInterpolationTypeAtKey(kk,KeyframeInterpolationType.LINEAR,KeyframeInterpolationType.LINEAR);
      L.property("Source Text").expression = 'var idx=Math.floor(effect("FadeDownWord")("Slider").value);var w="'+esc+'".split(/\\s+/);if(idx>w.length)idx=w.length;w.slice(0,idx).join(" ");';
      var op = fb_prop(grp, "ADBE Opacity");
      var pos = fb_prop(grp, "ADBE Position");
      var sv = pos.value;
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.05, 0);
      op.setValueAtTime(ip + dur*0.8, 100);
      pos.setValueAtTime(ip, [sv[0], sv[1]-70]);
      pos.setValueAtTime(ip + dur*0.7, sv);
      fb_easeBiased(op, 20, 65);
      fb_easeBiased(pos, 15, 75);
      break;
    }
    // ─── Lyrics / Karaoke (text animator, fill color only, no opacity) ───
    case 'lyrics':{
      fb_addKaraokeRange(L, ip, dur, 'Lyrics', [1,0.84,0]);
      break;
    }
    case 'karaoke':{
      fb_addKaraokeRange(L, ip, dur, 'Karaoke', [1,0.84,0]);
      break;
    }
    // ─── Word Stranger ───
    case 'word-stranger':{
      var op = fb_prop(grp, "ADBE Opacity");
      var pos = fb_prop(grp, "ADBE Position");
      var sc = fb_prop(grp, "ADBE Scale");
      var sv = pos.value;
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.2, 100);
      pos.setValueAtTime(ip, [sv[0]-50, sv[1]+16]);
      pos.setValueAtTime(ip + dur*0.3, [sv[0]+10, sv[1]-6]);
      pos.setValueAtTime(ip + dur*0.65, [sv[0]-4, sv[1]+2]);
      pos.setValueAtTime(ip + dur, sv);
      sc.setValueAtTime(ip, [84,84]);
      sc.setValueAtTime(ip + dur*0.3, [112,112]);
      sc.setValueAtTime(ip + dur*0.7, [96,96]);
      sc.setValueAtTime(ip + dur, [100,100]);
      fb_easeBiased(op, 20, 70);
      fb_easeBiased(pos, 10, 75);
      fb_easeBiased(sc, 15, 70);
      break;
    }
    // ─── Hero Reveal ───
    case 'hero-reveal':{
      var op = fb_prop(grp, "ADBE Opacity");
      var pos = fb_prop(grp, "ADBE Position");
      var sc = fb_prop(grp, "ADBE Scale");
      var sv = pos.value;
      var fx = L.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2");
      var blur = fx.property(1);
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.2, 100);
      pos.setValueAtTime(ip, [sv[0], sv[1]+24]);
      pos.setValueAtTime(ip + dur*0.75, sv);
      sc.setValueAtTime(ip, [55,55]);
      sc.setValueAtTime(ip + dur*0.25, [116,116]);
      sc.setValueAtTime(ip + dur*0.7, [98,98]);
      sc.setValueAtTime(ip + dur, [100,100]);
      blur.setValueAtTime(ip, 36);
      blur.setValueAtTime(ip + dur*0.3, 0);
      fb_easeBiased(op, 15, 70);
      fb_easeBiased(pos, 12, 78);
      fb_easeBiased(sc, 12, 70);
      fb_easeBiased(blur, 15, 75);
      break;
    }
    // ─── Bounce Up ───
    case 'bounce-up':{
      var op = fb_prop(grp, "ADBE Opacity");
      var pos = fb_prop(grp, "ADBE Position");
      var sv = pos.value;
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.1, 100);
      pos.setValueAtTime(ip, [sv[0], sv[1]+90]);
      pos.setValueAtTime(ip + dur*0.2, [sv[0], sv[1]-16]);
      pos.setValueAtTime(ip + dur*0.36, [sv[0], sv[1]+6]);
      pos.setValueAtTime(ip + dur*0.5, [sv[0], sv[1]-3]);
      pos.setValueAtTime(ip + dur, sv);
      fb_easeBiased(op, 20, 70);
      fb_easeBiased(pos, 8, 70);
      break;
    }
    // ─── Bounce Rotate ───
    case 'bounce-rotate':{
      var op = fb_prop(grp, "ADBE Opacity");
      var pos = fb_prop(grp, "ADBE Position");
      var rot = fb_prop(grp, "ADBE Rotation");
      var sv = pos.value;
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.1, 100);
      pos.setValueAtTime(ip, [sv[0]+18, sv[1]+70]);
      pos.setValueAtTime(ip + dur*0.24, [sv[0]-10, sv[1]-12]);
      pos.setValueAtTime(ip + dur*0.4, [sv[0]+5, sv[1]+4]);
      pos.setValueAtTime(ip + dur, sv);
      rot.setValueAtTime(ip, -8);
      rot.setValueAtTime(ip + dur*0.25, 6);
      rot.setValueAtTime(ip + dur*0.55, -2);
      rot.setValueAtTime(ip + dur, 0);
      fb_easeBiased(op, 20, 70);
      fb_easeBiased(pos, 8, 75);
      fb_easeBiased(rot, 10, 75);
      break;
    }
    // ─── Iris ───
    case 'iris':{
      var op = fb_prop(grp, "ADBE Opacity");
      var sc = fb_prop(grp, "ADBE Scale");
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.18, 100);
      sc.setValueAtTime(ip, [10,10]);
      sc.setValueAtTime(ip + dur*0.3, [118,118]);
      sc.setValueAtTime(ip + dur*0.72, [95,95]);
      sc.setValueAtTime(ip + dur, [100,100]);
      fb_easeBiased(op, 18, 72);
      fb_easeBiased(sc, 12, 70);
      break;
    }
    // ─── Number ───
    case 'number':{
      var op = fb_prop(grp, "ADBE Opacity");
      var sc = fb_prop(grp, "ADBE Scale");
      var rot = fb_prop(grp, "ADBE Rotation");
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.12, 100);
      sc.setValueAtTime(ip, [70,70]);
      sc.setValueAtTime(ip + dur*0.22, [112,112]);
      sc.setValueAtTime(ip + dur*0.5, [96,96]);
      sc.setValueAtTime(ip + dur, [100,100]);
      rot.setValueAtTime(ip, 6);
      rot.setValueAtTime(ip + dur*0.4, -2);
      rot.setValueAtTime(ip + dur, 0);
      fb_easeBiased(op, 15, 70);
      fb_easeBiased(sc, 10, 72);
      fb_easeBiased(rot, 12, 75);
      break;
    }
    // ─── Letter Stranger ───
    case 'letter-stranger':{
      var op = fb_prop(grp, "ADBE Opacity");
      var pos = fb_prop(grp, "ADBE Position");
      var rot = fb_prop(grp, "ADBE Rotation");
      var sv = pos.value;
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.15, 100);
      pos.setValueAtTime(ip, [sv[0]-24, sv[1]+12]);
      pos.setValueAtTime(ip + dur*0.28, [sv[0]+12, sv[1]-7]);
      pos.setValueAtTime(ip + dur*0.55, [sv[0]-6, sv[1]+3]);
      pos.setValueAtTime(ip + dur, sv);
      rot.setValueAtTime(ip, 8);
      rot.setValueAtTime(ip + dur*0.35, -5);
      rot.setValueAtTime(ip + dur*0.7, 2);
      rot.setValueAtTime(ip + dur, 0);
      fb_easeBiased(op, 20, 70);
      fb_easeBiased(pos, 10, 78);
      fb_easeBiased(rot, 12, 72);
      break;
    }
    // ─── Burst ───
    case 'burst':{
      var op = fb_prop(grp, "ADBE Opacity");
      var sc = fb_prop(grp, "ADBE Scale");
      var rot = fb_prop(grp, "ADBE Rotation");
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.15, 100);
      sc.setValueAtTime(ip, [15,15]);
      sc.setValueAtTime(ip + dur*0.2, [140,140]);
      sc.setValueAtTime(ip + dur*0.55, [92,92]);
      sc.setValueAtTime(ip + dur, [100,100]);
      rot.setValueAtTime(ip, -12);
      rot.setValueAtTime(ip + dur*0.3, 8);
      rot.setValueAtTime(ip + dur, 0);
      fb_easeBiased(op, 12, 68);
      fb_easeBiased(sc, 8, 70);
      fb_easeBiased(rot, 10, 75);
      break;
    }
    // ─── Soft Bounce ───
    case 'soft-bounce':{
      var op = fb_prop(grp, "ADBE Opacity");
      var pos = fb_prop(grp, "ADBE Position");
      var sc = fb_prop(grp, "ADBE Scale");
      var sv = pos.value;
      op.setValueAtTime(ip, 0);
      op.setValueAtTime(ip + dur*0.08, 100);
      pos.setValueAtTime(ip, [sv[0], sv[1]+45]);
      pos.setValueAtTime(ip + dur*0.25, [sv[0], sv[1]-10]);
      pos.setValueAtTime(ip + dur*0.5, [sv[0], sv[1]+4]);
      pos.setValueAtTime(ip + dur, sv);
      sc.setValueAtTime(ip, [92,92]);
      sc.setValueAtTime(ip + dur*0.35, [104,104]);
      sc.setValueAtTime(ip + dur, [100,100]);
      fb_easeBiased(op, 20, 70);
      fb_easeBiased(pos, 12, 75);
      fb_easeBiased(sc, 16, 72);
      break;
    }
    // ─── Mask Reveal ───
    case 'mask-reveal':{
      var fx = L.property("ADBE Effect Parade").addProperty("ADBE Linear Wipe");
      var trans = fx.property("ADBE Linear Wipe-0001");
      var angle = fx.property("ADBE Linear Wipe-0002");
      var feather = fx.property("ADBE Linear Wipe-0003");
      trans.setValueAtTime(ip, 100);
      trans.setValueAtTime(ip + dur*0.05, 100);
      trans.setValueAtTime(ip + dur*0.75, 0);
      angle.setValue(0);
      feather.setValue(10);
      fb_easeBiased(trans, 15, 75);
      break;
    }
  }
}

// ─── Execute graph by ID ───
function fb_runGraphCode(id, layers){
  for(var i=0;i<layers.length;i++){
    var grp = layers[i].property("ADBE Transform Group");
    if(!grp) continue;
    for(var j=1;j<=grp.numProperties;j++){
      var p = grp.property(j);
      if(!p || p.numKeys < 1) continue;
      var origCount = p.numKeys;
      var easeIn = fb_makeEaseArr(p, 0, 33.33);
      var easeOut = fb_makeEaseArr(p, 0, 33.33);
      var easeIn80 = fb_makeEaseArr(p, 0, 80);
      var easeOut80 = fb_makeEaseArr(p, 0, 80);
      var easeIn20 = fb_makeEaseArr(p, 0, 20);
      var easeOut20 = fb_makeEaseArr(p, 0, 20);
      var easeIn50 = fb_makeEaseArr(p, 0, 50);
      var easeOut50 = fb_makeEaseArr(p, 0, 50);
      var easeIn10 = fb_makeEaseArr(p, 0, 10);
      var easeOut10 = fb_makeEaseArr(p, 0, 10);
      var easeOut90 = fb_makeEaseArr(p, 0, 90);
      var easeIn35 = fb_makeEaseArr(p, 0, 35);
      var easeOut65 = fb_makeEaseArr(p, 0, 65);
      var easeIn60 = fb_makeEaseArr(p, 0, 60);
      var easeOut60 = fb_makeEaseArr(p, 0, 60);
      var easeIn40 = fb_makeEaseArr(p, 0, 40);
      var easeOut40 = fb_makeEaseArr(p, 0, 40);
      var easeIn30 = fb_makeEaseArr(p, 0, 30);
      var easeOut30 = fb_makeEaseArr(p, 0, 30);
      for(var k=1;k<=origCount;k++){
        try {
          switch(id){
            case 'easy-ease':         p.setTemporalEaseAtKey(k,easeIn,easeOut); break;
            case 'smooth':            p.setTemporalEaseAtKey(k,easeIn50,easeOut50); break;
            case 'cinematic':         p.setTemporalEaseAtKey(k,easeIn10,easeOut90); break;
            case 'fast-out-slow-in':  p.setTemporalEaseAtKey(k,easeIn80,easeOut20); break;
            case 'fast-in-slow-out':  p.setTemporalEaseAtKey(k,easeIn35,easeOut65); break;
            case 'heavy-ease':        p.setTemporalEaseAtKey(k,easeIn10,easeOut10); break;
            case 'soft-ease':         p.setTemporalEaseAtKey(k,easeIn60,easeOut60); break;
            case 'linear':            p.setInterpolationTypeAtKey(k,KeyframeInterpolationType.LINEAR,KeyframeInterpolationType.LINEAR); break;
            case 'overshoot':         p.setTemporalEaseAtKey(k,easeIn,easeOut50); break;
            case 'bounce':            p.setTemporalEaseAtKey(k,easeIn40,easeOut40); break;
            case 'elastic':           p.setTemporalEaseAtKey(k,easeIn30,easeOut30); break;
          }
        } catch(e){}
      }
      while(p.numKeys > origCount) p.removeKey(p.numKeys);
    }
  }
}

// ─── Apply custom curve (gambar kurva easing) ke selected keys ───
function FastBian_RunCustomGraph(id, extPath, paramsJson){
  app.beginUndoGroup('FastBian: Custom Kurva');
  try {
    if(!app.project) return 'ERR: No project opened.';
    var comp = app.project.activeItem;
    if(!comp || !(comp instanceof CompItem)) return 'ERR: No active composition.';
    var sel = comp.selectedLayers;
    if(sel.length === 0) return 'ERR: Select a layer with keyframes first.';

    var p = paramsJson ? eval('(' + paramsJson + ')') : {};
    var curve = (p && p.curve) || null;
    if(!curve || curve.length < 3) {
      curve = fb_curveFromPreset(id);
    }
    if(!curve || curve.length < 3) return 'ERR: Kurva tidak valid.';

    var applied = 0;
    for(var i=0;i<sel.length;i++){
      var grp = sel[i].property('ADBE Transform Group');
      if(!grp) continue;
      for(var j=1;j<=grp.numProperties;j++){
        var prop = grp.property(j);
        if(!prop || prop.numKeys < 2) continue;
        fb_applyCustomCurve(prop, curve);
        applied++;
      }
    }
    if(applied === 0) return 'ERR: No keyframes found on selected layers.';
    return 'OK: Kurva diterapkan ke ' + applied + ' properti';
  } catch(e){
    return 'ERR: ' + e.toString();
  } finally {
    app.endUndoGroup();
  }
}

function fb_curveFromPreset(id){
  var preset = {
    'easy-ease':[0.55,0,0.45,1],
    'smooth':[0.33,0,0.67,1],
    'cinematic':[0.68,0,1,1],
    'fast-out-slow-in':[0,0,0.58,1],
    'fast-in-slow-out':[0.42,0,1,1],
    'heavy-ease':[0.82,0,0.8,1],
    'soft-ease':[0.28,0,0.72,1],
    'linear':[0.334,0.334,0.667,0.667],
    'overshoot':[0.52,0.28,0.2,1.28],
    'bounce':[0.6,0,0.4,1],
    'elastic':[0.5,0,0.5,1]
  };
  var values = preset[id] || preset['easy-ease'];
  return [0, values[0], values[2], 1];
}

// ─── Terapkan kurva custom pada easing existing keyframe tanpa menambah keyframe baru ───
function fb_applyCustomCurve(p, curve){
  try {
    var origN = p.numKeys;
    if(origN < 2) return;
    var values = [];
    for(var k=1;k<=origN;k++){
      values.push({
        time: p.keyTime(k),
        value: p.keyValue(k)
      });
    }

    for(var k=1;k<=origN;k++){
      try {
        var easeIn = [];
        var easeOut = [];
        var count = 1;
        var pt = p.propertyValueType;
        if(pt === 2 || pt === 3) count = pt;
        else {
          var val = p.value;
          if(typeof val === 'object' && val !== null && typeof val.length === 'number')
            count = Math.max(1, Math.min(3, val.length));
        }
        for(var i=0;i<count;i++){
          easeIn.push(new KeyframeEase(0, 100));
          easeOut.push(new KeyframeEase(0, 100));
        }
        p.setTemporalEaseAtKey(k, easeIn, easeOut);
      } catch(e){}
    }

    for(var k=1;k<=origN;k++){
      try { p.setRovingAtKey(k, false); } catch(e){}
    }
  } catch(e){}
}

// ─── Buat array KeyframeEase sesuai dimensi property ───
function fb_makeEaseArr(prop, speed, influence){
  try {
    var count = 1;
    var pt = prop.propertyValueType;
    if(pt === 2 || pt === 3) count = pt;
    else {
      var val = prop.value;
      if(typeof val === 'object' && val !== null && typeof val.length === 'number')
        count = Math.max(1, Math.min(3, val.length));
    }
    var arr = [];
    for(var i=0;i<count;i++) arr.push(new KeyframeEase(speed, influence));
    return arr;
  } catch(e){ return [new KeyframeEase(speed, influence)]; }
}

// ─── Bikin text animator range reveal (char/line/lyrics/karaoke) ───
function fb_addKaraokeRange(L, ip, dur, animName, fillColor){
  try {
    var txt = L.property("Source Text"); if(!txt) return;
    var td = txt.value; if(!td) return;
    var len = td.text.length || 1;
    var textProps = L.property("ADBE Text Properties"); if(!textProps) return;
    var animatorsGroup = textProps.property("ADBE Text Animators"); if(!animatorsGroup) return;
    var an = animatorsGroup.addProperty("ADBE Text Animator"); if(!an) return;
    an.name = animName;

    var selGroup = null, propGroup = null;
    for(var gi=1;gi<=an.numProperties;gi++){
      var pg = an.property(gi);
      if(!pg) continue;
      var mn = pg.matchName || '';
      if(mn.indexOf('Selector') >= 0) selGroup = pg;
      if(mn.indexOf('Property') >= 0 || mn.indexOf('Animator Properties') >= 0) propGroup = pg;
    }
    if(!selGroup && an.property(1) && an.property(1).addProperty) selGroup = an.property(1);
    if(!propGroup && an.property(2) && an.property(2).addProperty) propGroup = an.property(2);
    if(!selGroup || !propGroup) return;

    var sel = selGroup.addProperty("ADBE Text Selector"); if(!sel) return;
    try{ var ut = sel.property("ADBE Text Selector Unit Type"); if(ut) ut.setValue(0); }catch(e){}

    // Add Fill Color only — NO opacity change (text stays visible)
    if(fillColor){
      try{
        var fc = propGroup.addProperty("ADBE Text Fill Color");
        if(fc) fc.setValue(fillColor);
      }catch(e){}
    }

    var st = sel.property("ADBE Text Range Start"); if(st){
      st.setValueAtTime(ip, 0);
      st.setValueAtTime(ip + dur*0.05, 0);
      st.setValueAtTime(ip + dur, len);
      fb_easeBiased(st, 20, 65);
    }
    var en = sel.property("ADBE Text Range End"); if(en){
      en.setValueAtTime(ip, 1);
      en.setValueAtTime(ip + dur*0.05, 1);
      en.setValueAtTime(ip + dur, len + 1);
      fb_easeBiased(en, 20, 65);
    }
  }catch(e){}
}

// ─── Add extra keyframes for overshoot/bounce/elastic ───
function fb_addExtraKeys(p, id){
  if(p.matchName === "ADBE Opacity") return; // 0-100 clamp, skip overshoot/bounce/elastic
  var lk = p.numKeys;
  var lt = p.keyTime(lk);
  var lv = p.keyValue(lk);
  if(typeof lv === "number"){
    if(id === 'overshoot'){
      p.setValueAtTime(lt+0.15, lv*1.25);
      p.setValueAtTime(lt+0.45, lv);
    } else if(id === 'bounce'){
      p.setValueAtTime(lt+0.05, lv*1.4);
      p.setValueAtTime(lt+0.12, lv*0.8);
      p.setValueAtTime(lt+0.20, lv*1.1);
      p.setValueAtTime(lt+0.26, lv*0.95);
      p.setValueAtTime(lt+0.32, lv*1.02);
      p.setValueAtTime(lt+0.38, lv);
    } else if(id === 'elastic'){
      for(var o=0;o<6;o++){
        var t = (o+1)*0.04;
        var f = 1+0.6*Math.pow(0.7,o)*Math.sin(o*1.8);
        p.setValueAtTime(lt+t, lv*f);
      }
      p.setValueAtTime(lt+0.28, lv);
    }
  } else if(lv instanceof Array){
    if(id === 'overshoot'){
      var a1=lv.slice();
      for(var ai=0;ai<a1.length;ai++){if(typeof a1[ai]==="number")a1[ai]*=1.25;}
      p.setValueAtTime(lt+0.15, a1);
      p.setValueAtTime(lt+0.45, lv);
    } else if(id === 'bounce'){
      var a1=lv.slice(),a2=lv.slice(),a3=lv.slice(),a4=lv.slice();
      for(var ai=0;ai<a1.length;ai++){if(typeof a1[ai]==="number"){a1[ai]*=1.4;a2[ai]*=0.8;a3[ai]*=1.1;a4[ai]*=0.95;}}
      p.setValueAtTime(lt+0.05, a1);p.setValueAtTime(lt+0.12, a2);
      p.setValueAtTime(lt+0.20, a3);p.setValueAtTime(lt+0.26, a4);
      p.setValueAtTime(lt+0.32, lv);
    } else if(id === 'elastic'){
      for(var o=0;o<6;o++){
        var t = (o+1)*0.04;
        var f = 1+0.6*Math.pow(0.7,o)*Math.sin(o*1.8);
        var a=lv.slice();
        for(var ai=0;ai<a.length;ai++){if(typeof a[ai]==="number")a[ai]*=f;}
        p.setValueAtTime(lt+t, a);
      }
      p.setValueAtTime(lt+0.28, lv);
    }
  }
}

// ─── Apply easing to all keys ───
function fb_easeAll(prop, influence){
  try {
    var infl = influence || 55;
    var arr = fb_makeEaseArr(prop, 0, infl);
    for(var k=1;k<=prop.numKeys;k++){
      prop.setTemporalEaseAtKey(k, arr, arr);
    }
  } catch(e){}
}

// ─── Asymmetric easing: fast-in slow-out ───
function fb_easeBiased(prop, easeInInfl, easeOutInfl){
  try {
    var ein = fb_makeEaseArr(prop, 0, easeInInfl);
    var eout = fb_makeEaseArr(prop, 0, easeOutInfl);
    for(var k=1;k<=prop.numKeys;k++){
      prop.setTemporalEaseAtKey(k, ein, eout);
    }
  } catch(e){}
}

// ─── Undo / Redo via AE (native menu) ───
function FB_Undo(){
  try { app.executeCommand(2958); return 'OK: Undo'; }
  catch(e){ return 'ERR: ' + e.toString(); }
}
function FB_Redo(){
  try { app.executeCommand(2959); return 'OK: Redo'; }
  catch(e){ return 'ERR: ' + e.toString(); }
}

// ─── Label from animation id ───
function fb_label(id){
  return id.replace(/-/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();});
}

// ─── Helper: check if a layer has any keyframes ───
function fb_hasAnyKeys(layer){
  try {
    var grp = layer.property("ADBE Transform Group");
    if(!grp) return false;
    for(var i=1;i<=grp.numProperties;i++){
      var p = grp.property(i);
      if(p && p.numKeys > 0) return true;
    }
  } catch(e){}
  return false;
}
