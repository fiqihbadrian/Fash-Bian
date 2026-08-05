// Scale Stabilize
if(!__fb_layers||!__fb_layers.length) throw "No layers";
var ws = __fb_layers[0].property("ADBE Effect Parade").addProperty("ADBE Warp Stabilizer VFX");
try{ var m=ws.property(1); if(m) m.setValue(2); }catch(e){}
try{ var s=ws.property(2); if(s) s.setValue(50); }catch(e){}
