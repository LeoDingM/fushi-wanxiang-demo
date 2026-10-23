/* Rule-owned on-site conversation. Entry/save installation is explicit. */
(function(root){
 'use strict';
 const copy=x=>JSON.parse(JSON.stringify(x)),plain=x=>x&&Object.getPrototypeOf(x)===Object.prototype;
 const LIMITS={events:256,transcript:128,text:600};
 const MEMORY_VALUES={reading:['like','dislike'],food:['breakfast','regular'],work:['busy','rest'],mood:['tired','happy','sad']};
 const MEMORY_TTL={reading:43200,food:43200,work:43200,mood:2880};
 const MEMORY_TEXT={reading:{like:'你之前说过自己喜欢阅读。',dislike:'你之前说过自己不喜欢阅读。'},food:{breakfast:'你之前说过早餐的事。',regular:'你之前说过自己会按时吃饭。'},work:{busy:'你之前说过自己当时很忙。',rest:'你之前说过自己当时在休息。'},mood:{tired:'你之前说过当时有些累。',happy:'你之前说过当时心情不错。',sad:'你之前说过当时有些难过。'}};
 const profiles={
  community_resident_lin:{name:'小林',role:'社区邻居',contact:'lin',style:'friendly',persona:'友好但有自己的日程。喜欢傍晚阅读，不编造具体公司、家庭或住址。'},
  vendor:{name:'王阿姨',role:'早餐摊主',contact:'vendor',style:'warm',persona:'爽朗热心，关心街坊吃饭，忙时先照顾摊位，不通过聊天送物或优惠。'},
  office:{name:'上班族',role:'通勤中的居民',contact:null,style:'reserved',persona:'谨慎有礼，通勤时间压力大。刚认识只简短聊，不提供公司名称、家庭或住址。'},
  community_civic_staff:{name:'林值班员',role:'便民警务值班员',contact:'civic',style:'professional',persona:'专业礼貌，工作时先处理便民窗口；不编造报案、调查或办结结果。'}
 };
 const intents=['greet','directions','role','chat','thought','clarify','apologize','end'];
 const known=id=>Object.prototype.hasOwnProperty.call(profiles,id);
 const fresh=(legacyLin=null)=>({version:3,nextSession:1,nextEvent:1,nextMessage:1,people:legacyLin?{community_resident_lin:{familiarity:legacyLin.familiarity,lastGreetingDay:legacyLin.lastGreetingDay,cooldownUntil:0,disturbance:0,memory:{}}}:{},events:[],transcript:[]});
 const keys=(o,list)=>plain(o)&&Object.keys(o).sort().join(',')===list.slice().sort().join(',');
 function validTime(n){return Number.isFinite(n)&&n>=0&&n<=1e12;}
 function validateState(s,at,version){
  const v1=version===1,fields=v1?['version','nextSession','nextEvent','people','events']:['version','nextSession','nextEvent','nextMessage','people','events','transcript'];
  if(!keys(s,fields)||s.version!==version||!(v1?[s.nextSession,s.nextEvent]:[s.nextSession,s.nextEvent,s.nextMessage]).every(n=>Number.isSafeInteger(n)&&n>=1&&n<=1e12)||!plain(s.people)||Object.keys(s.people).length>4||!Array.isArray(s.events)||s.events.length>(v1?4096:LIMITS.events)||(!v1&&(!Array.isArray(s.transcript)||s.transcript.length>LIMITS.transcript)))return false;
  for(const [id,p]of Object.entries(s.people)){
   if(!known(id)||!keys(p,version===3?['familiarity','lastGreetingDay','cooldownUntil','disturbance','memory']:['familiarity','lastGreetingDay','cooldownUntil','disturbance'])||!Number.isInteger(p.familiarity)||p.familiarity<0||p.familiarity>100||!Number.isInteger(p.lastGreetingDay)||p.lastGreetingDay< -1||!validTime(p.cooldownUntil)||!Number.isInteger(p.disturbance)||p.disturbance<0||p.disturbance>2)return false;
   if(version===3){if(!plain(p.memory)||Object.keys(p.memory).length>4)return false;for(const [key,slot]of Object.entries(p.memory))if(!Object.prototype.hasOwnProperty.call(MEMORY_VALUES,key)||!keys(slot,['value','at'])||!MEMORY_VALUES[key].includes(slot.value)||!validTime(slot.at)||(at!==undefined&&slot.at>at))return false;}
  }
  let last=0;const eventKeys=new Set();
  let previousAt=-1;
  for(const e of s.events){
   if(!keys(e,['id','key','target','kind','delta','at'])||!Number.isSafeInteger(e.id)||e.id<=last||e.id>=s.nextEvent||!known(e.target)||!s.people[e.target]||!['greeting','boundary','apology'].includes(e.kind)||typeof e.key!=='string'||e.key.length>100||eventKeys.has(e.key)||!validTime(e.at)||e.at<previousAt||!Number.isInteger(e.delta)||e.delta<0||e.delta>1||(e.kind!=='greeting'&&e.delta!==0))return false;
   if(e.kind==='greeting'){if(e.key!==`greeting:${e.target}:${Math.floor(e.at/1440)}`||!s.people[e.target]||s.people[e.target].lastGreetingDay<Math.floor(e.at/1440))return false;}
   else{const m=e.kind==='boundary'?/^boundary:(\d+):(\d+)$/.exec(e.key):(v1?/^apology:(\d+)$/:/^apology:(\d+):(\d+)$/).exec(e.key);if(!m||!Number.isSafeInteger(Number(m[1]))||Number(m[1])<1||Number(m[1])>=s.nextSession||(m[2]!==undefined&&(!Number.isSafeInteger(Number(m[2]))||Number(m[2])<0||Number(m[2])>1e12)))return false;}
   last=e.id;previousAt=e.at;eventKeys.add(e.key);
  }
  last=0;previousAt=-1;
  if(!v1)for(const m of s.transcript){if(!keys(m,['id','sessionId','target','role','text','at','mode'])||!Number.isSafeInteger(m.id)||m.id<=last||m.id>=s.nextMessage||!Number.isSafeInteger(m.sessionId)||m.sessionId<1||m.sessionId>=s.nextSession||!known(m.target)||!s.people[m.target]||!['user','assistant'].includes(m.role)||typeof m.text!=='string'||!m.text.trim()||m.text.length>LIMITS.text||!validTime(m.at)||m.at<previousAt||!['user','local','ai','fallback'].includes(m.mode)||(m.role==='user')!==(m.mode==='user'))return false;last=m.id;previousAt=m.at;}
  if(at!==undefined){if(!validTime(at))return false;const day=Math.floor(at/1440);if(Object.values(s.people).some(p=>p.lastGreetingDay>day||p.cooldownUntil>at+30)||s.events.some(e=>e.at>at)||(!v1&&s.transcript.some(m=>m.at>at)))return false;}
  return true;
 }
 function normalize(s,at){
  if(![1,2,3].includes(s?.version)||!validateState(s,at,s.version))return null;
  const migrated=copy(s);if(s.version===3)return migrated;
  migrated.version=3;for(const p of Object.values(migrated.people))p.memory={};
  if(s.version===1){migrated.nextMessage=1;migrated.transcript=[];for(const e of migrated.events)if(e.kind==='apology')e.key+=':0';migrated.events=migrated.events.slice(-LIMITS.events);}
  return validateState(migrated,at,3)?migrated:null;
 }
 function validate(s,at,legacyLin){const n=normalize(s,at);if(!n)return false;if(legacyLin===undefined)return true;const p=n.people.community_resident_lin;if(!p)return true;return p.familiarity===(legacyLin?.familiarity??0)&&p.lastGreetingDay===(legacyLin?.lastGreetingDay??-1);}
 function selfReports(input){
  const text=String(input||'').trim();
  // Deliberately conservative: unsupported or ambiguous grammar stays ordinary dialogue.
  if(!text||/[?？"'“”‘’「」『』《》]/.test(text)||/吗|是否|是不是|会不会|难道|怎么|为什么|怎样|谁|哪里|哪儿|如果|假如|假设|要是|也许|可能|或许|好像|大概|但愿|希望|听说|据说|传闻|引用|转述|他说|她说|他们|她们|别人|朋友|同事|父母|妈妈|爸爸|没|并非|否认|未曾|别.*记|不要记|你以为|我以前|以前我|我曾经|曾经我|我过去|过去我|我从前|从前我/.test(text))return [];
  const positivePrefix='我(?:(?:今天|最近|现在|这阵子|这几天|这两天|平时|每天|一直|正在|其实|确实|真的|仍然|已经|通常|总是)(?:很|好|真|有点|比较|非常|特别|十分|挺|有些)?)*(?:很|好|真|有点|比较|非常|特别|十分|挺|有些)?';
  const matchers=[
   ['reading','like','(?:喜欢|爱|爱好)(?:读书|看书|阅读)'],['reading','dislike','(?:不喜欢|讨厌|厌恶)(?:读书|看书|阅读)'],
   ['food','breakfast','(?:喜欢吃|每天吃|习惯吃|吃(?:了|过)?)(?:早餐|早饭)'],['food','regular','(?:(?:习惯)?(?:按时|规律)(?:吃饭|用餐)|吃饭(?:很|比较)?规律)'],
   ['work','busy','(?:工作(?:很|有点|比较|非常|特别)?忙|忙(?:着工作|于工作)?|在加班|要加班|加班(?:很多|中)?)'],['work','rest','(?:休息|在休息|在休假|正在休假|放假|在放假)'],
   ['mood','tired','(?:(?:感到|觉得|感觉)(?:很|有点|非常|特别)?)?(?:累|疲惫|疲劳)'],
   ['mood','happy','(?:(?:感到|觉得|感觉)(?:很|有点|非常|特别)?)?(?:开心|高兴|快乐|心情很好|心情不错|心情愉快)'],
   ['mood','sad','(?:(?:感到|觉得|感觉)(?:很|有点|非常|特别)?)?(?:难过|伤心|低落|心情低落)']
  ];
  const found=new Map(),ambiguous=new Set();
  for(let clause of text.split(/[，,。.!！；;\n]/)){clause=clause.replace(/\s+/g,'').replace(/^(?:更正一下|更正|纠正一下|纠正|刚才说错了|其实)/,'');for(const [key,value,pattern]of matchers){if(!new RegExp('^'+positivePrefix+pattern+'[啊呀啦的]*$').test(clause))continue;if(found.has(key)&&found.get(key)!==value)ambiguous.add(key);found.set(key,value);}}
  return [...found].filter(([key])=>!ambiguous.has(key)).map(([key,value])=>({key,value}));
 }
 const THOUGHT_RESPONSES={
  'reading:like':{friendly:'我也喜欢看书。你最近偏爱故事，还是想学点新东西？',warm:'看书是个挺好的消遣。忙完吃顿饭，再慢慢看。',reserved:'阅读挺安静，也适合通勤空隙。我不一定懂你读的书，但愿意听你聊聊。',professional:'阅读挺好的，闲下来的时候翻几页，也能换换心情。'},
  'reading:dislike':{friendly:'每个人兴趣不同，我们可以换个话题。',warm:'阅读之外也有很多消遣，日常让自己舒坦就行。',reserved:'知道了，我不会硬把阅读话题塞给你。',professional:'知道了，那我们聊点别的。你平时更喜欢做什么？'},
  'food:breakfast':{friendly:'你提到早餐，感觉一天有个从容的开始挺好。',warm:'聊早餐我熟悉。你偏爱清淡一点，还是热乎一些？',reserved:'早餐的习惯因人而异，通勤时我也会考虑时间。',professional:'早饭吃踏实些，忙起来才不容易饿。'},
  'food:regular':{friendly:'按时吃饭是个挺好的安排，日常也能从容些。',warm:'能按时吃饭挺好，忙起来也尽量照顾这件事。',reserved:'你有自己的饮食安排，我就不替你决定了。',professional:'按时吃饭挺好，工作忙也别把饭点错过去。'},
  'work:busy':{friendly:'忙的时候我也会想给自己留点安静的时间。你最近忙些什么？',warm:'工作忙也尽量按时吃饭，别把一天的饭都挤掉。',reserved:'工作安排紧的时候，聊太久也会有压力。我们可以简单聊。',professional:'最近工作辛苦了。若是办事时间难安排，可以先问清流程。'},
  'work:rest':{friendly:'能休息一会儿挺好。你打算安静待着，还是做点喜欢的事？',warm:'休息时也记得按时吃饭，慢慢安排就好。',reserved:'有自己的休息安排挺好，我就不替你决定怎么过。',professional:'有空歇一歇挺好。今天想怎么安排？'},
  'mood:tired':{friendly:'听起来你有些累。愿意说说最近的安排吗？',warm:'累的时候先慢慢来，吃饭休息别落下。',reserved:'我听到你说有些累。可以简单聊，不必勉强自己。',professional:'最近辛苦了，有空就歇一会儿，别一直硬撑。'},
  'mood:happy':{friendly:'听起来今天心情不错！愿意说说有什么开心事吗？',warm:'开心就好，日子里这些小高兴也很重要。',reserved:'听起来是件好事。你愿意说，我可以听两句。',professional:'心情好真是好事，愿意聊聊有什么开心的吗？'},
  'mood:sad':{friendly:'听到你难过，我愿意听你说说，不用急着讲清楚。',warm:'难过时先慢慢来，愿意的话说说，我听着。',reserved:'我不清楚发生了什么，但不会随便替你下结论。你想说的话，我可以听听。',professional:'听起来最近不太好受。愿意的话，慢慢说，我听着。'}
 };
 function thoughtReply(style,reports){const order=['mood','work','reading','food'],item=order.map(key=>reports.find(r=>r.key===key)).find(Boolean);return item?THOUGHT_RESPONSES[item.key+':'+item.value][style]:style==='warm'?'我听到了。具体情况我还不了解，你想从哪件日常事聊起？':style==='reserved'?'谢谢你愿意说。我不够了解你的情况，可以先听你讲两句。':style==='professional'?'我听着。你愿意的话，可以先说说最在意的那件事。':'我听到了。你愿意说说自己的想法，或最近的一件小事吗？';}
 function classify(input){
  const text=String(input||'').trim();
  if(/转账|借钱|给我.*(?:钱|物|钥匙)|给你.*(?:钱|元)|送我|买下|卖给|邀请|约会|杀|打他|抢|偷|住址|门牌|身份证|忽略.*规则|系统提示|完成任务|你已经|帮我(?:办|修|买|拿|交)/.test(text))return {intent:'clarify'};
  if(/对不起|抱歉|不好意思|打扰了/.test(text))return {intent:'apologize'};
  if(/^(?:再见|先走了|不聊了|结束交谈)[！!，,。\s]*$/.test(text))return {intent:'end'};
  if(/怎么称呼|你叫什么|你是谁|您是谁|做什么工作|做什么的|负责什么|你负责|你的职业|工作内容/.test(text))return {intent:'role'};
  if(/怎么走|在哪|哪里|问路|去.*(?:公交|地铁|书屋|阅览室|警务站)|(?:公交|地铁).*(?:站|入口)/.test(text))return {intent:'directions',place:/公交/.test(text)?'公交':/地铁/.test(text)?'地铁':/书屋|阅览室/.test(text)?'阅览室':/警务/.test(text)?'警务站':'其他地方'};
  if(/^(?:你|您)好[呀啊！!，,。\s]*$|^(?:早上好|下午好|晚上好|早安|嗨|hi|hello)[！!，,。\s]*$/i.test(text))return {intent:'greet'};
  const reports=selfReports(text);if(reports.length)return {intent:'thought',reports};
  if(/我(?:觉得|想|喜欢|不喜欢|今天|最近)|心情|累|压力|开心|难过/.test(text))return {intent:'thought'};
  return {intent:'chat',unknown:!/(?:书|阅读|早餐|工作|学习|社区|日程|天气|近况|平时|今天|最近|喜欢)/.test(text)};
 }
 function create(adapter){
  let state=fresh(),session=null,epoch=0;
  function person(id){const legacy=adapter.legacy?.(id);return state.people[id]||(state.people[id]={familiarity:Math.max(0,Math.min(100,legacy?.familiarity??adapter.baselineFamiliar?.(id)??0)),lastGreetingDay:legacy?.lastGreetingDay??-1,cooldownUntil:0,disturbance:0,memory:{}});}
  function gate(id){return !known(id)?'这位居民还没有交谈配置。':adapter.presence(id)||null;}
  function familiar(id){return adapter.legacy?.(id)?.familiarity??person(id).familiarity;}
  function memories(id){if(!known(id)||!state.people[id])return [];const now=adapter.now(),out=[];for(const key of Object.keys(MEMORY_VALUES)){const slot=state.people[id].memory[key];if(slot&&slot.at<=now&&now-slot.at<MEMORY_TTL[key])out.push({key,value:slot.value,at:slot.at,text:MEMORY_TEXT[key][slot.value]});}return out;}
  function forgetMemory(id,key){if(!session||session.target!==id||!known(id)||!Object.prototype.hasOwnProperty.call(MEMORY_VALUES,key))return {ok:false,reason:'只能让当前正在交谈的居民忘记自己的白名单记忆。'};if(session.prepared)return {ok:false,reason:'请先等回复结束或取消等待，再让对方忘记。'};const p=state.people[id],forgotten=Object.prototype.hasOwnProperty.call(p.memory,key);delete p.memory[key];return {ok:true,forgotten};}
  function recalledOpening(id){const now=adapter.now();if(adapter.pressure?.(id))return null;const style=profiles[id].style,order={friendly:['reading','mood','work','food'],warm:['food','mood','work','reading'],reserved:['work','mood','reading','food'],professional:['mood','work','food','reading']}[style],items=memories(id).filter(m=>Math.floor(m.at/1440)<Math.floor(now/1440));const item=order.map(key=>items.find(m=>m.key===key)).find(Boolean);if(!item)return null;const followup={reading:{like:style==='friendly'?'最近有找到合心意的书吗？':'最近还愿意聊聊阅读吗？',dislike:'我们可以换个话题，聊别的兴趣。'},food:{breakfast:style==='warm'?'今天想聊聊早饭吗？':'最近吃饭的安排怎么样？',regular:'最近也吃得规律吗？'},work:{busy:style==='reserved'?'最近安排有没有轻松一些？':'这阵子安排还忙吗？',rest:'最近休息得怎样？'},mood:{tired:'这阵子感觉怎样？',happy:'最近有没有想分享的小高兴？',sad:'最近还愿意说说感受吗？'}};return {...item,text:item.text+followup[item.key][item.value]};}
  function event(key,id,kind,delta){const old=state.events.find(e=>e.key===key);if(old)return old;const e={id:state.nextEvent++,key,target:id,kind,delta,at:adapter.now()};state.events.push(e);if(state.events.length>LIMITS.events)state.events.shift();return e;}
  function message(role,text,mode){const m={id:state.nextMessage++,sessionId:session.id,target:session.target,role,text:String(text).slice(0,LIMITS.text),at:adapter.now(),mode};state.transcript.push(m);if(state.transcript.length>LIMITS.transcript)state.transcript.shift();return m;}
  function end(reason='交谈已结束。'){session=null;epoch++;adapter.onSessionEnd?.();return {ok:true,text:reason,ended:true};}
  function begin(id){const reason=gate(id);if(reason)return {ok:false,reason};if(session)return {ok:false,reason:'请先结束当前交谈。'};const p=person(id),now=adapter.now();if(now<p.cooldownUntil)return {ok:false,reason:'对方想安静一会儿，请稍后再聊。',remaining:p.cooldownUntil-now};epoch++;session={id:state.nextSession++,target:id,turn:0,startedAt:now,log:[],prepared:null,seenKeys:[],mentionedMemoryKeys:[]};const recall=recalledOpening(id);if(recall)session.mentionedMemoryKeys.push(recall.key);const text=recall?recall.text:adapter.pressure?.(id)?'你好，我现在正忙。有具体问题可以简短说。':familiar(id)>0?'又见面了，有什么事？':'你好，有什么事？';message('assistant',text,'local');return {ok:true,session:copy(session),text,memoryMention:recall?.key||null};}
  function turn(intent,args={}){
   if(!session)return {ok:false,reason:'请先走近居民发起交谈。'};if(!intents.includes(intent))return {ok:false,reason:'这句话含义不明确，请先说具体想聊什么。'};if(intent==='end')return end();
   const id=session.target,reason=gate(id);if(reason){end();return {ok:false,reason,ended:true};}
   const p=person(id),now=adapter.now(),day=Math.floor(now/1440),profile=profiles[id];const routine=id==='vendor'&&args.routine?adapter.routine?.(id):null;let text='',delta=0,eventId=null,denied=false;
   if(now<p.cooldownUntil&&intent!=='apologize'){text='我已经明确说过现在不想聊，请给我一些空间。';denied=true;}
   else if(typeof routine==='string'&&routine.trim()&&routine.length<=LIMITS.text)text=routine;
   else if(adapter.pressure?.(id)&&['chat','thought'].includes(intent)){
    denied=true;p.disturbance=Math.min(2,p.disturbance+1);if(p.disturbance===2)p.cooldownUntil=now+30;eventId=event(`boundary:${session.id}:${session.turn}`,id,'boundary',0).id;
    text=p.disturbance===2?'我已经说过现在没空了，请别再打扰。半小时后再聊。':profile.style==='warm'?'正忙着招呼客人呢，等空下来再说。':profile.style==='professional'?'现在要处理窗口事务，请先说具体问题。':'我现在赶时间，先不闲聊了。';
   }else if(intent==='greet'){
    const last=Math.max(p.lastGreetingDay,adapter.legacy?.(id)?.lastGreetingDay??-1);
    if(day>last){delta=familiar(id)<100?1:0;adapter.greet?.(id,day);p.familiarity=Math.min(100,p.familiarity+delta);p.lastGreetingDay=day;eventId=event(`greeting:${id}:${day}`,id,'greeting',delta).id;}
    text=day>last?(profile.style==='warm'?'你好呀，吃过早饭了吗？':profile.style==='reserved'?'你好，我正在附近通勤。':profile.style==='professional'?'您好，便民服务请到窗口办理。':'你好，我是小林，以后碰面打个招呼。'):'今天已经打过招呼了，待会儿见。';
   }else if(intent==='directions')text=adapter.direction?.(id,String(args.place||''))||'这个地方我不太清楚，公共地图上可能有信息。';
   else if(intent==='role')text=profile.style==='warm'?'我是王阿姨，在老街做早餐，早上常要忙着招呼客人。':profile.style==='professional'?'我是林值班员，在便民警务窗口负责服务。具体事务需到窗口按记录办理。':profile.style==='reserved'?'我是附近通勤的上班族。公司和住址这些私事，刚认识就先不说了。':'我叫小林，住在社区，平日会跑些事，傍晚喜欢看书。';
   else if(intent==='clarify')text='这件事我不能凭聊天替你办理，也不会透露私人资料。你想问规则、说说想法，还是了解公共地点？';
   else if(intent==='apologize'){if(p.disturbance){p.disturbance=0;eventId=event(`apology:${session.id}:${session.turn}`,id,'apology',0).id;text='谢谢理解，我还是需要一点时间，稍后再聊。';}else text='没关系，不过我不记得我们有什么误会。';}
   else if(intent==='thought')text=thoughtReply(profile.style,args.reports||[]);
   else if(args.unknown)text=profile.style==='warm'?'这件事我不太了解，怕说错。你想聊日常近况，还是问附近的公共地点？':profile.style==='reserved'?'这个话题我不够了解，不能随便替别人下结论。可以简单聊聊日常。':'这件事我不太清楚。你可以说说自己的想法，或问我知道的公共地点。';
   else text=profile.style==='warm'?'每天给街坊备早饭，忙过这阵才有空歇歇。':profile.style==='reserved'?(familiar(id)>1?'又碰面了，你今天也要去上班吗？':'先简单聊两句吧，我还有自己的安排。'):profile.style==='professional'?'我平时负责便民窗口，具体业务要按记录办理。':(familiar(id)>1?'住得近常见面，感觉越来越熟了。傍晚我喜欢看会儿书。':'我喜欢傍晚找个地方读书。你也可以说说自己的想法。');
   session.turn++;const r={ok:true,text,delta,eventId,denied,familiarity:familiar(id),sessionId:session.id,turn:session.turn,intent,allowAI:!routine&&!denied&&['chat','thought','greet'].includes(intent)};session.log.push({intent,text});session.log=session.log.slice(-12);return r;
  }
  function prepareText(input,key){
   const text=String(input||'').trim();if(!text||text.length>LIMITS.text)return {ok:false,reason:`请输入1–${LIMITS.text}个字。`};if(!session)return {ok:false,reason:'当前没有会话。'};
   if(typeof key!=='string'||!key||key.length>100)return {ok:false,reason:'消息标识无效。'};if(session.seenKeys.includes(key))return {ok:false,duplicate:true,reason:'这条消息已经处理。'};if(session.prepared)return {ok:false,reason:'上一条还在回复，请稍候或取消等待。'};
   const reason=gate(session.target);if(reason){end();return {ok:false,reason,ended:true};}
   let parsed=classify(text);if(session.target==='vendor'&&!['clarify','apologize','end'].includes(parsed.intent)&&/(?:您|你).*(?:打算|安排|去哪|去哪里|回家|收摊)|(?:接下来|现在).*(?:安排|去哪|回家|收摊)|什么时候.*(?:回家|收摊)/.test(text))parsed={intent:'chat',routine:true};if(parsed.intent==='end')return end();message('user',text,'user');session.seenKeys.push(key);session.seenKeys=session.seenKeys.slice(-32);
   const r=turn(parsed.intent,parsed);if(!r.ok)return r;
   r.memoryRecordedKeys=[];r.memoryCorrectedKeys=[];r.memoryChanged=false;
   if(!r.denied&&!adapter.pressure?.(session.target)&&adapter.now()>=person(session.target).cooldownUntil){const p=person(session.target),now=adapter.now();for(const report of parsed.reports||[]){const old=p.memory[report.key];if(old&&old.value!==report.value&&now-old.at<MEMORY_TTL[report.key])r.memoryCorrectedKeys.push(report.key);if(!old||old.value!==report.value||old.at!==now)r.memoryChanged=true;p.memory[report.key]={value:report.value,at:now};r.memoryRecordedKeys.push(report.key);}}
   if(r.memoryCorrectedKeys.length){const prefix={friendly:'明白，那就按你现在的说法。',warm:'好，我按你这次说的记着。',reserved:'知道了，我记你现在的说法。',professional:'明白了，那就按你现在说的记着。'}[profiles[session.target].style];r.text=prefix+r.text;r.allowAI=false;}
   r.memoryContext=memories(session.target).map(m=>m.text);r.memoryMentionedKeys=session.mentionedMemoryKeys.slice();
   r.input=text;r.target=session.target;r.token=`${epoch}:${session.id}:${session.turn}:${state.nextMessage}`;session.prepared=r.token;return r;
  }
  function completeText(r,text,mode='local'){
   if(!r?.token||!session||session.prepared!==r.token)return {ok:false,stale:true};const reason=gate(session.target);if(reason){end();return {ok:false,stale:true,reason};}
   if(!['local','ai','fallback'].includes(mode)||typeof text!=='string'||!text.trim()||text.length>LIMITS.text)return {ok:false,reason:'回复格式无效。'};session.prepared=null;return {ok:true,message:copy(message('assistant',text,mode))};
  }
  function restore(s){const next=normalize(s,adapter.now());if(!next)return {ok:false,reason:'交谈存档结构或时间语义无效。'};end();state=next;return {ok:true,migrated:s.version!==3};}
  function snapshot(){const id='community_resident_lin',legacy=adapter.legacy?.(id);if(legacy&&state.people[id]){state.people[id].familiarity=legacy.familiarity;state.people[id].lastGreetingDay=legacy.lastGreetingDay;}return copy(state);}
  return {begin,turn,end,prepareText,completeText,memories,forgetMemory,snapshot,restore,current:()=>session?copy(session):null,familiar,nearby:()=>Object.keys(profiles).filter(id=>!gate(id)),profiles};
 }
 function liveAdapter(SP){
  const scene=()=>SP.world.interior?SP.world.sceneId:'street';
  function actor(id){return SP.actors.list.find(a=>a.id===id);}
  function presence(id){
   const a=actor(id),p=SP.player,W=SP.world;
   if(!a||a.hidden||a.vehicle||p.level==='roof'||SP.cbd?.active||SP.metroActive||root.FushiMetro?.core?.active)return '居民当前不在这个可交谈场景。';
   if(id==='vendor'&&SP.vendorDay){const actual=SP.vendorDay.actor?.(),p=SP.game.ps?.npcConflict?.people?.vendor;if(a!==actual||a.dead||a.injured||a.restrained||a.medicalPatient||p&&(p.health<100||p.restrained||p.mode&&p.mode!=='calm')||SP.cityIncidents?.holdsActor?.(id))return '王阿姨当前不便交谈。';}
   const expected=id==='vendor'&&SP.vendorDay?SP.vendorDay.presence?.()?.area:id==='community_resident_lin'?SP.communityRoutines?.state()?.scene:id==='community_civic_staff'?'community_civic_room':'street';
   if(!expected||expected!==scene())return '居民在其他场景。';
   if(!Number.isFinite(a.x)||!Number.isFinite(a.y)||Math.hypot(a.x-p.x,a.y-p.y)>1.65)return '走近这位居民再聊吧。';
   if(typeof W.blockedStatic!=='function')return '当前场景缺少可见通路检查。';
   for(let t=.15;t<1;t+=.15)if(W.blockedStatic(p.x+(a.x-p.x)*t,p.y+(a.y-p.y)*t,.04))return '隔着墙或家具无法交谈。';
   return null;
  }
  function legacy(id){const ps=SP.game.ps;if(id==='community_resident_lin')return ps.communitySocial?.lin||null;if(id==='vendor')return {familiarity:ps.aff?.vendor||0,lastGreetingDay:ps.socialEncounterVendorDay??-1};return null;}
  // Vendor stays candidate-local: formal save schema rejects extra ps keys.
  function greet(id,day){if(id!=='community_resident_lin')return;const ps=SP.game.ps;ps.communitySocial=ps.communitySocial||{};const s=ps.communitySocial.lin||(ps.communitySocial.lin={familiarity:0,lastGreetingDay:-1,greetings:0,lastSharedDay:-1});if(s.lastGreetingDay!==day){s.lastGreetingDay=day;s.greetings++;s.familiarity=Math.min(100,s.familiarity+1);}}
  return {now:()=>SP.clock.abs(),presence,baselineFamiliar:id=>id==='vendor'?SP.game.ps.aff?.vendor||0:0,legacy:id=>id==='vendor'?null:legacy(id),greet,
   pressure(id){const min=SP.clock.min;if(id==='office')return min>=420&&min<600||min>=1020&&min<1140;if(id==='vendor')return SP.vendorDay?.atWork?SP.vendorDay.atWork():min>=360&&min<600;if(id==='community_civic_staff')return true;if(id==='community_resident_lin')return ['morning-errands','afternoon-errands','rain-home'].includes(SP.communityRoutines?.state()?.phase);return false;},
   routine(id){if(id!=='vendor'||presence(id))return null;const a=actor(id),s=SP.vendorDay?.speechFor?.(a);return typeof s?.text==='string'?s.text:null;},
   direction(id,place){const map={公交:'公共地图上可以查看社区公交站，具体到站以车辆为准。',地铁:'井槐里有地铁入口，进站请按实际导引。'};if(!['community_resident_lin','vendor','office'].includes(id))return null;return map[place]||null;},
   captureLegacy(){return copy(SP.game.ps.communitySocial?.lin||null);},
   validLegacy(v){return v===null||plain(v)&&Object.keys(v).every(k=>['familiarity','lastGreetingDay','greetings','lastSharedDay'].includes(k))&&Number.isInteger(v.familiarity)&&v.familiarity>=0&&v.familiarity<=100&&Number.isInteger(v.lastGreetingDay)&&v.lastGreetingDay>=-1&&Number.isInteger(v.greetings)&&v.greetings>=0&&Number.isInteger(v.lastSharedDay)&&v.lastSharedDay>=-1;},
   restoreLegacy(v){if(v!==null){SP.game.ps.communitySocial=SP.game.ps.communitySocial||{};SP.game.ps.communitySocial.lin=copy(v);}else if(SP.game.ps.communitySocial)delete SP.game.ps.communitySocial.lin;}
  };
 }
 function attach(SP,options={}){
  const adapter=liveAdapter(SP),engine=create(adapter);let panel=null,timer=null,controller=null,requestSerial=0,composing=false,textarea=null,sendButton=null,cancelButton=null,status=null,chat=null,identity=null,contextLabel=null,fitViewport=null,sessionOwner=null,sessionActor=null,memoryView=false,memoryButton=null,composer=null;
  function capture(){return {candidate:'social-encounters-2',at:adapter.now(),state:engine.snapshot(),legacyLin:adapter.captureLegacy()};}
  function restore(packet){if(!keys(packet,['candidate','at','state','legacyLin'])||!['social-encounters-1','social-encounters-2'].includes(packet.candidate)||packet.at!==adapter.now()||!validate(packet.state,packet.at)||!adapter.validLegacy(packet.legacyLin)||JSON.stringify(packet.legacyLin)!==JSON.stringify(adapter.captureLegacy()))return {ok:false,reason:'请在对应主存档时间恢复有效交谈快照。'};return engine.restore(packet.state);}
  function finishPanel(){controller?.abort();controller=null;if(timer){root.clearInterval(timer);timer=null;}if(panel)panel.hidden=true;if(fitViewport){root.visualViewport?.removeEventListener('resize',fitViewport);root.visualViewport?.removeEventListener('scroll',fitViewport);fitViewport=null;}textarea?.blur();composing=false;}
  adapter.onSessionEnd=finishPanel;
  function close(){engine.end();}
  const when=at=>`第${Math.floor(at/1440)+1}天 ${String(Math.floor(at%1440/60)).padStart(2,'0')}:${String(Math.floor(at%60)).padStart(2,'0')}`;
  function render(){
   const s=engine.current();if(!s||!chat)return;const d=root.document;chat.replaceChildren();
   const stamp=d.createElement('div');stamp.className='social-date';stamp.textContent=when(adapter.now())+' · '+(memoryView?'对方记得的近况':'街头交谈');chat.append(stamp);
   if(memoryView){
    const note=d.createElement('p');note.className='social-memory-note';note.textContent='这些是你曾亲口告诉对方的近况。想更正，可以在交谈时说出现在的想法。';chat.append(note);
    const rows=engine.memories?.(s.target)||[];
    if(!rows.length){const empty=d.createElement('p');empty.className='social-memory-note';empty.textContent='还没有留下可回想的近况。';chat.append(empty);}
    for(const m of rows){const card=d.createElement('div'),label=d.createElement('small'),text=d.createElement('p');card.className='social-memory-card';label.textContent=when(m.at)+' · 你告诉了'+profiles[s.target].name;text.textContent=m.text;card.append(label,text);chat.append(card);}
   }
   else
   for(const m of engine.snapshot().transcript.filter(m=>m.target===s.target).slice(-32)){
    const row=d.createElement('div'),avatar=d.createElement('span'),content=d.createElement('div'),label=d.createElement('small'),body=d.createElement('p');
    row.className='social-message '+m.role;avatar.className='social-avatar';avatar.textContent=m.role==='user'?'你':profiles[m.target].name.slice(0,1);avatar.setAttribute('aria-hidden','true');content.className='social-message-content';
    label.textContent=(m.role==='user'?'你':profiles[m.target].name)+' · '+when(m.at)+(m.role==='assistant'&&m.mode==='ai'?' · AI':'');body.textContent=m.text;
    content.append(label,body);row.append(avatar,content);chat.append(row);
   }
   identity.textContent=profiles[s.target].name;
   if(contextLabel)contextLabel.textContent=profiles[s.target].role+' · '+(adapter.pressure(s.target)?'正在忙碌':'愿意聊聊')+' · 熟悉度 '+engine.familiar(s.target);
   if(composer)composer.hidden=memoryView;
   if(memoryButton){memoryButton.textContent=memoryView?'返回交谈':'往来';memoryButton.setAttribute('aria-pressed',String(memoryView));}
   chat.scrollTop=memoryView?0:chat.scrollHeight;
  }
  function safeReply(text){return typeof text==='string'&&text.trim()&&text.length<=LIMITS.text&&!/转账|转给|付款|支付|赠送|送给你|送你|给(?:了)?你.{0,12}(?:钱|元|块|物|钥匙)|解锁|完成(?:任务|维修)|判刑|办结|修好|治好|杀死|我(?:的)?家在|我住在|身份证|银行卡|门牌|具体住址|熟悉度.{0,8}(?:增|加|提升)|我们(?:是|已经是)(?:恋人|情侣|好友)|来我家|爱上你|我也爱你|\d{2,}.{0,3}(?:元|块|号楼|室)|<[^>]+>/.test(text);}
  async function sendText(input){
   if(composing)return {ok:false,reason:'请先完成中文输入。'};const r=engine.prepareText(input??textarea?.value??'',`ui:${requestSerial++}`);if(!r.ok){if(status&&!r.ended)status.textContent=r.reason||'会话已结束。';return r;}
   if(textarea)textarea.value='';render();if(!engine.current())return r;const canAI=r.allowAI&&SP.phoneAI?.settings?.().enabled&&typeof SP.phoneAI?.sendEncounter==='function';if(sendButton)sendButton.disabled=true;if(cancelButton)cancelButton.hidden=!canAI;chat?.setAttribute('aria-busy',String(!!canAI));if(status)status.textContent=canAI?'对方正在回应 · 可取消等待':'本地规则回应';let reply=r.text,mode='local',owned=null;
   if(canAI){owned=new AbortController();controller=owned;try{const response=await SP.phoneAI.sendEncounter({actorId:r.target,input:r.input,history:engine.snapshot().transcript.filter(m=>m.target===r.target).slice(-12),context:{time:when(adapter.now()),scene:SP.world.interior?SP.world.sceneId:'street',familiarity:engine.familiar(r.target),busy:adapter.pressure(r.target)},constraint:{stance:'open',intent:r.intent,localReply:r.text},signal:owned.signal});if(response.mode==='ai'&&safeReply(response.reply)){reply=response.reply;mode='ai';}else mode='fallback';}catch(_){mode='fallback';}finally{if(controller===owned)controller=null;}}
   const result=engine.completeText(r,reply,mode);if(!result.ok)return result;render();if(sendButton)sendButton.disabled=false;if(cancelButton)cancelButton.hidden=true;chat?.setAttribute('aria-busy','false');if(status)status.textContent=mode==='ai'?'AI回应':mode==='fallback'?'暂用本地回应':'本地回应';return {...result,rule:r};
  }
  function handleKey(e){if(e.target===textarea&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&e.keyCode!==229&&!composing){e.preventDefault();sendText();}}
  function show(id){
   if(SP.cityIncidents?.holdsActor(id))return {ok:false,reason:'对方正在接受现场处置，暂不能闲聊。'};
   if(SP.game.busy()||SP.phone?.isOpen())return {ok:false,reason:'请先结束活动或关闭手机。'};const result=engine.begin(id);if(!result.ok||!root.document)return result;const d=root.document;sessionOwner=SP.game.ps;sessionActor=SP.actors.list.find(a=>a.id===id);
   if(!panel){
    const style=d.createElement('style');style.textContent=`
#social-encounter[hidden]{display:none}
#social-encounter{position:fixed;inset:0;z-index:1600;background:rgba(10,18,23,.66);display:grid;place-items:center;font:15px/1.55 system-ui,-apple-system,"Microsoft YaHei",sans-serif;color:#25323d;color-scheme:light}
#social-encounter *{box-sizing:border-box}
#social-encounter section{width:min(480px,calc(100vw - 24px));height:min(704px,calc(var(--social-vh,100dvh) - 24px));min-height:180px;display:flex;flex-direction:column;overflow:hidden;background:#f2f4f5;border:1px solid #fff4;border-radius:22px;box-shadow:0 24px 80px #0006;touch-action:pan-y}
#social-encounter header{display:flex;flex-wrap:wrap;align-items:center;gap:12px;flex-shrink:0;padding:20px;background:#20363e;color:#fff;border-bottom:3px solid #c5a66f}
#social-encounter .social-heading{flex:1;min-width:0}
#social-encounter .social-eyebrow{color:#d6c29d;letter-spacing:3px;font-size:10px;font-weight:700;margin-bottom:4px}
#social-encounter h2{font-size:21px;line-height:1.35;margin:0 0 5px;font-weight:700;letter-spacing:1px}
#social-encounter .social-context{display:block;color:#d5e0e2;font-size:11px;line-height:1.5}
#social-encounter button{min-height:44px;margin:0;border:0;border-radius:12px;padding:10px 16px;font:600 14px/1.3 system-ui;cursor:pointer;touch-action:manipulation;transition:background .15s}
#social-encounter button:focus-visible,#social-encounter textarea:focus-visible{outline:3px solid #b58232;outline-offset:2px}
#social-encounter button:disabled{opacity:.55;cursor:wait}
#social-encounter .social-exit{align-self:flex-start;color:#edf4f5;background:#ffffff14;border:1px solid #ffffff36;padding:8px 13px}
#social-encounter .social-header-actions{display:flex;flex-wrap:wrap;gap:6px;align-self:flex-start}
#social-encounter .social-header-actions button{padding:8px 10px;font-size:12px}
#social-encounter .social-memory-note{font-size:13px;line-height:1.8;color:#536771;margin:6px 0 20px}
#social-encounter .social-memory-card{background:#fff;border:1px solid #cbd8dd;border-left:3px solid #bc9f69;border-radius:10px;margin:12px 0;padding:14px}
#social-encounter .social-memory-card small{font-size:11px;color:#61737b}
#social-encounter .social-memory-card p{font-size:15px;color:#25323d;line-height:1.7;margin:6px 0 0}
#social-encounter .social-compose[hidden]{display:none}
#social-chat{flex:1;min-height:48px;overflow-y:auto;overscroll-behavior:contain;padding:16px 18px 22px;background:#e9eef0;scrollbar-width:thin;scrollbar-color:#a7b9bd transparent}
#social-encounter .social-date{text-align:center;color:#586970;font-size:11px;letter-spacing:.5px;margin:0 0 18px}
#social-encounter .social-message{display:flex;align-items:flex-start;gap:8px;margin:0 0 19px}
#social-encounter .social-message.user{flex-direction:row-reverse}
#social-encounter .social-avatar{display:grid;place-items:center;width:30px;height:34px;flex:0 0 30px;margin-top:23px;border-radius:10px;background:#ded1b9;color:#554329;font-size:13px;font-weight:700;border:1px solid #c9bba2}
#social-encounter .user .social-avatar{background:#d0e0e3;color:#23434d;border-color:#b3cbcf}
#social-encounter .social-message-content{min-width:0;max-width:calc(100% - 64px)}
#social-encounter .social-message small{display:block;font-size:10px;color:#56676f;margin:0 2px 5px;line-height:1.7}
#social-encounter .user small{text-align:right}
#social-encounter .social-message p{margin:0;padding:12px 14px;border-radius:3px 15px 15px;background:#fff;border:1px solid #ccd7dc;box-shadow:0 2px 3px #233b4407;color:#25323d;font-size:15px;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere}
#social-encounter .social-message.user p{color:#fff;background:#315967;border-color:#315967;border-radius:15px 3px 15px 15px}
#social-encounter .social-compose{flex-shrink:0;padding:12px 16px 16px;background:#fafbf9;border-top:1px solid #d2dcdf}
#social-encounter .social-quick{display:flex;gap:7px;margin-bottom:10px}
#social-encounter .social-quick button{flex:1;padding:8px 10px;min-height:36px;color:#38515a;background:#edf1f1;border:1px solid #d7e0e1;border-radius:9px;font-size:12px;font-weight:500}
#social-encounter .social-quick button:hover{background:#dfe9eb}
#social-encounter form{display:flex;gap:9px;align-items:flex-end}
#social-encounter textarea{display:block;flex:1;min-width:0;width:100%;height:74px;min-height:48px;max-height:110px;resize:none;background:#fff;color:#25323d;border:1px solid #acbec5;border-radius:12px;padding:11px 12px;font:16px/1.5 system-ui}
#social-encounter textarea::placeholder{color:#64777f}
#social-encounter .social-send{height:48px;min-width:60px;padding:10px 13px;background:#315967;color:#fff;box-shadow:0 2px 5px #31596725}
#social-encounter .social-send:hover{background:#244653}
#social-encounter .social-status-row{display:flex;gap:8px;align-items:center;justify-content:space-between;margin-top:8px;min-height:18px}
#social-status{font-size:10px;line-height:1.5;color:#5d7078}
#social-encounter .social-cancel{min-height:32px;padding:5px 8px;font-size:11px;color:#734821;background:#f2e6d7}
#social-encounter .social-cancel[hidden]{display:none}
#social-encounter[data-compact="true"] section{width:min(680px,calc(100vw - 20px));height:calc(var(--social-vh) - 12px);border-radius:15px}
#social-encounter[data-compact="true"] header{padding:9px 15px;gap:8px}
#social-encounter[data-compact="true"] .social-eyebrow{display:none}
#social-encounter[data-compact="true"] h2{font-size:17px;margin-bottom:2px}
#social-encounter[data-compact="true"] .social-quick{display:none}
#social-encounter[data-compact="true"] .social-compose{padding:8px 12px}
#social-encounter[data-compact="true"] textarea{height:48px}
#social-encounter[data-compact="true"] .social-status-row{margin-top:4px}
#social-encounter[data-compact="true"] #social-chat{padding:10px 15px}
`;d.head.appendChild(style);
    panel=d.createElement('div');panel.id='social-encounter';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','街头交谈');d.body.appendChild(panel);for(const ev of ['touchstart','touchmove','touchend'])panel.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
   }
   panel.replaceChildren();const section=d.createElement('section'),header=d.createElement('header'),heading=d.createElement('div'),eyebrow=d.createElement('div');heading.className='social-heading';eyebrow.className='social-eyebrow';eyebrow.textContent='街 巷 · 相 谈';identity=d.createElement('h2');contextLabel=d.createElement('small');contextLabel.className='social-context';heading.append(eyebrow,identity,contextLabel);
   memoryView=false;const exit=d.createElement('button');exit.className='social-exit';exit.textContent='结束';exit.onclick=close;memoryButton=d.createElement('button');memoryButton.className='social-exit';memoryButton.textContent='往来';memoryButton.onclick=()=>{memoryView=!memoryView;render();};const actions=d.createElement('div');actions.className='social-header-actions';actions.append(memoryButton);if(SP.socialExchange){const exchange=d.createElement('button');exchange.className='social-exit';exchange.textContent='赠物借还';exchange.onclick=()=>{close();const r=SP.socialExchange.show(id);if(!r.ok)SP.toast?.(r.reason);};actions.append(exchange);}actions.append(exit);header.append(heading,actions);
   chat=d.createElement('div');chat.id='social-chat';chat.setAttribute('role','log');chat.setAttribute('aria-live','polite');
   composer=d.createElement('div');composer.className='social-compose';const quick=d.createElement('div');quick.className='social-quick';quick.setAttribute('aria-label','快捷话题');
   for(const [label,text]of [['问候','你好'],...(id==='vendor'?[['当前安排','您接下来有什么安排？']]:[]),['问路','地铁入口在哪里？'],['闲聊','你平时喜欢做什么？'],['道歉','不好意思，刚才打扰了']]){const b=d.createElement('button');b.textContent=label;b.onclick=()=>sendText(text);quick.appendChild(b);}
   const form=d.createElement('form');textarea=d.createElement('textarea');textarea.id='social-input';textarea.maxLength=LIMITS.text;textarea.placeholder='想和对方说点什么？';textarea.setAttribute('aria-label','对居民说的话');textarea.addEventListener('compositionstart',()=>composing=true);textarea.addEventListener('compositionend',()=>composing=false);
   sendButton=d.createElement('button');sendButton.className='social-send';sendButton.type='submit';sendButton.textContent='发送';form.append(textarea,sendButton);form.onsubmit=e=>{e.preventDefault();sendText();};
   const statusRow=d.createElement('div');statusRow.className='social-status-row';status=d.createElement('div');status.id='social-status';status.setAttribute('role','status');status.textContent=SP.phoneAI?.settings?.().enabled?'AI回应已启用 · 无法连接时使用本地回应':'本地交谈 · 无需联网';cancelButton=d.createElement('button');cancelButton.className='social-cancel';cancelButton.type='button';cancelButton.textContent='取消等待';cancelButton.hidden=true;cancelButton.onclick=()=>controller?.abort();statusRow.append(status,cancelButton);composer.append(quick,form,statusRow);section.append(header,chat,composer);panel.appendChild(section);panel.hidden=false;
   fitViewport=()=>{if(panel){const height=root.visualViewport?.height||root.innerHeight;panel.style.setProperty('--social-vh',height+'px');panel.style.height=height+'px';panel.style.top=(root.visualViewport?.offsetTop||0)+'px';panel.style.bottom='auto';panel.dataset.compact=String(height<420);}};fitViewport();root.visualViewport?.addEventListener('resize',fitViewport);root.visualViewport?.addEventListener('scroll',fitViewport);SP.touchRelease?.();root.dispatchEvent?.(new Event('blur'));render();timer=root.setInterval(()=>{if(!engine.current()||adapter.presence(id))close();},250);return result;
  }
  function holdsActor(id){if(engine.current()?.target!==id||sessionOwner!==SP.game.ps||SP.actors.list.find(a=>a.id===id)!==sessionActor)return false;const a=sessionActor,p=SP.player,area=SP.world.interior?SP.world.sceneId:'street';if(!a||a.hidden||a.dead||a.injured||a.restrained||a.vehicle||!p||p.level==='roof'||SP.cbd?.active||SP.metroActive||root.FushiMetro?.core?.active||Math.hypot(a.x-p.x,a.y-p.y)>1.65)return false;const expected=id==='vendor'&&SP.vendorDay?SP.vendorDay.presence?.()?.area:id==='community_resident_lin'?SP.communityRoutines?.state()?.scene:id==='community_civic_staff'?'community_civic_room':'street';if(expected!==area||typeof SP.world.blockedStatic!=='function')return false;for(let t=.15;t<1;t+=.15)if(SP.world.blockedStatic(p.x+(a.x-p.x)*t,p.y+(a.y-p.y)*t,.04))return false;return true;}
  return {engine,adapter,capture,restore,show,close,sendText,handleKey,cancel:()=>controller?.abort(),isOpen:()=>!!engine.current(),holdsActor,safeReply};
 }
 const api={create,attach,liveAdapter,validate,normalize,fresh,profiles,intents,classify,LIMITS};root.SocialEncounters=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
