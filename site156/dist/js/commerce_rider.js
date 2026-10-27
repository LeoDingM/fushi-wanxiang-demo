/* Site88: 街坊外卖 orders ridden by the street's visible delivery rider (scene actor 'rider', yellow e-scooter). Runtime only:
 * the job (phase, path) is never saved; the ledger (ps.commerce) only records what really happened (pickup, live ETA,
 * hand-over / left at door). The rider moves with collision on the street (SP.actors.move + shapeClear, vehicle turns) while the
 * street is on screen, and along the same static-collider path at the same speed while the player is indoors (no teleport:
 * when the street comes back he is where the simulation put him). One job at a time; other orders fall back to the
 * modelled platform courier, labelled as such. Assistant decisions, not confirmed by Leo: 1 min pickup, 2 min hand-over wait,
 * "present" = within 6 m of him at the entrance or inside the destination home; after a load he resumes from where he stands. */
(function(root){'use strict';const SP=root.SP,G=SP?.game,W=SP?.world,C=SP?.clock,M=root.CommerceModel,N=SP?.npcs;if(!G||!C||!M||!N||!SP.commerce||SP.commerceRider)return;
const J=x=>JSON.parse(JSON.stringify(x)),ID='rider',PLAN_R=.42,PICK=1,WAIT=2,NEAR=6,DEG=Math.PI/180,now=()=>C.abs();
let job=null,owner=null,lastAt=null,stats={assigned:0,live:0,sim:0,handed:0,left:0};
const ps=()=>G.ps;
function actor(){return(N.list||[]).find(a=>a.id===ID)||null;}
function streetLive(){return SP.place?.where?.()==='street'&&!SP.metroActive&&!SP.cbd?.active&&!G.trans;}
function streetData(){return streetLive()||!!(SP.place?.street?.colliders&&SP.place.street.cgrid);}
function blocked(x,y,r){if(streetLive())return !!W?.blockedStatic?.(x,y,r);const b=SP.place?.street;if(!b?.data?.bounds||!b.colliders||!b.cgrid)return false;const B=b.data.bounds;if(x-r<B.x0||x+r>B.x1||y-r<B.y0||y+r>B.y1)return true;for(let a=Math.floor((x-r)/2);a<=Math.floor((x+r)/2);a++)for(let v=Math.floor((y-r)/2);v<=Math.floor((y+r)/2);v++)for(const n of b.cgrid.get(a*1000+v)||[]){const c=b.colliders[n];if(!c.roof&&SP.circlePoly?.(x,y,r,c.poly))return true;}return false;}
/* a stop beside the door with room for the scooter to turn (clearance .8), falling back to the planning radius */
function approach(g){for(const c of [.8,PLAN_R]){if(!blocked(g.x,g.y,c))return[g.x,g.y];for(const r of [.8,1.1,1.4,1.8,2.3,3])for(let k=0;k<12;k++){const x=g.x+Math.cos(k*Math.PI/6)*r,y=g.y+Math.sin(k*Math.PI/6)*r;if(!blocked(x,y,c))return[x,y];}}return[g.x,g.y];}
function plan(x,y,tx,ty){const R=SP.npcConflict?.route;if(!R)return null;for(const r of [PLAN_R,.32]){const p=R(x,y,tx,ty,blocked,r,90000);if(p&&p.length)return p.map(q=>[q[0],q[1]]);}return Math.hypot(tx-x,ty-y)<.3?[]:null;}
function len(x,y,path){let d=0,px=x,py=y;for(const [a,b]of path){d+=Math.hypot(a-px,b-py);px=a;py=b;}return d;}
function upm(a){return(a?.speed||2.6)/Math.max(.05,C.scale||1);}           // street units per game minute (same speed live and simulated)
function onShift(at){const m=((at%1440)+1440)%1440;return m>=M.RIDER[0]&&m<M.RIDER[1];}
function heldElsewhere(){try{if(SP.cityIncidents?.holdsActor?.(ID))return true;const p=ps()?.npcConflict?.people?.[ID];if(p&&(p.mode!=='calm'||p.restrained))return true;if(SP.conflictDialogue?.holdsActor?.(ID))return true;}catch{}return false;}
function activeRider(){return(ps()?.commerce?.orders||[]).filter(o=>o.courier==='rider'&&['preparing','riding'].includes(o.status));}
function merchantPt(id){const m=M.MERCHANTS[id];return approach({x:m.x,y:m.y});}
function destPt(id){const d=M.DEST[id];return approach({x:d.x,y:d.y});}
/** minutes for the visible rider to serve a new order from where he is now, or null when he cannot (busy, off shift, no street) */
function estimate(merchant,dest,prepMin,at=now()){const a=actor();if(!a||job||activeRider().length||!onShift(at)||!streetData()||heldElsewhere()||a.hidden)return null;
 const mp=merchantPt(merchant),dp=destPt(dest),p1=plan(a.x,a.y,mp[0],mp[1]);if(!p1)return null;const p2=plan(mp[0],mp[1],dp[0],dp[1]);if(!p2)return null;
 const u=upm(a),t1=len(a.x,a.y,p1)/u;return Math.max(t1+PICK,prepMin)+len(mp[0],mp[1],p2)/u+WAIT;}
function startLeg(phase,tx,ty){const a=actor();job.phase=phase;job.target=[tx,ty];job.path=plan(a.x,a.y,tx,ty)||[[tx,ty]];job.stuck=0;}
function assign(id){const o=(ps()?.commerce?.orders||[]).find(o=>o.id===id),a=actor();if(!o||o.courier!=='rider'||!a||job)return false;owner=ps();
 job={id,phase:'',path:[],until:0,mp:merchantPt(o.merchant),dp:destPt(o.dest),stuck:0,resumed:o.status==='riding'};stats.assigned++;
 if(o.status==='riding')startLeg('to_dest',...job.dp);else startLeg('to_merchant',...job.mp);a.bubble={t:2,text:o.status==='riding'?'接着送！':'接单！'};return true;}
function order(){return job?(ps()?.commerce?.orders||[]).find(o=>o.id===job.id)||null:null;}
function remainMin(a,o,at){const u=upm(a);let m=len(a.x,a.y,job.path)/u;
 if(job.phase==='to_merchant'||job.phase==='pickup'){if(!job.legB)job.legB=len(job.mp[0],job.mp[1],plan(job.mp[0],job.mp[1],...job.dp)||[job.dp])||.01;m=Math.max(at+m+(job.phase==='pickup'?Math.max(0,job.until-at):PICK),o.readyAt)-at+job.legB/u+WAIT;}
 else if(job.phase==='to_dest')m+=WAIT;else if(job.phase==='handoff')m=Math.max(0,job.until-at);return m;}
function release(a){if(a?.brain){const R=a.brain.spec.route;let bi=0,bd=1e9;R.forEach((p,i)=>{const d=Math.hypot(p[0]-a.x,p[1]-a.y);if(d<bd){bd=d;bi=i;}});a.brain.idx=bi;a.brain.stuck=0;a.brain.wait=0;}job=null;}
function nearestLoop(a){const R=a.brain?.spec?.route||[];let best=null,bd=1e9;for(const p of R){const d=Math.hypot(p[0]-a.x,p[1]-a.y);if(d<bd){bd=d;best=p;}}return best?[best[0],best[1]]:[a.x,a.y];}
function present(a){const P=SP.player,where=SP.place?.where?.(),o=order();if(o&&M.DEST[o.dest].areas.includes(where))return'home';if(where==='street'&&P&&streetLive()&&Math.hypot(P.x-a.x,P.y-a.y)<=NEAR)return'face';return null;}
/* move along job.path by `dist` units; live = real collision steering, otherwise exact path following. Returns true when the leg is done */
function follow(a,dist,live,dt){if(!job.path.length)return true;
 if(!live){let left=dist;while(left>1e-6&&job.path.length){const [tx,ty]=job.path[0],d=Math.hypot(tx-a.x,ty-a.y);if(d<=left){a.x=tx;a.y=ty;left-=d;job.path.shift();}else{const k=left/d,vx=(tx-a.x)*k,vy=(ty-a.y)*k;a.x+=vx;a.y+=vy;if(Math.abs(vx)+Math.abs(vy)>1e-4)a.setDir?.(SP.dirFromWorld(vx,vy));left=0;}}stats.sim+=dist;return !job.path.length;}
 const [tx,ty]=job.path[0],dx=tx-a.x,dy=ty-a.y,d=Math.hypot(dx,dy);if(d<.35){job.path.shift();return !job.path.length;}
 const step=Math.min(dist,d);let moved=0,mx=0,my=0;for(const t of [0,-25,25,-50,50,-80,80]){const ang=Math.atan2(dy,dx)+t*DEG,vx=Math.cos(ang)*step,vy=Math.sin(ang)*step,dir=SP.dirFromWorld(vx,vy);
  if(a.vehicle&&dir!==a.dir){if(!SP.actors.shapeClear(a,a.x+vx,a.y+vy,dir)||!SP.actors.shapeClear(a,a.x,a.y,dir))continue;}else if(!SP.actors.shapeClear(a,a.x+vx,a.y+vy))continue;
  moved=SP.actors.move(a,vx,vy);mx=vx;my=vy;if(moved>1e-5)break;}
 if(moved>1e-5){job.stuck=0;stats.live+=moved;a.update?.(dt,true,SP.dirFromWorld(mx,my),moved);}else{job.stuck+=dt;a.update?.(dt,false,a.dir,0);if(job.path.length===1&&d<1.6&&job.stuck>1){job.path.shift();job.stuck=0;return true;}
  if(job.stuck>1.5){/* wedged (cannot turn): walk the scooter back a little, keeping its facing, like a real rider */for(let k=0;k<8;k++){const ang=Math.atan2(-dy,-dx)+k*Math.PI/4*(k%2?1:-1),vx=Math.cos(ang)*Math.min(.12,dist),vy=Math.sin(ang)*Math.min(.12,dist);if(SP.actors.shapeClear(a,a.x+vx,a.y+vy)&&SP.actors.move(a,vx,vy)>1e-5){stats.live+=Math.hypot(vx,vy);break;}}}/* the scooter is longer than the planning circle: park beside the door */if(job.stuck>4){job.path=plan(a.x,a.y,...job.target)||job.path;job.stuck=0;if(!job.bell){a.bubble={t:1.6,text:'让一让，送外卖～'};job.bell=1;}}}
 return false;}
function step(dt,gm){const a=actor(),at=now();if(!job)return;if(owner!==ps()){job=null;return;}const o=order();
 if(!a){return;}if(heldElsewhere())return;
 if(!o||o.status==='cancelled'&&job.phase!=='return'){startLeg('return',...nearestLoop(a));a.bubble={t:2,text:'订单取消了'};}
 /* a clock fast-forward on the street (waiting, skips) moves him along the same planned path at his speed per game minute */
 const ff=gm-(dt||0)*(C.scale||1)>.5,live=!ff&&streetLive()&&SP.actors?.list?.includes(a);let budget=live?a.speed*dt:upm(a)*gm,guard=0;
 while(job&&guard++<8){const ph=job.phase;
  if(ph==='to_merchant'||ph==='to_dest'||ph==='return'){const before=[a.x,a.y];const done=follow(a,budget,live,dt);budget=live?0:Math.max(0,budget-Math.hypot(a.x-before[0],a.y-before[1]));
   if(!done)break;
   if(ph==='to_merchant'){job.phase='pickup';job.until=Math.max(at+PICK,o.readyAt);a.bubble={t:2,text:'取'+M.MERCHANTS[o.merchant].name.slice(-2)+'的餐'};}
   else if(ph==='to_dest'){job.phase='handoff';job.until=at+WAIT;a.bubble={t:2.5,text:'外卖到了！'};}
   else{release(a);break;}}
  else if(ph==='pickup'){if(at<job.until)break;if(o.status==='preparing'){const r=SP.commerce.riderPickup(o.id,at);if(!r.ok)break;}a.bubble={t:2,text:'取到了，出发！'};startLeg('to_dest',...job.dp);}
  else if(ph==='handoff'){const who=present(a);if(at<job.until&&!who)break;const r=SP.commerce.riderArrive(o.id,at,!!who,who);if(r.ok){stats.lastDrop=[Math.round(a.x*100)/100,Math.round(a.y*100)/100,who||'door'];if(who){stats.handed++;a.bubble={t:3,text:who==='home'?'您的外卖，趁热吃！':'李先生是吧？您的外卖～'};}else{stats.left++;a.bubble={t:2.5,text:'放门口啦'};}}startLeg('return',...nearestLoop(a));}
  else break;}
 if(job&&o&&['preparing','riding'].includes(o.status)&&a)SP.commerce.riderEta(o.id,at+remainMin(a,o,at));}
function claim(){if(owner!==ps()){job=null;owner=ps();}if(!job){const o=activeRider()[0];if(o&&actor()&&streetData()&&!heldElsewhere())assign(o.id);}return job?[job.id]:[];}
function tick(dt){const at=now();const gm=lastAt==null||at<lastAt?0:Math.min(at-lastAt,1440);lastAt=at;if(!ps()?.commerce){job=null;return;}
 if(owner!==ps()){job=null;owner=ps();}
claim();
 if(job)step(dt||0,gm);}
/* the rider is ours while on a job: keep him out of the fixed-loop brain (pattern of city_incidents.js) */
const n0=N.update;N.update=function(){if(!job)return n0.apply(this,arguments);const all=this.list;this.list=all.filter(a=>a.id!==ID);try{return n0.apply(this,arguments);}finally{this.list=all;}};
if(G.update){const up=G.update;G.update=function(dt){const r=up.apply(this,arguments);try{tick(dt);}catch(e){root.console?.error?.(e);}return r;};}
function view(){const a=actor(),o=order();return{busy:!!job,phase:job?.phase||null,orderId:job?.id||null,x:a?.x??null,y:a?.y??null,live:streetLive(),onShift:onShift(now()),remainM:job&&a?Math.round(len(a.x,a.y,job.path)):null,stats:J(stats)};}
function reset(){if(job){const a=actor();if(a)release(a);}job=null;owner=null;lastAt=null;}
SP.commerceRider={estimate,assign,view,held:claim,reset,actor,_plan:plan,_approach:approach};
})(typeof window!=='undefined'?window:globalThis);
