/* Two-stop street bus: physical traffic vehicles, curbside boarding and safe alighting.
 * Lines are per traffic lane (eb / wb: 井槐里 ⇄ 槐东便民街; eb_ng / wb_ng: 南关路西 ⇄ 南关路东 from rongqiao_bus_ng.js). */
(function(SP){
 'use strict';
 if(!SP?.traffic||!SP.game||!SP.world||SP.communityBus)return;
 const T=SP.traffic,G=SP.game,W=SP.world,C=SP.clock;
 // The player is constructed by main.js, after this integration module loads.
 let P=null;
 const FARE=2,OPEN=360,CLOSE=1380;
 const fallback=[
  {id:'bus_stop',reach:[-20,1.15],lane:'wb',frontStop:-23,side:'north'},
  {id:'bus_stop_old_south',reach:[-20,-7.9],lane:'eb',frontStop:-17,side:'south'},
  {id:'bus_stop_east_north',reach:[145,1.15],lane:'wb',frontStop:145,side:'north'},
  {id:'bus_stop_east_south',reach:[145,-7.9],lane:'eb',frontStop:145,side:'south'}
 ];
 const authored=window.EAST_SERVICES_EXTENSION?.busStops;
 const stops=(Array.isArray(authored)&&authored.length===4?authored:fallback).map(s=>({
  id:s.id,reach:s.reach.slice(),lane:s.lane,frontAt:s.frontStop,side:s.side,
  name:s.id.includes('east')?'槐东便民街':'井槐里'
 }));
 for(const s of window.SCENE_DATA?.rongqiaoBusNg?.stops||[])stops.push({id:s.id,reach:s.reach.slice(),lane:s.lane,frontAt:s.frontStop,side:s.side,name:s.name});
 const byId=Object.fromEntries(stops.map(s=>[s.id,s]));
 const road=window.SCENE_DATA?.traffic;
 const lines={};
 for(const s of stops)(lines[s.lane]||(lines[s.lane]=[])).push(s);
 for(const k of Object.keys(lines)){const dir=road?.lanes.find(l=>l.id===k)?.dir||(k.startsWith('wb')?-1:1);lines[k].sort((a,b)=>dir*(a.frontAt-b.frontAt));}
 if(!road||lines.eb?.length!==2||lines.wb?.length!==2)return;
 for(const k of Object.keys(lines))if(lines[k].length!==2||!road.lanes.some(l=>l.id===k)){for(const s of lines[k])stops.splice(stops.indexOf(s),1);delete lines[k];}
 for(const k of Object.keys(byId))if(!stops.includes(byId[k]))delete byId[k];
 for(const lane of road.lanes)if(lane.id==='eb'||lane.id==='wb')lane.range=[lane.range[0],Math.max(180,lane.range[1])];
 // The original north shelter is in the base scene. It becomes a real curbside stop.
 const old=window.SCENE_DATA.objects.find(o=>o.id==='bus_stop');
 if(old){old.interact='community_bus_stop';old.reach=byId.bus_stop.reach.slice();}
 const contract=window.EAST_SERVICES_EXTENSION?.crosswalkContract;
 if(contract){
  const cw=contract.crosswalk||contract;
  if(cw?.id&&!road.crosswalks.some(x=>x.id===cw.id))road.crosswalks.push(cw);
  for(const [laneId,at]of Object.entries(contract.stopLines||{})){
   const lane=road.lanes.find(l=>l.id===laneId);
   if(lane&&cw?.id&&!lane.stops.some(s=>s.cw===cw.id))lane.stops.push({at,cw:cw.id});
  }
 }
 T.serviceBusManaged=true;
 const LINE_IDS=['eb','wb'].concat(Object.keys(lines).filter(k=>k!=='eb'&&k!=='wb')),timers0=()=>Object.fromEntries(LINE_IDS.map((k,i)=>[k,1+i]));
 let riding=null,timers=timers0();
 const stopFor=o=>o&&byId[o.id];
 const available=()=>C.min>=OPEN&&C.min<CLOSE;
 function state(){return G.ps.communityBus||(G.ps.communityBus={rides:0,spent:0,lastRideAt:null});}
 const terminal=stop=>lines[stop.lane][1].id===stop.id;
 function busAt(stop){return T.cars.find(c=>c.serviceLine===stop.lane&&c.atStop&&c.stopId===stop.id&&c.v<.05&&c.service?.next===0);}
 function status(stop){
  if(riding)return '正在乘车，抵达下一站后会安全下车。';
  if(terminal(stop))return '本方向终点站，请到马路对面乘返程公交。';
  if(!available())return '公交运营时间 06:00–23:00。';
  const bus=busAt(stop);
  return bus?'公交已停稳 · 车费 ¥2 · 按 '+(SP.keybindings?.label('transit')||'F')+' 上车':'公交尚未到站，请在站牌旁等车。';
 }
 function board(o){
  P=SP.player;
  const stop=stopFor(o);
  if(!stop||W.interior||P.level==='roof'||P.carry)return '请在站牌旁候车。';
  if(Math.hypot(P.x-stop.reach[0],P.y-stop.reach[1])>1.65)return '请走近站牌再上车。';
  if(!available())return '公交运营时间 06:00–23:00。';
  if(G.busy())return '先结束当前活动。';
  const bus=busAt(stop),dest=bus&&bus.service.stops[bus.service.next+1];
  if(!bus||!dest)return status(stop);
  const payment=G.rules.spend(G.ps,FARE,'社区公交',C.abs());
  if(!payment)return '零钱不足，车费 ¥2。';
  const s=state();s.rides++;s.spent+=FARE;s.lastRideAt=C.abs();
  riding={owner:G.ps,bus,from:stop,to:byId[dest.id],boardedAt:C.abs()};
  bus.holdForRider=true;bus.riderDestination=dest.id;
  P.hidden=true;P.x=bus.x;P.y=bus.y;P.moving=false;P.runK=0;
  if(G.payCard)G.payCard({amount:FARE,method:G.rules.payLabel?.(G.ps)||'微信支付',to:'社区公交',what:`${stop.name} → ${riding.to.name}`});
  W.logEvent(`乘公交从${stop.name}出发，支付车费 ¥2`);
  SP.toast(`已上车 · 前往${riding.to.name} · 到站自动下车`);
  G.hud?.();showRide();return null;
 }
 function safeAlight(stop,point){
  P=SP.player;
  const [x,y]=point||stop.reach,was=[P.x,P.y,P.hidden,P.dir];
  P.hidden=false;P.x=x;P.y=y;P.setDir(stop.side==='north'?'N':'S');
  if(!SP.actors.shapeClear(P,x,y,P.dir)){
   P.x=was[0];P.y=was[1];P.hidden=was[2];P.setDir(was[3]);return false;
  }
  P.target=P.dir;P.moving=false;P.runK=0;G.lastXY=[x,y];G.armed=false;return true;
 }
 const ALIGHT_OFFSETS=[0,.65,-.65,1.1,-1.1];
 function alightNear(stop){
  for(const dx of ALIGHT_OFFSETS)if(safeAlight(stop,[stop.reach[0]+dx,stop.reach[1]]))return true;
  return false;
 }
 function recoverRide(){
  if(!riding)return true;
  const {bus,from,to}=riding;
  const nearest=[from,to].sort((a,b)=>Math.abs(bus.x-a.reach[0])-Math.abs(bus.x-b.reach[0]));
  for(const stop of nearest)for(const dx of ALIGHT_OFFSETS){
   if(!safeAlight(stop,[stop.reach[0]+dx,stop.reach[1]]))continue;
   bus.holdForRider=false;bus.riderDestination=null;riding=null;showRide();
   W.logEvent(`公交运行中断，已在${stop.name}站牌旁安全下车`);
   SP.toast(`公交运行中断 · 已在${stop.name}站牌旁安全下车`);
   return true;
  }
  P.hidden=true;return false;
 }
 let pill=null;
 function showRide(){
  if(!pill){pill=document.createElement('div');pill.id='community-bus-ride';
   pill.style.cssText='position:absolute;left:50%;bottom:52px;transform:translateX(-50%);z-index:55;padding:6px 12px;border:1px solid #7795ad;border-radius:7px;background:rgba(17,33,50,.93);color:#e8f3ff;font:12px sans-serif;pointer-events:none';
   document.getElementById('wrap')?.appendChild(pill);}
  pill.textContent=riding?`社区公交 · 前往${riding.to.name} · 已付 ¥2`:'';
  pill.style.display=riding?'block':'none';
 }
 // Optional express playback runs the original main simulation in bounded batches.
 let skipMode=null,skipHud=null,skipText=null,skipButton=null,veil=null,veilText=null,offerRide=null;
 const skipAllowed=()=>!!(riding&&riding.owner===G.ps&&T.cars.includes(riding.bus)&&riding.bus.state==='normal'&&!W.interior&&!SP.metroActive&&!SP.cbd?.active&&!G.trans&&!G.activity&&!G.menu&&!C.ff&&G.ps.npcConflict?.player?.health!==0&&!G.ps.npcConflict?.player?.custody&&!SP.phone?.isOpen?.()&&!SP.nearbyPicker?.isOpen?.());
 function endSkip(reason){if(!skipMode||skipMode.phase==='fadein')return;skipMode.phase='fadein';skipMode.elapsed=0;skipMode.result=reason;if(reason==='timeout')SP.toast('路况或下车位置仍受阻，已恢复正常乘车，可稍后再试。');}
 function requestSkip(){if(skipMode||!skipAllowed())return{ok:false,reason:'当前没有可快进的乘车路段。'};skipMode={ride:riding,owner:G.ps,phase:'fadeout',elapsed:0,startedAt:C.abs(),result:null};SP.touchRelease?.();window.dispatchEvent(new Event('blur'));updateSkipUI();return{ok:true};}
 function ensureSkipUI(){if(skipHud||!document.body?.appendChild)return;
  const css=document.createElement('style');css.textContent='@keyframes bus-skip-breathe{0%,100%{opacity:.48}50%{opacity:.86}}#bus-skip-hud{position:fixed;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 160px);z-index:92;padding:8px 11px;max-width:calc(100vw - 24px);background:#15252ec9;border-radius:10px;color:#e4eceb;font:13px/1.5 system-ui}#bus-skip-hud[hidden],#bus-skip-veil[hidden]{display:none}#bus-skip-hud p{margin:0 0 5px;animation:bus-skip-breathe 2.8s ease-in-out infinite}#bus-skip-hud button,#bus-skip-veil button{min-height:44px;padding:8px 14px;color:#edf5ef;background:#29434b;border:1px solid #a2bcb488;border-radius:8px;font:inherit}#bus-skip-veil{position:fixed;inset:0;z-index:1650;display:grid;place-content:center;gap:14px;text-align:center;background:#102027f5;color:#edf5ef;font:16px/1.6 system-ui;opacity:0;touch-action:manipulation}body.landscape #bus-skip-hud{bottom:calc(env(safe-area-inset-bottom,0px) + 104px)}@media(prefers-reduced-motion:reduce){#bus-skip-hud p{animation:none;opacity:.8}#bus-skip-veil{transition:none}}';document.head.appendChild(css);
  skipHud=document.createElement('div');skipHud.id='bus-skip-hud';skipHud.hidden=true;skipText=document.createElement('p');skipButton=document.createElement('button');skipButton.id='bus-skip-button';skipButton.type='button';skipButton.textContent='快进到下一站';skipButton.onclick=()=>{if(offerRide!==riding||offerRide?.owner!==G.ps)return;requestSkip();};skipHud.appendChild(skipText);skipHud.appendChild(skipButton);
  veil=document.createElement('div');veil.id='bus-skip-veil';veil.hidden=true;veilText=document.createElement('div');veilText.setAttribute('role','status');const cancel=document.createElement('button');cancel.type='button';cancel.id='bus-skip-cancel';cancel.textContent='取消快进，继续正常乘车';cancel.onclick=()=>endSkip('cancelled');veil.appendChild(veilText);veil.appendChild(cancel);
  for(const box of[skipHud,veil]){for(const ev of['pointerdown','touchstart','mousedown'])box.addEventListener(ev,e=>e.stopPropagation());document.body.appendChild(box);}
 }
 function updateSkipUI(){ensureSkipUI();if(!skipHud)return;const offer=!skipMode&&skipAllowed();skipHud.hidden=!offer;offerRide=offer?riding:null;if(offer){const msg='按 '+(SP.keybindings?.label('skip')||'G')+' 快进 · 可继续看沿途';if(skipText.textContent!==msg)skipText.textContent=msg;}veil.hidden=!skipMode;if(skipMode){veil.style.opacity=String(skipMode.phase==='fadein'?Math.max(0,1-skipMode.elapsed/.25):skipMode.phase==='fadeout'?Math.min(1,skipMode.elapsed/.24):1);const message=(skipMode.result==='arrived'?'已安全抵达':skipMode.result?'恢复正常乘车':'正在前往'+skipMode.ride.to.name)+' · Esc 可取消快进';if(veilText.textContent!==message)veilText.textContent=message;}}
 function skipFrame(dt){
  if(riding&&riding.owner!==G.ps){riding.bus.holdForRider=false;riding.bus.riderDestination=null;riding=null;skipMode=null;if(SP.player)SP.player.hidden=false;showRide();}
  if(skipMode){if(skipMode.owner!==G.ps){skipMode=null;}else if(skipMode.phase==='fadein'){skipMode.elapsed+=Math.min(.1,dt);if(skipMode.elapsed>=.25)skipMode=null;}else if(!skipAllowed()||riding!==skipMode.ride){endSkip('interrupted');}else if(C.abs()-skipMode.startedAt>=60){endSkip('timeout');}else{skipMode.elapsed+=Math.min(.1,dt);if(skipMode.phase==='fadeout'&&skipMode.elapsed>=.24){skipMode.phase='running';skipMode.elapsed=0;}}}
  updateSkipUI();return skipMode?.phase==='running';
 }
 function accelerating(){return !!(skipMode?.phase==='running'&&skipMode.ride===riding&&skipAllowed());}
 function syncRide(){
  if(!riding)return;
  const {bus,to}=riding;
  if(riding.owner!==G.ps){bus.holdForRider=false;bus.riderDestination=null;riding=null;skipMode=null;P.hidden=false;showRide();return;}
  if(!T.cars.includes(bus)){recoverRide();return;}
  P.x=bus.x;P.y=bus.y;P.hidden=true;
  if(bus.atStop&&bus.stopId===to.id&&bus.v<.05&&alightNear(to)){
   bus.holdForRider=false;bus.riderDestination=null;riding=null;endSkip('arrived');showRide();
   W.logEvent(`公交到达${to.name}，已在站牌旁安全下车`);
   SP.toast(`已到达${to.name} · 安全下车`);
  }
 }
 const action0=G.actionFor,use0=G.use,busy0=G.busy,go0=G.go,switch0=G.switchScene;
 G.actionFor=function(o,kind){const stop=stopFor(o);if(stop)return kind==='use'?{label:terminal(stop)?'终点站 · 到对面乘返程公交':!available()?'公交已收班 · 06:00 开行':busAt(stop)?'公交已停稳 · 上车 ¥2':'候车 · '+stop.name,do:'game'}:null;return action0.call(this,o,kind);};
 G.use=function(o){if(stopFor(o))return board(o);return use0.call(this,o);};
 G.busy=function(){return !!riding||busy0.call(this);};
 G.go=function(){if(riding){SP.toast('乘车途中请先到站下车');return false;}return go0.apply(this,arguments);};
 G.switchScene=function(){if(riding){SP.toast('乘车途中请先到站下车');return false;}return switch0.apply(this,arguments);};
 const update0=T.update,reset0=T.reset;
 T.update=function(dt){
  P=SP.player;
  const out=update0.call(this,dt);
  if(available())for(const laneId of LINE_IDS){
   if(T.cars.some(c=>c.serviceLine===laneId)){timers[laneId]=Math.max(timers[laneId],3);continue;}
   const capLane=road.lanes.find(l=>l.id===laneId);if(capLane?.max&&T.cars.filter(c=>c.lane===laneId).length>=capLane.max){timers[laneId]=Math.max(timers[laneId],1.5);continue;}   // lanes with their own cap (南关路) keep it
   timers[laneId]-=dt;
   if(timers[laneId]<=0){const bus=T.spawnServiceBus(laneId,lines[laneId].map(s=>({id:s.id,frontAt:s.frontAt,dwell:12})));
    timers[laneId]=bus?18:1.5;}
  }
  syncRide();updateSkipUI();return out;
 };
 T.reset=function(){
  const out=reset0.apply(this,arguments);timers=timers0();if(riding)recoverRide();endSkip('interrupted');return out;
 };
 // A hidden player must not trigger event/reset hotkeys during a ride.
 window.addEventListener('keydown',e=>{
  if(!riding||e.ctrlKey||e.metaKey||e.altKey)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(e.repeat||e.isComposing||e.target?.closest?.('input,textarea,select,[contenteditable=true]'))return;
  const k=SP.keybindings?.resolve(e.key)??e.key.toLowerCase();if(k==='g')requestSkip();if(k==='escape'&&skipMode)endSkip('cancelled');
  if(k==='e')SP.toast('正在乘车，到下一站后自动下车');
 },true);
 const blockRideControl=e=>{
  if(!riding||!e.target?.closest?.('[data-ev="reset"], [data-tev="reset"], #btn-act, #btn-kick'))return;
  e.preventDefault();e.stopImmediatePropagation();SP.toast('正在乘车，到下一站后自动下车');
 };
 window.addEventListener('click',blockRideControl,true);
 window.addEventListener('pointerdown',blockRideControl,true);
 SP.communityBus={stops,lines,state,status,board,busAt,requestSkip,skipFrame,accelerating,skipStatus:()=>skipMode?{phase:skipMode.phase,result:skipMode.result,to:skipMode.ride.to.id}:null,riding:()=>riding,fare:FARE};
})(window.SP);
