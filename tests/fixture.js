// Test-only helpers. BOT.* are read-only aim solvers (they never touch game state) used by the touch bot to decide
// where to move its finger. FIX.* set up scenarios and are only used where a test says so.
window.BOT={
  // trace one droplet including the current wind, like the real stream does
  trace(az,el,mode){const S=SIM.S,m=SIM.MODES[mode],G=SIM.G,DT=SIM.DT;const e=el*Math.PI/180;
    let x=S.gx+Math.sin(az)*.45,y=S.gy-Math.cos(az)*.45,z=SIM.NOZ_Z,a=m.v*Math.cos(e)*Math.sin(az),b=-m.v*Math.cos(e)*Math.cos(az),c=m.v*Math.sin(e);
    for(let i=0;i<600;i++){c-=G*DT;a+=S.wind.x*m.wind*DT;b+=S.wind.y*m.wind*DT;const f=1-m.drag*DT;a*=f;b*=f;c*=f;const nx=x+a*DT,ny=y+b*DT,nz=z+c*DT;
      if(SIM.collide(x,y,z,nx,ny,nz)){const H=Object.assign({},SIM_HIT());return H;}x=nx;y=ny;z=nz;}return {type:'none'};},
  // best aim for unit uid: hits it closest to its centre, closest to the current aim
  aim(uid,mode,from){const S=SIM.S,u=S.units[uid];let best=null;const fa=from?from[0]:S.aimAz,fe=from?from[1]:S.aimEl;
    for(let el=SIM.EL_MIN;el<=SIM.EL_MAX;el+=1){for(let az=-1.5;az<=1.5;az+=.012){const h=BOT.trace(az,el,mode);if(h.type!=='unit'||h.ref!==u)continue;
      const cx=u.k==='seg'?(u.x0+u.x1)/2:u.x,cy=u.k==='seg'?(u.y0+u.y1)/2:u.y;const d=Math.hypot(h.x-cx,h.y-cy)*3+Math.abs(az-fa)*1.5+Math.abs(el-fe)*.01+(el>45?.6:0);
      if(!best||d<best[2])best=[az,el,d];}}
    return best;},
  aimPt(x,y,mode){let best=null;for(let el=SIM.EL_MIN;el<=40;el+=1){for(let az=-1.5;az<=1.5;az+=.015){const h=BOT.trace(az,el,mode);if(h.type==='over'||h.type==='none')continue;const d=Math.hypot(h.x-x,h.y-y);if(!best||d<best[2])best=[az,el,d];}}return best;},
  units(){return SIM.S.units.map(u=>({id:u.id,done:u.done,w:u.w,fragile:u.fragile,k:u.k,x:u.x,y:u.y}));},
};
window.SIM_HIT=()=>{const S=SIM.S;return SIM._hit();};
window.FIX={
  stars(o){SV.D.stars=Object.assign(SV.D.stars,o);SV.save();return true;},
  clock(t){SIM.S.t=t;return true;},
};
