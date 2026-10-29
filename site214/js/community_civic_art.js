/* Civic station only. Load manifest + data after community/east extensions,
   before core. All old window IDs/types/states and the real door contract stay. */
(function () {
  'use strict';
  const A=window.KIT_COMMUNITY_CIVIC_MANIFEST,E=window.COMMUNITY_CIVIC_ART_DATA;
  const KI=window.KIT_INT_MANIFEST,K=window.KIT_MANIFEST,SK=window.STORE_KIT;
  if(!A||!E||!KI||!K||!SK)throw new Error('Civic art requires manifest/data/store kit before core');
  if(window.COMMUNITY_CIVIC_ART)return;
  const bottom=Math.max(SK.size[1],...Object.values(KI.frames).map(f=>f[1]+f[3]));
  const off=bottom+130;
  for(const [key,f]of Object.entries(A.frames))KI.frames[key]=[f[0],f[1]+off,...f.slice(2,6)];
  Object.assign(KI.pieces,A.pieces);Object.assign(KI.masks,A.masks);
  KI.emit=(KI.emit||[]).concat(A.emit);
  // Street piece wins in core: merge only new geometry variants into it.
  K.pieces.f_window.geo_var=Object.assign({},K.pieces.f_window.geo_var,E.windowGeo);
  K.pieces.f_window.variants=Array.from(new Set((K.pieces.f_window.variants||['base']).concat(Object.keys(E.windowGeo))));
  const sourceStates={};
  function transform(chunk){
    if(!chunk||chunk.civicArtVersion===E.version)return chunk;
    const objects=[];
    for(const o of chunk.objects){
      if(E.removedIds.includes(o.id))continue;
      const replacement=E.replacements[o.id];
      if(replacement){sourceStates[o.id]=o.state;objects.push(Object.assign({},replacement,{state:o.state||replacement.state}));}
      else objects.push(o);
    }
    objects.push(...E.extraObjects.map(o=>Object.assign({},o)));
    return Object.assign({},chunk,{objects,civicArtVersion:E.version});
  }
  const chunks=window.SCENE_CHUNKS||(window.SCENE_CHUNKS={});
  let current=transform(chunks.community_east);
  Object.defineProperty(chunks,'community_east',{configurable:true,enumerable:true,get:()=>current,set:value=>{current=transform(value);}});
  window.SCENE_DATA.communityCivicArtVersion=E.version;
  const base=document.currentScript.src.replace(/js\/community_civic_art\.js.*$/,''),compose=SK.compose;
  const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Missing civic atlas '+src));im.src=src;});
  let pending;
  SK.compose=function(SP){return compose(SP).then(()=>pending||(pending=Promise.all([load(base+'kit_community_civic/kit_atlas.png'),load(base+'kit_community_civic/kit_emit.png')]).then(([atlas,emit])=>{
    for(const [key,bot]of [['int_atlas',atlas],['int_emit',emit]]){
      const top=SP.img[key],c=document.createElement('canvas');c.width=Math.max(top.width,bot.width);c.height=off+bot.height;
      const ctx=c.getContext('2d');ctx.drawImage(top,0,0);ctx.drawImage(bot,0,off);SP.img[key]=c;
    }
  })));};
  window.COMMUNITY_CIVIC_ART={version:E.version,atlasOffset:off,transform,windowIds:E.windowIds,removedIds:E.removedIds,sourceStates,contract:E};
})();
