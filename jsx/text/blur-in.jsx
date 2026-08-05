// Blur In
if(!__fb_layers || !__fb_layers.length) throw "No layers";
var L = __fb_layers[0];
var ip = L.inPoint;
var dur = Math.max(L.outPoint - ip, 0.5);
var fx = L.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2");
var blur = fx.property("ADBE Gaussian Blur 2-1");
blur.setValueAtTime(ip, 50);
blur.setValueAtTime(ip + dur*0.7, 0);
var op = L.property("ADBE Transform Group").property("ADBE Opacity");
op.setValueAtTime(ip, 0);
op.setValueAtTime(ip + dur*0.05, 0);
op.setValueAtTime(ip + dur*0.7, 100);
for(var k=1;k<=blur.numKeys;k++) blur.setTemporalEaseAtKey(k,[new KeyframeEase(0,33.33)],[new KeyframeEase(0,33.33)]);
for(var k=1;k<=op.numKeys;k++) op.setTemporalEaseAtKey(k,[new KeyframeEase(0,33.33)],[new KeyframeEase(0,33.33)]);
