/* The street pavilion is an above-ground sprite with a descending stairwell.
   The kit's below-ground exterior must not appear as a raised street plinth.
   Keep its original pixel art, stair opening, roof, sign and light channels. */
(function (SP) {
  'use strict';
  const P = SP.K.pieces.p_metro_entry;
  if (!P) return;
  for (const g of Object.values(P.geo || {})) if (g.base) g.base[2] = 0;
  const profiles = new Map();
  function profile(key) {
    if (!key || !/^p_metro_entry\/[^/]+\/base\/(open|shut)\/[0246]$/.test(key)) return null;
    if (profiles.has(key)) return profiles.get(key);
    const rot = +key.split('/').pop(), a = rot * Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
    const points = [[-1.75,-2.58],[1.75,-2.58],[1.75,2.73],[-1.75,2.73]].map(([x,y]) => {
      const wx = x*c-y*s, wy=x*s+y*c; return SP.scr(wx,wy,0);
    });
    const left = points.reduce((a,b)=>a[0]<b[0]?a:b), right = points.reduce((a,b)=>a[0]>b[0]?a:b);
    const front = points.reduce((a,b)=>a[1]>b[1]?a:b), f = SP.frame(key);
    const p = [[-f[4],-f[5]-1],[f[2]-f[4],-f[5]-1],right,front,left];
    profiles.set(key,p); return p;
  }
  for (const name of ['drawFrame','drawEmit','eraseFrame']) {
    const draw = SP[name];
    SP[name] = function (ctx,key,x,y,...args) {
      const p=profile(key); if (!p) return draw.call(this,ctx,key,x,y,...args);
      const X=Math.round(x),Y=Math.round(y);
      ctx.save();ctx.beginPath();p.forEach(([u,v],i)=>i?ctx.lineTo(X+u,Y+v):ctx.moveTo(X+u,Y+v));
      ctx.closePath();ctx.clip();draw.call(this,ctx,key,x,y,...args);ctx.restore();
    };
  }
  SP.metroEntry = {profile};
})(window.SP);
