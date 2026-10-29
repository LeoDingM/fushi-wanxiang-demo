/* P3b: native extension for the 榕桥菜市场 trade ledger (ps.wetMarket). Legacy saves start the ledger from the save's own time
 * (today's vendors at their stalls with a paid morning delivery, regulars' wallets at their seed); marker and field must agree;
 * a forged or inconsistent ledger throws, so progress_save rolls back to the previous progress. */
(function(root){'use strict';const SP=root.SP;if(!SP?.progressSave)throw Error('菜市场存档须在原生存档后加载');if(SP.wetMarketSave)return;const own=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k),R=()=>{if(!SP.wetMarket)throw Error('菜市场模块尚未准备好');return SP.wetMarket;};
function checked(s,at){const n=R().prepare(s,at);if(!n)throw Error('菜市场库存、摊主现金、买菜客钱包或小票记录不一致');return n;}
function captureState(ps,at){if(!R().canSave())throw Error('菜市场正在结账');return checked(ps.wetMarket||R().fresh(at),at);}
function prepareState(ps,ext,at){const has=own(ps,'wetMarket'),mark=ext!==undefined&&own(ext,'wetMarket');if(has!==mark||mark&&ext.wetMarket!==1)throw Error('菜市场扩展声明与记录不一致');ps.wetMarket=checked(has?ps.wetMarket:R().fresh(at),at);return !has;}
function applyCommitted(ps,at){const s=checked(ps.wetMarket,at);const r=R().restore(s);if(!r?.ok)throw Error(r?.reason||'菜市场记录恢复失败');}
SP.wetMarketSave={checked,captureState,prepareState,applyCommitted,version:1};})(typeof window!=='undefined'?window:globalThis);
