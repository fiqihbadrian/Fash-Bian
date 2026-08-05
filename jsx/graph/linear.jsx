if(!__fb_layers) throw "No layers";
for(var i=0;i<__fb_layers.length;i++){
  var grp = __fb_layers[i].property("ADBE Transform Group");
  for(var j=1;j<=grp.numProperties;j++){
    var p = grp.property(j);
    if(p && p.numKeys > 0){
      for(var k=1;k<=p.numKeys;k++) p.setInterpolationTypeAtKey(k,KeyframeInterpolationType.LINEAR,KeyframeInterpolationType.LINEAR);
    }
  }
}
