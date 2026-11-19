import {getIntents,keywordScore,cosine,contextAdjustment,contextLabel,expandedQuery,rankItems} from './search.js';
import {homeSuggestions} from './home-picks.js';
const $=s=>document.querySelector(s),grid=$('#grid');
let catalog=[],catalogMeta,mediaKind='photo',query='',page=0,showSaved=false,ranked=[],vectors,worker,aiReady=false,currentVector=null,requestId=0,currentItem;
let favorites;try{favorites=new Set(JSON.parse(localStorage.getItem('jjal-favorites')||'[]'))}catch{favorites=new Set()}
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),2600)}
function saveFav(){try{localStorage.setItem('jjal-favorites',JSON.stringify([...favorites]))}catch{toast('이 브라우저에서는 보관함을 저장할 수 없어요.')}$('#savedCount').textContent=favorites.size}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function safeURL(u){try{const v=new URL(u,window.location.href);return(v.protocol==='https:'||(v.origin===window.location.origin&&v.protocol==='http:'))?v.href:''}catch{return ''}}
function kindOf(d){return d.animationStatus==='animated'?'motion':d.animationStatus==='static'?'photo':'unknown'}
function eligible(d){return kindOf(d)===mediaKind&&(!$('#gentle').checked||!d.strong)&&(!showSaved||favorites.has(d.shortId))}
let homeIds=[];
function pickHome(){
 let previous=homeIds;
 if(!previous.length){try{previous=JSON.parse(sessionStorage.getItem('jjal-home-ids')||'[]')}catch{previous=[]}}
 const pool=catalog.filter(d=>kindOf(d)==='photo'&&!d.strong&&!previous.includes(d.shortId)&&homeSuggestions.some(h=>h.id===d.shortId));
 const chosen=pool[Math.floor(Math.random()*pool.length)];
 homeIds=chosen?[chosen.shortId]:[];
 try{sessionStorage.setItem('jjal-home-ids',JSON.stringify(homeIds))}catch{}
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
 try{const res=await fetch('./vectors.bin');if(!res.ok)throw Error('vectors');vectors=new Float32Array(await res.arrayBuffer());if(vectors.length!==catalog.length*384)throw Error('vector mismatch');
 worker=new Worker('./ai-worker.js',{type:'module'});
 worker.onmessage=({data})=>{if(data.type==='progress'){$('#aiStatus').textContent=contextLabel(query)||'추천을 다듬는 중'}
 else if(data.type==='ready'){aiReady=true;$('#aiStatus').textContent=contextLabel(query)||'추천을 다듬는 중';if(query)worker.postMessage({type:'query',query:expandedQuery(query),id:requestId})}
 else if(data.type==='result'&&data.id===requestId){currentVector=new Float32Array(data.vector);$('#aiStatus').textContent=contextLabel(query)||'어울리는 짤을 찾았어요';if(!resultsTouched)rank()}
 else if(data.type==='error'){$('#aiStatus').textContent='상황 키워드 검색 사용 중';console.warn('Semantic search unavailable:',data.error)}};
 worker.onerror=()=>{$('#aiStatus').textContent='상황 키워드 검색 사용 중'};worker.postMessage({type:'init'});
 }catch{$('#aiStatus').textContent='상황 키워드 검색 사용 중'}
}
try{const r=await fetch('./catalog.json');if(!r.ok)throw Error();catalogMeta=await r.json();catalog=catalogMeta.items.map((d,index)=>({...d,index}));$('#catalogInfo').textContent=`${catalog.length.toLocaleString()}개 · ${new Set(catalog.map(d=>d.show)).size}개 프로그램 · 수집일 ${new Date(catalogMeta.collectedAt).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})}`;rank()}catch{$('#resultInfo').textContent='짤 목록을 불러오지 못했어요. 잠시 후 새로고침해 주세요.'}

// One clickable suggestion at a time keeps the search entry point simple.
const examples=['친구에게 장난스럽게 화난 척하고 싶어','친구에게 진짜 불쾌하다고 말하고 싶어','월요일 출근하기 너무 싫어','친구가 또 지각해서 한마디 하고 싶어','별거 아닌 일 해놓고 생색내고 싶어','진심으로 축하하고 응원하고 싶어','맛있는 거 먹고 세상 행복할 때','황당해서 말이 안 나와','부탁을 정중하게 거절하고 싶어','퇴근하고 집에 가고 싶어'];
let exampleIndex=0,examplePaused=false;
const exampleButton=$('#exampleQuery');
exampleButton.onclick=()=>search(exampleButton.textContent);
exampleButton.onpointerenter=()=>{examplePaused=true};
exampleButton.onpointerleave=()=>{examplePaused=false};
setInterval(()=>{
 if(document.hidden||examplePaused||document.activeElement===exampleButton||(document.activeElement===$('#query')&&$('#query').value.trim()))return;
 const next=()=>{exampleIndex=(exampleIndex+1)%examples.length;exampleButton.textContent=examples[exampleIndex];exampleButton.classList.remove('changing')};
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){next();return}
 exampleButton.classList.add('changing');setTimeout(()=>{if(document.activeElement===exampleButton||examplePaused){exampleButton.classList.remove('changing');return}next()},160);
},4500);
