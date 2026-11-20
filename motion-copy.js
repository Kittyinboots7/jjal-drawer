const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function animationMime(item){
 const path=new URL(item.imageUrl,globalThis.location?.href||'https://example.invalid/').pathname;
 if(/\.gif$/i.test(path))return 'image/gif';
 if(/\.webp$/i.test(path))return 'image/webp';
 return item.type?.startsWith('image/')?item.type:'image/gif';
}
// Never flatten an animation into a PNG. Editors can paste the animated HTML;
// native apps that do not accept HTML receive the original URL instead.
export async function copyAnimated(item,env=globalThis){
 const clipboard=env.navigator?.clipboard,Item=env.ClipboardItem;
 if(!clipboard)throw new Error('clipboard unavailable');
 const url=item.imageUrl,mime=animationMime(item);
 const html='<img src="'+escapeHTML(url)+'" alt="'+escapeHTML(item.title||'')+'">';
 const formats=()=>({'text/html':new env.Blob([html],{type:'text/html'}),'text/plain':new env.Blob([url],{type:'text/plain'})});
 if(Item&&clipboard.write){
  if(mime!=='image/png'&&typeof Item.supports==='function'&&Item.supports(mime)){
   // Pass the pending blob during the click, so Safari retains user activation.
   const original=(async()=>{const r=await env.fetch(url);if(!r.ok)throw new Error('image unavailable');const b=await r.blob();return b.type===mime?b:new env.Blob([b],{type:mime})})();
   try{await clipboard.write([new Item({...formats(),[mime]:original})]);return 'native'}catch{await original.catch(()=>{});}
  }
  try{await clipboard.write([new Item(formats())]);return 'html'}catch{}
 }
 if(clipboard.writeText){await clipboard.writeText(url);return 'link'}
 throw new Error('clipboard unavailable');
}
