/* Adult visual variation for existing routes. No new population or positions.
 * Designed fictional age / body profiles; existing clothing and roles retained. */
(function(SP){'use strict';if(!SP.npcs||!SP.npcDiversity)return;const N=SP.npcs,init0=N.init;
function profile(a){let h=2166136261;for(const c of a.id)h=Math.imul(h^c.charCodeAt(0),16777619);h>>>=0;const D=SP.npcDiversity,cast=D.HAIR_CAST&&Object.hasOwn(D.HAIR_CAST,a.id)?D.HAIR_CAST[a.id]:null,pool=(D.HAIR_POOLS&&D.HAIR_POOLS.neutral)||Object.keys(D.HAIR).filter(k=>k!=='bald');return{ageYears:22+h%39,heightCm:[160,166,172,178,184][h%5],gender:'unspecified',presentation:'neutral',job:'civilian',body:['slim','average','average','broad'][h%4],hair:cast||pool[h%pool.length]};}
N.init=function(){const result=init0.apply(this,arguments);for(const a of result)if(!a.vehicle){const p=a.brain.spec.diversity||profile(a);let r=SP.npcDiversity.adapt(a,p,{preserveSet:true});if(!r.ok&&p.body==='broad')r=SP.npcDiversity.adapt(a,{...p,body:'average'},{preserveSet:true});a.diversityIntegration=r.ok?'adult visual profile applied':'retained original appearance';}return result;};
SP.npcDiversityLive={profile,policy:'adult only, preserve routes and clothing; no inferred real gender or age'};
})(window.SP);
