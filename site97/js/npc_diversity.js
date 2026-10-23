/* Native actor appearance adapter. Opt-in per actor, feet anchored, with real
 * draw/occlusion/collision changes. Selected atlas data carries no NPC locations. */
(function(root){
 'use strict';
 const JOBS=['civilian','office','guard','medical','barber','clerk','student','courier','firefighter'];
 const HAIR={short:'nd_man_short',buzz:'nd_man_buzz',sidepart:'nd_man_sidepart',undercut:'nd_man_undercut',bald:'nd_man_bald',grey:'nd_man_grey',bob:'nd_woman_bob',perm:'nd_woman_perm',pony:'nd_woman_pony',long:'nd_woman_long',pixie:'nd_woman_pixie',wave:'nd_woman_wave',bun:'nd_woman_bun',braid:'nd_woman_braid'};
 const OUTFITS={casual:'nd_fit_knit',shirt:'nd_fit_shirt',work:'nd_fit_work',jacket:'nd_fit_jacket',hoodie:'nd_fit_hoodie',skirt:'nd_student_skirt',office_skirt:'nd_office_skirt',medical:'nd_nurse',clerk_blue:'nd_clerk_zhao',clerk_red:'nd_clerk_zhou',firefighter:'nd_firefighter',manager:'nd_fit_manager'};
 const DEFAULTS={civilian:'casual',office:'shirt',guard:'work',medical:'medical',barber:'work',clerk:'clerk_blue',student:'hoodie',courier:'jacket',firefighter:'firefighter'};
 const WIDTH={slim:.92,average:1,broad:1.08};
 // Hair pools for generated looks. Bald is never a default: only an explicit design entry (or an elderly
 // masculine profile in random()) may get it.
 const HAIR_POOLS={feminine:['bob','perm','pony','long','bun','wave','pixie','braid'],masculine:['short','sidepart','buzz','undercut','grey'],neutral:['short','bob','pixie','sidepart','pony','buzz','long']};
 // Designed hairstyles for named residents/NPCs (actor id -> hair). Art-only: never written to saves,
 // never changes routes, clothing, collision or role text. 张大爷 (neighbor_zhang_host) keeps the uncle
 // atlas' designed bald crown with grey fringe and is the only intentionally bald named character.
 const HAIR_CAST={vendor:'perm',office:'sidepart',student:'short',uncle:'grey',noodle_boss:'buzz',tea_girl:'pony',walker_e:'long',
  daily_wen:'grey',daily_shen:'long',community_resident_lin:'short',community_civic_staff:'bob',community_librarian:'bun',community_workspace_staff:'pony',
  community_repair_staff:'buzz',community_barber_staff:'undercut',neighborhood_supply_courier:'buzz',shared_maintenance_worker:'short'};
 const DESIGNED_BALD=['neighbor_zhang_host'];
 // Body atlases whose own head is only a placeholder scalp: always composited with a real hair atlas.
 const PLACEHOLDER_HEAD=atlas=>atlas==='office'||/^nd_fit_/.test(atlas)||atlas==='nd_office_skirt'||atlas==='nd_student_skirt';
 function hairPool(p){const key=p.gender==='female'?'feminine':p.gender==='male'?'masculine':p.presentation||'neutral';return HAIR_POOLS[key]||HAIR_POOLS.neutral;}
 function normalize(p){
  p=p||{};const ageYears=p.ageYears==null?30:p.ageYears,heightCm=p.heightCm==null?172:p.heightCm;
  if(!Number.isInteger(ageYears)||ageYears<0||ageYears>95)return {ok:false,reason:'年龄必须为 0–95 岁整数。'};
  if(ageYears<18)return {ok:false,missingAsset:'minor',reason:'尚无已验证儿童/未成年人脸部及身体比例图集；不会用缩小成人代替。'};
  if(!Number.isFinite(heightCm)||heightCm<150||heightCm>195)return {ok:false,reason:'当前成人图集适配范围为 150–195 cm。'};
  const gender=p.gender||'unspecified',presentation=p.presentation||'neutral',job=p.job||'civilian',body=p.body||'average';
  if(!['female','male','nonbinary','unspecified'].includes(gender)||!['feminine','masculine','neutral'].includes(presentation)||!JOBS.includes(job)||!Object.hasOwn(WIDTH,body))return {ok:false,reason:'外观属性无效。'};
  const hair=p.hair||(presentation==='feminine'?'bob':'short'),outfit=p.outfit||DEFAULTS[job];if(!Object.hasOwn(HAIR,hair)||!Object.hasOwn(OUTFITS,outfit))return {ok:false,reason:'发型或服装没有已验证图集。'};
  return {ok:true,profile:{version:1,ageYears,heightCm,gender,presentation,job,body,hair,outfit}};
 }
 function seeded(seed){let a=2166136261;for(const c of String(seed))a=Math.imul(a^c.charCodeAt(0),16777619);return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
 function random(seed,hints){const r=seeded(seed),pick=a=>a[Math.floor(r()*a.length)],p={ageYears:18+Math.floor(r()*58),heightCm:158+Math.floor(r()*28),gender:pick(['female','male']),presentation:pick(['feminine','masculine','neutral']),job:pick(JOBS),body:pick(['slim','average','broad']),...hints};
  if(!hints||!hints.hair){const pool=hairPool(p),hr=r();p.hair=p.gender!=='female'&&(p.gender==='male'||p.presentation==='masculine')&&p.ageYears>=60&&hr<.15?'bald':pool[Math.floor(r()*pool.length)];}return normalize(p);}
 function metrics(p,baseline){return {sx:WIDTH[p.body],sy:p.heightCm/(baseline||172),radius:.22*WIDTH[p.body],height:p.heightCm/100};}
 function register(host){
  const SP=host.SP;if(!SP||!SP.Actor)return null;if(SP.npcDiversity)return SP.npcDiversity;
  const data=host.NPC_DIVERSITY_DATA||{},script=host.document&&host.document.currentScript&&host.document.currentScript.src;
  host.ACTORS=host.ACTORS||{};for(const [id,record]of Object.entries(data)){if(host.ACTORS[id])continue;host.ACTORS[id]={...record,img:script?new URL('../'+record.img,script).href:record.img};}
  /* store manager outfit: navy jacket atlas without the messenger strap, name tag pinned on the chest (tools/gen_manager_outfit.py) */
  if(host.ACTORS.nd_fit_jacket&&!host.ACTORS.nd_fit_manager){const b=host.ACTORS.nd_fit_jacket;host.ACTORS.nd_fit_manager={...b,img:b.img.replace(/fit_jacket\.png/,'fit_manager.png'),derivedFrom:'nd_fit_jacket'};}
  if(host.ACTORS.nd_woman_bob&&!host.ACTORS.nd_woman_perm){const b=host.ACTORS.nd_woman_bob;host.ACTORS.nd_woman_perm={...b,img:b.img.replace(/woman_bob\.png/,'woman_perm.png'),hairStyle:'perm',derivedFrom:'nd_woman_bob'};}
  const tailMasks=new WeakMap();for(const record of Object.values(host.ACTORS))if(record.hairTailMasks)for(const[key,frame]of Object.entries(record.frames))if(record.hairTailMasks[key])tailMasks.set(frame,record.hairTailMasks[key]);
  const A=SP.Actor.prototype,draw0=A.draw,rect0=A.spriteRect,body0=A.bodyRect;
  function adapt(actor,partial,options){
   const result=normalize(partial);if(!result.ok)return result;if(!actor||actor.vehicle||actor.carry)return {ok:false,reason:'当前仅适配徒步人物，车辆与推车保持原生比例。'};
   const p=result.profile,body=OUTFITS[p.outfit],head=HAIR[p.hair];if(!host.ACTORS[body]||!host.ACTORS[head])return {ok:false,reason:'外观图集数据未加载。'};
   const m=metrics(p),hairOnly=!!(options&&options.hairOnly);
   if(!hairOnly&&SP.world&&SP.world.data&&SP.actors&&SP.actors.shapeClear&&m.radius>actor.radius){const old=actor.radius;actor.radius=m.radius;const clear=SP.actors.shapeClear(actor,actor.x,actor.y,actor.dir);actor.radius=old;if(!clear)return {ok:false,reason:'当前站位无法容纳新的碰撞半径，请先移到空处。'};}
   actor.diversity=p;actor.diversityPreserveSet=!!(options&&options.preserveSet);if(!actor.diversityPreserveSet)actor.set=body;
   if(hairOnly){if(!actor.diversityBaseHeight)actor.diversityBaseHeight=actor.height*100;}else{actor.diversityBaseHeight=172;actor.radius=m.radius;actor.height=m.height;}SP.ensureActor(head);SP.ensureActor(actor.set);return {ok:true,profile:p};
  }
  function supported(a){return !!(a.diversity&&!a.vehicle&&!a.carry&&normalize(a.diversity).ok);}
  const atlasOf=a=>String((typeof a.atlasName==='function'?a.atlasName():'')||a.set||'').split('#')[0];
  // Hair-only look for actors without a diversity profile: designed cast hair, or a default for placeholder-scalp atlases.
  function castHair(a){if(!a||a.vehicle||a.carry||a.isAnimal||DESIGNED_BALD.includes(a.id))return null;const atlas=atlasOf(a);if(Object.hasOwn(HAIR_CAST,a.id))return HAIR_CAST[a.id];if(PLACEHOLDER_HEAD(atlas))return /skirt/.test(atlas)?'bob':'short';return null;}
  function look(a){if(supported(a))return a.diversity;const hair=castHair(a);if(!hair||!host.ACTORS[HAIR[hair]])return null;let L=a._hairLook;if(!L||L.hair!==hair){L=a._hairLook={hair,outfit:null,body:'average',cast:true};Object.defineProperty(a,'_hairLook',{value:L,enumerable:false,configurable:true,writable:true});}return L;}
  const actorMetrics=a=>{const L=look(a);return L&&L.cast?{sx:1,sy:1,radius:a.radius,height:a.height}:metrics(a.diversity,a.diversityBaseHeight);};
  function frameGeometry(a,f){const [X,Y]=a.screen(),m=actorMetrics(a),cut=Math.round(f[3]*.22);return {X,Y,m,cut,top:Y-Math.round(f[5]*m.sy),x:X-Math.round(f[4]*m.sx),width:f[2]*m.sx,height:f[3]*m.sy};}
  function headFrame(a,k){const head=host.ACTORS[HAIR[look(a).hair]],bits=k.split('_'),clip=head.clips[bits[0]]?bits[0]:bits[0]==='run'?'walk':'idle';return head.frames[`${clip}_${bits[1]}_${Number(bits[2])%(head.clips[clip]||1)}`]||head.frames[`idle_${a.dir}_0`];}
  A.draw=function(ctx,raw,erase){
   const L=look(this);if(!L)return draw0.apply(this,arguments);
   const atlas=this.atlasName(),D=this.data(),src=raw?SP.img['actor_'+atlas]:(SP.tintedActors&&SP.tintedActors[atlas]||SP.img['actor_'+atlas]),headId=HAIR[L.hair],hsrc=raw?SP.img['actor_'+headId]:(SP.tintedActors&&SP.tintedActors[headId]||SP.img['actor_'+headId]);
   if(!hsrc&&SP.ensureActor&&!SP.img['actor_'+headId])try{SP.ensureActor(headId);}catch(_){}
   if(!src||!hsrc||!D)return draw0.apply(this,arguments);
   ctx.save();if(this.frosted&&!erase){ctx.filter='blur(1.1px) saturate(.35) brightness(1.25)';ctx.globalAlpha=.78;}
   for(const[k,alpha]of this.frameKeys()){
    const f=D.frames[k];if(!f)continue;const g=frameGeometry(this,f),helmet=L.outfit==='firefighter',h=headFrame(this,k);
    ctx.globalAlpha=this.frosted&&!erase?.78:alpha;
    // Keep head width unchanged: body-width diversity must not stretch faces.
    const cut=g.cut;
    ctx.drawImage(src,f[0],f[1]+cut,f[2],f[3]-cut,g.x,g.top+cut*g.m.sy,g.width,(f[3]-cut)*g.m.sy);
    const hf=helmet?f:h,hs=helmet?src:hsrc;
    if(hf){const hc=Math.round(hf[3]*.22),hy=g.top+(g.cut-hc)*g.m.sy,hx=g.X-Math.round(hf[4]);ctx.drawImage(hs,hf[0],hf[1],hf[2],hc,hx,hy,hf[2],hc*g.m.sy);
     // Long hair, ponytails and braids extend below the head without replacing
     // the wearer's clothing. The original atlas pixels remain unchanged.
     const rows=!helmet&&tailMasks.get(hf);
     if(rows&&rows.length){const limit=Math.round(hf[3]*.38);ctx.save();ctx.beginPath();for(const[x,y,w]of rows)ctx.rect(hx+x,hy+y*g.m.sy,w,g.m.sy+.01);ctx.clip();ctx.drawImage(hs,hf[0],hf[1],hf[2],limit,hx,hy,hf[2],limit*g.m.sy);ctx.restore();}
    }
   }
   ctx.restore();const[X,Y]=this.screen();
   if(this.umbrella&&!this.isPlayer)SP.drawFrame(ctx,this.umbKey(),X+this.umbDX(),Y-36);
   if(this.bubble&&!erase){ctx.save();ctx.fillStyle='#faf8f0';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText(this.bubble.text,X,Y-84*actorMetrics(this).sy);ctx.restore();}
  };
  A.spriteRect=function(){const L=look(this);if(!L)return rect0.apply(this,arguments);let r=null;const D=this.data();for(const[k]of this.frameKeys()){const f=D.frames[k];if(!f)continue;const g=frameGeometry(this,f),h=L.outfit==='firefighter'?f:headFrame(this,k),q={x0:g.x,x1:g.x+g.width,y0:g.top,y1:g.top+g.height};if(h){const hc=Math.round(h[3]*.22),hy=g.top+(g.cut-hc)*g.m.sy;q.y0=Math.min(q.y0,hy);q.y1=Math.max(q.y1,hy+hc*g.m.sy);q.x0=Math.min(q.x0,g.X-Math.round(h[4]));q.x1=Math.max(q.x1,g.X-Math.round(h[4])+h[2]);}r=r?{x0:Math.min(r.x0,q.x0),x1:Math.max(r.x1,q.x1),y0:Math.min(r.y0,q.y0),y1:Math.max(r.y1,q.y1)}:q;}if(this.umbrella||this.bubble){const old=rect0.apply(this,arguments);r={x0:Math.min(r.x0,old.x0),x1:Math.max(r.x1,old.x1),y0:Math.min(r.y0,old.y0),y1:Math.max(r.y1,old.y1)};}return r||rect0.apply(this,arguments);};
  A.bodyRect=function(){if(!supported(this))return body0.apply(this,arguments);const[X,Y]=this.screen(),m=actorMetrics(this);return {x0:X-12*m.sx,x1:X+12*m.sx,y0:Y-76*m.sy,y1:Y-4*m.sy};};
  function audit(actor){return {profile:actor.diversity||null,set:actor.set,rect:actor.spriteRect(),bodyRect:actor.bodyRect(),radius:actor.radius,height:actor.height};}
  return SP.npcDiversity={adapt,normalize,random,metrics,audit,look,castHair,HAIR,HAIR_POOLS,HAIR_CAST,DESIGNED_BALD,OUTFITS,JOBS,assets:Object.keys(data),missingAssets:['真实儿童与未成年人形态','保安专用制服','理发围裙','徒步快递制服（目前工作外套代替）'],automaticSpawns:false};
 }
 const api={JOBS,HAIR,HAIR_POOLS,HAIR_CAST,DESIGNED_BALD,OUTFITS,normalize,random,metrics,register};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.NpcDiversity=api;if(root.SP)register(root);
})(typeof window!=='undefined'?window:globalThis);

