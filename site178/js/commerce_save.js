/* Site88 local: native extension for the phone takeout / online-shopping ledger. Legacy saves start with an empty ledger;
 * the marker and the field must agree; invalid records throw so progress_save rolls back to the previous progress. */
(function(root){'use strict';const SP=root.SP;if(!SP?.progressSave)throw Error('网购外卖存档须在原生存档后加载');if(SP.commerceSave)return;const own=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k),R=()=>{if(!SP.commerce)throw Error('外卖网购模块尚未准备好');return SP.commerce;};
function checked(s,at){const n=R().prepare(s,at);if(!n)throw Error('外卖/网购订单、付款或配送记录不一致');return n;}
function captureState(ps,at){if(!R().canSave())throw Error('外卖网购订单正在提交');return checked(ps.commerce||R().fresh(at),at);}
function prepareState(ps,ext,at){const has=own(ps,'commerce'),mark=ext!==undefined&&own(ext,'commerce');if(has!==mark||mark&&ext.commerce!==1)throw Error('外卖网购扩展声明与记录不一致');ps.commerce=checked(has?ps.commerce:R().fresh(at),at);return !has;}
function applyCommitted(ps,at){const s=checked(ps.commerce,at);const r=R().restore(s);if(!r?.ok)throw Error(r?.reason||'外卖网购记录恢复失败');}
SP.commerceSave={checked,captureState,prepareState,applyCommitted,version:1};})(typeof window!=='undefined'?window:globalThis);
