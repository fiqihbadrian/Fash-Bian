// Typewriter
if(!__fb_layers || !__fb_layers.length) throw "No layers";
var L = __fb_layers[0];
var ip = L.inPoint;
var dur = Math.max(L.outPoint - ip, 1);
var txt = L.property("Source Text").value;
var ot = txt.text;
var esc = ot.replace(/\\/g,"\\\\\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n");
var fx = L.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
fx.name = "Typewriter";
fx.property("Slider").setValueAtTime(ip, 0);
fx.property("Slider").setValueAtTime(ip + dur, ot.length);
L.property("Source Text").expression = 'var t=effect("Typewriter")("Slider").value;var s="'+esc+'";if(t>s.length)t=s.length;s.substr(0,Math.floor(t));';
for(var k=1;k<=fx.property("Slider").numKeys;k++) fx.property("Slider").setTemporalEaseAtKey(k,[new KeyframeEase(0,33.33)],[new KeyframeEase(0,33.33)]);
