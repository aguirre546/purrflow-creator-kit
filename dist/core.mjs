// Local, deterministic creative templates. No model or publishing service is called.
export const STORY_PRESETS = Object.freeze([
  { id: 'bed-box', title: 'The box wins again', hook: 'A fancy bed. One cardboard box. Guess who wins?', setup: 'Mochi inspects the plush new bed, then spots its delivery box.', payoff: 'Mochi curls up in the box. The expensive bed becomes a toy shelf.' },
  { id: 'forbidden-shelf', title: 'The forbidden shelf', hook: 'Mochi has one rule: do not touch that shelf.', setup: 'A tiny toy mouse sits just out of reach on the lowest shelf.', payoff: 'Mochi gently retrieves the mouse, then takes a proud nap underneath.' },
  { id: 'tiny-chef', title: 'The smallest kitchen supervisor', hook: 'The chef is ready. The supervisor is a cat.', setup: 'In a pretend kitchen, Mochi watches a toy fish-shaped cookie arrive.', payoff: 'Mochi stamps the empty plate with a paw: quality inspection complete.' },
]);
const LIMITS = { title: 80, hook: 140, setup: 220, payoff: 180 };
const count = value => Array.from(value).length;
export function validateInput(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Enter a story first.');
  const result = {};
  for (const [key, max] of Object.entries(LIMITS)) {
    if (typeof input[key] !== 'string') throw new TypeError(`${key} must be text.`);
    const value = input[key].trim().replace(/\s+/gu, ' ');
    if (!value || count(value) > max) throw new RangeError(`${key} needs 1–${max} characters.`);
    if (/[\u0000-\u001f\u007f]/u.test(value)) throw new TypeError(`${key} contains unsupported control characters.`);
    result[key] = value;
  }
  result.tone = input.tone ?? 'playful';
  result.language = input.language ?? 'en';
  result.source = input.source ?? 'animation';
  if (!['playful', 'cozy'].includes(result.tone)) throw new RangeError('Choose playful or cozy tone.');
  if (!['en', 'taglish'].includes(result.language)) throw new RangeError('Choose English or Taglish.');
  if (!['animation', 'ai-sample'].includes(result.source)) throw new RangeError('Choose animation or AI sample source.');
  return result;
}
const short = (value, max) => count(value) <= max ? value : Array.from(value).slice(0, max - 1).join('').trimEnd() + '…';
// Conservative X budget: count all non-ASCII characters as two units.
const shortX = (value, max) => {
  let used=0, result='';
  for(const char of value){const cost=char.charCodeAt(0)>127?2:1;if(used+cost>max-2)return result.trimEnd()+'…';used+=cost;result+=char;}
  return result;
};
export function generateCampaign(input) {
  const story = validateInput(input);
  const {title, hook, setup, payoff, tone, language, source} = story;
  const tl = language === 'taglish';
  const question = tl ? 'Ikaw, ano ang gagawin ng pusa mo?' : 'What would your cat do?';
  const mood = tone === 'cozy' ? (tl ? 'Isang munting cozy moment kasama si Mochi.' : 'A small, cozy moment with Mochi.') : (tl ? 'Mochi na naman ang may pakana!' : 'Mochi has a plan. Probably.');
  // Supplied story wording stays intact; Taglish changes the surrounding copy only.
  const disclosure = source === 'ai-sample' ? (tl ? 'Kathang-isip na AI-generated cat story.' : 'AI-generated fictional cat story.') : (tl ? 'Orihinal na kathang-isip na cat animation.' : 'Original fictional cat animation.');
  const sourceTag = source === 'ai-sample' ? '#AICat' : '#CatAnimation';
  const platforms = {
    facebook: `${hook}\n\n${setup} ${payoff}\n\n${mood} ${question}\n${disclosure}\n#MochiMischief #CatStories`,
    instagram: `${title} 🐾\n${hook}\n\n${payoff}\n${tl ? 'Team Mochi ka rin ba?' : 'Are you on Team Mochi?'}\n${disclosure}\n#MochiMischief ${sourceTag} #CatComedy`,
    youtube: `${title}\n\n${hook}\n${setup}\n${payoff}\n\n${question}\n${disclosure}\n#Shorts #MochiMischief ${sourceTag}`,
    x: `${shortX(title, 55)} 🐾 ${shortX(hook, 65)}\n${tl ? 'Anong verdict mo?' : 'Your verdict?'} ${disclosure}\n${sourceTag} #MochiMischief`,
    tiktok: `${short(hook, 95)} 🐈 ${tl ? 'Abangan ang ending ni Mochi.' : 'Wait for Mochi’s verdict.'}\n${disclosure}\n#MochiMischief #CatStory ${sourceTag}`,
  };
  return {title, tone, language, source, story:{hook,setup,payoff}, platforms, cues:[
    {start:0,end:3,text:hook}, {start:3,end:7,text:setup},
    {start:7,end:12,text:payoff}, {start:12,end:15,text:question},
  ], method:'Local rule-based templates; no AI model was called.', disclosure};
}
const TIMES = {3:['09:00','14:00','19:00'],4:['09:00','12:00','16:00','19:00'],5:['08:00','11:00','14:00','17:00','20:00']};
const ANGLES = {
  'bed-box': ['Luxury or cardboard?', 'The nap decision', 'Mochi chooses comfort', 'The box verdict', 'A bed for the toys', 'Cardboard wins', 'The delivery-box review'],
  'forbidden-shelf': ['The toy-mouse mission', 'One shelf, one mouse', 'Mochi spots the prize', 'The gentle retrieval', 'A proud little nap', 'The shelf inspection', 'Mouse recovered'],
  'tiny-chef': ['Kitchen quality control', 'The tiniest supervisor', 'Mochi checks the plate', 'The pretend cookie review', 'Paw of approval', 'Inspection complete', 'The cat chef’s verdict'],
};
export function createWeekPlan({startDate, videosPerDay} = {}) {
  if (![3,4,5].includes(videosPerDay)) throw new RangeError('Choose 3, 4 or 5 videos per day.');
  if (typeof startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/u.test(startDate)) throw new RangeError('Use a valid start date: YYYY-MM-DD.');
  const date = new Date(`${startDate}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== startDate) throw new RangeError('Use a real calendar date.');
  const entries = [];
  for (let day=0;day<7;day++) {
    const iso = new Date(date.getTime()+day*86400000).toISOString().slice(0,10);
    for (let slot=0;slot<videosPerDay;slot++) {
      const preset=STORY_PRESETS[(day+slot)%STORY_PRESETS.length];
      const angle=ANGLES[preset.id][day];
      entries.push({date:iso,time:TIMES[videosPerDay][slot],timezone:'Asia/Manila',title:`${angle} — episode ${day*videosPerDay+slot+1}`,hook:`${['Morning question','A tiny adventure','Today’s verdict','Mochi’s choice','Evening surprise'][slot]} ${day+1}: ${preset.hook}`,setup:preset.setup,payoff:preset.payoff,presetId:preset.id,status:'planned'});
    }
  }
  return entries;
}
function validateCues(cues) {
  if (!Array.isArray(cues) || !cues.length) throw new TypeError('Add at least one subtitle cue.');
  let prior=0;
  for (const cue of cues) {
    if (!cue || !Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.start<prior || cue.end<=cue.start || cue.end>15 || Math.round(cue.end*1000)<=Math.round(cue.start*1000) || typeof cue.text!=='string' || !cue.text.trim() || /[\u0000-\u001f\u007f]/u.test(cue.text)) throw new RangeError('Subtitle cues need ordered, non-overlapping times within 15 seconds and plain text.');
    prior=cue.end;
  }
}
const stamp = seconds => {const ms=Math.round(seconds*1000); return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
export function srt(cues) {validateCues(cues);return cues.map((cue,i)=>`${i+1}\n${stamp(cue.start)} --> ${stamp(cue.end)}\n${cue.text.trim()}\n`).join('\n');}
export function validatePlatformCopies(platforms) {
  if (!platforms || typeof platforms !== 'object' || Array.isArray(platforms)) throw new TypeError('Provide all five platform captions.');
  const copies = {};
  for (const [name,max] of Object.entries({facebook:5000,instagram:2200,youtube:5000,x:240,tiktok:2200})) {
    const copy = platforms[name];
    if (typeof copy !== 'string' || !copy.trim() || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(copy)) throw new TypeError(`${name} caption needs nonempty text without control characters.`);
    const size = name === 'x' ? Array.from(copy).reduce((n,char)=>n+(char.charCodeAt(0)>127?2:1),0) : count(copy);
    if (size > max) throw new RangeError(`${name} caption exceeds this kit’s safe ${max}${name==='x'?' weighted':''}-character limit.`);
    copies[name] = copy;
  }
  return copies;
}
const csv = value => `"${String(value).replace(/"/gu,'""')}"`;
export function packFiles(campaign, plan = []) {
  if (!campaign?.platforms || !Array.isArray(plan)) throw new TypeError('A campaign and plan array are required.');
  const copies = validatePlatformCopies(campaign.platforms);
  const files = {};
  for (const name of ['facebook','instagram','youtube','x','tiktok']) {
    files[`captions/${name}.txt`]=copies[name]+'\n';
  }
  files['captions.srt']=srt(campaign.cues);
  files['campaign.json']=JSON.stringify(campaign,null,2)+'\n';
  const columns=['date','time','timezone','title','hook','setup','payoff','presetId','status'];
  files['week-plan.csv']=[columns.join(','),...plan.map(row=>columns.map(key=>csv(row[key]??'')).join(','))].join('\r\n')+'\r\n';
  files['README.txt']=`PurrFlow Creator Kit\n\nPrepared locally using deterministic creative templates. No AI model was called.\nSource: ${campaign.source ?? 'animation'}. ${campaign.disclosure ?? 'Original fictional cat animation.'}\nPair these captions only with a matching video. AI disclosure applies only to the optional existing AI sample.\nTaglish mode changes the framing, not a translation of your supplied story.\n\nThis bundle contains five editable captions, a 15-second subtitle file and a seven-day planning sheet.\nThe subtitle file is not burned into a video. Check readability and match every cue to your final clip.\nCalendar entries are editorial variations of three illustrated plots, not 21–35 different generated videos.\nTimes are proposed Asia/Manila slots, not audience-analytics recommendations.\nNothing is scheduled or published by exporting this bundle. Upload with the platform’s own tools.\nUse media you own or have permission to use, and apply platform AI disclosures where required.\n`;
  return files;
}
const encoder=new TextEncoder();
const CRC_TABLE=Uint32Array.from({length:256},(_,n)=>{let c=n;for(let i=0;i<8;i++) c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
export function crc32(bytes) {let c=0xffffffff;for(const b of bytes)c=CRC_TABLE[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
export function zipFiles(files) {
  if (!files || typeof files!=='object' || Array.isArray(files)) throw new TypeError('Provide a filename-to-content object.');
  const entries=Object.entries(files);
  if(!entries.length || entries.length>65535) throw new RangeError('ZIP requires 1–65535 files.');
  let localSize=0, centralSize=0;
  const prepared=entries.map(([name,content])=>{
    if(!name || name.startsWith('/') || name.includes('\\') || name.split('/').some(p=>!p || p==='.' || p==='..') || /[:\u0000-\u001f\u007f]/u.test(name))throw new RangeError('Unsafe ZIP filename.');
    const filename=encoder.encode(name);
    if(filename.length>65535)throw new RangeError('ZIP filename too long.');
    const bytes=typeof content==='string'?encoder.encode(content):content;
    if(!(bytes instanceof Uint8Array)) throw new TypeError('ZIP content must be text or Uint8Array.');
    if(bytes.length>0xffffffff)throw new RangeError('File too large for ZIP32.');
    const entry={filename,bytes,crc:crc32(bytes),offset:localSize};localSize+=30+filename.length+bytes.length;centralSize+=46+filename.length;return entry;
  });
  if(localSize+centralSize+22>0xffffffff)throw new RangeError('Archive too large for ZIP32.');
  const out=new Uint8Array(localSize+centralSize+22),view=new DataView(out.buffer);
  const u16=(p,n)=>view.setUint16(p,n,true),u32=(p,n)=>view.setUint32(p,n,true);
  let p=0;
  for(const e of prepared){u32(p,0x04034b50);u16(p+4,20);u16(p+6,0x800);u16(p+8,0);u16(p+12,0x21);u32(p+14,e.crc);u32(p+18,e.bytes.length);u32(p+22,e.bytes.length);u16(p+26,e.filename.length);out.set(e.filename,p+30);out.set(e.bytes,p+30+e.filename.length);p+=30+e.filename.length+e.bytes.length;}
  for(const e of prepared){u32(p,0x02014b50);u16(p+4,20);u16(p+6,20);u16(p+8,0x800);u16(p+14,0x21);u32(p+16,e.crc);u32(p+20,e.bytes.length);u32(p+24,e.bytes.length);u16(p+28,e.filename.length);u32(p+42,e.offset);out.set(e.filename,p+46);p+=46+e.filename.length;}
  u32(p,0x06054b50);u16(p+8,prepared.length);u16(p+10,prepared.length);u32(p+12,centralSize);u32(p+16,localSize);
  return out;
}
