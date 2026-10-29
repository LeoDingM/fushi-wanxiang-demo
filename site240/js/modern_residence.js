/* I11 · native lobby, twelve-floor circulation, complete homes and shared unit state. */
(function(root){
 'use strict';
 const ROOM='modern_residence_room',STUDIO='modern_residence_studio_2f02',LOBBY='modern_residence_lobby',ENTRY='modern_residence_door',UNIT='modern_residence_2F-01',RETURN=[177,8.5,'S'];
 const floorId=n=>n===1?LOBBY:`modern_residence_floor_${String(n).padStart(2,'0')}`;
 const at=(id,type,x,y,more)=>Object.assign({id,type,x,y,z:0},more||{});
 function shell(id,name,w,h,floor){
  const s={format:'fushi-scene',version:2,id,name,interior:true,units:'m',grid_m:.5,modernFloor:floor,bounds:{x0:0,y0:0,x1:w,y1:h},spawn:[w/2,h-.8,'S'],objects:[],colliders:[],portals:[],laundry:[],puddles:[],leaf_piles:[],wires:[],npcs:[],events:{},interactions:{}};
  const cols=Math.ceil(w),rows=Math.ceil(h);s.ground={origin:[0,0],chunk:1,cols,rows,legend:{T:'g_terrazzo:default',W:'g_wood:a',C:'g_concrete:default'},data_south_to_north:Array.from({length:rows},(_,y)=>y<1.5?'C'.repeat(cols):'T'.repeat(cols))};
  s.colliders.push({id:id+'_edge_s',rect:[0,-.3,w,.1]},{id:id+'_edge_n',rect:[0,h-.1,w,h+.3]},{id:id+'_edge_w',rect:[-.3,0,.1,h]},{id:id+'_edge_e',rect:[w-.1,0,w+.3,h]});
  for(let x=0;x<w;x++)s.objects.push(at(id+'_north_'+x,'modern_intwall',x,h-.02,{state:'plain'}),at(id+'_south_'+x,'modern_intwall',x,0,{state:'cut'}));
  for(let y=0;y<h;y++){const len=Math.min(1,h-y),type=len<.99?'modern_wall_'+Math.round(len*100):'modern_intwall';s.objects.push(at(id+'_east_'+y,type,w-.02,y+len,{rot:6,state:'plain'}),at(id+'_west_'+y,type,0,y+len,{rot:6,state:'cut'}));}
  return s;
 }
 function wall(s,id,x0,y0,x1,y1,cut=false){
  const vertical=Math.abs(x1-x0)<.01,len=vertical?y1-y0:x1-x0;
  s.colliders.push({id,rect:vertical?[x0-.065,y0,x0+.065,y1]:[x0,y0-.065,x1,y0+.065]});
  for(let t=0;t<len-.001;t+=1){const span=Math.min(1,len-t),type=span<.99?'modern_wall_'+Math.round(span*100):'modern_intwall';s.objects.push(at(id+'_'+t,type,x0+(vertical?0:t),y0+(vertical?t+span:0),{state:cut?'cut':'plain',rot:vertical?6:0}));}
 }
 function opening(s,side,start,end){const axis=side==='north'||side==='south'?'x':'y',pattern='_'+side+'_';s.objects=s.objects.filter(o=>!((o.id.includes(pattern)||o.id.includes('_'+side[0]+'_'))&&o[axis]<end&&o[axis]+1>start));const len=end-start;const base=Math.floor(start),tail=Math.ceil(end),plane=side==='north'?s.bounds.y1-.02:side==='south'?0:side==='east'?s.bounds.x1-.02:0;const cut=side==='south'||side==='west';if(start>base+.001)wall(s,s.id+'_doorfill_'+side+'_'+start+'_a',axis==='x'?base:plane,axis==='x'?plane:base,axis==='x'?start:plane,axis==='x'?plane:start,cut);if(tail>end+.001)wall(s,s.id+'_doorfill_'+side+'_'+start+'_b',axis==='x'?end:plane,axis==='x'?plane:end,axis==='x'?tail:plane,axis==='x'?plane:tail,cut);}
 function door(s,id,x,y,reach,more){s.objects.push(at(id,'modern_intdoor',x,y,Object.assign({state:'closed',interact:'modern_partition',reach,name:'房门'},more)));}
 function createFlat(studio=false){
  const id=studio?STUDIO:ROOM,p=studio?'modern02':'modern',w=studio?7:8,unit=studio?'modern_residence_2F-02':UNIT;
  const s=shell(id,studio?'澜山雅庭 · 2F-02 大单间':'澜山雅庭 · 2F-01 一室一厅',w,7,2);s.modernUnit=unit;s.spawn=[studio?3.75:4,6.15,'S'];
  door(s,p+'_exit_door',studio?3.75:4,6.98,[studio?3.75:4,6.15],{interact:'modern_portal',to:floorId(2),spawn:[studio?12.5:3.5,1.25,'N'],name:'返回2楼公共走廊'});
  opening(s,'north',studio?3.75:4,studio?4.85:5.1);
  wall(s,p+'_balcony_w',0,1.5,1.05,1.5,true);wall(s,p+'_balcony_e',2.25,1.5,w,1.5,true);
  door(s,p+'_balcony_door',1.1,1.5,[1.05,2.35],{block:[1.05,1.43,2.25,1.57],name:'开关阳台玻璃门'});
  for(let x=0;x<w-1;x+=2.7)s.objects.push(at(p+'_balcony_front_'+x,'modern_balcony_rail',x,1.3,{state:'default',z:-.45}));
  if(!studio){
   wall(s,p+'_bedwall_s',4.5,1.5,4.5,2.6,true);wall(s,p+'_bedwall_n',4.5,3.8,4.5,5,true);
   door(s,p+'_bedroom_door',4.5,3.75,[3.8,3.2],{rot:6,block:[4.43,2.6,4.57,3.8],name:'开关卧室门'});
   wall(s,p+'_bedroom_north',4.5,5,8,5);
   for(let row=2;row<5;row++){const a=s.ground.data_south_to_north[row];s.ground.data_south_to_north[row]=a.slice(0,5)+'WWW';}
  }
  const bx=studio?4.5:5;
  wall(s,p+'_bathroom_w0',bx,5,bx,5.45,true);wall(s,p+'_bathroom_w1',bx,6.65,bx,7,true);
  door(s,p+'_bathroom_door',bx,6.6,[bx-.65,6.05],{rot:6,block:[bx-.065,5.45,bx+.065,6.65],name:'开关卫生间门'});
  wall(s,p+'_bathroom_s',bx,5,w,5);
  // Bed head (-X in the native frame) meets a solid west wall; south side stays a clear aisle.
  if(studio)wall(s,p+'_headwall',4.5,3.45,4.5,4.9);
  else {const head=s.objects.filter(o=>o.id.startsWith(p+'_bedwall_n_'));for(const o of head)o.state='plain';}
  const bedroomX=5.57,bedroomY=4.05;
  s.objects.push(
   at(p+'_room_light','i_pendant',studio?3.5:3.9,studio?4.2:3.8,{state:'off',interact:'modern_light',reach:[studio?3.5:3.95,studio?4.2:3.65],name:'住宅主灯'}),
   at(p+'_bed','f_bed',bedroomX,bedroomY,{state:'made',interact:'modern_bed',reach:[5.65,3.05],name:'卧床 · 睡觉 / 小睡'}),
   at(p+'_nightstand','f_nightstand',6.3,3.3,{state:'off',interact:'modern_light',reach:[5.65,3.05],name:'床头灯'}),
   at(p+'_desk','f_desk',1.25,4.45,{state:'off',interact:'modern_light',reach:[1.3,3.45],name:'书桌电脑'}),
   at(p+'_desk_chair','f_chair',1.3,4.0,{interact:'modern_seat',reach:[1.3,3.45],name:'书桌椅 · 坐下休息'}),
   at(p+'_wardrobe','f_wardrobe',w-.4,2.35,{rot:6,state:'closed',interact:'modern_wardrobe',reach:[w-1.2,2.35],name:'衣柜 · 衣物与被子'}),
   at(p+'_ac','i_ac',w-.15,3.05,{rot:6,state:'off',interact:'modern_ac',reach:studio?[5.65,3.05]:[w-.95,3.05],name:'壁挂空调'}),
   at(p+'_sofa','modern_sofa',studio?2.8:2.7,studio?2.65:4.35,{interact:'modern_seat',reach:studio?[3.85,3.35]:[4,4.2],name:'起居沙发 · 坐下休息'}),
   at(p+'_coffee','f_table',studio?2.8:2.7,studio?3.55:3.2,{interact:'modern_table',reach:studio?[2.8,4.15]:[2.7,2.6],name:'茶几 · 休息喝水'}),
   at(p+'_kitchen','f_kitchen',1.35,6.45,{state:'off',interact:'modern_kitchen',reach:[1.4,5.65],name:'灶台与水槽'}),
   at(p+'_fridge','f_fridge',2.65,6.45,{state:'closed',interact:'modern_fridge',reach:[2.65,5.6],name:'冰箱'}),
   at(p+'_basin','f_basin',bx+.55,6.7,{interact:'modern_basin',reach:[bx+.55,6.05],name:'洗手台'}),
   at(p+'_toilet','f_toilet',w-.65,5.6,{interact:'modern_toilet',reach:[w-1.35,5.65],name:'马桶'}),
   at(p+'_shower','f_shower',w-.75,6.55,{state:'dry',interact:'modern_shower',reach:[w-1.55,6.1],name:'淋浴'}),
   at(p+'_laundry','i_dryrack',studio?4.4:5.2,.8,{interact:'modern_rack',reach:[studio?3.5:4.3,.8],name:'阳台晾衣架 · 衣服与被子'})
  );
  s.laundry=[{id:p+'_indoor_line',pts:[studio?3.8:4.7,.65,studio?6.4:7.3,.65],z:2.2,state:'empty',items:[],indoor:true,mine:true,max:3,modernUnit:unit}];
  return s;
 }
 function circulationStructure(s,liftX,stairX,north,maxFloor=12){
  const id=s.id,back=s.bounds.y1-.18,dy=s.modernFloor===1?2.2:.9,up=stairX+1.2,down=stairX-.2;
  s.objects.push(at(id+'_lift_shell','modern_lift_shell',liftX,north));
  s.colliders.push({id:id+'_shaft_void',rect:[liftX-.22,north+.08,liftX+2.14,north+2.25]});
  const stairs=s.objects.find(o=>o.id===id+'_stairs');Object.assign(stairs,{type:'i_flight',state:s.modernFloor===maxFloor?'down':'up',x:s.modernFloor===maxFloor?down:up,y:dy,reach:[s.modernFloor===maxFloor?down+.58:up+.58,dy-.35],sortz:s.modernFloor===maxFloor?[-3,0]:[0,3.25],modernStairDirection:s.modernFloor===maxFloor?-1:1});
  if(s.modernFloor>1&&s.modernFloor<maxFloor)s.objects.push(at(id+'_stairs_down','i_flight',down,dy,{state:'down',sortz:[-3,0],interact:stairs.interact,reach:[down+.58,dy-.35],name:'楼梯 · 下行至'+(s.modernFloor-1)+'楼',modernStairDirection:-1}));
  // The old house's native switchback has two thick flights, return landing and railings.
  wall(s,id+'_stair_back',stairX-.4,dy+4.34,stairX+2.48,dy+4.34);
  wall(s,id+'_stair_e',stairX+2.48,dy,stairX+2.48,dy+4.34);
  s.colliders.push({id:id+'_stair_well',rect:[stairX-.4,dy,stairX+2.48,dy+4.34]});
  for(let x=stairX-.35;x<stairX+2.4;x+=1)s.objects.push(at(id+'_stair_dado_'+x,'i_wall',x,dy+4.34,{state:'dado'}));
 }
 function createCirculation(floor){
  const lobby=floor===1,id=floorId(floor),s=shell(id,lobby?'澜山雅庭 · 首层大厅':`澜山雅庭 · ${floor}楼公共走廊`,18,lobby?7:5.4,floor),north=lobby?5.4:2.8;
  s.spawn=[8.75,lobby?4.3:1.9,'S'];
  s.objects.push(at(id+'_elevator','modern_lift',8,north,{state:'closed',interact:'modern_elevator',reach:[8.75,north-.85],name:`电梯 · 当前${floor}楼`}));
  s.objects.push(at(id+'_stairs','modern_stairflight',15.2,north-.3,{interact:'modern_stairs',reach:[16,north-.8],name:'楼梯 · 无电亦可通行'}));
  circulationStructure(s,8,15.2,north);
  if(lobby){
   opening(s,'south',8.5,9.6);
   door(s,'modern_lobby_exit',8.5,.02,[9,1.1],{interact:'modern_portal',to:'street',spawn:RETURN,name:'返回住区前场'});
   s.objects.push(at('modern_lobby_mailboxes','i_mailbox',2,5.9),at('modern_lobby_notice','i_notice',4,5.9,{name:'澜山雅庭住户公告'}),at('modern_lobby_bench','modern_sofa',3,2.5),at('modern_lobby_light','i_pendant',7.2,3.8,{state:'on'}),at('modern_lobby_power','i_meter',13.5,5.9,{interact:'modern_power',reach:[13.5,5.0],name:'电梯供电 · 检修测试'}));
  }else{
   for(let u=1;u<=2;u++){
    const unit=`modern_residence_${floor}F-0${u}`,open=floor===2,x=u===1?3.5:12.5;
    opening(s,'south',x,x+1.1);
    door(s,id+'_unit_0'+u,x,.02,[x,1.0],{interact:'modern_unitdoor',unit,to:open?(u===1?ROOM:STUDIO):null,spawn:open?(u===1?[4,6.15,'S']:[3.75,6.15,'S']):null,name:`${floor}F-0${u} · ${open?(u===1?'一室一厅':'大单间'):'住户私宅（锁门）'}`});
   }s.objects.push(at(id+'_hall_light','i_pendant',7,1.7,{state:'on'}));
  }return s;
 }
 function migrate(ps){
  const old=ps.modernResidence||{},s=ps.modernResidence=old;s.schemaVersion=2;s.units=s.units||{};
  for(const unit of [UNIT,'modern_residence_2F-02'])if(!s.units[unit]){
   const location=unit===UNIT&&old.selection==='hung'?'line':unit===UNIT&&old.selection==='prepared'?'hand':'closet';
   s.units[unit]={laundry:[{id:unit+'_coat',kind:'coat',label:'黑色外套',color:'#3c404a',location,wet:0,startedAt:null},{id:unit+'_shirt',kind:'shirt',label:'浅蓝衬衣',color:'#99b9d6',location,wet:.4,startedAt:null},{id:unit+'_quilt',kind:'quilt',label:'米色棉被',color:'#c7b59a',location:'closet',wet:0,startedAt:null}]};
  }s.legacyMigrated=true;delete s.selection;s.elevator=s.elevator||{floor:1,phase:'open',target:1,powered:true};return s;
 }
 const api={ROOM,STUDIO,LOBBY,ENTRY,UNIT,RETURN,floorId,createScene:()=>createFlat(false),createFlat,createCirculation,circulationStructure,opening,migrate};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(!root.SP)return;const SP=root.SP,G=SP.game,W=SP.world,H=SP.households;if(!G||!W||!H||SP._modernResidenceInstalled)return;SP._modernResidenceInstalled=true;
 SP.scenes[ROOM]=createFlat(false);SP.scenes[STUDIO]=createFlat(true);for(let n=1;n<=12;n++)SP.scenes[floorId(n)]=createCirculation(n);
 const contracts=[];
 for(let floor=2;floor<=12;floor++)for(let u=1;u<=2;u++){
  const pad=String(floor).padStart(2,'0'),unit=`modern_residence_${floor}F-0${u}`,room=floor===2?(u===1?ROOM:STUDIO):`modern_private_${floor}_${u}`,p=u===1?'modern':'modern02',bay=u===1?1:4;
  const f={room,unit,lights:floor===2?[p+'_room_light',p+'_nightstand']:[],pc:floor===2?p+'_desk':null,ac:floor===2?p+'_ac':null,windows:Array.from({length:3},(_,i)=>`mres_S${pad}_${i+(u===1?0:3)}_win`).concat(u===1?Array.from({length:4},(_,i)=>`mres_W${pad}_${i}_win`):[]),balcony:`mres_S${pad}_${bay}_rail`,outdoorAc:`mres_S${pad}_${bay}_ac`,indoorRack:p+'_laundry',outdoorLine:floor===2?(u===1?'mres_2f01_line':'mres_2f02_line'):null};
  f.private=floor!==2;H.registerFacade(room,f);contracts.push(f);
 }
 const state=()=>G.ps?migrate(G.ps):{units:{},elevator:{floor:1,phase:'open',powered:true}};
 const current=()=>W.interior&&[ROOM,STUDIO].includes(W.sceneId)?H.facade(W.sceneId):null;
 const unit0=H.unit;H.unit=function(unit){const f=H.facadeForUnit(unit);if(f?.private)return{lit:SP.clock.min>=1080&&SP.clock.min<1380&&SP.hash(SP.strHash(unit),SP.clock.day)>.46,ac:false,st:'resident'};return unit0.call(H,unit);};
 function projectLine(L,unit){
  const items=state().units[unit]?.laundry||[],hung=items.filter(x=>x.location==='line'),len=Math.hypot(L.pts[2]-L.pts[0],L.pts[3]-L.pts[1]);
  const now=SP.clock.abs();for(const item of hung){const dt=Math.max(0,now-(item.updatedAt??now));item.wet=Math.max(0,Math.min(1,item.wet+dt*(SP.clock.weather==='rain'&&SP.clock.intensity>.25?1/120:-1/180)));item.updatedAt=now;}
  L.items=hung.map(item=>[(({coat:0,shirt:1,quilt:2})[item.kind]+.5)*len/3,item.kind==='quilt'?1.15:item.kind==='coat'?.58:.52,item.kind==='quilt'?.86:item.kind==='coat'?.82:.62,item.color,item.wet]);L.state=hung.length?'hung':'empty';L.wet=hung.length?Math.max(...hung.map(i=>i.wet)):0;L.modernItemIds=hung.map(i=>i.id);L.modernKinds=hung.map(i=>i.kind);
 }
 function sync(){
  if(!G.ps)return;const street=W.interior?SP.place.street:W;
  if(street?.laundry)for(const f of contracts.filter(f=>f.outdoorLine)){
   if(!street.byId?.[f.balcony]){street.laundry=street.laundry.filter(L=>L.id!==f.outdoorLine);continue;}
   let L=street.laundry.find(x=>x.id===f.outdoorLine);if(!L){const x=f.unit===UNIT?171.4:180.4;L={id:f.outdoorLine,pts:[x,9.35,x+2.2,9.35],z:5.4,state:'empty',items:[],mine:true,modernUnit:f.unit};street.laundry.push(L);}projectLine(L,f.unit);
  }if(current())for(const L of W.laundry)if(L.modernUnit)projectLine(L,L.modernUnit);H.mountStreet();
 }
 const shown0=W.shownState;W.shownState=function(o){
  if(o.type==='modern_facade'&&o.modernUnit&&o.state!=='ground'&&o.state!=='entry'){
   const f=H.facadeForUnit(o.modernUnit),lit=f?H.unit(o.modernUnit).lit:SP.tint.night>.35&&(SP.windowLitAt?SP.windowLitAt(o.modernUnit,SP.clock.day,SP.clock.min):SP.hash(SP.strHash(o.modernUnit),SP.clock.day)>.46);/* 未经Leo确认: per-unit nightly schedule */
   return lit&&SP.tint.night>.35?(o.modernBalcony?'balcony_lit':'lit'):(o.modernBalcony?'balcony':'upper');
  }if(o.type==='modern_condenser')return H.facadeForUnit(o.modernUnit)&&H.unit(o.modernUnit).ac?'on':'off';return shown0.call(W,o);
 };
 const fan0=H.drawFan;H.drawFan=function(ctx,d){if(d.o.type!=='modern_condenser')return fan0.call(H,ctx,d);const o=d.o;ctx.save();ctx.strokeStyle='#b1bba7';ctx.lineWidth=1.3;for(let i=0;i<3;i++){const a=SP.now*14+i*Math.PI*2/3,p=W.local(o,-.12,-.465,.41),q=W.local(o,-.12+.16*Math.cos(a),-.465,.41+.16*Math.sin(a));ctx.beginPath();ctx.moveTo(SP.sx(p[0],p[1]),SP.sy(p[0],p[1],p[2]));ctx.lineTo(SP.sx(q[0],q[1]),SP.sy(q[0],q[1],q[2]));ctx.stroke();}ctx.restore();};
 // The native layer cache watches f_window only; modern facade frames also change with household/night state.
 const Ly=SP.layers,checkLit0=Ly.checkLit,render0=Ly.render;let litEpoch=null;
 const modC={objs:null,n:-1,list:[]};/* perf: modern facades / condensers cached per object-list identity + length */
 function checkModernLit(){if(W.interior)return;if(modC.objs!==W.objects||modC.n!==W.objects.length){modC.objs=W.objects;modC.n=W.objects.length;modC.list=W.objects.filter(o=>o.type==='modern_facade'||o.type==='modern_condenser');}for(const o of modC.list){if(!['modern_facade','modern_condenser'].includes(o.type))continue;const s=W.shownState(o);if(o._modernLit!==s){o._modernLit=s;Ly.refreshObj?Ly.refreshObj(o):Ly.invalidate();}}}
 Ly.checkLit=function(){const r=checkLit0.apply(Ly,arguments);checkModernLit();return r;};
 Ly.render=function(){const epoch=[W.sceneId,SP.clock.day,SP.clock.min,SP.tint.night>.35].join('|');if(epoch!==litEpoch){litEpoch=epoch;checkModernLit();}return render0.apply(Ly,arguments);};
 const laundryDraw0=SP.env.drawLaundry;SP.env.drawLaundry=function(ctx,d){
  if(!d.L.modernUnit)return laundryDraw0.call(SP.env,ctx,d);
  laundryDraw0.call(SP.env,ctx,Object.assign({},d,{L:Object.assign({},d.L,{state:'empty',items:[]})}));if(d.L.state!=='hung')return;
  const {L,a,b}=d,len=Math.hypot(b.x-a.x,b.y-a.y),ux=(b.x-a.x)/len,uy=(b.y-a.y)/len,A=SP.scr(a.x,a.y,L.z),B=SP.scr(b.x,b.y,L.z),wind=SP.clock.wind;
  ctx.save();L.items.forEach(([t,w,h,col,wet],i)=>{
   const k=t/len,X=Math.round(SP.lerp(A[0],B[0],k)),Y=Math.round(SP.lerp(A[1],B[1],k)+24*k*(1-k)),sw=Math.sin(SP.now*(2+wind*3)+t*2.1)*(1+wind*3),W2=Math.max(6,w*SP.KX*.75*Math.abs(ux-uy)/1.414+3),HH=h*SP.KX*.62,m=wet>.2?.78:1;
   ctx.fillStyle=`rgb(${parseInt(col.slice(1,3),16)*m|0},${parseInt(col.slice(3,5),16)*m|0},${parseInt(col.slice(5,7),16)*m|0})`;
   const kind=L.modernKinds[i],points=kind==='quilt'?[[-.5,0],[.5,0],[.5+sw/W2,1],[-.5+sw/W2,1]]:[[-.23,0],[.23,0],[.55,.23],[.39,.36],[.27,.27],[.27+sw/W2,1],[-.27+sw/W2,1],[-.27,.27],[-.39,.36],[-.55,.23]];
   ctx.beginPath();points.forEach(([x,y],j)=>{const xx=Math.round(X+x*W2),yy=Math.round(Y+y*HH);j?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);});ctx.closePath();ctx.fill();
   ctx.strokeStyle='rgba(45,49,43,.25)';ctx.lineWidth=1;ctx.stroke();
   if(kind==='quilt'){ctx.save();ctx.clip();ctx.strokeStyle='rgba(237,224,190,.28)';for(let n=1;n<4;n++){ctx.beginPath();ctx.moveTo(X-W2/2,Y+HH*n/4);ctx.lineTo(X+W2/2+sw,Y+HH*n/4);ctx.stroke();}for(let n=-1;n<=1;n++){ctx.beginPath();ctx.moveTo(X+n*W2/4,Y+2);ctx.lineTo(X+n*W2/4+sw,Y+HH-2);ctx.stroke();}ctx.restore();}
   else {ctx.strokeStyle='rgba(231,229,210,.18)';ctx.beginPath();ctx.moveTo(X,Y+HH*.15);ctx.lineTo(X+sw,Y+HH*.90);ctx.stroke();}
   ctx.fillStyle='#d9d1ba';ctx.fillRect(Math.round(X-W2*.20),Y-2,1,3);ctx.fillRect(Math.round(X+W2*.20),Y-2,1,3);
  });ctx.restore();
 };
 const init0=G.init,laundry0=G.syncLaundry,action0=G.actionFor,use0=G.use,switch0=G.switchScene;
 const busy0=G.busy;G.busy=function(){return busy0.call(G)||!!(G.ps?.modernResidence?.elevator&&G.ps.modernResidence.elevator.phase!=='open');};
 G.init=function(){const r=init0.apply(G,arguments);state();sync();return r;};G.syncLaundry=function(){const r=laundry0.apply(G,arguments);sync();return r;};G.switchScene=function(to){if([ROOM,STUDIO].includes(to))SP.place.intZoom=null;const r=switch0.apply(G,arguments);sync();return r;};
 G.actionFor=function(o,kind){if(o&&kind==='use'&&String(o.interact||'').startsWith('modern_'))return{label:o.name||'住宅设施',do:'game'};return action0.call(G,o,kind);};
 function lift(o,target){
  const s=state().elevator;if(!s.powered)return'电梯正在检修。请使用楼梯。';s.phase='waiting';s.target=target;G.closeMenu();G.later(.35,()=>{s.phase='running';});
  G.later(.7+Math.abs(target-s.floor)*.12,()=>{s.floor=target;s.phase='open';G.go({to:floorId(target),spawn:[8.75,target===1?4.3:1.9,'S'],door:o.id});});return`电梯呼叫${target}楼 · 等待`;
 }
 function homeAction(o,id){
  const r=G.rules.perform(G.ps,id,G.ctx());if(!r.ok)return r.reason;G.closeMenu();
  const mode=o.interact==='modern_kitchen'?{during:'cooking',after:'off'}:o.interact==='modern_shower'?{during:'running',after:'dry'}:o.interact==='modern_bed'?{during:'made',after:'messy'}:{};
  if(mode.during)W.setState(o,mode.during);const dur=id==='sleep'||id==='nap'?3.2:1.6;
  SP.clock.skipTo((SP.clock.min+r.minutes)%1440,dur);G.activity={id:r.id,label:r.label,text:r.text,vis:mode,obj:o,t:0,dur,sleep:id==='sleep'||id==='nap',minutes:r.minutes};W.logEvent(`李默：${r.label} · 澜山雅庭`);return null;
 }
 function homeMenu(o,place){const opts=G.rules.actionsAt(G.ps,place,G.ctx()).filter(a=>a.id!=='make_bed').map(a=>Object.assign({},a,{fn:()=>homeAction(o,a.id)}));G.openMenu(o,opts);return null;}
 G.use=function(o){
  if(!o)return use0.call(G,o);const kind=o.interact;
  if(kind==='modern_entry'){G.go({to:LOBBY,spawn:[9,1.25,'N'],door:o.id});return null;}
  if(kind==='modern_portal'){G.go({to:o.to,spawn:o.spawn,door:o.id});return null;}
  if(kind==='modern_unitdoor'){if(!o.to)return`${o.unit} · 住户私宅，房门锁闭。`;G.go({to:o.to,spawn:o.spawn,door:o.id});return null;}
  if(kind==='modern_partition'){if(o.state==='open'&&o.block){const [x0,y0,x1,y1]=o.block;if(SP.circlePoly(SP.player.x,SP.player.y,SP.player.radius,[[x0,y0],[x1,y0],[x1,y1],[x0,y1]]))return'请先走离门洞再关门。';}W.setState(o,o.state==='open'?'closed':'open');return`${o.name}${o.state==='open'?'已打开':'已关闭'}`;}
  if(kind==='modern_elevator'){const e=state().elevator;if(!e.powered)return'电梯检修停用，请走楼梯。';if(['waiting','running'].includes(e.phase))return`电梯${e.phase==='waiting'?'等待':'运行'}中，目标${e.target}楼。`;G.openMenu(o,Array.from({length:12},(_,i)=>({id:'modern_floor_'+(i+1),label:`${i+1}楼${i===0?' · 住宅大厅':''}`,ok:true,fn:()=>lift(o,i+1)})));return null;}
  if(kind==='modern_stairs'){const floor=W.data.modernFloor;G.openMenu(o,[o.modernStairDirection||1].filter(d=>floor+d>=1&&floor+d<=12).map(d=>({id:'modern_stair_'+(floor+d),label:`${d>0?'上':'下'}一层 → ${floor+d}楼`,ok:true,fn:()=>{G.go({to:floorId(floor+d),spawn:[16,floor+d===1?1.8:.55,'S'],door:o.id});return null;}})));return null;}
  if(kind==='modern_power'){const e=state().elevator;e.powered=!e.powered;e.phase='open';return`电梯${e.powered?'供电已恢复':'停电检修，楼梯仍可通行'}`;}
  const f=current();if(!f)return use0.call(G,o);
  if(kind==='modern_light'||kind==='modern_ac'){W.setState(o,o.state==='on'?'off':'on');H.invalidate();sync();return`${o.name}${o.state==='on'?'已打开':'已关闭'}`;}
  if(kind==='modern_wardrobe'||kind==='modern_rack'){
   const items=state().units[f.unit].laundry,opts=[];
   for(const item of items){const rack=kind==='modern_rack';if(rack&&item.location==='closet')continue;const action=rack?(item.location==='line'?'collect':'hang'):(item.location==='closet'?'take':'return');if(!rack&&item.location==='line')continue;
    opts.push({id:`${o.id}_${action}_${item.kind}`,label:`${({take:'取出',return:'放回柜中 · ',hang:'挂晒',collect:'收回'})[action]}${item.label}`,ok:true,fn:()=>{item.location=action==='take'?'hand':action==='hang'?'line':'closet';item.startedAt=action==='hang'?SP.clock.abs():null;sync();return`${item.label}已${action==='hang'?'挂晒':action==='take'?'取出':'收回柜中'}`;}});
   }if(!opts.length)return'请先从衣柜取出衣服或被子。';G.openMenu(o,opts);return null;
  }
  if(kind==='modern_kitchen')return homeMenu(o,'stove');
  if(kind==='modern_fridge'){W.setState(o,o.state==='open'?'closed':'open');return o.state==='open'?'冰箱已打开。':'冰箱已关闭。';}
  if(kind==='modern_shower')return homeAction(o,'shower');
  if(kind==='modern_basin')return homeAction(o,'wash');if(kind==='modern_toilet')return homeAction(o,'toilet');
  if(kind==='modern_bed')return homeMenu(o,'bed');
  if(kind==='modern_seat'||kind==='modern_table'){G.ps.needs.energy=Math.min(100,G.ps.needs.energy+1);G.ps.needs.mood=Math.min(100,G.ps.needs.mood+1);G.ps.stats.actions.modern_rest=(G.ps.stats.actions.modern_rest||0)+1;SP.clock.skipTo((SP.clock.min+5)%1440,1.2);G.activity={id:'modern_rest',label:'坐下休息',text:'休息了一会。',vis:{},obj:o,t:0,dur:1.2,sleep:false,minutes:5};return null;}
  return use0.call(G,o);
 };
 // Residential menus defer touch selection until release, so a floor-list swipe cannot select a floor.
 const menuEl=document.getElementById('amenu'),openMenu0=G.openMenu;
 if(menuEl){
  const style=document.createElement('style');style.id='modern-residence-touch-style';style.textContent=`
   body.touch #amenu.modern-menu:not(.hidden){position:fixed;top:calc(70px + env(safe-area-inset-top,0px));bottom:calc(164px + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%);width:min(330px,calc(100vw - 32px));min-width:0;max-height:none;overflow-y:auto;overscroll-behavior:contain;box-sizing:border-box;touch-action:none;}
   body.touch #amenu.modern-menu button{min-height:44px;flex-shrink:0;}
   body.touch.landscape #amenu.modern-menu:not(.hidden){top:64px;bottom:78px;width:min(460px,calc(100vw - 270px));min-width:0;grid-template-columns:1fr 1fr;align-content:start;}
  `;document.head.appendChild(style);
  const menuParent=menuEl.parentElement;
  G.openMenu=function(o,opts){const modern=String(o?.interact||'').startsWith('modern_');menuEl.classList.toggle('modern-menu',modern);(modern?document.body:menuParent).appendChild(menuEl);const r=openMenu0.apply(G,arguments);if(modern){const title=menuEl.querySelector('.t'),cancel=menuEl.querySelector('button.x'),buttons=[...menuEl.querySelectorAll('button:not(.x)')],header=document.createElement('div'),list=document.createElement('div');header.className='modern-menu-header';list.className='modern-menu-options';if(title)header.appendChild(title);if(cancel)header.appendChild(cancel);for(const b of buttons)list.appendChild(b);menuEl.replaceChildren(header,list);}menuEl.scrollTop=0;return r;};
  let drag=null,tap=null;
  menuEl.addEventListener('pointerdown',e=>{if(SP.mobileMenuManaged||e.pointerType!=='touch'||!menuEl.classList.contains('modern-menu'))return;e.stopImmediatePropagation();tap=null;const button=e.target.closest('button');drag={id:e.pointerId,y:e.clientY,x:e.clientX,menu:G.menu,scroll:(menuEl.querySelector('.modern-menu-options')||menuEl).scrollTop,index:button&&!button.disabled?button.dataset.i:null,moved:false};menuEl.setPointerCapture(e.pointerId);if(SP.touchRelease)SP.touchRelease();},true);
  menuEl.addEventListener('pointermove',e=>{if(SP.mobileMenuManaged||!drag||e.pointerId!==drag.id)return;e.preventDefault();e.stopImmediatePropagation();if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8)drag.moved=true;(menuEl.querySelector('.modern-menu-options')||menuEl).scrollTop=drag.scroll+drag.y-e.clientY;},true);
  menuEl.addEventListener('pointerup',e=>{if(SP.mobileMenuManaged||!drag||e.pointerId!==drag.id)return;e.stopImmediatePropagation();const d=drag;drag=null;tap={index:d.index,moved:d.moved,menu:d.menu,at:Date.now()};},true);
  menuEl.addEventListener('pointercancel',()=>{drag=null;tap=null;},true);
  menuEl.addEventListener('click',e=>{if(SP.mobileMenuManaged)return;const d=tap;tap=null;if(!d||Date.now()-d.at>1000)return;e.preventDefault();e.stopImmediatePropagation();if(!d.moved&&d.index!=null&&d.menu===G.menu)G.pick(d.index==='x'?-1:+d.index);},true);
 }
 SP.modernResidence=Object.assign({},api,{state,sync,contracts,scene:SP.scenes[ROOM],facade:H.facade(ROOM)});
})(typeof window!=='undefined'?window:globalThis);

