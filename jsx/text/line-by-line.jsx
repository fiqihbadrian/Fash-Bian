// Line By Line — lines animate one after another
for(var ll=0; ll<__fb_layers.length; ll++){
  var L = __fb_layers[ll];
  var ip = L.inPoint;
  var dur = Math.max(L.outPoint - ip, 1);
  var txt = L.property("Source Text").value;
  var lines = txt.text.split("\n");
  var lineCount = Math.max(lines.length, 1);
  // Add text animator with Range Selector based on line
  var animators = L.property("ADBE Text Properties").property("ADBE Text Animators");
  var anim = animators.addProperty("ADBE Text Animator");
  anim.name = "Line Anim";
  var selector = anim.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
  // Set Units to Lines
  try{ selector.property("ADBE Text Selector Unit Type").setValue(3); }catch(e){} // 3=Lines
  // Add opacity to animator
  var opProp = anim.property("ADBE Text Animator Properties").addProperty("ADBE Text Opacity");
  opProp.setValue(0);
  // Animate Start
  var start = selector.property("ADBE Text Range Start");
  start.setValueAtTime(ip, 0);
  start.setValueAtTime(ip + dur, lineCount);
  var end = selector.property("ADBE Text Range End");
  end.setValueAtTime(ip, 1);
  end.setValueAtTime(ip + dur, lineCount + 1);
  var ei = new KeyframeEase(0,33.33);
  var eo = new KeyframeEase(0,33.33);
  for(var k=1; k<=start.numKeys; k++) start.setTemporalEaseAtKey(k, [ei], [eo]);
  for(var k=1; k<=end.numKeys; k++) end.setTemporalEaseAtKey(k, [ei], [eo]);
}
