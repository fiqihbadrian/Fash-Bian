// Fade Out
if(!__fb_layers || !__fb_layers.length) throw "No layers";
var L = __fb_layers[0];
var ip = L.inPoint;
var dur = Math.max(L.outPoint - ip, 0.5);
var grp = L.property("ADBE Transform Group");
var op = grp.property("ADBE Opacity");
op.setValueAtTime(ip, 100);
op.setValueAtTime(ip + dur*0.4, 100);
op.setValueAtTime(ip + dur, 0);
for(var k=1;k<=op.numKeys;k++) op.setTemporalEaseAtKey(k,[new KeyframeEase(0,33.33)],[new KeyframeEase(0,33.33)]);
