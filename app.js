import {getIntents,keywordScore,cosine,contextAdjustment,contextLabel,expandedQuery,rankItems} from './search.js?v=everyday-3';
import {homeSuggestions} from './home-picks.js?v=everyday-1';
const $=s=>document.querySelector(s),grid=$('#grid');
let catalog=[],catalogMeta,mediaKind='photo',query='',page=0,showSaved=false,ranked=[],vectors,worker,aiReady=false,currentVector=null,requestId=0,currentItem;
let baseCatalogCount=0,extraVectors=[];
let favorites;try{favorites=new Set(JSON.parse(localStorage.getItem('jjal-favorites')||'[]'))}catch{favorites=new Set()}
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),2600)}
function saveFav(){try{localStorage.setItem('jjal-favorites',JSON.stringify([...favorites]))}catch{toast('이 브라우저에서는 보관함을 저장할 수 없어요.')}$('#savedCount').textContent=favorites.size}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function safeURL(u){try{const v=new URL(u,window.location.href);return(v.protocol==='https:'||(v.origin===window.location.origin&&v.protocol==='http:'))?v.href:''}catch{return ''}}
function kindOf(d){return d.animationStatus==='animated'?'motion':d.animationStatus==='static'?'photo':'unknown'}
function eligible(d){return kindOf(d)===mediaKind&&(!$('#gentle').checked||!d.strong)&&(!showSaved||favorites.has(d.shortId))}
function shuffled(items){
 const copy=[...items];
 for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}
 return copy;
}
function readSession(key,fallback){try{return JSON.parse(sessionStorage.getItem(key))??fallback}catch{return fallback}}
function writeSession(key,value){try{sessionStorage.setItem(key,JSON.stringify(value))}catch{}}
let homeIds=[],homeRemaining=readSession('jjal-home-remaining',[]),lastHome=readSession('jjal-home-last',null);
if(!Array.isArray(homeRemaining))homeRemaining=[];
function pickHome(){
 const pool=catalog.filter(d=>kindOf(d)==='photo'&&!d.strong&&homeSuggestions.some(h=>h.id===d.shortId));
 const ids=new Set(pool.map(d=>d.shortId));
 homeRemaining=homeRemaining.filter(id=>ids.has(id));
 if(!homeRemaining.length)homeRemaining=shuffled([...ids]);
 const different=homeRemaining.findIndex(id=>{
  const suggestion=homeSuggestions.find(h=>h.id===id),item=pool.find(d=>d.shortId===id);
  return id!==lastHome?.id&&suggestion.group!==lastHome?.group&&item.show!==lastHome?.show;
 });
 const next=different>=0?different:Math.max(0,homeRemaining.findIndex(id=>id!==lastHome?.id));
 const id=homeRemaining.splice(next,1)[0];
 homeIds=id?[id]:[];
 if(id){lastHome={id,group:homeSuggestions.find(h=>h.id===id).group,show:pool.find(d=>d.shortId===id).show};writeSession('jjal-home-last',lastHome)}
 writeSession('jjal-home-remaining',homeRemaining);
}
$('#shuffleHome').onclick=()=>{pickHome();rank()};
let aiStarted=false,resultsTouched=false;
function rank(){
 if(query)ranked=rankItems(catalog.filter(eligible),query,{vectors,queryVector:currentVector});
 else if(showSaved)ranked=catalog.filter(eligible).map(d=>({d}));
 else{if(!homeIds.length)pickHome();ranked=homeIds.map(id=>catalog.find(d=>d.shortId===id)).filter(Boolean).map(d=>({d}))}
 if(page>=ranked.length)page=0;
 render();
}
function render(){
 $('#saved').classList.toggle('selected',showSaved);$('#saved').setAttribute('aria-pressed',String(showSaved));
 $('#resultTitle').textContent=showSaved?'모아둔 짤':query?'이 말에 어울리는 짤':'오늘 꺼내보기 좋은 짤';
 const home=!query&&!showSaved;
 document.body.classList.toggle('has-results',!home);
 $('.results').classList.toggle('home',home);
 $('#shuffleHome').hidden=!home;$('.filters').hidden=home;$('.tools').hidden=home||showSaved;
 $('#resultTitle').textContent=home?'오늘 써먹을 짤':showSaved?'모아둔 짤':'이 말에 어울리는 짤';
 $('#resultInfo').textContent=home?'오늘 써먹을 추천 짤 한 장':showSaved?`${ranked.length}개의 짤을 모아뒀어요`:`“${query}” 검색 결과`;
  grid.replaceChildren();for(const {d} of ranked.slice(page,page+(home?1:3))){
  const card=document.createElement('article');card.className='card';
  const preview=document.createElement('button');preview.className='card-preview';preview.setAttribute('aria-label',d.title+' 자세히 보기');
  preview.innerHTML=`<div class="image-box"><img src="${escapeHTML(safeURL(d.imageUrl))}" loading="lazy" decoding="async" alt="${escapeHTML(d.title)}">${!home&&ranked[page]?.d.shortId===d.shortId?'<span class="recommended">추천</span>':''}</div>`;
  preview.querySelector('img').onerror=function(){this.alt='짤을 불러오지 못했어요. 원본을 확인해 주세요.'};preview.onclick=()=>openDetail(d);card.append(preview);
  const body=document.createElement('div');body.className='card-body';const show=document.createElement('span');show.className='show';show.textContent=d.show;body.append(show);
  const action=document.createElement(kindOf(d)==='motion'?'a':'button');action.className='quick-copy';
  if(kindOf(d)==='motion'){action.href=safeURL(d.imageUrl);action.target='_blank';action.rel='noopener';action.textContent='원본 보기'}else{action.textContent='복사';action.onclick=()=>copyItem(d)}
  action.setAttribute('aria-label',(d.captionText||d.situationSummary||d.show)+' '+action.textContent);body.append(action);
  if(home){
   const suggestion=homeSuggestions.find(h=>h.id===d.shortId);
   const copy=document.createElement('div');copy.className='home-copy';
   const title=document.createElement('h3');title.className='usage-title';title.textContent=suggestion.title;copy.append(title);
   const description=document.createElement('p');description.className='usage-description';description.textContent=suggestion.description;copy.append(description);
   copy.append(body);card.append(copy);
  }else card.append(body);card.onpointerenter=()=>{resultsTouched=true};card.onfocusin=()=>{resultsTouched=true};grid.append(card);
 }
 $('#empty').hidden=ranked.length>0||home;$('#more').hidden=home||ranked.length<=page+3;$('#previous').hidden=home||page===0;saveFav()
}
function openDetail(d){currentItem=d;$('#detailMedia').replaceChildren();let img=new Image();img.src=safeURL(d.imageUrl);img.alt=d.title;$('#detailMedia').append(img);$('#detailShow').textContent=d.show+' · '+d.genre;$('#detailTitle').textContent=d.title.replace(/움짤|이미지/g,'').trim();$('#original').href=safeURL(d.originalImageUrl||d.imageUrl);$('#source').href=safeURL(d.sourceUrl);$('#source').textContent=(d.sourceProvider||'짤봇')+' 출처 보기';$('#favorite').textContent=favorites.has(d.shortId)?'♥ 모아뒀어요':'♡ 모아두기';$('#detailHint').textContent=kindOf(d)==='motion'?'움직임을 유지하려면 원본을 저장해 주세요.':'길게 누르거나 원본을 열어 저장할 수 있어요.';$('#copyImage').textContent='복사';$('#detail').showModal()}
$('#favorite').onclick=()=>{if(!currentItem)return;const id=currentItem.shortId;favorites.has(id)?favorites.delete(id):favorites.add(id);$('#favorite').textContent=favorites.has(id)?'♥ 모아뒀어요':'♡ 모아두기';rank()};
$('#copyImage').onclick=()=>{if(currentItem)copyItem(currentItem)};
async function copyItem(d){
 resultsTouched=true;
 try{
  if(!navigator.clipboard?.write||!window.ClipboardItem)throw Error('not supported');
  // Start clipboard write during the user gesture, including on Safari.
  const blobPromise=(async()=>{let r=await fetch(d.imageUrl);if(!r.ok)throw Error('image');const blob=await r.blob();const bitmap=await createImageBitmap(blob),canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;canvas.getContext('2d').drawImage(bitmap,0,0);return await new Promise(resolve=>canvas.toBlob(resolve,'image/png'))})();
  await navigator.clipboard.write([new ClipboardItem({'image/png':blobPromise})]);toast(d.type.includes('gif')?'첫 장면을 복사했어요. 움직임을 유지하려면 원본을 저장해 주세요.':'복사했어요. 카톡이나 블로그에 붙여넣어 보세요.');
 }catch{try{await navigator.clipboard.writeText(d.imageUrl);toast('바로 복사하기 어려워 원본 링크를 복사했어요.')}catch{toast('원본 열기를 눌러 이미지를 저장해 주세요.')}}
};
for(const dialog of document.querySelectorAll('dialog')){dialog.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){let r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}})}
$('#about').onclick=()=>$('#aboutDialog').showModal();
$('#saved').onclick=()=>{showSaved=!showSaved;if(showSaved){query='';$('#query').value='';currentVector=null;requestId++}$('#saved').classList.toggle('selected',showSaved);$('#saved').setAttribute('aria-pressed',String(showSaved));page=0;rank()};
$('#more').onclick=()=>{page+=3;render()};$('#previous').onclick=()=>{page=Math.max(0,page-3);render()};
for(const b of document.querySelectorAll('[data-kind]'))b.onclick=()=>{mediaKind=b.dataset.kind;document.querySelectorAll('[data-kind]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});page=0;rank()};
$('#gentle').onchange=()=>{page=0;rank()};
function search(q){resultsTouched=false;query=q.trim().slice(0,240);$('#query').value=query;page=0;showSaved=false;currentVector=null;requestId++;rank();if(query&&!aiStarted){aiStarted=true;initAI()}if(query&&aiReady){$('#aiStatus').textContent=contextLabel(query)||'상황을 이해하는 중…';worker.postMessage({type:'query',query:expandedQuery(query),id:requestId})}else if(!aiReady&&query){$('#aiStatus').textContent=contextLabel(query)||'어울리는 짤을 찾는 중'}}
$('#searchForm').onsubmit=e=>{e.preventDefault();search($('#query').value)};
for(const b of document.querySelectorAll('[data-query]'))b.onclick=()=>search(b.dataset.query);
async function initAI(){
 try{const res=await fetch('./vectors.bin');if(!res.ok)throw Error('vectors');const baseVectors=new Float32Array(await res.arrayBuffer());if(baseVectors.length!==baseCatalogCount*384||extraVectors.length!==(catalog.length-baseCatalogCount)*384)throw Error('vector mismatch');vectors=new Float32Array(catalog.length*384);vectors.set(baseVectors);vectors.set(extraVectors,baseVectors.length);
 worker=new Worker('./ai-worker.js',{type:'module'});
 worker.onmessage=({data})=>{if(data.type==='progress'){$('#aiStatus').textContent=contextLabel(query)||'추천을 다듬는 중'}
 else if(data.type==='ready'){aiReady=true;$('#aiStatus').textContent=contextLabel(query)||'추천을 다듬는 중';if(query)worker.postMessage({type:'query',query:expandedQuery(query),id:requestId})}
 else if(data.type==='result'&&data.id===requestId){currentVector=new Float32Array(data.vector);$('#aiStatus').textContent=contextLabel(query)||'어울리는 짤을 찾았어요';if(!resultsTouched)rank()}
 else if(data.type==='error'){$('#aiStatus').textContent='상황 키워드 검색 사용 중';console.warn('Semantic search unavailable:',data.error)}};
 worker.onerror=()=>{$('#aiStatus').textContent='상황 키워드 검색 사용 중'};worker.postMessage({type:'init'});
 }catch{$('#aiStatus').textContent='상황 키워드 검색 사용 중'}
}
try{const r=await fetch('./catalog.json');if(!r.ok)throw Error();catalogMeta=await r.json();baseCatalogCount=catalogMeta.items.length;
let items=catalogMeta.items;
try{
 const response=await fetch('./everyday-replies.json?v=2');if(!response.ok)throw Error('supplement');
 const extra=await response.json();
 if(!Array.isArray(extra.items)||!Array.isArray(extra.overrides)||!Array.isArray(extra.vectors)||extra.vectors.length!==extra.items.length||extra.vectors.some(v=>!Array.isArray(v)||v.length!==384||v.some(n=>!Number.isFinite(n))))throw Error('supplement vectors');
 const known=new Set(items.map(d=>d.shortId));if(extra.items.some(d=>known.has(d.shortId)))throw Error('supplement duplicate');
 const overrides=new Map(extra.overrides.map(d=>[d.shortId,d]));
 items=items.map(d=>({...d,...overrides.get(d.shortId)})).concat(extra.items);extraVectors=extra.vectors.flat();
}catch(error){console.warn('Extra everyday replies unavailable:',error)}
catalog=items.map((d,index)=>({...d,index}));$('#catalogInfo').textContent=`${catalog.length.toLocaleString()}개 · ${new Set(catalog.map(d=>d.show)).size}개 프로그램 · 수집일 ${new Date(catalogMeta.collectedAt).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})}`;rank()}catch{$('#resultInfo').textContent='짤 목록을 불러오지 못했어요. 잠시 후 새로고침해 주세요.'}

// One clickable suggestion at a time keeps the search entry point simple.
const examples=[
 '친구 말에 넵 하고 가볍게 답하고 싶어',
 '월요일 출근하기 너무 싫어',
 '도와준 친구에게 진짜 고맙다고 하고 싶어',
 '점심시간만 기다리는 중이야',
 '미루던 일을 끝낸 친구를 칭찬하고 싶어',
 '집에 오자마자 소파에 쓰러졌어',
 '친구에게 장난스럽게 화난 척하고 싶어',
 '생일인 친구에게 능청스럽게 축하하고 싶어',
 '친구가 알려준 꿀팁에 감사하고 싶어',
 '친구가 또 지각해서 한마디 하고 싶어',
 '같이 하는 일이 힘들지만 서로 응원하고 싶어',
 '친구 음식이 맛있어 보여서 한 입 얻어먹고 싶어',
 '별거 아닌 일 해놓고 생색내고 싶어',
 '작은 실수를 해서 바로 미안하다고 하고 싶어',
 '오늘은 커피가 두 배로 필요해',
 '친구의 놀러 가자는 말에 신나게 찬성하고 싶어',
 '친구 말에 살짝 삐졌다고 장난치고 싶어',
 '퇴근하고 집에 가고 싶어',
 '할 일이 많은데 머리가 멍해',
 '말로 하기 쑥스러워서 하트로 마음을 전하고 싶어',
 '맛있는 거 먹고 세상 행복할 때',
 '맞는 말이라 당연하지 하고 동의하고 싶어',
 '친구에게 진짜 불쾌하다고 말하고 싶어',
 '자야 하는데 잠이 안 와',
 '주말에 친구들이랑 놀 생각에 신났어',
 '황당해서 말이 안 나와',
 '힘든 친구에게 괜찮은지 물어보고 싶어',
 '아무것도 안 하고 쉬고 싶어',
 '친구의 좋은 소식에 박수쳐 주고 싶어',
 '뭘 해도 잘 안 풀려서 한숨 나와',
 '친구의 웃긴 말에 빵 터졌어',
 '도와준 친구에게 고마워서 감동했어',
 '친구에게 장난으로 새침하게 거절하고 싶어',
 '다 같이 해보자고 기운을 북돋우고 싶어',
 '별일 없는데 오늘 기분이 좋아',
 '부탁을 정중하게 거절하고 싶어',
 '친구의 제안에 콜! 하고 답하고 싶어',
 '좋아, 그 계획대로 진행시켜',
 '그거 완전 내 스타일이라고 말하고 싶어',
 '망설이는 친구에게 가보자고 하고 싶어'
];
let exampleRemaining=readSession('jjal-example-remaining',[]),lastExample=readSession('jjal-example-last',''),examplePaused=false;
if(!Array.isArray(exampleRemaining))exampleRemaining=[];
const exampleButton=$('#exampleQuery');
function nextExample(){
 exampleRemaining=exampleRemaining.filter(q=>examples.includes(q));
 if(!exampleRemaining.length)exampleRemaining=shuffled(examples);
 if(exampleRemaining.length>1&&exampleRemaining[0]===lastExample)[exampleRemaining[0],exampleRemaining[1]]=[exampleRemaining[1],exampleRemaining[0]];
 lastExample=exampleRemaining.shift();exampleButton.textContent=lastExample;
 writeSession('jjal-example-remaining',exampleRemaining);writeSession('jjal-example-last',lastExample);
}
nextExample();
exampleButton.onclick=()=>search(exampleButton.textContent);
exampleButton.onpointerenter=()=>{examplePaused=true};
exampleButton.onpointerleave=()=>{examplePaused=false};
setInterval(()=>{
 if(document.hidden||examplePaused||document.activeElement===exampleButton||(document.activeElement===$('#query')&&$('#query').value.trim()))return;
 const next=()=>{nextExample();exampleButton.classList.remove('changing')};
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){next();return}
 exampleButton.classList.add('changing');setTimeout(()=>{if(document.activeElement===exampleButton||examplePaused){exampleButton.classList.remove('changing');return}next()},160);
},4500);
