/* Site87 local H runtime: the player's store-clerk job gains leave requests, a 3-day dismissal notice with one appeal and an
 * in-person handover, voluntary resignation, and no-overlap rules with the community-workspace freelance task. Only the live
 * player state (G.ps) is affected; the shared rules keep their old behaviour for every other state. Ledger: ps.playerWork. */
(function(root){'use strict';const SP=root.SP,M=root.PlayerWorkModel;if(!SP||!M||SP.playerWork)return;const G=SP.game,C=SP.clock,W=SP.world;if(!G||!C)return;const R=G.rules;if(!R?.job)return;
const now=()=>C.abs(),ps=()=>G.ps,live=s=>!!s&&s===G.ps,note=m=>{try{W?.logEvent?.(m);}catch{}},toast=m=>{try{SP.toast?.(m,3200);}catch{}};
const FREE='community_freelance_work';
function state(p=ps()){if(!p)return null;if(!p.playerWork)p.playerWork=M.fresh();return p.playerWork;}
const active=()=>{const s=state();return s?M.view(s,now()).active:null;};
const date=t=>{try{return R.date(t).label;}catch{return '';}},hm=t=>{const m=((t%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(Math.floor(m%60)).padStart(2,'0');};
/* freelance window: the started 2-hour desk task occupies [startedAt, finishAt] */
function freelanceBusy(){const f=ps()?.communityWork;return f&&f.status==='working'&&Number.isFinite(f.startedAt)&&Number.isFinite(f.finishAt)?[f.startedAt,f.finishAt]:null;}
function shiftSpan(b){const J=R.job.def(),sh=J?.shifts?.find(x=>x.id===b.id);if(!sh)return[b.start,b.start];const [h0,m0]=sh.from.split(':').map(Number),[h1,m1]=sh.to.split(':').map(Number);let d=(h1*60+m1)-(h0*60+m0);if(d<=0)d+=1440;return[b.start,b.start+d];}
const overlaps=(a,b)=>a[0]<b[1]&&b[0]<a[1];
/* 1. no-show: the live player gets a notice instead of an instant dismissal */
const noShows0=R.job.noShows;R.job.noShows=function(s,abs){if(!live(s)||!s.job)return noShows0.apply(this,arguments);const j=s.job,evs=noShows0.apply(this,arguments);
 if(s.job===null&&evs.some(e=>e?.type==='fired')){s.job=j;const out=evs.filter(e=>e?.type!=='fired');if(!M.view(state(s),abs).active){const eff=abs+M.NOTICE,keep=(j.booked||[]).filter(b=>b.start<eff),cancelled=(j.booked||[]).length-keep.length;j.booked=keep;
   const r=M.issueNotice(state(s),abs,'manager',j.strikes||0,j.shifts||0,cancelled);if(r.ok){const m=`赵姐：三次旷工，按规定给你辞退通知，${date(eff)} ${hm(eff)}生效。通知期内还能上已排的班，可以申辩一次；生效后来柜台交接。`;note('便利店 · '+m);toast(m);}}
  return out;}
 return evs;};
/* 2. booking and clock-in respect the notice, approved leave and the freelance desk task */
const book0=R.job.book;R.job.book=function(s,abs,id,start){if(live(s)&&s.job){const a=M.view(state(s),abs).active;if(a)return{ok:false,reason:a.by==='manager'?'辞退通知期内不能再排新班':'已提辞职，通知期内不能再排新班'};
  if(M.view(state(s),abs).leaves.some(l=>l.approved&&l.start===start&&l.shiftId===id))return{ok:false,reason:'这个班已经请过假'};const f=freelanceBusy();if(f&&overlaps(shiftSpan({id,start}),f))return{ok:false,reason:'和正在做的共享办公任务时间重叠'};}
 return book0.apply(this,arguments);};
const canStart0=R.job.canStart;R.job.canStart=function(s,abs){if(live(s)&&s.job){const a=M.view(state(s),abs).active;if(a&&abs>=a.effectiveAt)return{ok:false,reason:'离职已生效，请到柜台找赵姐办理交接'};if(freelanceBusy()&&G.activity)return{ok:false,reason:'正在做共享办公任务'};}return canStart0.apply(this,arguments);};
const start0=G.start;if(start0)G.start=function(action){if(action===FREE&&ps()){const f=ps().communityWork,rem=f?.status==='working'?Math.max(0,Math.ceil(f.finishAt-now())):120,span=[now(),now()+rem];
  if(ps().shift)return'正在便利店当班，下班后再来做共享办公任务';const b=(ps().job?.booked||[]).find(x=>overlaps(shiftSpan(x),span));if(b)return`和已排的便利店${b.label}（${date(b.start)} ${hm(b.start)}）时间重叠，先请假或换个时间`;}
 return start0.apply(this,arguments);};
/* 3. counter actions (in person, not on shift) */
function leaveMenu(o){const s=state(),j=ps().job,list=(j?.booked||[]).slice(0,8);G.openMenu(Object.assign({},o,{_name:'请假 · 赵姐（店长）'}),list.length?list.map(b=>{const why=M.canLeave(s,now(),j,b);return{id:'pw_leave_'+b.start,label:`${date(b.start)} ${b.label} ${hm(b.start)}`,ok:!why,reason:why||'',fn:()=>requestLeave(b)};}):[{id:'pw_leave_none',label:'没有已排的班',ok:false,reason:'先排班',fn:()=>null}]);if(G.menu)G.menu.o=o;return null;}
function requestLeave(b){const p=ps(),j=p.job,r=M.requestLeave(state(),now(),j,b);if(!r.ok)return r.reason;if(r.approved){j.booked=j.booked.filter(x=>!(x.start===b.start&&x.id===b.id));note(`便利店 · 请假获批：${date(b.start)} ${b.label}`);return`赵姐：行，${date(b.start)}的${b.label}给你调开了，不算旷工。`;}
 note(`便利店 · 请假被驳回：${date(b.start)} ${b.label}`);return'赵姐：这周已经批过两次假了，这个班还是得来，实在来不了就算旷工。';}
function appeal(){const p=ps(),r=M.appeal(state(),now(),p.job?.shifts||0);if(!r.ok)return r.reason;if(r.reinstated){p.job.strikes=0;note('便利店 · 申辩成功，撤销辞退通知');return'赵姐：通知之后你认真上完了班，这次撤销辞退，旷工记录清零。别再有下次。';}note('便利店 · 申辩被驳回');return'赵姐：通知之后你一个班都没好好上完，辞退照常生效。';}
function resign(){const p=ps(),j=p.job;if(!j)return'还没被录用';if(p.shift)return'先下班再谈';const eff=now()+M.NOTICE,keep=(j.booked||[]).filter(b=>b.start<eff),r=M.issueNotice(state(),now(),'player',j.strikes||0,j.shifts||0,(j.booked||[]).length-keep.length);if(!r.ok)return r.reason;j.booked=keep;note(`便利店 · 提出辞职，${date(eff)} ${hm(eff)}生效`);return`赵姐：好，我记下了。三天后（${date(eff)} ${hm(eff)}）生效，之前排的班照常上，到时候来交接。`;}
function handover(){const p=ps();if(p.shift)return'先下班打卡再交接';const r=M.handover(state(),now(),p.job?.shifts||0);if(!r.ok)return r.reason;const why=r.notice.by==='manager'?'辞退':'辞职';p.job=null;note(`便利店 · 离职交接完成（${why}）`);return`交还了店服和钥匙，赵姐核对了班表：${why}手续办完了。已结算的工资不受影响。`;}
function statusText(){const s=state(),v=M.view(s,now()),a=v.active,j=ps().job;if(!j&&!a)return'目前没有在便利店任职。';const lines=[`旷工 ${j?.strikes||0} 次 · 已上完 ${j?.shifts||0} 个班`];
 if(a)lines.push(`${a.by==='manager'?'辞退通知':'辞职'}：${date(a.effectiveAt)} ${hm(a.effectiveAt)} 生效${now()>=a.effectiveAt?'（已生效，待交接）':''}${a.appealed?' · 已申辩':''}`);
 const recent=v.leaves.filter(l=>now()-l.at<M.WEEK);if(recent.length)lines.push(`近7天请假 ${recent.length} 次（批准 ${recent.filter(l=>l.approved).length}）`);return lines.join('；');}
function options(o){if(!o||o.interact!=='store_counter'||!ps()?.job||ps().shift)return[];const out=[],a=active(),at=now();
 out.push({id:'pw_leave',label:'向赵姐请假…',ok:!(a&&at>=a.effectiveAt),reason:'离职已生效',fn:()=>leaveMenu(o)});
 if(a&&a.by==='manager'&&!a.appealed&&at<a.effectiveAt)out.push({id:'pw_appeal',label:'对辞退通知提出申辩（只有一次机会）',ok:true,fn:appeal});
 if(a&&at>=a.effectiveAt)out.push({id:'pw_handover',label:'办理离职交接（交还店服、钥匙）',ok:true,fn:handover});
 if(!a)out.push({id:'pw_resign',label:'提出辞职（提前3天通知）',ok:true,fn:resign});
 out.push({id:'pw_status',label:'查看雇佣记录',ok:true,fn:statusText});return out;}
const open0=G.openMenu;if(open0)G.openMenu=function(o,opts){try{if(Array.isArray(opts)&&o&&!o.actor){const add=options(o).filter(q=>!opts.some(p=>p.id===q.id));if(add.length)opts=opts.concat(add);}}catch(e){root.console?.error?.(e);}return open0.call(this,o,opts);};
function prepare(s,at,p){return M.prepare(s,at,p?p.job??null:undefined);}
SP.playerWork={state,prepare,view:()=>M.view(state(),now()),options,requestLeave,appeal,resign,handover,statusText,freelanceBusy};})(typeof window!=='undefined'?window:globalThis);
