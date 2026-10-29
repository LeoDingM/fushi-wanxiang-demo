/* Native single-bay parking, continuous original-car motion and atomic parked restore. */
(function(root){
 'use strict';
 if(root.SP?.streetParking)return;
 const SP=root.SP,T=SP.traffic,N=SP.neighborhoodTurningTraffic,W=SP.world,C=SP.clock,R=root.StreetParkingRules;
 if(!T||!N||!R)throw Error('P-W01 live parking requires neighborhood traffic and parking rules');
 const bay={id:'P-W01',rect:[164,29.6,169.4,31.8],center:[166.7,30.7]},DEC=2.8;
 const state={enabled:false,car:null,phase:'idle',occupied:null,completed:0,ids:[],violations:[],yieldFrames:0,maxMove:0,maxAngle:0,maxDeceleration:0,dwellMinutes:30,nextEligibleAt:0,skipped:0,warnings:[]};
 const now=()=>C.abs(),clone=x=>JSON.parse(JSON.stringify(x));let engine,streetColliders=[],streetActors=[];
 function rememberStreet(){if(N.isNeighborhood()){streetColliders=W.colliders;streetActors=SP.actors.list.filter(a=>a!==SP.player);}}
 function actorsForStreet(){return N.isNeighborhood()?SP.actors.list:(W.interior&&SP.place?.npcs?SP.place.npcs:streetActors).filter(a=>a!==SP.player);}
 function geometry(poly){
  if(N.isNeighborhood())return N.geometry(poly);
  // The immutable route's road footprint was audited at adoption. Off-screen,
  // collision checks must use that street's retained geometry, never room walls.
  const colliders=W.interior&&SP.place?.street?.colliders||streetColliders;
  for(const c of colliders)if(c.poly&&T.polyOverlap(poly,c.poly))return 'static-'+c.id;
  return null;
 }
 function nodesFor(c){
  const nodes=[],add=(x,y,angle,gear=1,event=null)=>{const prev=nodes.at(-1);nodes.push({p:[x,y],angle,gear,event,s:prev?prev.s+Math.hypot(x-prev.p[0],y-prev.p[1]):0});};
  const line=(a,b,gear=1)=>{const count=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.05),ang=Math.atan2((b[1]-a[1])*gear,(b[0]-a[0])*gear);for(let i=1;i<=count;i++)add(a[0]+(b[0]-a[0])*i/count,a[1]+(b[1]-a[1])*i/count,ang,gear);};
  const shift=(a,b)=>{for(let i=1;i<=240;i++){const u=i/240,h=u*u*(3-2*u),dx=(b[0]-a[0])*6*u*(1-u),dy=b[1]-a[1];add(a[0]+(b[0]-a[0])*h,a[1]+dy*u,Math.atan2(dy,dx));}};
  const horizontal=(a,b,gear=1)=>{for(let i=1;i<=300;i++){const u=i/300,h=u*u*(3-2*u),dx=b[0]-a[0],dy=(b[1]-a[1])*6*u*(1-u);add(a[0]+dx*u,a[1]+(b[1]-a[1])*h,Math.atan2(dy*gear,dx*gear),gear);}};
  add(c.x,c.y,c.neighborhood.heading);
  shift([c.x,c.y],[194.2,24.1]);
  for(let i=1;i<=120;i++){const a=Math.PI/2*i/120;add(191.2+3*Math.cos(a),24.1+3*Math.sin(a),Math.PI/2+a);}
  line([191.2,27.1],[180,27.1]);horizontal([180,27.1],bay.center);nodes.at(-1).event='park';
  // The west dead end cannot support a forward U-turn. Reverse out to the
  // wider straight section, then use two opposite-steering quarter arcs.
  horizontal(bay.center,[180,27.1],-1);
  for(let i=1;i<=120;i++){const a=-Math.PI/2+Math.PI/2*i/120;add(180+2.4*Math.cos(a),29.5+2.4*Math.sin(a),a+1.5*Math.PI,-1);}
  nodes.at(-1).event='forward';
  for(let i=1;i<=120;i++){const a=Math.PI+Math.PI/2*i/120;add(184.8+2.4*Math.cos(a),29.5+2.4*Math.sin(a),a+Math.PI/2);}
  line([184.8,27.1],[191.2,27.1]);
  for(let i=1;i<=120;i++){const a=Math.PI/2*i/120;add(191.2+3*Math.sin(a),24.1+3*Math.cos(a),-a);}
  shift([194.2,24.1],[191.8,7]);nodes.at(-1).event='handoff';
  return nodes;
 }
 function locate(nodes,s){let i=0;while(i<nodes.length-2&&nodes[i+1].s<s)i++;const a=nodes[i],b=nodes[i+1],u=SP.clamp((s-a.s)/(b.s-a.s||1),0,1),da=Math.atan2(Math.sin(b.angle-a.angle),Math.cos(b.angle-a.angle));return{p:[a.p[0]+(b.p[0]-a.p[0])*u,a.p[1]+(b.p[1]-a.p[1])*u],angle:a.angle+da*u,gear:b.gear};}
 const contained=poly=>poly.every(([x,y])=>x>=bay.rect[0]&&x<=bay.rect[2]&&y>=bay.rect[1]&&y<=bay.rect[3]);
 const bayPoly=[[164,29.6],[169.4,29.6],[169.4,31.8],[164,31.8]],entryPoly=[[169.5,29.6],[175.5,29.6],[175.5,36],[169.5,36]];
 function inspect(vehicleId,bayId){const c=T.cars.find(c=>c.id===vehicleId),known=bayId===bay.id,poly=c?.poly,inside=!!poly&&contained(poly),stopped=!!c&&(state.car===c?state.run.v<.01:c.v<.01);return{vehicleId,exists:!!c,stopped,contained:known&&inside,overlaps:known&&!!poly&&T.polyOverlap(poly,bayPoly),legal:known&&!!poly&&(state.phase==='parked'&&state.car===c?inside:(!geometry(poly)&&(!stopped||!T.polyOverlap(poly,entryPoly)))),occupants:known?T.cars.filter(o=>T.polyOverlap(o.poly,bayPoly)).map(o=>o.id):[]};}
 engine=R.create({now,inspect});
 function observe(){const result=engine.update();if(result.warning){state.warnings.push(result.warning);if(state.warnings.length>16)state.warnings.shift();SP.toast?.('停车已满120分钟，请尽快驶离。');}if(result.departed)state.nextEligibleAt=Math.max(state.nextEligibleAt,now()+20);return result;}
 const clockUpdate0=C.update;C.update=function(dt){const result=clockUpdate0.apply(this,arguments);if(state.enabled&&state.car&&!N.isNeighborhood()){const elapsed=Math.max(0,Math.min(Number(dt)||0,.25));for(let t=0;t<elapsed-1e-8&&state.car;t+=1/60)step(Math.min(1/60,elapsed-t),true);}observe();return result;};
 function audit(nodes){return nodes.map(n=>({s:n.s,p:n.p,angle:n.angle,reason:N.geometry(N.pose(n.p,n.angle))})).filter(n=>n.reason);}
 function gap(r,c){const horizon=r.v*r.v/(2*DEC)+r.v*.6+1.1;for(let d=0;d<=horizon;d+=.08){const q=locate(r.nodes,Math.min(r.nodes.at(-1).s,r.s+d)),poly=N.pose(q.p,q.angle);for(const a of actorsForStreet())for(const[x,y,rad]of a.circles())if(SP.circlePoly(x,y,rad+.2,poly))return d;for(const o of T.cars)if(o!==c&&T.polyOverlap(poly,o.poly))return d;}return Infinity;}
 function adopt(c){const nodes=nodesFor(c),bad=audit(nodes);if(bad.length){state.violations.push({reason:'swept-route',examples:bad.slice(0,8),count:bad.length});state.enabled=false;return;}state.car=c;state.ids.push(c.id);state.phase='approach';state.run={nodes,s:0,v:c.neighborhood.v,events:nodes.filter(n=>n.event),eventIndex:0,dwell:0,original:c.neighborhood};}
 const update0=T.update,reset0=T.reset;
 T.reset=function(){state.car=null;state.occupied=null;state.run=null;state.enabled=true;state.phase='idle';state.completed=0;state.ids=[];state.violations=[];state.warnings=[];state.nextEligibleAt=0;engine=R.create({now,inspect});const result=reset0.apply(this,arguments);return result;};
 function step(dt,offStreet=false){const c=state.car,r=state.run;if(!c){if(offStreet)return;update0.call(T,dt);const next=N.state.car;if(next&&next.y>6.2&&next.y<6.5&&next.neighborhood.heading>1&&next.neighborhood.heading<2){if((N.state.adopted.length-1)%3===0&&now()>=state.nextEligibleAt&&!T.cars.some(o=>o!==next&&T.polyOverlap(o.poly,bayPoly)))adopt(next);else state.skipped++;}return;}
  if(!T.cars.includes(c)){state.violations.push({reason:'original-car-lost',id:c.id});state.car=null;state.enabled=false;return;}
  // Let original native traffic proceed while retaining the original excursion car.
  if(!offStreet){const enabled=N.state.enabled;N.state.enabled=false;c.v=0;c.vmax=0;c.s=c.x;try{update0.call(T,dt);}finally{N.state.enabled=enabled;}}
  const event=r.events[r.eventIndex],distance=event.s-r.s,obstacle=gap(r,c),cap=Math.min(1.8,Math.sqrt(2*DEC*Math.max(0,distance)),Math.sqrt(2*DEC*Math.max(0,obstacle-.65)));
  if(Number.isFinite(obstacle))state.yieldFrames++;
  const old=r.v;r.v=cap<r.v?Math.max(cap,r.v-DEC*dt):Math.min(cap,r.v+1.5*dt);state.maxDeceleration=Math.max(state.maxDeceleration,(old-r.v)/dt);
  if(distance<.001&&r.v<.08){r.v=0;c.v=0;c.waiting=true;if(event.event==='park'){const poly=N.pose(event.p,event.angle);if(!contained(poly))throw Error('P-W01 occupancy requires entire native footprint');state.phase='parked';state.occupied={vehicleId:c.id,bayId:bay.id,phase:'parked'};if(!engine.state().active){const entered=engine.enter(c.id);if(!entered.ok){state.violations.push({reason:entered.reason});return;}r.departAt=now()+state.dwellMinutes;}observe();if(now()<r.departAt)return;engine.requestDeparture(c.id);state.phase='departing';state.occupied.phase='departing';}else if(event.event==='handoff'){const oldRun=r.original,idx=oldRun.nodes.findIndex(n=>Math.abs(n.p[0]-191.8)<.001&&Math.abs(n.p[1]-7)<.001);if(idx<0)throw Error('Original route handoff pose missing');oldRun.s=oldRun.nodes[idx].s;oldRun.heading=-Math.PI/2;oldRun.v=0;c.neighborhood=oldRun;state.completed++;state.phase='complete';state.car=null;return;}r.eventIndex++;return;}
  const s=Math.min(event.s,r.s+r.v*dt),q=locate(r.nodes,s),poly=N.pose(q.p,q.angle),bad=geometry(poly);if(bad){state.violations.push({reason:bad,s});state.enabled=false;return;}
  for(const a of actorsForStreet())for(const[x,y,rad]of a.circles())if(SP.circlePoly(x,y,rad+.06,poly)){r.v=0;return;}
  for(const o of T.cars)if(o!==c&&T.polyOverlap(poly,o.poly)){r.v=0;return;}
  state.maxMove=Math.max(state.maxMove,Math.hypot(q.p[0]-c.x,q.p[1]-c.y));state.maxAngle=Math.max(state.maxAngle,Math.abs(Math.atan2(Math.sin(q.angle-c.neighborhood.heading),Math.cos(q.angle-c.neighborhood.heading))));if(state.occupied&&!T.polyOverlap(poly,bayPoly))state.occupied=null;r.s=s;c.x=q.p[0];c.y=q.p[1];c.rot=((Math.round(q.angle/(Math.PI/4))+2)%8+8)%8;c.poly=poly;c.v=r.v;c.waiting=r.v<.05;c.neighborhood.heading=q.angle;observe();
 }
 T.update=function(dt){if(!state.enabled||!N.isNeighborhood())return update0.apply(this,arguments);rememberStreet();for(let t=0;t<dt-1e-8;t+=1/60)step(Math.min(1/60,dt-t));};
 const exact=(o,keys)=>o&&Object.getPrototypeOf(o)===Object.prototype&&Object.keys(o).sort().join(',')===keys.slice().sort().join(',');
 const fresh=()=>({version:1,ruleState:R.fresh(),vehicle:null,nextEligibleAt:0});
 function canSave(){return state.car&&state.phase!=='parked'?{ok:false,reason:'车辆正在泊车或驶离，请稍候再存档。'}:{ok:true};}
 function snapshot(){if(!canSave().ok)throw Error(canSave().reason);observe();return{version:1,ruleState:engine.snapshot(),vehicle:state.phase==='parked'?{id:state.car.id,variant:state.car.variant,originalVmax:state.run.original.originalVmax,departureAt:state.run.departAt}:null,nextEligibleAt:state.nextEligibleAt};}
 function prepare(s,at=now()){if(!exact(s,['version','ruleState','vehicle','nextEligibleAt'])||s.version!==1||!R.validate(s.ruleState,at)||!Number.isFinite(s.nextEligibleAt)||s.nextEligibleAt<0||s.nextEligibleAt>at+20)return null;const a=s.ruleState.active,v=s.vehicle;if(!a)return v===null?clone(s):null;if(a.phase!=='parked'||!exact(v,['id','variant','originalVmax','departureAt'])||v.id!==a.vehicleId||!root.SCENE_DATA.traffic.variants.includes(v.variant)||!Number.isFinite(v.originalVmax)||v.originalVmax<.1||v.originalVmax>20||!Number.isFinite(v.departureAt)||v.departureAt<a.enteredAt||v.departureAt>a.enteredAt+1440)return null;return clone(s);}
 function restore(s){const p=prepare(s);if(!p)return{ok:false,reason:'Invalid parked vehicle/visit crosslinks'};if(state.car||engine.state().active)return{ok:false,reason:'Parking restore requires native traffic reset first'};state.nextEligibleAt=p.nextEligibleAt;if(p.vehicle){const v=p.vehicle;if(T.cars.some(c=>c.id===v.id||T.polyOverlap(c.poly,bayPoly)))return{ok:false,reason:'Physical bay occupied during restore'};const lane={id:'modern-excursion',axis:'x',c:-1.5,dir:1,rot:2,range:[-10000,10000],stops:[{at:24,box:'ix'}]},originalNodes=N.route(),original={nodes:originalNodes,s:0,v:0,heading:Math.PI,claim:false,originalVmax:v.originalVmax,stop:originalNodes.find(n=>Math.abs(n.p[0]-191.8)<.02&&n.p[1]<=3.5).s},nodes=nodesFor({x:194.2,y:6.3,neighborhood:{heading:Math.PI/2}}),events=nodes.filter(n=>n.event),c={id:v.id,type:'car',rect:[-.98,-2.3,.98,2.3],half:2.3,hw:.98,z1:1.45,piece:'p_car',lane:lane.id,L:lane,dir:1,s:166.7,rot:6,v:0,state:'normal',vmax:0,variant:v.variant,crash:null,x:166.7,y:30.7,poly:N.pose(bay.center,Math.PI),waiting:true,neighborhood:original};T.cars.push(c);T.n=Math.max(T.n,Number(v.id.slice(3))+1);state.car=c;state.phase='parked';state.ids.push(c.id);state.run={nodes,s:events[0].s,v:0,events,eventIndex:0,original,departAt:v.departureAt};state.occupied={vehicleId:c.id,bayId:bay.id,phase:'parked'};N.state.car=c;N.state.adopted.push(c.id);}
  for(const h of p.ruleState.history)T.n=Math.max(T.n,Number(h.vehicleId.slice(3))+1);const restored=engine.restore(p.ruleState);if(!restored.ok){if(state.car)T.cars=T.cars.filter(c=>c!==state.car);N.state.car=null;state.car=null;state.run=null;state.phase='idle';state.occupied=null;return restored;}state.enabled=true;return{ok:true};}
 // Native cached ground marking. This is independent of the old parking overlay.
 const images=new Map(),groundItems=[];
 function register(key,image,x,y){SP.K.frames[key]=[0,0,image.width,image.height,0,0];images.set(key,image);groundItems.push({key,X:x,Y:y,rect:SP.frameRect(key,x,y),o:3});}
 const pts=[[164,29.6],[169.4,29.6],[169.4,31.8],[164,31.8]].map(p=>SP.scr(...p,0)),ox=Math.floor(Math.min(...pts.map(p=>p[0]))-6),oy=Math.floor(Math.min(...pts.map(p=>p[1]))-6),image=document.createElement('canvas');image.width=Math.ceil(Math.max(...pts.map(p=>p[0]))-ox+6);image.height=Math.ceil(Math.max(...pts.map(p=>p[1]))-oy+6);const ctx=image.getContext('2d');ctx.translate(-ox,-oy);ctx.strokeStyle='#ece9d7';ctx.lineWidth=2.5;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.stroke();register('parking-live/P-W01',image,ox,oy);
 const signs=[{id:'parking-P-W01',p:[164.2,32.45],parking:true},{id:'parking-B-entry',p:[175.8,32.45],parking:false}];
 /* Real street-sign scale (audit A4): ~1.05 m board on a 3 m post (board bottom at 1.9 m), not a 3.6 m billboard.
  * At 32 px/m that is a 34x42 px plate; the lettering is hinted pixel text so it still reads at the default zoom. */
 const SIGN={w:46,board:[6,3,34,42],poleTop:45,bottomZ:1.9,topZ:3.05};
 for(const sign of signs){const base=SP.scr(...sign.p,0),top=SP.scr(...sign.p,SIGN.bottomZ),canvas=document.createElement('canvas');canvas.width=SIGN.w;canvas.height=Math.ceil(base[1]-top[1]+SIGN.poleTop+8);const cc=canvas.getContext('2d'),bx=SIGN.w/2,by=canvas.height-8,[x0,y0,bw,bh]=SIGN.board;
  cc.fillStyle='rgba(24,29,30,.22)';cc.beginPath();cc.ellipse(bx+4,by,8,3,-.25,0,Math.PI*2);cc.fill();cc.fillStyle='#777f7c';cc.fillRect(bx-1,SIGN.poleTop,3,by-SIGN.poleTop);cc.fillStyle='#b8bdb6';cc.fillRect(bx,SIGN.poleTop,1,by-SIGN.poleTop);cc.fillStyle='#888a83';cc.fillRect(bx-4,by-2,9,3);
  cc.fillStyle='#7c8584';cc.fillRect(x0-1,y0-1,bw+2,bh+2);cc.fillStyle='#e8e9df';cc.fillRect(x0,y0,bw,bh);cc.textAlign='center';cc.textBaseline='alphabetic';
  if(sign.parking){cc.fillStyle='#254c76';cc.fillRect(x0+2,y0+2,bw-4,24);cc.fillStyle='#fff';cc.font='bold 21px system-ui';cc.fillText('P',bx,y0+23);cc.fillStyle='#263840';cc.font='bold 7px system-ui';cc.fillText('限时',bx,y0+33);cc.fillText('120分钟',bx,y0+40);}
  else{cc.strokeStyle='#b7443e';cc.lineWidth=3;cc.beginPath();cc.arc(bx,y0+13,9,0,Math.PI*2);cc.stroke();cc.beginPath();cc.moveTo(bx-6.5,y0+6.5);cc.lineTo(bx+6.5,y0+19.5);cc.stroke();cc.fillStyle='#263840';cc.font='bold 7px system-ui';cc.fillText('门前',bx,y0+32);cc.fillText('禁停',bx,y0+40);}
  register('parking-live/'+sign.id,canvas,base[0]-bx,base[1]-by);}
 // Ground order is numeric; dynamic overlays must omit o (reserved for a world object).
 const signItems=groundItems.splice(1).map(({o,...item})=>item),trafficDrawables0=T.drawables;T.drawables=function(out,view){trafficDrawables0.apply(this,arguments);if(state.enabled&&N.isNeighborhood())signItems.forEach((item,i)=>{if(view&&!SP.rectsOverlap(item.rect,view))return;const[x,y]=signs[i].p;out.push({...item,kind:'overlay',alpha:1,box:{x0:x-.1,y0:y-.1,x1:x+.1,y1:y+.1,z0:0,z1:SIGN.topZ},depth:x+y,zo:0,sid:signs[i].id});});return out;};
 // Keep physical posts in the native collider grid after scene/chunk rebuilds.
 function registerPosts(){if(!state.enabled||!N.isNeighborhood())return;for(const sign of signs){const id='post-'+sign.id;if(W.colliders.some(o=>o.id===id))continue;const[x,y]=sign.p,box=[x-.07,y-.07,x+.07,y+.07],index=W.colliders.length;W.colliders.push({id,box,poly:[[box[0],box[1]],[box[2],box[1]],[box[2],box[3]],[box[0],box[3]]]});for(let gx=Math.floor(box[0]/2);gx<=Math.floor(box[2]/2);gx++)for(let gy=Math.floor(box[1]/2);gy<=Math.floor(box[3]/2);gy++){const key=gx*1000+gy;if(!W.cgrid.has(key))W.cgrid.set(key,[]);W.cgrid.get(key).push(index);}}}
 const rebuild0=W.rebuildColliders;W.rebuildColliders=function(){const result=rebuild0.apply(this,arguments);registerPosts();return result;};
 const draw0=SP.drawFrame;SP.drawFrame=function(ctx,k,x,y,alpha){const image=images.get(k);if(!image)return draw0.apply(this,arguments);ctx.save();if(alpha!=null)ctx.globalAlpha=alpha;ctx.drawImage(image,Math.round(x),Math.round(y));ctx.restore();};const bake0=W.bakeGround;W.bakeGround=function(){const result=bake0.apply(this,arguments);if(state.enabled&&N.isNeighborhood()){W.groundItems.push(...groundItems);registerPosts();SP.layers?.groundChanged();}return result;};
 SP.streetParking={live:state,bay,nodesFor,audit,contained,inspect,fresh,snapshot,prepare,validate:(s,at)=>!!prepare(s,at),restore,canSave,ruleState:()=>engine.state(),observe,contract:{scope:'single native car; P-W01 only; no player driving',entryReservation:[169.5,29.6,175.5,36],entryPolicy:'Moving passage permitted; no scripted stop or dwell overlaps the reservation',road:[164,24,190,32],sidewalk:[164,32,184,36],reverseRequired:true,turnRadii:{entry:3,threePoint:2.4,return:3},handoff:[191.8,7],dwellMinutes:30,limitMinutes:120,frequency:'At most every third native excursion, plus 20-game-minute cooldown',offStreet:'Existing parking maneuvers continue in bounded native substeps against retained street geometry and actors; no new off-screen adoption'},enable(){state.enabled=true;W.bakeGround();rememberStreet();return state;}};
})(window);








