/* Load road additions after the native atlas/world has finished initialization. */
(function(){'use strict';
 const timer=setInterval(async()=>{
  if(!window.__protoReady||!window.SP?.game?.ps)return;
  clearInterval(timer);
  const load=file=>new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('js/'+file,document.baseURI).href;script.onload=resolve;script.onerror=()=>reject(new Error('街区交通资源未加载：'+file));document.body.append(script);});
  try{
   await load('turnaround_geometry.js');await load('neighborhood_turning_traffic.js');await load('street_parking_rules.js');await load('street_parking_live.js');await load('street_parking_save.js');
   const enable=()=>{if(!SP.neighborhoodTurningTraffic.isNeighborhood())return false;SP.turnaroundGeometry.enable();SP.neighborhoodTurningTraffic.enable();SP.streetParking.enable();return true;};
   if(!enable()){const pending=setInterval(()=>{if(enable())clearInterval(pending);},500);}
  }catch(error){console.error(error);SP.toast?.('街区交通加载失败，请检查完整游戏文件。');}
 },50);
})();
