/* B native fifteen-floor setback tower, independently registered by modern_b_extension. */
(function(){
 const objects=[],add=(id,type,x,y,z,more)=>objects.push(Object.assign({id,type,x,y,z,rot:0,state:'default'},more));
 for(let floor=1;floor<=15;floor++){
  const upper=floor>=13,inset=upper?1.5:0,w=upper?12:15,d=upper?9:12,x=165+inset,y=36+inset,z=(floor-1)*3,pad=String(floor).padStart(2,'0'),bays=w/3;
  for(let bay=0;bay<bays;bay++){
   const unit=`modern_residence_B_${floor}F-0${bay<bays/2?1:2}`,balc=floor>1&&(floor%2?[0,bays-1]:[1,bays-2]).includes(bay);
   add(`mresB_S${pad}_${bay}_win`,'modern_facade',x+bay*3,y,z,{state:floor===1?(bay===2?'entry':'ground'):(balc?'balcony':'upper'),variant:'abcd'[(floor*2+bay)%4],modernUnit:unit,modernBalcony:balc,fade_group:'modern_residence_B_F'+pad});
   add(`mresB_S${pad}_${bay}_rib`,'modern_b_rib',x+bay*3,y,z,{fade_group:'modern_residence_B_F'+pad});
   if(balc){add(`mresB_S${pad}_${bay}_rail`,'modern_balcony_rail',x+bay*3,y,z,{modernUnit:unit,fade_group:'modern_residence_B_F'+pad});add(`mresB_S${pad}_${bay}_ac`,'modern_condenser',x+bay*3+2.15,y-.74,z+.48,{state:'off',modernUnit:unit,fade_group:'modern_residence_B_F'+pad});}
  }
  for(let bay=0;bay<d/3;bay++)add(`mresB_W${pad}_${bay}_win`,'modern_facade',x,y+(bay+1)*3,z,{rot:6,state:floor===1?'ground':'upper',variant:'abcd'[(floor+bay)%4],modernUnit:`modern_residence_B_${floor}F-01`,fade_group:'modern_residence_B_F'+pad});
 }
 // Solid z36 floor, decomposed into actual 1.5m native prisms (including the upper tower footprint).
 // Structural pieces have no shared facade group: z separation must order their slabs, walls and plants.
 const terrace={};
 for(let x=0;x<10;x++)for(let y=0;y<8;y++)add(`modern_B_terrace_tile_${x}_${y}`,'modern_b_terrace_tile',165+x*1.5,36+y*1.5,36,terrace);
 for(let n=0;n<10;n++)for(const [side,y]of [['south',36],['north',47.82]])add(`modern_B_terrace_${side}_wall_${n}`,'modern_b_parapet_horizontal',165+n*1.5,y,36,terrace);
 for(let n=0;n<8;n++)for(const [side,x]of [['west',165],['east',179.82]])add(`modern_B_terrace_${side}_wall_${n}`,'modern_b_parapet_vertical',x,36+n*1.5,36,terrace);
 for(const [n,x,y]of [[0,167,36.7],[1,171,36.7],[2,175,36.7],[3,165.7,41],[4,165.7,44],[5,179.2,41],[6,179.2,44]])add('modern_B_terrace_planter_'+n,'modern_b_terrace_planter',x,y,36,terrace);
 add('modern_B_roof','modern_b_roof',166.5,37.5,45,{fade_group:'modern_residence_B_roof'});
 add('modern_residence_B_door','modern_entry_marker',172.5,36,0,{interact:'modern_B_entry',reach:[172.5,34.8],name:'云境住宅 · 大厅'});
 // Dedicated native 2.5x6 parallel curb slots, beside a 3.5m access lane.
 for(let n=0;n<2;n++)add('modern_B_parking_'+n,'modern_b_parking',180,36+n*6,0,{name:'云境住宅平行车位'});
 window.SCENE_CHUNKS=window.SCENE_CHUNKS||{};window.SCENE_CHUNKS.modern_residential_B={objects,colliders:[{id:'modern_B_body',rect:[165,36,180,48]}],entryAnchor:[172.5,36],entryReach:[172.5,34.8]};
})();
