// Fade Down
if(!__fb_layers || !__fb_layers.length) throw "No layers";
var L = __fb_layers[0];
var ip = L.inPoint;
var dur = Math.max(L.outPoint - ip, 0.5);
var grp = L.property("ADBE Transform Group");
var op = grp.property("ADBE Opacity");
var pos = grp.property("ADBE Position");
var sv = pos.value;
op.setValueAtTime(ip, 0);
op.setValueAtTime(ip + dur*0.6, 100);
pos.setValueAtTime(ip, [sv[0], sv[1]-60]);
pos.setValueAtTime(ip + dur*0.6, sv);
for(var k=1;k<=op.numKeys;k++) op.setTemporalEaseAtKey(k,[new KeyframeEase(0,33.33)],[new KeyframeEase(0,33.33)]);
for(var k=1;k<=pos.numKeys;k++) pos.setTemporalEaseAtKey(k,[new KeyframeEase(0,33.33)],[new KeyframeEase(0,33.33)]);
