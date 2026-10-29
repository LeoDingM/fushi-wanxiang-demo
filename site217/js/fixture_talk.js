/* Canonical, time-qualified retelling of a remembered visual snapshot. */
(function(root){'use strict';const SP=root.SP,M=root.ResidentMemoryModel;if(!SP?.createAttributedTalk||!M||SP.fixtureTalk)return;const stamp=at=>'第'+(Math.floor(at/1440)+1)+'天'+String(Math.floor(at%1440/60)).padStart(2,'0')+':'+String(Math.floor(at%60)).padStart(2,'0'),state=s=>({on:'亮着',off:'熄着',open:'开着',closed:'关着'})[s];
 function source(ps,at){const s=ps?.residentMemory;if(!s)return[];if(s.version<6)return[];const facts=SP.residentPerception?.facts(s,at);if(!facts||!Array.isArray(s.memories))return null;return facts.filter(f=>s.memories.some(m=>m.actorId===f.actorId&&m.sourceKey===f.key)).map(f=>({id:f.sourceId,actorId:f.actorId,at:f.at,kind:'seen_fixture',objectId:f.objectId,state:f.state,availableAt:s.memories.find(m=>m.actorId===f.actorId&&m.sourceKey===f.key).observedAt}));}
 const context=f=>SP.scenes?.shared_home_flat?.objects?.find(o=>o.id===f.objectId)?.name||f.objectId;
 const base=SP.createAttributedTalk({stateKey:'fixtureTalk',domain:'residentPerception',tokenField:'fixtureToken',source,seedOwnerKnowledge:true,statementAllowed:(f,n,rows)=>Number.isFinite(f.availableAt)&&f.availableAt<=n.at&&!rows.some(r=>r.actorId===n.geometry.listeners.find(a=>a.personId!=='player')?.personId&&r.objectId===f.objectId&&r.id>=f.id&&r.at<n.at),threadKey:f=>f.objectId,kindLabel:()=> '门灯当时所见',contextLabel:context,topic:'合租屋门灯（所见陈述）',firsthandLabel:'本人所见后陈述',ackText:'我听到了。这是当时的状态，后来有没有变化还要重新看见。',sentence(f,speaker,parent,name){const seen=stamp(f.at)+'在栖和合租屋看见'+context(f)+state(f.state);return parent?'我是听'+name(parent.speakerId)+'转述的，最初是'+name(f.actorId)+'在'+seen+'；现在怎样我不知道。':'我在'+seen+'；这是当时所见，现在怎样我不知道。';}});
 // A remembered uncertainty can initiate a question to its actual previous speaker.
 // The reply retains the kernel's canonical fact/token; asking alone admits nothing.
 const G=SP.game;let pending=new WeakMap();const where=()=>SP.place?.where?.()||(SP.world.interior?SP.world.sceneId:'street');
 function propose(actors){if(!Array.isArray(actors)||actors.length!==2||!G.ps||SP.progressSave?.restoring)return null;
  for(const asker of actors){if(!M||!['daily_wen','daily_shen'].includes(asker?.id))continue;const other=actors.find(a=>a!==asker),s=G.ps.residentMemory,at=SP.clock.abs(),facts=s&&SP.residentMemory?.sources(G.ps,at);if(!facts||!SP.residentMemory.prepare(s,at))continue;
   for(const g of M.clarification(s,asker.id,facts)){if(!g.heard||!['unverified','heard_later','conflict'].includes(g.status))continue;const heard=facts.find(f=>f.key===g.heard.sourceKey);if(heard?.speakerId!==other?.id)continue;
    const reply=base.propose(actors,{thread:g.objectId,speakerId:other.id});if(!reply||reply.lines[0].speaker!==other.id)continue;const o=SP.scenes.shared_home_flat.objects.find(o=>o.id===g.objectId),question={speaker:asker.id,text:'之前听你提到'+(o?.name||'合租屋门灯')+'，想确认是你亲眼看见的，还是听别人说的？后来又看过吗？'},answer=reply.lines[0],token=reply.fixtureToken;
    pending.set(token,{owner:G.ps,scene:where(),asker,other,question:{...question},answer:{...answer},memoryId:g.heard.memoryId,sourceKey:g.heard.sourceKey,session:null});return{topic:'合租屋门灯（询问消息来源）',fixtureToken:token,lines:[question,answer,{speaker:asker.id,text:'谢谢说明。我把你这次的陈述和之前的消息分开记；这仍不等于我亲眼核实了现在的情况。'},{speaker:other.id,text:'对，只能说明我刚才说出的来源和时刻；状态后来变了，也不能直接说之前有人说谎。'}]};
   }
  }return base.propose(actors);
 }
 function onSpoken({session,turnIndex}={}){const token=session?.fixtureToken,t=token&&pending.get(token);if(!t)return turnIndex===0?base.onSpoken({session,turnIndex}):{ok:false,ignored:true};const fail=()=>({ok:false,reason:'求证问答尚未实际完成，或原现场与依据已变化。'}),s=G.ps?.residentMemory,m=s?.memories?.find(m=>m.id===t.memoryId);
  if(t.owner!==G.ps||t.scene!==where()||session.owner!==t.owner||session.scene!==t.scene||SP.progressSave?.restoring||!session.actors?.includes(t.asker)||!session.actors.includes(t.other)||!m||m.actorId!==t.asker.id||m.sourceKey!==t.sourceKey||session.spoken?.[0]?.speaker!==t.question.speaker||session.spoken[0].text!==t.question.text)return fail();
  if(turnIndex===0&&session.spoken.length===1){if(t.session&&t.session!==session)return fail();t.session=session;return{ok:true,questionOnly:true};}
  if(turnIndex!==1||t.session!==session||session.spoken.length!==2||session.spoken[1].speaker!==t.answer.speaker||session.spoken[1].text!==t.answer.text)return fail();
  return base.onSpoken({session:{...session,spoken:[session.spoken[1]]},turnIndex:0});
 }
 SP.fixtureTalk={...base,propose,onSpoken,resetRuntime(){pending=new WeakMap();base.resetRuntime();},cancelQuestions(){pending=new WeakMap();}};

})(window);
