/* Face-to-face exchanges: finite NPC resources and replayable, bounded records.
 * Player balances may change in other systems: replay checks each exchange's
 * deltas rather than treating this journal as the whole game's cash ledger. */
(function(root){'use strict';
 const PEOPLE=['community_resident_lin','vendor','office','community_civic_staff'],ITEMS=['fruit','tea','candy','drink','milk','bun','bread','egg'];
 const SEEDS={community_resident_lin:30000,vendor:60000,office:40000,community_civic_staff:0},LIMIT=512,CONTRACT_LIMIT=64,DAY=1440,MAX_TIME=1e12,MAX_CENTS=1e11;
 const clone=x=>JSON.parse(JSON.stringify(x)),plain=x=>!!x&&Object.getPrototypeOf(x)===Object.prototype,exact=(x,keys)=>plain(x)&&Object.keys(x).sort().join(',')===keys.slice().sort().join(',');
 const integer=(x,lo=0,hi=MAX_TIME)=>Number.isSafeInteger(x)&&x>=lo&&x<=hi,time=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=MAX_TIME;
 const relation=()=>({trust:0,lastGiftTrustDay:-1,lastRepayTrustDay:-1,rejectionsDay:-1,rejections:0,cooldownUntil:0,lastLoanDay:-1});
 const fresh=()=>({version:1,sequence:0,nextContractId:1,wallets:{...SEEDS},inventories:Object.fromEntries(PEOPLE.map(id=>[id,{}])),relations:Object.fromEntries(PEOPLE.map(id=>[id,relation()])),contracts:[],journal:[]});
 const stable=x=>JSON.stringify(x,(_k,v)=>plain(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
 const fail=reason=>({ok:false,reason});
 function commandValid(c){
  if(!plain(c)||!PEOPLE.includes(c.target)||!['gift','borrow','lend','repay','collect'].includes(c.kind)||!integer(c.expectedSequence,0,LIMIT))return false;
  const fields=['kind','target','expectedSequence'];
  if(c.kind==='gift'){fields.push('item');if(!ITEMS.includes(c.item))return false;}
  else {fields.push('amountCents');if(!integer(c.amountCents,['borrow','lend'].includes(c.kind)?100:1,10000))return false;if(['repay','collect'].includes(c.kind)){fields.push('contractId');if(!integer(c.contractId,1,CONTRACT_LIMIT))return false;}}
  return exact(c,fields);
 }
 const contextValid=c=>exact(c,['familiarity','busy'])&&integer(c.familiarity,0,100)&&typeof c.busy==='boolean';
 function playerValid(p){return exact(p,['money','items'])&&typeof p.money==='number'&&Number.isFinite(p.money)&&p.money>=0&&p.money<=1e9&&Math.abs(p.money*100-Math.round(p.money*100))<1e-5&&plain(p.items)&&Object.keys(p.items).length<=1000&&Object.entries(p.items).every(([k,v])=>k.length>0&&k.length<=120&&integer(v,0,1e6));}
 // Internal transition is shared by execute and validation. It never trusts a
 // stored outcome: every row is replayed from seeds and its original inputs.
 function apply(s,c,context,at,before){
  if(!commandValid(c)||!contextValid(context)||!time(at)||c.expectedSequence!==s.sequence||s.journal.length>=LIMIT||s.journal.length&&at<s.journal.at(-1).at||!integer(before.moneyCents,0,MAX_CENTS)||!(c.kind==='gift'?integer(before.itemCount,0,1e6):before.itemCount===null))return fail('交换请求、时间或记录序号无效，未更改任何资源。');
  const target=c.target,r=s.relations[target],day=Math.floor(at/DAY),debt=['repay','collect'].includes(c.kind)?s.contracts.find(x=>x.id===c.contractId):null;
  if(c.kind==='gift'&&before.itemCount<1)return fail('背包里没有这件物品。');
  if(['repay','collect'].includes(c.kind)&&(!debt||debt.target!==target||debt.kind!==(c.kind==='repay'?'borrow':'lend')||debt.closedAt!==null||c.amountCents>debt.principalCents-debt.repaidCents))return fail('还款合同、方向或金额无效。');
  let accepted=true,reason='',after=before.moneyCents,itemAfter=c.kind==='gift'?before.itemCount:null,contractId=debt?.id||null;
  function refuse(text,count=true){accepted=false;reason=text;if(count){if(r.rejectionsDay!==day){r.rejectionsDay=day;r.rejections=0;}r.rejections++;if(r.rejections>=3){r.rejections=0;r.cooldownUntil=at+30;}}}
  if(['gift','borrow','lend'].includes(c.kind)){
   if(r.cooldownUntil>at)refuse('对方暂时不想继续讨论礼物或借款，过一会儿再聊。',false);
   else if(target==='community_civic_staff')refuse('值班员：公务期间不收私人礼物，也不办理私人借款。');
   else if(context.busy)refuse('对方正在忙，现在没有同意这次交换。');
   else if(context.familiarity<(c.kind==='borrow'?5:2))refuse('对方觉得还不够熟悉，暂时没有同意。');
   else if(c.kind==='gift'&&target==='vendor'&&c.item==='candy')refuse('王阿姨：谢谢你的心意，不过我不太喜欢糖果。');
   else if(['borrow','lend'].includes(c.kind)&&s.contracts.some(x=>x.target===target&&x.closedAt===null))refuse('你们之间还有未结清的借款，先把旧账处理好。');
   else if(['borrow','lend'].includes(c.kind)&&r.lastLoanDay===day)refuse('今天已经订立过借款约定，改天再谈新的。');
   else if(c.kind==='borrow'&&s.contracts.some(x=>x.kind==='borrow'&&x.closedAt===null&&at>x.dueAt))refuse('你还有逾期未清的借款，先还清旧债再借入。');
  }
  if(accepted){
   if(['lend','repay'].includes(c.kind)&&before.moneyCents<c.amountCents)return fail('玩家余额不足，原有资源未更改。');
   if(['borrow','collect'].includes(c.kind)&&s.wallets[target]<c.amountCents)return fail('对方当前余额不足，原有资源未更改。');
   if(['borrow','lend'].includes(c.kind)&&s.contracts.length>=CONTRACT_LIMIT)return fail('合同记录已达64条上限，请先保留档案；不会自动删除合同。');
   r.rejectionsDay=day;r.rejections=0;
   if(c.kind==='gift'){
    itemAfter--;s.inventories[target][c.item]=(s.inventories[target][c.item]||0)+1;
    if(r.lastGiftTrustDay!==day){r.lastGiftTrustDay=day;r.trust=Math.min(5,r.trust+1);}reason='对方收下了这件物品，已记入实际持有库存。';
   }else if(['borrow','lend'].includes(c.kind)){
    const delta=c.kind==='borrow'?c.amountCents:-c.amountCents;after+=delta;s.wallets[target]-=delta;r.lastLoanDay=day;
    contractId=s.nextContractId++;s.contracts.push({id:contractId,target,kind:c.kind,principalCents:c.amountCents,repaidCents:0,createdAt:at,dueAt:at+3*DAY,closedAt:null});reason='借款已实际交付，约定三个游戏日内归还，可以分次结清。';
   }else {
    const delta=c.kind==='collect'?c.amountCents:-c.amountCents;after+=delta;s.wallets[target]-=delta;debt.repaidCents+=c.amountCents;if(debt.repaidCents===debt.principalCents)debt.closedAt=at;
    if(c.kind==='repay'&&at<=debt.dueAt&&r.lastRepayTrustDay!==day){r.lastRepayTrustDay=day;r.trust=Math.min(5,r.trust+1);}reason=debt.closedAt===null?'本次款项已经实际归还，剩余欠款继续保留。':'这笔借款已经实际结清。';
   }
  }
  if(after<0||after>MAX_CENTS||!time(at+(['borrow','lend'].includes(c.kind)&&accepted?3*DAY:!accepted&&r.cooldownUntil>at?30:0)))return fail('交换结果超过数据范围，原有资源未更改。');
  const record={sequence:++s.sequence,at,command:clone(c),context:clone(context),accepted,reason,playerBeforeCents:before.moneyCents,playerAfterCents:after,itemBefore:c.kind==='gift'?before.itemCount:null,itemAfter,contractId};s.journal.push(record);
  return {ok:true,accepted,state:s,record,text:reason,reason};
 }
 function validate(s,at){
  try{
   if(!exact(s,['version','sequence','nextContractId','wallets','inventories','relations','contracts','journal'])||s.version!==1||!integer(s.sequence,0,LIMIT)||!integer(s.nextContractId,1,CONTRACT_LIMIT+1)||!exact(s.wallets,PEOPLE)||!exact(s.inventories,PEOPLE)||!exact(s.relations,PEOPLE)||!Array.isArray(s.contracts)||s.contracts.length>CONTRACT_LIMIT||!Array.isArray(s.journal)||s.journal.length>LIMIT||s.sequence!==s.journal.length||(at!==undefined&&!time(at)))return false;
   const replay=fresh();for(const row of s.journal){
    if(!exact(row,['sequence','at','command','context','accepted','reason','playerBeforeCents','playerAfterCents','itemBefore','itemAfter','contractId'])||at!==undefined&&row.at>at)return false;
    const r=apply(replay,row.command,row.context,row.at,{moneyCents:row.playerBeforeCents,itemCount:row.itemBefore});if(!r.ok||stable(r.record)!==stable(row))return false;
   }
   return stable(replay)===stable(s);
  }catch(_){return false;}
 }
 const normalize=(s,at)=>validate(s,at)?clone(s):null;
 function execute(state,player,command,context,at){
  if(!time(at)||!validate(state,at)||!playerValid(player)||!commandValid(command)||!contextValid(context))return fail('交换状态、人物资源或请求格式无效。');
  if(state.journal.length>=LIMIT)return fail('交换记录已达512条上限，请先保留档案；不会自动裁剪记录。');
  const next=clone(state),result=apply(next,command,context,at,{moneyCents:Math.round(player.money*100),itemCount:command.kind==='gift'?(player.items[command.item]||0):null});if(!result.ok)return result;
  const output=clone(player);output.money=result.record.playerAfterCents/100;if(command.kind==='gift'&&result.accepted)output.items[command.item]=result.record.itemAfter;
  return {...result,player:output,record:clone(result.record)};
 }
 const api={fresh,validate,normalize,execute,PEOPLE:PEOPLE.slice(),ITEMS:ITEMS.slice(),TARGETS:PEOPLE.slice(),GIFT_ITEMS:ITEMS.slice()};root.SocialExchangeModel=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
