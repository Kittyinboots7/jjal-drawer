let extractor;
self.onmessage=async({data})=>{
 try{
  if(!extractor){
   const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js');
   env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=1;
   extractor=await pipeline('feature-extraction','Xenova/paraphrase-multilingual-MiniLM-L12-v2',{dtype:'q8',device:'wasm',progress_callback:p=>{if(p.status==='progress'&&p.file?.includes('onnx'))self.postMessage({type:'progress',progress:p.progress})}});
  }
  if(data.type==='init'){self.postMessage({type:'ready'});return}
  const output=await extractor(data.query,{pooling:'mean',normalize:true,truncation:true,max_length:96});
  self.postMessage({type:'result',id:data.id,vector:Array.from(output.data)});
 }catch(e){self.postMessage({type:'error',id:data.id,error:e.message})}
};
