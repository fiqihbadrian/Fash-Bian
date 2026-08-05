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
        p.setValueAtTime(lt+0.05, lv*1.4);
        p.setValueAtTime(lt+0.12, lv*0.8);
        p.setValueAtTime(lt+0.20, lv*1.1);
        p.setValueAtTime(lt+0.26, lv*0.95);
        p.setValueAtTime(lt+0.32, lv*1.02);
        p.setValueAtTime(lt+0.38, lv);
      } else if(lv instanceof Array){
        var o1=lv.slice(),o2=lv.slice(),o3=lv.slice(),o4=lv.slice();
        for(var ai=0;ai<o1.length;ai++){if(typeof o1[ai]==="number"){o1[ai]*=1.4;o2[ai]*=0.8;o3[ai]*=1.1;o4[ai]*=0.95;}}
        p.setValueAtTime(lt+0.05, o1);
        p.setValueAtTime(lt+0.12, o2);
        p.setValueAtTime(lt+0.20, o3);
        p.setValueAtTime(lt+0.26, o4);
        p.setValueAtTime(lt+0.32, lv);
      }
      for(var k=1;k<=p.numKeys;k++) p.setTemporalEaseAtKey(k,[new KeyframeEase(0,40)],[new KeyframeEase(0,40)]);
    }
  }
}
