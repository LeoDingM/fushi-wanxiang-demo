/* P3b 榕桥菜市场：摊主与买菜的唯一账本（ps.wetMarket）。Pure: no DOM, no clock, no randomness (hash-seeded plans only).
 * - 17 operating stalls (8 island stalls, 7 inner bays with their street stalls, 2 aquatic counters); one named vendor each;
 * - goods enter only by a paid cold-chain delivery (vendor cash -> 榕桥冷链 supplier cash) and leave only by a recorded sale
 *   (player or a market regular), or by a recorded discard of batches past their stall life (to the market trash room);
 * - per stall per SKU: delivered = stock + soldPlayer + soldNpc + wasted; cash = opening + sales - wholesale;
 * - market regulars (街坊买菜客) are a finite group with their own wallets: seed + daily household money - spent;
 *   what they buy goes in their bag, then home with them (off the map). Prices come from the shared price table.
 * Money in cents. Times in absolute game minutes. 价格、进价、作息均为「未经Leo确认」的游戏设定。 */
(function(root){'use strict';
const VERSION=4,OPEN=330,CLOSE=1230,TRUCK=280,SETUP=15,PACK=10,SPEED=1.2,SUPPLIER='rq_coldchain',RECEIPT_CAP=400,BATCH_CAP=4,ACTIVE_SHOPPERS=12,OPEN_CASH=80000;
const EDGE=[30.2,139.4],STREET_Y=95,GATE_OUT=[65.5,98.6],GATE_IN=[65.5,102.2],MG=[65.5,95],WG_IN=[49.6,116],WG_OUT=[46.6,116],CROSS_Y=116.2,FRONT_Y=105.9;
/* [sku, item, give, label, spec, cost cents (wholesale per portion), cap portions, stall life days]. Retail = price table 'rq_'+sku. */
const S=(sku,item,give,label,spec,cost,cap,life)=>({sku,item,give,label,spec,cost,cap,life});
const STALLS=[
 {id:'pork',name:'陈记猪肉',vname:'陈叔',kind:'island',face:'N',x0:50.5,y0:110.75,hours:[320,1140],look:{gender:'male',hair:'buzz',ageYears:52},skus:[S('pork_belly','pork',1,'五花肉','半斤 · 约250g',620,8,2),S('pork_lean','pork',1,'瘦肉','半斤 · 约250g',700,8,2),S('pork_ribs','pork',1,'排骨','半斤 · 约250g',1150,6,2)]},
 {id:'beef',name:'马记牛羊肉',vname:'马师傅',kind:'island',face:'N',x0:56.5,y0:110.75,hours:[330,1110],look:{gender:'male',hair:'short',ageYears:45},skus:[S('beef_brisket','beef',1,'牛腩','半斤 · 约250g',2000,5,2),S('beef_shin','beef',1,'牛腱','半斤 · 约250g',2300,4,2),S('lamb_slice','beef',1,'羊肉片','半斤 · 约250g',2150,4,2)]},
 {id:'poultry',name:'何记冰鲜禽',vname:'何姐',kind:'island',face:'S',x0:50.5,y0:107,hours:[330,1110],look:{gender:'female',hair:'perm',ageYears:48},skus:[S('chicken_half','chicken',1,'冰鲜三黄鸡','半只 · 约700g',1700,5,2),S('chicken_leg','chicken',1,'鸡腿','两只 · 约500g',980,6,2),S('chicken_wing','chicken',1,'鸡中翅','半斤 · 约250g',1050,6,2)]},
 {id:'eggs',name:'刘姐蛋行',vname:'刘姐',kind:'island',face:'S',x0:56.5,y0:107,hours:[390,1170],look:{gender:'female',hair:'bun',ageYears:55},skus:[S('egg_10','egg',10,'鸡蛋','10只 · 约600g',580,8,10),S('egg_farm','egg',10,'土鸡蛋','10只 · 约500g',1080,4,10)]},
 {id:'tofu',name:'黄记豆腐',vname:'黄伯',kind:'island',face:'N',x0:68.5,y0:110.75,hours:[330,1080],look:{gender:'male',hair:'grey',ageYears:63},skus:[S('tofu_block','tofu',1,'水豆腐','一块 · 约500g',180,10,1),S('tofu_puff','tofu',1,'豆腐泡','一袋 · 约150g',250,8,1),S('tofu_skin','tofu',1,'豆腐皮','一份 · 约200g',320,6,1)]},
 {id:'deli',name:'金记烧腊',vname:'金哥',kind:'island',face:'N',x0:74.5,y0:110.75,hours:[450,1170],look:{gender:'male',hair:'sidepart',ageYears:38},skus:[S('deli_goose','deli',1,'烧鹅','半斤 · 约250g',2200,4,1),S('deli_charsiu','deli',1,'叉烧','半斤 · 约250g',1500,5,1),S('deli_chicken','deli',1,'白切鸡','半只 · 约600g',2600,3,1)]},
 {id:'dry',name:'梁记干货',vname:'梁姨',kind:'island',face:'S',x0:68.5,y0:107,hours:[420,1140],look:{gender:'female',hair:'bob',ageYears:58},skus:[S('dry_mushroom','dried',1,'香菇','二两 · 约100g',800,6,60),S('dry_dates','dried',1,'红枣','半斤 · 约250g',650,6,60),S('dry_shrimp','dried',1,'虾米','一两 · 约50g',1000,5,60)]},
 {id:'grain',name:'吴记粮油',vname:'吴叔',kind:'island',face:'S',x0:74.5,y0:107,hours:[420,1140],look:{gender:'male',hair:'short',ageYears:57},skus:[S('grain_noodle','noodles',1,'挂面','一把 · 约500g',400,10,90),S('grain_eggnoodle','noodles',1,'鸡蛋面','一包 · 约400g',460,8,90)]},
 {id:'fish',name:'林记鲜鱼',vname:'林姐',kind:'aqua',face:'S',x0:50.5,y0:118,hours:[320,1080],look:{gender:'female',hair:'pony',ageYears:42},skus:[S('fish_grass','fish',1,'鲩鱼（草鱼）','一条 · 约1kg',1550,4,1),S('fish_bass','fish',1,'鲈鱼','一条 · 约600g',1850,4,1),S('fish_tilapia','fish',1,'罗非鱼','一条 · 约700g',950,4,1)]},
 {id:'shell',name:'苏记虾蟹贝',vname:'苏哥',kind:'aqua',face:'S',x0:56.5,y0:118,hours:[330,1080],look:{gender:'male',hair:'undercut',ageYears:35},skus:[S('shell_shrimp','shrimp',1,'基围虾','半斤 · 约250g',2100,4,1),S('shell_clam','shrimp',1,'花甲','一斤 · 约500g',800,5,1),S('shell_oyster','shrimp',1,'生蚝','4只 · 约400g',1400,3,1)]}];
const FRUIT=[[S('fr_banana','fruit',1,'香蕉','两斤',520,5,5),S('fr_apple','fruit',1,'苹果','两斤',950,5,5),S('fr_orange','fruit',1,'橙子','两斤',800,5,5)],
 [S('fr_grape','fruit',1,'葡萄','一斤',800,5,4),S('fr_guava','fruit',1,'番石榴','两斤',650,5,5),S('fr_melon','fruit',1,'西瓜','半个 · 约3斤',1000,4,3)],
 [S('fr_pomelo','fruit',1,'沙田柚','一个 · 约2斤',800,5,10),S('fr_pear','fruit',1,'雪梨','两斤',650,5,6),S('fr_mango','fruit',1,'芒果','两斤',1050,4,4)],
 [S('fr_banana2','fruit',1,'香蕉','两斤',520,5,5),S('fr_pitaya','fruit',1,'火龙果','两个 · 约1kg',800,5,5),S('fr_tangerine','fruit',1,'砂糖橘','两斤',650,5,6)]];
const VEG=[[S('vg_choysum','veg',1,'菜心','一斤',330,8,1),S('vg_lettuce','veg',1,'生菜','一斤',250,8,1),S('vg_waterspinach','veg',1,'通菜','一斤',250,8,1)],
 [S('vg_tomato','veg',1,'番茄','一斤',330,8,3),S('vg_potato','veg',1,'土豆','一斤',180,8,7),S('vg_pepper','veg',1,'青椒','一斤',330,6,3)],
 [S('vg_kailan','veg',1,'芥兰','一斤',400,6,1),S('vg_wintermelon','veg',1,'冬瓜','两斤',250,6,7),S('vg_aromatics','veg',1,'葱姜蒜','一份',180,8,3)]];
const BAY=3.875,BAYX=[48,51.875,55.75,59.625,67.5,71.375,75.25];
[['黄姨水果','黄姨',{gender:'female',hair:'perm',ageYears:60}],['阿珍水果','阿珍',{gender:'female',hair:'long',ageYears:33}],['老郑水果','老郑',{gender:'male',hair:'grey',ageYears:66}],['小何水果','小何',{gender:'male',hair:'short',ageYears:27}],
 ['周姨蔬菜','周姨',{gender:'female',hair:'bob',ageYears:59}],['老蔡蔬菜','老蔡',{gender:'male',hair:'buzz',ageYears:61}],['邓姐蔬菜','邓姐',{gender:'female',hair:'wave',ageYears:46}]].forEach(([name,vname,look],i)=>
 STALLS.push({id:'bay'+i,name,vname,kind:'bay',face:'N',x0:BAYX[i],y0:100.35,hours:i<4?[380+i*6,1215]:[330+i*4,1200],look,skus:i<4?FRUIT[i]:VEG[i-4]}));
/* E4b 榕桥第二菜市场 (2026-10-18): the same 17 stalls in the translated hall on 南关路 east (js/rongqiao_market2.js, offset DX/DY),
 * each with its own vendor, stock and cash, in THIS ledger (ids 'm2_*', SKU ids 'm2_*' priced from the same table entry as their base).
 * Its people come and go by the east end of the 南关路 north pavement. Vendor names / looks / hours 未经Leo确认. */
const M2={DX:108,DY:-160,EDGE:[299.2,-62.4],SY:-62.4};
const NAMES2=[['张记猪肉','张叔',{gender:'male',hair:'short',ageYears:49}],['回记牛羊肉','老马',{gender:'male',hair:'buzz',ageYears:56}],['谢记冰鲜禽','谢姐',{gender:'female',hair:'bob',ageYears:44}],['钟姨蛋档','钟姨',{gender:'female',hair:'perm',ageYears:61}],
 ['卢记豆腐','卢婶',{gender:'female',hair:'bun',ageYears:58}],['李记烧腊','李哥',{gender:'male',hair:'sidepart',ageYears:41}],['莫记干货','莫姨',{gender:'female',hair:'wave',ageYears:54}],['胡记粮油','胡伯',{gender:'male',hair:'grey',ageYears:65}],
 ['潘记鲜鱼','潘姐',{gender:'female',hair:'pony',ageYears:39}],['梁仔海鲜','梁仔',{gender:'male',hair:'undercut',ageYears:31}],['四季鲜果','阿梅',{gender:'female',hair:'long',ageYears:36}],['林伯水果','林伯',{gender:'male',hair:'bald',ageYears:68}],
 ['小周水果','小周',{gender:'male',hair:'short',ageYears:29}],['甘姨水果','甘姨',{gender:'female',hair:'perm',ageYears:57}],['赖姨蔬菜','赖姨',{gender:'female',hair:'braid',ageYears:60}],['老温蔬菜','老温',{gender:'male',hair:'grey',ageYears:63}],['方姐蔬菜','方姐',{gender:'female',hair:'pixie',ageYears:47}]];
STALLS.slice().forEach((t,i)=>{const [name,vname,look]=NAMES2[i];STALLS.push({id:'m2_'+t.id,base:t.id,market:2,name,vname,kind:t.kind,face:t.face,x0:t.x0,y0:t.y0,hours:[t.hours[0]+5+(i%4)*3,t.hours[1]-(i%3)*5],look,
 skus:t.skus.map(k=>Object.assign({},k,{sku:'m2_'+k.sku,base:k.sku}))});});
/* E4e 万家菜市场综合楼 (2026-10-18): the same 17 stalls once more in the riverside mixed-use block on the 月河 south bank, west end
 * (js/rongqiao_market3.js, offset DX/DY), ids 'm3_*', in THIS ledger; its people come and go by the west end of the lane south of the hall.
 * Vendor names / looks / hours 未经Leo确认. */
const M3={DX:-148,DY:57.5,EDGE:[-105.4,154.6],SY:154.6};
const NAMES3=[['万家猪肉档','阿荣',{gender:'male',hair:'buzz',ageYears:47}],['蔡记牛羊肉','蔡师傅',{gender:'male',hair:'short',ageYears:53}],['冼姐冰鲜禽','冼姐',{gender:'female',hair:'perm',ageYears:50}],['邹姨蛋行','邹姨',{gender:'female',hair:'bun',ageYears:58}],
 ['叶记豆腐','叶婶',{gender:'female',hair:'bob',ageYears:62}],['万家烧腊','阿威',{gender:'male',hair:'sidepart',ageYears:36}],['陆记干货','陆伯',{gender:'male',hair:'grey',ageYears:67}],['邱记粮油','邱姐',{gender:'female',hair:'wave',ageYears:45}],
 ['阿水河鲜','阿水',{gender:'male',hair:'undercut',ageYears:41}],['杨记海鲜','杨姐',{gender:'female',hair:'pony',ageYears:38}],['万家鲜果','阿芳',{gender:'female',hair:'long',ageYears:34}],['老关水果','老关',{gender:'male',hair:'bald',ageYears:64}],
 ['小郭水果','小郭',{gender:'male',hair:'short',ageYears:26}],['程姨水果','程姨',{gender:'female',hair:'perm',ageYears:59}],['袁姨蔬菜','袁姨',{gender:'female',hair:'braid',ageYears:61}],['老石蔬菜','老石',{gender:'male',hair:'grey',ageYears:66}],['田姐蔬菜','田姐',{gender:'female',hair:'pixie',ageYears:43}]];
STALLS.filter(t=>!t.market).forEach((t,i)=>{const [name,vname,look]=NAMES3[i];STALLS.push({id:'m3_'+t.id,base:t.id,market:3,name,vname,kind:t.kind,face:t.face,x0:t.x0,y0:t.y0,hours:[t.hours[0]+3+(i%3)*4,t.hours[1]-(i%4)*4],look,
 skus:t.skus.map(k=>Object.assign({},k,{sku:'m3_'+k.sku,base:k.sku}))});});
/* 南埠菜市场 (2026-10-24): five operating stalls in its own hall south of 南埠涌 (js/rongqiao_market_nanbu.js).
 * Ledger and prices stay on this model. Walk geometry is geo4, not a translate of the 榕桥 hall. Names 未经Leo确认. */
const M4={DX:-4,DY:-304,EDGE:[20,-209],SY:-209};
const LIVE4=['pork','eggs','fish','bay0','bay4'];
const NAMES4={pork:['涌边猪肉','阿强',{gender:'male',hair:'buzz',ageYears:46}],eggs:['南埠蛋档','周姨',{gender:'female',hair:'perm',ageYears:54}],fish:['涌口鲜鱼','林叔',{gender:'male',hair:'short',ageYears:51}],bay0:['凤凰水果','阿莲',{gender:'female',hair:'pony',ageYears:32}],bay4:['涌南蔬菜','蔡姨',{gender:'female',hair:'bob',ageYears:58}]};
STALLS.filter(t=>!t.market&&LIVE4.includes(t.id)).forEach((t,i)=>{const [name,vname,look]=NAMES4[t.id];STALLS.push({id:'m4_'+t.id,base:t.id,market:4,name,vname,kind:t.kind,face:t.face,x0:t.x0,y0:t.y0,hours:[t.hours[0]+4+(i%3)*3,t.hours[1]-(i%2)*6],look,
 skus:t.skus.map(k=>Object.assign({},k,{sku:'m4_'+k.sku,base:k.sku}))});});
const MK={2:M2,3:M3,4:M4};
const BY={},SKU={};for(const t of STALLS){BY[t.id]=t;for(const k of t.skus)SKU[k.sku]=Object.assign({stall:t.id},k);}
const marketOf=t=>(t&&t.market)||1,edgeOf=t=>MK[marketOf(t)]?MK[marketOf(t)].EDGE:EDGE,priceKey=sku=>'rq_'+((SKU[sku]&&SKU[sku].base)||sku);
/* market-1 local point -> market-2 world point: the N-edge approach becomes the 南关路 pavement from its east end */
const tpOf=Q=>p=>p===EDGE||(p[0]===EDGE[0]&&p[1]===EDGE[1])?Q.EDGE.slice():[p[0]===EDGE[0]?Q.EDGE[0]:+(p[0]+Q.DX).toFixed(3),p[1]===STREET_Y?Q.SY:+(p[1]+Q.DY).toFixed(3)];
const TP={2:tpOf(M2),3:tpOf(M3),4:tpOf(M4)},tp=TP[2];
/* geometry: vendor lane (public waypoints, then the vendor-only flap / gap / open shutter into the stall), stand point, customer point */
/* 南埠大厅自己的走法：南门仍在 x 61.5，进深先穿过门厅，再进横过道。不走榕桥那条中轴。 */
const NB4={edge:M4.EDGE,street:[61.5,-209],out:[61.5,-205.4],inn:[61.5,-201.8],aisle:[61.5,-194.8],north:[61.5,-178.6]};
const SLOT4={
 pork:{cust:[49,-178.6],stand:[49,-180.5],dir:'N',via:'north'},
 eggs:{cust:[53,-190],stand:[53,-187.6],dir:'S',via:'aisle'},
 fish:{cust:[69,-189.7],stand:[69,-185.2],dir:'S',via:'aisle'},
 bay0:{cust:[48.1,-194.75],stand:[48.1,-197.4],dir:'N',via:'aisle'},
 bay4:{cust:[70.1,-194.75],stand:[70.1,-197.4],dir:'N',via:'aisle'},
};
function dedup(pts){const out=[];for(const q of pts){const l=out[out.length-1];if(!l||Math.hypot(l[0]-q[0],l[1]-q[1])>1e-6)out.push(q);}return out;}
function geo4(t){const s=SLOT4[t.base];const approach=[NB4.edge,NB4.street,NB4.out,NB4.inn,NB4.aisle];if(s.via==='north')approach.push(NB4.north);const prev=approach[approach.length-1];approach.push([s.cust[0],prev[1]],s.cust);return{approach:dedup(approach),lane:[s.cust,s.stand],stand:s.stand.slice(),dir:s.dir,cust:s.cust.slice(),custVia:[NB4.aisle,s.cust.slice()]};}
function geo(t){if(marketOf(t)===4)return geo4(t);if(marketOf(t)>1){const tp=TP[marketOf(t)],g=geo1(BY[t.base]),m=a=>a.map(tp);return{approach:m(g.approach),lane:m(g.lane),stand:tp(g.stand),dir:g.dir,cust:tp(g.cust),custVia:m(g.custVia)};}return geo1(t);}
function geo1(t){
 if(t.kind==='bay'){const x=t.x0+0.22;return{approach:[EDGE,[EDGE[0],STREET_Y],[x,STREET_Y],[x,98.3]],lane:[[x,100.6],[t.x0+1.9,103.4]],stand:[t.x0+1.9,103.4],dir:'N',cust:[t.x0+2.1,105.45],custVia:[[GATE_IN[0],FRONT_Y],[t.x0+2.1,FRONT_Y]]};}
 const inside=[MG,GATE_OUT,GATE_IN];
 if(t.kind==='aqua'){const west=t.id==='fish',ox=west?50.2:63.2,sx=t.x0+3;return{approach:[EDGE,[EDGE[0],STREET_Y],...inside,[GATE_IN[0],CROSS_Y],[ox,CROSS_Y],[ox,120]],lane:[[west?51:62,120],[sx,120]],stand:[sx,120],dir:'S',cust:[sx,117.7],custVia:[[GATE_IN[0],CROSS_Y],[sx,CROSS_Y]]};}
 const isl=t.x0<60?50.5:68.5,left=t.x0===isl,yF=t.face==='S'?109:112.3,sy=t.face==='S'?108.55:112.25,sx=t.x0+3;
 const ox=isl===50.5?(left?49.6:63.3):(left?67.7:81.3),ix=left?t.x0+1.0:t.x0+5.0,main=(isl===50.5&&!left)||(isl===68.5&&left);
 const ap=main?[EDGE,[EDGE[0],STREET_Y],...inside,[GATE_IN[0],yF],[ox,yF]]:[EDGE,[EDGE[0],STREET_Y],...inside,[GATE_IN[0],CROSS_Y],[isl===50.5?49.4:81.7,CROSS_Y],[ox,yF]];
 const cust=t.face==='S'?[sx,106.45]:[sx,115.0],custVia=t.face==='S'?[[GATE_IN[0],FRONT_Y],[sx,FRONT_Y]]:[[GATE_IN[0],CROSS_Y],[sx,CROSS_Y]];
 return{approach:ap,lane:[[ix,yF],[sx,sy]],stand:[sx,sy],dir:t.face,cust,custVia};}
const len=p=>{let l=0;for(let i=1;i<p.length;i++)l+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);return l;};
function vendorPath(t){const g=geo(t);return g.approach.concat(g.lane);}
function walkMinutes(t){return Math.ceil(len(vendorPath(t))/SPEED);}
/* market regulars: 18 households with a habitual list; daily household money is an off-map inflow, recorded */
const REG=[['黄太','female','perm',62,['bay4','pork','tofu'],6000],['梁伯','male','grey',70,['fish','bay5'],5000],['陈太','female','bob',45,['poultry','bay6','bay0'],7000],['阿伦','male','short',31,['deli','bay3'],5000],
 ['何婆婆','female','bun',74,['bay4','tofu','eggs'],4000],['钟先生','male','sidepart',40,['beef','bay5','bay1'],8000],['罗姨','female','wave',56,['shell','bay6'],7000],['小麦','female','pony',26,['bay2','eggs'],3500],
 ['冯伯','male','bald',68,['pork','bay4','grain'],5500],['叶太','female','long',50,['fish','bay4','dry'],7500],['杜生','male','buzz',47,['deli','grain'],6000],['许姨','female','perm',64,['poultry','bay5','tofu'],6000],
 ['阿杰','male','undercut',29,['bay3','eggs','pork'],5000],['蔡婆婆','female','braid',71,['bay6','tofu'],3500],['潘太','female','bob',43,['shell','bay1','bay4'],8000],['邝伯','male','grey',66,['dry','bay0'],4500],
 ['韦生','male','short',38,['beef','bay5'],7000],['苏姨','female','pixie',58,['fish','bay6','eggs'],6500]];
const SHOPPERS=REG.map(([name,gender,hair,age,list,budget],i)=>({id:'rqs_'+i,name,look:{gender,hair,ageYears:age},list,budget}));
/* 榕桥第二菜市场 regulars (南关路 side households); always leave by the south gate onto 南关路. Names 未经Leo确认. */
[['区太','female','perm',59,['m2_bay4','m2_pork','m2_tofu'],6000],['甘伯','male','grey',72,['m2_fish','m2_bay5'],5000],['谭太','female','bob',47,['m2_poultry','m2_bay6','m2_bay1'],7000],['小林','male','short',28,['m2_deli','m2_bay2'],4500],
 ['莫婆婆','female','bun',76,['m2_bay4','m2_eggs'],3500],['黎生','male','sidepart',44,['m2_beef','m2_bay5','m2_grain'],8000],['骆姨','female','wave',55,['m2_shell','m2_bay6'],7000],['阿欣','female','pony',25,['m2_bay3','m2_eggs'],3500],
 ['霍伯','male','bald',69,['m2_pork','m2_bay4','m2_dry'],5500],['曾太','female','long',51,['m2_fish','m2_bay0','m2_tofu'],7500],['江生','male','buzz',36,['m2_deli','m2_beef'],6500],['卢姨','female','pixie',62,['m2_poultry','m2_bay5'],6000]]
 .forEach(([name,gender,hair,age,list,budget],i)=>SHOPPERS.push({id:'rqs2_'+i,market:2,name,look:{gender,hair,ageYears:age},list,budget}));
/* 万家菜市场综合楼 regulars (riverside households); leave by the south gate or the west gate along the west strip. Names 未经Leo确认. */
[['关太','female','perm',57,['m3_bay4','m3_pork','m3_tofu'],6000],['石伯','male','grey',73,['m3_fish','m3_bay5'],5000],['马太','female','bob',46,['m3_poultry','m3_bay6','m3_bay0'],7000],['阿聪','male','short',30,['m3_deli','m3_bay2'],4500],
 ['梁婆婆','female','bun',78,['m3_bay4','m3_eggs'],3500],['邓生','male','sidepart',42,['m3_beef','m3_bay5','m3_grain'],8000],['伍姨','female','wave',54,['m3_shell','m3_bay6'],7000],['小雯','female','pony',24,['m3_bay3','m3_eggs'],3500],
 ['钱伯','male','bald',70,['m3_pork','m3_bay4','m3_dry'],5500],['朱太','female','long',49,['m3_fish','m3_bay1','m3_tofu'],7500],['阿浩','male','buzz',33,['m3_deli','m3_beef'],6500],['容姨','female','pixie',63,['m3_poultry','m3_bay5'],6000]]
 .forEach(([name,gender,hair,age,list,budget],i)=>SHOPPERS.push({id:'rqs3_'+i,market:3,name,look:{gender,hair,ageYears:age},list,budget}));
/* 南埠菜市场 regulars. Three households, lists only the five open stalls. Names 未经Leo确认. */
[['陈太','female','perm',61,['m4_bay4','m4_pork','m4_eggs'],5500],['老何','male','grey',68,['m4_fish','m4_bay4'],4800],['小敏','female','long',29,['m4_bay0','m4_eggs','m4_pork'],4200]]
 .forEach(([name,gender,hair,age,list,budget],i)=>SHOPPERS.push({id:'rqs4_'+i,market:4,name,look:{gender,hair,ageYears:age},list,budget}));
const SH={};for(const p of SHOPPERS)SH[p.id]=p;
const VPH=['off','walk_in','setup','selling','pack','walk_out'],SPH=['walk','buy','home'],KINDS=['restock','sale','waste','income'];
const copy=x=>JSON.parse(JSON.stringify(x)),time=x=>Number.isFinite(x)&&x>=0&&x<=1e12,int=(x,max=1e12)=>Number.isSafeInteger(x)&&x>=0&&x<=max,
 exact=(o,k)=>!!o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join('|')===k.slice().sort().join('|'),num=(x,a,b)=>Number.isFinite(x)&&x>=a&&x<=b,
 mod=at=>((Math.floor(at)%1440)+1440)%1440,dayOf=at=>Math.floor(at/1440);
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0)/4294967296;}
const ITEMS=[...new Set(Object.values(SKU).map(k=>k.item))].sort();
const zero=keys=>Object.fromEntries(keys.map(k=>[k,0]));
/* ---------------------------------------------------------------- state */
function vendorAt(t,phase,at){const g=geo(t),p=phase==='off'?edgeOf(t):g.stand;return{phase,since:at,i:0,x:p[0],y:p[1],day:dayOf(at)};}
function fresh(at,price){if(!time(at))throw Error('菜市场账本起点无效');const s={version:VERSION,startedAt:at,lastAt:at,nextId:1,stalls:{},supplierCents:0,playerCents:0,receipts:[],shoppers:{},npcHome:zero(ITEMS),wasteUnits:0};
 for(const t of STALLS){const sk=t.skus.map(k=>k.sku);s.stalls[t.id]={openCents:OPEN_CASH,cashCents:OPEN_CASH,salesCents:0,wholesaleCents:0,stock:Object.fromEntries(sk.map(k=>[k,[]])),delivered:zero(sk),soldPlayer:zero(sk),soldNpc:zero(sk),wasted:zero(sk),restockDay:-1,vendor:vendorAt(t,'off',at)};}
 for(const p of SHOPPERS)s.shoppers[p.id]={seedCents:p.budget,walletCents:p.budget,incomeCents:0,spentCents:0,incomeDay:dayOf(at),visitDay:-1,visit:null,bag:{}};
 /* ledger start mid-day: vendors who would be at their stalls now are there, with today's paid delivery (a real receipt); regulars whose usual time has passed already went */
 const m=mod(at),d=dayOf(at);for(const t of STALLS){if(m>=t.hours[0]&&m<t.hours[1]&&m>=TRUCK){const st=s.stalls[t.id];st.vendor=vendorAt(t,'selling',at);restock(s,t.id,at);}}
 for(const p of SHOPPERS)if(m>=plan(p.id,d).arrive)s.shoppers[p.id].visitDay=d;
 return s;}
function receipt(s,r){r.id=s.nextId++;s.receipts.push(r);if(s.receipts.length>RECEIPT_CAP)s.receipts.shift();return r;}
function stockOf(st,sku){return st.stock[sku].reduce((a,b)=>a+b[1],0);}
function stallStock(s,id){const st=s.stalls[id];return BY[id].skus.reduce((a,k)=>a+stockOf(st,k.sku),0);}
function capacity(id){return BY[id].skus.reduce((a,k)=>a+k.cap,0);}
/* morning: discard batches past their stall life (to the trash room), then buy from the cold-chain truck up to capacity with the vendor's own cash */
function restock(s,id,at){const t=BY[id],st=s.stalls[id],d=dayOf(at);if(!t||st.restockDay===d||mod(at)<TRUCK)return null;st.restockDay=d;const out={wasted:0,bought:0,cents:0};
 for(const k of t.skus){const keep=[];for(const b of st.stock[k.sku]){if(d-dayOf(b[0])>=k.life){st.wasted[k.sku]+=b[1];s.wasteUnits+=b[1];out.wasted+=b[1];receipt(s,{kind:'waste',at,stall:id,party:'trash_room',sku:k.sku,n:b[1],cents:0});}else keep.push(b);}st.stock[k.sku]=keep;
  let n=Math.max(0,k.cap-stockOf(st,k.sku));n=Math.min(n,Math.floor(st.cashCents/k.cost));if(n>0&&keep.length<BATCH_CAP){const c=n*k.cost;st.cashCents-=c;st.wholesaleCents+=c;s.supplierCents+=c;st.delivered[k.sku]+=n;st.stock[k.sku].push([at,n]);out.bought+=n;out.cents+=c;receipt(s,{kind:'restock',at,stall:id,party:SUPPLIER,sku:k.sku,n,cents:c});}}
 return out;}
function selling(s,id){return s.stalls[id]?.vendor?.phase==='selling';}
/* take n portions FIFO (oldest batch first); returns the batches taken [[deliveredAt,n],...] */
function take(st,sku,n){const out=[];while(n>0&&st.stock[sku].length){const b=st.stock[sku][0],k=Math.min(n,b[1]);b[1]-=k;n-=k;out.push([b[0],k]);if(!b[1])st.stock[sku].shift();}return out;}
/* quote: only stall + sku ids + counts come from the caller; prices from the live price table, stock from the ledger */
function quote(s,input,price,at){const fail=reason=>({ok:false,reason});if(!s||!time(at)||!input||typeof input!=='object')return fail('报价无效');const t=BY[input.stall];if(!t)return fail('没有这个摊位');if(!selling(s,t.id))return fail(t.name+'现在没有开档');
 const raw=Array.isArray(input.lines)?input.lines:[];if(raw.length<1||raw.length>6)return fail('还没选要买的');const seen=new Set(),lines=[];const st=s.stalls[t.id];
 for(const l of raw){const k=SKU[l?.sku];if(!k||k.stall!==t.id||seen.has(l.sku)||!int(l.n,10)||l.n<1)return fail('选的东西不对');seen.add(l.sku);if(stockOf(st,l.sku)<l.n)return fail(`${k.label}只剩${stockOf(st,l.sku)}份了`);const u=Math.round(Number(price(priceKey(l.sku)))*100);if(!int(u,100000)||u<1)return fail('价格表缺少'+k.label);lines.push({sku:l.sku,n:l.n,unitCents:u,item:k.item,give:k.give});}
 const total=lines.reduce((a,l)=>a+l.n*l.unitCents,0);return{ok:true,stall:t.id,lines,totalCents:total,at,seq:s.nextId,units:lines.reduce((a,l)=>a+l.n*l.give,0)};}
/* sell: one-time; a quote is stale once any other receipt was written (seq) or the clock moved past it */
function sell(s,q,buyer,at){if(!q?.ok)return{ok:false,reason:'报价无效'};if(q.seq!==s.nextId||at<q.at||at-q.at>10||at<s.lastAt-1e-6&&false)return{ok:false,reason:'报价已过期，请重新确认'};if(!selling(s,q.stall))return{ok:false,reason:BY[q.stall].name+'已经收档'};
 const st=s.stalls[q.stall];for(const l of q.lines)if(stockOf(st,l.sku)<l.n)return{ok:false,reason:SKU[l.sku].label+'卖完了'};
 const isPlayer=buyer==='player';if(!isPlayer&&!SH[buyer])return{ok:false,reason:'买家无效'};if(!isPlayer&&s.shoppers[buyer].walletCents<q.totalCents)return{ok:false,reason:'钱不够'};
 const got=[];for(const l of q.lines){const batches=take(st,l.sku,l.n),c=l.n*l.unitCents;(isPlayer?st.soldPlayer:st.soldNpc)[l.sku]+=l.n;st.cashCents+=c;st.salesCents+=c;
  const r=receipt(s,{kind:'sale',at,stall:q.stall,party:buyer,sku:l.sku,n:l.n,cents:c});got.push({sku:l.sku,item:l.item,give:l.give,n:l.n,cents:c,batches,receiptId:r.id});}
 if(isPlayer)s.playerCents+=q.totalCents;else{const p=s.shoppers[buyer];p.walletCents-=q.totalCents;p.spentCents+=q.totalCents;for(const g of got)p.bag[g.item]=(p.bag[g.item]||0)+g.n*g.give;}
 s.lastAt=Math.max(s.lastAt,at);return{ok:true,got,totalCents:q.totalCents};}
/* regulars: deterministic daily plan (arrival minute, stops); stall + SKU choice and substitution at the counter */
function plan(id,day){const p=SH[id],h=hash(id+':'+day),r=hash(day+':'+id+':t'),arrive=r<0.6?390+Math.floor(hash(id+day+'a')*210):r<0.85?600+Math.floor(hash(id+day+'b')*360):960+Math.floor(hash(id+day+'c')*170);
 const n=1+Math.floor(h*p.list.length),start=Math.floor(hash(id+':s:'+day)*p.list.length),stops=[];for(let i=0;i<n;i++)stops.push(p.list[(start+i)%p.list.length]);
 return{arrive,stops,exit:p.market===2||hash(id+':x:'+day)<0.5?'S':'W',skip:hash(id+':k:'+day)<0.12};}
/* a regular's walk for the day: N edge -> 槐北横街 -> S gate -> each stop's counter (via the aisles) -> S or W gate -> N edge */
function path4(id,day){const pl=plan(id,day);const pts=[NB4.edge,NB4.street,NB4.out,NB4.inn,NB4.aisle];for(const sid of pl.stops){const s=SLOT4[BY[sid].base],c=s.cust,via=s.via==='north'?NB4.north:NB4.aisle;pts.push(via,[c[0],via[1]],c,[c[0],via[1]],via);}pts.push(NB4.aisle,NB4.inn,NB4.out,NB4.street,NB4.edge);const out=dedup(pts);const idx=[];for(const sid of pl.stops){const c=geo4(BY[sid]).cust;let hit=-1;for(let k=0;k<out.length;k++)if(out[k][0]===c[0]&&out[k][1]===c[1]){hit=k;break;}idx.push(hit);}return{pts:out,stopAt:idx,stops:pl.stops,plan:pl};}
function shopperPath(id,day){if((SH[id].market||1)===4)return path4(id,day);const pl=plan(id,day),mk=SH[id].market||1,two=mk>1,G1=sid=>geo1(two?BY[BY[sid].base]:BY[sid]);let pts=[EDGE,[EDGE[0],STREET_Y],MG,GATE_OUT,GATE_IN];const stopAt=[];let cur=null;
 for(const sid of pl.stops){const g=G1(sid),aisle=g.custVia[1];if(cur){pts.push(cur);pts.push([GATE_IN[0],cur[1]]);}pts.push([GATE_IN[0],aisle[1]],aisle,g.cust);stopAt.push(pts.length-1);cur=aisle;}
 if(cur)pts.push(cur);if(pl.exit==='W'){pts.push([GATE_IN[0],cur?cur[1]:CROSS_Y],[GATE_IN[0],CROSS_Y],WG_IN,WG_OUT,[EDGE[0],WG_OUT[1]],EDGE);}else pts.push([GATE_IN[0],cur?cur[1]:FRONT_Y],GATE_IN,GATE_OUT,MG,[EDGE[0],STREET_Y],EDGE);
 if(two)pts=pts.map(TP[mk]);
 const out=[];for(const q of pts){const l=out[out.length-1];if(!l||Math.hypot(l[0]-q[0],l[1]-q[1])>1e-6)out.push(q);else if(stopAt.length&&stopAt.includes(pts.indexOf(q)));}
 /* re-index stops after de-duplication */const idx=[];let k=0;for(let i=0;i<pl.stops.length;i++){const c=geo(BY[pl.stops[i]]).cust;for(;k<out.length;k++)if(out[k][0]===c[0]&&out[k][1]===c[1]){idx.push(k);k++;break;}}
 return{pts:out,stopAt:idx,stops:pl.stops,plan:pl};}
function npcPick(s,id,stall,at){const t=BY[stall],st=s.stalls[stall],h=hash(id+':'+stall+':'+dayOf(at)),order=t.skus.map((k,i)=>t.skus[(Math.floor(h*t.skus.length)+i)%t.skus.length]);for(const k of order){const n=k.give>1?1:1+(hash(id+k.sku+dayOf(at))<0.35?1:0);if(stockOf(st,k.sku)>=n)return{sku:k.sku,n};if(stockOf(st,k.sku)>=1)return{sku:k.sku,n:1};}return null;}
function npcBuy(s,id,stall,price,at){if(!selling(s,stall))return{ok:false,reason:'closed'};const pick=npcPick(s,id,stall,at);if(!pick)return{ok:false,reason:'sold_out'};const q=quote(s,{stall,lines:[pick]},price,at);if(!q.ok)return q;if(s.shoppers[id].walletCents<q.totalCents)return{ok:false,reason:'wallet'};return sell(s,q,id,at);}
function income(s,id,at){const p=s.shoppers[id],d=dayOf(at);if(p.incomeDay>=d)return 0;p.incomeDay=d;const c=SH[id].budget;p.walletCents+=c;p.incomeCents+=c;receipt(s,{kind:'income',at,stall:null,party:id,sku:null,n:0,cents:c});return c;}
function goHome(s,id){const p=s.shoppers[id];for(const [k,n]of Object.entries(p.bag))s.npcHome[k]+=n;p.bag={};}
/* goods state of a stall for the art: from real stock and the vendor's presence */
function goodsState(s,id){const st=s.stalls[id];if(!st)return'closed';const ph=st.vendor.phase;if(ph==='off'||ph==='walk_in'||ph==='walk_out')return'closed';const r=stallStock(s,id)/capacity(id);if(r<=0)return'empty';if(ph==='setup')return r>0?'half':'empty';return r>=0.6?'full':r>=0.25?'half':'empty';}
function present(s,id){const ph=s.stalls[id]?.vendor?.phase;return ph==='setup'||ph==='selling'||ph==='pack';}
/* ---------------------------------------------------------------- v1 (榕桥菜市场 only) -> v2: the second market's stalls and regulars join
 * the same ledger with nothing delivered, sold or spent (vendors off at the 南关路 east end, opening cash, seed wallets), so every
 * v1 invariant still holds and the old receipts / stock / wallets are untouched. Anything not exactly v1-shaped is left for prepare to reject. */
function addMarket(n,mk){for(const t of STALLS)if(t.market===mk){if(own(n.stalls,t.id))return null;const sk=t.skus.map(k=>k.sku);n.stalls[t.id]={openCents:OPEN_CASH,cashCents:OPEN_CASH,salesCents:0,wholesaleCents:0,stock:Object.fromEntries(sk.map(k=>[k,[]])),delivered:zero(sk),soldPlayer:zero(sk),soldNpc:zero(sk),wasted:zero(sk),restockDay:-1,vendor:vendorAt(t,'off',n.lastAt)};}
 for(const p of SHOPPERS)if(p.market===mk){if(own(n.shoppers,p.id))return null;n.shoppers[p.id]={seedCents:p.budget,walletCents:p.budget,incomeCents:0,spentCents:0,incomeDay:dayOf(n.lastAt),visitDay:dayOf(n.lastAt),visit:null,bag:{}};}
 return n;}
/* E4e: v2 (two markets) -> v3: 万家菜市场综合楼 joins the same way (a v1 ledger goes v1 -> v2 -> v3).
 * P11: v3 -> v4 adds the five 南埠 stalls and three regulars empty. A ledger that already carries the stalls of a
 * market its version does not know is forged and is left for prepare to reject. */
function migrate(s){if(!s||typeof s!=='object'||(s.version!==1&&s.version!==2&&s.version!==3)||!s.stalls||!s.shoppers||typeof s.stalls!=='object'||typeof s.shoppers!=='object'||!time(s.lastAt))return s;const n=copy(s);
 if(n.version===1){if(!addMarket(n,2))return s;n.version=2;}if(n.version===2){if(!addMarket(n,3))return s;n.version=3;}if(!addMarket(n,4))return s;n.version=VERSION;return n;}
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
/* ---------------------------------------------------------------- validation: forged / duplicated / inconsistent -> null */
const ST_KEYS=['openCents','cashCents','salesCents','wholesaleCents','stock','delivered','soldPlayer','soldNpc','wasted','restockDay','vendor'],V_KEYS=['phase','since','i','x','y','day'],P_KEYS=['seedCents','walletCents','incomeCents','spentCents','incomeDay','visitDay','visit','bag'],VI_KEYS=['day','phase','stop','i','x','y','until'];
function prepare(s,at){s=migrate(s);if(!time(at)||!exact(s,['version','startedAt','lastAt','nextId','stalls','supplierCents','playerCents','receipts','shoppers','npcHome','wasteUnits'])||s.version!==VERSION||!time(s.startedAt)||!time(s.lastAt)||s.startedAt>s.lastAt||s.lastAt>at+1e-6||!int(s.nextId)||s.nextId<1)return null;
 const tOk=t=>time(t)&&t>=s.startedAt-1e-6&&t<=s.lastAt+1e-6,pos=(x,y,mk)=>mk===3?num(x,-106,-62)&&num(y,152,188):mk===4?num(x,8,120)&&num(y,-220,-160):num(x,-30,310)&&num(y,-80,145);
 if(!exact(s.stalls,STALLS.map(t=>t.id))||!exact(s.shoppers,SHOPPERS.map(p=>p.id))||!exact(s.npcHome,ITEMS)||!ITEMS.every(k=>int(s.npcHome[k]))||!int(s.wasteUnits)||!int(s.supplierCents)||!int(s.playerCents))return null;
 let wholesale=0,sales=0,waste=0;const npcBought=zero(ITEMS);
 for(const t of STALLS){const st=s.stalls[t.id],sk=t.skus.map(k=>k.sku);if(!exact(st,ST_KEYS)||st.openCents!==OPEN_CASH||![st.cashCents,st.salesCents,st.wholesaleCents].every(v=>int(v))||st.cashCents!==st.openCents+st.salesCents-st.wholesaleCents)return null;
  if(!Number.isSafeInteger(st.restockDay)||st.restockDay<-1||st.restockDay>dayOf(s.lastAt))return null;
  for(const f of ['delivered','soldPlayer','soldNpc','wasted'])if(!exact(st[f],sk)||!sk.every(k=>int(st[f][k],1e7)))return null;
  if(!exact(st.stock,sk))return null;let cost=0;
  for(const k of t.skus){const b=st.stock[k.sku];if(!Array.isArray(b)||b.length>BATCH_CAP)return null;let last=-1,n=0;for(const x of b){if(!Array.isArray(x)||x.length!==2||!tOk(x[0])||x[0]<last||!int(x[1],1000)||x[1]<1)return null;last=x[0];n+=x[1];}
   if(st.delivered[k.sku]!==n+st.soldPlayer[k.sku]+st.soldNpc[k.sku]+st.wasted[k.sku])return null;if(n>k.cap)return null;cost+=st.delivered[k.sku]*k.cost;npcBought[k.item]+=st.soldNpc[k.sku]*k.give;waste+=st.wasted[k.sku];}
  if(cost!==st.wholesaleCents)return null;wholesale+=cost;sales+=st.salesCents;
  const v=st.vendor;if(!exact(v,V_KEYS)||!VPH.includes(v.phase)||!tOk(v.since)||!int(v.i,40)||!pos(v.x,v.y,marketOf(t))||!Number.isSafeInteger(v.day)||v.day<-1||v.day>dayOf(s.lastAt))return null;}
 if(wholesale!==s.supplierCents||waste!==s.wasteUnits)return null;
 let spent=0;const inBags=zero(ITEMS);const active={1:0,2:0,3:0,4:0};
 for(const p of SHOPPERS){const q=s.shoppers[p.id];if(!exact(q,P_KEYS)||q.seedCents!==p.budget||![q.walletCents,q.incomeCents,q.spentCents].every(v=>int(v))||q.walletCents!==q.seedCents+q.incomeCents-q.spentCents||q.incomeCents%p.budget!==0)return null;
  if(!Number.isSafeInteger(q.incomeDay)||q.incomeDay>dayOf(s.lastAt)||!Number.isSafeInteger(q.visitDay)||q.visitDay<-1||q.visitDay>dayOf(s.lastAt))return null;
  if(!q.bag||typeof q.bag!=='object'||Array.isArray(q.bag)||Object.entries(q.bag).some(([k,n])=>!ITEMS.includes(k)||!int(n,1000)))return null;for(const [k,n]of Object.entries(q.bag))inBags[k]+=n;spent+=q.spentCents;
  if(q.visit!==null){const v=q.visit;if(!exact(v,VI_KEYS)||v.day!==q.visitDay||!SPH.includes(v.phase)||!int(v.stop,8)||!int(v.i,60)||!pos(v.x,v.y,p.market||1)||!(v.until===null||tOk(v.until)||num(v.until,s.startedAt,s.lastAt+60))||v.i>shopperPath(p.id,v.day).pts.length||v.stop>shopperPath(p.id,v.day).stopAt.length)return null;active[p.market||1]++;}
  else if(Object.keys(q.bag).length)return null;}
 if(Object.values(active).some(n=>n>ACTIVE_SHOPPERS))return null;
 if(spent+s.playerCents!==sales)return null;
 for(const k of ITEMS)if(npcBought[k]!==inBags[k]+s.npcHome[k])return null;
 if(!Array.isArray(s.receipts)||s.receipts.length>RECEIPT_CAP)return null;let lastId=0,lastAt=0;
 for(const r of s.receipts){if(!exact(r,['id','kind','at','stall','party','sku','n','cents'])||!int(r.id)||r.id<=lastId||r.id>=s.nextId||!KINDS.includes(r.kind)||!tOk(r.at)||r.at<lastAt||!int(r.n,1000)||!int(r.cents))return null;lastId=r.id;lastAt=r.at;
  if(r.kind==='income'){if(!SH[r.party]||r.stall!==null||r.sku!==null||r.cents!==SH[r.party].budget)return null;continue;}
  const k=SKU[r.sku];if(!k||k.stall!==r.stall||r.n<1)return null;
  if(r.kind==='restock'&&(r.party!==SUPPLIER||r.cents!==r.n*k.cost))return null;if(r.kind==='waste'&&(r.party!=='trash_room'||r.cents!==0))return null;if(r.kind==='sale'&&!(r.party==='player'||SH[r.party]))return null;}
 return copy(s);}
const api={M2,M3,M4,marketOf,edgeOf,priceKey,geo1,migrate,VERSION,OPEN,CLOSE,TRUCK,SETUP,PACK,SPEED,SUPPLIER,RECEIPT_CAP,ACTIVE_SHOPPERS,OPEN_CASH,EDGE,GATE_OUT,GATE_IN,MG,WG_IN,WG_OUT,CROSS_Y,FRONT_Y,STREET_Y,STALLS,BY,SKU,SHOPPERS,SH,ITEMS,BAY,BAYX,
 geo,shopperPath,vendorPath,walkMinutes,len,hash,mod,dayOf,fresh,restock,stockOf,stallStock,capacity,selling,quote,sell,plan,npcPick,npcBuy,income,goHome,goodsState,present,prepare,vendorAt};
if(typeof module!=='undefined'&&module.exports)module.exports=api;root.WetMarketModel=api;
})(typeof window!=='undefined'?window:globalThis);
