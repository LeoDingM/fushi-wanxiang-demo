/* One resident's clock-driven route through the neighborhood and reading room. */
(function(SP){
 'use strict';
 if(!SP.game||SP.communityRoutines)return;
 const G=SP.game,W=SP.world,C=SP.clock,ROOM='community_reading_room',CANTEEN='community_canteen_room';
 // Existing street indices are stable for I4 saves. Node 7 is the bookshop door;
 // canteen nodes are appended so older saved routes keep their meaning.
 const streetNodes=[[86.5,3.3],[101,3],[115.5,3.2],[101,12],[101,16],[110.5,16],[111.5,23],[100.5,18.1],[120,2.25],[124.5,2.25],[128,3.2],[136.5,3.6]];
 const streetEdges=[[0,1],[1,2],[1,3],[3,4],[4,5],[5,6],[4,7],[2,8],[8,9],[9,10],[10,11]];
 // The west aisle passes the bookcases without crossing the tables or the player's interaction reaches.
 const roomNodes=[[4.5,.95],[1,.95],[1,4.75],[2.5,4.75],[3.2,3.85],[4.5,.55]];
 const roomEdges=[[0,1],[1,2],[2,3],[3,4],[0,5]];
 // Approach the second table on its open south side, outside the first seat's reach.
 const canteenNodes=[[4.5,.95],[4.5,1.55],[4.2,2.15],[3.3,2.15],[4.5,.55]];
 const canteenEdges=[[0,1],[1,2],[2,3],[0,4]];
 const nodesFor=scene=>scene===ROOM?roomNodes:scene===CANTEEN?canteenNodes:streetNodes;
 const edgesFor=scene=>scene===ROOM?roomEdges:scene===CANTEEN?canteenEdges:streetEdges;
 function linksFor(scene){
   const links=nodesFor(scene).map(()=>[]);
   for(const[a,b]of edgesFor(scene)){links[a].push(b);links[b].push(a);}
   return links;
 }
 const streetLinks=linksFor('street'),roomLinks=linksFor(ROOM),canteenLinks=linksFor(CANTEEN);
 const plan=()=>C.min<480||C.min>=1200?{phase:'home',scene:'street',target:0}:
   C.weather==='rain'&&C.intensity>.35?{phase:'rain-home',scene:'street',target:0}:
   C.min<810&&C.min>=720?{phase:'lunch-canteen',scene:CANTEEN,target:3}:
   C.min<720?{phase:'morning-errands',scene:'street',target:2}:
   C.min<1020?{phase:'afternoon-errands',scene:'street',target:2}:
   {phase:'evening-reading',scene:ROOM,target:4};
 let actor=null,record=null;
 function remove(){
   if(actor){
     SP.actors.list=SP.actors.list.filter(a=>a!==actor);
     if(SP.place.npcs)SP.place.npcs=SP.place.npcs.filter(a=>a!==actor);
   }
   actor=null;
 }
 function state(){
   if(!G.ps)return null;
   const all=G.ps.communityRoutines||(G.ps.communityRoutines={});
   if(!all.lin)all.lin={scene:'street',x:streetNodes[0][0],y:streetNodes[0][1],node:0,path:[],phase:'home',hidden:true,lastAbs:C.abs()};
   if(record!==all.lin){remove();record=all.lin;}
   // I4 records have no scene and use street node 6 at the old corridor centre.
   if(!record.scene)record.scene='street';
   if(record.scene==='street'&&record.node===6&&Math.hypot(record.x-110.5,record.y-23)<.04){
     record.x=streetNodes[6][0];record.y=streetNodes[6][1];
     if(actor){actor.x=record.x;actor.y=record.y;}
   }
   return record;
 }
 function route(scene,from,to){
   const links=scene===ROOM?roomLinks:scene===CANTEEN?canteenLinks:streetLinks;
   const prev=new Map([[from,null]]),q=[from];
   for(let i=0;i<q.length&&!prev.has(to);i++)for(const n of links[q[i]])if(!prev.has(n)){prev.set(n,q[i]);q.push(n);}
   const out=[];for(let n=to;n!==from&&n!=null;n=prev.get(n))out.unshift(n);return out;
 }
 function destination(s,goal){
   if(s.scene===ROOM)return goal.scene===ROOM?goal.target:5;
   if(s.scene===CANTEEN)return goal.scene===CANTEEN?goal.target:4;
   return goal.scene===ROOM?7:goal.scene===CANTEEN?11:goal.target;
 }
 function streetDestination(goal){return goal.scene===ROOM?7:goal.scene===CANTEEN?9:goal.target;}
 function routeToward(s,goal){
   const target=destination(s,goal);
   if(s.phase===goal.phase&&(s.path.length?s.path[s.path.length-1]===target:s.node===target))return;
   const first=s.path.length?s.path[0]:s.node;
   s.path=(s.path.length?[first]:[]).concat(route(s.scene,first,target));
   s.phase=goal.phase;
 }
 function transition(s,goal){
   if(s.path.length)return false;
   if(s.scene==='street'&&s.node===7&&goal.scene===ROOM){
     remove();s.scene=ROOM;s.node=0;s.x=roomNodes[0][0];s.y=roomNodes[0][1];
     // Browse the shelves before settling at a clear reading spot beside the table.
     s.path=[1,2,3,4];s.hidden=false;return true;
   }
   if(s.scene==='street'&&s.node===11&&goal.scene===CANTEEN){
     remove();s.scene=CANTEEN;s.node=0;s.x=canteenNodes[0][0];s.y=canteenNodes[0][1];
     s.path=route(CANTEEN,0,goal.target);s.hidden=false;return true;
   }
   if(s.scene===CANTEEN&&s.node===4&&goal.scene!==CANTEEN){
     remove();s.scene='street';s.node=11;s.x=136.5;s.y=3.4;
     s.path=route('street',11,streetDestination(goal));s.hidden=false;return true;
   }
   if(s.scene===ROOM&&s.node===5&&goal.scene!==ROOM){
     remove();s.scene='street';s.node=7;s.x=100.5;s.y=17.9;
     s.path=route('street',7,streetDestination(goal));s.hidden=false;return true;
   }
   return false;
 }
 function observable(s){
   const here=s.scene==='street'?!W.interior&&W.sceneId==='street'&&SP.player.level!=='roof'&&!!W.chunksIn.community_east:
     W.interior&&W.sceneId===s.scene;
   return here&&!SP.cbd?.active&&!SP.metroActive&&!s.hidden&&Math.hypot(SP.player.x-s.x,SP.player.y-s.y)<=45;
 }
 function materialize(s){
   if(!observable(s)){remove();return null;}
   if(!actor){
     actor=new SP.Actor({id:'community_resident_lin',set:'office',name:'小林',x:s.x,y:s.y,radius:.22,speed:1.1,height:1.8});
     actor.setDir(s.scene===ROOM?'N':s.scene===CANTEEN?'S':'E');
     if(!SP.actors.shapeClear(actor,s.x,s.y)){actor=null;return null;}
     SP.actors.list.push(actor);
   }
   return actor;
 }
 function update(dt){
   const s=state();if(!s)return;
   const now=C.abs();
   // The shared post-update separation pass can nudge a live actor away from a
   // player. Carry that physical position into the serializable route record.
   if(actor&&SP.actors.list.includes(actor)){
     s.x=actor.x;s.y=actor.y;
   }
   // Conversation and shared reading pin this resident in place. The clock still
   // advances, without a route backlog when the interaction ends.
   if(SP.communitySocial?.holding()||SP.communitySocial?.readingActive()){
     s.lastAbs=now;if(actor)actor.update(dt,false,actor.dir,0);return;
   }
   if(!SP.communitySocial?.holding()&&!SP.communitySocial?.readingActive()&&SP.socialFlow?.stepActor?.('community_resident_lin',actor,s.scene,dt)){s.lastAbs=now;s.x=actor.x;s.y=actor.y;return;}
   const goal=plan();routeToward(s,goal);transition(s,goal);
   s.hidden=s.scene==='street'&&goal.target===0&&s.node===0&&!s.path.length;
   let a=materialize(s);
   const elapsed=Math.max(0,now-s.lastAbs);s.lastAbs=now;
   // When the player can see this scene, a blocked spawn must wait; proxy walking
   // here would let the resident pass through the player and reappear farther on.
   if(!a&&observable(s))return;
   let budget=Math.min(elapsed,1440)*1.1,moved=0,steps=0;
   while(budget>.00001&&steps++<20000){
     if(!s.path.length){if(transition(s,goal)){a=materialize(s);if(!a&&observable(s))break;continue;}break;}
     const next=s.path[0],p=nodesFor(s.scene)[next],dx=p[0]-s.x,dy=p[1]-s.y,d=Math.hypot(dx,dy);
     if(d<.025){
       s.x=p[0];s.y=p[1];if(a){a.x=s.x;a.y=s.y;}
       s.node=next;s.path.shift();
       if(transition(s,goal)){a=materialize(s);if(!a&&observable(s))break;}
       continue;
     }
     const step=Math.min(.12,budget,d),vx=dx/d*step,vy=dy/d*step;
     if(a){const n=SP.actors.move(a,vx,vy);s.x=a.x;s.y=a.y;moved+=n;if(n<step*.1)break;}
     else{s.x+=vx;s.y+=vy;moved+=step;}
     budget-=step;
     if(a)a.setDir(SP.dirFromWorld(vx,vy));
   }
   if(a){
     if(s.scene===ROOM&&s.node===4&&!s.path.length)a.setDir('S');
     if(s.scene===CANTEEN&&s.node===3&&!s.path.length)a.setDir('N');
     a.update(dt,moved>0,a.dir,moved);
   }
   if(s.scene==='street'&&goal.target===0&&s.node===0&&!s.path.length){s.hidden=true;remove();}
 }
 const old=G.update;G.update=function(dt,gm){const result=old.apply(this,arguments);update(dt);return result;};
 SP.communityRoutines={nodes:streetNodes,edges:streetEdges,streetNodes,streetEdges,roomNodes,roomEdges,canteenNodes,canteenEdges,nodesFor,edgesFor,state,plan,actor:()=>actor,update};
})(window.SP);
