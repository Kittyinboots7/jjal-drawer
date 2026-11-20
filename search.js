import {speechActForQuery,isBasicReplyQuery,positiveActForQuery,dailyExpressionForQuery} from './usage-query.js?v=daily-pack-1';
export const intents=[
 {name:'사과 · 미안함',triggers:['미안','죄송','용서','사과하'],words:['미안','죄송','잘못','용서','사과'],context:'실수하거나 늦어서 상대에게 미안하다고 사과한다.'},
 {name:'확인 · 동의',triggers:['알겠','알았','확인','오케이','동의'],words:['알겠','알았','확인','오케이','인정','동의','접수','끄덕'],context:'상대의 말을 확인했고 알겠다고 답한다. 동의하고 받아들인다.'},
 {name:'인사 · 안부',triggers:['인사','안녕','잘자','잘 가','굿모닝','좋은 아침'],words:['안녕','인사','잘자','잘가','굿모닝','반가','좋은 아침'],context:'반갑게 인사하거나 안부를 묻고, 잘 자라고 밤인사를 전한다.'},
 {name:'위로 · 공감',triggers:['위로','토닥','괜찮아','괜찮다고','다독'],words:['괜찮','위로','힘내','토닥','걱정마','울지마','잘될'],context:'속상한 상대의 마음을 공감하고 괜찮다며 다정하게 위로한다.'},
 {name:'생일 축하',triggers:['생일','생신','생축','버스데이'],words:['생일','생신','생축','생일파티','생일축하','축하'],context:'생일을 맞은 사람에게 축하를 전한다. 생일파티, 케이크, 생일 축하 인사.'},
 {name:'화남 · 불쾌함',triggers:['화남','화나','화난','화내','화가','분노','짜증','빡침','불쾌','기분 나','열받'],words:['화남','화나','화난','분노','짜증','정색','경고','삐짐','그만','단호'],context:'화가 났고 기분이 좋지 않다. 상대에게 내 마음을 표현하고 싶다.'},
 {name:'출근 · 지침',triggers:['출근','월요일','퇴근','야근','피곤','일하기','회사','출근하기','직장','지쳤','지침','번아웃'],words:['피곤','퇴근','출근','지침','힘들','고달','직장','회사','쉬고','휴식','체념','하기싫','하기 싫','일하기'],context:'월요일 출근하기 싫고 피곤하다. 일하고 퇴근하고 싶은 직장인, 지친 하루.'},
 {name:'지각 · 타박',triggers:['지각','늦었','늦어','늦는','기다리','기다렸','꼽주','꼽을','한마디'],words:['지각','늦','기다','시간','또','타박','한심','어이없','황당','정색','짜증'],context:'친구가 또 지각해서 기다리다 지쳤다. 어이없고 한심해서 장난스럽게 타박한다.'},
 {name:'생색 · 자신감',triggers:['생색','잘했','잘난','뿌듯','자랑','자신감','내가 좀','칭찬'],words:['자랑','자신감','뿌듯','잘했','최고','대단','생색','당당','능청','거만','잘난','천재'],context:'별거 아닌 일을 해놓고 생색낸다. 내가 좀 잘했다고 뿌듯하게 자랑하고 칭찬받고 싶다.'},
 {name:'축하 · 응원',triggers:['축하','응원','합격','생일','성공','화이팅','파이팅'],words:['축하','응원','박수','화이팅','파이팅','최고','굿','기쁨','하트','대단'],context:'친구의 좋은 소식을 진심으로 축하하고 응원한다. 잘했다며 박수를 보낸다.'},
 {name:'황당 · 어이없음',triggers:['어이없','어이가','황당','말도 안','뭐라는','어처구니','이게 뭔','실화'],words:['어이없','황당','당황','정색','한심','뭐','충격'],context:'말도 안 되는 소리에 황당하고 어이가 없다. 지금 이게 무슨 상황인지 모르겠다.'},
 {name:'만족 · 감탄',triggers:['맛있','맛집','대만족','만족','최고','감탄','맛난'],words:['맛있','맛집','먹방','먹는','만족','최고','감탄','행복','엄지','굿'],context:'맛있는 음식을 먹고 대만족했다. 맛집 후기에서 최고라며 감탄한다.'},
 {name:'거절 · 싫음',triggers:['거절','안 할','안하고','안 하고','부탁','그만해'],words:['거절','싫어','안해','아니','안돼','그만','정색','부담'],context:'부탁을 거절하고 싶다. 싫다고, 그만하라고 단호하게 말한다.'},
 {name:'슬픔 · 서러움',triggers:['슬퍼','슬프','서러','우울','울고','눈물','외로','속상'],words:['슬픔','서러움','눈물','오열','울먹','우울','시무룩','서럽'],context:'속상하고 서러워서 울고 싶다. 우울하고 슬픈 마음을 전한다.'},
 {name:'웃음 · 놀림',triggers:['웃기','웃겨','웃긴','놀리','놀려','ㅋㅋ','장난','비웃'],words:['웃음','폭소','웃겨','놀림','장난','비웃음','능청','깐족'],context:'친구에게 장난치고 놀리고 싶다. 웃겨서 빵 터지고 능청스럽게 웃는다.'},
 {name:'고마움',triggers:['고마','감사'],words:['고마','감사','땡큐','큰절'],context:'도움을 받아 고맙고 감사하다. 진심으로 고마운 마음을 전한다.'}
];
export function getIntents(q){const c=queryContext(q);return intents.filter(i=>i.triggers.some(t=>q.includes(t))&&!(c.genuine&&i.name==='웃음 · 놀림'))}
export function keywordScore(d,q){
 if(!q.trim())return 0;const t=(d.title+' '+d.tags.join(' ')+' '+(d.captionText||'')+' '+(d.searchAliases||[]).join(' ')).toLowerCase();let score=0;const daily=dailyExpressionForQuery(q);if(daily&&d.dailyExpressions?.includes(daily))score+=20;const positive=positiveActForQuery(q);if(positive&&d.responseActs?.includes(positive))score+=18;const act=speechActForQuery(q);if(act&&d.useCases?.includes(act))score+=12;if(isBasicReplyQuery(q)){if(d.basicReplyTokens?.includes(q.trim().replace(/[.!~\s]/g,'')))score+=10;else if(d.basicReplyTokens?.some(t=>['네','넵','예','응','웅'].includes(t)))score+=8;else if(d.basicReplyTokens?.length)score+=5;}if(/생일|생신|생축|버스데이|birthday/i.test(q)&&(/생일|생신|생축|버스데이|birthday/i.test(t)||d.eventTags?.includes('birthday')))score+=20;
 const stop=new Set(['너무','싶어','하고','싶다','진심으로','친구가','친구','별거','아닌','그냥','조금','나는','내가','정말']);
 const tokens=q.toLowerCase().split(/[^가-힣a-z0-9]+/).filter(a=>a.length>1&&!stop.has(a));
 for(const a of tokens){if(t.includes(a))score+=5;else if(a.length>=3&&t.includes(a.slice(0,-1)))score+=2}
 for(const i of getIntents(q)){score+=Math.min(i.words.filter(w=>t.includes(w)).length,4)*4}
 for(const anchor of ['생일','생신','생축','출근','퇴근','지각','생색','축하','응원','감사','맛있','피곤','자랑'])if(q.includes(anchor)&&t.includes(anchor))score+=12;
 if(/진심|진짜.*축하/.test(q)&&/비꼼|비꼬|반어|번어|비웃|조롱/.test(t))score-=18;
 return score;
}
export function cosine(a,b){let v=0;for(let i=0;i<a.length;i++)v+=a[i]*b[i];return v}

// These are conservative metadata-based suitability estimates, not scene-level annotations.
export function queryContext(q){
 const relation=/상사|부장|팀장|사장|선배|직장.*윗사람/.test(q)?'상사':/고객|거래처|손님/.test(q)?'고객':/연인|남친|여친|남자친구|여자친구|애인/.test(q)?'연인':/친구|절친|단톡/.test(q)?'친구':/동료|동기/.test(q)?'동료':/부모|엄마|아빠|가족/.test(q)?'가족':null;
 const noJoke=/장난(?:이|은)?\s*아니|장난\s*말고|장난치지|농담(?:이|은)?\s*아니/.test(q);
 const polite=/정중|공손|예의|존댓|부드럽게|상처\s*안|기분\s*안\s*나쁘/.test(q);
 const playful=!noJoke&&/장난|농담|화난\s*척|화내는\s*척|능청|귀엽게|가볍게\s*놀|웃으면서|웃기게|ㅋㅋ/.test(q);
 const sarcastic=/비꼬|비꼼|반어|조롱|영혼\s*없/.test(q);
 const genuine=noJoke||/진심|진짜\s*(?:화|불쾌|짜증|싫|기분)|정말\s*(?:화|불쾌)|단호|진지|선을\s*넘|불쾌/.test(q);
 const tone=polite?'정중하게':playful?'장난스럽게':sarcastic?'비꼬며':genuine?'진지하게':null;
 const anger=/화남|화나|화내|화난|화가|분노|짜증|빡침|불쾌|기분\s*나|열받/.test(q);
 return{relation,tone,anger,polite,playful,sarcastic,genuine,formal:polite||((relation==='상사'||relation==='고객')&&!playful&&!sarcastic)};
}
export function mediaProfile(d){
 const t=d.title+' '+(d.tags||[]).join(' ');
 return{
  anger:/화남|화나|화난|분노|짜증|빡침|열받|불쾌|버럭|삐짐|너\s*나빠|호박고구마/.test(t),
  playful:/장난|능청|깐족|뻔뻔|킹받|떼쓰기|얄미|삐짐|흥칫|애교|메롱|찡긋|윙크|너\s*나빠|아주\s*내일|굿모닝\s*같은|호박고구마/.test(t),
  sarcastic:/비꼼|비꼬|반어|번어|비웃|조롱|멋지다\s*연진|멋지다연진|멋지다.*연진아/.test(t),
  firm:/경고|단호|정색|불쾌|싸늘|무표정|거절|한계임박|멈추|그만해|그만\s*여기/.test(t),
  polite:/죄송|감사|고맙|공손|정중|존댓|그만해요|멈추세요|됐어요|잘못했습니까|안\s*맞는\s*것/.test(t),
  insult:/한심|꼴값|꺼져|닥쳐|비난|조롱|욕설|욕하는|재수\s*없/.test(t),
  violent:/위협|악담|물려|저주|파멸귀|죽여|죽일|때려|패버|쳐버|뺨|한\s*방에\s*훅|발차기|총쏘|난사/.test(t)||d.strong,
 };
}
export function contextAdjustment(d,q){
 const eventText=d.title+' '+(d.tags||[]).join(' ')+' '+(d.captionText||'');
 if(/생일|생신|생축|버스데이|birthday/i.test(q)&&!(/생일|생신|생축|버스데이|birthday/i.test(eventText)||d.eventTags?.includes('birthday')))return{allowed:false,score:0};
 const daily=dailyExpressionForQuery(q);if(daily&&!d.dailyExpressions?.includes(daily))return{allowed:false,score:0};
 const positive=daily?null:positiveActForQuery(q);if(positive&&!d.responseActs?.includes(positive))return{allowed:false,score:0};
 const act=daily||positive?null:speechActForQuery(q);if(act&&!d.useCases?.includes(act))return{allowed:false,score:0};if(!daily&&!positive&&isBasicReplyQuery(q)&&(!d.basicReplyTokens?.length||d.basicReplyQuestion||d.basicReplyNegative))return{allowed:false,score:0};
 const c=queryContext(q),p=mediaProfile(d);let n=/생일|생신|생축|버스데이|birthday/i.test(q)?(d.birthdayUse==='greeting'?.6:d.birthdayUse==='celebration'?.4:d.eventTags?.includes('birthday')?.1:0):0;
 if(daily)n+=(3-(d.dailyOrder?.[daily]??2))*.03;
 if(c.anger&&!p.anger&&!p.firm)return{allowed:false,score:0};
 if(c.playful){
  if(p.violent)return{allowed:false,score:0};
  n+=p.playful?.38:-.12;n-=p.firm&&!p.playful?.26:0;n-=p.insult?.3:0;
 }
 if(c.genuine&&!c.playful){
  if(daily)n+=(3-(d.dailyOrder?.[daily]??2))*.03;
 if(c.anger&&!p.anger&&!(c.polite&&p.polite))return{allowed:false,score:0};
  if(p.playful||p.violent||p.sarcastic)return{allowed:false,score:0};
  n+=p.firm?.24:0;n-=p.playful?.4:0;n-=p.insult?.25:0;n-=p.violent?.3:0;
 }
 if(c.sarcastic)n+=p.sarcastic?.32:0;
 if(c.formal){
  if(c.anger&&c.polite&&!p.polite)return{allowed:false,score:0};
  if(p.violent||p.insult||p.sarcastic)return{allowed:false,score:0};
  n+=p.polite?.28:0;n-=p.playful?.22:0;
 }
 // Never infer that a friend wants banter solely from their relationship.
 return{allowed:true,score:n};
}
export function contextLabel(q){const c=queryContext(q);return[c.relation?`${c.relation}에게`:null,c.tone].filter(Boolean).join(' · ')}
export function expandedQuery(q){
 const c=queryContext(q);
 const context=getIntents(q).filter(i=>!(c.genuine&&i.name==='웃음 · 놀림')).map(i=>i.context);
 // Context expansion must preserve the user's requested tone, especially for lateness.
 const safe=context.map(t=>c.playful?t.replace('진심으로','장난스럽게'):c.genuine||c.formal?t.replace('장난스럽게','진지하게').replace('단호하게','정중하고 단호하게'):t);
 return[q,contextLabel(q),...safe].join(' ');
}
export function rankItems(items,q,{vectors=null,queryVector=null}={}){
 const seen=new Set();
 return items.map(d=>{
  const kw=keywordScore(d,q),sem=queryVector&&vectors?cosine(queryVector,vectors.subarray(d.index*384,(d.index+1)*384)):0,fit=contextAdjustment(d,q);
  const base=queryVector?sem*.5+Math.min(Math.max(kw,0)/30,1)*.5:Math.min(Math.max(kw,0)/30,1);
  const compact=text=>text.normalize('NFKC').toLowerCase().replace(/[\s.!?~]+/g,'');
  const exactAlias=(d.searchAliases||[]).some(alias=>compact(alias)===compact(q));
  return{d,score:base+fit.score+(exactAlias?.24:0),kw,sem,allowed:fit.allowed};
 }).filter(x=>x.allowed&&(queryVector?(x.kw>0||x.sem>.52):x.kw>0)).sort((a,b)=>b.score-a.score).filter(x=>{const key=x.d.duplicateOf||x.d.shortId;if(seen.has(key))return false;seen.add(key);return true}).slice(0,80);
}
