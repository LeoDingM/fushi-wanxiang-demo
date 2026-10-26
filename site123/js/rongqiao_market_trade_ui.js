/* P3b 榕桥菜市场 stall counter: the vendor's goods with today's price per portion (and per 斤 where it is sold by weight),
 * what is left on the counter, a quantity stepper and 扫码付款. Every purchase goes through SP.wetMarket.quote -> confirm,
 * so the same checks as the ledger apply (vendor selling, stock left, wallet, food room, player at the counter). */
(function(root){'use strict';const SP=root.SP,G=SP?.game;if(!SP||!G||SP.wetMarketUI||!root.document)return;const D=root.document,M=root.WetMarketModel;
const yuan=c=>'¥'+(c/100).toFixed(2).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1');
let panel=null,stall=null,cart={},receipt=null,owner=null;
function css(){if(D.getElementById('rq-trade-css'))return;const s=D.createElement('style');s.id='rq-trade-css';s.textContent=`
#rq-trade{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(420px,calc(100vw - 24px));max-height:min(640px,calc(100vh - 24px));overflow:auto;z-index:1000;background:#fbf7ef;color:#2b261f;border-radius:14px;box-shadow:0 10px 36px rgba(0,0,0,.45);font:14px/1.45 "PingFang SC","Noto Sans CJK SC","Microsoft YaHei",sans-serif;-webkit-overflow-scrolling:touch;touch-action:pan-y}
#rq-trade[hidden]{display:none}
#rq-trade .rqt-head{position:sticky;top:0;background:#2f6b4f;color:#fff;padding:12px 44px 10px 14px;border-radius:14px 14px 0 0}
#rq-trade .rqt-head strong{font-size:17px;display:block}#rq-trade .rqt-head small{opacity:.88}
#rq-trade .rqt-x{position:absolute;right:8px;top:8px;width:32px;height:32px;border:0;border-radius:16px;background:rgba(255,255,255,.18);color:#fff;font-size:18px;cursor:pointer}
#rq-trade .rqt-body{padding:10px 12px 12px}
#rq-trade .rqt-row{display:grid;grid-template-columns:1fr auto;gap:4px 10px;align-items:center;padding:9px 2px;border-bottom:1px dashed #d9cfbd}
#rq-trade .rqt-row b{font-size:15px}#rq-trade .rqt-row small{color:#6f6554;display:block}
#rq-trade .rqt-row.out{opacity:.5}
#rq-trade .rqt-price{color:#b2391c;font-weight:700}
#rq-trade .rqt-step{display:flex;align-items:center;gap:6px}
#rq-trade .rqt-step button{width:34px;height:34px;border-radius:17px;border:1px solid #2f6b4f;background:#fff;color:#2f6b4f;font-size:18px;cursor:pointer}
#rq-trade .rqt-step button.add{background:#2f6b4f;color:#fff}#rq-trade .rqt-step button:disabled{opacity:.35;cursor:default}
#rq-trade .rqt-step span{min-width:18px;text-align:center;font-weight:700}
#rq-trade .rqt-sum{display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding:10px;background:#f1e8d6;border-radius:10px}
#rq-trade .rqt-sum b{font-size:18px;color:#b2391c}
#rq-trade .rqt-pay{display:block;width:100%;margin-top:10px;height:44px;border:0;border-radius:10px;background:#1aad5a;color:#fff;font-size:16px;font-weight:700;cursor:pointer}
#rq-trade .rqt-pay:disabled{background:#9db8a6;cursor:default}
#rq-trade .rqt-note{color:#6f6554;font-size:12px;margin:8px 2px 0}
#rq-trade .rqt-warn{color:#a2401f;background:#fde9dc;border-radius:8px;padding:8px 10px;margin:4px 0 8px}
#rq-trade .rqt-receipt{background:#fff;border:1px solid #e3d8c4;border-radius:10px;padding:10px;margin:4px 0 8px}
#rq-trade .rqt-receipt div{display:flex;justify-content:space-between}
`;D.head.appendChild(s);}
function el(tag,cls,parent,text){const e=D.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;if(parent)parent.appendChild(e);return e;}
function btn(label,parent,fn,cls,aria){const b=el('button',cls||'',parent,label);b.type='button';b.onclick=e=>{e?.stopPropagation?.();fn();};if(aria)b.setAttribute('aria-label',aria);return b;}
function mount(){if(panel)return panel;css();panel=el('div','',D.body);panel.id='rq-trade';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','菜市场摊位');
 for(const ev of ['touchstart','touchmove','touchend','pointerdown','pointerup','mousedown','wheel'])panel.addEventListener(ev,e=>e?.stopPropagation?.(),{passive:true});return panel;}
function perJin(k,cents){const m=/(\d+(?:\.\d+)?|半|一|两|二|三)\s*斤/.exec(k.spec||'');if(!m)return'';const j={半:.5,一:1,两:2,二:2,三:3}[m[1]]||Number(m[1]);if(j===1)return'';return j>0?` · 约${yuan(Math.round(cents/j))}/斤`:'';}
function render(){if(!panel||panel.hidden)return;const v=SP.wetMarket.stallView(stall);if(panel.replaceChildren)panel.replaceChildren();else panel.children=[];if(!v){close();return;}
 const h=el('div','rqt-head',panel);el('strong','',h,`${v.name} · ${v.vname}`);el('small','',h,`${SP.wetMarket.statusText(stall)} · 营业约${SP.wetMarket.hm(v.hours[0])}–${SP.wetMarket.hm(v.hours[1])} · 钱包${yuan(v.walletCents)}`);
 btn('×',h,close,'rqt-x','关闭摊位');const b=el('div','rqt-body',panel);
 if(receipt){const r=el('div','rqt-receipt',b);el('strong','',r,'付款成功 · 电子小票');for(const x of receipt.receipt){const d=el('div','',r);el('span','',d,`${x.label} ×${x.n}`);el('span','',d,yuan(x.cents));}const t=el('div','',r);el('b','',t,'合计');el('b','',t,yuan(receipt.totalCents));el('p','rqt-note',r,'已放进随身袋；回家后可放冰箱，生鲜请尽快烹饪。');}
 if(!v.selling)el('p','rqt-warn',b,v.state==='closed'||v.phase==='off'||v.phase==='walk_out'?'摊主不在，档口已收。':'摊主还在摆货/收档，请稍等。');
 else if(!v.near)el('p','rqt-warn',b,'请走到柜台前（站在柜台外即可）再买。');
 let total=0,n=0;for(const k of v.skus){const q=Math.min(cart[k.sku]||0,k.left);if(q!==(cart[k.sku]||0)){if(q>0)cart[k.sku]=q;else delete cart[k.sku];}total+=q*k.cents;n+=q;
  const row=el('div','rqt-row'+(k.left?'':' out'),b),t=el('div','',row);el('b','',t,k.label);el('small','',t,`${k.spec} · `).appendChild(el('span','rqt-price',null,yuan(k.cents)+perJin(k,k.cents)));
  el('small','',t,k.left?`档口还剩${k.left}份${k.fresh===0?' · 今早到货':k.fresh?` · 已放${k.fresh}天`:''}`:'卖完了');
  const s=el('div','rqt-step',row);const minus=btn('−',s,()=>{cart[k.sku]=Math.max(0,(cart[k.sku]||0)-1);if(!cart[k.sku])delete cart[k.sku];receipt=null;render();},'',`少一份·${k.label}`);minus.disabled=!q;el('span','',s,String(q));
  const plus=btn('+',s,()=>{cart[k.sku]=Math.min(k.left,10,(cart[k.sku]||0)+1);receipt=null;render();},'add',`加一份·${k.label}`);plus.disabled=!v.selling||q>=Math.min(k.left,10);}
 const sum=el('div','rqt-sum',b);el('span','',sum,n?`共${n}份`:'还没选');el('b','',sum,yuan(total));
 const pay=btn(`扫码付款 · ${yuan(total)}`,b,pay0,'rqt-pay','扫码付款');pay.disabled=!n||!v.selling||!v.near||total>v.walletCents;
 if(total>v.walletCents)el('p','rqt-warn',b,'钱包里的钱不够。');
 el('p','rqt-note',b,'价格参考广州/深圳街市行情（未经Leo确认）。货从清早冷链车进，卖完即止；买到的生鲜进入家庭食材账本并按时间变质。');}
function pay0(){const q=SP.wetMarket.quote(stall,cart);if(!q.ok){SP.toast?.(q.reason);render();return {ok:false,reason:q.reason};}const r=SP.wetMarket.confirm(q.token);if(!r.ok){SP.toast?.(r.reason);render();return r;}cart={};receipt=r;SP.toast?.(r.text);render();return r;}
function open(id){if(!M?.BY?.[id])return{ok:false,reason:'没有这个档口'};mount();if(owner!==G.ps||stall!==id){cart={};receipt=null;}owner=G.ps;stall=id;panel.hidden=false;render();return{ok:true};}
function close(){if(panel)panel.hidden=true;receipt=null;}
const busy0=G.busy;G.busy=function(){return !!(panel&&!panel.hidden)||busy0.apply(this,arguments);};
root.addEventListener?.('keydown',e=>{if(panel&&!panel.hidden){if(e.key==='Escape'){e.preventDefault();close();}e.stopImmediatePropagation();}},true);
/* re-render once a game second so the stock and vendor state stay live; close if the player walks away or the save changes */
let acc=0;const update0=G.update;G.update=function(dt){const r=update0.apply(this,arguments);if(panel&&!panel.hidden){if(owner!==G.ps||SP.place?.where?.()!=='street')close();else if((acc+=dt||0)>1){acc=0;render();}}return r;};
SP.wetMarketUI={open,close,isOpen:()=>!!(panel&&!panel.hidden),cart:()=>({...cart}),setCart:c=>{cart={...c};render();},pay:pay0,render};
})(typeof window!=='undefined'?window:globalThis);
