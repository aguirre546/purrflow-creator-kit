// One local video, tied to the exact story and renderer revision that produced it.
// No remote storage, dependencies, or account credentials are involved.
const REVISION='purrflow-animation-v1';
export function storyFingerprint(workspace){
 const input=workspace?.input||{};
 return JSON.stringify([REVISION,workspace?.presetId,...['title','hook','setup','payoff','tone','language','source'].map(key=>input[key]??null)]);
}
export function createIndexedVideoStore(indexedDB=globalThis.indexedDB){
 async function open(){
  if(!indexedDB)throw new Error('Browser video storage is unavailable.');
  return new Promise((resolve,reject)=>{
   let settled=false;const request=indexedDB.open('purrflow.creator-kit.videos',1);
   const timer=setTimeout(()=>fail(new Error('Browser video storage did not respond.')),8000);
   function fail(error){if(settled)return;settled=true;clearTimeout(timer);reject(error);}
   request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('videos'))request.result.createObjectStore('videos');};
   request.onerror=()=>fail(request.error||new Error('Browser video storage could not open.'));
   request.onblocked=()=>fail(new Error('Close other PurrFlow tabs to update browser video storage.'));
   request.onsuccess=()=>{const db=request.result;if(settled){db.close();return;}settled=true;clearTimeout(timer);db.onversionchange=()=>db.close();resolve(db);};
  });
 }
 async function operation(mode,action){
  const db=await open();
  try{return await new Promise((resolve,reject)=>{
   const transaction=db.transaction('videos',mode);let value;
   const request=action(transaction.objectStore('videos'));
   request.onsuccess=()=>{value=request.result;};
   transaction.oncomplete=()=>resolve(value);
   transaction.onabort=()=>reject(transaction.error||request.error||new Error('Browser video storage was interrupted.'));
   transaction.onerror=()=>reject(transaction.error||request.error||new Error('Browser video storage failed.'));
  });}finally{db.close();}
 }
 return {load:()=>operation('readonly',store=>store.get('latest')),put:record=>operation('readwrite',store=>store.put(record,'latest')),clear:()=>operation('readwrite',store=>store.delete('latest'))};
}
const withoutReference=workspace=>{const {videoCache,...draft}=workspace;return draft;};
function validReference(reference,fingerprint){return reference?.version===1&&typeof reference.id==='string'&&reference.id.length>0&&reference.fingerprint===fingerprint;}
function validVideo(record){return record?.video?.blob instanceof Blob&&record.video.blob.size>0&&['mp4','webm'].includes(record.video.extension)&&record.video.blob.type.split(';')[0]==='video/'+record.video.extension;}

export function createVideoCache({store=createIndexedVideoStore(),saveWorkspace,retireReference,reportFailure=()=>{},newId=()=>globalThis.crypto.randomUUID()}){
 let epoch=0,activeReference=null,tail=Promise.resolve(),clearPending=false;
 // Serialize load, put and clear so an old write cannot complete after its invalidation.
 function enqueue(action){const next=tail.then(action,action);tail=next.catch(()=>{});return next;}
 function retire(){try{retireReference();}catch{reportFailure('The saved video reference could not be updated. Browser storage may be blocked; download a backup and your current video.');}}
 function invalidate(){
  epoch++;activeReference=null;retire();
   if(!clearPending){clearPending=true;enqueue(async()=>{try{await store.clear();}catch{reportFailure('The old video could not be removed from browser storage. Download your work if storage is blocked.');}finally{clearPending=false;}});}
 }
 function begin(){return epoch;}
 function withReference(workspace){return activeReference&&validReference(activeReference,storyFingerprint(workspace))?{...withoutReference(workspace),videoCache:activeReference}:withoutReference(workspace);}
 async function persist(workspace,video,ticket=epoch){
  if(ticket!==epoch)return {status:'stale'};
  if(!validVideo({video}))throw new Error('The rendered video is empty or has an unsupported format.');
  const reference={version:1,id:newId(),fingerprint:storyFingerprint(workspace)};
  // Save this render's captured workspace, never a later form state.
  try{saveWorkspace({...withoutReference(workspace),videoCache:reference});}catch{
   activeReference=null;retire();
   return {status:'unsaved',message:'Video rendered, but the workspace could not be saved in this browser. Download the video or ZIP and a workspace backup before closing this tab.'};
  }
  return enqueue(async()=>{
   if(ticket!==epoch)return {status:'stale'};
   try{
    await store.put({version:1,...reference,video});
    if(ticket!==epoch)return {status:'stale'};
    activeReference=reference;
    return {status:'saved',message:'Video and matching workspace saved in this browser. Download a ZIP to keep a separate copy.'};
   }catch{
    if(ticket!==epoch)return {status:'stale'};
    activeReference=null;retire();
    return {status:'workspace-only',message:'Workspace saved, but this browser could not keep the video. Storage may be full or blocked. Download the video or ZIP before closing this tab.'};
   }
  });
 }
 async function restore(workspace){
  const ticket=epoch,fingerprint=storyFingerprint(workspace),reference=workspace.videoCache;
  if(!validReference(reference,fingerprint)){invalidate();return {status:'empty'};}
  return enqueue(async()=>{
   try{
    const record=await store.load();
    if(ticket!==epoch)return {status:'stale'};
    if(!validReference(record,fingerprint)||record.id!==reference.id||!validVideo(record)){
     activeReference=null;retire();
     return {status:'missing',message:'Workspace restored. Its saved video is unavailable or no longer matches; render it again to include a video.'};
    }
    activeReference=reference;
    return {status:'restored',video:record.video};
   }catch{
    if(ticket!==epoch)return {status:'stale'};
    return {status:'unavailable',message:'Workspace restored, but browser video storage is unavailable. Render again or use a downloaded video.'};
   }
  });
 }
 return {begin,invalidate,persist,restore,withReference,settled:()=>tail};
}
