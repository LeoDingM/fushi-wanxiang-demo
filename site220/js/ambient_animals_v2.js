/* Extra ambient animals drawn from the sprite-v2 atlases (v2a_grey_tabby 灰猫, v2a_sparrow 麻雀) — Leo: “保留原版，但加上新的灰猫和麻雀”.
 * The existing animals (王家灰猫芝麻, 橘子, 小花, 小麻雀, street pigeons / magpies) keep their original art and code untouched.
 * Presentation only, like js/street_birds.js: not in G.ps, not in SP.actors.list (no collision, not talkable, invisible
 * to NPC / conflict / witness systems), never saved, so old and new saves are untouched.
 * Sparrow flocks: hop (walk clip, frame advanced by ground distance), peck, idle on a ground patch; flush to the canopy
 * of a real tree when 李默 comes close (sooner if he runs), or a passer-by / alarm, and come back down once he has gone;
 * roost in the tree at night and in rain. Grey cats: stroll between a few spots in the old residential compound /
 * 井槐里 old-block frontage (walk frames advanced by distance, no paw sliding), lounge / sleep, stop and watch when 李默 is close.
 * Spots, counts and scales are 「未经Leo确认」 choices. */
(function(root){'use strict';
const SP=root.SP,G=SP&&SP.game,W=SP&&SP.world;if(!G||!W||!SP.env||SP.ambientV2)return;
const DATA=root.AMBIENT_ANIMALS_V2_DATA||{},script=root.document&&root.document.currentScript&&root.document.currentScript.src;
root.ACTORS=root.ACTORS||{};
for(const[id,rec]of Object.entries(DATA))if(!root.ACTORS[id])root.ACTORS[id]={...rec,lazy:true,img:script?new URL('../'+rec.img,script).href:rec.img};
/* 「未经Leo确认」 draw scale: both sheets 1:1. The v2 sparrow sheet is baked "×2" against real size (≈10–13 px), the same
 * exaggeration the original birds use (animals_art BIRD.sparrow S=2.6 ≈ pigeon S=1.55 length), so 1:1 sits at the size of
 * the original 小麻雀 and just under the original pigeons (≈15 px). Tested 0.5 in game (box-filtered half frames): a 5-px
 * brown blob, smaller than anything else on the street and unreadable at zoom 0.5–1, so rejected. Cats: 1:1, same as 橘子. */
const SCALE={sparrow:1,cat:1};
const FEAR=2.6,
 FLOCKS=[
 {id:'court_sparrows',n:5,ground:{c:[12.6,12.4],r:.85},perch:[['tree_side',[-.7,-.35,0,.35,.7]]]},
 {id:'sidewalk_sparrows',n:4,ground:{c:[-5.4,2.0],r:.7},perch:[['tree_sw',[-.6,-.2,.2,.6]]]},
 {id:'square_sparrows',n:6,ground:{c:[96.6,8.8],r:1.0},perch:[['community_tree_west',[-.7,-.4,-.1,.2,.5,.8]]]},
 {id:'rq_sparrows',n:4,ground:{c:[20.2,72.5],r:.75},perch:[['rq_tree_19_69',[-.5,.1]],['rq_tree_19_77',[-.3,.4]]]}],
 CATS=[
 {id:'court_greycat',spots:[[15.4,12.6],[11.2,13.6],[10.4,6.0],[15.6,5.6]],rest:'sleep',speed:.5},
 {id:'alley_greycat',spots:[[-22.6,5.5],[-14.2,5.6],[-13.6,8.6]],rest:'idle',speed:.45}];
let seed=20261018,flocks=null,cats=null,scene=null,retry=0;
function rnd(){seed=(Math.imul(seed,1103515245)+12345)>>>0;return (seed>>>8)/16777216;}
const minute=()=>SP.clock?.min??720,clear=(x,y,r)=>!W.blockedStatic?.(x,y,r||.08);
function roostTime(){const m=minute(),w=SP.clock?.weather;return m<330||m>1170||w==='rain'||w==='snow';}
function screenOf(o){return [Math.round(SP.sx(o.x,o.y)),Math.round(SP.sy(o.x,o.y,0))];}
/* ---------- atlas drawing (walk frame from ground distance, other clips by time) ---------- */
function sheetFor(sp){return sp==='bird'?'v2a_sparrow':'v2a_grey_tabby';}
function frameOf(a,clip){const name=sheetFor(a.species),D=root.ACTORS[name];if(!D)return null;const img=SP.img?.['actor_'+name];if(!img){SP.ensureActor?.(name);return null;}
 const n=D.clips[clip]||1;let f;if(clip==='walk')f=Math.floor(a.ph*n)%n;else f=Math.floor((SP.now||0)*(clip==='fly'?10:clip==='peck'?3:1.4)+a.seed)%n;
 const fr=D.frames[`${clip}_${a.dir}_${f}`]||D.frames[`idle_${a.dir}_0`]||D.frames.idle_SW_0;return fr?{img,f:fr}:null;}
function advance(a,d,D){a.ph=(a.ph+d/(D.stride_m||.4))%1;}
function drawAtlas(ctx,a,clip,alt){const got=frameOf(a,clip);if(!got)return false;const s=SCALE[a.species==='bird'?'sparrow':'cat'],f=got.f,[X,Y]=screenOf(a),bird=a.species==='bird';
 ctx.save();ctx.imageSmoothingEnabled=false;if(!(bird&&alt>40)){ctx.fillStyle='rgba(20,36,28,.26)';ctx.beginPath();ctx.ellipse(X,Y-(bird?alt:0)-.5,bird?3:8,bird?1.2:3,0,0,Math.PI*2);ctx.fill();}
 ctx.drawImage(got.img,f[0],f[1],f[2],f[3],Math.round(X-f[4]*s),Math.round(Y-alt-f[5]*s),Math.round(f[2]*s),Math.round(f[3]*s));ctx.restore();return true;}
/* ---------- sparrows ---------- */
function slotsOf(spec){const P=SP.streetBirds?.perchPoint,out=[];if(!P)return out;for(const[id,us]of spec.perch)for(const u of us){const p=P(id,u);if(p)out.push([...p,id,'canopy']);}return out;}
function groundSpot(f,near,self){const g=f.spec.ground;for(let k=0;k<14;k++){const c=near||g.c,a=rnd()*Math.PI*2,r=near?.12+rnd()*.25:Math.sqrt(rnd())*g.r,x=c[0]+Math.cos(a)*r,y=c[1]+Math.sin(a)*r;
  if(Math.hypot(x-g.c[0],y-g.c[1])>g.r||!clear(x,y))continue;if(f.birds.some(b=>b!==self&&b.z<.05&&Math.hypot(b.x-x,b.y-y)<.14))continue;return [x,y];}return null;}
function makeFlock(spec){const slots=slotsOf(spec);if(!slots.length)return null;const f={spec,slots,birds:[],state:'ground',calm:0};
 for(let i=0;i<spec.n;i++){const b={id:'v2_sparrow_'+spec.id+'_'+i,animalId:'v2_sparrow',species:'bird',flock:f,x:spec.ground.c[0],y:spec.ground.c[1],z:0,dir:['SW','S','W','SE','E','NW','N','NE'][Math.floor(rnd()*8)],mode:'idle',t:rnd()*2,ph:0,seed:i*3,hop:null,fl:null,perch:null};
  const p=groundSpot(f,null,b);if(p){b.x=p[0];b.y=p[1];}b.screen=function(){return screenOf(this);};
  b.draw=function(ctx){const alt=Math.round(SP.sy(this.x,this.y,0)-SP.sy(this.x,this.y,this.z)),o=this.perch&&!this.fl&&W.byId?.[this.perch[3]],k=o?(o.alpha?.canopy??1):1;if(k<.05)return true;
   if(k<1){ctx.save();ctx.globalAlpha*=k;}const clip=this.fl?'fly':this.mode==='hop'?'walk':this.mode==='peck'?'peck':'idle',r=drawAtlas(ctx,this,clip,alt);if(k<1)ctx.restore();return r;};
  f.birds.push(b);}return f;}
const bez=(a,c,b,u)=>(1-u)*(1-u)*a+2*(1-u)*u*c+u*u*b;
function fly(b,to,from,scare){const d=Math.hypot(to[0]-b.x,to[1]-b.y)+Math.abs(to[2]-b.z)*.5;let cx=(b.x+to[0])/2,cy=(b.y+to[1])/2;
 if(from){const ax=b.x-from[0],ay=b.y-from[1],L=Math.hypot(ax,ay)||1,k=Math.min(2,d*.5);cx+=ax/L*k;cy+=ay/L*k;}
 b.perch=null;b.hop=null;b.fl={p0:[b.x,b.y,b.z],p1:to.slice(0,3),slot:to.length>3?to:null,c:[cx,cy,Math.max(b.z,to[2])+.6+d*.1],T:Math.max(.6,d/(scare?5:3.6)),u:0,delay:scare?rnd()*.25:rnd()*2};}
function scare(f,from){if(f.state==='flying')return;f.state='flying';f.landing=false;f.calm=(SP.now||0)+8+rnd()*8;f.birds.forEach((b,i)=>fly(b,f.slots[i%f.slots.length],from,true));}
function threat(b,run){const P=SP.player;if(!P||P.hidden||P.level==='roof')return 1e9;return Math.hypot(P.x-b.x,P.y-b.y)/(run?1.45:1);}
function passer(x,y){for(const a of SP.actors?.list||[]){if(a.isPlayer||a.hidden||a.vehicle||a.isAnimal)continue;if(Math.hypot(a.x-x,a.y-y)<.9)return a;}return null;}
function stepBird(b,dt){const f=b.flock,D=root.ACTORS.v2a_sparrow||{};
 if(b.fl){const F=b.fl;if(F.delay>0){F.delay-=dt;return;}F.u=Math.min(1,F.u+dt/F.T);const u=F.u,x=bez(F.p0[0],F.c[0],F.p1[0],u),y=bez(F.p0[1],F.c[1],F.p1[1],u),z=bez(F.p0[2],F.c[2],F.p1[2],u);
  if(Math.hypot(x-b.x,y-b.y)>1e-4)b.dir=SP.dirFromWorld(x-b.x,y-b.y);b.x=x;b.y=y;b.z=Math.max(0,z);b.mode='fly';if(u>=1){b.perch=F.slot;b.fl=null;b.mode='idle';b.t=.3+rnd();}return;}
 if(b.hop){const H=b.hop,dx=H[0]-b.x,dy=H[1]-b.y,d=Math.hypot(dx,dy),s=Math.min(d,dt*.7);if(d<.01){b.hop=null;b.mode='idle';b.t=.15+rnd()*.5;return;}
  b.x+=dx/d*s;b.y+=dy/d*s;b.dir=SP.dirFromWorld(dx,dy);b.mode='hop';advance(b,s,D);return;}
 if((b.t-=dt)>0)return;const r=rnd();
 if(b.z>.05){b.mode='idle';b.t=roostTime()?6:1.5+rnd()*4;if(r>.85)b.dir=['SW','S','W','SE','E'][Math.floor(rnd()*5)];return;}
 if(r<.5){b.mode='peck';b.t=.8+rnd()*2;}else if(r<.85){const p=groundSpot(f,[b.x,b.y],b)||groundSpot(f,null,b);if(p){b.hop=p;b.mode='hop';}else b.t=.4;}else{b.mode='idle';b.t=.6+rnd()*1.4;}}
function stepFlock(f,dt){const now=SP.now||0,run=!!(SP.player?.running&&SP.player?.moving),g=f.spec.ground;
 if(f.state==='flying'&&f.birds.every(b=>!b.fl)){f.state=f.landing?'ground':'perch';f.landing=false;}
 if(f.state==='ground'){for(const b of f.birds){if(threat(b,run)<FEAR){scare(f,[SP.player.x,SP.player.y]);break;}const a=passer(b.x,b.y);if(a){scare(f,[a.x,a.y]);break;}}
  if(f.state==='ground'&&roostTime()){f.state='flying';f.landing=false;f.birds.forEach((b,i)=>fly(b,f.slots[i%f.slots.length],null,false));}}
 else if(f.state==='perch'&&now>f.calm&&!roostTime()&&threat({x:g.c[0],y:g.c[1]},run)>FEAR*2.2&&!passer(g.c[0],g.c[1])){f.state='flying';f.landing=true;f.birds.forEach(b=>{const p=groundSpot(f,null,b)||g.c;fly(b,[p[0],p[1],0],null,false);});}
 for(const b of f.birds)stepBird(b,dt);}
/* ---------- grey cats ---------- */
function makeCat(spec){const s=spec.spots.filter(p=>clear(p[0],p[1],.2));if(s.length<2)return null;const c={id:'v2_greycat_'+spec.id,animalId:'v2_greycat',species:'cat',spec,spots:s,x:s[0][0],y:s[0][1],dir:'SW',mode:spec.rest,t:2+rnd()*6,ph:0,seed:3,to:null,next:1};
 c.screen=function(){return screenOf(this);};c.draw=function(ctx){return drawAtlas(ctx,this,this.mode==='walk'?'walk':this.mode==='sleep'?'sleep':'idle',0);};return c;}
function stepCat(c,dt){const P=SP.player,near=P&&!P.hidden&&P.level!=='roof'&&Math.hypot(P.x-c.x,P.y-c.y)<1.6,D=root.ACTORS.v2a_grey_tabby||{};
 if(near){if(c.mode!=='sleep'||Math.hypot(P.x-c.x,P.y-c.y)<1.0){c.mode='idle';c.dir=SP.dirFromWorld(P.x-c.x,P.y-c.y);c.t=Math.max(c.t,2);}return;}
 if(c.to){const dx=c.to[0]-c.x,dy=c.to[1]-c.y,d=Math.hypot(dx,dy),s=Math.min(d,c.spec.speed*dt);
  if(d<.02){c.to=null;c.mode=roostTime()||rnd()<.5?'sleep':c.spec.rest;c.t=6+rnd()*14;return;}const nx=c.x+dx/d*s,ny=c.y+dy/d*s;
  if(!clear(nx,ny,.15)||passer(nx,ny)){c.mode='idle';c.t=1;c.to=null;return;}c.x=nx;c.y=ny;c.dir=SP.dirFromWorld(dx,dy);c.mode='walk';advance(c,s,D);return;}
 if((c.t-=dt)>0)return;if(roostTime()&&rnd()<.8){c.mode='sleep';c.t=20;return;}c.to=c.spots[c.next];c.next=(c.next+1)%c.spots.length;c.mode='walk';}
/* ---------- loop / painter ---------- */
function active(){return !W.interior&&(W.sceneId==='street'||!W.sceneId);}
function build(dt){if(!flocks){flocks=[];cats=[];retry=0;}if((retry-=dt)>0)return;retry=1;
 for(const s of FLOCKS)if(!flocks.some(f=>f.spec===s)){const f=makeFlock(s);if(f)flocks.push(f);}
 for(const s of CATS)if(!cats.some(c=>c.spec===s)){const c=makeCat(s);if(c)cats.push(c);}
 for(const n of ['v2a_grey_tabby','v2a_sparrow'])SP.ensureActor?.(n);}
function tick(dt){if(!active())return;if(scene!==W.data){scene=W.data;flocks=null;cats=null;}if(!flocks||flocks.length<FLOCKS.length||cats.length<CATS.length)build(dt);
 for(const f of flocks)stepFlock(f,dt);for(const c of cats)stepCat(c,dt);}
function drawables(out,view){if(!active()||!flocks)return;
 for(const f of flocks)for(const b of f.birds){const X=SP.sx(b.x,b.y),Y=SP.sy(b.x,b.y,0),alt=Y-SP.sy(b.x,b.y,b.z),rect={x0:X-10,x1:X+10,y0:Y-alt-16,y1:Y+3};if(view&&SP.rectsOverlap&&!SP.rectsOverlap(rect,view))continue;
  out.push({kind:'actor',actor:b,rect,box:{x0:b.x-.06,x1:b.x+.06,y0:b.y-.06,y1:b.y+.06,z0:b.z,z1:b.z+.2,circles:[[b.x,b.y,.06]]},depth:b.x+b.y,zo:0,sid:'actor/'+b.id});}
 for(const c of cats){const X=SP.sx(c.x,c.y),Y=SP.sy(c.x,c.y,0),rect={x0:X-17,x1:X+17,y0:Y-33,y1:Y+4};if(view&&SP.rectsOverlap&&!SP.rectsOverlap(rect,view))continue;
  out.push({kind:'actor',actor:c,rect,box:{x0:c.x-.18,x1:c.x+.18,y0:c.y-.18,y1:c.y+.18,z0:0,z1:.4,circles:[[c.x,c.y,.18]]},depth:c.x+c.y,zo:0,sid:'actor/'+c.id});}}
const update0=G.update;G.update=function(dt){const r=update0.apply(this,arguments);try{tick(Math.min(dt||0,.1));}catch(e){root.console&&console.error(e);}return r;};
const draw0=SP.env.drawables;SP.env.drawables=function(out,view){const r=draw0.apply(this,arguments);try{drawables(out,view);}catch(e){root.console&&console.error(e);}return r;};
if(SP.actors?.alarm){const alarm0=SP.actors.alarm;SP.actors.alarm=function(x,y,r){const out=alarm0.apply(this,arguments);try{if(flocks)for(const f of flocks)if(f.state==='ground'&&f.birds.some(b=>Math.hypot(b.x-x,b.y-y)<Math.max(6,r||0)))scare(f,[x,y]);}catch(e){}return out;};}
SP.ambientV2={FLOCKS,CATS,SCALE,FEAR,saved:false,flocks:()=>flocks||[],cats:()=>cats||[],sparrows:()=>flocks?flocks.flatMap(f=>f.birds):[],reset(){flocks=null;cats=null;scene=null;},_tick:tick,_drawables:drawables,_frameOf:frameOf};
})(window);
