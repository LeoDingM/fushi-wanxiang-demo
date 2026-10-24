/* I11 native chunk registration: extends only the reserved eastern residential land. */
(function(){
 'use strict';const D=window.SCENE_DATA;if(!D||D.modernDistrict)return;D.modernDistrict=1;
 D.bounds=Object.assign({},D.bounds,{x1:Math.max(200,D.bounds.x1),y1:Math.max(56,D.bounds.y1)});
 const G=D.ground,end=G.origin[0]+G.cols*G.chunk,extra=Math.max(0,Math.ceil((200-end)/G.chunk));
 G.data_south_to_north=G.data_south_to_north.map(row=>row+'G'.repeat(extra));G.cols+=extra;
 function paint(rect,tile){
  for(let row=0;row<G.rows;row++)for(let col=0;col<G.cols;col++){
   const x=G.origin[0]+(col+.5)*G.chunk,y=G.origin[1]+(row+.5)*G.chunk;
   if(x>=rect[0]&&x<rect[2]&&y>=rect[1]&&y<rect[3]){const s=G.data_south_to_north[row];G.data_south_to_north[row]=s.slice(0,col)+tile+s.slice(col+1);}
  }
 }
 paint([160,-6,200,0],'A');paint([160,0,200,4],'S');paint([164,4,186,10],'K');paint([175.5,0,178.5,10],'S');
 paint([186,0,190,56],'S');paint([190,0,198,56],'A');paint([198,0,200,56],'S');paint([164,22,190,24],'S');paint([164,24,190,32],'A');paint([164,32,190,36],'S');
 D.chunks=(D.chunks||[]).concat([{id:'modern_residential',name:'澜山雅庭',rect:[160,0,200,56],src:'chunks/modern_residential.js',load_m:24,unload_m:48}]);
})();
