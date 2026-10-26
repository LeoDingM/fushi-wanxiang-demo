/* Independent barber room and paid, timed hair-change loop. Entrances are supplied
 * by the integration scene planner; the module contains no donor/world locations. */
(function(root){
 'use strict';
 const ROOM='community_barber_room',CHAIR='community_barber_chair',PRICE=25,MINUTES=25;
 const STYLES={short:'清爽短发',sidepart:'侧分短发',buzz:'寸头',undercut:'短侧削发',bob:'短bob',perm:'烫卷短发',pony:'马尾',pixie:'短精灵发型',wave:'波浪中发',bun:'盘发',long:'自然长发',braid:'辫发'};
 const createState=()=>({version:1,hair:null,nextId:1,orders:[],returnSpawn:null});
 const pending=s=>Array.isArray(s?.orders)?s.orders.find(o=>o.status==='pending')||null:null;
 const openAt=abs=>abs%1440>=540&&abs%1440<1200;
 function validate(s){
  if(!s||typeof s!=='object'||s.version!==1||s.hair!==null&&!Object.hasOwn(STYLES,s.hair)||!Number.isInteger(s.nextId)||s.nextId<1||s.nextId>100000||!Array.isArray(s.orders)||s.orders.length>40)return false;
  const ids=new Set();let active=0;for(const o of s.orders){if(!o||!Number.isInteger(o.id)||o.id<1||o.id>=s.nextId||ids.has(o.id)||!Object.hasOwn(STYLES,o.hair)||!['pending','completed'].includes(o.status)||!Number.isFinite(o.startedAt)||o.startedAt<0||o.finishAt!==o.startedAt+MINUTES||o.price!==PRICE||o.completedAt!==null&&(!Number.isFinite(o.completedAt)||o.completedAt<o.finishAt)||((o.status==='pending')!==(o.completedAt===null)))return false;ids.add(o.id);if(o.status==='pending')active++;}
  return active<=1&&(s.returnSpawn===null||Array.isArray(s.returnSpawn)&&s.returnSpawn.length===3&&Number.isFinite(s.returnSpawn[0])&&Number.isFinite(s.returnSpawn[1])&&['E','NE','N','NW','W','SW','S','SE'].includes(s.returnSpawn[2]));
 }
 function canOrder(s,hair,abs,money){if(!validate(s))return {ok:false,reason:'理发记录无效，请恢复有效存档。'};if(!Object.hasOwn(STYLES,hair))return {ok:false,reason:'发型暂无可用图集。'};if(!openAt(abs)||abs%1440+MINUTES>1200)return {ok:false,reason:'营业 09:00–20:00，理发需 25 分钟，请预留时间。'};if(pending(s))return {ok:false,reason:'已有理发单，请先完成。'};if(s.hair===hair)return {ok:false,reason:'当前已经是这个发型，无需重复付费。'};if(!Number.isFinite(money)||money<PRICE)return {ok:false,reason:'剪发 ¥25，余额不足。'};if(s.orders.length>=40||s.nextId>=100000)return {ok:false,reason:'理发记录已达容量。'};return {ok:true};}
 function createScene(source){
  if(!source)throw Error('理发店缺少integration当前店铺shell');const s=JSON.parse(JSON.stringify(source));s.id=ROOM;s.name='槐东剪艺 · 理发店';s.spawn=[4.5,.95,'N'];
  s.objects=(s.objects||[]).filter(o=>['i_wall','i_cut','i_side','i_window','st_front13','st_front145','st_frontdoor'].includes(o.type)).map(o=>{const fronts={st_front13:'community_front13',st_front145:'community_front145',st_frontdoor:'community_frontdoor'};o.id='barber_shell_'+o.id;if(fronts[o.type])o.type=fronts[o.type];if(['i_wall','i_cut','i_side','i_window'].includes(o.type))o.state='plain';return o;});
  s.ground.legend={T:'g_terrazzo'};s.ground.data_south_to_north=['TTTT','TTTT','TTTT'];
  // A1: a real barber floor — two mirror stations with hydraulic chairs, shampoo bed, product shelves, tool trolley,
  // price light box (doubles as the 发型目录 interaction) and a waiting bench. The paid chair keeps its id / interaction.
  const art=t=>!root.SP||!root.SP.K||root.SP.K.pieces[t];
  const pick=(t,f)=>art(t)?t:f;
  s.objects.push({id:CHAIR,type:pick('bb_chair','f_chair'),x:4.6,y:4.75,rot:0,interact:'community_barber_chair',reach:[4.6,3.75],name:'剪发座椅'},
   {id:'community_barber_station_1',type:pick('bb_station','f_shelf'),x:2.2,y:6.0,rot:0,name:'理发镜台'},
   {id:'community_barber_station_2',type:pick('bb_station','f_shelf'),x:4.6,y:6.0,rot:0,name:'理发镜台'},
   {id:'community_barber_chair_2',type:pick('bb_chair','f_chair'),x:2.2,y:4.75,rot:0,name:'理发椅'},
   {id:'community_barber_catalog',type:pick('bb_lightbox','i_notice'),x:3.4,y:6.0,z:art('bb_lightbox')?0:1.3,interact:'community_barber_catalog',reach:[3.4,5.0],name:'价目灯箱 · 发型目录'},
   {id:'community_barber_trolley',type:pick('bb_trolley','f_stool'),x:3.4,y:4.6,rot:0,name:'理发工具车'},
   {id:'community_barber_shampoo',type:pick('bb_shampoo','f_basin'),x:6.6,y:6.0,rot:0,name:'洗头床'},
   {id:'community_barber_tool_shelf',type:pick('bb_shelf','f_shelf'),x:8.0,y:2.35,rot:art('bb_shelf')?6:0,name:'洗护产品货架'},
   {id:'community_barber_shelf_2',type:pick('bb_shelf','f_shelf'),x:8.0,y:3.4,rot:art('bb_shelf')?6:0,name:'洗护产品货架'},
   {id:'community_barber_wait_bench',type:pick('bb_bench','f_chair'),x:1.6,y:1.9,rot:0,name:'等候长凳'},
   {id:'community_barber_counter',type:'s_counter',x:6.5,y:1.35,rot:0,name:'收银台'},
   {id:'community_barber_lamp_1',type:'i_pendant',x:4.6,y:4.75,state:'on'},
   {id:'community_barber_lamp_2',type:'i_pendant',x:2.2,y:4.75,state:'on'},
   {id:'community_barber_lamp_3',type:'i_pendant',x:6.6,y:5.0,state:'on'},
   {id:'community_barber_plant',type:'p_planter',x:0.6,y:5.3,rot:0},
   {id:'community_barber_exit',type:'i_door',x:4.4,y:0,state:'closed',interact:'community_barber_exit',reach:[4.4,.6],name:'回到理发店外'});
  s.portals=[];s.npcs=[];delete s.store_npcs;delete s.staff_spot;delete s.layout_check;return s;
 }
 function register(host){
  const SP=host.SP,G=SP&&SP.game,W=SP&&SP.world,C=SP&&SP.clock;if(!G||!W||!C||!SP.scenes)return null;if(SP.communityBarber)return SP.communityBarber;
  const scene=createScene(host.STORE45&&host.STORE45.store_24);SP.scenes[ROOM]=scene;const state=()=>G.ps.communityBarber||(G.ps.communityBarber=createState());let staff=null,lastApplied=null,observedPs=null,baselineLook=null;
  function ready(){return !!(SP.npcDiversity&&Object.values(SP.npcDiversity.HAIR).every(id=>host.ACTORS[id]));}
  function near(o){const p=o&&W.reachPt(o);return !!(p&&W.interior&&W.sceneId===ROOM&&W.byId[CHAIR]===o&&Math.hypot(SP.player.x-p[0],SP.player.y-p[1])<2.0);}
  function applyHair(hair){const old=SP.player.diversity,p=old?{...old,hair}:{ageYears:30,heightCm:SP.player.height*100,gender:'unspecified',presentation:'neutral',job:'civilian',body:'average',hair};if(!baselineLook)baselineLook={actor:SP.player,diversity:old?{...old}:null,baseHeight:SP.player.diversityBaseHeight,radius:SP.player.radius,height:SP.player.height};const r=SP.npcDiversity.adapt(SP.player,p,{preserveSet:true,hairOnly:true});if(r.ok)lastApplied=SP.player;return r;}
  function order(hair,o){
   if(!near(o))return '请到理发店剪发座椅旁办理。';if(!ready())return '真实发型图集还未加载，尚未扣款。';if(C.ff||G.activity||G.trans||SP.player.carry)return '请先结束当前动作。';
   const s=state(),gate=canOrder(s,hair,C.abs(),G.ps.money);if(!gate.ok)return gate.reason;
   const startedAt=C.abs(),entry={id:s.nextId++,hair,status:'pending',startedAt,finishAt:startedAt+MINUTES,completedAt:null,price:PRICE};s.orders.push(entry);G.ps.money-=PRICE;G.ps.stats.spent=(G.ps.stats.spent||0)+PRICE;
   for(const id of Object.values(SP.npcDiversity.HAIR))SP.ensureActor(id);
   G.payCard&&G.payCard({amount:PRICE,method:'微信支付',to:'槐东剪艺',what:'剪发：'+STYLES[hair]});G.hud&&G.hud();C.skipTo((C.min+MINUTES)%1440,1.4);W.logEvent(`理发单 ${entry.id} · ${STYLES[hair]} · ¥25`);return `理发师：坐稳，约 25 分钟后剪好「${STYLES[hair]}」。`;
  }
  function settle(){
   if(!G.ps||!ready())return;const s=state();if(!validate(s))return;
   if(observedPs!==G.ps){if(observedPs&&s.hair===null&&baselineLook&&baselineLook.actor===SP.player){if(baselineLook.diversity)SP.player.diversity={...baselineLook.diversity};else delete SP.player.diversity;if(baselineLook.baseHeight==null)delete SP.player.diversityBaseHeight;else SP.player.diversityBaseHeight=baselineLook.baseHeight;SP.player.radius=baselineLook.radius;SP.player.height=baselineLook.height;}observedPs=G.ps;lastApplied=null;}
   const p=pending(s);if(p&&C.abs()+1e-7>=p.finishAt){const result=applyHair(p.hair);if(!result.ok)return;p.status='completed';p.completedAt=Math.max(C.abs(),p.finishAt);s.hair=p.hair;W.logEvent('理发完成：'+STYLES[p.hair]);SP.toast&&SP.toast('剪好了：「'+STYLES[p.hair]+'」');}
   if(s.hair&&(lastApplied!==SP.player||SP.player.diversity?.hair!==s.hair))applyHair(s.hair);
  }
  function enter(o){if(W.interior||W.byId[o?.id]!==o||o.interact!=='community_barber_entrance')return '入口尚未接入当前街道。';const p=W.reachPt(o);if(Math.hypot(SP.player.x-p[0],SP.player.y-p[1])>2.4)return '请靠近理发店入口。';if(!openAt(C.abs()))return '理发店营业 09:00–20:00。';if(G.activity||G.trans||C.ff||SP.player.carry)return '请先完成当前动作。';state().returnSpawn=[SP.player.x,SP.player.y,SP.player.dir];G.go({to:ROOM,spawn:scene.spawn,door:o.id});return null;}
  function menu(o){const s=state();const opts=Object.entries(STYLES).map(([hair,label])=>{const gate=canOrder(s,hair,C.abs(),G.ps.money);return {id:'barber_'+hair,label:`${s.hair===hair?'✓ ':''}${label} · ¥25 / 25 分钟`,ok:ready()&&gate.ok,reason:!ready()?'人物发型图集未加载':gate.reason,fn:()=>order(hair,o)};});opts.push({id:'barber_status',label:'查询理发单与当前发型',ok:true,fn:()=>s.hair?'当前发型：'+STYLES[s.hair]:'尚未在本店理发。'});G.openMenu(Object.assign({},o,{_name:'槐东剪艺 · 发型任选'}),opts);if(G.menu)G.menu.o=o;const el=host.document&&host.document.getElementById('amenu');if(el&&SP.isTouch){if(!el._communityOrigin)el._communityOrigin={parent:el.parentNode,next:el.nextSibling,style:el.style.cssText};host.document.body.appendChild(el);Object.assign(el.style,{position:'fixed',zIndex:'1400',top:'50%',bottom:'auto',transform:'translate(-50%,-50%)',maxHeight:'calc(100dvh - 24px)',width:'min(420px,calc(100vw - 24px))',minWidth:'0',boxSizing:'border-box',overflowY:'auto',touchAction:'pan-y'});if(!el.dataset.communityScroll){el.dataset.communityScroll='1';for(const event of ['touchstart','touchmove','touchend'])el.addEventListener(event,e=>{if(el._communityOrigin)e.stopPropagation();},{passive:true});const close0=G.closeMenu;G.closeMenu=function(){const result=close0.apply(this,arguments),old=el._communityOrigin;if(old){old.parent.insertBefore(el,old.next&&old.next.parentNode===old.parent?old.next:null);el.style.cssText=old.style;delete el._communityOrigin;}return result;};}}}
  function open(){const o=W.byId[CHAIR];if(!near(o))return {ok:false,reason:'请到理发店剪发座椅旁办理。'};if(!openAt(C.abs()))return {ok:false,reason:'理发师已经下班。营业 09:00–20:00。'};if(C.ff||G.activity||G.trans||SP.player.carry)return {ok:false,reason:'请先结束当前动作。'};menu(o);touchSelection();return {ok:true};}
  function touchSelection(){const el=host.document&&host.document.getElementById('amenu');if(!el||!SP.isTouch||el._communitySelection)return;el._communitySelection=true;let contact=null;el.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'||!el._communityOrigin)return;const b=e.target.closest('button[data-i]');if(!b)return;contact={id:e.pointerId,x:e.clientX,y:e.clientY,button:b,moved:false};e.stopImmediatePropagation();},true);el.addEventListener('pointermove',e=>{if(contact&&contact.id===e.pointerId&&Math.hypot(e.clientX-contact.x,e.clientY-contact.y)>8)contact.moved=true;},true);el.addEventListener('pointerup',e=>{if(!contact||contact.id!==e.pointerId)return;const c=contact;contact=null;e.stopImmediatePropagation();if(!c.moved&&!c.button.disabled&&el.contains(c.button))G.pick(c.button.dataset.i==='x'?-1:+c.button.dataset.i);},true);el.addEventListener('pointercancel',()=>{contact=null;},true);}
  function syncStaff(){if(!W.interior||W.sceneId!==ROOM||!openAt(C.abs())||!ready()){if(staff)SP.actors.list=SP.actors.list.filter(a=>a!==staff);staff=null;return;}if(!staff){const a=new SP.Actor({id:'community_barber_staff',set:'office',x:3.15,y:3.65,speed:0,radius:.22,height:1.72,name:'阿棠理发师',staff:true});a.setDir('SE');const applied=SP.npcDiversity.adapt(a,{ageYears:32,heightCm:172,gender:'unspecified',presentation:'neutral',job:'barber',hair:'sidepart',body:'average'});if(applied.ok&&!W.blockedStatic(a.x,a.y,a.radius)){staff=a;SP.actors.list.push(a);}}}
  const use0=G.use,action0=G.actionFor,update0=G.update,busy0=G.busy;
  G.actionFor=function(o,kind){if(o&&kind==='use'){if(!W.interior&&o.interact==='community_barber_entrance')return {label:'进入槐东剪艺理发店',do:'game'};if(W.interior&&W.sceneId===ROOM){if(o.id===CHAIR)return {label:'选发型 / 查询理发单',do:'game'};if(o.interact==='community_barber_exit')return {label:'出门 · 回到理发店外',do:'game'};if(o.interact==='community_barber_catalog')return {label:'查看理发店营业与发型目录',do:'game'};}}return action0.apply(this,arguments);};
  G.use=function(o){if(o&&!W.interior&&o.interact==='community_barber_entrance')return enter(o);if(o&&W.interior&&W.sceneId===ROOM){if(o.id===CHAIR){if(!openAt(C.abs()))return '理发师已经下班。营业 09:00–20:00。';menu(o);touchSelection();return null;}if(o.interact==='community_barber_exit'){if(pending(state()))return '请等理发完成再离店。';const spawn=state().returnSpawn;if(!spawn)return '这个隔离房间的街道入口还未配置；可从开发工具返回已注册场景。';G.go({to:'street',spawn});return null;}if(o.interact==='community_barber_catalog')return '槐东剪艺 · 09:00–20:00 · 发型任选 ¥25 / 25 分钟。当前支持现有成人发型图集；不因性别限制发型。';}return use0.apply(this,arguments);};
  G.update=function(){const result=update0.apply(this,arguments);settle();syncStaff();return result;};G.busy=function(){return !!(G.ps&&pending(state()))||busy0.apply(this,arguments);};
  return SP.communityBarber={scene,state,validate,order,settle,enter,menu,open,close:()=>G.closeMenu(),ready,syncStaff,staff:()=>staff,roomId:ROOM,chairId:CHAIR,entranceContract:{interact:'community_barber_entrance',requires:'当前街道真实对象与正常reach；exit返回实际入店时玩家位置，无hardcoded街道坐标'},PRICE,MINUTES};
 }
 const api={ROOM,CHAIR,PRICE,MINUTES,STYLES,createState,pending,openAt,canOrder,validate,createScene,register};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.CommunityBarber=api;if(root.SP)register(root);
})(typeof window!=='undefined'?window:globalThis);

