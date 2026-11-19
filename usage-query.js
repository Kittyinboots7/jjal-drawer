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
