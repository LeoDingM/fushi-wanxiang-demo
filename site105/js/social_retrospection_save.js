/* Native lease-knowledge extension. No historical observations are invented. */
(function(root){
 'use strict';const SP=root.SP,M=root.SocialRetrospectionModel;if(!SP?.progressSave||!M)throw Error('社会回溯存档模块尚未准备好');if(SP.socialRetrospectionSave)return;
 const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),resolve=id=>SP.personRegistry?.get?.(id)||(['player','daily_wen','daily_shen'].includes(id)?id:null);
 function checked(s,at,ps){const n=M.prepare(s,at,ps?.sharedHome?.ledger,resolve);if(!n||n.observations.some(o=>o.evidence.scene!=='street'&&!SP.scenes?.[o.evidence.scene]))throw Error('社会回溯观察、场景或退租收据引用无效');return n;}
 function captureState(ps,at){const R=SP.socialRetrospection;if(R?.canSave&&R.canSave()!==true)throw Error('社会回溯正在提交，请稍后保存');const s=R?.snapshot?R.snapshot():SP.game.ps?.socialRetrospection;return checked(s||M.fresh(at),at,ps);}
 function prepareState(ps,extensions,at){const state=own(ps,'socialRetrospection'),marker=extensions!==undefined&&own(extensions||{},'socialRetrospection');if(state!==marker||marker&&extensions.socialRetrospection!==1)throw Error('社会回溯扩展声明与记录不一致');ps.socialRetrospection=checked(state?ps.socialRetrospection:M.fresh(at),at,ps);return !state;}
 function applyCommitted(ps,at){const n=checked(ps.socialRetrospection,at,ps),R=SP.socialRetrospection;if(R){R.resetRuntime();const r=R.restore(n);if(!r?.ok)throw Error(r?.reason||'社会回溯恢复失败');}ps.socialRetrospection=n;}
 SP.socialRetrospectionSave={checked,captureState,prepareState,applyCommitted,version:1};
})(typeof window!=='undefined'?window:globalThis);
