/* Civilian-facing community police service room; lost-property rules are a separate additive module. */
(function(root){
  'use strict';
  const ID='community_civic_room',ENTRY='community_civic_door',clone=v=>JSON.parse(JSON.stringify(v));
  function createScene(source){
    if(!source)throw new Error('community_civic: store_24 shell is missing');
    const s=clone(source);s.id=ID;s.name='槐东社区警务站 · 便民服务';s.spawn=[4.5,.95,'N'];
    s.objects=(s.objects||[]).filter(o=>['i_wall','i_cut','i_side','i_window','st_front13','st_front145','st_frontdoor'].includes(o.type)).map(o=>{
      if(['i_wall','i_cut','i_side','i_window'].includes(o.type))o.state='plain';
      const fronts={st_front13:'community_front13',st_front145:'community_front145',st_frontdoor:'community_frontdoor'};
      if(fronts[o.type])o.type=fronts[o.type];return o;
    });
    s.ground.legend={T:'g_terrazzo'};s.ground.data_south_to_north=['TTTT','TTTT','TTTT'];
    s.objects.push(
      {id:'community_civic_counter',type:'f_desk',x:5.9,y:2.5,state:'on',rot:4,interact:'community_civic_counter',name:'便民服务台',reach:[5.9,1.8]},
      {id:'community_civic_waiting_chair_1',type:'f_chair',x:1.5,y:2.2,rot:0},
      {id:'community_civic_waiting_chair_2',type:'f_chair',x:2.5,y:2.2,rot:0},
      {id:'community_civic_waiting_chair_3',type:'f_chair',x:3.5,y:2.2,rot:0},
      {id:'community_civic_archive_1',type:'f_wardrobe',x:1.3,y:5.3,state:'closed',rot:0,name:'登记档案柜'},
      {id:'community_civic_archive_2',type:'f_wardrobe',x:2.5,y:5.3,state:'closed',rot:0,name:'便民资料柜'},
      {id:'community_civic_reference',type:'f_shelf',x:7.4,y:4.3,rot:2},
      {id:'community_civic_plant_front',type:'p_planter',x:1.15,y:1.1,rot:0},
      {id:'community_civic_plant_north',type:'p_planter',x:7.2,y:5.3,rot:0},
      {id:'community_civic_notice',type:'i_notice',x:4.2,y:5.96,z:1.3,rot:0,interact:'community_civic_notice',name:'便民服务公告',reach:[4.2,5.15],note:'槐东社区警务站 · 文明办理 · 便民咨询与失物登记 · 值班 09:00–17:00'},
      {id:'community_civic_lost_notice',type:'i_notice',x:5.5,y:5.96,z:1.3,rot:0,interact:'community_civic_notice',name:'失物招领公告',reach:[5.5,5.15],note:'失物招领 · 拾得物品请交服务台登记 · 请勿自行取走他人物品'},
      {id:'community_civic_lamp_1',type:'i_pendant',x:2.7,y:3.5,state:'on'},
      {id:'community_civic_lamp_2',type:'i_pendant',x:5.4,y:4.4,state:'on'}
    );
    s.portals=[{id:'community_civic_exit',rect:[3.95,.15,5.05,.5],dir:'S',to:'street',spawn:[100.5,33.9,'N'],label:'出门 · 回到社区警务站外'}];
    s.npcs=[];delete s.store_npcs;delete s.staff_spot;delete s.layout_check;return s;
  }
  function register(host){
    const SP=host.SP;if(!SP||!SP.game||!SP.world||!SP.scenes)return null;if(SP.communityCivic)return SP.communityCivic;
    const G=SP.game,W=SP.world,C=SP.clock,scene=createScene(host.STORE45&&host.STORE45.store_24);
    SP.scenes[ID]=scene;const use0=G.use,action0=G.actionFor,update0=G.update;
    G.actionFor=function(o,kind){if(!W.interior&&o&&o.id===ENTRY&&kind==='use')return{label:'进入社区警务站',do:'game'};return action0.call(G,o,kind);};
    G.use=function(o){if(!W.interior&&o&&o.id===ENTRY){G.go({to:ID,spawn:scene.spawn,door:o.id});return null;}return use0.call(G,o);};
    let staff=null;const openHours=()=>C.min>=540&&C.min<1020;
    function syncStaff(){
      if(!W.interior||W.sceneId!==ID||!openHours()){if(staff)SP.actors.list=SP.actors.list.filter(a=>a!==staff);staff=null;return;}
      if(!staff){
        // The baseline vendor actor is civilian clothing, not a fabricated police uniform.
        staff=new SP.Actor({id:'community_civic_staff',set:'vendor',x:5.9,y:3.3,radius:.22,speed:0,height:1.8,name:'林值班员',staff:true});
        staff.setDir('S');if(SP.ensureActor&&!SP.img.actor_vendor)SP.ensureActor('vendor');SP.actors.list.push(staff);
      }
    }
    G.update=function(dt,gm){update0.call(G,dt,gm);syncStaff();};
    return SP.communityCivic={id:ID,entryId:ENTRY,scene,staff:()=>staff,openHours,syncStaff};
  }
  const api={ID,ENTRY,createScene,register};if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.CommunityCivic=api;if(root.SP)register(root);
})(typeof window!=='undefined'?window:globalThis);
