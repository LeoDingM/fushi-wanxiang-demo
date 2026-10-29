/* Native extensions preserve daily routes, hired fleet and depot operations. */
(function(SP){
 'use strict';
 if(!SP.progressSave)throw Error('城市日常存档须在原生存档模块后加载。');
 if(SP.livingCitySave)return;
 const FIELDS=['npcDailyLife','sharedMobility','mobilityOperations','neighborhoodStore','environmentState','storeSupply','sharedHome'],KNOWN=['socialExchange','cityIncidents','sharedMobility','npcDailyLife','mobilityOperations','neighborhoodStore','environmentState','storeSupply','sharedHome','socialRetrospection','mediaNews','heardNotes','leaseTalk','workTalk','fixtureTalk','socialFlow','animals','neighborDay','vendorDay','routineWork','residentMemory','employment','household','playerWork','commerce','wetMarket'];
 const LABEL={npcDailyLife:'居民日常',sharedMobility:'共享骑行',mobilityOperations:'车队运维',neighborhoodStore:'街坊便利店',environmentState:'环境演化',storeSupply:'门店配送',sharedHome:'合租住处'},own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 function runtime(key){const r=SP[key];if(!r||!['fresh','prepare','snapshot','restore','resetRuntime','canSave'].every(k=>typeof r[k]==='function'))throw Error(LABEL[key]+'模块尚未准备好。');return r;}
 function checked(key,s,at){const next=runtime(key).prepare(s,at);if(!next)throw Error(LABEL[key]+'记录、位置或阶段无效。');return next;}
 function crossCheck(states,at,ps){
  const fleet=states.sharedMobility.fleet,ops=states.mobilityOperations,owner='shared_maintenance_pickup';
  if(!Array.isArray(fleet)||!Array.isArray(ops.cargo)||!Array.isArray(ops.queue))throw Error('共享车队与运维记录缺失。');
  const ids=new Set(fleet.map(v=>v.id)),cargo=new Set(ops.cargo);
  if(ops.cargo.some(id=>!ids.has(id))||ops.queue.some(id=>!ids.has(id))||ops.destination&&!ids.has(ops.destination.id)||ops.worker&&!ids.has(ops.worker.bikeId))throw Error('运维车辆引用了不存在的共享车辆。');
  for(const v of fleet)if(cargo.has(v.id)!==(v.status==='maintenance'&&v.maintenanceOwner===owner)||v.status==='maintenance'&&v.maintenanceOwner!==owner)throw Error('运维载货与共享车辆维护归属不一致。');
  const store=states.neighborhoodStore,daily=states.npcDailyLife,personal=new Map(),legacy={stock:{bread:80,drink:80},tillCents:0};
  for(const r of daily.receipts){
   if(r.kind==='studio_wage'){const e=ps?.employment?.studio?.events?.find(e=>e.id===r.storeReceiptId);if(!e||e.kind!=='paid'||e.actorId!==r.actorId||e.at!==r.at||r.cents!==8000)throw Error('合作社付款与居民实收不一致');continue;}
   if(r.storeReceiptId!=null){if(!['shop','wage'].includes(r.kind)||personal.has(r.storeReceiptId))throw Error('居民共享商店交易引用重复或无效。');personal.set(r.storeReceiptId,r);}
   else if(r.kind==='wage')throw Error('居民工资收入缺少门店支付收据引用。');
   else if(r.kind==='shop'){if(r.at>store.opening.at)throw Error('居民旧账晚于共享商店期初。');legacy.stock[r.item]--;legacy.tillCents+=r.cents;}
  }
  if(['bread','drink'].some(k=>legacy.stock[k]!==store.opening.stock[k])||legacy.tillCents!==store.opening.tillCents)throw Error('共享商店期初与居民旧库存、收银记录不一致。');
  for(const r of store.receipts){
   if(r.buyerId==='player')continue;
   const p=personal.get(r.id),line=r.lines[0];
   if(['pickup','restock','cancel','wholesale','receive'].includes(r.kind)){if(p||!ps?.employment?.events?.some(e=>e.actorId===r.buyerId&&e.sourceId===r.id&&e.at===r.at&&e.kind==='duty_'+r.kind))throw Error('员工搬货缺少原岗位职责来源或被伪装实收。');continue;}if(['wage_reserve','wage_accrual'].includes(r.kind)){if(p)throw Error('工资预约或应付债权不能作为居民实收收入。');continue;}
   const same=p&&p.actorId===r.buyerId&&p.cents===r.totalCents&&p.at===r.at;
   if(r.kind==='purchase'){if(!same||p.kind!=='shop'||r.lines.length!==1||line.quantity!==1||p.item!==line.item)throw Error('居民购买记录与共享商店收据不一致。');}
   else if(r.kind==='wage_payment'){if(!same||p.kind!=='wage'||p.item!==null||p.from!=='store_24'||p.to!==r.buyerId||r.lines.length)throw Error('居民工资收入与门店实际支付收据不一致。');}
   else throw Error('居民共享商店收据类型无效。');
   personal.delete(r.id);
  }
  if(personal.size)throw Error('居民交易或工资引用了不存在的共享商店收据。');
  if(store.cargo){const owner=store.receipts[store.cargo.id-1]?.buyerId;if(owner!=='player'){const r=daily.residents[owner];if(!r||r.job.status!=='working'||!r.phase.startsWith('job_stock_'))throw Error('员工货箱缺少对应在岗搬运者。');}}if(store.version>=5)for(const id of ['daily_wen','daily_shen']){const job=daily.residents[id].job,active=store.npcWageShifts[id];const v=ps.employment&&window.EmploymentModel?.replay?.(ps.employment,at),q=v?.regular.records.find(q=>q.actorId===id&&q.day===job.day);if(daily.residents[id].phase.startsWith('job_stock_')&&!q)throw Error('搬运阶段没有持续任职开班来源。');if(q?(Math.abs(q.minutes-job.workedMinutes)>.000001||job.rateCents!==1500||q.closedAt===null&&job.status!=='working'||q.closedAt!==null&&job.claimId!==q.claimId):job.workedMinutes>30)throw Error('持续任职实际工时与原工资来源不一致。');if(!job)throw Error('居民就业记录尚未准备好。');const employed=job.status==='working';if(employed?(!job.shiftKey||active!==job.shiftKey):active!==null)throw Error('居民在岗身份与门店工资预约不一致。');if(job.claimId!==null&&!store.wageClaims.some(c=>c.id===job.claimId&&c.employeeId===id&&c.shiftKey===job.shiftKey&&c.owedCents===Math.floor(job.workedMinutes*job.rateCents/60)))throw Error('居民就业记录引用了不存在的本人工资债权。');}
  if(store.version>=4){
   const shift=ps?.shift,key=shift?SP.storePayroll?.shiftKey?.(shift):null;
   if(shift&&!key)throw Error('当前班次身份无法校验，工资模块尚未准备好。');
   if(store.activeWageShift!==null&&(!shift||key!==store.activeWageShift))throw Error('工资预留与当前班次身份不一致。');
   if(shift&&store.wageClaims.some(c=>c.shiftKey===key))throw Error('当前班次已经结算工资，不能重复保留在岗状态。');
  }
  const home=states.sharedHome.ledger,housing=new Map();
  for(const r of daily.receipts){if(r.homeReceiptId!=null){if(r.kind!=='housing'||r.storeReceiptId!==null||housing.has(r.homeReceiptId))throw Error('居民住房收据引用重复或类型无效。');housing.set(r.homeReceiptId,r);}else if(r.kind==='housing')throw Error('居民住房支出或退款缺少租约收据。');}
  for(const r of home.receipts){if(r.actorId==='player')continue;const p=housing.get(r.id),expense=r.costCents-r.refundCents>=0,amount=Math.abs(r.costCents-r.refundCents);if(!p||p.actorId!==r.actorId||p.item!==null||p.at!==r.at||p.cents!==amount||p.homeKind!==r.kind||p.homeCostCents!==r.costCents||p.homeRefundCents!==r.refundCents||p.from!==(expense?r.actorId:'shared_home')||p.to!==(expense?'shared_home':r.actorId))throw Error('居民住房支出或退款与租约收据不一致。');housing.delete(r.id);}
  if(housing.size)throw Error('居民住房引用了不存在的租约收据。');
  const propertyReceipts=new Map(daily.receipts.filter(r=>['theft_loss','theft_return'].includes(r.kind)).map(r=>[r.id,r]));for(const i of ps?.cityIncidents?.rules?.incidents||[]){const p=i.property;if(!p)continue;for(const [id,kind,at]of[[p.lossReceiptId,'theft_loss',p.lossAt],...(p.custody==='returned'?[[p.returnReceiptId,'theft_return',p.returnedAt]]:[])]){const r=propertyReceipts.get(id);if(!r||r.actorId!==i.victimId||r.kind!==kind||r.item!==p.item||r.at!==at||r.cents!==0||(kind==='theft_loss'?r.to:r.from)!=='theft:'+i.id)throw Error('涉案财物与居民实际物品收据不一致。');propertyReceipts.delete(id);}}if(propertyReceipts.size)throw Error('居民物品损失或返还缺少对应的城市事件。');
  const supply=states.storeSupply,pending=store.pendingDelivery;
  const equalOrder=(a,b)=>!!a&&!!b&&['id','item','quantity','unitCents','orderedAt'].every(k=>a[k]===b[k]);
  const orderReceipt=o=>{const r=store.receipts.find(r=>r.id===o?.id&&r.kind==='wholesale');return r&&r.lines.length===1&&r.taskId==='supply:'+o.id&&equalOrder(o,{id:r.id,item:r.lines[0].item,quantity:r.lines[0].quantity,unitCents:r.lines[0].unitCents,orderedAt:r.at});};
  const received=o=>store.receipts.find(r=>r.kind==='receive'&&r.taskId==='supply:'+o?.id);
  if(supply.phase==='idle'){if(pending||supply.order)throw Error('配送空闲状态与在途订单不一致。');}
  else{if(!orderReceipt(supply.order))throw Error('配送车辆引用了不存在的采购订单。');if(['enroute','courier_out','waiting'].includes(supply.phase)){if(!equalOrder(supply.order,pending)||supply.receivedAt!==null)throw Error('配送车货与待收采购账不一致。');}else if(['courier_back','returning'].includes(supply.phase)){const receipt=received(supply.order);if(pending||!receipt||receipt.at!==supply.receivedAt)throw Error('配送回程与实际签收账不一致。');}else throw Error('配送阶段无效。');}
  if(supply.lastOrderId){const r=store.receipts.find(r=>r.id===supply.lastOrderId&&r.kind==='wholesale');if(!r||!store.receipts.some(q=>q.kind==='receive'&&q.taskId==='supply:'+r.id))throw Error('配送完成标记缺少已签收采购记录。');}

  return states;
 }
 function checkEnvironment(state,payload,at){const r=runtime('environmentState');if(typeof r.validateSourceStates!=='function'||typeof r.fromSourceStates!=='function'||typeof r.applyCommitted!=='function')throw Error('环境演化存档接口尚未准备好。');if(!r.validateSourceStates(state,SP.progressSave.environmentSourceStates(payload),at))throw Error('环境演化记录与场景实际破坏状态不一致。');}
 function captureState(ps,at,payload){const states={};for(const key of FIELDS){const r=runtime(key),ready=r.canSave();if(ready!==true&&ready?.ok!==true)throw Error(ready?.reason||LABEL[key]+'正在切换阶段，请稍后保存。');states[key]=checked(key,r.snapshot(),at);}checkEnvironment(states.environmentState,payload,at);return crossCheck(states,at,ps);}
 function prepareState(ps,extensions,at,payload){
  if(extensions!==undefined&&(!extensions||typeof extensions!=='object'||Array.isArray(extensions)||!Object.keys(extensions).length||Object.keys(extensions).some(k=>!KNOWN.includes(k)||extensions[k]!==1)))throw Error('存档扩展声明无效或版本不兼容。');
  let migrated=false;const states={};
  for(const key of FIELDS){const present=own(ps,key),declared=extensions!==undefined&&own(extensions,key);if(present!==declared)throw Error(LABEL[key]+'扩展声明与记录不一致。');if(key==='npcDailyLife'&&present&&extensions&&own(extensions,'household')&&(ps[key]?.blocks?ps[key].version!==18:ps[key]?.version!==17))throw Error('带家庭账本的存档不能降级居民日常账本版本。');states[key]=checked(key,present?ps[key]:(key==='environmentState'?runtime(key).fromSourceStates(SP.progressSave.environmentSourceStates(payload),at):key==='neighborhoodStore'?runtime(key).fresh(at,ps.npcDailyLife?.store):runtime(key).fresh(at)),at);if(!present||states[key]?.version!==ps[key]?.version)migrated=true;}
  checkEnvironment(states.environmentState,payload,at);Object.assign(ps,crossCheck(states,at,ps));return migrated;
 }
 function applyCommitted(ps,at,payload){const states={};for(const key of FIELDS)states[key]=checked(key,ps[key],at);crossCheck(states,at,ps);checkEnvironment(states.environmentState,payload,at);for(const key of FIELDS)runtime(key).resetRuntime();for(const key of ['neighborhoodStore','storeSupply','sharedHome','npcDailyLife','sharedMobility','mobilityOperations','environmentState']){const r=key==='environmentState'?runtime(key).applyCommitted(states[key]):runtime(key).restore(states[key]);if(!r?.ok)throw Error(r?.reason||LABEL[key]+'恢复失败。');if(key!=='environmentState')ps[key]=key==='npcDailyLife'?checked(key,ps[key],at):states[key];}}
 SP.livingCitySave={captureState,prepareState,applyCommitted,checked,fields:FIELDS.slice(),version:1};
})(window.SP);
