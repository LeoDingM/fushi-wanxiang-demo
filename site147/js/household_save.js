/* Site87 local: native household ledger (food units, fridge orders, trash custody, litter cases). Legacy saves start from
 * today's real holdings with nothing spoiled, bought or littered; the marker and the field must agree. */
(function(root){'use strict';const SP=root.SP;if(!SP?.progressSave)throw Error('家庭账本存档须在原生存档后加载');if(SP.householdSave)return;const own=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k),R=()=>{if(!SP.household)throw Error('家庭账本模块尚未准备好');return SP.household;};
function checked(s,at,ps){const n=R().prepare(s,at,ps);if(!n)throw Error('家庭食材、冰箱订单、垃圾或罚单记录与真实持有/收据不一致');return n;}
function captureState(ps,at){if(!R().canSave())throw Error('家庭账本正在提交');return checked(R().snapshot(),at,ps);}
function prepareState(ps,ext,at){const has=own(ps,'household'),mark=ext!==undefined&&own(ext,'household');if(has!==mark||mark&&ext.household!==1)throw Error('家庭账本扩展声明与记录不一致');const v=has?ps.household?.version:null;ps.household=checked(has?ps.household:R().seed(at,ps),at,ps);return !has||v!==ps.household.version;}
function applyCommitted(ps,at){const s=checked(ps.household,at,ps);R().resetRuntime();const r=R().restore(s);if(!r?.ok)throw Error(r?.reason||'家庭账本恢复失败');}
SP.householdSave={checked,captureState,prepareState,applyCommitted,version:3};})(typeof window!=='undefined'?window:globalThis);
