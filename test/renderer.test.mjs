import test from 'node:test';
import assert from 'node:assert/strict';
import {drawStory,supportsRecording} from '../dist/renderer.mjs';

function fakeCanvas(){
 const texts=[];
 const target={font:'10px sans-serif',textAlign:'start',measureText(value){const px=Number(/([\d.]+)px/.exec(this.font)?.[1]||10);return {width:Array.from(String(value)).length*px*.58};},fillText(...args){assert.ok(args.length>=3,'fillText requires text, x and y');assert.equal(typeof args[0],'string');assert.ok(Number.isFinite(args[1])&&Number.isFinite(args[2]),'Text coordinates must be finite');texts.push({text:args[0],x:args[1],y:args[2],width:this.measureText(args[0]).width,font:this.font});}};
 const context=new Proxy(target,{get(object,key){if(key in object)return object[key];return (...args)=>{for(const arg of args)if(typeof arg==='number')assert.ok(Number.isFinite(arg),`${String(key)} received a non-finite argument`);};}});
 return {width:0,height:0,texts,getContext(type){assert.equal(type,'2d');return context;}};
}

for(const preset of ['box','shelf','chef','bed-box','forbidden-shelf','tiny-chef']){
 test(`${preset}: all scenes draw with valid Canvas arguments`,()=>{for(const time of [0,2.99,3,6.99,7,14.9]){const canvas=fakeCanvas();assert.equal(drawStory(canvas,time,{},preset),canvas);assert.equal(canvas.width,720);assert.equal(canvas.height,1280);assert.ok(canvas.texts.length>=5);}});
}
test('Long Unicode titles and caption tokens stay within upper text bounds',()=>{
 const canvas=fakeCanvas();drawStory(canvas,6,{title:'Mochi 🐈 '.repeat(40),cues:[{start:0,end:15,text:'🐈☕'.repeat(140)+' Magandang umaga!'}]},'chef');
 const upper=canvas.texts.filter(item=>item.y>=150&&item.y<465);
 assert.ok(upper.length>=3);
 for(const text of upper){assert.equal(text.x,360);assert.ok(text.width<=570.001,`Text exceeds its width: ${text.width}`);assert.ok(text.y<=465);assert.ok(!/[\uD800-\uDBFF]$/.test(text.text),'Text must not end with a split surrogate');}
 assert.ok(upper.filter(item=>item.y<200).length<=2,'Title must not overlap captions');
});
test('Caption cue switches at its declared boundary',()=>{
 const campaign={cues:[{start:0,end:3,text:'HOOK CUE'},{start:3,end:7,text:'SETUP CUE'},{start:7,end:12,text:'PAYOFF CUE'},{start:12,end:15,text:'QUESTION CUE'}]};
 for(const [time,wanted] of [[2.99,'HOOK CUE'],[3,'SETUP CUE'],[6.99,'SETUP CUE'],[7,'PAYOFF CUE'],[12,'QUESTION CUE']]){const canvas=fakeCanvas();drawStory(canvas,time,campaign);assert.deepEqual(canvas.texts.filter(item=>item.text.endsWith(' CUE')).map(item=>item.text),[wanted]);}
});
test('Visual story reaches setup at 3 seconds and payoff at 7 seconds',()=>{
 const expected=['I bought Mochi a fancy bed.','Mochi had other plans.','The box wins. Every time.'];
 for(const [time,scene] of [[2.99,0],[3,1],[6.99,1],[7,2],[14.9,2]]){const canvas=fakeCanvas();drawStory(canvas,time,{},'box');const shown=canvas.texts.filter(item=>item.y>=244&&item.y<465).map(item=>item.text).join(' ');assert.equal(shown,expected[scene]);}
});
test('Unsupported runtime reports no recording instead of promising an export',()=>{assert.deepEqual(supportsRecording(),{supported:false,mimeType:null,extension:null});});
