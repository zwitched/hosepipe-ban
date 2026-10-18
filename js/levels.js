// The gardens of Larch Close, plus the generator for Heatwave and the daily garden.
'use strict';
const LEVELS=(()=>{
const PATIO=[0,15,10,17.8];
const L=[
{id:'no1',no:1,name:'No. 1',who:'Yours',line:'Hold anywhere to turn the tap on. Slide to aim.',time:80,parF:1.9,
 pots:[{x:3.1,y:11.2,plant:'geranium'},{x:5,y:8.4,plant:'lavender'},{x:7,y:11.6,plant:'marigold'}],
 hard:[PATIO,[4.4,0,5.6,15]],deco:[{k:'bench',x:8.3,y:4,w:1.8,h:.6},{k:'compost',x:1.3,y:2,w:1.2,h:1.2},{k:'birdbath',x:2.2,y:6}],coach:1},
{id:'no3',no:3,name:'No. 3',who:'The Okafors',line:'Beans at the back. Sweep along the row.',time:75,parF:1.75,
 pots:[{x:1.9,y:12.4,plant:'herbs'},{x:8.1,y:12.4,plant:'herbs'},{x:2.4,y:7.2,plant:'fern'},{x:7.6,y:7,plant:'hosta'}],
 beds:[{x0:1.8,y0:2.3,x1:8.2,y1:3.5,plant:'beans',n:4}],hard:[PATIO],deco:[{k:'shed',x:0.2,y:0.2,w:1.4,h:1.9},{k:'bbq',x:8.7,y:15.6}]},
{id:'no5',no:5,name:'No. 5',who:'The Brennans',line:'Hanging baskets. Point the hose up and let it drop in.',time:75,parF:1.75,
 baskets:[{x:2.6,y:9.2},{x:5,y:9.2},{x:7.4,y:9.2}],pots:[{x:1.2,y:13.2,plant:'geranium'},{x:8.8,y:13.2,plant:'geranium'}],
 hard:[PATIO,[3.8,0,6.2,2.4]],deco:[{k:'pergola',x:1.3,y:9.2,x2:8.7},{k:'chair',x:4.2,y:1.2},{k:'chair',x:5.8,y:1.2},{k:'table',x:5,y:1.4}]},
{id:'no7',no:7,name:'No. 7',who:'Mrs Gill',line:'Her washing is out. Lob the water over it.',time:75,parF:1.7,
 wash:{ax:.4,ay:8.4,bx:9.6,by:7.9,items:[[.04,.14,.85,'shirt','#e9e4d6'],[.17,.25,.7,'towel','#c55a4a'],[.28,.37,.9,'sheet','#dfe6e8'],[.37,.47,.9,'sheet','#dfe6e8'],[.52,.6,.75,'shirt','#7b93b5'],[.63,.72,.8,'towel','#e2b64a'],[.76,.84,.6,'socks','#6a6a6a'],[.86,.95,.85,'shirt','#e9e4d6']]},
 beds:[{x0:.8,y0:2.4,x1:4.2,y1:3.6,plant:'roses',n:2},{x0:5.8,y0:2.4,x1:9.2,y1:3.6,plant:'roses',n:2}],pots:[{x:2.2,y:11.8,plant:'fern'},{x:7.8,y:11.8,plant:'lavender'}],
 gnomes:[[3.1,5.6],[6.6,5.2,1]],hard:[PATIO],deco:[{k:'post',x:.4,y:8.4},{k:'post',x:9.6,y:7.9},{k:'basket',x:8.6,y:15.8}]},
{id:'no9',no:9,name:'No. 9',who:'Dev and Sam',line:'Seedlings. Tap the nozzle to SPRAY or the jet will flatten them.',time:80,parF:1.7,
 beds:[{x0:1.4,y0:12.4,x1:4.2,y1:13.3,plant:'seedlings',fragile:true,n:2,cap:1.1},{x0:5.8,y0:12.4,x1:8.6,y1:13.3,plant:'seedlings',fragile:true,n:2,cap:1.1}],
 pots:[{x:2.5,y:5,plant:'hosta'},{x:5,y:3.4,plant:'marigold'},{x:7.5,y:5,plant:'herbs'}],hard:[PATIO,[0,14,10,15]],deco:[{k:'trampoline',x:7.6,y:8.8,r:1.5},{k:'bike',x:1.3,y:9}],coach:5},
{id:'no11',no:11,name:'No. 11',who:'Mr Adeyemi',line:'Windy. Watch the windsock and aim upwind.',time:75,parF:1.7,wind:{x:2.6,y:0,ph:.6},
 beds:[{x0:.5,y0:3,x1:1.6,y1:12,plant:'lettuce',n:5},{x0:8.4,y0:3,x1:9.5,y1:12,plant:'lettuce',n:5}],pots:[{x:5,y:5.5,plant:'geranium'},{x:5,y:10,plant:'fern'}],
 hard:[PATIO,[4.2,0,5.8,4.5]],deco:[{k:'windsock',x:9.6,y:.4},{k:'bench',x:5,y:1.4,w:1.8,h:.6}]},
{id:'no13',no:13,name:'No. 13',who:'The Kowalskis',line:'Someone behind is watching. Let go when the curtain moves.',time:80,parF:1.65,window:{x:5,first:7,warn:1.4,watch:3,quiet:6,quietVar:4,rate:.4},
 pots:[{x:1.5,y:12,plant:'herbs'},{x:8.5,y:12,plant:'herbs'},{x:3,y:6.5,plant:'geranium'},{x:7,y:6.5,plant:'lavender'}],beds:[{x0:2,y0:1.6,x1:8,y1:2.8,plant:'roses',n:3}],
 hard:[PATIO],deco:[{k:'pond',x:5,y:9.4,r:1.1},{k:'chair',x:8.5,y:15.6}],coach:7},
{id:'no15',no:15,name:'No. 15',who:'The Reeds',line:'Their cat digs up the veg. A quick squirt sends it off.',time:80,parF:1.7,cat:{delay:7,gap:7,dig:.22},
 beds:[{x0:1,y0:3,x1:4,y1:4.2,plant:'lettuce',n:2},{x0:6,y0:3,x1:9,y1:4.2,plant:'lettuce',n:2},{x0:1,y0:7.5,x1:4,y1:8.7,plant:'beans',n:2},{x0:6,y0:7.5,x1:9,y1:8.7,plant:'beans',n:2}],
 hard:[PATIO,[4.4,0,5.6,15]],deco:[{k:'compost',x:9,y:12.6,w:1.2,h:1.2},{k:'shed',x:.2,y:11.4,w:1.6,h:2}]},
{id:'no17',no:17,name:'No. 17',who:'Old Mr Pryce',line:'Tomatoes in the greenhouse. Keep it low and go through the door.',time:80,parF:1.7,
 gh:{x0:1,y0:2.4,x1:5.6,y1:6.5,d0:2.35,d1:4.35},pots:[{x:2.6,y:3.8,plant:'tomato',h:.7,cap:2.2},{x:3.4,y:3.1,plant:'tomato',h:.7,cap:2.2},{x:4.05,y:4.5,plant:'tomato',h:.7,cap:2.2},{x:8,y:11,plant:'geranium'}],
 beds:[{x0:7.4,y0:2.4,x1:9.3,y1:7,plant:'roses',n:3}],hard:[PATIO,[2.4,6.5,4.3,15]],deco:[{k:'butt',x:6,y:2.6}]},
{id:'no19',no:19,name:'No. 19',who:'The Hallorans',line:'The apple tree catches anything you lob. Shoot under it.',time:80,parF:1.7,
 trees:[{x:5,y:6.4,r:2.2,z0:2.75}],beds:[{x0:2.6,y0:5.8,x1:7.4,y1:7,plant:'lettuce',n:3},{x0:1.5,y0:1.6,x1:8.5,y1:2.6,plant:'beans',n:4}],baskets:[{x:1,y:12.5,z:2.2},{x:9,y:12.5,z:2.2}],
 hard:[PATIO],deco:[{k:'swing',x:8.2,y:9.6}]},
{id:'no21',no:21,name:'No. 21',who:'The Fishers',line:'Washing, wind and the window. Good luck.',time:85,parF:1.6,wind:{x:-2.2,y:0,ph:2},window:{x:7,first:9,warn:1.3,watch:3,quiet:6.5,quietVar:4,rate:.42},
 wash:{ax:.4,ay:9.6,bx:9.6,by:9.6,items:[[.05,.15,.8,'shirt','#e9e4d6'],[.2,.3,.8,'towel','#5f8a6a'],[.36,.46,.9,'sheet','#e8e0ef'],[.55,.65,.7,'shirt','#c55a4a'],[.7,.8,.85,'towel','#e2b64a'],[.84,.93,.6,'socks','#3e4a5c']]},
 beds:[{x0:1,y0:2.2,x1:9,y1:3.3,plant:'roses',n:4}],pots:[{x:2,y:6.4,plant:'marigold'},{x:8,y:6.4,plant:'marigold'},{x:5,y:12.6,plant:'fern'}],baskets:[{x:1.2,y:13.4,z:2.2}],
 hard:[PATIO],deco:[{k:'post',x:.4,y:9.6},{k:'post',x:9.6,y:9.6},{k:'windsock',x:.4,y:.4}]},
{id:'no23',no:23,name:'No. 23',who:'Show week',line:'The village show is Saturday. Everything at once.',time:95,parF:1.55,cat:{delay:12,gap:9,dig:.2},window:{x:3,first:10,warn:1.3,watch:3,quiet:7,quietVar:4,rate:.42},
 gh:{x0:5.2,y0:1.6,x1:9.4,y1:5.4,d0:6.4,d1:8.2},pots:[{x:6.6,y:3,plant:'tomato',h:.7,cap:2.2},{x:7.6,y:2.4,plant:'tomato',h:.7,cap:2.2},{x:8.1,y:3.8,plant:'tomato',h:.7,cap:2.2},{x:1.6,y:4.2,plant:'marrow',r:.6,cap:3.6}],
 beds:[{x0:1,y0:8,x1:4,y1:9.2,plant:'lettuce',n:2},{x0:6,y0:8,x1:9,y1:9.2,plant:'beans',n:2},{x0:2.8,y0:12.5,x1:7.2,y1:13.3,plant:'seedlings',fragile:true,n:3,cap:1.1}],baskets:[{x:5,y:10.6,z:2.3}],
 hard:[PATIO],deco:[{k:'pergola',x:3.6,y:10.6,x2:6.4}]},
];
function need(lv){let n=0;for(const p of lv.pots||[])n+=p.cap||2.2;for(const p of lv.baskets||[])n+=p.cap||1.8;
  for(const b of lv.beds||[]){const c=b.n||Math.max(1,Math.round(Math.max(b.x1-b.x0,b.y1-b.y0)/1.4));n+=c*(b.cap||1.5);}return n;}
function finish(lv){const n=need(lv);lv.need=n;if(!lv.water)lv.water=Math.ceil(n*(lv.waterF||2.6));lv.par=Math.max(1,Math.round((lv.water-n*lv.parF)*10)/10);lv.seed=lv.seed||U.hash(lv.id);return lv;}
L.forEach(finish);

// --- reachability check: every plant must be hittable by some clean shot (jet, or spray for seedlings)
function reachable(lv){const S=SIM.newLevel(lv);const ok=new Set();
  for(const mode of ['jet','spray']){for(let az=-1.5;az<=1.5;az+=.02){for(let el=SIM.EL_MIN;el<=SIM.EL_MAX;el+=1.5){const h=SIM.trace(az,el,mode);if(h.type==='unit'){const u=h.ref;if(!u.fragile||mode==='spray')ok.add(u.id);}}}}
  return S.units.filter(u=>!ok.has(u.id)).map(u=>u.id);}

// --- generator for Heatwave and the daily garden
const PLANTS=['geranium','lavender','marigold','herbs','fern','hosta'];
const SURN=['Ashworth','Begum','Carver','Doyle','Ellison','Fenwick','Gorski','Hale','Iqbal','Jarvis','Keane','Lowe','Moss','Nair','Oduya','Pearce','Quinn','Rafferty','Sowerby','Tran','Underwood','Vance','Whitlock','Yates'];
function gen(seed,d){const r=U.rng(seed);const R=(a,b)=>a+r()*(b-a);const pick=a=>a[(r()*a.length)|0];
  for(let tries=0;tries<40;tries++){
  const lv={id:'gen'+seed+'_'+tries,no:0,name:'',who:'The '+pick(SURN)+'s',line:'',time:Math.round(70+d*2),parF:Math.max(1.45,1.8-d*.03),pots:[],beds:[],baskets:[],hard:[PATIO],deco:[],gen:true,seed:seed*31+tries};
  const occ=[[0,14.6,10,17.8]];const free=(x0,y0,x1,y1)=>x0>=.3&&x1<=9.7&&y0>=.6&&!occ.some(o=>x0<o[2]+.3&&x1>o[0]-.3&&y0<o[3]+.3&&y1>o[1]-.3);
  const place=(w,h,y0=.8,y1=14.2)=>{for(let k=0;k<60;k++){const x=R(.4,9.6-w),y=R(y0,y1-h);if(free(x,y,x+w,y+h)){occ.push([x,y,x+w,y+h]);return [x,y];}}return null;};
  // features unlocked by depth, pick a few
  const feats=['baskets','wash','seedlings','wind','window','cat','gh','tree'].slice(0,Math.min(8,1+Math.floor(d/1.5)));
  const k=Math.min(feats.length,d<2?0:d<5?1:d<9?2:3);const use=new Set();while(use.size<k)use.add(pick(feats));
  if(use.has('gh')){const p=place(4.4,4,1,6);if(p){const [x,y]=p;const dc=x+2.2+R(-.6,.6);lv.gh={x0:x,y0:y,x1:x+4.4,y1:y+4,d0:dc-1,d1:dc+1};
     for(let i=0;i<3;i++)lv.pots.push({x:x+1+i*1.2,y:y+1.1+((i%2)?1.2:0),plant:'tomato',h:.7,cap:2.2});}}
  if(use.has('tree')){const p=place(3.4,1.8,4,9);if(p){lv.trees=[{x:p[0]+1.7,y:p[1]+.9,r:2.2}];lv.beds.push({x0:p[0]+.2,y0:p[1]+.3,x1:p[0]+3.2,y1:p[1]+1.4,plant:'lettuce',n:2});}}
  if(use.has('wash')){const y=R(7,10.5),y2=y+R(-.6,.6);const items=[];let u=.04;const cols=['#e9e4d6','#c55a4a','#7b93b5','#e2b64a','#5f8a6a','#dfe6e8'];
     while(u<.9){const w=R(.07,.11);items.push([u,u+w,R(.6,.9),pick(['shirt','towel','sheet','socks']),pick(cols)]);u+=w+R(.02,.08);}
     lv.wash={ax:.4,ay:y,bx:9.6,by:y2,items};lv.deco.push({k:'post',x:.4,y},{k:'post',x:9.6,y:y2});occ.push([0,Math.min(y,y2)-.4,10,Math.max(y,y2)+.4]);}
  if(use.has('seedlings')){const p=place(2.6,.9,11.6,14.2);if(p)lv.beds.push({x0:p[0],y0:p[1],x1:p[0]+2.6,y1:p[1]+.9,plant:'seedlings',fragile:true,n:2,cap:1.1});}
  if(use.has('baskets')){const y=R(8,12.5),n=2+(r()<.4?1:0);const xs=n===2?[2.4,7.6]:[2.2,5,7.8];lv.deco.push({k:'pergola',x:xs[0]-1.1,y,x2:xs[n-1]+1.1});for(const x of xs)lv.baskets.push({x,y,z:2.25});}
  if(use.has('wind')){lv.wind={x:(r()<.5?-1:1)*R(1.6,2.4+d*.06),y:R(-.6,.6),ph:R(0,6)};lv.deco.push({k:'windsock',x:r()<.5?.4:9.6,y:.4});}
  if(use.has('window'))lv.window={x:R(2,8),first:R(6,10),warn:Math.max(.9,1.4-d*.03),watch:3,quiet:Math.max(4.5,7-d*.15),quietVar:4,rate:.42};
  if(use.has('cat'))lv.cat={delay:R(6,12),gap:Math.max(5,9-d*.2),dig:.22};
  const nb=(lv.cat?2:0)+(r()<.6?1:0)+(d>4&&r()<.5?1:0);
  for(let i=0;i<nb;i++){const hor=r()<.65;const w=hor?R(2.4,4):1.1,h=hor?1.1:R(2.6,4.5);const p=place(w,h,.8,12);if(p)lv.beds.push({x0:p[0],y0:p[1],x1:p[0]+w,y1:p[1]+h,plant:pick(['lettuce','beans','roses'])});}
  const np=Math.round(R(2,4)+Math.min(3,d*.25));
  for(let i=0;i<np;i++){const p=place(.9,.9,.8,13.6);if(p)lv.pots.push({x:p[0]+.45,y:p[1]+.45,plant:pick(PLANTS)});}
  if(r()<.5){const p=place(1.4,1.4,.8,13);if(p)lv.deco.push({k:pick(['compost','birdbath','pond','trampoline']),x:p[0]+.7,y:p[1]+.7,w:1.2,h:1.2,r:.9});}
  if(r()<.4&&!use.has('wash')){const p=place(.5,.5,2,12);if(p)lv.gnomes=[[p[0]+.25,p[1]+.25,r()<.5?1:0]];}
  if(!lv.pots.length&&!lv.beds.length&&!lv.baskets.length)continue;
  finish(lv);
  if(reachable(lv).length===0)return lv;}
  return finish(Object.assign({},L[0],{id:'fallback'+seed,gen:true}));}
return {list:L,byId:id=>L.find(l=>l.id===id),gen,reachable,need,finish};
})();
