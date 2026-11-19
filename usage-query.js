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
