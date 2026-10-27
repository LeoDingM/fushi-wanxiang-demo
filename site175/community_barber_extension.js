/* I11: a single independent shop in the existing 3m service-street gap.
 * Coordinates belong to this integration; no donor layout or world import. */
(function(root){
 'use strict';const D=root.SCENE_DATA,KI=root.KIT_INT_MANIFEST,SK=root.STORE_KIT;
 if(!D||!KI||!SK)throw new Error('Barber extension requires scene and store kit before core');
 if(D.communityBarberExtension)return;D.communityBarberExtension=1;
 const sheet=document.createElement('canvas');sheet.width=320;sheet.height=290;const ctx=sheet.getContext('2d');
 const origin=[150,250],p=(x,y,z)=>[origin[0]+(x-y)*32,origin[1]-(x+y)*16-z*39.19];
 function face(points,fill,stroke){ctx.beginPath();for(let i=0;i<points.length;i++){const q=p(...points[i]);ctx[i?'lineTo':'moveTo'](...q);}ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}}
 face([[0,0,0],[0,4,0],[0,4,2.8],[0,0,2.8]],'#73898a','#526768');
 face([[0,0,0],[3,0,0],[3,0,2.8],[0,0,2.8]],'#a9beb9','#697e7c');
 face([[.18,-.025,.12],[2.82,-.025,.12],[2.82,-.025,2.25],[.18,-.025,2.25]],'#375769','#c8ddd5');
 // Two glazed door leaves, solid jambs and handle; rendered on the street plane.
 face([[1.46,-.05,.12],[1.54,-.05,.12],[1.54,-.05,2.25],[1.46,-.05,2.25]],'#c7d3c9');
 face([[1.25,-.08,.9],[1.31,-.08,.9],[1.31,-.08,1.3],[1.25,-.08,1.3]],'#e8d8a0');
 face([[.35,-.07,.35],[.58,-.07,.35],[2.3,-.07,1.9],[2.05,-.07,1.9]],'#729baf');
 face([[0,0,2.8],[3,0,2.8],[3,4,2.8],[0,4,2.8]],'#b5b8a5','#717e70');
 face([[.1,-.055,2.32],[2.9,-.055,2.32],[2.9,-.055,2.72],[.1,-.055,2.72]],'#23443e');
 ctx.save();const s=p(.25,-.065,2.44);ctx.setTransform(1,-.5,0,1,s[0],s[1]);ctx.fillStyle='#f4e8b2';ctx.font='bold 13px sans-serif';ctx.fillText('槐东剪艺',0,0);ctx.restore();
 // Ground supported barber pole occupies a separate frame / bbox / collider.
 const pole=document.createElement('canvas');pole.width=32;pole.height=116;const q=pole.getContext('2d');
 q.fillStyle='#365452';q.fillRect(10,12,12,94);q.fillStyle='#dfebe8';q.fillRect(11,19,10,69);
 q.save();q.beginPath();q.rect(11,19,10,69);q.clip();for(let y=0;y<105;y+=18){q.fillStyle='#bc4d4d';q.beginPath();q.moveTo(11,y);q.lineTo(21,y+6);q.lineTo(21,y+12);q.lineTo(11,y+6);q.fill();q.fillStyle='#326798';q.beginPath();q.moveTo(11,y+10);q.lineTo(21,y+16);q.lineTo(21,y+20);q.lineTo(11,y+14);q.fill();}q.restore();q.fillStyle='#e4dfbc';q.fillRect(8,9,16,7);q.fillStyle='#344b46';q.fillRect(6,105,20,7);
 ctx.drawImage(pole,280,0);
 function mask(x,y,w,h){const cols=Math.ceil(w/4),rows=Math.ceil(h/4),a=ctx.getImageData(x,y,w,h).data,bytes=new Uint8Array(Math.ceil(cols*rows/8));for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){let hit=false;for(let dy=0;dy<4&&!hit;dy++)for(let dx=0;dx<4;dx++){const xx=col*4+dx,yy=row*4+dy;if(xx<w&&yy<h&&a[(yy*w+xx)*4+3]>0){hit=true;break;}}if(hit){const i=row*cols+col;bytes[i>>3]|=1<<(7-(i&7));}}return[cols,rows,btoa(String.fromCharCode(...bytes))];}
 const pieces={community_barber_shop:{layer:'sorted',catcher:'ground',origin:'south west corner',states:['default'],rots:[0],parts:['main'],variants:['base'],footprint:[[0,0,3,4]],sort_box:[0,0,3,4],fadeable:true,geo:{default:{main:[0,-.08,0,3,4,2.8]}}},community_barber_pole:{layer:'sorted',catcher:'ground',origin:'center',states:['default'],rots:[0],parts:['main'],variants:['base'],footprint:[[-.16,-.16,.16,.16]],sort_box:[-.16,-.16,.16,.16],fadeable:false,geo:{default:{main:[-.16,-.16,0,.16,.16,2.5]}}}};
 Object.assign(KI.pieces,pieces);const keys=['community_barber_shop/base/main/default/0','community_barber_pole/base/main/default/0'];
 KI.masks[keys[0]]=mask(0,0,280,290);KI.masks[keys[1]]=mask(280,0,32,116);
 // Reserve frames before later extensions allocate their atlas ranges. Registering
 // only during asynchronous composition lets the library overwrite this shop.
 const off=Math.max(SK.size[1],...Object.values(KI.frames).map(f=>f[1]+f[3]))+4;
 const frames=[[keys[0],[0,off,280,290,150,250]],[keys[1],[280,off,32,116,16,112]]];
 for(const [key,f]of frames)KI.frames[key]=f;
 const compose=SK.compose;let pending;SK.compose=function(SP){return compose(SP).then(()=>pending||(pending=Promise.resolve().then(()=>{for(const key of ['int_atlas','int_emit']){const top=SP.img[key],c=document.createElement('canvas');c.width=Math.max(top.width,sheet.width);c.height=Math.max(top.height,off+sheet.height);const g=c.getContext('2d');g.drawImage(top,0,0);if(key==='int_atlas')g.drawImage(sheet,0,off);SP.img[key]=c;}for(const [key,f]of frames)SP.K.frames[key]=f.concat([1]);})));};
 // Append preserves the I10 object identity prefix and all existing doorways.
 D.objects.push({id:'community_barber_door',type:'community_barber_shop',x:144,y:4.5,interact:'community_barber_entrance',name:'槐东剪艺 · 玻璃门',reach:[145.5,3.6]},
  {id:'community_barber_pole',type:'community_barber_pole',x:144.32,y:3.62,name:'理发灯柱'});
 root.COMMUNITY_BARBER_ENTRY={id:'community_barber_door',reach:[145.5,3.6],plot:[144,4.5,147,8.5],source:'independently planned in existing service street gap'};
})(window);
