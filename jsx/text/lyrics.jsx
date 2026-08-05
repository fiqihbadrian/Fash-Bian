// Lyrics Animation — color highlight fill across text
for(var ly=0; ly<__fb_layers.length; ly++){
  var L = __fb_layers[ly];
  var ip = L.inPoint;
  var dur = Math.max(L.outPoint - ip, 1);
  var txt = L.property("Source Text").value;
  var totalChars = txt.text.length;
  if(totalChars < 1) totalChars = 1;
  // Add text animator: Fill Color + Range Selector
  var animators = L.property("ADBE Text Properties").property("ADBE Text Animators");
  var anim = animators.addProperty("ADBE Text Animator");
  anim.name = "Lyrics";
  // Add Range Selector
  var selector = anim.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
  // Add Fill Color to animator
  var fillProp = anim.property("ADBE Text Animator Properties").addProperty("ADBE Text Fill Color");
  // Set highlight color (yellow/gold)
  fillProp.setValue([1, 0.84, 0, 1]);
  // Animate Start/End
  var start = selector.property("ADBE Text Range Start");
  start.setValueAtTime(ip, 0);
  start.setValueAtTime(ip + dur, totalChars);
  var end = selector.property("ADBE Text Range End");
  end.setValueAtTime(ip, 1);
  end.setValueAtTime(ip + dur, totalChars + 1);
  var ei = new KeyframeEase(0,33.33);
  var eo = new KeyframeEase(0,33.33);
  for(var k=1; k<=start.numKeys; k++) start.setTemporalEaseAtKey(k, [ei], [eo]);
  for(var k=1; k<=end.numKeys; k++) end.setTemporalEaseAtKey(k, [ei], [eo]);
}
