// Game flow, input, menus and saving.
'use strict';
const $=id=>document.getElementById(id);
const SV={K:'hosepipeban.v1',D:null,
  load(){try{this.D=JSON.parse(localStorage.getItem(this.K))||{};}catch(e){this.D={};}const d=this.D;d.stars=d.stars||{};d.best=d.best||{};d.daily=d.daily||{};d.heat=d.heat||{best:0,bestN:0};
    d.opt=Object.assign({sound:true,vib:true,left:false,sens:1},d.opt||{});d.seen=d.seen||{};d.stats=d.stats||{plays:0,litres:0};},
  save(){try{localStorage.setItem(this.K,JSON.stringify(this.D));}catch(e){}}};
SV.load();

const GAME={state:'title',mode:'street',lv:null,idx:0,started:false,endT:0,heat:null,coach:null,float:[],flash:0,lastResult:null,touchId:null,tx:0,ty:0,daily:null,setBack:'sTitle'};
const LV=LEVELS.list;
function unlocked(i){return i===0||(SV.D.stars[LV[i-1].id]||0)>0;}
function heatOpen(){return (SV.D.stars.no5||0)>0;}
function dailyOpen(){return (SV.D.stars.no1||0)>0;}
function vib(ms){if(SV.D.opt.vib&&navigator.vibrate)try{navigator.vibrate(ms);}catch(e){}}

// ---------- screens
const SCREENS=['sTitle','sStreet','sHeat','sPause','sResult','sSettings'];
function show(id){for(const s of SCREENS)$(s).classList.toggle('hidden',s!==id);}
function hideAll(){for(const s of SCREENS)$(s).classList.add('hidden');}
const TITLE_LV=Object.assign({},LV[0],{id:'title',pots:[],water:1e6,time:1e6});
function toTitle(){GAME.state='title';$('hud').classList.add('hidden');$('intro').classList.add('hidden');AU.silence();
  SIM.newLevel(TITLE_LV);refreshTitle();show('sTitle');}
function refreshTitle(){const nx=LV.findIndex(l=>!(SV.D.stars[l.id]>0));$('bPlay').textContent=nx<0?'Back to the Close':nx===0?'Start watering':'Carry on: '+LV[nx].name;
  $('bHeat').disabled=!heatOpen();$('bHeat').textContent=heatOpen()?'Heatwave':'Heatwave (after No. 5)';
  $('bDaily').disabled=!dailyOpen();$('bDaily').textContent=dailyOpen()?"Today's garden":"Today's garden (after No. 1)";}
function street(){let tot=0;const h=$('houses');h.innerHTML='';
  LV.forEach((l,i)=>{const st=SV.D.stars[l.id]||0;tot+=st;const b=document.createElement('button');b.className='house'+(unlocked(i)?'':' locked');b.id='h-'+l.id;
    b.innerHTML='<span class="num">'+l.no+'</span><span class="nm">'+l.who+'<small>'+(unlocked(i)?l.line:'Water No. '+LV[i-1].no+' first')+'</small></span><span class="st">'+'&#9733;'.repeat(st)+'<i>'+'&#9733;'.repeat(3-st)+'</i></span>';
    b.onclick=()=>{if(!unlocked(i)){AU.play('tick');return;}tap();startStreet(i);};h.appendChild(b);});
  $('starTot').textContent=tot+' / '+LV.length*3+' \u2605';show('sStreet');}
function tap(){AU.init();AU.play('tick');}

// ---------- starting gardens
function begin(lv,skipIntro){const S=SIM.newLevel(lv);RD.invalidate();GAME.lv=lv;GAME.state='play';GAME.started=false;GAME.endT=0;GAME.float=[];GAME.touchId=null;
  hideAll();$('hud').classList.remove('hidden');
  $('hudName').textContent=(lv.name?lv.name+' \u00b7 ':'')+lv.who+(GAME.mode==='heat'?'  ('+GAME.heat.n+')':'');
  const spray=lv.beds&&lv.beds.some(b=>b.fragile)||(SV.D.stars.no9||0)>0||GAME.mode!=='street';$('bNozzle').classList.toggle('hidden',!spray);nozzleUI();
  $('watch').classList.toggle('hidden',!S.win);
  $('inNo').textContent=GAME.mode==='heat'?'Heatwave \u00b7 garden '+GAME.heat.n:GAME.mode==='daily'?"Today's garden \u00b7 "+U.today():'Larch Close \u00b7 '+lv.name;
  $('inWho').textContent=lv.who;$('inLine').textContent=lv.line||autoLine(lv);
  $('intro').classList.toggle('hidden',!!skipIntro);$('intro').style.opacity=1;
  GAME.coach=lv.coach?{k:lv.coach,step:0,t:0}:null;setCoach('');
  if(skipIntro)GAME.started=false;
  SV.D.stats.plays++;SV.save();}
function autoLine(lv){const f=[];if(lv.baskets&&lv.baskets.length)f.push('baskets up high');if(lv.wash)f.push('washing on the line');if(lv.beds.some(b=>b.fragile))f.push('seedlings');if(lv.wind)f.push('a breeze');if(lv.window)f.push('someone watching');if(lv.cat)f.push('a cat');if(lv.gh)f.push('a greenhouse');if(lv.trees&&lv.trees.length)f.push('an apple tree');
  if(!f.length)return 'Pots and beds. Nice and simple.';const last=f.pop();return (f.length?f.join(', ')+' and '+last:last).replace(/^./,c=>c.toUpperCase())+'.';}
function startStreet(i,skip){GAME.mode='street';GAME.idx=i;begin(LV[i],skip);}
function startDaily(skip){GAME.mode='daily';if(!GAME.daily||GAME.daily.date!==U.today()){const date=U.today();GAME.daily={date,lv:LEVELS.gen(U.hash('daily'+date),7)};GAME.daily.lv.no=0;}begin(GAME.daily.lv,skip);}
function startHeat(newRun){if(newRun||!GAME.heat)GAME.heat={seed:(Math.random()*1e9)|0,d:1,n:1,score:0};const H=GAME.heat;GAME.mode='heat';const lv=LEVELS.gen(H.seed+H.d*977,H.d);lv.time=Math.max(55,lv.time-Math.max(0,H.d-6)*2);begin(lv,false);}
function restart(){AU.play('start');if(GAME.mode==='street')startStreet(GAME.idx,true);else if(GAME.mode==='daily')startDaily(true);else{begin(GAME.lv,true);}}

// ---------- HUD + coach
function nozzleUI(){const S=SIM.S;const sp=S&&S.mode==='spray';$('bNozzle').classList.toggle('spray',sp);$('nozTxt').textContent=sp?'SPRAY':'JET';}
function setCoach(t){const c=$('coach');if(!t){c.classList.add('hidden');c.dataset.t='';return;}if(c.dataset.t!==t){c.textContent=t;c.dataset.t=t;}c.classList.remove('hidden');}
const COACH={1:[['Hold your finger anywhere to turn the tap on.',(S,c)=>S.flowing&&c.t>.25],
   ['Keep holding. Slide up to send the water further, down to bring it closer.',(S,c)=>Math.abs(S.aimEl-c.el0)>9],
   ['Slide sideways to swing the hose.',(S,c)=>Math.abs(S.aimAz-c.az0)>.25],
   ['Fill each pot past the white mark on its ring. Then move on before it overflows.',(S)=>S.seqDone>=1],
   ['Lift your finger to stop the water. Water every pot before dark.',(S,c)=>c.t>4]],
 5:[['Seedlings are fragile. Tap SPRAY for a gentle shower.',(S)=>S.mode==='spray'],['Spray only reaches close by. Switch back to JET for the far pots.',(S,c)=>c.t>5||S.mode==='jet']],
 7:[['When the curtain over the back fence twitches, let go. Spraying while they watch fills the eye.',(S,c)=>c.t>6]]};
function coachTick(dt){const c=GAME.coach,S=SIM.S;if(!c){return;}const steps=COACH[c.k];if(!steps||c.step>=steps.length){setCoach('');return;}
  if(c.el0==null){c.el0=S.aimEl;c.az0=S.aimAz;}
  if(c.k===7&&S.win&&S.win.st==='closed'&&c.step===0&&!c.seenTwitch){setCoach('');return;}
  if(c.k===7&&S.win&&S.win.st!=='closed')c.seenTwitch=true;
  c.t+=dt;setCoach(steps[c.step][0]);if(steps[c.step][1](S,c)){c.step++;c.t=0;c.el0=S.aimEl;c.az0=S.aimAz;if(c.step<steps.length)AU.play('tick');}}
function hud(){const S=SIM.S;const f=S.t/S.time;$('sun').style.left=(f*100)+'%';$('duskFill').style.width=((1-f)*100)+'%';
  $('buttFill').style.height=(S.water/S.cap*100)+'%';$('buttPar').style.bottom=(S.par/S.cap*100)+'%';$('buttTxt').textContent=(S.water<10?S.water.toFixed(1):Math.round(S.water))+' L';
  $('butt').classList.toggle('low',S.water<S.cap*.15);
  if(S.win){$('suspFill').style.width=(S.susp*100)+'%';const w=$('watch');w.classList.toggle('on',S.win.st==='watch');w.classList.toggle('warn',S.win.st==='twitch');}}

// ---------- events from the sim
const WORDS={sog:'Too much',flat:'Flattened',soaked:'Soaked it',gnome:'Oops',undone:'Dug up'};
function drain(){const S=SIM.S;for(const e of S.ev){
  switch(e.type){
  case 'done':AU.play('done',e.n);vib(12);break;
  case 'sog':AU.play('sog');vib(30);floatAt(e.u,WORDS.sog,'#ffb09a');if(!SV.D.seen.sog){SV.D.seen.sog=1;SV.save();toastCoach('Too much. Move on once the ring passes the white mark.');}break;
  case 'flat':AU.play('flat');vib(40);floatAt(e.u,WORDS.flat,'#ffb09a');if(S.mode==='jet')toastCoach('The jet flattens seedlings. Use SPRAY on them.');break;
  case 'soaked':AU.play('soaked');vib(30);GAME.float.push({x:SIM.S.wash.ax+(SIM.S.wash.bx-SIM.S.wash.ax)*(e.it.u0+e.it.u1)/2,y:SIM.S.wash.ay,z:2.2,t:0,txt:WORDS.soaked,col:'#ffb09a'});break;
  case 'gnome':AU.play('gnome');floatAt(e.g,WORDS.gnome,'#ffe0a0');break;
  case 'undone':AU.play('undone');floatAt(e.u,WORDS.undone,'#ffb09a');break;
  case 'cat':AU.play('cat');break;case 'catIn':AU.play('catIn');break;
  case 'twitch':AU.play('twitch');vib(15);break;case 'watch':AU.play('watch');break;case 'close':AU.play('close');break;
  case 'tink':AU.play('tink');break;case 'empty':AU.play('empty');break;
  case 'win':AU.play('win');vib([20,40,20]);GAME.flash=1;break;
  case 'fail':if(e.why==='caught'){AU.play('caught');vib(120);}else AU.play('fail');break;
  case 'mode':AU.play('mode',e.m);break;}}
  S.ev.length=0;}
function floatAt(o,txt,col){if(!o)return;GAME.float.push({x:o.x,y:o.y,z:o.h||o.z||.6,t:0,txt,col});}
let toastT=0;function toastCoach(t){if(GAME.coach&&COACH[GAME.coach.k]&&GAME.coach.step<COACH[GAME.coach.k].length)return;setCoach(t);toastT=3.2;}

// ---------- results
function finish(){const S=SIM.S,st=SIM.stars(),lv=GAME.lv;GAME.state='result';AU.silence();setCoach('');toastT=0;
  const won=st.won;const r={won,stars:st.n,why:S.why,water:S.water,used:S.used,t:S.t,tidy:st.tidy,par:st.par,mode:GAME.mode};GAME.lastResult=r;
  SV.D.stats.litres+=S.used;
  const kick=GAME.mode==='heat'?'Heatwave \u00b7 garden '+GAME.heat.n:GAME.mode==='daily'?"Today's garden":lv.name+' \u00b7 '+lv.who;$('rKick').textContent=kick;
  const T={caught:['Spotted','Someone saw you. That\u2019s a phone call to the water board.'],dark:['Too dark','You can\u2019t see what you\u2019re watering any more.'],dry:['Out of water','The butt is empty and there are still thirsty plants.']};
  $('rTitle').textContent=won?(st.n===3?'Lovely job':'Watered'):T[S.why][0];$('rWhy').textContent=won?(st.n===3?'Everything watered, nothing wasted.':'Everything\u2019s had a drink.'):T[S.why][1];
  let html='';for(let i=0;i<3;i++)html+=i<st.n?'<span style="animation-delay:'+(.15+i*.18)+'s">\u2605</span>':'<i>\u2605</i>';$('rStars').innerHTML=html;
  const left=S.units.filter(u=>!u.done).length;
  const li=(ok,t)=>'<li class="'+(ok?'y':'n')+'"><b>'+(ok?'\u2713':'\u2717')+'</b>'+t+'</li>';
  const probs=[];if(S.sog)probs.push(S.sog+' overwatered');if(S.flat)probs.push(S.flat+' flattened');if(S.soaked)probs.push('washing soaked');if(S.gnomes.some(g=>g.down))probs.push('gnome knocked over');
  $('rList').innerHTML=li(won,won?'Every plant watered':left+' plant'+(left>1?'s':'')+' still dry')+li(won&&st.tidy,probs.length?probs.join(', '):'Nothing overwatered or flattened')+li(won&&st.par,'Water left '+S.water.toFixed(1)+' L (line is '+S.par+' L)');
  $('rStat').textContent='Used '+S.used.toFixed(1)+' L \u00b7 '+Math.round(S.t)+' s';
  let nextTxt='Next garden',nextOk=true;
  if(GAME.mode==='street'){const id=lv.id;if(st.n>(SV.D.stars[id]||0))SV.D.stars[id]=st.n;const b=SV.D.best[id];if(won&&(!b||S.water>b))SV.D.best[id]=+S.water.toFixed(2);
    nextOk=won&&GAME.idx<LV.length-1;if(won&&GAME.idx===LV.length-1){nextTxt='That\u2019s the whole Close';nextOk=false;$('rWhy').textContent+=' That was the last house. Try Heatwave next.';}}
  else if(GAME.mode==='daily'){const d=SV.D.daily[U.today()]||{stars:0,water:0};if(st.n>d.stars||(st.n===d.stars&&S.water>d.water))SV.D.daily[U.today()]={stars:st.n,water:+S.water.toFixed(2)};nextOk=false;nextTxt='Come back tomorrow';
    $('rStat').textContent+=' \u00b7 best today '+'\u2605'.repeat(SV.D.daily[U.today()]?.stars||0);}
  else{const H=GAME.heat;if(won){const pts=100*st.n+Math.round(S.water*10);H.score+=pts;$('rStat').textContent+=' \u00b7 +'+pts+' \u00b7 total '+H.score;nextTxt='Next garden';}
    else{const nb=H.score>SV.D.heat.best;if(nb){SV.D.heat.best=H.score;SV.D.heat.bestN=H.n-1;}$('rWhy').textContent+=' Run over after '+(H.n-1)+' garden'+(H.n-1===1?'':'s')+'. Score '+H.score+(nb?', a new best.':'. Best '+SV.D.heat.best+'.');nextTxt='New run';}}
  SV.save();
  $('bNext').textContent=nextTxt;$('bNext').disabled=!nextOk&&GAME.mode!=='heat';$('bNext').classList.toggle('hidden',GAME.mode==='daily'&&!won);
  $('bAgain').textContent=GAME.mode==='heat'&&!won?'Retry this garden':'Try again';
  // heatwave failure: retrying a garden doesn't keep the run going
  $('bAgain').classList.toggle('hidden',GAME.mode==='heat'&&!won);
  show('sResult');}

// ---------- input: the whole screen is the hose
const cv=$('cv');
function down(e){if(GAME.state!=='play'||GAME.touchId!==null)return;e.preventDefault();GAME.touchId=e.pointerId;try{cv.setPointerCapture(e.pointerId);}catch(_){}
  GAME.tx=e.clientX;GAME.ty=e.clientY;AU.init();
  if(!GAME.started){GAME.started=true;$('intro').style.opacity=0;setTimeout(()=>{if(GAME.started)$('intro').classList.add('hidden');},300);}
  SIM.setFlow(true);}
function move(e){if(e.pointerId!==GAME.touchId)return;e.preventDefault();const ev=e.getCoalescedEvents?e.getCoalescedEvents():null;
  const pts=ev&&ev.length?ev:[e];for(const p of pts){const dx=p.clientX-GAME.tx,dy=p.clientY-GAME.ty;GAME.tx=p.clientX;GAME.ty=p.clientY;SIM.aimBy(dx/RD.s,dy/RD.s,SV.D.opt.sens);}}
function up(e){if(e.pointerId!==GAME.touchId)return;GAME.touchId=null;SIM.setFlow(false);}
cv.addEventListener('pointerdown',down,{passive:false});cv.addEventListener('pointermove',move,{passive:false});
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('lostpointercapture',up);
document.addEventListener('touchmove',e=>{if(!e.target.closest||!e.target.closest('#houses,.sl'))e.preventDefault();},{passive:false});
document.addEventListener('contextmenu',e=>e.preventDefault());
function pause(){if(GAME.state!=='play')return;GAME.state='paused';GAME.touchId=null;SIM.setFlow(false);AU.silence();show('sPause');}
function resume(){if(GAME.state!=='paused')return;hideAll();GAME.state='play';}
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();AU.suspend();}else AU.resume();});
window.addEventListener('blur',()=>{GAME.touchId=null;SIM.setFlow(false);});
window.addEventListener('resize',()=>{RD.resize();});

// ---------- buttons
function on(id,f){$(id).addEventListener('click',e=>{e.stopPropagation();f(e);});}
on('bPlay',()=>{tap();const nx=LV.findIndex(l=>!(SV.D.stars[l.id]>0));if(nx<0)street();else startStreet(nx);});
on('bStreet',()=>{tap();street();});
on('bDaily',()=>{tap();startDaily();});
on('bHeat',()=>{tap();$('heatBest').textContent=SV.D.heat.best?'Best: '+SV.D.heat.best+' points, '+SV.D.heat.bestN+' gardens.':'No runs yet.';show('sHeat');});
on('bHeatGo',()=>{tap();startHeat(true);});
on('bSettings',()=>{tap();GAME.setBack='sTitle';settings();});
document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>{tap();show(b.dataset.back);if(b.dataset.back==='sTitle')refreshTitle();}));
on('bPause',()=>{tap();pause();});
on('bRestart',()=>{AU.init();if(GAME.state==='play')restart();});
on('bNozzle',()=>{AU.init();const S=SIM.S;if(!S||GAME.state!=='play')return;SIM.setMode(S.mode==='jet'?'spray':'jet');nozzleUI();});
on('bResume',()=>{tap();resume();});
on('bPRestart',()=>{restart();});
on('bPSettings',()=>{tap();GAME.setBack='sPause';settings();});
on('bQuit',()=>{tap();toTitle();street();});
on('bNext',()=>{tap();if(GAME.mode==='street')startStreet(GAME.idx+1);else if(GAME.mode==='heat'){if(GAME.lastResult.won){GAME.heat.d++;GAME.heat.n++;startHeat(false);}else startHeat(true);}});
on('bAgain',()=>{restart();});
on('bResMenu',()=>{tap();toTitle();street();});
function settings(){const o=SV.D.opt;$('optSound').checked=o.sound;$('optVib').checked=o.vib;$('optLeft').checked=o.left;$('optSens').value=o.sens;$('sensV').textContent=(+o.sens).toFixed(1);show('sSettings');}
on('bSetBack',()=>{tap();show(GAME.setBack);if(GAME.setBack==='sTitle')refreshTitle();});
$('optSound').addEventListener('change',e=>{SV.D.opt.sound=e.target.checked;AU.setOn(SV.D.opt.sound);SV.save();AU.init();AU.play('tick');});
$('optVib').addEventListener('change',e=>{SV.D.opt.vib=e.target.checked;SV.save();vib(20);});
$('optLeft').addEventListener('change',e=>{SV.D.opt.left=e.target.checked;document.body.classList.toggle('left',SV.D.opt.left);SV.save();});
$('optSens').addEventListener('input',e=>{SV.D.opt.sens=+e.target.value;$('sensV').textContent=(+e.target.value).toFixed(1);SV.save();});
let resetArm=0;on('bReset',()=>{if(Date.now()-resetArm<2500){const o=SV.D.opt;localStorage.removeItem(SV.K);SV.load();SV.D.opt=o;SV.save();$('bReset').textContent='Progress cleared';resetArm=0;}else{resetArm=Date.now();$('bReset').textContent='Tap again to clear everything';}});

// ---------- loop
let last=performance.now(),acc=0,fps=60;
function aimMarker(S){const h=SIM.trace(S.aimAz,S.aimEl,S.mode);if(h.type==='over'||h.type==='none')return {ok:false};return {ok:true,x:h.x,y:h.y,z:h.z};}
function loop(now){requestAnimationFrame(loop);let dt=(now-last)/1000;last=now;if(dt>.1)dt=.1;fps=fps*.95+(1/Math.max(.001,dt))*.05;
  const S=SIM.S;
  if(GAME.state==='play'){
    if(GAME.started)SIM.step(dt);else{S.flowing=false;}
    drain();coachTick(dt);if(toastT>0){toastT-=dt;if(toastT<=0)setCoach('');}
    if(S.state!=='play'){GAME.endT+=dt;if(GAME.endT>(S.state==='won'?1.0:1.2))finish();}
    hud();AU.update(S,dt,S.t/S.time);}
  else if(GAME.state==='result'){SIM.step(dt);AU.update(null,dt,0);}
  else if(GAME.state==='title'&&S){const k=now/1000;S.flowing=true;S.aimAz=Math.sin(k*.45)*.55;S.aimEl=20+Math.sin(k*.8)*12;S.t=0;SIM.step(dt);AU.update(null,dt,0);}
  GAME.flash=Math.max(0,GAME.flash-dt*2);
  if(S){RD.frame(S,now/1000,{reticle:GAME.state==='play'&&GAME.started&&S.state==='play'?aimMarker(S):null,flash:GAME.flash});drawFloat(dt);}}
function drawFloat(dt){if(!GAME.float.length)return;const g=cv.getContext('2d');g.textAlign='center';g.font='bold '+Math.round(RD.s*.42)+'px Georgia,serif';
  GAME.float=GAME.float.filter(f=>(f.t+=dt)<1.4);for(const f of GAME.float){const [x,y]=RD.toScreen(f.x,f.y,f.z);const a=Math.min(1,(1.4-f.t)*2);g.globalAlpha=a;g.lineWidth=3;g.strokeStyle='rgba(30,25,15,.8)';g.strokeText(f.txt,x,y-RD.s*.5-f.t*RD.s*.6);g.fillStyle=f.col;g.fillText(f.txt,x,y-RD.s*.5-f.t*RD.s*.6);}g.globalAlpha=1;}

RD.init(cv);AU.setOn(SV.D.opt.sound);document.body.classList.toggle('left',SV.D.opt.left);toTitle();requestAnimationFrame(loop);
window.GAME=GAME;window.SV=SV;
GAME.pause=pause;GAME.restart=restart;GAME.startStreet=startStreet;GAME.startHeat=startHeat;GAME.startDaily=startDaily;GAME.toTitle=toTitle;
