/* Site87 local H: native save for ps.playerWork. Legacy saves (no marker) start with an empty employment record. */
(function(root){'use strict';const SP=root.SP;if(!SP?.progressSave)throw Error('雇佣记录存档须在原生存档后加载');if(SP.playerWorkSave)return;const own=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k),M=()=>{if(!root.PlayerWorkModel)throw Error('雇佣记录模块尚未准备好');return root.PlayerWorkModel;};
function checked(s,at,ps){const n=M().prepare(s,at,ps.job??null);if(!n)throw Error('请假、辞退通知、申辩或交接记录与真实岗位不一致');return n;}
function captureState(ps,at){return checked(ps.playerWork||M().fresh(),at,ps);}
function prepareState(ps,ext,at){const has=own(ps,'playerWork'),mark=ext!==undefined&&own(ext,'playerWork');if(has!==mark||mark&&ext.playerWork!==1)throw Error('雇佣记录扩展声明与记录不一致');ps.playerWork=checked(has?ps.playerWork:M().fresh(),at,ps);return !has;}
function applyCommitted(ps,at){checked(ps.playerWork,at,ps);}
SP.playerWorkSave={checked,captureState,prepareState,applyCommitted,version:1};})(typeof window!=='undefined'?window:globalThis);
