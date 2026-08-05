// Character By Character — each character animates individually using text animator
for(var cc=0; cc<__fb_layers.length; cc++){
  var L = __fb_layers[cc];
  var ip = L.inPoint;
  var dur = Math.max(L.outPoint - ip, 1);
  var txt = L.property("Source Text").value;
  var totalChars = txt.text.length;
  // Add text animator: Range Selector + Opacity + Position
  var animators = L.property("ADBE Text Properties").property("ADBE Text Animators");
  var anim = animators.addProperty("ADBE Text Animator");
  anim.name = "Char Anim";
  // Add Range Selector
  var selector = anim.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
  // Add Opacity property to animator
  var opProp = anim.property("ADBE Text Animator Properties").addProperty("ADBE Text Opacity");
  // Set opacity to 0 for unselected
  opProp.setValue(0);
  // Animate the Start property of range selector
  var start = selector.property("ADBE Text Range Start");
  start.setValueAtTime(ip, 0);
  start.setValueAtTime(ip + dur*0.1, 0);
  start.setValueAtTime(ip + dur, totalChars);
  var end = selector.property("ADBE Text Range End");
  end.setValueAtTime(ip, 1);
  end.setValueAtTime(ip + dur, totalChars + 1);
  var ei = new KeyframeEase(0,33.33);
  var eo = new KeyframeEase(0,33.33);
  for(var k=1; k<=start.numKeys; k++) start.setTemporalEaseAtKey(k, [ei], [eo]);
  for(var k=1; k<=end.numKeys; k++) end.setTemporalEaseAtKey(k, [ei], [eo]);
}
