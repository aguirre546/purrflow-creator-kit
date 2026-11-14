// Original procedural illustration. No generative service, remote asset, or audio.
const W=720,H=1280,TAU=Math.PI*2;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function round(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
function ellipse(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=fill;c.fill();}
function line(c,pts,color,width=5){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function wrap(c,text,max){const out=[];let row='';for(const word of String(text||'').split(/\s+/)){const test=row?row+' '+word:word;if(c.measureText(test).width<=max){row=test;continue;}if(row){out.push(row);row='';}for(const character of Array.from(word)){if(row&&c.measureText(row+character).width>max){out.push(row);row='';}row+=character;}}if(row)out.push(row);return out;}
function label(c,text,y,size=44,color='#143e3c'){c.fillStyle=color;c.font=`800 ${size}px system-ui, sans-serif`;c.textAlign='center';const lines=wrap(c,text,570);lines.slice(0,5).forEach((s,i)=>c.fillText(s,360,y+i*(size*1.2)));return lines.length*size*1.2;}
function cat(c,x,y,scale,t,{surprise=false,chef=false,sleeping=false}={}){
 c.save();c.translate(x,y);c.scale(scale,scale);const bob=Math.sin(t*4)*3;
 // Tail is behind the body and swings without changing the silhouette identity.
 c.save();c.translate(90,40);c.rotate(Math.sin(t*2.5)*.22);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(110,-15,110,-130,53,-103);c.strokeStyle='#e88132';c.lineWidth=33;c.lineCap='round';c.stroke();c.restore();
 ellipse(c,0,65,89,101,'#ee9646');ellipse(c,0,99,46,62,'#fff3dc');
 ellipse(c,-55,147,36,21,'#ee9646');ellipse(c,55,147,36,21,'#ee9646');
 c.translate(0,bob);c.beginPath();c.moveTo(-88,-58);c.lineTo(-87,-157);c.lineTo(-26,-109);c.lineTo(30,-109);c.lineTo(88,-157);c.lineTo(87,-58);c.closePath();c.fillStyle='#ee9646';c.fill();
 for(const side of [-1,1]){c.beginPath();c.moveTo(side*76,-133);c.lineTo(side*75,-76);c.lineTo(side*38,-105);c.fillStyle='#f5b4a3';c.fill();}
 ellipse(c,0,-52,106,88,'#f4a14d');ellipse(c,-29,-23,48,34,'#fff3dc');ellipse(c,29,-23,48,34,'#fff3dc');
 for(const side of [-1,1]){line(c,[[side*42,-124],[side*25,-100]],'#bf632b',10);line(c,[[side*94,-64],[side*74,-57]],'#bf632b',9);line(c,[[side*94,-40],[side*77,-35]],'#bf632b',8);}
 const blink=sleeping||Math.sin(t*1.2)>0.987;
 for(const side of [-1,1]){if(blink)line(c,[[side*39-20,-62],[side*39+20,-62]],'#234844',6);else{ellipse(c,side*40,-65,25,surprise?32:28,'#fffbed');ellipse(c,side*40,-63,14,23,'#75a64f');ellipse(c,side*40,-63,6,surprise?17:20,'#193f36');ellipse(c,side*40-4,-71,4,6,'white');}}
 c.beginPath();c.moveTo(-11,-29);c.quadraticCurveTo(0,-36,11,-29);c.lineTo(0,-18);c.closePath();c.fillStyle='#b96861';c.fill();
 if(surprise)ellipse(c,0,0,10,13,'#704638');else{c.beginPath();c.moveTo(-17,-3);c.quadraticCurveTo(-6,6,0,-9);c.quadraticCurveTo(6,6,17,-3);c.strokeStyle='#704638';c.lineWidth=4;c.stroke();}
 for(const side of [-1,1])for(let i=0;i<2;i++)line(c,[[side*54,-20+i*14],[side*108,-27+i*28]],'#8c6047',3);
 round(c,-67,25,134,19,8,'#287aa0');ellipse(c,0,49,13,15,'#f7ca66');ellipse(c,-4,44,3,3,'#fff8ce');
 if(chef){round(c,-70,-175,140,42,12,'#fffdf3');ellipse(c,-48,-177,34,29,'#fffdf3');ellipse(c,0,-191,40,34,'#fffdf3');ellipse(c,48,-177,34,29,'#fffdf3');}
 c.restore();
}
function plant(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);line(c,[[0,0],[0,-111]],'#346e54',7);for(const side of [-1,1]){ellipse(c,side*20,-70,25,12,'#6e9f69');ellipse(c,side*18,-105,24,12,'#86b57a');}round(c,-35,-9,70,62,10,'#cc7861');c.restore();}
function box(c,x,y,w=230,h=150){round(c,x,y,w,h,7,'#c99463');line(c,[[x,y+37],[x+w,y+37]],'#ac7449',3);c.fillStyle='#dda875';c.beginPath();c.moveTo(x,y);c.lineTo(x-25,y-31);c.lineTo(x+w*.45,y-15);c.lineTo(x+w*.5,y+20);c.closePath();c.fill();c.beginPath();c.moveTo(x+w,y);c.lineTo(x+w+26,y-30);c.lineTo(x+w*.54,y-15);c.lineTo(x+w*.5,y+20);c.closePath();c.fill();round(c,x+w*.43,y+40,w*.14,h-40,0,'#e6ba80');}
function fish(c,x,y,s=1,color='#d9a15e'){c.save();c.translate(x,y);c.scale(s,s);ellipse(c,0,0,32,17,color);c.beginPath();c.moveTo(-24,0);c.lineTo(-48,-19);c.lineTo(-48,19);c.closePath();c.fillStyle=color;c.fill();ellipse(c,17,-4,3,3,'#6c604a');line(c,[[-6,-10],[1,0],[-6,10]],'#ae7951',2);c.restore();}
function mouse(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);c.beginPath();c.moveTo(-19,5);c.bezierCurveTo(-46,19,-61,-8,-42,-13);c.strokeStyle='#ad807e';c.lineWidth=4;c.stroke();ellipse(c,0,0,29,16,'#9daaaa');ellipse(c,5,-14,10,12,'#bdc6bf');ellipse(c,5,-14,5,6,'#e8bbb2');ellipse(c,26,1,5,4,'#ce9690');ellipse(c,15,-4,3,3,'#365c54');c.restore();}
function cueText(campaign,t,scene,preset){
 const cues=campaign?.cues||campaign?.story?.cues||campaign?.subtitles;
 if(Array.isArray(cues)){const cue=cues.find(q=>t>=Number(q.start??q.startSeconds??0)&&t<Number(q.end??q.endSeconds??15));if(cue)return cue.text||cue.caption||'';}
 const scenes=campaign?.scenes||campaign?.story?.scenes;
 if(Array.isArray(scenes)&&scenes[scene])return typeof scenes[scene]==='string'?scenes[scene]:scenes[scene].caption||scenes[scene].text||'';
 const defaults={box:['I bought Mochi a fancy bed.','Mochi had other plans.','The box wins. Every time.'],shelf:['One rule: do not touch that shelf.','A tiny toy mouse. Just out of reach.','Mouse retrieved. Time for a proud nap.'],chef:['The chef is ready. So is Mochi.','A toy fish cookie needs inspection.','Empty plate. Paw stamp. Approved.']};
 return (defaults[preset]||defaults.box)[scene];
}
export function drawStory(canvas,time,campaign={},presetId='box'){
 if(canvas.width!==W)canvas.width=W;if(canvas.height!==H)canvas.height=H;
 const c=canvas.getContext('2d');if(!c)throw new Error('Canvas 2D is unavailable.');
 const aliases={catbedbox:'box','cat-bed-box':'box','bed-box':'box',forbiddenshelf:'shelf','forbidden-shelf':'shelf',tinychef:'chef','tiny-chef':'chef'};const preset=aliases[presetId]||presetId;
 const t=clamp(Number(time)||0,0,14.999),scene=t<3?0:t<7?1:2,local=t-(scene===0?0:scene===1?3:7);
 c.clearRect(0,0,W,H);c.fillStyle='#faf1df';c.fillRect(0,0,W,H);
 // The tall frame keeps captions above the subject and all essential artwork above social controls.
 round(c,34,34,652,1212,34,'#faf1df','#dfd9c9');
 c.fillStyle='#e5eadb';c.fillRect(35,465,650,500);c.fillStyle='#d1ddcb';c.fillRect(35,895,650,160);
 ellipse(c,390,1000,259,27,'#bdcbbb');
 c.save();c.globalAlpha=.75;round(c,74,498,160,217,68,'#fff8e7');line(c,[[154,502],[154,710]],'#c3d2bd',5);line(c,[[78,606],[228,606]],'#c3d2bd',5);c.restore();
 round(c,79,73,193,38,19,'#d9e7dd');c.font='700 17px system-ui, sans-serif';c.fillStyle='#27564c';c.textAlign='center';c.fillText('MOCHI MISCHIEF',175,99);
 c.textAlign='right';c.font='600 16px system-ui, sans-serif';c.fillStyle='#65786d';c.fillText('ORIGINAL ANIMATION',640,98);
 const title=String(campaign?.title||campaign?.story?.title||({box:'THE BOX WINS',shelf:'SHELF CONTROL',chef:'CHEF MOCHI'}[preset]||'MOCHI MOMENTS'));
 c.font='800 20px system-ui, sans-serif';const titleLines=wrap(c,title.toUpperCase(),570);c.fillStyle='#6d7b65';c.textAlign='center';titleLines.slice(0,2).forEach((row,i)=>{let value=row;if(i===1&&titleLines.length>2){while(c.measureText(value+'…').width>570)value=Array.from(value).slice(0,-1).join('');value+='…';}c.fillText(value,360,158+i*25);});
 let text=String(cueText(campaign,t,scene,preset));let size=46;
 c.font=`800 ${size}px system-ui, sans-serif`;while(wrap(c,text,570).length>4&&size>26){size-=2;c.font=`800 ${size}px system-ui, sans-serif`;}
 label(c,text,244,size);
 plant(c,615,837,.8);
 if(preset==='shelf'){
  round(c,294,835,321,21,8,'#98664c');round(c,321,856,13,190,4,'#b58564');round(c,590,856,13,190,4,'#b58564');
  if(scene===0){mouse(c,485,816);cat(c,250,822,1.02,t);}
  else if(scene===1){cat(c,320,829,.98,t);const reach=clamp(local/3,0,1);line(c,[[365,889],[411+reach*51,824]],'#ee9646',29);ellipse(c,411+reach*51,824,20,15,'#f4a14d');mouse(c,485-reach*25,816);}
  else{cat(c,424,962,.52,t,{sleeping:true});mouse(c,519,1031,.85);c.font='600 23px system-ui';c.fillStyle='#568a76';c.textAlign='center';c.fillText('Tiny mission. Peaceful ending.',360,1087);}
 }else if(preset==='chef'){
  cat(c,355,750,1.08,t,{chef:true,surprise:scene===1});round(c,91,918,538,31,13,'#ad7757');round(c,119,949,25,105,7,'#98664c');round(c,577,949,25,105,7,'#98664c');
  ellipse(c,362,918,105,17,'#fff9ee');ellipse(c,362,915,78,10,'#d7e5dc');
  if(scene<2)fish(c,362,901-Math.sin(t*3)*2,.9);
  round(c,478,858,56,56,9,'#f2c779');c.strokeStyle='#f2c779';c.lineWidth=9;c.beginPath();c.arc(540,880,16,-Math.PI/2,Math.PI/2);c.stroke();
  if(scene===2){const stamp=Math.sin(clamp(local/2,0,1)*Math.PI)*18;line(c,[[397,878],[382,898-stamp]],'#ee9646',32);ellipse(c,379,904-stamp,24,16,'#f4a14d');if(local>2){ellipse(c,355,919,10,8,'#9cae9d');for(const [dx,dy] of [[-12,-8],[-4,-13],[6,-13],[14,-7]])ellipse(c,355+dx,919+dy,4,5,'#9cae9d');}for(let i=0;i<5;i++){c.fillStyle='#e7b94b';c.font='32px system-ui';c.fillText('★',259+i*43,1059);}}
 }else{
  ellipse(c,185,961,111,34,'#467f77');ellipse(c,185,947,99,34,'#7aaca0');ellipse(c,185,947,74,20,'#b6d2b9');
  if(scene===0){box(c,453,857,156,133);cat(c,337,795,1.05,t);}
  else if(scene===1){box(c,383,872,225,145);const x=300+clamp(local/3,0,1)*180;cat(c,x,796-Math.sin(clamp(local/3,0,1)*Math.PI)*60,1.02,t,{surprise:true});}
  else{cat(c,451,801,1.03,t,{sleeping:true});box(c,330,886,248,139);ellipse(c,390,890,28,14,'#f4a14d');ellipse(c,509,890,28,14,'#f4a14d');fish(c,185,937,.68,'#e7ba6b');mouse(c,220,949,.5);}
 }
 // Progress and attribution are inside a conservative bottom safe area.
 for(let i=0;i<3;i++)round(c,294+i*47,1124,36,5,3,i===scene?'#287568':'#d4d6c6');
 c.font='600 17px system-ui, sans-serif';c.textAlign='center';c.fillStyle='#71816f';c.fillText('Made with PurrFlow Creator Kit',360,1185);
 c.font='14px system-ui, sans-serif';c.fillText('Procedural illustration · Silent short',360,1209);
 return canvas;
}
export function supportsRecording(){
 if(typeof MediaRecorder==='undefined'||typeof HTMLCanvasElement==='undefined'||!HTMLCanvasElement.prototype.captureStream)return {supported:false,mimeType:null,extension:null};
 for(const mimeType of ['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm']){if(MediaRecorder.isTypeSupported(mimeType))return {supported:true,mimeType,extension:mimeType.startsWith('video/mp4')?'mp4':'webm'};}
 return {supported:false,mimeType:null,extension:null};
}
export async function recordStory(canvas,campaign={},presetId='box',{onProgress,signal}={}){
 const support=supportsRecording();if(!support.supported)throw new Error('This browser cannot record Canvas video. Try a current Chrome or Edge browser.');
 if(signal?.aborted)throw new DOMException('Export cancelled.','AbortError');
 drawStory(canvas,0,campaign,presetId);const stream=canvas.captureStream(30);let recorder;
 try{recorder=new MediaRecorder(stream,{mimeType:support.mimeType,videoBitsPerSecond:4500000});}catch(error){stream.getTracks().forEach(track=>track.stop());throw error;}
 return new Promise((resolve,reject)=>{
  const chunks=[];let interval,deadline,started=0,settled=false,stopping=false,failure=null;
  const cleanup=()=>{clearInterval(interval);clearTimeout(deadline);signal?.removeEventListener('abort',abort);stream.getTracks().forEach(track=>track.stop());};
  const finish=(error)=>{if(settled)return;settled=true;cleanup();if(error)return reject(error);const mimeType=recorder.mimeType||support.mimeType;const blob=new Blob(chunks,{type:mimeType});if(!blob.size)return reject(new Error('The browser produced an empty recording. Please retry.'));resolve({blob,extension:mimeType.startsWith('video/mp4')?'mp4':'webm',mimeType,duration:15,width:W,height:H});};
  const stop=()=>{if(stopping||settled)return;stopping=true;clearInterval(interval);clearTimeout(deadline);try{if(recorder.state!=='inactive')recorder.stop();else finish(failure||new Error('Recording stopped before export completed.'));}catch(error){finish(error);}};
  const abort=()=>{failure=new DOMException('Export cancelled.','AbortError');stop();};
  recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data);};recorder.onerror=e=>{failure=e.error||new Error('Browser video recording failed.');stop();};recorder.onstop=()=>finish(failure);
  recorder.onstart=()=>{started=performance.now();try{onProgress?.(0);}catch(error){failure=error;stop();return;}interval=setInterval(()=>{const elapsed=(performance.now()-started)/1000;try{drawStory(canvas,Math.min(elapsed,14.999),campaign,presetId);onProgress?.(clamp(elapsed/15,0,1));if(elapsed>=15)stop();}catch(error){failure=error;stop();}},1000/30);deadline=setTimeout(()=>{try{drawStory(canvas,14.999,campaign,presetId);onProgress?.(1);}catch(error){failure=error;}stop();},15000);};
  signal?.addEventListener('abort',abort,{once:true});try{recorder.start(500);}catch(error){finish(error);}
 });
}
