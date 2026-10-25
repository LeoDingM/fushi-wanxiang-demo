/* Adapted from amenities_infra.js's repair frontage: a persistent, timed physical repair. */
(function(SP){
 'use strict';
 const G=SP.game,W=SP.world,C=SP.clock,ROOM='community_repair_room',BIKE='community_repair_bike',COUNTER='community_repair_counter';
 const open=()=>C.min>=540&&C.min<1080;
 function state(){return G.ps.communityRepair||(G.ps.communityRepair={status:'idle',acceptedAt:null,finishAt:null,completedAt:null,paid:0});}
 function settle(){const s=state();if(s.status==='pending'&&C.abs()>=s.finishAt){s.status='ready';W.logEvent('修车铺：门外的自行车已修好，可以来验收了。');}return s;}
 function status(){const s=settle();return s.status==='idle'?'门外倒地的公共自行车需要整理轮组、调试刹车，维修 ¥12，约三十分钟。':s.status==='pending'?'维修中，还需约 '+Math.max(0,Math.ceil(s.finishAt-C.abs()))+' 分钟；可以先去附近逛逛。':s.status==='ready'?'维修已完成，请到门外自行车旁按 E 验收。':'这辆自行车已完成维修和验收，无需重复支付。';}
 function counterNear(o){const p=W.reachPt(o);return W.interior&&W.sceneId===ROOM&&W.byId[COUNTER]===o&&Math.hypot(SP.player.x-p[0],SP.player.y-p[1])<2.4;}
 function order(o){
   const s=settle();if(!counterNear(o)||!open())return '请在 09:00–18:00 到修车铺柜台办理。';
   if(s.status!=='idle')return status();if(C.min+30>1080)return '今天剩余营业时间不足三十分钟，明早再来吧。';
   if(G.ps.money<12)return '维修需要 ¥12，零钱不够。';
   G.ps.money-=12;G.ps.stats.spent+=12;s.status='pending';s.acceptedAt=C.abs();s.finishAt=s.acceptedAt+30;s.paid=12;
   G.payCard({amount:12,method:G.rules.payLabel(G.ps),to:'槐东修车铺',what:'公共自行车维修'});G.hud();W.logEvent('委托修车铺检修门外自行车，支付 ¥12');
   return '师傅：单子接下了，三十分钟后到门外验收。';
 }
 function inspect(o){
   const s=settle();if(s.status!=='ready')return status();
   if(!W.setState(o,'parked'))return '自行车旁有人，请让出一点空间再验收。';
   s.status='completed';s.completedAt=C.abs();W.clearDecals(o.id);W.clearHazards(o.id);W.logEvent('修车验收完成，自行车已扶正并停好');
   return '自行车已扶正，轮组与刹车检查完成。维修单已结清。';
 }
 const action0=G.actionFor,use0=G.use,update0=G.update;
 G.actionFor=function(o,kind){
   if(o?.id===BIKE&&!W.interior)return kind==='use'?{label:state().status==='ready'?'验收修好的自行车':'查看自行车维修状态',do:'game'}:null;
   if(o?.id===COUNTER&&W.sceneId===ROOM)return kind==='use'?{label:'修车铺 · 维修 / 查询',do:'game'}:null;
   return action0.call(this,o,kind);
 };
 G.use=function(o){
   if(o?.id===BIKE&&!W.interior)return inspect(o);
   if(o?.id===COUNTER&&W.sceneId===ROOM){
     if(!open())return '修车师傅已经下班，营业时间 09:00–18:00。';
     const s=settle();G.openMenu(o,[{id:'community_repair_order',label:'委托修好门外自行车 · ¥12 / 30 分钟',ok:s.status==='idle'&&G.ps.money>=12&&C.min+30<=1080,reason:s.status!=='idle'?'已有维修单':G.ps.money<12?'零钱不足':'今天来不及修好',fn:()=>order(o)},
       {id:'community_repair_status',label:'查看维修单进度',ok:true,fn:status}]);return null;
   }
   return use0.call(this,o);
 };
 G.update=function(){const result=update0.apply(this,arguments);settle();return result;};
 SP.communityRepair={state,status,settle,open,room:ROOM,bikeId:BIKE,counterId:COUNTER};
})(window.SP);
