export function isBasicReplyQuery(q){return /^(?:네|넵|예|응|웅|ㅇㅇ|ㅇㅋ|오케이|ok|okay)[.!~ㅋㅎ\s]*$/i.test(q.trim())}
// Match the communicative act before falling back to broad emotion similarity.
export function speechActForQuery(q){
 if(/^(?:네|넵|예|응|웅|ㅇㅇ|ㅇㅋ|오케이|ok|okay)[.!~ㅋㅎ\s]*$/i.test(q.trim())||/(?:네|넵|응)(?:라고|이라고|하고)\s*(?:대답|답|말)/.test(q))return 'acknowledgement';
 if(/고마|감사|땡큐/.test(q))return 'thanks';
 if(/미안|죄송|사과(?:하|를|하고|할)|용서/.test(q))return 'apology';
 if(/위로|토닥|다독|괜찮(?:다고|아)|울지.?마/.test(q))return 'comfort';
 if(/축하|생일|생신|생축|버스데이/.test(q))return 'celebration';
 if(/응원|수고|고생|힘내|칭찬/.test(q))return 'encouragement';
 if(/알겠|알았|확인했|확인했다고|확인$|오케이|동의/.test(q))return 'acknowledgement';
 if(/인사|안녕|잘.?자|잘.?가|굿모닝|좋은.?아침/.test(q))return 'greeting';
 if(/거절|선.?긋|그만하라고|그만해/.test(q))return 'refusal';
 if(!/우리.?집|집이|집에/.test(q)&&/사랑|보고.?싶|애정|하트/.test(q))return 'affection';
 return null;
}

// Separate a proposal acceptance from a plain acknowledgement or a happy reaction.
export function positiveActForQuery(q){
 if(/안\s*좋|좋지\s*않|싫|별로|거절|불쾌|진행.*(?:말|않)|하지\s*마/.test(q))return null;
 if(/진행\s*시켜|진행하자|진행해|가보자고|가즈아|렛츠고|레츠고|해보자|시작하자|출발하자/.test(q))return 'launch';
 if(/^(?:콜|코+올|오케이|ㅇㅋ|ok|okay)[.!~ㅋㅎ\s]*$/i.test(q.trim())||/콜(?:하고|이라고|!|\s*하고)|제안.{0,15}(?:수락|찬성)|(?:수락|찬성).{0,15}제안|신나게\s*찬성/.test(q))return 'accept';
 if(/^(?:좋아|좋다|좋네|좋아요|굿|대만족)[.!~ㅋㅎ\s]*$/.test(q.trim())||/마음에\s*(?:들|든)|내\s*스타일|긍정적으로\s*(?:답|대답)/.test(q))return 'approval';
 return null;
}

const dailyExpressions=[["late-sorry",["늦어서 미안","늦어서미안","지각해서 미안","늦어 미안"]],["go-home",["집 가고 싶어","집에 가고 싶어","집가고싶어","집에가고싶어","퇴근하고 싶어"]],["good-work",["고생했어","고생 많았어","수고했어","수고하셨습니다","고생했어요"]],["because-you",["덕분이야","네 덕분","너 덕분","덕분이에요"]],["birthday",["생일 축하","생일축하","생축","생신 축하","생일"]],["goodnight",["잘 자","잘자","잘 자요","굿나잇","잘자요"]],["morning",["좋은 아침","좋은아침","굿모닝","아침 인사"]],["checked",["확인했어","확인했습니다","확인했어요","확인 완료","접수"]],["understood",["알겠어","알겠습니다","알았어","알겠다고 답하고 싶어"]],["well-done",["잘했어","잘했다","잘했어요","아주 잘했어","칭찬하고 싶어"]],["same",["나도 그래","나도그래","나도 그랬어","나도 공감","내 말이"]],["leaving",["지금 출발","지금출발","이제 출발","출발해","출발한다","나 출발"]],["arrived",["도착했어","도착했습니다","나 왔어","나왔어","도착"]],["where",["어디야","어디쯤","어디 있어","어디있어","어딨어"]],["wait",["잠깐만","잠시만","잠깐","잠시 기다려","기다려줘"]],["hungry",["배고파","배고프다","배고픔","밥 먹고 싶어"]],["sleepy",["졸려","졸리다","졸려요","졸림","하품"]],["rest",["쉬고 싶어","쉬고싶어","쉬고 싶다","아무것도 안 하고 싶어","쉬고 싶어요"]],["okay",["괜찮아","괜찮아요","괜찮다고","괜찮습니다"]],["cheer",["힘내","힘내자","힘내세요","화이팅","파이팅"]],["thanks",["고마워","감사해","감사합니다","고맙다"]],["sorry",["미안","미안해","죄송해요","죄송합니다"]],["agree",["인정","맞아","맞는 말이야","동의해"]],["yes",["넵","넵!","네","예","응","ㅇㅇ"]]];
const compactExpression=q=>q.normalize('NFKC').toLowerCase().replace(/[\s.!?~ㅋㅎ,，。？！“”"'·]+/g,'');
export function dailyExpressionForQuery(q){
 const text=compactExpression(q);
 if(/안괜찮|괜찮지않|고맙지않|고맙긴|미안하지않|미안하긴|생일이아니/.test(text))return null;
 for(const [id,aliases] of dailyExpressions){
  if(aliases.some(alias=>{const word=compactExpression(alias);return word.length<=2?(text===word||['라고','하고','이라','라는','로답','하다고'].some(suffix=>text.includes(word+suffix))):text.includes(word)}))return id;
 }
 return null;
}
