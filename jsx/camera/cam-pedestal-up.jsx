// Pedestal Up
if(!__fb_layers||!__fb_layers.length) throw "No layers";
var comp = app.project.activeItem;
var cam = __fb_layers[0];
var ip = cam.inPoint;
var dur = Math.max(cam.outPoint-ip, 1);
var w=comp.width, h=comp.height, cx=w/2, cy=h/2;
var pos = cam.property("ADBE Transform Group").property("ADBE Position");
var poi = cam.property("ADBE Transform Group").property("ADBE Point of Interest");
var sv = pos.value;
var cz = sv.length>=3 ? sv[2] : -500;
pos.setValueAtTime(ip, [cx,cy+h*0.5,cz]);
pos.setValueAtTime(ip+dur, [cx,cy,cz]);
poi.setValueAtTime(ip,[cx,cy+h*0.5,0]);poi.setValueAtTime(ip+dur,[cx,cy,0]);
for(var k=1;k<=pos.numKeys;k++) pos.setTemporalEaseAtKey(k,[new KeyframeEase(0,33.33)],[new KeyframeEase(0,33.33)]);
