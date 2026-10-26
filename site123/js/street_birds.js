/* Street pigeons & magpies: small flocks in believable spots (community square, breakfast stall, courtyard tree,
 * street tree, rooftop parapet, bus-stop roof). Presentation only: not part of G.ps, not in SP.actors.list (no collision,
 * not talkable, invisible to NPC / conflict / witness systems), never saved, so old and new saves are untouched.
 * Uses the existing bird art (SP.animalArt, species:'bird', breed pigeon / magpie): peck, hop, preen, idle, takeoff,
 * fly, land, perch, roost. Flocks scatter up to their perch when 李默 comes close (or runs), or something crashes nearby,
 * and drift back down once he has moved away. Perches are computed from the kit's own geometry of the real objects. */
(function(root){'use strict';
const SP=root.SP,G=SP&&SP.game,W=SP&&SP.world;if(!G||!W||!SP.env||SP.streetBirds)return;
const COAT={pigeon:'#8a929c',magpie:'#202329'},FEAR={pigeon:2.4,magpie:3.4},
 FLOCKS=[
 {id:'square_pigeons',breed:'pigeon',n:7,ground:{c:[102.5,10.5],r:1.8},perches:[[['community_tree_east',[-.6,-.3,0,.3,.6]],['community_square_lamp',[-.5,.5]]]]},
 {id:'stall_pigeons',breed:'pigeon',n:4,ground:{c:[3.6,2.5],r:.75},perches:[[['stall',[-.7,-.25,.25,.7]],['lamp2',[-.5,.5]]]]},
 {id:'court_magpies',breed:'magpie',n:2,ground:{c:[11.6,17.6],r:1.0},perches:[[['tree_court',[-.4,.4]]]]},
 {id:'square_magpies',breed:'magpie',n:2,ground:{c:[107.6,12.9],r:.9},perches:[[['community_tree_north',[-.35,.35]]]]},
 {id:'street_magpie',breed:'magpie',n:1,ground:{c:[12.2,2.7],r:.6},perches:[[['tree_se',[.2]]]]},
 {id:'roof_pigeons',breed:'pigeon',n:4,perches:[[['par_s2',[.1,.6]],['par_s3',[-.4,.3]]],[['par_w2',[-.5,.2]],['par_w3',[-.3,.4]]]]},
 {id:'busstop_pigeons',breed:'pigeon',n:3,perches:[[['bus_stop',[-.8,-.35,.5]]],[['lamp0',[-.5,.5]],['lamp1',[0]]]]}];
let seed=20261017,flocks=null,scene=null;
function rnd(){seed=(Math.imul(seed,1103515245)+12345)>>>0;return (seed>>>8)/16777216;}
const lerp=(a,b,t)=>a+(b-a)*t,minute=()=>SP.clock?.min??720;
function piece(o){return SP.K?.pieces?.[o.type]||W.piece?.(o);}
/* perch point on a real object: [x, y, z] (m), u = -1..1 along its edge; null if the object is not on this street */
function perchPoint(id,u){const o=W.byId?.[id];if(!o)return null;const P=piece(o),z=o.z||0,rot=o.rot||0;if(!P)return null;
 if(o.type==='p_tree'){const g=(String(o.variant||'').includes('t2')&&P.geo_var?.t2?.default?.canopy)||P.geo?.default?.canopy;if(!g)return null;return [o.x+u*(g[3]-g[0])*.32,o.y+g[1]-.04,z+g[2]+.45*(g[5]-g[2])];}
 if(o.type==='p_lamp'){const g=P.geo?.[o.state]?.main||P.geo?.ok?.main;return [o.x+u*.1,o.y-1.0,z+(g?g[5]:4.3)];}
 if(o.type==='p_busstop'){const g=P.geo?.default?.roof;return [o.x+u*1.6,o.y+(g?g[1]:-1)+.12,z+(g?g[5]:2.78)];}
 if(o.type==='p_stall'){const g=P.geo?.default?.awning;return [o.x+u*.95,o.y+(g?g[1]:-.97)+.14,z+(g?g[5]:2.29)];}
 if(o.type==='p_parapet'){const g=P.geo?.default?.main,top=z+(g?g[5]:1.08);return rot===2?[o.x-.17,o.y+u*.9,top]:[o.x+u*.9,o.y-.17,top];}
 return null;}
const PART={p_tree:'canopy',p_busstop:'roof',p_stall:'awning',p_lamp:'main',p_parapet:'main'};
/* slot = [x, y, z, objectId, part]: birds on a part that fades (roof / canopy see-through near 李默) fade with it */
function slotsOf(set){const out=[];for(const [id,us] of set)for(const u of us){const p=perchPoint(id,u);if(p)out.push([...p,id,PART[W.byId[id].type]]);}return out;}
function clearGround(x,y){return !W.blockedStatic?.(x,y,.08);}
function groundSpot(f,near,avoid){const g=f.spec.ground;for(let k=0;k<14;k++){const c=near||f.centre,a=rnd()*Math.PI*2,r=(near?.25+rnd()*.35:Math.sqrt(rnd())*g.r),x=c[0]+Math.cos(a)*r,y=c[1]+Math.sin(a)*r;
  if(Math.hypot(x-g.c[0],y-g.c[1])>g.r||!clearGround(x,y))continue;if(avoid&&f.birds.some(b=>b!==avoid&&b.z<.05&&Math.hypot(b.x-x,b.y-y)<.22))continue;return [x,y];}return null;}
function make(spec){const f={spec,birds:[],state:spec.ground?'ground':'perch',set:0,calm:0,centre:spec.ground?spec.ground.c.slice():null,drift:0,slots:spec.perches.map(slotsOf)};
 if(!f.slots[0].length)return null;const prof={species:'bird',breed:spec.breed,coat:COAT[spec.breed]};
 for(let i=0;i<spec.n;i++){const b={id:'street_bird_'+spec.id+'_'+i,animalId:'street_'+spec.breed,profile:prof,flock:f,i,x:0,y:0,z:0,dir:['SW','S','W','SE','E','NW'][Math.floor(rnd()*6)],mode:'idle',t:rnd()*2,fl:null,hop:null};
  if(spec.ground){const p=groundSpot(f,null,b)||spec.ground.c;b.x=p[0];b.y=p[1];}else{const s=f.slots[0][i%f.slots[0].length];[b.x,b.y,b.z]=s;b.perch=s;b.mode='idle';}
  b.screen=function(){return [Math.round(SP.sx(this.x,this.y)),Math.round(SP.sy(this.x,this.y,0))];};
  b.draw=function(ctx){const alt=Math.round(SP.sy(this.x,this.y,0)-SP.sy(this.x,this.y,this.z)),o=this.perch&&!this.fl&&W.byId?.[this.perch[3]],k=o?(o.alpha?.[this.perch[4]]??1):1;if(k<.05)return true;
   if(k<1){ctx.save();ctx.globalAlpha*=k;}const r=!!SP.animalArt?.draw(ctx,this,{mode:this.mode},this.profile,{alt,shadow:this.fl?(this.z<6?'ground':'none'):'feet'});if(k<1)ctx.restore();return r;};
  f.birds.push(b);}
 return f;}
let retry=0;
/* flocks appear once their perch objects are on the street (chunks stream in); built ones keep running */
function build(dt){if(!flocks){flocks=[];retry=0;}if((retry-=dt)>0)return;retry=1;for(const spec of FLOCKS)if(!flocks.some(f=>f.spec===spec)){const f=make(spec);if(f)flocks.push(f);}}
function threatDistance(b,run){const P=SP.player;if(!P||P.hidden)return 1e9;const pz=P.level==='roof'?18:(P.z||0);if(Math.abs(pz-b.z)>3)return 1e9;return Math.hypot(P.x-b.x,P.y-b.y)/(run?1.45:1);}
function people(b){for(const a of SP.actors?.list||[]){if(a.isPlayer||a.hidden||a.vehicle||a.isAnimal)continue;if(b.z<.5&&Math.hypot(a.x-b.x,a.y-b.y)<1.0)return a;}return null;}
function fly(b,to,from,scare){const p0=[b.x,b.y,b.z],d=Math.hypot(to[0]-b.x,to[1]-b.y)+Math.abs(to[2]-b.z)*.5;let cx=(b.x+to[0])/2,cy=(b.y+to[1])/2;
 if(from){const ax=b.x-from[0],ay=b.y-from[1],L=Math.hypot(ax,ay)||1,k=Math.min(2.5,d*.6);cx+=ax/L*k;cy+=ay/L*k;}
 b.perch=null;b.fl={p0,p1:to.slice(0,3),slot:to.length>3?to:null,c:[cx,cy,Math.max(b.z,to[2])+.8+d*.12],T:Math.max(.7,d/(scare?4.6:3.4)),u:0,delay:scare?rnd()*.35:rnd()*2.5};b.hop=null;}
function bez(a,c,b,u){return (1-u)*(1-u)*a+2*(1-u)*u*c+u*u*b;}
function scare(f,from){if(f.state==='flying')return;const set=f.spec.ground?0:farthestSet(f,from);f.state='flying';f.set=set;f.calm=(SP.now||0)+8+rnd()*8;const S=f.slots[set];
 f.birds.forEach((b,i)=>fly(b,S[i%S.length],from,true));}
function farthestSet(f,from){let best=0,bd=-1;f.slots.forEach((S,k)=>{if(!S.length)return;const d=Math.min(...S.map(s=>Math.hypot(s[0]-from[0],s[1]-from[1])));if(d>bd){bd=d;best=k;}});return best;}
function roostTime(){const m=minute(),w=SP.clock?.weather;return m<330||m>1170||w==='rain'||w==='snow';}
function stepBird(b,dt){const f=b.flock;
 if(b.fl){const F=b.fl;if(F.delay>0){F.delay-=dt;b.mode=b.z>.05?'idle':'eat';return;}F.u=Math.min(1,F.u+dt/F.T);const u=F.u,x=bez(F.p0[0],F.c[0],F.p1[0],u),y=bez(F.p0[1],F.c[1],F.p1[1],u),z=bez(F.p0[2],F.c[2],F.p1[2],u);
  const dx=x-b.x,dy=y-b.y;if(Math.hypot(dx,dy)>1e-4)b.dir=SP.dirFromWorld(dx,dy);b.x=x;b.y=y;b.z=Math.max(0,z);b.mode='flee';if(u>=1){b.perch=F.slot;b.fl=null;b.mode='idle';b.t=.3+rnd()*1.2;}return;}
 b.t-=dt;
 if(b.hop){const H=b.hop,dx=H[0]-b.x,dy=H[1]-b.y,d=Math.hypot(dx,dy),s=Math.min(d,dt*.9);if(d<.02||!clearGround(b.x+dx/d*s,b.y+dy/d*s)){b.hop=null;b.mode='idle';b.t=.2+rnd()*.6;return;}b.x+=dx/d*s;b.y+=dy/d*s;b.dir=SP.dirFromWorld(dx,dy);b.mode='hop';return;}
 if(b.t>0)return;const r=rnd(),night=roostTime();
 if(b.z>.05||!f.spec.ground){b.mode=night?'sleep':r<.25?'groom':'idle';b.t=night?6:2+rnd()*5;if(!night&&r>.93)b.dir=['SW','S','W','SE'][Math.floor(rnd()*4)];return;}
 if(r<.55){b.mode='eat';b.t=1.4+rnd()*2.6;}else if(r<.85){const p=groundSpot(f,Math.hypot(b.x-f.centre[0],b.y-f.centre[1])>f.spec.ground.r*.6?f.centre:[b.x,b.y],b);if(p){b.hop=p;b.mode='hop';}else{b.mode='idle';b.t=.6;}}
 else if(r<.94){b.mode='idle';b.t=.8+rnd()*1.6;}else{b.mode='groom';b.t=1.5+rnd()*2;}}
function stepFlock(f,dt){const now=SP.now||0,run=!!(SP.player?.running&&SP.player?.moving);
 if(f.state==='flying'&&f.birds.every(b=>!b.fl)){f.state=f.landing?'ground':'perch';f.landing=false;}
 if(f.spec.ground){
  if(f.state==='ground'){for(const b of f.birds){if(threatDistance(b,run)<FEAR[f.spec.breed]){scare(f,[SP.player.x,SP.player.y]);break;}const a=people(b);if(a){scare(f,[a.x,a.y]);break;}}
   if(f.state==='ground'&&roostTime()){f.state='flying';f.set=0;const S=f.slots[0];f.birds.forEach((b,i)=>fly(b,S[i%S.length],null,false));}
   if(f.state==='ground'&&(f.drift-=dt)<=0){f.drift=15+rnd()*15;const g=f.spec.ground,a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*g.r*.5,c=[g.c[0]+Math.cos(a)*r,g.c[1]+Math.sin(a)*r];if(clearGround(c[0],c[1]))f.centre=c;}}
  else if(f.state==='perch'&&now>f.calm&&!roostTime()){const g=f.spec.ground;if(threatDistance({x:g.c[0],y:g.c[1],z:0},run)>FEAR[f.spec.breed]*2.2&&!people({x:g.c[0],y:g.c[1],z:0})){f.state='flying';f.birds.forEach(b=>{const p=groundSpot(f,null,b)||g.c;fly(b,[p[0],p[1],0],null,false);});f.landing=true;}}
 }else if(f.state==='perch'){for(const b of f.birds)if(threatDistance(b,run)<FEAR[f.spec.breed]){scare(f,[SP.player.x,SP.player.y]);break;}
  if(f.state==='perch'&&!roostTime()&&rnd()<dt/25){const S=f.slots[f.set],b=f.birds[Math.floor(rnd()*f.birds.length)],used=f.birds.map(q=>q.fl?q.fl.p1:[q.x,q.y]),free=S.filter(s=>!used.some(p=>Math.hypot(p[0]-s[0],p[1]-s[1])<.15));if(free.length&&!b.fl)fly(b,free[Math.floor(rnd()*free.length)],null,false);}}
 for(const b of f.birds)stepBird(b,dt);}
function active(){return !W.interior&&(W.sceneId==='street'||!W.sceneId);}
function tick(dt){if(!active()){return;}if(scene!==W.data){scene=W.data;flocks=null;}if(!flocks||flocks.length<FLOCKS.length)build(dt);
 for(const f of flocks){if(!f.slots[0].length)continue;stepFlock(f,dt);}}
/* drawables: same painter record shape as actors (kind 'actor'), with a 3D box at the bird's real height */
function drawables(out,view){if(!active()||!flocks)return;for(const f of flocks)for(const b of f.birds){const X=SP.sx(b.x,b.y),Y=SP.sy(b.x,b.y,0),alt=Y-SP.sy(b.x,b.y,b.z);
  const rect={x0:X-14,x1:X+14,y0:Y-alt-28,y1:Y+4};if(view&&SP.rectsOverlap&&!SP.rectsOverlap(rect,view))continue;
  out.push({kind:'actor',actor:b,rect,box:{x0:b.x-.08,x1:b.x+.08,y0:b.y-.08,y1:b.y+.08,z0:b.z,z1:b.z+.28,circles:[[b.x,b.y,.08]]},depth:b.x+b.y,zo:0,sid:'actor/'+b.id});}}
const update0=G.update;G.update=function(dt){const r=update0.apply(this,arguments);try{tick(Math.min(dt||0,.1));}catch(e){if(root.console)console.error(e);}return r;};
const draw0=SP.env.drawables;SP.env.drawables=function(out,view){const r=draw0.apply(this,arguments);try{drawables(out,view);}catch(e){if(root.console)console.error(e);}return r;};
if(SP.actors?.alarm){const alarm0=SP.actors.alarm;SP.actors.alarm=function(x,y,r){const out=alarm0.apply(this,arguments);try{if(flocks)for(const f of flocks)if(f.state!=='flying'&&f.birds.some(b=>Math.hypot(b.x-x,b.y-y)<Math.max(6,r||0)))scare(f,[x,y]);}catch(e){}return out;};}
SP.streetBirds={FLOCKS,COAT,FEAR,perchPoint,saved:false,flocks:()=>flocks,birds:()=>flocks?flocks.flatMap(f=>f.birds):[],reset(){flocks=null;scene=null;},_tick:tick,_drawables:drawables};
})(window);
