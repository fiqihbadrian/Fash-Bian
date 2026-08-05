// Word By Word
if(!__fb_layers || !__fb_layers.length) throw "No layers";
var L = __fb_layers[0];
var ip = L.inPoint;
var dur = Math.max(L.outPoint - ip, 1);
var txt = L.property("Source Text").value;
var ot = txt.text;
var esc = ot.replace(/\\/g,"\\\\\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n");
var words = ot.split(/\s+/);
var cnt = words.length || 1;
var fx = L.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
fx.name = "WordCount";
fx.property("Slider").setValueAtTime(ip, 0);
fx.property("Slider").setValueAtTime(ip + dur, cnt);
L.property("Source Text").expression = 'var idx=Math.floor(effect("WordCount")("Slider").value);var w="'+esc+'".split(/\\s+/);if(idx>w.length)idx=w.length;w.slice(0,idx).join(" ");';
for(var k=1;k<=fx.property("Slider").numKeys;k++) fx.property("Slider").setTemporalEaseAtKey(k,[new KeyframeEase(0,33.33)],[new KeyframeEase(0,33.33)]);
