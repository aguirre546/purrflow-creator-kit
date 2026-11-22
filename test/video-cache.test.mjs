import test from 'node:test';
import assert from 'node:assert/strict';
import {createIndexedVideoStore,createVideoCache,storyFingerprint} from '../dist/video-cache.mjs';

const workspace=()=>({version:1,presetId:'bed-box',input:{title:'Box wins',hook:'One box',setup:'Mochi finds it',payoff:'Time to nap',tone:'playful',language:'en',source:'animation'},platforms:{facebook:'A caption'},startDate:'2026-11-20',videosPerDay:3});
const video=()=>({blob:new Blob(['recorded video'],{type:'video/webm;codecs=vp9'}),extension:'webm',mimeType:'video/webm;codecs=vp9',duration:15,width:720,height:1280});
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
function environment(){
 const env={saved:null,record:null,errors:[],writes:0,clears:0};
 env.store={async put(value){env.writes++;env.record=structuredClone(value);},async load(){return structuredClone(env.record);},async clear(){env.clears++;env.record=null;}};
 env.options=()=>({store:env.store,newId:()=>`render-${env.writes+1}`,saveWorkspace:value=>{env.saved=structuredClone(value);},retireReference:()=>{if(env.saved)delete env.saved.videoCache;},reportFailure:message=>env.errors.push(message)});
 env.cache=createVideoCache(env.options());return env;
}

test('Reload restores the Blob only with its saved workspace reference',async()=>{
 const env=environment(),snapshot=workspace();const result=await env.cache.persist(snapshot,video());
 assert.equal(result.status,'saved');assert.deepEqual(env.saved.input,snapshot.input);assert.ok(env.saved.videoCache.id);
 const reloaded=createVideoCache(env.options()),restored=await reloaded.restore(env.saved);
 assert.equal(restored.status,'restored');assert.equal(await restored.video.blob.text(),'recorded video');
 assert.deepEqual(reloaded.withReference(snapshot).videoCache,env.saved.videoCache);
});
test('Every story field and visual template are part of the fingerprint',()=>{
 const initial=workspace(),fingerprint=storyFingerprint(initial);
 for(const key of Object.keys(initial.input)){const changed=structuredClone(initial);changed.input[key]+=' changed';assert.notEqual(storyFingerprint(changed),fingerprint,key);}
 const changed=structuredClone(initial);changed.presetId='tiny-chef';assert.notEqual(storyFingerprint(changed),fingerprint);
 changed.presetId=initial.presetId;changed.platforms.facebook='New caption';changed.startDate='2026-11-21';assert.equal(storyFingerprint(changed),fingerprint,'External captions and calendar do not change video frames');
});
test('Story edits, imports and template changes retire the old reference and clear the video',async()=>{
 for(const action of ['story edit','JSON import','template change']){
  const env=environment();await env.cache.persist(workspace(),video());env.cache.invalidate();
  assert.equal(env.saved.videoCache,undefined,action);assert.equal(env.cache.withReference(workspace()).videoCache,undefined,action);
  await env.cache.settled();assert.equal(env.record,null,action);
  const reload=createVideoCache(env.options());assert.equal((await reload.restore(env.saved)).status,'empty',action);await reload.settled();
 }
});
test('A matching reference copied to another story cannot restore its old video',async()=>{
 const env=environment();await env.cache.persist(workspace(),video());const changed=structuredClone(env.saved);changed.input.title='Another story';
 assert.equal((await createVideoCache(env.options()).restore(changed)).status,'empty');
});
test('A slow restore cannot resurrect a video after the user edits or imports',async()=>{
 const env=environment();await env.cache.persist(workspace(),video());const gate=deferred();env.store.load=()=>gate.promise;
 const reload=createVideoCache(env.options()),pending=reload.restore(structuredClone(env.saved));await Promise.resolve();reload.invalidate();gate.resolve(env.record);
 assert.equal((await pending).status,'stale');await reload.settled();assert.equal(env.record,null);
});
test('An in-flight write is cleared after invalidation and cannot save a newer draft',async()=>{
 const env=environment(),gate=deferred(),started=deferred();env.store.put=async record=>{started.resolve();await gate.promise;env.record=record;};
 const ticket=env.cache.begin(),pending=env.cache.persist(workspace(),video(),ticket);await started.promise;
 env.cache.invalidate();const newer=workspace();newer.input.title='New draft';env.saved=newer;gate.resolve();
 assert.equal((await pending).status,'stale');await env.cache.settled();assert.equal(env.record,null);assert.equal(env.saved.input.title,'New draft');assert.equal(env.saved.videoCache,undefined);
});
test('A render that finishes after invalidation never overwrites the saved workspace',async()=>{
 const env=environment(),ticket=env.cache.begin();env.cache.invalidate();const newer=workspace();newer.input.title='Newer work';env.saved=newer;
 assert.equal((await env.cache.persist(workspace(),video(),ticket)).status,'stale');assert.equal(env.writes,0);assert.equal(env.saved.input.title,'Newer work');await env.cache.settled();
});
test('Video storage quota failure preserves the saved draft and reports how to keep the video',async()=>{
 const env=environment();env.store.put=async()=>{throw new DOMException('full','QuotaExceededError');};
 const result=await env.cache.persist(workspace(),video());assert.equal(result.status,'workspace-only');assert.match(result.message,/Download the video or ZIP/);assert.equal(env.saved.input.title,'Box wins');assert.equal(env.saved.videoCache,undefined);assert.equal(env.cache.withReference(workspace()).videoCache,undefined);
});
test('Workspace storage failure does not claim a saved video or enqueue its write',async()=>{
 const env=environment(),options=env.options();options.saveWorkspace=()=>{throw new Error('blocked');};const cache=createVideoCache(options);
 const result=await cache.persist(workspace(),video());assert.equal(result.status,'unsaved');assert.match(result.message,/workspace could not be saved/);assert.equal(env.writes,0);assert.equal(cache.withReference(workspace()).videoCache,undefined);
});
test('Deleted browser videos, corrupt records and mismatched render IDs require a new render',async()=>{
 for(const badRecord of [null,{video:{blob:'not a Blob'}},{version:1,id:'other-render'}]){
  const env=environment();await env.cache.persist(workspace(),video());env.record=badRecord;
  const result=await createVideoCache(env.options()).restore(structuredClone(env.saved));assert.equal(result.status,'missing');assert.match(result.message,/render it again/);assert.equal(env.saved.videoCache,undefined);
 }
});
test('Unavailable storage reports an actionable message and delayed failures respect invalidation',async()=>{
 const env=environment();await env.cache.persist(workspace(),video());const saved=structuredClone(env.saved);env.store.load=async()=>{throw new Error('blocked');};
 assert.equal((await createVideoCache(env.options()).restore(saved)).status,'unavailable');
 env.store.clear=async()=>{throw new Error('blocked');};env.cache.invalidate();await env.cache.settled();assert.match(env.errors.at(-1),/could not be removed/);assert.equal(env.saved.videoCache,undefined);
 const store=createIndexedVideoStore(null);await assert.rejects(store.load(),/storage is unavailable/);
});
test('Storage reads and writes resolve only after their IndexedDB transaction commits',async()=>{
 const started=deferred(),transaction={objectStore(){return {put(){started.resolve();return request;}};}},request={},db={objectStoreNames:{contains:()=>true},transaction:()=>transaction,close(){closed=true;}};
 let openRequest,closed=false,settled=false;
 const store=createIndexedVideoStore({open(){openRequest={};return openRequest;}}),pending=store.put({video:video()}).then(()=>{settled=true;});
 openRequest.result=db;openRequest.onsuccess();await started.promise;request.result='latest';request.onsuccess();await Promise.resolve();assert.equal(settled,false);assert.equal(closed,false);
 transaction.oncomplete();await pending;assert.equal(settled,true);assert.equal(closed,true);
});
