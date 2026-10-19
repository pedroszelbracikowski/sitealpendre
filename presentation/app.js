(() => {
'use strict';
const $ = q => document.querySelector(q);
const stage = $('#stage'), plane = $('#sitePlane'), frame = $('#siteFrame'), cursor = $('#demoCursor');
const slot = $('#emptySlot'), fill = $('#slotFill'), avatar = $('#avatarSlot'), video = $('#avatarVideo');
const title = $('#captionTitle'), caption = $('#caption'), subtitle = $('#captionSub'), micro = $('#captionMicro');
const play = $('#playButton'), scrubber = $('#scrubber'), display = $('#timecode');
const TOTAL = 120;
const scenes = [
 {at:0,end:10,name:'O VAZIO',category:'O PRÓLOGO',title:'Tudo começa com espaço.',sub:'O silêncio antes da descoberta.',micro:'01 / EMPTY SPACE',kind:'empty',style:'curtain',tag:'O VAZIO TAMBÉM É COMPOSIÇÃO.'},
 {at:10,end:23,name:'A PRESENÇA',category:'A EXPERIÊNCIA DIGITAL',title:'Uma presença. Uma intenção.',sub:'A Alpendre se apresenta sem pressa.',micro:'02 / HEYGEM PRESENCE',kind:'avatar',style:'whisper',tag:'TAKE A · APRESENTADOR',take:1},
 {at:23,end:38,name:'REVELAR',category:'01 / A PRIMEIRA IMPRESSÃO',title:'Entre. A casa é sua.',sub:'Uma tela ganha matéria, movimento e profundidade.',micro:'03 / LIVE WEBSITE',kind:'hero',style:'curtain',tag:'SITE ORIGINAL · HERO IMERSIVA'},
 {at:38,end:52,name:'DESCOBRIR',category:'02 / O GESTO',title:'Navegar é descobrir.',sub:'O menu se revela e devolve o controle ao visitante.',micro:'04 / MENU INTERACTION',kind:'menu',style:'track',tag:'MENU · MODAL · REVELAÇÃO'},
 {at:52,end:72,name:'PERCORRER',category:'03 / A EXPLORAÇÃO',title:'Três casas. Novos caminhos.',sub:'Carrossel manual, escolha consciente e detalhes por projeto.',micro:'05 / INTERACTIVE CAROUSEL',kind:'projects',style:'curtain',tag:'CARROSSEL · CLIQUE · DIÁLOGO'},
 {at:72,end:87,name:'APROFUNDAR',category:'04 / A MATÉRIA',title:'O detalhe transforma tudo.',sub:'Acordeão, máscara ascendente e fotografia em movimento.',micro:'06 / MATERIAL REVEAL',kind:'materials',style:'fill',tag:'SANFONA · CLIP-PATH · FOTOGRAFIA'},
 {at:87,end:103,name:'RESSONÂNCIA',category:'O DESIGN INVISÍVEL',title:'A interface abre espaço.',sub:'Para a arquitetura, para a paisagem, para a experiência.',micro:'07 / HEYGEM PRESENCE',kind:'avatar',style:'whisper',tag:'TAKE B · APRESENTADOR',take:2},
 {at:103,end:120,name:'PERTENCER',category:'A ASSINATURA',title:'Arquitetura para pertencer.',sub:'ALPENDRE — THE DIGITAL EXPERIENCE.',micro:'08 / THE END',kind:'outro',style:'curtain',tag:'ASSINATURA · EXPERIÊNCIA DIGITAL',take:3}
];
const state = {time:0,playing:false,scene:-1,lastStamp:null,frameReady:false,guide:true,frameCue:'',objectUrls:[],files:{}};
const anim = window.gsap;
if (!anim) { $('#liveStatus').textContent = 'GSAP INDISPONÍVEL'; return; }
const set = (el,props) => anim.set(el,props);
const timeString = t => String(Math.floor(t/60)).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0');
function notice(text){const n=$('#notice'); n.textContent=text;anim.killTweensOf(n);anim.fromTo(n,{autoAlpha:0,y:-15},{autoAlpha:1,y:0,duration:.3,onComplete:()=>anim.to(n,{autoAlpha:0,y:-15,duration:.4,delay:3.8})});}
function wrapTitle(s){
 title.replaceChildren();
 s.split(/(\s+)/).forEach(part=>{if(!part.trim()){title.append(document.createTextNode(part));return;}
 const word=document.createElement('span'); word.className='word';const inner=document.createElement('span');inner.textContent=part;word.append(inner);title.append(word);
 });
}
function resetPresentation(){
 anim.killTweensOf([plane,slot,fill,avatar,cursor,caption,title,subtitle,$('#detailTag'),$('#stageNumber')]);
 set(plane,{autoAlpha:0,x:0,y:0,z:0,rotationY:0,rotationX:0,scale:1});
 set(slot,{autoAlpha:0,x:0,y:0,scale:1,rotationY:-9,rotationX:5});
 set(fill,{width:'0%'});set(avatar,{autoAlpha:0,x:60,y:0,scale:.96});
 set(caption,{autoAlpha:1,x:0,y:0});set(subtitle,{autoAlpha:0,y:10});
 set(cursor,{autoAlpha:0,x:0,y:0,scale:1});
 set($('#detailTag'),{autoAlpha:0,y:10});
}
function introWords(){set(title.querySelectorAll('.word > span'),{yPercent:115,autoAlpha:0});anim.to(title.querySelectorAll('.word > span'),{yPercent:0,autoAlpha:1,duration:1.05,stagger:.075,ease:'power3.out',delay:.12});anim.to(subtitle,{autoAlpha:1,y:0,duration:.65,delay:.52});anim.to($('#detailTag'),{autoAlpha:1,y:0,duration:.6,delay:.7});}
function scaleForPlane(){return Math.min((stage.clientWidth*.70)/1440,(stage.clientHeight*.78)/900,1.15)}
function camera(kind){
 const s=scaleForPlane();
 const poses={
  hero:{x:stage.clientWidth*.13,y:stage.clientHeight*-.055,scale:s,rotationY:-15,rotationX:7},
  menu:{x:stage.clientWidth*.13,y:stage.clientHeight*-.04,scale:s*1.05,rotationY:12,rotationX:-4},
  projects:{x:stage.clientWidth*.13,y:stage.clientHeight*-.03,scale:s,rotationY:-10,rotationX:3},
  materials:{x:stage.clientWidth*.13,y:stage.clientHeight*-.04,scale:s*1.02,rotationY:10,rotationX:3}
 };
 return poses[kind]||poses.hero;
}
function frameDocument(){try{return frame.contentDocument}catch{return null}}
function frameWindow(){try{return frame.contentWindow}catch{return null}}
function click(selector){
 const el=frameDocument()?.querySelector(selector);
 if(!el){notice('Elemento '+selector+' não localizado no site.');return false}
 el.click();return true;
}
function scroll(selector){const doc=frameDocument();const el=doc?.querySelector(selector);if(!el)return false;el.scrollIntoView({block:'start',behavior:'instant'});return true}
function resetFrame(){const w=frameWindow(),doc=frameDocument();if(!w||!doc)return;try{
 doc.querySelectorAll('dialog[open]').forEach(d=>d.close());
 w.scrollTo({top:0,behavior:'instant'});
}catch{}}
function animateCursor(x,y,duration=.8){anim.to(cursor,{autoAlpha:1,x,y,duration,ease:'power2.inOut'})}
function pulse(){const p=cursor.querySelector('.cursor-pulse');anim.fromTo(p,{autoAlpha:.9,scale:.25},{autoAlpha:0,scale:1.3,duration:.48,ease:'power2.out'});anim.fromTo(cursor,{scale:.83},{scale:1,duration:.27,ease:'power2.out'});}
function cursorAt(selector){const doc=frameDocument();const el=doc?.querySelector(selector);if(!el)return false;const r=el.getBoundingClientRect();animateCursor(r.left+r.width*.5,r.top+r.height*.5);return true}
const cues = {
 menu:[{after:3,act:()=>{cursorAt('.menu-trigger');}},{after:4.2,act:()=>{pulse();click('.menu-trigger')}},{after:8,act:()=>cursorAt('#navigation a[href="#percursos"]')}],
 projects:[{after:1.8,act:()=>scroll('#percursos')},{after:4.0,act:()=>cursorAt('.carousel-next')},{after:5.1,act:()=>{pulse();click('.carousel-next')}},{after:8.7,act:()=>cursorAt('.project-slide[data-project="patio"] .project-open')},{after:9.8,act:()=>{pulse();click('.project-slide[data-project="patio"] .project-open')}},{after:14.3,act:()=>cursorAt('.dialog-next')},{after:15.2,act:()=>{pulse();click('.dialog-next')}}],
 materials:[{after:1.4,act:()=>scroll('#materia')},{after:4,act:()=>cursorAt('.material-list details:nth-child(2) summary')},{after:5.3,act:()=>{pulse();click('.material-list details:nth-child(2) summary')}},{after:9,act:()=>cursorAt('.material-list details:nth-child(3) summary')},{after:10,act:()=>{pulse();click('.material-list details:nth-child(3) summary')}}]
};
function prepareFrame(kind){if(!state.frameReady)return;if(kind==='hero'){resetFrame();return}if(kind==='menu'){resetFrame();return}if(kind==='projects'||kind==='materials'){resetFrame();scroll(kind==='projects'?'#percursos':'#materia')}}
function showAvatar(take){$('#avatarNumber').textContent='TAKE 0'+take;const url=state.files[take];video.pause();if(url){if(video.src!==url)video.src=url;avatar.classList.add('has-video');$('#avatarUploadLabel').textContent='ALTERAR TAKE HEYGEM';}else{video.removeAttribute('src');avatar.classList.remove('has-video');$('#avatarUploadLabel').innerHTML='+ INSERIR TAKE HEYGEM <input type="file" id="avatarUpload" accept="video/*" hidden>';bindUpload()}avatar.dataset.take=take;}
function bindUpload(){const input=$('#avatarUpload');if(!input)return;input.onchange=e=>{const f=e.target.files[0];if(!f)return;const take=Number(avatar.dataset.take)||1;if(state.files[take])URL.revokeObjectURL(state.files[take]);const u=URL.createObjectURL(f);state.files[take]=u;showAvatar(take);syncVideo();notice('Take 0'+take+' carregado localmente: '+f.name)}}
function sceneEnter(index){
 const s=scenes[index];state.scene=index;state.frameCue='';resetPresentation();
 $('#captionIndex').textContent=String(index+1).padStart(2,'0')+' / 08';
 $('#captionCategory').textContent=s.category;$('#captionMicro').textContent=s.micro;$('#detailText').textContent=s.tag;
 $('#stageNumber').textContent=String(index+1).padStart(2,'0');
 $('#sceneName').textContent=String(index+1).padStart(2,'0')+' / '+s.name;
 $('#liveStatus').textContent=s.kind==='empty'?'ESPAÇO DE ESPERA':s.kind==='avatar'?'HEYGEM / SLOT LOCAL':s.kind==='outro'?'ASSINATURA':'INTERFACE ORIGINAL / LIVE';
 caption.dataset.style=s.style;wrapTitle(s.title);subtitle.textContent=s.sub;
 introWords();
 if(s.kind==='empty'){
 anim.fromTo(slot,{autoAlpha:0,scale:.91,y:35},{autoAlpha:1,scale:1,y:0,duration:1.2,ease:'power3.out'});
 anim.to(fill,{width:'100%',duration:Math.max(2,s.end-s.at-1),ease:'none'});
 }else if(s.kind==='avatar'){
 showAvatar(s.take);anim.to(avatar,{autoAlpha:1,x:0,duration:1.35,ease:'power3.out',delay:.15});syncVideo();
 }else if(s.kind==='outro'){
 anim.fromTo(slot,{autoAlpha:0,scale:1.15,rotationY:17},{autoAlpha:.45,scale:1,rotationY:-9,duration:1.8,ease:'power3.out'});
 anim.to(fill,{width:'100%',duration:15,ease:'none'});
 }else{
 prepareFrame(s.kind);
 const p=camera(s.kind);
 anim.fromTo(plane,{autoAlpha:0,x:p.x+130,y:p.y+75,scale:p.scale*.91,rotationY:p.rotationY-9,rotationX:p.rotationX+5},{autoAlpha:1,x:p.x,y:p.y,scale:p.scale,rotationY:p.rotationY,rotationX:p.rotationX,duration:1.8,ease:'power3.out',delay:.12});
 if(s.kind==='materials'){anim.to(plane,{rotationY:4,x:p.x-20,duration:9,ease:'sine.inOut',delay:2})}
 else{anim.to(plane,{rotationY:p.rotationY+3,y:p.y-12,duration:10,ease:'sine.inOut',delay:2})}
 }
 [...$('#timelineChapters').children].forEach((b,i)=>b.classList.toggle('active',i===index));
}
function syncVideo(){if(!avatar.classList.contains('has-video'))return;const scene=scenes[state.scene];if(!scene||scene.kind!=='avatar')return;const target=Math.max(0,state.time-scene.at);if(Number.isFinite(video.duration)&&Math.abs(video.currentTime-target)>.55){try{video.currentTime=Math.min(target,video.duration-.05)}catch{}}if(state.playing){video.play().catch(()=>{})}else video.pause()}
function resolveIndex(t){return Math.max(0,scenes.findIndex(s=>t>=s.at&&t<s.end)===-1?scenes.length-1:scenes.findIndex(s=>t>=s.at&&t<s.end))}
function seek(t){state.time=Math.min(TOTAL,Math.max(0,t));const i=resolveIndex(Math.min(state.time,TOTAL-.001));if(i!==state.scene){sceneEnter(i)}updateUI();syncVideo()}
function updateUI(){display.textContent=timeString(state.time)+' / '+timeString(TOTAL);scrubber.value=state.time;scrubber.style.setProperty('--progress',(state.time/TOTAL*100)+'%')}
function cueTick(previous,current){if(!state.frameReady)return;const scene=scenes[state.scene];const list=cues[scene?.kind]||[];for(const cue of list){const at=scene.at+cue.after;if(previous<at&&current>=at){cue.act()}}}
function tick(stamp){if(state.lastStamp===null)state.lastStamp=stamp;const elapsed=Math.min(.1,(stamp-state.lastStamp)/1000);state.lastStamp=stamp;if(state.playing){let old=state.time;state.time=Math.min(TOTAL,state.time+elapsed);if(state.time>=TOTAL){state.playing=false;play.textContent='▶';play.setAttribute('aria-label','Reproduzir apresentação');}if(resolveIndex(Math.min(state.time,TOTAL-.001))!==state.scene)seek(state.time);else{cueTick(old,state.time);updateUI();}syncVideo()}requestAnimationFrame(tick)}
function toggle(){if(state.time>=TOTAL)seek(0);state.playing=!state.playing;play.textContent=state.playing?'Ⅱ':'▶';play.setAttribute('aria-label',state.playing?'Pausar':'Reproduzir apresentação');syncVideo()}
const nav=$('#timelineChapters');scenes.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.textContent=String(i+1).padStart(2,'0');b.title=s.name+' · '+timeString(s.at);b.addEventListener('click',()=>seek(s.at));nav.append(b)});
play.addEventListener('click',toggle);$('#prevButton').addEventListener('click',()=>seek(scenes[Math.max(0,state.scene-1)].at));$('#nextButton').addEventListener('click',()=>seek(scenes[Math.min(scenes.length-1,state.scene+1)].at));
scrubber.addEventListener('input',()=>{state.playing=false;play.textContent='▶';seek(Number(scrubber.value))});
$('#guideButton').addEventListener('click',()=>{state.guide=!state.guide;$('#experience').classList.toggle('no-guides',!state.guide);$('#guideButton').textContent='GUIAS: '+(state.guide?'ON':'OFF');$('#guideButton').setAttribute('aria-pressed',String(state.guide))});
$('#fullscreenButton').addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen();else $('#experience').requestFullscreen?.()});
document.addEventListener('keydown',e=>{if(e.target.matches('input,button'))return;if(e.code==='Space'){e.preventDefault();toggle()}if(e.key==='ArrowRight')seek(scenes[Math.min(scenes.length-1,state.scene+1)].at);if(e.key==='ArrowLeft')seek(scenes[Math.max(0,state.scene-1)].at)});
frame.addEventListener('load',()=>{state.frameReady=true;$('#liveStatus').textContent='SITE ORIGINAL CONECTADO';if(state.scene>=0){const s=scenes[state.scene];if(['hero','menu','projects','materials'].includes(s.kind))prepareFrame(s.kind)}});
window.addEventListener('resize',()=>{const s=scenes[state.scene];if(!s||!['hero','menu','projects','materials'].includes(s.kind))return;set(plane,camera(s.kind))});
bindUpload();seek(0);requestAnimationFrame(tick);
window.AlpendreKeynote={seek,play:toggle,chapters:scenes,inspect:()=>({time:state.time,scene:state.scene,frameReady:state.frameReady})};
})();
