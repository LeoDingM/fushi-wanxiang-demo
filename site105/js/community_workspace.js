/* Neighbor workspace: additive room and staff only. Job rules live in community_work.js. */
(function(root){
  'use strict';
  const ID='community_workspace_room',ENTRY='community_workspace_door';
  const clone=v=>JSON.parse(JSON.stringify(v));
  function createScene(source){
    if(!source)throw new Error('community_workspace: store_24 shell is missing');
    const s=clone(source);s.id=ID;s.name='邻里共创 · 共享工作室';s.spawn=[4.5,.95,'N'];
    s.objects=(s.objects||[]).filter(o=>['i_wall','i_cut','i_side','i_window','st_front13','st_front145','st_frontdoor'].includes(o.type)).map(o=>{
      if(['i_wall','i_cut','i_side','i_window'].includes(o.type))o.state='plain';
      const fronts={st_front13:'community_front13',st_front145:'community_front145',st_frontdoor:'community_frontdoor'};
      if(fronts[o.type])o.type=fronts[o.type];return o;
    });
    s.ground.legend={T:'g_wood:a',U:'g_wood:b'};s.ground.data_south_to_north=['TUTU','UTUT','TUTU'];
    s.objects.push(
      {id:'community_work_desk',type:'f_desk',x:1.6,y:3.4,state:'on',rot:0,interact:'community_work_desk',name:'共享电脑工位',reach:[1.6,2.7]},
      {id:'community_work_desk_secondary',type:'f_desk',x:3.5,y:3.4,state:'on',rot:0,name:'备用电脑工位'},
      {id:'community_work_chair_1',type:'f_chair',x:1.6,y:4.2,rot:0},
      {id:'community_work_chair_2',type:'f_chair',x:3.5,y:4.2,rot:0},
      {id:'community_work_counter',type:'f_desk',x:6.4,y:1.6,state:'on',rot:4,interact:'community_work_counter',name:'工作室接待台',reach:[6.4,.95]},
      {id:'community_work_reference_1',type:'f_shelf',x:1.3,y:5.45,rot:0},
      {id:'community_work_reference_2',type:'f_shelf',x:2.3,y:5.45,rot:0},
      {id:'community_work_reference_3',type:'f_shelf',x:3.3,y:5.45,rot:0},
      {id:'community_work_meeting_table',type:'f_table',x:6,y:4.3,rot:0},
      {id:'community_work_meeting_chair_1',type:'f_chair',x:5.25,y:4.3,rot:4},
      {id:'community_work_meeting_chair_2',type:'f_chair',x:6.75,y:4.3,rot:0},
      {id:'community_work_plant_north',type:'p_planter',x:7.25,y:5.25,rot:0},
      {id:'community_work_plant_front',type:'p_planter',x:1.1,y:1.15,rot:0},
      {id:'community_work_notice',type:'i_notice',x:5,y:5.96,z:1.3,rot:0,interact:'community_work_notice',name:'工作室公告',reach:[5,5.15],note:'邻里共创 · 请轻声交流 · 工位用后整理 · 接待时间 09:00–20:00'},
      {id:'community_work_lamp_1',type:'i_pendant',x:2.5,y:2.15,state:'on'},
      {id:'community_work_lamp_2',type:'i_pendant',x:5.6,y:3.35,state:'on'}
    );
    s.portals=[{id:'community_workspace_exit',rect:[3.95,.15,5.05,.5],dir:'S',to:'street',spawn:[117.5,17.9,'N'],label:'出门 · 回到邻里共创外'}];
    s.npcs=[];delete s.store_npcs;delete s.staff_spot;delete s.layout_check;
    return s;
  }
  function register(host){
    const SP=host.SP;if(!SP||!SP.game||!SP.world||!SP.scenes)return null;
    if(SP.communityWorkspace)return SP.communityWorkspace;
    const G=SP.game,W=SP.world,C=SP.clock,source=host.STORE45&&host.STORE45.store_24;
    if(!source)throw new Error('community_workspace: load after store45.js and community_room.js');
    const scene=createScene(source);SP.scenes[ID]=scene;
    const action0=G.actionFor,use0=G.use,update0=G.update;
    G.actionFor=function(o,kind){
      if(!W.interior&&o&&o.id===ENTRY&&kind==='use')return{label:'进入邻里共创工作室',do:'game'};
      return action0.call(G,o,kind);
    };
    G.use=function(o){
      if(!W.interior&&o&&o.id===ENTRY){G.go({to:ID,spawn:scene.spawn,door:o.id});return null;}
      return use0.call(G,o);
    };
    let staff=null;
    const openHours=()=>C.min>=540&&C.min<1200;
    function syncStaff(){
      if(!W.interior||W.sceneId!==ID||!openHours()){
        if(staff)SP.actors.list=SP.actors.list.filter(a=>a!==staff);staff=null;return;
      }
      if(!staff){
        staff=new SP.Actor({id:'community_workspace_staff',set:'vendor',x:6.4,y:2.4,radius:.22,speed:0,height:1.8,name:'小周',staff:true});
        staff.setDir('S');if(SP.ensureActor&&!SP.img.actor_vendor)SP.ensureActor('vendor');SP.actors.list.push(staff);
      }
    }
    G.update=function(dt,gm){update0.call(G,dt,gm);syncStaff();};
    SP.communityWorkspace={id:ID,entryId:ENTRY,scene,staff:()=>staff,openHours,syncStaff};
    return SP.communityWorkspace;
  }
  const api={ID,ENTRY,createScene,register};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.CommunityWorkspace=api;if(root.SP)register(root);
})(typeof window!=='undefined'?window:globalThis);
