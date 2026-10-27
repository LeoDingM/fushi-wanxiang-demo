/* Native SW facade sections, actual 18x12 footprint, exactly twelve 3m floors. */
(function(){
 'use strict';const objects=[],at=(id,type,x,y,z,more)=>objects.push(Object.assign({id,type,x,y,z,rot:0,state:'default'},more));
 for(let floor=1;floor<=12;floor++){
  const pad=String(floor).padStart(2,'0'),z=(floor-1)*3;
  for(let bay=0;bay<6;bay++){
   if(floor===1&&[2,3].includes(bay))continue;
   const unit=`modern_residence_${floor}F-0${bay<3?1:2}`,balc=floor>1&&[1,4].includes(bay),id=`mres_S${pad}_${bay}_win`;
   at(id,'modern_facade',168+bay*3,10,z,{variant:'abcd'[(floor+bay)%4],state:floor===1?(bay===3?'entry':'ground'):(balc?'balcony':'upper'),modernUnit:unit,modernBalcony:balc,fade_group:'modern_residence_A'});
   if(balc){at(`mres_S${pad}_${bay}_rail`,'modern_balcony_rail',168+bay*3,10,z,{modernUnit:unit,fade_group:'modern_residence_A'});at(`mres_S${pad}_${bay}_ac`,'modern_condenser',168+bay*3+2.15,9.26,z+.48,{state:'off',modernUnit:unit,fade_group:'modern_residence_A'});}
  }
  for(let bay=0;bay<4;bay++)at(`mres_W${pad}_${bay}_win`,'modern_facade',168,10+(bay+1)*3,z,{rot:6,variant:'abcd'[(bay+floor+1)%4],state:floor===1?'ground':'upper',modernUnit:`modern_residence_${floor}F-01`,fade_group:'modern_residence_A'});
 }
 at('modern_A_entry_wing_w','modern_ground_half',174,10,0);
 at('modern_A_entry_wing_e','modern_ground_half',178.5,10,0);
 at('modern_A_entry_glass','modern_facade',175.5,10,0,{variant:'a',state:'entry',fade_group:'modern_residence_A'});
 at('modern_residence_A_roof','modern_roof',168,10,36,{fade_group:'modern_residence_A'});
 // Stable entry has a reach on the forecourt, distinct from the building collider.
 at('modern_residence_door','modern_entry_marker',177,10,0,{interact:'modern_entry',reach:[177,8.8],name:'澜山雅庭 · 住宅大厅'});
 for(const [i,x]of [164,166.5,169,171.5,179,181.5].entries())at(`modern_A_parking_${i+1}`,'modern_parking',x,4,0,{name:`住户停车位 ${i+1}`});
 const colliders=[{id:'modern_residence_A_body',rect:[168,10,186,22]}];
 window.SCENE_CHUNKS=window.SCENE_CHUNKS||{};window.SCENE_CHUNKS.modern_residential={objects,colliders};
})();
