// Small shared helpers: seeded random, maths.
'use strict';
const U={
  rng(seed){let a=seed>>>0||1;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};},
  hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;},
  clamp:(v,a,b)=>v<a?a:v>b?b:v,
  lerp:(a,b,t)=>a+(b-a)*t,
  ease:t=>t<0?0:t>1?1:t*t*(3-2*t),
  today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');},
  // segment p0->p1 vs segment a->b in 2D; returns t along p (0..1) and u along ab, or null
  segX(px,py,qx,qy,ax,ay,bx,by){const rx=qx-px,ry=qy-py,sx=bx-ax,sy=by-ay;const d=rx*sy-ry*sx;if(Math.abs(d)<1e-9)return null;
    const t=((ax-px)*sy-(ay-py)*sx)/d,u=((ax-px)*ry-(ay-py)*rx)/d;return(t>=0&&t<=1&&u>=0&&u<=1)?[t,u]:null;}
};
