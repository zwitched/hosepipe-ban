// All sound is synthesised with Web Audio: the hose hiss, water landing on different surfaces, and small event sounds.
'use strict';
const AU=(()=>{
let ctx=null,master=null,on=true,hiss=null,hissF=null,beds=[],nb=null,birdT=3,crickT=0;
function init(){if(ctx){if(ctx.state==='suspended')ctx.resume();return;}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ctx=new AC();master=ctx.createGain();master.gain.value=on?.8:0;master.connect(ctx.destination);
  const len=ctx.sampleRate*2;nb=ctx.createBuffer(1,len,ctx.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  const loop=(type,f,q)=>{const s=ctx.createBufferSource();s.buffer=nb;s.loop=true;s.loopStart=Math.random();const fl=ctx.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=ctx.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(master);s.start();return {g,fl};};
  hiss=loop('bandpass',2400,.6);hissF=hiss.fl;
  beds=[loop('lowpass',700,.7),loop('bandpass',3200,1.4),loop('bandpass',1600,.6),loop('bandpass',850,4)];}
function setOn(v){on=!!v;if(master)master.gain.setTargetAtTime(on?.8:0,ctx.currentTime,.03);}
function env(t0,a,d,peak){const g=ctx.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(peak,t0+a);g.gain.exponentialRampToValueAtTime(.0001,t0+a+d);g.connect(master);return g;}
function tone(f,type,a,d,peak,f2,delay){if(!ctx||!on)return;const t0=ctx.currentTime+(delay||0);const o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t0);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+a+d);o.connect(env(t0,a,d,peak));o.start(t0);o.stop(t0+a+d+.05);}
function noise(f,q,type,a,d,peak,f2,delay){if(!ctx||!on)return;const t0=ctx.currentTime+(delay||0);const s=ctx.createBufferSource();s.buffer=nb;const fl=ctx.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,t0);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t0+a+d);fl.Q.value=q;s.connect(fl);fl.connect(env(t0,a,d,peak));s.start(t0,Math.random());s.stop(t0+a+d+.05);}
const PENT=[0,2,4,7,9,12,14,16,19,21,24,26,28,31];
const SFX={
  done(n){tone(170,'sine',.004,.12,.5,80);const st=PENT[Math.min(PENT.length-1,(n||1)-1)];tone(523.25*Math.pow(2,st/12),'triangle',.005,.55,.22);tone(523.25*Math.pow(2,(st+12)/12),'sine',.005,.3,.06,null,.01);},
  sog(){for(let i=0;i<4;i++)tone(140+Math.random()*80,'sine',.01,.08,.25,60+Math.random()*30,i*.06);},
  flat(){noise(900,.8,'lowpass',.004,.18,.5,200);},
  soaked(){noise(500,1,'lowpass',.004,.22,.5);tone(110,'sine',.004,.15,.3,70);},
  gnome(){tone(1900,'square',.001,.05,.08);tone(1300,'square',.001,.07,.07,null,.06);noise(3000,2,'bandpass',.002,.1,.25,null,.05);},
  cat(){const t=.0;tone(620,'sawtooth',.03,.28,.07,380);noise(2500,1,'bandpass',.01,.25,.12,900);},
  catIn(){noise(1800,.8,'bandpass',.05,.3,.05);},
  twitch(){noise(1200,.6,'bandpass',.12,.35,.12,3500);},
  watch(){tone(330,'sine',.02,.25,.08);tone(294,'sine',.02,.35,.08,null,.18);},
  close(){noise(2800,.6,'bandpass',.08,.25,.06,900);},
  caught(){tone(1800,'sine',.01,.25,.18,1500);tone(1800,'sine',.01,.5,.18,1100,.3);},
  win(){[0,4,7,12,16].forEach((s,i)=>tone(392*Math.pow(2,s/12),'triangle',.005,.6,.18,null,i*.08));},
  fail(){tone(220,'triangle',.01,.4,.18);tone(185,'triangle',.01,.7,.18,null,.25);},
  mode(m){tone(m==='spray'?1400:700,'square',.001,.03,.06);noise(4000,1,'highpass',.001,.04,.12);},
  tick(){tone(900,'square',.001,.02,.04);},
  empty(){for(let i=0;i<5;i++)noise(1500,1,'bandpass',.005,.05,.2,null,i*.09);},
  undone(){noise(700,1,'bandpass',.01,.15,.15);},
  tink(){tone(3200+Math.random()*900,'sine',.001,.12,.05);},
  start(){noise(800,.7,'lowpass',.01,.12,.3);tone(95,'sine',.005,.12,.2,60);},
};
function play(name,arg){if(!ctx||!on)return;const f=SFX[name];if(f)f(arg);}
function bird(){const base=1800+Math.random()*900;const n=3+(Math.random()*4|0);for(let i=0;i<n;i++){const f=base*(.8+Math.random()*.6);tone(f,'sine',.01,.08+Math.random()*.08,.025,f*(Math.random()<.5?.7:1.3),i*.13+Math.random()*.03);}}
// called every frame while a garden is running
function update(S,dt,dusk){if(!ctx)return;const t=ctx.currentTime;
  const flow=S?S.flowT:0,spray=S&&S.mode==='spray';
  hiss.g.gain.setTargetAtTime(flow*(spray?.16:.11),t,.025);hissF.frequency.setTargetAtTime(spray?4200:2300,t,.05);
  if(S){const k=[.5,.6,.35,.5];for(let i=0;i<4;i++){const v=Math.min(1,S.imp[i]*6)*k[i]*(.85+Math.random()*.3);beds[i].g.gain.setTargetAtTime(v,t,.04);}}
  else for(const b of beds)b.g.gain.setTargetAtTime(0,t,.05);
  if(S&&S.state==='play'&&on){birdT-=dt;if(birdT<=0){birdT=5+Math.random()*7;if(dusk<.7)bird();}
    crickT-=dt;if(dusk>.45&&crickT<=0){crickT=.9+Math.random()*1.5;for(let i=0;i<3;i++)tone(4200,'sine',.002,.03,.012*dusk,null,i*.06);}}}
function silence(){if(!ctx)return;const t=ctx.currentTime;hiss.g.gain.setTargetAtTime(0,t,.02);for(const b of beds)b.g.gain.setTargetAtTime(0,t,.02);}
function suspend(){if(ctx&&ctx.state==='running')ctx.suspend();}
function resume(){if(ctx&&ctx.state==='suspended')ctx.resume();}
return {init,play,update,silence,setOn,suspend,resume,get on(){return on;},get ctx(){return ctx;}};
})();
