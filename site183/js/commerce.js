/* Site88 local runtime for the phone takeout / online-shopping ledger (ps.commerce). One wallet (ps.money), one price table
 * (shared-rules prices), goods only on a real hand-over, food into the household ledger. Food orders are ridden by the visible
 * street rider when he is free (commerce_rider.js drives him and reports pickup / live ETA / hand-over here); otherwise the
 * modelled platform courier (clearly labelled fallback, see docs/phone-commerce-site88-contract.md). */
(function(root){'use strict';const SP=root.SP,G=SP?.game,W=SP?.world,C=SP?.clock,M=root.CommerceModel;if(!G||!C||!M||SP.commerce)return;
const R=G.rules,copy=x=>JSON.parse(JSON.stringify(x)),now=()=>C.abs(),LOCKER='svc_parcel_locker',QUOTE_TTL=5;
let working=false,lastPs=null,serial=0;const quotes=new Map();
const ps=()=>G.ps;
const PRICE=(()=>{const out={};for(const [g,t]of Object.entries(R?.data?.prices||{}))if(g[0]!=='_'&&t&&typeof t==='object')for(const [k,v]of Object.entries(t))if(Number.isFinite(v))out[k]=v;return out;})();
const price=k=>Object.prototype.hasOwnProperty.call(PRICE,k)?PRICE[k]:NaN;
function where(){return SP.place?.where?.()||null;}
function vendorOpen(){try{return !!G.flags?.()?.vendor_open;}catch{return false;}}
function sharedLease(){try{return !!SP.sharedHome?.status?.('player',now())?.lease;}catch{return false;}}
function ctx(){let held=[];try{held=SP.commerceRider?.held?.()||[];}catch{}return{vendorOpen:vendorOpen(),sharedLease:sharedLease(),area:where(),held};}
/* quote twice for food: the first pass names merchant/destination, the second asks the visible rider for his real-route ETA */
function mquote(s,inp,at){const c=ctx(),q=M.quote(s,inp,price,at,c);if(!q.ok||q.app!=='food')return q;let eta=null;try{eta=SP.commerceRider?.estimate?.(q.merchant,q.dest,q.readyAt-at,at);}catch(e){root.console?.error?.(e);}return Number.isFinite(eta)?M.quote(s,inp,price,at,{...c,riderEta:eta}):q;}
function riderNote(o){return o.courier==='rider'?'街景里的黄衣骑手':'平台骑手';}
function riderPickup(id,at=now()){const s=peek();if(!s||working)return{ok:false};const r=M.riderPickup(s,id,at);if(r.ok)note(`街坊外卖：骑手（街景可见）已在${label(r.order)}取餐，正在送往${M.DEST[r.order.dest].name}。`);return r;}
function riderEta(id,t){const s=peek();return !!s&&!working&&M.riderEta(s,id,t);}
function riderArrive(id,at,here,how){const s=peek();if(!s||working)return{ok:false};const r=M.riderArrive(s,id,at,here);if(!r.ok)return r;const o=r.order;
 if(here){give(o,0);note(how==='face'?`骑手当面把${names(o)}交给了你。`:`骑手送上楼，把${names(o)}当面交给了你。`);}else note(`街坊外卖：家里没人，骑手把${names(o)}放在了${M.DEST[o.dest].name}，回家就能拿到（放久了会凉、会坏）。`);return r;}
function peek(){return ps()?.commerce||null;}
function state(){if(!ps())return null;if(!ps().commerce)ps().commerce=M.fresh(now());if(lastPs!==ps()){lastPs=ps();quotes.clear();}return ps().commerce;}
function note(msg){if(msg){try{W?.logEvent?.(msg);}catch{}try{SP.toast?.(msg);}catch{}}return msg;}
function label(o){return o.app==='food'?M.MERCHANTS[o.merchant].name:'槐集优选';}
function give(o,doorMinutes){const H=root.HouseholdModel,got=M.goods(o);for(const [item,n]of Object.entries(got)){const life=H?.LIFE?.[item]?.[0],wear=life&&doorMinutes>0?doorMinutes/life:0;if(SP.household?.receive){const k=SP.household.receive('player',item,n,wear);if(k<n)ps().items[item]=(Math.floor(Number(ps().items[item])||0))+(n-k);}else ps().items[item]=(Math.floor(Number(ps().items[item])||0))+n;}return got;}
function names(o){const cat=M.catalog(o.app);return o.lines.map(l=>cat[l.sku].label+(l.n>1?'×'+l.n:'')).join('、');}
function tick(){if(working||!ps()?.commerce)return;const s=ps().commerce,at=now();if(at<s.lastAt)return;working=true;try{const ev=M.advance(s,at,ctx());for(const e of ev){const o=e.order;
  if(e.kind==='riding')note(`街坊外卖：平台骑手（后台模拟）已在${label(o)}取餐，正在送往${M.DEST[o.dest].name}。`);
  else if(e.kind==='at_door')note(`街坊外卖：骑手把${names(o)}放在了${M.DEST[o.dest].name}，回家就能拿到（放久了会凉、会坏）。`);
  else if(e.kind==='at_locker')note(`槐集优选：包裹已到${M.DEST.locker.name}，请本人到柜前取件。`);
  else if(e.kind==='redirected')note('槐集优选：快递员上门时家里没人，包裹改投社区服务站驿站快递柜，请本人去取。');
  else if(e.kind==='shipping')note('槐集优选：商家已发货，同城仓配送中。');
  else if(e.kind==='received'){give(o,e.doorMinutes||0);note(o.app==='food'?`拿到外卖：${names(o)}。${e.doorMinutes>30?'在门口放了一阵，有点凉了。':''}`:`签收了网购包裹：${names(o)}。`);}}}finally{working=false;}}
function input(app,cart,dest){return{app,lines:Object.entries(cart||{}).filter(([,n])=>n>0).map(([sku,n])=>({sku,n})),dest};}
function quote(app,cart,dest){if(!ps())return{ok:false,reason:'没有进行中的存档'};const s=peek()||M.fresh(now()),q=mquote(s,input(app,cart,dest),now());if(!q.ok)return q;for(const [k,v]of quotes)if(v.q.app===app)quotes.delete(k);const token='cq'+(++serial)+':'+Math.floor(now());quotes.set(token,{owner:ps(),q,input:input(app,cart,dest)});return{...copy(q),token};}
function confirm(token){const p=quotes.get(token);quotes.delete(token);if(!p)return{ok:false,reason:'这张订单已经提交过或已失效，请重新下单'};if(p.owner!==ps())return{ok:false,reason:'存档已切换，订单作废'};const at=now();if(at<p.q.placedAt||at-p.q.placedAt>QUOTE_TTL)return{ok:false,reason:'报价已过期，请重新确认'};if(working)return{ok:false,reason:'订单正在处理中'};
 const s=state(),q=mquote(s,p.input,at);if(!q.ok)return q;if(q.totalCents!==p.q.totalCents)return{ok:false,reason:'价格或配送费有变化，请重新确认'};
 const wallet=Math.round((Number(ps().money)||0)*100),r=M.place(s,q,wallet);if(!r.ok)return r;const amt=q.totalCents/100;
 ps().money=Math.round((wallet-q.totalCents))/100;if(ps().stats)ps().stats.spent=Math.round(((ps().stats.spent||0)+amt)*100)/100;
 R._note?.(ps(),{type:'spend',amount:amt,why:(q.app==='food'?'街坊外卖 · ':'槐集优选 · ')+label(r.order)},at);
 try{G.payCard?.({amount:amt,method:R.payLabel?.(ps())||'微信支付',to:q.app==='food'?'街坊外卖 · '+label(r.order):'槐集优选',what:names(r.order)});}catch{}
 if(r.order.courier==='rider'){try{SP.commerceRider?.assign?.(r.order.id);}catch(e){root.console?.error?.(e);}}
 note(q.app==='food'?`下单成功：${names(r.order)}，${riderNote(r.order)}接单，预计 ${hm(r.order.arriveAt)} 送达${M.DEST[r.order.dest].name}。`:`下单成功：${names(r.order)}，预计 ${hm(r.order.arriveAt)} 到${r.order.dest==='locker'?'驿站快递柜':'货（09:00–21:00 上门，需本人签收）'}。`);return{ok:true,order:copy(r.order)};}
function cancel(id){if(!ps()?.commerce||working)return{ok:false,reason:'没有这个订单'};const s=ps().commerce,r=M.cancel(s,id,now());if(!r.ok)return r;const amt=r.order.totalCents/100;ps().money=Math.round(Math.round(ps().money*100)+r.order.totalCents)/100;if(ps().stats)ps().stats.spent=Math.round(((ps().stats.spent||0)-amt)*100)/100;R._note?.(ps(),{type:'refund',amount:amt,why:'街坊外卖退款 · '+label(r.order)},now());note(`已取消订单，¥${amt.toFixed(2)} 原路退回。`);return{ok:true};}
function atLocker(){return(W?.sceneId==='neighborhood_services'||where()==='neighborhood_services');}
function lockerOrders(){return(peek()?.orders||[]).filter(o=>o.app==='shop'&&o.status==='at_locker');}
function pickupAll(){if(!atLocker())return'要本人到社区服务站驿站快递柜取件。';const list=lockerOrders();if(!list.length)return'快递柜里没有你的网购包裹。';const s=state(),at=now(),got=[];for(const o of list){const r=M.pickup(s,o.id,at);if(r.ok){give(o,0);got.push(names(o));}}return note('从快递柜取出包裹：'+got.join('；')+'。');}
function hm(at){const m=((Math.floor(at)%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
const open0=G.openMenu;if(open0)G.openMenu=function(o,opts){try{if(Array.isArray(opts)&&o&&!o.actor&&o.id===LOCKER&&atLocker()&&lockerOrders().length&&!opts.some(p=>p.id==='commerce_pickup'))opts=opts.concat([{id:'commerce_pickup',ok:true,label:`取出网购包裹（${lockerOrders().length}件）`,fn:pickupAll}]);}catch(e){root.console?.error?.(e);}return open0.call(this,o,opts);};
if(G.update){const up=G.update;G.update=function(dt){const r=up.apply(this,arguments);try{tick();}catch(e){root.console?.error?.(e);}return r;};}
function fridgeListing(){const H=root.HouseholdModel,v=SP.household?.view?.(),mine=v?.orders?.find(o=>o.buyer==='player')||null,ok=H&&Math.round(price('shop_fridge')*100)===H.PRICE;return{priceOk:!!ok,price:price('shop_fridge'),order:mine?copy(mine):null,leased:sharedLease(),stockLeft:H&&v?H.STOCK-v.orders.length:0};}
function orderFridge(channel){const f=fridgeListing();if(!f.priceOk)return'价格表与家电回收站报价不一致，暂停下单。';return SP.household?.playerOrder?.(channel)||'家电回收站暂不可用。';}
function prepare(s,at=now()){return M.prepare(s,at);}
function view(){const s=peek();return s?copy(s):null;}
function restore(s){const n=prepare(s,now());if(!n)return{ok:false,reason:'外卖/网购订单记录无效'};ps().commerce=n;resetRuntime();return{ok:true};}
function resetRuntime(){quotes.clear();working=false;lastPs=ps();try{SP.commerceRider?.reset?.();}catch{}}
SP.commerce={riderPickup,riderEta,riderArrive,price,quote,confirm,cancel,pickupAll,lockerOrders,view,peek,prepare,restore,resetRuntime,fresh:at=>M.fresh(at),canSave:()=>!working,tick,ctx,hm,names,fridgeListing,orderFridge,riderAt:(o,at=now())=>M.riderAt(o,at)};
})(typeof window!=='undefined'?window:globalThis);
