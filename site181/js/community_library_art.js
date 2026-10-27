/* Native library candidate: manifest/data before core; live hooks after script parsing. */
(function(){
 'use strict';
 const A=window.KIT_COMMUNITY_LIBRARY_MANIFEST,E=window.COMMUNITY_LIBRARY_ART_DATA,KI=window.KIT_INT_MANIFEST,K=window.KIT_MANIFEST,SK=window.STORE_KIT;
 if(!A||!E||!KI||!K||!SK)throw Error('Library art requires its manifest/data after existing assets before core');
 if(window.COMMUNITY_LIBRARY_ART)return;
 const off=Math.max(SK.size[1],...Object.values(KI.frames).map(f=>f[1]+f[3]))+4;
 for(const[key,f]of Object.entries(A.frames))KI.frames[key]=[f[0],f[1]+off,...f.slice(2,6)];
 Object.assign(KI.pieces,A.pieces);Object.assign(KI.masks,A.masks);KI.emit=(KI.emit||[]).concat(A.emit);
 for(const[key,b]of Object.entries(E.aliasGeo)){const[type,variant,state]=key.split('/'),P=K.pieces[type];P.geo_var=P.geo_var||{};P.geo_var[variant]=P.geo_var[variant]||{};P.geo_var[variant][state]={main:b};if(!P.variants.includes(variant))P.variants.push(variant);}
 function transform(chunk){
  if(!chunk||chunk.libraryArtVersion===E.version)return chunk;
  const objects=[];for(const o of chunk.objects){if(E.removedIds.includes(o.id))continue;const q=E.replacements[o.id];let next=q?Object.assign({},o,q,{state:o.state||q.state}):o;if(q){const match=o.id.match(/^(community_library_[SW][12]_\d+)_(wall|window)$/);next.fade_group=match?match[1]:o.id;if(match&&match[2]==='window')next._facadeFrontOf=match[1]+'_wall';}objects.push(next);}
  objects.push(...E.extraObjects.map(o=>Object.assign({},o)));
  return Object.assign({},chunk,{objects,libraryArtVersion:E.version});
 }
 const chunks=window.SCENE_CHUNKS||(window.SCENE_CHUNKS={}),previous=Object.getOwnPropertyDescriptor(chunks,'community_east');let current=transform(previous?.get?previous.get():chunks.community_east);
 Object.defineProperty(chunks,'community_east',{configurable:true,enumerable:true,get:()=>current,set:value=>{if(previous?.set){previous.set(value);value=previous.get();}current=transform(value);}});
 const base=document.currentScript.src.replace(/js\/community_library_art\.js.*$/,''),compose=SK.compose,load=src=>new Promise((yes,no)=>{const im=new Image();im.onload=()=>yes(im);im.onerror=()=>no(Error('Missing library atlas '+src));im.src=src;});let pending;
 SK.compose=function(SP){return compose(SP).then(()=>pending||(pending=Promise.all([load(base+'kit_community_library/kit_atlas.png'),load(base+'kit_community_library/kit_emit.png')]).then(([a,e])=>{for(const[key,bot]of [['int_atlas',a],['int_emit',e]]){const top=SP.img[key],c=document.createElement('canvas');c.width=Math.max(top.width,bot.width);c.height=off+bot.height;const x=c.getContext('2d');x.drawImage(top,0,0);x.drawImage(bot,0,off);SP.img[key]=c;}})));};
 const api=window.COMMUNITY_LIBRARY_ART={version:E.version,notPublished:true,atlasOffset:off,transform,contract:E.contract,windowIds:E.windowIds,shopIds:E.shopIds};
 function runtime(){
  const SP=window.SP,W=SP.world,Ly=SP.layers,windows=new Set(E.windowIds),shops=new Set(E.shopIds),shown=W.shownState,variant=W.variant;
  const warm=()=>SP.tint.night>.35&&SP.clock.min>=E.contract.libraryHours[0]&&SP.clock.min<E.contract.libraryHours[1];
  W.shownState=function(o){if(windows.has(o.id)&&['intact','lit'].includes(o.state))return warm()?'lit':'intact';return shown.call(W,o);};
  W.variant=function(o){const v=variant.call(W,o);return shops.has(o.id)&&o.state==='window'&&warm()?v+'_warm':v;};
  const check=Ly.checkLit,render=Ly.render;let last=null;
  function sync(){const value=W.sceneId+'|'+warm();if(last!==value){last=value;Ly.invalidate();}}
  Ly.checkLit=function(){sync();return check.apply(Ly,arguments);};Ly.render=function(){sync();return render.apply(Ly,arguments);};
  api.warm=warm;api.runtimeReady=true;
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',runtime,{once:true});else runtime();
})();
