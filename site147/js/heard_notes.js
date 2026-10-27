/* Private records of utterances actually heard, never world facts or public news. */
(function(root){
 'use strict';const SP=root.SP,G=SP?.game,W=SP?.world,C=SP?.clock;if(!G||!W||!C||SP.heardNotes)return;
 const CAP=8192,RECENT=512,BLOCK=256,LEVELS=['street','roof',''],BASE='私人听闻仅记录现场陈述，不代表内容已经核实。',clone=x=>JSON.parse(JSON.stringify(x)),exact=(o,k)=>!!o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join('|')===k.slice().sort().join('|'),time=n=>Number.isFinite(n)&&n>=0&&n<=1e12,point=p=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isFinite(n)&&Math.abs(n)<=100000),id=s=>typeof s==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,99}$/.test(s)&&!['constructor','prototype','__proto__'].includes(s),text=(s,max)=>typeof s==='string'&&s.trim().length>0&&s.length<=max,level=s=>['','street','roof'].includes(s),norm=s=>s||'street',now=()=>C.abs(),where=()=>SP.place?.where?.()||(W.interior?W.sceneId:'street'),known=s=>s==='street'||typeof s==='string'&&Object.hasOwn(SP.scenes||{},s);
 let owner=G.ps,generation=0,sessions=new WeakMap(),sessionGenerations=new WeakMap(),working=false,lastReason='';
 function fresh(at=now()){return time(at)?{version:1,startedAt:at,nextId:1,notes:[]}:null;}
 function validEvidence(e){return exact(e,['player','speaker','level'])&&point(e.player)&&point(e.speaker)&&level(e.level)&&Math.hypot(e.player[0]-e.speaker[0],e.player[1]-e.speaker[1])<=7;}
 // Arbitrary locally/API-authored speech must retain its exact original bytes.
 function unpack(s){try{
  if(!s||!Array.isArray(s.notes))return null;const legacy=s.version===1;
  if(!exact(s,legacy?['version','startedAt','nextId','notes']:['version','startedAt','nextId','archive','notes'])||!legacy&&s.version!==2||s.notes.length>RECENT)return null;
  const out=[];
  if(!legacy){
   if(!Array.isArray(s.archive)||s.archive.length<1||s.archive.length>30||s.notes.length<BLOCK+1||s.archive.length*BLOCK+s.notes.length>CAP)return null;
   const index=(i,a)=>Number.isInteger(i)&&i>=0&&i<a.length;
   for(const b of s.archive){
    if(!exact(b,['firstId','speakers','scenes','texts','rows'])||b.firstId!==out.length+1||!Array.isArray(b.speakers)||!b.speakers.length||b.speakers.length>BLOCK||!b.speakers.every(a=>Array.isArray(a)&&a.length===2&&id(a[0])&&text(a[1],60))||new Set(b.speakers.map(a=>JSON.stringify(a))).size!==b.speakers.length||!Array.isArray(b.scenes)||!b.scenes.length||b.scenes.length>BLOCK||!b.scenes.every(known)||new Set(b.scenes).size!==b.scenes.length||!Array.isArray(b.texts)||!b.texts.length||b.texts.length>BLOCK||!b.texts.every(t=>text(t,180))||new Set(b.texts).size!==b.texts.length||!Array.isArray(b.rows)||b.rows.length!==BLOCK)return null;
    const people=new Set(),scenes=new Set(),texts=new Set();
    for(const t of b.rows){if(!Array.isArray(t)||t.length!==9||!index(t[1],b.scenes)||!index(t[2],b.speakers)||!index(t[3],b.texts)||!index(t[8],LEVELS))return null;
     people.add(t[2]);scenes.add(t[1]);texts.add(t[3]);const who=b.speakers[t[2]];out.push({id:out.length+1,at:t[0],scene:b.scenes[t[1]],speakerId:who[0],speakerName:who[1],text:b.texts[t[3]],kind:'overheard-statement',evidence:{player:[t[4],t[5]],speaker:[t[6],t[7]],level:LEVELS[t[8]]}});
    }
    if(people.size!==b.speakers.length||scenes.size!==b.scenes.length||texts.size!==b.texts.length)return null;
   }
  }
  out.push(...s.notes);return s.nextId===out.length+1&&out.length<=CAP?out:null;
 }catch{return null;}}
 function pack(rows){const speakers=[],scenes=[],texts=[],index=(a,x,key=x)=>{let i=a.findIndex(v=>(Array.isArray(v)?JSON.stringify(v):v)===key);if(i<0){i=a.length;a.push(x);}return i;};return{firstId:rows[0].id,speakers,scenes,texts,rows:rows.map(n=>[n.at,index(scenes,n.scene),index(speakers,[n.speakerId,n.speakerName],JSON.stringify([n.speakerId,n.speakerName])),index(texts,n.text),...n.evidence.player,...n.evidence.speaker,LEVELS.indexOf(n.evidence.level)])};}
 function append(s,n){s.notes.push(n);s.nextId++;if(s.notes.length>RECENT){if(s.version===1){s.version=2;s.archive=[];}s.archive.push(pack(s.notes.splice(0,BLOCK)));}}
 function prepare(s,at=now()){try{const notes=unpack(s);if(!notes||!time(at)||!time(s.startedAt)||s.startedAt>at)return null;let last=s.startedAt;for(let i=0;i<notes.length;i++){const n=notes[i];if(!exact(n,['id','at','scene','speakerId','speakerName','text','kind','evidence'])||n.id!==i+1||!time(n.at)||n.at<last||n.at>at||!known(n.scene)||!id(n.speakerId)||!text(n.speakerName,60)||!text(n.text,180)||n.kind!=='overheard-statement'||!validEvidence(n.evidence))return null;last=n.at;}return clone(s);}catch{return null;}}
 function allNotes(s,at=now()){const valid=prepare(s,at);return valid?clone(unpack(valid)):null;}

 function resetRuntime(){sessions=new WeakMap();generation++;lastReason='';owner=G.ps;}
 function syncOwner(){if(owner!==G.ps)resetRuntime();}
 function state(){syncOwner();if(!G.ps)return null;return G.ps.heardNotes||(G.ps.heardNotes=fresh());}
 function snapshot(){const s=state();if(!s)return null;const n=prepare(s);if(!n)throw Error('私人听闻记录无效');return n;}
 function restore(s){const n=prepare(s);if(!G.ps||working||!n)return{ok:false,reason:'私人听闻记录无效'};G.ps.heardNotes=n;resetRuntime();return{ok:true};}
 function recordSpoken(input){const fail=reason=>{lastReason=reason;return{ok:false,reason};};syncOwner();try{
  if(!input||!G.ps||input.owner!==G.ps||SP.progressSave?.restoring||working)return fail('存档或场景正在变化，本次未记录听闻。');
  const {session,turnIndex,scene,speakerId,speakerName,text:spoken,at,evidence}=input;
  if(!session||typeof session!=='object'||Array.isArray(session)||!Number.isSafeInteger(turnIndex)||turnIndex<0||turnIndex>10000||!known(scene)||scene!==where()||at!==now()||!time(at)||!id(speakerId)||!text(speakerName,60)||!text(spoken,180)||!validEvidence(evidence))return fail('本次发言或近场证据无效，未记录。');
  if(sessionGenerations.has(session)&&sessionGenerations.get(session)!==generation)return fail('旧会话已经结束，未补写听闻。');
  const P=SP.player,A=SP.actors?.list?.find(a=>a.id===speakerId&&!a.hidden);
  if(!P||P.hidden||P.dead||!A||A===P||A.dead||(A.scene&&A.scene!==scene)||(A.sceneId&&A.sceneId!==scene)||norm(A.level)!==norm(P.level)||norm(evidence.level)!==norm(P.level)||!point([P.x,P.y])||!point([A.x,A.y])||Math.hypot(P.x-evidence.player[0],P.y-evidence.player[1])>.001||Math.hypot(A.x-evidence.speaker[0],A.y-evidence.speaker[1])>.001||Math.hypot(P.x-A.x,P.y-A.y)>7)return fail('说话者已离场或不在听闻范围，本次未记录。');
  if(typeof W.blockedStatic!=='function')return fail('现场可听范围尚未准备好，未记录。');
  const steps=Math.max(1,Math.ceil(Math.hypot(A.x-P.x,A.y-P.y)/.1));for(let i=1;i<steps;i++){const t=i/steps;if(W.blockedStatic(P.x+(A.x-P.x)*t,P.y+(A.y-P.y)*t,.05))return fail('现场存在遮挡，本次未记录听闻。');}
  const utterance=Array.isArray(session.spoken)&&session.spoken[turnIndex];
  if(session.owner!==G.ps||session.scene!==scene||!Array.isArray(session.actors)||!session.actors.includes(A)||!utterance||turnIndex!==session.spoken.length-1||utterance.speaker!==speakerId||utterance.text!==spoken)return fail('本句尚未实际说出或会话已变化，未记录听闻。');
  const seen=sessions.get(session);if(seen?.has(turnIndex))return{ok:true,duplicate:true};
  const current=state(),next=prepare(current,at);if(!next)return fail('私人听闻账目无效，本次未记录。');
  if(next.nextId-1>=CAP)return fail('私人听闻归档已满（8192条）；本次未记录，现场交谈仍继续。');
  const note={id:next.nextId,at,scene,speakerId,speakerName,text:spoken,kind:'overheard-statement',evidence:clone(evidence)};append(next,note);
  if(!prepare(next,at))return fail('私人听闻未通过校验，本次未记录。');
  working=true;G.ps.heardNotes=next;const turns=seen||new Set();turns.add(turnIndex);sessions.set(session,turns);sessionGenerations.set(session,generation);lastReason='';return{ok:true};
 }catch{return fail('私人听闻暂时不可用；现场交谈仍继续。');}finally{working=false;}}
 function view(options={}){const s=snapshot();if(!s)return{notes:[],page:0,totalPages:1,statusReason:'游戏尚未准备好。'};const notes=unpack(s),size=Number.isFinite(options?.pageSize)?Math.max(1,Math.min(20,Math.floor(options.pageSize))):8,totalPages=Math.max(1,Math.ceil(notes.length/size)),page=Number.isFinite(options?.page)?Math.max(0,Math.min(totalPages-1,Math.floor(options.page))):0;return{notes:notes.slice().reverse().slice(page*size,(page+1)*size).map(({evidence,...n})=>n),page,totalPages,statusReason:lastReason||(notes.length>=CAP?'私人听闻归档已满（8192条），新的发言不会继续记录。':BASE+(s.version===2?' 较早的原话已无损归档，仍可翻页查看。':''))};}
 SP.heardNotes={fresh,prepare,snapshot,allNotes,restore,resetRuntime,canSave:()=>!working,view,recordSpoken};
})(typeof window!=='undefined'?window:globalThis);
