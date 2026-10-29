/* A portable library loan, backed by a real inventory item and completion-based reading. */
(function(SP){
 'use strict';
 const G=SP.game,W=SP.world,C=SP.clock,R=G.rules,ROOM='community_reading_room',ACTION='community_book_read';
 const books={city_walks:'街巷漫步',garden_notes:'阳台花园笔记',riverside_stories:'江畔故事'};
 const shelves={reading_shelf_north_1:['city_walks',[1.1,4.85]],reading_shelf_north_5:['garden_notes',[5,4.85]],reading_shelf_east_1:['riverside_stories',[6.8,4.55]]};
 const scene=SP.scenes[ROOM];
 for(const o of scene.objects)if(shelves[o.id]){o.interact='community_bookshelf';o.reach=shelves[o.id][1];o.name='书架 · '+books[shelves[o.id][0]];}
 for(const [id,title]of Object.entries(books))R.data.items['book_'+id]={label:'借阅：《'+title+'》',price:0,gift:false};
 R.data.actions[ACTION]={label:'阅读借来的书',place:'any',minutes:20,effects:{},text:'读完了一节，夹好书签。'};
 let reading=null;
 const open=()=>C.min>=480&&C.min<1260;
 function state(){return G.ps.communityLibrary||(G.ps.communityLibrary={loan:null,returns:0,completedBooks:[],lastBorrowDay:-1});}
 function status(){
   const l=state().loan;if(!l)return '目前没有借阅中的书。每次可借一本，借期七天。';
   const left=l.dueAt-C.abs();
   return `《${books[l.bookId]}》 · 已读 ${l.readMinutes}/60 分钟 · ${left<0?'已到归还日期，请交给顾老师':'距归还约 '+Math.ceil(left/1440)+' 天'}。`;
 }
 function accessible(o){return W.interior&&W.sceneId===ROOM&&o===W.byId[o.id]&&Math.hypot(SP.player.x-W.reachPt(o)[0],SP.player.y-W.reachPt(o)[1])<=2.4&&open();}
 function borrow(id,o){
   if(!accessible(o))return '请在开放时间到顾老师柜台办理借阅。';
   const s=state();if(s.loan)return '先把手上的书归还，再借下一本。';
   if(s.lastBorrowDay===C.day)return '今天已经借过一本了，明天再来挑下一本吧。';
   s.loan={bookId:id,borrowedAt:C.abs(),dueAt:C.abs()+7*1440,readMinutes:0};s.lastBorrowDay=C.day;
   R.addItem(G.ps,'book_'+id,1);G.hud();W.logEvent('借阅《'+books[id]+'》，七天内归还');
   return '顾老师：这本《'+books[id]+'》借给你。可以在这里或家中书桌旁阅读，七天后记得带回来。';
 }
 function giveBack(o){
   if(!accessible(o))return '请在开放时间到顾老师柜台归还。';
   const s=state(),l=s.loan;if(!l)return '你没有需要归还的书。';
   if(G.ps.items['book_'+l.bookId]!==1)return '请把借阅的书带回来。';
   const title=books[l.bookId];delete G.ps.items['book_'+l.bookId];s.loan=null;s.returns++;G.hud();W.logEvent('归还《'+title+'》');
   return '顾老师：收到了，《'+title+'》已归还。谢谢爱护书籍。';
 }
 function read(o){
   const l=state().loan;if(!l)return '先到顾老师柜台借一本书吧。';
   if(G.busy())return '先完成手头的事。';
   if(W.sceneId===ROOM&&(!open()||C.min+20>1260))return '距离闭馆不足二十分钟，明天再读吧。';
   if(l.readMinutes>=60)return '这本书已经读完，可以带回柜台归还。';
   const result=G.start(ACTION,o);
   if(G.activity?.id===ACTION)reading={owner:G.ps,loan:l,scene:W.sceneId,finish:C.abs()+20,activity:G.activity};
   return result;
 }
 function counter(o){
   if(!open())return '顾老师已经下班，借还书时间为 08:00–21:00。';
   const s=state(),opts=Object.entries(books).map(([id,title])=>({id:'borrow_'+id,label:'借阅《'+title+'》 · 七天',ok:!s.loan&&s.lastBorrowDay!==C.day,reason:s.loan?'先归还在借书籍':'今日已借阅',fn:()=>borrow(id,o)}));
   opts.push({id:'library_return',label:'归还借阅书籍',ok:!!s.loan,reason:'没有在借书籍',fn:()=>giveBack(o)},
    {id:'library_status',label:'查看借阅记录',ok:true,fn:()=>status()+` 已归还 ${state().returns} 本，读完 ${state().completedBooks.length} 本。`});
   G.openMenu(o,opts);return null;
 }
 const use0=G.use,action0=G.actionFor,update0=G.update,switch0=G.switchScene;
 G.actionFor=function(o,kind){
   if(o&&kind==='use'&&W.interior){
     if(W.sceneId===ROOM&&shelves[o.id])return{label:'查看《'+books[shelves[o.id][0]]+'》',do:'game'};
     if(W.sceneId===ROOM&&o.interact==='community_librarian')return{label:'顾老师 · 借书 / 还书',do:'game'};
     if(state().loan&&(o.interact==='community_reading'||W.sceneId==='room_2f02'&&o.id==='desk'))return{label:W.sceneId==='room_2f02'?'书桌 · 阅读 / 电脑':'阅读借来的书',do:'game'};
   }
   return action0.call(this,o,kind);
 };
 G.use=function(o){
   if(W.interior&&o){
     if(W.sceneId===ROOM&&shelves[o.id])return '《'+books[shelves[o.id][0]]+'》：想带回家读，可以到顾老师柜台登记。'+status();
     if(W.sceneId===ROOM&&o.interact==='community_librarian')return counter(o);
     if(state().loan&&(o.interact==='community_reading'||W.sceneId==='room_2f02'&&o.id==='desk')){
       const opts=[{id:ACTION,label:'读《'+books[state().loan.bookId]+'》 · 20 分钟',ok:state().loan.readMinutes<60,reason:'这本书已经读完',fn:()=>read(o)},
        {id:'library_status',label:'查看阅读进度与归还日期',ok:true,fn:status}];
       if(W.sceneId==='room_2f02')opts.push({id:'library_home_computer',label:'使用电脑',ok:true,fn:()=>use0.call(G,o)});
       G.openMenu(o,opts);return null;
     }
   }
   return use0.call(this,o);
 };
 function cancel(){if(reading&&G.activity===reading.activity){G.activity=null;C.ff=null;}reading=null;}
 G.switchScene=function(){cancel();return switch0.apply(this,arguments);};
 G.update=function(){
   const result=update0.apply(this,arguments),a=reading;
   if(a&&(!G.activity||G.activity!==a.activity)){
     reading=null;
     if(a.owner===G.ps&&a.loan===state().loan&&a.scene===W.sceneId&&C.abs()>=a.finish-.01){
       a.loan.readMinutes=Math.min(60,a.loan.readMinutes+20);
       if(a.loan.readMinutes===60&&!state().completedBooks.includes(a.loan.bookId)){
         state().completedBooks.push(a.loan.bookId);SP.toast('读完了《'+books[a.loan.bookId]+'》，可以归还给顾老师了。');
       }
     }
   }
   return result;
 };
 SP.communityLibrary={state,books,shelves,status};
})(window.SP);
