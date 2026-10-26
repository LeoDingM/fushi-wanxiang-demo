/* Explicit identity bridge. Existing owners retain all simulation and financial state. */
(function(root){'use strict';const SP=root.SP;if(!SP||SP.personRegistry)return;
 const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
 const definitions=[
 ['player','李默',['player'],[],['b12_2F-02'],'player'],
 ['daily_wen','文叔',['daily_wen'],[],[],'daily'],
 ['daily_shen','沈岚',['daily_shen'],[],[],'daily'],
 ['vendor','王阿姨',['vendor'],['vendor'],['b12_2F-01'],'social'],
 ['office','上班族',['office'],[],[],'social'],
 ['community_resident_lin','小林',['community_resident_lin'],['lin'],[],'social'],
 ['community_civic_staff','林值班员',['community_civic_staff'],['civic'],[],'social'],
 ['neighbor_zhang_host','张大爷',['neighbor_zhang_host'],[],['b12_3F-01'],'host']
 ];
 const maps=Object.fromEntries(['person','actor','contact','household'].map(k=>[k,new Map()]));
 function register(row){const[id,name,actors,contacts,households,owner]=row,d=freeze({id,personId:id,name,actorIds:actors,contactIds:contacts,householdIds:households,capabilities:{persistentDaily:owner==='daily',player:owner==='player',social:owner==='social',visitHost:owner==='host',observableDay:owner==='host'||id==='vendor',completeResident:false},authorities:owner==='daily'?['npcDailyLife']:owner==='player'?['game.ps']:owner==='social'?['socialEncounters','communitySocial','phone',...(id==='vendor'?['vendorDay']:[])]:['households','neighborVisits','neighborDay']});for(const [domain,ids]of[['person',[id]],['actor',actors],['contact',contacts],['household',households]])for(const alias of ids){if(maps[domain].has(alias))throw Error('Person registry alias collision: '+domain+':'+alias);maps[domain].set(alias,d);}return d;}
 definitions.forEach(register);
 const bad=new Set(['__proto__','prototype','constructor']);
 function resolve(id,domain='person'){return typeof id==='string'&&!bad.has(id)&&typeof domain==='string'&&Object.hasOwn(maps,domain)?maps[domain].get(id)||null:null;}
 // A source lens never leaks a mutable state object and re-reads the current owner on every access.
 function lens(read,path=[]){const current=()=>{let v=read();for(const k of path)v=v?.[k];return v;};return new Proxy(Object.create(null),{get(_,key){if(typeof key!=='string'||bad.has(key))return undefined;const v=current();if(!v||!Object.hasOwn(v,key))return undefined;return v[key]&&typeof v[key]==='object'?lens(read,path.concat(key)):typeof v[key]==='function'?undefined:v[key];},set(){return false;},deleteProperty(){return false;},defineProperty(){return false;},setPrototypeOf(){return false;},ownKeys(){return Object.keys(current()||{}).filter(k=>!bad.has(k));},getOwnPropertyDescriptor(_,key){return typeof key==='string'&&Object.hasOwn(current()||{},key)&&!bad.has(key)?{enumerable:true,configurable:true}:undefined;},getPrototypeOf(){return null;}});}
 function assetsFor(id){const d=resolve(id);if(!d)return null;const sources=[];function source(owner,read){sources.push(Object.freeze({owner,state:lens(read)}));}const ps=()=>SP.game?.ps;
 if(id==='player')source('game.ps',()=>{const s=ps();return s?{money:s.money,items:s.items,stats:s.stats}:null;});
 if(d.capabilities.persistentDaily)source('npcDailyLife',()=>ps()?.npcDailyLife?.residents?.[id]||null);
 if(d.capabilities.social){source('socialEncounters',()=>ps()?.socialEncounters?.people?.[id]||null);if(id==='community_resident_lin')source('communitySocial.lin',()=>ps()?.communitySocial?.lin||null);}
 return Object.freeze({personId:id,capabilities:d.capabilities,sources:Object.freeze(sources)});}
 function presence(id){const d=resolve(id);if(!d)return null;const a=(SP.actors?.list||[]).find(a=>a&&d.actorIds.includes(a.id)&&!a.hidden);return freeze({personId:id,visible:!!a,actorId:a?.id||null,sceneId:a?(SP.world?.interior?SP.world.sceneId:'street'):null,x:a&&Number.isFinite(a.x)?a.x:null,y:a&&Number.isFinite(a.y)?a.y:null});}
 SP.personRegistry=Object.freeze({resolve,presence,personForHousehold:id=>resolve(id,'household'),get:id=>resolve(id),all:()=>Object.freeze([...maps.person.values()]),personForActor:a=>a&&typeof a==='object'&&Object.hasOwn(a,'id')?resolve(a.id,'actor'):null,assetsFor});
})(window);
