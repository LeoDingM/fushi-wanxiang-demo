/* Site87 local H: pure player-employment ledger (leave, notice, appeal, handover). One authority: ps.playerWork.events.
 * Event shape reuses WORK-015..018: {id,kind,actorId,subjectId,at,sourceId,data}. Decisions are deterministic so a save can
 * be re-checked: leave approved iff <2 approvals in the previous 7 days; an appeal reinstates iff the player completed at
 * least one real shift after the notice. 【助手决定，未经用户确认】 */
(function(root){'use strict';
const VERSION=1,NOTICE=4320,WEEK=10080,LEAVE_AHEAD=120,LEAVE_PER_WEEK=2,FIRE_AFTER=3,CAP=600,SUBJECT='store_clerk',ACTOR='player',
 SHIFTS=['morning','peak','evening','night'],KINDS=['leave_request','leave_decision','notice','appeal','appeal_decision','handover'];
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),plain=o=>!!o&&typeof o==='object'&&!Array.isArray(o)&&Object.getPrototypeOf(o)===Object.prototype,
 exact=(o,keys)=>plain(o)&&Object.keys(o).length===keys.length&&keys.every(k=>own(o,k)),int=(v,min=0)=>Number.isSafeInteger(v)&&v>=min,
 time=v=>Number.isFinite(v)&&v>=0&&v<1e9,copy=o=>JSON.parse(JSON.stringify(o));
function fresh(){return{version:VERSION,nextId:1,events:[]};}
/* replay: returns a summary or null when any rule is broken */
function replay(events,at){const notices=[],leaves=[];let active=null,last=-1,prevId=0;
 for(let i=0;i<events.length;i++){const e=events[i];
  if(!exact(e,['id','kind','actorId','subjectId','at','sourceId','data'])||!int(e.id,1)||e.id<=prevId||!KINDS.includes(e.kind)||e.actorId!==ACTOR||e.subjectId!==SUBJECT||!time(e.at)||e.at<last||e.at>at||!plain(e.data))return null;prevId=e.id;last=e.at;const d=e.data;
  if(e.kind==='leave_request'){if(!exact(d,['shiftId','start'])||!SHIFTS.includes(d.shiftId)||!int(d.start)||d.start<e.at+LEAVE_AHEAD||e.sourceId!==null)return null;const n=events[i+1];if(!n||n.kind!=='leave_decision')return null;}
  else if(e.kind==='leave_decision'){const q=events[i-1];if(!q||q.kind!=='leave_request'||e.sourceId!==q.id||e.at!==q.at||!exact(d,['approved','shiftId','start'])||d.shiftId!==q.data.shiftId||d.start!==q.data.start)return null;
   const recent=leaves.filter(l=>l.approved&&e.at-l.at<WEEK).length;if(d.approved!==(recent<LEAVE_PER_WEEK)||leaves.some(l=>l.approved&&l.start===d.start)&&d.approved)return null;if(active&&d.start>=active.effectiveAt)return null;leaves.push({id:e.id,at:e.at,start:d.start,shiftId:d.shiftId,approved:d.approved});}
  else if(e.kind==='notice'){if(active||e.sourceId!==null||!exact(d,['by','effectiveAt','strikes','shiftsAt','cancelled'])||!['manager','player'].includes(d.by)||d.effectiveAt!==e.at+NOTICE||!int(d.strikes)||!int(d.shiftsAt)||!int(d.cancelled)||d.by==='manager'&&d.strikes<FIRE_AFTER)return null;active={id:e.id,at:e.at,...d,appealed:false};notices.push(active);}
  else if(e.kind==='appeal'){if(!active||e.sourceId!==active.id||active.by!=='manager'||active.appealed||e.at>=active.effectiveAt||!exact(d,[]))return null;const n=events[i+1];if(!n||n.kind!=='appeal_decision')return null;active.appealed=true;}
  else if(e.kind==='appeal_decision'){const q=events[i-1];if(!q||q.kind!=='appeal'||e.sourceId!==q.id||e.at!==q.at||!exact(d,['reinstated','shifts'])||!int(d.shifts)||d.shifts<active.shiftsAt||d.reinstated!==(d.shifts>active.shiftsAt))return null;if(d.reinstated){active.endedAt=e.at;active.end='reinstated';active=null;}}
  else if(e.kind==='handover'){if(!active||e.sourceId!==active.id||e.at<active.effectiveAt||!exact(d,['shifts']))return null;if(!int(d.shifts))return null;active.endedAt=e.at;active.end='handover';active=null;}}
 return{notices,leaves,active,last};}
function prepare(s,at,job){if(!exact(s,['version','nextId','events'])||s.version!==VERSION||!Array.isArray(s.events)||s.events.length>CAP||!time(at))return null;
 const ids=s.events.map(e=>e?.id);if(!int(s.nextId,1)||s.nextId!==(ids.length?ids[ids.length-1]+1:1))return null;
 const r=replay(s.events,at);if(!r)return null;if(job!==undefined&&!crossCheck(r,job))return null;return copy(s);}
/* the ledger must match the real job record */
function crossCheck(r,job){if(job!==null&&!plain(job))return null;const lastHand=r.notices.filter(n=>n.end==='handover').at(-1);
 if(r.active){if(!job)return false;if(r.active.by==='manager'&&(job.strikes||0)<r.active.strikes)return false;if((job.booked||[]).some(b=>b.start>=r.active.effectiveAt))return false;if(job.hired>r.active.at)return false;}
 if(job&&lastHand&&!(job.hired>=lastHand.endedAt))return false;
 if(job)for(const l of r.leaves)if(l.approved&&(job.booked||[]).some(b=>b.start===l.start&&b.id===l.shiftId))return false;
 return true;}
function view(s,at){const r=replay(s.events,at)||{notices:[],leaves:[],active:null};return r;}
function push(s,kind,at,sourceId,data){if(s.events.length>=CAP)return null;const e={id:s.nextId++,kind,actorId:ACTOR,subjectId:SUBJECT,at,sourceId,data};s.events.push(e);return e;}
function canLeave(s,at,job,b){if(!job)return'还没被录用';if(!b||!(job.booked||[]).some(x=>x.start===b.start&&x.id===b.id))return'这个班没排你';if(b.start<at+LEAVE_AHEAD)return'开班前2小时内不能请假';const v=view(s,at);if(v.leaves.some(l=>l.approved&&l.start===b.start))return'这个班已经请过假';if(s.events.length+2>CAP)return'记录已满';return null;}
function requestLeave(s,at,job,b){const why=canLeave(s,at,job,b);if(why)return{ok:false,reason:why};const v=view(s,at),approved=v.leaves.filter(l=>l.approved&&at-l.at<WEEK).length<LEAVE_PER_WEEK;
 const q=push(s,'leave_request',at,null,{shiftId:b.id,start:b.start}),d=push(s,'leave_decision',at,q.id,{approved,shiftId:b.id,start:b.start});return{ok:true,approved,events:[q,d]};}
function issueNotice(s,at,by,strikes,shiftsAt,cancelled){if(view(s,at).active)return{ok:false,reason:'已有生效中的通知'};if(by==='manager'&&strikes<FIRE_AFTER)return{ok:false,reason:'旷工未满3次'};const e=push(s,'notice',at,null,{by,effectiveAt:at+NOTICE,strikes,shiftsAt,cancelled});return e?{ok:true,notice:e}:{ok:false,reason:'记录已满'};}
function canAppeal(s,at){const a=view(s,at).active;if(!a)return'没有待申辩的通知';if(a.by!=='manager')return'主动辞职无需申辩';if(a.appealed)return'已经申辩过一次';if(at>=a.effectiveAt)return'通知已生效，不能再申辩';if(s.events.length+2>CAP)return'记录已满';return null;}
function appeal(s,at,shifts){const why=canAppeal(s,at);if(why)return{ok:false,reason:why};const a=view(s,at).active,reinstated=shifts>a.shiftsAt;const q=push(s,'appeal',at,a.id,{}),d=push(s,'appeal_decision',at,q.id,{reinstated,shifts});return{ok:true,reinstated,events:[q,d]};}
function canHandover(s,at){const a=view(s,at).active;if(!a)return'没有待交接的离职';if(at<a.effectiveAt)return'通知期还没结束';return null;}
function handover(s,at,shifts){const why=canHandover(s,at);if(why)return{ok:false,reason:why};const a=view(s,at).active,e=push(s,'handover',at,a.id,{shifts});return e?{ok:true,event:e,notice:a}:{ok:false,reason:'记录已满'};}
const api={VERSION,NOTICE,WEEK,LEAVE_AHEAD,LEAVE_PER_WEEK,FIRE_AFTER,CAP,SHIFTS,KINDS,fresh,prepare,replay,crossCheck,view,canLeave,requestLeave,issueNotice,canAppeal,appeal,canHandover,handover};
if(typeof module!=='undefined'&&module.exports)module.exports=api;root.PlayerWorkModel=api;})(typeof window!=='undefined'?window:globalThis);
