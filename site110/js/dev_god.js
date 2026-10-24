/* Additive developer panel inspired by donor Stage A. Uses current registered
 * scenes and public clock APIs; never imports donor layouts or housing flags. */
(function(root){
  'use strict';
  const NEEDS=['energy','hunger','hygiene','mood'];
  const WEATHERS=['clear','rain','snow','fog'];
  function validateEdit(edit){
    if(!edit||typeof edit!=='object'||Array.isArray(edit))return {ok:false,reason:'开发数值格式无效。'};
    if(typeof edit.money!=='number'||!Number.isFinite(edit.money)||edit.money<0||edit.money>1e9)return {ok:false,reason:'金钱必须为 0–10亿之间的有效数字。'};
    if(!edit.needs||!NEEDS.every(k=>typeof edit.needs[k]==='number'&&Number.isFinite(edit.needs[k])&&edit.needs[k]>=0&&edit.needs[k]<=100))return {ok:false,reason:'四项生活需求必须为 0–100。'};
    if(edit.minute!=null&&(!Number.isInteger(edit.minute)||edit.minute<0||edit.minute>=1440))return {ok:false,reason:'时间必须为有效的日内分钟。'};
    if(edit.weather!=null&&!WEATHERS.includes(edit.weather))return {ok:false,reason:'天气选项无效。'};
    return {ok:true};
  }
  function register(host){
    const SP=host.SP,G=SP&&SP.game,C=SP&&SP.clock;
    if(!G||!C)return null;if(SP.devGod)return SP.devGod;
    let opened=false,panel=null,notice=null,lastFocus=null;
    const busy0=G.busy;
    // Install with the captured predecessor; deferred DOM setup must not replace later guards.
    G.busy=function(){return opened||busy0.call(this);};
    const blocked=()=>!G.ps?'游戏还未准备好。':G.activity||G.trans||C.ff||SP.player&&SP.player.carry||SP.metroActive||SP.cbd&&SP.cbd.active?'请先结束当前动作，并返回社区。':SP.phone&&SP.phone.isOpen()?'请先关闭手机。':null;
    function apply(edit){
      const gate=blocked();if(gate)return {ok:false,reason:gate};const valid=validateEdit(edit);if(!valid.ok)return valid;
      G.ps.money=Math.round(edit.money*100)/100;
      for(const k of NEEDS)G.ps.needs[k]=edit.needs[k];
      if(edit.weather!=null)C.setWeather(edit.weather,edit.weather==='clear'?0:.8,true,true);
      // Advance to the NEXT requested time. Game clock/rules continue together.
      if(edit.minute!=null&&Math.abs(edit.minute-C.min)>.01)C.skipTo(edit.minute,1.6);
      if(G.hud)G.hud();SP.world&&SP.world.logEvent('开发工具：更新金钱与生活需求'+(edit.minute!=null?'，推进游戏时间':'')+(edit.weather!=null?'，调整天气':''));
      return {ok:true};
    }
    function destinations(){return Object.entries(SP.scenes||{}).filter(([,s])=>s&&Array.isArray(s.spawn)&&s.spawn.length>=2&&Number.isFinite(s.spawn[0])&&Number.isFinite(s.spawn[1])).map(([id,s])=>({id,name:s.name||id,spawn:s.spawn.slice()}));}
    function teleport(id){
      const gate=blocked();if(gate)return {ok:false,reason:gate};const s=destinations().find(x=>x.id===id);if(!s)return {ok:false,reason:'场景未注册或没有有效出生点。'};
      if(SP.player&&SP.player.level==='roof')return {ok:false,reason:'请先离开屋顶。'};
      close();G.go({to:s.id,spawn:s.spawn});return {ok:true};
    }
    function close(){opened=false;if(panel)panel.hidden=true;if(lastFocus&&lastFocus.focus)lastFocus.focus();}
    const text=(tag,value,parent)=>{const el=host.document.createElement(tag);el.textContent=value;parent.appendChild(el);return el;};
    const button=(value,parent,fn)=>{const b=text('button',value,parent);b.type='button';let contact=null,lastTouch=-Infinity;
      b.onclick=e=>{if(e&&e.detail>0&&Date.now()-lastTouch<500)return;fn();};
      // Touch release selects; dragging the panel never applies an edit. Native
      // scroll may suppress its synthetic click after momentum, so handle the
      // actual pointer release and ignore the following compatibility click.
      b.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')contact={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};});
      b.addEventListener('pointermove',e=>{if(contact&&contact.id===e.pointerId&&Math.hypot(e.clientX-contact.x,e.clientY-contact.y)>8)contact.moved=true;});
      b.addEventListener('pointercancel',()=>{contact=null;});
      b.addEventListener('pointerup',e=>{if(!contact||contact.id!==e.pointerId)return;const c=contact;contact=null;if(!c.moved){lastTouch=Date.now();fn();}});return b;};
    function touchDock(){const D=host.document;let dock=D.getElementById('community-touch-tools');if(dock)return dock.querySelector('nav');dock=D.createElement('div');dock.id='community-touch-tools';const style=D.createElement('style');style.textContent='#community-touch-tools{display:none;position:fixed;top:calc(66px + env(safe-area-inset-top,0px));right:calc(12px + env(safe-area-inset-right,0px));z-index:135}body.mobile #community-touch-tools{display:block}body.phone-open #community-touch-tools,body:has(#life-phone:not([hidden])) #community-touch-tools{display:none!important}#community-touch-tools button{display:block;min-height:44px;min-width:76px;margin:4px 0;padding:8px;border:1px solid #94a3b8;border-radius:10px;background:#203249e8;color:#ecf2fa;font-size:14px}#community-touch-tools nav[hidden]{display:none}';D.head.appendChild(style);const toggle=button('工具',dock,()=>{nav.hidden=!nav.hidden;toggle.textContent=nav.hidden?'工具':'收起工具';toggle.setAttribute('aria-expanded',String(!nav.hidden));});toggle.id='community-tools-toggle';toggle.setAttribute('aria-expanded','false');const nav=D.createElement('nav');nav.hidden=true;dock.appendChild(nav);D.body.appendChild(dock);return nav;}
    function open(){
      const gate=blocked();if(gate)return {ok:false,reason:gate};if(!opened&&G.busy())return {ok:false,reason:'请先关闭当前菜单或完成动作。'};
      if(!host.document)return {ok:false,reason:'当前环境没有界面。'};
      if(!panel)initPanel();lastFocus=host.document.activeElement;opened=true;panel.hidden=false;
      SP.touchRelease&&SP.touchRelease();const nav=host.document.querySelector('#community-touch-tools nav');if(nav){nav.hidden=true;const t=host.document.getElementById('community-tools-toggle');t.textContent='工具';t.setAttribute('aria-expanded','false');}
      for(const k of NEEDS){const el=panel.querySelector('[data-need='+k+']');el.dataset.raw=String(G.ps.needs[k]);el.value=Number(G.ps.needs[k]).toFixed(1);el.dataset.display=el.value;el.dataset.edited='false';}panel.querySelector('[data-money]').value=G.ps.money;
      panel.querySelector('[data-time]').value='';panel.querySelector('[data-weather]').value='';notice.textContent='开发修改会进入后续存档。时间选择会向前推进至下次该时刻。';
      const scenes=panel.querySelector('[data-scenes]');scenes.replaceChildren();for(const d of destinations()){const op=text('option',d.name,scenes);op.value=d.id;}
      host.dispatchEvent&&host.dispatchEvent(new host.Event('blur'));panel.querySelector('button').focus();return {ok:true};
    }
    function initPanel(){
      const D=host.document,style=D.createElement('style');style.textContent='#dev-god[hidden]{display:none}#dev-god{position:fixed;z-index:1500;inset:0;background:#0009;display:grid;place-items:center;color:#f2eee5;font:14px/1.5 system-ui}#dev-god section{width:min(440px,90vw);max-height:88vh;overflow:auto;background:#182331;border:1px solid #8d9aaf;border-radius:12px;padding:18px;box-sizing:border-box}#dev-god label{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:10px 0}#dev-god input,#dev-god select{max-width:240px;background:#263649;color:#fff;border:1px solid #8192a4;border-radius:5px;padding:6px}#dev-god button{padding:8px 12px;margin:5px;border:1px solid #8997a8;border-radius:6px;background:#324d67;color:#fff;cursor:pointer}#dev-god p{color:#c3d2e1;font-size:12px}';D.head.appendChild(style);
      panel=D.createElement('div');panel.id='dev-god';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','上帝模式开发工具');D.body.appendChild(panel);
      style.textContent+='#dev-god section{max-height:88dvh;touch-action:pan-y;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}#dev-god header{position:sticky;top:-18px;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:8px;background:#182331;padding:8px 0}#dev-god h2{font-size:18px;margin:0}#dev-god button{min-height:44px}#dev-god input,#dev-god select{min-width:0;max-width:58%;min-height:44px;box-sizing:border-box;font-size:16px}';
      // Stop the game's page-wide touch handlers, while allowing native panel scrolling.
      for(const event of ['touchstart','touchmove','touchend'])panel.addEventListener(event,e=>e.stopPropagation(),{passive:true});
      const body=D.createElement('section');panel.appendChild(body);const header=D.createElement('header');body.appendChild(header);text('h2','上帝模式 · 开发工具',header);button('关闭',header,close);
      const content=D.createElement('div');content.className='utility-panel-body';body.appendChild(content);const money=text('label','金钱 ¥',content),mi=D.createElement('input');mi.type='number';mi.min=0;mi.max=1e9;mi.step=.01;mi.dataset.money='';money.appendChild(mi);
      const needGrid=D.createElement('div');needGrid.className='need-grid';content.appendChild(needGrid);for(const [k,label]of [['energy','精力'],['hunger','饱腹'],['hygiene','清洁'],['mood','心情']]){const row=text('label',label,needGrid),el=D.createElement('input');el.type='number';el.min=0;el.max=100;el.step=1;el.dataset.need=k;el.addEventListener('input',()=>el.dataset.edited='true');row.appendChild(el);}
      const time=text('label','推进时间',content),ts=D.createElement('select');ts.dataset.time='';time.appendChild(ts);for(const[value,label]of [['','保持时间'],[450,'07:30 清晨'],[720,'12:00 白天'],[1020,'17:00 傍晚'],[1350,'22:30 夜间']]){const op=text('option',label,ts);op.value=value;}
      const weather=text('label','天气',content),ws=D.createElement('select');ws.dataset.weather='';weather.appendChild(ws);for(const[value,label]of [['','保持天气'],['clear','晴'],['rain','雨'],['snow','雪'],['fog','雾']]){const op=text('option',label,ws);op.value=value;}
      button('应用开发数值',content,()=>{const need={};for(const k of NEEDS){const el=panel.querySelector('[data-need='+k+']');need[k]=Number(el.dataset.edited==='true'?el.value:el.dataset.raw);}const t=ts.value,w=ws.value;const r=apply({money:Number(mi.value),needs:need,minute:t===''?null:Number(t),weather:w===''?null:w});notice.textContent=r.ok?'开发数值已应用。':r.reason;if(r.ok&&t!=='')close();});
      button('四项需求回满',content,()=>{for(const k of NEEDS){const el=panel.querySelector('[data-need='+k+']');el.value=100;el.dataset.edited='true';}});
      const scene=text('label','已注册室内',content),select=D.createElement('select');select.dataset.scenes='';scene.appendChild(select);button('传送到场景出生点',content,()=>{const r=teleport(select.value);if(!r.ok)notice.textContent=r.reason;});
      button('查看社会事件因果（开发）',content,()=>{const r=SP.socialRetrospectionUI?.renderDebug?.(content);if(r?.ok===false)notice.textContent=r.reason||'开发记录暂不可用';});
      notice=text('p','',content);notice.setAttribute('role','status');
    }
    function init(){if(!host.document)return;const launchAction=()=>{const r=opened?(close(),{ok:true}):open();if(!r.ok&&SP.toast)SP.toast(r.reason);};const bar=host.document.getElementById('bar');if(bar){const launch=button('上帝模式 F8',bar,launchAction);launch.id='dev-god-launch';}
      const launch=button('上帝模式',touchDock(),launchAction);launch.id='dev-god-launch-touch';launch.setAttribute('aria-label','打开上帝模式开发工具');
      host.addEventListener('keydown',e=>{if(opened){if(e.key==='Escape'){e.preventDefault();close();}else if(!/INPUT|SELECT|TEXTAREA/.test(e.target&&e.target.tagName||''))e.preventDefault();e.stopImmediatePropagation();return;}if(e.key==='F8'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();e.stopImmediatePropagation();const r=open();if(!r.ok&&SP.toast)SP.toast(r.reason);}},true);
      host.addEventListener('click',e=>{if(opened&&!panel.contains(e.target)){e.preventDefault();e.stopImmediatePropagation();}},true);
    }
    const runtime=SP.devGod={apply,teleport,destinations,open,close,isOpen:()=>opened,validateEdit};if(host.document){if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',init,{once:true});else init();}return runtime;
  }
  const api={NEEDS,WEATHERS,validateEdit,register};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.DevGod=api;if(root.SP)register(root);
})(typeof window!=='undefined'?window:globalThis);



