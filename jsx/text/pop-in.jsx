// Pop In
if(!__fb_layers || !__fb_layers.length) throw "No layers";
var L = __fb_layers[0];
var ip = L.inPoint;
var dur = Math.max(L.outPoint - ip, 0.5);
var grp = L.property("ADBE Transform Group");
var sc = grp.property("ADBE Scale");
sc.setValueAtTime(ip, [0,0,100]);
sc.setValueAtTime(ip + dur*0.15, [130,130,100]);
sc.setValueAtTime(ip + dur*0.35, [85,85,100]);
sc.setValueAtTime(ip + dur*0.5, [110,110,100]);
sc.setValueAtTime(ip + dur*0.65, [100,100,100]);
for(var k=1;k<=sc.numKeys;k++) sc.setTemporalEaseAtKey(k,[new KeyframeEase(0,33.33)],[new KeyframeEase(0,33.33)]);
