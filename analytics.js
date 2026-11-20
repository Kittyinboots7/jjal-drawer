import {measurementId} from './analytics-config.js?v=2';
const validId=/^G-[A-Z0-9]+$/;
let started=false;
export function startAnalytics(){
 if(started||!validId.test(measurementId)||!['kittyinboots7.github.io'].includes(location.hostname))return false;
 started=true;window.dataLayer=window.dataLayer||[];
 window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
 window.gtag('js',new Date());
 window.gtag('config',measurementId,{send_page_view:true,allow_google_signals:false,allow_ad_personalization_signals:false});
 const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(measurementId);document.head.append(script);
 return true;
}
// Free-form queries can contain contact details. Omit these queries from analytics.
export function searchTermForAnalytics(value){
 const term=String(value||'').normalize('NFKC').replace(/\s+/g,' ').trim();
 if(!term||term.length>100||/@|https?:|www\.|(?:\d[\s()+.-]*){7,}|(?:우리집|집주소|주민등록|계좌번호|전화번호|이메일|학번)/i.test(term))return null;
 return term;
}
export function trackEvent(name,params={}){
 if(!started)return;
 try{window.gtag('event',name,params)}catch{}
}
export function trackSearch(query,mediaType){
 const term=searchTermForAnalytics(query);
 if(term)trackEvent('search',{search_term:term,media_type:mediaType});
}
export function trackSearchResults(query,count,method,mediaType){
 const term=searchTermForAnalytics(query);if(!term)return;
 const params={search_term:term,result_count:count,search_method:method,media_type:mediaType};
 trackEvent('search_results',params);
 if(count===0)trackEvent('search_no_results',params);
}
export function trackCopy(item,mode){
 trackEvent('copy_meme',{meme_id:item.sourceJjalId||item.shortId,work_name:item.show,genre:item.genre,media_type:item.animationStatus==='animated'?'motion':'photo',copy_mode:mode});
}
