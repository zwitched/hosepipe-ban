// Drawing: a low sun over a parched back garden, seen from above with a slight tilt so height reads.
'use strict';
const RD=(()=>{
let cv,g,W=0,H=0,dpr=1,s=30,ox=0,oy=0,bg=null,bgKey='',wetC=null,wg=null,WR=22,dryT=0,safeT=0,safeB=0;
const ZK=.55,SHK=.75;
const X=x=>ox+x*s,Y=(y,z)=>oy+(y-(z||0)*ZK)*s;
function init(c){cv=c;g=cv.getContext('2d');resize();}
function resize(){dpr=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px';
  const cs=getComputedStyle(document.documentElement);safeT=parseFloat(cs.getPropertyValue('--sat'))||0;safeB=parseFloat(cs.getPropertyValue('--sab'))||0;
  const avail=H-safeT-safeB;s=Math.min(W/10.4,(avail-58)/20.7);ox=(W-10*s)/2;oy=H-safeB-6-17.5*s;bgKey='';}
function toWorld(px,py){return [(px-ox)/s,(py-oy)/s];}
function toScreen(x,y,z){return [X(x),Y(y,z)];}

// ---------- colour helpers
function mix(a,b,t){const pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16);const r=((pa>>16)&255)*(1-t)+((pb>>16)&255)*t,gg=((pa>>8)&255)*(1-t)+((pb>>8)&255)*t,bb=(pa&255)*(1-t)+(pb&255)*t;return 'rgb('+(r|0)+','+(gg|0)+','+(bb|0)+')';}
function ell(c,x,y,rx,ry,rot){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot||0,0,6.2832);}

// ---------- static background
function buildBg(S){const lv=S.lv;const key=lv.id+'|'+W+'x'+H+'|'+dpr;if(key===bgKey)return;bgKey=key;
  bg=document.createElement('canvas');bg.width=cv.width;bg.height=cv.height;const c=bg.getContext('2d');c.scale(dpr,dpr);const r=U.rng(lv.seed||7);
  // beyond the garden: next-door lawns either side, houses at the back
  c.fillStyle='#8f8a55';c.fillRect(0,0,W,H);
  for(let i=0;i<400;i++){c.fillStyle=r()<.5?'rgba(70,70,30,.12)':'rgba(200,190,120,.1)';c.fillRect(r()*W,r()*H,2+r()*5,1+r()*2);}
  drawHouses(c,S,r);
  // lawn
  c.save();c.beginPath();c.rect(X(0),Y(0),10*s,17.6*s);c.clip();
  c.fillStyle='#c9b768';c.fillRect(X(0),Y(0),10*s,17.6*s);
  for(let i=0;i<10;i++){if(i%2)continue;c.fillStyle='rgba(255,245,200,.07)';c.fillRect(X(i),Y(0),s,17.6*s);}
  for(let i=0;i<55;i++){const x=r()*10,y=r()*15,rr=.4+r()*1.3;const gr=c.createRadialGradient(X(x),Y(y),0,X(x),Y(y),rr*s);gr.addColorStop(0,r()<.6?'rgba(160,120,50,.28)':'rgba(120,140,60,.22)');gr.addColorStop(1,'rgba(160,120,50,0)');c.fillStyle=gr;c.fillRect(X(x-rr),Y(y-rr),rr*2*s,rr*2*s);}
  for(let i=0;i<2600;i++){const x=r()*10,y=r()*15.5;c.strokeStyle=r()<.5?'rgba(120,105,45,.35)':'rgba(235,220,150,.35)';c.lineWidth=1;c.beginPath();c.moveTo(X(x),Y(y));c.lineTo(X(x)+(r()-.5)*3,Y(y)-2-r()*3);c.stroke();}
  // hard surfaces
  for(const h of lv.hard||[]){const patio=h[3]-h[1]>1.5&&h[2]-h[0]>4;drawPaving(c,h,patio,r);}
  // beds
  for(const b of S.beds){c.fillStyle='#6b4a2f';c.fillRect(X(b.x0)-3,Y(b.y0)-3,(b.x1-b.x0)*s+6,(b.y1-b.y0)*s+6);c.fillStyle='#5b3e27';c.fillRect(X(b.x0),Y(b.y0),(b.x1-b.x0)*s,(b.y1-b.y0)*s);
    const n=(b.x1-b.x0)*(b.y1-b.y0)*60;for(let i=0;i<n;i++){c.fillStyle=r()<.5?'rgba(40,25,12,.45)':'rgba(140,105,70,.35)';const x=U.lerp(b.x0,b.x1,r()),y=U.lerp(b.y0,b.y1,r());c.fillRect(X(x),Y(y),1.5+r()*2,1+r()*1.5);}
    c.strokeStyle='#8a7a5a';c.lineWidth=Math.max(2,s*.08);c.strokeRect(X(b.x0)-2,Y(b.y0)-2,(b.x1-b.x0)*s+4,(b.y1-b.y0)*s+4);}
  // greenhouse floor
  if(S.gh){const q=S.gh;c.fillStyle='#a49a86';c.fillRect(X(q.x0),Y(q.y0),(q.x1-q.x0)*s,(q.y1-q.y0)*s);for(let i=0;i<300;i++){c.fillStyle=r()<.5?'rgba(80,70,60,.3)':'rgba(220,210,190,.3)';c.fillRect(X(U.lerp(q.x0,q.x1,r())),Y(U.lerp(q.y0,q.y1,r())),2,2);}}
  for(const d of lv.deco||[])drawDeco(c,d,r,S);
  for(const t of S.trees){c.fillStyle='rgba(30,40,10,.28)';ell(c,X(t.x+(t.z0+1)*SHK),Y(t.y),t.r*s*1.05,t.r*s*.9);c.fill();c.fillStyle='#5b4330';ell(c,X(t.x),Y(t.y),.28*s,.22*s);c.fill();}
  c.restore();
  // fences: back fence with height, side fences as thick top rails
  drawFences(c,r);
  // patio edge at bottom (house wall), the tap
  c.fillStyle='#7a4a38';c.fillRect(0,Y(17.6),W,H-Y(17.6));
  for(let y=Y(17.6);y<H;y+=s*.32){for(let x=((y/(s*.32))|0)%2?0:-s*.4;x<W;x+=s*.8){c.fillStyle=r()<.5?'#86513d':'#6e4232';c.fillRect(x+1,y+1,s*.8-2,s*.32-2);}}
  c.fillStyle='#9aa0a4';c.fillRect(X(.6),Y(17.4)-6,s*.35,10);c.fillStyle='#3d6b3a';ell(c,X(.78),Y(17.4)-2,s*.3,s*.2);c.fill();
  wetC=document.createElement('canvas');wetC.width=Math.round(10*WR);wetC.height=Math.round(17.6*WR);wg=wetC.getContext('2d');}

function drawHouses(c,S,r){const top=Y(0,FENCE_TOP());
  // their gardens beyond the fence
  c.fillStyle='#8c8650';c.fillRect(0,Y(-1),W,Y(0)-Y(-1));
  // house backs: wall from y=-1.8 rising 5 units
  const wy=Y(-1),wt=Y(-1,4.6);c.fillStyle='#9b5d45';c.fillRect(0,wt,W,wy-wt);
  for(let y=wt;y<wy;y+=4){c.fillStyle='rgba(60,25,15,.18)';c.fillRect(0,y,W,1);}
  // party walls between houses
  for(const x of [-2.6,12.6,5]){c.fillStyle='rgba(50,20,10,.35)';c.fillRect(X(x)-2,wt,4,wy-wt);}
  // roof
  c.fillStyle='#4a3b36';c.fillRect(0,0,W,wt);for(let y=wt-6;y>0;y-=7){c.fillStyle='rgba(0,0,0,.18)';c.fillRect(0,y,W,1.5);}
  c.fillStyle='#d8d2c4';c.fillRect(0,wt-3,W,4);
  // windows
  const wins=[1.2,3.4,6.6,8.8,-1,11];for(const wx of wins){if(S.win&&Math.abs(wx-S.win.x)<1.4)continue;drawWindowFrame(c,wx,false);}
  if(S.win)drawWindowFrame(c,S.win.x,true);
  // a drainpipe
  c.fillStyle='#3a3a3a';c.fillRect(X(5)-3,wt,5,wy-wt);}
function FENCE_H(){return 1.8;}function FENCE_TOP(){return 1.8;}
function winRect(wx){const x0=X(wx-.7),x1=X(wx+.7),y0=Y(-1,4),y1=Y(-1,2.25);return [x0,y0,x1,y1];}
function drawWindowFrame(c,wx,big){const [x0,y0,x1,y1]=winRect(wx);c.fillStyle='#e9e4d8';c.fillRect(x0-3,y0-3,x1-x0+6,y1-y0+8);c.fillStyle='#2f3a44';c.fillRect(x0,y0,x1-x0,y1-y0);
  if(!big){c.fillStyle='rgba(180,200,210,.25)';c.fillRect(x0+2,y0+2,(x1-x0)*.4,(y1-y0)*.5);c.fillStyle='#e9e4d8';c.fillRect((x0+x1)/2-1.5,y0,3,y1-y0);}}
function drawFences(c,r){
  const ft=Y(0,1.8),fb=Y(0);c.fillStyle='#7a5a3a';c.fillRect(X(-.3),ft,10.6*s,fb-ft);
  for(let x=-.3;x<10.3;x+=.18){c.fillStyle=r()<.5?'rgba(40,25,10,.25)':'rgba(200,160,110,.12)';c.fillRect(X(x),ft,Math.max(1,s*.15),fb-ft);}
  for(let x=0;x<=10;x+=1.8){c.fillStyle='#5b4029';c.fillRect(X(x)-3,ft-3,6,fb-ft+3);}
  c.fillStyle='#a07c55';c.fillRect(X(-.3),ft-3,10.6*s,4);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(X(0),fb,10*s,s*.25);
  for(const x of [0,10]){const xs=X(x);c.fillStyle='#6b4e33';c.fillRect(xs-(x?0:s*.18),Y(0,1.8),s*.18,Y(17.6)-Y(0,1.8));c.fillStyle='#a07c55';c.fillRect(xs-(x?0:s*.18),Y(0,1.8),s*.18,3);
    c.fillStyle='rgba(0,0,0,.18)';c.fillRect(x?xs-s*.18-s*.2:xs,Y(0),s*.2,Y(17.6)-Y(0));
    for(let y=0;y<17.6;y+=1.8){c.fillStyle='#4f3825';c.fillRect(xs-(x?0:s*.18)-1,Y(y,1.8),s*.18+2,s*.16);}}}
function drawPaving(c,h,patio,r){const [x0,y0,x1,y1]=h;c.fillStyle='#b7ab92';c.fillRect(X(x0),Y(y0),(x1-x0)*s,(y1-y0)*s);
  const sz=patio?.9:.6;for(let y=y0;y<y1;y+=sz){const off=(Math.round((y-y0)/sz)%2)*sz/2;for(let x=x0-off;x<x1;x+=sz){const a=Math.max(x,x0),b=Math.min(x+sz,x1),cc=Math.min(y+sz,y1);if(b<=a)continue;
    const t=r();c.fillStyle=t<.33?'#c5b99f':t<.66?'#b2a68c':'#bdb196';c.fillRect(X(a)+1,Y(y)+1,(b-a)*s-2,(cc-y)*s-2);if(r()<.3){c.fillStyle='rgba(90,80,60,.2)';c.fillRect(X(a+r()*sz*.6)+2,Y(y+r()*sz*.6)+2,3,2);}}}}
function drawDeco(c,d,r,S){const x=X(d.x),y=Y(d.y);c.save();
  switch(d.k){
  case 'bench':{const w=d.w*s,h=d.h*s;c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x-w/2+5,y-h/2+5,w,h);c.fillStyle='#7d5b3c';c.fillRect(x-w/2,y-h/2-s*.25,w,h);for(let i=0;i<4;i++){c.fillStyle=i%2?'#8f6a47':'#76563a';c.fillRect(x-w/2,y-h/2-s*.25+i*h/4,w,h/4-1);}break;}
  case 'compost':{const w=d.w*s;c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x-w/2+5,y-w/2+5,w,w);c.fillStyle='#2f3a2a';c.fillRect(x-w/2,y-w/2-s*.4,w,w);c.fillStyle='#3d4a36';ell(c,x,y-s*.4,w*.42,w*.42);c.fill();c.strokeStyle='#26301f';c.lineWidth=2;ell(c,x,y-s*.4,w*.3,w*.3);c.stroke();break;}
  case 'birdbath':{c.fillStyle='rgba(0,0,0,.25)';ell(c,x+6,y+4,s*.5,s*.35);c.fill();c.fillStyle='#bdb7a8';c.fillRect(x-s*.12,y-s*.6,s*.24,s*.6);ell(c,x,y-s*.65,s*.5,s*.36);c.fill();c.fillStyle='#8f9a96';ell(c,x,y-s*.67,s*.38,s*.25);c.fill();c.fillStyle='rgba(210,190,140,.6)';ell(c,x-s*.05,y-s*.67,s*.22,s*.12);c.fill();break;}
  case 'shed':{const w=d.w*s,h=d.h*s,x0=X(d.x),y0=Y(d.y);c.fillStyle='rgba(0,0,0,.3)';c.fillRect(x0+8,y0+8,w,h);c.fillStyle='#4f5d4a';c.fillRect(x0,y0-s*.7,w,h);for(let i=0;i<w;i+=s*.25){c.fillStyle='rgba(0,0,0,.15)';c.fillRect(x0+i,y0-s*.7,1.5,h);}c.fillStyle='#3a3530';c.fillRect(x0,y0-s*.7,w,h*.12);c.fillStyle='#2e2a26';c.fillRect(x0+w*.48,y0-s*.7,2,h);break;}
  case 'bbq':{c.fillStyle='rgba(0,0,0,.25)';ell(c,x+5,y+4,s*.45,s*.32);c.fill();c.fillStyle='#262626';ell(c,x,y-s*.5,s*.42,s*.36);c.fill();c.strokeStyle='#555';c.lineWidth=1;for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(x+i*s*.1,y-s*.8);c.lineTo(x+i*s*.1,y-s*.2);c.stroke();}break;}
  case 'pergola':{const xa=X(d.x),xb=X(d.x2),yb=Y(d.y,2.6),yg=Y(d.y);c.fillStyle='rgba(0,0,0,.2)';c.fillRect(xa+6,yg-2,xb-xa,s*.18);for(const px of [xa,xb]){c.fillStyle='#6d4f33';c.fillRect(px-3,yb,6,yg-yb);}c.fillStyle='#7d5b3c';c.fillRect(xa-s*.25,yb-s*.1,xb-xa+s*.5,s*.22);c.fillStyle='rgba(255,230,180,.25)';c.fillRect(xa-s*.25,yb-s*.1,xb-xa+s*.5,2);break;}
  case 'chair':{c.fillStyle='rgba(0,0,0,.2)';c.fillRect(x-s*.3+4,y-s*.3+4,s*.6,s*.6);c.fillStyle='#d9d4c6';c.fillRect(x-s*.3,y-s*.55,s*.6,s*.6);c.fillStyle='#c7c1b2';c.fillRect(x-s*.3,y-s*.55,s*.6,s*.15);break;}
  case 'table':{c.fillStyle='rgba(0,0,0,.2)';ell(c,x+6,y+4,s*.6,s*.5);c.fill();c.fillStyle='#ece6d6';ell(c,x,y-s*.45,s*.6,s*.5);c.fill();c.fillStyle='#cfc8b6';ell(c,x,y-s*.45,s*.1,s*.08);c.fill();break;}
  case 'post':{c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x,y-2,s*.5,4);c.fillStyle='#6b6b6b';c.fillRect(x-2.5,Y(d.y,1.95),5,y-Y(d.y,1.95));break;}
  case 'basket':{c.fillStyle='#b99a63';ell(c,x,y-s*.2,s*.45,s*.3);c.fill();c.fillStyle='#e8e2d4';ell(c,x-s*.05,y-s*.3,s*.3,s*.18);c.fill();break;}
  case 'trampoline':{const rr=d.r*s;c.fillStyle='rgba(0,0,0,.2)';ell(c,x+8,y+6,rr,rr*.85);c.fill();c.fillStyle='#2c5a8a';ell(c,x,y-s*.5,rr,rr*.85);c.fill();c.fillStyle='#1f1f22';ell(c,x,y-s*.5,rr*.82,rr*.7);c.fill();break;}
  case 'bike':{c.strokeStyle='#222';c.lineWidth=2;ell(c,x-s*.45,y,s*.3,s*.12);c.stroke();ell(c,x+s*.45,y,s*.3,s*.12);c.stroke();c.strokeStyle='#b8322a';c.lineWidth=3;c.beginPath();c.moveTo(x-s*.45,y-s*.2);c.lineTo(x+s*.45,y-s*.2);c.stroke();break;}
  case 'pond':{const rr=d.r*s;c.fillStyle='#8e8a7a';ell(c,x,y,rr*1.12,rr*.8);c.fill();c.fillStyle='#3e5048';ell(c,x,y,rr,rr*.7);c.fill();c.fillStyle='rgba(200,180,120,.25)';ell(c,x-rr*.3,y-rr*.2,rr*.4,rr*.15);c.fill();c.fillStyle='#5a7a3a';for(let i=0;i<3;i++){ell(c,x+(r()-.5)*rr,y+(r()-.5)*rr*.5,s*.16,s*.12);c.fill();}break;}
  case 'swing':{c.fillStyle='rgba(0,0,0,.2)';c.fillRect(x-s*.9+6,y-2,s*1.8,4);c.fillStyle='#5b6a7a';c.fillRect(x-s*.9,Y(d.y,2),4,y-Y(d.y,2));c.fillRect(x+s*.9-4,Y(d.y,2),4,y-Y(d.y,2));c.fillRect(x-s*.9,Y(d.y,2),s*1.8,4);c.fillStyle='#b8322a';c.fillRect(x-s*.25,Y(d.y,.5),s*.5,s*.12);break;}
  case 'butt':{c.fillStyle='rgba(0,0,0,.25)';ell(c,x+5,y+4,s*.4,s*.3);c.fill();c.fillStyle='#2f4a2a';c.fillRect(x-s*.38,y-s*.75,s*.76,s*.75);ell(c,x,y,s*.38,s*.14);c.fill();c.fillStyle='#3d5f36';ell(c,x,y-s*.75,s*.38,s*.18);c.fill();break;}
  }c.restore();}

// ---------- plants
const PL={geranium:{leaf:'#4f7d3a',dry:'#8a8048',n:7,len:.32,wid:.2,fl:'#d8343a',nf:4,fs:.09},
 lavender:{leaf:'#7d8f6a',dry:'#9a9268',n:12,len:.34,wid:.05,fl:'#8d6bb8',nf:9,fs:.05,spike:1},
 marigold:{leaf:'#3f6a2c',dry:'#857a44',n:9,len:.26,wid:.11,fl:'#f29a1d',nf:4,fs:.1},
 herbs:{leaf:'#7aa64a',dry:'#9a9455',n:14,len:.22,wid:.08,fl:null},
 fern:{leaf:'#4c8a3c',dry:'#8c8448',n:8,len:.44,wid:.1,fl:null,frond:1},
 hosta:{leaf:'#5c8e4a',dry:'#8f8a4c',n:6,len:.38,wid:.24,fl:null,edge:'#c9d9a0'},
 tomato:{leaf:'#4a7a34',dry:'#857a42',n:8,len:.36,wid:.16,fl:'#d63b2a',nf:3,fs:.1,fruit:1},
 trail:{leaf:'#5a8a40',dry:'#8a8248',n:11,len:.42,wid:.12,fl:'#e05a94',nf:7,fs:.08,fl2:'#f3eef0'},
 marrow:{leaf:'#4f8a3a',dry:'#8a8244',n:6,len:.62,wid:.34,fl:'#f0b42a',nf:2,fs:.1,marrow:1},
 roses:{leaf:'#3f6a34',dry:'#7f7442',n:9,len:.3,wid:.14,fl:'#c8364a',nf:5,fs:.1,fl2:'#f0a0b0'},
 lettuce:{leaf:'#8fbf4f',dry:'#a49a58',n:8,len:.2,wid:.15,fl:null},
 beans:{leaf:'#4d8a3a',dry:'#878046',n:7,len:.24,wid:.16,fl:'#d8402a',nf:3,fs:.06,cane:1},
 seedlings:{leaf:'#9ccc5a',dry:'#b4ac6a',n:2,len:.1,wid:.06,fl:null}};
function plant(c,kind,x,y,sc,perk,wob,t,seed,dmg){const p=PL[kind]||PL.geranium;const k=.62+.38*perk;perk=U.clamp(perk,0,1);const col=mix(p.dry,p.leaf,Math.min(1,perk*1.15));
  const sway=Math.sin(t*16+seed)*wob*.25;const R=p.len*sc*k;
  if(p.frond||p.spike){c.lineCap='round';}
  for(let i=0;i<p.n;i++){const a=i/p.n*6.2832+seed+sway;const droop=(1-perk)*.35;const L=R*(.8+((i*37+seed*13)%10)/30);
    const lx=x+Math.cos(a)*L*.55,ly=y+Math.sin(a)*L*.55*.9+droop*L*.6;
    if(p.spike||p.frond){c.strokeStyle=col;c.lineWidth=Math.max(1,p.wid*sc*k*(p.frond?1.4:1));c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a)*L*.5,y+Math.sin(a)*L*.5-droop*L*.2,x+Math.cos(a)*L,y+Math.sin(a)*L*.9+droop*L);c.stroke();
      if(p.frond){c.lineWidth=1;for(let j=1;j<4;j++){const f=j/4;const bx=x+Math.cos(a)*L*f,by=y+Math.sin(a)*L*.9*f+droop*L*f;c.beginPath();c.moveTo(bx,by);c.lineTo(bx+Math.cos(a+1.2)*L*.18,by+Math.sin(a+1.2)*L*.18);c.moveTo(bx,by);c.lineTo(bx+Math.cos(a-1.2)*L*.18,by+Math.sin(a-1.2)*L*.18);c.stroke();}}}
    else{c.fillStyle=col;ell(c,lx,ly,L*.55,p.wid*sc*k,a);c.fill();if(p.edge){c.strokeStyle=p.edge;c.lineWidth=1;c.stroke();}
      c.fillStyle='rgba(255,255,220,.12)';ell(c,lx-1,ly-1,L*.3,p.wid*sc*k*.4,a);c.fill();}}
  if(p.marrow){c.fillStyle=perk>.5?'#3f6d2a':'#7c7a3c';ell(c,x+R*.4,y+R*.3,R*.55,R*.22,.5);c.fill();c.strokeStyle='rgba(220,230,160,.5)';c.lineWidth=1.5;ell(c,x+R*.4,y+R*.3,R*.4,R*.08,.5);c.stroke();}
  if(p.fl){const nf=Math.round(p.nf*(.3+perk*.7));for(let i=0;i<nf;i++){const a=i/p.nf*6.2832+seed*2;const d=R*(p.spike?.95:.35+((i*7)%3)*.12);
      const fx=x+Math.cos(a)*d,fy=y+Math.sin(a)*d*.9+(1-perk)*R*.3;c.fillStyle=perk<.4?'#8a5a3a':(p.fl2&&i%2?p.fl2:p.fl);
      if(p.spike){c.fillRect(fx-1.5,fy-1.5,3,3);}else{ell(c,fx,fy,p.fs*sc*(.6+perk*.4),p.fs*sc*(.6+perk*.4));c.fill();if(!p.fruit){c.fillStyle='rgba(255,240,200,.5)';ell(c,fx-1,fy-1,p.fs*sc*.3,p.fs*sc*.3);c.fill();}}}}}

// ---------- dynamic frame
let lastT=0;
function frame(S,t,opt){if(!S)return;buildBg(S);g.setTransform(dpr,0,0,dpr,0,0);g.drawImage(bg,0,0,W,H);
  drainWet(S);
  g.save();g.beginPath();g.rect(X(0),Y(0),10*s,17.6*s);g.clip();g.globalAlpha=.62;g.drawImage(wetC,X(0),Y(0),10*s,17.6*s);g.globalAlpha=1;g.restore();
  drawWindow(S,t);
  // bed plants (low, drawn first)
  for(const u of S.units)if(u.k==='seg')drawSeg(u,t);
  // shadows of baskets and things in the air
  for(const u of S.units)if(u.k==='basket'){g.fillStyle='rgba(30,30,10,.22)';ell(g,X(u.x+u.z*SHK),Y(u.y),u.r*s,u.r*s*.6);g.fill();}
  // reticle
  if(opt.reticle)drawReticle(S,opt.reticle,t);
  // things standing on the ground, back to front
  const items=[];for(const u of S.units)if(u.k==='pot')items.push(u);for(const gn of S.gnomes)items.push(gn);if(S.cat&&S.cat.st!=='away')items.push(S.cat);
  items.sort((a,b)=>a.y-b.y);
  for(const it of items){if(it.k==='pot')drawPot(it,t);else if(it===S.cat)drawCat(S.cat,t);else drawGnome(it);}
  // stream shadow
  drawStream(S,true);
  if(S.wash)drawWash(S,t);
  if(S.gh)drawGlass(S);
  drawGardener(S,t);
  for(const u of S.units)if(u.k==='basket')drawBasket(u,t);
  drawStream(S,false);drawSplash();
  for(const tr of S.trees)drawCanopy(tr,t);
  for(const d of S.lv.deco||[])if(d.k==='windsock')drawSock(d,S,t);
  for(const u of S.units)drawGauge(u,S,t);
  drawDial(S);
  // dusk
  const dk=S.t/S.time;const warm=Math.max(0,1-dk*1.6),blue=U.ease((dk-.35)/.65);
  if(warm>0){g.fillStyle='rgba(255,150,60,'+(.1*warm)+')';g.fillRect(0,0,W,H);}
  if(blue>0){g.fillStyle='rgba(22,30,72,'+(.5*blue)+')';g.fillRect(0,0,W,H);
    // lit windows next door
    g.globalAlpha=blue*.85;for(const wx of [1.2,3.4,8.8,11]){if(S.win&&Math.abs(wx-S.win.x)<1.4)continue;if(((wx*7)|0)%3===0)continue;const [x0,y0,x1,y1]=winRect(wx);g.fillStyle='#f2c46a';g.fillRect(x0,y0,x1-x0,y1-y0);}g.globalAlpha=1;}
  if(opt.flash>0){g.fillStyle='rgba(255,255,255,'+opt.flash*.25+')';g.fillRect(0,0,W,H);}
}
function drainWet(S){const q=SIM.WQ,n=q.n;if(!wg)return;
  for(let i=0;i<n;i++){const sf=q.s[i];if(sf===3)continue;const a=Math.min(.5,q.a[i]*60);wg.fillStyle=sf===0?'rgba(48,72,18,'+a+')':sf===1?'rgba(40,38,46,'+a+')':'rgba(25,12,4,'+a+')';
    const r=(sf===2?.16:.2)*WR*(.7+Math.random()*.6);wg.beginPath();wg.arc(q.x[i]*WR+(Math.random()-.5)*4,q.y[i]*WR+(Math.random()-.5)*4,r,0,6.283);wg.fill();}
  q.clear();dryT+=1/60;if(dryT>.5){dryT=0;wg.globalCompositeOperation='destination-out';wg.fillStyle='rgba(0,0,0,.012)';wg.fillRect(0,0,wetC.width,wetC.height);wg.globalCompositeOperation='source-over';}}
function drawSeg(u,t){const p=u.plant;const w=(u.x1-u.x0)*s,h=(u.y1-u.y0)*s;
  // soil darkens as it takes water
  g.fillStyle='rgba(25,12,4,'+Math.min(.45,u.w*.35)+')';g.fillRect(X(u.x0),Y(u.y0),w,h);
  const hor=w>=h;const n=p==='seedlings'?Math.max(3,Math.round((hor?w:h)/(s*.32))):Math.max(1,Math.round((hor?w:h)/(s*.7)));
  for(let i=0;i<n;i++){const f=(i+.5)/n;const cx=hor?X(u.x0)+w*f:X(u.x)+0,cy=hor?Y(u.y):Y(u.y0)+h*f;
    if(p==='seedlings'){for(const dy of [-.22,0,.22]){const sx=cx,sy=cy+dy*s;if(u.flat){g.strokeStyle='#8a9a4a';g.lineWidth=1.5;g.beginPath();g.moveTo(sx-4,sy);g.lineTo(sx+4,sy+1);g.stroke();}else plant(g,'seedlings',sx,sy,s*(.8+u.perk*.5),u.perk,u.wob,t,i+dy*9);}}
    else if(p==='beans'){g.strokeStyle='#a8875a';g.lineWidth=2;g.beginPath();g.moveTo(cx-s*.2,cy+s*.15);g.lineTo(cx,Y(u.y,1.6)-(cy-Y(u.y)));g.lineTo(cx+s*.2,cy+s*.15);g.stroke();plant(g,'beans',cx,cy-s*.2,s,u.perk,u.wob,t,i*3.1);plant(g,'beans',cx,cy-s*.55,s*.8,u.perk,u.wob,t,i*1.7);}
    else plant(g,p,cx,cy,s*(p==='lettuce'?1.15:1),u.perk,u.wob,t,i*2.3+u.id);}}
function drawPot(u,t){const x=X(u.x),yb=Y(u.y),yt=Y(u.y,u.h),r=u.r*s;
  g.fillStyle='rgba(30,20,5,.28)';ell(g,x+r*.5,yb+r*.15,r*1.05,r*.55);g.fill();
  const body=u.plant==='tomato'?'#5a5f62':'#b8603a';const rim=u.plant==='tomato'?'#71777a':'#cc7448';
  g.fillStyle=body;g.beginPath();g.moveTo(x-r*.86,yt);g.lineTo(x-r*.7,yb);g.ellipse(x,yb,r*.7,r*.32,0,3.1416,0,true);g.lineTo(x+r*.86,yt);g.closePath();g.fill();
  g.fillStyle='rgba(0,0,0,.15)';g.fillRect(x+r*.3,yt,r*.5,yb-yt);
  g.fillStyle=rim;ell(g,x,yt,r,r*.45);g.fill();g.fillStyle=mix('#7a5236','#3a2412',Math.min(1,u.w));ell(g,x,yt,r*.82,r*.34);g.fill();
  if(u.spill>0){g.fillStyle='rgba(200,225,240,'+u.spill*.7+')';ell(g,x,yt,r*.8,r*.32);g.fill();}
  plant(g,u.plant,x,yt-r*.1,s*1.3*(u.r/.42)*(u.plant==='tomato'?.9:1),u.perk,u.wob,t,u.id*1.7);
  if(u.plant==='tomato'){g.strokeStyle='#a8875a';g.lineWidth=2;g.beginPath();g.moveTo(x,yt);g.lineTo(x,Y(u.y,1.7));g.stroke();plant(g,'tomato',x,Y(u.y,1.4),s*.8,u.perk,u.wob,t,u.id*2.9);}}
function drawBasket(u,t){const x=X(u.x),y=Y(u.y,u.z),r=u.r*s;g.strokeStyle='rgba(60,60,60,.8)';g.lineWidth=1;for(const a of [-.9,0,.9]){g.beginPath();g.moveTo(x+Math.sin(a)*r*.8,y);g.lineTo(x,y-r*1.4);g.stroke();}
  g.fillStyle='#4a3a28';ell(g,x,y+r*.15,r*.85,r*.5);g.fill();g.fillStyle='#6b5a3a';ell(g,x,y,r,r*.5);g.fill();g.fillStyle=mix('#7a5236','#3a2412',Math.min(1,u.w));ell(g,x,y,r*.82,r*.38);g.fill();
  if(u.spill>0){g.fillStyle='rgba(200,225,240,'+u.spill*.7+')';ell(g,x,y,r*.8,r*.35);g.fill();}
  plant(g,'trail',x,y,s*1.05,u.perk,u.wob,t,u.id);}
function drawGnome(gn){const x=X(gn.x),y=Y(gn.y);g.fillStyle='rgba(0,0,0,.25)';ell(g,x+4,y+2,s*.2,s*.12);g.fill();
  if(gn.down){g.save();g.translate(x,y);g.rotate(gn.face?1.4:-1.4);g.translate(0,-s*.25*(1-gn.fall*.4));}else{g.save();g.translate(x,y);}
  g.fillStyle='#3a5a8a';ell(g,0,-s*.12,s*.15,s*.14);g.fill();g.fillStyle='#f0ebe0';ell(g,0,-s*.25,s*.1,s*.09);g.fill();g.fillStyle='#e8c9a8';ell(g,0,-s*.33,s*.08,s*.07);g.fill();
  g.fillStyle='#c8342a';g.beginPath();g.moveTo(-s*.1,-s*.37);g.lineTo(s*.1,-s*.37);g.lineTo(0,-s*.62);g.closePath();g.fill();g.restore();}
function drawCat(c,t){const x=X(c.x),y=Y(c.y);const run=c.st==='flee',dig=c.st==='dig';const f=c.face;g.save();g.translate(x,y);g.scale(f,1);
  g.fillStyle='rgba(0,0,0,.25)';ell(g,3,3,s*.4,s*.16);g.fill();
  const tail=Math.sin(t*(dig?12:5))*.5;g.strokeStyle='#2b2b2b';g.lineWidth=s*.07;g.lineCap='round';g.beginPath();g.moveTo(-s*.3,-s*.12);g.quadraticCurveTo(-s*.55,-s*.1+tail*s*.2,-s*.6,-s*.35+tail*s*.3);g.stroke();
  const stretch=run?1.35:1;g.fillStyle='#2b2b2b';ell(g,0,-s*.14,s*.32*stretch,s*.15);g.fill();
  const hx=s*.33*stretch,hy=-s*.2+(dig?Math.sin(t*20)*s*.03+s*.06:0);ell(g,hx,hy,s*.13,s*.12);g.fill();
  g.beginPath();g.moveTo(hx-s*.1,hy-s*.06);g.lineTo(hx-s*.06,hy-s*.2);g.lineTo(hx,hy-s*.08);g.closePath();g.fill();g.beginPath();g.moveTo(hx+s*.02,hy-s*.08);g.lineTo(hx+s*.1,hy-s*.2);g.lineTo(hx+s*.12,hy-s*.05);g.closePath();g.fill();
  g.fillStyle='#e8f07a';ell(g,hx+s*.06,hy-s*.02,s*.025,s*.02);g.fill();g.fillStyle='#f3efe6';ell(g,s*.08,-s*.06,s*.1,s*.05);g.fill();
  if(run){g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=1.5;for(let i=0;i<3;i++){g.beginPath();g.moveTo(-s*.45,-s*.25+i*s*.08);g.lineTo(-s*.75,-s*.25+i*s*.08);g.stroke();}}
  g.restore();}
function drawWash(S,t){const w=S.wash;const wind=S.wind.x;g.strokeStyle='rgba(240,240,240,.9)';g.lineWidth=1.2;g.beginPath();g.moveTo(X(w.ax),Y(w.ay,w.z));g.lineTo(X(w.bx),Y(w.by,w.z));g.stroke();
  g.strokeStyle='rgba(0,0,0,.18)';g.beginPath();g.moveTo(X(w.ax+.4),Y(w.ay));g.lineTo(X(w.bx+.4),Y(w.by));g.stroke();
  for(const it of w.items){const ax=U.lerp(w.ax,w.bx,it.u0),ay=U.lerp(w.ay,w.by,it.u0),bx=U.lerp(w.ax,w.bx,it.u1),by=U.lerp(w.ay,w.by,it.u1);
    const sway=(Math.sin(t*2+it.u0*20)*.08+wind*.05)*s+it.sw*Math.sin(t*30)*2;const top1=Y(ay,w.z),top2=Y(by,w.z),dh=it.drop*ZK*s;
    g.fillStyle='rgba(30,30,10,.16)';g.fillRect(X(ax)+s*.4,Y(ay)-2,X(bx)-X(ax),s*.2);
    const col=it.soaked?mix(it.col,'#30404a',.45):mix(it.col,'#46525a',Math.min(.35,it.wet*.35));g.fillStyle=col;g.beginPath();g.moveTo(X(ax),top1);g.lineTo(X(bx),top2);
    if(it.kind==='shirt'){const mx=(X(ax)+X(bx))/2;g.lineTo(X(bx)+sway,top2+dh*.35);g.lineTo(X(bx)-(X(bx)-X(ax))*.18+sway,top2+dh*.35);g.lineTo(X(bx)-(X(bx)-X(ax))*.18+sway,top2+dh);g.lineTo(X(ax)+(X(bx)-X(ax))*.18+sway,top1+dh);g.lineTo(X(ax)+(X(bx)-X(ax))*.18+sway,top1+dh*.35);g.lineTo(X(ax)+sway,top1+dh*.35);}
    else if(it.kind==='socks'){const m=(X(ax)+X(bx))/2;g.lineTo(X(bx)+sway,top2+dh);g.lineTo(m+2+sway,top2+dh);g.lineTo(m+2,top2);g.lineTo(m-2,top1);g.lineTo(m-2+sway,top1+dh);g.lineTo(X(ax)+sway,top1+dh);}
    else{g.lineTo(X(bx)+sway,top2+dh);g.lineTo(X(ax)+sway,top1+dh);}
    g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.18)';g.fillRect(X(ax)+2,top1+2,(X(bx)-X(ax))*.25,dh*.6);
    if(it.kind==='towel'){g.fillStyle='rgba(255,255,255,.35)';g.fillRect(X(ax)+sway*.9,top1+dh*.8,X(bx)-X(ax),2);}
    g.fillStyle='#7a5a3a';g.fillRect(X(ax)+2,top1-2,2,5);g.fillRect(X(bx)-4,top2-2,2,5);
    if(it.soaked&&Math.random()<.3)SIMdrip(bx,by,w.z-it.drop);}}
function SIMdrip(){}
function drawGlass(S){const q=S.gh,h=q.h;const x0=X(q.x0),x1=X(q.x1);
  g.fillStyle='rgba(200,225,230,.16)';g.fillRect(x0,Y(q.y0,h),x1-x0,Y(q.y1,h)-Y(q.y0,h));
  // back wall, side walls
  g.fillStyle='rgba(205,228,232,.22)';g.fillRect(x0,Y(q.y0,h),x1-x0,Y(q.y0)-Y(q.y0,h));
  g.strokeStyle='rgba(240,245,240,.85)';g.lineWidth=2;
  g.strokeRect(x0,Y(q.y0,h),x1-x0,Y(q.y1,h)-Y(q.y0,h));
  for(let x=q.x0;x<=q.x1+.01;x+=(q.x1-q.x0)/4){g.beginPath();g.moveTo(X(x),Y(q.y0,h));g.lineTo(X(x),Y(q.y1,h));g.stroke();}
  // front wall with door gap
  g.fillStyle='rgba(205,228,232,.25)';g.fillRect(x0,Y(q.y1,h),X(q.d0)-x0,Y(q.y1)-Y(q.y1,h));g.fillRect(X(q.d1),Y(q.y1,h),x1-X(q.d1),Y(q.y1)-Y(q.y1,h));
  g.fillRect(X(q.d0),Y(q.y1,h),X(q.d1)-X(q.d0),Y(q.y1,q.dh)-Y(q.y1,h));
  g.beginPath();g.moveTo(x0,Y(q.y1));g.lineTo(X(q.d0),Y(q.y1));g.lineTo(X(q.d0),Y(q.y1,q.dh));g.lineTo(X(q.d1),Y(q.y1,q.dh));g.lineTo(X(q.d1),Y(q.y1));g.lineTo(x1,Y(q.y1));g.stroke();
  for(const xx of [q.x0,q.x1])g.beginPath(),g.moveTo(X(xx),Y(q.y1)),g.lineTo(X(xx),Y(q.y1,h)),g.stroke();
  g.beginPath();g.moveTo(x0,Y(q.y1,h));g.lineTo(x1,Y(q.y1,h));g.stroke();
  g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x0+4,Y(q.y1,h)+4,(X(q.d0)-x0)*.3,(Y(q.y1)-Y(q.y1,h))*.5);}
function drawCanopy(tr,t){const x=X(tr.x),y=Y(tr.y,tr.z0+.6),r=tr.r*s;const sh=tr.shake*Math.sin(t*40)*2;g.save();g.globalAlpha=.94;
  g.fillStyle='#3d5f2a';ell(g,x+sh,y,r,r*.92);g.fill();const rr=U.rng(tr.x*100|0);
  for(let i=0;i<46;i++){const a=rr()*6.283,d=Math.sqrt(rr())*r*.88;g.fillStyle=rr()<.5?'#4f7a34':'#355424';ell(g,x+Math.cos(a)*d+sh,y+Math.sin(a)*d*.92,r*.22,r*.18);g.fill();}
  for(let i=0;i<9;i++){const a=rr()*6.283,d=Math.sqrt(rr())*r*.8;g.fillStyle='#b8402a';ell(g,x+Math.cos(a)*d+sh,y+Math.sin(a)*d*.9,s*.08,s*.08);g.fill();}
  g.fillStyle='rgba(255,230,160,.12)';ell(g,x-r*.3,y-r*.3,r*.5,r*.4);g.fill();g.restore();}
function drawSock(d,S,t){const x=X(d.x),yb=Y(d.y),yt=Y(d.y,2.6);g.strokeStyle='#777';g.lineWidth=3;g.beginPath();g.moveTo(x,yb);g.lineTo(x,yt);g.stroke();
  const w=S.wind;const sp=Math.hypot(w.x,w.y);const a=Math.atan2(w.y,w.x);const L=s*(.4+Math.min(1,sp/3)*.7);const fl=Math.sin(t*14)*.08*(.3+sp/3);
  g.save();g.translate(x,yt);g.rotate(sp<.05?1.4:a+fl);for(let i=0;i<4;i++){g.fillStyle=i%2?'#f2efe6':'#d9542f';g.beginPath();const a0=i/4,a1=(i+1)/4,h0=s*.13*(1-a0*.5),h1=s*.13*(1-a1*.5);
    g.moveTo(L*a0,-h0);g.lineTo(L*a1,-h1);g.lineTo(L*a1,h1);g.lineTo(L*a0,h0);g.closePath();g.fill();}g.restore();}
function drawWindow(S,t){const w=S.win;if(!w)return;const [x0,y0,x1,y1]=winRect(w.x);const ww=x1-x0,hh=y1-y0;
  g.fillStyle=w.st==='watch'?'#e9c36a':'#2f3a44';g.fillRect(x0,y0,ww,hh);
  if(w.st==='watch'||w.open>0){const o=w.open;g.fillStyle='#3a2a20';ell(g,x0+ww*.5,y0+hh*.62,ww*.2,hh*.22);g.fill();g.fillStyle='#d9a882';ell(g,x0+ww*.5,y0+hh*.42,ww*.13,hh*.17);g.fill();
    g.fillStyle='#4a3428';g.fillRect(x0+ww*.36,y0+hh*.22,ww*.28,hh*.08);g.fillStyle='#222';g.fillRect(x0+ww*.43,y0+hh*.4,2,2);g.fillRect(x0+ww*.55,y0+hh*.4,2,2);}
  const tw=w.st==='twitch'?Math.abs(Math.sin(t*14))*ww*.08:0;const open=w.st==='watch'?w.open:0;const cw=ww*.5*(1-open*.62);
  g.fillStyle='#b0563e';g.fillRect(x0,y0,cw-tw,hh);g.fillRect(x1-cw,y0,cw,hh);g.fillStyle='rgba(0,0,0,.2)';for(let i=1;i<4;i++){g.fillRect(x0+(cw-tw)*i/4,y0,1,hh);g.fillRect(x1-cw+cw*i/4,y0,1,hh);}
  if(w.st!=='closed'){g.strokeStyle=w.st==='watch'?'#e8452c':'#f2c94c';g.lineWidth=3;g.strokeRect(x0-5,y0-5,ww+10,hh+13);}}
function drawGardener(S,t){const x=X(S.gx),y=Y(S.gy);const a=S.naz;const ca=Math.cos(S.nel*Math.PI/180);
  // hose back to the tap
  const nx=S.gx+Math.sin(a)*.45*ca,ny=S.gy-Math.cos(a)*.45*ca,nz=SIM.NOZ_Z+.45*Math.sin(S.nel*Math.PI/180);
  g.strokeStyle='#2f6b34';g.lineWidth=Math.max(3,s*.1);g.lineCap='round';g.beginPath();g.moveTo(X(.78),Y(17.4));g.bezierCurveTo(X(1.8),Y(17.4),X(S.gx-1.4),Y(S.gy+1.2),X(S.gx-.25),Y(S.gy+.25));g.stroke();
  g.fillStyle='rgba(0,0,0,.25)';ell(g,x+s*.2,y+s*.12,s*.42,s*.28);g.fill();
  g.save();g.translate(x,Y(S.gy,1.2));g.rotate(a);
  // arms to the nozzle
  g.strokeStyle='#d7a780';g.lineWidth=s*.11;g.beginPath();g.moveTo(-s*.25,0);g.lineTo(-s*.06,-s*.32*ca-s*.05);g.moveTo(s*.25,0);g.lineTo(s*.06,-s*.32*ca-s*.05);g.stroke();
  g.fillStyle='#4f7d9a';ell(g,0,0,s*.33,s*.19);g.fill();g.fillStyle='#3e6680';ell(g,0,s*.04,s*.3,s*.12);g.fill();
  g.fillStyle='#5a3a26';ell(g,0,s*.02,s*.15,s*.15);g.fill();g.fillStyle='#6b4a32';ell(g,-s*.03,-.0,s*.1,s*.09);g.fill();
  g.restore();
  // nozzle
  const sx=X(nx),sy=Y(ny,nz);g.strokeStyle='#2f6b34';g.lineWidth=Math.max(3,s*.1);g.beginPath();g.moveTo(X(S.gx-.25),Y(S.gy+.25));g.quadraticCurveTo(x,Y(S.gy,1.1),sx,sy);g.stroke();
  g.fillStyle=S.mode==='spray'?'#e0a03a':'#e9d34a';ell(g,sx,sy,s*.09,s*.09);g.fill();}
function drawReticle(S,r,t){if(!r.ok)return;const x=X(r.x),y=Y(r.y,r.z||0);const pulse=1+Math.sin(t*8)*.06;g.strokeStyle=S.flowing?'rgba(255,255,255,.75)':'rgba(255,255,255,.4)';g.lineWidth=1.5;
  ell(g,x,y,s*.22*pulse,s*.14*pulse);g.stroke();g.beginPath();g.moveTo(x-s*.32,y);g.lineTo(x-s*.12,y);g.moveTo(x+s*.12,y);g.lineTo(x+s*.32,y);g.stroke();}
const SEGC='rgba(225,240,250,.9)';
function drawStream(S,shadow){const P=SIM.P,n=P.N,h=SIM.head;
  g.lineCap='round';g.lineJoin='round';
  // jet: continuous rope through consecutive droplets
  g.beginPath();let px0=0,py0=0,pb=-1,has=false,cnt=0;
  for(let k=0;k<n;k++){const i=(h+k)%n;if(!P.alive[i]||P.pm[i]){pb=-1;continue;}
    const x=shadow?X(P.px[i]+P.pz[i]*SHK):X(P.px[i]),y=shadow?Y(P.py[i]):Y(P.py[i],P.pz[i]);
    if(pb===P.burst[i]&&Math.abs(x-px0)+Math.abs(y-py0)<s*.85){g.lineTo(x,y);cnt++;}else g.moveTo(x,y);
    px0=x;py0=y;pb=P.burst[i];has=true;}
  if(has){if(shadow){g.strokeStyle='rgba(40,35,10,.2)';g.lineWidth=Math.max(2.5,s*.09);g.stroke();}
    else{g.strokeStyle='rgba(120,170,205,.35)';g.lineWidth=Math.max(6,s*.19);g.stroke();g.strokeStyle='rgba(205,230,248,.85)';g.lineWidth=Math.max(3,s*.09);g.stroke();g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=Math.max(1.2,s*.03);g.stroke();}}
  // droplets: jet beads and spray mist
  if(!shadow){g.fillStyle='rgba(235,245,255,.9)';for(let k=0;k<n;k++){const i=(h+k)%n;if(!P.alive[i])continue;if(P.pm[i]){continue;}if(P.age[i]>.3){const x=X(P.px[i]),y=Y(P.py[i],P.pz[i]);g.fillRect(x-1.6,y-1.6,3.2,3.2);}}
    g.strokeStyle='rgba(225,240,250,.6)';g.lineWidth=1.4;g.beginPath();for(let i=0;i<n;i++){if(!P.alive[i]||!P.pm[i])continue;const x=X(P.px[i]),y=Y(P.py[i],P.pz[i]);g.moveTo(x,y);g.lineTo(x-P.vx[i]*s*.012,y-(P.vy[i]-P.vz[i]*ZK)*s*.012);}g.stroke();}
  else{g.fillStyle='rgba(40,35,10,.12)';for(let i=0;i<n;i++){if(!P.alive[i]||!P.pm[i])continue;g.fillRect(X(P.px[i]+P.pz[i]*SHK),Y(P.py[i]),2,2);}}}
function drawSplash(){const P=SIM.SP;for(let i=0;i<P.M;i++){if(P.sl[i]<=0)continue;const a=Math.min(1,P.sl[i]*4);g.fillStyle=P.sc[i]===1?'rgba(70,45,25,'+a+')':'rgba(235,245,255,'+a*.85+')';const x=X(P.sx[i]),y=Y(P.sy[i],P.sz[i]);g.fillRect(x-1,y-1,2,2);}}
function drawGauge(u,S,t){if(u.ring>0){const rr=(1-u.ring);const [cx,cy]=u.k==='pot'?[X(u.x),Y(u.y,u.h)]:u.k==='basket'?[X(u.x),Y(u.y,u.z)]:[X(u.x),Y(u.y)];g.strokeStyle='rgba(190,240,140,'+u.ring*.9+')';g.lineWidth=2+u.ring*3;g.beginPath();g.arc(cx,cy,s*(.4+rr*.9),0,6.283);g.stroke();}
  if(S.state!=='play')return;let x,y,r;if(u.k==='pot'){x=X(u.x);y=Y(u.y,u.h)-u.r*s*.1;r=u.r*s+5;}else if(u.k==='basket'){x=X(u.x);y=Y(u.y,u.z);r=u.r*s+5;}else{x=X(u.x);y=Y(u.y);r=s*.26;}
  const recent=(u.wob>0||!u.done);const f=Math.min(1,u.w/SIM.OVER);const a=u.done&&!u.wob?.35:.95;if(u.k==='seg'&&u.done&&!u.wob&&!u.sog&&!u.flat)return;
  g.globalAlpha=a;g.lineWidth=u.k==='seg'?3:3.5;g.strokeStyle='rgba(20,20,10,.45)';g.beginPath();g.arc(x,y,r,0,6.283);g.stroke();
  if(f>0){g.strokeStyle=u.sog?'#e04a2c':u.done?'#8fe05a':'#7cc4ff';g.beginPath();g.arc(x,y,r,-1.5708,-1.5708+f*6.283);g.stroke();}
  // the "enough" notch
  const na=-1.5708+6.283/SIM.OVER;g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(x+Math.cos(na)*(r-4),y+Math.sin(na)*(r-4));g.lineTo(x+Math.cos(na)*(r+4),y+Math.sin(na)*(r+4));g.stroke();
  if(u.flat){g.fillStyle='#e04a2c';g.font='bold '+Math.round(s*.35)+'px system-ui';g.textAlign='center';g.fillText('!',x,y+s*.12);}
  g.globalAlpha=1;}
function drawDial(S){const cx=X(S.gx)+s*1.25,cy=Y(S.gy+.55),r=s*.62;g.save();g.globalAlpha=.85;g.fillStyle='rgba(30,25,15,.35)';g.beginPath();g.moveTo(cx,cy);g.arc(cx,cy,r,-Math.PI*.5,0);g.closePath();g.fill();
  g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;g.beginPath();const a45=-Math.PI/4;g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a45)*r,cy+Math.sin(a45)*r);g.stroke();
  const a=-S.nel*Math.PI/180;g.strokeStyle='#f3e9c8';g.lineWidth=2.5;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);g.stroke();g.restore();}
return {_plant:plant,init,resize,frame,toWorld,toScreen,get s(){return s;},get W(){return W;},get H(){return H;},get oy(){return oy;},winRect:wx=>winRect(wx),invalidate(){bgKey='';}};
})();
