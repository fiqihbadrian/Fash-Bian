if(!__fb_layers) throw "No layers";
for(var i=0;i<__fb_layers.length;i++){
  var grp = __fb_layers[i].property("ADBE Transform Group");
  for(var j=1;j<=grp.numProperties;j++){
    var p = grp.property(j);
    if(p && p.numKeys > 0){
      var lk = p.numKeys;
      var lt = p.keyTime(lk);
      var lv = p.keyValue(lk);
      var t=0,step=0.04;
      for(var osc=0;osc<6;osc++){
        t+=step;
        var f=1+0.6*Math.pow(0.7,osc)*Math.sin(osc*1.8);
        if(typeof lv==="number"){p.setValueAtTime(lt+t,lv*f);}
        else if(lv instanceof Array){var a=lv.slice();for(var ai=0;ai<a.length;ai++){if(typeof a[ai]==="number")a[ai]*=f;}p.setValueAtTime(lt+t,a);}
      }
      t+=step;
      p.setValueAtTime(lt+t,lv);
      for(var k=1;k<=p.numKeys;k++) p.setTemporalEaseAtKey(k,[new KeyframeEase(0,30)],[new KeyframeEase(0,30)]);
    }
  }
}
