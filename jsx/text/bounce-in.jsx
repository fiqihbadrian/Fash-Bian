// Bounce In
if(!__fb_layers || !__fb_layers.length) throw "No layers";
var L = __fb_layers[0];
var ip = L.inPoint;
var dur = Math.max(L.outPoint - ip, 0.5);
var grp = L.property("ADBE Transform Group");
var pos = grp.property("ADBE Position");
var sv = pos.value;
pos.setValueAtTime(ip, [sv[0], -300]);
pos.setValueAtTime(ip + dur*0.2, sv);
pos.setValueAtTime(ip + dur*0.35, [sv[0], sv[1]+40]);
pos.setValueAtTime(ip + dur*0.5, sv);
pos.setValueAtTime(ip + dur*0.6, [sv[0], sv[1]+15]);
pos.setValueAtTime(ip + dur*0.7, sv);
pos.setValueAtTime(ip + dur*0.78, [sv[0], sv[1]+5]);
pos.setValueAtTime(ip + dur*0.85, sv);
for(var k=1;k<=pos.numKeys;k++) pos.setTemporalEaseAtKey(k,[new KeyframeEase(0,40)],[new KeyframeEase(0,40)]);
