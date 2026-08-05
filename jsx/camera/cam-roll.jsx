// Roll
if(!__fb_layers||!__fb_layers.length) throw "No layers";
var cam = __fb_layers[0];
var ip = cam.inPoint;
var dur = Math.max(cam.outPoint-ip, 1);
var rot = cam.property("ADBE Transform Group").property("ADBE Rotate Z");
if(!rot) rot = cam.property("ADBE Transform Group").property("ADBE Rotation");
if(rot){
  rot.setValueAtTime(ip, 15);
  rot.setValueAtTime(ip+dur, 0);
  for(var k=1;k<=rot.numKeys;k++) rot.setTemporalEaseAtKey(k,[new KeyframeEase(0,33.33)],[new KeyframeEase(0,33.33)]);
}
