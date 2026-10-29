/* Site88 local: phone takeout (街坊外卖) + online shopping (槐集优选) ledger. Pure: no DOM, no clock, no randomness.
 * Money in cents. Prices come from the one editable shared-rules price table (passed in as a lookup). */
(function(root){'use strict';
const MERCHANTS={
 stall:{name:'王姐早点摊',x:0.5,y:2.2,hours:'vendor',prep:5,rating:4.8,sold:'月售 300+',tags:['早点','老街口','现包现蒸']},
 store:{name:'邻里便利24h',x:37,y:3.9,hours:[0,1440],prep:4,rating:4.6,sold:'月售 500+',tags:['便利店','24小时','冷柜商品']},
 noodle:{name:'兰州牛肉面',x:47,y:4.5,hours:[390,1290],prep:12,rating:4.7,sold:'月售 400+',tags:['面食','手工拉面']},
 kuaican:{name:'好味快餐',x:50,y:4.5,hours:[630,1230],prep:10,rating:4.5,sold:'月售 600+',tags:['快餐','盒饭','两荤一素']}};
const MENU={
 stall_buns:{m:'stall',label:'鲜肉包两个',key:'stall_bun_pair',give:{bun:2},pack:true,cat:'早点'},
 stall_set:{m:'stall',label:'早点套餐（两个肉包+一盒豆奶）',key:'buy_breakfast',give:{bun:2,milk:1},pack:true,cat:'早点'},
 store_bento:{m:'store',label:'便利店便当',key:'bento',give:{bento:1},pack:false,cat:'便当'},
 store_milk:{m:'store',label:'盒装牛奶',key:'milk',give:{milk:1},pack:false,cat:'饮品'},
 store_bread:{m:'store',label:'面包',key:'bread',give:{bread:1},pack:false,cat:'面包'},
 store_drink:{m:'store',label:'冰红茶',key:'drink',give:{drink:1},pack:false,cat:'饮品'},
 noodle_beef:{m:'noodle',label:'牛肉面',key:'buy_noodle_shop',give:{takeout:1},pack:true,cat:'面食'},
 noodle_big:{m:'noodle',label:'大碗牛肉面加蛋',key:'buy_noodle_big',give:{takeout:1},pack:true,cat:'面食'},
 kc_cheap:{m:'kuaican',label:'一荤两素',key:'buy_kc_cheap',give:{takeout:1},pack:true,cat:'快餐'},
 kc_set:{m:'kuaican',label:'两荤一素',key:'buy_kuaican',give:{takeout:1},pack:true,cat:'快餐'},
 kc_zjf:{m:'kuaican',label:'隆江猪脚饭',key:'order_zjf',give:{takeout:1},pack:true,cat:'快餐'},
 kc_hmj:{m:'kuaican',label:'黄焖鸡米饭',key:'order_hmj',give:{takeout:1},pack:true,cat:'快餐'},
 kc_mlt:{m:'kuaican',label:'麻辣烫',key:'order_mlt',give:{takeout:1},pack:true,cat:'快餐'}};
const SHOP={
 noodles5:{label:'方便面五连包',key:'shop_noodles5',give:{noodles:5},cat:'粮油速食',spec:'红烧牛肉味 · 5袋'},
 egg10:{label:'新鲜鸡蛋十枚',key:'shop_egg10',give:{egg:10},cat:'生鲜',spec:'同城仓 · 10枚装'},
 fruit:{label:'当季水果一袋',key:'shop_fruit',give:{fruit:1},cat:'生鲜',spec:'约2斤 · 可送礼'},
 detergent:{label:'洗衣液 2kg',key:'shop_detergent',give:{detergent:1},cat:'日用百货',spec:'约20次洗衣用量'},
 candy:{label:'水果硬糖一包',key:'shop_candy',give:{candy:1},cat:'礼品',spec:'独立小包装'},
 tea:{label:'绿茶礼盒',key:'shop_tea',give:{tea:1},cat:'礼品',spec:'250g · 走亲访友'}};
const DEST={
 door_2f02:{name:'井槐里12号 2F-02 门口',x:1.5,y:12.1,areas:['room_2f02']},
 door_shared:{name:'栖和公寓 101室 门口',x:210.5,y:34.8,areas:['shared_home_flat','shared_home_lobby'],lease:true},
 locker:{name:'社区服务站 · 驿站快递柜',x:31.9,y:12,areas:['neighborhood_services'],locker:true}};
const ROAD=6,SPEED=150,DISPATCH=8,HANDOFF=4,RIDER=[420,1380],SHIP=60,ARRIVE=480,DELIVER=[540,1260],ORDER_CAP=40,ACTIVE_CAP=3,
 FOOD_STATUS=['preparing','riding','at_door','received','cancelled'],SHOP_STATUS=['paid','shipping','at_locker','received'],CASH=['stall','store','noodle','kuaican','shop'];
const copy=x=>JSON.parse(JSON.stringify(x)),time=x=>Number.isFinite(x)&&x>=0&&x<=1e12,int=(x,max=1e9)=>Number.isSafeInteger(x)&&x>=0&&x<=max,
 exact=(o,k)=>!!o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join('|')===k.slice().sort().join('|'),cents=v=>Math.round(Number(v)*100),
 mod=at=>((Math.floor(at)%1440)+1440)%1440,within=(at,[a,b])=>{const m=mod(at);return m>=a&&m<b;};
const ORDER_KEYS=['id','app','merchant','lines','goodsCents','packCents','feeCents','totalCents','dest','placedAt','readyAt','arriveAt','status','droppedAt','handedAt','attempts','courier'],VERSION=2,RIDER_CAP=1439;
function fresh(at){if(!time(at))throw Error('网购外卖账本起点无效');return{version:VERSION,startedAt:at,lastAt:at,nextId:1,orders:[],paidCents:0,refundedCents:0,merchantCents:Object.fromEntries(CASH.map(k=>[k,0])),riderCents:0};}
function route(m,d){const M=MERCHANTS[m],D=DEST[d];return[[M.x,M.y],[M.x,ROAD],[D.x,ROAD],[D.x,D.y]];}
function length(p){let l=0;for(let i=1;i<p.length;i++)l+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);return l;}
function ride(m,d){return Math.max(1,Math.ceil(length(route(m,d))/SPEED))+HANDOFF;}
function times(app,merchant,dest,placedAt){if(app==='food'){const r=placedAt+Math.max(MERCHANTS[merchant].prep,DISPATCH);return{readyAt:r,arriveAt:r+ride(merchant,dest)};}return{readyAt:placedAt+SHIP,arriveAt:placedAt+ARRIVE};}
function open(merchant,at,ctx={}){const M=MERCHANTS[merchant];if(!M)return false;return M.hours==='vendor'?!!ctx.vendorOpen:within(at,M.hours);}
function riderOn(at){return within(at,RIDER);}
function distance(merchant,dest){return Math.round(length(route(merchant,dest)));}
function eta(merchant,dest){const t=times('food',merchant,dest,0);return t.arriveAt;}
function catalog(app){return app==='food'?MENU:SHOP;}
function active(s,app){return s.orders.filter(o=>o.app===app&&!['received','cancelled'].includes(o.status)).length;}
/* quote: everything is recomputed from the catalogue and the live price table; nothing from the caller is trusted except sku ids and counts */
function quote(s,input,price,at,ctx={}){const fail=reason=>({ok:false,reason});if(!s||!time(at)||!input||typeof input!=='object')return fail('订单无效');const app=input.app;if(!['food','shop'].includes(app))return fail('订单无效');
 const cat=catalog(app),raw=Array.isArray(input.lines)?input.lines:[];if(raw.length<1||raw.length>8)return fail('购物车是空的');const seen=new Set(),lines=[];let merchant=app==='shop'?'shop':null;
 for(const l of raw){const it=cat[l?.sku];if(!it||seen.has(l.sku)||!int(l.n,10)||l.n<1)return fail('购物车里有无效商品');seen.add(l.sku);if(app==='food'){if(merchant&&merchant!==it.m)return fail('外卖一次只能点一家店');merchant=it.m;}const u=cents(price(it.key));if(!int(u,100000)||u<1)return fail('价格表缺少该商品');lines.push({sku:l.sku,n:l.n,unitCents:u});}
 const dest=input.dest,D=DEST[dest];if(!D)return fail('请选择收货地址');if(D.lease&&!ctx.sharedLease)return fail('没有栖和公寓的租约，不能送到那里');if(app==='food'&&D.locker)return fail('外卖不送快递柜');
 if(active(s,app)>=ACTIVE_CAP)return fail('还有进行中的订单，先等它们送到');
 const goods=lines.reduce((t,l)=>t+l.n*l.unitCents,0);let pack=0,fee=0;
 if(app==='food'){if(!open(merchant,at,ctx))return fail(MERCHANTS[merchant].name+'现在没营业');if(!riderOn(at))return fail('骑手 07:00–23:00 接单，现在没有骑手');if(goods<cents(price('to_min_order')))return fail(`还差¥${((cents(price('to_min_order'))-goods)/100).toFixed(2)}起送`);if(lines.some(l=>cat[l.sku].pack))pack=cents(price('to_pack_fee'));fee=cents(price('to_delivery_fee'));}
 else fee=goods>=cents(price('shop_free_ship'))?0:cents(price('shop_ship_fee'));
 if(![pack,fee].every(v=>int(v,10000)))return fail('价格表缺少配送费');const t=times(app,merchant,dest,at);
 /* Site88: the visible street rider (scene actor 'rider') takes the order when free; his ETA is his real route. Otherwise the modelled platform courier. */
 const courier=app==='food'&&Number.isFinite(ctx.riderEta)&&ctx.riderEta>0?'rider':'model';if(courier==='rider')t.arriveAt=Math.max(t.readyAt+1,Math.min(at+ctx.riderEta,at+RIDER_CAP));
 return{ok:true,app,merchant,lines,goodsCents:goods,packCents:pack,feeCents:fee,totalCents:goods+pack+fee,dest,placedAt:at,courier,...t};}
function place(s,q,walletCents){if(!q?.ok)return{ok:false,reason:'报价无效'};if(!int(walletCents,1e12)||walletCents<q.totalCents)return{ok:false,reason:`余额不足（需¥${(q.totalCents/100).toFixed(2)}）`};if(active(s,q.app)>=ACTIVE_CAP)return{ok:false,reason:'还有进行中的订单'};if(q.placedAt<s.lastAt)return{ok:false,reason:'报价已过期'};
 const o={id:s.nextId++,app:q.app,merchant:q.merchant,lines:copy(q.lines),goodsCents:q.goodsCents,packCents:q.packCents,feeCents:q.feeCents,totalCents:q.totalCents,dest:q.dest,placedAt:q.placedAt,readyAt:q.readyAt,arriveAt:q.arriveAt,status:q.app==='food'?'preparing':'paid',droppedAt:null,handedAt:null,attempts:0,courier:q.courier==='rider'&&q.app==='food'?'rider':'model'};
 s.orders.push(o);s.paidCents+=o.totalCents;if(o.app==='food'){s.merchantCents[o.merchant]+=o.goodsCents+o.packCents;s.riderCents+=o.feeCents;}else s.merchantCents.shop+=o.totalCents;s.lastAt=Math.max(s.lastAt,q.placedAt);prune(s);return{ok:true,order:o};}
function prune(s){while(s.orders.length>ORDER_CAP){const i=s.orders.findIndex(o=>['received','cancelled'].includes(o.status));if(i<0)break;s.orders.splice(i,1);}}
function cancel(s,id,at){const o=s.orders.find(o=>o.id===id);if(!o||o.app!=='food'||o.status!=='preparing'||at>=o.readyAt)return{ok:false,reason:'商家已出餐或骑手已取餐，不能取消'};o.status='cancelled';o.handedAt=at;s.refundedCents+=o.totalCents;s.merchantCents[o.merchant]-=o.goodsCents+o.packCents;s.riderCents-=o.feeCents;s.lastAt=Math.max(s.lastAt,at);return{ok:true,order:o};}
function goods(o){const out={},cat=catalog(o.app);for(const l of o.lines)for(const [k,v]of Object.entries(cat[l.sku].give))out[k]=(out[k]||0)+v*l.n;return out;}
/* time advance: ctx.area = the player's real current place. Returns hand-overs the runtime must commit in the same tick. */
function advance(s,at,ctx={}){const ev=[];if(!time(at)||at<s.lastAt)return ev;const held=new Set(ctx.held||[]);for(const o of s.orders){const here=DEST[o.dest].areas.includes(ctx.area);if(held.has(o.id)&&o.courier==='rider'&&['preparing','riding'].includes(o.status)){if(o.arriveAt<at)o.arriveAt=Math.min(Math.max(at,o.readyAt+1),o.placedAt+RIDER_CAP);continue;}
 if(o.app==='food'){if(o.status==='preparing'&&at>=o.readyAt){o.status='riding';ev.push({kind:'riding',order:o});}
  if(o.status==='riding'&&at>=o.arriveAt){if(here){o.status='received';o.handedAt=at;ev.push({kind:'received',order:o,wear:0});}else{o.status='at_door';o.droppedAt=o.arriveAt;ev.push({kind:'at_door',order:o});}}
  else if(o.status==='at_door'&&here){o.status='received';o.handedAt=at;ev.push({kind:'received',order:o,doorMinutes:at-o.droppedAt});}}
 else{if(o.status==='paid'&&at>=o.readyAt){o.status='shipping';ev.push({kind:'shipping',order:o});}
  if(o.status==='shipping'&&at>=o.arriveAt){if(DEST[o.dest].locker){o.status='at_locker';o.droppedAt=o.arriveAt;ev.push({kind:'at_locker',order:o});}
   else if(within(at,DELIVER)){if(here){o.status='received';o.handedAt=at;ev.push({kind:'received',order:o,doorMinutes:0});}else{o.status='at_locker';o.droppedAt=at;o.attempts=1;ev.push({kind:'redirected',order:o});}}}}}
 s.lastAt=at;return ev;}
/* visible rider hand-overs (runtime drives the actor; the ledger only records what really happened) */
function riderOrder(s,id){const o=s.orders.find(o=>o.id===id);return o&&o.app==='food'&&o.courier==='rider'?o:null;}
function riderEta(s,id,t){const o=riderOrder(s,id);if(!o||!['preparing','riding'].includes(o.status)||!time(t))return false;o.arriveAt=Math.max(o.readyAt+1,s.lastAt,Math.min(t,o.placedAt+RIDER_CAP));return true;}
function riderPickup(s,id,at){const o=riderOrder(s,id);if(!o||o.status!=='preparing'||at<o.readyAt||at<s.lastAt)return{ok:false};o.status='riding';o.arriveAt=Math.max(o.arriveAt,at);s.lastAt=at;return{ok:true,order:o};}
function riderArrive(s,id,at,present){const o=riderOrder(s,id);if(!o||o.status!=='riding'||at<s.lastAt||at<o.readyAt)return{ok:false};o.arriveAt=at;if(present){o.status='received';o.handedAt=at;}else{o.status='at_door';o.droppedAt=at;}s.lastAt=at;return{ok:true,order:o};}
function upgrade(s){if(s?.version!==1||!Array.isArray(s.orders))return s;const n=copy(s);n.version=VERSION;for(const o of n.orders)if(o&&typeof o==='object'&&!Array.isArray(o))o.courier='model';return n;}
function pickup(s,id,at){const o=s.orders.find(o=>o.id===id);if(!o||o.app!=='shop'||o.status!=='at_locker'||at<o.droppedAt)return{ok:false,reason:'快递柜里没有这个包裹'};o.status='received';o.handedAt=at;s.lastAt=Math.max(s.lastAt,at);return{ok:true,order:o};}
function riderAt(o,at){if(o.app!=='food')return null;const p=route(o.merchant,o.dest);if(at<=o.readyAt)return{x:p[0][0],y:p[0][1],f:0};const span=Math.max(1,o.arriveAt-HANDOFF-o.readyAt),f=Math.max(0,Math.min(1,(at-o.readyAt)/span));let d=f*length(p);for(let i=1;i<p.length;i++){const l=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);if(d<=l||i===p.length-1){const k=l?Math.min(1,d/l):1;return{x:p[i-1][0]+(p[i][0]-p[i-1][0])*k,y:p[i-1][1]+(p[i][1]-p[i-1][1])*k,f};}d-=l;}return{x:p[3][0],y:p[3][1],f:1};}
function prepare(s,at){s=upgrade(s);
 if(!time(at)||!exact(s,['version','startedAt','lastAt','nextId','orders','paidCents','refundedCents','merchantCents','riderCents'])||s.version!==VERSION||!time(s.startedAt)||!time(s.lastAt)||s.startedAt>s.lastAt||s.lastAt>at||!int(s.nextId)||s.nextId<1)return null;
 if(!int(s.paidCents,1e12)||!int(s.refundedCents,1e12)||s.refundedCents>s.paidCents||!exact(s.merchantCents,CASH)||!CASH.every(k=>int(s.merchantCents[k],1e12))||!int(s.riderCents,1e12))return null;
 if(s.paidCents-s.refundedCents!==CASH.reduce((t,k)=>t+s.merchantCents[k],0)+s.riderCents)return null;
 if(!Array.isArray(s.orders)||s.orders.length>ORDER_CAP)return null;let lastId=0,lastAt=0,paid=0,refunded=0;const act={food:0,shop:0},tOk=t=>time(t)&&t>=s.startedAt&&t<=s.lastAt;
 for(const o of s.orders){if(!exact(o,ORDER_KEYS)||!int(o.id)||o.id<=lastId||o.id>=s.nextId||!['food','shop'].includes(o.app)||!tOk(o.placedAt)||o.placedAt<lastAt)return null;lastId=o.id;lastAt=o.placedAt;
  const cat=catalog(o.app),D=DEST[o.dest];if(!D||o.app==='food'&&D.locker)return null;if(o.app==='food'?!MERCHANTS[o.merchant]:o.merchant!=='shop')return null;
  if(!Array.isArray(o.lines)||o.lines.length<1||o.lines.length>8)return null;const seen=new Set();let g=0;for(const l of o.lines){if(!exact(l,['sku','n','unitCents'])||!cat[l.sku]||seen.has(l.sku)||!int(l.n,10)||l.n<1||!int(l.unitCents,100000)||l.unitCents<1||o.app==='food'&&cat[l.sku].m!==o.merchant)return null;seen.add(l.sku);g+=l.n*l.unitCents;}
  if(o.goodsCents!==g||!int(o.packCents,10000)||!int(o.feeCents,10000)||o.app==='shop'&&o.packCents!==0||o.totalCents!==g+o.packCents+o.feeCents)return null;
  if(!['model','rider'].includes(o.courier)||o.courier==='rider'&&o.app!=='food')return null;const rider=o.courier==='rider';
  const t=times(o.app,o.merchant,o.dest,o.placedAt);if(o.readyAt!==t.readyAt||(rider?!(time(o.arriveAt)&&o.arriveAt>o.readyAt&&o.arriveAt<=o.placedAt+RIDER_CAP):o.arriveAt!==t.arriveAt)||!int(o.attempts,1))return null;paid+=o.totalCents;
  const st=o.status,dOk=o.droppedAt===null||tOk(o.droppedAt),hOk=o.handedAt===null||tOk(o.handedAt);if(!dOk||!hOk)return null;
  if(o.app==='food'){if(!FOOD_STATUS.includes(st)||o.attempts!==0)return null;
   if(st==='preparing'&&!((rider?o.arriveAt>=s.lastAt:s.lastAt<o.readyAt)&&o.droppedAt===null&&o.handedAt===null))return null;
   if(st==='riding'&&!(s.lastAt>=o.readyAt&&(rider?s.lastAt<=o.arriveAt:s.lastAt<o.arriveAt)&&o.droppedAt===null&&o.handedAt===null))return null;
   if(st==='at_door'&&!(o.droppedAt===o.arriveAt&&o.handedAt===null))return null;
   if(st==='received'&&!(o.handedAt!==null&&o.handedAt>=o.arriveAt&&(o.droppedAt===null||o.droppedAt===o.arriveAt&&o.handedAt>=o.droppedAt)))return null;
   if(st==='cancelled'){if(!(o.handedAt!==null&&o.handedAt>=o.placedAt&&o.handedAt<o.readyAt&&o.droppedAt===null))return null;refunded+=o.totalCents;}}
  else{if(!SHOP_STATUS.includes(st))return null;
   if(st==='paid'&&!(s.lastAt<o.readyAt&&o.droppedAt===null&&o.handedAt===null&&o.attempts===0))return null;
   if(st==='shipping'&&!(s.lastAt>=o.readyAt&&(D.locker?s.lastAt<o.arriveAt:true)&&o.droppedAt===null&&o.handedAt===null&&o.attempts===0))return null;
   if(st==='at_locker'&&!(o.droppedAt!==null&&o.droppedAt>=o.arriveAt&&o.handedAt===null&&(D.locker?o.attempts===0&&o.droppedAt===o.arriveAt:o.attempts===1)))return null;
   if(st==='received'&&!(o.handedAt!==null&&o.handedAt>=o.arriveAt&&(o.droppedAt===null?!D.locker&&o.attempts===0:o.handedAt>=o.droppedAt)))return null;}
  if(!['received','cancelled'].includes(st))act[o.app]++;}
 if(act.food>ACTIVE_CAP||act.shop>ACTIVE_CAP||paid>s.paidCents||refunded>s.refundedCents)return null;
 return copy(s);}
root.CommerceModel={VERSION,RIDER_CAP,upgrade,riderEta,riderPickup,riderArrive,MERCHANTS,MENU,SHOP,DEST,ROAD,SPEED,DISPATCH,HANDOFF,RIDER,SHIP,ARRIVE,DELIVER,ORDER_CAP,ACTIVE_CAP,fresh,route,ride,times,open,riderOn,distance,eta,catalog,active,quote,place,cancel,goods,advance,pickup,riderAt,prepare};
})(typeof window!=='undefined'?window:globalThis);
