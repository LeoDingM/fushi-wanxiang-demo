/* I7 room geometry, entries and ordinary-clothed staff. Service rules are separate modules. */
(function(root){
 'use strict';const clone=v=>JSON.parse(JSON.stringify(v));
 const contracts={
  canteen:{id:'community_canteen_room',entry:'community_canteen_door',name:'槐东社区食堂',returnSpawn:[136.5,3.4,'N'],hours:[420,1200],staffId:'community_canteen_staff',staffName:'陈阿姨',staffAt:[5.9,4.65]},
  repair:{id:'community_repair_room',entry:'community_repair_door',name:'老陈修车铺',returnSpawn:[151.5,3.4,'N'],hours:[540,1080],staffId:'community_repair_staff',staffName:'陈师傅',staffAt:[5.9,3.5]}
 };
 function createScene(source,key){
  if(!source)throw new Error('community_service_rooms: store_24 shell missing');
  const c=contracts[key],s=clone(source);s.id=c.id;s.name=c.name;s.spawn=[4.5,.95,'N'];
  s.objects=s.objects.filter(o=>['i_wall','i_cut','i_side','i_window','st_front13','st_front145','st_frontdoor'].includes(o.type)).map(o=>{
   if(['i_wall','i_cut','i_side','i_window'].includes(o.type))o.state=key==='canteen'?'tile':'plain';
   const f={st_front13:'community_front13',st_front145:'community_front145',st_frontdoor:'community_frontdoor'};if(f[o.type])o.type=f[o.type];return o;
  });
  s.ground.legend={T:key==='canteen'?'g_tile':'g_terrazzo'};s.ground.data_south_to_north=['TTTT','TTTT','TTTT'];
  if(key==='canteen')s.objects.push(
   {id:'community_canteen_counter',type:'s_counter',x:5.9,y:3.8,rot:4,interact:'community_canteen_counter',name:'堂食供餐台',reach:[5.9,3.1]},
   {id:'community_canteen_pack',type:'s_counter',x:5.9,y:1.6,rot:4,interact:'community_canteen_pack',name:'便当打包台',reach:[5.9,.95]},
   {id:'community_canteen_table_1',type:'f_table',x:1.55,y:3.3},
   {id:'community_canteen_seat',type:'f_stool',x:1.55,y:2.8,interact:'community_canteen_seat',name:'靠窗堂食座位',reach:[1.55,2.15]},
   {id:'community_canteen_chair_1',type:'f_chair',x:1.55,y:3.95,rot:4},
   {id:'community_canteen_table_2',type:'f_table',x:3.3,y:3.3},
   {id:'community_canteen_stool_2',type:'f_stool',x:3.3,y:2.8},
   {id:'community_canteen_chair_2',type:'f_chair',x:3.3,y:3.95,rot:4},
   {id:'community_canteen_kitchen',type:'f_kitchen',x:3.3,y:5.3,state:'cooking'},
   {id:'community_canteen_fridge',type:'f_fridge',x:7.2,y:5.3,state:'closed'},
   {id:'community_canteen_pantry',type:'f_wardrobe',x:1.3,y:5.3,state:'closed'},
   {id:'community_canteen_plant',type:'p_planter',x:1.1,y:1.15},
   {id:'community_canteen_notice',type:'i_notice',x:5,y:5.96,z:1.3,interact:'community_service_notice',name:'食堂用餐须知',reach:[5,5.15],note:'槐东社区食堂 · 07:00–20:00 · 用餐后请整理桌面 · 便当到门口打包台领取'},
   {id:'community_canteen_lamp_1',type:'i_pendant',x:2.5,y:2.25,state:'on'},
   {id:'community_canteen_lamp_2',type:'i_pendant',x:5.5,y:3.1,state:'on'}
  );else s.objects.push(
   {id:'community_repair_counter',type:'s_counter',x:5.9,y:2.7,rot:4,interact:'community_repair_counter',name:'维修接待台',reach:[5.9,2]},
   {id:'community_repair_workbench',type:'f_table',x:2.1,y:3},
   {id:'community_repair_bench_stool',type:'f_stool',x:1.3,y:3},
   {id:'community_repair_indoor_bike',type:'p_bike',x:2.1,y:4.1,rot:2,state:'parked'},
   {id:'community_repair_parts_cabinet_1',type:'f_wardrobe',x:1.15,y:5.3,state:'closed'},
   {id:'community_repair_parts_cabinet_2',type:'f_wardrobe',x:3.8,y:5.3,state:'closed'},
   {id:'community_repair_reference',type:'f_shelf',x:7.4,y:4.7,rot:2},
   {id:'community_repair_waiting_chair',type:'f_chair',x:1.5,y:1.6},
   {id:'community_repair_plant',type:'p_planter',x:7.2,y:5.35},
   {id:'community_repair_notice',type:'i_notice',x:5,y:5.96,z:1.3,interact:'community_service_notice',name:'修车服务公告',reach:[5,5.15],note:'老陈修车铺 · 09:00–18:00 · 公共自行车维修登记 · 车辆请放到门外停放区'},
   {id:'community_repair_lamp_1',type:'i_pendant',x:2.1,y:3.8,state:'on'},
   {id:'community_repair_lamp_2',type:'i_pendant',x:5.8,y:2,state:'on'}
  );
  s.portals=[{id:'community_'+key+'_exit',rect:[3.95,.15,5.05,.5],dir:'S',to:'street',spawn:c.returnSpawn,label:'出门 · 回到'+c.name+'外'}];
  s.npcs=[];delete s.store_npcs;delete s.staff_spot;delete s.layout_check;return s;
 }
 function register(host){
  const SP=host.SP;if(!SP||!SP.scenes||!SP.game||!SP.world)return null;if(SP.communityServiceRooms)return SP.communityServiceRooms;
  const G=SP.game,W=SP.world,C=SP.clock,scenes={},staff={};
  for(const key of Object.keys(contracts)){const s=createScene(host.STORE45?.store_24,key);SP.scenes[s.id]=scenes[key]=s;}
  const open=key=>C.min>=contracts[key].hours[0]&&C.min<contracts[key].hours[1];
  const action0=G.actionFor,use0=G.use,update0=G.update;
  G.actionFor=function(o,kind){
   if(o&&kind==='use'){
    for(const[key,c]of Object.entries(contracts))if(!W.interior&&o.id===c.entry)return{label:'进入'+c.name,do:'game'};
    if(W.interior&&Object.values(contracts).some(c=>c.id===W.sceneId)){
     if(o.interact==='community_service_notice')return{label:'看服务公告',do:'game'};
     if(['community_canteen_counter','community_canteen_pack','community_canteen_seat','community_repair_counter'].includes(o.id))return{label:o.name,do:'game'};
    }
   }
   return action0.call(this,o,kind);
  };
  G.use=function(o){
   if(o){for(const[key,c]of Object.entries(contracts))if(!W.interior&&o.id===c.entry){G.go({to:c.id,spawn:scenes[key].spawn,door:o.id});return null;}
    if(W.interior&&o.interact==='community_service_notice')return o.note;
   }
   return use0.call(this,o);
  };
  function syncStaff(){for(const[key,c]of Object.entries(contracts)){
   if(!W.interior||W.sceneId!==c.id||!open(key)){if(staff[key])SP.actors.list=SP.actors.list.filter(a=>a!==staff[key]);delete staff[key];continue;}
   if(!staff[key]){const a=new SP.Actor({id:c.staffId,set:'vendor',x:c.staffAt[0],y:c.staffAt[1],radius:.22,speed:0,height:1.8,name:c.staffName,staff:true});a.setDir('S');
    if(SP.ensureActor&&!SP.img.actor_vendor)SP.ensureActor('vendor');SP.actors.list.push(a);staff[key]=a;}
  }}
  G.update=function(dt,gm){update0.call(this,dt,gm);syncStaff();};
  return SP.communityServiceRooms={scenes,canteen:scenes.canteen,repair:scenes.repair,contracts,staff:key=>staff[key]||null,open,syncStaff};
 }
 const api={contracts,createScene,register};if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.CommunityServiceRooms=api;if(root.SP)register(root);
})(typeof window!=='undefined'?window:globalThis);
