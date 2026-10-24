/* I11 validation adapter; load after progress_save. No shared save format rewrite. */
(function(SP){
 'use strict';const PS=SP.progressSave,M=SP.modernResidence;if(!PS||!M)return;
 function validate(s){
  if(s==null)return null;if(typeof s!=='object'||Array.isArray(s))return'现代住宅状态格式无效。';
  if(s.schemaVersion==null&&['closet','prepared','hung'].includes(s.selection))return null;
  if(s.schemaVersion!==2||!s.units||typeof s.units!=='object'||Object.keys(s.units).length!==2)return'现代住宅状态版本无效。';
  for(const [unit,data]of Object.entries(s.units)){
   if(![M.UNIT,'modern_residence_2F-02'].includes(unit)||!data||!Array.isArray(data.laundry)||data.laundry.length!==3)return'现代住宅住户或晾晒列表无效。';
   const ids=new Set(),kinds=new Set();for(const item of data.laundry){
    if(!item||item.id!==unit+'_'+item.kind||ids.has(item.id)||!['coat','shirt','quilt'].includes(item.kind)||kinds.has(item.kind)||typeof item.label!=='string'||item.label.length>32||/[<>&]/.test(item.label)||!['closet','hand','line'].includes(item.location)||typeof item.color!=='string'||!/^#[0-9a-f]{6}$/i.test(item.color)||typeof item.wet!=='number'||!Number.isFinite(item.wet)||item.wet<0||item.wet>1||!(item.startedAt===null||typeof item.startedAt==='number'&&Number.isFinite(item.startedAt)&&item.startedAt>=0)||!(item.updatedAt==null||typeof item.updatedAt==='number'&&Number.isFinite(item.updatedAt)&&item.updatedAt>=0))return'现代住宅衣物状态无效。';
    ids.add(item.id);kinds.add(item.kind);
   }
  }
  const e=s.elevator;if(!e||!Number.isInteger(e.floor)||e.floor<1||e.floor>12||!Number.isInteger(e.target)||e.target<1||e.target>12||!['open','waiting','running'].includes(e.phase)||typeof e.powered!=='boolean')return'现代住宅电梯状态无效。';
  return null;
 }
 const capture0=PS.capture,restore0=PS.restore;
 PS.capture=function(){const e=M.state().elevator;if(e.phase!=='open')return{ok:false,reason:'请等待电梯到站再保存。'};M.sync();return capture0.apply(PS,arguments);};
 PS.restore=function(text){let s;try{s=JSON.parse(text)?.payload?.ps?.modernResidence;}catch(_){return restore0.apply(PS,arguments);}const reason=validate(s);if(reason)return{ok:false,reason};const r=restore0.apply(PS,arguments);if(r.ok){const e=M.state().elevator;e.phase='open';e.target=e.floor;M.sync();}return r;};
 SP.modernResidenceSave={validate};
})(window.SP);
