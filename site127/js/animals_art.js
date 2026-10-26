/* Cats and dogs as true 45° pixel sprites. Each pose is ray-cast once from small ellipsoid "clay" models
 * through the game's own orthographic camera (30° elevation, 32/16/39.19 px per metre), quantised to four
 * tones lit from the upper left, outlined 1px like the sprites3d actor atlases, then cached. Eight real
 * facings (no mirroring), idle/walk/sit/lie/sleep/groom/eat poses, and breed patterns per animal.
 * Birds (sparrow / pigeon / magpie) use the same pipeline: hop, peck, preen, idle, perch/fluffed rest, sleep,
 * take-off / flap (flee) / landing frames.
 * Pure presentation: no state, saves or positions are read beyond what drawAnimal passes in. */
(function(root){'use strict';
 const SP=root.SP;if(!SP)return;
 const SCALE=32*Math.SQRT2,SIN=.5,COS=Math.sqrt(3)/2,H2=Math.SQRT1_2;
 const R=[H2,-H2,0],U=[SIN*H2,SIN*H2,COS],D=[COS*H2,COS*H2,-SIN];
 const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],norm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};
 const LIGHT=norm([-.5*R[0]+.8*U[0]-.45*D[0],-.5*R[1]+.8*U[1]-.45*D[1],-.5*R[2]+.8*U[2]-.45*D[2]]);
 const DIRS={E:0,NE:45,N:90,NW:135,W:180,SW:225,S:270,SE:315};
 // ---------- colour helpers ----------
 const rgb=c=>{const n=parseInt(String(c||'#888888').slice(1,7),16);return [n>>16&255,n>>8&255,n&255];};
 const hex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
 const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
 // ---------- breeds ----------
 // Known residents get a breed matching their name/coat; any other animal falls back on a coat-based guess.
 const BREEDS={sparrow:'sparrow',wang_cat:'grey_tabby',stray_orange:'orange_tabby',stray_tabby:'calico',shop_cat:'cream_point',zhang_dog:'shiba',stray_dog:'rural',shop_dog:'spotted'};
 function breedOf(id,p){if(p.breed)return p.breed;if(BREEDS[id])return BREEDS[id];const c=rgb(p.coat),l=c[0]+c[1]+c[2];if(p.species==='bird')return l<200?'magpie':Math.abs(c[0]-c[2])<26&&l>330?'pigeon':'sparrow';if(p.species==='cat')return l<260?'tuxedo':c[0]>c[2]*1.35?'orange_tabby':l>600?'cream_point':'grey_tabby';return l>600?'spotted':c[0]>c[2]*1.4?'shiba':'rural';}
 // ---------- geometry ----------
 function ell(part,c,r,yaw=0,pitch=0,extra){const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  // local axes: forward (x) pitched up by `pitch`, then yawed
  const ax=[cp*cy,cp*sy,sp],ay=[-sy,cy,0],az=[-sp*cy,-sp*sy,cp];return Object.assign({part,c,r,ax:[ax,ay,az]},extra||{});}
 function chain(out,part,pts,r0,r1,extra){const n=pts.length;for(let i=0;i<n;i++){const t=n>1?i/(n-1):0,r=r0+(r1-r0)*t;out.push(ell(part,pts[i],[r,r,r],0,0,Object.assign({t},extra||{})));}}
 function limb(out,part,a,b,r0,r1,n,extra){const pts=[];for(let i=0;i<n;i++){const t=i/(n-1);pts.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]);}chain(out,part,pts,r0,r1,extra);}
 function curve(f,n){const p=[];for(let i=0;i<n;i++)p.push(f(i/(n-1)));return p;}
 // ---------- poses (pet space: x forward, y left, z up; metres) ----------
 function model(species,breed,pose,frame){const P=[],cat=species==='cat',rural=breed==='rural',S=cat?1.18:(rural?1.04:1.02);
  const k=v=>[v[0]*S,v[1]*S,v[2]*S],add=e=>{e.c=k(e.c);e.r=k(e.r);P.push(e);};
  const legs=[],walk=pose==='walk',ph=frame/4*Math.PI*2;
  // body proportions
  const B=cat?{len:.165,w:.092,h:.094,z:.175,head:[.088,.09,.08],hz:.3,hx:.22,leg:.03,legY:.048,fx:.11,hxL:-.11,neck:.25}
          :{len:rural?.22:.22,w:rural?.1:.112,h:rural?.11:.118,z:rural?.34:.3,head:[.1,.096,.092],hz:rural?.53:.49,hx:.29,leg:rural?.034:.038,legY:.062,fx:.15,hxL:-.15,neck:rural?.45:.41};
  const earsUp=!(breed==='spotted'),tailOf=(base,sw)=>{// tail spline from the rump
    if(cat)return curve(t=>[base[0]-.13*t,base[1]+Math.sin(t*2.4)*sw*t,base[2]+.13*Math.pow(t,1.6)],8);
    if(breed==='shiba')return curve(t=>[base[0]-.04*Math.sin(t*2.6),base[1]+.04*t+sw*.3*t,base[2]+.12*Math.sin(t*2.7)+.02],7);
    if(rural)return curve(t=>[base[0]-.12*t,base[1]+sw*t,base[2]+.18*t-.02*t*t],7);
    return curve(t=>[base[0]-.15*t,base[1]+sw*1.4*t,base[2]+.09*t],6);};
  const sway=pose==='idle'||pose==='walk'?(frame%2?.035:-.035)*(cat?1:1.3):0;
  if(pose==='walk'||pose==='idle'||pose==='eat'||pose==='alert'){
   const bob=walk?.007*Math.abs(Math.sin(ph*2)):0,z=B.z+bob;
   add(ell('body',[0,0,z],[B.len,B.w,B.h]));
   add(ell('chest',[B.len*.62,0,z+.005],[B.len*.5,B.w*.98,B.h*1.04]));
   add(ell('haunch',[-B.len*.62,0,z+.005],[B.len*.48,B.w*1.02,B.h*1.05]));
   const low=pose==='eat';const hx=low?B.hx+.04:B.hx,hz=low?(cat?.09:.14):B.hz+bob;
   add(ell('neck',[low?B.len*1.05:B.len*1.08,0,low?z-.02:B.neck+bob],[cat?.05:.07,cat?.048:.064,cat?.06:.085],0,low?-.9:.6));
   head(P,add,cat,breed,[hx,0,hz],B,low?-.7:0);
   for(const [i,x,y] of [[0,B.fx,B.legY],[1,B.fx,-B.legY],[2,B.hxL,B.legY],[3,B.hxL,-B.legY]]){const pair=(i===0||i===3)?0:Math.PI,a=walk?Math.sin(ph+pair)*.42:0,lift=walk?Math.max(0,Math.cos(ph+pair))*.025:0,top=[x,y,z-.02],L=z-.01,foot=[x+Math.sin(a)*L*.9,y,Math.max(0,top[2]-Math.cos(a)*L)+lift];
    if(i>=2)add(ell('thigh',[x+.01,y*1.05,z-.03],[cat?.05:.06,cat?.03:.038,cat?.065:.08],0,-.3));
    const knee=[(top[0]+foot[0])/2+(i>=2?-.02:.008),y,(top[2]+foot[2])/2];limbAdd(add,'leg',top,knee,B.leg*1.15,B.leg,3,i);limbAdd(add,'leg',knee,foot,B.leg,B.leg*.9,3,i);
    add(ell('paw',[foot[0]+.012,y,foot[2]+.012],[B.leg*1.25,B.leg*1.1,B.leg*.7],0,0,{leg:i}));}
   for(const p of tailOf([-B.len*1.0,0,z+.03],sway))add(ell('tail',p,[cat?.024:.03,cat?.024:.03,cat?.024:.03]));
  } else if(pose==='sit'||pose==='groom'){
   const pitch=cat?.95:.85;
   add(ell('haunch',[-.05,0,cat?.075:.11],[cat?.11:.13,B.w*1.1,cat?.075:.1]));
   add(ell('body',[.0,0,cat?.165:.25],[B.len*.82,B.w,B.h],0,pitch));
   add(ell('chest',[.05,0,cat?.22:.33],[B.len*.45,B.w*.98,B.h*1.02],0,pitch));
   const groom=pose==='groom';head(P,add,cat,breed,groom?[.11,0,cat?.29:.47]:[.07,0,cat?.35:.56],B,groom?-.55:.1);
   add(ell('neck',[.06,0,cat?.29:.45],[cat?.05:.065,cat?.048:.062,cat?.06:.08],0,1.2));
   for(const y of [B.legY*.8,-B.legY*.8]){const raised=groom&&y>0,top=[.07,y,cat?.21:.31],foot=raised?[.15,y*.5,cat?.27:.4]:[.1,y,0];limbAdd(add,'leg',top,foot,B.leg*1.1,B.leg*.95,4,y>0?0:1);add(ell('paw',[foot[0]+.012,foot[1],foot[2]+.01],[B.leg*1.25,B.leg*1.1,B.leg*.7]));}
   for(const y of [B.legY*1.1,-B.legY*1.1])add(ell('paw',[.02,y,.012],[B.leg*1.6,B.leg*1.1,B.leg*.7]));
   const tail=cat?curve(t=>[-.13+.2*Math.sin(t*1.7),.1*Math.sin(t*2.2)+.02,.015],8):(breed==='shiba'?curve(t=>[-.16+.03*t,.05*t,.22+.1*Math.sin(t*2.8)],6):curve(t=>[-.15-.08*t,.03*t,.03],6));
   for(const p of tail)add(ell('tail',p,[cat?.018:.024,cat?.018:.024,cat?.016:.022]));
  } else if(pose==='lie'){
   const z=cat?.085:.12;add(ell('body',[0,0,z],[B.len*1.02,B.w*1.12,cat?.08:.105]));add(ell('chest',[B.len*.6,0,z+.01],[B.len*.48,B.w*1.05,cat?.085:.11]));add(ell('haunch',[-B.len*.6,0,z],[B.len*.5,B.w*1.18,cat?.08:.1]));
   head(P,add,cat,breed,[B.len*1.08,0,cat?.17:.25],B,0);
   for(const y of [B.legY*.75,-B.legY*.75])limbAdd(add,'leg',[B.len*.7,y,.03],[B.len*1.2,y,.018],B.leg,B.leg*.95,3,0);
   for(const y of [B.legY*1.2])add(ell('thigh',[-B.len*.55,y*1.4,z+.005],[cat?.07:.085,.035,cat?.06:.075]));
   for(const p of curve(t=>[-B.len*1.05+.05*t,.06+.1*t,.025],7))add(ell('tail',p,[cat?.018:.024,cat?.018:.024,cat?.016:.02]));
  } else { // sleep: curled up, head tucked on the tail
   const br=frame%2?.004:0;add(ell('body',[0,0,(cat?.075:.1)+br],[cat?.15:.2,cat?.12:.16,(cat?.075:.1)+br]));add(ell('haunch',[-.05,-.03,(cat?.07:.09)],[cat?.1:.13,cat?.1:.13,cat?.07:.09]));
   head(P,add,cat,breed,[cat?.1:.13,cat?.07:.09,cat?.075:.1],B,-.25,true);
   for(const p of curve(t=>[cat?(-.14+.26*Math.sin(t*1.6)):(-.18+.33*Math.sin(t*1.6)),(cat?.12:.16)*Math.cos(t*1.6)*1.05,.03],8))add(ell('tail',p,[cat?.02:.026,cat?.02:.026,cat?.018:.022]));
  }
  if(P.markers)P.markers=P.markers.map(m=>({...m,p:k(m.p)}));
  return P;}
 function limbAdd(add,part,a,b,r0,r1,n,leg){for(let i=0;i<n;i++){const t=i/(n-1),r=r0+(r1-r0)*t;add(ell(part,[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],[r,r,r],0,0,{leg}));}}
 function head(P,add,cat,breed,h,B,pitch,sleeping){const [rx,ry,rz]=B.head,cp=Math.cos(pitch),sp=Math.sin(pitch),f=(x,z)=>[h[0]+x*cp-z*sp,h[1],h[2]+x*sp+z*cp];
  add(ell('head',h,[rx,ry,rz],0,pitch));
  if(cat){add(ell('muzzle',f(.066,-.024),[.034,.04,.028],0,pitch));add(ell('cheek',f(.016,-.028),[.05,.075,.036],0,pitch));}
  else{const long=breed==='rural'?1.1:breed==='spotted'?1.05:.95;add(ell('muzzle',f(.09*long,-.026),[.064*long,.05,.042],0,pitch-.08));add(ell('nose',f(.152*long,-.014),[.017,.02,.015],0,pitch));}
  const ear=cat?[.024,.018,.042]:breed==='spotted'?[.032,.016,.065]:[.032,.02,.058];
  for(const s of [1,-1]){if(cat)add(ell('ear',f(-.008,.07).map((v,i)=>i===1?v+s*.05:v),ear,0,pitch+(sleeping?-.6:-.15),{side:s}));
   else if(breed==='spotted')add(ell('ear',f(-.014,.018).map((v,i)=>i===1?v+s*.094:v),ear,0,pitch-.3,{side:s,flop:1}));
   else add(ell('ear',f(-.018,.085).map((v,i)=>i===1?v+s*.056:v),ear,0,pitch-.2,{side:s}));}
  // eyes / nose markers (not geometry): stored for the marker pass
  P.markers=P.markers||[];const eyeX=cat?.07:.074,eyeZ=cat?.014:.024,ey=cat?.038:.042;
  if(!sleeping)for(const s of [1,-1])P.markers.push({kind:'eye',p:f(eyeX,eyeZ).map((v,i)=>i===1?v+s*ey:v)});else for(const s of [1,-1])P.markers.push({kind:'shut',p:f(eyeX,eyeZ).map((v,i)=>i===1?v+s*ey:v)});
  P.markers.push({kind:'nose',p:cat?f(.1,-.016):f((breed==='rural'?1.1:.97)*.164,-.01)});}
 // ---------- birds (bird space: x forward, y left, z up; metres, exaggerated for pixel readability) ----------
 const BIRD={sparrow:{S:2.6,len:.05,w:.034,h:.034,head:.026,beak:[.011,.0065,.006],tail:[.034,.017,.006],tailUp:.3,leg:.03},
  pigeon:{S:1.55,len:.085,w:.055,h:.055,head:.033,beak:[.013,.006,.006],tail:[.06,.03,.008],tailUp:.12,leg:.04},
  magpie:{S:1.4,len:.075,w:.046,h:.046,head:.034,beak:[.022,.008,.008],tail:[.13,.02,.007],tailUp:.22,leg:.05}};
 function birdModel(breed,pose,frame){const B=BIRD[breed]||BIRD.sparrow,S=B.S,P=[];P.markers=[];
  const k=v=>[v[0]*S,v[1]*S,v[2]*S],add=e=>{e.c=k(e.c);e.r=k(e.r);P.push(e);return e;};
  let z=B.leg+B.h*.85,pitch=.22,headAt=[B.len*.88,0,B.h*.95],headPitch=0,headYaw=0,legs='stand',wings='fold',flap=0,fluff=1,shut=false,tailUp=B.tailUp;
  if(pose==='hop'){const f=frame%4;z+= [ -.006,.018,.026,.006 ][f];legs=f===1||f===2?'tuck':'stand';pitch=f===0?.05:.3;}
  else if(pose==='peck'){pitch=-.35;headAt=[B.len*1.05,0,frame%2?-B.h*.55:-B.h*.2];headPitch=frame%2?-1.1:-.6;tailUp=B.tailUp+.35;}
  else if(pose==='preen'){headAt=[B.len*.35,frame%2?.012:-.012,B.h*.9];headYaw=frame%2?2.5:-2.5;headPitch=-.5;}
  else if(pose==='rest'||pose==='sleep'){fluff=1.22;z=B.h*.95;legs='hide';headAt=[B.len*.7,0,B.h*.62];shut=pose==='sleep';if(pose==='sleep'){headAt=[B.len*.35,.012,B.h*.75];headYaw=2.6;headPitch=-.3;z+=frame%2?.002:0;}pitch=.12;}
  else if(pose==='fly'){z=B.leg+B.h+.075+(frame%2?.006:0);pitch=.05;legs='tuck';wings='spread';flap=[1,.25,-.75,.25][frame%4];tailUp=0;}
  else if(pose==='takeoff'){z=B.leg+B.h+.025;pitch=.5;legs='dangle';wings='spread';flap=1.1;}
  else if(pose==='land'){z=B.leg+B.h+.02;pitch=.45;legs='dangle';wings='spread';flap=.6;tailUp=B.tailUp+.25;}
  else {headYaw=frame%2?.35:-.1;tailUp=B.tailUp+(frame%2?.12:0);} // idle: look around + tail flick
  const cp=Math.cos(pitch),sp=Math.sin(pitch),bf=(x,zz)=>[x*cp-zz*sp,0,z+x*sp+zz*cp];
  add(ell('body',[0,0,z],[B.len*fluff,B.w*fluff,B.h*fluff],0,pitch));
  add(ell('breast',bf(B.len*.45,-B.h*.2),[B.len*.55*fluff,B.w*.95*fluff,B.h*.85*fluff],0,pitch));
  // tail
  const tb=bf(-B.len*.85,B.h*.1);add(ell('tail',[tb[0]-B.tail[0]*.8*Math.cos(tailUp-pitch*.5),0,tb[2]+B.tail[0]*.8*Math.sin(tailUp-pitch*.5)],B.tail,0,tailUp));
  // wings
  if(wings==='fold'){for(const s of [1,-1])add(ell('wing',bf(-B.len*.12,B.h*.25).map((v,i)=>i===1?s*B.w*.78*fluff:v),[B.len*.85,B.w*.32,B.h*.62*fluff],0,pitch+.12,{side:s}));}
  else{for(const s of [1,-1])for(let i=0;i<5;i++){const t=(i+.5)/5,span=B.len*2.3,yy=s*(B.w*.6+t*span),zz=z+B.h*.2+Math.sin(flap)*t*span*.85,xx=-B.len*.05-t*t*B.len*.35;
    add(ell('wing',[xx,yy,zz],[B.len*(.62-.3*t),span/5*.75,B.h*.16],0,0,{side:s,t}));}}
  // head
  const hc=[headAt[0],headAt[1],z+headAt[2]];add(ell('head',hc,[B.head,B.head*.96,B.head*.95],headYaw,headPitch));
  const hy=Math.cos(headYaw),hs=Math.sin(headYaw),hp=Math.cos(headPitch),hq=Math.sin(headPitch),hf=(x,y,zz)=>{const X=x*hp-zz*hq,Z=x*hq+zz*hp;return [hc[0]+X*hy-y*hs,hc[1]+X*hs+y*hy,hc[2]+Z];};
  add(ell('beak',hf(B.head*.95+B.beak[0]*.6,0,-B.head*.12),B.beak,headYaw,headPitch-.15));
  if(breed==='pigeon')add(ell('cere',hf(B.head*.85,0,-B.head*.02),[.006,.006,.004],headYaw,headPitch));
  for(const s of [1,-1])P.markers.push({kind:shut?'shut':'eye',p:hf(B.head*.45,s*B.head*.8,B.head*.2)});
  // legs
  if(legs!=='hide'){for(const s of [1,-1]){const y=s*B.w*.35,top=[B.len*.05,y,z-B.h*.6],foot=legs==='tuck'?[-B.len*.25,y,z-B.h*.85]:legs==='dangle'?[B.len*.05,y,z-B.h*.6-B.leg*.9]:[B.len*.1,y,0];
    limbAdd(add,'bleg',top,foot,.0042,.0042,4,s);if(legs==='stand')add(ell('foot',[foot[0]+.006,y,.002],[.011,.004,.0025]));}}
  P.markers=P.markers.map(m=>({...m,p:k(m.p)}));return P;}
 function birdColour(breed,part,q,prim){const B=BIRD[breed]||BIRD.sparrow,S=B.S,zr=q[2]-prim.c[2];
  switch(breed){
   case 'pigeon':{if(part==='beak')return [64,58,62];if(part==='cere')return [236,232,226];if(part==='bleg'||part==='foot')return [196,96,104];
    if(part==='head')return [104,112,132];if(part==='breast'&&zr>prim.r[2]*.15)return Math.sin(q[1]*90)>0?[96,132,118]:[124,98,140];
    if(part==='wing'){if(prim.t!=null&&prim.t>.7)return [64,68,82];const bar=Math.sin(q[0]/S*260);return bar>.82?[58,62,74]:[150,156,170];}
    if(part==='tail')return q[0]<prim.c[0]-prim.r[0]*.5?[52,56,66]:[124,130,146];return [138,144,160];}
   case 'magpie':{if(part==='beak'||part==='bleg'||part==='foot')return [24,24,30];
    if(part==='wing'){if(prim.t!=null)return prim.t<.45?[236,238,240]:[40,60,108];return zr>prim.r[2]*.1?[236,238,240]:[38,58,104];}
    if(part==='tail')return [34,52,92];if(part==='breast'&&zr<prim.r[2]*.2)return [240,240,238];if(part==='body'&&zr<-prim.r[2]*.35)return [236,236,234];return [28,30,38];}
   default:{// sparrow (麻雀): chestnut crown, white cheek with black spot, black bib, streaked brown back, buff belly
    if(part==='beak')return [56,46,42];if(part==='bleg'||part==='foot')return [176,132,104];
    if(part==='head'){if(zr>prim.r[2]*.35)return [132,78,50];if(q[0]>prim.c[0]+prim.r[0]*.55&&zr<0)return [36,30,30];return Math.abs(q[1]-prim.c[1])>prim.r[1]*.55&&zr<prim.r[2]*.2?(Math.abs(zr)<prim.r[2]*.15&&q[0]<prim.c[0]?[44,36,34]:[232,226,212]):[132,78,50];}
    if(part==='breast')return zr<-prim.r[2]*.1?[214,204,184]:(q[0]>prim.c[0]+prim.r[0]*.3&&zr<prim.r[2]*.3?[40,34,32]:[196,186,170]);
    if(part==='wing'){if(prim.t!=null)return prim.t>.75?[70,52,40]:(prim.t>.45&&prim.t<.6?[230,222,206]:[152,108,70]);const st=Math.sin(q[0]/S*300+q[2]/S*120);return Math.abs(zr)<prim.r[2]*.12&&q[0]>prim.c[0]?[232,224,208]:st>.55?[70,48,34]:[156,112,72];}
    if(part==='tail')return [96,70,50];if(part==='body')return zr<-prim.r[2]*.25?[208,198,180]:(Math.sin(q[0]/S*280)>.5?[96,66,44]:[150,108,70]);return [150,108,70];}}}
 // ---------- patterns ----------
 function palette(species,breed,coat){const c=rgb(coat),cream=mix(c,[246,236,214],.72),dark=mul(c,.55),white=[244,240,232];
  return {c,cream,dark,white,outline:mix(mul(c,.28),[26,22,30],.45),nose:species==='cat'?[214,128,132]:[40,34,36],eye:species==='cat'?[48,52,30]:[28,22,22],shut:mul(c,.45),inner:[226,160,160],collar:null};}
 function baseColour(pal,breed,species,part,q,prim){// q: hit point in pet space (scaled)
  const {c,cream,dark,white}=pal,n=(a,b,s)=>Math.sin(a*s+1.3)*Math.sin(b*s*1.3+.7)+Math.sin((a+b)*s*.7);
  if(part==='nose')return pal.nose;
  if(part==='ear'&&prim.flop)return breed==='spotted'?[96,64,44]:dark;
  switch(breed){
   case 'grey_tabby':case 'orange_tabby':{if((part==='muzzle'||part==='cheek')&&q[2]<prim.c[2])return mix(c,white,breed==='grey_tabby'?.75:.55);if(part==='paw'&&breed==='grey_tabby')return mix(c,white,.7);
    const s=part==='tail'?Math.sin(prim.t*22):Math.sin(q[0]*46+Math.sin(q[2]*30)*1.2);if((part==='body'||part==='haunch'||part==='chest'||part==='tail'||part==='thigh'||part==='head'&&q[2]>prim.c[2]+.02||part==='leg'&&q[2]>.06)&&s>.45)return mul(c,breed==='grey_tabby'?.58:.72);
    if((part==='body'||part==='chest')&&q[2]<prim.c[2]-prim.r[2]*.55)return mix(c,white,.45);return c;}
   case 'calico':{if(part==='paw'||part==='muzzle'||part==='cheek'||((part==='body'||part==='chest')&&q[2]<prim.c[2]-prim.r[2]*.2))return white;const v=n(q[0],q[1]+q[2],17);return v>.8?[210,128,62]:v<-.9?[58,50,48]:[236,228,214];}
   case 'cream_point':{if(part==='ear'||part==='muzzle'||part==='paw'||part==='tail'&&prim.t>.55)return [150,112,88];return mix(c,white,.15);}
   case 'tuxedo':{if(part==='paw'||part==='muzzle'||(part==='chest'&&q[1]>-.03&&q[1]<.03)||((part==='body'||part==='chest')&&q[2]<prim.c[2]-prim.r[2]*.5))return white;return [52,50,56];}
   case 'shiba':{if(part==='muzzle'||part==='cheek'||(part==='head'&&q[2]<prim.c[2]-prim.r[2]*.35)||part==='paw'||(part==='leg'&&q[2]<.1)||((part==='body'||part==='chest'||part==='neck')&&q[2]<prim.c[2]-prim.r[2]*.35)||(part==='tail'&&prim.t>.5&&q[2]<prim.c[2]))return cream;if(part==='ear')return mul(c,.92);return c;}
   case 'rural':{if(part==='muzzle'||((part==='body'||part==='chest'||part==='neck')&&q[2]<prim.c[2]-prim.r[2]*.4)||part==='paw')return mix(c,[244,226,190],.55);if((part==='body'||part==='haunch')&&q[2]>prim.c[2]+prim.r[2]*.55)return mul(c,.82);if(part==='muzzle'&&q[0]>prim.c[0]+.03)return mul(c,.45);return c;}
   case 'spotted':{if(part==='ear')return [96,64,44];if(part==='head'&&q[1]>0&&q[2]>prim.c[2])return [112,76,52];const v=n(q[0]*1.4,q[1]+q[2]*.6,23);if((part==='body'||part==='haunch'||part==='chest'||part==='thigh')&&v>1.1)return [92,64,48];return mix(c,white,.35);}
   default:return c;}}
 // ---------- ray cast ----------
 function hitEll(e,o,d){const a=e.ax,q=[0,0,0],v=[0,0,0];const oc=[o[0]-e.wc[0],o[1]-e.wc[1],o[2]-e.wc[2]];for(let i=0;i<3;i++){q[i]=dot(oc,e.wax[i])/e.r[i];v[i]=dot(d,e.wax[i])/e.r[i];}
  const A=dot(v,v),Bq=2*dot(q,v),C=dot(q,q)-1,disc=Bq*Bq-4*A*C;if(disc<0)return null;const t=(-Bq-Math.sqrt(disc))/(2*A);if(t<0)return null;const l=[(q[0]+v[0]*t)/e.r[0],(q[1]+v[1]*t)/e.r[1],(q[2]+v[2]*t)/e.r[2]];
  return {t,n:norm([e.wax[0][0]*l[0]+e.wax[1][0]*l[1]+e.wax[2][0]*l[2],e.wax[0][1]*l[0]+e.wax[1][1]*l[1]+e.wax[2][1]*l[2],e.wax[0][2]*l[0]+e.wax[1][2]*l[1]+e.wax[2][2]*l[2]])};}
 const cache=new Map();
 function sprite(id,p,dir,pose,frame,collar){const species=p.species,breed=breedOf(id,p),bird=species==='bird',key=[species,breed,p.coat,dir,pose,frame,collar||''].join('|');if(cache.has(key))return cache.get(key);
  if(bird)collar=null;const P=bird?birdModel(breed,pose,frame):model(species,breed,pose,frame),h=(DIRS[dir]??225)*Math.PI/180,ch=Math.cos(h),sh=Math.sin(h),W=v=>[v[0]*ch-v[1]*sh,v[0]*sh+v[1]*ch,v[2]],pal=bird?{outline:[26,22,28],eye:[16,14,16],shut:[96,74,60],nose:[0,0,0]}:palette(species,breed,p.coat);
  if(collar){const neck=P.find(e=>e.part==='neck');if(neck)P.push(Object.assign(ell('collar',[neck.c[0]-.004,neck.c[1],neck.c[2]-neck.r[2]*.15],[neck.r[0]*.75,neck.r[1]*1.12,neck.r[2]*.3],0,0),{col:rgb(collar)}));}
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  for(const e of P){e.wc=W(e.c);e.wax=e.ax.map(W);const sx=dot(e.wc,R)*SCALE,sy=-dot(e.wc,U)*SCALE,m=Math.max(...e.r)*SCALE+1;x0=Math.min(x0,sx-m);x1=Math.max(x1,sx+m);y0=Math.min(y0,sy-m);y1=Math.max(y1,sy+m);}
  x0=Math.floor(x0)-1;x1=Math.ceil(x1)+1;y0=Math.floor(y0)-1;y1=Math.ceil(y1)+1;const w=x1-x0+1,hgt=y1-y0+1,col=new Array(w*hgt).fill(null),dep=new Float32Array(w*hgt).fill(1e9),base=new Array(w*hgt).fill(null);
  for(let py=0;py<hgt;py++)for(let px=0;px<w;px++){const u=(x0+px+.5)/SCALE,v=-(y0+py+.5)/SCALE,o=[u*R[0]+v*U[0]-3*D[0],u*R[1]+v*U[1]-3*D[1],u*R[2]+v*U[2]-3*D[2]];let best=null,be=null;
   for(const e of P){const r=hitEll(e,o,D);if(r&&(!best||r.t<best.t)){best=r;be=e;}}
   if(!best)continue;const wp=[o[0]+D[0]*best.t,o[1]+D[1]*best.t,o[2]+D[2]*best.t],q=[wp[0]*ch+wp[1]*sh,-wp[0]*sh+wp[1]*ch,wp[2]];
   const b=be.col||(bird?birdColour(breed,be.part,q,be):baseColour(pal,breed,species,be.part,q,be)),li=dot(best.n,LIGHT),i=py*w+px;
   const occl=!bird&&q[2]<.035&&be.part!=='paw'?.86:1;let c=li>.62?mix(b,[255,250,236],.2):li>.12?b:li>-.3?mix(mul(b,.78),[70,80,120],.08):mix(mul(b,.6),[50,56,96],.12);c=mul(c,occl);
   col[i]=c;dep[i]=best.t;base[i]=b;}
  // markers: eyes / nose on visible head surface
  for(const m of P.markers||[]){const wp=W(m.p),sx=Math.round(dot(wp,R)*SCALE-x0-.5),sy=Math.round(-dot(wp,U)*SCALE-y0-.5);if(sx<0||sy<0||sx>=w||sy>=hgt)continue;const i=sy*w+sx,t=dot([wp[0]-(((x0+sx+.5)/SCALE)*R[0]+(-(y0+sy+.5)/SCALE)*U[0]-3*D[0]),wp[1]-(((x0+sx+.5)/SCALE)*R[1]+(-(y0+sy+.5)/SCALE)*U[1]-3*D[1]),wp[2]-(((x0+sx+.5)/SCALE)*R[2]+(-(y0+sy+.5)/SCALE)*U[2]-3*D[2])],D);
   if(!col[i]||Math.abs(dep[i]-t)>.06)continue;col[i]=m.kind==='eye'?pal.eye:m.kind==='shut'?pal.shut:pal.nose;base[i]=col[i];}
  // outline: silhouette edge + depth breaks (far side of a step gets the line)
  const out=col.slice();for(let py=0;py<hgt;py++)for(let px=0;px<w;px++){const i=py*w+px;if(!col[i])continue;let edge=false,step=false;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=px+dx,Y=py+dy;if(X<0||Y<0||X>=w||Y>=hgt||!col[Y*w+X]){edge=true;continue;}if(dep[Y*w+X]<dep[i]-(bird?.05:.07))step=true;}
   if(edge)out[i]=mix(mul(base[i],.4),pal.outline,.45);else if(step)out[i]=mix(mul(base[i],.66),pal.outline,.2);}
  const runs=[];for(let py=0;py<hgt;py++){let px=0;while(px<w){const c=out[py*w+px];if(!c){px++;continue;}const h1=hex(c);let n=1;while(px+n<w&&out[py*w+px+n]&&hex(out[py*w+px+n])===h1)n++;runs.push([px,py,n,h1]);px+=n;}}
  const spr={w,h:hgt,ox:-x0,oy:-y0,runs,canvas:null,breed};
  try{const doc=root.document,cv=doc?.createElement?.('canvas'),g=cv?.getContext?.('2d');if(g&&typeof g.fillRect==='function'){cv.width=w;cv.height=hgt;for(const [x,y,n,c] of runs){g.fillStyle=c;g.fillRect(x,y,n,1);}spr.canvas=cv;}}catch(_){spr.canvas=null;}
  cache.set(key,spr);if(cache.size>900)cache.delete(cache.keys().next().value);return spr;}
 // ---------- mode -> pose ----------
 const birdState=new WeakMap();
 function birdPose(r,a,now){const m=r.mode,fly=m==='flee';let st=birdState.get(a);if(!st){st={fly,at:-9};birdState.set(a,st);}
  if(st.fly!==fly){st.fly=fly;st.at=now;}const since=now-st.at;
  if(fly)return since<.22?'takeoff':'fly';if(since<.22)return 'land';
  if(m==='sleep')return 'sleep';if(m==='rest'||m==='shelter'||m==='calm')return 'rest';if(m==='eat'||m==='sniff')return 'peck';if(m==='groom')return 'preen';
  if(['walk','follow','hop'].includes(m))return 'hop';return 'idle';}
 function poseFor(p,r,a,now){const m=r.mode;if(p.species==='bird')return birdPose(r,a||{},now||0);if(m==='sleep')return 'sleep';if(m==='rest')return 'lie';if(m==='eat'||m==='sniff')return 'eat';if(m==='groom')return p.species==='cat'?'groom':'sit';
  if(['walk','follow','flee','shelter','hop'].includes(m))return 'walk';if(p.species==='cat'&&(m==='idle'||m==='calm'))return 'sit';return 'idle';}
 /* opt.alt: sprite raised this many px above the ground point (flying / perched birds); opt.shadow: 'ground' (default), 'feet' (on the perch) or 'none' */
 function drawBird(ctx,a,r,p,now,opt={}){const pose=poseFor(p,r,a,now),[X,Y]=a.screen(),seed=(a.x||0)*3.1+(a.y||0)*1.7,alt=Math.max(0,opt.alt||0),sh=opt.shadow||'ground';
  const fps={hop:10,fly:14,peck:4,preen:2.5,idle:1.4,sleep:.6}[pose]||1,n={hop:4,fly:4,peck:2,preen:2,idle:2,sleep:2}[pose]||1,frame=((Math.floor(now*fps+seed)%n)+n)%n;
  const s=sprite(a.animalId,p,a.dir in DIRS?a.dir:'SW',pose,frame,null),air=pose==='fly'||pose==='takeoff'||pose==='land';
  ctx.save();ctx.imageSmoothingEnabled=false;if(sh!=='none'){const sy=sh==='feet'?Y-alt:Y;ctx.fillStyle=air?'rgba(20,36,28,.16)':'rgba(20,36,28,.26)';ctx.beginPath();ctx.ellipse(X,sy-1,air?4:5,air?1.5:2,0,0,Math.PI*2);ctx.fill();}
  const x=Math.round(X-s.ox),y=Math.round(Y-alt-s.oy);if(s.canvas)ctx.drawImage(s.canvas,x,y);else for(const [rx,ry,w,c] of s.runs){ctx.fillStyle=c;ctx.fillRect(x+rx,y+ry,w,1);}
  ctx.restore();return true;}
 function draw(ctx,a,r,p,opt={}){if(p&&p.species==='bird')return drawBird(ctx,a,r,p,opt.now??SP.now??0,opt);if(!p||(p.species!=='cat'&&p.species!=='dog'))return false;const now=opt.now??SP.now??0,pose=poseFor(p,r,a,now),[X,Y]=a.screen();
  const fps=pose==='walk'?(r.mode==='flee'?12:p.species==='dog'?9:8):pose==='sleep'?.6:pose==='idle'?(p.species==='dog'&&(r.trust||0)>2?5:1.6):1.6,seed=(a.x||0)*3.1+(a.y||0)*1.7;
  const frame=pose==='walk'?Math.floor(now*fps+seed)%4:(pose==='idle'||pose==='sleep')?Math.floor(now*fps+seed)%2:0,collar=r.ownerId==null?null:r.ownerId==='player'?'#3fae8a':'#c0504d';
  const s=sprite(a.animalId,p,a.dir in DIRS?a.dir:'SW',pose,frame,collar);
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.fillStyle='rgba(20,36,28,.28)';ctx.beginPath();ctx.ellipse(X,Y-1,p.species==='dog'?14:10,4,0,0,Math.PI*2);ctx.fill();
  if(pose==='eat'&&r.mode==='eat'){const h=(DIRS[a.dir]??225)*Math.PI/180,f=p.species==='dog'?.5:.38,dx=Math.cos(h)*f,dy=Math.sin(h)*f,bx=Math.round(X+(dx-dy)*32),by=Math.round(Y-(dx+dy)*16);ctx.fillStyle='#4f6470';ctx.fillRect(bx-5,by-2,10,4);ctx.fillStyle='#b9cad0';ctx.fillRect(bx-4,by-3,8,2);ctx.fillStyle='#b48a50';ctx.fillRect(bx-3,by-3,6,1);}
  const x=Math.round(X-s.ox),y=Math.round(Y-s.oy);
  if(s.canvas)ctx.drawImage(s.canvas,x,y);else for(const [rx,ry,n,c] of s.runs){ctx.fillStyle=c;ctx.fillRect(x+rx,y+ry,n,1);}
  ctx.restore();return true;}
 SP.animalArt={draw,sprite,breedOf,poseFor,BREEDS,BIRD_BREEDS:Object.keys(BIRD),clear:()=>cache.clear()};
})(typeof window!=='undefined'?window:globalThis);
