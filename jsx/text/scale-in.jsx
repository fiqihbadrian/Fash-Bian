// Scale In
if(!__fb_layers || !__fb_layers.length) throw "No layers";
var L = __fb_layers[0];
var ip = L.inPoint;
var dur = Math.max(L.outPoint - ip, 0.5);
var grp = L.property("ADBE Transform Group");
var sc = grp.property("ADBE Scale");
sc.setValueAtTime(ip, [0,0,100]);
sc.setValueAtTime(ip + dur*0.25, [120,120,100]);
sc.setValueAtTime(ip + dur*0.45, [90,90,100]);
sc.setValueAtTime(ip + dur*0.6, [100,100,100]);
for(var k=1;k<=sc.numKeys;k++) sc.setTemporalEaseAtKey(k,[new KeyframeEase(0,33.33)],[new KeyframeEase(0,33.33)]);
