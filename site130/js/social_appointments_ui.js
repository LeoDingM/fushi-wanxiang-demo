/* Reading promises use the existing physical resident and activity, not a chat command. */
(function(SP){'use strict';
 const D=document,A=SP.socialAppointments,C=SP.clock,G=SP.game;
 if(!A||SP.appointmentsUI)return;
 let panel=null,body=null,note=null,proposal=null,refresh=null;
 const labels={completed:'如约读完',player_cancelled:'提前取消',weather_cancelled:'因雨取消',player_missed:'未能赴约',npc_unavailable:'小林未能到场',not_started:'到场后未开始',interrupted:'阅读中断',window_skipped:'错过会面时段',fulfilled_elsewhere:'当天已一起读过'};
 const day=d=>`第${d+1}天`,open=()=>!!panel&&!panel.hidden;
 const busy0=G.busy;G.busy=function(){return open()||busy0.apply(this,arguments);};
 function close(){if(panel)panel.hidden=true;proposal=null;SP.touchRelease?.();rootBlur();}
 function rootBlur(){window.dispatchEvent(new Event('blur'));}
 const node=(tag,text,cls)=>{const e=D.createElement(tag);if(text!=null)e.textContent=text;if(cls)e.className=cls;return e;};
 function button(label,fn,secondary=false){const b=node('button',label,secondary?'secondary':'');b.type='button';b.onclick=fn;return b;}
 function report(r){
  if(r.ok&&r.rescheduled&&!r.duplicate)SP.lifeChronicle?.record('appointment_rescheduled','social_appointments','与小林的阅读约定从'+day(r.fromDay)+'改到'+day(r.day),{previousId:r.previousId,appointmentId:r.id,fromDay:r.fromDay,day:r.day});
  proposal=null;render();note.textContent=r.reason||r.text||'约定已更新。';
 }
 function render(){
  if(!body)return;body.replaceChildren();const state=A.state(),active=state.active;
  body.append(node('p','和小林在社区阅览室一起读20分钟。先当面确认，届时再走到阅读位。','intro'));
  if(proposal){const offered=proposal,card=node('div',null,'card');card.append(node('h3',`${day(proposal.day)} · 18:00`),node('p','社区阅览室 · 最晚18:30开始。小林仍按自己的日程走过去。'));
   if(proposal.reschedule)card.append(node('p','原约定：'+day(proposal.fromDay)+'18:00。确认前会保留原约定。','hint'));
   const row=node('div',null,'actions');row.append(button(proposal.reschedule?'确认改期':'确认约定',()=>report(offered.reschedule?A.confirmReschedule(offered.token):A.confirm(offered.token))),button('再想想',()=>{proposal=null;render();note.textContent='尚未确认，原有约定没有改变。';},true));card.append(row);body.append(card);}
  else if(active){const card=node('div',null,'card');card.append(node('small','待赴的约定'),node('h3',`${day(active.day)} · 18:00`),node('p',active.status==='reading'?'正在共同阅读':'社区阅览室 · 18:00—18:30到阅读位开始'));const row=node('div',null,'actions');
   row.append(button('到场，开始阅读',()=>{close();SP.phone?.close?.();SP.socialEncountersLive?.close();const r=A.start();if(!r.ok){show();note.textContent=r.reason;}else SP.toast?.(r.text);}),button('提前取消',()=>report(A.cancel()),true));card.append(row);body.append(card);
   if(active.status==='scheduled'&&C.abs()<window.SocialAppointments.schedule(active.day).startAt){const changes=node('div',null,'actions');for(const [label,targetDay]of [['改约今天18点',C.day],['改约明天18点',C.day+1]]){if(targetDay===active.day||C.abs()>=window.SocialAppointments.schedule(targetDay).startAt)continue;changes.append(button(label,()=>{const r=A.offerReschedule(targetDay);if(r.ok){proposal=r;render();note.textContent='先确认新日期；未确认前保留原约定。';}else note.textContent=r.reason;},true));}body.append(changes);body.append(node('p','需要当面和小林确认。原约定开始后不能提前改期。','hint'));}
  }else{const row=node('div',null,'actions');for(const [text,d]of [['约今天18点',C.day],['约明天18点',C.day+1]])row.append(button(text,()=>{const r=A.offer(d);if(r.ok){proposal=r;render();note.textContent='确认后才会记下这次约定。';}else note.textContent=r.reason;}));body.append(row);body.append(node('p','需要走近小林，熟悉度达到2。忙碌、天气或已有安排都可能影响约定。','hint'));}
  if(state.trust<0)body.append(button('当面解释上次失约',()=>report(A.explain()),true));
  const past=state.history.slice(-5).reverse();if(past.length){body.append(node('h3','此前的约定','past-title'));for(const h of past){const card=node('div',null,'past');card.append(node('span',day(h.day)+' · 阅读'),node('strong',labels[h.outcome]||h.outcome));body.append(card);}}
 }
 function show(){
  if(G.activity||G.trans){SP.toast?.('先结束当前活动，再查看约定。');return {ok:false};}
  SP.socialEncountersLive?.close();SP.phone?.close?.();SP.touchRelease?.();rootBlur();
  const nav=D.querySelector('#community-touch-tools nav');if(nav)nav.hidden=true;const toggle=D.getElementById('community-tools-toggle');if(toggle){toggle.textContent='工具';toggle.setAttribute('aria-expanded','false');}
  if(!panel){const style=node('style');style.textContent=`
#reading-appointments[hidden]{display:none}#reading-appointments{position:fixed;inset:0;z-index:1700;display:grid;place-items:center;background:#0a1217aa;color:#25323d;font:15px/1.65 system-ui;color-scheme:light}
#reading-appointments *{box-sizing:border-box}#reading-appointments section{display:flex;flex-direction:column;max-height:calc(100dvh - 24px);width:min(480px,calc(100vw - 24px));background:#f2f5f5;overflow:hidden;border:1px solid #fff6;border-radius:20px;box-shadow:0 24px 80px #0006}
#reading-appointments header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px;color:#fff;background:#20363e;border-bottom:3px solid #c5a66f}#reading-appointments h2{font-size:21px;margin:0}#reading-appointments h3{font-size:17px;margin:6px 0}#reading-appointments header small{color:#d5e0e2;font-size:11px}
#reading-appointments button{font:600 13px/1.4 system-ui;min-height:44px;border:1px solid #315967;border-radius:10px;background:#315967;color:#fff;padding:10px 14px;cursor:pointer;touch-action:manipulation}#reading-appointments button.secondary{background:#fff;color:#315967;border-color:#b4c6cd}#reading-appointments button:focus-visible{outline:3px solid #b58232;outline-offset:2px}
#reading-appointments .body{overflow:auto;overscroll-behavior:contain;padding:18px 20px}#reading-appointments .intro{margin:0 0 18px;color:#465f6a}#reading-appointments .card{border:1px solid #cedbdf;border-left:3px solid #bc9f69;border-radius:12px;background:#fff;padding:16px;margin-bottom:18px}#reading-appointments .card small{color:#617780}#reading-appointments p{margin:6px 0 16px}#reading-appointments .actions{display:flex;gap:8px;flex-wrap:wrap}#reading-appointments .hint{font-size:12px;color:#5b7079;margin-top:12px}#reading-appointments .past-title{margin-top:24px}#reading-appointments .past{display:flex;justify-content:space-between;gap:12px;border-top:1px solid #d5dfe2;padding:12px 0;font-size:12px}#reading-appointments .past strong{color:#385c65}#reading-appointments .note{margin:0;padding:10px 20px 14px;background:#e7eeef;color:#3d5964;font-size:12px;min-height:42px;flex-shrink:0}
@media(max-height:420px){#reading-appointments header{padding:8px 16px}#reading-appointments h2{font-size:17px}#reading-appointments .body{padding:12px 16px}#reading-appointments .intro{margin-bottom:10px}}
`;D.head.append(style);panel=node('div');panel.id='reading-appointments';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','阅读约定');const section=node('section'),header=node('header'),heading=node('div');heading.append(node('h2','赴一场阅读之约'),node('small','小林 · 社区阅览室'));header.append(heading,button('关闭',close,true));body=node('div',null,'body');note=node('p','先当面说好，再留出彼此的时间。','note');note.setAttribute('role','status');section.append(header,body,note);panel.append(section);D.body.append(panel);for(const ev of ['touchstart','touchmove','touchend'])panel.addEventListener(ev,e=>e.stopPropagation(),{passive:true});}
  proposal=null;panel.hidden=false;render();return {ok:true};
 }
 window.addEventListener('keydown',e=>{if(!open())return;if(e.key==='Escape'){e.preventDefault();close();}e.stopImmediatePropagation();},true);
 for(const [host,id]of [[D.getElementById('bar'),'reading-appointment-launch'],[D.querySelector('#community-touch-tools nav'),'reading-appointment-mobile']])if(host){const b=button('阅读约定',show);b.id=id;host.append(b);}
 refresh=setInterval(()=>{if(!G.ps)return;/* title screen / owner swap: no save is loaded yet, nothing to refresh */const s=A.state();if(open()&&!proposal&&body.dataset.active!==String(s.active?.id+':'+s.active?.status+':'+s.history.length)){body.dataset.active=String(s.active?.id+':'+s.active?.status+':'+s.history.length);render();}},500);
 SP.appointmentsUI={show,close,isOpen:open};
})(window.SP);
