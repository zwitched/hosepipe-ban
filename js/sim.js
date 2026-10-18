// Hosepipe Ban simulation: the hose, the water droplets, the garden and everything the water can hit.
// World units: the garden is 10 wide, 17 deep. x right, y toward the house (down the screen), z up.
'use strict';
const SIM=(()=>{
const G=30,DT=1/120,NOZ_Z=1.0,EL_MIN=-14,EL_MAX=80,AZ_MAX=1.5,FENCE_H=1.8,GW=10,GH=17;
const MODES={jet:{v:21,rate:120,spread:.005,vs:.01,flow:1,wind:.55,drag:.04},spray:{v:14,rate:230,spread:.13,vs:.1,flow:1,wind:1.3,drag:.55}};
const OVER=1.3;            // fill above this spills over and the plant counts as overwatered
// particle pool, used as a ring in emission order so neighbours can be drawn as one continuous stream
const N=2048,px=new Float32Array(N),py=new Float32Array(N),pz=new Float32Array(N),vx=new Float32Array(N),vy=new Float32Array(N),vz=new Float32Array(N),
 pw=new Float32Array(N),age=new Float32Array(N),alive=new Uint8Array(N),pm=new Uint8Array(N),burst=new Uint32Array(N);
let head=0,live=0,burstId=1;
// splashes
const M=900,sx=new Float32Array(M),sy=new Float32Array(M),sz=new Float32Array(M),svx=new Float32Array(M),svy=new Float32Array(M),svz=new Float32Array(M),sl=new Float32Array(M),sc=new Uint8Array(M);
let shead=0;
// wet marks to paint (renderer drains this)
const WQ=4096,wqx=new Float32Array(WQ),wqy=new Float32Array(WQ),wqa=new Float32Array(WQ),wqs=new Uint8Array(WQ);let wqn=0;
let S=null;const HIT={type:'',ref:null,x:0,y:0,z:0,surf:0};
// ballistic range tables (no wind), so the swing speed can feel the same near and far
const RT={};
function buildTables(){for(const k in MODES){const m=MODES[k],t=[];for(let e=EL_MIN;e<=EL_MAX;e+=.5){const r=flight(e*Math.PI/180,0,m.v,m.drag);t.push(r);}RT[k]=t;}}
function flight(el,az,v,drag){let x=0,y=0,z=NOZ_Z,a=v*Math.cos(el),b=v*Math.sin(el);while(z>0){b-=G*DT;const f=1-drag*DT;a*=f;b*=f;x+=a*DT;z+=b*DT;}return x;}
function range(el,mode){const t=RT[mode];const i=U.clamp((el-EL_MIN)*2,0,t.length-1.001);const i0=i|0;return U.lerp(t[i0],t[i0+1],i-i0);}

function surfAt(x,y){const L=S.lv;
  for(const b of S.beds)if(x>=b.x0&&x<=b.x1&&y>=b.y0&&y<=b.y1)return 2;
  for(const r of L.hard||[])if(x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3])return 1;
  return 0;}
function inRect(x,y,r){return x>=r.x0&&x<=r.x1&&y>=r.y0&&y<=r.y1;}

// One movement step of a droplet from (x0,y0,z0) to (x1,y1,z1). Fills HIT and returns true when it stopped.
function collide(x0,y0,z0,x1,y1,z1){
  HIT.ref=null;HIT.x=x1;HIT.y=y1;HIT.z=z1;
  // fences and the house wall
  if(x1<0||x1>GW||y1<0){HIT.type=z1<FENCE_H?'fence':'over';HIT.x=U.clamp(x1,0,GW);HIT.y=Math.max(y1,0);return true;}
  if(y1>GH+.6){HIT.type='fence';return true;}
  // washing line
  const w=S.wash;if(w){const c=U.segX(x0,y0,x1,y1,w.ax,w.ay,w.bx,w.by);
    if(c){const z=z0+(z1-z0)*c[0];if(z<w.z&&z>w.z-1.05)for(const it of w.items){if(c[1]>=it.u0&&c[1]<=it.u1&&z>w.z-it.drop){HIT.type='wash';HIT.ref=it;HIT.x=x0+(x1-x0)*c[0];HIT.y=y0+(y1-y0)*c[0];HIT.z=z;return true;}}}}
  // greenhouse glass
  const g=S.gh;if(g){const i1=inRect(x1,y1,g);if(i1&&z1<g.h&&!(inRect(x0,y0,g)&&z0<g.h)){
      let pass=false;if(z0<g.h&&y0>g.y1&&y1<=g.y1){const t=(y0-g.y1)/(y0-y1),xc=x0+(x1-x0)*t,zc=z0+(z1-z0)*t;if(xc>g.d0&&xc<g.d1&&zc<g.dh)pass=true;}
      if(!pass){HIT.type='glass';return true;}}}
  for(const t of S.trees){if(z1>t.z0&&z1<t.z1){const dx=x1-t.x,dy=y1-t.y;if(dx*dx+dy*dy<t.r*t.r){HIT.type='tree';HIT.ref=t;return true;}}}
  // plants
  for(const u of S.units){
    if(u.k==='pot'){if(z1<=u.h){const dx=x1-u.x,dy=y1-u.y;if(dx*dx+dy*dy<=u.r*u.r){HIT.type='unit';HIT.ref=u;return true;}}}
    else if(u.k==='basket'){const dx=x1-u.x,dy=y1-u.y;if(dx*dx+dy*dy<=u.r*u.r){
      if(z0>=u.z-.05&&z1<u.z&&z1>u.z-.5){HIT.type='unit';HIT.ref=u;HIT.z=u.z;return true;}
      if(z1<u.z-.05&&z1>u.z-.55){HIT.type='basketbase';HIT.ref=u;return true;}}}
  }
  for(const gn of S.gnomes){const dx=x1-gn.x,dy=y1-gn.y;if(z1<.55&&dx*dx+dy*dy<.06){HIT.type='gnome';HIT.ref=gn;return true;}}
  const c=S.cat;if(c&&c.st!=='away'){const dx=x1-c.x,dy=y1-c.y;if(z1<.5&&dx*dx+dy*dy<.16){HIT.type='cat';return true;}}
  if(z1<=0){const t=z0/(z0-z1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t;HIT.x=x;HIT.y=y;HIT.z=0;
    for(const u of S.units)if(u.k==='seg'&&x>=u.x0&&x<=u.x1&&y>=u.y0&&y<=u.y1){HIT.type='unit';HIT.ref=u;return true;}
    HIT.type='ground';HIT.surf=surfAt(x,y);return true;}
  return false;}

// trace a single ideal droplet (no wind, no spread). Used for the aim marker and by the layout checker.
function trace(az,el,mode,out){const m=MODES[mode];const e=el*Math.PI/180;const v=m.v;
  let x=S.gx+Math.sin(az)*.45,y=S.gy-Math.cos(az)*.45,z=NOZ_Z,a=v*Math.cos(e)*Math.sin(az),b=-v*Math.cos(e)*Math.cos(az),c=v*Math.sin(e);
  for(let i=0;i<600;i++){c-=G*DT;const f=1-m.drag*DT;a*=f;b*=f;c*=f;const nx=x+a*DT,ny=y+b*DT,nz=z+c*DT;
    if(out){out.push(nx,ny,nz);}
    if(collide(x,y,z,nx,ny,nz))return HIT;x=nx;y=ny;z=nz;}
  HIT.type='none';return HIT;}

function newLevel(lv,opts){
  opts=opts||{};
  S={lv,t:0,time:lv.time,cap:lv.water,water:lv.water,par:lv.par,flowing:false,mode:'jet',gx:lv.gx||5,gy:lv.gy||16.2,
    aimAz:lv.az||0,aimEl:lv.el!=null?lv.el:16,naz:lv.az||0,nel:lv.el!=null?lv.el:16,units:[],beds:[],gnomes:[],trees:[],wash:null,gh:null,cat:null,win:null,
    wind:{x:0,y:0},susp:0,state:'play',why:'',endT:0,acc:0,flowT:0,ev:[],sog:0,flat:0,soaked:0,wasted:0,used:0,over:0,hits:0,
    imp:[0,0,0,0],rng:U.rng(lv.seed||1),seqDone:0,lastDone:-9};
  for(const p of lv.pots||[])S.units.push(Object.assign({k:'pot',r:.42,h:.55,cap:1.6,plant:'geranium'},p,{w:p.w0||0}));
  for(const p of lv.baskets||[])S.units.push(Object.assign({k:'basket',r:.5,z:2.3,cap:1.4,plant:'trail'},p,{w:p.w0||0}));
  for(const b of lv.beds||[]){const bed=Object.assign({plant:'beans',fragile:false},b);bed.segs=[];S.beds.push(bed);
    const n=b.n||Math.max(1,Math.round(Math.max(b.x1-b.x0,b.y1-b.y0)/1.4));const hor=(b.x1-b.x0)>=(b.y1-b.y0);
    for(let i=0;i<n;i++){const a=i/n,c=(i+1)/n;const u={k:'seg',bed,cap:b.cap||1.1,plant:bed.plant,fragile:!!bed.fragile,w:0,
      x0:hor?U.lerp(b.x0,b.x1,a):b.x0,x1:hor?U.lerp(b.x0,b.x1,c):b.x1,y0:hor?b.y0:U.lerp(b.y0,b.y1,a),y1:hor?b.y1:U.lerp(b.y0,b.y1,c)};
      u.x=(u.x0+u.x1)/2;u.y=(u.y0+u.y1)/2;S.units.push(u);bed.segs.push(u);}}
  for(const u of S.units){u.done=u.w>=1;u.sog=false;u.dmg=0;u.flat=false;u.perk=u.done?1:0;u.wob=0;u.spill=0;u.id=S.units.indexOf(u);}
  for(const g of lv.gnomes||[])S.gnomes.push({x:g[0],y:g[1],down:false,fall:0,face:g[2]||0});
  for(const t of lv.trees||[])S.trees.push(Object.assign({z0:2.4,z1:7,r:1.6,shake:0},t));
  if(lv.wash){const w=lv.wash;S.wash={ax:w.ax,ay:w.ay,bx:w.bx,by:w.by,z:w.z||1.9,items:w.items.map(i=>({u0:i[0],u1:i[1],drop:i[2]||.8,kind:i[3]||'shirt',col:i[4]||'#e8e2d4',wet:0,soaked:false,sw:0}))};}
  if(lv.gh)S.gh=Object.assign({h:2.1,dh:1.75},lv.gh);
  if(lv.cat)S.cat={st:'away',tm:lv.cat.delay||5,x:-1,y:-1,tx:0,ty:0,u:null,cfg:lv.cat,face:1,anim:0,scared:0};
  if(lv.window)S.win={x:lv.window.x,st:'closed',tm:lv.window.first||6,cfg:lv.window,open:0};
  if(lv.wind)S.windCfg=lv.wind;
  live=0;alive.fill(0);sl.fill(0);wqn=0;
  return S;}

function emit(m,mk){const i=head;head=(head+1)%N;if(alive[i])live--;
  const g1=(S.rng()+S.rng()+S.rng()-1.5)*1.4,g2=(S.rng()+S.rng()+S.rng()-1.5)*1.4,g3=(S.rng()+S.rng()+S.rng()-1.5)*1.4;
  const az=S.naz+g1*m.spread,el=S.nel*Math.PI/180+g2*m.spread*.8,v=m.v*(1+g3*m.vs);
  const ca=Math.cos(el);px[i]=S.gx+Math.sin(S.naz)*.45;py[i]=S.gy-Math.cos(S.naz)*.45;pz[i]=NOZ_Z;
  vx[i]=v*ca*Math.sin(az);vy[i]=-v*ca*Math.cos(az);vz[i]=v*Math.sin(el);pw[i]=m.flow/m.rate;age[i]=0;alive[i]=1;pm[i]=mk;burst[i]=burstId;live++;}

function splash(x,y,z,n,col,spd){for(let k=0;k<n;k++){const i=shead;shead=(shead+1)%M;const a=S.rng()*6.283,s=(.4+S.rng())*spd;
  sx[i]=x;sy[i]=y;sz[i]=z;svx[i]=Math.cos(a)*s;svy[i]=Math.sin(a)*s;svz[i]=(1+S.rng()*2)*spd*1.4;sl[i]=.25+S.rng()*.25;sc[i]=col;}}
function wet(x,y,a,s){if(wqn<WQ){wqx[wqn]=x;wqy[wqn]=y;wqa[wqn]=a;wqs[wqn]=s;wqn++;}}
function ev(type,o){S.ev.push(Object.assign({type,t:S.t},o||{}));}

function absorb(u,water,jet){
  u.wob=1;S.hits++;
  if(u.fragile&&jet&&!u.flat){u.dmg+=water*2.6;if(u.dmg>=1){u.flat=true;S.flat++;ev('flat',{u});}}
  if(u.w>=OVER){S.wasted+=water;u.spill=1;if(!u.sog){u.sog=true;S.sog++;ev('sog',{u});}return;}
  u.w+=water/u.cap;
  if(!u.done&&u.w>=1){u.done=true;S.seqDone++;ev('done',{u,n:S.seqDone});}
  if(u.w>=OVER){u.spill=1;if(!u.sog){u.sog=true;S.sog++;ev('sog',{u});}}
}

function windAt(t){const c=S.windCfg;if(!c)return;const k=.72+.28*Math.sin(t*.5+(c.ph||0))+.5*Math.pow(Math.max(0,Math.sin(t*.21+(c.ph||0)*2)),6);
  S.wind.x=c.x*k;S.wind.y=(c.y||0)*k;}

function stepParticles(dt){const wx=S.wind.x,wy=S.wind.y;
  for(let i=0;i<N;i++){if(!alive[i])continue;const m=pm[i]?MODES.spray:MODES.jet;
    const x0=px[i],y0=py[i],z0=pz[i];vz[i]-=G*dt;vx[i]+=wx*m.wind*dt;vy[i]+=wy*m.wind*dt;
    const f=1-m.drag*dt;vx[i]*=f;vy[i]*=f;vz[i]*=f;
    if(!pm[i]&&age[i]>.45){const k=dt*age[i]*2.2;vx[i]+=(S.rng()-.5)*k;vy[i]+=(S.rng()-.5)*k;}
    px[i]+=vx[i]*dt;py[i]+=vy[i]*dt;pz[i]+=vz[i]*dt;age[i]+=dt;
    if(collide(x0,y0,z0,px[i],py[i],pz[i])||age[i]>4){alive[i]=0;live--;hit(i);}}}

function hit(i){const w=pw[i],jet=!pm[i],H=HIT,ns=jet?(S.rng()<.7?2:1):(S.rng()<.35?1:0);
  switch(H.type){
  case 'unit':{const u=H.ref;absorb(u,w,jet);S.imp[u.k==='seg'?0:3]+=w;
    splash(H.x,H.y,u.k==='pot'?u.h:u.k==='basket'?u.z:0.05,ns,u.sog?0:2,jet?1.3:.6);if(u.k==='seg')wet(H.x,H.y,w,2);break;}
  case 'ground':S.wasted+=w;S.imp[H.surf===1?1:0]+=w;splash(H.x,H.y,0,ns,0,jet?1.4:.6);wet(H.x,H.y,w,H.surf);break;
  case 'fence':S.wasted+=w;S.imp[1]+=w;splash(H.x,H.y,H.z,ns,0,1);wet(H.x,H.y,w*.6,3);break;
  case 'over':S.wasted+=w;S.over+=w;if(S.win&&S.win.st==='watch'&&Math.abs(H.x-S.win.x)<2.5&&H.y<=0){S.susp+=w*2.4;}break;
  case 'wash':{const it=H.ref;S.wasted+=w;S.imp[2]+=w;it.wet+=w*1.6;it.sw=1;if(!it.soaked&&it.wet>=1){it.soaked=true;S.soaked++;ev('soaked',{it});}splash(H.x,H.y,H.z,ns,0,.8);break;}
  case 'glass':S.wasted+=w;S.imp[1]+=w;splash(H.x,H.y,H.z,ns,0,.9);if(S.rng()<.05)ev('tink');break;
  case 'tree':S.wasted+=w;S.imp[2]+=w;H.ref.shake=1;if(S.rng()<.15)splash(H.x,H.y,H.z-.3,1,0,.3);break;
  case 'basketbase':S.wasted+=w;S.imp[3]+=w;splash(H.x,H.y,H.z,ns,0,.7);break;
  case 'gnome':{const g=H.ref;S.wasted+=w;S.imp[3]+=w;if(jet&&!g.down){g.hp=(g.hp||0)+w;if(g.hp>.12){g.down=true;ev('gnome',{g});}}splash(H.x,H.y,.4,ns,0,1);break;}
  case 'cat':S.wasted+=w;if(S.cat.st!=='flee'){scareCat();}splash(H.x,H.y,.3,ns,0,1);break;
  default:S.wasted+=w;}
}

function scareCat(){const c=S.cat;c.st='flee';c.tx=c.x<GW/2?-1:GW+1;c.ty=c.y;c.scared++;ev('cat');}
function stepCat(dt){const c=S.cat;if(!c)return;c.anim+=dt;
  if(c.st==='away'){c.tm-=dt;if(c.tm<=0){const cand=S.units.filter(u=>u.k==='seg');if(!cand.length)return;
      let u=cand[(S.rng()*cand.length)|0];const done=cand.filter(v=>v.done);if(done.length&&S.rng()<.7)u=done[(S.rng()*done.length)|0];
      c.u=u;c.x=S.rng()<.5?.1:GW-.1;c.y=U.clamp(u.y+(S.rng()-.5)*3,1,14);c.st='walk';ev('catIn');}}
  else if(c.st==='walk'||c.st==='flee'){const tx=c.st==='walk'?c.u.x:c.tx,ty=c.st==='walk'?c.u.y:c.ty;const dx=tx-c.x,dy=ty-c.y,d=Math.hypot(dx,dy),sp=c.st==='walk'?1.5:6.5;
    if(Math.abs(dx)>.01)c.face=dx>0?1:-1;
    if(d<sp*dt){c.x=tx;c.y=ty;if(c.st==='walk'){c.st='dig';}else{c.st='away';c.tm=(c.cfg.gap||8)+S.rng()*4;}}else{c.x+=dx/d*sp*dt;c.y+=dy/d*sp*dt;}}
  else if(c.st==='dig'){const u=c.u;const r=c.cfg.dig||.22;u.w=Math.max(0,u.w-r*dt);if(u.done&&u.w<.98){u.done=false;S.seqDone--;ev('undone',{u});}
    if(S.rng()<dt*10)splash(c.x+(S.rng()-.5)*.3,c.y+.1,0,1,1,.6);}
}
function stepWindow(dt){const w=S.win;if(!w)return;w.tm-=dt;const c=w.cfg;
  if(w.st==='closed'){w.open=Math.max(0,w.open-dt*3);if(w.tm<=0){w.st='twitch';w.tm=c.warn||1.2;ev('twitch');}}
  else if(w.st==='twitch'){if(w.tm<=0){w.st='watch';w.tm=(c.watch||3)+S.rng()*1.2;ev('watch');}}
  else if(w.st==='watch'){w.open=Math.min(1,w.open+dt*4);if(S.flowing&&S.water>0)S.susp+=(c.rate||.42)*dt;if(w.tm<=0){w.st='closed';w.tm=(c.quiet||7)+S.rng()*(c.quietVar||4);ev('close');}}
  if(w.st!=='watch')S.susp=Math.max(0,S.susp-.05*dt);}

function step(dt){if(!S)return;
  let n=Math.min(12,Math.round(dt/DT));if(n<1)n=1;
  for(let k=0;k<n;k++)tick(DT);}
function tick(dt){
  const play=S.state==='play';
  if(play)S.t+=dt;windAt(S.t);
  // nozzle follows the aim with a little weight
  const f=1-Math.exp(-dt*30);S.naz+=(S.aimAz-S.naz)*f;S.nel+=(S.aimEl-S.nel)*f;
  const on=play&&S.flowing&&S.water>0;S.flowT=on?Math.min(1,S.flowT+dt*14):Math.max(0,S.flowT-dt*10);
  if(on){const m=MODES[S.mode];S.acc+=m.rate*dt;while(S.acc>=1){S.acc-=1;if(S.water<=0)break;emit(m,S.mode==='spray'?1:0);S.water-=m.flow/m.rate;S.used+=m.flow/m.rate;}if(S.water<=0){S.water=0;ev('empty');}}
  else{S.acc=0;}
  stepParticles(dt);
  for(let i=0;i<M;i++){if(sl[i]<=0)continue;sl[i]-=dt;svz[i]-=G*.5*dt;sx[i]+=svx[i]*dt;sy[i]+=svy[i]*dt;sz[i]+=svz[i]*dt;if(sz[i]<0){sz[i]=0;svz[i]*=-.2;svx[i]*=.5;svy[i]*=.5;}}
  for(const u of S.units){u.wob=Math.max(0,u.wob-dt*3);u.spill=Math.max(0,u.spill-dt*2);const tp=u.done?1:Math.min(.6,u.w*.6);u.perk+=(tp-u.perk)*Math.min(1,dt*9);}
  for(const g of S.gnomes)if(g.down)g.fall=Math.min(1,g.fall+dt*5);
  for(const t of S.trees)t.shake=Math.max(0,t.shake-dt*2);
  if(S.wash)for(const it of S.wash.items){it.sw=Math.max(0,it.sw-dt*2);if(!it.soaked)it.wet=Math.max(0,it.wet-dt*.01);}
  if(play){stepCat(dt);stepWindow(dt);
    if(S.units.every(u=>u.done)){S.state='won';S.endT=S.t;S.flowing=false;ev('win');}
    else if(S.susp>=1){S.susp=1;fail('caught');}
    else if(S.t>=S.time){S.t=S.time;fail('dark');}
    else if(S.water<=0&&live===0)fail('dry');}
  S.imp[0]*=.9;S.imp[1]*=.9;S.imp[2]*=.9;S.imp[3]*=.9;
}
function fail(why){S.state='fail';S.why=why;S.flowing=false;S.endT=S.t;ev('fail',{why});}

function stars(){const won=S.state==='won';const tidy=won&&S.sog===0&&S.flat===0&&S.soaked===0&&!S.gnomes.some(g=>g.down);const par=won&&S.water>=S.par-1e-6;
  return {won,tidy,par,n:won?1+(tidy?1:0)+(par?1:0):0};}

// aiming: relative finger movement in world units
function aimBy(dxw,dyw,sens){if(!S)return;const R=Math.max(2.2,range(S.aimEl,S.mode));
  S.aimAz=U.clamp(S.aimAz+dxw*1.05*sens/R,-AZ_MAX,AZ_MAX);S.aimEl=U.clamp(S.aimEl-dyw*6*sens,EL_MIN,EL_MAX);}
function setMode(m){if(S&&MODES[m]){S.mode=m;burstId++;ev('mode',{m});}}
function setFlow(on){if(!S)return;if(on&&!S.flowing)burstId++;S.flowing=!!on&&S.state==='play';}

buildTables();
return {_hit:()=>({type:HIT.type,ref:HIT.ref,x:HIT.x,y:HIT.y,z:HIT.z}),G,DT,ZK:.55,NOZ_Z,EL_MIN,EL_MAX,GW,GH,FENCE_H,OVER,MODES,newLevel,step,trace,collide,range,aimBy,setMode,setFlow,stars,surfAt,
  get S(){return S;},P:{N,px,py,pz,vx,vy,vz,alive,pm,burst,age,pw},SP:{M,sx,sy,sz,sl,sc},
  WQ:{x:wqx,y:wqy,a:wqa,s:wqs,get n(){return wqn;},clear(){wqn=0;}},get head(){return head;},get live(){return live;}};
})();
