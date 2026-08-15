if(!__fb_layers) throw "No layers";
for(var i=0;i<__fb_layers.length;i++){
  var grp = __fb_layers[i].property("ADBE Transform Group");
  for(var j=1;j<=grp.numProperties;j++){
    var p = grp.property(j);
    if(p && p.numKeys > 0){
      var lk = p.numKeys;
      var lt = p.keyTime(lk);
      var lv = p.keyValue(lk);
      if(typeof lv === "number"){
        p.setValueAtTime(lt+0.15, lv*1.25);

        p.setValueAtTime(lt+0.45, lv);
      } else if(lv instanceof Array){
        var a1 = lv.slice(); var a2 = lv.slice();
        for(var ai=0;ai<a1.length;ai++){if(typeof a1[ai]==="number"){a1[ai]*=1.25;a2[ai]*=0.95;}}
        p.setValueAtTime(lt+0.15, a1);
        p.setValueAtTime(lt+0.45, lv);
      }
      for(var k=1;k<=p.numKeys;k++) p.setTemporalEaseAtKey(k,[new KeyframeEase(0,33.33)],[new KeyframeEase(0,50)]);
    }
  }
}
