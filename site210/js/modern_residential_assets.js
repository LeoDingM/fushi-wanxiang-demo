/* I11: compose native frames/masks before core, after existing asset extensions. */
(function(){
 'use strict';const A=window.KIT_MODERN_RESIDENTIAL,KI=window.KIT_INT_MANIFEST,SK=window.STORE_KIT;
 if(!A||!KI||!SK)throw new Error('Modern residential manifest must precede asset loader');
 const off=Math.max(SK.size[1],...Object.values(KI.frames).map(f=>f[1]+f[3]))+4;
 for(const [key,f]of Object.entries(A.frames))KI.frames[key]=[f[0],f[1]+off,...f.slice(2)];
 Object.assign(KI.pieces,A.pieces);Object.assign(KI.masks,A.masks);KI.emit=(KI.emit||[]).concat(A.emit);
 // Solid repairs reserve native projected frames synchronously before later kits.
 const repairs=[],start=Math.max(...Object.values(KI.frames).map(f=>f[1]+f[3]))+4;let rx=0,ry=start,row=0;
 function asset(type,state,rot,geo,draw){
  const polys=[],paint=(pts,col)=>polys.push([pts,col]),box=(x0,y0,z0,x1,y1,z1,col)=>{paint([[x0,y0,z0],[x0,y1,z0],[x0,y1,z1],[x0,y0,z1]],col[0]);paint([[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],col[1]);paint([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],col[2]);};
  draw(box,paint);const a=rot*Math.PI/4,c=Math.cos(a),s=Math.sin(a),project=p=>{const x=p[0]*c-p[1]*s,y=p[0]*s+p[1]*c;return[(x-y)*32,-(x+y)*16-p[2]*39.1918];},points=polys.flatMap(p=>p[0].map(project)),minx=Math.floor(Math.min(...points.map(p=>p[0])))-3,miny=Math.floor(Math.min(...points.map(p=>p[1])))-3,w=Math.ceil(Math.max(...points.map(p=>p[0])))-minx+4,h=Math.ceil(Math.max(...points.map(p=>p[1])))-miny+4;
  const im=document.createElement('canvas');im.width=w;im.height=h;const ctx=im.getContext('2d');for(const[pts,col]of polys){ctx.beginPath();pts.map(project).forEach(([x,y],i)=>ctx[i?'lineTo':'moveTo'](x-minx,y-miny));ctx.closePath();ctx.fillStyle=col;ctx.fill();ctx.strokeStyle='rgba(43,55,51,.2)';ctx.lineWidth=.65;ctx.stroke();}
  if(rx+w>2048){rx=0;ry+=row+2;row=0;}const key=`${type}/base/main/${state}/${rot}`;KI.frames[key]=[rx,ry,w,h,-minx,-miny];repairs.push({im,x:rx,y:ry});rx+=w+2;row=Math.max(row,h);
  const cols=Math.ceil(w/4),rows=Math.ceil(h/4),bytes=new Uint8Array(Math.ceil(cols*rows/8)),data=ctx.getImageData(0,0,w,h).data;for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){let hit=false;for(let yy=0;yy<4&&!hit;yy++)for(let xx=0;xx<4;xx++)if(x*4+xx<w&&y*4+yy<h&&data[((y*4+yy)*w+x*4+xx)*4+3]){hit=true;break;}if(hit){const i=y*cols+x;bytes[i>>3]|=1<<(7-(i&7));}}KI.masks[key]=[cols,rows,btoa(String.fromCharCode(...bytes))];
  const p=KI.pieces[type]||(KI.pieces[type]={layer:'sorted',interior:true,states:[],rots:[],parts:['main'],variants:['base'],footprint:[],fadeable:true,geo:{}});if(!p.states.includes(state))p.states.push(state);if(!p.rots.includes(rot))p.rots.push(rot);p.geo[state]={main:geo};
 }
 const wc=['#a6b5ad','#c6cfc3','#e1e1d0'];
 for(const n of [5,10,15,18,20,25,30,34,35,40,45,50,55,60,65,70,75,80,85,88,90,95])for(const state of ['plain','cut'])for(const rot of [0,6]){const len=n/100,h=state==='cut'?.52:2.65;asset('modern_wall_'+n,state,rot,[0,-.065,0,len,.065,h],box=>{box(0,-.065,0,len,.065,h,wc);box(0,-.078,.05,len,-.065,.14,['#687c70','#687c70','#809284']);});}
 for(const state of ['closed','open'])for(const rot of [0,6])asset('modern_intdoor',state,rot,[0,state==='open'?-.94:-.09,0,1.1,.09,2.3],box=>{
  for(const x of [0,1.025])box(x,-.075,0,x+.075,.075,2.3,['#65766b','#d9dfce','#eff0de']);box(0,-.075,2.2,1.1,.075,2.3,['#65766b','#d9dfce','#eff0de']);box(.055,-.08,.01,1.045,.08,.045,['#5a685f','#97a79a','#b4bbaa']);
  if(state==='closed'){box(.08,-.04,.05,1.02,.035,2.19,['#465e5c','#78968e','#a5b8a6']);for(const[z0,z1]of [[.18,.85],[1.03,2.01]])box(.16,-.054,z0,.92,-.043,z1,['#395650','#9aaea1','#bac5b4']);box(.82,-.11,.93,.96,-.052,.97,['#6c583c','#ddbf78','#f1d795']);}
  else {box(.08,-.91,.05,.14,.03,2.19,['#78968e','#a1b4a7','#c1cdb9']);box(.066,-.82,.93,.08,-.69,.98,['#c3a163','#dec487','#edd594']);}
 });
 asset('modern_lift_shell','default',0,[-.22,-.02,0,2.14,2.25,2.86],box=>{box(-.22,0,0,-.04,2.25,2.7,wc);box(1.96,0,0,2.14,2.25,2.7,wc);box(-.22,2.07,0,2.14,2.25,2.7,wc);for(const z of [.15,.52])box(-.23,0,z,-.22,2.25,z+.035,['#74897d','#74897d','#9cac97']);box(-.25,-.035,2.7,2.17,2.28,2.86,['#7c9085','#a3b4a2','#d6ddca']);});
 KI.pieces.modern_lift_shell.fadeable=false;
 const base=document.currentScript.src.replace(/js\/modern_residential_assets\.js.*$/,''),compose=SK.compose;
 const load=src=>new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>no(new Error('Missing '+src));im.src=src;});let pending;
 SK.compose=function(SP){return compose(SP).then(()=>pending||(pending=Promise.all([load(base+'kit_modern_residential/kit_atlas.png'),load(base+'kit_modern_residential/kit_emit.png')]).then(([A,E])=>{
  for(const [key,bot]of [['int_atlas',A],['int_emit',E]]){const top=SP.img[key],c=document.createElement('canvas');c.width=Math.max(top.width,bot.width,2048);c.height=Math.max(off+bot.height,ry+row+2);const x=c.getContext('2d');x.drawImage(top,0,0);x.drawImage(bot,0,off);if(key==='int_atlas')for(const r of repairs)x.drawImage(r.im,r.x,r.y);SP.img[key]=c;}
 })));};window.MODERN_RESIDENTIAL_ASSETS={offset:off,version:1};
})();
