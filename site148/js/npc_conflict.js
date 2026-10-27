/* I17 street conflict and finite patrol response. Presentation uses the existing sprite system. */
(function(root){
 'use strict';
 const SP=root.SP,G=SP.game,W=SP.world,C=SP.clock,M=root.NpcConflictModel,D=root.document;
 const police=new Map();let hydrated=new WeakSet(),banner,modal,struggleButton,statementButton,uiBuilt=false,previousEvent=0,lastSound=-10,audio=null,car=null,lastStreet=true,lastBlocker=null;
 const STATION=[100.5,34.1],STATION_ROOM='community_civic_room',PATROLS={patrol_a:[20,2.8],patrol_b:[30.5,8]},FINE=200;
 function state(){return G.ps.npcConflict||(G.ps.npcConflict=M.fresh());}
 function street(){return !W.interior&&!SP.metroActive&&!SP.cbd?.active&&SP.player.level!=='roof';}
 function sight(a,b,range=12){if(Math.hypot(a.x-b.x,a.y-b.y)>range)return false;for(let t=.1;t<1;t+=.1)if(W.blockedStatic(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,.05))return false;return true;}
 const navStats={plans:0,replans:0,blockedFrames:0,escortSteps:0,maxPlayerStep:0,maxOfficerStep:0,sceneTransfers:0};
 const CLEARANCE=.07;
 const PATROL_PATHS={patrol_a:[[20,2.8],[16,2.8]],patrol_b:[[30.5,5],[30.5,9]]};
 let proxyPlans=new WeakMap();
 function roadDepth(x,y,r){const tr=W.data.traffic;if(!tr?.lanes)return 0;let depth=0;for(const axis of ['x','y']){const lanes=tr.lanes.filter(l=>l.axis===axis);if(!lanes.length)continue;const lo=Math.min(...lanes.map(l=>l.c))-1.5-r,hi=Math.max(...lanes.map(l=>l.c))+1.5+r,v=axis==='x'?y:x;if(v>lo&&v<hi)depth=Math.max(depth,Math.min(v-lo,hi-v));}for(const cw of tr.crosswalks||[]){const m=.8+r;if(x>cw.x0-m&&x<cw.x1+m&&y>cw.y0-m&&y<cw.y1+m)depth=Math.max(depth,Math.min(x-cw.x0+m,cw.x1+m-x,y-cw.y0+m,cw.y1+m-y));}return depth;}
 function resetEscort(a){if(a){clearWalk(a);a._escortTrail=null;a._custodyToken=null;}clearWalk(SP.player);SP.player._escortTrail=null;}
 function proxyRoute(u,tx,ty,block){const sig=tx.toFixed(2)+','+ty.toFixed(2),old=proxyPlans.get(u);if(Math.hypot(u.x-tx,u.y-ty)<.2){u.route=[];return true;}if(old?.sig===sig&&(u.route?.length||SP.now<old.nextAt))return;u.route=route(u.x,u.y,tx,ty,block);proxyPlans.set(u,{sig,nextAt:SP.now+1});}

 function clearSegment(x,y,tx,ty,r,blocked){const n=Math.max(1,Math.ceil(Math.hypot(tx-x,ty-y)/.12));for(let i=1;i<=n;i++)if(blocked(x+(tx-x)*i/n,y+(ty-y)*i/n,r))return false;return true;}
 function route(x,y,tx,ty,blocked=(x,y,r)=>W.blockedStatic(x,y,r),radius=.30,maxNodes=60000){
  navStats.plans++;if(blocked(tx,ty,radius))return [];if(clearSegment(x,y,tx,ty,radius,blocked))return [[tx,ty]];
  const H=.5,key=(a,b)=>a+','+b,sx=Math.round(x/H),sy=Math.round(y/H),gx=Math.round(tx/H),gy=Math.round(ty/H),heap=[],cost=new Map(),parents=new Map(),closed=new Set(),cache=new Map();
  const push=n=>{heap.push(n);let i=heap.length-1;while(i){const j=(i-1)>>1;if(heap[j].f<=n.f)break;heap[i]=heap[j];i=j;}heap[i]=n;};
  const pop=()=>{const n=heap[0],tail=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let j=i*2+1;if(j+1<heap.length&&heap[j+1].f<heap[j].f)j++;if(heap[j].f>=tail.f)break;heap[i]=heap[j];i=j;}heap[i]=tail;}return n;};
  const pass=(a,b)=>{const k=key(a,b);if(!cache.has(k))cache.set(k,!blocked(a*H,b*H,radius));return cache.get(k);};
  const anchors=[];for(let a=sx-3;a<=sx+3;a++)for(let b=sy-3;b<=sy+3;b++)if(pass(a,b)&&clearSegment(x,y,a*H,b*H,radius,blocked))anchors.push({x:a,y:b,g:Math.hypot(a*H-x,b*H-y)});anchors.sort((a,b)=>a.g-b.g);
  for(const a of anchors.slice(0,4)){const k=key(a.x,a.y);cost.set(k,a.g);parents.set(k,null);push({...a,f:a.g+Math.hypot(a.x*H-tx,a.y*H-ty)});}
  const margin=40,bx=[Math.min(sx,gx)-margin,Math.min(sy,gy)-margin,Math.max(sx,gx)+margin,Math.max(sy,gy)+margin];let count=0;
  while(heap.length&&count++<(Number.isFinite(maxNodes)?Math.max(1,Math.min(60000,Math.floor(maxNodes))):60000)){const n=pop(),k=key(n.x,n.y);if(closed.has(k))continue;closed.add(k);
   if(Math.hypot(n.x*H-tx,n.y*H-ty)<1&&clearSegment(n.x*H,n.y*H,tx,ty,radius,blocked)){const path=[[tx,ty]];let cur=k;while(cur!==null){const [a,b]=cur.split(',').map(Number);path.push([a*H,b*H]);cur=parents.get(cur);}path.reverse();const smooth=[];let px=x,py=y;for(let i=0;i<path.length;){let j=i;while(j+1<path.length&&clearSegment(px,py,...path[j+1],radius,blocked))j++;smooth.push(path[j]);[px,py]=path[j];i=j+1;}return smooth;}
   for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const ax=n.x+dx,ay=n.y+dy,j=key(ax,ay),g=n.g+Math.hypot(dx,dy)*H;if(ax<bx[0]||ay<bx[1]||ax>bx[2]||ay>bx[3]||closed.has(j)||g>=(cost.get(j)??Infinity)||!pass(ax,ay)||!clearSegment(n.x*H,n.y*H,ax*H,ay*H,radius,blocked))continue;cost.set(j,g);parents.set(j,k);push({x:ax,y:ay,g,f:g+Math.hypot(ax*H-tx,ay*H-ty)});}
  }return [];
 }
 function poseMotion(a,dt,dx=0,dy=0){const moved=Math.hypot(dx,dy);a.moving=!!a._policeMoving;if(moved>.00001){a.settle=null;a.clip=null;a.posed=false;}a.update(dt,moved>.00001,moved>.00001?SP.dirFromWorld(dx,dy):a.dir,moved);a._policeMoving=a.moving;return moved;}
 function stop(a,dt=0){if(!a)return;poseMotion(a,dt);a.armed=false;a.shotUntil=0;}
 function clearWalk(a){a._policePath=null;a._pathSig=null;a._pathBlocked=0;a._progress=null;a._policeMoving=false;a.moving=false;a.settle=null;a.frame=0;}
 function walk(a,tx,ty,speed,dt,stopAt=.18,patrolOnly=false){
  const radius=(a.radius||.22)+CLEARANCE,remaining=Math.hypot(tx-a.x,ty-a.y);if(remaining<stopAt){stop(a,dt);return true;}
  const sig=(patrolOnly?'patrol:':'')+tx.toFixed(1)+','+ty.toFixed(1);if(!a._progress||a._progress.sig!==sig)a._progress={x:a.x,y:a.y,at:SP.now,sig};else if(SP.now-a._progress.at>2){if(Math.hypot(a.x-a._progress.x,a.y-a._progress.y)<.15)a._pathBlocked=.8;a._progress={x:a.x,y:a.y,at:SP.now,sig};}const stalled=(a._pathBlocked||0)>.7;
  const initialRoad=patrolOnly?roadDepth(a.x,a.y,radius):0;const blocker=(x,y,r)=>{if(W.blockedStatic(x,y,r))return true;if(patrolOnly){const depth=roadDepth(x,y,r);if(depth>0&&(initialRoad===0||depth>initialRoad+.001))return true;}if(stalled){const b=SP.actors.list.find(b=>b.id===a.blockedBy&&b!==a&&!b.hidden);if(b&&Math.hypot(b.x-tx,b.y-ty)>.8&&Math.hypot(b.x-x,b.y-y)<Math.min(r+(b.radius||.22)+.08,Math.hypot(b.x-a.x,b.y-a.y)-.008))return true;}return false;};
  if(!a._policePath||a._pathSig!==sig||stalled){if(stalled)navStats.replans++;a._policePath=route(a.x,a.y,tx,ty,blocker,radius);a._pathSig=sig;a._pathBlocked=0;}
  while(a._policePath.length&&Math.hypot(a.x-a._policePath[0][0],a.y-a._policePath[0][1])<.10)a._policePath.shift();
  const q=a._policePath[0];if(!q){a._pathBlocked=(a._pathBlocked||0)+dt;stop(a,dt);return false;}
  const dx=q[0]-a.x,dy=q[1]-a.y,l=Math.hypot(dx,dy),step=Math.min(l,speed*dt),x=a.x,y=a.y;SP.actors.move(a,dx/l*step,dy/l*step);const moved=poseMotion(a,dt,a.x-x,a.y-y);
  a._pathBlocked=moved<step*.4?(a._pathBlocked||0)+dt:0;if(moved<step*.4)navStats.blockedFrames++;return Math.hypot(tx-a.x,ty-a.y)<stopAt;
 }
 function escort(a,tx,ty,dt){const p=SP.player;if(!a._escortTrail)a._escortTrail=[[a.x,a.y]];const trail=a._escortTrail,px=p.x,py=p.y,ax=a.x,ay=a.y;
  if(Math.hypot(a.x-p.x,a.y-p.y)<1.65)walk(a,tx,ty,1.6,dt,.15);else stop(a,dt);
  if(Math.hypot(a.x-trail.at(-1)[0],a.y-trail.at(-1)[1])>.16)trail.push([a.x,a.y]);
  while(trail.length>1&&Math.hypot(p.x-trail[0][0],p.y-trail[0][1])<.12)trail.shift();
  if(Math.hypot(a.x-p.x,a.y-p.y)>.78&&trail.length)walk(p,...trail[0],1.75,dt,.10);else stop(p,dt);
  navStats.escortSteps++;navStats.maxPlayerStep=Math.max(navStats.maxPlayerStep,Math.hypot(p.x-px,p.y-py));navStats.maxOfficerStep=Math.max(navStats.maxOfficerStep,Math.hypot(a.x-ax,a.y-ay));
  return Math.hypot(a.x-tx,a.y-ty)<.2&&Math.hypot(p.x-tx,p.y-ty)<1.15;
 }
 function officer(id,x,y){
  let a=police.get(id);if(!a){a=new SP.Actor({id,set:'nd_police',x,y,speed:2.5,radius:.22,height:1.8,name:'巡逻民警'});a.police=true;a.hasGun=id!=='patrol_a';a.setDir('S');police.set(id,a);SP.ensureActor('nd_police');}
  if(!SP.actors.list.includes(a))SP.actors.list.push(a);a.hidden=false;return a;
 }
 function syncPolice(s){
  s.patrols=s.patrols||Object.fromEntries(Object.entries(PATROLS).map(([id,p])=>[id,{x:p[0],y:p[1]}]));
  if(!street())return;
  for(const [id,p]of Object.entries(s.patrols)){
   const a=officer(id,p.x,p.y);if(!hydrated.has(a)||!lastStreet){a.x=p.x;a.y=p.y;a._policePath=null;hydrated.add(a);}
  }
  if(s.unit.officerId==='response_officer'||s.unit.returning==='response_officer'){const a=officer('response_officer',s.unit.x,s.unit.y);if(!lastStreet){a.x=s.unit.x;a.y=s.unit.y;a._policePath=null;}}
 }
 function selectedActor(){const o=SP.state.near;if(o?.actor)return o.actor;if(o?.interact==='community_social')return SP.actors.list.find(a=>a.id==='community_resident_lin');return null;}
 function attack(kind){
  if(SP.neighborhoodStore?.holdsCargo?.()){SP.toast('抱箱时不能攻击，请先卸货或退箱');return true;}
  if(G.busy()||G.menu||SP.phone?.isOpen())return false;
  const a=selectedActor();if(!a)return false;
  if(a.isAnimal){SP.toast('可以走近观察、喂食或温和互动。');return true;}
  if(a.storeCourier){SP.toast('配送员的伤害与救援流程尚未接入。');return true;}
  if(!street()){SP.toast('这个区域暂未开放近身攻击。');return true;}
  if(!sight(SP.player,a,1.7)||a.hidden||a.vehicle){SP.toast('走近目标，并确保中间没有墙或家具。');return true;}
  const s=state(),witnesses=(SP.actors.list||[]).filter(b=>b!==a&&b!==SP.player&&!b.isAnimal&&!b.hidden&&!b.vehicle&&sight(b,a,10)).map(b=>b.id);
  const weapon=kind==='kick'?'kick':s.player.weapon;s.player.surrendered=false;
  const r=M.hit(s,{id:a.id,x:a.x,y:a.y,scene:'street',traits:a.police?'civic':undefined,isPolice:!!a.police,witnesses,weapon},C.abs());
  if(!r.ok){SP.toast(r.reason);return true;}
  SP.animals?.witnessAttack(SP.player,a);
  if(witnesses.some(id=>police.has(id))){r.case.reportAt=C.abs();M.note(s,C.abs(),'police_witness',r.case.id,'附近巡警亲眼看见了攻击。');}
  if(a.police&&s.unit.caseId===r.case.id){s.unit.officerId=a.id;s.unit.x=a.x;s.unit.y=a.y;s.unit.scene='street';s.unit.boarded=false;s.unit.route=null;s.unit.returning=null;r.case.status='pursuit';r.case.arrivedAt=C.abs();clearWalk(a);}
  r.person.x=a.x;r.person.y=a.y;SP.player.kickT=.38;SP.player.weaponSwing=weapon;SP.player.setDir(SP.dirFromWorld(a.x-SP.player.x,a.y-SP.player.y));a.bubble={text:'!',t:2};if(a.police)a.bubble={text:'停止攻击，配合控制',t:2};else SP.conflictDialogue?.react(a,r.person,weapon);SP.fx.shake=.09;
  if(r.person.health===0)SP.toast('对方倒下了。目击者可能报警，严重暴力会升级警方响应。');else SP.toast('对方受到攻击 · '+r.person.emotion);
  SP.nearbyPicker?.close();return true;
 }
 function ui(){
  if(uiBuilt)return;uiBuilt=true;
  const style=D.createElement('style');style.textContent='#conflict-hud{position:fixed;left:10px;top:calc(env(safe-area-inset-top,0px) + 104px);z-index:89;max-width:min(450px,80vw);padding:7px 11px;border:1px solid #796b4c;background:#162126dd;color:#ead5ad;border-radius:8px;font:12px/1.5 system-ui;pointer-events:none}#conflict-buttons{position:fixed;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 260px);z-index:91;display:flex;flex-wrap:wrap;justify-content:flex-end;max-width:94vw;gap:6px}#conflict-buttons button{min-height:42px;padding:8px;font:13px system-ui;background:#202d35;color:#eed7ad;border-radius:8px}body.landscape #conflict-buttons{right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 190px)}#conflict-result{position:fixed;inset:0;z-index:1750;background:#091219bb;display:grid;place-items:center;color:#eee;font:16px/1.7 system-ui}#conflict-result[hidden]{display:none}#conflict-result section{background:#192b32;border:1px solid #a99165;border-radius:14px;padding:24px;width:min(400px,85vw)}';D.head.append(style);
  banner=D.createElement('div');banner.id='conflict-hud';D.body.append(banner);
  const controls=D.createElement('div');controls.id='conflict-buttons';
  const add=(text,fn,id)=>{const b=D.createElement('button');b.id='conflict-'+id;b.textContent=text;b.onclick=fn;controls.append(b);return b;};
  add('攻击',()=>{if(!attack('weapon'))SP.toast('先走近人物，用附近对象列表选择目标。');},'attack');add('装备 / 拾取',equipment,'equipment');add('威胁索钱',rob,'rob');add('配合警员 H',surrender,'surrender');struggleButton=add('挣扎脱身',struggle,'struggle');struggleButton.hidden=true;statementButton=add('陈述经过',statementMenu,'statement');statementButton.hidden=true;D.body.append(controls);
  modal=D.createElement('div');modal.id='conflict-result';modal.hidden=true;D.body.append(modal);
 }
 function equipment(){
  if(G.busy())return;const s=state(),p=SP.player;
  const section=D.createElement('section'),h=D.createElement('h2');h.textContent='装备与拾取';section.append(h);modal.replaceChildren(section);modal.hidden=false;
  const button=(text,fn)=>{const b=D.createElement('button');b.textContent=text;b.style.cssText='display:block;margin:10px 0;min-height:44px;width:100%';b.onclick=fn;section.append(b);};
  const take=(id)=>{if(!s.player.owned.includes(id))s.player.owned.push(id);s.player.weapon=id;modal.hidden=true;SP.toast('已拾取并装备'+(id==='branch'?'树枝':'厨房刀'));};
  if(street()&&Math.hypot(p.x-7.8,p.y-8.4)<2.2&&!s.player.owned.includes('branch'))button('拾取地上的树枝',()=>take('branch'));
  if(W.interior&&W.sceneId==='room_2f02'&&W.byId.kitchen&&Math.hypot(p.x-W.byId.kitchen.x,p.y-W.byId.kitchen.y)<2.2&&!s.player.owned.includes('knife'))button('取用家中的厨房刀',()=>take('knife'));
  const owner=G.ps,atSource=id=>id==='knife'?W.interior&&W.sceneId==='room_2f02'&&W.byId.kitchen&&Math.hypot(p.x-W.byId.kitchen.x,p.y-W.byId.kitchen.y)<2.2:street()&&Math.hypot(p.x-7.8,p.y-8.4)<2.2;
  for(const [id,label]of [['knife','厨房刀'],['branch','树枝']])if(s.player.owned.includes(id)&&atSource(id))button('放回原处 · '+label,()=>{if(owner!==G.ps||!atSource(id)||!s.player.owned.includes(id)){SP.toast('请本人携带物品回到原取用处。');return;}s.player.owned=s.player.owned.filter(x=>x!==id);if(s.player.weapon===id)s.player.weapon='fists';modal.hidden=true;SP.toast('已放回'+label+'，不再随身携带。');});
  for(const [id,label]of [['fists','徒手'],['branch','树枝'],['knife','厨房刀']])if(id==='fists'||s.player.owned.includes(id))button('装备 · '+label,()=>{s.player.weapon=id;modal.hidden=true;});
  const note=D.createElement('p');note.textContent='树枝在井槐里出生点附近地面；厨房刀在家中。武器需回到原取用处放回，切为徒手仍算携带。攻击会造成伤害与警务后果。';section.append(note);button('关闭',()=>modal.hidden=true);
 }
 function statementMenu(){if(SP.conflictDialogue){if(M.active(state())?.status==='escorting')SP.toast('正在押送，抵达后会继续共同询问。');else SP.conflictDialogue.show();return;}const c=M.active(state());if(!c||!['inquiry','escorting','processing'].includes(c.status))return;const section=D.createElement('section'),h=D.createElement('h2');h.textContent='向警员陈述 · 陈述不等于已核实';section.append(h);for(const [value,label]of [['admit','承认先动手，说明经过'],['defense','说明自己是在防卫'],['dispute','对指控提出异议'],['accuse','指认对方先动手']]){const b=D.createElement('button');b.textContent=label;b.style.cssText='display:block;margin:12px;padding:10px';b.onclick=()=>{M.statement(state(),value,C.abs());modal.hidden=true;SP.toast('已记录陈述，警员将核对目击与其他证词。');};section.append(b);}const input=D.createElement('textarea');input.maxLength=600;input.placeholder='自由陈述经过、提出证据或质疑（需要启用全局 API）';input.style.cssText='width:100%;min-height:90px;box-sizing:border-box';section.append(input);const send=D.createElement('button'),status=D.createElement('p');send.textContent='提交自由陈述';send.disabled=!SP.ai?.settings().enabled;send.onclick=async()=>{if(!input.value.trim())return;const owner=G.ps,id=c.id,raw=input.value.trim();send.disabled=true;status.textContent='正在整理陈述…';try{const r=await SP.ai.express({kind:'police_statement',input:raw,context:{stage:c.status}});if(owner!==G.ps||M.active(state())?.id!==id)return;M.statement(state(),r.claim,C.abs(),raw);status.textContent=r.reply+'（已记录陈述，真假与后果由证据规则判定）';}catch(e){status.textContent='未提交：'+e.message;}finally{send.disabled=false;}};section.append(send,status);const close=D.createElement('button');close.textContent='完成陈述 / 继续询问';close.onclick=()=>modal.hidden=true;section.append(close);modal.replaceChildren(section);modal.hidden=false;SP.touchRelease?.();}
 function struggle(){const s=state(),n=[...police.values()].filter(a=>!a.hidden&&!a.dead&&sight(a,SP.player,3)).length,r=M.struggle(s,C.abs(),n);SP.toast(!r.ok?r.reason:r.escaped?'挣脱了！警员正在追赶，可用摇杆移动。':'挣扎被制止，警员已上铐。');if(r.escaped){SP.conflictDialogue?.close?.();resetEscort(police.get(s.unit.officerId));s.unit.route=null;proxyPlans.delete(s.unit);}SP.touchRelease?.();message();}
 function surrender(){const s=state();if(s.player.health===0)return;s.player.weapon='fists';s.player.surrendered=true;M.note(s,C.abs(),'surrender',M.active(s)?.id||null,'当事人放下武器，表示配合警方。');SP.toast('已放下武器，请停留并配合警员。');}
 function rob(){
  if(G.busy())return;const a=selectedActor();if(!a||!street()||!sight(SP.player,a,1.7)){SP.toast('先在街面走近并选择一位人物。');return;}
  if(a.isAnimal){SP.toast('可以走近观察、喂食或温和互动。');return true;}
  if(a.storeCourier){SP.toast('配送员的冲突与救援流程尚未接入。');return;}
  const s=state();s.player.surrendered=false;
  const r=M.threat(s,{id:a.id,x:a.x,y:a.y,scene:'street',witnesses:SP.actors.list.filter(b=>b!==a&&b!==SP.player&&!b.hidden&&sight(b,a,10)).map(b=>b.id)},G.ps,C.abs());
  if(!r.ok){SP.toast(r.reason);return;}
  r.person.x=a.x;r.person.y=a.y;
  if(r.amount)SP.toast('对方交出 ¥'+r.amount+' 后离开并报警。');
  else SP.toast(r.person.mode==='fight'?'对方拒绝并反抗，目击者可能报警。':'对方拒绝交出财物，离开并报警。');
 }
 const CAR_HOME=[104.5,1.35],CAR_STOP=[96.5,1.35],CAR_ROAD=[92,0,107,3],ENTRY_CLEAR=[99.5,0,101.5,3.3];
 const migrationPaths=new Map();
 function carPose(x,y,angle=Math.PI){const h=[Math.cos(angle),Math.sin(angle)],side=[-h[1],h[0]];return [[-.98,-2.3],[.98,-2.3],[.98,2.3],[-.98,2.3]].map(([a,b])=>[x+side[0]*a+h[0]*b,y+side[1]*a+h[1]*b]);}
 function migrationPath(start){const key=start.join(',');if(migrationPaths.has(key))return migrationPaths.get(key);const entry=start[0]<=105?[92,-1.5]:[109,-1.5],end=start[0]<=105?CAR_HOME:CAR_STOP,nodes=[];let distance=0;
  const add=(x,y,angle)=>{if(nodes.length)distance+=Math.hypot(x-nodes.at(-1).x,y-nodes.at(-1).y);nodes.push({x,y,angle,s:distance});};
  const approach=Math.ceil(Math.hypot(entry[0]-start[0],entry[1]-start[1])/.04);for(let i=0;i<approach;i++)add(start[0]+(entry[0]-start[0])*i/approach,start[1]+(entry[1]-start[1])*i/approach,Math.PI);
  for(let i=0;i<=600;i++){const t=i/600,dy=end[1]-entry[1],x=entry[0]+(end[0]-entry[0])*t,y=entry[1]+dy*(3*t*t-2*t*t*t),angle=Math.PI+Math.atan2(dy*6*t*(1-t),end[0]-entry[0])-(end[0]<entry[0]?Math.PI:0);add(x,y,angle);}migrationPaths.set(key,nodes);return nodes;
 }
 function migrationPose(nodes,d){let i=0;while(i<nodes.length-2&&nodes[i+1].s<d)i++;const a=nodes[i],b=nodes[i+1],t=SP.clamp((d-a.s)/(b.s-a.s||1),0,1);return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,angle:a.angle+(b.angle-a.angle)*t};}
 function migrationGeometry(poly){for(let i=0;i<4;i++)for(let j=0;j<=8;j++){const a=poly[i],b=poly[(i+1)%4],x=a[0]+(b[0]-a[0])*j/8,y=a[1]+(b[1]-a[1])*j/8;if(!(y>=-6&&y<=0||x>=92&&x<=107&&y>=0&&y<=3))return'off-road';}for(const c of (W.interior?SP.place.street?.colliders||[]:W.colliders))if(c.poly&&SP.traffic.polyOverlap(poly,c.poly))return c.id;return null;}
 function migrateCar(s,dt){const u=s.unit;if(!u.carMigration&&Math.abs(u.carY-1.35)>.02){u.carMigration={version:1,start:[u.carX,u.carY],distance:0,done:false};M.note(s,C.abs(),'car_migration_start',null,'旧存档警车低速驶离主道，进入港湾。');}const m=u.carMigration;if(!m||m.done)return false;const nodes=migrationPath(m.start);u.carSpeed=0;
  // Audit the complete swept body before committing to the manoeuvre; retain colliders.
  const auditKey=(W.interior?SP.place.street?.colliders:W.colliders)?.length;if(nodes.auditKey!==auditKey){nodes.auditKey=auditKey;nodes.invalid=nodes.some(q=>migrationGeometry(carPose(q.x,q.y,q.angle)));}if(nodes.invalid)return true;
  const driver=police.get('response_officer'),boarded=u.officerId==='response_officer'&&u.boarded&&M.active(s)?.status==='responding';if(boarded&&driver)driver.hidden=true;
  const distance=Math.min(nodes.at(-1).s,m.distance+1.1*Math.min(dt,.1)),q=migrationPose(nodes,distance),poly=carPose(q.x,q.y,q.angle);
  for(const a of (W.interior?SP.place.npcs||[]:SP.actors.list))if(!a.hidden&&a.circles().some(([x,y,r])=>SP.circlePoly(x,y,r+.18,poly)))return true;
  if(SP.traffic.cars.some(c=>SP.traffic.polyOverlap(poly,c.poly)))return true;
  m.distance=distance;u.carX=q.x;u.carY=q.y;u.carHeading=q.angle;u.carSpeed=1.1;if(!u.officerId||boarded){u.x=q.x;u.y=q.y+1.65;if(boarded&&driver){driver.x=u.x;driver.y=u.y;}}
  if(distance>=nodes.at(-1).s-.00001){m.done=true;u.carHeading=Math.PI;u.carSpeed=0;u.carPhase='parked';M.note(s,C.abs(),'car_migration_end',null,'警车已完整进入港湾，恢复主道通行。');}return !m.done;
 }
 // Following westbound vehicles brake before the swept manoeuvre area. Only their
 // speed limit is capped; native integration and all physical collisions remain active.
 const migrateTraffic0=SP.traffic.update;SP.traffic.update=function(dt){const u=G.ps?.npcConflict?.unit,m=u?.carMigration,held=[];if(m&&!m.done&&street()){const nodes=migrationPath(m.start),edge=Math.max(...nodes.flatMap(q=>carPose(q.x,q.y,q.angle).map(p=>p[0])))+.6;for(const c of SP.traffic.cars)if(c.lane==='wb'&&c.x-c.half>edge-.1){held.push([c,c.vmax]);c.vmax=Math.min(c.vmax,Math.sqrt(2*2.8*Math.max(0,c.x-c.half-edge-.6)));}}try{return migrateTraffic0.apply(this,arguments);}finally{for(const[c,v]of held)c.vmax=v;}};
 function moveCar(s,to,dt){
  const u=s.unit,target=Array.isArray(to)?to:[to,1.35],dx=target[0]-u.carX,dy=target[1]-u.carY,d=Math.hypot(dx,dy),speed=dx>0?1.1:2,step=Math.min(d,speed*dt);u.carSpeed=0;if(d<.015)return true;
  const nx=u.carX+dx/d*step,ny=u.carY+dy/d*step,poly=SP.footPoly([-.98,-2.3,.98,2.3],6,nx,ny);
  for(const collider of (W.interior?SP.place.street?.colliders||[]:W.colliders))if(collider.poly&&SP.traffic.polyOverlap(poly,collider.poly))return false;
  for(const a of (W.interior?SP.place.npcs||[]:SP.actors.list))if(!a.hidden&&a.circles().some(([x,y,r])=>SP.circlePoly(x,y,r+.18,poly)))return false;
  if(SP.traffic.cars.some(c=>SP.traffic.polyOverlap(poly,c.poly)))return false;
  u.carX=nx;u.carY=ny;u.carSpeed=speed;if(u.boarded){u.x=nx;u.y=ny+1.65;const driver=police.get('response_officer');if(driver?.hidden){driver.x=u.x;driver.y=u.y;}}return d<=step+.001;
 }
 // A visible inset bay in the unobstructed plaza edge: main carriageway remains y<0.
 // The existing library approach crosses a marked keep-clear strip; pedestrians retain priority.
 const bayCanvas=D.createElement('canvas'),bayCtx=bayCanvas.getContext('2d'),bayCorners=[[92,0],[107,0],[107,3],[92,3]].map(p=>SP.scr(...p,0)),bx=Math.floor(Math.min(...bayCorners.map(p=>p[0]))-8),by=Math.floor(Math.min(...bayCorners.map(p=>p[1]))-8);bayCanvas.width=Math.ceil(Math.max(...bayCorners.map(p=>p[0]))-bx+8);bayCanvas.height=Math.ceil(Math.max(...bayCorners.map(p=>p[1]))-by+8);bayCtx.translate(-bx,-by);
 const groundPoly=(points,color,stroke)=>{bayCtx.beginPath();points.map(p=>SP.scr(...p,0)).forEach((p,i)=>i?bayCtx.lineTo(...p):bayCtx.moveTo(...p));bayCtx.closePath();if(color){bayCtx.fillStyle=color;bayCtx.fill();}if(stroke){bayCtx.strokeStyle=stroke;bayCtx.lineWidth=2;bayCtx.stroke();}};
 groundPoly([[92,0],[107,0],[107,3],[92,3]],'#67665e','#bbb8a5');
 for(const x of [96.5,104.5])groundPoly([[x-2.7,.2],[x+2.7,.2],[x+2.7,2.7],[x-2.7,2.7]],null,'#e0dfcd');
 for(let y=.2;y<3;y+=.5)groundPoly([[99.5,y],[101.5,y],[101.5,y+.23],[99.5,y+.23]],'#e8e3c9');
 const bayKey='police/layby';SP.K.frames[bayKey]=[0,0,bayCanvas.width,bayCanvas.height,0,0];const frame0=SP.drawFrame;SP.drawFrame=function(ctx,key,x,y,alpha){if(key!==bayKey)return frame0.apply(this,arguments);ctx.save();ctx.globalAlpha=alpha??1;ctx.drawImage(bayCanvas,Math.round(x),Math.round(y));ctx.restore();};
 const bayItem={key:bayKey,X:bx,Y:by,rect:SP.frameRect(bayKey,bx,by),o:3},bake0=W.bakeGround;W.bakeGround=function(){const out=bake0.apply(this,arguments);if(W.sceneId==='street'&&!W.interior){W.groundItems.push(bayItem);SP.layers?.groundChanged();}return out;};
 function siren(){
  if(SP.now-lastSound<1.1)return;lastSound=SP.now;
  if(!audio)return;try{const o=audio.createOscillator(),v=audio.createGain();o.frequency.setValueAtTime(500,audio.currentTime);o.frequency.linearRampToValueAtTime(800,audio.currentTime+.2);v.gain.setValueAtTime(.025,audio.currentTime);v.gain.linearRampToValueAtTime(0,audio.currentTime+.25);o.connect(v);v.connect(audio.destination);o.start();o.stop(audio.currentTime+.26);}catch(_){}
 }
 function message(){if(!banner)return;const s=state(),c=M.active(s),weapon={fists:'徒手',branch:'树枝',knife:'厨房刀'}[s.player.weapon];const text='生命 '+Math.ceil(s.player.health)+' · '+weapon+(c?' · 治安：'+(c.status==='escorting'?(s.player.custody?.cuffed?'上铐押送':'未上铐押送，可挣扎'):({inquiry:'现场询问，责任待核实',dispatching:'已接警',responding:'警车出警',pursuit:'警员接近',searching:'搜寻当事人',escorting:'带回警务站',processing:'问询处理中'}[c.status]||c.status)):'')+(s.player.debt?' · 处理费欠款 ¥'+s.player.debt:'');if(statementButton)statementButton.hidden=!['inquiry','escorting','processing'].includes(c?.status);if(struggleButton){struggleButton.hidden=!['inquiry','escorting'].includes(c?.status);struggleButton.disabled=!!s.player.custody?.cuffed;struggleButton.textContent=s.player.custody?.cuffed?'已上铐':'挣扎脱身';}if(banner.textContent!==text)banner.textContent=text;}
 function snapshotBlocker(){
  const saved=W.interior?SP.place?.street:W;
  if(!saved?.data?.bounds||!saved?.colliders||!saved?.cgrid)return lastBlocker||((x,y,r)=>W.blockedStatic(x,y,r));
  const bounds={...saved.data.bounds},cols=saved.colliders,grid=saved.cgrid;
  return (x,y,r)=>{
   if(x-r<bounds.x0||x+r>bounds.x1||y-r<bounds.y0||y+r>bounds.y1)return true;
   const seen=new Set();for(let a=Math.floor((x-r)/2);a<=Math.floor((x+r)/2);a++)for(let b=Math.floor((y-r)/2);b<=Math.floor((y+r)/2);b++)for(const i of grid.get(a*1000+b)||[])seen.add(i);
   for(const i of seen){const c=cols[i];if(!c.roof&&SP.circlePoly(x,y,r,c.poly))return true;}return false;
  };
 }
 function virtualWalk(u,distance){
  const path=u.route||[];while(path.length&&distance>0){const q=path[0],d=Math.hypot(q[0]-u.x,q[1]-u.y);if(d<=distance){u.x=q[0];u.y=q[1];distance-=d;path.shift();}else{u.x+=(q[0]-u.x)*distance/d;u.y+=(q[1]-u.y)*distance/d;distance=0;}}
  return path.length===0;
 }
 function offscreenResponse(s,gm){
  const c=M.active(s);if(!c)return;const u=s.unit,block=snapshotBlocker();
  if(c.status==='dispatching'&&C.abs()>=c.dispatchAt){const near=Object.entries(s.patrols||{}).filter(([id,p])=>s.people[id]?.health!==0&&Math.hypot(p.x-c.x,p.y-c.y)<=30).sort((a,b)=>Math.hypot(a[1].x-c.x,a[1].y-c.y)-Math.hypot(b[1].x-c.x,b[1].y-c.y))[0];u.officerId=near?.[0]||'response_officer';if(near){u.x=near[1].x;u.y=near[1].y;}c.status='responding';u.route=null;M.note(s,C.abs(),'depart',c.id,'巡逻组在街面按已知报案地点继续响应。',{officer:u.officerId,location:[c.x,c.y]});}
  if(c.status==='responding'){
   if(u.officerId==='response_officer'){
    if(!moveCar(s,CAR_STOP,Math.max(0,gm)))return;u.x=u.carX;u.y=u.carY+1.65;M.note(s,C.abs(),'disembark',c.id,'警车抵达已知事发道路，警员下车。');
   }
   proxyRoute(u,c.x,c.y,block);c.status='pursuit';c.arrivedAt=C.abs();
  }
  if(['pursuit','searching'].includes(c.status)){
   const q=u.lastSeen||{x:c.x,y:c.y};const reached=proxyRoute(u,q.x,q.y,block);
   if(reached||u.route.length&&virtualWalk(u,2.9*Math.max(0,gm))){c.status='searching';u.searchUntil=u.searchUntil??C.abs()+60;}
   const p=s.patrols?.[u.officerId];if(p){p.x=u.x;p.y=u.y;}
  }
 }
 function returnOffscreen(s,dt){const u=s.unit;if(u.scene!=='street'||u.station)return;const id=u.returning,a=police.get(id);if(id){const target=id==='response_officer'?[u.carX,u.carY+1.65]:PATROLS[id];if(!target)return;const reached=proxyRoute(u,...target,snapshotBlocker());if(reached||u.route.length&&virtualWalk(u,1.8*Math.min(dt,.1))){u.returning=null;u.route=null;if(id==='response_officer'){u.boarded=true;u.carPhase='returning';if(a)a.hidden=true;}}if(a){a.x=u.x;a.y=u.y;clearWalk(a);}if(s.patrols?.[id])Object.assign(s.patrols[id],{x:u.x,y:u.y});}if(!u.returning&&u.carPhase==='returning'&&moveCar(s,CAR_HOME,Math.min(dt,.1))){u.carPhase='parked';u.carSpeed=0;M.note(s,C.abs(),'car_return',null,'警员返回港湾，警车低速倒离至待命位。');}}
 // Only an explicit player request may abbreviate the escorted street journey.
 let skipPending=null,skipHud=null,skipLabel=null,skipButton=null,skipOwner=null,skipCase=null;
 function escortSkipContext(){const s=G.ps?.npcConflict,c=s&&M.active(s);return !!(c?.status==='escorting'&&street());}
 function skipEligible(){const s=G.ps?.npcConflict,c=s&&M.active(s),a=s&&police.get(s.unit.officerId);return !!(escortSkipContext()&&!skipPending&&s.player.health>0&&s.player.custody&&s.unit.scene==='street'&&!s.unit.station&&a&&!a.hidden&&!a.dead&&s.people[a.id]?.health!==0&&Math.hypot(a.x-SP.player.x,a.y-SP.player.y)<2.4&&a.police&&SP.actors.list.includes(a)&&!(a._interveningUntil>SP.now)&&SP.scenes?.[STATION_ROOM]&&!G.trans&&!G.activity&&!G.menu&&!SP.player.carry&&!SP.player.vehicle&&!SP.phone?.isOpen?.()&&!SP.conflictDialogue?.isOpen?.()&&!SP.nearbyPicker?.isOpen?.()&&!SP.socialEncountersLive?.isOpen?.()&&(!modal||modal.hidden));}
 function skipEscort(){
  if(!skipEligible())return {ok:false,reason:'当前没有可跳过的带回路程，或请先关闭当前界面。'};
  const owner=G.ps,s=state(),c=M.active(s),a=police.get(s.unit.officerId),request={owner,caseId:c.id,officerId:a.id,custody:s.player.custody};
  G.go({to:STATION_ROOM,spawn:[4.5,.95,'N'],door:'community_civic_door'});
  if(G.ps!==owner||!(G.trans?.to===STATION_ROOM||W.sceneId===STATION_ROOM&&W.interior))return {ok:false,reason:'场景切换尚未开始，继续原押送。'};
  request.transition=G.trans;skipPending=request;s.unit.station='entering';resetEscort(a);stop(a);stop(SP.player);SP.touchRelease?.();root.dispatchEvent(new Event('blur'));
  M.note(s,C.abs(),'escort_skip_requested',c.id,'玩家选择省略带回路程，等待进入警务站；案件与责任未改变。',{officer:a.id});
  if(skipHud)skipHud.hidden=true;return {ok:true};
 }
 function skipUI(){
  if(!D?.body?.append)return;
  if(!skipHud){const css=D.createElement('style');css.textContent='@keyframes escort-skip-breathe{0%,100%{opacity:.48}50%{opacity:.86}}#escort-skip-hud{position:fixed;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 160px);z-index:92;max-width:min(270px,calc(100vw - 24px));padding:8px 11px;border-radius:10px;background:#15252ec9;color:#e4eceb;font:13px/1.5 system-ui;pointer-events:auto}#escort-skip-hud[hidden]{display:none}#escort-skip-hud p{margin:0 0 5px;animation:escort-skip-breathe 2.8s ease-in-out infinite;pointer-events:none}#escort-skip-hud button{min-height:44px;padding:8px 14px;border:1px solid #a2bcb488;border-radius:8px;background:#29434bd9;color:#edf5ef;font:inherit}body.landscape #escort-skip-hud{bottom:calc(env(safe-area-inset-bottom,0px) + 104px)}@media(prefers-reduced-motion:reduce){#escort-skip-hud p{animation:none;opacity:.8}}';D.head.append(css);
   skipHud=D.createElement('div');skipHud.id='escort-skip-hud';skipHud.hidden=true;skipLabel=D.createElement('p');skipButton=D.createElement('button');skipButton.id='escort-skip-button';skipButton.type='button';skipButton.textContent='跳过带回路程';skipButton.setAttribute('aria-label','跳过带回路程，进入警务站继续问询');skipButton.onclick=()=>{if(skipOwner!==G.ps||skipCase!==M.active(state())?.id)return;const r=skipEscort();if(!r.ok)SP.toast(r.reason);};for(const ev of ['pointerdown','touchstart','mousedown'])skipHud.addEventListener(ev,e=>e.stopPropagation());skipHud.append(skipLabel,skipButton);D.body.append(skipHud);
  }
  const available=skipEligible();skipHud.hidden=!available;
  if(available){skipOwner=G.ps;skipCase=M.active(state()).id;skipLabel.textContent='按 '+(SP.keybindings?.label('skip')||'G')+' 跳过路程 · 可不跳过';}else{skipOwner=null;skipCase=null;}
 }
 function cancelPendingSkip(){if(skipHud)skipHud.hidden=true;skipOwner=null;skipCase=null;const request=skipPending;if(!request)return;if(request.transition&&G.trans===request.transition)G.trans=null;if(request.owner===G.ps){const s=G.ps.npcConflict;if(s?.unit.scene==='street'&&s.unit.station==='entering')s.unit.station=null;}skipPending=null;if(skipHud)skipHud.hidden=true;skipOwner=null;skipCase=null;}
 function verifyPendingSkip(){if(!skipPending)return;const s=G.ps?.npcConflict,c=s&&M.active(s);if(skipPending.owner!==G.ps||c?.id!==skipPending.caseId||c?.status!=='escorting'||s.player.custody!==skipPending.custody||s.player.health<=0||s.people[skipPending.officerId]?.health===0||s.unit.officerId!==skipPending.officerId||skipPending.transition&&G.trans&&G.trans!==skipPending.transition)cancelPendingSkip();}
 function finishSkippedArrival(s,c,a){
  if(!skipPending)return false;const request=skipPending;
  if(request.owner!==G.ps||request.caseId!==c?.id||request.custody!==s.player.custody||request.officerId!==a.id||c.status!=='escorting'||s.player.health<=0){skipPending=null;return false;}
  if(G.trans)return true;
  const positions=[[a,4.5,3.7],[SP.player,4.5,2.8]],others=SP.actors.list.filter(q=>q!==a&&q!==SP.player&&!q.hidden&&!q.dead);
  if(positions.some(([actor,x,y])=>W.blockedStatic(x,y,actor.radius||.22)||others.some(q=>(q.circles?.()||[[q.x,q.y,q.radius||.22]]).some(([qx,qy,r])=>Math.hypot(qx-x,qy-y)<r+(actor.radius||.22)+.004)))){skipPending=null;SP.toast('已进入警务站，问询位置有人，请继续跟随警员。');return false;}
  for(const [actor,x,y]of positions){actor.x=x;actor.y=y;stop(actor);clearWalk(actor);}resetEscort(a);s.unit.x=a.x;s.unit.y=a.y;s.unit.station='hearing';skipPending=null;
  M.note(s,C.abs(),'escort_skip_arrived',c.id,'已省略带回路程并进入警务站；继续原案件室内问询。',{scene:STATION_ROOM,officer:a.id});M.process(s,C.abs());SP.toast('已跳过带回路程，进入警务站继续问询。');return true;
 }
 function stationStep(s,c,dt){const u=s.unit;
  if(W.interior&&W.sceneId===STATION_ROOM&&(u.station||c?.status==='processing')){
   const id=u.officerId||u.returning;if(!id)return;let a=police.get(id);
   if(u.scene!==STATION_ROOM){a=officer(id,4.5,1.7);a.x=4.5;a.y=1.7;clearWalk(a);a._escortTrail=null;clearWalk(SP.player);u.scene=STATION_ROOM;u.station=c?.status==='processing'?'hearing':'seating';navStats.sceneTransfers++;M.note(s,C.abs(),'station_enter',c?.id||null,skipPending?'省略带回路程后进入警务站室内。':'双方通过警务站门口进入室内。',{scene:STATION_ROOM});}
   else if(!a){a=officer(id,u.x,u.y);clearWalk(a);}else if(!SP.actors.list.includes(a))SP.actors.list.push(a);
   a.hidden=false;
   const skipping=skipPending&&finishSkippedArrival(s,c,a);
   if(!skipping&&u.station==='seating'&&c?.status==='escorting'){if(G.trans){stop(a,dt);stop(SP.player,dt);}else if(escort(a,4.5,3.7,dt)){stop(a);stop(SP.player);clearWalk(a);clearWalk(SP.player);M.process(s,C.abs());u.station='hearing';SP.toast('已进入社区警务站，开始室内问询。');}}
   if(c?.status==='processing'){stop(a,dt);stop(SP.player,dt);u.station='hearing';}
   if(!c){if(u.station!=='leaving'){u.station='leaving';u.returning=id;u.officerId=null;clearWalk(a);clearWalk(SP.player);a._escortTrail=null;}if(SP.conflictDialogue?.isOpen()||G.trans)stop(a,dt);else if(walk(a,4.5,.75,1.5,dt,.12)){
    stop(a);SP.actors.list=SP.actors.list.filter(b=>b!==a);a.x=STATION[0];a.y=33.9;clearWalk(a);a.hidden=false;if(SP.place.npcs&&!SP.place.npcs.includes(a))SP.place.npcs.push(a);u.scene='street';u.station=null;u.x=a.x;u.y=a.y;if(s.patrols?.[id])Object.assign(s.patrols[id],{x:a.x,y:a.y});navStats.sceneTransfers++;M.note(s,C.abs(),'officer_exit',null,'警员步行至出口，离开问询室后返回勤务。',{officer:id});
   }}
   if(u.scene===STATION_ROOM){u.x=a.x;u.y=a.y;}
  }
 }
 const update0=G.update,busy0=G.busy,NU=SP.npcs.update;
 G.busy=function(){const s=G.ps?.npcConflict,c=s&&M.active(s);return !api.restoring&&(s?.player.health===0||['inquiry','escorting','processing'].includes(c?.status)||(modal&&!modal.hidden))||busy0.apply(this,arguments);};
 SP.npcs.update=function(dt){const s=G.ps?.npcConflict,held=[];if(s)for(const a of SP.npcs.list){const p=s.people[a.id];if(((p&&(p.mode!=='calm'||p.restrained))||SP.conflictDialogue?.holdsActor(a.id))&&a.brain){held.push([a,a.brain.dwell]);a.brain.dwell=Math.max(a.brain.dwell||0,dt+1);}}try{return NU.apply(this,arguments);}finally{for(const [a,d]of held)a.brain.dwell=d;}};
 G.update=function(dt,gm){
  verifyPendingSkip();const out=update0.apply(this,arguments);if(!G.ps)return out;const s=state();verifyPendingSkip();ui();syncPolice(s);const migrating=migrateCar(s,dt);if(M.active(s)?.status==='escorting'&&!s.player.custody)s.player.custody={cuffed:false,attempts:0,nextAttemptAt:C.abs(),recaptureAt:0};M.advance(s,C.abs());if(street())lastBlocker=snapshotBlocker();else if(!migrating&&s.unit.scene!=='community_civic_room')offscreenResponse(s,gm||dt);
  if(M.active(s)&&street())SP.chunks?.loadAll();
  for(const a of SP.actors.list){const p=s.people[a.id];if(!p)continue;
   if(a.police){a.dead=p.health===0;if(a.dead){a.hidden=false;stop(a,dt);}continue;}
   if(!hydrated.has(a)){if(Number.isFinite(p.x)&&Number.isFinite(p.y)&&!W.blockedStatic(p.x,p.y,a.radius)){a.x=p.x;a.y=p.y;}hydrated.add(a);}
   a.dead=p.health===0;if(a.dead){a.hidden=false;a.moving=false;continue;}if(a.police||!street())continue;
   if(p.mode==='shock')a.bubble={text:'!',t:2};else if(p.mode==='flee'){const dx=a.x-SP.player.x,dy=a.y-SP.player.y,l=Math.hypot(dx,dy)||1;const moved=SP.actors.move(a,dx/l*2.7*dt,dy/l*2.7*dt);a.update(dt,moved>.01,SP.dirFromWorld(dx,dy),moved);a.bubble={text:'!',t:1};}
   else if(p.mode==='fight'){
    const guard=[...police.values()].filter(b=>!b.hidden&&!b.dead&&b!==a&&sight(b,a,9)).sort((b,d)=>Math.hypot(b.x-a.x,b.y-a.y)-Math.hypot(d.x-a.x,d.y-a.y))[0];
    if(guard){const close=sight(guard,a,1.7);M.intervene(s,a.id,C.abs(),close&&p.policeOrderAt!==undefined);guard.bubble={text:'停止追打',t:1};guard._interveningUntil=SP.now+.15;
     if(p.mode==='fight')walk(guard,a.x,a.y,3.2,dt);
     if(p.mode!=='fight'||C.abs()-p.policeOrderAt<2||['inquiry','escorting','processing'].includes(M.active(s)?.status)){a.update(dt,false,a.dir,0);p.x=a.x;p.y=a.y;continue;}
    }
    walk(a,SP.player.x,SP.player.y,2.4,dt);if(sight(a,SP.player,1.5)&&C.abs()-p.lastCounterAt>=3){p.lastCounterAt=C.abs();a.kickT=.38;s.player.health=Math.max(0,s.player.health-10);s.player.lastDamage={source:'npc',actor:a.id,at:C.abs()};SP.animals?.witnessAttack(a,SP.player);SP.fx.shake=.1;SP.toast('对方反击了你 · 生命 -10');}}
   else if(p.mode==='protest'||p.mode==='report')a.bubble={text:p.mode==='report'?'☎':'!',t:1};
   p.x=a.x;p.y=a.y;if(a.kickT>0)a.kickT=Math.max(0,a.kickT-dt);
  }
  const c=M.active(s);if(c&&street()&&!migrating){
   const u=s.unit;
   if(c.status==='dispatching'&&C.abs()>=c.dispatchAt){
    const nearby=[...police.values()].filter(a=>a.id.startsWith('patrol')&&!a.dead&&Math.hypot(a.x-c.x,a.y-c.y)<=30).sort((a,b)=>Math.hypot(a.x-c.x,a.y-c.y)-Math.hypot(b.x-c.x,b.y-c.y));
    u.officerId=nearby[0]?.id||'response_officer';u.boarded=false;u.lastSeen=null;u.searchUntil=null;u.carPhase='responding';c.status='responding';M.note(s,C.abs(),'depart',c.id,nearby.length?'附近巡警跑向事发地点。':'警车驶向事发道路，鸣笛请求让行。');
   }
   if(c.status==='responding'){
    if(u.officerId!=='response_officer'){c.status='pursuit';c.arrivedAt=C.abs();}
    else {const driver=police.get('response_officer');if(driver&&!u.boarded){if(walk(driver,u.carX,u.carY+1.65,2.4,dt))u.boarded=true;}else if(!driver)u.boarded=true;
    if(u.boarded&&driver)driver.hidden=true;
    if(u.boarded&&moveCar(s,CAR_STOP,dt)){const carOfficer=officer('response_officer',u.carX,u.carY+1.65);carOfficer.x=u.carX;carOfficer.y=u.carY+1.65;carOfficer.hidden=false;u.x=carOfficer.x;u.y=carOfficer.y;c.status='pursuit';u.carSpeed=0;u.carPhase='parked';c.arrivedAt=C.abs();M.note(s,C.abs(),'arrive',c.id,'警车停车，民警下车后步行接近。');}else if(u.boarded)siren();}
   }
   const a=police.get(u.officerId);
   if(a&&['pursuit','searching'].includes(c.status)){
    const visible=sight(a,SP.player,14);if(visible){u.lastSeen={x:SP.player.x,y:SP.player.y,at:C.abs()};u.searchUntil=C.abs()+60;c.status='pursuit';}
    const q=u.lastSeen||{x:c.x,y:c.y};if(!(a._interveningUntil>SP.now))walk(a,q.x,q.y,2.9,dt);
    const deaths=new Set(s.cases.filter(q=>q.reportedAt!==null&&s.people[q.victim]?.health===0).map(q=>q.victim)).size,severe=!s.player.surrendered&&(deaths>=2||(c.weapon==='knife'&&s.player.weapon==='knife'&&visible&&Math.hypot(a.x-SP.player.x,a.y-SP.player.y)<2.2));
    a.armed=severe&&a.hasGun;
    if(severe&&visible&&!a.hasGun){u.backupAt=u.backupAt??C.abs()+3;u.backupEnroute=true;a.bubble={text:'☎',t:1};}
    if(severe&&visible&&a.hasGun){a.bubble={text:'!',t:1};a.warningAt=a.warningAt??C.abs();if(C.abs()-a.warningAt>=(M.personality(a.id)==='calm'?5:3)&&C.abs()-(a.lastShotAt??-10)>=2){a.lastShotAt=C.abs();a.shotUntil=SP.now+.16;s.player.health=Math.max(0,s.player.health-35);s.player.lastDamage={source:'police',actor:a.id,caseId:c.id,at:C.abs()};SP.fx.shake=.16;M.note(s,C.abs(),'police_shot',c.id,'持续严重暴力威胁，持枪警员开火。');SP.toast('警方开火 · 生命 -35');}}
    else if(!severe&&visible&&sight(a,SP.player,1.35)&&s.player.health>0&&C.abs()>=(s.player.custody?.recaptureAt||0)&&!(a._interveningUntil>SP.now)){if(M.apprehend(s,C.abs(),{dangerous:c.policeAssault||c.weapon==='knife'||deaths>0,inquiry:!c.policeAssault&&(s.player.escapeCount||0)===0,cautious:['calm','civic'].includes(M.personality(a.id))})){resetEscort(a);a._custodyToken=s.player.custody;SP.nearbyPicker?.close();SP.socialEncountersLive?.close();SP.touchRelease?.();SP.toast(c.status==='escorting'?'警员已控制并带回警务站。':'警员控制现场，请点击「陈述经过」。责任尚待核实。');}}
    if(!visible&&Math.hypot(a.x-q.x,a.y-q.y)<1){c.status='searching';u.searchUntil=u.searchUntil??C.abs()+60;}
   }
   if(u.backupEnroute&&C.abs()>=u.backupAt){if(moveCar(s,CAR_STOP,dt)){const backup=officer('response_officer',u.carX,u.carY+1.65);backup.x=u.carX;backup.y=u.carY+1.65;u.officerId='response_officer';u.backupEnroute=false;M.note(s,C.abs(),'backup_arrive',c.id,'持枪增援民警下车接近现场。');}else siren();}
   if(c.status==='inquiry'&&modal.hidden&&!SP.conflictDialogue)M.finishInquiry(s,C.abs());
   if(a&&c.status==='escorting'&&!(a._interveningUntil>SP.now)){
    if(a._custodyToken!==s.player.custody){resetEscort(a);a._custodyToken=s.player.custody;}a.hidden=false;
    if(SP.conflictDialogue?.isOpen()||G.trans){stop(a,dt);stop(SP.player,dt);}else if(escort(a,...STATION,dt)){stop(a);stop(SP.player);u.station='entering';G.go({to:STATION_ROOM,spawn:[4.5,.95,'N'],door:'community_civic_door'});}
   }
   if(a&&c.status==='inquiry'){stop(a,dt);stop(SP.player,dt);}
   if(a){u.x=a.x;u.y=a.y;const pp=s.patrols?.[a.id];if(pp){pp.x=a.x;pp.y=a.y;}}
  }
  if(c&&c.status==='processing'&&!SP.conflictDialogue&&modal.hidden&&!SP.ai?.isPending()&&M.release(s,G.ps,C.abs())){SP.toast(c.outcome==='pending_review'?'证据不足，解除控制并保留待核实记录。':'问询结束 · 可查看列传中的处理记录。');}
  stationStep(s,c,dt);skipUI();
  if(!street()&&!c)returnOffscreen(s,dt);
  if(street()&&!c&&!s.unit.station){const a=police.get(s.unit.returning||s.unit.officerId);if(a){a._escortTrail=null;s.unit.returning=a.id;s.unit.officerId=null;const target=a.id==='response_officer'?[s.unit.carX,s.unit.carY+1.65]:PATROLS[a.id];if(target&&walk(a,...target,1.8,dt,.2)){clearWalk(a);s.unit.returning=null;if(a.id==='response_officer'){a.hidden=true;s.unit.boarded=true;s.unit.carPhase='returning';}}s.unit.x=a.x;s.unit.y=a.y;}}
  if(street()&&!c&&!migrating&&s.unit.carPhase==='returning'&&moveCar(s,CAR_HOME,dt)){s.unit.carPhase='parked';s.unit.carSpeed=0;M.note(s,C.abs(),'car_return',null,'警员上车，警车低速倒离至港湾待命位，主路保持畅通。');}
  if(street())for(const [id,p]of Object.entries(s.patrols||{})){const a=police.get(id);if(!a||a.id===s.unit.officerId||a.id===s.unit.returning||a.dead||a._interveningUntil>SP.now)continue;const points=PATROL_PATHS[id];if(!points)continue;a._patrolWaypoint=a._patrolWaypoint??0;const dest=points[a._patrolWaypoint];if(walk(a,dest[0],dest[1],1.2,dt,.18,true))a._patrolWaypoint=(a._patrolWaypoint+1)%points.length;p.x=a.x;p.y=a.y;}
  for(const e of s.events)if(e.id>previousEvent){W.logEvent(e.text);previousEvent=e.id;}
  if(s.player.health===0)for(const a of police.values())a.shotUntil=0;
  if(s.player.health===0&&modal.hidden){modal.hidden=false;const section=D.createElement('section'),title=D.createElement('h2'),text=D.createElement('p'),b=D.createElement('button');title.textContent='角色死亡';text.textContent='这段人生结束了。可以读取最近一次本机存档继续；未保存进度会丢失。';b.textContent='读取最近存档';b.onclick=()=>{api.restoring=true;try{const r=SP.progressSave.loadLocal();if(r.ok){modal.hidden=true;police.clear();previousEvent=0;}else SP.toast(r.reason);}finally{api.restoring=false;}};section.append(title,text,b);modal.replaceChildren(section);}
  SP.conflictDialogue?.tick();
  SP.player.dead=s.player.health===0;message();lastStreet=street();return out;
 };
 const draw0=SP.Actor.prototype.draw;
 SP.Actor.prototype.draw=function(ctx,raw,erase){
  const [x,y]=this.screen();ctx.save();if(this.dead){ctx.translate(x,y);ctx.rotate(-Math.PI/2);ctx.translate(-x,-y);}draw0.call(this,ctx,raw,erase);ctx.restore();
  if(erase||this.dead)return;
  if(this.isPlayer&&G.ps?.npcConflict?.player.custody?.cuffed){ctx.save();ctx.strokeStyle='#b5c3cc';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-6,y-28);ctx.lineTo(x+6,y-28);ctx.stroke();ctx.restore();}
  const weapon=this.isPlayer?G.ps?.npcConflict?.player.weapon:(this.armed?'gun':null);
  if(weapon&&weapon!=='fists'){const side=SP.dirVec[this.dir][0]-SP.dirVec[this.dir][1]>=0?1:-1,dx=side*(this.kickT>0?20:9);ctx.save();ctx.strokeStyle=weapon==='branch'?'#8b623c':weapon==='knife'?'#dce3e5':'#252d35';ctx.lineWidth=weapon==='gun'?5:3;ctx.beginPath();ctx.moveTo(x+side*6,y-34);ctx.lineTo(x+dx,y-(this.kickT>0?45:27));ctx.stroke();if(weapon==='knife'){ctx.fillStyle='#594332';ctx.fillRect(x+side*5-2,y-35,4,7);}if(this.shotUntil>SP.now){ctx.fillStyle='#ffe17d';ctx.fillRect(x+side*20,y-42,9,5);ctx.fillStyle='#fff8ce';ctx.fillRect(x+side*24,y-41,4,3);}ctx.restore();}
 };
 const all0=SP.traffic.allCars,drawCars0=SP.traffic.drawables,shadow0=SP.traffic.shadowKeys,glow0=SP.traffic.glows;
 function policeCar(){const u=G.ps?.npcConflict?.unit;if(!u||!street())return null;const c=M.active(state()),angle=u.carHeading??Math.PI;car=Object.assign(car||{},{id:'police_response_car',piece:'p_car',variant:'base',state:'normal',rot:((Math.round(angle/(Math.PI/4))+2)%8+8)%8,x:u.carX,y:u.carY,half:2.3,hw:.98,z1:1.6,rect:[-.98,-2.3,.98,2.3],police:true,siren:(c?.status==='responding'&&u.boarded)||u.backupEnroute,v:u.carSpeed||0});const lane=u.carY<.98?W.data.traffic.lanes.find(l=>l.id==='wb'):{id:'police-layby',axis:'x',c:u.carY,dir:-1,rot:6,range:[92,107],stops:[{at:24,box:'ix'}]};car.L=lane;car.lane=lane.id;car.dir=lane.dir;car.s=u.carX;car.poly=carPose(car.x,car.y,angle);return car;}
 SP.traffic.allCars=function(){const out=all0.apply(this,arguments),p=policeCar();return p?out.concat(p):out;};
 SP.traffic.drawables=function(out,view){drawCars0.call(this,out,view);if(street()&&!state().player.owned.includes('branch')){const X=SP.sx(7.8,8.4),Y=SP.sy(7.8,8.4,0);out.push({kind:'weaponPickup',X,Y,rect:{x0:X-16,y0:Y-8,x1:X+16,y1:Y+8},box:{x0:7.5,y0:8.1,x1:8.1,y1:8.7,z0:0,z1:.1},depth:16.2,zo:0,sid:'pickup/branch'});}const c=policeCar();if(c){const key=SP.traffic.frameKey(c),X=SP.sx(c.x,c.y),Y=SP.sy(c.x,c.y,0),rect=SP.frameRect(key,X,Y),b=SP.polyBox(c.poly);out.push({kind:'car',car:c,key,X,Y,rect,box:{x0:b[0],y0:b[1],x1:b[2],y1:b[3],z0:0,z1:1.6},depth:(b[0]+b[1]+b[2]+b[3])/2,zo:0,sid:'car/'+c.id});}return out;};
 if(shadow0)SP.traffic.shadowKeys=function(){const out=shadow0.apply(this,arguments),p=policeCar();if(p)out.push([SP.traffic.frameKey(p)+'#shadow',SP.sx(p.x,p.y),SP.sy(p.x,p.y,0)]);return out;};
 if(glow0)SP.traffic.glows=function(){const out=glow0.apply(this,arguments),p=policeCar();if(p?.siren)out.push({x:p.x,y:p.y,z:1.6,r:1.8,c:Math.floor(SP.now*7)%2?[255,60,60]:[60,150,255],a:.7});return out;};
 function drawCar(ctx,d){
  const c=d.car;if(!c?.police)return false;SP.drawFrame(ctx,d.key,d.X,d.Y);ctx.save();ctx.imageSmoothingEnabled=false;
  const project=(x,y,z)=>{const p=SP.rotPt([x,y],c.rot);return [Math.round(SP.sx(c.x+p[0],c.y+p[1])),Math.round(SP.sy(c.x+p[0],c.y+p[1],z))];};
  const face=(pts,color,edge)=>{ctx.fillStyle=color;ctx.beginPath();pts.forEach((p,i)=>{const q=project(...p);i?ctx.lineTo(...q):ctx.moveTo(...q);});ctx.closePath();ctx.fill();if(edge){ctx.strokeStyle=edge;ctx.lineWidth=1;ctx.stroke();}};
  // Keep the original car silhouette, bumpers and tyre pixels; repaint metal panels only.
  for(const side of [-.99,.99]){face([[side,-1.55,.59],[side,1.52,.59],[side,1.52,.98],[side,-1.55,.98]],side>0?'#bbc5c7':'#e2e5dc','#727e80');face([[side,-1.52,.64],[side,1.48,.64],[side,1.48,.79],[side,-1.52,.79]],'#284964');face([[side,-.28,.8],[side,.03,.8],[side,.03,.96],[side,-.28,.96]],'#ac935c');for(const y of [-.48,.8]){const a=project(side,y,.6),b=project(side,y,1.02);ctx.strokeStyle='#727e80';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();}const h=project(side,.45,.89);ctx.fillStyle='#384c53';ctx.fillRect(h[0]-3,h[1],6,2);}
  face([[-.77,-1.85,.94],[.77,-1.85,.94],[.76,-.86,1.09],[-.76,-.86,1.09]],'#e6e8df','#849194');
  face([[-.68,-.8,1.12],[.68,-.8,1.12],[.59,-.47,1.46],[-.59,-.47,1.46]],'#546f77','#34474c');
  face([[-.56,-.43,1.48],[.56,-.43,1.48],[.58,.72,1.48],[-.58,.72,1.48]],'#dce1dc','#8f9e9d');
  face([[-.58,.77,1.43],[.58,.77,1.43],[.72,1.05,1.1],[-.72,1.05,1.1]],'#526970','#32454c');
  for(const side of [-.8,.8]){face([[side,-.4,1.05],[side,.65,1.05],[side*.74,.65,1.4],[side*.74,-.4,1.4]],side>0?'#536b72':'#719098','#354950');}
  for(const side of [-.7,.7]){const front=project(side,-2.09,.7),rear=project(side,2.1,.72);ctx.fillStyle='#eee7bb';ctx.fillRect(front[0]-3,front[1]-2,6,3);ctx.fillStyle='#a95442';ctx.fillRect(rear[0]-3,rear[1]-2,6,3);}
  const q=project(0,.04,1.58),blink=c.siren&&Math.floor(SP.now*7)%2;ctx.fillStyle='#303b41';ctx.fillRect(q[0]-12,q[1]-4,24,6);ctx.fillStyle=blink?'#eb7770':'#8e4c49';ctx.fillRect(q[0]-10,q[1]-5,9,4);ctx.fillStyle=blink?'#3f6682':'#82bed3';ctx.fillRect(q[0]+1,q[1]-5,9,4);ctx.fillStyle='#d3e2df';ctx.fillRect(q[0]-1,q[1]-5,2,4);const label=project(-1,.1,.86);ctx.fillStyle='#edf0df';ctx.font='bold 7px sans-serif';ctx.textAlign='center';ctx.fillText('警察',label[0],label[1]+2);ctx.restore();return true;
 }
 function drawPickup(ctx,d){ctx.strokeStyle='#a07849';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(d.X-12,d.Y+4);ctx.lineTo(d.X+12,d.Y-3);ctx.moveTo(d.X+1,d.Y);ctx.lineTo(d.X+2,d.Y-6);ctx.stroke();}
 const api=SP.npcConflict={state,escortSkipContext,canSkipEscort:skipEligible,skipEscort,cancelEscortSkip:cancelPendingSkip,needsStreetChunks:()=>!!(G.ps?.npcConflict&&(M.active(G.ps.npcConflict)||G.ps.npcConflict.unit.returning||G.ps.npcConflict.unit.carPhase==='returning'||G.ps.npcConflict.unit.carMigration&&!G.ps.npcConflict.unit.carMigration.done)),isModalOpen:()=>!!(modal&&!modal.hidden),closeModal:()=>{if(modal&&state().player.health>0)modal.hidden=true;},drawPickup,attack,surrender,struggle,tryKick:()=>attack('kick'),drawCar,carGeometry:{migrationPath,carPose,migrationGeometry,home:CAR_HOME,stop:CAR_STOP,road:CAR_ROAD,entry:ENTRY_CLEAR,sidewalk:[92,3.3,107,5.3]},route,sight,navStats,walk,clearSegment,restoring:false,resetRuntime(){cancelPendingSkip();if(skipHud)skipHud.hidden=true;skipOwner=null;skipCase=null;SP.actors.list=SP.actors.list.filter(a=>!a.police);for(const a of SP.actors.list)a.dead=a===SP.player?G.ps?.npcConflict?.player.health===0:G.ps?.npcConflict?.people[a.id]?.health===0;police.clear();hydrated=new WeakSet();lastStreet=false;lastBlocker=null;proxyPlans=new WeakMap();previousEvent=G.ps?.npcConflict?.events.at(-1)?.id||0;modal&&(modal.hidden=true);}};
 if(window.__protoReady&&W.sceneId==='street'&&!W.interior)W.bakeGround();
 root.addEventListener('keydown',e=>{if(SP.keyboardBlocked?.(e)||SP.metroActive||SP.cbd?.active||G.menu)return;if(e.key.toLowerCase()==='h'&&!e.target?.closest?.('input,textarea')){surrender();return;}},true);
 root.addEventListener('pointerdown',()=>{if(!audio)try{audio=new (root.AudioContext||root.webkitAudioContext)();}catch(_){}audio?.resume?.();},{once:true});
})(window);
