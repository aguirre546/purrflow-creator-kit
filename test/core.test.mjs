import test from 'node:test';
import assert from 'node:assert/strict';
import {STORY_PRESETS,validateInput,validatePlatformCopies,generateCampaign,createWeekPlan,srt,packFiles,zipFiles,crc32} from '../dist/core.mjs';
const input={...STORY_PRESETS[0],tone:'playful',language:'en'};
test('three presets each produce five distinct disclosed captions and 15-second cues',()=>{
  for(const preset of STORY_PRESETS){const c=generateCampaign({...preset,tone:'playful',language:'en'});assert.equal(Object.keys(c.platforms).length,5);assert.equal(new Set(Object.values(c.platforms)).size,5);for(const copy of Object.values(c.platforms)){assert.match(copy,/Original fictional cat animation/);assert.doesNotMatch(copy,/#AICat/);}assert.equal(c.source,'animation');assert.equal(c.cues[0].start,0);assert.equal(c.cues.at(-1).end,15);assert.equal(c.cues.length,4);assert.ok(Array.from(c.platforms.x).length<=240);}
});
test('AI sample disclosure is explicit opt-in and invalid source is rejected',()=>{
  const c=generateCampaign({...input,source:'ai-sample'});assert.equal(c.source,'ai-sample');for(const copy of Object.values(c.platforms))assert.match(copy,/AI-generated fictional cat story/);assert.match(c.platforms.x,/#AICat/);assert.throws(()=>generateCampaign({...input,source:'unknown'}));
});
test('input boundaries handle Unicode codepoints, reject empty, unsupported choices and excessive length',()=>{
  assert.equal(validateInput({...input,title:'🐾'.repeat(80)}).title.length,160);
  assert.throws(()=>generateCampaign({...input,title:'🐾'.repeat(81)}),/title/);
  for(const key of ['title','hook','setup','payoff'])assert.throws(()=>generateCampaign({...input,[key]:'   '}));
  assert.throws(()=>generateCampaign({...input,tone:'viral'}));assert.throws(()=>generateCampaign({...input,language:'zz'}));assert.throws(()=>generateCampaign({...input,hook:'Hello\u0000there'}));
  assert.equal(validateInput({...input,hook:'  Hello   cat  '}).hook,'Hello cat');
});
test('all tones/languages and maximum Unicode inputs keep X comfortably below its local cap',()=>{
  for(const tone of ['playful','cozy'])for(const language of ['en','taglish']){const c=generateCampaign({...input,title:'😸'.repeat(80),hook:'😸'.repeat(140),setup:'a'.repeat(220),payoff:'b'.repeat(180),tone,language});assert.ok(Array.from(c.platforms.x).reduce((n,char)=>n+(char.charCodeAt(0)>127?2:1),0)<=240);assert.ok(c.platforms.instagram.includes('😸'));assert.equal(c.language,language);}
});
test('week plan has exact seven-day 3/4/5 cadence, deterministic unique ideas and explicit planned status',()=>{
  for(const videosPerDay of [3,4,5]){const p=createWeekPlan({startDate:'2026-12-29',videosPerDay});assert.equal(p.length,7*videosPerDay);assert.equal(p[0].date,'2026-12-29');assert.equal(p.at(-1).date,'2027-01-04');assert.equal(new Set(p.map(e=>e.title)).size,p.length);assert.equal(new Set(p.map(e=>e.hook)).size,p.length);assert.deepEqual(p,createWeekPlan({startDate:'2026-12-29',videosPerDay}));for(const e of p){assert.equal(e.timezone,'Asia/Manila');assert.equal(e.status,'planned');assert.match(e.time,/^\d{2}:\d{2}$/);const preset=STORY_PRESETS.find(s=>s.id===e.presetId);assert.equal(e.setup,preset.setup);assert.equal(e.payoff,preset.payoff);assert.ok(e.hook.includes(preset.hook));}}
});
test('calendar validation rejects normalized impossible dates and bad daily count',()=>{
  for(const date of ['2026-02-29','2026-04-31','oops','2026-1-01','2026-13-01'])assert.throws(()=>createWeekPlan({startDate:date,videosPerDay:3}));
  assert.equal(createWeekPlan({startDate:'2028-02-29',videosPerDay:3})[0].date,'2028-02-29');assert.throws(()=>createWeekPlan({startDate:'2026-01-01',videosPerDay:2}));
});
test('SRT formatting and millisecond timing reject invalid overlaps and collapsed cues',()=>{
  assert.equal(srt([{start:0,end:1.234,text:'Mochi 🐾'}]),'1\n00:00:00,000 --> 00:00:01,234\nMochi 🐾\n');
  for(const cues of [[],[{start:-1,end:1,text:'x'}],[{start:0,end:16,text:'x'}],[{start:0,end:2,text:'x'},{start:1,end:3,text:'y'}],[{start:0,end:0.00001,text:'x'}],[{start:NaN,end:2,text:'x'}],[{start:0,end:1,text:'x\ny'}]])assert.throws(()=>srt(cues));
});
test('bundle contains five captions, subtitle, campaign and CSV with correct escaping',()=>{
  const c=generateCampaign(input),plan=createWeekPlan({startDate:'2026-11-12',videosPerDay:3});plan[0].title='A "cat", here';const files=packFiles(c,plan);assert.equal(Object.keys(files).length,9);assert.match(files['week-plan.csv'],/"A ""cat"", here"/);assert.equal(JSON.parse(files['campaign.json']).title,c.title);assert.match(files['README.txt'],/Nothing is scheduled or published/);assert.throws(()=>packFiles({},[]));
});
test('edited platform captions reject blanks, missing entries, controls and oversized X including emoji',()=>{
  const copies=generateCampaign(input).platforms;
  for(const value of ['', '   ',null,42,'bad\0text','bad\u000btext'])assert.throws(()=>validatePlatformCopies({...copies,x:value}));
  assert.throws(()=>validatePlatformCopies({...copies,x:'a'.repeat(5000)}));
  assert.throws(()=>validatePlatformCopies({...copies,x:'😸'.repeat(121)}));
  assert.throws(()=>packFiles({...generateCampaign(input),platforms:{...copies,x:''}},[]));
  assert.throws(()=>validatePlatformCopies(null));assert.throws(()=>validatePlatformCopies({}));
});
test('edited platform captions allow exact conservative boundaries and line breaks',()=>{
  const limits={facebook:5000,instagram:2200,youtube:5000,x:240,tiktok:2200};
  const copies=Object.fromEntries(Object.entries(limits).map(([name,max])=>[name,'a'.repeat(max)]));
  assert.deepEqual(validatePlatformCopies(copies),copies);
  for(const [name,max]of Object.entries(limits))assert.throws(()=>validatePlatformCopies({...copies,[name]:'a'.repeat(max+1)}));
  assert.equal(validatePlatformCopies({...copies,x:'😸'.repeat(120)}).x,'😸'.repeat(120));
  assert.equal(validatePlatformCopies({...copies,x:'line one\r\nline two\tend'}).x,'line one\r\nline two\tend');
});
test('ZIP uses valid stored records, UTF8, CRC32, central offsets and EOCD bounds',()=>{
  assert.equal(crc32(new TextEncoder().encode('123456789')),0xcbf43926);
  const files={'captions/猫.txt':'Hello 🐾','raw.bin':new Uint8Array([0,1,255])},zip=zipFiles(files),v=new DataView(zip.buffer),decoder=new TextDecoder();
  let p=0;const offsets=[];
  for(const [name,value] of Object.entries(files)){offsets.push(p);assert.equal(v.getUint32(p,true),0x04034b50);assert.equal(v.getUint16(p+6,true),0x800);assert.equal(v.getUint16(p+8,true),0);const len=v.getUint32(p+18,true),nameLen=v.getUint16(p+26,true);assert.equal(decoder.decode(zip.slice(p+30,p+30+nameLen)),name);const bytes=typeof value==='string'?new TextEncoder().encode(value):value;assert.deepEqual(zip.slice(p+30+nameLen,p+30+nameLen+len),bytes);assert.equal(v.getUint32(p+14,true),crc32(bytes));p+=30+nameLen+len;}
  const central=p;
  for(const offset of offsets){assert.equal(v.getUint32(p,true),0x02014b50);assert.equal(v.getUint32(p+42,true),offset);p+=46+v.getUint16(p+28,true);}
  assert.equal(v.getUint32(p,true),0x06054b50);assert.equal(v.getUint16(p+10,true),2);assert.equal(v.getUint32(p+12,true),p-central);assert.equal(v.getUint32(p+16,true),central);assert.equal(p+22,zip.length);
});
test('ZIP rejects traversal, absolute filenames and invalid payloads',()=>{
  for(const name of ['../x','/x','a/../x','a\\x','C:/x','a//x','a/./x'])assert.throws(()=>zipFiles({[name]:'x'}));assert.throws(()=>zipFiles({}));assert.throws(()=>zipFiles({'okay':123}));
});
