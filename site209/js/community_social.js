/* Adapted concept: donor npc_schedule.js contextual greetings and persisted affinity.
 * Uses the integration resident's actual scene and position; no donor coordinates or wrappers. */
(function(SP){
 'use strict';
 const G=SP.game,W=SP.world,C=SP.clock;
 const ROOM='community_reading_room',SHARED='community_shared_read';
 const proxy={id:'community_lin_conversation',interact:'community_social',name:'小林',_name:'小林',x:0,y:0,reach:[0,0]};
 const rules=G.rules;
 if(!rules.data.actions[SHARED])rules.data.actions[SHARED]={
   label:'和小林一起读书',place:'any',minutes:20,effects:{},text:'和小林读完了一段书'
 };
 let shared=null;
 function state(){
   const all=G.ps.communitySocial||(G.ps.communitySocial={});
   const s=all.lin||(all.lin={familiarity:0,lastGreetingDay:-1,greetings:0,lastSharedDay:-1});
   if(s.lastSharedDay==null)s.lastSharedDay=-1;
   return s;
 }
 function nearby(){
   const a=SP.communityRoutines?.actor();
   if(!a||!SP.actors.list.includes(a)||SP.player.level==='roof'||SP.cbd?.active||SP.metroActive)return false;
   const r=SP.communityRoutines.state();
   if((r.scene||'street')!==(W.interior?W.sceneId:'street')||Math.hypot(a.x-SP.player.x,a.y-SP.player.y)>1.65)return false;
   // A short clear segment prevents conversation across a wall or bookcase.
   for(let t=.15;t<1;t+=.15)if(W.blockedStatic(SP.player.x+(a.x-SP.player.x)*t,SP.player.y+(a.y-SP.player.y)*t,.04))return false;
   proxy.x=a.x;proxy.y=a.y;proxy.reach=[a.x,a.y];return true;
 }
 function holding(){return !!(G.menu&&G.menu.o===proxy&&nearby());}
 function readingActive(){return !!shared;}
 function canRead(){
   const r=SP.communityRoutines?.state(),s=state();
   if(!W.interior||W.sceneId!==ROOM||r?.scene!==ROOM)return {ok:false,reason:'到阅览室再约'};
   if(!nearby()||r.node!==4||r.path.length||Math.hypot(r.x-3.2,r.y-3.85)>.55)
     return {ok:false,reason:'等小林到阅读位'};
   if(s.familiarity<2)return {ok:false,reason:'先多打几次招呼'};
   if(s.lastSharedDay===C.day)return {ok:false,reason:'今天已经一起读过'};
   if(C.min+20>=1200-1e-6)return {ok:false,reason:'离20点回家时间太近'};
   if(C.weather==='rain'&&C.intensity>.35)return {ok:false,reason:'雨天小林要回家'};
   if(G.busy())return {ok:false,reason:'先结束当前活动'};
   return {ok:true};
 }
 function cancelRead(){
   if(!shared)return;
   shared=null;
   if(G.activity?.id===SHARED)G.activity=null;
   if(C.ff)C.ff=null;
   W.logEvent('和小林的共同阅读中断了');
 }
 function startRead(){
   const gate=canRead();if(!gate.ok)return gate.reason;
   const startAbs=C.abs(),day=C.day;
   const result=G.start(SHARED,proxy);
   if(result)return result;
   shared={day,startAbs};
   return null;
 }
 function finishRead(){
   if(!shared)return;
   const started=shared;shared=null;
   const s=state();if(s.lastSharedDay===started.day)return;
   s.lastSharedDay=started.day;
   s.familiarity=Math.min(100,s.familiarity+2);
   G.ps.needs.mood=Math.min(100,G.ps.needs.mood+3);
   W.logEvent('和小林一起读了20分钟，心情好了些，也更熟悉了');
   SP.toast('一起读书完成 · 心情 +3 · 熟悉度 +2');
 }
 function context(){
   const r=SP.communityRoutines.state();
   if(r.scene==='community_reading_room')return '小林：忙完了来翻几页书，等到八点就回家。这里的书看完要放回原处。';
   if(r.scene==='community_canteen_room')return r.phase==='lunch-canteen'?
     '小林：中午来食堂吃顿饭，歇一会儿，下午还要去快递站办事。':
     '小林：饭吃好了，我先出去，下午还得去快递站办事。';
   if(r.phase==='lunch-canteen')return '小林：我正去食堂吃午饭，吃完还要去快递站办点事。';
   const lines={home:'小林：今天就到这里，我先回家了。', 'rain-home':'小林：雨有点大，我先回去收拾一下，改天再聊。',
    'morning-errands':'小林：去快递站办点事。你也住在井槐里吗？', 'afternoon-errands':'小林：下午再跑一趟快递站，傍晚想去阅览室看看。',
    'square-break':'小林：中午在树下歇一会，比一直待在屋里舒服。', 'evening-reading':'小林：准备去阅览室，想找本书安静看一会。'};
   return lines[r.phase]||'小林：你好，今天过得怎么样？';
 }
 function greet(){
   if(!nearby())return '小林已经走远了，靠近后再打招呼吧。';
   const s=state();
   if(s.lastGreetingDay===C.day)return '小林：今天已经聊过啦，待会儿见。';
   s.lastGreetingDay=C.day;s.greetings++;s.familiarity=Math.min(100,s.familiarity+1);
   W.logEvent('和小林打了招呼，彼此更熟悉了一点');
   return s.greetings===1?'小林：你好，我是小林。常在这一带走动，以后见面打个招呼。':'小林：又见面了！住得近，常碰面也就熟悉了。';
 }
 const nearest0=W.nearest,action0=G.actionFor,use0=G.use;
 W.nearest=function(){
   const best=nearest0.apply(this,arguments);
   if(!nearby())return best;
   // Existing objects retain priority; Tab/Q can select the neighbor beside a doorway.
   W.nearList=(W.nearList||[]).concat(proxy);
   return best||proxy;
 };
 G.actionFor=function(o,kind){if(o===proxy)return kind==='use'?{label:'和小林交谈',do:'game'}:null;return action0.call(this,o,kind);};
 G.use=function(o){
   if(o!==proxy)return use0.call(this,o);
   if(!nearby())return '走近小林再聊吧。';
   const s=state();
   const opts=[
     {id:'community_lin_greet',label:s.lastGreetingDay===C.day?'今天已经打过招呼':'打个招呼',ok:true,fn:greet},
     {id:'community_lin_plan',label:'聊聊今天的安排',ok:true,fn:()=>nearby()?context():'小林已经走远了。'},
     {id:'community_lin_familiarity',label:'熟悉程度 · '+s.familiarity+'/100',ok:true,fn:()=>`和小林打过 ${state().greetings} 天招呼，熟悉程度 ${state().familiarity}/100。`}
   ];
   if(W.interior&&W.sceneId===ROOM){const gate=canRead();opts.push({id:SHARED,label:'一起读书',ok:gate.ok,reason:gate.reason,minutes:20,fn:startRead});}
   G.openMenu(proxy,opts);return null;
 };
 const update0=G.update,switch0=G.switchScene;
 G.update=function(dt,gm){
   if(shared&&(G.activity?.id!==SHARED||!W.interior||W.sceneId!==ROOM||C.min>=1200||
       C.weather==='rain'&&C.intensity>.35||!nearby()))cancelRead();
   const pending=shared;
   const result=update0.call(this,dt,gm);
   if(pending&&shared===pending&&G.activity?.id!==SHARED){
     if(!C.ff&&C.day===pending.day&&C.min<1200&&C.abs()>=pending.startAbs+20-.01&&
        W.interior&&W.sceneId===ROOM&&!(C.weather==='rain'&&C.intensity>.35))finishRead();
     else cancelRead();
   }
   return result;
 };
 G.switchScene=function(to,spawn,door){if(shared&&to!==ROOM)cancelRead();return switch0.call(this,to,spawn,door);};
 SP.communitySocial={state,nearby,holding,readingActive,canRead,startRead,cancelRead,context,proxy};
})(window.SP);
