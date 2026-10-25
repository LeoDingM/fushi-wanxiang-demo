/* 周店长 presentation only: his look and his rounds inside store_24 while workforce.js has him on site.
 * Reads the actor that workforce.js spawns (SP.workforce.actor()); never reads or writes the workforce ledger, plans
 * or decisions, and keeps no saved state (position is runtime only, the actor is re-spawned at POST by workforce.js).
 * Movement goes through SP.actors.move (sub-stepped, collision-safe, slides), so he never teleports or clips;
 * he waits for / steps around the player and other people and gives up a blocked leg instead of pushing through. */
(function(root){'use strict';
const SP=root.SP,G=SP&&SP.game;if(!G||!SP.workforce||SP.storeManagerWalk)return;
const ROOM='store_24',SPEED=.8,TOUCH=.12,
 LOOK={ageYears:46,heightCm:174,gender:'male',presentation:'masculine',job:'clerk',body:'average',hair:'sidepart',outfit:'manager'},
 /* store_24 nodes (m). Every leg below follows the scene's validated shopper/staff lanes (store45.json store_npcs). */
 N={desk:[7.15,3.3],via:[7.2,3.85],door:[7.35,4.45],back:[6.3,4.35],mid:[5.0,3.25],aisle:[4.5,3.25],gond:[2.8,3.25],fridge:[4.5,4.85],front:[4.5,1.6],till:[5.55,2.3],step:[5.55,1.75]},
 /* the round: [node, facing on arrival, dwell seconds [min,max], what he is doing] */
 ROUND=[['desk','W',[18,30],'counter'],['via'],['door','NE',[4,7],'backroom'],['via'],['back'],['aisle','W',[4,7],'shelves'],['gond','N',[3,5],'shelves'],['gond','S',[2,4],'shelves'],
  ['aisle'],['fridge','N',[3,5],'fridge'],['aisle'],['front','S',[4,6],'greet'],['aisle'],['mid'],['back'],['via']],
 ENTRY=[['step'],['till'],['mid'],['back'],['via']],
 GREET=['欢迎光临～','您好，随便看看。','需要帮忙叫我。'],
 st=new WeakMap();
let seq=0;
function here(){return SP.place?.where?.()===ROOM&&!G.trans;}
function styled(a){if(a._managerLook)return;a._managerLook=true;const D=SP.npcDiversity;let r=D?.adapt?.(a,LOOK);
 if(!r?.ok&&D?.adapt)r=D.adapt(a,{...LOOK,outfit:'jacket'});
 if(!r?.ok&&!root.ACTORS?.[a.set])a.set='clerk_zhou';/* never leave him on an atlas that does not exist */
 SP.ensureActor?.(a.set);a.speed=SPEED;}
function rnd(){seq=(seq*1103515245+12345)&0x7fffffff;return seq/0x7fffffff;}
function brain(a){let b=st.get(a);if(!b){b={plan:ENTRY.slice(),i:0,round:false,dwell:0,stuck:0,side:0,greetAt:-1e9,doing:'arrive',held:false};st.set(a,b);}return b;}
function leg(b){return b.plan[b.i];}
function advance(b){b.i++;if(b.i>=b.plan.length){b.plan=ROUND;b.i=0;b.round=true;}b.stuck=0;b.side=0;b.best=null;b.doing='walk';}
function held(a){const m=G.menu?.o;return !!(m&&(m.actor===a||m.actor?.id===a.id||m.id===a.id))||!!SP.npcConversations?.holdsActor?.(a.id)||!!(G.activity&&G.activity.actor===a);}
function face(a,dt,dir){a.update(dt,false,dir||a.dir,0);}
/* the staff lane behind the counter is one person wide: a clerk on the move gets the lane, he moves on */
function yieldTo(a){return (SP.actors?.list||[]).some(o=>o!==a&&o.staff&&!o.hidden&&o.moving&&Math.hypot(o.x-a.x,o.y-a.y)<1.6);}
function greet(a,b,dt){const P=SP.player;if(!P||P.hidden)return false;const d=Math.hypot(P.x-a.x,P.y-a.y),t=SP.now||0;
 if(d<2.6&&t-b.greetAt>90){b.greetAt=t;a.bubble={t:2.4,text:GREET[Math.floor(rnd()*GREET.length)]};b.look=1.6;}
 if(b.look>0){b.look-=dt;return SP.dirFromWorld?SP.dirFromWorld(P.x-a.x,P.y-a.y):null;}return null;}
function step(a,dt){const b=brain(a);if(a.bubble){a.bubble.t-=dt;if(a.bubble.t<=0)a.bubble=null;}
 if(held(a)){b.held=true;const P=SP.player;face(a,dt,P&&SP.dirFromWorld?SP.dirFromWorld(P.x-a.x,P.y-a.y):a.dir);return;}b.held=false;
 const L=leg(b),lookDir=greet(a,b,dt);
 if(b.dwell>0){b.dwell-=dt;face(a,dt,lookDir||L[1]);if(L[3]==='counter'&&yieldTo(a))b.dwell=0;if(b.dwell<=0)advance(b);return;}
 const t=N[L[0]],dx=t[0]-a.x,dy=t[1]-a.y,d=Math.hypot(dx,dy);
 if(d<TOUCH){if(L[2]){b.doing=L[3]||'';b.dwell=L[2][0]+rnd()*(L[2][1]-L[2][0]);face(a,dt,lookDir||L[1]);}else advance(b);return;}
 b.doing='walk';let ux=dx/d,uy=dy/d;
 if(b.side>0){b.side-=dt;const s=b.sideSign||1;[ux,uy]=[ux*.45-uy*s*.9,uy*.45+ux*s*.9];}
 const len=Math.min(a.speed*dt,d),vx=ux*len,vy=uy*len,m=SP.actors.move(a,vx,vy);
 /* progress, not motion: sliding along someone's shoulder without getting closer also counts as stuck */
 if(b.best==null||d<b.best-.02){b.best=d;b.stuck=0;}else b.stuck+=dt;
 if(m>1e-5)a.update(dt,true,SP.dirFromWorld(vx,vy),m);else face(a,dt,lookDir||a.dir);
 if(b.stuck<=.3)return;
 if(a.blockedBy==='player'&&b.stuck>.3&&!a.bubble&&(SP.now||0)-(b.excuseAt||-99)>20){b.excuseAt=SP.now||0;a.bubble={t:1.6,text:'借过一下～'};}
 if(b.stuck>1&&b.side<=0){/* step aside towards whichever side is actually free (counter / shelf on the other) */
  const ok=k=>SP.actors.shapeClear(a,a.x-dy/d*k*.35,a.y+dx/d*k*.35),pref=b.sideSign?-b.sideSign:(rnd()<.5?1:-1);b.sideSign=ok(pref)?pref:ok(-pref)?-pref:pref;b.side=.9;}
 const P=SP.player,taken=P&&!P.hidden&&Math.hypot(P.x-t[0],P.y-t[1])<a.radius+(P.radius||.22)+.15;
 const staff=a.blockedBy&&(SP.actors?.list||[]).find(o=>o.id===a.blockedBy&&o.staff);
 if(b.stuck>5||((taken||staff)&&b.stuck>1.5))advance(b);/* someone parked in his way: skip that stop and walk on to the next one, never through */
}
const update0=G.update;
G.update=function(dt){const r=update0.apply(this,arguments);try{const a=SP.workforce.actor?.();if(a&&here()&&SP.actors?.list?.includes(a)&&!a.hidden){styled(a);step(a,Math.min(dt||0,.1));}}catch(e){if(root.console)console.error(e);}return r;};
SP.storeManagerWalk={LOOK,NODES:N,ROUND,ENTRY,state:a=>{const b=a&&st.get(a);return b?{node:leg(b)?.[0],doing:b.doing,dwell:b.dwell,round:b.round,held:b.held}:null;},_step:step,_style:styled};
})(window);
