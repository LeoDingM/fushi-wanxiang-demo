/* Lossless archival codec for portable chronicle snapshots. */
(function(root){
 'use strict';
 const M=typeof module!=='undefined'&&module.exports?require('./life_chronicle_model.js'):root.LifeChronicleModel;
 const FORMAT='fushi-chronicle-compact',FIELDS=['id','at','kind','source','summary','facts','parent'],SEGMENT_SIZE=512;
 // Codec budgets in JSON UTF-16 characters, including unknown fields.
 // Expanded input may exceed the native save budget; compact output may not.
 const MAX_EXPANDED_CHARS=20_000_000,MAX_COMPACT_CHARS=5_000_000;
 const cloneValue=value=>value!==null&&typeof value==='object'?M.copy(value):value;
 const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const exact=(x,keys)=>object(x)&&Object.keys(x).sort().join(',')===keys.slice().sort().join(',');
 // Accidental corruption detection only; this is not an authenticity signature.
 const hash=text=>{let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return (h>>>0).toString(16).padStart(8,'0');};
 function boundedText(value,max){const text=JSON.stringify(value);if(typeof text!=='string'||text.length>max)throw new Error('归档超过字符预算');return text;}
 const payload=a=>({format:a.format,version:a.version,segmentSize:a.segmentSize,count:a.count,meta:a.meta,segments:a.segments});
 function checked(s,at){if(!Number.isFinite(at)||at<0||at>1e12||!M.validate(s,at))throw new Error('人生档案无效');}
 function encode(s,at){
  boundedText(s,MAX_EXPANDED_CHARS);checked(s,at);const meta=M.copy(Object.fromEntries(Object.entries(s).filter(([key])=>key!=='events'))),segments=[];
  for(let start=0;start<s.events.length;start+=SEGMENT_SIZE){
   const events=s.events.slice(start,start+SEGMENT_SIZE),rows=events.map(e=>{
    const row=FIELDS.map(k=>cloneValue(e[k])),extras=Object.fromEntries(Object.entries(e).filter(([k])=>!FIELDS.includes(k)));
    if(Object.keys(extras).length)row.push(M.copy(extras));return row;
   });
   segments.push({firstId:events[0].id,lastId:events.at(-1).id,count:rows.length,checksum:hash(JSON.stringify(rows)),rows});
  }
  const encoded={format:FORMAT,version:1,segmentSize:SEGMENT_SIZE,count:s.events.length,meta,segments};
  encoded.checksum=hash(boundedText(encoded,MAX_COMPACT_CHARS));boundedText(encoded,MAX_COMPACT_CHARS);return encoded;
 }
 function decode(encoded,at){
  boundedText(encoded,MAX_COMPACT_CHARS);
  if(!exact(encoded,['format','version','segmentSize','count','meta','segments','checksum'])||encoded.format!==FORMAT||encoded.version!==1||encoded.segmentSize!==SEGMENT_SIZE||!Number.isSafeInteger(encoded.count)||encoded.count<0||encoded.count>100000||!object(encoded.meta)||Object.hasOwn(encoded.meta,'events')||!Array.isArray(encoded.segments)||encoded.segments.length!==Math.ceil(encoded.count/SEGMENT_SIZE))throw new Error('归档结构无效');
  if(encoded.checksum!==hash(JSON.stringify(payload(encoded))))throw new Error('归档整体校验失败');
  const s=M.copy(encoded.meta),events=[];
  for(let i=0;i<encoded.segments.length;i++){
   const seg=encoded.segments[i],count=Math.min(SEGMENT_SIZE,encoded.count-i*SEGMENT_SIZE),firstId=i*SEGMENT_SIZE+1;
   if(!exact(seg,['firstId','lastId','count','checksum','rows'])||seg.firstId!==firstId||seg.lastId!==firstId+count-1||seg.count!==count||!Array.isArray(seg.rows)||seg.rows.length!==count||seg.checksum!==hash(JSON.stringify(seg.rows)))throw new Error('归档分段缺失或损坏');
   for(let j=0;j<seg.rows.length;j++){
    const row=seg.rows[j];if(!Array.isArray(row)||![7,8].includes(row.length)||row[0]!==firstId+j||row.length===8&&(!object(row[7])||Object.keys(row[7]).some(k=>FIELDS.includes(k))))throw new Error('归档事件元组无效');
    const e=Object.fromEntries(FIELDS.map((k,index)=>[k,cloneValue(row[index])]));
    if(row.length===8)for(const [k,v] of Object.entries(row[7]))Object.defineProperty(e,k,{value:M.copy(v),enumerable:true,writable:true,configurable:true});
    events.push(e);
   }
  }
  s.events=events;boundedText(s,MAX_EXPANDED_CHARS);checked(s,at);return s;
 }
 const api={encode,decode};root.ChronicleArchiveCodec=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
