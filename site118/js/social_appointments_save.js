/* I15 appointments participate in native fushi-progress commit and rollback. */
(function(SP){
 'use strict';
 const PS=SP.progressSave,A=window.SocialAppointments,R=SP.socialAppointments;
 if(!PS||!A||!R||typeof A.fresh!=='function'||typeof A.validate!=='function'||typeof A.normalize!=='function'||
   !['snapshot','restore','resetRuntime','canSave'].every(k=>typeof R[k]==='function'))
  throw Error('预约存档须在原生存档与预约模块注册后加载。');
 if(SP.socialAppointmentsSave)return;
 const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 function checked(state,at,ps){
  if(!A.validate(state,at,false))throw Error('预约记录、时序或结果无效；未完成共同阅读不能存档。');
  const next=A.normalize(state,at,false);if(!next)throw Error('预约状态无法规范化。');
  // Completion uses the legacy shared-reading reward path. Appointment history
  // cannot claim a completion that never reached that authoritative day marker.
  if(ps&&next.history.some(h=>['completed','fulfilled_elsewhere'].includes(h.outcome)&&
    (!Number.isSafeInteger(ps.communitySocial?.lin?.lastSharedDay)||ps.communitySocial.lin.lastSharedDay<h.day)))
   throw Error('预约完成结果与共同阅读记录不匹配。');
  return next;
 }
 function captureState(ps,at){
  if(!R.canSave())throw Error('共同阅读尚未结束，请完成或中止后再保存。');
  return checked(R.snapshot(),at,ps);
 }
 function prepareState(ps,sourceVersion,at){
  if(!own(ps,'socialAppointments')){
   if(['I15','I16','I17','I18'].includes(sourceVersion))throw Error('存档缺少预约记录。');
   ps.socialAppointments=A.fresh();
  }
  ps.socialAppointments=checked(ps.socialAppointments,at,ps);
  return ps.socialAppointments;
 }
 function applyCommitted(ps,at){
  const state=checked(ps.socialAppointments,at,ps);
  SP.appointmentsUI?.close();
  R.resetRuntime();const r=R.restore(state);if(!r?.ok)throw Error(r?.reason||'预约记录恢复失败。');
  ps.socialAppointments=state;
 }
 SP.socialAppointmentsSave={captureState,prepareState,applyCommitted,checked,format:'fushi-progress',field:'payload.ps.socialAppointments',version:1};
})(window.SP);
