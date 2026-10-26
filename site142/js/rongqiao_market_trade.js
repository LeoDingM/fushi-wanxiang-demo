/* P3b 榕桥菜市场 runtime: vendors (摊主) and market regulars (街坊买菜客) walk real routes in the street's own coordinates;
 * the one trade ledger (ps.wetMarket, WetMarketModel) holds stock, cash, wallets and receipts. Near the market (chunk loaded,
 * player on the street) everyone is a visible actor that collides and waits; far away the same people advance along the same
 * authored routes at the same speed (no teleport, no reset). The player buys through SP.wetMarket.quote -> confirm: money from
 * ps.money (the single wallet), goods into ps.items and the household food ledger (with the batch's age as wear). */
(function(root){'use strict';const SP=root.SP,G=SP?.game,W=SP?.world,C=SP?.clock,M=root.WetMarketModel;if(!G||!W||!C||!M||SP.wetMarket)return;
const copy=x=>JSON.parse(JSON.stringify(x)),now=()=>C.abs(),R=G.rules,HM=root.HouseholdModel;
const PRICE=(()=>{const out={};for(const [g,t]of Object.entries(R?.data?.prices||{}))if(g[0]!=='_'&&t&&typeof t==='object')for(const [k,v]of Object.entries(t))if(Number.isFinite(v))out[k]=v;return out;})();
const price=k=>Object.prototype.hasOwnProperty.call(PRICE,k)?PRICE[k]:NaN,priceOf=sku=>price(M.priceKey(sku));
const LINES={hello:['靓仔/靓女，睇下要咩？','今日新鲜到货，随便睇。','要几多？我帮你称。'],thanks:['多谢晒，慢慢行！','收到，多谢帮衬！','下次再来啊！'],sold:['今日卖晒啦，听日早啲嚟。']};
let owner=null,working=false,lastAt=null,actors=new Map(),tokens=new Map(),lastShown='',lastReset=-1e9,elapsed=0,notes=[],blocked=new Map();
const ps=()=>G.ps;
function state(){if(!ps())return null;if(!ps().wetMarket)ps().wetMarket=M.fresh(now(),price);if(owner!==ps()){owner=ps();resetRuntime(true);}return ps().wetMarket;}
/* near = the market's people are visible actors: market chunk loaded, player on the street within ~70 m of the hall (beyond that they advance off-screen on the same routes) */
const HALL={1:['rq_market',62,112],2:['rq_market2',170,-48],3:['rq_market3',-82.5,171.5],4:['rq_market_nb',61.5,-190]};   /* 南埠菜市场 */   /* E4e: 万家菜市场综合楼 */   /* E4b: 榕桥第二菜市场 people are near around their own hall */
function nearOf(mk){const h=HALL[mk]||HALL[1];return SP.place?.where?.()==='street'&&!W.interior&&!SP.metroActive&&!SP.cbd?.active&&!!(W.chunksIn&&W.chunksIn[h[0]])&&!!SP.player&&Math.hypot(SP.player.x-h[1],SP.player.y-h[2])<70;}
function near(){return nearOf(1)||nearOf(2)||nearOf(3)||nearOf(4);}
const mkOfId=id=>/^rqv_m2_|^rqs2_/.test(id)?2:/^rqv_m3_|^rqs3_/.test(id)?3:/^rqv_m4_|^rqs4_/.test(id)?4:1;
/* ---------------------------------------------------------------- walking (shared by vendors and regulars) */
const vendorPath=new Map(M.STALLS.map(t=>[t.id,M.vendorPath(t)])),laneStart=new Map(M.STALLS.map(t=>[t.id,M.geo(t).approach.length]));
function dirOf(dx,dy){return SP.dirFromWorld?.(dx,dy)||(Math.abs(dx)>Math.abs(dy)?(dx>0?'E':'W'):(dy>0?'N':'S'));}
/* step one walker (record r with x,y,i) along pts toward pts[r.i] (forward) using a metre budget; vendorOnly(i) marks segments
 * through a stall flap / gap that only the vendor uses (no static collision there). Returns true when the last point is reached. */
function walk(r,pts,budget,id,vendorOnly,step){const a=actors.get(id),live=!!(a&&nearOf(mkOfId(id))&&step<5);let guard=0;
 while(budget>1e-6&&r.i<pts.length&&guard++<60){const q=pts[r.i],dx=q[0]-r.x,dy=q[1]-r.y,l=Math.hypot(dx,dy);if(l<0.04){r.x=q[0];r.y=q[1];r.i++;continue;}
  const k=Math.min(l,budget),mx=dx/l*k,my=dy/l*k;
  if(live){const free=vendorOnly&&vendorOnly(r.i);let moved=0;const ox=a.x,oy=a.y;
   a.posed=!!free;if(free){a.x+=mx;a.y+=my;moved=k;}else{moved=SP.actors.move(a,mx,my);if(moved<k*0.3){const b=(blocked.get(id)||0)+step;blocked.set(id,b);
     /* a market crowd never locks: after a while a walker slips past other market people (never through walls or the player) */
     if(b>2.5&&!W.blockedStatic(a.x+mx,a.y+my,a.radius)&&!(SP.player&&Math.hypot(a.x+mx-SP.player.x,a.y+my-SP.player.y)<a.radius+0.22)){a.x+=mx;a.y+=my;moved=k;}}else blocked.delete(id);}
   r.x=a.x;r.y=a.y;if(moved>1e-3){a.dir=dirOf(a.x-ox,a.y-oy);}a.update?.(step*0.98,moved>1e-3,a.dir,moved);a.moving=moved>1e-3;budget=moved>=k-1e-6?budget-k:0;if(moved<k-1e-6)break;}
  else{r.x+=mx;r.y+=my;budget-=k;}}
 return r.i>=pts.length;}
/* ---------------------------------------------------------------- vendors */
function vendorStep(s,t,at,step){const st=s.stalls[t.id],v=st.vendor,d=M.dayOf(at),m=M.mod(at),wm=M.walkMinutes(t),pts=vendorPath.get(t.id),ls=laneStart.get(t.id);
 if(v.phase==='off'){if(v.day!==d&&m>=t.hours[0]-wm&&m<t.hours[1]-60){Object.assign(v,{phase:'walk_in',since:at,i:1,x:pts[0][0],y:pts[0][1],day:d});}return;}
 if(v.phase==='walk_in'){if(walk(v,pts,step*M.SPEED,'rqv_'+t.id,i=>i>=ls,step)){v.phase='setup';v.since=at;const r=M.restock(s,t.id,at);if(r&&(r.bought||r.wasted))note(`${t.name}从榕桥冷链车收货${r.bought}份（付¥${(r.cents/100).toFixed(2)}）${r.wasted?`，过期${r.wasted}份倒去垃圾房`:''}`,true);}return;}
 if(v.phase==='setup'){if(at-v.since>=M.SETUP){v.phase='selling';v.since=at;}return;}
 if(v.phase==='selling'){const out=M.stallStock(s,t.id)===0&&m>=600;if(m>=t.hours[1]||out||m<t.hours[0]-wm-1){v.phase='pack';v.since=at;if(out)say('rqv_'+t.id,LINES.sold[0]);}return;}
 if(v.phase==='pack'){if(at-v.since>=M.PACK){v.phase='walk_out';v.since=at;v.i=1;}return;}
 if(v.phase==='walk_out'){const back=pts.slice().reverse(),n=pts.length;if(walk(v,back,step*M.SPEED,'rqv_'+t.id,i=>n-i>=ls,step)){const e=M.edgeOf(t);Object.assign(v,{phase:'off',since:at,i:0,x:e[0],y:e[1]});}}}
/* ---------------------------------------------------------------- regulars */
function activeShoppers(s,mk=1){return M.SHOPPERS.filter(p=>(p.market||1)===mk&&s.shoppers[p.id].visit).length;}
function shopperStep(s,p,at,step){const q=s.shoppers[p.id],d=M.dayOf(at),m=M.mod(at);if(m>=300)M.income(s,p.id,at);
 if(!q.visit){if(q.visitDay>=d)return;const pl=M.plan(p.id,d);if(pl.skip){q.visitDay=d;return;}if(m>=pl.arrive-70&&m<M.CLOSE-150){if(activeShoppers(s,p.market||1)>=M.ACTIVE_SHOPPERS)return;const e=M.edgeOf(p);q.visitDay=d;q.visit={day:d,phase:'walk',stop:0,i:1,x:e[0],y:e[1],until:null};}else if(m>=M.CLOSE-150)q.visitDay=d;return;}
 const v=q.visit,path=M.shopperPath(p.id,v.day);
 if(v.phase==='walk'){const target=v.stop<path.stopAt.length?path.stopAt[v.stop]+1:path.pts.length,seg=path.pts.slice(0,target);
  if(walk(v,seg,step*M.SPEED,p.id,null,step)){if(v.stop<path.stopAt.length){v.phase='buy';v.until=at+1.5+M.hash(p.id+v.stop+v.day)*2;const a=actors.get(p.id),sid=path.stops[v.stop];if(a){const g=M.geo(M.BY[sid]);a.dir=dirOf(g.stand[0]-a.x,g.stand[1]-a.y);a.setDir?.(a.dir);}}else{M.goHome(s,p.id);q.visit=null;}}return;}
 if(v.phase==='buy'){if(at<v.until)return;const sid=path.stops[v.stop],r=M.npcBuy(s,p.id,sid,price,at);
  if(r.ok){const g=r.got[0];say('rqv_'+sid,LINES.thanks[Math.floor(M.hash(p.id+at)*3)]);say(p.id,`${M.SKU[g.sku].label}${g.n>1?g.n+'份':''}，¥${(g.cents/100).toFixed(g.cents%100?1:0)}`);}
  else if(r.reason==='sold_out')say(p.id,'卖晒啊？听日早啲嚟。');else if(r.reason==='closed')say(p.id,'收咗档啦……');
  v.stop++;v.phase='walk';v.until=null;}}
/* ---------------------------------------------------------------- actors (near only) */
function look(id,lk,job){const a=actors.get(id);if(!a||!SP.npcDiversity?.adapt)return;try{SP.npcDiversity.adapt(a,{ageYears:lk.ageYears,heightCm:150+Math.floor(M.hash(id)*30),gender:lk.gender,presentation:lk.gender==='female'?'feminine':'masculine',job:'civilian',hair:lk.hair,outfit:job==='vendor'?'work':['casual','shirt','jacket','hoodie'][Math.floor(M.hash(id+'o')*4)],body:['slim','average','broad'][Math.floor(M.hash(id+'b')*3)]});}catch(e){}}
function want(s){const out=[];if(!near())return out;const nr={1:nearOf(1),2:nearOf(2),3:nearOf(3),4:nearOf(4)};for(const t of M.STALLS){const v=s.stalls[t.id].vendor;if(v.phase!=='off'&&nr[M.marketOf(t)]){const n=vendorPath.get(t.id).length,ls=laneStart.get(t.id);out.push({id:'rqv_'+t.id,r:v,inside:['setup','selling','pack'].includes(v.phase)||v.phase==='walk_in'&&v.i>=ls||v.phase==='walk_out'&&n-v.i>=ls,name:`${t.vname}（${t.name}）`,look:t.look,job:'vendor',dir:['setup','selling','pack'].includes(v.phase)?M.geo(t).dir:null});}}
 for(const p of M.SHOPPERS){const v=s.shoppers[p.id].visit;if(v&&nr[p.market||1])out.push({id:p.id,r:v,name:p.name+'（街坊）',look:p.look,job:'shopper'});}return out;}
function syncActors(s){const list=SP.actors?.list;if(!list||!SP.Actor)return;const w=want(s),ids=new Set(w.map(x=>x.id));
 for(const [id,a]of actors)if(!ids.has(id)){SP.actors.list=SP.actors.list.filter(b=>b!==a);actors.delete(id);}
 for(const x of w){let a=actors.get(x.id);if(!a){const set=x.job==='vendor'?'vendor':(M.hash(x.id)<0.5?'uncle':'office');a=new SP.Actor({id:x.id,set,name:x.name,x:x.r.x,y:x.r.y,speed:1.1,radius:.22,height:1.66,dir:'S',marketNpc:x.job,staff:x.job==='vendor'});SP.ensureActor?.(set);actors.set(x.id,a);look(x.id,x.look,x.job);
   /* a vendor inside the stall island (behind the counter, or on the flap lane) takes no collision space: the island itself is solid for everyone else, and door/gate checks elsewhere must not see a person inside a static */
   if(x.job==='vendor'){const c0=a.circles;a.circles=function(){return this.posed?[]:c0.apply(this,arguments);};}}
  if(!SP.actors.list.includes(a))SP.actors.list.push(a);if(Math.hypot(a.x-x.r.x,a.y-x.r.y)>0.6){a.x=x.r.x;a.y=x.r.y;}if(x.job==='vendor')a.posed=!!x.inside;if(x.dir&&!a.moving){a.setDir?.(x.dir);}}}
function dropActors(){if(SP.actors?.list)SP.actors.list=SP.actors.list.filter(a=>!actors.has(a.id)||actors.get(a.id)!==a);actors.clear();}
function say(id,text){const a=actors.get(id);if(a&&nearOf(mkOfId(id)))a.bubble={t:3,text};}
function note(msg,quiet){notes.push({at:now(),msg});if(notes.length>12)notes.shift();if(!quiet)try{W.logEvent?.(msg);}catch{}return msg;}
/* goods states feed the art; rebake the sorted layer only when something visible changed (at most every 2 s) */
function shownKey(s){return M.STALLS.map(t=>M.goodsState(s,t.id)[0]+(M.present(s,t.id)?1:0)).join('');}
function refresh(s){const k=shownKey(s);if(k!==lastShown&&elapsed-lastReset>2){lastShown=k;lastReset=elapsed;if(near()){SP.layers?.reset?.();}}}
/* ---------------------------------------------------------------- tick */
function tick(dt=0.016){if(!ps()||working)return;const s=state();const at=now();elapsed+=Math.max(0,Math.min(.1,Number(dt)||0));if(lastAt===null||at<lastAt){lastAt=at;s.lastAt=Math.max(s.lastAt,Math.min(at,s.lastAt));if(near())syncActors(s);return;}
 let mins=at-lastAt;if(mins<=0){if(near())syncActors(s);return;}working=true;try{
  /* long jumps (sleep, fast-forward) run in bounded sub-steps so every walker passes the same route and schedule */
  if(near()&&mins<5)syncActors(s);else if(actors.size)dropActors();
  let t=lastAt;const stepMax=near()&&mins<5?mins:2;let guard=0;while(t<at-1e-9&&guard++<2000){const step=Math.min(stepMax,at-t);t+=step;
   for(const st of M.STALLS)vendorStep(s,st,t,step);for(const p of M.SHOPPERS)shopperStep(s,p,t,step);}
  lastAt=at;s.lastAt=Math.max(s.lastAt,at);
  if(near()&&mins<5)syncActors(s);refresh(s);}
 finally{working=false;}}
/* ---------------------------------------------------------------- player buying */
function stallOf(id){return M.BY[id]||null;}
function reachOk(id){const t=stallOf(id);if(!t||!SP.player)return false;const c=M.geo(t).cust,objs=(W.objects||[]).filter(o=>o.interact==='rq_stall'&&o.rqStall===id);const pts=[c,...objs.flatMap(o=>o.reach||[])];return pts.some(p=>Math.hypot(SP.player.x-p[0],SP.player.y-p[1])<=2.2);}
function foodRoom(units){const h=SP.household?.view?.();if(!h||!HM)return true;return h.food.length+units<=240;}
function trackedUnits(q){return q.lines.reduce((a,l)=>a+(HM&&HM.FOODS.player.includes(l.item)?l.n*l.give:0),0);}
function quote(stall,cart){tick(0);const s=state();if(!s)return{ok:false,reason:'菜市场还没准备好'};const lines=Object.entries(cart||{}).filter(([,n])=>n>0).map(([sku,n])=>({sku,n}));const q=M.quote(s,{stall,lines},price,now());if(!q.ok)return q;
 const token='q'+q.seq+':'+Math.round(now()*1000)+':'+tokens.size;tokens.clear();tokens.set(token,q);return Object.assign({},copy(q),{token,walletCents:Math.round((ps().money||0)*100)});}
function confirm(token){const q=tokens.get(token);tokens.delete(token);if(!q)return{ok:false,reason:'这张单已经用过或已过期，请重新确认'};tick(0);const s=state(),at=now(),t=stallOf(q.stall);s.lastAt=Math.max(s.lastAt,at);
 if(!reachOk(q.stall))return{ok:false,reason:`请走到${t.name}柜台前再买`};if(G.activity||G.trans||C.ff)return{ok:false,reason:'请先完成当前动作'};
 const wallet=Math.round((ps().money||0)*100);if(wallet<q.totalCents)return{ok:false,reason:`钱不够（要¥${(q.totalCents/100).toFixed(2)}，钱包¥${(wallet/100).toFixed(2)}）`};
 if(!foodRoom(trackedUnits(q)))return{ok:false,reason:'家里和身上的食材太多，放不下了'};
 const before={m:copy(s),money:ps().money,spent:ps().stats?.spent,items:copy(ps().items),hh:ps().household?copy(ps().household):undefined};working=true;
 try{const r=M.sell(s,q,'player',at);if(!r.ok)return r;ps().money=Math.round((wallet-q.totalCents))/100;if(ps().stats)ps().stats.spent=Math.round(((ps().stats.spent||0)+q.totalCents/100)*100)/100;
  working=false;const got=[];for(const g of r.got){let k=0;for(const [bAt,n]of g.batches){const life=HM?.LIFE?.[g.item];const wear=life?Math.max(0,(at-bAt)/life[1]):0;for(let i=0;i<n*g.give;i++){const got1=SP.household?.receive?SP.household.receive('player',g.item,1,wear):(ps().items[g.item]=(ps().items[g.item]||0)+1,1);if(got1!==1)throw Error('家庭食材账本拒收');k++;}}got.push(`${M.SKU[g.sku].label}×${g.n}`);}
  const text=`在${t.name}买了${got.join('、')}，扫码付¥${(q.totalCents/100).toFixed(2)}`;note(text);say('rqv_'+t.id,LINES.thanks[Math.floor(M.hash(String(at))*3)]);try{SP.lifeChronicle?.record?.({kind:'market_buy',text});}catch{}
  return{ok:true,text,totalCents:q.totalCents,receipt:r.got.map(g=>({sku:g.sku,label:M.SKU[g.sku].label,n:g.n,cents:g.cents,id:g.receiptId}))};}
 catch(e){ps().wetMarket=before.m;ps().money=before.money;if(ps().stats)ps().stats.spent=before.spent;ps().items=before.items;if(before.hh!==undefined)ps().household=before.hh;try{SP.household?.resetRuntime?.();}catch{}owner=ps();return{ok:false,reason:'付款没有完成，已恢复：'+e.message};}
 finally{working=false;}}
function stallView(id){const s=state(),t=stallOf(id);if(!s||!t)return null;const st=s.stalls[id],v=st.vendor;
 return{id,name:t.name,vname:t.vname,phase:v.phase,selling:v.phase==='selling',hours:t.hours,state:M.goodsState(s,id),
  skus:t.skus.map(k=>({sku:k.sku,label:k.label,spec:k.spec,item:k.item,give:k.give,cents:Math.round(priceOf(k.sku)*100),left:M.stockOf(st,k.sku),cap:k.cap,fresh:st.stock[k.sku].length?Math.max(0,Math.floor((now()-st.stock[k.sku][0][0])/1440)):null})),
  walletCents:Math.round((ps().money||0)*100),near:reachOk(id)};}
function hm(m){m=M.mod(m);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
function statusText(id){const v=stallView(id);if(!v)return'';if(v.selling)return v.state==='empty'?'今日卖完了':'营业中';return{off:`还没开档（约${hm(v.hours[0])}）`,walk_in:'摊主正在来的路上',setup:'摊主正在摆货',pack:'正在收档',walk_out:'已收档'}[v.phase]||'';}
/* ---------------------------------------------------------------- game hooks: interaction, stove recipes, update */
const action0=G.actionFor,use0=G.use;
G.actionFor=function(o,kind){if(o&&o.interact==='rq_stall'&&!W.interior){if(kind!=='use')return null;const t=stallOf(o.rqStall);if(!t)return null;const v=stallView(t.id);return{label:v?.selling?`找${t.vname}买 · ${t.name}`:`${t.name}：${statusText(t.id)}`,do:'game'};}return action0.apply(this,arguments);};
G.use=function(o){if(o&&o.interact==='rq_stall'&&!W.interior){const t=stallOf(o.rqStall);if(!t)return null;if(SP.wetMarketUI?.open){SP.wetMarketUI.open(t.id);if(stallView(t.id)?.selling)say('rqv_'+t.id,LINES.hello[Math.floor(M.hash(String(now()))*3)]);return null;}return statusText(t.id);}return use0.apply(this,arguments);};
/* market dishes only show at the stove once their ingredients are at hand (the original two stay as they were) */
const RECIPES=new Set(['cook_pork_veg','cook_beef','cook_chicken','cook_fish','cook_shrimp','cook_tofu','eat_deli']);
if(R?.actionsAt){const at0=R.actionsAt;R.actionsAt=function(){return at0.apply(this,arguments).filter(a=>!(RECIPES.has(a.id)&&!a.ok&&a.reason!=='not here'&&/没有/.test(String(a.reason))));};}
const update0=G.update;G.update=function(dt){const r=update0?.apply(this,arguments);try{tick(dt);}catch(e){root.console?.error?.(e);}return r;};
/* ---------------------------------------------------------------- save / restore */
function prepare(s,at=now()){return M.prepare(s,at);}
function snapshot(){const s=state();if(!s)return null;s.lastAt=Math.max(s.lastAt,Math.min(now(),s.lastAt+1e9));return copy(s);}
function restore(s){const n=prepare(s,now());if(!n)return{ok:false,reason:'菜市场账本无效'};ps().wetMarket=n;owner=ps();resetRuntime(false);return{ok:true};}
function resetRuntime(keepOwner){dropActors();tokens.clear();lastAt=null;lastShown='';blocked=new Map();working=false;if(!keepOwner)owner=ps();}
SP.wetMarket={ready:()=>!!ps(),state:()=>ps()?state():null,view:()=>ps()?copy(state()):null,goodsState:id=>ps()?M.goodsState(state(),id):'closed',present:id=>!!ps()&&M.present(state(),id),
 price,quote,confirm,stallView,statusText,tick,prepare,snapshot,restore,resetRuntime,fresh:at=>M.fresh(at,price),canSave:()=>!working,actors:()=>[...actors.values()],notes:()=>notes.slice(),near,hm};
})(typeof window!=='undefined'?window:globalThis);
