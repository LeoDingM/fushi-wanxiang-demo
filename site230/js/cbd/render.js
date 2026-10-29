/* 云汇CBD · render: ground tiles (512 px canvases at LOD scales 1 .. 1/64; textured >= 1/4, sun shadows baked, props baked
   in at <= 1/16), building / tower parts (pattern-filled faces at the kit scale, mip-mapped facades), painter list with
   prism-order topological sort, occluder fade, and the frame compositor (ground -> sorted drawables -> lightmap ->
   emissive -> halos / aviation lights -> weather -> labels).
   LOD: near = podium-only towers + occluder fade; mid = gradual shaft; z < 0.048 full impostors; z < 0.125 skip props. */
(function (SP) {
  "use strict";
  const C = SP.cbd, X = C._; if (!X) return; C._mods.render = true;
  const { D, K, F, EF, SF, HF, IMG, TEX, W, TR, NPC, FX, cam, tiles, IMP, SX, SY, KX, KY, PZ, SUN, clamp, hash, overlap, hull, partPoly, scrRect, inPoly, rectPoly } = X;
  const TS = 512; let tileBudget = 0, _mask = null;
  const tileScale = (z) => Math.pow(2, -clamp(Math.floor(Math.log2(1 / z) + 1e-9), 0, 6));
  X.shadowA = () => { const ck = SP.clock; return ck ? ck.shadow * (1 - 0.7 * X.night()) : 0.32; };
  const groundKey = () => { const ck = SP.clock || {}; return `${X.season()}|${Math.round((ck.snow || 0) * 8)}|${Math.round(X.shadowA() * 20)}`; };
  function getTile(s, tx, ty, key) {
    const k = s + ":" + tx + ":" + ty; let t = tiles.get(k);
    if (!t) { t = { s, tx, ty, c: null, key: null }; tiles.set(k, t); }
    t.used = C.frameNo;
    if (t.key !== key && tileBudget > 0) { bakeTile(t, key); tileBudget--; }
    return t;
  }
  function bakeTile(t, key) {
    if (!t.c) { t.c = document.createElement("canvas"); t.c.width = t.c.height = TS; }
    const x = t.c.getContext("2d"), s = t.s, span = TS / s, r = { x0: t.tx * span, y0: t.ty * span, x1: (t.tx + 1) * span, y1: (t.ty + 1) * span };
    const xf = (c) => { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, TS, TS); c.setTransform(s, 0, 0, s, -t.tx * TS, -t.ty * TS); c.imageSmoothingEnabled = s < 1; };
    xf(x);
    const se = X.season(), textured = s >= 0.25, snow = SP.clock ? SP.clock.snow : 0;
    for (const zn of D.zones) {
      if (!zn._r) zn._r = scrRect(zn.p.map(([a, b]) => [SX(a, b), SY(a, b, 0)]));
      if (!overlap(zn._r, r)) continue;
      const m = zn.m === "grass" || zn.m === "lawn" ? zn.m + "_" + se : zn.m;
      x.beginPath(); zn.p.forEach(([a, b], i) => (i ? x.lineTo(SX(a, b), SY(a, b, 0)) : x.moveTo(SX(a, b), SY(a, b, 0)))); x.closePath();
      x.fillStyle = textured && TEX.g[m] ? X.pattern(x, TEX.g[m], "g:" + m) : TEX.gavg[m] || "#888"; x.fill();
      if (snow > 0.05 && m !== "water") { x.fillStyle = `rgba(242,245,250,${(m === "asphalt" || m === "intersection" || m === "brt" ? 0.35 : 0.82) * Math.min(1, snow * 1.2)})`; x.fill(); }
    }
    if (D.compound && D.compound.ground) drawEstateGround(x, s);
    if (s >= 0.125) drawMarks(x);
    const sa = X.shadowA();
    if (sa > 0.01) {
      if (!_mask) { _mask = document.createElement("canvas"); _mask.width = _mask.height = TS; }
      const m = _mask.getContext("2d"); xf(m); m.fillStyle = "#101422"; m.imageSmoothingEnabled = true;
      const L = X.gquery({ x0: r.x0 - 3000, y0: r.y0 - 800, x1: r.x1 + 800, y1: r.y1 + 6000 }, []);
      for (const d of L) {
        if (d.kind === "prop") { const f = HF[d.key]; if (f) m.drawImage(IMG.shadow, f[0], f[1], f[2], f[3], d.X - f[4] * 2, d.Y - f[5] * 2, f[2] * 2, f[3] * 2); }
        else if (d.kind === "part" && d.z0 < 1 && d.p.style !== "canopy") partShadow(m, d);
      }
      x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = sa; x.drawImage(_mask, 0, 0); x.globalAlpha = 1; x.setTransform(s, 0, 0, s, -t.tx * TS, -t.ty * TS);
    }
    if (s <= 1 / 8) { const L = X.gquery(r, []).filter((d) => d.kind === "prop").sort((a, b) => b.depth - a.depth); for (const d of L) { const f = F[d.key]; x.drawImage(IMG.atlas, f[0], f[1], f[2], f[3], d.X - f[4], d.Y - f[5], f[2], f[3]); } }
    t.key = key; C.stats.bakes = (C.stats.bakes || 0) + 1;
  }
  function partShadow(m, d) {   // ground shadow of a whole building / tower (capped at 90 m so far towers don't blacken the map)
    const top = Math.min(d.tower ? d.b.top : d.z1, 90), k = top / SUN[2], pts = [];
    for (const [x, y] of d.poly) { pts.push([SX(x, y), SY(x, y, 0)]); const sx = x - SUN[0] * k, sy = y - SUN[1] * k; pts.push([SX(sx, sy), SY(sx, sy, 0)]); }
    const H = hull(pts); m.beginPath(); H.forEach(([a, c], i) => (i ? m.lineTo(a, c) : m.moveTo(a, c))); m.closePath(); m.fill();
  }
  function quad(x, pts, col) { x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(SX(a, b), SY(a, b, 0)) : x.moveTo(SX(a, b), SY(a, b, 0)))); x.closePath(); x.fillStyle = col; x.fill(); }
  function drawEstateGround(ctx, s) {
    for (const g of D.compound.ground) {
      if (g.p) quad(ctx, g.p, g.color);
      else if (g.line) {
        ctx.beginPath(); g.line.forEach(([a,b],i) => i ? ctx.lineTo(SX(a,b),SY(a,b,0)) : ctx.moveTo(SX(a,b),SY(a,b,0)));
        ctx.strokeStyle = g.color; ctx.lineWidth = (g.width || 0.12) * 32; ctx.stroke();
      }
    }
    // Small ripples and pale lane-end tiles read even in the estate overview.
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(214,245,234,0.4)";
    for (let y=292; y<325; y+=2.5) {
      ctx.beginPath(); ctx.moveTo(SX(255,y),SY(255,y,0)); ctx.lineTo(SX(281,y+.25),SY(281,y+.25,0)); ctx.stroke();
    }
    ctx.lineWidth = 1;
  }
  function drawMarks(x) {
    const WC = "rgba(238,240,242,0.92)";
    for (const mk of D.marks) {
      const [kind, a, b, c, d] = mk;
      if (kind === "text") { const M = x.getTransform(); x.setTransform(M.multiply(new DOMMatrix([KX / 7, -KY / 7, KX / 7, KY / 7, SX(a, b), SY(a, b, 0)]))); x.font = "bold 12px sans-serif"; x.fillStyle = "rgba(250,250,245,0.85)"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(c, 0, 0); x.setTransform(M); continue; }
      const hor = Math.abs(d - b) < 1e-6;
      if (kind === "dash") { const L = hor ? c - a : d - b; for (let u = 0; u < L; u += 6) { const u1 = Math.min(L, u + 3); quad(x, hor ? [[a + u, b - 0.08], [a + u1, b - 0.08], [a + u1, b + 0.08], [a + u, b + 0.08]] : [[a - 0.08, b + u], [a + 0.08, b + u], [a + 0.08, b + u1], [a - 0.08, b + u1]], WC); } }
      if (kind === "edge") quad(x, hor ? [[a, b - 0.07], [c, b - 0.07], [c, b + 0.07], [a, b + 0.07]] : [[a - 0.07, b], [a + 0.07, b], [a + 0.07, d], [a - 0.07, d]], "rgba(238,240,242,0.75)");
      if (kind === "stop") quad(x, Math.abs(c - a) < 1e-6 ? [[a - 0.2, b], [a + 0.2, b], [a + 0.2, d], [a - 0.2, d]] : [[a, b - 0.2], [c, b - 0.2], [c, b + 0.2], [a, b + 0.2]], WC);
      if (kind === "zebra") { if ((d - b) > (c - a)) for (let y = b + 0.5; y < d - 0.4; y += 1.1) quad(x, [[a, y], [c, y], [c, y + 0.55], [a, y + 0.55]], WC); else for (let xx = a + 0.5; xx < c - 0.4; xx += 1.1) quad(x, [[xx, b], [xx + 0.55, b], [xx + 0.55, d], [xx, d]], WC); }
    }
  }
  function drawGround(ctx, view, z) {
    const s = tileScale(z), span = TS / s, key = groundKey();
    tileBudget = C.testMode ? 999 : 4;
    const tx0 = Math.floor(view.x0 / span), tx1 = Math.floor(view.x1 / span), ty0 = Math.floor(view.y0 / span), ty1 = Math.floor(view.y1 / span);
    ctx.imageSmoothingEnabled = z / s < 0.999;
    const order = []; for (let tx = tx0; tx <= tx1; tx++) for (let ty = ty0; ty <= ty1; ty++) order.push([tx, ty, Math.hypot(tx - (tx0 + tx1) / 2, ty - (ty0 + ty1) / 2)]);
    order.sort((a, b) => a[2] - b[2]);
    for (const [tx, ty] of order) {
      const t = getTile(s, tx, ty, key);
      if (t.c && t.key) ctx.drawImage(t.c, tx * span, ty * span, span, span);
      else {   // not baked yet: coarser parent level if we have it, else flat colour
        const p = tiles.get(s / 2 + ":" + Math.floor(tx / 2) + ":" + Math.floor(ty / 2));
        if (p && p.c && p.key) ctx.drawImage(p.c, ((tx % 2) + 2) % 2 * TS / 2, ((ty % 2) + 2) % 2 * TS / 2, TS / 2, TS / 2, tx * span, ty * span, span, span);
        else { ctx.fillStyle = TEX.gavg.city || "#ccc"; ctx.fillRect(tx * span, ty * span, span, span); }
      }
    }
    if (tiles.size > 96) { const old = [...tiles.values()].sort((a, b) => a.used - b.used).slice(0, tiles.size - 96); for (const t of old) { if (t.used >= C.frameNo) continue; if (t.c) t.c.width = t.c.height = 0; tiles.delete(t.s + ":" + t.tx + ":" + t.ty); } }
  }
  // ---------------------------------------------------------------- building / tower part
  function drawPart(ctx, d, z) {
    const p = d.p, M = ctx.getTransform(), mip = X.mipFor(z), alpha = d.alpha;
    if (alpha < 0.999) ctx.globalAlpha = alpha;
    const style = p.style, tex = TEX.fac[style] && TEX.fac[style][mip], S = K.facades[style];
    if (p.roofType === "hip") { chineseRoof(ctx,d,z); ctx.globalAlpha=1; return; }
    if (style === "canopy") {   // stadium roof ring: white membrane, red edge, open centre showing the pitch
      for (const f of d.faces) { X.facePath(ctx, f, d.z0, d.z1); ctx.fillStyle = f.shade > 0.8 ? "#e8ecf0" : "#aab2bc"; ctx.fill(); }
      X.polyPath(ctx, d.poly, d.z1); ctx.fillStyle = "#f4f6f8"; ctx.fill();
      if (p.ring) {
        const ring = (k, n, col) => { X.polyPath(ctx, partPoly({ shape: "ell", cx: p.cx, cy: p.cy, rx: p.ring.rx * k, ry: p.ring.ry * k, n }), d.z1); ctx.fillStyle = col; ctx.fill(); };
        ring(1, 32, "#b8463e"); ring(0.8, 32, "#7a8a96"); ring(0.6, 28, "#4f9a52");
        ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = Math.max(1, 1 / z); ctx.stroke(); ctx.lineWidth = 1;
      }
      if (alpha < 0.999) ctx.globalAlpha = 1; return;
    }
    for (const f of d.faces) {   // face-local space: u along the wall (m), v = height (m)
      ctx.setTransform(M.multiply(new DOMMatrix([(f.ex - f.ey) * KX, -(f.ex + f.ey) * KY, 0, -PZ, SX(f.a[0], f.a[1]), SY(f.a[0], f.a[1], 0)])));
      if (p.color) ctx.fillStyle = p.color;
      else if (tex && S) { const pat = X.pattern(ctx, tex, "f:" + style + ":" + mip), sc = 1 << mip;
        // Resampled odd-size tiles must retain their exact metre dimensions.
        // Anchor apartment floors at their own podium, not world elevation zero.
        pat.setTransform(new DOMMatrix([S.w / tex.width, 0, 0, -S.h / tex.height, (d.uoff || 0) % S.w, style.startsWith("res_") ? d.z0 : 0])); ctx.fillStyle = pat; }
      else ctx.fillStyle = "#b8c0c8";
      if (!p.mesh) ctx.fillRect(0, d.z0, f.L, d.z1 - d.z0);
      if (p.detail === "villa") villaFace(ctx,d,f);
      if (!p.mesh && f.shade < 0.995) { ctx.fillStyle = `rgba(18,28,52,${(1 - f.shade) * 0.9})`; ctx.fillRect(0, d.z0, f.L, d.z1 - d.z0); }
      if (p.lattice || p.mesh) {
        ctx.strokeStyle=p.mesh ? "rgba(194,209,187,0.65)" : "#b59f77";
        ctx.lineWidth=p.mesh ? 0.025 : 0.055;
        for(let u=.2;u<f.L;u+=p.mesh ? .65 : .45) { ctx.beginPath();ctx.moveTo(u,d.z0);ctx.lineTo(u,d.z1);ctx.stroke(); }
        for(let v=d.z0+.4;v<d.z1;v+=p.mesh ? .65 : 1.1) {ctx.beginPath();ctx.moveTo(0,v);ctx.lineTo(f.L,v);ctx.stroke();}
        ctx.lineWidth=1;
      }
    }
    ctx.setTransform(M);
    X.polyPath(ctx, d.poly, d.z1);
    ctx.fillStyle = p.color || (p.spire ? "#d8dee6" : p.crown ? "#cfd8e2" : d.tower ? "#b4bcc6" : style === "stadium" ? "#e4e8ec" : style.startsWith("shop") ? "#9aa2aa" : "#c4c8cc"); if (!p.mesh) ctx.fill();
    if (z >= 0.2 && !p.color && !p.spire && !p.crown && TEX.g.roof) { ctx.globalAlpha = 0.85 * alpha; ctx.fillStyle = X.pattern(ctx, TEX.g.roof, "g:roof"); ctx.fill(); ctx.globalAlpha = alpha < 0.999 ? alpha : 1; }
    if (p.garden || p.railing) terraceGarden(ctx,d,z);
    if (d.tower && z>=0.035 && !p.spire) towerAccents(ctx,d,z);
    if (z >= 0.2) { ctx.strokeStyle = "rgba(40,48,60,0.5)"; ctx.lineWidth = Math.max(1, 1 / z); ctx.stroke(); ctx.lineWidth = 1; }
    if (z >= 0.25 && d.tower && !p.crown && !p.spire && !p.roofbox && d.b.parts[d.b.parts.length - 1] === p) roofDetail(ctx, d, z);
    if (z >= 0.35) {
      ctx.strokeStyle = "rgba(30,36,48,0.55)"; ctx.lineWidth = Math.max(1, 1 / z); ctx.beginPath();
      for (const f of d.faces) for (const q of [f.a, f.b]) { ctx.moveTo(SX(q[0], q[1]), SY(q[0], q[1], d.z0)); ctx.lineTo(SX(q[0], q[1]), SY(q[0], q[1], d.z1)); }
      ctx.stroke(); ctx.lineWidth = 1;
    }
    if (alpha < 0.999) ctx.globalAlpha = 1;
  }
  X.drawPart = drawPart;
  function villaFace(ctx,d,f) {
    const lo=d.z0,hi=d.z1,L=f.L;
    // Separate architectural elements, like the original street's modules.
    ctx.fillStyle="rgba(59,61,55,.25)";
    for(let v=lo+.4;v<hi;v+=.42) ctx.fillRect(0,v,L,.015);
    for(let u=.8;u<L;u+=1.6) ctx.fillRect(u,lo,.018,hi-lo);
    const bays=Math.max(1,Math.floor(L/3.8)),step=L/bays;
    for(let i=0;i<bays;i++) {
      const a=i*step+.34,w=step-.68,b=lo+.38,h=hi-lo-.75;
      ctx.fillStyle="#686d66";ctx.fillRect(a-.10,b-.1,w+.2,h+.18);
      ctx.fillStyle="#283d43";ctx.fillRect(a,b,w,h);
      const grad=ctx.createLinearGradient(0,b,0,b+h);grad.addColorStop(0,"#405c60");grad.addColorStop(.55,"#617f81");grad.addColorStop(1,"#8da4a0");
      ctx.fillStyle=grad;ctx.fillRect(a+.08,b+.08,w-.16,h-.16);
      ctx.fillStyle="#a9a28f";ctx.fillRect(a+.14,b+.1,w*.15,h-.2);ctx.fillRect(a+w*.79,b+.1,w*.12,h-.2);
      ctx.fillStyle="rgba(204,223,215,.28)";ctx.beginPath();ctx.moveTo(a+.3,b+.2);ctx.lineTo(a+.65,b+.2);ctx.lineTo(a+w-.2,b+h-.1);ctx.lineTo(a+w-.55,b+h-.1);ctx.fill();
      ctx.fillStyle="#3d4a49";ctx.fillRect(a+w*.5-.045,b,.09,h);ctx.fillRect(a,b+h*.78,w,.055);
      ctx.fillStyle="#dbd7c9";ctx.fillRect(a-.16,b-.16,w+.32,.11);
      ctx.fillStyle="#303f40";ctx.fillRect(a-.08,b+h+.04,w+.16,.09);
      // Wall light and service grille between the bays.
      ctx.fillRect(a-.23,b+1.3,.12,.3);ctx.fillStyle="#d9c69a";ctx.fillRect(a-.21,b+1.34,.08,.21);
      if(i===bays-1){ctx.fillStyle="#949b91";ctx.fillRect(a+w-.75,b+.04,.65,.42);ctx.strokeStyle="#495c59";ctx.lineWidth=.025;ctx.beginPath();ctx.arc(a+w-.43,b+.25,.15,0,Math.PI*2);ctx.stroke();ctx.lineWidth=1;}
    }
  }
  function polygon3(ctx,pts,col) {
    ctx.beginPath();pts.forEach(([x,y,z],i)=>i?ctx.lineTo(SX(x,y),SY(x,y,z)):ctx.moveTo(SX(x,y),SY(x,y,z)));ctx.closePath();ctx.fillStyle=col;ctx.fill();
  }
  function chineseRoof(ctx,d,z) {
    const p=d.p, a=p.x0,b=p.y0,c=p.x1,e=p.y1, mid=(b+e)/2, ridgeA=a+(c-a)*.22,ridgeB=c-(c-a)*.22;
    const h=d.z1, low=d.z0;
    polygon3(ctx,[[a,b,low],[c,b,low],[ridgeB,mid,h],[ridgeA,mid,h]],"#4c5754");
    polygon3(ctx,[[a,b,low],[ridgeA,mid,h],[a,e,low]],"#354340");
    polygon3(ctx,[[a,e,low],[ridgeA,mid,h],[ridgeB,mid,h],[c,e,low]],"#66706a");
    polygon3(ctx,[[c,b,low],[c,e,low],[ridgeB,mid,h]],"#758077");
    ctx.strokeStyle="#8a9080";ctx.lineWidth=Math.max(1, .06*32);
    ctx.beginPath();ctx.moveTo(SX(ridgeA,mid),SY(ridgeA,mid,h));ctx.lineTo(SX(ridgeB,mid),SY(ridgeB,mid,h));ctx.stroke();
    if(z>.075) for(let t=.12;t<1;t+=.12) {
      ctx.strokeStyle="rgba(25,39,35,.38)";ctx.beginPath();
      const yy=b+(mid-b)*t, zz=low+(h-low)*t, aa=a+(ridgeA-a)*t, cc=c+(ridgeB-c)*t;
      ctx.moveTo(SX(aa,yy),SY(aa,yy,zz));ctx.lineTo(SX(cc,yy),SY(cc,yy,zz));ctx.stroke();
    }
    ctx.lineWidth=1;
  }
  function terraceGarden(ctx,d,z) {
    const p=d.p, a=p.x0,b=p.y0,c=p.x1,e=p.y1, h=d.z1;
    // Stone edges surround planted pockets, rather than a green solid balcony slab.
    const bush=(x,y,r,seed)=>{
      const palettes=["#426549","#527950","#719359","#8da068"];
      for(let i=0;i<6;i++){
        const angle=i*Math.PI/3, rr=r*(.55+.25*hash(seed,i));
        const xx=x+Math.cos(angle)*r*.5,yy=y+Math.sin(angle)*r*.5;
        ctx.beginPath();ctx.ellipse(SX(xx,yy),SY(xx,yy,h+.22),rr*25,rr*16,0,0,Math.PI*2);
        ctx.fillStyle=palettes[(seed+i)%palettes.length];ctx.fill();
      }
    };
    const pad=Math.min(.35,(e-b)*.22);
    if(p.garden) for(let x=a+.7;x<c-.4;x+=p.roofGarden?2.5:1.1) bush(x,b+pad, p.roofGarden?1.1:.65,Math.floor(x*11+h));
    if(p.garden && c-a<3) for(let y=b+.6;y<e-.3;y+=1.2) bush(a+pad,y,.65,Math.floor(y*11+h));
    if(p.roofGarden) for(let y=b+1.3;y<e-.6;y+=2.3) {bush(a+.7,y,.75,Math.floor(y));bush(c-.7,y,.7,Math.floor(y+3));}
    if(p.railing) {
      const H=1.15, steel=p.railMaterial==="steel";
      const edges=[[[a,b],[c,b]],[[a,b],[a,e]]];
      if(p.railSide!=="west") edges.push([[c,b],[c,e]]);
      if(p.railSide!=="south") edges.push([[a,e],[c,e]]);
      const line=(q,r,z0,z1,col,width)=>{ctx.strokeStyle=col;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(SX(...q),SY(...q,z0));ctx.lineTo(SX(...r),SY(...r,z1));ctx.stroke();};
      for(const [q,r] of edges) {
        const L=Math.hypot(r[0]-q[0],r[1]-q[1]);
        if(!steel) {
          polygon3(ctx,[[...q,h+.1],[...r,h+.1],[...r,h+H],[...q,h+H]],"rgba(66,113,131,.48)");
          line(q,r,h+.16,h+.16,"rgba(174,206,211,.85)",Math.max(1,.55/z));
        }
        line(q,r,h+H,h+H,"#34454f",Math.max(1,.95/z));
        const n=Math.max(1,Math.ceil(L/(steel?.28:1.5)));
        for(let i=0;i<=n;i++) {
          const t=i/n,pt=[q[0]+(r[0]-q[0])*t,q[1]+(r[1]-q[1])*t];
          line(pt,pt,h+.05,h+H,steel?"#4b5d64":"rgba(195,222,224,.85)",Math.max(1,(steel?.55:.45)/z));
        }
      }
      ctx.lineWidth=1;
    }
  }
  function towerAccents(ctx,d,z) {
    const M=ctx.getTransform(), p=d.p;
    for(const f of d.faces){
      ctx.setTransform(M.multiply(new DOMMatrix([(f.ex-f.ey)*KX,-(f.ex+f.ey)*KY,0,-PZ,SX(f.a[0],f.a[1]),SY(f.a[0],f.a[1],0)])));
      ctx.fillStyle="rgba(218,226,220,.45)";
      for(let u=1.8;u<f.L;u+=5.4) ctx.fillRect(u,d.z0,.16,d.z1-d.z0);
      ctx.fillStyle="rgba(26,54,63,.23)";
      for(let v=Math.ceil(d.z0/18)*18;v<d.z1;v+=18) ctx.fillRect(0,v,f.L,.38);
      ctx.fillStyle="rgba(226,233,223,.12)";ctx.beginPath();ctx.moveTo(f.L*.12,d.z0);ctx.lineTo(f.L*.30,d.z0);ctx.lineTo(f.L*.75,d.z1);ctx.lineTo(f.L*.56,d.z1);ctx.closePath();ctx.fill();
    }
    ctx.setTransform(M);
  }
  function roofDetail(ctx, d, z) {
    const [x0, y0, x1, y1] = d.box, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, w = (x1 - x0) * 0.22, Z = d.z1;
    const side = (pts, col) => { ctx.fillStyle = col; ctx.beginPath(); pts.forEach(([x, y, hh], i) => (i ? ctx.lineTo(SX(x, y), SY(x, y, Z + hh)) : ctx.moveTo(SX(x, y), SY(x, y, Z + hh)))); ctx.fill(); };
    const box = (a, b, c, e, h, col) => { side([[a, b, 0], [c, b, 0], [c, b, h], [a, b, h]], "#8a929c"); side([[a, b, 0], [a, e, 0], [a, e, h], [a, b, h]], "#6c747e"); X.polyPath(ctx, [[a, b], [c, b], [c, e], [a, e]], Z + h); ctx.fillStyle = col; ctx.fill(); };
    box(x0 + 2, y0 + 2, x0 + 2 + w, y0 + 2 + w * 0.7, 3, "#c6ccd4"); box(x1 - 2 - w * 0.6, y1 - 2 - w, x1 - 2, y1 - 2, 4, "#b8c0c8");
    if (d.b.h > 250) {   // helipad ring
      ctx.strokeStyle = "#e8c040"; ctx.lineWidth = Math.max(1, 1.5 / z); ctx.beginPath(); const r = w * 0.7;
      for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; i ? ctx.lineTo(SX(x, y), SY(x, y, Z + 0.05)) : ctx.moveTo(SX(x, y), SY(x, y, Z + 0.05)); }
      ctx.stroke(); ctx.lineWidth = 1;
    }
  }
  X.erasePart = function (ex, d) { ex.globalCompositeOperation = "destination-out"; ex.beginPath(); d.hull.forEach(([a, b], i) => (i ? ex.lineTo(a, b) : ex.moveTo(a, b))); ex.closePath(); ex.fillStyle = "#000"; ex.globalAlpha = d.alpha; ex.fill(); ex.globalAlpha = 1; ex.globalCompositeOperation = "source-over"; };
  X.drawGround = drawGround; X.TS = TS;
})(window.SP = window.SP || {});
