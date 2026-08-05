// Mask Reveal — wipe reveal using linear wipe effect
if(!__fb_layers || !__fb_layers.length) throw "No layers";
var L = __fb_layers[0];
var ip = L.inPoint;
var dur = Math.max(L.outPoint - ip, 0.5);
var fx = L.property("ADBE Effect Parade").addProperty("ADBE Linear Wipe");
var trans = fx.property("ADBE Linear Wipe-0001");
var angle = fx.property("ADBE Linear Wipe-0002");
var feather = fx.property("ADBE Linear Wipe-0003");
trans.setValueAtTime(ip, 100);
trans.setValueAtTime(ip + dur*0.8, 0);
angle.setValue(0);
feather.setValue(5);
for(var k=1;k<=trans.numKeys;k++) trans.setTemporalEaseAtKey(k,[new KeyframeEase(0,33.33)],[new KeyframeEase(0,33.33)]);
